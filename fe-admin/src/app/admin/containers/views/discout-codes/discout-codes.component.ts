import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { disconnect } from 'process';
import { ToastServiceService } from '../../shared/toast-service.service';
import { CategoryService, Category } from '../categories/category.service';
import { CategoryComponent } from '../categories/category/category.component';
import { DiscountCode, DiscountCodeService } from './discount-code.service';
import { DiscoutCodeComponent } from './discout-code/discout-code.component';
import * as signalR from '@microsoft/signalr';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-discout-codes',
  templateUrl: './discout-codes.component.html',
  styleUrls: ['./discout-codes.component.scss']
})
export class DiscoutCodesComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public service: DiscountCodeService,
    public router: Router,
    public http: HttpClient,
    public dialog: MatDialog,
    public toastService: ToastServiceService) { }
  displayedColumns: string[] = ['id', 'code', 'sotiengiam',
    'actions'];
  ngOnInit(): void {
    this.service.getAllMaGiamGias();
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
      this.service.getAllMaGiamGias();
    });
  }
  ngAfterViewInit(): void {
    this.service.dataSource.sort = this.sort;
    this.service.dataSource.paginator = this.paginator;
  }
  onModalDialog() {
    this.service.magiamgia = new DiscountCode()
    this.dialog.open(DiscoutCodeComponent)
  }
  doFilter = (value: string) => {
    this.service.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  populateForm(selectedRecord: DiscountCode) {
    this.service.magiamgia = Object.assign({}, selectedRecord)
    this.dialog.open(DiscoutCodeComponent)
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
            this.service.getAllMaGiamGias()
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
