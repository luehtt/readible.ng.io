import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ShopService } from 'src/app/services/shop.service';
import { Cart } from 'src/app/models/cart';
import { AlertService } from 'src/app/services/common/alert.service';
import { Customer } from 'src/app/models/customer';
import { Book } from 'src/app/models/book';
import { Const } from '../../../common/const';
import { Order } from '../../../models/order';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-customer-cart',
  templateUrl: './customer-cart.component.html'
})
export class CustomerCartComponent implements OnInit {
  data: Cart[];
  viewed: Book[];
  form: FormGroup;
  customer: Customer;

  constructor(private formBuilder: FormBuilder, private service: ShopService, private cartService: CartService, private alertService: AlertService) {}

  get totalPrice() {
    return !this.data ? 0 : this.data.map(x => x ? x.actualPrice * x.amount : 0).reduce((a, b) => a + b, 0);
  }

  ngOnInit() {
    this.alertService.clear();
    this.data = this.cartService.fetchCart();
    this.ngOnInitMeta();
    this.ngOnInitForm();
    this.viewed = this.cartService.fetchViewed();
  }

  ngOnInitForm() {
    this.service.getCustomer().subscribe(
      res => {
        this.customer = res;
        this.form = this.formBuilder.group({
          fullname: [this.customer.fullname],
          address: [this.customer.address],
          phone: [this.customer.phone],
          note: ['']
        });
      }, err => {
        this.alertService.failed(err);
      }
    );
  }

  get totalItem() {
    return !this.data ? 0 : this.data.map(x => x.amount).reduce((a, b) => a + b, 0);
  }

  ngOnInitMeta() {
    for (const i of this.data) {
      this.service.get(i.isbn).subscribe(
        res => {
          i.meta = res;
          i.actualPrice = i.meta.discount === 0 ? i.meta.price : i.meta.price * (100 - i.meta.discount) / 100;
        }, err => {
          this.alertService.failed(err);
        }
      );
    }
  }

  clickRemoveCart(object) {
    this.data = this.data.filter(x => x.isbn !== object.isbn);
    this.cartService.removeCart(object);
  }

  clickClearCart() {
    this.data = [];
    this.cartService.clearCart();
  }

  clickSubmit() {
    const orderDetails = [];
    for (const i of this.data) {
      orderDetails.push( { bookIsbn: i.isbn, amount: i.amount } );
    }

    const data = new Order();
    data.address = this.form.controls.address.value;
    data.phone = this.form.controls.phone.value;
    data.note = this.form.controls.note.value;
    data.orderDetails = orderDetails;

    const startTime = this.alertService.initTime();
    this.service.postOrder(data).subscribe(res => {
      this.alertService.success(startTime, 'POST');
      this.cartService.clearCart();
      window.location.href = Const.THIS_URL + 'customer/orders';
    }, err => {
      this.alertService.failed(err);
    });
  }

}
