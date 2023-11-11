import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { capitalize } from "utils";
import { useDelivery } from "hooks/resources/useDelivery";

import { ReactComponent as Chain } from "assets/icons/chain.svg";
import { ReactComponent as CreditCard } from "assets/icons/credit-card.svg";
import { BaseButton, Checkbox } from "components/common";
import {
  useApproveForDeliveryTask,
  useCheckApproveForDeliveryTask,
  useMediaQuery,
  useModal,
} from "hooks";
import { CHAIN_ID, useWineDeliveryServiceContract } from "utils/web3React";
import { DEFAULT_GAS_LIMIT, tokens } from "constants/index";
import { useWeb3React } from "@web3-react/core";
import { FeedbackModal } from "components";
import { FEEDBACK_MODAL_STATE } from "components/FeedbackModal/FeedbackModal";
import { notificationsStore } from "views";
import { observer } from "mobx-react-lite";

interface RenderRowProps {
  item: MarketWineRaw & { status: Purchase_Status };
  account: string | null | undefined;
  pendingTx: boolean;
  handleCancelOrder: (orderId: number) => Promise<void>;
  handleShowSellModal: (item: MarketWineRaw & { status: Purchase_Status }) => Promise<void>;
  showDeliveryModal: (dataProps?: Record<string, any> | undefined) => void;
  handleShowSendModal: (item: MarketWineRaw & { status: Purchase_Status }) => Promise<void>;
  handleClickViewPurchased: (isUserSale: boolean, productId: number, slug: string) => void;
  handleMarkExchange: (
    checked: boolean,
    bottle: {
      poolId: number;
      tokenId: number;
      winePoolAddress: string;
      isPurchasedWithCreditCard: boolean;
    },
  ) => void;
  classKey: number;
  key: number;
  selected: boolean;
}

function RenderRow({
  item,
  account,
  pendingTx,
  handleCancelOrder,
  handleShowSellModal,
  showDeliveryModal,
  handleShowSendModal,
  handleClickViewPurchased,
  handleMarkExchange,
  classKey,
  key,
  selected,
}: RenderRowProps) {
  const [rowCollapse, setRowCollapse] = useState<Hash<boolean>>({});
  const { chainId } = useWeb3React();
  const USDT = tokens.usdt.address[chainId ?? CHAIN_ID];
  const { checkApproveForDeliveryTask } = useCheckApproveForDeliveryTask(USDT);
  const { handleApproveForDeliveryTask } = useApproveForDeliveryTask(USDT);
  const wineDeliveryServiceContract = useWineDeliveryServiceContract();
  const [showSuccessModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.SUCCESS} />);
  const [showErrorModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.ERROR} />);
  // const {
  //   data: deliveryInfo,
  //   errorInfo,
  //   setErrorInfo,
  //   createNewDelivery,
  //   sendDeliveryTask,
  // } = useDelivery({
  //   poolId: item.winePool.poolId ?? 0,
  //   tokenId: item.tokenId ?? 0,
  // });
  const [loading, setLoading] = useState(false);
  const handleRowCollapse = (key: string): void => {
    setRowCollapse((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const isMobile = useMediaQuery("(max-width: 767px)");

  let TxHash = "";

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
          showSuccessModal();
        });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [wineDeliveryServiceContract, item, account]);

  // useEffect(() => {
  //   // console.log("item.status ", item.status);
  //   console.log("deliveryInfo.blockchain_status ", deliveryInfo.blockchain_status);
  // }, []);

  return (
    <div
      className={clsx("purchase__row", {
        "purchase__row--collapse": rowCollapse[`row_${classKey}`],
      })}
      key={classKey}
    >
      <div className="purchase__cell">
        <div style={{ width: 30 }}>{item.tokenId}</div>
        <img src={item.winePool.image ?? ""} alt="wine" />
        <div className="purchase__cell--name-wrap purchase__cell--bold">
          <div className="purchase__cell--name">{item.winePool.wineParams.WineName}</div>
          <div className="purchase__cell--info">
            <span>{item.winePool.wineParams.WineProductionYear}</span>
            <span>{item.winePool.wineParams.WineBottleVolume}</span>
            <span>{item.winePool.wineParams.WineProductionCountry}</span>
          </div>
        </div>
        <div
          className="purchase__cell-arrow"
          onClick={() => handleRowCollapse(`row_${classKey}`)}
        />
      </div>
      <div className="purchase__cell--mobile">
        <div className="purchase__cell purchase__cell--minted">
          <div>{capitalize(item.status)}</div>
        </div>
        <div className="purchase__cell purchase__cell">
          {item.isInner ? <CreditCard /> : <Chain />}
        </div>
        <div className="purchase__cell purchase__cell--bold">$ {+item.price}</div>
        <div className="purchase__cell">{new Date(item.date_at * 1000).toLocaleDateString()}</div>
      </div>
      <div className="purchase__cell--mobile">{renderRowButtons()}</div>
      <div className="purchase__cell purchase__cell--minted d-none d-md-flex">
        <div>{capitalize(item.status)}</div>
      </div>
      <div className="purchase__cell purchase__cell d-none d-md-flex">
        {item.isInner ? <CreditCard /> : <Chain />}
      </div>
      <div className="purchase__cell purchase__cell--bold d-none d-md-flex">$ {+item.price}</div>
      {renderRowButtons().map((buttonEl, index) => (
        <div
          key={`btn_${index}`}
          className="purchase__cell d-none d-md-flex justify-content-center"
        >
          {buttonEl}
        </div>
      ))}
      <div className="purchase__cell d-none d-md-flex justify-content-center">
        <Checkbox
          id={`${key}`}
          key={key}
          checked={selected}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            item.winePool.possibleDeliveryDate
              ? null
              : handleMarkExchange(event.target.checked, {
                  poolId: item.winePool.poolId ?? 0,
                  tokenId: item.tokenId ?? 0,
                  winePoolAddress: item.winePool.contractAddress,
                  isPurchasedWithCreditCard: item.isInner,
                })
          }
        />
      </div>
      <div className="purchase__cell d-none d-md-flex justify-content-end">
        {new Date(item.date_at * 1000).toLocaleDateString()}
      </div>
    </div>
  );

  function renderRowButtons() {
    const handleCheckPossibleDeliveryDate = (): boolean => {
      if (item.winePool.possibleDeliveryDate) {
        const now = Date.parse(new Date().toString());
        const possibleDeliveryDate = Date.parse(
          new Date(item.winePool.possibleDeliveryDate).toString(),
        );

        return now < possibleDeliveryDate;
      } else {
        return false;
      }
    };

    return [
      <BaseButton
        className="purchase__cell--sell"
        disabled={!account || pendingTx || item.isInner || item.status === "delivery"}
        theme="outlined"
        color="black"
        size="small"
        click={() => (item.orderId ? handleCancelOrder(item.orderId) : handleShowSellModal(item))}
      >
        {item.orderId ? "Cancel" : "Sell"}
      </BaseButton>,
      <BaseButton
        className="purchase__cell--sell"
        disabled={item.status === "on sale" || handleCheckPossibleDeliveryDate()}
        theme="outlined"
        color="black"
        size="small"
        click={() =>
          showDeliveryModal({
            poolId: item.winePool.poolId ?? 0,
            tokenId: item.tokenId ?? 0,
            winePoolAddress: item.winePool.contractAddress,
            isPurchasedWithCreditCard: item.isInner,
            possibleDeliveryDate: item.winePool.possibleDeliveryDate,
          })
        }
      >
        Exchange
      </BaseButton>,
      <BaseButton
        className="purchase__cell--button"
        disabled={pendingTx || !!item.orderId || item.status === "delivery"}
        theme="outlined-red"
        color="red"
        size="small"
        click={!item.orderId ? () => handleShowSendModal(item) : undefined}
      >
        Send
      </BaseButton>,
      <BaseButton
        color="red"
        theme="outlined-red"
        size="small"
        className="purchase__cell--button"
        click={() =>
          handleClickViewPurchased(
            item.orderId !== null,
            item.orderId ?? item.winePool.poolId,
            `${item.winePool?.wineParams.WineName.split(" ").join("-")}-${
              item.winePool?.wineParams.WineProductionYear
            }`,
          )
        }
      >
        View
      </BaseButton>,
      // !isMobile ? (
      //   <Checkbox
      //     id={`${key}`}
      //     key={key}
      //     onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
      //       handleMarkExchange(
      //         event.target.checked,
      //         // {
      //         //   poolId: item.winePool.poolId ?? 0,
      //         //   tokenId: item.tokenId ?? 0,
      //         //   winePoolAddress: item.winePool.contractAddress,
      //         //   isPurchasedWithCreditCard: item.isInner,
      //         // }
      //       )
      //     }
      //   />
      // ) : null,
    ];
  }
}

export default observer(RenderRow);
