import React from "react";
import clsx from "clsx";

import { ReactComponent as CloseIcon } from "assets/icons/close.svg";
import { ReactComponent as CheckIcon } from "assets/icons/check.svg";
import { ReactComponent as WarningIcon } from "assets/icons/warning.svg";
import { BaseButton } from "components/common";
import { useModal } from "hooks";
import SumsubWebSdkModal from "./SumsubWebSdkModal";
import "./Personal.styles.scss";

interface KYCProps {
  isKysApproved?: boolean;
  isPending?: boolean;
  onGetKycStatusAction: () => Promise<void>;
}

function KYC({ isKysApproved, isPending, onGetKycStatusAction }: KYCProps) {
  const [showKycModal] = useModal(
    <SumsubWebSdkModal isKycApproved={isKysApproved} onGetKycStatusAction={onGetKycStatusAction} />,
    false,
  );

  return (
    <div className="kyc">
      <div className="kyc__container">
        <h3 className="personal__title">Проверка KYC</h3>
        <p className="kyc__caption">
          Только верифицированные пользователи могут использовать все функции при работе с сайтом, включая совершение
          покупок с помощью банковской карты и обмен NFT на физические товары.
        </p>
        <div className="kyc__statusWrapper">
          <div className="kyc__status">
            <div
              className={clsx("kyc__icon", {
                "kyc__icon--success": isKysApproved,
                "kyc__icon--error": !isKysApproved && !isPending,
              })}
            >
              {renderIcon()}
            </div>
            <p className="kyc__labelWrap">
              <span className="kyc__label">Статус KYC</span>
              <span>{renderStatus()}</span>
            </p>
          </div>
          {!isKysApproved && !isPending && (
            <BaseButton size="large" className="d-none d-md-flex" click={showKycModal}>
              Проверка
            </BaseButton>
          )}
        </div>
        {!isKysApproved && !isPending && (
          <BaseButton size="large" className="d-md-none w-100" click={showKycModal}>
            Проверка
          </BaseButton>
        )}
      </div>
    </div>
  );

  function renderIcon() {
    if (isKysApproved) {
      return <CheckIcon />;
    } else if (isPending) {
      return <WarningIcon />;
    } else {
      return <CloseIcon />;
    }
  }

  function renderStatus() {
    if (isKysApproved) {
      return "Verified";
    } else if (isPending) {
      return "Pending";
    } else {
      return "No verified";
    }
  }
}

export default KYC;
