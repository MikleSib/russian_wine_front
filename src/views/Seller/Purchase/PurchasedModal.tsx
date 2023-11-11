import React from "react";

import { Modal } from "components/common";
import { SkeletonLoading } from "components";
import ProductInfo from "views/Product/ProductInfo/ProductInfo";
import { useMarketSalePool } from "hooks/resources/useMarketSalePool";
import { useFirstSalePool } from "hooks/resources/useFirstSalePool";

interface PurchasedModalProps {
  onDismiss?: () => void;
  dataProps?: Record<string, any>;
}

function PurchasedModal({ onDismiss, dataProps }: PurchasedModalProps) {
  /* eslint-disable react-hooks/rules-of-hooks */
  const poolResult = dataProps?.isUserSale
    ? useMarketSalePool({ orderId: dataProps?.productId ?? "0" })
    : useFirstSalePool({ poolId: dataProps?.slug ?? "0" });

  return (
    <Modal onDismiss={onDismiss} size="large">
      {poolResult.poolLoading ? (
        <SkeletonLoading width="100%" height="70vh" />
      ) : (
        <ProductInfo
          isUserSale={dataProps?.isUserSale}
          poolData={poolResult}
          onDismissModal={onDismiss}
        />
      )}
    </Modal>
  );
}

export default PurchasedModal;
