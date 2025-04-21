import * as mediasoup from "mediasoup";

export class MediasoupService {
  private router: mediasoup.types.Router | null = null;

  async init(): Promise<mediasoup.types.Router> {
    const worker = await mediasoup.createWorker({
      logLevel: "debug",
      rtcMinPort: 10000,
      rtcMaxPort: 10100,
    });

    this.router = await worker.createRouter({
      mediaCodecs: [
        { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
        { kind: "video", mimeType: "video/VP8", clockRate: 90000, parameters: { "x-google-start-bitrate": 1000 } },
      ],
    });

    console.log("Mediasoup router initialized");
    return this.router;
  }

  async close(): Promise<void> {
    console.log("Closing Mediasoup service...");
    if (this.router) {
        console.log(`Closing router ${this.router.id}...`);
        this.router.close();
        console.log(`Router ${this.router.id} closed.`);
        this.router = null;
    }
    console.log("Mediasoup service closed.");
}

  getRouter(): mediasoup.types.Router {
    if (!this.router) throw new Error("Mediasoup router not initialized");
    return this.router;
  }
}