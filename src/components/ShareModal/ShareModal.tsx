import React from "react";

import { CopyToClipboardField } from "components";
import { BaseButton, Modal } from "components/common";
import { useMediaQuery } from "hooks";
import { ReactComponent as TwitterIcon } from "assets/icons/twitter-outlined.svg";
import { ReactComponent as FacebookIcon } from "assets/icons/facebook-outlined.svg";
import { ReactComponent as TelegramIcon } from "assets/icons/telegram-outlined.svg";
import "./ShareModal.styles.scss";

interface ShareModalProps {
  onDismiss?: () => void;
  userNickname: string;
}

function ShareModal({ onDismiss, userNickname }: ShareModalProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const shareLink = `${window.location.origin}/user/${userNickname}/marketplace`;

  return (
    <Modal size="large" extraClassName="mx-3" onDismiss={onDismiss}>
      <div className="shareModal">
        <h4 className="shareModal__title">Share</h4>
        <div className="shareModal__row">
          <div className="shareModal__iconWrap">
            <span className="shareModal__label">Twitter</span>
            <TwitterIcon />
          </div>
          {!isMobile && <CopyToClipboardField text={shareLink} />}
          <BaseButton
            size="large"
            theme="outlined-red"
            color="black"
            className="shareModal__button"
            click={() => handleClickShare("https://twitter.com/intent/tweet?url=")}
          >
            Share
          </BaseButton>
        </div>
        <div className="shareModal__row">
          <div className="d-flex flex-column">
            <span className="shareModal__label">Facebook</span>
            <FacebookIcon />
          </div>
          {!isMobile && <CopyToClipboardField text={shareLink} />}
          <BaseButton
            size="large"
            theme="outlined-red"
            color="black"
            className="shareModal__button"
            click={() => handleClickShare("https://www.facebook.com/sharer.php?u=")}
          >
            Share
          </BaseButton>
        </div>
        <div className="shareModal__row">
          <div className="d-flex flex-column">
            <span className="shareModal__label">Telegram</span>
            <TelegramIcon />
          </div>
          {!isMobile && <CopyToClipboardField text={shareLink} />}
          <BaseButton
            size="large"
            theme="outlined-red"
            color="black"
            className="shareModal__button"
            click={() => handleClickShare("https://t.me/share/url?url=")}
          >
            Share
          </BaseButton>
        </div>
      </div>
    </Modal>
  );

  function handleClickShare(link: string) {
    onDismiss && onDismiss();
    window.open(link + shareLink, "_blank");
  }
}

export default ShareModal;
