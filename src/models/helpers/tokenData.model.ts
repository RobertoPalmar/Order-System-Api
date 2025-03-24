import { Expose } from "class-transformer";

export class TokenData{
  @Expose() userID!:string;
  @Expose() role!:number;
}

export class TokenBussinesData extends TokenData{
  @Expose() businessUnitID!:string;
}