import mediasoup from "mediasoup";
import type { DtlsParameters, RtpParameters, RtpCapabilities } from "mediasoup/node/lib/types";
import { TransportDetails, ConsumerDetails } from "../types/chatRoom";


export class SfuService {
  private router: mediasoup.types.Router;
  private transports: Map<string, mediasoup.types.WebRtcTransport> = new Map();
  private producers: Map<string, any> = new Map();
  private consumers: Map<string, any> = new Map();

  constructor(router: mediasoup.types.Router) {
    this.router = router;
  }

  async createTransports(roomId: string, userId: string): Promise<{ sendTransport: TransportDetails; recvTransport: TransportDetails }> {
    const sendTransport = await this.router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: "127.0.0.1" }],
      enableUdp: true,
      enableTcp: true,
    });
    const recvTransport = await this.router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: "127.0.0.1" }],
      enableUdp: true,
      enableTcp: true,
    });
    this.transports.set(`${roomId}:${userId}:send`, sendTransport);
    this.transports.set(`${roomId}:${userId}:recv`, recvTransport);
    return {
      sendTransport: {
        id: sendTransport.id,
        iceParameters: sendTransport.iceParameters,
        iceCandidates: sendTransport.iceCandidates,
        dtlsParameters: sendTransport.dtlsParameters,
        rtpCapabilities: this.router.rtpCapabilities,
      },
      recvTransport: {
        id: recvTransport.id,
        iceParameters: recvTransport.iceParameters,
        iceCandidates: recvTransport.iceCandidates,
        dtlsParameters: recvTransport.dtlsParameters,
        rtpCapabilities: this.router.rtpCapabilities,
      },
    };
  }

  async connectTransport(roomId: string, userId: string, type: 'send' | 'recv', dtlsParameters: DtlsParameters): Promise<void> {
    const transport = this.transports.get(`${roomId}:${userId}:${type}`);
    if (!transport) throw new Error("Transport not found");
    await transport.connect({ dtlsParameters });
  }

  async produce(roomId: string, userId: string, kind: "audio" | "video", rtpParameters: RtpParameters): Promise<string> {
    const transport = this.transports.get(`${roomId}:${userId}:send`);
    if (!transport) throw new Error("Transport not found");
    const producer = await transport.produce({ kind, rtpParameters, appData: { roomId, userId }});
    this.producers.set(producer.id, producer);
    return producer.id;
  }

  async consume(roomId: string, userId: string, producerId: string, rtpCapabilities: RtpCapabilities): Promise<ConsumerDetails> {
    const transport = this.transports.get(`${roomId}:${userId}:recv`);
    if (!transport) throw new Error("Transport not found");
    const consumer = await transport.consume({ producerId, rtpCapabilities, paused: true ,appData: { roomId, userId }});
    this.consumers.set(consumer.id, consumer);
    return {
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    };
  }

  cleanupUser(roomId: string, userId: string): void {
    const sendKey = `${roomId}:${userId}:send`;
    const recvKey = `${roomId}:${userId}:recv`;
  
    [sendKey, recvKey].forEach((key) => {
      const transport = this.transports.get(key);
      if (transport) {
        transport.close();
        this.transports.delete(key);
      }
    });
  
    for (const [producerId, producer] of this.producers) {
      if (producer.appData?.roomId === roomId && producer.appData?.userId === userId) {
        producer.close();
        this.producers.delete(producerId);
      }
    }
  
    for (const [consumerId, consumer] of this.consumers) {
      if (consumer.appData?.roomId === roomId && consumer.appData?.userId === userId) {
        consumer.close();
        this.consumers.delete(consumerId);
      }
    }
  }
  
  cleanupRoom(roomId: string): void {
    for (const [key, transport] of this.transports) {
      if (key.startsWith(`${roomId}:`)) {
        transport.close();
        this.transports.delete(key);
      }
    }
  
    for (const [producerId, producer] of this.producers) {
      if (producer.appData?.roomId === roomId) {
        producer.close();
        this.producers.delete(producerId);
      }
    }
  
    for (const [consumerId, consumer] of this.consumers) {
      if (consumer.appData?.roomId === roomId) {
        consumer.close();
        this.consumers.delete(consumerId);
      }
    }
  }
}