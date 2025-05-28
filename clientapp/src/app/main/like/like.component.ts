import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'src/app/service/product.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-contact',
  templateUrl: './like.component.html',
  styleUrls: ['./like.component.scss']
})
export class LikeComponent implements OnInit {
  list_sanphamyeuthich: any;
  constructor(public http: HttpClient, public route: ActivatedRoute, private cartService: CartService) {
    const clicks = localStorage.getItem('idUser');
    this.http.post(environment.URL_API + "sanphams/dslike/", {
      IdUser: clicks,
    }).subscribe(
      res => {
        this.list_sanphamyeuthich = res;
      });
  }
  ngOnInit(): void {
  }
  deleteSanPham(product) {
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
        this.http.post(environment.URL_API + "sanphams/deletelike/" + product.id, {})
          .subscribe(
            res => {
              const clicks = localStorage.getItem('idUser');
              this.http.post(environment.URL_API + "sanphams/dslike/", {
                IdUser: clicks,
              }).subscribe(res => {
                this.list_sanphamyeuthich = res;
              });
              this.cartService.DeleteProductInLove(product);
              Swal.fire("Xoá sản phẩm yêu thích thành công.", '', 'success');
            },
            err => {
              Swal.fire("Xoá sản phẩm yêu thích thất bại.", '', 'error');
            }
          );
      }
    });
  }
}
