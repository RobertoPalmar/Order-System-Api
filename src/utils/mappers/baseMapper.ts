import { plainToInstance } from "class-transformer";

export interface IBaseMapper<Entity,DTO>{
  toDTO(entity:Entity):DTO;
  toDTOList(entityList:Entity[]):DTO[];
}

export class BaseMapper<Entity,DTO> implements IBaseMapper<Entity,DTO>{
  constructor(private DTOClass: new (...args: any[]) => DTO) {}
  
  toDTO(entity: Entity): DTO {
    return plainToInstance(this.DTOClass, entity, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true
        })
  }

  toDTOList(entityList: Entity[]): DTO[] {
    return entityList.map(p => this.toDTO(p));
  }

}