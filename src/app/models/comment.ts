import {Customer} from './customer';

export class BookComment {
  id: number;
  customerId: number;
  bookIsbn: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;

  customer: Customer;
}
