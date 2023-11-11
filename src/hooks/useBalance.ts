import { useState, useEffect } from "react";
import Web3 from "web3";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";

import { getErcContract } from "utils/web3React";
import useRefresh from "./useRefresh";
import { BIG_ZERO } from "../constants";

export const useTokenBalance = (tokenAddress: string): BigNumber => {
  const [tokenBalance, setTokenBalance] = useState<BigNumber>(BIG_ZERO);
  const { account, library } = useWeb3React();
  const { fastRefresh } = useRefresh();

  useEffect(() => {
    let isActive = true;

    const fetchBalance = async () => {
      const contract = getErcContract(tokenAddress, new Web3(library));
      try {
        const res = await contract.methods.balanceOf(account).call();
        isActive && setTokenBalance(new BigNumber(res));
      } catch (e) {
        console.error(e);
      }
    };

    if (account && library) {
      fetchBalance();
    }

    return () => {
      isActive = false;
    };
  }, [account, tokenAddress, library, fastRefresh]);

  return tokenBalance;
};

export const useGetBalance = (): BigNumber => {
  const [balance, setBalance] = useState(BIG_ZERO);
  const { account, library } = useWeb3React();
  const { fastRefresh } = useRefresh();

  useEffect(() => {
    const fetchBalance = async () => {
      const walletBalance = await new Web3(library).eth.getBalance(account ?? "0");
      setBalance(new BigNumber(walletBalance));
    };

    if (account && library) {
      fetchBalance();
    }
  }, [account, fastRefresh, library]);

  return balance;
};
