import {Order} from './order';
import {User} from './user';

export class Manager {
  userId: number;
  fullname: string;
  birth: number;
  male: boolean;
  address: string;
  phone: number;
  image: string;
  createdAt: string;
  updatedAt: string;

  confirmedOrders: Order[];
  completedOrders: Order[];
}

export interface ManagerUser {
  manager: Manager;
  user: User;
}
