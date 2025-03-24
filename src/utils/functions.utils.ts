export const enumToString = (enumType: any, value: number): string => {
  return Object.keys(enumType)[Object.values(enumType).indexOf(value)];
};