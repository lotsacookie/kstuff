/**
 * H.264 decoder using WebCodecs VideoDecoder.
 * Parses scrcpy v3.x frame format: [8-byte PTS][4-byte size][H.264 Annex B data]
 * Uses Annex B format with config (SPS+PPS) prepended to keyframes.
 *
 * Matches the proven approach from the Electron BYOD app (Project3).
 */

const NAL_TYPE = {
  NON_IDR: 1,
  IDR: 5,
  SEI: 6,
  SPS: 7,
  PPS: 8,
};

// scrcpy packet flags stored in PTS high bits
const PACKET_FLAG_CONFIG = 1n << 63n;
const PACKET_FLAG_KEY_FRAME = 1n << 62n;
const PTS_MASK = (1n << 62n) - 1n; // lower 62 bits = actual PTS

export class H264Decoder {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {() => void} [resetVideoFn] - Called when decoder needs fresh SPS/PPS/IDR
   */
  constructor(canvas, resetVideoFn) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    this._pendingFrame = null; // newest decoded frame, drawn on the next animation frame
    this._raf = 0;
    this._lastPts = -1;
    this.MAX_DECODE_QUEUE = 3;
    this.decoder = null;
    this.buffer = new Uint8Array(0);

    // Config data (SPS+PPS in Annex B format) — stored separately, prepended to keyframes
    this.configData = null;

    // Codec string auto-detected from SPS (e.g. "avc1.64003e")
    this.codec = "avc1.42E01E"; // safe default

    this.timestamp = 0;
    this.configured = false;
    this.videoWidth = 0;
    this.videoHeight = 0;
    this.resetVideoFn = resetVideoFn || null;
    this.lastResetTime = 0;
    this.RESET_COOLDOWN_MS = 2000;
    this._waitingForKeyframe = true; // start true — wait for first keyframe
    this._firstKeyframeReceived = false;
    this._errorCount = 0;
    this._frameCount = 0;
    this._lastFrameTime = 0; // timestamp of last rendered frame (for watchdog)
    /** @type {((width: number, height: number) => void)|null} */
    this.onVideoSizeChange = null;
    /** @type {(() => void)|null} */
    this.onFirstFrame = null;
    this._firstFrameFired = false;
  }

  requestVideoReset() {
    const now = Date.now();
    if (this.resetVideoFn && now - this.lastResetTime >= this.RESET_COOLDOWN_MS) {
      this.lastResetTime = now;
      console.log("[Decoder] Requesting video reset (soft)");
      if (this.decoder) {
        try { this.decoder.close(); } catch {}
        this.decoder = null;
      }
      this.configured = false;
      this.timestamp = 0;
      this._waitingForKeyframe = true;
      this.resetVideoFn();
    }
  }

  /**
   * Drop deltas until the next keyframe and ask the server for one. Unlike requestVideoReset()
   * this keeps the decoder alive, so recovery is quick and the last good picture stays up
   * instead of smearing.
   */
  requestKeyframeOnly(reason) {
    this._waitingForKeyframe = true;
    const now = Date.now();
    if (this.resetVideoFn && now - this.lastResetTime >= this.RESET_COOLDOWN_MS) {
      this.lastResetTime = now;
      console.log(`[Decoder] Keyframe requested (${reason})`);
      this.resetVideoFn();
    }
  }

  /**
   * Append raw scrcpy stream data from WebRTC data channel.
   * Data format: [8-byte PTS][4-byte size][H.264 Annex B data] per frame.
   * @param {ArrayBuffer} data
   */
  appendData(data) {
    const incoming = new Uint8Array(data);
    if (this.buffer.length === 0) {
      this.buffer = incoming;
    } else {
      const newBuffer = new Uint8Array(this.buffer.length + incoming.length);
      newBuffer.set(this.buffer, 0);
      newBuffer.set(incoming, this.buffer.length);
      this.buffer = newBuffer;
    }
    this.processBuffer();
  }

  /**
   * Parse scrcpy frame headers and extract complete H.264 frames.
   * Each frame: [8-byte PTS (BE i64)][4-byte size (BE u32)][H.264 data]
   *
   * PTS flags (high bits):
   *   bit 63 = PACKET_FLAG_CONFIG (SPS/PPS only)
   *   bit 62 = PACKET_FLAG_KEY_FRAME (IDR keyframe)
   */
  processBuffer() {
    let pos = 0;
    let lostSync = false;

    while (pos + 12 <= this.buffer.length) {
      // Read PTS (8 bytes big-endian unsigned 64-bit)
      const view = new DataView(this.buffer.buffer, this.buffer.byteOffset + pos, 12);
      const ptsRaw = view.getBigUint64(0, false);

      // Extract flags from PTS high bits
      const isConfig = (ptsRaw & PACKET_FLAG_CONFIG) !== 0n;
      const isKeyFrame = (ptsRaw & PACKET_FLAG_KEY_FRAME) !== 0n;
      const pts = Number(ptsRaw & PTS_MASK);

      // Read frame size (4 bytes big-endian unsigned 32-bit)
      const frameSize = view.getUint32(8, false);

      // Sanity check: invalid frame size means we're misaligned
      if (frameSize === 0 || frameSize > 10 * 1024 * 1024) {
        // Misaligned: bytes were lost. Resync, but remember that every delta frame
        // decoded from here on is built on missing data (this is the "dragging pixels" look).
        lostSync = true;
        pos += 1;
        continue;
      }

      // Wait for full frame data
      if (pos + 12 + frameSize > this.buffer.length) {
        break; // Need more data — wait for next appendData()
      }

      // Extract the H.264 Annex B data (copy to standalone buffer)
      const h264Data = this.buffer.slice(pos + 12, pos + 12 + frameSize);
      pos += 12 + frameSize;

      // Process the complete frame
      this.processFrame(h264Data, isConfig, isKeyFrame, pts);
    }

    if (lostSync) this.requestKeyframeOnly("stream lost sync");

    // Keep remaining unprocessed data in buffer
    if (pos > 0) {
      this.buffer = this.buffer.slice(pos);
    }

    // Safety: clear buffer if it grows too large without valid frames
    if (this.buffer.length > 2 * 1024 * 1024) {
      console.warn("[Decoder] Buffer overflow (no valid frames), clearing");
      this.buffer = new Uint8Array(0);
    }
  }

  /**
   * Process a complete H.264 frame extracted from the scrcpy stream.
   * @param {Uint8Array} h264Data - H.264 Annex B data
   * @param {boolean} isConfig - true if this is a config packet (SPS+PPS only)
   * @param {boolean} isKeyFrame - true if this contains an IDR keyframe
   * @param {number} pts - presentation timestamp in microseconds
   */
  processFrame(h264Data, isConfig, isKeyFrame, pts) {
    if (isConfig) {
      // Config-only packet: contains SPS+PPS, store for later
      this.configData = new Uint8Array(h264Data);
      console.log("[Decoder] Config packet (SPS+PPS):", h264Data.length, "bytes");

      // Auto-detect codec from SPS
      const spsInfo = this.findSpsAndExtractInfo(h264Data);
      if (spsInfo) {
        if (spsInfo.codec !== this.codec) {
          console.log(`[Decoder] Codec: ${this.codec} -> ${spsInfo.codec}`);
          this.codec = spsInfo.codec;
          // Reconfigure decoder with new codec
          if (this.decoder) {
            try { this.decoder.close(); } catch {}
            this.decoder = null;
          }
          this.configured = false;
          this._waitingForKeyframe = true;
          // Request fresh keyframe from phone so decoder can resume
          if (this.resetVideoFn) {
            this.lastResetTime = Date.now();
            this.resetVideoFn();
          }
        }

        // Parse video dimensions from SPS
        if (spsInfo.spsNal) {
          try {
            const dims = this.parseDimensionsFromSPS(spsInfo.spsNal);
            if (dims.width > 0 && dims.height > 0) {
              const changed = dims.width !== this.videoWidth || dims.height !== this.videoHeight;
              this.videoWidth = dims.width;
              this.videoHeight = dims.height;
              this.canvas.width = this.videoWidth;
              this.canvas.height = this.videoHeight;
              console.log(`[Decoder] SPS: ${dims.width}x${dims.height}`);
              if (changed) {
                this.onVideoSizeChange?.(this.videoWidth, this.videoHeight);
              }
            }
          } catch (e) {
            console.error("[Decoder] Failed to parse SPS dimensions:", e);
          }
        }
      }

      // Ensure decoder is ready for upcoming video frames
      this.initDecoder();
      return; // Config-only packets are not decoded
    }

    // ---- Video frame (keyframe or delta) ----

    // Wait for first keyframe before decoding anything
    if (!this._firstKeyframeReceived) {
      if (!isKeyFrame) {
        return; // Drop delta frames before first keyframe
      }
      console.log("[Decoder] First keyframe received");
      this._firstKeyframeReceived = true;
    }

    // After a reset, drop stale deltas until a fresh keyframe arrives
    if (this._waitingForKeyframe) {
      if (!isKeyFrame) {
        return; // silently drop stale delta
      }
      console.log("[Decoder] Got fresh keyframe after reset, resuming");
      this._waitingForKeyframe = false;
    }

    // Ensure decoder is initialized
    this.initDecoder();

    if (!this.decoder || this.decoder.state !== "configured") {
      this.requestVideoReset();
      return;
    }

    // Backpressure: if the decoder is behind, delta frames would play late and then
    // smear. Drop them and wait for a clean keyframe instead.
    if (!isKeyFrame && this.decoder.decodeQueueSize > this.MAX_DECODE_QUEUE) {
      this.requestKeyframeOnly("decoder backlog");
      return;
    }

    // For keyframes, prepend config data (SPS+PPS) — same as Project3
    let frameData;
    if (isKeyFrame && this.configData) {
      frameData = new Uint8Array(this.configData.length + h264Data.length);
      frameData.set(this.configData, 0);
      frameData.set(h264Data, this.configData.length);
    } else {
      frameData = h264Data;
    }

    try {
      // Use the stream's own PTS (monotonic) rather than assuming a fixed 30fps.
      const ts = pts > this._lastPts ? pts : this._lastPts + 1000;
      this._lastPts = ts;
      const chunk = new EncodedVideoChunk({
        type: isKeyFrame ? "key" : "delta",
        timestamp: ts,
        data: frameData,
      });
      this.decoder.decode(chunk);
    } catch (err) {
      console.warn("[Decoder] Decode error:", err);
      if (this.decoder && this.decoder.state === "closed") {
        this.decoder = null;
        this.configured = false;
        this._firstKeyframeReceived = false;
        this._waitingForKeyframe = true;
        this.initDecoder();
      }
    }
  }

  /**
   * Initialize (or reinitialize) the VideoDecoder with current codec.
   * Uses Annex B format (no AVC description needed).
   */
  initDecoder() {
    if (this.configured && this.decoder) return;

    console.log(`[Decoder] Initializing with codec: ${this.codec} (Annex B)`);

    // Capture reference so error callbacks from OLD decoders don't kill new ones
    const thisDecoder = new VideoDecoder({
      output: (frame) => {
        // Keep only the newest frame; older undrawn frames are discarded so the picture
        // never lags behind or flickers through a backlog.
        if (this._pendingFrame) this._pendingFrame.close();
        this._pendingFrame = frame;
        if (!this._raf) this._raf = requestAnimationFrame(() => this._paint());
      },
      error: (e) => {
        // Ignore errors from old decoder instances
        if (this.decoder !== thisDecoder) return;

        this._errorCount++;
        if (this._errorCount <= 5 || this._errorCount % 100 === 0) {
          console.warn(`[Decoder] Error #${this._errorCount} (after ${this._frameCount} frames):`, e.message);
        }

        try { thisDecoder.close(); } catch {}
        this.decoder = null;
        this.configured = false;
        this._waitingForKeyframe = true;
        this._firstKeyframeReceived = false;
        // Try to reconfigure immediately if we have config data
        this.initDecoder();
      },
    });

    this.decoder = thisDecoder;

    try {
      thisDecoder.configure({
        codec: this.codec,
        optimizeForLatency: true,
        // No `description` — Annex B format (start-code based)
      });
      this.configured = true;
      console.log("[Decoder] Configured successfully (Annex B)");
    } catch (e) {
      console.error("[Decoder] Config failed:", e);
    }
  }

  _paint() {
    this._raf = 0;
    const frame = this._pendingFrame;
    if (!frame) return;
    this._pendingFrame = null;
    if (frame.displayWidth !== this.canvas.width || frame.displayHeight !== this.canvas.height) {
      this.canvas.width = frame.displayWidth;
      this.canvas.height = frame.displayHeight;
    }
    this.ctx.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height);
    frame.close();
    this._frameCount++;
    this._lastFrameTime = Date.now();
    if (!this._firstFrameFired && this.onFirstFrame) {
      this._firstFrameFired = true;
      this.onFirstFrame();
    }
  }

  // ---- NAL scanning helpers (for SPS extraction from config data) ----

  /**
   * Find all NAL units in Annex B data and return their types + positions.
   * @param {Uint8Array} data - H.264 Annex B data
   * @returns {Array<{type: number, offset: number, startCodeLen: number}>}
   */
  findNalUnits(data) {
    const nals = [];
    for (let i = 0; i < data.length - 3; i++) {
      // 4-byte start code: 00 00 00 01
      if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0 && data[i + 3] === 1) {
        if (i + 4 < data.length) {
          const nalType = data[i + 4] & 0x1f;
          nals.push({ type: nalType, offset: i, startCodeLen: 4 });
        }
        i += 3;
      }
      // 3-byte start code: 00 00 01
      else if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 1) {
        if (i + 3 < data.length) {
          const nalType = data[i + 3] & 0x1f;
          nals.push({ type: nalType, offset: i, startCodeLen: 3 });
        }
        i += 2;
      }
    }
    return nals;
  }

  /**
   * Find SPS NAL in config data and extract codec string + raw NAL reference.
   * @param {Uint8Array} data - Config packet (SPS+PPS in Annex B)
   * @returns {{codec: string, spsNal: Uint8Array}|null}
   */
  findSpsAndExtractInfo(data) {
    const nals = this.findNalUnits(data);
    const spsEntry = nals.find(n => n.type === NAL_TYPE.SPS);
    if (!spsEntry) return null;

    const headerPos = spsEntry.offset + spsEntry.startCodeLen;
    if (headerPos + 3 >= data.length) return null;

    // Codec string: avc1.{profile}{constraints}{level} in hex
    const profile = data[headerPos + 1];
    const constraints = data[headerPos + 2];
    const level = data[headerPos + 3];
    const hex = (n) => n.toString(16).padStart(2, "0");
    const codec = `avc1.${hex(profile)}${hex(constraints)}${hex(level)}`;

    // Extract the SPS NAL (from start code to next NAL or end of data)
    const spsIdx = nals.indexOf(spsEntry);
    const nextNal = nals[spsIdx + 1];
    const spsEnd = nextNal ? nextNal.offset : data.length;
    const spsNal = data.slice(spsEntry.offset, spsEnd);

    return { codec, spsNal };
  }

  // ---- SPS dimension parsing ----

  /**
   * Parse video dimensions from an SPS NAL unit (with Annex B start code).
   * @param {Uint8Array} sps - Full SPS NAL including start code prefix
   * @returns {{width: number, height: number}}
   */
  parseDimensionsFromSPS(sps) {
    const startCodeLen = sps[2] === 1 ? 3 : 4;
    const rbsp = this.removeEmulationPrevention(sps.slice(startCodeLen + 1));

    let bitPos = 0;

    const readBits = (n) => {
      let val = 0;
      for (let i = 0; i < n; i++) {
        const byteIdx = Math.floor(bitPos / 8);
        const bitIdx = 7 - (bitPos % 8);
        val = (val << 1) | ((rbsp[byteIdx] >> bitIdx) & 1);
        bitPos++;
      }
      return val;
    };

    const readUE = () => {
      let zeros = 0;
      while (readBits(1) === 0) zeros++;
      if (zeros === 0) return 0;
      return (1 << zeros) - 1 + readBits(zeros);
    };

    const profileIdc = readBits(8);
    readBits(8); // constraints
    readBits(8); // level
    readUE(); // seq_parameter_set_id

    if (
      [100, 110, 122, 244, 44, 83, 86, 118, 128, 138, 139, 134].includes(
        profileIdc,
      )
    ) {
      const chromaFormat = readUE();
      if (chromaFormat === 3) readBits(1);
      readUE();
      readUE();
      readBits(1);
      if (readBits(1)) {
        for (let i = 0; i < (chromaFormat !== 3 ? 8 : 12); i++) {
          if (readBits(1)) {
            const size = i < 6 ? 16 : 64;
            let last = 8,
              next = 8;
            for (let j = 0; j < size; j++) {
              if (next !== 0) next = (last + readUE()) & 255;
              last = next === 0 ? last : next;
            }
          }
        }
      }
    }

    readUE(); // log2_max_frame_num
    const picOrderCntType = readUE();
    if (picOrderCntType === 0) {
      readUE();
    } else if (picOrderCntType === 1) {
      readBits(1);
      readUE();
      readUE();
      const n = readUE();
      for (let i = 0; i < n; i++) readUE();
    }
    readUE(); // max_num_ref_frames
    readBits(1); // gaps_in_frame_num_allowed

    const picWidthInMbs = readUE() + 1;
    const picHeightInMapUnits = readUE() + 1;
    const frameMbsOnly = readBits(1);
    if (!frameMbsOnly) readBits(1);
    readBits(1); // direct_8x8_inference

    let cropLeft = 0,
      cropRight = 0,
      cropTop = 0,
      cropBottom = 0;
    if (readBits(1)) {
      cropLeft = readUE();
      cropRight = readUE();
      cropTop = readUE();
      cropBottom = readUE();
    }

    const width = picWidthInMbs * 16 - (cropLeft + cropRight) * 2;
    const height =
      (2 - frameMbsOnly) * picHeightInMapUnits * 16 -
      (cropTop + cropBottom) * 2;

    return { width, height };
  }

  /**
   * Remove emulation prevention bytes (0x00 0x00 0x03 -> 0x00 0x00).
   * Required for correctly parsing SPS/PPS RBSP data.
   */
  removeEmulationPrevention(data) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (
        i + 2 < data.length &&
        data[i] === 0 &&
        data[i + 1] === 0 &&
        data[i + 2] === 3
      ) {
        result.push(0, 0);
        i += 2;
      } else {
        result.push(data[i]);
      }
    }
    return new Uint8Array(result);
  }

  /**
   * Soft reset — clears decoder state so it re-accepts fresh SPS/PPS + keyframe
   * without destroying the object. Used during unblock/game-restart to recover
   * from stale state that causes black screen.
   */
  softReset() {
    console.log("[Decoder] Soft reset — clearing state for fresh video");
    if (this.decoder) {
      try { this.decoder.close(); } catch {}
      this.decoder = null;
    }
    this.buffer = new Uint8Array(0);
    this.configData = null;
    this.timestamp = 0;
    this._lastPts = -1;
    this.configured = false;
    this._waitingForKeyframe = true;
    this._firstKeyframeReceived = false;
    this._firstFrameFired = false; // allow onFirstFrame to fire again after reset
    // Keep videoWidth/videoHeight and codec — they'll be updated if SPS changes
  }

  /** @returns {number} timestamp (ms) of last rendered frame, 0 if none */
  get lastFrameTime() {
    return this._lastFrameTime;
  }

  reset() {
    if (this._pendingFrame) { this._pendingFrame.close(); this._pendingFrame = null; }
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
    this._lastPts = -1;
    if (this.decoder) {
      try {
        this.decoder.close();
      } catch {}
      this.decoder = null;
    }
    this.buffer = new Uint8Array(0);
    this.configData = null;
    this.timestamp = 0;
    this.configured = false;
    this.videoWidth = 0;
    this.videoHeight = 0;
    this._waitingForKeyframe = true;
    this._firstKeyframeReceived = false;
    this._lastFrameTime = 0;
  }
}
