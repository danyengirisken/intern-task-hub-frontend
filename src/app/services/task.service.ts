import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task, TaskRequest } from '../core/models';

/**
 * Görev CRUD servisi. JWT token, AuthInterceptor tarafından otomatik eklenir.
 * Uçlar carbon stili: findAll / findById / save / delete.
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/tasks`;

  findAll(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.base}/findAll`);
  }

  findById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.base}/findById/${id}`);
  }

  save(request: TaskRequest): Observable<Task> {
    return this.http.post<Task>(`${this.base}/save`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/delete/${id}`);
  }
}
