import React, { useState } from "react";

import { SellerCard, SkeletonLoading } from "components";
import { BaseButton, BaseSelect } from "components/common";
import { TOP_SALES_PERIOD } from "constants/index";
import { useTopSales } from "hooks/resources/useTopSales";

function TopSales({ userNickname }: { userNickname: string }) {
  const [period, setPeriod] = useState<TOP_SALES_PERIOD>(TOP_SALES_PERIOD.MONTH);
  const { isLoading, sales } = useTopSales(period);

  return (
    <>
      <div className="dashboard__sellers">
        <h3 className="dashboard__title m-0">Top sellers</h3>
        <div className="d-flex align-items-center">
          <BaseSelect
            className="d-none d-md-flex"
            options={[
              { label: "30 Days", value: TOP_SALES_PERIOD.MONTH },
              { label: "7 Days", value: TOP_SALES_PERIOD.WEEK },
              { label: "1 Day", value: TOP_SALES_PERIOD.DAY },
            ]}
            onOptionChange={({ value }) => setPeriod(value)}
          />
          <BaseButton size="small" theme="outlined rounded" color="gray">
            Все
          </BaseButton>
        </div>
      </div>
      {/* TODO in mobile do slider - need design */}
      <div className="dashboard__sellers-wrapper">
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              <SkeletonLoading key={index} width={270} height={64} />
            ))
          : sales.map(
              ({ firstName, lastName, nickname, totalSell, image, isKeepPrivate }, index) => {
                const name =
                  (!firstName && !lastName) || isKeepPrivate
                    ? nickname
                    : `${firstName} ${lastName}`;
                return (
                  <SellerCard
                    key={index}
                    name={name}
                    nickname={nickname}
                    img={image ?? ""}
                    total={totalSell}
                    isMine={userNickname === nickname}
                    isKeepPrivate={isKeepPrivate}
                  />
                );
              },
            )}
      </div>
    </>
  );
}

export default TopSales;
