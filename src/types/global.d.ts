interface Window {
  LOGGED: boolean;
  CSRF_TOKEN: string;
  CAPTCHA_ENABLED: boolean;
  GEETEST_LOADED: boolean;

  initGeetest(config: any, callback: (captcha: any) => any): any;
  GTest: {
    reset();
    verify();
    getValidate(): IGeetestValidate;
  };

  ethereum?: {
    autoRefreshOnNetworkChange: boolean;
    chainId: string;
    isMetaMask: true;
    networkVersion: string;
    selectedAddress: string;
    [key: string]: (...args: any[]) => void;
  };

  __REACT_DEVTOOLS_GLOBAL_HOOK__: any;
}
