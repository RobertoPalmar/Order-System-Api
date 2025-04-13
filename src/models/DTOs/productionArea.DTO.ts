import { Expose, Type } from "class-transformer";
import { BusinessUnitDTOOut } from "./businessUnit.DTO";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { CategoryDTOOut } from "./category.DTO";

export class ProductionAreaDTOIn {
  @IsString() name!: string;
  @IsString() description!: string;
  @IsBoolean() status!: boolean;
  @IsString({ each: true }) preferredCategory: string[] = []
  @IsNumber() @Min(0) priority!: number;
}

export class PartialProductionAreaDTOIn {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() status?: boolean;
  @IsOptional() @IsString({ each: true }) preferredCategory: string[] = []
  @IsOptional() @IsNumber() @Min(0) priority?: number;
}

export class ProductionAreaDTOOut {
  @Expose() id:string;
  @Expose() name: string;
  @Expose() description: string;
  @Expose() status: boolean;
  @Expose() @Type(()=> CategoryDTOOut) preferredCategory: CategoryDTOOut[];
  @Expose() priority: number;
  @Expose() @Type(()=> BusinessUnitDTOOut) businessUnit:BusinessUnitDTOOut;

  constructor(
    id: string,
    name:string,
    description:string,
    status:boolean,
    preferredCategory:CategoryDTOOut[],
    priority:number,
    businessUnit: BusinessUnitDTOOut
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.status = status;
    this.preferredCategory = preferredCategory;
    this.priority = priority;
    this.businessUnit = businessUnit;
  }
}
