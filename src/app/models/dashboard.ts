import { Book } from './book';
import { Customer } from './customer';

export interface DashboardTopTen {
  sold: Book[];
  rating: Book[];
  purchased: Customer[];
  paid: Customer[];
}

export interface DashboardSummary {
  book: number;
  customer: number;
  comment: number;
  order: number;
}
