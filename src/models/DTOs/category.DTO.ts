import { Expose, Type } from "class-transformer";
import { BusinessUnitDTOOut } from "./businessUnit.DTO";
import { IsOptional, IsString, IsTaxId } from "class-validator";

export class CategoryDTOIn{
  @IsString() name!:string;
  @IsString() description!:string;
  @IsString() businessUnit!:string
}

export class PartialCategoryDTOIn{
  @IsOptional() @IsString() name?:string;
  @IsOptional() @IsString() description?:string;
  @IsOptional() @IsString() businessUnit?:string
}

export class CategoryDTOOut{
  @Expose() id:string;
  @Expose() name: string;
  @Expose() description: string;
  @Expose() @Type(() => BusinessUnitDTOOut) businessUnit: BusinessUnitDTOOut;

  constructor(
    id:string, 
    name:string, 
    description:string,
    businessUnit:BusinessUnitDTOOut
  ){
    this.id = id;
    this.name = name;
    this.description = description;
    this.businessUnit = businessUnit;
  }
}