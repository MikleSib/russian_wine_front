import React from "react";
import clsx from "clsx";

import { BaseButton, Modal } from "components/common";
import { ReactComponent as CheckIcon } from "assets/icons/check.svg";
import { ReactComponent as CloseIcon } from "assets/icons/close.svg";
import "./FeedbackModal.styles.scss";

export enum FEEDBACK_MODAL_STATE {
  SUCCESS = 1,
  ERROR = 2,
}

interface FeedbackModalProps {
  onDismiss?: () => void;
  state: FEEDBACK_MODAL_STATE;
  dataProps?: Record<string, any>;
}

function FeedbackModal({ state, onDismiss, dataProps }: FeedbackModalProps) {
  return (
    <Modal onDismiss={onDismiss} size="large">
      <div className="feedbackModal">
        <div
          className={clsx(
            "feedbackModal__icon",
            `feedbackModal__icon--${state === 1 ? "success" : "error"}`,
          )}
        >
          {state === FEEDBACK_MODAL_STATE.SUCCESS ? <CheckIcon /> : <CloseIcon />}
        </div>
        <p className="feedbackModal__text">{renderText()}</p>
        <BaseButton click={onDismiss}>Confirm</BaseButton>
      </div>
    </Modal>
  );

  function renderText() {
    if (dataProps?.title) {
      return dataProps?.title;
    } else {
      if (state === FEEDBACK_MODAL_STATE.SUCCESS) {
        return "The transaction was successfully sent to the blockchain";
      } else {
        return "Oops, something went wrong :(";
      }
    }
  }
}

export default FeedbackModal;
