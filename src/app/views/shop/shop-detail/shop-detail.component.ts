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

@Component({
  selector: 'app-shop-detail',
  templateUrl: './shop-detail.component.html'
})
export class ShopDetailComponent implements OnInit {

  data: Book;
  id: string;
  url: string;
  bookcart: Cart;
  amount: number;
  ratings: any[];
  auth = false;
  form: FormGroup;
  commentDialog = false;
  comment: BookComment;

  constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,
              private service: ShopService, private cartService: CartService, private commentService: BookCommentService,
              private alertService: AlertMessageService, private authService: AuthService, public placeholderService: PlaceholderService) { }

  ngOnInit() {
    this.url = window.location.href;
    this.id = this.route.snapshot.paramMap.get('id');
    this.auth = this.authService.isLogged();
    this.alertService.clear();

    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.get(this.id).subscribe(res => {
      this.data = res;
      this.ngOnInitForm();
      this.ngOnInitRating();
      this.ngOnInitBookcart();
      this.ngOnInitViewed();
      this.alertService.success(startTime, 'GET');
    }, err => {
      this.alertService.failed(err);
      this.router.navigate(['/']);
    });
  }

  ngOnInitBookcart() {
    this.bookcart = this.cartService.getCart(this.data.isbn);
    if (!this.bookcart) { this.bookcart = new Cart(this.data, 0); }
    this.amount = this.bookcart.amount;
  }

  ngOnInitRating() {
    this.data.rating = this.data.bookComments.length === 0 ? 0 : this.data.bookComments.map(e => e.rating).reduce((a, b) => a + b, 0) / this.data.bookComments.length;
    this.ratings = this.service.mapRating(this.data.bookComments, 5, 'rating');
  }

  ngOnInitForm() {
    this.form = this.formBuilder.group({
      comment: [''],
    });
    this.comment = new BookComment();
    this.comment.rating = 3;
  }

  ngOnInitViewed() {
    this.cartService.addViewed(this.data);
  }

  clickAddCart() {
    this.cartService.addCart(this.data, this.amount);
    this.bookcart = this.cartService.getCart(this.data.isbn);
  }

  clickClearCart() {
    this.amount = 0;
    this.cartService.addCart(this.data, this.amount);
    this.bookcart = this.cartService.getCart(this.data.isbn);
  }

  changeAmount(value: string) {
    this.amount = parseInt(value, 10);
  }

  changeRating(value) {
    this.comment.rating = value;
  }

  clickSummit() {
    this.comment.comment = this.form.controls.comment.value;
    this.comment.bookIsbn = this.id;

    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.commentService.post(this.comment).subscribe(res => {
        this.data.bookComments.unshift(res);
        this.ngOnInitRating();
        this.ngOnInitForm();
        this.commentDialog = false;
        this.comment = null;
        this.alertService.success(startTime, 'POST');
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }
}
