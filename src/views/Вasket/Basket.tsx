import { PageMeta } from "components";
import { observer } from "mobx-react-lite";
import "./Basket.styles.scss";
import Header from "./Header";
import Cards from "./Cards";
import { useBasket } from "hooks/useBasket";
import Empty from "./Empty";
import currencyStore from "stores/CurrencyStore";
import { useEffect } from "react";

function Dashboard() {
  const { basket } = useBasket();

  return (
    <>
      <PageMeta />
      <div className="basket">
        <div className="container">
          <Header />
          {basket?.length > 0 ? <Cards currency={currencyStore.currency} /> : <Empty />}
        </div>
      </div>
    </>
  );
}

export default observer(Dashboard);
