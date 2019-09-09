import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Validators, FormGroup, FormBuilder} from '@angular/forms';

import {User} from 'src/app/models/user';
import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {AccountService} from 'src/app/services/account.service';
import {PlaceholderService} from '../../../services/common/placeholder.service';

import {FileFunc, ControlFunc, ImageFunc} from 'src/app/common/function';
import {Common, FormMessage} from 'src/app/common/common';

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

  CONFIRM_PASSWORD_ERROR = FormMessage.CONFIRM_PASSWORD_ERROR;

  constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,
              private service: AccountService, private alertService: AlertMessageService, public placeholderService: PlaceholderService) {
  }

  ngOnInit() {
    this.alertService.clear();

    const startTime = this.alertService.startTime();
    this.service.get().subscribe(
      res => {
        this.data = res.data;
        this.data.originalImage = res.data.image;
        this.account = res.user;
        this.alertService.success(startTime, 'GET');
        this.ngOnInitForm();
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  ngOnInitForm() {
    this.initInfoForm();
    this.initPasswordForm();
  }

  private initInfoForm() {
    const minYear = new Date().getFullYear() - Common.REGISTER_UPPER_LIMIT;
    const maxYear = new Date().getFullYear() - Common.REGISTER_LOWER_LIMIT;

    this.infoForm = this.formBuilder.group({
      fullname: [this.data.fullname, [Validators.required, Validators.maxLength(255)]],
      address: [this.data.address ? this.data.address : '', [Validators.maxLength(255)]],
      phone: [this.data.phone ? this.data.phone : '', [Validators.maxLength(16)]],
      male: [ControlFunc.radioTrueFalse(this.data.male), [Validators.required]],
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
      FileFunc.convertFileToBase64(file)
        .then(res => {
          this.data.image = res.toString();
          const orientation = ImageFunc.getOrientation(this.data.image);
          if (orientation && orientation !== 0 && orientation !== 1) {
            this.imageTransform = ImageFunc.transformCSS(orientation);
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

  onChangePassword() {
    this.alertService.clear();
    if (this.passwordForm.invalid) {
      ControlFunc.touchControls(this.passwordForm.controls);
      return;
    }

    if (this.confirmPasswordError === true) {
      this.passwordForm.controls.confirmPassword.markAsTouched();
      return;
    }

    const currentPassword = this.passwordForm.controls.currentPassword.value;
    const updatePassword = this.passwordForm.controls.updatePassword.value;
    const startTime = this.alertService.startTime();
    this.service.postPassword(currentPassword, updatePassword).subscribe(res => {
        this.alertService.success(startTime, 'POST');
        this.initPasswordForm();
        this.passwordDialog = false;
      },
      err => {
        this.alertService.failed(err);
      }
    );
  }

  onChangeInfo() {
    this.alertService.clear();
    if (this.infoForm.invalid) {
      ControlFunc.touchControls(this.passwordForm.controls);
      return;
    }

    const item: any = {};
    item.fullname = this.infoForm.controls.fullname.value;
    item.birth = this.infoForm.controls.birth.value;
    item.male = this.infoForm.controls.male.value;
    item.address = this.infoForm.controls.address.value;
    item.phone = this.infoForm.controls.phone.value;
    item.updatedAt = this.data.updatedAt;

    if (this.data.originalImage !== this.data.image) { item.image = this.data.image; }

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
