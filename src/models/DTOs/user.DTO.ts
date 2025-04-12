import { Expose } from "class-transformer";
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "@global/definitions";

export class UserDTOIn {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() password!: string;
  @IsEnum(UserRole) role!: UserRole;
  @IsBoolean() status: boolean = true;
}

export class PartialUserDTOIn {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() password?: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional() @IsBoolean() status?: boolean;
}

export class UserDTOOut {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() email: string;
  @Expose() role: UserRole;
  @Expose() status: boolean;

  constructor(
    id: string,
    name: string,
    email: string,
    role: UserRole,
    status: boolean
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.status = status;
  }
}
