import {Component, OnInit} from '@angular/core';

import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {DataFunc, FormFunc} from 'src/app/common/function';
import {Const, FormMessage} from '../../../common/const';
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
  pageSize: number = Const.PAGE_SIZE_HIGHER;
  sorted = 'title';
  sortedDirection = 'asc';
  customValidator: CustomValidator;
  createDialog = false;

  form: FormGroup;
  USERNAME_EXISTED = FormMessage.USERNAME_EXISTED;
  EMAIL_EXISTED = FormMessage.EMAIL_EXISTED;
  REGISTER_AGE_LIMIT = FormMessage.REGISTER_AGE_LIMIT;

  constructor(private service: ManagerService, private alertService: AlertMessageService, private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.alertService.clear();
    this.customValidator = { confirm: true, birth: true, username: true, email: true };

    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.fetch().subscribe(
      res => {
        this.data = res;
        this.alertService.success(startTime, 'GET');
      },
      err => {
        this.alertService.failed(err);
      }
    );

    this.initForm();
  }

  private initForm() {
    const recommendedYear = new Date().getFullYear() - 40;

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
    return !this.data ? null : this.data.filter(x => x.birth.toString().toLowerCase().includes(this.filter.toLowerCase()) ||
      (x.male === true && this.filter.toLowerCase() === 'male') ||
      (x.male === false && this.filter.toLowerCase() === 'female') ||
      DataFunc.include(x, this.filter, ['fullname', 'phone', 'createdAt']));
  }

  onSort(sorting: string) {
    if (sorting == null) { return; }
    this.sortedDirection = this.sorted !== sorting ? 'asc' : (this.sortedDirection === 'asc' ? 'desc' : 'asc');
    this.sorted = sorting;

    switch (this.sorted) {
      case 'fullname': case 'phone': case 'createdAt':
        this.data = DataFunc.sortString(this.data, this.sorted, this.sortedDirection);
        break;
      case 'birth': case 'male':
        this.data = DataFunc.sortNumber(this.data, this.sorted, this.sortedDirection);
        break;
    }
  }

  validateBirth() {
    this.customValidator.birth = true;
    const year = new Date().getFullYear() - this.form.controls.birth.value;
    if (year > Const.REGISTER_UPPER_LIMIT) { this.customValidator.birth = false; }
    if (year < Const.REGISTER_LOWER_LIMIT) { this.customValidator.birth = false; }
  }

  onSubmit() {
    // validate built-in validator
    if (this.form.invalid) {
      FormFunc.touchControls(this.form.controls);
      return;
    }
    // validate custom validator
    for (const f in this.customValidator) {
      if (this.customValidator[f] === false) {
        FormFunc.touchControls(this.form.controls);
        return;
      }
    }

    const data = {
      username: this.form.controls.username.value,
      password: this.form.controls.password.value,
      email: this.form.controls.email.value,
      birth: this.form.controls.birth.value,
      fullname: this.form.controls.fullname.value,
      male: this.form.controls.gender.value === 'male',
      address: this.form.controls.address.value,
      phone: this.form.controls.phone.value
    };

    this.alertService.clear();
    const startTime = this.alertService.startTime();
    this.service.register(data).subscribe(res => {
      if (res.success === true) {
        this.ngOnInit();
        this.alertService.success(startTime, 'POST');
      } else {
        if (data.username) { this.customValidator.username = false; }
        if (data.email) { this.customValidator.email = false; }
      }
    }, err => {
      this.alertService.failed(err);
    });
  }
}
