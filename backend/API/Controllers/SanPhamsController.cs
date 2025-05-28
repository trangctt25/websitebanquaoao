using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using API.Data;
using API.Dtos;
using API.Models;
using API.Helper.SignalR;
using API.Helper;
using Nancy.Json;
using System.Security.Cryptography;
using System.Security.Claims;
namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SanPhamsController : Controller
    {
        private readonly DPContext _context;
        private readonly IHubContext<BroadcastHub, IHubClient> _hubContext;
        public SanPhamsController(DPContext context, IHubContext<BroadcastHub, IHubClient> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }
        [HttpPost("size/{id}")]
        public async Task<ActionResult> Size(int idLoai)
        {
            var resuft = _context.Sizes.Where(d => d.Id_Loai == idLoai).Select(
                d => new TenSizeLoai
                {
                    SizeLoaiTen = d.TenSize
                });
            return Json(await resuft.FirstOrDefaultAsync());
        }
        [HttpPost("mau/{id}")]
        public async Task<ActionResult<IEnumerable<MauSac>>> Mau(int idLoai)
        {
            return await _context.MauSacs.Where(d => d.Id_Loai == idLoai).ToListAsync();
        }
        [HttpPost("like")]
        public async Task<ActionResult> LikeSanPham(UserLike userlike)
        {
            var resuft = await _context.UserLikes.Where(d => d.IdSanPham == userlike.IdSanPham && d.IdUser == userlike.IdUser).FirstOrDefaultAsync();
            if (resuft == null)
            {
                resuft = new UserLike
                {
                    IdSanPham = userlike.IdSanPham,
                    IdUser = userlike.IdUser,
                };
                _context.Add(resuft);
                _context.SaveChanges();
                return Json(1);
            }
            else
            {
                _context.Remove(resuft);
                _context.SaveChanges();
                return Json(2);
            }
        }
        [HttpPost("dslike")]
        public async Task<ActionResult> ListLikeSanPham(UserLike userlike)
        {
            var resuft = from uk in _context.UserLikes.Where(d => d.IdUser == userlike.IdUser)
                         from sp in _context.SanPhams.Where(w => w.Id == uk.IdSanPham)
                         select new SanPhamLike()
                         {
                             id = uk.Id,
                             idSanPham = sp.Id,
                             ten = sp.Ten,
                             gia = sp.GiaBan ?? 0,
                         };
            return Json(await resuft.ToListAsync());
        }
        [HttpPost("deletelike/{id}")]
        public async Task<ActionResult> DeleteLike(int id)
        {
            var card = _context.UserLikes.Where(d => d.Id == id).SingleOrDefault();
            _context.UserLikes.Remove(card);
            await _context.SaveChangesAsync();
            return Json("1");
        }
        [HttpPost("review")]
        public async Task<ActionResult> Review(UserComment usercomment)
        {
            var resuft = new UserComment
            {
                NgayComment = DateTime.Now,
                IdSanPham = usercomment.IdSanPham,
                Content = usercomment.Content,
                IdUser = usercomment.IdUser,
            };
            _context.Add(resuft);
            _context.SaveChanges();
            var listcomment = _context.UserComments.Where(d => d.IdSanPham == usercomment.IdSanPham).Select(
                d => new Review
                {
                    Content = d.Content,
                    tenUser = _context.AppUsers.Where(s => s.Id == d.IdUser).Select(s => s.FirstName + " " + s.LastName).SingleOrDefault(),
                    NgayComment = d.NgayComment
                }
                );
            return Json(await listcomment.ToListAsync());
        }
        [HttpPost("listreview")]
        public async Task<ActionResult> ListReview(UserComment usercomment)
        {
            var listcomment = _context.UserComments.Where(d => d.IdSanPham == usercomment.IdSanPham).Select(
                d => new Review
                {
                    Content = d.Content,
                    tenUser = _context.AppUsers.Where(s => s.Id == d.IdUser).Select(s => s.FirstName + " " + s.LastName).SingleOrDefault(),
                    NgayComment = d.NgayComment
                }
                );
            return Json(await listcomment.ToListAsync());
        }
        [HttpPost("checklike")]
        public async Task<ActionResult> checkLikeSanPham(UserLike userlike)
        {
            var resuft = await _context.UserLikes.Where(d => d.IdSanPham == userlike.IdSanPham && d.IdUser == userlike.IdUser).FirstOrDefaultAsync();
            if (resuft == null)
            {
                return Json(1);
            }
            else
            {
                return Json(2);
            }
        }
        // GET: api/SanPhams
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SanPhamLoaiThuongHieu>>> GetSanPhams()
        {
            var listIdSanPhamliked = await _context.UserLikes.Select(s => s.IdSanPham).ToListAsync();
            var list = await _context.SanPhams.Select(
                   s => new SanPhamLoaiThuongHieu()
                   {
                       Id = s.Id,
                       Ten = s.Ten,
                       GiaBan = s.GiaBan,
                       GiaNhap = s.GiaNhap,
                       Tag = s.Tag,
                       KhuyenMai = s.KhuyenMai,
                       MoTa = s.MoTa,
                       HuongDan = s.HuongDan,
                       GioiTinh = s.GioiTinh,
                       ThanhPhan = s.ThanhPhan,
                       IsLike = listIdSanPhamliked.Contains(s.Id),
                       TrangThaiSanPham = s.TrangThaiSanPham,
                       TrangThaiHoatDong = s.TrangThaiHoatDong,
                       Id_Loai = s.Id_Loai,
                       Id_NhanHieu = s.Id_NhanHieu,
                       Id_NhaCungCap = s.Id_NhaCungCap,
                       SoLuongComment = _context.UserComments.Where(x => x.IdSanPham == s.Id).Count(),
                       SoLuongLike = _context.UserComments.Where(x => x.IdSanPham == s.Id).Count(),
                       TenLoai = _context.Loais.Where(d => d.Id == s.Id_Loai).Select(d => d.Ten).FirstOrDefault(),
                       TenNhanHieu = _context.NhanHieus.Where(d => d.Id == s.Id_NhanHieu).Select(d => d.Ten).FirstOrDefault(),
                       Image = _context.ImageSanPhams.Where(q => q.IdSanPham == s.Id).Select(q => q.ImageName).FirstOrDefault(),
                   }).OrderByDescending(e => e.Id).ToListAsync();
            return list;
        }
        // GET: api/SanPhams/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SanPham>> GetSanPham(int id)
        {
            var sanPham = await _context.SanPhams.FindAsync(id);
            if (sanPham == null)
            {
                return NotFound();
            }
            return sanPham;
        }
        [HttpPut("capnhattrangthaihoatdong/{id}")]
        public async Task<ActionResult> PutSanPhamTrangThaiHoatDong(int id, SanPham sp)
        {
            SanPham sanpham = new SanPham();
            sanpham = await _context.SanPhams.FirstOrDefaultAsync(s => s.Id == id);
            sanpham.TrangThaiHoatDong = !sp.TrangThaiHoatDong;
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.BroadcastMessage();
            return Ok();
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSanPham(int id, [FromForm] UploadSanpham upload)
        {
            var listImage = new List<ImageSanPham>();
            SanPham sanpham = new SanPham();
            sanpham = await _context.SanPhams.FirstOrDefaultAsync(s => s.Id == id);
            sanpham.Ten = upload.Ten;
            sanpham.NgayCapNhat = DateTime.Now;
            sanpham.HuongDan = upload.HuongDan;
            sanpham.MoTa = upload.MoTa;
            sanpham.GiaBan = upload.GiaBan;
            sanpham.Tag = upload.Tag;
            sanpham.GioiTinh = upload.GioiTinh;
            sanpham.GiaNhap = upload.GiaNhap;
            sanpham.KhuyenMai = upload.KhuyenMai;
            sanpham.ThanhPhan = upload.ThanhPhan;
            sanpham.TrangThaiHoatDong = upload.TrangThaiHoatDong;
            sanpham.TrangThaiSanPham = upload.TrangThaiSanPham;
            if (upload.Id_NhanHieu == null)
            {
                sanpham.Id_NhanHieu = sanpham.Id_NhanHieu;
            }
            else
            {
                sanpham.Id_NhanHieu = upload.Id_NhanHieu;
            }
            if (upload.Id_Loai == null)
            {
                sanpham.Id_Loai = sanpham.Id_Loai;
            }
            else
            {
                sanpham.Id_Loai = upload.Id_Loai;
            }
            if (upload.Id_NhaCungCap == null)
            {
                sanpham.Id_NhaCungCap = sanpham.Id_NhaCungCap;
            }
            Notification notification = new Notification()
            {
                TenSanPham = upload.Ten,
                TranType = "Edit"
            };
            _context.Notifications.Add(notification);
            ImageSanPham[] images = _context.ImageSanPhams.Where(s => s.IdSanPham == id).ToArray();
            _context.ImageSanPhams.RemoveRange(images);
            ImageSanPham image = new ImageSanPham();
            var imageSanPhams = _context.ImageSanPhams.ToArray().Where(s => s.IdSanPham == id);
            foreach (var i in imageSanPhams)
            {
                FileHelper.DeleteFileOnTypeAndNameAsync("product", i.ImageName);
            }
            if (upload.files != null)
            {
                var file = upload.files.ToArray();

                for (int i = 0; i < file.Length; i++)
                {
                    if (file[i].Length > 0 && file[i].Length < 5242880)
                    {
                        listImage.Add(new ImageSanPham()
                        {
                            ImageName = await FileHelper.UploadImageAndReturnFileNameAsync(upload, null, "product", (IFormFile[])file, i),
                            IdSanPham = sanpham.Id,
                        });
                    }
                }
            }
            else // xu li khi khong cap nhat hinh
            {
                List<ImageSanPham> List;
                List = _context.ImageSanPhams.Where(s => s.IdSanPham == id).ToList();
                foreach (ImageSanPham img in List)
                    listImage.Add(new ImageSanPham()
                    {
                        ImageName = img.ImageName,
                        IdSanPham = sanpham.Id,
                    }); ;
            };
            sanpham.ImageSanPhams = listImage;
            _context.SanPhams.Update(sanpham);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.BroadcastMessage();
            return Ok();
        }
        // POST: api/SanPhams
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<SanPham>> PostSanPham([FromForm] UploadSanpham upload)
        {
            var listImage = new List<ImageSanPham>();
            SanPham sanpham = new SanPham()
            {
                Ten = upload.Ten,
                NgayTao = DateTime.Now,
                HuongDan = upload.HuongDan,
                MoTa = upload.MoTa,
                ThanhPhan = upload.ThanhPhan,
                TrangThaiHoatDong = upload.TrangThaiHoatDong,
                TrangThaiSanPham = upload.TrangThaiSanPham,
                GiaBan = upload.GiaBan,
                GioiTinh = upload.GioiTinh,
                GiaNhap = upload.GiaNhap,
                Tag = upload.Tag,
                KhuyenMai = upload.KhuyenMai,
                Id_Loai = upload.Id_Loai,
                Id_NhanHieu = upload.Id_NhanHieu,
                Id_NhaCungCap = upload.Id_NhaCungCap,
            };
            Notification notification = new Notification()
            {
                TenSanPham = upload.Ten,
                TranType = "Add"
            };
            _context.Notifications.Add(notification);
            var file = upload.files.ToArray();
            _context.SanPhams.Add(sanpham);
            await _context.SaveChangesAsync();
            if (upload.files != null)
            {
                for (int i = 0; i < file.Length; i++)
                {
                    if (file[i].Length > 0)
                    {
                        try
                        {
                            var imageSanPham = new ImageSanPham();
                            imageSanPham.ImageName = await FileHelper.UploadImageAndReturnFileNameAsync(upload, null, "product", upload.files.ToArray(), i);
                            imageSanPham.IdSanPham = sanpham.Id;
                            _context.ImageSanPhams.Update(imageSanPham);
                            await _context.SaveChangesAsync();
                        }
                        catch (Exception e)
                        {
                            throw e;
                        }

                    }
                }
            }
            await _hubContext.Clients.All.BroadcastMessage();
            return Ok();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSanPham(int id)
        {
            var spbts = _context.SanPhamBienThes.Where(s => s.Id_SanPham == id).ToList();

            foreach (var item in spbts)
            {
                var sanPhamBienTheId = item.Id;  // ID của sản phẩm bạn muốn xóa

                // Xóa các bản ghi liên quan trong bảng ChiTietPhieuNhapHangs
                var chiTietPhieuNhapHangs = _context.ChiTietPhieuNhapHangs.Where(c => c.Id_SanPhamBienThe == sanPhamBienTheId).ToList();
                _context.ChiTietPhieuNhapHangs.RemoveRange(chiTietPhieuNhapHangs);

                // Xóa các bản ghi liên quan trong bảng ChiTietHoaDons
                var chiTietHoaDons = _context.ChiTietHoaDons.Where(c => c.Id_SanPhamBienThe == sanPhamBienTheId).ToList();
                _context.ChiTietHoaDons.RemoveRange(chiTietHoaDons);

                // Sau khi xóa dữ liệu liên quan, có thể xóa bản ghi chính trong bảng SanPhamBienThes
                var sanPhamBienThe = _context.SanPhamBienThes.Find(sanPhamBienTheId);
                if (sanPhamBienThe != null)
                {
                    _context.SanPhamBienThes.Remove(sanPhamBienThe);
                }

                _context.SanPhamBienThes.RemoveRange(spbts);
            }

            var images = _context.ImageSanPhams.Where(s => s.IdSanPham == id).ToList();
            foreach (var i in images)
            {
                FileHelper.DeleteFileOnTypeAndNameAsync("product", i.ImageName);
            }
            _context.ImageSanPhams.RemoveRange(images);

            var sanPham = await _context.SanPhams.FindAsync(id);
            if (sanPham == null)
            {
                return NotFound();
            }
            var CategoryConstraint = _context.Loais.Where(s => s.Id == id);
            var BrandConstraint = _context.NhanHieus.SingleOrDefaultAsync(s => s.Id == id);
            if (CategoryConstraint != null)
            {
                _context.SanPhams.Remove(sanPham);
            }
            if (BrandConstraint != null)
            {
                _context.SanPhams.Remove(sanPham);
            }
            Notification notification = new Notification()
            {
                TenSanPham = sanPham.Ten,
                TranType = "Delete"
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.BroadcastMessage();
            return Ok();
        }
        [HttpGet("loai/{id}")]
        public async Task<ActionResult<IEnumerable<SanPham>>> GetCategory(int id)
        {
            return await _context.SanPhams.Where(s => s.Id_Loai == id || s.Id_NhanHieu == id).ToListAsync();
        }
        [HttpGet("nhanhieu/{id}")]
        public async Task<ActionResult<IEnumerable<SanPham>>> GetBrand(int id)
        {
            return await _context.SanPhams.Where(s => s.Id_NhanHieu == id).ToListAsync();
        }
        [HttpGet("loainhanhieu/{id}")]
        public async Task<ActionResult<IEnumerable<SanPham>>> GetBrandCate(int id)
        {
            var get = _context.SanPhams.Where(s => s.Id_Loai == id);
            if (get != null)
            {
                return await _context.SanPhams.Where(s => s.Id_Loai == id).ToListAsync();
            }
            else
            {
                return await _context.SanPhams.Where(s => s.Id_NhanHieu == id).ToListAsync();
            }
        }
        [HttpGet("chitietsanpham/{id}")]
        public async Task<ActionResult<ProductDetail>> Chitiet(int id)
        {
            ProductDetail pr;
            List<ImageSanPham> listImage;
            listImage = await _context.ImageSanPhams.Where(s => s.IdSanPham == id).ToListAsync();
            List<SanPhamBienTheMauSize> listSPBT;
            var temp = from s in _context.SanPhamBienThes
                       join z in _context.Sizes
                       on s.SizeId equals z.Id
                       join m in _context.MauSacs
                       on s.Id_Mau equals m.Id
                       select new SanPhamBienTheMauSize()
                       {
                           Id = s.Id,
                           SoLuongTon = s.SoLuongTon,
                           TenMau = m.MaMau,
                           TenSize = z.TenSize,
                           Id_SanPham = s.Id_SanPham,
                       };
            listSPBT = await temp.Where(s => s.Id_SanPham == id).ToListAsync();
            var kb = from s in _context.SanPhams
                     join spbt in _context.SanPhamBienThes
                     on s.Id equals spbt.Id_SanPham
                     join hinh in _context.ImageSanPhams
                     on s.Id equals hinh.IdSanPham
                     join th in _context.NhanHieus
                     on s.Id_NhanHieu equals th.Id
                     join l in _context.Loais
                     on s.Id_Loai equals l.Id
                     join ncc in _context.NhaCungCaps
                     on s.Id_NhaCungCap equals ncc.Id
                     select new ProductDetail()
                     {
                         Id = s.Id,
                         Ten = s.Ten,
                         GiaBan = s.GiaBan,
                         Tag = s.Tag,
                         KhuyenMai = s.KhuyenMai,
                         MoTa = s.MoTa,
                         GioiTinh = s.GioiTinh,
                         HuongDan = s.HuongDan,
                         TenNhaCungCap = ncc.Ten,
                         ThanhPhan = s.ThanhPhan,
                         TrangThaiSanPham = s.TrangThaiSanPham,
                         TrangThaiHoatDong = s.TrangThaiHoatDong,
                         Id_Loai = s.Id_Loai,
                         Id_NhanHieu = s.Id_NhanHieu,
                         TenLoai = l.Ten,
                         TenNhanHieu = th.Ten,
                         ImageSanPhams = listImage,
                         SanPhamBienThes = listSPBT,
                     };
            pr = kb.FirstOrDefault(s => s.Id == id);
            return pr;
        }
        [HttpGet("topsanphammoi")]
        public async Task<ActionResult<IEnumerable<SanPhamLoaiThuongHieu>>> DanhSachHangMoi(string userId)
        {
            var aa = User.FindFirstValue("id");
            var listIdSanPhamliked = await _context.UserLikes.Where(s => s.IdUser == userId).Select(s => s.IdSanPham).ToListAsync();

            var kb = _context.SanPhams.Select(
                   s => new SanPhamLoaiThuongHieu()
                   {
                       Id = s.Id,
                       Ten = s.Ten,
                       GiaBan = s.GiaBan,
                       Tag = s.Tag,
                       KhuyenMai = s.KhuyenMai,
                       MoTa = s.MoTa,
                       HuongDan = s.HuongDan,
                       GioiTinh = s.GioiTinh,
                       ThanhPhan = s.ThanhPhan,
                       TrangThaiSanPham = s.TrangThaiSanPham,
                       TrangThaiHoatDong = s.TrangThaiHoatDong,
                       Id_Loai = s.Id_Loai,
                       Id_NhanHieu = s.Id_NhanHieu,
                       TenLoai = _context.Loais.Where(d => d.Id == s.Id_Loai).Select(d => d.Ten).FirstOrDefault(),
                       TenNhanHieu = _context.NhanHieus.Where(d => d.Id == s.Id_NhanHieu).Select(d => d.Ten).FirstOrDefault(),
                       Image = _context.ImageSanPhams.Where(q => q.IdSanPham == s.Id).Select(q => q.ImageName).FirstOrDefault(),
                       IsLike = listIdSanPhamliked.Contains(s.Id),
                   }).Take(20).Where(s => s.TrangThaiSanPham == "new" && s.TrangThaiHoatDong == true);
            return await kb.ToListAsync();
        }
        [HttpPost("sapxepsanpham")]
        public async Task<ActionResult> SapXepSP(SapXep sx)
        {
            var kb = _context.SanPhams.Where(d => d.GiaBan > sx.Thap && d.GiaBan < sx.Cao).Select(
                   s => new SanPhamLoaiThuongHieu()
                   {
                       Id = s.Id,
                       Ten = s.Ten,
                       GiaBan = s.GiaBan,
                       Tag = s.Tag,
                       KhuyenMai = s.KhuyenMai,
                       MoTa = s.MoTa,
                       HuongDan = s.HuongDan,
                       GioiTinh = s.GioiTinh,
                       ThanhPhan = s.ThanhPhan,
                       TrangThaiSanPham = s.TrangThaiSanPham,
                       TrangThaiHoatDong = s.TrangThaiHoatDong,
                       Id_Loai = s.Id_Loai,
                       Id_NhanHieu = s.Id_NhanHieu,
                       TenLoai = _context.Loais.Where(d => d.Id == s.Id_Loai).Select(d => d.Ten).FirstOrDefault(),
                       TenNhanHieu = _context.NhanHieus.Where(d => d.Id == s.Id_NhanHieu).Select(d => d.Ten).FirstOrDefault(),
                       Image = _context.ImageSanPhams.Where(q => q.IdSanPham == s.Id).Select(q => q.ImageName).FirstOrDefault(),
                   }).Take(20);
            return Json(await kb.ToListAsync());
        }
        [HttpPost("searchtheomau")]
        public async Task<IActionResult> getListTaskCalendar([FromBody] JObject json)
        {
            var mau = json.GetValue("mausac").ToString();
            var list_id_mau = _context.MauSacs.Where(d => d.MaMau == mau).Select(d => d.Id.ToString()).ToList();
            var list_spbienthe_theomau = _context.SanPhamBienThes.Where(d => list_id_mau.Contains((d.Id_Mau.ToString()))).Select(d => d.Id_SanPham).Distinct().ToList();
            var kb = _context.SanPhams.Where(d => list_spbienthe_theomau.Contains(d.Id)).Select(
                   s => new SanPhamLoaiThuongHieu()
                   {
                       Id = s.Id,
                       Ten = s.Ten,
                       GiaBan = s.GiaBan,
                       Tag = s.Tag,
                       KhuyenMai = s.KhuyenMai,
                       MoTa = s.MoTa,
                       HuongDan = s.HuongDan,
                       GioiTinh = s.GioiTinh,
                       ThanhPhan = s.ThanhPhan,
                       TrangThaiSanPham = s.TrangThaiSanPham,
                       TrangThaiHoatDong = s.TrangThaiHoatDong,
                       Id_Loai = s.Id_Loai,
                       Id_NhanHieu = s.Id_NhanHieu,
                       TenLoai = _context.Loais.Where(d => d.Id == s.Id_Loai).Select(d => d.Ten).FirstOrDefault(),
                       TenNhanHieu = _context.NhanHieus.Where(d => d.Id == s.Id_NhanHieu).Select(d => d.Ten).FirstOrDefault(),
                       Image = _context.ImageSanPhams.Where(q => q.IdSanPham == s.Id).Select(q => q.ImageName).FirstOrDefault(),
                   }).Take(20);
            return Json(await kb.ToListAsync());
        }

        [HttpPost("searchAll")]
        public async Task<PagedResult<SanPhamLoaiThuongHieu>> SearchAll(SanPhamSearchModel sx)
        {
            var listIdSanPhamliked = await _context.UserLikes.Where(s => s.IdUser == sx.UserId).Select(s => s.IdSanPham).ToListAsync();

            var query = from sp in _context.SanPhams
                        where
                        (sx.Thap == null || sp.GiaBan > sx.Thap) &&
                        (sx.Cao == null || sp.GiaBan < sx.Cao) &&
                        (sx.GioiTinh == null || sp.GioiTinh == sx.GioiTinh) &&
                        sp.TrangThaiHoatDong == true
                        join spbt in _context.SanPhamBienThes on sp.Id equals spbt.Id_SanPham
                        join mauSac in _context.MauSacs on spbt.Id_Mau equals mauSac.Id
                        join loai in _context.Loais on sp.Id_Loai equals loai.Id into loaiGroup
                        from loai in loaiGroup.DefaultIfEmpty()
                        join nhanHieu in _context.NhanHieus on sp.Id_NhanHieu equals nhanHieu.Id into nhanHieuGroup
                        from nhanHieu in nhanHieuGroup.DefaultIfEmpty()
                        join image in _context.ImageSanPhams on sp.Id equals image.IdSanPham into imageGroup
                        from image in imageGroup.DefaultIfEmpty()
                        where string.IsNullOrEmpty(sx.MauSac) || mauSac.MaMau == sx.MauSac
                        where string.IsNullOrEmpty(sx.NhanHieu) || nhanHieu.Ten == sx.NhanHieu
                        select new SanPhamLoaiThuongHieu()
                        {
                            Id = sp.Id,
                            Ten = sp.Ten,
                            GiaBan = sp.GiaBan,
                            Tag = sp.Tag,
                            KhuyenMai = sp.KhuyenMai,
                            MoTa = sp.MoTa,
                            HuongDan = sp.HuongDan,
                            GioiTinh = sp.GioiTinh,
                            ThanhPhan = sp.ThanhPhan,
                            TrangThaiSanPham = sp.TrangThaiSanPham,
                            TrangThaiHoatDong = sp.TrangThaiHoatDong,
                            Id_Loai = sp.Id_Loai,
                            Id_NhanHieu = sp.Id_NhanHieu,
                            TenLoai = loai != null ? loai.Ten : null,
                            TenNhanHieu = nhanHieu != null ? nhanHieu.Ten : null,
                            Image = image != null ? image.ImageName : null,
                            IsLike = listIdSanPhamliked.Contains(sp.Id),
                        };

            var result = query
                .AsEnumerable()
    .GroupBy(x => x.Id)
    .Select(g => new SanPhamLoaiThuongHieu
    {
        Id = g.Key,
        Ten = g.First().Ten,
        GiaBan = g.First().GiaBan,
        Tag = g.First().Tag,
        KhuyenMai = g.First().KhuyenMai,
        MoTa = g.First().MoTa,
        HuongDan = g.First().HuongDan,
        GioiTinh = g.First().GioiTinh,
        ThanhPhan = g.First().ThanhPhan,
        TrangThaiSanPham = g.First().TrangThaiSanPham,
        TrangThaiHoatDong = g.First().TrangThaiHoatDong,
        Id_Loai = g.First().Id_Loai,
        Id_NhanHieu = g.First().Id_NhanHieu,
        TenLoai = g.First().TenLoai,
        TenNhanHieu = g.First().TenNhanHieu,
        Image = g.First().Image,
        IsLike = g.First().IsLike,
    });

            int totalCount = result.Count();

            var items = result
                .Skip((sx.PageIndex - 1) * sx.PageSize)
                .Take(sx.PageSize)
                .ToList();

            return new PagedResult<SanPhamLoaiThuongHieu>
            {
                Items = items,
                TotalCount = totalCount,
                PageIndex = sx.PageIndex,
                PageSize = sx.PageSize
            };
        }
    }

    public class SanPhamSearchModel
    {
        public string UserId { get; set; }
        public decimal? Thap { get; set; }
        public decimal? Cao { get; set; }
        public int? GioiTinh { get; set; }
        public string MauSac { get; set; }
        public int PageIndex { get; set; }        // Trang hiện tại (mặc định: 1)
        public int PageSize { get; set; }         // Kích thước mỗi trang (mặc định: 10)
        public string NhanHieu { get; set; }
        public SanPhamSearchModel()
        {
            PageIndex = 1;       // Mặc định trang đầu tiên
            PageSize = 10;       // Mặc định mỗi trang có 10 sản phẩm
        }
    }
}