import { observable, action, makeObservable } from "mobx";
import api from "services/api/api";

class CurrencyStore {
  currency = (localStorage.getItem("currency") as string) ?? "RUB";
  currencyRate = Number(localStorage.getItem("currencyRate")) ?? 1;

  async changeCurrency(newCurrency: string) {
    if (newCurrency === "USD") {
      this.currencyRate = 1;
      localStorage.setItem("currencyRate", "1");
    } else {
      const url = `https://backend.winessy.com/api/v1/public/get_rate_eur_to/${newCurrency}`;
      try {
        const response: any = await api.get(url);
        const rate = response.response.rate;
        this.currencyRate = rate;
        localStorage.setItem("currencyRate", rate);
      } catch (error) {
        console.log(error);
        this.currencyRate = 1;
        localStorage.setItem("currencyRate", "1");
      }
    }
    this.currency = newCurrency;
    localStorage.setItem("currency", newCurrency);
  }
  constructor() {
    makeObservable(this, {
      currency: observable,
      currencyRate: observable,
      changeCurrency: action,
    });
  }
}

const currencyStore = new CurrencyStore();

export default currencyStore;
