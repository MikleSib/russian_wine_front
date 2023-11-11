import { useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

import { ConnectorNames } from "utils/web3React";
import { WALLET_CONNECTOR_KEY } from "../constants";
import { useAuth } from "./index";

export default function useEagerConnect(): void {
  const { active, error } = useWeb3React();
  const { login } = useAuth();

  const connectorId = localStorage.getItem(WALLET_CONNECTOR_KEY) as ConnectorNames;

  useEffect(() => {
    if (connectorId) {
      login(connectorId);
    }
  }, [login]);

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum?.on && !active && !error) {
      const handleChainChanged = (_chainId?: string): void => {
        if (!active && connectorId) {
          login(connectorId);
        }
      };

      ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }

    return undefined;
  }, [login]);
}
