/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  // Centralisation des clés
  private readonly ACCESS_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private router = inject(Router);



  postRegister(data: any) {
    return this.http.post(`${environment.apiUrl}/register`, data, { withCredentials: true });
  }


  postLogin(data: any) {
    return this.http.post(`${environment.apiUrl}/login`, data, { withCredentials: true });
  }


  saveTokens(access: string, refresh: string) {
    localStorage.setItem(this.ACCESS_KEY, access);
    localStorage.setItem(this.REFRESH_KEY, refresh);
  }

  getAccessToken() { return localStorage.getItem(this.ACCESS_KEY); }

  getRefreshToken() { return localStorage.getItem(this.REFRESH_KEY); }


  refreshToken(): Observable<any> {
    const refresh = this.getRefreshToken();
    return this.http.post(`${environment.apiUrl}/refresh-token`, { refresh }).pipe(
      tap((res: any) => {
        this.saveTokens(res.access, res.refresh); // ✅ sauvegarde les deux tokens
      })
    );
  }

  logout() {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);

    return this.http.post(`${environment.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      catchError(() => of(null)) // logout local même si le serveur échoue
    ).subscribe(() => {
      this.router.navigate(['/login']);
    });
  }


  postUsr(data: any) {
    return this.http.post(`${environment.apiUrl}/register-user`, data, { withCredentials: true });
  }


  editUsr(idUser: number, data: any) {
    return this.http.put(`${environment.apiUrl}/edit-user/${idUser}`, data, { withCredentials: true });
  }


  deleteUsr(idUser: number) {
    return this.http.delete(`${environment.apiUrl}/edit-user/${idUser}`, { withCredentials: true });
  }


  getUsers(page: number = 1, search: any = '', pagination: boolean = true) {
    const params: string[] = [];
    params.push(`page=${page}`);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    const queryString = params.join('&');

    return this.http.get(`${environment.apiUrl}/register-user?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }
}
