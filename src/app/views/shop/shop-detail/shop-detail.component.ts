import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup} from '@angular/forms';

import {Book} from 'src/app/models/book';
import {Cart} from 'src/app/models/cart';
import {BookComment} from 'src/app/models/comment';

import {AuthService} from 'src/app/services/auth/auth.service';
import {ShopService} from 'src/app/services/shop.service';
import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {BookCommentService} from 'src/app/services/comment.service';
import {CartService} from '../../../services/cart.service';
import {PlaceholderService} from '../../../services/common/placeholder.service';
import { isNgTemplate } from '@angular/compiler';
import { FormFunc } from 'src/app/common/function';

@Component({
  selector: 'app-shop-detail',
  templateUrl: './shop-detail.component.html'
})
export class ShopDetailComponent implements OnInit {
  data: Book;
  customerId: number;
  id: string;
  url: string;
  bookcart: Cart;
  amount: number;
  ratings: any[];
  auth = false;
  form: FormGroup;
  commentDialog = false;
  commentEditing = false;
  comment: BookComment;

  constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,
              private service: ShopService, private cartService: CartService, private commentService: BookCommentService,
              private alertService: AlertMessageService, private authService: AuthService, public placeholderService: PlaceholderService) { }

  ngOnInit() {
    this.url = window.location.href;
    this.id = this.route.snapshot.paramMap.get('id');
    this.auth = this.authService.isLogged();
    this.customerId = parseInt(this.authService.getToken('nameid'), 10);
    this.alertService.clear();

    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.get(this.id).subscribe(res => {
      this.data = res;
      this.initForm();
      this.initBookRating();
      this.initBookcart();
      this.initBookViewed();
      this.alertService.success(startTime, 'GET');
    }, err => {
      this.alertService.failed(err);
      this.router.navigate(['/']);
    });
  }

  private initBookcart() {
    this.bookcart = this.cartService.getCart(this.data.isbn);
    if (!this.bookcart) { this.bookcart = new Cart(this.data, 0); }
    this.amount = this.bookcart.amount;
  }

  private initBookRating() {
    this.data.rating = this.data.bookComments.length === 0 ? 0 : this.data.bookComments.map(e => e.rating).reduce((a, b) => a + b, 0) / this.data.bookComments.length;
    this.ratings = this.service.mapRating(this.data.bookComments, 5, 'rating');
    for (let rating of this.data.bookComments) rating.updatedFromNow = FormFunc.translateDateTimeFromNow(FormFunc.toJsDate(rating.updatedAt));
  }

  private initBookViewed() {
    this.cartService.addViewed(this.data);
  }

  private initForm() {
    this.form = this.formBuilder.group({
      comment: [''],
    });
    this.comment = new BookComment();
    this.comment.rating = 3;
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

  onChangeRating(value) {
    this.comment.rating = value;
  }

  onOpenComment(item: BookComment) {
    this.commentDialog = true;

    if (!item) {
      this.comment = new BookComment();
      this.commentEditing = false;
      this.comment.rating = 3;
      this.comment.comment = '';
      this.form.controls.comment.setValue('');
    } else {
      this.comment = item;
      this.commentEditing = true;
      this.form.controls.comment.setValue(item.comment);
    }
  }

  onSubmitComment() {
    if (this.commentEditing === true) { this.updateComment(); } else { this.storeComment(); }
  }

  private storeComment() {
    this.comment.comment = this.form.controls.comment.value;
    this.comment.customerId = this.customerId;
    this.comment.bookIsbn = this.id;

    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.commentService.post(this.comment).subscribe(res => {
        this.data.bookComments.unshift(res);
        this.initBookRating();
        this.initForm();

        this.commentDialog = false;
        this.comment = null;
        this.alertService.success(startTime, 'POST');
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  private updateComment() {
    this.comment.comment = this.form.controls.comment.value;
    this.comment.customerId = this.customerId;

    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.commentService.put(this.comment).subscribe(res => {
        const item = this.data.bookComments.find(x => x.id === res.id);
        item.rating = res.rating;
        item.comment = res.comment;
        item.updatedAt = res.updatedAt;
        this.initBookRating();
        this.initForm();

        this.alertService.success(startTime, 'PUT');
        this.commentDialog = false;
        this.comment = null;
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  onDeleteComment(id: number) {
    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.commentService.destroy(id).subscribe(res => {
        this.data.bookComments = this.data.bookComments.filter(x => x.id !== res.id);
        this.initBookRating();
        this.initForm();

        this.alertService.success(startTime, 'DELETE');
        this.commentDialog = false;
        this.comment = null;
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }
}
