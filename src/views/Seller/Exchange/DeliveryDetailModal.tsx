import React, { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";

import { BaseButton, BaseInput, BaseLink, Modal, ReactSelect } from "components/common";
import { useRootStore } from "context/RootStoreProvider";

import { useDelivery } from "hooks/resources/useDelivery";
import "./DeliveryDetailModal.styles.scss";
import { capitalize } from "utils";
import { useWineDeliveryServiceContract } from "utils/web3React";
import { useWeb3React } from "@web3-react/core";
import { FeedbackModal } from "components";
import { FEEDBACK_MODAL_STATE } from "components/FeedbackModal/FeedbackModal";
import { useModal } from "hooks";

interface DeliveryModalProps {
  onDismiss?: () => void;
  countries?: Country[];
  dataProps?: {
    poolId: number;
    tokenId: number;
    pools: (MarketWineRaw & {
      status: Purchase_Status;
    })[];
    setPools: (qwe: any) => void;
  };
}

function DeliveryDetailModal({ onDismiss, countries, dataProps }: DeliveryModalProps) {
  const {
    authStore: { deliveryForm, selfInformation },
  } = useRootStore();
  const { data: deliveryInfo } = useDelivery({
    poolIds: [dataProps?.poolId ?? 0],
    tokenIds: [dataProps?.tokenId ?? 0],
  });

  const { account } = useWeb3React();
  const wineDeliveryServiceContract = useWineDeliveryServiceContract();

  const [showSuccessModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.SUCCESS} />);

  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    deliveryForm.setData({
      first_name: selfInformation.firstName ?? "",
      last_name: selfInformation.lastName ?? "",
      email: selfInformation.email,
      nickname: selfInformation.nickname ?? "",
    });

    return () => deliveryForm.resetForm({ clearFields: true });
  }, []);

  useEffect(() => {
    console.log("deliveryInfo detail", deliveryInfo);
    console.log("dataProps detail", dataProps?.poolId, dataProps?.tokenId);
    if (Object.keys(deliveryInfo).length) {
      deliveryForm.setData({
        country_code: deliveryInfo.country ?? "",
        phone_code: "",
        phone_number: deliveryInfo.phone_number ?? "",
        first_name: deliveryInfo.first_name ?? "",
        last_name: deliveryInfo.last_name ?? "",
        street_address: deliveryInfo.street_address ?? "",
        street_address2: deliveryInfo.street_address2 ?? "",
        city: deliveryInfo.city ?? "",
        region: deliveryInfo.region ?? "",
        zip_code: deliveryInfo.zip_code ?? "",
      });
    }
    setTrackingNumber(deliveryInfo.track_code);
  }, [deliveryInfo]);

  // const onSubmitForm = useCallback(
  //   async (event: React.FormEvent<HTMLFormElement>) => {
  //     event.preventDefault();

  //     await deliveryForm.submit({
  //       payload: { createNewDelivery },
  //     });
  //   },
  //   [dataProps, createNewDelivery],
  // );

  function updatePools() {
    const newPools = dataProps?.pools.filter(
      (item) =>
        !(item.winePool.poolId === dataProps?.poolId && item.tokenId === dataProps?.tokenId),
    );
    dataProps?.setPools(newPools?.map((item) => item));
  }

  const onCancelDeliveryTask = useCallback(async () => {
    setLoading(true);

    try {
      await wineDeliveryServiceContract.methods
        .cancelDeliveryTask(dataProps?.poolId, dataProps?.tokenId, "")
        .send({ from: account })
        .on("receipt", () => {
          setLoading(false);
          updatePools();
          showSuccessModal();
        });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [wineDeliveryServiceContract, dataProps?.poolId, dataProps?.tokenId]);

  const countryOptions = useMemo(() => {
    return countries?.map(({ name, code2 }) => ({
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

  // TODO: depending on the delivery service change the link to the correct track number
  return (
    <Modal size="large" onDismiss={onDismiss}>
      <div className="delivery-detail__content">
        <h4 className="delivery-detail__title">
          Order # {deliveryInfo.ve_shipment_id} {renderDeliveryStatus()}
        </h4>
        <p className="delivery-detail__status-description">
          {deliveryInfo.blockchain_status === "WaitingForPayment"
            ? "You have blocked your NFT, to complete your delivery, please pay the required fees"
            : deliveryInfo.blockchain_status === "DeliveryInProcess"
            ? "Your shipping request is being processed, the tracking number for your shipment will soon be available"
            : deliveryInfo.blockchain_status === "Executed"
            ? "Your shipment has been delivered"
            : ""}
        </p>
        {trackingNumber && (
          <p>
            Tracking number:{" "}
            <BaseLink
              className="delivery-detail__link"
              path={`https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`}
              external
            >
              {trackingNumber}
            </BaseLink>
          </p>
        )}
        <h4 className="delivery-detail__title">Personal</h4>
        <form autoComplete="off" noValidate>
          <div className="d-lg-flex justify-content-between mb-lg-3">
            <ReactSelect
              className="delivery-detail__field"
              autocomplete
              name="country_code"
              label="Country"
              placeholder="Select your country"
              formKey="deliveryForm"
              storeKey="authStore"
              options={countryOptions ?? []}
              disabled
            />
            <div className="d-flex justify-content-between delivery-detail__field w-100">
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
              <BaseInput
                name="phone_number"
                label="Phone number"
                formKey="deliveryForm"
                storeKey="authStore"
                type="number"
                disabled
              />
            </div>
          </div>
          <div className="d-lg-flex justify-content-between mb-lg-3">
            <BaseInput
              className="delivery-detail__field"
              name="first_name"
              label="First name"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled
              noTrim
            />
            <BaseInput
              className="delivery-detail__field"
              name="last_name"
              label="Last name"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled
              noTrim
            />
          </div>
          <div className="d-lg-flex justify-content-between mb-lg-3">
            <BaseInput
              className="delivery-detail__field"
              name="street_address"
              label="Street address"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled
              noTrim
            />
            <BaseInput
              className="delivery-detail__field"
              name="street_address2"
              label="Street address 2 (optional)"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled
              noTrim
            />
          </div>
          <div className="d-lg-flex justify-content-between mb-lg-3">
            <BaseInput
              className="delivery-detail__field is-small"
              name="city"
              label="City"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled
              noTrim
            />
            <BaseInput
              className="delivery-detail__field is-small"
              name="region"
              label="State / Province / Region"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled
              noTrim
            />
            <BaseInput
              className="delivery-detail__field is-small"
              name="zip_code"
              label="ZIP code"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled
            />
          </div>
          <div className="d-lg-flex justify-content-between mb-lg-3">
            <BaseInput
              className="delivery-detail__field"
              name="email"
              label="E-mail"
              formKey="deliveryForm"
              storeKey="authStore"
              disabled
            />
            <BaseInput
              className="delivery-detail__field"
              name="nickname"
              label="Nickname"
              formKey="deliveryForm"
              storeKey="authStore"
              // disabled={disabledFields}
              disabled
            />
          </div>
          {/* <BaseButton
            size="large"
            theme="outlined-red"
            color="red"
            className="mx-auto mb-3"
            click={updatePools}
          >
            asdasdad
          </BaseButton> */}

          {/* <BaseButton
            type="submit"
            size="large"
            theme="outlined-red"
            color="red"
            loading={deliveryForm.loading}
            className="mx-auto"
            disabled={loading || !formChanged}
          >
            {isFirstEnter ? "Calculate" : "Recalculate"}
          </BaseButton> */}
        </form>
      </div>
    </Modal>
  );

  function renderDeliveryStatus() {
    if (deliveryInfo.blockchain_status) {
      return (
        <div className="delivery-detail__status">
          <span>
            {capitalize(
              deliveryInfo.blockchain_status === "WaitingForPayment"
                ? "pending"
                : deliveryInfo.blockchain_status === "DeliveryInProcess"
                ? "received"
                : deliveryInfo.blockchain_status === "Executed"
                ? "delivered"
                : "",
            )}
          </span>
          {deliveryInfo.blockchain_status === "WaitingForPayment" && (
            <BaseButton
              size="large"
              theme="outlined-red"
              color="red"
              className="delivery-detail__cancel-button"
              click={onCancelDeliveryTask}
              disabled={!account}
              loading={loading}
            >
              {account ? "Cancel" : "You need connect wallet for cancel order"}
            </BaseButton>
          )}
        </div>
      );
    }
  }
}

export default observer(DeliveryDetailModal);
