
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