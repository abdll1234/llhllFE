import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class QrService {
  constructor(private http: HttpClient) {}

  generateQR(verifyUrl: string): Observable<Blob> {
    const url = `${environment.apiUrl}/qr/generate`;
    const body = { url: verifyUrl };
    const httpOptions = { responseType: 'blob' as 'json' };

    return this.http.post<Blob>(url, body, httpOptions);
  }
}
