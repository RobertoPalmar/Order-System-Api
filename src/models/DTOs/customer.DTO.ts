import { Expose, Type } from "class-transformer";
import { BusinessUnitDTOOut } from "./businessUnit.DTO";
import {
  IsOptional,
  IsString,
} from "class-validator";

export class CustomerDTOIn {
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsString() documentID!: string;
  @IsString() email!: string;
  @IsString() phone!: string;
  @IsString() businessUnit!: string;
}

export class PartialCustomerDTOIn {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() documentID?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() businessUnit?: string;
}

export class CustomerDTOOut {
  @Expose() id: string;
  @Expose() firstName: string;
  @Expose() lastName: string;
  @Expose() documentID: string;
  @Expose() email: string;
  @Expose() phone: string;
  @Expose() @Type(() => BusinessUnitDTOOut) businessUnit: BusinessUnitDTOOut;

  constructor(
    id:string,
    firstName: string,
    lastName: string,
    documentID: string,
    email: string,
    phone: string,
    businessUnit: BusinessUnitDTOOut
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.documentID = documentID;
    this.email = email;
    this.phone = phone;
    this.businessUnit = businessUnit;
  }
}
