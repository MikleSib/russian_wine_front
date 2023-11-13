import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { BaseSearch, Pagination } from "components/common";
import { PageMeta, SkeletonLoading } from "components";
import { useMediaQuery, usePagination } from "hooks";
import { useUserFollowingList } from "hooks/resources/useUserFollowingList";
import { INITIAL_CARDS_PER_PAGE, INITIAL_PAGE, TYPE_OPTIONS } from "constants/index";
import { useRootStore } from "context/RootStoreProvider";
import { FollowersTopFilters } from "views/Profile/Followers/FollowersTopFilters";
import "views/Profile/Following/Following.styles.scss";
import { routes } from "utils/router";
import UserFollowsHeader from "../UserFollowsHeader";
import noImageIconSrc from "assets/images/no-image.png";

function UserFollowing() {
  const { nickname = "" } = useParams<{ nickname: string }>();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<TYPE_OPTIONS>(TYPE_OPTIONS.ALL);
  const [page, setPage] = useState(INITIAL_PAGE);

  const {
    authStore: { selfInformation, userInfo, fullNameUser },
  } = useRootStore();

  const isMobile = useMediaQuery("(max-width: 767px)");

  const { data, isLoading, totalPages } = useUserFollowingList({
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
          <div className="following">
            <div className="following__filters">
              <BaseSearch isRounded placeholder="Поиск пользователей" onChange={() => null} />
              <FollowersTopFilters type={typeFilter} onSetType={setTypeFilter} />
            </div>
            {isLoading ? (
              <SkeletonLoading count={5} width="100%" height={100} />
            ) : (
              renderFollowingRows()
            )}
            {!!data.length && totalPages > 1 && <Pagination items={items} className="mb-0" />}
          </div>
        </div>
      </div>
    </>
  );

  function renderFollowingRows() {
    return data.map((row, index) => (
      <div className="following__row" key={index}>
        <div className="following__cell">
          <img src={row.image || noImageIconSrc} alt="following" />
          <div className="d-flex flex-column">
            {/* TODO add to response name of user */}
            <span
              className="following__name"
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
            <span className="following__nick">{row.nickname}</span>
            <span className="d-md-none">
              Поклонники: <span className="following__cell--bold">{row.followersCount}</span>
            </span>
          </div>
        </div>
        <div className="following__cell">
          Подписки: <span className="following__cell--bold">{row.followersCount}</span>
        </div>
        <div className="following__cell">
          Подписки: <span className="following__cell--bold">{row.followingCount}</span>
        </div>
        <div className="following__cell">
          Товары: <span className="following__cell--bold">{row.concreteBottlesCount}</span>
        </div>
      </div>
    ));
  }
}

export default observer(UserFollowing);
