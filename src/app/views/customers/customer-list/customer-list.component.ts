import { Component, OnInit } from '@angular/core';

import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { CustomerService } from 'src/app/services/customer.service';
import { Customer } from 'src/app/models/customer';
import {DataFunc} from 'src/app/common/function';
import {Const} from '../../../common/const';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html'
})
export class CustomerListComponent implements OnInit {
  data: Customer[];
  filter = '';
  page = 1;
  pageSize: number = Const.PAGE_SIZE_HIGHER;
  sorted = 'title';
  sortedDirection = 'asc';

  constructor(private service: CustomerService, private alertService: AlertMessageService) {
  }

  ngOnInit() {
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
}
