import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

import { BookService } from 'src/app/services/book.service';
import { BookCategoryService } from 'src/app/services/category.service';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { Book } from 'src/app/models/book';
import { Common } from 'src/app/common/const';
import { FormGroupControl, DataControl, FileControl, TimestampControl } from 'src/app/common/function';
import { BookCategory } from 'src/app/models/category';
import { PlaceholderService } from '../../../services/common/placeholder.service';
import { BookCommentService } from '../../../services/comment.service';
import { BookComment } from 'src/app/models/comment';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html'
})
export class BookDetailComponent implements OnInit {
  id: string;
  data: Book;
  imageTransform: string;
  categories: BookCategory[];
  formGroup: FormGroup;

  loaded: boolean;
  commentPage = 1;
  commentPageSize: number = Common.PAGE_SIZE_SMALLER;
  commentFilter = '';
  commentSortColumn = 'customer';
  commentSortDirection = 'asc';

  // view child for NgbTypeahead
  @ViewChild('instance', { static: false }) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? Common.LANGUAGE
        : Common.LANGUAGE.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
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
    private placeholderService: PlaceholderService
  ) { }

  ngOnInit() {
    this.alertService.clear();
    this.id = this.getParam();
    if (!this.id) { return; }

    this.initCategories();
    this.initData();
  }

  get imageData() {
    return this.data.image ? this.data.image : this.placeholderService.imgHolder(500, 700, this.data.title);
  }

  private getParam(): string | null {
    const value = this.route.snapshot.paramMap.get('id');
    if (DataControl.isDigit(value) && value.length === 13) {
      return value;
    } else {
      return this.getParamFailed(value);
    }
  }

  private getParamFailed(parameter: string): null {
    this.alertService.mismatchParameter(parameter);
    return null;
  }

  private initCategories() {
    const startTime = this.alertService.startTime();
    this.categoryService.fetch().subscribe(res => {
      this.categories = res;
      this.alertService.successResponse(startTime);
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private initData() {
    const startTime = this.alertService.startTime();
    this.service.get(this.id).subscribe(res => {
      this.data = this.calcDataDetail(res);
      this.formGroup = this.initForm(this.data);
      this.alertService.successResponse(startTime);
      this.loaded = true;
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private calcDataDetail(res: Book): Book {
    if (res.image) { res.originalImage = res.image; }
    if (res.bookComments) { res.rating = this.calcDataRating(res.bookComments); }
    return res;
  }

  private calcDataRating(comments: BookComment[]): number {
    const length = comments.length;
    return length === 0 ? 0 : comments.map(e => e.rating).reduce((a, b) => a + b, 0) / comments.length;
  }

  private initForm(data: Book): FormGroup {
    return this.formBuilder.group({
      title: [data.title, [Validators.required, Validators.maxLength(255)]],
      author: [data.author, [Validators.required, Validators.maxLength(255)]],
      publisher: [data.publisher, [Validators.required, Validators.maxLength(255)]],
      published: [TimestampControl.toNgbDate(this.data.published), [Validators.required]],
      price: [data.price, [Validators.required, Validators.min(0.0)]],
      page: [data.page, [Validators.required, Validators.min(0)]],
      language: [data.language, [Validators.required, Validators.maxLength(32)]],
      categoryId: [data.categoryId, [Validators.required]],
      active: [TimestampControl.radioTrueFalse(data.active), [Validators.required]],
      info: [data.info],
      discount: [data.discount, [Validators.required, Validators.min(0)]]
    });
  }

  get filterComment(): BookComment[] {
    switch (this.commentFilter) {
      case '1 star': case '2 star': case '3 star': case '4 star': case '5 star':
        return DataControl.filter(this.data.bookComments, this.commentFilter.substring(0, 1), ['rating']);
      default:
        return DataControl.filter(this.data.bookComments, this.commentFilter, ['customer.fullname', 'comment', 'updatedAt']);
    }
  }

  onSortComment(sortedColumn: string) {
    if (sortedColumn == null) { return; }
    this.commentSortDirection = DataControl.sortDirection(this.commentSortColumn, sortedColumn, this.commentSortDirection);
    this.commentSortColumn = sortedColumn;
    this.data.bookComments = DataControl.sort(this.data.bookComments, this.commentSortColumn, this.commentSortDirection);
  }

  onChangeImage(event) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      FileControl.convertFileToBase64(file)
        .then(res => {
          this.data.image = res.toString();
          const orientation = FileControl.getOrientation(this.data.image);
          if (orientation && orientation !== 0 && orientation !== 1) {
            this.imageTransform = FileControl.imageTransform(orientation);
          }
        }).catch(err => {
          this.alertService.error(err.message);
        });
    }
  }

  onRefreshImage() {
    this.service.get(this.id).subscribe(
      res => {
        this.data.originalImage = res.image;
        this.data.image = res.image;
      }, err => {
        this.alertService.errorResponse(err);
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
      this.alertService.successResponse(startTime);
      this.initData();
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private getFormData(data: Book, formGroup: FormGroup): Book {
    const item = DataControl.clone(data);
    const formControl = formGroup.controls;

    item.title = formControl.title.value;
    item.author = formControl.author.value;
    item.categoryId = formControl.categoryId.value;
    item.publisher = formControl.publisher.value;
    item.published = TimestampControl.fromNgbDateToJson(formControl.published.value);
    item.language = formControl.language.value;
    item.price = formControl.price.value;
    item.page = formControl.page.value;
    item.discount = formControl.discount.value;
    item.active = formControl.active.value;
    item.info = formControl.info.value;

    if (item.image === item.originalImage) { delete (item.image); }
    if (!item.image) { item.image = 'null'; }
    return item;
  }

  onSubmit() {
    if (FormGroupControl.validateForm(this.formGroup) === false) { return; }
    const data = this.getFormData(this.data, this.formGroup);

    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.put(data).subscribe(
      res => {
        this.data = DataControl.read(res, this.data, true);
        this.data = this.calcDataDetail(this.data);
        this.imageTransform = null;
        this.alertService.successResponse(startTime);
      },
      err => {
        this.data.image = this.data.originalImage;
        this.imageTransform = null;
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  onDelete() {
    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.destroy(this.id).subscribe(res => {
      this.alertService.successResponse(startTime);
      this.router.navigate(['/admin/books']);
    },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  onDeleteComment(id: number) {
    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.commentService.destroy(id).subscribe(res => {
      this.data.bookComments = DataControl.deleteItem(this.data.bookComments, res, 'id');
      this.data.rating = this.calcDataRating(this.data.bookComments);
      this.alertService.successResponse(startTime);
    },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }
}
