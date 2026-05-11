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


  putAgricultural(id_sector:any, data: any) {
    return this.http.put(`${environment.apiUrl}/edit-agricultural/${id_sector}`, data, { withCredentials: true });
  }


  deleteAgricultural(id_sector:any) {
    return this.http.delete(`${environment.apiUrl}/edit-agricultural/${id_sector}`, { withCredentials: true });
  }


}
