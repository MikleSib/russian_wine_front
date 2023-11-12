import React, { useCallback } from "react";

import { BaseButton, Modal } from "components/common";
import { AGE_VERIFIED_KEY } from "constants/index";
import "./AgeVerifiedModal.styles.scss";

function AgeVerifiedModal({ onDismiss }: { onDismiss?: () => void }) {
  const handleCLickConfirm = useCallback(() => {
    localStorage.setItem(AGE_VERIFIED_KEY, "yes");
    onDismiss && onDismiss();
  }, [onDismiss]);

  return (
    <Modal size="large" extraClassName="mx-3">
      <div className="ageVerifiedModal">
        <div className="ageVerifiedModal__icon">
          <span>18</span>+
        </div>
        <p className="ageVerifiedModal__text">Вам больше 18 лет?</p>
        <div className="d-flex">
          <BaseButton
            theme="outlined-red"
            color="black"
            //click={() => (window.location.href = "https://winessy.com/about")}
          >
            Нет
          </BaseButton>
          <BaseButton click={handleCLickConfirm}>Да</BaseButton>
        </div>
      </div>
    </Modal>
  );
}

export default AgeVerifiedModal;
