import { Router, Request, Response } from 'express';
import * as controller from './book.controller';
import { authenticateUser, authorizeUser } from './../../middlewares/authmiddleware';

// INIT ROUTES
const bookRoutes = Router();

// DECLARE ENDPOINT FUNCTIONS
async function createBookHandler(req: Request, res: Response) {
  try {
    const book = await controller.createBook(req.body);
    res.status(201).json({
      message: "Book created successfully",
      book
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating book",
      error
    });
  }
}

async function getBooksHandler(req: Request, res: Response) {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const { includeInactive: _, ...queries } = req.query;
    const books = await controller.getBooks(queries, includeInactive);
    res.status(200).json({
      message: "Books retrieved successfully",
      books
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving books",
      error
    });
  }
}

async function getBookHandler(req: Request, res: Response) {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const bookId = req.params.id;
    const book = await controller.getBook(bookId, includeInactive);
    
    if (book) {
      res.status(200).json({
        message: "Book retrieved successfully",
        book
      });
    } else {
      res.status(404).json({
        message: "Book not found"
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving book",
      error
    });
  }
}

async function updateBookHandler(req: Request & { user?: any }, res: Response) {
  try {
    const bookId = req.params.id;
    const updatedBook = await controller.updateBook(bookId, req.body, req.user?.permissions || []);
    
    if (updatedBook) {
      res.status(200).json({
        message: "Book updated successfully",
        book: updatedBook
      });
    } else {
      res.status(404).json({
        message: "Book not found"
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({
        message: "Error updating book",
        error
      });
    }
  }
}

async function softDeleteBookHandler(req: Request, res: Response) {
  try {
    const bookId = req.params.id;
    const deletedBook = await controller.softDeleteBook(bookId);
    
    if (deletedBook) {
      res.status(200).json({
        message: "Book deleted successfully"
      });
    } else {
      res.status(404).json({
        message: "Book not found"
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error deleting book",
      error
    });
  }
}

// DECLARE ENDPOINTS
bookRoutes.post('/books', authenticateUser, authorizeUser(['createBooks']), createBookHandler);
bookRoutes.get('/books', getBooksHandler);
bookRoutes.get('/books/:id', getBookHandler);
bookRoutes.put('/books/:id', authenticateUser, updateBookHandler);
bookRoutes.delete('/books/:id', authenticateUser, authorizeUser(['deleteBooks']), softDeleteBookHandler);

export default bookRoutes;