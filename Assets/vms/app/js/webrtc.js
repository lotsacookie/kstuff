/**
 * WebRTC peer connection manager.
 * Handles offer/answer, ICE candidates, and data channels.
 */

const STUN_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
];

export class WebRTCClient {
  constructor() {
    /** @type {RTCPeerConnection|null} */
    this.pc = null;
    /** @type {RTCDataChannel|null} */
    this.videoChannel = null;
    /** @type {RTCDataChannel|null} */
    this.inputChannel = null;

    // Callbacks
    /** @type {((data: ArrayBuffer) => void)|null} */
    this.onVideoData = null;
    /** @type {((candidate: RTCIceCandidateInit) => void)|null} */
    this.onIceCandidate = null;
    /** @type {(() => void)|null} */
    this.onConnected = null;
    /** @type {(() => void)|null} */
    this.onDisconnected = null;
  }

  /**
   * Initialize the peer connection.
   * Must be called before handleOffer.
   */
  init() {
    this.pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });

    // Send our ICE candidates to the server
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidate?.(event.candidate.toJSON());
      }
    };

    // Handle data channels created by the server
    this.pc.ondatachannel = (event) => {
      const channel = event.channel;
      console.log(`[WebRTC] Data channel: "${channel.label}" readyState=${channel.readyState}`);

      if (channel.label === "video") {
        this.videoChannel = channel;
        channel.binaryType = "arraybuffer";

        channel.onopen = () => {
          console.log("[WebRTC] Video channel open");
          this.onConnected?.();
        };

        channel.onmessage = (e) => {
          this.onVideoData?.(e.data);
        };
      } else if (channel.label === "input") {
        this.inputChannel = channel;

        channel.onopen = () => {
          console.log("[WebRTC] Input channel OPEN — ready for touch/keyboard input");
          // Immediately request a fresh keyframe so video renders without delay
          this.resetVideo();
        };

        channel.onmessage = (e) => {
          // Server sends input-ack to confirm the input pipeline is alive
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === "input-ack") {
              console.log(`[WebRTC] ✓ Input ACK from server: vid=${msg.vid}, writer=${msg.writer}`);
              if (msg.writer !== "ok") {
                console.warn("[WebRTC] ⚠ Server input writer is disconnected — touches may not reach the phone!");
              }
              if (msg.vid === "0x0") {
                console.warn("[WebRTC] ⚠ Server video dimensions are 0x0 — touches will be rejected!");
              }
            }
          } catch {}
        };

        channel.onerror = (err) => {
          console.error("[WebRTC] Input channel error:", err);
        };

        channel.onclose = () => {
          console.warn("[WebRTC] Input channel closed");
        };

        // If channel is already open when we receive it, log it
        if (channel.readyState === "open") {
          console.log("[WebRTC] Input channel already open on receive");
        }
      }
    };

    // Monitor connection state
    this.pc.onconnectionstatechange = () => {
      console.log("[WebRTC] State:", this.pc?.connectionState);
      if (
        this.pc?.connectionState === "failed" ||
        this.pc?.connectionState === "disconnected"
      ) {
        this.onDisconnected?.();
      }
    };
  }

  /**
   * Handle SDP offer from server, return SDP answer.
   * @param {string} sdp - The SDP offer string
   * @returns {Promise<string>} The SDP answer string
   */
  async handleOffer(sdp) {
    if (!this.pc) {
      throw new Error("PeerConnection not initialized");
    }

    await this.pc.setRemoteDescription({ type: "offer", sdp });
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer.sdp;
  }

  /**
   * Add a remote ICE candidate.
   * @param {RTCIceCandidateInit} candidate
   */
  async addIceCandidate(candidate) {
    if (this.pc && candidate) {
      try {
        await this.pc.addIceCandidate(candidate);
      } catch (err) {
        console.error("[WebRTC] Failed to add ICE candidate:", err);
      }
    }
  }

  /**
   * Send input message over the input data channel.
   * @param {object} msg - Input message (click, drag, reset-video)
   */
  _inputDropCount = 0;

  sendInput(msg) {
    if (this.inputChannel && this.inputChannel.readyState === "open") {
      this.inputChannel.send(JSON.stringify(msg));
    } else {
      this._inputDropCount++;
      if (this._inputDropCount <= 5 || this._inputDropCount % 50 === 0) {
        console.warn(`[WebRTC] Input DROPPED (${this._inputDropCount}x) — channel: ${
          this.inputChannel ? this.inputChannel.readyState : "null"
        }, msg: ${msg.type}`);
      }
    }
  }

  /**
   * Send reset video request.
   */
  resetVideo() {
    this.sendInput({ type: "reset-video" });
  }

  close() {
    if (this.videoChannel) {
      try { this.videoChannel.close(); } catch {}
      this.videoChannel = null;
    }
    if (this.inputChannel) {
      try { this.inputChannel.close(); } catch {}
      this.inputChannel = null;
    }
    if (this.pc) {
      try { this.pc.close(); } catch {}
      this.pc = null;
    }
  }
}
