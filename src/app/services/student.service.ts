import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll() {
    return this.http.get<any>(`${this.apiUrl}`, { headers: this.getHeaders() });
  }

  getById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  create(student: any) {
    return this.http.post<any>(`${this.apiUrl}`, student, { headers: this.getHeaders() });
  }

  update(id: number, student: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, student, { headers: this.getHeaders() });
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}