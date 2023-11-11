import React, { FC, memo } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

import "./BaseLink.styles.scss";

type BaseLinkProps = {
  path: string;
  className?: string;
  external?: boolean;
  nativeClick?: () => void;
  openNewTab?: boolean;
};

const BaseLink: FC<BaseLinkProps> = memo(
  ({ path, external, children, className, nativeClick, openNewTab = true }) => {
    return external ? (
      <a
        href={path}
        rel="noopener nofollow"
        className={className}
        {...(openNewTab && { target: "_blank" })}
      >
        {children}
      </a>
    ) : (
      <NavLink to={path} className={clsx("baseLink", className)} onClick={nativeClick} end>
        {children}
      </NavLink>
    );
  },
);

export default BaseLink;
