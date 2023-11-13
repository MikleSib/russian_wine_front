import React, { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useWeb3React } from "@web3-react/core";

import { FeedbackModal, WalletProviderModal } from "components";
import { FEEDBACK_MODAL_STATE } from "components/FeedbackModal/FeedbackModal";
import { BaseButton, BaseInput, Modal, ReactSelect } from "components/common";
import { DEFAULT_GAS_LIMIT, tokens } from "constants/index";
import { useRootStore } from "context/RootStoreProvider";
import {
  useApproveForAll,
  useCheckApproveForAllStatus,
  useCheckOwnerToken,
  useModal,
  useCheckApproveForDeliveryTask,
  useApproveForDeliveryTask,
  useCheckApprovalStatus,
  useApprove,
} from "hooks";

import { useDelivery } from "hooks/resources/useDelivery";
import { CHAIN_ID, useWineDeliveryServiceContract } from "utils/web3React";
import { DeliveryModalButtons } from "./DeliveryModalButtons";
import "./DeliveryModal.styles.scss";
import { StripePaymentApi } from "services/goPayPayment/goPayPaymentApi";
import { processForm } from "utils";
import { notificationsStore } from "views";
import { DeliveryServiceApi } from "services/deliveryService/deliveryServiceApi";
import { BooleanLiteral } from "typescript";
import clsx from "clsx";
import currencyStore from "stores/CurrencyStore";
import ReactGA from "react-ga4";

interface DeliveryModalProps {
  onDismiss?: () => void;
  countries: Country[];
  pools: (MarketWineRaw & {
    status: Purchase_Status;
  })[];
  setPools: (qwe: any) => void;
  dataProps?: {
    poolId: number;
    tokenId: number;
    winePoolAddress: string;
    isPurchasedWithCreditCard: boolean;
  };
}

function DeliveryModal({ onDismiss, countries, pools, setPools, dataProps }: DeliveryModalProps) {
  const {
    authStore: { deliveryForm, selfInformation },
  } = useRootStore();
  const [showSuccessModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.SUCCESS} />);
  const [showErrorModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.ERROR} />);
  // const [poolId, setPoolId] = useState(dataProps?.poolId ?? 0);
  // const [tokenId, setTokenId] = useState(dataProps?.tokenId ?? 0);

  const {
    data: deliveryInfo324324324,
    errorInfo,
    createNewDelivery,
    sendDeliveryTask,
  } = useDelivery({
    poolIds: [dataProps?.poolId ?? 0],
    tokenIds: [dataProps?.tokenId ?? 0],
  });

  const [showDeliveryPrice, setShowDeliveryPrice] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(deliveryInfo324324324);

  const { account, chainId } = useWeb3React();
  const wineDeliveryServiceContract = useWineDeliveryServiceContract();
  const { checkApprovalStatus } = useCheckApproveForAllStatus(true);
  const { handleApproveForAll } = useApproveForAll(true);
  const { checkOwnerOfToken } = useCheckOwnerToken();
  const USDT = tokens.usdt.address[chainId ?? CHAIN_ID];
  const { checkApproveForDeliveryTask } = useCheckApproveForDeliveryTask(USDT);
  const { handleApproveForDeliveryTask } = useApproveForDeliveryTask(USDT);

  const [loading, setLoading] = useState(false);

  const [insuranceAndStoragePrice, setInsuranceAndStoragePrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  const rootStore = useRootStore();
  const [showWalletProviderModal] = useModal(<WalletProviderModal />);
  const { isApproved, setLastUpdated } = useCheckApprovalStatus(USDT, 3);
  const { handleApprove, requestedApproval } = useApprove(USDT, setLastUpdated);
  const [isLoadingPayment, setLoadingPayment] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [formChanged, setFormChanged] = useState(false);
  const [isFirstEnter, setIsFirstEnter] = useState(true);
  const [blockNftConfirmed, setBlockNftConfirmed] = useState(false);

  const disabledFields =
    "blockchain_status" in deliveryInfo && deliveryInfo.blockchain_status !== null;

  // useEffect(() => {
  //   console.log(dataProps?.deliveryInfo);
  //   setDeliveryInfo(dataProps?.deliveryInfo as DeliveryResponse);
  // }, [dataProps?.deliveryInfo]);

  useEffect(() => {
    // calculate values for delivery
    console.log("dataProps?.poolId", dataProps?.poolId);
    console.log("dataProps?.tokenId", dataProps?.tokenId);
    console.log("calc");
    setInsuranceAndStoragePrice(
      (
        Math.ceil(
          (parseFloat(deliveryInfo.storagePrice) / Math.pow(10, 18) > 0.1
            ? parseFloat(deliveryInfo.storagePrice) / Math.pow(10, 18)
            : 0.1) * 100,
        ) / 100
      ).toFixed(2),
    );

    const result = (
      parseFloat(deliveryInfo.delivery_price) +
      (dataProps?.isPurchasedWithCreditCard ? 3 : 0) +
      Number(
        (
          Math.ceil(
            (parseFloat(deliveryInfo.storagePrice) / Math.pow(10, 18) > 0.1
              ? parseFloat(deliveryInfo.storagePrice) / Math.pow(10, 18)
              : 0.1) * 100,
          ) / 100
        ).toFixed(2),
      ) +
      3
    ).toString();
    setTotalPrice(result.substring(0, result.toString().indexOf(".") + 3));
  }, [deliveryInfo]);

  useEffect(() => {
    console.log("deliveryForm.setData first_name: selfInformation.firstName");
    deliveryForm.setData({
      first_name: selfInformation.firstName ?? "",
      last_name: selfInformation.lastName ?? "",
      email: selfInformation.email,
      nickname: selfInformation.nickname ?? "",
    });

    setShowDeliveryPrice(false);

    ReactGA.event("begin_checkout");

    return () => deliveryForm.resetForm({ clearFields: true });
  }, []);

  useEffect(() => {
    console.log("deliveryForm.setData phone_code: ");

    if (Object.keys(deliveryInfo).length) {
      deliveryForm.setData({
        phone_code: "",
      });
    }
  }, [deliveryInfo]);

  // const [deliveryCostInfo, setDeliveryCostInfo] = useState<React.ReactNode>(null);

  // useEffect(() => {
  //   console.log("errorInfo changed:", errorInfo);

  //   if (!errorInfo) {
  //     setDeliveryCostInfo(renderDeliveryCostInfo());
  //   } else {
  //     console.error("error errorInfo", errorInfo);
  //     setDeliveryInfo({} as DeliveryResponse);
  //   }
  // }, [errorInfo, deliveryInfo]);

  // async function getDeliveryInfo() {
  //   const data = await DeliveryServiceApi.getDeliveryInformation({
  //     body: { poolId: dataProps?.poolId as number, tokenId: dataProps?.tokenId as number },
  //   });

  //   setDeliveryInfo(
  //     data.response && !Array.isArray(data.response) ? data.response : ({} as DeliveryResponse),
  //   );

  //   setShowDeliveryPrice(true);
  //   console.log("deliveryInfo okey", deliveryInfo);
  // }

  const onSubmitForm = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      console.log("onSubmitForm");
      event.preventDefault();

      setFormChanged(false);
      setIsFirstEnter(false);
      setShowDeliveryPrice(false);

      await deliveryForm.submit({
        payload: { createNewDelivery: createNewDelivery },
      });

      ReactGA.event("add_shipping_info");

      // if ok do request for show data
      const data = await DeliveryServiceApi.getDeliveryInformation({
        body: {
          poolIds: [dataProps?.poolId] as number[],
          tokenIds: [dataProps?.tokenId] as number[],
        },
      });

      if (data.response?.length && !Array.isArray(data.response[0])) {
        console.log(data.response);
        setDeliveryInfo(data.response[0]);
        setShowDeliveryPrice(true);
      } else {
        setFormChanged(true);
        setIsFirstEnter(true);
      }
    },
    [dataProps, createNewDelivery, setShowDeliveryPrice],
  );

  const countryOptions = useMemo(() => {
    return countries.map(({ name, code2 }) => ({
      value: code2,
      label: (
        <div className="d-flex align-items-center">
          <img
            className="mr-2"
            loading="lazy"
            width="20"
            src={`https://flagcdn.com/w20/${code2.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w40/${code2.toLowerCase()}.png 2x`}
            alt=""
          />
          <span>{name}</span>
        </div>
      ),
      search: name,
    }));
  }, [countries]);

  // const countryCodeOptions = useMemo(() => {
  //   const foundCountry = countries.find(
  //     ({ code2 }) => deliveryForm.getField("country_code") === code2,
  //   );

  //   if (!foundCountry) {
  //     return [];
  //   }

  //   return foundCountry.phoneCode.split(",").map((code) => ({
  //     value: `+${code.trim()}`,
  //     label: `+${code.trim()}`,
  //   }));
  // }, [countries, deliveryForm.getField("country_code")]);

  function updatePools() {
    const newPools = pools.filter(
      (item) =>
        !(item.winePool.poolId === dataProps?.poolId && item.tokenId === dataProps?.tokenId),
    );
    setPools(newPools.map((item) => item));
  }

  const handleBlockNFT = async () => {
    if (!account) {
      showWalletProviderModal();
      return;
    }

    if (!isApproved) {
      handleApprove();
    } else {
      await onSendDeliveryTask();
    }
  };

  const onSendDeliveryTask = useCallback(async () => {
    setLoading(true);

    try {
      const tokenOwner = await checkOwnerOfToken(
        dataProps?.winePoolAddress ?? "",
        dataProps?.tokenId ?? 0,
      );
      if (tokenOwner !== account) {
        setLoading(false);
        showErrorModal({
          title: `Your account in wallet is not owner of token\nPlease, check address - ${tokenOwner}`,
        });
        return;
      }

      const isApproved = await checkApprovalStatus(dataProps?.winePoolAddress ?? "");
      if (!isApproved) {
        await handleApproveForAll(dataProps?.winePoolAddress ?? "");
      }

      await sendDeliveryTask({
        poolId: dataProps?.poolId ?? 0,
        tokenId: dataProps?.tokenId ?? 0,
        blockchain_delivery_data: deliveryInfo.blockchain_delivery_data,
      });

      setLoading(false);
      setBlockNftConfirmed(true);
      updatePools();
      // showSuccessModal();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [sendDeliveryTask, dataProps, deliveryInfo.blockchain_delivery_data]);

  const onCancelDeliveryTask = useCallback(async () => {
    setLoading(true);

    try {
      await wineDeliveryServiceContract.methods
        .cancelDeliveryTask(dataProps?.poolId, dataProps?.tokenId, "")
        .send({ from: account })
        .on("receipt", () => {
          setLoading(false);
          showSuccessModal();
        });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [wineDeliveryServiceContract, dataProps]);

  const onPayDeliveryPrice = useCallback(async () => {
    setLoading(true);

    try {
      // TODO showLastDeliveryTask really need?
      const isApproved = await checkApproveForDeliveryTask();
      if (!isApproved) {
        await handleApproveForDeliveryTask();
      }

      await wineDeliveryServiceContract.methods
        .payDeliveryTaskAmount(dataProps?.poolId, dataProps?.tokenId)
        .send({ from: account, gas: DEFAULT_GAS_LIMIT })
        .on("transactionHash", (transactionHash: string) => setTxHash(transactionHash))
        .on("receipt", () => {
          notificationsStore.addNotification({
            id: Date.now(),
            TxTime: Date.now(),
            type: "success",
            message: "Your NFT exchange order has been successfully created",
            TxLink: txHash,
          });

          setLoading(false);
          showSuccessModal();
        });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [wineDeliveryServiceContract, dataProps, account]);

  return (
    <Modal size="large" onDismiss={onDismiss}>
      <div className="delivery__content">
        <h4 className="delivery__title">
          Отправить по почте
          {renderDeliveryStatus()}
        </h4>
        <form autoComplete="off" noValidate onSubmit={onSubmitForm}>
          <div className="d-lg-flex justify-content-between mb-lg-3">
            <ReactSelect
              className="delivery__field"
              autocomplete
              name="country_code"
              label="Страна"
              placeholder="Select your country"
              formKey="deliveryForm"
              storeKey="authStore"
              options={countryOptions}
              disabled={disabledFields}
              onFieldChange={() => setFormChanged(true)}
            />
            <div className="d-flex justify-content-between delivery__field w-100">
              {/* <ReactSelect
                className="delivery__phone-code"
                name="phone_code"
                label="Country Code"
                placeholder=""
                formKey="deliveryForm"
                storeKey="authStore"
                options={countryCodeOptions}
                disabled={!deliveryForm.getField("country_code") || disabledFields}
              /> */}
              <span className="delivery__plus-sign">+</span>
              <BaseInput
                name="phone_number"
                label="Номер телефона"
                formKey="deliveryForm"
                storeKey="authStore"
                type="number"
                disabled={disabledFields}
                onFieldChange={() => setFormChanged(true)}
              />
            </div>
          </div>
          <div className="d-lg-flex justify-content-between mb-lg-3">
            <BaseInput
              className="delivery__field"
              name="first_name"
              label="Имя"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled={disabledFields}
              noTrim
              onFieldChange={() => setFormChanged(true)}
            />
            <BaseInput
              className="delivery__field"
              name="last_name"
              label="Фамилия"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled={disabledFields}
              noTrim
              onFieldChange={() => setFormChanged(true)}
            />
          </div>
          <div className="d-lg-flex justify-content-between mb-lg-3">
            <BaseInput
              className="delivery__field"
              name="street_address"
              label="Улица"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled={disabledFields}
              noTrim
              onFieldChange={() => setFormChanged(true)}
            />
            <BaseInput
              className="delivery__field"
              name="street_address2"
              label="Улица 2 (опционально)"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled={disabledFields}
              noTrim
              onFieldChange={() => setFormChanged(true)}
            />
          </div>
          <div className="d-lg-flex justify-content-between mb-lg-3">
            <BaseInput
              className="delivery__field is-small"
              name="city"
              label="Город"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled={disabledFields}
              noTrim
              onFieldChange={() => setFormChanged(true)}
            />
            <BaseInput
              className="delivery__field is-small"
              name="region"
              label="Область / Регион"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled={disabledFields}
              noTrim
              onFieldChange={() => setFormChanged(true)}
            />
            <BaseInput
              className="delivery__field is-small"
              name="zip_code"
              label="ZIP код"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled={disabledFields}
              onFieldChange={() => setFormChanged(true)}
            />
          </div>
          <div className="d-lg-flex justify-content-between mb-lg-3">
            <BaseInput
              className="delivery__field"
              name="email"
              label="Почта"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled
              onFieldChange={() => setFormChanged(true)}
            />
            <BaseInput
              className="delivery__field"
              name="nickname"
              label="Никнейм"
              formKey="deliveryForm"
              storeKey="authStore"
              // disabled={disabledFields}
              disabled
              onFieldChange={() => setFormChanged(true)}
            />
          </div>
          <BaseButton
            type="submit"
            size="large"
            theme="outlined-red"
            color="red"
            loading={deliveryForm.loading}
            className="mx-auto mb-3"
            disabled={loading || !formChanged}
          >
            {isFirstEnter ? "Расчитать" : "Перерасчитать"}
          </BaseButton>
          {/* <BaseButton
            size="large"
            theme="outlined-red"
            color="red"
            className="mx-auto mb-3"
            click={updatePools}
          >
            asdasdad
          </BaseButton> */}

          {renderDeliveryCostInfo()}
          {/* {deliveryCostInfo} */}
          <DeliveryModalButtons
            status={deliveryInfo.blockchain_status}
            loading={loading}
            submitFormLoading={deliveryForm.loading}
            sendDeliveryTask={onSendDeliveryTask}
            cancelDeliveryTask={onCancelDeliveryTask}
            payDeliveryPrice={onPayDeliveryPrice}
            poolId={dataProps?.poolId ?? 0}
            tokenId={dataProps?.tokenId ?? 0}
            currency={currencyStore.currency}
            purchasedWithCreditCard={dataProps?.isPurchasedWithCreditCard}
            // deliveryTotalPrice={parseFloat(deliveryInfo.delivery_price) + 3}
            account={account}
            showDeliveryPrice={showDeliveryPrice}
            blockNftConfirmed={blockNftConfirmed}
            formChanged={formChanged}
          />
        </form>
      </div>
    </Modal>
  );

  function renderDeliveryCostInfo() {
    if (showDeliveryPrice) {
      if (
        deliveryInfo &&
        Object.keys(deliveryInfo).length !== 0 &&
        !isNaN(Number(deliveryInfo.delivery_price))
      ) {
        return (
          <div className="mb-2">
            <h4 className="delivery__title--delivery-price">Сумма доставки</h4>

            <div
              className={clsx("delivery__row d-block", {
                "delivery__row--border-bottom": dataProps?.isPurchasedWithCreditCard,
              })}
            >
              <div className="delivery__row--price-title">Блокировать NFT</div>
              <div className="delivery__row--info d-flex mb-0">
                <p>
                  Сумма, необходимая для блокировки вашего NFT. Таким образом, смарт-контракт может заблокировать ваш NFT
                  во время доставки и уничтожьте его после успешного получения посылки
                </p>
                <span>$3</span>
              </div>
            </div>
            {!dataProps?.isPurchasedWithCreditCard && (
              <BaseButton
                className="mx-auto mt-2"
                theme="outlined-red"
                color="red"
                click={handleBlockNFT}
                loading={loading || isLoadingPayment}
                disabled={formChanged || blockNftConfirmed}
              >
                Блокировать NFT
              </BaseButton>
            )}
            <div className="delivery__row delivery__row--border-bottom d-block">
              <div className="delivery__row--price-title">Цена доставки</div>
              <div className="delivery__row--info d-flex mb-0">
                <p>Сумма доставки</p>
                <span>₽{parseFloat(deliveryInfo.delivery_price)}</span>
              </div>
            </div>
            <div className="delivery__row delivery__row--border-bottom d-block">
              <div className="delivery__row--price-title">Налоги и пошлины</div>
              <div className="delivery__row--info d-flex mb-0">
                <p>
                  Ориентировочная цена, которую вы должны оплатить по прибытии вашей посылки в соответствии с
                  законодательством страны доставки
                </p>

                <span>${parseFloat(deliveryInfo.tax)}</span>
              </div>
            </div>
            <div className="delivery__row delivery__row--border-bottom d-block">
              <div className="delivery__row--price-title">Страхование и хранение</div>
              <div className="delivery__row--info d-flex mb-0">
                <p>Расходы по хранению и страхованию бутылки на период владения</p>
                <span>${insuranceAndStoragePrice}</span>
              </div>
            </div>
            <div className="delivery__row delivery__row--border-bottom d-block">
              <div className="delivery__row--price-title">Упаковка</div>
              <div className="delivery__row--info d-flex mb-0">
                <p>Служба упаковки</p>
                <span>300 Рублей</span>
              </div>
            </div>
            <div className="delivery__row d-block">
              <div className="delivery__row--price-title">Total</div>
              <div className="delivery__row--info d-flex mb-0">
                <p>При оплате с помощью Metamask необходимо будет произвести два платежа</p>
                <span>₽{totalPrice}</span>
              </div>
            </div>
          </div>
        );
      } else {
        // showErrorModal({
        //   title: `Something went wrong\nPlease, check delivery data`,
        // });
        setFormChanged(true);
        return (
          <div>
            <p className="delivery__cost-info text-center">
              Что-то пошло не так. Пожалуйста, проверьте данные о доставке или повторите попытку расчета
            </p>
          </div>
        );
      }
    }
  }

  function renderDeliveryStatus() {
    if (deliveryInfo.blockchain_status) {
      return (
        <div className="delivery__status">
          Статус доставки:
          <span>{deliveryInfo.blockchain_status}</span>
        </div>
      );
    }
  }
}

export default observer(DeliveryModal);
