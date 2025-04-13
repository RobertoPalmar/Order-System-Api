//---------------------------------------------ENUMS--------------------------------------------//

export enum ComponentType {
  COMPONENT,
  EXTRA,
  COMPONENT_AND_EXTRA,
}

export enum UserRole {
  ADMIN,
  ANFITRION,
  WAITER,
  PREP_COOK,
}

export enum OrderStatus {
  PENDING,
  CREATED,
  IN_PROGRESS,
  COMPLETED,
  CANCELLED,
}

export enum OrderType {
  DINE_IN, //TABLE ORDER
  TAKE_AWAY, //COUNTER ORDER
  DELIVERY, //DELIVERY ORDER
}

export enum TokenType {
  USER_TOKEN,
  BUSINESS_TOKEN,
}

//------------------------------------------CONSTANTS------------------------------------------//

export const productTotalPopulate = [
  { path: "category", select: "id name description" },
  { path: "currency", select: "id name symbol" },
  { path: "productArea", select: "id name description" },
  { path: "businessUnit", select: "id name description" },
  { path: "components", select: "id name description" },
];

export const productBasicPopulate = [
  {
    path: "category",
    select: "id name",
  },
  {
    path: "currency",
    select: "id name",
  },
  {
    path: "components",
    select: "id name",
  },
  {
    path: "businessUnit",
    select: "id name",
  },
];

export const categoryBasicPopulate = [
  {
    path: "businessUnit",
    select: "id name",
  },
];

export const currencyBasicPopulate = [
  {
    path: "businessUnit",
    select: "id name",
  },
];

export const componentBasicPopulate = [
  {
    path: "currency",
    select: "id name symbol",
  },
  {
    path: "businessUnit",
    select: "id name",
  },
];

export const componentTotalPopulate = [
  {
    path: "currency",
    select: "id name ISO symbol exchangeRate main",
  },
  {
    path: "businessUnit",
    select: "id name",
  },
]

export const customerBasicPopulate = [
  {
    path: "businessUnit",
    select: "id name",
  },
];

export const userBasicPopulate = [];

export const productionAreaBasicPopulate = [
  {
    path: "businessUnit",
    select: "id name",
  },
  {
    path: "preferredCategory",
    select: "id name",
  },
];

export const businessUnitBasicPopulate = [
  {
    path: "owner",
    select: "id name email",
  },
];
