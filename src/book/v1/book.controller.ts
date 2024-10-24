import { Request, Response } from 'express';
import * as bookActions from './book.actions';
import { Schema } from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    userId: Schema.Types.ObjectId;
    permissions: string[];
  };
}

export async function softDeleteBook(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.permissions.includes('deleteBooks')) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const bookId = req.params.id;
    const deletedBook = await bookActions.softDeleteBookAction(bookId);
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
    if (!req.user?.permissions.includes('createBooks')) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const book = await bookActions.createBookAction(req.body);
    res.status(201).json({ message: "Book created successfully", book });
  } catch (error) {
    res.status(500).json({ message: "Error creating book", error });
  }
}

export async function getBooks(req: Request, res: Response) {
  try {
    const includeInactiveInput = req.query.includeInactive === 'true';
    const { includeInactive, ...queries } = req.query;
    const books = await bookActions.getBooksAction(queries as any, includeInactiveInput);
    res.status(200).json({ message: "Books retrieved successfully", books });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books", error });
  }
}

export async function getBook(req: Request, res: Response) {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const bookId = req.params.id;
    const book = await bookActions.getBookAction(bookId, includeInactive);
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
    if (!req.user?.permissions.includes('updateBooks')) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const bookId = req.params.id;
    const updatedBook = await bookActions.updateBookAction(bookId, req.body);
    if (updatedBook) {
      res.status(200).json({ message: "Book updated successfully", book: updatedBook });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating book", error });
  }
}