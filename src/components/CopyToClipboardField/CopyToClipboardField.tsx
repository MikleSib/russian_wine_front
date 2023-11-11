import React, { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

import { ReactComponent as CheckIcon } from "assets/icons/check.svg";
import { ReactComponent as CopyIcon } from "assets/icons/copy.svg";
import "./CopyToClipboardField.styles.scss";

interface CopyToClipboardProps {
  text: string;
}

export default function CopyToClipboardField({ text }: CopyToClipboardProps) {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <div className="copyToClipboard">
      <input className="copyToClipboard__input" value={text} disabled />
      {renderCopyButton()}
    </div>
  );

  function renderCopyButton(): JSX.Element {
    return (
      <CopyToClipboard text={text} onCopy={onCopy}>
        <div className="cursor-pointer">{isCopied ? <CheckIcon /> : <CopyIcon />}</div>
      </CopyToClipboard>
    );
  }

  function onCopy(): void {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }
}
