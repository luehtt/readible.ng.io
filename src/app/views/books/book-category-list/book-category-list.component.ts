import {Component, OnInit} from '@angular/core';
import {BookCategory} from '../../../models/category';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BookCategoryService} from '../../../services/category.service';
import {AlertMessageService} from '../../../services/common/alert-message.service';
import {FormFunc, DataFunc} from '../../../common/function';
import {Const} from '../../../common/const';

@Component({
  selector: 'app-book-category-list',
  templateUrl: './book-category-list.component.html'
})
export class BookCategoryListComponent implements OnInit {

  data: BookCategory[];
  createDialog = false;
  create: BookCategory;
  form: FormGroup;
  filter = '';
  page = 1;
  pageSize: number = Const.PAGE_SIZE_SMALLER;
  sorted = 'name';
  sortedDirection = 'asc';

  constructor(private formBuilder: FormBuilder, private service: BookCategoryService, private alertService: AlertMessageService) { }

  ngOnInitForm() {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.alertService.clear();

    const startTime = this.alertService.startTime();
    this.service.fetch().subscribe(res => {
      this.data = res;
      this.alertService.success(startTime, 'GET');
      this.ngOnInitForm();
      this.create = new BookCategory();
    }, err => {
      this.alertService.failed(err);
    });
  }

  get dataFilter() {
    return !this.data ? null : this.data.filter(x => DataFunc.include(x, this.filter, ['name', 'createdAt', 'updatedAt']));
  }

  onSort(sorting: string) {
    if (sorting == null) {
      return;
    }

    this.sortedDirection = this.sorted !== sorting ? 'asc' : (this.sortedDirection === 'asc' ? 'desc' : 'asc');
    this.sorted = sorting;
    this.data = DataFunc.sortString(this.data, this.sorted, this.sortedDirection);
  }

  clickSummit() {
    if (this.form.invalid) {
      FormFunc.touchControls(this.form.controls);
      return;
    }

    this.create.name = this.form.controls.name.value;

    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.post(this.create).subscribe(res => {
      this.data.push(res);
      this.alertService.success(startTime, 'GET');
      this.resetSummit();
    }, err => {
      this.alertService.failed(err);
    });
  }

  resetSummit() {
    this.create = new BookCategory();
    this.createDialog = false;
    this.ngOnInitForm();
  }

}
