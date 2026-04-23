import { Expose, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "@global/definitions";
import { UserDTOOut } from "./user.DTO";
import { BusinessUnitDTOOut } from "./businessUnit.DTO";

export class MembershipDTOIn {
  @IsString() user!: string;
  @IsEnum(UserRole) role!: UserRole;
  @IsOptional() @IsBoolean() status?: boolean;
}

export class PartialMembershipDTOIn {
  @IsOptional() @IsString() user?: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional() @IsBoolean() status?: boolean;
}

export class MembershipDTOOut {
  @Expose() id: string;
  @Expose() @Type(() => UserDTOOut) user: UserDTOOut;
  @Expose() @Type(() => BusinessUnitDTOOut) businessUnit: BusinessUnitDTOOut;
  @Expose() role: UserRole;
  @Expose() status: boolean;

  constructor(
    id: string,
    user: UserDTOOut,
    businessUnit: BusinessUnitDTOOut,
    role: UserRole,
    status: boolean
  ) {
    this.id = id;
    this.user = user;
    this.businessUnit = businessUnit;
    this.role = role;
    this.status = status;
  }
}
