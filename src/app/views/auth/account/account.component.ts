import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';

import { User } from 'src/app/models/user';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { AccountService } from 'src/app/services/account.service';
import { PlaceholderService } from '../../../services/common/placeholder.service';
import { FileControl, FormGroupControl, DataControl, TimestampControl } from 'src/app/common/function';
import { Common, ErrorMessage } from 'src/app/common/const';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit {

  data: any;
  account: User;
  infoForm: FormGroup;
  passwordForm: FormGroup;
  infoDialog = false;
  passwordDialog = false;
  confirmPasswordError = false;
  imageTransform: string;
  userRole: string;

  CONFIRM_PASSWORD_ERROR = ErrorMessage.CONFIRM_PASSWORD_ERROR;

  constructor(
    private formBuilder: FormBuilder,
    private service: AccountService,
    private alertService: AlertMessageService,
    private authService: AuthService,
    private placeholderService: PlaceholderService) {
  }

  ngOnInit() {
    this.alertService.clear();
    this.initData();
    this.userRole = this.authService.getToken('role');
  }

  private initData() {
    const startTime = this.alertService.startTime();
    this.service.get().subscribe(
      res => {
        this.data = res.data;
        this.data.originalImage = res.data.image;
        this.account = res.user;

        this.alertService.successResponse(startTime);
        this.initInfoForm();
        this.initPasswordForm();
      },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  get imageData() {
    return this.data.image ? this.data.image : this.placeholderService.imgHolder(300, 300, this.data.fullname);
  }

  private initInfoForm() {
    const minYear = new Date().getFullYear() - Common.REGISTER_UPPER_LIMIT;
    const maxYear = new Date().getFullYear() - Common.REGISTER_LOWER_LIMIT;

    this.infoForm = this.formBuilder.group({
      fullname: [this.data.fullname, [Validators.required, Validators.maxLength(255)]],
      address: [this.data.address ? this.data.address : '', [Validators.maxLength(255)]],
      phone: [this.data.phone ? this.data.phone : '', [Validators.maxLength(16)]],
      male: [TimestampControl.radioTrueFalse(this.data.male), [Validators.required]],
      birth: [this.data.birth, [Validators.required, Validators.min(minYear), Validators.max(maxYear)]]
    });
  }

  private initPasswordForm() {
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
      updatePassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]]
    });
  }

  onRefreshImage() {
    this.service.get().subscribe(
      res => {
        this.data = res.data;
      }, err => {
        this.alertService.errorResponse(err);
      }
    );
  }

  onDeleteImage() {
    this.data.image = '';
    this.infoDialog = true;
  }

  onChangeImage(event) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      FileControl.convertFileToBase64(file).then(res => {
        this.data.image = res.toString();
        const orientation = FileControl.getOrientation(this.data.image);
        if (orientation && orientation !== 0 && orientation !== 1) {
          this.imageTransform = FileControl.imageTransform(orientation);
        }
        this.infoDialog = true;
      }).catch(err => {
        this.alertService.error(err.message);
      });
    }
  }

  validateConfirmPassword() {
    const password = this.passwordForm.controls.updatePassword.value;
    const confirmPassword = this.passwordForm.controls.confirmPassword.value;
    this.confirmPasswordError = password !== confirmPassword;
  }

  onChangePassword() {
    this.alertService.clear();
    if (FormGroupControl.validateForm(this.passwordForm) === false) { return; }

    const currentPassword = this.passwordForm.controls.currentPassword.value;
    const updatePassword = this.passwordForm.controls.updatePassword.value;
    const startTime = this.alertService.startTime();
    this.service.password(currentPassword, updatePassword).subscribe(res => {
      this.alertService.successResponse(startTime);
      this.passwordDialog = false;
      this.initPasswordForm();
    }, err => {
      const customError = [ {status: 401, error: ErrorMessage.UPDATE_PASSWORD_ERROR} ];
      this.alertService.errorResponse(err, startTime, customError);
      }
    );
  }

  private getFormData(form: FormGroup) {
    const item = DataControl.clone(this.data);
    const formControl = form.controls;

    item.fullname = formControl.fullname.value;
    item.birth = formControl.birth.value;
    item.male = formControl.male.value;
    item.address = formControl.address.value;
    item.phone = formControl.phone.value;

    if (item.image === item.originalImage) { delete (item.image); }
    if (!item.image) item.image = 'null';
    return item;
  }

  onChangeInfo() {
    this.alertService.clear();
    if (FormGroupControl.validateForm(this.infoForm) === false) { return; }

    const item = this.getFormData(this.infoForm);
    const startTime = this.alertService.startTime();
    this.service.put(item, this.userRole).subscribe(res => {
      this.alertService.successResponse(startTime);
      this.data = DataControl.read(res, this.data);
      this.imageTransform = null;
      this.infoDialog = false;
      this.initInfoForm();
    }, err => {
      this.data.image = this.data.originalImage;
      this.imageTransform = null;
      this.alertService.errorResponse(err, startTime);
    });
  }
}
