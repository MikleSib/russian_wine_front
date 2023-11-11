import React, { FC, useState, memo, useCallback } from "react";
import BigNumber from "bignumber.js";
import { useWeb3React } from "@web3-react/core";

import { FeedbackModal } from "components";
import { FEEDBACK_MODAL_STATE } from "components/FeedbackModal/FeedbackModal";
import { BaseButton, Modal } from "components/common";
import { useModal } from "hooks";
import { tokens } from "constants/index";
import { CHAIN_ID } from "utils/web3React";
import { getDecimalAmount } from "utils";
import "./SellModal.styles.scss";
import { notificationsStore } from "views";

interface SellModalProps {
  onSellAction: (params: {
    poolId: number;
    tokenId: number;
    currency: string;
    price: string;
  }) => Promise<void>;
  dataProps?: Record<string, any>;
  onDismiss?: () => void;
}

const SellModal: FC<SellModalProps> = memo(({ onSellAction, dataProps, onDismiss }) => {
  const { chainId } = useWeb3React();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [pendingTx, setPendingTx] = useState(false);

  const [showSuccessModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.SUCCESS} />);
  const [showErrorModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.ERROR} />);

  function validate(s: string) {
    const rgx = /^[0-9]*\.?[0-9]*$/;
    return s.match(rgx);
  }

  const handleChangeInput = () => {
    return (event: React.ChangeEvent<HTMLInputElement>): void => {
      setError("");
      const value = event.target.value;

      if (validate(value)) {
        setValue(value);
        event.target.value = value.toString();
      }

      if (new BigNumber(value).lt(dataProps?.firstSalePrice || "0")) {
        setError(` The selling price cannot be less than ${dataProps?.firstSalePrice || "0"}`);
      }
    };
  };

  const handleCreateOrder = useCallback(async () => {
    setPendingTx(true);

    try {
      await onSellAction({
        ...dataProps,
        price: getDecimalAmount(
          new BigNumber(value),
          tokens.usdt.decimals[chainId ?? CHAIN_ID],
        ).toString(),
      } as any);

      notificationsStore.addNotification({
        id: Date.now(),
        TxTime: Date.now(),
        type: "success",
        message: "Your offer has been successfully placed within the User Sales",
        TxLink: "",
      });

      setPendingTx(false);
      showSuccessModal();
    } catch (error) {
      console.error(error);
      setPendingTx(false);
      showErrorModal();
    }
  }, [dataProps, onSellAction, value]);

  return (
    <Modal title="Enter price">
      <div className="d-flex flex-column align-items-center">
        <p className="sellModal__info">
          Commission rate is 2% of the price. Please take this into account while entering the
          selling price.
        </p>
        <input
          className="sellModal__input"
          type="string"
          placeholder="Enter your price in USDT"
          value={value}
          onChange={handleChangeInput()}
          disabled={pendingTx}
        />
        {Boolean(+value) && <span className="sellModal__symbol">USDT</span>}
        <p className="sellModal__error">{error}</p>
        <BaseButton
          size="large"
          disabled={!+value || pendingTx || Boolean(error)}
          click={handleCreateOrder}
        >
          {pendingTx ? "Processing..." : "Create Order"}
        </BaseButton>
      </div>
    </Modal>
  );
});

export default SellModal;
