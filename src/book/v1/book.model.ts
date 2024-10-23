import mongoose, { Schema, Document } from 'mongoose';
import { IReservation, Reservation } from './../../reservation/v1/reservation.model';

export interface IBook extends Document {
  title: string;
  author: string;
  genre: string;
  publishDate: Date;
  publisher: string;
  isAvailable: boolean;
  isActive: boolean;
  reservationHistory: IReservation[];
}

const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  publishDate: { type: Date, required: true },
  publisher: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  reservationHistory: [Reservation.schema]
}, {
  timestamps: true, 
  toObject: {
  transform: (doc, ret) => {
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret.__v;
    return ret;
  }
  }
});

export const Book = mongoose.model<IBook>('Book', BookSchema);