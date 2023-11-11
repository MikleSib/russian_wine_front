import React, { useCallback, useEffect, useState } from "react";
import SumsubWebSdk from "@sumsub/websdk-react";

import { Modal } from "components/common";
import { AuthService } from "stores/Auth/auth.service";
import ReactGA from "react-ga4";
import { generateUserId } from "utils";

interface SumsubWebSdkModalProps {
  onDismiss?: () => void;
  isKycApproved?: boolean;
  onGetKycStatusAction: () => Promise<void>;
}

function SumsubWebSdkModal({
  onDismiss,
  isKycApproved,
  onGetKycStatusAction,
}: SumsubWebSdkModalProps) {
  const [accessToken, setAccessToken] = useState("");

  const config = {
    lang: "en",
  };

  const handleGetAccessToken = useCallback(async () => {
    try {
      const { response, errors } = await AuthService.getSumSubToken();
      if (response && !errors) {
        setAccessToken(response?.[0] ?? "");
      }

      ReactGA.event({
        category: "Custom",
        action: "verified_success",
        label: "verification success",
        value: generateUserId(),
      });
    } catch (e) {
      console.error(e);

      ReactGA.event({
        category: "Custom",
        action: "verified_failure",
        label: "verification failure",
        value: generateUserId(),
      });
    }
  }, []);

  const onMessageHandler = useCallback(
    async (type: string, payload) => {
      if (type.includes("onApplicantSubmitted")) {
        setTimeout(async () => {
          await onGetKycStatusAction();
          onDismiss && onDismiss();
        }, 2000);
      }
    },
    [onGetKycStatusAction, onDismiss],
  );

  useEffect(() => {
    handleGetAccessToken();
  }, []);

  useEffect(() => {
    if (isKycApproved) {
      onDismiss && onDismiss();
    }
  }, [isKycApproved]);

  if (!accessToken) {
    return null;
  }

  return (
    <Modal size="large" onDismiss={onDismiss} extraClassName="kyc__iframe">
      <SumsubWebSdk
        accessToken={accessToken}
        expirationHandler={handleGetAccessToken}
        config={config}
        options={{ addViewportTag: false, adaptIframeHeight: true }}
        onMessage={onMessageHandler}
        onError={(data: unknown) => console.error(data)}
        className="kyc__iframe-wrapper"
      />
    </Modal>
  );
}

export default SumsubWebSdkModal;
