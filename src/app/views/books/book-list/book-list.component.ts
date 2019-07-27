import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Observable, merge, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

import { Book } from 'src/app/models/book';
import { BookCategory } from 'src/app/models/category';
import { Const } from 'src/app/common/const';
import { FormImplemented, DataImplemented, FileImplemented } from 'src/app/common/function';

import { BookService } from 'src/app/services/book.service';
import { AlertService } from 'src/app/services/common/alert.service';
import { BookCategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html'
})
export class BookListComponent implements OnInit {
  data: Book[];
  filter = '';
  createDialog = false;
  categories: BookCategory[];
  form: FormGroup;
  create: Book;
  createFilename: string;
  page = 1;
  pageSize: number = Const.PAGE_SIZE_DEFAULT;
  sorted = 'title';
  sortedDirection = 'asc';

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

  constructor(private formBuilder: FormBuilder, private service: BookService, private alertService: AlertService, private categoryService: BookCategoryService) {
  }

  ngOnInitForm() {
    this.form = this.formBuilder.group({
      isbn: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
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

  ngOnInit() {
    this.alertService.clear();

    const fetchBooks = this.service.fetch();
    const fetchCategories = this.categoryService.fetch();

    const startTime = this.alertService.initTime();
    forkJoin([fetchBooks, fetchCategories]).subscribe(
      res => {
        this.data = res[0];
        this.categories = res[1];
        this.alertService.success(startTime, 'GET');
        this.ngOnInitForm();
        this.create = new Book();
      },
      err => {
        this.alertService.failed(err);
        this.createDialog = null;
      }
    );
  }

  get dataFilter() {
    return !this.data ? null : this.data.filter(x => x.category.name.toLowerCase().includes(this.filter.toLowerCase()) ||
      DataImplemented.include(x, this.filter, ['title', 'author', 'isbn', 'publisher', 'published']) ||
      DataImplemented.includeNumber(x, this.filter, ['price']));
  }

  onSort(sorting: string) {
    if (sorting == null) {
      return;
    }
    this.sortedDirection = this.sorted !== sorting ? 'asc' : (this.sortedDirection === 'asc' ? 'desc' : 'asc');
    this.sorted = sorting;

    switch (this.sorted) {
      case 'isbn': case 'title': case 'author': case 'publisher': case 'published':
        this.data = DataImplemented.sortString(this.data, this.sorted, this.sortedDirection);
        break;
      case 'price':
        this.data = DataImplemented.sortNumber(this.data, this.sorted, this.sortedDirection);
        break;
      case 'category':
        this.data = this.sortedDirection === 'asc' ?
          this.data.sort((a, b) => a.category.name.localeCompare(b.category.name)) :
          this.data.sort((a, b) => b.category.name.localeCompare(a.category.name));
        break;
    }
  }

  onChangeImage(event) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      FileImplemented.convertFileToBase64(file)
        .then(result => {
          this.createFilename = event.target.files[0].name;
          this.create.image = result.toString();
        })
        .catch(err => {
          this.alertService.failed(err);
        });
    }
  }

  clickSummit() {
    if (this.form.invalid) {
      FormImplemented.touchControls(this.form.controls);
      return;
    }

    const startTime = this.alertService.initTime();
    this.create.isbn = this.form.controls.isbn.value;
    this.create.title = this.form.controls.title.value;
    this.create.author = this.form.controls.author.value;
    this.create.categoryId = this.form.controls.categoryId.value;
    this.create.publisher = this.form.controls.publisher.value;
    this.create.published = FormImplemented.convertFromNgbDate(this.form.controls.published.value);
    this.create.language = this.form.controls.language.value;
    this.create.price = this.form.controls.price.value;
    this.create.page = this.form.controls.page.value;
    this.create.discount = this.form.controls.discount.value;
    this.create.info = this.form.controls.info.value;
    this.create.active = this.form.controls.active.value;

    this.service.post(this.create).subscribe(
      res => {
        this.data.push(res);
        this.alertService.success(startTime, 'POST');
        this.resetSummit();
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  resetSummit() {
    this.ngOnInitForm();
    this.create = new Book();
    this.createDialog = false;
    this.createFilename = '';
  }

}
