import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from '@angular/router';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Subject, Observable, merge, forkJoin} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';

import {BookService} from 'src/app/services/book.service';
import {BookCategoryService} from 'src/app/services/category.service';
import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {Book} from 'src/app/models/book';
import {Const} from 'src/app/common/const';
import {FormFunc, FileFunc, DataFunc, ImageFunc} from 'src/app/common/function';
import {BookCategory} from 'src/app/models/category';
import {PlaceholderService} from '../../../services/common/placeholder.service';
import {BookCommentService} from '../../../services/comment.service';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html'
})
export class BookDetailComponent implements OnInit {
  data: Book;
  imageTransform: string;
  categories: BookCategory[];
  id: string;
  form: FormGroup;

  commentPage = 1;
  commentPageSize: number = Const.PAGE_SIZE_DEFAULT;
  commentFilter = '';
  commentSorted = 'customer';
  commentSortedDirection = 'asc';

  // view child for NgbTypeahead
  @ViewChild('ngt', { static: false }) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    );
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? Const.LANGUAGE : Const.LANGUAGE.filter(e => e.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: BookService,
    private alertService: AlertMessageService,
    private categoryService: BookCategoryService,
    private commentService: BookCommentService,
    public placeholderService: PlaceholderService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.alertService.clear();

    const getBook = this.service.get(this.id);
    const fetchCategories = this.categoryService.fetch();
    const startTime = this.alertService.startTime();
    forkJoin([getBook, fetchCategories]).subscribe(
      res => {
        this.data = res[0];
        this.categories = res[1];
        this.data.originalImage = res[0].image;
        this.data.rating = res[0].bookComments.length === 0 ? 0 : res[0].bookComments.map(e => e.rating).reduce((a, b) => a + b, 0) / res[0].bookComments.length;
        this.alertService.success(startTime, 'GET');
        this.initForm();
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  private initForm() {
    this.form = this.formBuilder.group({
      title: [this.data.title, [Validators.required, Validators.maxLength(255)]],
      author: [this.data.author, [Validators.required, Validators.maxLength(255)]],
      publisher: [this.data.publisher, [Validators.required, Validators.maxLength(255)]],
      published: [FormFunc.toNgbDate(this.data.published), [Validators.required]],
      price: [this.data.price, [Validators.required, Validators.min(0.0)]],
      page: [this.data.page, [Validators.required, Validators.min(0)]],
      language: [this.data.language, [Validators.required, Validators.maxLength(32)]],
      categoryId: [this.data.categoryId, [Validators.required]],
      active: [FormFunc.radioTrueFalse(this.data.active), [Validators.required]],
      info: [this.data.info],
      discount: [this.data.discount, [Validators.required, Validators.min(0)]]
    });
  }

  get filterComment() {
    switch (this.commentFilter) {
      case '1 star': case '2 star': case '3 star': case '4 star': case '5 star':
        const star = parseInt(this.commentFilter.substring(0, 1), 10);
        return !this.data ? null : this.data.bookComments.filter(x => x.rating === star);
      default:
        return !this.data ? null : this.data.bookComments.filter(x => x.customer.fullname.toLowerCase().includes(this.commentFilter.toLowerCase()) ||
          DataFunc.include(x, this.commentFilter, ['comment', 'createdAt']));
    }
  }

  onSortComment(sorting: string) {
    if (sorting == null) {
      return;
    }
    this.commentSortedDirection = this.commentSorted !== sorting ? 'asc' : (this.commentSortedDirection === 'asc' ? 'desc' : 'asc');
    this.commentSorted = sorting;

    switch (this.commentSorted) {
      case 'comment': case 'createdAt':
        this.data.bookComments = DataFunc.sortString(this.data.bookComments, this.commentSorted, this.commentSortedDirection);
        break;
      case 'rating':
        this.data.bookComments = DataFunc.sortNumber(this.data.bookComments, this.commentSorted, this.commentSortedDirection);
        break;
      case 'customer':
        this.data.bookComments = this.commentSortedDirection === 'asc' ?
          this.data.bookComments.sort((a, b) => a.customer.fullname.localeCompare(b.customer.fullname)) :
          this.data.bookComments.sort((a, b) => b.customer.fullname.localeCompare(a.customer.fullname));
        break;
    }
  }

  onChangeImage(event) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      FileFunc.convertFileToBase64(file)
        .then(res => {
          this.data.image = res.toString();
          const orientation = ImageFunc.GetOrientation(this.data.image);
          if (orientation && orientation !== 0 && orientation !== 1) {
            this.imageTransform = ImageFunc.TransformCss(orientation);
          }
        }).catch(err => {
          this.alertService.failed(err.message);
        });
    }
  }

  onRefreshImage() {
    this.service.get(this.id).subscribe(
      res => {
        this.data.originalImage = res.image;
        this.data.image = res.image;
      }, err => {
        this.alertService.failed(err.message);
      }
    );
  }

  onRefresh() {
    const startTime = this.alertService.startTime();
    this.service.get(this.id).subscribe(res => {
      this.data = res;
      this.data.originalImage = res.image;
      this.data.image = res.image;
      this.data.rating = res.bookComments.length === 0 ? 0 : res.bookComments.map(e => e.rating).reduce((a, b) => a + b, 0) / res.bookComments.length;
      this.alertService.success(startTime, 'GET');
      this.initForm();
    }, err => {
      this.alertService.failed(err.message);
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      FormFunc.touchControls(this.form.controls);
      return;
    }

    const item = new Book();
    item.isbn = this.data.isbn;
    item.title = this.form.controls.title.value;
    item.author = this.form.controls.author.value;
    item.categoryId = this.form.controls.categoryId.value;
    item.publisher = this.form.controls.publisher.value;
    item.published = FormFunc.fromNgbDateToJson(this.form.controls.published.value);
    item.language = this.form.controls.language.value;
    item.price = this.form.controls.price.value;
    item.page = this.form.controls.page.value;
    item.discount = this.form.controls.discount.value;
    item.active = this.form.controls.active.value;
    item.info = this.form.controls.info.value;
    item.updatedAt = this.data.updatedAt;
    if (this.data.originalImage !== this.data.image) { item.image = this.data.image; }

    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.put(item).subscribe(
      res => {
        this.data.title = res.title;
        this.data.author = res.author;
        this.data.published = res.published;
        this.data.publisher = res.publisher;
        this.data.categoryId = res.categoryId;
        this.data.price = res.price;
        this.data.page = res.page;
        this.data.discount = res.discount;
        this.data.active = res.active;
        this.data.language = res.language;
        this.data.info = res.info;
        this.data.createdAt = res.createdAt;
        this.data.updatedAt = res.updatedAt;

        this.alertService.success(startTime, 'PUT');
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  onDelete() {
    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.destroy(this.id).subscribe(res => {
        this.alertService.success(startTime, 'DELETE');
        this.router.navigate(['/']);
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
        this.data.rating = this.data.bookComments.length === 0 ? 0 : this.data.bookComments.map(e => e.rating).reduce((a, b) => a + b, 0) / this.data.bookComments.length;

        this.alertService.success(startTime, 'DELETE');
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }
}
