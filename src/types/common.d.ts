type TRoute<T = any> = {
  path: string;
  component: T;
  requireAuth?: boolean;
  children?: { path: string; component: T; requireAuth?: boolean }[];
};

type Hash<T = string> = { [key: string]: T };
type TFetchStatus = "init" | "loading" | "success" | "error";

type TPageMeta = {
  title: string;
  description?: string;
  image?: string;
};

// Form types
type TFieldsState<TFields, K extends keyof TFields = keyof TFields> = Hash<TFields[K]>;
type TErrorsState = Hash<string[]>;
type TValidator = (value, fields: Hash<any>) => void | string;
type TDefaultValues = { [field: string]: any };
type TFieldTypes = string | number | boolean | Object;

interface IHookContext<TFields> {
  ctx: any;
  value: any;
  fields: TFieldsState<TFields>;
  state: any;
}

interface IFieldConfig<TFields> {
  type: StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor;
  validators?: TValidator[];
  interceptor?(params: IHookContext<TFields>): any;
  hooks?: {
    updated?(params: IHookContext<TFields>): any;
  };
}

type TFieldsHash<TFields> = { [K in keyof TFields]: IFieldConfig<TFields> };
type TSetFieldParams = {
  field: string;
  value: any;
  trusted?: boolean;
};

interface IFormState<TFields> {
  submitted: boolean;
  fetchStatus: TFetchStatus;
  touched: Set<keyof TFields>;
  fields: TFieldsState<TFields>;
  errors: TErrorsState;
}

interface IFormOptions<TField> {
  fields: TFieldsHash<TField>;
  defaultValues?: TDefaultValues;
  debounce?: number;
  onSubmit(payload: any): void;
}

interface ISubmitMeta {
  validate?: boolean;
  validateOnly?: string[];
}

interface IGeetestValidate {
  geetest_challenge: string;
  geetest_seccode: string;
  geetest_validate: string;
}

type TUsePaginationProps = {
  // Number of always visible pages at the beginning and end
  boundaryCount?: number;
  totalPages?: number;
  initialPage?: number;
  initialPageSize?: number;
  hideNextButton?: boolean;
  hidePrevButton?: boolean;
  // Number of always visible pages before and after the current page
  siblingCount?: number;
  onSetPage?: (page: number) => void;
};

type TUsePaginationItem = {
  onClick: () => void;
  type: "page" | "next" | "previous" | "start-ellipsis" | "end-ellipsis";
  page: number;
  selected: boolean;
  disabled: boolean;
};

type TUsePaginationResult = {
  items: TUsePaginationItem[];
  startIndex: number;
  endIndex: number;
  currentPage: number;
};

type WineColorType = "red" | "white";
type FilterType = "select_filter" | "range_filter" | "hidden_filter";
type FilterName =
  | "WineName"
  | "FirstSalePrice"
  | "MarketPlacePrice"
  | "WineProductionCountry"
  | "WineProductionRegion"
  | "WineProducerName"
  | "WineProductionYear"
  | "WineBottleVolume"
  | "RatingRP"
  | "IsNew"
  | "WineColor";

type FilterAlias =
  | "Name"
  | "Price"
  | "Country"
  | "Region"
  | "Manufacturer"
  | "Year"
  | "Volume"
  | "Rating RP"
  | "IsNew"
  | "WineColor";

type FilterSelectValueType = {
  value: string;
  count: number;
};

type FilterRangeValueType = {
  min: string;
  max: string;
  count: number;
};

interface BaseFilter<T = FilterType> {
  name: FilterName;
  alias: FilterAlias;
  type: T;
  values: T extends "range_filter" ? FilterRangeValueType : Array<FilterSelectValueType>;
}

type FetchStatus = "init" | "loading" | "success" | "error";

interface Country {
  name: string;
  image: string;
  code2: string;
  code3: string;
  phoneCode: string;
}

interface ModalsContext<TContent = JSX.Element> {
  content?: TContent;
  isOpen?: boolean;
  onPresent: (content: TContent, dataProps?: Record<string, any>, withDismiss?: boolean) => void;
  onDismiss: () => void;
}
