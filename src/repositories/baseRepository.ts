import { PaginationHelper } from "@models/helpers/paginationHelper.model";
import { SortHelper } from "@models/helpers/sortHelper.model";
import { Document, Model, PopulateOptions } from "mongoose";

export interface IBaseRepository<T> {
  findById(id: string, populate?: PopulateOptions[] | string[]): Promise<T | null>;
  
  findAll(populate?: PopulateOptions[] | string[]): Promise<T[]>;
  
  findAllPaginated(
    page: number, 
    limit: number,
    populate?: PopulateOptions[] | string[],
  ): Promise<PaginationHelper<T>>;
  
  findByFilter(
    filter: any,
    populate?: PopulateOptions[] | string[],
    sort?: SortHelper,
    page?: number,
    limit?: number,
  ): Promise<PaginationHelper<T>>;
  
  create(
    data: Partial<T>, 
    populate?: PopulateOptions[] | string[]
  ): Promise<T>;
  
  createRange(
    dataList: Partial<T>[], 
    populate?: PopulateOptions[] | string[],
  ): Promise<T[]>;
  
  updateById(
    id: string, 
    data: Partial<T>,
    populate?: PopulateOptions[] | string[],
  ): Promise<T | null>;
  
  deleteById(id: string): Promise<boolean>;
}

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    populate?: PopulateOptions[] | string[]
  ): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const total = await this.model.countDocuments();

    const query = this.model.find().skip(skip).limit(limit);

    if(populate != undefined)
        query.populate(populate);

    const data = await query.exec();
    const totalPages = Math.ceil(total / limit);

    const pagination: PaginationHelper<T> = {
      data,
      total,
      page,
      totalPages,
    };

    return pagination;
  }

  async findByFilter(
    filter: any,
    populate?: PopulateOptions[] | string[],
    sort?: SortHelper,
    page?: number,
    limit?: number,
  ): Promise<PaginationHelper<T>> {
    const total = await this.model.countDocuments(filter);
    let totalPages = 1;
    
    const query = this.model.find(filter)
    
    if(populate != undefined)
      query.populate(populate);

    if(sort != undefined)
      query.sort({ [sort!.sortBy]: sort!.sortOrder });

    if(page != undefined && limit != undefined){
      const skip = (page - 1) * limit;
      query.skip(skip).limit(limit);

      totalPages = Math.ceil(total / limit);
    }

    const data = await query.exec();
    const pagination: PaginationHelper<T> = {
      data,
      total,
      page: page ?? 1,
      totalPages,
    };

    return pagination;
  }

  async findById(
    id: string,
    populate: PopulateOptions[] | string[] | null = null
  ): Promise<T | null> {
    const query = this.model.findById(id);
    
    if(populate != null)
      query.populate(populate);

    return query.exec()
  }

  async findAll(populate?: PopulateOptions[] |string[]): Promise<T[]> {
    const query = this.model.find();
    
    if(populate != undefined)
      query.populate(populate);

    return query.exec();
  }

  async create(
    data: Partial<T>,
    populate: PopulateOptions[] | string[] | null = null,
  ): Promise<T> {
    const newModel = new this.model(data);
    const modelSave = await newModel.save();
    
    if(populate != null)
      return (await this.model.findById(modelSave._id).populate(populate).exec()) as T
    else
      return modelSave;
  }

  async createRange(
    dataList: Partial<T>[],
    populate: PopulateOptions[] |string[] | null = null,
  ): Promise<T[]> {
    const modelList = await this.model.insertMany(dataList);

    if(populate != null){
      const populateModel = await this.model.find({
        _id: {$in: modelList.map(m => m.id)}
      })
      .populate(populate)
      .exec();

      return populateModel;
    }
    else
      return modelList as unknown as T[];
  }

  async updateById(
    id: string,
    data: Partial<T>,
    populate: PopulateOptions[] |string[] | null = null,
  ): Promise<T | null> {
    const updateModel = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();

    if(updateModel == null)
      return updateModel;

    if(populate != null)
      return updateModel!.populate(populate);
    
    return updateModel;
  }

  async deleteById(id: string): Promise<boolean> {
    const deleteResult = await this.model.findByIdAndDelete(id).exec();
    return deleteResult !== null;
  }
}
