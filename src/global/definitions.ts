
//---------------------------------------------ENUMS--------------------------------------------//

export enum ComponentType {
  COMPONENT,
  EXTRA,
  COMPONENT_AND_EXTRA
}

export enum UserRole {
  ADMIN,
  ANFITRION,
  WAITER,
  PREP_COOK
}

export enum OrderStatus{
  PENDING,
  CREATED,
  IN_PROGRESS,
  COMPLETED,
  CANCELLED
}

export enum OrderType{
  DINE_IN,    //TABLE ORDER
  TAKE_AWAY,  //COUNTER ORDER
  DELIVERY    //DELIVERY ORDER
}

export enum TokenType{
  USER_TOKEN,
  BUSINESS_TOKEN
}

//------------------------------------------CONSTANTS------------------------------------------//

export const productTotalPopulate = [
  "category",
  "components",
  "currency",
  "productArea",
  "businessUnit",
];

export const productBasicPopulate = [
  {
    path:"category",
    select:"id name"
  },
  {
    path:"currency",
    select:"id name"
  },
  {
    path:"components",
    select:"id name"
  },
  {
    path:"businessUnit",
    select:"id name"
  }
]

export const categoryBasicPopulate = [
  {
    path:"businessUnit",
    select:"id name"
  }
]

export const currencyBasicPopulate = [
  {
    path:"businessUnit",
    select:"id name"
  }
]

export const componentBasicPopulate = [
  {
    path:"currency",
    select:"id name symbol"
  },
  {
    path:"businessUnit",
    select:"id name"
  }
]

export const componentTotalPopulate = [
  "currency"
]