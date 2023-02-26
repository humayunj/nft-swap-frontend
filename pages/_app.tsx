import "@/styles/globals.css";
import { ConnectKitButton, ConnectKitProvider } from "connectkit";
import type { AppProps } from "next/app";
import { configureChains, createClient, mainnet, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { getDefaultClient } from "connectkit";
import { optimismGoerli } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
const { chains, provider, webSocketProvider } = configureChains(
  [optimismGoerli],
  [publicProvider()]
);

const client = createClient(
  getDefaultClient({
    chains: [optimismGoerli],
    appName: "Token Swap",
    autoConnect: false,
    provider,
    webSocketProvider,
  })
);

const queryClient = new QueryClient();
export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig client={client}>
        <ConnectKitProvider>
          <Toaster position="bottom-left" />
          <Component {...pageProps} />
        </ConnectKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
