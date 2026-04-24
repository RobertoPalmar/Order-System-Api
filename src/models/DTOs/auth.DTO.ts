import { IsString } from "class-validator";

export class RefreshTokenRequestDTOIn {
  @IsString() refreshToken!: string;
}

export class LogoutRequestDTOIn {
  @IsString() refreshToken!: string;
}
