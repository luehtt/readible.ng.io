import { Component, OnInit } from '@angular/core';
import { Common } from 'src/app/common/const';
import { DataControl } from 'src/app/common/function';
import { Order } from 'src/app/models/order';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { OrderService } from 'src/app/services/order.service';


@Component({
  selector: 'app-customer-order',
  templateUrl: './customer-order-list.component.html'
})
export class CustomerOrderListComponent implements OnInit {
  data: Order[];
  page = 1;
  pageSize: number = Common.PAGE_SIZE_SMALLER;
  filter = '';
  sortColumn = 'id';
  sortDirection = 'asc';

  constructor(private service: OrderService, private alertService: AlertMessageService) {
  }

  ngOnInit(): void {
    this.alertService.clear();
    this.fetchData();
  }

  private fetchData(): void {
    const startTime = this.alertService.startTime();
    this.service.fetch(null).subscribe(
      res => {
        this.data = res;
        this.alertService.successResponse(startTime);
      },
      err => {
        this.alertService.errorResponse(err, startTime);
      }
    );
  }

  get dataFilter(): Order[] {
    return DataControl.filter(this.data, this.filter, ['id', 'status.locale', 'totalItem', 'totalPrice', 'createdAt', 'updatedAt']);
  }

  onSort(sortColumn: string): void {
    if (!sortColumn) { return; }
    this.sortDirection = DataControl.sortDirection(this.sortColumn, sortColumn, this.sortDirection);
    this.sortColumn = sortColumn;
    this.data = DataControl.sort(this.data, this.sortColumn, this.sortDirection);
  }

}
