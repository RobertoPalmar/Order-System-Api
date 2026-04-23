import { Expose } from "class-transformer";

export class TokenData{
  @Expose() userID!:string;
}

export class TokenBussinesData extends TokenData{
  @Expose() role!:number;
  @Expose() businessUnitID!:string;
}
