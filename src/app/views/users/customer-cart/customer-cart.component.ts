import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Book } from 'src/app/models/book';
import { Cart } from 'src/app/models/cart';
import { Customer } from 'src/app/models/customer';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { ShopService } from 'src/app/services/shop.service';
import { environment } from '../../../../environments/environment';
import { Order } from '../../../models/order';
import { CartService } from '../../../services/cart.service';
import { PlaceholderService } from '../../../services/common/placeholder.service';


@Component({
  selector: 'app-customer-cart',
  templateUrl: './customer-cart.component.html'
})
export class CustomerCartComponent implements OnInit {
  data: Cart[];
  viewed: Book[];
  form: FormGroup;
  customer: Customer;

  constructor(
    private formBuilder: FormBuilder,
    private placeholderService: PlaceholderService,
    private service: ShopService,
    private cartService: CartService,
    private alertService: AlertMessageService) { }

  get totalPrice(): number {
    return !this.data ? 0 : this.data.map(x => x ? x.actualPrice * x.amount : 0).reduce((a, b) => a + b, 0);
  }

  ngOnInit(): void {
    this.alertService.clear();
    this.data = this.cartService.fetchCart();
    this.viewed = this.cartService.fetchViewed();

    this.initExtendData();
    this.initForm();
  }

  private initForm(): void {
    const startTime = this.alertService.startTime();
    this.service.getCustomer().subscribe(
      res => {
        this.customer = res;
        this.form = this.formBuilder.group({
          contact: [this.customer.fullname],
          address: [this.customer.address],
          phone: [this.customer.phone],
          note: ['']
        });
        this.alertService.successResponse(startTime);
      }, err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  private initExtendData(): void {
    if (!this.data) { return; }
    for (const i of this.data) {
      const startTime = this.alertService.startTime();
      this.service.get(i.isbn).subscribe(
        res => {
          i.metaData = res;
          i.metaData.image = i.metaData.image ? i.metaData.image : this.placeholderService.imgHolder(100, 140, i.metaData.title);
          i.actualPrice = i.metaData.discount === 0 ? i.metaData.price : i.metaData.price * (100 - i.metaData.discount) / 100;
          this.alertService.successResponse(startTime);
        }, err => {
          this.alertService.errorResponse(err, startTime);
        }
      );
    }
  }

  get totalItem(): number {
    return !this.data ? 0 : this.data.map(x => x.amount).reduce((a, b) => a + b, 0);
  }

  onRemoveCart(item): void {
    this.data = this.data.filter(x => x.isbn !== item.isbn);
    this.cartService.removeCart(item);
  }

  onClearCart(): void {
    this.data = [];
    this.cartService.clearCart();
  }

  onSubmit(): void {
    const orderDetails = [];
    for (const i of this.data) {
      orderDetails.push({ bookIsbn: i.isbn, amount: i.amount });
    }

    const data = this.getFormData();
    data.orderDetails = orderDetails;

    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.postOrder(data).subscribe(res => {
      this.alertService.successResponse(startTime);
      this.cartService.clearCart();
      window.location.href = environment.thisUrl + 'customer/orders';
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private getFormData(): Order {
    const data = new Order();
    data.contact = this.form.controls.contact.value;
    data.address = this.form.controls.address.value;
    data.phone = this.form.controls.phone.value;
    data.note = this.form.controls.note.value;
    return data;
  }

}
