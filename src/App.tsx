import React, { useEffect } from "react";

import { Layout } from "components";
import { Router, ScrollToTop } from "utils/router";
import { disableReactDevTools, generateUserId } from "utils";
import { useRootStore } from "context/RootStoreProvider";
import { useEagerConnect } from "./hooks";
import ReactGA from "react-ga4";

if (process.env.NODE_ENV === "production") {
  disableReactDevTools();
}

function App(): JSX.Element {
  const rootStore = useRootStore();
  useEagerConnect();

  useEffect(() => {
    rootStore.fetchCountries();
  }, []);

  ReactGA.initialize("326773682", {
    gaOptions: {
      userId: generateUserId(),
    },
  });

  return (
    <Layout>
      <ScrollToTop>
        <Router />
      </ScrollToTop>
    </Layout>
  );
}

export default App;
