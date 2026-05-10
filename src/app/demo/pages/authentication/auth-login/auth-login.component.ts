/* eslint-disable @typescript-eslint/no-explicit-any */
// project import
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service';
import { showError } from 'src/app/share/shared';

@Component({
  selector: 'app-auth-login',
  imports: [RouterModule, FormsModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss'
})
export class AuthLoginComponent {
  // public method
  email: string = ''
  password: string = ''
  errors: any = []

  private authService = inject(AuthService);
  private router = inject(Router)

  loginUser() {
    const data = { email: this.email, password: this.password };

    this.authService.postLogin(data).subscribe({
      next: (res: any) => {
        // On délègue la responsabilité au service
        this.authService.saveTokens(res.access_token, res.refresh_token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errors = err.error.errors || {};
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    });
  }

}
