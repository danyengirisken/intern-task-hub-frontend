import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AssignRoleRequest, RoleItem, UserListItem, UserRequest } from '../core/models';

/**
 * Kullanıcı ve rol servisi (Kullanıcılar + Rol Atama ekranları).
 * JWT token AuthInterceptor tarafından otomatik eklenir.
 *
 * Kimin neyi görüp değiştirebildiğini backend belirler:
 * ADMIN tüm partnerleri, CUSTOMER_ADMIN yalnızca kendi partnerini yönetir.
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

  saveUser(request: UserRequest): Observable<UserListItem> {
    return this.http.post<UserListItem>(`${this.base}/api/users/save`, request);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/users/delete/${id}`);
  }

  assignRole(request: AssignRoleRequest): Observable<UserListItem> {
    return this.http.post<UserListItem>(`${this.base}/api/users/assignRole`, request);
  }
}
