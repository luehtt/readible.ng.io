import { Component, OnInit } from '@angular/core';

import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { DataControl, FormGroupControl } from 'src/app/common/function';
import { Common, ErrorMessage } from '../../../common/const';
import { ManagerService } from '../../../services/manager.service';
import { Manager } from '../../../models/manager';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-manager-list',
  templateUrl: './manager-list.component.html'
})
export class ManagerListComponent implements OnInit {
  data: Manager[];
  loaded: boolean;
  form: FormGroup;
  conflictUsername: string[];
  conflictEmail: string[];
  customRule = { confirm: true, birth: true, username: true, email: true };

  filter = '';
  page = 1;
  pageSize = Common.PAGE_SIZE_HIGHER;
  sortColumn = 'title';
  sortDirection = 'asc';
  createDialog = false;

  USERNAME_EXISTED = ErrorMessage.USERNAME_EXISTED;
  EMAIL_EXISTED = ErrorMessage.EMAIL_EXISTED;
  REGISTER_AGE_LIMIT = ErrorMessage.REGISTER_AGE_LIMIT;

  constructor(private service: ManagerService, private alertService: AlertMessageService, private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.alertService.clear();
    this.initData();
    this.conflictUsername = [];
    this.conflictEmail = [];
  }

  private initData() {
    const startTime = this.alertService.startTime();
    this.service.fetch().subscribe(
      res => {
        this.data = res;
        this.loaded = true;
        this.initForm();
        this.alertService.successResponse(startTime);
      },
      err => {
        this.alertService.errorResponse(err, startTime);
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
      male: ['', [Validators.required]],
      address: ['', [Validators.maxLength(255)]],
      phone: ['', [Validators.maxLength(16)]],
    });
  }

  validateUsername() {
    const username = this.form.controls.username.value;
    this.customRule.username = !this.conflictUsername.includes(username);
  }

  validateEmail() {
    const email = this.form.controls.email.value;
    this.customRule.email = !this.conflictEmail.includes(email)
  }

  validateBirth() {
    this.customRule.birth = true;
    const year = new Date().getFullYear() - this.form.controls.birth.value;
    if (year > Common.REGISTER_UPPER_LIMIT) { this.customRule.birth = false; }
    if (year < Common.REGISTER_LOWER_LIMIT) { this.customRule.birth = false; }
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
    this.sortDirection = DataControl.sortDirection(this.sortColumn, sortColumn, this.sortDirection);
    this.sortColumn = sortColumn;
    this.data = DataControl.sort(this.data, this.sortColumn, this.sortDirection);
  }

  private retrieveData(form: FormGroup) {
    return {
      username: form.controls.username.value,
      password: form.controls.password.value,
      email: form.controls.email.value,
      birth: form.controls.birth.value,
      fullname: form.controls.fullname.value,
      male: form.controls.male.value === 'true',
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
      if (res.usernameConflict === false && res.emailConflict === false) {
        this.alertService.successResponse(startTime);
        this.data.push(res);
        this.createDialog = false;
      } else {
        if (res.usernameConflict === true) {
          const username = data.username;
          this.conflictUsername.filter(x => x != username);
          this.conflictUsername.push(username);
          this.customRule.username = false;
        }
        if (res.emailConflict === true) {
          const email = data.email;
          this.conflictEmail.filter(x => x != email);
          this.conflictEmail.push(email);
          this.customRule.email = false;
        }
      }
    }, err => {
      this.alertService.errorResponse(err, startTime);
    });
  }
}
