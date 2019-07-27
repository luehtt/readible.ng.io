import {Customer} from './customer';
import {Book} from './book';

export class DashboardTop {
  sold: Book[];
  rating: Book[];
  purchased: Customer[];
  paid: Customer[];
}

export class DashboardSummary {
  book: number;
  customer: number;
  comment: number;
  order: number;
}
