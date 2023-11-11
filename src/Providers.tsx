import { FC } from "react";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider as ReactQueryClientProvider } from "react-query";
import { Web3ReactProvider } from "@web3-react/core";

import { RootStoreProvider } from "context/RootStoreProvider";
import RefreshContextProvider from "context/RefreshContext";
import ModalsProvider from "context/ModalContext/ModalProvider";
import { getLibrary } from "utils/web3React";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const Providers: FC = ({ children }) => (
  <ReactQueryClientProvider client={queryClient}>
    <RootStoreProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <RefreshContextProvider>
          <ModalsProvider>
            <HelmetProvider>{children}</HelmetProvider>
          </ModalsProvider>
        </RefreshContextProvider>
      </Web3ReactProvider>
    </RootStoreProvider>
  </ReactQueryClientProvider>
);

export default Providers;
