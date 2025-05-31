import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-info-user',
  templateUrl: './info-user.component.html',
  styleUrls: ['./info-user.component.scss']
})
export class InfoUserComponent implements OnInit {
  user:any;
  constructor(public http:HttpClient) {
    this.http.get(environment.URL_API+"Auth/AuthHistory").subscribe(
    res=>{
      this.user = res;
    },
    error=>{
    }
    );
   }
  ngOnInit(): void {
  }
  updateUser() {
    this.http.put(environment.URL_API+"Auth/updateCustomer", this.user).subscribe(
      res => {
         Swal.fire("Cập nhật thành công.", '', 'success');
      },
      error => {
         Swal.fire("Cập nhật không thành công.", '', 'error');
      }
    );
  }
}
