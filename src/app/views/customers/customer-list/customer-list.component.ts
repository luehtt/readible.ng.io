import { Component, OnInit } from '@angular/core';

import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { CustomerService } from 'src/app/services/customer.service';
import { Customer } from 'src/app/models/customer';
import { DataControl } from 'src/app/common/function';
import { Common } from '../../../common/const';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html'
})
export class CustomerListComponent implements OnInit {
  data: Customer[];
  filter = '';
  page = 1;
  pageSize: number = Common.PAGE_SIZE_DEFAULT;
  sortColumn = 'title';
  sortDirection = 'asc';
  loaded: boolean;

  constructor(private service: CustomerService, private alertService: AlertMessageService) {
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
        this.alertService.successResponse(startTime);
      },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
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
}
