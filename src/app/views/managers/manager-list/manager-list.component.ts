import {Component, OnInit} from '@angular/core';

import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {DataControl, FormGroupControl} from 'src/app/common/function';
import {Common, FormMessage} from '../../../common/const';
import {ManagerService} from '../../../services/manager.service';
import {Manager} from '../../../models/manager';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

interface CustomValidator {
  confirm: boolean;
  birth: boolean;
  username: boolean;
  email: boolean;
}

@Component({
  selector: 'app-manager-list',
  templateUrl: './manager-list.component.html'
})
export class ManagerListComponent implements OnInit {
  data: Manager[];
  filter = '';
  page = 1;
  pageSize = Common.PAGE_SIZE_HIGHER;
  sortColumn = 'title';
  sortDirection = 'asc';
  customRule: CustomValidator;
  createDialog = false;
  loaded: boolean;

  form: FormGroup;
  USERNAME_EXISTED = FormMessage.USERNAME_EXISTED;
  EMAIL_EXISTED = FormMessage.EMAIL_EXISTED;
  REGISTER_AGE_LIMIT = FormMessage.REGISTER_AGE_LIMIT;

  constructor(private service: ManagerService, private alertService: AlertMessageService, private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.alertService.clear();
    this.initData();
  }

  private initData() {
    const startTime = this.alertService.startTime();
    this.service.fetch().subscribe(
      res => {
        this.data = res;
        this.loaded = true;
        this.initForm();
        this.alertService.success(startTime, 'GET');
      },
      err => {
        this.alertService.failed(err);
      }
    );

  }

  private initForm() {
    this.customRule = { confirm: true, birth: true, username: true, email: true };
    const recommendedYear = new Date().getFullYear() - 20;

    this.form = this.formBuilder.group({
      username: ['', [Validators.required, Validators.maxLength(128), Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.maxLength(255), Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(255)]],
      fullname: ['', [Validators.required, Validators.maxLength(255)]],
      birth: [recommendedYear, [Validators.required]],
      gender: ['male', [Validators.required]],
      address: ['', [Validators.maxLength(255)]],
      phone: ['', [Validators.maxLength(16)]],
    });
  }

  get dataFilter() {
    switch (this.filter) {
      case 'male': case 'female':
        return DataControl.filter(this.data, this.filter === 'male' ? 'true' : 'false', ['male']);
      default:
        return DataControl.filter(this.data, this.filter, ['fullname', 'birth', 'phone', 'createdAt']);
    }
  }

  onSort(sortColumn: string) {
    if (!sortColumn) { return; }
    this.sortDirection = DataControl.sortDirection(this.sortColumn, sortColumn);
    this.sortColumn = sortColumn;
    this.data = DataControl.sort(this.data, this.sortColumn, this.sortDirection);
  }

  validateBirth() {
    this.customRule.birth = true;
    const year = new Date().getFullYear() - this.form.controls.birth.value;
    if (year > Common.REGISTER_UPPER_LIMIT) { this.customRule.birth = false; }
    if (year < Common.REGISTER_LOWER_LIMIT) { this.customRule.birth = false; }
  }

  private retrieveData(form: FormGroup) {
    return {
      username: form.controls.username.value,
      password: form.controls.password.value,
      email: form.controls.email.value,
      birth: form.controls.birth.value,
      fullname: form.controls.fullname.value,
      male: form.controls.gender.value === 'male',
      address: form.controls.address.value,
      phone: form.controls.phone.value
    };
  }

  onSubmit() {
    if (FormGroupControl.validateForm(this.form, this.customRule)) { return; }

    const data = this.retrieveData(this.form);
    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.register(data).subscribe(res => {
      if (res.success === true) {
        this.ngOnInit();
        this.alertService.success(startTime, 'POST');
      } else {
        if (data.username) { this.customRule.username = false; }
        if (data.email) { this.customRule.email = false; }
      }
    }, err => {
      this.alertService.failed(err);
    });
  }
}
