import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';


import { environment } from '../../environments/environment';
import { Project, ProjectRequest } from '../core/models';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private readonly http = inject(HttpClient);

  private readonly base = `${environment.apiUrl}/api/projects`;

  findAll(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.base}/findAll`);
  }

  findById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.base}/findById/${id}`);
  }

  save(request: ProjectRequest): Observable<Project> {
    return this.http.post<Project>(`${this.base}/save`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/delete/${id}`);
  }
}