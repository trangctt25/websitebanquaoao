import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ChartSecondService {
  constructor(private http: HttpClient) { }
  getKhachHangMuaNhieuNhat():Observable<any>{
    return this.http.get<any>(environment.URL_API+"ThongKeSoLuongs/getkhachhangmuanhieunhat") 
  }
  getNam2025DoanhSo():Observable<any>{
    return this.http.get<any>(environment.URL_API+"ThongKeSoLuongs/nam2025")
  }
  getNam2025SoLuong():Observable<any>{
    return this.http.get<any>(environment.URL_API+"ThongKeSoLuongs/Soluongsanphambanratrongnam")
  }
  getSoLuongTon():Observable<any>{
    return this.http.get<any>(environment.URL_API+"ThongKeSoLuongs/soluongton")
  }
  getTopSoLuongTon():Observable<any>{
    return this.http.get<any>(environment.URL_API+"ThongKeBieuDos/topsoluongton")
  }
  ////////////////////////////////////
  getTopBienTheDoanhThu():Observable<any>{
    return this.http.get<any>(environment.URL_API+"ThongKeBieuDos/topbienthedoanhthu")
  }
  getThongKeThang(): Observable<any> {
    return this.http.get<any>(environment.URL_API + "ThongKeBieuDos/topthongkethang")
  }
  getSoLanSanPhamXuatHienTrongDonHang():Observable<any>{
    return this.http.get<any>(environment.URL_API+"ThongKeBieuDos/topsolanxuathientrongdonhang")
  }
  getSanPhamDoanhThuTop():Observable<any>{
     return this.http.get<any>(environment.URL_API+"ThongKeBieuDos/topsanphamloinhattop") 
  }
  getTopNhanHieuDoanhThu():Observable<any>{
    return this.http.get<any>(environment.URL_API+"ThongKeBieuDos/topnhanhieubanchaynhattrongnam2025")
  }
  dataThongKeNgay: any
  public dataSourceNgay: any = {
    chart: {
      caption: 'Doanh thu',
      xAxisName: 'Ngày',
      yAxisName: 'Số tiền thu về',
      numberSuffix: '',
      theme: 'umber'
    },
    data: [
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" }
    ]
  }
}
