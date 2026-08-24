import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Partner, PartnerRequest } from '../core/models';

/**
 * Partner CRUD servisi. Uçlar carbon stili: findAll / findById / save / delete.
 * JWT token AuthInterceptor tarafından otomatik eklenir; uçlar yalnızca ADMIN'e açıktır.
 */
@Injectable({ providedIn: 'root' })
export class PartnerService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/partners`;

  findAll(): Observable<Partner[]> {
    return this.http.get<Partner[]>(`${this.base}/findAll`);
  }

  findById(id: number): Observable<Partner> {
    return this.http.get<Partner>(`${this.base}/findById/${id}`);
  }

  save(request: PartnerRequest): Observable<Partner> {
    return this.http.post<Partner>(`${this.base}/save`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/delete/${id}`);
  }
}
