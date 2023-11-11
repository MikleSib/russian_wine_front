import React, { FC } from "react";
import clsx from "clsx";

import { capitalize } from "utils";
import { ReactComponent as CloseIcon } from "assets/icons/close.svg";
import styles from "./Modal.module.scss";

type ModalProps = {
  title?: string;
  extraClassName?: string | boolean;
  size?: "small" | "big" | "large";
  onDismiss?: () => void;
};

const Modal: FC<ModalProps> = ({ children, title, extraClassName, size = "small", onDismiss }) => (
  <div className={clsx(styles.wrapper, styles[`Is${capitalize(size)}`])}>
    <div className={clsx(styles.modal, extraClassName)}>
      {onDismiss && <CloseIcon className={styles.closeIcon} onClick={onDismiss} />}
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.content}>{children}</div>
    </div>
  </div>
);

export default Modal;
