import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ToastServiceService } from '../../../shared/toast-service.service';
import { BlogService } from '../blog.service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  constructor(public service: BlogService,
    public http: HttpClient,
    public toastr: ToastrService,
    public serviceToast: ToastServiceService,
  ) {
  }

  public Editor = ClassicEditor;
  public newFormGroup: FormGroup;
  urls = new Array<string>();

  async ngOnInit() {
    if (this.service.blog.id) {
      const imageUrl = 'https://localhost:44302/Images/list-image-blog/' + this.service.blog.image;
      // Hiển thị trước
      this.urls = [imageUrl];

      // Tạo file giả lập và gọi gopHam()
      fetch(imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], this.service.blog.image, { type: blob.type });
          const fileList = this.arrayToFileList([file]);
          this.gopHam({ target: { files: fileList } });
        })
        .catch(err => console.error('Không thể tải ảnh mặc định:', err));
    }

    this.newFormGroup = new FormGroup({
    TieuDe: new FormControl(null,
      [
        Validators.required,
        Validators.minLength(2),
      ]),
    NoiDung: new FormControl(null,
      [
        Validators.required,
        Validators.minLength(5),
      ]),
    Hinh: new FormControl(null,
      [
        Validators.required,
      ]
    )
  });
  }

arrayToFileList(files: File[]): FileList {
  const dataTransfer = new DataTransfer();
  files.forEach(f => dataTransfer.items.add(f));
  return dataTransfer.files;
}

gopHam(event) {
  this.detectFiles(event)
  this.onSelectFile(event)
}
detectFiles(event) {
  this.urls = [];
  let files = event.target.files;
  for (let file of files) {
    let reader = new FileReader();
    reader.onload = (e: any) => {
      this.urls.push(e.target.result);
    }
    reader.readAsDataURL(file);
  }
}
onSelectFile(fileInput: any) {
  this.selectedFile = <FileList>fileInput.target.files;
}
selectedFile: FileList;
clearForm() {
  this.newFormGroup.reset();
}
onSubmit = (data) => {
  if (this.service.blog.id == 0) {
    let form = new FormData();
    for (let i = 0; i < this.urls.length; i++) {
      form.append('files', this.selectedFile.item(i))
    }
    form.append('TieuDe', data.TieuDe);
    form.append('NoiDung', data.NoiDung);
    this.service.post(form)
      .subscribe(res => {
        this.serviceToast.showToastThemThanhCong()
        this.clearForm();
      }, err => {
        this.serviceToast.showToastThemThatBai()
      }
      );
  }
  else {
    const form = new FormData();
    form.append('TieuDe', data.TieuDe);
    form.append('NoiDung', data.NoiDung);
    for (let i = 0; i < this.urls.length; i++) {
      form.append('files', this.selectedFile.item(i))
    }
    this.service.put(this.service.blog.id, form)
      .subscribe(res => {
        this.clearForm();
      }, err => {
        this.serviceToast.showToastSuaThatBai()
      });
  }
}
}
