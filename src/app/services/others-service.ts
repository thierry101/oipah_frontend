/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class OthersService {

  private http = inject(HttpClient);


  getAgricultural() {
    return this.http.get(`${environment.apiUrl}/create-agricultural`, { withCredentials: true });
  }


  postAgricultural(data: any) {
    return this.http.post(`${environment.apiUrl}/create-agricultural`, data, { withCredentials: true });
  }


  putAgricultural(id_sector: any, data: any) {
    return this.http.put(`${environment.apiUrl}/edit-agricultural/${id_sector}`, data, { withCredentials: true });
  }


  deleteAgricultural(id_sector: any) {
    return this.http.delete(`${environment.apiUrl}/edit-agricultural/${id_sector}`, { withCredentials: true });
  }


  postLand(data: any) {
    return this.http.post(`${environment.apiUrl}/plot-of-land`, data, { withCredentials: true });
  }


  getLands(page: number = 1, search: any = '', statutLand: any = '', pagination: boolean = true) {
    const params: string[] = [];
    params.push(`page=${page}`);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (statutLand) {
      params.push(`statut_land=${encodeURIComponent(statutLand)}`);
    }
    const queryString = params.join('&');

    return this.http.get(`${environment.apiUrl}/plot-of-land?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }


  putLand(id_land: number, data: any) {
    return this.http.put(`${environment.apiUrl}/edit-plot-of-land/${id_land}`, data, { withCredentials: true });
  }


  deleteLand(id_land: number) {
    return this.http.delete(`${environment.apiUrl}/edit-plot-of-land/${id_land}`, { withCredentials: true });
  }


}
