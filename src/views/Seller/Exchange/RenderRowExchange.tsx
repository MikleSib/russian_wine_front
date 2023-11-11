import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { capitalize, processForm } from "utils";
import { useDelivery } from "hooks/resources/useDelivery";

import { ReactComponent as Chain } from "assets/icons/chain.svg";
import { ReactComponent as CreditCard } from "assets/icons/credit-card.svg";
import { BaseButton } from "components/common";
import { useApproveForDeliveryTask, useCheckApproveForDeliveryTask, useModal } from "hooks";
import { CHAIN_ID, useWineDeliveryServiceContract } from "utils/web3React";
import { DEFAULT_GAS_LIMIT, tokens } from "constants/index";
import { useWeb3React } from "@web3-react/core";
import { FeedbackModal, WalletProviderModal } from "components";
import { FEEDBACK_MODAL_STATE } from "components/FeedbackModal/FeedbackModal";
import { UserSales, notificationsStore } from "views";
import PayNowModal from "../DeliveryModal/PayNowModal";
import { useRootStore } from "context/RootStoreProvider";
import DeliveryDetailModal from "./DeliveryDetailModal";
import { StripePaymentApi } from "services/goPayPayment/goPayPaymentApi";

interface RenderRowProps {
  poolType: string;
  item: MarketWineRaw & { status: Purchase_Status };
  currency: string;
  account: string | null | undefined;
  pendingTx: boolean;
  pools: (MarketWineRaw & {
    status: Purchase_Status;
  })[];
  setPools: (qwe: any) => void;
  handleCancelOrder: (orderId: number) => Promise<void>;
  handleShowSellModal: (item: MarketWineRaw & { status: Purchase_Status }) => Promise<void>;
  showDeliveryDetailModal: (dataProps?: Record<string, any> | undefined) => void;
  handleShowSendModal: (item: MarketWineRaw & { status: Purchase_Status }) => Promise<void>;
  handleClickViewPurchased: (isUserSale: boolean, productId: number) => void;
  key: number;
}

function RenderRowExchange({
  poolType,
  item,
  currency,
  account,
  pendingTx,
  pools,
  setPools,
  handleCancelOrder,
  handleShowSellModal,
  showDeliveryDetailModal,
  handleShowSendModal,
  handleClickViewPurchased,
  key,
}: RenderRowProps) {
  const [rowCollapse, setRowCollapse] = useState<Hash<boolean>>({});
  const rootStore = useRootStore();
  const { chainId } = useWeb3React();
  const USDT = tokens.usdt.address[chainId ?? CHAIN_ID];
  const { checkApproveForDeliveryTask } = useCheckApproveForDeliveryTask(USDT);
  const { handleApproveForDeliveryTask } = useApproveForDeliveryTask(USDT);
  const wineDeliveryServiceContract = useWineDeliveryServiceContract();
  const [showSuccessModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.SUCCESS} />);
  const [showErrorModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.ERROR} />);
  const [showWalletProviderModal] = useModal(<WalletProviderModal />);
  const [payBtnBlocked, setPayBtnBlocked] = useState(false);

  const {
    data: deliveryInfo,
    // createNewDelivery,
    // sendDeliveryTask,
  } = useDelivery({
    poolIds: [item.winePool.poolId ?? 0],
    tokenIds: [item.tokenId ?? 0],
  });
  const [loading, setLoading] = useState(false);
  let TxHash = "";
  const handleRowCollapse = (key: string): void => {
    setRowCollapse((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const onPayDeliveryPrice = useCallback(async () => {
    setLoading(true);

    try {
      // TODO showLastDeliveryTask really need?
      const isApproved = await checkApproveForDeliveryTask();
      if (!isApproved) {
        await handleApproveForDeliveryTask();
      }
      // await sendDeliveryTask();
      await wineDeliveryServiceContract.methods
        .payDeliveryTaskAmount(item.winePool.poolId, item.tokenId)
        .send({ from: account, gas: DEFAULT_GAS_LIMIT })
        .on("transactionHash", (transactionHash: string) => (TxHash = transactionHash))
        .on("receipt", () => {
          notificationsStore.addNotification({
            id: Date.now(),
            TxTime: Date.now(),
            type: "success",
            message: "Your NFT exchange order has been successfully created",
            TxLink: TxHash,
          });

          setLoading(false);
          // updatePools();
          setPayBtnBlocked(true);
          showSuccessModal();
        });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [wineDeliveryServiceContract, item, account]);

  function updatePools() {
    if (poolType === "notDeliveredPurchasePools") {
      const newPools = pools.filter(
        (item1) =>
          !(item1.winePool.poolId === item.winePool.poolId && item1.tokenId === item.tokenId),
      );
      setPools(newPools.map((item) => item));
    }
    // else {
    //   const pool = pools.find(
    //     (item1) => item1.winePool.poolId === item.winePool.poolId && item1.tokenId === item.tokenId,
    //   );
    //   setPools([...pools, pool]);
    // }
  }

  const [showPayNowModal] = useModal(
    <PayNowModal
      token={USDT}
      onHandleShowSuccess={showSuccessModal}
      onHandleShowError={showErrorModal}
      onShowWalletModalAction={showWalletProviderModal}
      handlePayDelivery={onPayDeliveryPrice}
      updatePools={updatePools}
      setPayBtnBlocked={setPayBtnBlocked}
      poolId={item.winePool.poolId}
      tokenId={item.tokenId}
      currency={currency}
      isKycApproved={rootStore.authStore.selfInformation?.isKycApproved}
    />,
  );

  const handlePayDeliveryWithCard = async () => {
    try {
      setLoading(true);
      const { response } = await StripePaymentApi.payDelivery(
        [item.winePool.poolId],
        [item.tokenId],
        currency === "USD" ? "EUR" : currency,
      );
      setLoading(false);
      if (response?.payDeliveryUrl) {
        processForm(response);
        notificationsStore.addNotification({
          id: Date.now(),
          TxTime: Date.now(),
          type: "success",
          message: "Your NFT exchange order has been successfully created",
        });
      }
      // updatePools();
      setPayBtnBlocked(true);
    } catch (error) {
      setLoading(false);
      console.error(error);
      showErrorModal();
    }
  };

  useEffect(() => {
    // console.log("item.status ", item.status);
    console.log("deliveryInfo.blockchain_status ", deliveryInfo.blockchain_status);
  }, []);

  // function addLocal() {
  //   notificationsStore.addNotification({
  //     id: Date.now(),
  //     TxTime: Date.now(),
  //     type: "success",
  //     message: "fdjgkdflgjkldfjgldfkgj asdasd fdjgkdflgj kldfjgldfkgj asdasdas asdasasd  asd",
  //   });
  // }

  return (
    <div
      className={clsx("exchange__row", { "exchange__row--collapse": rowCollapse[`row_${key}`] })}
      key={`row_${key}`}
    >
      <div className="exchange__cell">
        <div style={{ width: 30 }}>{item.tokenId}</div>
        <img src={item.winePool.image ?? ""} alt="wine" />
        <div className="exchange__cell--name-wrap exchange__cell--bold">
          <div className="exchange__cell--name">{item.winePool.wineParams.WineName}</div>
          <div className="exchange__cell--info">
            <span>{item.winePool.wineParams.WineProductionYear}</span>
            <span>{item.winePool.wineParams.WineBottleVolume}</span>
            <span>{item.winePool.wineParams.WineProductionCountry}</span>
          </div>
        </div>
        <div className="exchange__cell-arrow" onClick={() => handleRowCollapse(`row_${key}`)} />
      </div>
      <div className="exchange__cell--mobile">
        <div className="exchange__cell exchange__cell--minted">
          <div>
            {capitalize(
              deliveryInfo.blockchain_status === "WaitingForPayment"
                ? "pending"
                : deliveryInfo.blockchain_status === "DeliveryInProcess"
                ? "received"
                : deliveryInfo.blockchain_status === "Executed"
                ? "delivered"
                : "",
            )}
          </div>
        </div>
        <div className="exchange__cell exchange__cell">
          {item.isInner ? <CreditCard /> : <Chain />}
        </div>
        <div className="exchange__cell exchange__cell--bold">$ {+item.price}</div>
        <div className="exchange__cell">{new Date(item.date_at * 1000).toLocaleDateString()}</div>
      </div>
      <div className="exchange__cell--mobile">{renderRowButtons()}</div>
      <div className="exchange__cell exchange__cell--minted d-none d-md-flex">
        <div>
          {capitalize(
            deliveryInfo.blockchain_status === "WaitingForPayment"
              ? "pending"
              : deliveryInfo.blockchain_status === "DeliveryInProcess"
              ? "received"
              : deliveryInfo.blockchain_status === "Executed"
              ? "delivered"
              : "",
          )}
        </div>
      </div>
      <div className="exchange__cell exchange__cell d-none d-md-flex">
        {item.isInner ? <CreditCard /> : <Chain />}
      </div>
      <div className="exchange__cell exchange__cell--bold d-none d-md-flex">$ {+item.price}</div>
      {/* <BaseButton
        className="exchange__cell--pay"
        theme="contained"
        color="white"
        size="small"
        disabled={payBtnBlocked}
        loading={loading}
        click={addLocal}
      >
        asdasdasd
      </BaseButton> */}
      {renderRowButtons().map((buttonEl, index) => (
        <div
          key={`btn_${index}`}
          className="exchange__cell d-none d-md-flex justify-content-center"
        >
          {buttonEl}
        </div>
      ))}
      <div className="exchange__cell d-none d-md-flex justify-content-end">
        {new Date(item.date_at * 1000).toLocaleDateString()}
      </div>
    </div>
  );

  function renderRowButtons() {
    return [
      // item.status === "pending" && (
      deliveryInfo.blockchain_status === "WaitingForPayment" && !payBtnBlocked && (
        <BaseButton
          className="exchange__cell--pay"
          theme="contained"
          color="white"
          size="small"
          disabled={payBtnBlocked}
          loading={loading}
          click={item.isInner ? handlePayDeliveryWithCard : showPayNowModal}
        >
          Pay
        </BaseButton>
      ),
      <BaseButton
        className="exchange__cell--button"
        // disabled={
        //   !account ||
        //   pendingTx ||
        // }
        theme="outlined-red"
        color="black"
        size="small"
        click={() =>
          showDeliveryDetailModal({
            poolId: item.winePool.poolId ?? 0,
            tokenId: item.tokenId ?? 0,
            pools: pools,
            setPools: setPools,
          })
        }
      >
        Detail
      </BaseButton>,
    ];
  }
}

export default RenderRowExchange;
