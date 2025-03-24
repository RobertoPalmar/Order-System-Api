import { Expose } from "class-transformer";

export class CategoryDTO{
  @Expose() id:string;
  @Expose() name: string;
  @Expose() description: string;

  constructor(id:string, name:string, description:string){
    this.id = id;
    this.name = name;
    this.description = description;
  }
}