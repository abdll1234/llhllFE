import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FileService} from '../services/file.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Api, FileInfo} from '../services/api';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-view-file',
  imports: [
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './view-file.html',
  styleUrl: './view-file.css',
})
export class ViewFile implements OnInit{
  private route = inject(ActivatedRoute);
  private apiService = inject(Api);
  private fileService = inject(FileService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  private sanitizer = inject(DomSanitizer);

  fileInfo = signal<FileInfo | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  isImage = signal(false);
  isPdf = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const fileId = params['id'];
      if (fileId) {
        this.loadFile(fileId);
      }
    });
  }

  async loadFile(fileId: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await this.apiService.getFileInfo(fileId).toPromise();

      if (response?.success) {
        this.fileInfo.set(response.data);
        this.isImage.set(response.data.type.startsWith('image/'));
        this.isPdf.set(response.data.type === 'application/pdf');
      } else {
        throw new Error('File not found');
      }
    } catch (error: any) {
      console.error('Error loading file:', error);
      this.error.set(error.error?.message || error.message || 'Failed to load file');
      this.snackBar.open(this.error()!, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  formatDate(dateString: string): string {
    return this.fileService.formatDate(dateString);
  }

  formatFileSize(bytes: number): string {
    return this.fileService.formatFileSize(bytes);
  }

  getFileIcon(): string {
    const info = this.fileInfo();
    if (!info) return '📁';
    return this.fileService.getFileIcon(info.type);
  }

  downloadFile(): void {
    const info = this.fileInfo();
    if (!info?.url) return;

    const link = document.createElement('a');
    link.href = info.url;
    link.download = info.name;
    link.target = '_blank';
    link.click();
  }

  copyLink(): void {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      this.snackBar.open('Link copied to clipboard!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    });
  }

  getSafePdfUrl(): SafeResourceUrl | null {
    const fileInfo = this.fileInfo();
    if (!fileInfo || !this.isPdf()) return null;

    // Supabase URLs sind sicher, müssen aber von Angular als safe markiert werden
    return this.sanitizer.bypassSecurityTrustResourceUrl(fileInfo.url + '#view=fitH');
  }

  // NEUE METHODE: Safe Image URL (falls auch Probleme)
  getSafeImageUrl(): SafeResourceUrl | null {

    const fileInfo = this.fileInfo();

    if (!fileInfo || !this.isImage()) return null;

    return this.sanitizer.bypassSecurityTrustResourceUrl(fileInfo.url);
  }
}
