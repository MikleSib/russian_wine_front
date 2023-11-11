import { ReactNode, useCallback, useContext } from "react";

import { Context } from "context/ModalContext/ModalProvider";

const useModal = (
  modal: ReactNode,
  withDismiss = true,
): [(dataProps?: Record<string, any>) => void, () => void] => {
  const { onDismiss, onPresent } = useContext(Context);

  const handlePresent = useCallback(
    (dataProps?: Record<string, any>) => {
      onPresent(modal, dataProps, withDismiss);
    },
    [modal, onPresent, withDismiss],
  );

  return [handlePresent, onDismiss];
};

export default useModal;
