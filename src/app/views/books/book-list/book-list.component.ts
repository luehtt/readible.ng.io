import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {merge, Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';

import {Book} from 'src/app/models/book';
import {BookCategory} from 'src/app/models/category';
import {Common} from 'src/app/common/const';
import {FormGroupControl, DataControl, FileControl, TimestampControl} from 'src/app/common/function';
import {BookService} from 'src/app/services/book.service';
import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {BookCategoryService} from 'src/app/services/category.service';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html'
})
export class BookListComponent implements OnInit {
  data: Book[];
  categories: BookCategory[];
  editDialog = false;
  formGroup: FormGroup;
  upload: string;
  uploadFilename: string;

  page = 1;
  pageSize = Common.PAGE_SIZE_HIGHER;
  sortColumn = 'title';
  sortDirection = 'asc';
  filter = '';
  loaded: boolean;

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
  };

  constructor(private formBuilder: FormBuilder,
              private service: BookService,
              private alertService: AlertMessageService,
              private categoryService: BookCategoryService) {
  }

  ngOnInit() {
    this.alertService.clear();
    this.initData();
    this.initCategories();
  }

  private initData() {
    const startTime = this.alertService.startTime();
    this.service.fetch().subscribe(res => {
      this.data = res;
      this.alertService.success(startTime, 'GET');
      this.loaded = true;
    }, err => {
      this.alertService.failed(err);
    });
  }

  private initCategories() {
    const startTime = this.alertService.startTime();
    this.categoryService.fetch().subscribe(res => {
      this.categories = res;
      this.formGroup = this.initForm();
      this.alertService.success(startTime, 'GET');
    }, err => {
      this.alertService.failed(err);
    });
  }

  private initForm() {
    return this.formBuilder.group({
      isbn: ['', [Validators.required, Validators.maxLength(13), Validators.minLength(13)]],
      title: ['', [Validators.required, Validators.maxLength(255)]],
      author: ['', [Validators.required, Validators.maxLength(255)]],
      publisher: ['', [Validators.required, Validators.maxLength(255)]],
      published: ['', [Validators.required]],
      price: [0.0, [Validators.required, Validators.min(0.0)]],
      page: [0, [Validators.required, Validators.min(0)]],
      language: ['', [Validators.required, Validators.maxLength(32)]],
      categoryId: ['', [Validators.required]],
      active: ['true', [Validators.required]],
      discount: [0, [Validators.required]],
      info: ['']
    });
  }

  get dataFilter() {
    return DataControl.filter(this.data, this.filter, ['title', 'author', 'isbn', 'published', 'price', 'category.name']);
  }

  onSort(sortedColumn: string) {
    if (!sortedColumn) { return; }
    this.sortDirection = DataControl.sortDirection(this.sortColumn, sortedColumn, this.sortDirection);
    this.sortColumn = sortedColumn;
    this.data = DataControl.sort(this.data, this.sortColumn, this.sortDirection);
  }

  onUploadImage(event) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      FileControl.convertFileToBase64(file)
        .then(result => {
          this.uploadFilename = event.target.files[0].name;
          this.upload = result.toString();
        })
        .catch(err => {
          this.alertService.failed(err);
        });
    }
  }

  private getData(formGroup: FormGroup): Book {
    const item = new Book();
    const formControl = formGroup.controls;

    item.isbn = formControl.isbn.value;
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

    if (this.upload && this.uploadFilename) item.image = this.upload;
    return item;
  }

  onSubmit() {
    if (FormGroupControl.validateForm(this.formGroup) == false) { return; }
    const item = this.getData(this.formGroup);

    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.post(item).subscribe(
      res => {
        this.data.push(res);
        this.resetForm();
        this.alertService.success(startTime, 'POST');
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  private resetForm() {
    this.initForm();
    this.upload = '';
    this.uploadFilename = '';
  }

}
