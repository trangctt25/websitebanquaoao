import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ToastServiceService } from '../../shared/toast-service.service';
import { SanPhamBienTheComponent } from './san-pham-bien-the/san-pham-bien-thecomponent';
import * as signalR from '@microsoft/signalr';
import { SanPhamBienThe, SanPhamBienTheService, GiaSanPhamMauSacSanPhamSize } from './san-pham-bien-the.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-san-pham-bien-thes',
  templateUrl: './san-pham-bien-thes.component.html',
  styleUrls: ['./san-pham-bien-thes.component.scss']
})
export class SanPhamBienThesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  productList: any[];
  constructor(public service: SanPhamBienTheService,
    public router: Router,
    public http: HttpClient,
    public dialog: MatDialog,
    public serviceToast: ToastServiceService,) { }
  displayedColumns: string[] = ['id', 'sanPham', 'mauLoai', 'sizeLoai', 'soLuongTon',
    'actions'];
  public sanphambienthe: GiaSanPhamMauSacSanPhamSize
  ngOnInit(): void {
    this.service.getAllGiaSanPhamMauSacSanPhamSizes();
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
      this.service.getAllGiaSanPhamMauSacSanPhamSizes();
    });
  }
  ngAfterViewInit(): void {
    this.service.dataSource.sort = this.sort;
    this.service.dataSource.paginator = this.paginator;
  }
  onModalDialog() {
    this.service.sanphambienthe = new GiaSanPhamMauSacSanPhamSize()
    this.dialog.open(SanPhamBienTheComponent)
  }
  doFilter = (value: string) => {
    this.service.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  populateForm(selectedRecord: GiaSanPhamMauSacSanPhamSize) {
    this.service.sanphambienthe = Object.assign({}, selectedRecord)
    this.dialog.open(SanPhamBienTheComponent)
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
            this.service.getAllGiaSanPhamMauSacSanPhamSizes()
            Swal.fire("Xoá  thành công.", '', 'success');
          },
          err => {
            Swal.fire("Xoá thất bại.", '', 'error');
          }
        );
      }
    }); // <- Đóng đúng chỗ
  }
}
