import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { BaseSearch, Pagination } from "components/common";
import { PageMeta, SkeletonLoading } from "components";
import { useMediaQuery, usePagination } from "hooks";
import { useUserFollowersList } from "hooks/resources/useUserFollowersList";
import { INITIAL_CARDS_PER_PAGE, INITIAL_PAGE, TYPE_OPTIONS } from "constants/index";
import { useRootStore } from "context/RootStoreProvider";
import { FollowersTopFilters } from "views/Profile/Followers/FollowersTopFilters";
import "views/Profile/Followers/Followers.styles.scss";
import { routes } from "utils/router";
import UserFollowsHeader from "../UserFollowsHeader";
import noImageIconSrc from "assets/images/no-image.png";

function UserFollowers() {
  const { nickname = "" } = useParams<{ nickname: string }>();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<TYPE_OPTIONS>(TYPE_OPTIONS.ALL);
  const [page, setPage] = useState(INITIAL_PAGE);

  const {
    authStore: { selfInformation, userInfo, fullNameUser },
  } = useRootStore();

  const isMobile = useMediaQuery("(max-width: 767px)");

  const { data, isLoading, totalPages } = useUserFollowersList({
    nickname,
    pagination: { onPage: INITIAL_CARDS_PER_PAGE, pageNumber: page },
  });

  const { items } = usePagination({
    totalPages,
    initialPageSize: INITIAL_CARDS_PER_PAGE,
    initialPage: INITIAL_PAGE,
    siblingCount: isMobile ? 0 : 1,
    onSetPage: setPage,
  });

  return (
    <>
      <PageMeta />
      <div>
        <UserFollowsHeader
          nickname={userInfo.nickname}
          imageSrc={userInfo.image || noImageIconSrc}
          name={fullNameUser}
        />
        <div className="userFollows__container container">
          <div className="followers">
            <div className="followers__filters">
              <BaseSearch isRounded placeholder="Search users" onChange={() => null} />
              <FollowersTopFilters type={typeFilter} onSetType={setTypeFilter} />
            </div>
            {isLoading ? (
              <SkeletonLoading count={5} width="100%" height={100} />
            ) : (
              renderFollowerRows()
            )}
            {!!data.length && totalPages > 1 && <Pagination items={items} className="mb-0" />}
          </div>
        </div>
      </div>
    </>
  );

  function renderFollowerRows() {
    return data.map((row, index) => (
      <div className="followers__row" key={index}>
        <div className="followers__cell">
          <img src={row.image || noImageIconSrc} alt="follower" />
          <div className="d-flex flex-column">
            {/* TODO add to response name of user */}
            <span
              className="followers__name"
              onClick={() =>
                navigate(
                  selfInformation.nickname === row.nickname
                    ? routes.sellerMarketPlace.path
                    : `/user/${row.nickname}/marketplace`,
                )
              }
            >
              {row.nickname}
            </span>
            <span className="followers__nick">{row.nickname}</span>
            <span className="d-md-none">
              Followers: <span className="followers__cell--bold">{row.followersCount}</span>
            </span>
          </div>
        </div>
        <div className="followers__cell">
          Followers: <span className="followers__cell--bold">{row.followersCount}</span>
        </div>
        <div className="followers__cell">
          Following: <span className="followers__cell--bold">{row.followingCount}</span>
        </div>
        <div className="followers__cell">
          Items: <span className="followers__cell--bold">{row.concreteBottlesCount}</span>
        </div>
      </div>
    ));
  }
}

export default observer(UserFollowers);
