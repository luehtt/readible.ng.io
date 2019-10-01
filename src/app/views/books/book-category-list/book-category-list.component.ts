import {Component, OnInit} from '@angular/core';
import {BookCategory} from '../../../models/category';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BookCategoryService} from '../../../services/category.service';
import {AlertMessageService} from '../../../services/common/alert-message.service';
import {FormGroupControl, DataControl, TimestampControl} from '../../../common/function';
import {Common} from '../../../common/const';

@Component({
  selector: 'app-book-category-list',
  templateUrl: './book-category-list.component.html'
})
export class BookCategoryListComponent implements OnInit {

  data: BookCategory[];
  formGroup: FormGroup;
  editData: BookCategory;
  editDialog = false;
  isEdit = false;

  loaded: boolean;
  filter = '';
  page = 1;
  pageSize = Common.PAGE_SIZE_SMALLER;
  sortColumn = 'name';
  sortDirection = 'asc';

  constructor(private formBuilder: FormBuilder, private service: BookCategoryService, private alertService: AlertMessageService) { }

  ngOnInit() {
    this.alertService.clear();
    this.initData();
  }

  private initData() {
    const startTime = this.alertService.startTime();
    this.service.fetch().subscribe(res => {
      this.data = res;
      this.formGroup = this.initForm();
      this.alertService.success(startTime, 'GET');
      this.loaded = true;
    }, err => {
      this.alertService.failed(err);
    });
  }

  private initForm() {
    return this.formBuilder.group({
      name: ['', [Validators.required]],
    });
  }

  get dataFilter(): BookCategory[] {
    return DataControl.filter(this.data, this.filter, ['name', 'createdAt', 'updatedAt']);
  }

  onSort(sortedColumn: string) {
    if (!sortedColumn) { return; }
    this.sortDirection = DataControl.sortDirection(this.sortColumn, sortedColumn, this.sortDirection);
    this.sortColumn = sortedColumn;
    this.data = DataControl.sort(this.data, this.sortColumn, this.sortDirection);
  }

  onEdit(data: BookCategory) {
    this.editData = data ? DataControl.clone(data) : new BookCategory();
    this.editDialog = true;
    this.isEdit = !!data;
    this.formGroup.controls.name.setValue(this.editData.name);
  }

  onSubmit() {
    this.isEdit === true ? this.updateItem() : this.storeItem();
  }

  private readData(item: BookCategory, form: FormGroup): BookCategory {
    item.name = form.controls.name.value;
    return item;
  }

  private resetSummit() {
    this.editData = null;
    this.editDialog = false;
    this.initForm();
  }

  private storeItem() {
    if (FormGroupControl.validateForm(this.formGroup) === false) { return; }
    this.editData = this.readData(this.editData, this.formGroup);

    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.post(this.editData).subscribe(res => {
      this.data.push(res);
      this.alertService.success(startTime, 'POST');
      this.resetSummit();
    }, err => {
      this.alertService.failed(err);
    });
  }

  private updateItem() {
    if (FormGroupControl.validateForm(this.formGroup) === false) { return; }
    this.editData = this.readData(this.editData, this.formGroup);

    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.put(this.editData).subscribe(res => {
      this.data = DataControl.updateItem(this.data, res, 'id');
      this.alertService.success(startTime, 'PUT');
      this.resetSummit();
    }, err => {
      this.alertService.failed(err);
    });
  }

  onDelete(id: number) {
    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.destroy(id).subscribe(res => {
      this.data = DataControl.deleteItem(this.data, res, 'id');
      this.alertService.success(startTime, 'DELETE');
      this.resetSummit();
    }, err => {
      this.alertService.failed(err);
    });
  }
}
