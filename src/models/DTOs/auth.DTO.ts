import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RefreshTokenRequestDTOIn {
  @IsString() refreshToken!: string;
}

export class LogoutRequestDTOIn {
  @IsString() refreshToken!: string;
}

export class SignInDTO {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class SignUpDTO {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  status?: string;
}
