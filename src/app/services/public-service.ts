/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class PublicService {

  private http = inject(HttpClient);

  private userSubject = new BehaviorSubject<any>(null);
  private allSectorsSubject = new BehaviorSubject<any>(null);
  // Observable accessible partout
  user$ = this.userSubject.asObservable();
  allSectors$ = this.allSectorsSubject.asObservable();


  // Appel API
  getUser(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/state-user`).pipe(
      tap(user => this.userSubject.next(user))
    );
  }


  // Accès instantané à la valeur actuelle
  get currentUser() {
    return this.userSubject.value;
  }


  // Reset logout
  clearUser() {
    this.userSubject.next(null);
  }


  putSettingOipah(data: any) {
    return this.http.put(`${environment.apiUrl}/update-settings`, data, { withCredentials: true });
  }


  getSettingOipah() {
    return this.http.get(`${environment.apiUrl}/update-settings`, { withCredentials: true });
  }


  postDonor(data: any) {
    return this.http.post(`${environment.apiUrl}/register-grantor`, data, { withCredentials: true });
  }


  getDonors(page: number = 1, search: any = '', pagination: boolean = true) {
    const params: string[] = [];
    params.push(`page=${page}`);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    const queryString = params.join('&');

    return this.http.get(`${environment.apiUrl}/register-grantor?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }


  putDonor(idDonor: any, data: any) {
    return this.http.put(`${environment.apiUrl}/edit-grantor/${idDonor}`, data, { withCredentials: true });
  }


  deleteDonor(idDonor: any) {
    return this.http.delete(`${environment.apiUrl}/edit-grantor/${idDonor}`, { withCredentials: true });
  }


  getAllSectors(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/retrieve-agricultural`).pipe(
      tap(user => this.allSectorsSubject.next(user))
    );
  }


  // Accès instantané à la valeur actuelle
  get allSectors() {
    return this.allSectorsSubject.value;
  }

}
