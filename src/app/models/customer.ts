import {BookComment} from './comment';
import {Order} from './order';
import {User} from './user';

export class Customer {
  userId: number;
  fullname: string;
  birth: number;
  male: boolean;
  address: string;
  phone: number;
  image: string;
  createdAt: string;
  updatedAt: string;

  bookComments: BookComment[];
  orders: Order[];
  totalPurchased: number;
  totalPaid: number;
}

export class CustomerUser {
  customer: Customer;
  user: User;
}
