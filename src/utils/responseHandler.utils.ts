import { ApiResponse } from "@models/response/apiResponse.model";
import { Response } from "express";

export class SuccessResponse {
  private static set<T>(
    res: Response,
    data: T,
    code: number,
    message: string,
    status: number
  ) {
    const response: ApiResponse<T> = {
      success: true,
      code,
      message,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        path: res.req.originalUrl,
      },
    };
    res.status(status).json(response);
  }

  static INFO<T>(res: Response, data: T): void {
    this.set(res, data, 1000, "Info successfull get", 201);
  }

  static CREATION<T>(res: Response, data: T): void {
    this.set(res, data, 1001, "Entity successfull created", 201);
  }

  static UPDATE<T>(res: Response, data: T): void {
    this.set(res, data, 1002, "Entity successfully updated", 200);
  }

  static DELETE<T>(res: Response, data?: T): void {
    this.set(res, data, 1003, "Entity successfully deleted", 200);
  }

  static GET<T>(res: Response, data: T): void {
    this.set(res, data, 1004, "Entity successfully retrieved", 200);
  }
}

export class ErrorResponse {
  private static set<T>(
    res: Response,
    code: number,
    message: string,
    status: number
  ): void {
    const response: ApiResponse<T> = {
      success: false,
      code,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        path: res.req.originalUrl,
      },
    };
    res.status(status).json(response);
  }

  static UNAUTHORIZED(res: Response): void {
    this.set(res, 4001, "Unauthorized access", 401);
  }

  static REQUIRED_FIELD(res: Response, field: string): void {
    this.set(res, 4002, `The field '${field}' is required`, 400);
  }

  static INVALID_FIELD(res: Response, field: string, reason?: string): void {
    this.set(
      res,
      4003,
      `Invalid value for field '${field}'${reason ? `: ${reason}` : ""}`,
      400
    );
  }

  static INVALID_FORMAT(
    res: Response,
    field: string,
    expectedFormat: string
  ): void {
    this.set(
      res,
      4004,
      `Invalid format for field '${field}'. Expected format: ${expectedFormat}`,
      400
    );
  }

  static DUPLICATE_FIELD(res: Response, field: string): void {
    this.set(res, 4005, `The field '${field}' already exists`, 400);
  }

  static NOT_FOUND(res: Response, entity: string): void {
    this.set(res, 4006, `${entity} not found`, 404);
  }

  static MISSING_TOKEN(res: Response): void {
    this.set(res, 4010, "Authentication token is missing", 401);
  }

  static INVALID_TOKEN(res: Response): void {
    this.set(res, 4011, "Invalid authentication token", 401);
  }

  static EXPIRED_TOKEN(res: Response): void {
    this.set(res, 4012, "Authentication token has expired", 401);
  }

  static UNEXPECTED_ERROR(res: Response): void {
    this.set(res, 5000, "An unexpected error occurred", 500);
  }
}
