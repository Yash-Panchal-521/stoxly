import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { firebaseAuth } from "@/lib/firebase";
import { getApiOrigin } from "@/services/apiClient";
import type {
  PortfolioUpdatedEvent,
  PriceUpdate,
  WatchlistStock,
} from "@/types/stock";

type RealtimeEvents = {
  portfolioUpdated: [PortfolioUpdatedEvent];
  priceUpdated: [PriceUpdate];
  watchlistUpdated: [WatchlistStock[]];
};

class RealtimeService {
  private connection?: HubConnection;

  private connectionPromise?: Promise<HubConnection>;

  private buildConnection() {
    return new HubConnectionBuilder()
      .withUrl(`${getApiOrigin()}/hubs/market`, {
        accessTokenFactory: async () => {
          const token = await firebaseAuth?.currentUser?.getIdToken();

          return token ?? "";
        },
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();
  }

  async connect() {
    if (this.connection?.state === HubConnectionState.Connected) {
      return this.connection;
    }

    if (this.connectionPromise !== undefined) {
      return this.connectionPromise;
    }

    const connection = this.connection ?? this.buildConnection();
    this.connection = connection;

    this.connectionPromise = connection.start().then(() => connection);

    try {
      return await this.connectionPromise;
    } finally {
      this.connectionPromise = undefined;
    }
  }

  async disconnect() {
    if (!this.connection) {
      return;
    }

    if (this.connection.state !== HubConnectionState.Disconnected) {
      await this.connection.stop();
    }
  }

  async on<EventName extends keyof RealtimeEvents>(
    eventName: EventName,
    handler: (...payload: RealtimeEvents[EventName]) => void,
  ) {
    const connection = await this.connect();
    connection.on(eventName, handler as (...args: unknown[]) => void);
  }

  off<EventName extends keyof RealtimeEvents>(
    eventName: EventName,
    handler: (...payload: RealtimeEvents[EventName]) => void,
  ) {
    this.connection?.off(eventName, handler as (...args: unknown[]) => void);
  }
}

export const realtimeService = new RealtimeService();
