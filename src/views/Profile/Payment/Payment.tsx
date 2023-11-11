import React, { useCallback } from "react";
import { observer } from "mobx-react-lite";

import { BaseButton } from "components/common";
import { useRootStore } from "context/RootStoreProvider";
import { useMediaQuery } from "hooks";
import { formatAddress } from "utils";
import { ReactComponent as CloseIcon } from "assets/icons/close.svg";
import "./Payment.styles.scss";

function Payment() {
  const { authStore } = useRootStore();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const handleRemoveAddress = useCallback(
    async (address: string) => {
      await authStore.detachWalletAddress(address);
    },
    [authStore.detachWalletAddress],
  );

  return (
    <div className="payment mx-auto">
      <h3 className="payment__title">Payment</h3>
      <div className="payment__field-label">Crypto wallet</div>
      <div>{renderWallets()}</div>
    </div>
  );

  function renderWallets() {
    return authStore.selfInformation.contractAddresses.map(({ address }) => (
      <div key={address} className="payment__row">
        <div className="payment__field">{isMobile ? formatAddress(address, 10) : address}</div>
        <BaseButton size="small" click={() => handleRemoveAddress(address)}>
          <CloseIcon />
        </BaseButton>
      </div>
    ));
  }
}

export default observer(Payment);
