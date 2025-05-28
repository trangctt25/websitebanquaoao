import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Data, Router } from '@angular/router';
import { ToastServiceService } from '../../shared/toast-service.service';
import { HoaDonComponent } from './hoa-don/hoa-don.component';
import { HoaDonUser, HoaDonService } from './hoadon.service';
import * as signalR from '@microsoft/signalr';
import { HoaDonEditComponent } from './hoa-don-edit/hoa-don-edit.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-hoa-dons',
  templateUrl: './hoa-dons.component.html',
  styleUrls: ['./hoa-dons.component.scss']
})
export class HoaDonsComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  productList: any[];
  constructor(public service: HoaDonService,
    public router: Router,
    public http: HttpClient,
    public dialog: MatDialog,
    public serviceToast: ToastServiceService,
    public datepipe: DatePipe
  ) { }
  displayedColumns: string[] = ['id', 'id_User', 'ngayTao', 'ghiChi', 'tongTien', 'trangThai', 'actions'];
  ngOnInit(): void {
    this.service.getAllHoaDons();
    const connection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Information)
      .withUrl('https://localhost:44302/notify')
      .build();
    connection.start().then(function () {
      console.log('SignalR Connected!');
    }).catch(function (err) {
      return console.error(err.toString());
    });
    connection.on("BroadcastMessage", () => {
      this.service.getAllHoaDons();
    });
  }
  ngAfterViewInit(): void {
    this.service.dataSource.sort = this.sort;
    this.service.dataSource.paginator = this.paginator;
  }
  routeChiTiet(selectedRecord: HoaDonUser) {
    this.service.hoadon = Object.assign({}, selectedRecord)
    this.router.navigate(['admin/hoadon/detail/' + this.service.hoadon.id])
  }
  doFilter = (value: string) => {
    this.service.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  someMethod(value: any, element: any) {
    console.log("selected value", value);
    console.log("selected element", element);
    element.daLayTien = value;
  }
  populateForm(selectedRecord: HoaDonUser) {
    this.service.hoadon = Object.assign({}, selectedRecord)
    this.dialog.open(HoaDonEditComponent)
  }
  exportGeneratePdf() {
    window.open("https://localhost:44302/api/GeneratePdf/allorder", "_blank");
  }
  clickDelete(id) {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.delete(id).subscribe(
          res => {
            this.service.getAllHoaDons()
            Swal.fire("Xoá thành công.", '', 'success');
          },
          err => {
            Swal.fire("Xoá thất bại.", '', 'error');
          }
        );
      }
    }); // <- Đóng đúng chỗ
  }
}
