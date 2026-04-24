import { IProduct, Product } from "@models/database/product.model";
import { BaseRepository } from "./baseRepository";
import { Category, ICategory } from "@models/database/category.model";
import { BusinessUnit, IBusinessUnit } from "@models/database/businessUnit.model";
import { Component, IComponent } from "@models/database/component.model";
import { Currency, ICurrency } from "@models/database/currency.model";
import { Customer, ICustomer } from "@models/database/customer.model";
import { IOrder, Order } from "@models/database/order.model";
import { IProductionArea, ProductionArea } from "@models/database/productionArea.model";
import { IUser, User } from "@models/database/user.model";
import { IMembership, Membership } from "@models/database/membership.model";
import { IRefreshToken, RefreshToken } from "@models/database/refreshToken.model";

class RepositoryHub {
  businessUnitRepository: BaseRepository<IBusinessUnit>
  categoryRepository: BaseRepository<ICategory>
  componentRepository: BaseRepository<IComponent>
  currencyRepository: BaseRepository<ICurrency>
  customerRepository: BaseRepository<ICustomer>
  orderRepository: BaseRepository<IOrder>
  productRepository: BaseRepository<IProduct>
  productionAreaRepository: BaseRepository<IProductionArea>
  userRepository: BaseRepository<IUser>
  membershipRepository: BaseRepository<IMembership>
  refreshTokenRepository: BaseRepository<IRefreshToken>

  constructor(){
    this.businessUnitRepository = new BaseRepository<IBusinessUnit>(BusinessUnit, { scoped: false });
    this.categoryRepository = new BaseRepository<ICategory>(Category, { scoped: true });
    this.componentRepository = new BaseRepository<IComponent>(Component, { scoped: true });
    this.currencyRepository = new BaseRepository<ICurrency>(Currency, { scoped: true });
    this.customerRepository = new BaseRepository<ICustomer>(Customer, { scoped: true });
    this.orderRepository = new BaseRepository<IOrder>(Order, { scoped: true });
    this.productRepository = new BaseRepository<IProduct>(Product, { scoped: true });
    this.productionAreaRepository = new BaseRepository<IProductionArea>(ProductionArea, { scoped: true });
    this.userRepository = new BaseRepository<IUser>(User, { scoped: false });
    this.membershipRepository = new BaseRepository<IMembership>(Membership, { scoped: true });
    this.refreshTokenRepository = new BaseRepository<IRefreshToken>(RefreshToken, { scoped: false });
  }
}

export const repositoryHub = new RepositoryHub();
