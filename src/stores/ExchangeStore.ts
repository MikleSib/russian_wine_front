import { observable, action, makeObservable } from "mobx";
import api from "services/api/api";

class ExchangeCountStore {
  exchangeCount = 0;

  async changeCount(marked: boolean) {
    if (marked) {
      this.exchangeCount++;
    } else {
      this.exchangeCount--;
    }
  }
  constructor() {
    makeObservable(this, {
      exchangeCount: observable,
      changeCount: action,
    });
  }
}

const exchangeCountStore = new ExchangeCountStore();

export default exchangeCountStore;
