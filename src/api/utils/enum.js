const CategoryEnum = {
  FURNITURE: 1,
  ELECTRONICS: 2,
  VEHICLES: 3,
  BOOKS: 4,
  FASHION: 5,
  OTHER: 6,
};

const UserRole = {
  ADMIN: 1,
  USER: 2,
};

const NotificationTypeEnum = {
  PAYMENT: '1',
};

const NotificationRecipientTypeEnum = {
  WEB: 1,
  ANDROID: 2,
  IOS: 3,
};

const ExpiryUnit = {
  MINUTE: 'm',
  HOUR: 'h',
  DAY: 'd',
};

const ProductBidStatus = {
  CREATED: 1,
  ACCEPTED: 2,
  REJECTED: 3,
  MODIFIED: 4,
};

const OrderStatus = {
  PENDING: 1,
  PICKED_UP_DATE_ESTIMATED: 2,
  PICKED_UP: 3,
  PAID: 4,
};

const CustomerType = {
  VENDOR: 'vendor',
  CUSTOMER: 'customer',
  EMPLOYEE: 'employee',
  SELF: 'self',
};

const RazorPayApi = {
  ADD_CUSTOMER: 'contacts',
  FUND_ACCOUNTS: 'fund_accounts',
  PAYOUT: 'payouts',
};

const AccountType = {
  VPA: 'vpa',
  BANK: 'bank_account',
};

const IdentityProof = {
  PAN: 1,
  AADHAAR: 2,
};

const PaymentStatus = {
  QUEUED: 'queued',
  PENDING: 'pending',
  REJECTED: 'rejected',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  CANCELLED: 'cancelled',
  REVERSED: 'reversed',
};

const DeviceType = {
  WEB: 1,
  ANDROID: 2,
  IOS: 3,
};

const NotificationType = {
  BID: 1,
  ORDER: 2,
};

const SocketEvents = {
  SELL_PRODUCT: 'sell-product',
  ADD_BID: 'add-bid',
  UPDATE_BID: 'update-bid',
  ORDER_PICKUP_DATE: 'order-pickup-date',
  ORDER_PICKED: 'order-picked',
  ORDER_PAID: 'order-paid',
};

const Events = {
  ADD_NEW_BID: 'sendBidCreateNotification',
  ADD_PRODUCT: 'sendAddProductNotification',
  BID_UPDATE: 'sendBidUpdatesNotification',
  ORDER_UPDATE: 'orderUpdatesNotification',
};

module.exports = {
  CategoryEnum,
  NotificationRecipientTypeEnum,
  NotificationTypeEnum,
  ProductBidStatus,
  OrderStatus,
  UserRole,
  ExpiryUnit,
  CustomerType,
  RazorPayApi,
  AccountType,
  IdentityProof,
  PaymentStatus,
  DeviceType,
  NotificationType,
  SocketEvents,
  Events,
};
