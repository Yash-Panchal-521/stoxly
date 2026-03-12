import {
  HubConnectionBuilder,
  type HubConnection,
  LogLevel,
} from "@microsoft/signalr";
import { auth } from "@/lib/firebase";

export function createPriceHubConnection(): HubConnection {
  const baseUrl =
    process.env.NEXT_PUBLIC_SIGNALR_URL ?? "http://localhost:5000/hubs";

  return new HubConnectionBuilder()
    .withUrl(`${baseUrl}/prices`, {
      accessTokenFactory: async () => {
        const token = await auth.currentUser?.getIdToken();
        return token ?? "";
      },
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();
}
