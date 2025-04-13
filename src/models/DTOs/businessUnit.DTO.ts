import { Expose, Type } from "class-transformer";
import { UserDTOOut } from "./user.DTO";
import { IsOptional, IsString } from "class-validator";

export class BusinessUnitDTOIn{
  @IsString() name!: string;
  @IsString() description!: string;
}

export class PartialBusinessUnitDTOIn{
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
}

export class BusinessUnitDTOOut {
  @Expose() id:string;
  @Expose() name: string;
  @Expose() description: string;
  @Expose() @Type(()=> UserDTOOut) owner: UserDTOOut;

  constructor(
    id:string,
    name: string,
    description: string,
    owner: UserDTOOut
  ){
    this.id = id;
    this.name = name;
    this.description = description;
    this.owner = owner;
  }
}