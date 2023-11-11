import React, { FunctionComponent, SVGProps } from "react";
import clsx from "clsx";

type WalletCardProps = {
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  onConnect: () => void;
  title: string;
  active?: boolean;
  link?: string | null;
};
function WalletCard({ icon: Icon, onConnect, title, active, link }: WalletCardProps) {
  const content = (
    <div className={clsx("walletCard", { "walletCard--active": active })} onClick={onConnect}>
      <div className={clsx("walletCard__card", { "walletCard__card--active": active })}>
        <div className="walletCard__cardTitle">{title}</div>
        <Icon className="walletCard__cardIcon" />
      </div>
    </div>
  );

  if (link) {
    return (
      <a className="walletCard__link" href={link} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return content;
}

export default WalletCard;
