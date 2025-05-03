import { Model, Document, Types } from "mongoose";

export class BaseRepository<T extends Document> {
  constructor(private _model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return await this._model.create(data);
  }

  async findById(id: Types.ObjectId): Promise<T | null> {
    return await this._model.findOne({ _id: id });
  }

  async update(id: Types.ObjectId, data: Partial<T>): Promise<T | null> {
    return await this._model.findByIdAndUpdate(id, data, { new: true });
  }

  async archive(id: Types.ObjectId): Promise<T | null> {
    return await this._model.findByIdAndUpdate(id, { isArchived: true }, { new: true });
  }

  async restore(id: Types.ObjectId): Promise<T | null> {
    return await this._model.findByIdAndUpdate(id, { isArchived: false }, { new: true });
  }

  async findAll(): Promise<T[]> {
    return await this._model.find();
  }
}