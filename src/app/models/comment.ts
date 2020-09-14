import { Book } from './book';
import { Customer } from './customer';

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
