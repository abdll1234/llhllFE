import {inject, Injectable} from '@angular/core';

import {HttpClient} from '@angular/common/http';
import {environment} from '../environment/environment';
export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    fileId: string;
    fileName: string;
    fileUrl: string;
    viewUrl: string;
    qrCode: string;
    uploaderName?: string;
  };
}

export interface FileInfo {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploader?: string;
  uploadedAt: string;
  views: number;
}
@Injectable({
  providedIn: 'root',
})
export class Api {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  uploadFile(file: File, uploaderName: string, inviteCode: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploaderName', uploaderName);
    formData.append('inviteCode', inviteCode);

    return this.http.post<UploadResponse>(`${this.apiUrl}/files/upload`, formData);
  }

  getFileInfo(fileId: string) {
    return this.http.get<{ success: boolean; data: FileInfo }>(`${this.apiUrl}/view/${fileId}`);
  }
}
