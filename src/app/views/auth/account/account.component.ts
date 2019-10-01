import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Validators, FormGroup, FormBuilder} from '@angular/forms';

import {User} from 'src/app/models/user';
import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {AccountService} from 'src/app/services/account.service';
import {PlaceholderService} from '../../../services/common/placeholder.service';
import {FileControl, FormGroupControl, DataControl, TimestampControl} from 'src/app/common/function';
import {Common, ErrorMessage} from 'src/app/common/const';

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

  CONFIRM_PASSWORD_ERROR = ErrorMessage.CONFIRM_PASSWORD_ERROR;

  constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,
              private service: AccountService, private alertService: AlertMessageService, public placeholderService: PlaceholderService) {
  }

  ngOnInit() {
    this.alertService.clear();
    this.initData();
  }

  private initData() {
    const startTime = this.alertService.startTime();
    this.service.get().subscribe(
      res => {
        this.data = res.data;
        this.data.originalImage = res.data.image;
        this.account = res.user;
        this.alertService.success(startTime, 'GET');
        this.initInfoForm();
        this.initPasswordForm();
      },
      err => {
        this.alertService.failed(err);
      }
    );
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
        this.alertService.failed(err.message);
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
      FileControl.convertFileToBase64(file)
        .then(res => {
          this.data.image = res.toString();
          const orientation = FileControl.getOrientation(this.data.image);
          if (orientation && orientation !== 0 && orientation !== 1) {
            this.imageTransform = FileControl.transformCss(orientation);
          }
          this.infoDialog = true;
        }).catch(err => {
        this.alertService.failed(err.message);
      });
    }
  }

  validateConfirmPassword() {
    const password = this.passwordForm.controls.updatePassword.value;
    const confirmPassword = this.passwordForm.controls.confirmPassword.value;
    this.confirmPasswordError = password !== confirmPassword;
  }

  validateConfirmPasswordExtend() {
    this.passwordForm.controls.confirmPassword.markAsTouched();
    return this.confirmPasswordError;
  }

  onChangePassword() {
    this.alertService.clear();
    if (FormGroupControl.validateForm(this.passwordForm)) { return; }
    if (this.validateConfirmPasswordExtend()) { return; }

    const currentPassword = this.passwordForm.controls.currentPassword.value;
    const updatePassword = this.passwordForm.controls.updatePassword.value;
    const startTime = this.alertService.startTime();
    this.service.postPassword(currentPassword, updatePassword).subscribe(res => {
        this.alertService.success(startTime, 'POST');
        this.passwordDialog = false;
        this.initPasswordForm();
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  private retrieveInfo(form: FormGroup, originalImage: string, image: string) {
    return {
      fullname: form.controls.fullname.value,
      birth: form.controls.birth.value,
      male: form.controls.male.value,
      address: form.controls.address.value,
      phone: form.controls.phone.value,
      image: originalImage !== image ? image : null,
      updatedAt: TimestampControl.jsonDate(),
    };
  }

  onChangeInfo() {
    this.alertService.clear();
    const form = this.infoForm;
    if (FormGroupControl.validateForm(form)) { return; }

    const item = this.retrieveInfo(form, this.data.originalImage, this.data.image);
    const startTime = this.alertService.startTime();
    this.service.put(item).subscribe(res => {
        this.alertService.success(startTime, 'PUT');
        this.data = res;
        this.initInfoForm();
        this.infoDialog = false;
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }
}
