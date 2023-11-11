import { useQuery, useQueryClient } from "react-query";

export interface BasketItem {
  data: WineRaw;
  count: number;
}

export function useBasket() {
  const queryClient = useQueryClient();

  const { data: basket = [] } = useQuery("basket", async () =>
    JSON.parse((await localStorage.getItem("basketData")) ?? "[]"),
  );

  const addToBasket = (poolItem: WineRaw, countValue?: number): void => {
    const basketData: BasketItem[] | undefined = queryClient.getQueryData("basket");
    let updatedBasketData: BasketItem[] = basketData ? [...basketData] : [];

    if (basketData) {
      if (!basketData.find((item: BasketItem) => item?.data?.poolId === poolItem.poolId)) {
        updatedBasketData.push({ data: poolItem, count: countValue ?? 1 });
      } else {
        const additionCount = countValue ?? 1;
        updatedBasketData = updatedBasketData.map((item: BasketItem) =>
          item.data.poolId === poolItem.poolId
            ? { ...item, count: item.count + additionCount }
            : item,
        );
      }
    }

    localStorage.setItem("basketData", JSON.stringify(updatedBasketData));
    queryClient.setQueriesData("basket", updatedBasketData);
  };

  const removeItemFromBasket = (poolId: number) => {
    const basketData: BasketItem[] | undefined = queryClient.getQueryData("basket");

    if (basketData) {
      const updatedBasketData: BasketItem[] = basketData.filter(
        (item: BasketItem) => item.data.poolId !== poolId,
      );
      localStorage.setItem("basketData", JSON.stringify(updatedBasketData));
      queryClient.setQueriesData("basket", updatedBasketData);
    }
  };

  const changeBasketItemCount = (poolId: number, countValue: number): void => {
    const basketData: BasketItem[] | undefined = queryClient.getQueryData("basket");
    let updatedBasketData: BasketItem[] = basketData ? [...basketData] : [];

    if (basketData) {
      if (countValue <= 0) {
        removeItemFromBasket(poolId);
        return;
      } else if (basketData.find((item: BasketItem) => item.data.poolId === poolId)) {
        updatedBasketData = updatedBasketData.map((item: BasketItem) =>
          item.data.poolId === poolId ? { ...item, count: countValue } : item,
        );
      }
    }

    localStorage.setItem("basketData", JSON.stringify(updatedBasketData));
    queryClient.setQueriesData("basket", updatedBasketData);
  };

  const isInBasket = (poolId: number): BasketItem | undefined =>
    basket.find((item: BasketItem) => item?.data?.poolId === poolId);

  const cleanBasket = () => {
    localStorage.setItem("basketData", JSON.stringify([]));
    queryClient.setQueriesData("basket", []);
  };

  const getItemsCount = (): number => {
    return basket
      .map((item: BasketItem) => item.count)
      .reduce((previousValue: number, currentValue: any) => currentValue + previousValue);
  };

  const removeItemsFromBasket = (poolIds: number[]) => {
    const basketData: BasketItem[] | undefined = queryClient.getQueryData("basket");
    let updatedBasketData = basketData;
    poolIds.forEach((poolId: number) => {
      updatedBasketData = updatedBasketData?.filter(
        (item: BasketItem) => item.data.poolId !== poolId,
      );
    });
    localStorage.setItem("basketData", JSON.stringify(updatedBasketData));
    queryClient.setQueriesData("basket", updatedBasketData);
  };

  return {
    basket,
    isInBasket,
    addToBasket,
    changeBasketItemCount,
    removeItemFromBasket,
    cleanBasket,
    getItemsCount,
    removeItemsFromBasket,
  };
}
