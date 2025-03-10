import { Document, Model } from "mongoose";

export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  createRange(dataList: Partial<T>[]): Promise<T[]>;
  updateById(id: string, data: Partial<T>): Promise<T | null>;
  deleteById(id: string): Promise<boolean>;
}

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }
  
  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }
  
  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async create(data: Partial<T>): Promise<T> {
    const newModel = new this.model(data);
    return newModel.save();
  }
  
  async createRange(dataList: Partial<T>[]): Promise<T[]> {
    const modelList = await this.model.insertMany(dataList);
    return modelList as unknown as T[];
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const deleteResult = this.model.findByIdAndDelete(id).exec();
    return deleteResult !== null;
  }
}
