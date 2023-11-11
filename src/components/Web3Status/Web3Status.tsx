import React, { useCallback, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

import { ReactComponent as Activity } from "assets/icons/activity.svg";
import { ReactComponent as Wallet } from "assets/icons/wallet.svg";
import { WalletProviderModal } from "components";
import { BaseButton } from "components/common";
import { tokens } from "constants/index";
import { useModal, useTokenBalance } from "hooks";
import { getFullDisplayBalance } from "utils";
import { CHAIN_ID } from "utils/web3React";
import "./Web3Status.styles.scss";
import { ethers } from "ethers";

interface Web3StatusProps {
  onCloseMenu?: () => void;
}

function Web3Status({ onCloseMenu }: Web3StatusProps) {
  const { account, error, chainId } = useWeb3React();
  // const balance = useGetBalance();
  const USDT = tokens.usdt.address[chainId ?? CHAIN_ID];
  const balance = useTokenBalance(USDT);
  const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />);

  const handleClickConnectButton = useCallback(() => {
    if (onCloseMenu) {
      onCloseMenu();
    }

    onPresentWalletProviderModal();
  }, [onCloseMenu, onPresentWalletProviderModal]);

  const switchToBinanceSmartChain = useCallback(() => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      (window as any).ethereum
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ethers.utils.hexValue(CHAIN_ID) }],
        })
        .catch((error: any) => {
          console.error(error);
        });
    } else {
      console.error("MetaMask is not installed");
    }
  }, []);

  useEffect(() => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      if (chainId ?? "" !== ethers.utils.hexValue(CHAIN_ID)) {
        switchToBinanceSmartChain();
      }

      window.ethereum.on("chainChanged", (chainId: string) => {
        if (chainId !== ethers.utils.hexValue(CHAIN_ID)) {
          switchToBinanceSmartChain();
        }
      });
    } else {
      console.error("MetaMask is not installed");
    }
    window.onload = () => {
      if (window.ethereum && window.ethereum.isMetaMask) {
        (window as any).ethereum
          .request({
            method: "eth_chainId",
          })
          .then((chainId: string) => {
            if (chainId !== ethers.utils.hexValue(CHAIN_ID)) {
              switchToBinanceSmartChain();
            }
          })
          .catch((error: any) => {
            console.error(error);
          });
      } else {
        console.error("MetaMask is not installed");
      }
    };
  }, [switchToBinanceSmartChain]);

  // useEffect(() => {
  //   if (window.ethereum && window.ethereum.isMetaMask) {
  //     window.ethereum.request({
  //       method: "eth_chainId"
  //     }).then((chainId) => {
  //       if (chainId !== "0x38") {
  //         addBinanceSmartChain();
  //       }
  //     }).catch((error) => {
  //       console.error(error);
  //     });
  //   } else {
  //     console.error("MetaMask is not installed");
  //   }
  // }, [addBinanceSmartChain]);

  if (account) {
    return renderWalletStatus();
  } else if (error) {
    return (
      <div className="statusError" onClick={switchToBinanceSmartChain}>
        <Activity className={"icon"} />
        <span>Wrong Network</span>
      </div>
    );
  } else {
    return (
      <>
        <BaseButton
          className="header__wallet-btn d-md-none"
          theme="rounded contained"
          click={handleClickConnectButton}
        >
          Connect wallet
        </BaseButton>
        <div className="connectBtn d-none d-md-flex">
          <Wallet onClick={handleClickConnectButton} />
        </div>
      </>
    );
  }

  function renderWalletStatus() {
    return (
      <div className="statusWrap" onClick={handleClickConnectButton}>
        <div className="statusBalance">
          {getFullDisplayBalance(balance, tokens.usdt.decimals[chainId ?? CHAIN_ID], 2)} USDT
        </div>
        {/*<div className={styles.statusConnect}>*/}
        {/*  <span className={styles.statusAddress}>{formatAddress(account ?? "")}</span>*/}
        {/*  <MetaMaskLogo className={styles.icon} />*/}
        {/*</div>*/}
      </div>
    );
  }
}

export default Web3Status;
