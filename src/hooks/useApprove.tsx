import React, { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import { useWeb3React } from "@web3-react/core";

import WinePoolAbi from "abi/WinePool.json";
import { FeedbackModal } from "components";
import { FEEDBACK_MODAL_STATE } from "components/FeedbackModal/FeedbackModal";
import {
  getContract,
  getErcContract,
  getWineFirstSaleMarketContract,
  getWineMarketPlaceContract,
  httpProvider,
  useWineDeliveryServiceContract,
  useWineMarketPlace,
} from "utils/web3React";
import useLastUpdated from "./useLastUpdated";
import { useModal } from "./index";

export const useCheckApprovalStatus = (
  token: string,
  bottlePrice: number,
  isMarketSale?: boolean,
): { setLastUpdated: () => void; isApproved: boolean } => {
  const [isApproved, setIsApproved] = useState(false);
  const { account, library } = useWeb3React();
  const tokenContract = getErcContract(token, new Web3(library));
  const saleMarketContract = isMarketSale
    ? getWineMarketPlaceContract(new Web3(library))
    : getWineFirstSaleMarketContract(new Web3(library));
  const { lastUpdated, setLastUpdated } = useLastUpdated();

  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const response = await tokenContract.methods
          .allowance(account, saleMarketContract.options.address)
          .call();
        const currentAllowance = BigNumber(ethers.utils.formatUnits(response));
        const transformedNumber = currentAllowance * 1000000000000;
        const bottlePriceBigNumber = new BigNumber(bottlePrice);
        console.log("TEST", token, { currentAllowance, bottlePrice });
        console.log(ethers.utils.formatUnits(response));
        const decimalScale = new BigNumber(10).exponentiatedBy(6); // 6 знаков после запятой
        const scaledBottlePrice = bottlePriceBigNumber.times(decimalScale);
        if (transformedNumber >= bottlePrice) {
          setIsApproved(true);
        } else {
          setIsApproved(false);
        }
        // setIsApproved(false);
      } catch (error) {
        setIsApproved(false);
      }
    };

    if (account) {
      checkApprovalStatus();
    }
  }, [account, tokenContract, saleMarketContract, lastUpdated]);

  return { isApproved, setLastUpdated };
};

export const useApprove = (
  token: string,
  setLastUpdated: () => void,
  isMarketSale?: boolean,
): { requestedApproval: boolean; handleApprove: () => void } => {
  const { account, library } = useWeb3React();
  const [requestedApproval, setRequestedApproval] = useState(false);
  const tokenContract = getErcContract(token, new Web3(library));
  const saleMarketContract = isMarketSale
    ? getWineMarketPlaceContract(new Web3(library))
    : getWineFirstSaleMarketContract(new Web3(library));

  const [showSuccessModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.SUCCESS} />);
  const [showErrorModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.ERROR} />);

  const handleApprove = useCallback(() => {
    tokenContract.methods
      .approve(saleMarketContract.options.address, ethers.constants.MaxUint256)
      .send({ from: account })
      .on("sending", () => {
        setRequestedApproval(true);
      })
      .on("receipt", () => {
        showSuccessModal();
        setLastUpdated();
        setRequestedApproval(false);
      })
      .on("error", (error: any) => {
        console.error(error);
        showErrorModal();
        setRequestedApproval(false);
      });
  }, [token, saleMarketContract, account]);

  return { handleApprove, requestedApproval };
};

export const useApproveForAll = (
  isDeliveryService?: boolean,
): {
  handleApproveForAll: (address: string) => void;
} => {
  const { account, library } = useWeb3React();
  const saleMarketContract = useWineMarketPlace();
  const wineDeliveryServiceContract = useWineDeliveryServiceContract();
  const web3 = new Web3(library ?? httpProvider);
  const approvedContractAddress = isDeliveryService
    ? wineDeliveryServiceContract.options.address
    : saleMarketContract.options.address;

  const handleApproveForAll = useCallback(
    (address: string) => {
      const winePoolContract = getContract(WinePoolAbi, address, web3);

      return winePoolContract.methods
        .setApprovalForAll(approvedContractAddress, 1)
        .send({ from: account })
        .on("receipt", () => {
          console.log("Pool has successfully approved");
        })
        .on("error", (error: any) => {
          console.error(error);
        });
    },
    [library, approvedContractAddress, account],
  );

  return { handleApproveForAll };
};

export const useCheckApproveForAllStatus = (
  isDeliveryService?: boolean,
): {
  checkApprovalStatus: (address: string) => Promise<boolean>;
} => {
  const { account, library } = useWeb3React();
  const saleMarketContract = useWineMarketPlace();
  const wineDeliveryServiceContract = useWineDeliveryServiceContract();
  const web3 = new Web3(library ?? httpProvider);
  const approvedContractAddress = isDeliveryService
    ? wineDeliveryServiceContract.options.address
    : saleMarketContract.options.address;

  const checkApprovalStatus = useCallback(
    async (address: string) => {
      const winePoolContract = getContract(WinePoolAbi, address, web3);
      try {
        return await winePoolContract.methods
          .isApprovedForAll(account, approvedContractAddress)
          .call();
      } catch (error) {
        console.error(error);
      }
    },
    [library, account, approvedContractAddress],
  );

  return { checkApprovalStatus };
};

export const useCheckApproveForDeliveryTask = (
  token: string,
): {
  checkApproveForDeliveryTask: () => Promise<boolean>;
} => {
  const { account, library } = useWeb3React();
  const tokenContract = getErcContract(token, new Web3(library));
  const wineDeliveryServiceContract = useWineDeliveryServiceContract();

  const checkApproveForDeliveryTask = useCallback(async () => {
    try {
      const allowance = await tokenContract.methods
        .allowance(account, wineDeliveryServiceContract.options.address)
        .call();

      return new BigNumber(allowance).gt(0);
    } catch (error) {
      console.error(error);
      return false;
    }
  }, [account, wineDeliveryServiceContract, tokenContract]);

  return { checkApproveForDeliveryTask };
};

export const useApproveForDeliveryTask = (
  token: string,
): {
  handleApproveForDeliveryTask: () => void;
} => {
  const { account, library } = useWeb3React();
  const tokenContract = getErcContract(token, new Web3(library));
  const wineDeliveryServiceContract = useWineDeliveryServiceContract();

  const handleApproveForDeliveryTask = useCallback(() => {
    return tokenContract.methods
      .approve(wineDeliveryServiceContract.options.address, ethers.constants.MaxUint256)
      .send({ from: account })
      .on("receipt", () => {
        console.log("Amount has successfully approved");
      })
      .on("error", (error: any) => {
        console.error(error);
      });
  }, [token, account, wineDeliveryServiceContract]);

  return { handleApproveForDeliveryTask };
};
