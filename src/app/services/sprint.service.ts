import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sprint, SprintRequest } from '../core/models'; 

@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private apiUrl = 'http://localhost:8082/api/sprints'; 

  constructor(private http: HttpClient) { }

  getAllSprints(): Observable<Sprint[]> {
    return this.http.get<Sprint[]>(this.apiUrl);
  }

  createSprint(sprintRequest: SprintRequest): Observable<Sprint> {
    return this.http.post<Sprint>(this.apiUrl, sprintRequest);
  }

  // ID'ye göre sprint silme (DELETE)
  deleteSprint(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // YENİ: ID'ye göre tekil sprint getirme
  getSprintById(id: number): Observable<Sprint> {
    return this.http.get<Sprint>(`${this.apiUrl}/${id}`);
  }

  // YENİ: Sprint güncelleme (PUT)
  updateSprint(id: number, sprintRequest: SprintRequest): Observable<Sprint> {
    return this.http.put<Sprint>(`${this.apiUrl}/${id}`, sprintRequest);
  }
}