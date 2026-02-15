import {Component, ElementRef, inject, signal, ViewChild} from '@angular/core';
import {Api, UploadResponse} from '../services/api';
import {FileService} from '../services/file.service';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import QRCodeStyling from "qr-code-styling";

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
  private router = inject(Router);

  @ViewChild("canvas") canvas: ElementRef | undefined;
  imageHalal = "favicon.ico"

  state = signal<UploadState>({
    file: null,
    uploaderName: '',
    inviteCode: '',
    isUploading: false,
    result: null
  });

  fileInfo = signal<{ name: string; size: string; icon: string } | null>(null);
  protected QRCode = "QRCode"

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

        // Use setTimeout to allow Angular to render the #canvas element first
        setTimeout(() => {
          if (this.canvas) {
            const qrCode = new QRCodeStyling({
              width: 256,
              height: 256,
              margin: 16,
              data: response.data.viewUrl,
              image: "Halal-logo_1200x1200.png",
              dotsOptions: {
                color: "#007e06",
                type: "rounded",
              },
              backgroundOptions: {
                color: "#FFFFFF",
              },
              imageOptions: {
                crossOrigin: "anonymous",
                margin: 14,
              },
            });
            qrCode.append(this.canvas.nativeElement);
            this.qrCodeInstance = qrCode;
          }
        }, 0);

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

  qrCodeInstance: QRCodeStyling | null = null;

  downloadQRCode(): void {
    if (this.qrCodeInstance) {
      this.qrCodeInstance.download({
        name: `qr-${this.state().result?.fileId || 'code'}`,
        extension: 'png'
      });
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
