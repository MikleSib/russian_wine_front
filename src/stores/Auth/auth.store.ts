import { action, observable, makeObservable, computed } from "mobx";

import { Form } from "stores/Form";
import { routes } from "utils/router";
import { resetCaptcha } from "utils";
import api from "services/api/api";
import { AuthService } from "./auth.service";
import { initAuthForm, initDeliveryForm, initPersonalForm } from "./auth.forms";

const VALIDATION_MESSAGES: Hash<Hash> = {
  nickname: {
    "validation.unique": "This nickname is already used",
    "validation.regex": "Must contain only Latin alphabet letters, numbers, underscore",
  },
  email: {
    "validation.unique": "This email already exists",
    "validation.regex": "Invalid email format",
  },
  unique_email: { "validation.unique": "This email already exists" },
  password: {
    "validation.regex": "Your password should include letters, numbers and a special character",
    "validation.confirmed": "Passwords do not match",
  },
};

const initSelInfo: SelfInformationResponse = {
  nickname: "",
  firstName: "",
  lastName: "",
  email: "",
  description: "",
  image: "",
  followingCount: 0,
  followersCount: 0,
  concreteBottlesTotalPrice: "0",
  concreteBottlesCount: 0,
  isSubscribed: false,
  contractAddresses: [],
  isKycApproved: false,
  isKeepPrivate: false,
};

export default class AuthStore {
  @observable
  public authForm!: Form;

  @observable
  public personalInfoForm!: Form;

  @observable
  public deliveryForm!: Form;

  @observable
  public captchaLoaded: boolean;

  @observable
  public successScreen: boolean;

  @observable
  public isLogined: boolean;

  @observable
  public selfInformation: SelfInformationResponse;

  @observable
  public userInfo: SelfInformationResponse;

  @observable
  public fetchStatus: Record<"self" | "user", FetchStatus>;

  constructor() {
    makeObservable(this);
    this.captchaLoaded = false;
    this.successScreen = false;
    this.isLogined = false;
    this.selfInformation = initSelInfo;
    this.userInfo = initSelInfo;
    this.fetchStatus = { self: "init", user: "init" };
    this.authForm = initAuthForm(this);
    this.personalInfoForm = initPersonalForm(this);
    this.deliveryForm = initDeliveryForm(this);
  }

  @computed
  get isLoading(): boolean {
    return this.fetchStatus.self === "init" || this.fetchStatus.self === "loading";
  }

  @computed
  get fullName(): string {
    return `${this.selfInformation.firstName ?? ""} ${this.selfInformation.lastName ?? ""}`;
  }

  @computed
  get fullNameUser(): string {
    return `${this.userInfo.firstName ?? ""} ${this.userInfo.lastName ?? ""}`;
  }

  @action
  public setCaptchaLoaded(toggle: boolean): void {
    this.captchaLoaded = toggle;
  }

  @action
  public toggleSuccessScreen(toggle: boolean): void {
    this.successScreen = toggle;
  }

  @action
  public setLogined(status: boolean): void {
    window.LOGGED = status;
    this.isLogined = status;
  }

  @action
  public setSelfInformation(data: SelfInformationResponse): void {
    this.selfInformation = data;
  }

  @action
  public setUserInformation(data: SelfInformationResponse): void {
    this.userInfo = data;
  }

  @action
  private setFetchStatus(status: FetchStatus, type: "self" | "user"): void {
    this.fetchStatus[type] = status;
  }

  @action
  private toggleUserSubscribe(): void {
    if (this.userInfo.isSubscribed) {
      this.selfInformation.followingCount -= 1;
      this.userInfo.followersCount -= 1;
    } else {
      this.selfInformation.followingCount += 1;
      this.userInfo.followersCount += 1;
    }

    this.userInfo.isSubscribed = !this.userInfo.isSubscribed;
  }

  @action
  private removeWalletAddress(removedAddress: string): void {
    this.selfInformation = Object.assign({}, this.selfInformation, {
      contractAddresses: this.selfInformation.contractAddresses.filter(
        ({ address }) => address !== removedAddress,
      ),
    });
  }

  public async submitRegister(): Promise<void> {
    const geetest = getGeeTestObj();
    const { email, password, repeatPassword, nickname } = this.authForm.getAllFields();

    // parsing query param for inviter
    // crutch
    const params = window.location.search
      .replace("?", "")
      .split("&")
      .reduce(function (p: any, e) {
        const a = e.split("=");
        p[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
        return p;
      }, {});
    console.log(params);
    const body = {
      email,
      password,
      password_confirmation: repeatPassword,
      nickname,
      inviter: params["a_aid"] ?? null,
      ...geetest,
    };

    try {
      this.authForm.setFetchStatus("loading");
      await AuthService.register({ body });

      this.authForm.setFetchStatus("success");
      this.toggleSuccessScreen(true);
    } catch (errors: any) {
      resetCaptcha(this.authForm);
      if (errors.errors) {
        this.authForm.setErrors(transformResponseErrors(errors.errors));
      }
      this.authForm.setFetchStatus("error");
      console.error(errors);
    }
  }

  public async verifyAccount(token: string): Promise<void> {
    this.authForm.setFetchStatus("loading");
    await api.post("/auth/token");

    if (!token) {
      // setTimeout(() => {
      //   Notify.error(i18n!.t("notify.confirmAccount"));
      // }, 1000);

      this.authForm.setFetchStatus("error");
      return;
    }

    try {
      await AuthService.confirmAccount({ body: { token } });

      this.authForm.setFetchStatus("success");
    } catch (errors) {
      this.authForm.setFetchStatus("error");
      console.error(errors);
    }
  }

  public async submitLogin(): Promise<void> {
    const geetest = getGeeTestObj();
    const { email, password } = this.authForm.getAllFields();
    const body = { email, password, ...geetest };

    try {
      this.authForm.setFetchStatus("loading");
      await AuthService.login({ body });

      await this.fetchSelfInformation();
      this.authForm.setFetchStatus("success");
      this.setLogined(true);
    } catch (errors: any) {
      resetCaptcha(this.authForm);
      console.error(errors);

      if (errors.status === 405) {
        this.authForm.setFetchStatus("error");
        return;
      }

      if (errors.errors) {
        this.authForm.setErrors({ form: ["Invalid email or password"] });
        this.authForm.setFetchStatus("error");
      }
    }
  }

  public async submitForgotPassword(): Promise<void> {
    const geetest = getGeeTestObj();
    const body = {
      email: this.authForm.getField("email"),
      ...geetest,
    };

    try {
      this.authForm.setFetchStatus("loading");
      await AuthService.forgotPassword({ body });

      this.authForm.setFetchStatus("success");
      this.toggleSuccessScreen(true);
    } catch (errors: any) {
      resetCaptcha(this.authForm);
      this.authForm.setFetchStatus("error");

      if (errors.errors?.email?.[0] === "validation.exists") {
        this.toggleSuccessScreen(true);
      }

      console.error(errors);
    }
  }

  public async submitResetPassword(token: string): Promise<void> {
    if (!token) {
      this.authForm.setErrors({ form: ["Token param does not exist"] });
      this.authForm.setFetchStatus("error");
      return;
    }

    const { password, repeatPassword, email } = this.authForm.getAllFields();
    const body = {
      token: token as string,
      email,
      password,
      password_confirmation: repeatPassword,
    };

    try {
      this.authForm.setFetchStatus("loading");
      await AuthService.resetPassword({ body });

      this.authForm.setFetchStatus("success");
      this.toggleSuccessScreen(true);
    } catch (errors: any) {
      resetCaptcha(this.authForm);
      if (errors.errors) {
        this.authForm.setErrors(transformResponseErrors(errors.errors));
        this.authForm.setFetchStatus("error");
        console.error(errors);
        return;
      }

      if (errors.status === 302) {
        this.authForm.resetForm({ clearFields: true });
        window.location.href = routes.login.path;
      }
    }
  }

  public async submitLogout(): Promise<void> {
    await AuthService.logout();
    localStorage.removeItem("notifications");
    window.location.href = process.env.PUBLIC_URL;
  }

  public async updateUserImage(image: File): Promise<void> {
    const body: FormData = new FormData();
    body.append("image", image);

    try {
      await AuthService.postUserImage({ body });
      await this.fetchSelfInformation(false);
    } catch (errors: any) {
      console.error(errors);
    }
  }

  public async detachWalletAddress(address: string): Promise<void> {
    try {
      await AuthService.postDetachWalletAddress({ body: { blockchain_address: address } });
      this.removeWalletAddress(address);
    } catch (errors: any) {
      console.error(errors);
    }
  }

  public async fetchSelfInformation(withToken = true): Promise<void> {
    try {
      this.setFetchStatus("loading", "self");
      if (withToken) {
        await api.post("/auth/token");
      }

      const data = await AuthService.getSelfInformation();

      if (data?.response) {
        this.setLogined(true);
        this.setSelfInformation(data?.response);
        this.setFetchStatus("success", "self");
        this.personalInfoForm.setData({
          firstName: data?.response.firstName,
          lastName: data?.response.lastName,
          email: data?.response.email,
          nickname: data?.response.nickname,
          description: data?.response.description,
          isKeepPrivate: data?.response.isKeepPrivate,
        });
      }
    } catch (errors: any) {
      if (!errors.response && errors.status === 401) {
        this.setLogined(false);
      }

      this.setFetchStatus("error", "self");
      console.error(errors);
    }
  }

  public async fetchUserInformation(nickname: string): Promise<void> {
    try {
      this.setFetchStatus("loading", "user");
      const data = await AuthService.getUserInformation({ body: { nickname } });

      if (data?.response) {
        this.setUserInformation(data?.response);
        this.setFetchStatus("success", "user");
      }
    } catch (errors: any) {
      this.setFetchStatus("error", "user");
      console.error(errors);
      window.location.href = process.env.PUBLIC_URL;
    }
  }

  public async toggleSubscribing(nickname: string): Promise<void> {
    const isSubscribed = this.userInfo.isSubscribed;

    try {
      await AuthService.postSubscribing({
        body: { nickname },
        params: { type: isSubscribed ? "remove" : "add" },
      });

      this.toggleUserSubscribe();
    } catch (errors: any) {
      console.error(errors);
    }
  }
}

function getGeeTestObj(): IGeetestValidate {
  let geetest = {} as IGeetestValidate;

  try {
    if (window.GTest) {
      geetest = window.GTest.getValidate() || {};
    }
  } catch (err) {
    console.error(err);
  }

  return geetest;
}

function transformResponseErrors(errors: Hash<string[]>): Hash<string[]> {
  return Object.keys(errors).reduce<Hash<string[]>>((acc, errorKey) => {
    if (errorKey === "unique_email") {
      acc["email"] = [VALIDATION_MESSAGES[errorKey][errors[errorKey][0]]];
    } else {
      acc[errorKey] = [VALIDATION_MESSAGES[errorKey][errors[errorKey][0]]];
    }

    return acc;
  }, {});
}
