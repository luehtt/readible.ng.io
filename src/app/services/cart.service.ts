import { Injectable } from '@angular/core';
import { Common } from '../common/const';
import { Book } from '../models/book';
import { Cart } from '../models/cart';


@Injectable({
  providedIn: 'root'
})
export class CartService {

  private LIMIT_VIEWED = Common.LIMIT_VIEWED_BOOK;
  private VIEWED_SESSION = 'viewed';
  private CART_SESSION = 'cart';

  constructor() {
  }

  setCart(data: Cart[]): void {
    localStorage.setItem(this.CART_SESSION, JSON.stringify(data));
  }

  fetchCart(): Cart[] {
    const session = localStorage.getItem(this.CART_SESSION);
    const data: Cart[] = [];
    if (!session) { return []; }

    const json = JSON.parse(session);
    for (const i of json) {
      data.push(i as Cart);
    }
    return data;
  }

  getCart(isbn: string): Cart {
    const data = this.fetchCart();
    return !data ? null : data.find(x => x.isbn === isbn);
  }

  clearCart(): void {
    localStorage.setItem(this.CART_SESSION, '');
  }

  addCart(item: Book, amount: number): void {
    if (amount < 1) {
      this.removeCart(item);
    } else {
      const data = this.fetchCart().filter(x => x.isbn !== item.isbn);
      const find = data.find(x => x.isbn === item.isbn);
      if (find) {
        find.amount = amount;
      } else {
        const cart = new Cart(item, amount);
        data.push(cart);
      }
      this.setCart(data);
    }
  }

  removeCart(item: Book): void {
    let data = this.fetchCart();
    data = data.filter(x => x.isbn !== item.isbn);
    this.setCart(data);
  }

  totalItem(): number {
    const data = this.fetchCart();
    if (!data) { return 0; }
    return data.map(x => x.amount).reduce((a, b) => a + b, 0);
  }

  totalPrice(): number {
    const data = this.fetchCart();
    if (!data) { return 0; }
    return data.map(x => x.actualPrice).reduce((a, b) => a + b, 0);
  }

  //////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////

  fetchViewed(): Book[] {
    const session = localStorage.getItem(this.VIEWED_SESSION);
    const data: Book[] = [];
    if (!session) { return []; }

    const json = JSON.parse(session);
    for (const i of json) {
      data.push(i as Book);
    }
    return data;
  }

  setViewed(data: Book[]): void {
    localStorage.setItem(this.VIEWED_SESSION, JSON.stringify(data));
  }

  clearViewed(): void {
    localStorage.setItem(this.VIEWED_SESSION, '');
  }

  addViewed(item: Book): void {
    let data = this.fetchViewed();
    if (data) {
      data = data.filter(x => x.isbn !== item.isbn);
      data.unshift(item);
      if (data.length > this.LIMIT_VIEWED) { data.pop(); }
    }
    this.setViewed(data);
  }
}
