import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Common } from '../../../common/const';
import { DataControl, FormGroupControl } from '../../../common/function';
import { BookCategory } from '../../../models/category';
import { BookCategoryService } from '../../../services/category.service';
import { AlertMessageService } from '../../../services/common/alert-message.service';

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
  pageSize = Common.PAGE_SIZE_DEFAULT;
  sortColumn = 'name';
  sortDirection = 'asc';

  constructor(private formBuilder: FormBuilder, private service: BookCategoryService, private alertService: AlertMessageService) { }

  ngOnInit(): void {
    this.alertService.clear();
    this.initData();
  }

  private initData(): void {
    const startTime = this.alertService.startTime();
    this.service.fetch().subscribe(res => {
      this.data = res;
      this.formGroup = this.initForm();
      this.alertService.successResponse(startTime);
      this.loaded = true;
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private initForm(): any {
    return this.formBuilder.group({
      name: ['', [Validators.required]],
    });
  }

  get dataFilter(): BookCategory[] {
    return DataControl.filter(this.data, this.filter, ['name', 'createdAt', 'updatedAt']);
  }

  onSort(sortedColumn: string): void {
    if (!sortedColumn) { return; }
    this.sortDirection = DataControl.sortDirection(this.sortColumn, sortedColumn, this.sortDirection);
    this.sortColumn = sortedColumn;
    this.data = DataControl.sort(this.data, this.sortColumn, this.sortDirection);
  }

  onEdit(data: BookCategory): void {
    this.editData = data ? DataControl.clone(data) : new BookCategory();
    this.editDialog = true;
    this.isEdit = !!data;
    this.formGroup.controls.name.setValue(this.editData.name);
  }

  onSubmit(): void {
    this.isEdit === true ? this.updateItem() : this.storeItem();
  }

  private getFormData(item: BookCategory, form: FormGroup): BookCategory {
    item.name = form.controls.name.value;
    return item;
  }

  private resetSummit(): void {
    this.editData = null;
    this.editDialog = false;
    this.initForm();
  }

  private storeItem(): void {
    if (FormGroupControl.validateForm(this.formGroup) === false) { return; }
    this.editData = this.getFormData(this.editData, this.formGroup);

    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.post(this.editData).subscribe(res => {
      this.data.push(res);
      this.alertService.successResponse(startTime);
      this.resetSummit();
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  private updateItem(): void {
    if (FormGroupControl.validateForm(this.formGroup) === false) { return; }
    this.editData = this.getFormData(this.editData, this.formGroup);

    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.put(this.editData).subscribe(res => {
      this.data = DataControl.updateItem(this.data, res, 'id');
      this.alertService.successResponse(startTime);
      this.resetSummit();
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }

  onDelete(id: number): void {
    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.destroy(id).subscribe(res => {
      this.data = DataControl.deleteItem(this.data, res, 'id');
      this.alertService.successResponse(startTime);
      this.resetSummit();
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }
}
