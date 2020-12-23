import { Component, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';
import { AlertMessageService } from 'src/app/services/common/alert-message.service';
import { SignalService } from 'src/app/services/common/signalr.service';
import { OrderService } from 'src/app/services/order.service';
import { Common } from '../../../common/const';
import { DataControl } from '../../../common/function';


@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {
  data: Order[];
  status = 'live';
  filter = '';
  page = 1;
  pageSize = Common.PAGE_SIZE_DEFAULT;
  sortColumn = 'id';
  sortDirection = 'asc';
  loaded: boolean;

  constructor(private service: OrderService, private signalService: SignalService<Order>, private alertService: AlertMessageService) {
  }

  ngOnInit(): void {
    this.alertService.clear();
    this.initData();
    this.initListener();
  }

  initListener() {
    this.signalService.startConnection();
    this.signalService.addListeners('order')

    this.signalService.storeDataEmitter.subscribe((res: Order) => {
      if (this.status !== 'live') return;
      const findIndex = this.data.findIndex(x => x.id === res.id);
      if (findIndex > 0) {
        this.data[findIndex] = res;
      } else {
        this.data.unshift(res)
      }
    })

    this.signalService.updateDataEmitter.subscribe((res: Order) => {
      if (this.status !== 'live') return;
      const statusName = res.status.name;
      // if statusName is in 'PENDING' || 'DELIVERING': update data
      if (statusName === 'PENDING' || statusName === 'DELIVERING') {
        const findIndex = this.data.findIndex(x => x.id === res.id);
        console.log(findIndex)
        if (findIndex > 0) {
          this.data[findIndex] = res;
        }
      }
      // else: delete data
      else {
        this.data = this.data.filter(x => x.id !== res.id);
      }
    })

    this.signalService.deleteIdEmitter.subscribe((res: number) => {
      if (this.status !== 'live') return;
      this.data = this.data.filter(x => x.id !== res);
    })
  }

  onSelectStatus(value: string): void {
    this.status = value;
    this.initData();
  }

  private initData(): void {
    const startTime = this.alertService.startTime();
    this.alertService.clear();
    this.service.fetch(this.status).subscribe(
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

  get dataFilter(): Order[] {
    return DataControl.filter(this.data, this.filter, ['id', 'contact', 'phone', 'updatedAt']);
  }

  onSort(sortColumn: string): void {
    if (!sortColumn) { return; }
    this.sortDirection = DataControl.sortDirection(this.sortColumn, sortColumn, this.sortDirection);
    this.sortColumn = sortColumn;
    this.data = DataControl.sort(this.data, this.sortColumn, this.sortDirection);
  }
}
