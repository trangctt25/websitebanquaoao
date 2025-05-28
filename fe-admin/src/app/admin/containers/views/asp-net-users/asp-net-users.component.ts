import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-asp-net-users',
  templateUrl: './asp-net-users.component.html',
  styleUrls: ['./asp-net-users.component.scss']
})
export class AspNetUsersComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  productList: any[];
  constructor(public service: UserService,
    public router: Router,
    public http: HttpClient,
    public dialog: MatDialog,) { }
  public dataSource = new MatTableDataSource<User>();
  displayedColumns: string[] = ['id', 'firstName', 'lastName',
    'userName', 'quyen'];
  ngOnInit(): void {
    this.service.getAllUsers();
  }
  ngAfterViewInit(): void {
    this.service.dataSource.sort = this.sort;
    this.service.dataSource.paginator = this.paginator;
  }
  onModalDialog() {
    this.service.user = new User()
  }
  doFilter = (value: string) => {
    this.service.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  populateForm(selectedRecord: User) {
    this.service.user = Object.assign({}, selectedRecord)
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
export class User {
  id: string
  imagePath: string
  userName: string
  lastName: string
  firstName: string
  quyen: string
}
