import {Customer} from './customer';
import {Book} from './book';

export class BookComment {
  id: number;
  customerId: number;
  bookIsbn: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  updatedFromNow: string;

  customer: Customer;
  book: Book;
}
