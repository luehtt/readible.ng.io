import {Component, OnInit} from '@angular/core';
import {Validators, FormGroup, FormBuilder} from '@angular/forms';

import {AuthService} from 'src/app/services/auth/auth.service';
import {DataControl, FormGroupControl} from 'src/app/common/function';
import {AlertMessageService} from 'src/app/services/common/alert-message.service';
import {Common, FormMessage} from 'src/app/common/const';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  USERNAME_EXISTED = FormMessage.USERNAME_EXISTED;
  EMAIL_EXISTED = FormMessage.EMAIL_EXISTED;
  CONFIRM_PASSWORD_MISMATCHED = FormMessage.CONFIRM_PASSWORD_MISMATCHED;
  REGISTER_AGE_LIMIT = FormMessage.REGISTER_AGE_LIMIT;

  form: FormGroup;
  customValidator = { confirm: true, birth: true, username: true, email: true };

  constructor(private formBuilder: FormBuilder, private service: AuthService, private alertService: AlertMessageService) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    const recommendedYear = new Date().getFullYear() - 40;

    this.form = this.formBuilder.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirm: ['', [Validators.required]],
      fullname: ['', [Validators.required]],
      gender: ['male', [Validators.required]],
      birth: [recommendedYear, [Validators.required]],
      address: [''],
      phone: [''],
    });
  }

  validateConfirm() {
    const p = this.form.controls.password.value;
    const c = this.form.controls.confirm.value;
    this.customValidator.confirm = p === c;
  }

  validateBirth() {
    this.customValidator.birth = true;
    const year = new Date().getFullYear() - this.form.controls.birth.value;
    if (year > Common.REGISTER_UPPER_LIMIT) { this.customValidator.birth = false; }
    if (year < Common.REGISTER_LOWER_LIMIT) { this.customValidator.birth = false; }
  }

  private retrieveInfo(form: FormGroup) {
    return {
      username: this.form.controls.username.value,
      password: this.form.controls.password.value,
      email: this.form.controls.email.value,
      fullname: form.controls.fullname.value,
      birth: form.controls.birth.value,
      male: form.controls.male.value,
      address: form.controls.address.value,
      phone: form.controls.phone.value,
      createdAt: DataControl.jsonDate(),
    };
  }

  onSubmit() {
    this.alertService.clear();
    if (FormGroupControl.validateForm(this.form, this.customValidator)) { return; }

    const data = this.retrieveInfo(this.form);
    this.service.register(data).subscribe(res => {
      if (res.success === true) {
        window.location.href = Common.THIS_URL + '/login';
      } else {
        if (data.username) { this.customValidator.username = false; }
        if (data.email) { this.customValidator.email = false; }
      }
    }, err => {
      this.alertService.failed(err);
    });

  }

}
