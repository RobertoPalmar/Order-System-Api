
export interface Pagination<T>{
  data:T,
  pagination:{
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}