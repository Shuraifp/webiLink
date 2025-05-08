import { Model, Document, Types } from "mongoose";
import { IBaseRepository } from "../interfaces/repositories/IBaseRepository";

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private _model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return await this._model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return await this._model.findOne({ _id: id });
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this._model.findByIdAndUpdate(id, data, { new: true });
  }

  async findByQuery(query: object): Promise<T | null> {
    return await this._model.findOne(query).exec();
  }

  async findAll(): Promise<T[]> {
    return await this._model.find();
  }
}