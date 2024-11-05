import { Request, Response } from 'express';
import * as CreateBookAction from './create.book.action';
import * as ReadBookAction from './read.book.action';
import * as UpdateBookAction from './update.book.action';
import * as DeleteBookAction from './delete.book.action';
import { Schema } from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    userId: Schema.Types.ObjectId;
    permissions: string[];
  };
}

export async function softDeleteBook(req: AuthRequest, res: Response) {
  try {
    const bookId = req.params.id;
    const deletedBook = await DeleteBookAction.softDeleteBookAction(bookId);
    if (deletedBook) {
      res.status(200).json({ message: "Book deleted successfully" });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting book", error });
  }
}

export async function createBook(req: AuthRequest, res: Response) {
  try {
    const book = await CreateBookAction.createBookAction(req.body);
    res.status(201).json({ message: "Book created successfully", book });
  } catch (error) {
    res.status(500).json({ message: "Error creating book", error });
  }
}

export async function getBooks(req: Request, res: Response) {
  try {
    const includeInactiveInput = req.query.includeInactive === 'true';
    const { includeInactive, ...queries } = req.query;
    const books = await ReadBookAction.getBooksAction(queries as any, includeInactiveInput);
    res.status(200).json({ message: "Books retrieved successfully", books });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books", error });
  }
}

export async function getBook(req: Request, res: Response) {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const bookId = req.params.id;
    const book = await ReadBookAction.getBookAction(bookId, includeInactive);
    if (book) {
      res.status(200).json({ message: "Book retrieved successfully", book });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book", error });
  }
}

export async function updateBook(req: AuthRequest, res: Response) {
  try {
    const bookId = req.params.id;
    if (!req.user!.permissions.includes('updateBooks') && !(Object.keys(req.body).every(key => ['isAvailable', 'reservationHistory'].includes(key)))) { // Only allow updating isAvailable and reservationHistory without updateBooks permission
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    const updatedBook = await UpdateBookAction.updateBookAction(bookId, req.body);
    if (updatedBook) {
      res.status(200).json({ message: "Book updated successfully", book: updatedBook });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating book", error });
  }
}