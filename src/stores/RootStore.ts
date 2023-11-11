import { makeObservable, observable, action } from "mobx";
import { CancelToken } from "apisauce";

import api from "services/api/api";
import AuthStore from "./Auth/auth.store";

export class RootStore {
  public authStore: AuthStore;

  @observable
  public countries: Array<Country>;

  @observable
  public showFilters: boolean;

  constructor() {
    makeObservable(this);

    this.countries = [];
    this.showFilters = false;
    this.authStore = new AuthStore();
  }

  public getCountryFlag(countryName: string): string | undefined {
    return this.countries.find(({ name }) => name === countryName)?.image;
  }

  @action
  private setCountriesData(data: Array<Country>): void {
    this.countries = data;
  }

  @action
  public toggleShowFilters(toggle: boolean): void {
    this.showFilters = toggle;
  }

  async fetchCountries(): Promise<void> {
    try {
      const data = await api.get<Array<Country>>("/public/simple_list/country", undefined, {
        cancelToken: CancelToken.source().token,
      });

      if (data?.response) {
        this.setCountriesData(data?.response);
      }
    } catch (e) {
      console.log(e);
    }
  }
}
