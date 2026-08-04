import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AssignRoleRequest, RoleItem, UserListItem } from '../core/models';

/**
 * Kullanıcı ve rol servisi (rol atama ekranı için).
 * JWT token AuthInterceptor tarafından otomatik eklenir.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  findAllUsers(): Observable<UserListItem[]> {
    return this.http.get<UserListItem[]>(`${this.base}/api/users/findAll`);
  }

  findAllRoles(): Observable<RoleItem[]> {
    return this.http.get<RoleItem[]>(`${this.base}/api/roles/findAll`);
  }

  assignRole(request: AssignRoleRequest): Observable<UserListItem> {
    return this.http.post<UserListItem>(`${this.base}/api/users/assignRole`, request);
  }
}
