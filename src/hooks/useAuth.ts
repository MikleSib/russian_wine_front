import { useCallback } from "react";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import {
  WalletConnectConnector,
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
} from "@web3-react/walletconnect-connector";

import { ConnectorNames, connectorsByName } from "utils/web3React";
import { WALLET_CONNECTOR_KEY } from "../constants";

const useAuth = (): { login: (connectorID: ConnectorNames) => void; logout: () => void } => {
  const { activate, deactivate } = useWeb3React();

  const login = useCallback(
    (connectorID: ConnectorNames) => {
      const connector = connectorsByName[connectorID];

      if (connector) {
        activate(connector, async (error: Error) => {
          if (error instanceof UnsupportedChainIdError) {
            activate(connector);
          } else {
            localStorage.removeItem(WALLET_CONNECTOR_KEY);
            if (error instanceof UserRejectedRequestErrorWalletConnect) {
              if (connector instanceof WalletConnectConnector) {
                const walletConnector = connector as WalletConnectConnector;
                walletConnector.walletConnectProvider = null;
              }
              console.error("Please authorize to access your account");
            } else {
              console.error(error.message);
            }
          }
        });
      } else {
        console.error("The connector config is wrong");
      }
    },
    [activate],
  );

  const logout = useCallback(() => {
    deactivate();
    localStorage.removeItem(WALLET_CONNECTOR_KEY);
  }, [deactivate]);

  return { login, logout };
};

export default useAuth;
