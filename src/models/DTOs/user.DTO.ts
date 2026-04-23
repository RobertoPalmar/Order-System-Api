import { Expose } from "class-transformer";
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UserDTOIn {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() password!: string;
  @IsBoolean() status: boolean = true;
  @IsNumber() @Min(0) validBusinessUnit: number = 0
}

export class PartialUserDTOIn {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() password?: string;
  @IsOptional() @IsBoolean() status?: boolean;
  @IsOptional() @IsNumber() @Min(0) validBusinessUnit?: number;
}

export class UserDTOOut {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() email: string;
  @Expose() status: boolean;
  @Expose() validBusinessUnit:number;

  constructor(
    id: string,
    name: string,
    email: string,
    status: boolean,
    validBusinessUnit:number
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.status = status;
    this.validBusinessUnit = validBusinessUnit;
  }
}
