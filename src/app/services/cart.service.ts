import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClientService} from './common/httpclient.service';
import {Book} from '../models/book';
import {Cart} from '../models/cart';
import {Const, Endpoint} from '../common/const';
import {Customer} from '../models/customer';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private customerEndpoint = Endpoint.CUSTOMER;
  private limitBook = Const.RECOMMENDED_VIEWED_BOOK;
  private cart = [];
  private viewed = [];

  constructor(private httpService: HttpClientService) {
    const data = localStorage.getItem('cart');
    if (!data) { this.cart = []; } else { this.cart = JSON.parse(data); }
  }

  storage() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  getCart(isbn: string): Cart {
    return this.cart.find(x => x.isbn === isbn);
  }

  fetchCart(): Cart[] {
    return this.cart;
  }

  clearCart() {
    this.cart = [];
    this.storage();
  }

  addCart(item: Book, amount: number) {
    if (amount < 1) {
      this.removeCart(item);
    } else {
      const exist = this.cart.find(x => x.isbn === item.isbn);
      if (exist) { exist.setData(item, amount.toString()); } else { this.cart.push(new Cart(item, amount)); }
    }
    this.storage();
  }

  removeCart(item: Book) {
    this.cart = this.cart.filter(x => x.isbn !== item.isbn);
    this.storage();
  }

  totalItem(): number {
    return this.cart.map(x => x.amount).reduce((a, b) => a + b, 0);
  }

  totalPrice(): number {
    return this.cart.map(x => x.getPrice()).reduce((a, b) => a + b, 0);
  }

  getCustomer(): Observable<Customer> {
    return this.httpService.post(this.customerEndpoint, {});
  }

  private viewedStorage() {
    localStorage.setItem('viewed', JSON.stringify(this.viewed));
  }

  getViewed(isbn: string): Book {
    return this.viewed.find(x => x.isbn === isbn);
  }

  fetchViewed(): Book[] {
    return this.viewed;
  }

  clearViewed() {
    this.viewed = [];
    this.viewedStorage();
  }

  addViewed(item: Book) {
    this.viewed = this.viewed.filter(x => x.isbn !== item.isbn);
    this.viewed.unshift(item);
    if (this.viewed.length > this.limitBook) { this.viewed.pop(); }
    this.viewedStorage();
  }
}
