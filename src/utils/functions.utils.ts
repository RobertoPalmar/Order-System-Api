import { Request } from "express";

/** Get the enum type and value and return a string **/
export const enumToString = (enumType: any, value: number): string => {
  return Object.keys(enumType)[Object.values(enumType).indexOf(value)];
};

export const getPaginationParams = (
  req: Request
): { invalid: boolean; page: number; limit: number } => {
  const rawPage = req.query.page as string | undefined;
  const rawLimit = req.query.limit as string | undefined;

  const page = rawPage === undefined ? 1 : parseInt(rawPage);
  const limit = rawLimit === undefined ? 10 : parseInt(rawLimit);

  if (Number.isNaN(page) || Number.isNaN(limit) || page < 1 || limit < 1)
    return { invalid: true, page: 0, limit: 0 };

  return { invalid: false, page, limit };
};

export const isNullOrEmpty = (str: string | null | undefined): boolean => {
  return str === null || str === undefined || str === '';
}

export function distinctBy<T>(array: T[], keySelector: (item: T) => any): T[] {
  const seen = new Set();
  return array.filter(item => {
    const key = keySelector(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
