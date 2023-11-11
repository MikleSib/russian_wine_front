interface IApiConfig {
  apiHost: string;
  baseUrl: string;
  timeout: number;
  version: number;
}

type TGeneralApiSuccess<TData> = {
  response: TData | null;
  errors: null | Hash<string[]>;
  status: number;
  notification: null;
  top_warning: null;
  warning: null;
  _token: string;
};

type TGeneralApiProblem = {
  _token: string;
  response: null;
  status: number;
  notification: string;
  warning: string;
  errors: Hash<string[]>;
  top_warning?: string;
};
type TGeneralApiResponseData<TData = void> = TGeneralApiSuccess<TData> | TGeneralApiProblem;
type TGeneralApiResponse<TData = void> = Promise<TGeneralApiResponseData<TData>>;
interface GeneralRequest<TBody = void, TParams = Record<string, unknown>> {
  params?: TParams;
  body?: TBody;
}

interface Pagination {
  pageNumber: number;
  onPage: number;
}

interface FilterResponse extends Pagination {
  totalPages: number;
  filters: Array<BaseFilter>;
}

interface FilterParamsRequest extends Partial<Pagination> {
  filters?: Partial<{ [key in FilterName]: Array<string> }>;
}

interface WineParams {
  WineName: string;
  WineProductionCountry: string;
  WineProductionRegion: string;
  WineProducerName: string;
  LinkToDocuments: string;
  FirstSalePrice: string;
  WineBottleVolume: string;
  WineProductionYear: string;
  WineColor: WineColorType;
  Description: string;
  RatingRP: string;
  IsNew: "0" | "1";
}

interface WineRaw {
  poolId: number;
  contractAddress: string;
  tokensCount: number;
  maxTotalSupply: number;
  image: null | string;
  isFavorite: boolean;
  priceChangePercent: string;
  uniqOwnersCount: number;
  viewersCount: number;
  favoritesCount: number;
  wineParams: WineParams;
  possibleDeliveryDate: null | string;
  futuresImage: null | string;
  sku?: string;
}

interface MarketWineRaw {
  winePool: WineRaw;
  bottleOwner: BottleOwner;
  orderId: number;
  tokenId: number;
  currency: string;
  price: string;
  fee: string;
  seller: string;
  buyer: string;
  isOpen: boolean;
  isMine: boolean;
  isInner: boolean;
  date_at: number;
  sku?: string;
}

interface BottleOwner {
  blockchainAddress: string;
  nickname: string | null;
  image: string | null;
}

interface Follower {
  nickname: string;
  image: string | null;
  followersCount: number;
  followingCount: number;
  concreteBottlesCount: number;
  concreteBottlesTotalPrice: string;
}

interface ActivityAddress {
  nickname: null | string;
  firstName: null | string;
  lastName: null | string;
  image: null | string;
  blockchainAddress: string;
  isKeepPrivate: boolean;
}

interface ActivityRaw {
  concreteBottle: {
    winePool: WineRaw;
    tokenId: number | null;
    price: string;
    orderId: number | null;
    currency: string;
    isOpen: boolean;
    status: string;
  };
  addressFrom: ActivityAddress;
  addressTo: ActivityAddress;
  activityType: string;
  createdAt: number;
}

enum Purchase_Status {
  STATUS_MINTED = "minted",
  STATUS_PENDING = "pending",
  STATUS_RECEIVED = "received",
  STATUS_DELIVERED = "delivered",
  STATUS_BOUGHT = "bought",
  STATUS_IN_ORDER = "in_order",
  STATUS_IN_DELIVERY_SERVICE = "in_delivery_service",
  STATUS_ON_SALE = "on sale",
  STATUS_DELIVERY = "delivery",
}

interface FirstSaleResponse {
  filterResponse: FilterResponse;
  records: Array<WineRaw>;
}

interface MarketSaleResponse {
  filterResponse: FilterResponse;
  records: Array<MarketWineRaw>;
}

interface PurchaseResponse {
  filterResponse: FilterResponse;
  records: Array<MarketWineRaw & { status: Purchase_Status }>;
}

interface ActivityResponse {
  filterResponse: FilterResponse;
  records: Array<ActivityRaw>;
}

interface FollowersResponse {
  paginatedResponse: Omit<FilterResponse, "filters">;
  records: Array<Follower>;
}

interface AllowedTransferResponse {
  allowTransfer: boolean;
  allowTransferDate: number;
}

interface GeetestResponse {
  challenge: string;
  gt: string;
  new_captcha: number;
  success: number;
}

interface LoginBody extends IGeetestValidate {
  email: string;
  password: string;
}

interface RegisterBody extends IGeetestValidate {
  email: string;
  password: string;
  password_confirmation: string;
  nickname: string;
  inviter: string | null;
}

interface ForgotPasswordBody extends GeetestType {
  email: string;
}

interface ResetPasswordBody {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface SelfInformationResponse {
  nickname: string;
  firstName: string;
  lastName: string;
  email: string;
  description: string;
  image: string;
  followersCount: number;
  followingCount: number;
  concreteBottlesCount: number;
  concreteBottlesTotalPrice: string;
  isSubscribed: boolean;
  isKycApproved?: boolean;
  contractAddresses: Array<{ address: string; isInner: boolean }>;
  isKeepPrivate: boolean;
}

interface BannerResponse {
  isActive: boolean;
  created_at: number;
  name: string;
  link: string;
  rating: number;
  image: string;
}

interface TopRegion {
  productionRegion: string;
  nameValue: string;
  priceValue: string;
}

interface TopSale {
  nickname: string;
  firstName: string;
  lastName: string;
  image: null | string;
  totalSell: string;
  isKeepPrivate: boolean;
}

interface UpdateUserBody {
  nickname: string;
  first_name: string;
  last_name: string;
  description: string;
}

interface DeliveryFormCreate {
  country_code: string;
  phone_code: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  zip_code: string;
  city: string;
  region: string;
  street_address: string;
  street_address2: string;
  email: string;
}

interface DeliveryResponse {
  country: string;
  phone_code: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  zip_code: string;
  city: string;
  region: null | string;
  street_address: string;
  street_address2: null | string;
  delivery_price: string;
  tax: string;
  storagePrice: string;
  document_link: null | string;
  shipping_service_name: null | string;
  track_code: null | string;
  ve_delivery_status: null | string;
  ve_shipment_id: null | string;
  blockchain_delivery_data: string;
  blockchain_id: null | string;
  blockchain_status: null | string;
  packeging_price: string;
  token_id: number;
  pool_id: number;
}

interface StripeBuyTokenResponse {
  gateWayUrl: string;
  payDeliveryUrl: string;
  params: {
    ac_account_email: string;
    ac_sci_name: string;
    ac_amount: string;
    ac_currency: string;
    ac_order_id: string;
    ac_sign: string;
    ac_comments: string;
    ac_success_url: string;
    ac_success_url_method: string;
    ac_fail_url: string;
    ac_fail_url_method: string;
    ac_status_url: string;
    ac_status_url_method: string;
  };
}
