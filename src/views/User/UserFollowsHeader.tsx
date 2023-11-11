import React from "react";

import { BaseLink } from "components/common";
import "./UserFollowsHeader.styles.scss";

interface UserFollowsProps {
  imageSrc: string;
  name: string;
  nickname: string;
}

function UserFollowsHeader({ imageSrc, name, nickname }: UserFollowsProps) {
  return (
    <div className="userFollows__header">
      <div className="userFollows__header-top">
        <div className="container d-flex align-items-center">
          <div className="userFollows__header-ava">
            <img className="userFollows__header-img" src={imageSrc} alt="user" />
          </div>
          <h3 className="userFollows__name">{name}</h3>
        </div>
      </div>
      <div className="userFollows__nav">
        <BaseLink className="userFollows__link" path={`/user/${nickname}/marketplace`}>
          Marketplace
        </BaseLink>
        <BaseLink className="userFollows__link" path={`/user/${nickname}/followers`}>
          Followers
        </BaseLink>
        <BaseLink className="userFollows__link" path={`/user/${nickname}/following`}>
          Following
        </BaseLink>
      </div>
    </div>
  );
}

export default UserFollowsHeader;
