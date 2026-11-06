/**
 * mediasoup-client transport for receiving video from the server.
 * Replaces webrtc.js (data channels) with proper RTP media transport.
 *
 * The server sends H.264 video as RTP via a mediasoup Producer.
 * The browser consumes it via a mediasoup Consumer, which provides
 * a standard MediaStreamTrack rendered by a <video> element.
 */

import { Device } from "./mediasoup-client.bundle.js";

export class MediasoupTransport {
  constructor() {
    /** @type {import("mediasoup-client").Device|null} */
    this.device = null;
    /** @type {import("mediasoup-client").types.Transport|null} */
    this.recvTransport = null;
    /** @type {import("mediasoup-client").types.Consumer|null} */
    this.consumer = null;

    // Callbacks
    /** @type {((track: MediaStreamTrack) => void)|null} */
    this.onVideoTrack = null;
    /** @type {(() => void)|null} */
    this.onConnected = null;
    /** @type {(() => void)|null} */
    this.onDisconnected = null;

    // WebSocket send function (set by app)
    /** @type {((msg: object) => void)|null} */
    this.sendWs = null;
  }

  /**
   * Initialize the mediasoup Device with router RTP capabilities.
   * Called when server sends "router-rtp-capabilities".
   * @param {object} routerRtpCapabilities
   */
  async loadDevice(routerRtpCapabilities) {
    this.device = new Device();
    await this.device.load({ routerRtpCapabilities });
    console.log("[Mediasoup] Device loaded, can receive:", this.device.canProduce("video") !== undefined);

    // Request a recv transport from the server
    this.sendWs?.({
      type: "create-recv-transport",
      rtpCapabilities: this.device.rtpCapabilities,
    });
  }

  /**
   * Create the recv transport with server-provided parameters.
   * Called when server sends "recv-transport-created".
   * @param {object} transportOptions - { id, iceParameters, iceCandidates, dtlsParameters }
   */
  async createRecvTransport(transportOptions) {
    if (!this.device) {
      console.error("[Mediasoup] Device not loaded");
      return;
    }

    this.recvTransport = this.device.createRecvTransport({
      id: transportOptions.id,
      iceParameters: transportOptions.iceParameters,
      iceCandidates: transportOptions.iceCandidates,
      dtlsParameters: transportOptions.dtlsParameters,
    });

    this.recvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      console.log("[Mediasoup] Transport connecting (DTLS)...");
      this.sendWs?.({
        type: "connect-recv-transport",
        dtlsParameters,
      });
      // The server will respond — we resolve immediately since mediasoup
      // handles the DTLS handshake internally
      callback();
    });

    this.recvTransport.on("connectionstatechange", (state) => {
      console.log("[Mediasoup] Transport state:", state);
      if (state === "connected") {
        this.onConnected?.();
      } else if (state === "failed" || state === "disconnected" || state === "closed") {
        this.onDisconnected?.();
      }
    });

    console.log("[Mediasoup] RecvTransport created, requesting consume...");

    // Request to consume the video producer
    this.sendWs?.({ type: "consume" });
  }

  /**
   * Consume the video producer.
   * Called when server sends "consume-response".
   * @param {object} params - { consumerId, producerId, kind, rtpParameters }
   */
  async consume(params) {
    if (!this.recvTransport) {
      console.error("[Mediasoup] No recv transport");
      return;
    }

    this.consumer = await this.recvTransport.consume({
      id: params.consumerId,
      producerId: params.producerId,
      kind: params.kind,
      rtpParameters: params.rtpParameters,
    });

    console.log(`[Mediasoup] Consumer created: ${this.consumer.kind} track`);

    // Deliver the video track to the app
    this.onVideoTrack?.(this.consumer.track);

    // Resume the consumer (it starts paused on the server)
    await this.consumer.resume();
    console.log("[Mediasoup] Consumer resumed — video should be playing");
  }

  /**
   * Request a keyframe from the server (used for video recovery).
   */
  requestKeyFrame() {
    // mediasoup consumers can request keyframes via RTCP PLI
    // But we also keep the existing reset-video mechanism
    this.sendWs?.({ type: "input", data: { type: "reset-video" } });
  }

  close() {
    if (this.consumer) {
      try { this.consumer.close(); } catch {}
      this.consumer = null;
    }
    if (this.recvTransport) {
      try { this.recvTransport.close(); } catch {}
      this.recvTransport = null;
    }
    this.device = null;
  }
}
