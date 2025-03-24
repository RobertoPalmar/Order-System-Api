import { Expose, Type } from "class-transformer";

export class CurrencyDTO {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() ISO: string;
  @Expose() symbol: string;
  @Expose() exchangeRate: number;
  @Expose() main: boolean;
  // @Expose() @Type(()=> BusinessUnitDTO) businessUnit: businessUnitDTO;

  constructor(
    id: string,
    name:string,
    ISO:string,
    symbol:string,
    exchangeRate:number,
    main:boolean
  ){
    this.id = id;
    this.name = name;
    this.ISO = ISO;
    this.symbol = symbol;
    this.exchangeRate = exchangeRate;
    this.main = main;
  }
}
