import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Book } from 'src/app/models/book';
import { Cart } from 'src/app/models/cart';
import { BookComment } from 'src/app/models/comment';

import { AuthService } from 'src/app/services/auth/auth.service';
import { ShopService } from 'src/app/services/shop.service';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { BookCommentService } from 'src/app/services/comment.service';
import { CartService } from '../../../services/cart.service';
import { PlaceholderService } from '../../../services/common/placeholder.service';
import { TimestampControl, DataControl, FormGroupControl } from 'src/app/common/function';

@Component({
  selector: 'app-shop-detail',
  templateUrl: './shop-detail.component.html'
})
export class ShopDetailComponent implements OnInit {
  auth = false;
  customerId: number;
  id: string;
  url: string;

  bookcart: Cart;
  data: Book;
  similar: Book[];
  amount: number;
  ratings: any[];
  form: FormGroup;

  editData: BookComment;
  editDialog = false;
  isEdit = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private service: ShopService,
    private cartService: CartService,
    private commentService: BookCommentService,
    private alertService: AlertMessageService,
    private placeholderService: PlaceholderService) { }

  ngOnInit() {
    this.alertService.clear();
    this.id = this.getParam();
    if (!this.id) return;

    this.url = window.location.href;
    this.auth = this.authService.isLogged();
    this.customerId = parseInt(this.authService.getToken('nameid'), 10);
    this.initData();
  }

  private getParam(): string | null {
    const value = this.route.snapshot.paramMap.get('id');
    return DataControl.isDigit(value) && value.length === 13 ? value : this.getParamFailed(value);
  }

  private getParamFailed(parameter: string): null {
    this.alertService.mismatchParameter(parameter);
    return null;
  }

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  private initData() {
    const startTime = this.alertService.startTime();
    this.service.get(this.id).subscribe(res => {
      this.data = res;
      this.initForm();
      this.initExtendedData();
      this.initSimilarBook();
      this.initCart();
      this.initViewed();
      this.alertService.successResponse(startTime);
    }, err => {
      this.alertService.errorResponse(err, startTime);
      this.router.navigate(['/']);
    });
  }

  private initSimilarBook() {
    const startTime = this.alertService.startTime();
    this.service.getSimilar(this.id).subscribe(res => {
      this.similar = res;
      this.alertService.successResponse(startTime);
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private initForm() {
    this.form = this.formBuilder.group({
      comment: [''],
    });
    this.editData = new BookComment();
    this.editData.rating = 3;
    this.editData.bookIsbn = this.id;
    this.editData.customerId = this.customerId;
  }

  private initCart() {
    this.bookcart = this.cartService.getCart(this.data.isbn);
    if (!this.bookcart) { this.bookcart = new Cart(this.data, 0); }
    this.amount = this.bookcart.amount;
  }

  private initViewed() {
    this.cartService.addViewed(this.data);
  }

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  private initExtendedData() {
    this.data.rating = this.calcRating(this.data.bookComments);
    this.data.image = this.renderImage(this.data);
    this.data.bookComments = this.translateDateTimeFromNow(this.data.bookComments);
    this.ratings = this.populateRating(this.data.bookComments, 5, 'rating');
  }

  private renderImage(data: Book) {
    return data.image ? data.image : this.placeholderService.imgHolder(250, 350, data.title);
  }

  private calcRating(data: BookComment[]) {
    return data.length === 0 ? 0 : data.map(e => e.rating).reduce((a, b) => a + b, 0) / data.length;
  }

  private populateRating(data: BookComment[], amount: number, property: string) {
    if (!data || !property || amount < 1) { return null; }
    const a = [];

    for (let i = 1; i <= amount; i++) { a.push({ name: i, sum: 0, percent: 0 }); }
    for (const d of data) {
      for (let i = 1; i <= amount; i++) {
        if (d[property] !== i) { continue; }
        a[i - 1].sum++;
      }
    }

    for (const d of a) { d.percent = d.sum * 100 / data.length; }
    return a;
  }

  private translateDateTimeFromNow(data: BookComment[]) {
    for (let i of data) {
      i.updatedFromNow = TimestampControl.translateDateTimeFromNow(TimestampControl.jsDate(i.updatedAt));
    }
    return data;
  }

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  onChangeAmount(value: string) {
    this.amount = parseInt(value, 10);
  }

  onAddCart() {
    this.cartService.addCart(this.data, this.amount);
    this.bookcart = this.cartService.getCart(this.data.isbn);
  }

  onClearCart() {
    this.amount = 0;
    this.cartService.addCart(this.data, this.amount);
    this.bookcart = this.cartService.getCart(this.data.isbn);
  }

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  onChangeRating(value: number) {
    this.editData.rating = value;
  }

  onEditComment(data: BookComment) {
    this.editDialog = true;
    this.editData = data ? DataControl.clone(data, true) : new BookComment();
    this.isEdit = !!data;
    this.editDialog = true;
    this.form.controls.comment.setValue(this.editData.comment);
  }

  onSubmitComment() {
    this.isEdit === true ? this.updateComment() : this.storeComment();
  }

  private getFormData(item: BookComment, form: FormGroup): BookComment {
    item.comment = form.controls.comment.value;
    return item;
  }

  private storeComment() {
    if (FormGroupControl.validateForm(this.form) === false) { return; }
    const data = DataControl.clone(this.getFormData(this.editData, this.form));
    data.customerId = this.customerId;
    data.bookIsbn = this.id;

    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.commentService.post(data).subscribe(res => {
      this.data.bookComments.unshift(res);
      this.alertService.successResponse(startTime);
      this.refreshComment();
    },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  private updateComment() {
    if (FormGroupControl.validateForm(this.form) === false) { return; }
    const data = DataControl.clone(this.getFormData(this.editData, this.form));

    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.commentService.put(data).subscribe(res => {
      this.data.bookComments = DataControl.updateItem(this.data.bookComments, res, 'id');
      this.alertService.successResponse(startTime);
      this.refreshComment();
    },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  onDeleteComment(id: number) {
    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.commentService.destroy(id).subscribe(res => {
      this.data.bookComments = DataControl.deleteItem(this.data.bookComments, res, 'id');
      this.alertService.successResponse(startTime);
      this.refreshComment();
    },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  private refreshComment() {
    this.initExtendedData();
    this.initForm();
    this.editDialog = false;
    this.editData = null;
  }
}
