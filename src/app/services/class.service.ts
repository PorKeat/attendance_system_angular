import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ClassService {
  private readonly api = `${environment.apiUrl}/class`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(this.api);
  }
  getById(id: number): Observable<any> {
    return this.http.get(`${this.api}/${id}`);
  }
  create(data: any): Observable<any> {
    return this.http.post(this.api, data);
  }
  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/${id}`, data);
  }
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}
