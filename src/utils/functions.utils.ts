import { Request } from "express";

/** Get the enum type and value and return a string **/
export const enumToString = (enumType: any, value: number): string => {
  return Object.keys(enumType)[Object.values(enumType).indexOf(value)];
};

export const getPaginationParams = (
  req: Request
): { invalid: boolean; page: number; limit: number } => {
  const page = parseInt(req.query.page as string);
  const limit = parseInt(req.query.limit as string);

  if (page < 1 || limit < 1) 
    return {invalid: true, page:0, limit:0};

  return {invalid: false, page, limit};
};

export const isNullOrEmpty = (str: string | null | undefined): boolean => {
  return str === null || str === undefined || str === '';
}
