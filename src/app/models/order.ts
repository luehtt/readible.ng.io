import {Customer} from './customer';
import {Manager} from './manager';
import {Book} from './book';

export class Order {
  id: number;
  customerId: number;
  statusId: number;
  contact: string;
  address: string;
  phone: string;
  totalPrice: number;
  totalItem: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string;
  completedAt: string;

  status: OrderStatus;
  customer: Customer;
  confirmedManager: Manager;
  completedManager: Manager;
  orderDetails: OrderDetail[];
}

export class OrderDetail {
  id: number;
  orderId: number;
  bookIsbn: string;
  amount: number;
  price: number;
  book: Book;
}

export class OrderStatus {
  id: string;
  name: string;
  locale: string;
}
