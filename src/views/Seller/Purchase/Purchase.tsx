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
import { capitalize, formatDateTime, generateUserId } from "utils";
import { CHAIN_ID } from "utils/web3React";
import { usePurchase } from "hooks/resources/usePurchase";
import { useCountriesForDelivery } from "hooks/resources/useCountriesForDelivery";
import { SelfInfoApi } from "services/selfInfo/selfInfoApi";
import DeliveryModal from "../DeliveryModal/DeliveryModal";
import SellModal from "./SellModal/SellModal";
import SendTokenModal from "./SendTokenModal/SendTokenModal";
import PurchasedModal from "./PurchasedModal";
import { SellerTypeFilters } from "../SellerTypeFilters";
import SellerHeader, { SellerFixedHeader } from "../SellerHeader";

import "./Purchase.styles.scss";
// import { useDelivery } from "hooks/resources/useDelivery";
import RenderRow from "./RenderRow";
import { useDelivery } from "hooks/resources/useDelivery";
import { DeliveryServiceApi } from "services/deliveryService/deliveryServiceApi";
import exchangeCountStore from "stores/ExchangeStore";
import ReactGA from "react-ga4";
import DeliveryBottlesModal from "../DeliveryBottlesModal/DeliveryBottlesModal";

const Purchase: FC = observer(() => {
  const [typeFilter, setTypeFilter] = useState<TYPE_OPTIONS>(TYPE_OPTIONS.ALL);
  const [rowCollapse, setRowCollapse] = useState<Hash<boolean>>({});
  const [multiFilters, setMultiFilters] = useState({});
  const [page, setPage] = useState(INITIAL_PAGE);
  const [pendingTx, setPendingTx] = useState(false);

  const [mintedPurchasePools, setMintedPurchasePools] = useState<
    (MarketWineRaw & {
      status: Purchase_Status;
    })[]
  >([]);
  const [notDeliveredPurchasePools, setNotDeliveredPurchasePools] = useState<
    (MarketWineRaw & {
      status: Purchase_Status;
    })[]
  >([]);
  const { state } = useLocation();
  const { account } = useWeb3React();

  const isMobile = useMediaQuery("(max-width: 767px)");
  const rootStore = useRootStore();
  const { selfInformation, fullName } = rootStore.authStore;

  const { checkApprovalStatus } = useCheckApproveForAllStatus();
  const { handleApproveForAll } = useApproveForAll();
  const { checkOwnerOfToken } = useCheckOwnerToken();

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
    totalPages: Math.ceil(mintedPurchasePools.length / CARDS_PER_PAGE),
    initialPageSize: CARDS_PER_PAGE,
    initialPage: INITIAL_PAGE,
    siblingCount: isMobile ? 0 : 1,
    onSetPage: setPage,
  });
  const { countries } = useCountriesForDelivery();

  const [showSellModal] = useModal(<SellModal onSellAction={createMarketSaleOrder} />);
  const [showPurchasedModal] = useModal(<PurchasedModal />);
  const [showSendTokenModal] = useModal(<SendTokenModal />);
  const [showDeliveryModal] = useModal(
    <DeliveryModal
      countries={countries}
      pools={mintedPurchasePools}
      setPools={setMintedPurchasePools}
    />,
  );
  const [showDeliveryBottlesModal] = useModal(
    <DeliveryBottlesModal
      countries={countries}
      pools={mintedPurchasePools}
      setPools={setMintedPurchasePools}
    />,
  );
  const [showSuccessModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.SUCCESS} />);
  const [showErrorModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.ERROR} />);
  const [selectedBottles, setSelectedBottles] = useState<
    {
      poolId: number;
      tokenId: number;
      winePoolAddress: string;
      isPurchasedWithCreditCard: boolean;
    }[]
  >([]);
  // const [deliveryProps, setDeliveryProps] = useState<{ poolId: number; tokenId: number }>({
  //   poolId: 0,
  //   tokenId: 0,
  // });

  // const { data: deliveryInfo, isLoading } = useDelivery(deliveryProps);

  useEffect(() => {
    if ((state as any)?.fiatPaidStatus) {
      if ((state as any).fiatPaidStatus === "PAID") {
        showSuccessModal();
      } else {
        showErrorModal();
      }
    }
    return () => {
      exchangeCountStore.exchangeCount = 0;
    };
  }, [state]);

  useEffect(() => {
    async function fetchData() {
      const poolIds = purchasePools.map((item) => item.winePool.poolId);
      const tokenIds = purchasePools.map((item) => item.tokenId);
      const deliveryInfo = await DeliveryServiceApi.getDeliveryInformation({
        body: { poolIds, tokenIds },
      });

      const results: any[] = purchasePools.map((item, i) => {
        const itemUniqueCode = `${item.winePool.poolId}-${item.tokenId}`;
        const itemResonse = deliveryInfo.response
          ? deliveryInfo.response.find((e) => `${e.pool_id}-${e.token_id}` === itemUniqueCode)
          : null;
        const response = itemResonse ? [itemResonse] : [];

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
          return (
            data.blockchain_status === null ||
            data.blockchain_status === undefined ||
            data.blockchain_status === "Canceled"
          );
        } else {
          return true;
        }
      });
      setMintedPurchasePools(filtered.map(({ item }) => item));

      const filteredNotDeliveredPurchasePools = results.filter(({ item, deliveryInfo }) => {
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
      setNotDeliveredPurchasePools(filteredNotDeliveredPurchasePools.map(({ item }) => item));
    }

    if (!purchaseLoading) {
      fetchData();
    }
  }, [purchasePools]);

  const handleShowSellModal = useCallback(
    async (item: MarketWineRaw & { status: Purchase_Status }) => {
      try {
        setPendingTx(true);
        const tokenOwner = await checkOwnerOfToken(item.winePool.contractAddress, item.tokenId);
        // ! testing
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

        showSellModal({
          poolId: item.winePool.poolId,
          tokenId: item.tokenId,
          currency: item.currency ?? tokens.usdt.address[CHAIN_ID],
          firstSalePrice: item.winePool.wineParams.FirstSalePrice,
        });
        setPendingTx(false);

        ReactGA.event({
          category: "Custom",
          action: "listed_for_sale",
          label: "Successfully put up a bottle for sale",
          value: generateUserId(),
        });
      } catch (e) {
        console.error(e);
        setPendingTx(false);
      }
    },
    [showSellModal, checkOwnerOfToken, account],
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

        showSendTokenModal({
          poolId: item.winePool.poolId,
          tokenId: item.tokenId,
          isInner: item.isInner,
          winePoolAddress: item.winePool.contractAddress,
        });
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
    (isUserSale: boolean, productId: number, slug: string) => {
      showPurchasedModal({
        isUserSale,
        productId,
        slug,
      });
    },
    [showPurchasedModal],
  );

  const handleChangelectedBottles = (
    marked: boolean,
    bottle: {
      poolId: number;
      tokenId: number;
      winePoolAddress: string;
      isPurchasedWithCreditCard: boolean;
    },
  ) => {
    if (marked) {
      setSelectedBottles([...selectedBottles, bottle]);
    } else {
      setSelectedBottles(selectedBottles.filter((b) => b.tokenId !== bottle.tokenId));
    }
  };

  const handleMarkExchange = (
    marked: boolean,
    bottle: {
      poolId: number;
      tokenId: number;
      winePoolAddress: string;
      isPurchasedWithCreditCard: boolean;
    },
  ) => {
    exchangeCountStore.changeCount(marked);
    handleChangelectedBottles(marked, bottle);
  };

  useEffect(() => {
    setSelectedBottles([]);
    exchangeCountStore.exchangeCount = 0;
  }, [typeFilter]);

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

  const handleShowDeliveryModal = (dataProps?: Record<string, any> | undefined) => {
    if (!!dataProps?.possibleDeliveryDate) {
      showErrorModal({
        title: `At the moment, the order is not possible, \n the goods are on their way to the warehouse. \ Please try later.`,
      });
    } else {
      showDeliveryModal(dataProps);
    }
  };

  return (
    <>
      <PageMeta />
      <div className="purchase">
        <aside
          className={clsx("purchase__aside", { "purchase__aside--open": rootStore.showFilters })}
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
          showExchange={notDeliveredPurchasePools.length > 0}
        />
        <div className="purchase__main">
          <SellerHeader
            userInfo={selfInformation}
            showExchange={notDeliveredPurchasePools.length > 0}
          />
          <div className="purchase__content">
            <div className="purchase__filters">
              <BaseSearch isRounded placeholder="Search items..." onChange={() => null} />

              {!isMobile && selectedBottles.length > 0 ? (
                <BaseButton
                  className="ml-auto mr-4"
                  size="small"
                  theme="contained rounded"
                  click={
                    // () => console.log(ExchangeStore.exchangeList)
                    // () => showDeliveryModal(ExchangeStore.exchangeList)
                    () => showDeliveryBottlesModal(selectedBottles)
                  }
                >
                  Exchange
                </BaseButton>
              ) : null}

              <SellerTypeFilters type={typeFilter} onSetType={setTypeFilter} />
            </div>
            {/* TODO move table to separate file */}
            <div className="purchase__rows-wrapper">
              {purchaseLoading ? (
                <SkeletonLoading count={5} width="100%" height={105} />
              ) : (
                mintedPurchasePools.map((item, key) => (
                  <RenderRow
                    key={key}
                    item={item}
                    account={account}
                    pendingTx={pendingTx}
                    handleCancelOrder={handleCancelOrder}
                    handleShowSellModal={handleShowSellModal}
                    showDeliveryModal={handleShowDeliveryModal}
                    handleShowSendModal={handleShowSendModal}
                    handleClickViewPurchased={handleClickViewPurchased}
                    handleMarkExchange={handleMarkExchange}
                    selected={
                      !!selectedBottles.find(
                        (b) => b.tokenId === item.tokenId && b.poolId === item.winePool.poolId,
                      )
                    }
                    classKey={key}
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

export default Purchase;
