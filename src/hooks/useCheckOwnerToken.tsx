import { useCallback } from "react";
import Web3 from "web3";
import { useWeb3React } from "@web3-react/core";

import WinePoolAbi from "abi/WinePool.json";
import { getContract, httpProvider } from "utils/web3React";

export const useCheckOwnerToken = (): {
  checkOwnerOfToken: (winePoolAddress: string, tokenId: number) => Promise<any>;
} => {
  const { library } = useWeb3React();
  const web3 = new Web3(library ?? httpProvider);

  const checkOwnerOfToken = useCallback(
    async (winePoolAddress: string, tokenId: number) => {
      const winePoolContract = getContract(WinePoolAbi, winePoolAddress, web3);
      try {
        return await winePoolContract.methods.ownerOf(tokenId).call();
      } catch (error) {
        console.error(error);
      }
    },
    [library],
  );

  return { checkOwnerOfToken };
};
