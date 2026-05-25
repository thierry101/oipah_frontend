/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {

  private http = inject(HttpClient);


  getProjects(page: number = 1, search: any = '', statutLand: any = '', startDate: string = '', endDate: string = '', pagination: boolean = true) {
    const params: string[] = [];
    params.push(`page=${page}`);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (statutLand) {
      params.push(`statut_land=${encodeURIComponent(statutLand)}`);
    }
    if (startDate) {
      params.push(`start_date=${encodeURIComponent(startDate)}`);
    }
    if (endDate) {
      params.push(`end_date=${encodeURIComponent(endDate)}`);
    }
    const queryString = params.join('&');

    return this.http.get(`${environment.apiUrl}/start-project?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }


  postProject(data: any) {
    return this.http.post(`${environment.apiUrl}/start-project`, data, { withCredentials: true });
  }

}
