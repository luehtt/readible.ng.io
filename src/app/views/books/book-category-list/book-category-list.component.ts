import {Component, OnInit} from '@angular/core';
import {BookCategory} from '../../../models/category';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BookCategoryService} from '../../../services/category.service';
import {AlertMessageService} from '../../../services/common/alert-message.service';
import {FormGroupControl, DataControl} from '../../../common/function';
import {Common} from '../../../common/const';

@Component({
  selector: 'app-book-category-list',
  templateUrl: './book-category-list.component.html'
})
export class BookCategoryListComponent implements OnInit {

  data: BookCategory[];
  item: BookCategory;
  form: FormGroup;
  itemDialog = false;
  itemEditing = false;

  filter = '';
  loaded: boolean;
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
      this.form = this.initForm();
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

  onEdit(item: BookCategory) {
    this.itemDialog = true;
    item ? this.editUpdateItem(item) : this.editStoreItem();
  }

  private editStoreItem() {
    this.item = new BookCategory();
    this.itemEditing = false;
    this.form.controls.name.setValue('');
  }

  private editUpdateItem(item: BookCategory) {
    this.item = item;
    this.itemEditing = true;
    this.form.controls.name.setValue(item.name);
  }

  onSubmit() {
    console.log(this.itemEditing);
    this.itemEditing === true ? this.updateItem() : this.storeItem();
  }

  private retrieveData(item: BookCategory, form: FormGroup): BookCategory {
    item.name = form.controls.name.value;
    return item;
  }

  private resetSummit() {
    this.item = new BookCategory();
    this.itemDialog = false;
    this.initForm();
  }

  private storeItem() {
    if (FormGroupControl.validateForm(this.form) === false) { return; }

    this.item = this.retrieveData(this.item, this.form);
    this.item = DataControl.createTimestamp(this.item);

    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.post(this.item).subscribe(res => {
      this.data.push(res);
      this.alertService.success(startTime, 'GET');
      this.resetSummit();
    }, err => {
      this.alertService.failed(err);
    });
  }

  private updateItem() {
    console.log(this.form)
    console.log(FormGroupControl.validateForm(this.form));
    if (FormGroupControl.validateForm(this.form) === false) { return; }

    this.item = this.retrieveData(this.item, this.form);
    this.item = DataControl.updateTimestamp(this.item);
    console.log(this.item)

    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.put(this.item).subscribe(res => {
      const update = this.data.find(x => x.id === res.id);
      update.name = res.name;
      update.updatedAt = res.updatedAt;

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
      this.data = this.data.filter(x => x.id !== res.id);
      this.alertService.success(startTime, 'DELETE');
      this.resetSummit();
    }, err => {
      this.alertService.failed(err);
    });
  }
}
