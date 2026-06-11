/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {

  private http = inject(HttpClient);


  getEndedProjects(page: number = 1, search: any = '', pagination: boolean = true) {
    const params: string[] = [];
    params.push(`page=${page}`);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    const queryString = params.join('&');

    return this.http.get(`${environment.apiUrl}/get-ended-project?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }


  getProjects(page: number = 1, search: any = '', typeProject: any = '', statutLand: string = '', filiere: string = '', pagination: boolean = true) {
    const params: string[] = [];
    params.push(`page=${page}`);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (typeProject) {
      params.push(`type_project=${encodeURIComponent(typeProject)}`);
    }
    if (statutLand) {
      params.push(`statut_land=${encodeURIComponent(statutLand)}`);
    }
    if (filiere) {
      params.push(`filiere=${encodeURIComponent(filiere)}`);
    }
    const queryString = params.join('&');

    return this.http.get(`${environment.apiUrl}/start-project?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }


  postProject(data: any) {
    return this.http.post(`${environment.apiUrl}/start-project`, data, { withCredentials: true });
  }


  getHistorikProject(idProject: number,) {
    return this.http.get(`${environment.apiUrl}/delete-update-project/${idProject}`, { withCredentials: true });
  }


  putProject(idProject: number, data: any) {
    return this.http.put(`${environment.apiUrl}/delete-update-project/${idProject}`, data, { withCredentials: true });
  }


  deleteProject(idProject: number) {
    return this.http.delete(`${environment.apiUrl}/delete-update-project/${idProject}`, { withCredentials: true });
  }


  getCommProject() {
    return this.http.get(`${environment.apiUrl}/setting-commission`, { withCredentials: true });
  }


  postCommProject(data: any) {
    return this.http.post(`${environment.apiUrl}/setting-commission`, data, { withCredentials: true });
  }


  putCommProject(idComm: number, data: any) {
    return this.http.put(`${environment.apiUrl}/delete-update-commission/${idComm}`, data, { withCredentials: true });
  }


  postVehicle(data: any) {
    return this.http.post(`${environment.apiUrl}/get-add-vehicles`, data, { withCredentials: true });
  }


  getVehicle() {
    return this.http.get(`${environment.apiUrl}/get-add-vehicles`, { withCredentials: true });
  }


  getDrivers() {
    return this.http.get(`${environment.apiUrl}/get-drivers`, { withCredentials: true });
  }


  putVehicle(idVehicle: number, data: any) {
    return this.http.put(`${environment.apiUrl}/edit-delete-vehicles/${idVehicle}`, data, { withCredentials: true });
  }


  deleteVehicle(idVehicle: number,) {
    return this.http.delete(`${environment.apiUrl}/edit-delete-vehicles/${idVehicle}`, { withCredentials: true });
  }


  getUsersProject(page: number = 1, search: any = '', pagination: boolean = true) {
    const params: string[] = [];
    params.push(`page=${page}`);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    const queryString = params.join('&');

    return this.http.get(`${environment.apiUrl}/get-project-users?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }


  postFinalizeProject(idProject: number, data: any) {
    return this.http.post(`${environment.apiUrl}/finalize-project/${idProject}`, data, { withCredentials: true });
  }


  getFinalizeProject(idProject: number) {
    return this.http.get(`${environment.apiUrl}/finalize-project/${idProject}`, { withCredentials: true });
  }


  delFinalizeProject(idProject: number) {
    return this.http.delete(`${environment.apiUrl}/finalize-project/${idProject}`, { withCredentials: true });
  }
}


