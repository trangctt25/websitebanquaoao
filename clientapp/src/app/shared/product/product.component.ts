import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination'; // <-- import the module
declare var $: any;
import Swal from 'sweetalert2'
import { CartService } from 'src/app/service/product.service';
import { Product } from 'src/app/model/product.model';
import * as signalR from '@microsoft/signalr';
import { ProductService } from './product.service';
import { SharedService } from '../shared.service';
import { environment } from 'src/environments/environment';
import { PagedResult } from 'src/app/model/pagedResult.model';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, AfterViewInit {

  idUser = localStorage.getItem('idUser');

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalCount: number = 0;

  chose_tab;
  chose_gia;
  chose_mau;
  chose_nhan_hieu;
  thap;
  cao;
  public list_product: Product[];
  public list_nhan_hieu: any[];
  public products: Product[];
  public mausac: any;
  searchText = '';
  responsiveOptions;
  public statusData: boolean = false
  constructor(public http: HttpClient, public cart: CartService, public service: ProductService, public sharedservice: SharedService) {
    this.http
      .get(environment.URL_API + 'mausacs/mausac/', {}
      ).subscribe(resp => {
        this.mausac = resp;
      });
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
      }
    ];
  }

  ngOnInit() {
    this.loadProducts(this.currentPage);
    this.getAllNhanHieu();
    this.http.get<any>(environment.URL_API + 'sanphams/topsanphammoi', {
      params: { userId: this.idUser }
    }).subscribe(resp => {
      this.products = resp as Product[];
    });

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
      this.loadProducts(this.currentPage);
    });
    connection.on("BroadcastMessage", () => {
      this.http.get<any>(environment.URL_API + 'sanphams/topsanphammoi', {
        params: { userId: this.idUser }
      }).subscribe(resp => {
        this.products = resp as Product[];
      });
    });
  }

  like(idSanPham: number) {
    if (!this.idUser) {
      Swal.fire("Vui lòng đăng nhập để thực hiện chức năng này", '', 'warning');
      return;
    }
    console.log(98, idSanPham);
    const product = this.list_product.find(p => p.id === idSanPham);
    if (!product) return;

    const oldLike = product.isLike;
    product.isLike = !oldLike; // đổi trạng thái ngay

    this.http
      .post(environment.URL_API + 'sanphams/like/', {
        IdSanPham: idSanPham,
        IdUser: this.idUser,
      }).subscribe({
        next: (resp) => {
          let product_top = this.products.find(p => p.id === idSanPham);
          if (product_top) {
            product_top.isLike = !oldLike;
          }
          if (resp == 1) {
            Swal.fire("Sản phẩm được thêm vào danh sách yêu thích", '', 'success');
          }
          if (resp == 2) {
            Swal.fire("Sản phẩm được xoá khỏi danh sách yêu thích", '', 'success');
          }
        },
        error: () => {
          product.isLike = oldLike;
        }
      });
  }

  // searchTheoGia(thap, cao, choser) {
  //   this.thap = thap;
  //   this.cao = cao;
  //   this.chose_gia = choser;
  //   this.filterChanged();
  // }

  searchTheoGia() {
    
  }

  searchthemau(chose) {
    this.chose_mau = chose;
    this.filterChanged();
  }
  searNhanHieu(chose) {
    debugger
    console.log(123, chose);
    this.chose_nhan_hieu = chose.ten;
    this.filterChanged();
  }

  onSearchChange(searchValue: string): void {
    this.list_product.filter(d => d.ten)
  }

  ngAfterViewInit(): void {
    $('.js-show-filter').on('click', function () {
      $(this).toggleClass('show-filter');
      $('.panel-filter').slideToggle(400);
      if ($('.js-show-search').hasClass('show-search')) {
        $('.js-show-search').removeClass('show-search');
        $('.panel-search').slideUp(400);
      }
    });
    $('.js-show-search').on('click', function () {
      $(this).toggleClass('show-search');
      $('.panel-search').slideToggle(400);
      if ($('.js-show-filter').hasClass('show-filter')) {
        $('.js-show-filter').removeClass('show-filter');
        $('.panel-filter').slideUp(400);
      }
    });
    var $topeContainer = $('.isotope-grid');
    var $filter = $('.filter-tope-group');
    // filter items on button click
    $filter.each(function () {
      $filter.on('click', 'button', function () {
        var filterValue = $(this).attr('data-filter');
        $topeContainer.isotope({ filter: filterValue });
      });
    });
    // init Isotope
    $(window).on('load', function () {
      var $grid = $topeContainer.each(function () {
        $(this).isotope({
          itemSelector: '.isotope-item',
          layoutMode: 'fitRows',
          percentPosition: true,
          animationEngine: 'best-available',
          masonry: {
            columnWidth: '.isotope-item'
          }
        });
      });
    });
    var isotopeButton = $('.filter-tope-group button');
    $(isotopeButton).each(function () {
      $(this).on('click', function () {
        for (var i = 0; i < isotopeButton.length; i++) {
          $(isotopeButton[i]).removeClass('how-active1');
        }
        $(this).addClass('how-active1');
      });
    });
    $('.js-show-modal1').on('click', function (e) {
      e.preventDefault();
      $('.js-modal1').addClass('show-modal1');
    });
    $('.js-hide-modal1').on('click', function () {
      $('.js-modal1').removeClass('show-modal1');
    });
    $('.wrap-slick1').each(function () {
      var wrapSlick1 = $(this);
      var slick1 = $(this).find('.slick1');
      var itemSlick1 = $(slick1).find('.item-slick1');
      var layerSlick1 = $(slick1).find('.layer-slick1');
      var actionSlick1 = [];
      $(slick1).on('init', function () {
        var layerCurrentItem = $(itemSlick1[0]).find('.layer-slick1');
        for (var i = 0; i < actionSlick1.length; i++) {
          clearTimeout(actionSlick1[i]);
        }
        $(layerSlick1).each(function () {
          $(this).removeClass($(this).data('appear') + ' visible-true');
        });
        for (var i = 0; i < layerCurrentItem.length; i++) {
          actionSlick1[i] = setTimeout(function (index) {
            $(layerCurrentItem[index]).addClass($(layerCurrentItem[index]).data('appear') + ' visible-true');
          }, $(layerCurrentItem[i]).data('delay'), i);
        }
      });
      var showDot = false;
      if ($(wrapSlick1).find('.wrap-slick1-dots').length > 0) {
        showDot = true;
      }
      $(slick1).slick({
        pauseOnFocus: false,
        pauseOnHover: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true,
        speed: 1000,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 6000,
        arrows: true,
        appendArrows: $(wrapSlick1),
        prevArrow: '<button class="arrow-slick1 prev-slick1"><i class="zmdi zmdi-caret-left"></i></button>',
        nextArrow: '<button class="arrow-slick1 next-slick1"><i class="zmdi zmdi-caret-right"></i></button>',
        dots: showDot,
        appendDots: $(wrapSlick1).find('.wrap-slick1-dots'),
        dotsClass: 'slick1-dots',
        customPaging: function (slick, index) {
          var linkThumb = $(slick.$slides[index]).data('thumb');
          var caption = $(slick.$slides[index]).data('caption');
          return '<img src="' + linkThumb + '">' +
            '<span class="caption-dots-slick1">' + caption + '</span>';
        },
      });
      $(slick1).on('afterChange', function (event, slick, currentSlide) {
        var layerCurrentItem = $(itemSlick1[currentSlide]).find('.layer-slick1');
        for (var i = 0; i < actionSlick1.length; i++) {
          clearTimeout(actionSlick1[i]);
        }
        $(layerSlick1).each(function () {
          $(this).removeClass($(this).data('appear') + ' visible-true');
        });
        for (var i = 0; i < layerCurrentItem.length; i++) {
          actionSlick1[i] = setTimeout(function (index) {
            $(layerCurrentItem[index]).addClass($(layerCurrentItem[index]).data('appear') + ' visible-true');
          }, $(layerCurrentItem[i]).data('delay'), i);
        }
      });
    });
  }

  filterByCategory(category) {
    this.chose_tab = category;
    this.filterChanged();
  }

  filterChanged(): void {
    this.currentPage = 1; // Reset lại về trang 1
    this.loadProducts(this.currentPage);
  }

  loadProducts(page: number): void {
    this.http
      .post(environment.URL_API + 'sanphams/searchAll', {
        userId: this.idUser,
        Thap: this.thap,
        Cao: this.cao,
        GioiTinh: this.chose_tab,
        MauSac: this.chose_mau,
        NhanHieu: this.chose_nhan_hieu,
        PageIndex: page,
        PageSize: this.pageSize,
      }
      ).subscribe((response: PagedResult<Product>) => {
        this.list_product = response.items;
        this.totalCount = response.totalCount;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.currentPage = response.pageIndex;
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.loadProducts(page);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadProducts(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadProducts(this.currentPage - 1);
    }
  }
  getAllNhanHieu() {
    this.http.get(environment.URL_API + 'NhanHieus').subscribe(resp => {
      this.list_nhan_hieu = resp as any[];
      console.log(314, this.list_nhan_hieu);
    });
  }
}
