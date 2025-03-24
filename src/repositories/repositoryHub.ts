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

  constructor(){
    this.businessUnitRepository = new BaseRepository<IBusinessUnit>(BusinessUnit);
    this.categoryRepository = new BaseRepository<ICategory>(Category);
    this.componentRepository = new BaseRepository<IComponent>(Component);
    this.currencyRepository = new BaseRepository<ICurrency>(Currency);
    this.customerRepository = new BaseRepository<ICustomer>(Customer);
    this.orderRepository = new BaseRepository<IOrder>(Order);
    this.productRepository = new BaseRepository<IProduct>(Product);
    this.productionAreaRepository = new BaseRepository<IProductionArea>(ProductionArea);
    this.userRepository = new BaseRepository<IUser>(User);
  }
}

export const repositoryHub = new RepositoryHub();