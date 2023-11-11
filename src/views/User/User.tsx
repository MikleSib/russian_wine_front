import React, { useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { PageLoader } from "components";
import { useRootStore } from "context/RootStoreProvider";
import { routes } from "utils/router";

function User() {
  const { nickname } = useParams<{ nickname: string }>();
  const navigate = useNavigate();
  const { authStore } = useRootStore();

  useEffect(() => {
    if (nickname) {
      authStore.fetchUserInformation(nickname);
    } else {
      navigate(routes.marketplace.path);
    }
  }, [nickname]);

  if (authStore.fetchStatus.user === "init" || authStore.fetchStatus.user === "loading") {
    return <PageLoader />;
  }

  return <Outlet />;
}

export default observer(User);
