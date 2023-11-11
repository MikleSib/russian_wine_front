import React, { FC, memo } from "react";
import clsx from "clsx";

import { ReactComponent as LeftArrow } from "assets/icons/chevron-double-left.svg";
import { useMediaQuery } from "hooks";
import "./Pagination.styles.scss";

const Pagination: FC<{ items: TUsePaginationItem[]; className?: string }> = memo(
  ({ items, className }) => {
    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
      <nav className={clsx("pagination", className)}>
        <ul className="pagination__list">
          {items.map(({ page, type, selected, ...rest }, index) => {
            let children = null;

            if (type === "start-ellipsis" || type === "end-ellipsis") {
              children = (
                <button className="pagination__item" disabled>
                  ...
                </button>
              );
            } else if (type === "page") {
              children = (
                <button
                  type="button"
                  className={clsx("pagination__item", { "pagination__item--selected": selected })}
                  {...rest}
                >
                  {page}
                </button>
              );
            } else {
              children = (
                <button
                  type="button"
                  {...rest}
                  className={clsx(
                    "pagination__item pagination__item--btn",
                    `pagination__item--${type}`,
                  )}
                >
                  {isMobile ? <LeftArrow /> : type}
                </button>
              );
            }

            return <li key={index}>{children}</li>;
          })}
        </ul>
      </nav>
    );
  },
);

export default Pagination;
