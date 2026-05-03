import { Expose } from "class-transformer";

export class TokenData{
  @Expose() userID!:string;
  @Expose() tv!:number;
}

export class TokenBussinesData extends TokenData{
  @Expose() role!:number;
  @Expose() businessUnitID!:string;
}
