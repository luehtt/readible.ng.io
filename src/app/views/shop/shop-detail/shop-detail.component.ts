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

  constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,
    private service: ShopService, private cartService: CartService, private commentService: BookCommentService,
    private alertService: AlertMessageService, private authService: AuthService, public placeholderService: PlaceholderService) { }

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
    if (DataControl.isDigit(value) && value.length === 13) {
      return value;
    }
    else {
      return this.getParamFailed(value);
    }
  }

  private getParamFailed(parameter: string): null {
    this.alertService.mismatchParameter(parameter);
    return null;
  }

  private initData() {
    const startTime = this.alertService.startTime();
    this.service.get(this.id).subscribe(res => {
      this.data = res;
      this.initForm();
      this.initBookRating();
      this.initBookcart();
      this.initBookViewed();
      this.initSimilar();
      this.alertService.successResponse(startTime);
    }, err => {
      this.alertService.errorResponse(err, startTime);
      this.router.navigate(['/']);
    });
  }

  private initSimilar() {
    const startTime = this.alertService.startTime();
    this.service.getSimilar(this.id).subscribe(res => {
      this.similar = res;
      this.alertService.successResponse(startTime);
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private initBookcart() {
    this.bookcart = this.cartService.getCart(this.data.isbn);
    if (!this.bookcart) { this.bookcart = new Cart(this.data, 0); }
    this.amount = this.bookcart.amount;
  }

  private initBookRating() {
    this.data.rating = this.data.bookComments.length === 0 ? 0 : this.data.bookComments.map(e => e.rating).reduce((a, b) => a + b, 0) / this.data.bookComments.length;
    this.ratings = this.service.calcRating(this.data.bookComments, 5, 'rating');
    for (let rating of this.data.bookComments) rating.updatedFromNow = TimestampControl.translateDateTimeFromNow(TimestampControl.jsDate(rating.updatedAt));
  }

  private initBookViewed() {
    this.cartService.addViewed(this.data);
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

  onAddCart() {
    this.cartService.addCart(this.data, this.amount);
    this.bookcart = this.cartService.getCart(this.data.isbn);
  }

  onClearCart() {
    this.amount = 0;
    this.cartService.addCart(this.data, this.amount);
    this.bookcart = this.cartService.getCart(this.data.isbn);
  }

  onChangeAmount(value: string) {
    this.amount = parseInt(value, 10);
  }

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

  onSubmit() {
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
      this.initBookRating();
      this.initForm();

      this.editDialog = false;
      this.editData = null;
      this.alertService.successResponse(startTime);
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
      this.initBookRating();
      this.initForm();
      this.alertService.successResponse(startTime);
      this.editDialog = false;
      this.editData = null;
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
      this.initBookRating();
      this.initForm();

      this.alertService.successResponse(startTime);
      this.editDialog = false;
      this.editData = null;
    },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }
}
