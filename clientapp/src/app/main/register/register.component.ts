import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseService } from 'src/app/service/base.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent extends BaseService implements OnInit {
  public register: any;
  userFormGroup: FormGroup
  public hide: boolean = true;
  username: any;
  private _unsubscribeAll: Subject<any>;
  constructor(public http: HttpClient, public router: Router, private _formBuilder: FormBuilder) {
    super();
    this.register = {};
    this._unsubscribeAll = new Subject();
  }
  check() {
    if (this.userFormGroup.value.Password != this.userFormGroup.value.RePassword) {
      Swal.fire("Mật khẩu không trùng nhau", '', 'warning').then(function () {
      }
      )
    }
    else {
      this.registerAccount()
    }
  }
  passwordsMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('Password')?.value;
      const confirmPassword = control.get('RePassword')?.value;
      if (password !== confirmPassword) {
        control.get('RePassword')?.setErrors({ passwordsNotMatching: true });
        return { passwordsNotMatching: true };
      } else {
        const errors = control.get('RePassword')?.errors;
        if (errors) {
          delete errors['passwordsNotMatching'];
          if (Object.keys(errors).length === 0) {
            control.get('RePassword')?.setErrors(null);
          } else {
            control.get('RePassword')?.setErrors(errors);
          }
        }
        return null;
      }
    };
  }
  registerAccount() {
    this.http.post(environment.URL_API + "auth/registerCustomer", {
      data: this.userFormGroup.value
    }).subscribe({
      next: (res) => {
        Swal.fire("Đăng ký thành công", '', 'success').then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        Swal.fire("Đăng ký thất bại", 'email đã được sử dụng', 'error');
      }
    });
  }
  ngOnInit(): void {
    this.userFormGroup = this._formBuilder.group({
      FirstName: ['', [Validators.required]],
      LastName: ['', Validators.required],
      Email: ['', Validators.required],
      SDT: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      DiaChi: ['', Validators.required],
      Password: ['', [Validators.required]],
      RePassword: ['', [Validators.required]]
    }, {
      validators: this.passwordsMatchValidator()
    });
    this.userFormGroup.get('Password').valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.userFormGroup.get('RePassword').updateValueAndValidity();
      });
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
  preventNonNumberInput(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const charCode = event.which ? event.which : event.keyCode;

    // Chặn ký tự không phải số
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }

    // Nếu đã đủ 10 số → chặn thêm
    if (input.value.length >= 10) {
      event.preventDefault();
    }
  }

  limitInputLength(event: any, maxLength: number) {
    const input = event.target;
    if (input.value.length > maxLength) {
      input.value = input.value.slice(0, maxLength);
    }
  }
}
