import React from "react";
import { useNavigate } from "react-router-dom";

import { PageMeta } from "components";
import { BaseButton } from "components/common";
import { routes } from "utils/router";
import "./NotFound.styles.scss";

function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <PageMeta />
      <div className="notFound__container">
        <h1 className="notFound__title">{"//"} 404</h1>
        <p className="notFound__subtitle">Page Not Found</p>
        <BaseButton click={() => navigate(routes.marketplace.path)}>Marketplace</BaseButton>
      </div>
    </>
  );
}

export default NotFound;
