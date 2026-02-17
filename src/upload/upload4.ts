import {Component, ElementRef, inject, signal, ViewChild} from '@angular/core';
import {Api, UploadResponse} from '../services/api';
import {FileService} from '../services/file.service';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { MatIconModule} from '@angular/material/icon';
import {HttpClient} from '@angular/common/http';

interface UploadState {
  file: File | null;
  uploaderName: string;
  inviteCode: string;
  isUploading: boolean;
  result: UploadResponse['data'] | null;
}

@Component({
  selector: 'app-upload',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  templateUrl: './upload4.html',
  styleUrl: './upload4.css',
})
export class Upload4 {
  private apiService = inject(Api);
  private fileService = inject(FileService);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);


  @ViewChild("canvas") canvas: ElementRef | undefined;

  state = signal<UploadState>({
    file: null,
    uploaderName: '',
    inviteCode: '',
    isUploading: false,
    result: null
  });

  fileInfo = signal<{ name: string; size: string; icon: string } | null>(null);


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const validation = this.fileService.validateFile(file);

    if (!validation.valid) {
      this.showError(validation.error!);
      return;
    }

    this.state.update(s => ({ ...s, file }));
    this.fileInfo.set({
      name: file.name,
      size: this.fileService.formatFileSize(file.size),
      icon: this.fileService.getFileIcon(file.type)
    });
  }

  async uploadFile(): Promise<void> {
    const { file, uploaderName, inviteCode } = this.state();

    if (!file || !inviteCode) {
      this.showError('Please select a file and enter an invite code');
      return;
    }

    this.state.update(s => ({ ...s, isUploading: true }));

    try {
      const response = await this.apiService.uploadFile(file, uploaderName, inviteCode).toPromise();

      if (response?.success) {
        this.state.update(s => ({ ...s, result: response.data, isUploading: false }));

        this.generateCustomQRCode(response.data.viewUrl);

        this.showSuccess('File uploaded successfully!');
      } else {
        throw new Error(response?.message || 'Upload failed');
      }
    } catch (error: any) {
      this.showError(error.error?.message || error.message || 'Upload failed');
      this.state.update(s => ({ ...s, isUploading: false }));
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showSuccess('Copied to clipboard!');
    });
  }

  qrCodeBlob: Blob | null = null;
  qrCodeUrl = signal<string | null>(null);

  async generateCustomQRCode(data: string) {
    const body = {
      data: data,
      config: {
        body: 'japanese',
        eye: 'frame2',
        eyeBall: 'ball2',
        erf1: [],
        erf2: [],
        erf3: [],
        brf1: [],
        brf2: [],
        brf3: [],
        bodyColor: '#1F4029',
        bgColor: '#FFFFFF',
        eye1Color: '#1F4029',
        eye2Color: '#1F4029',
        eye3Color: '#1F4029',
        eyeBall1Color: '#1F4029',
        eyeBall2Color: '#1F4029',
        eyeBall3Color: '#1F4029',
        gradientColor1: '',
        gradientColor2: '',
        gradientType: 'linear',
        gradientOnEyes: 'true',
        logo: 'https://llhll.vercel.app/assets/NEWLOGO.png',
        logoMode: 'clean'
      },
      size: 600,
      download: 'imageUrl',
      file: 'png'
    };

    try {
      const response = await this.http.post('https://api.qrcode-monkey.com/qr/custom', body, {
        responseType: 'blob'
      }).toPromise();

      if (response) {
        this.qrCodeBlob = response;
        const reader = new FileReader();
        reader.onloadend = () => {
          this.qrCodeUrl.set(reader.result as string);
        };
        reader.readAsDataURL(response);
      }
    } catch (error) {
      console.error('Error generating QR code with QR Code Monkey:', error);
      this.showError('Failed to generate custom QR code. Using default.');
    }
  }

  downloadQRCode(): void {
    if (this.qrCodeBlob) {
      const url = window.URL.createObjectURL(this.qrCodeBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${this.state().result?.fileId || 'code'}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
      return;
    }

    const result = this.state().result;
    if (!result?.qrCode) return;

    const link = document.createElement('a');
    link.href = result.qrCode;
    link.download = `qr-${result.fileId}.png`;
    link.click();
  }

  resetForm(): void {
    this.state.set({
      file: null,
      uploaderName: '',
      inviteCode: '',
      isUploading: false,
      result: null
    });
    this.fileInfo.set(null);
    this.qrCodeBlob = null;
    this.qrCodeUrl.set(null);
  }

  closeButton(){
    this.state.update(s => ({...s, file: null}));
    this.fileInfo.set(null)
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}
