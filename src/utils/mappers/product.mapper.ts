import { IProduct } from "@models/database/product.model";
import { ProductDTOOut } from "@models/DTOs/product.DTO";
import { plainToInstance } from "class-transformer";

export class ProductMapper{
  static toDTO(product: IProduct):ProductDTOOut{
    return plainToInstance(ProductDTOOut, product, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true
    })
  }

  static toDTOList(productList:IProduct[]):ProductDTOOut[]{
    return productList.map(p => this.toDTO(p));
  }
}