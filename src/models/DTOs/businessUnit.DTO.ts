import { Expose } from "class-transformer";

export class BusinessUnitDTOOut {
  @Expose() id:string;
  @Expose() name: string;
  @Expose() description: string;
  // @Expose() @Type(()=> UserDTOOut) owner: UserDTOOut;

  constructor(
    id:string,
    name: string,
    description: string,
    // owner: UserDTOOut
  ){
    this.id = id;
    this.name = name;
    this.description = description;
  }
}