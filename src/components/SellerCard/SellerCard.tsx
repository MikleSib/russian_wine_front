import React, { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import { ReactComponent as UserIcon } from "assets/icons/user.svg";
// import { ReactComponent as AnonIcon } from "assets/icons/anon.svg";
import "./SellerCard.styles.scss";
import { routes } from "../../utils/router";

type SellerCardProps = {
  img: string;
  name: string;
  nickname?: string;
  total?: string;
  isSmall?: boolean;
  isMine?: boolean;
  isKeepPrivate?: boolean;
};

function SellerCard({
  img,
  name,
  total,
  isSmall,
  nickname,
  isMine,
  isKeepPrivate,
}: SellerCardProps) {
  const navigate = useNavigate();

  const handleClickToGoUser = useCallback(() => {
    navigate(isMine ? routes.sellerMarketPlace.path : `/user/${nickname}/marketplace`);
  }, [nickname, isMine]);

  return (
    <div className="seller-card">
      {img ? (
        <img
          className={clsx("seller-card__avatar", {
            "seller-card__avatar--small": isSmall,
          })}
          src={img}
          alt="user"
        />
      ) : (
        <div
          className={clsx("seller-card__avatar seller-card__avatar--empty", {
            "seller-card__avatar--small": isSmall,
          })}
        >
          <UserIcon />
        </div>
      )}
      <div className="d-flex flex-column justify-content-center">
        <span
          className={clsx("seller-card__name", { "seller-card__name--hover": !isSmall })}
          onClick={isSmall ? undefined : handleClickToGoUser}
        >
          {name}
          {/* {isKeepPrivate && <AnonIcon />} */}
        </span>
        {total && <span className="seller-card__total">$ {total}</span>}
      </div>
    </div>
  );
}

export default memo(SellerCard);
