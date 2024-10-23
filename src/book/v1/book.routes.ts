import { Router } from 'express';
import * as controllers from './book.controller';
import { authenticateUser, authorizeUser } from './../../middlewares/authmiddleware';

const router = Router();
router.post('/books', authenticateUser, authorizeUser(['createBooks']), controllers.createBook);
router.get('/books', controllers.getBooks);
router.get('/books/:id', controllers.getBook);
router.put('/books/:id', authenticateUser, authorizeUser(['updateBooks']), controllers.updateBook);
router.delete('/books/:id', authenticateUser, authorizeUser(['deleteBooks']), controllers.softDeleteBook);

export default router;