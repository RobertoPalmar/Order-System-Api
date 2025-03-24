import { Expose, Type } from "class-transformer";
import { CurrencyDTO } from "./currency.DTO";
import { ComponentType } from "@global/definitions";

export class ComponentDTO {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() description: string;
  @Expose() image: string;
  @Expose() type: ComponentType
  @Expose() status: boolean;
  // @Expose() @Type(() => BusinessUnitDTO) BusinessUnit: BusinessUnitDTO;

  @Expose() priceAsExtra:number;
  @Expose() @Type(()=> CurrencyDTO) currency: CurrencyDTO


  constructor(
    id: string = "",
    name: string = "",
    description: string = "",
    image: string = "",
    type:ComponentType,
    status: boolean = false,
    priceAsExtra:number,
    currency:CurrencyDTO
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.image = image;
    this.type = type;
    this.status = status;
    this.priceAsExtra = priceAsExtra;
    this.currency = currency;
  }
}
