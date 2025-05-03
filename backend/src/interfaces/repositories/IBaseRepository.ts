import { Document, Types } from "mongoose";

export interface IBaseRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  findById(id: Types.ObjectId): Promise<T | null>;
  update(id: Types.ObjectId, data: Partial<T>): Promise<T | null>;
  archive(id: Types.ObjectId): Promise<T | null>;
  restore(id: Types.ObjectId): Promise<T | null>;
  findAll(): Promise<T[]>;
}