import { Injectable } from '@angular/core';
import {format} from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only PDF, JPEG, PNG, and GIF files are allowed'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${maxSize / 1024 / 1024}MB`
      };
    }

    return { valid: true };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '📷';
    if (mimeType === 'application/pdf') return '📄';
    return '📁';
  }
}
