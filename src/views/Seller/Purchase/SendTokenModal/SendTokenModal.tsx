import React, { useState, memo, useCallback } from "react";
import clsx from "clsx";
import { useWeb3React } from "@web3-react/core";

import { FeedbackModal } from "components";
import { FEEDBACK_MODAL_STATE } from "components/FeedbackModal/FeedbackModal";
import { BaseButton, Modal } from "components/common";
import { useModal } from "hooks";
import { SelfInfoApi } from "services/selfInfo/selfInfoApi";
import "./SendTokenModal.styles.scss";
import Web3 from "web3";
import { getContract, httpProvider } from "utils/web3React";
import WinePoolAbi from "abi/WinePool.json";

interface SendTokeModalProps {
  dataProps?: { poolId: number; tokenId: number; winePoolAddress: string; isInner: boolean };
  onDismiss?: () => void;
}

function SendTokeModal({
  dataProps = { poolId: 0, tokenId: 0, winePoolAddress: "", isInner: false },
  onDismiss,
}: SendTokeModalProps) {
  const { library, account } = useWeb3React();
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const [pendingTx, setPendingTx] = useState(false);

  const [showSuccessModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.SUCCESS} />);
  const [showErrorModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.ERROR} />);

  const web3 = new Web3(library ?? httpProvider);
  const winePoolContract = getContract(WinePoolAbi, dataProps.winePoolAddress, web3);

  const onHandleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.replace(",", ".");

      setAddress(value);
      event.target.value = value.toString();
    },
    [setAddress],
  );

  const onHandleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>): void => {
      setError("");
      if (event.currentTarget.value && !/^0x[0-9a-fA-F]{40}$/.test(event.currentTarget.value)) {
        setError("Address is not valid");
      }
    },
    [setError],
  );

  const handleSendToken = useCallback(async () => {
    setPendingTx(true);

    try {
      if (dataProps.isInner) {
        await SelfInfoApi.transferToOuter({
          body: { poolId: dataProps.poolId, tokenId: dataProps.tokenId, address },
        });
      }

      await winePoolContract.methods
        .transferFrom(account, address, dataProps.tokenId)
        .send({ from: account })
        .on("transactionHash", (transactionHash: string) => console.info(transactionHash))
        .on("receipt", () => {
          setPendingTx(false);
          showSuccessModal();
        });
    } catch (error) {
      console.error(error);
      setPendingTx(false);
      showErrorModal();
    }
  }, [dataProps, address, account, winePoolContract]);

  return (
    <Modal size="large" onDismiss={onDismiss}>
      <div className="sendTokenModal">
        <h4 className="sendTokenModal__title">Send</h4>
        <span className="sendTokenModal__label">Wallet address</span>
        <input
          className={clsx("sendTokenModal__input", error && "sendTokenModal__input--error")}
          type="text"
          placeholder="0x"
          value={address}
          onChange={onHandleChange}
          onBlur={onHandleBlur}
          disabled={pendingTx}
        />
        <div className="sendTokenModal__error">{error}</div>
        <BaseButton size="large" disabled={!+address || pendingTx} click={handleSendToken}>
          {pendingTx ? "Processing..." : "Send"}
        </BaseButton>
      </div>
    </Modal>
  );
}

export default memo(SendTokeModal);
