import React, { useCallback } from "react";
import { useWeb3React } from "@web3-react/core";

import { Modal } from "components/common";
import { useAuth } from "hooks";
import { ConnectorNames, connectorsByName, SUPPORTED_WALLETS } from "utils/web3React";
import { WALLET_CONNECTOR_KEY } from "constants/index";
import api from "services/api/api";
import { isTouchDevice } from "utils";
import WalletCard from "./WalletCard";
import "./WalletProviderModal.styles.scss";

interface WalletProviderModalProps {
  onDismiss?: () => void;
}

function WalletProviderModal({ onDismiss }: WalletProviderModalProps) {
  const { account, connector } = useWeb3React();
  const { login } = useAuth();

  const handleConnect = useCallback(
    async (connectorId: ConnectorNames) => {
      onDismiss && onDismiss();
      login(connectorId);
      window.localStorage.setItem(WALLET_CONNECTOR_KEY, connectorId);

      if (account) {
        await api.post("/personal_area/callback/init_address", { address: account });
      }
    },
    [login, onDismiss],
  );

  const renderWallets = () =>
    Object.entries(SUPPORTED_WALLETS).map(([key, value]) => {
      if (isTouchDevice()) {
        if (value.mobile) {
          return (
            <WalletCard
              key={`connect-${key}`}
              icon={value.icon}
              title={value.name}
              onConnect={() => !value.href && handleConnect(value.connectorId as ConnectorNames)}
              link={value.href}
              active={connectorsByName[value.connectorId as ConnectorNames] === connector}
            />
          );
        }

        return null;
      }

      return (
        !isTouchDevice() &&
        !value.mobileOnly && (
          <WalletCard
            key={`connect-${key}`}
            icon={value.icon}
            onConnect={() => !value.href && handleConnect(value.connectorId as ConnectorNames)}
            title={value.name}
            link={value.href}
            active={connectorsByName[value.connectorId as ConnectorNames] === connector}
          />
        )
      );
    });

  return (
    <Modal size="big" onDismiss={onDismiss} title="Select a wallet provider">
      {renderModalContent()}
    </Modal>
  );

  function renderModalContent() {
    return (
      <>
        {renderWallets()}
        <div className="walletProvider__actions">
          <div className="walletProvider__actionsText">
            New to Ethereum?
            <a href="https://ethereum.org/wallets/" target="_blank" rel="noopener noreferrer">
              Learn more about wallets
            </a>
          </div>
        </div>
      </>
    );
  }
}

export default WalletProviderModal;
