import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';

import { AuthService } from 'src/app/services/auth/auth.service';
import {FormImplemented} from 'src/app/common/function';
import { AlertService } from 'src/app/services/common/alert.service';
import {Const} from 'src/app/common/const';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  ageLimit = Const.REGISTER_AGE_LIMIT;
  ageLimitYear;
  form: FormGroup;
  validations = { confirm: true, birth: true, username: true, email: true };
  
  constructor(private formBuilder: FormBuilder, private service : AuthService, private alertService: AlertService) { }

  ngOnInit() {
    this.ngOnInitForm()
  }

  ngOnInitForm() {
    this.ageLimitYear = new Date().getFullYear() - 40;

    this.form = this.formBuilder.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirm: ['', [Validators.required]],
      fullname: ['', [Validators.required]],
      gender: ['male', [Validators.required]],
      birth: [this.ageLimitYear, [Validators.required]],
      address: [''],
      phone: [''],
    });
  }

  validateConfirm() {
    const p = this.form.controls.password.value;
    const c = this.form.controls.confirm.value;
    this.validations.confirm = p == c
  }

  validateBirth() {
    this.validations.birth = true;
    const a = new Date().getFullYear() - this.form.controls.birth.value;
    if (a > 100) this.validations.birth = false;
    if (a < this.ageLimit) this.validations.birth = false;
  }

  clickSummit() {
    if (this.form.invalid) {
      FormImplemented.touchControls(this.form.controls);
      return;
    }

    let data = {
      username: this.form.controls.username.value,
      password: this.form.controls.password.value,
      email: this.form.controls.email.value,
      birth: this.form.controls.birth.value,
      fullname: this.form.controls.fullname.value,
      male: this.form.controls.gender.value == 'male',
      address: this.form.controls.address.value,
      phone: this.form.controls.phone.value
    };

    this.service.register(data).subscribe(res => {
      if (res.success == true) {
        window.location.href = Const.THIS_URL + '/login'
      } else {
        if (data.username) this.validations.username = false;
        if (data.email) this.validations.email = false;
      }
    }, err => {
      this.alertService.failed(err);
    })

  }

}
