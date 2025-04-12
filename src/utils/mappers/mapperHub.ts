import { ProductDTOOut } from "@models/DTOs/product.DTO"
import { BaseMapper } from "./baseMapper"
import { IProduct } from "@models/database/product.model"
import { IBusinessUnit } from "@models/database/businessUnit.model"
import { BusinessUnitDTOOut } from "@models/DTOs/businessUnit.DTO"
import { ICategory } from "@models/database/category.model"
import { CategoryDTOOut } from "@models/DTOs/category.DTO"
import { ICurrency } from "@models/database/currency.model"
import { CurrencyDTOOut } from "@models/DTOs/currency.DTO"
import { IComponent } from "@models/database/component.model"
import { ComponentDTOOut } from "@models/DTOs/component.DTO"

class MapperHub{
  productMapper:BaseMapper<IProduct,ProductDTOOut>
  businessUnitMapper:BaseMapper<IBusinessUnit,BusinessUnitDTOOut>
  categoryMapper:BaseMapper<ICategory,CategoryDTOOut>
  currencyMapper:BaseMapper<ICurrency,CurrencyDTOOut>
  componentMapper:BaseMapper<IComponent,ComponentDTOOut>

  constructor(){
    this.productMapper = new BaseMapper<IProduct,ProductDTOOut>(ProductDTOOut)
    this.businessUnitMapper = new BaseMapper<IBusinessUnit, BusinessUnitDTOOut>(BusinessUnitDTOOut)
    this.categoryMapper = new BaseMapper<ICategory, CategoryDTOOut>(CategoryDTOOut)
    this.currencyMapper = new BaseMapper<ICurrency,CurrencyDTOOut>(CurrencyDTOOut)
    this.componentMapper = new BaseMapper<IComponent,ComponentDTOOut>(ComponentDTOOut)
  }
}

export const mapperHub = new MapperHub();