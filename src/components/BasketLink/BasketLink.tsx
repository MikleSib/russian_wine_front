import { BaseLink } from "components/common";
import { ReactComponent as BasketIcon } from "assets/icons/basket.svg";
import Count from "./Count";
import "./BasketLink.styles.scss";
import { useBasket } from "hooks/useBasket";
import { NavLink } from "react-router-dom";

function BasketLink() {
  const { basket, getItemsCount } = useBasket();

  return (
    <NavLink className="header__menu-item basket_link" to="/basket">
      <div className="header__menu-item ">
        <div className="header__menu-item">
          <BasketIcon />
          {basket?.length > 0 && <Count itemsCount={getItemsCount()} />}
        </div>
      </div>
    </NavLink>
  );
}

export default BasketLink;
