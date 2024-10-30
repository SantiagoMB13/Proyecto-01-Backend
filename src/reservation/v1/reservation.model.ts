import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  userId: Schema.Types.ObjectId;
  userName: string;
  bookId: Schema.Types.ObjectId;
  bookName: string;
  reservationDate: Date;
  returnDate: Date | null;
  isActive: boolean;
}

const ReservationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  bookName: { type: String, required: true },
  reservationDate: { type: Date, required: true },
  returnDate: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
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

export const Reservation = mongoose.model<IReservation>('Reservation', ReservationSchema);