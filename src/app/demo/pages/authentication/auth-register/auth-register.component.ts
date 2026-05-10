/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { AuthService } from 'src/app/services/auth-service';
import { showError, swalWithRedirect } from 'src/app/share/shared';

@Component({
  selector: 'app-auth-register',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './auth-register.component.html',
  styleUrls: ['./auth-register.component.scss']
})
export class AuthRegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router)

  // public method

  name: string = ''
  surname: string = ''
  oipahName: string = ''
  email: string = ''
  password: string = ''
  phone: string = ''
  acceptTerms: boolean = false
  errors: any = []


  registerUser() {
    const data = {
      name: this.name,
      surname: this.surname,
      oipahName: this.oipahName,
      email: this.email,
      password: this.password,
      phone: this.phone,
      acceptTerms: this.acceptTerms
    }

    this.authService.postRegister(data).subscribe({
      next: () => {
        this.name = ''
        this.surname = ''
        this.oipahName = ''
        this.email = ''
        this.password = ''
        this.phone = ''
        this.acceptTerms = false
        this.errors = []
        swalWithRedirect("success", 'Utilisateur créé', 'Utilisateur créé avec succès', this.router.navigate(['/login']), false)
      },
      error: (err) => {
        // this.isSubmitPayment = false
        this.errors = err.error.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }
}
