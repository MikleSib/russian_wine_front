import { useMemo, SVGProps, FunctionComponent } from "react";
import Web3 from "web3";
import { useWeb3React } from "@web3-react/core";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import { HttpProviderOptions } from "web3-core-helpers";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { ethers } from "ethers";

import ercAbi from "abi/USDT.json";
import NewWineFirstSaleMarketAbi from "abi/NewWineFirstSaleMarket.json";
import WineMarketPlaceAbi from "abi/WineMarketPlace.json";
import WinePoolAbi from "abi/WinePool.json";
import WineDeliveryServiceAbi from "abi/WineDeliveryService.json";
import ManagerAbi from "abi/Manager.json";
import { getGasPriceInWei } from "./index";
import {
  ChainId,
  DEFAULT_GAS_PRICE,
  ManagerForTestNet,
  WineDeliveryService,
  NewWineFirstSaleMarket,
  WineMarketPlace,
} from "../constants";
import { ReactComponent as MetaMaskLogo } from "assets/icons/metamask-fox.svg";
import { ReactComponent as WalletConnectLogo } from "assets/icons/wallet-connect.svg";

interface WalletInfo<TConnector extends string> {
  connectorId?: TConnector;
  name: string;
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  href: string | null;
  mobile?: boolean;
  mobileOnly?: boolean;
}

export enum ConnectorNames {
  Injected = "injected",
  WalletConnect = "walletconnect",
}

export const CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID ?? "137", 10);
const RPC_URL = process.env.REACT_APP_NODE || "https://data-seed-prebsc-2-s2.binance.org:8545/";

export const getLibrary = (provider: any): Web3 => provider;
export const httpProvider = new Web3.providers.HttpProvider(RPC_URL, {
  timeout: 10000,
} as HttpProviderOptions);

export const injected = new InjectedConnector({ supportedChainIds: [CHAIN_ID] });

export const walletconnect = new WalletConnectConnector({
  rpc: { [ChainId.POLYGON]: RPC_URL },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  supportedChainIds: [CHAIN_ID],
});

export const connectorsByName: {
  [key in ConnectorNames]: InjectedConnector | WalletConnectConnector;
} = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.WalletConnect]: walletconnect,
};

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo<ConnectorNames> } = {
  METAMASK: {
    connectorId: ConnectorNames.Injected,
    name: "MetaMask",
    icon: MetaMaskLogo,
    href: null,
    mobile: !!window.ethereum,
  },
  WALLET_CONNECT: {
    connectorId: ConnectorNames.WalletConnect,
    name: "WalletConnect",
    icon: WalletConnectLogo,
    href: null,
    mobile: true,
  },
};

export const getContract = (abi: any, address: string, web3: Web3): Contract => {
  return new web3.eth.Contract(abi as unknown as AbiItem, address, {
    gasPrice: getGasPriceInWei(DEFAULT_GAS_PRICE).toString(),
  });
};

export const getErcContract = (address: string, web3: Web3): Contract => {
  return getContract(ercAbi, address, web3);
};

export const getWineFirstSaleMarketContract = (web3: Web3): Contract => {
  return getContract(NewWineFirstSaleMarketAbi, NewWineFirstSaleMarket, web3);
};

export const getWineMarketPlaceContract = (web3: Web3): Contract => {
  return getContract(WineMarketPlaceAbi, WineMarketPlace, web3);
};

export const useWineFirstSaleMarket = (): Contract => {
  const { library } = useWeb3React();
  const web3 = new Web3(library);

  return useMemo(() => getWineFirstSaleMarketContract(web3), [web3]);
};

export const useWineMarketPlace = (): Contract => {
  const { library } = useWeb3React();
  const web3 = new Web3(library);

  return useMemo(() => getWineMarketPlaceContract(web3), [web3]);
};

export const useWineDeliveryServiceContract = (): Contract => {
  const { library } = useWeb3React();
  const web3 = new Web3(library);

  return useMemo(() => getContract(WineDeliveryServiceAbi, WineDeliveryService, web3), [web3]);
};

export const useManagerForTestNet = (): Contract => {
  const { library } = useWeb3React();
  const web3 = new Web3(library);

  return useMemo(() => getContract(ManagerAbi, ManagerForTestNet, web3), [web3]);
};

export function parseReceiptEvents(receipt: any, eventName: "Transfer" | "CreateOrder"): any {
  const abi = eventName === "Transfer" ? WinePoolAbi : WineMarketPlaceAbi;
  const interfaceByAbiWineFactory = new ethers.utils.Interface(abi);
  const eventTopic = interfaceByAbiWineFactory.getEventTopic(eventName);
  let result;

  Object.values(receipt.events).forEach((item: any) => {
    if (item.raw.topics[0] === eventTopic) {
      if (eventName === "Transfer" && +item.raw.topics[1] === 0) {
        result = interfaceByAbiWineFactory.decodeEventLog(
          eventName,
          item.raw.data,
          item.raw.topics,
        );
      } else if (eventName === "CreateOrder") {
        result = interfaceByAbiWineFactory.decodeEventLog(
          eventName,
          item.raw.data,
          item.raw.topics,
        );
      }
    }
  });

  return result;
}
