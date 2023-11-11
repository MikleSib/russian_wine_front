import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import { useWeb3React } from "@web3-react/core";

import { BaseButton, BaseSearch, Pagination } from "components/common";
import { FeedbackModal, MultiFilters, PageMeta, SkeletonLoading } from "components";
import { FEEDBACK_MODAL_STATE } from "components/FeedbackModal/FeedbackModal";
import {
  useApproveForAll,
  useCheckApproveForAllStatus,
  useMediaQuery,
  usePagination,
  useModal,
  useCheckOwnerToken,
} from "hooks";
import { INITIAL_CARDS_PER_PAGE, INITIAL_PAGE, tokens, TYPE_OPTIONS } from "constants/index";
import { useRootStore } from "context/RootStoreProvider";
import { capitalize, formatDateTime } from "utils";
import { CHAIN_ID } from "utils/web3React";
import { usePurchase } from "hooks/resources/usePurchase";
import { useCountriesForDelivery } from "hooks/resources/useCountriesForDelivery";
import { SelfInfoApi } from "services/selfInfo/selfInfoApi";
import { SellerTypeFilters } from "../SellerTypeFilters";
import SellerHeader, { SellerFixedHeader } from "../SellerHeader";

import "./Exchange.styles.scss";
// import { useDelivery } from "hooks/resources/useDelivery";
import RenderRowExchange from "./RenderRowExchange";
import PurchasedModal from "../Purchase/PurchasedModal";
import DeliveryDetailModal from "./DeliveryDetailModal";
import { useDelivery } from "hooks/resources/useDelivery";
import { DeliveryServiceApi } from "services/deliveryService/deliveryServiceApi";
import currencyStore from "stores/CurrencyStore";

const Exchange: FC = observer(() => {
  const [typeFilter, setTypeFilter] = useState<TYPE_OPTIONS>(TYPE_OPTIONS.ALL);
  const [rowCollapse, setRowCollapse] = useState<Hash<boolean>>({});
  const [multiFilters, setMultiFilters] = useState({});
  const [page, setPage] = useState(INITIAL_PAGE);
  const [pendingTx, setPendingTx] = useState(false);

  const { state } = useLocation();
  const { account } = useWeb3React();

  const isMobile = useMediaQuery("(max-width: 767px)");
  const rootStore = useRootStore();
  const { selfInformation, fullName } = rootStore.authStore;

  const { checkApprovalStatus } = useCheckApproveForAllStatus();
  const { handleApproveForAll } = useApproveForAll();
  const { checkOwnerOfToken } = useCheckOwnerToken();
  const [notDeliveredPurchasePools, setNotDeliveredPurchasePools] = useState<
    (MarketWineRaw & {
      status: Purchase_Status;
    })[]
  >([]);
  const [deliveredPurchasePools, setDeliveredPurchasePools] = useState<
    (MarketWineRaw & {
      status: Purchase_Status;
    })[]
  >([]);

  const { countries } = useCountriesForDelivery();

  const [showDeliveryDetailModal] = useModal(<DeliveryDetailModal countries={countries} />);

  const [deliveryProps, setDeliveryProps] = useState<{ poolIds: number[]; tokenIds: number[] }>({
    poolIds: [0],
    tokenIds: [0],
  });

  const { data: deliveryInfo } = useDelivery(deliveryProps);

  const defaultFilterForPage = useMemo(() => {
    if (typeFilter === "new") {
      return { IsNew: ["1"] };
    } else {
      return {};
    }
  }, [typeFilter]);

  const CARDS_PER_PAGE = 100;

  const {
    purchaseLoading,
    purchasePools,
    totalPages,
    filters,
    createMarketSaleOrder,
    cancelMarketSaleOrder,
  } = usePurchase({
    pagination: { onPage: CARDS_PER_PAGE, pageNumber: page },
    filter: {
      ...defaultFilterForPage,
      ...multiFilters,
    },
  });

  const { items } = usePagination({
    totalPages: Math.ceil(
      (notDeliveredPurchasePools.length + deliveredPurchasePools.length) / CARDS_PER_PAGE,
    ),
    initialPageSize: CARDS_PER_PAGE,
    initialPage: INITIAL_PAGE,
    siblingCount: isMobile ? 0 : 1,
    onSetPage: setPage,
  });

  // const [showSellModal] = useModal(<SellModal onSellAction={createMarketSaleOrder} />);
  const [showPurchasedModal] = useModal(<PurchasedModal />);
  // const [showSendTokenModal] = useModal(<SendTokenModal />);
  const [showSuccessModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.SUCCESS} />);
  const [showErrorModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.ERROR} />);

  useEffect(() => {
    if ((state as any)?.fiatPaidStatus) {
      if ((state as any).fiatPaidStatus === "PAID") {
        showSuccessModal();
      } else {
        showErrorModal();
      }
    }
  }, [state]);

  const handleShowSellModal = useCallback(
    async (item: MarketWineRaw & { status: Purchase_Status }) => {
      try {
        setPendingTx(true);
        const tokenOwner = await checkOwnerOfToken(item.winePool.contractAddress, item.tokenId);

        if (tokenOwner !== account) {
          setPendingTx(false);
          showErrorModal({
            title: `Your account in wallet is not owner of token\nPlease, check address - ${tokenOwner}`,
          });
          return;
        }

        const isApproved = await checkApprovalStatus(item.winePool.contractAddress);
        if (!isApproved) {
          await handleApproveForAll(item.winePool.contractAddress);
        }

        // showSellModal({
        //   poolId: item.winePool.poolId,
        //   tokenId: item.tokenId,
        //   currency: item.currency ?? tokens.usdt.address[CHAIN_ID],
        //   firstSalePrice: item.winePool.wineParams.FirstSalePrice,
        // });
        setPendingTx(false);
      } catch (e) {
        console.error(e);
        setPendingTx(false);
      }
    },
    [checkOwnerOfToken, account],
  );

  const handleShowSendModal = useCallback(
    async (item: MarketWineRaw & { status: Purchase_Status }) => {
      try {
        setPendingTx(true);

        if (item.isInner) {
          const allowedResponse = await SelfInfoApi.checkAllowedTransfer({
            body: { poolId: item.winePool.poolId, tokenId: item.tokenId },
          });
          if (!allowedResponse?.response?.allowTransfer) {
            showErrorModal({
              title: `Sending token is not allowed yet!\nActual date - ${
                allowedResponse?.response?.allowTransferDate
                  ? formatDateTime({
                      value: allowedResponse.response.allowTransferDate * 1000,
                      time: true,
                    })
                  : "n/a"
              }`,
            });
            setPendingTx(false);
            return;
          }
        } else {
          const tokenOwner = await checkOwnerOfToken(item.winePool.contractAddress, item.tokenId);
          if (tokenOwner !== account) {
            setPendingTx(false);
            showErrorModal({
              title: `Your account in wallet is not owner of token\nPlease, check address - ${tokenOwner}`,
            });
            return;
          }
        }

        // showSendTokenModal({
        //   poolId: item.winePool.poolId,
        //   tokenId: item.tokenId,
        //   isInner: item.isInner,
        //   winePoolAddress: item.winePool.contractAddress,
        // });
        setPendingTx(false);
      } catch (e) {
        console.error(e);
        setPendingTx(false);
        showErrorModal();
      }
    },
    [checkOwnerOfToken, account],
  );

  const handleClickViewPurchased = useCallback(
    (isUserSale: boolean, productId: number) => {
      showPurchasedModal({
        isUserSale,
        productId,
      });
    },
    [showPurchasedModal],
  );

  const handleRowCollapse = (key: string): void => {
    setRowCollapse((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const handleCancelOrder = useCallback(
    async (orderId: number) => {
      setPendingTx(true);

      try {
        await cancelMarketSaleOrder({ orderId });

        setPendingTx(false);
        showSuccessModal();
      } catch (error) {
        console.error(error);
        setPendingTx(false);
        showErrorModal();
      }
    },
    [cancelMarketSaleOrder],
  );

  useEffect(() => {
    async function fetchData() {
      const poolIds = purchasePools.map((item) => item.winePool.poolId);
      const tokenIds = purchasePools.map((item) => item.tokenId);
      const deliveryInfo = await DeliveryServiceApi.getDeliveryInformation({
        body: { poolIds, tokenIds },
      });

      const results: any[] = purchasePools.map((item, i) => {
        const itemUniqueCode = `${item.winePool.poolId}-${item.tokenId}`;
        const response = deliveryInfo.response
          ? deliveryInfo.response.find((e) => `${e.pool_id}-${e.token_id}` === itemUniqueCode) || []
          : [];

        return {
          item,
          deliveryInfo: {
            ...deliveryInfo,
            response,
          },
        };
      });

      const filtered = results.filter(({ item, deliveryInfo }) => {
        if (deliveryInfo.response?.length) {
          const data = deliveryInfo.response[0] as DeliveryResponse;
          if (
            data.blockchain_status === "WaitingForPayment" ||
            data.blockchain_status === "DeliveryInProcess"
          ) {
            return item;
          }
          return null;
        } else {
          return null;
        }
      });
      setNotDeliveredPurchasePools(filtered.map(({ item }) => item));
    }

    if (!purchaseLoading) {
      fetchData();
    }
  }, [purchasePools]);

  useEffect(() => {
    async function fetchData() {
      const poolIds = purchasePools.map((item) => item.winePool.poolId);
      const tokenIds = purchasePools.map((item) => item.tokenId);
      const deliveryInfo = await DeliveryServiceApi.getDeliveryInformation({
        body: { poolIds, tokenIds },
      });

      const results: any[] = purchasePools.map((item, i) => {
        const itemUniqueCode = `${item.winePool.poolId}-${item.tokenId}`;
        const response = deliveryInfo.response
          ? deliveryInfo.response.find((e) => `${e.pool_id}-${e.token_id}` === itemUniqueCode) || []
          : [];

        return {
          item,
          deliveryInfo: {
            ...deliveryInfo,
            response,
          },
        };
      });

      const filtered = results.filter(({ item, deliveryInfo }) => {
        if (deliveryInfo.response?.length) {
          const data = deliveryInfo.response[0] as DeliveryResponse;
          if (data.blockchain_status === "Executed") {
            return item;
          }
          return null;
        } else {
          return null;
        }
      });
      setDeliveredPurchasePools(filtered.map(({ item }) => item));
    }

    if (!purchaseLoading) {
      fetchData();
    }
  }, [purchasePools]);

  return (
    <>
      <PageMeta />
      <div className="exchange">
        <aside
          className={clsx("exchange__aside", { "exchange__aside--open": rootStore.showFilters })}
        >
          <MultiFilters
            filters={filters}
            onApplyFilter={setMultiFilters}
            isMarketSale
            {...(isMobile && { onClose: () => rootStore.toggleShowFilters(false) })}
          />
        </aside>
        <SellerFixedHeader
          fullName={fullName}
          image={selfInformation.image}
          showExchange={
            deliveredPurchasePools.length + notDeliveredPurchasePools.length !==
            purchasePools.length
          }
        />
        <div className="exchange__main">
          <SellerHeader
            userInfo={selfInformation}
            showExchange={
              deliveredPurchasePools.length + notDeliveredPurchasePools.length !==
              purchasePools.length
            }
          />
          <div className="exchange__content">
            <div className="exchange__filters">
              <BaseSearch isRounded placeholder="Search items..." onChange={() => null} />
              <SellerTypeFilters type={typeFilter} onSetType={setTypeFilter} />
            </div>
            {/* TODO move table to separate file */}
            <div className="exchange__rows-wrapper">
              <p className="exchange__cell--group-exchange">Orders in processing</p>
              {purchaseLoading ? (
                <SkeletonLoading count={5} width="100%" height={105} />
              ) : (
                notDeliveredPurchasePools.map((item, key) => (
                  <RenderRowExchange
                    poolType={"notDeliveredPurchasePools"}
                    item={item}
                    currency={currencyStore.currency}
                    account={account}
                    pendingTx={pendingTx}
                    pools={notDeliveredPurchasePools}
                    setPools={setNotDeliveredPurchasePools}
                    handleCancelOrder={handleCancelOrder}
                    handleShowSellModal={handleShowSellModal}
                    showDeliveryDetailModal={showDeliveryDetailModal}
                    handleShowSendModal={handleShowSendModal}
                    handleClickViewPurchased={handleClickViewPurchased}
                    key={key}
                  />
                ))
              )}
              {deliveredPurchasePools.length !== 0 ? (
                <p className="exchange__cell--group-exchange">Orders completed</p>
              ) : null}
              {purchaseLoading ? (
                <SkeletonLoading count={5} width="100%" height={105} />
              ) : (
                deliveredPurchasePools.map((item, key) => (
                  <RenderRowExchange
                    poolType={"deliveredPurchasePools"}
                    item={item}
                    currency={currencyStore.currency}
                    account={account}
                    pendingTx={pendingTx}
                    pools={deliveredPurchasePools}
                    setPools={setDeliveredPurchasePools}
                    handleCancelOrder={handleCancelOrder}
                    handleShowSellModal={handleShowSellModal}
                    showDeliveryDetailModal={showDeliveryDetailModal}
                    handleShowSendModal={handleShowSendModal}
                    handleClickViewPurchased={handleClickViewPurchased}
                    key={key}
                  />
                ))
              )}
            </div>
            {!!purchasePools.length && totalPages > 1 && (
              <Pagination items={items} className="mb-0" />
            )}
          </div>
        </div>
      </div>
    </>
  );
});

export default Exchange;
