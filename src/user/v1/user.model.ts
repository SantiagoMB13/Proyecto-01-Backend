import mongoose, { Schema, Document } from 'mongoose';
import { IReservation, Reservation } from './../../reservation/v1/reservation.model';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  permissions: string[];
  isActive: boolean;
  reservationHistory: IReservation[];
}

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  permissions: { type: [String], default: [] },
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

export const User = mongoose.model<IUser>('User', UserSchema);