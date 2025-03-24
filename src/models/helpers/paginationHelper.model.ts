
export interface PaginationHelper<T>{
  data:T[],
  total:number,
  page:number,
  totalPages:number
}