import {Book} from './book';

export class Cart {

  isbn: string;
  price: number;
  discount: number;
  amount: number;
  actualPrice: number;
  meta: Book;

  constructor(data, amount: number) {
    this.isbn = data.isbn;
    this.price = data.price;
    this.discount = data.discount;
    this.amount = amount;
    this.actualPrice = this.discount === 0 ? this.price : this.price * (100 - this.discount) / 100;
  }
}
