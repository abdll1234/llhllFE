import { Component, Input, OnInit } from '@angular/core';
import { QrService } from '../services/qr.service';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [],
  templateUrl: './qr.component.html',
  styleUrl: './qr.component.css'
})
export class QrComponent implements OnInit {
  @Input() verifyUrl: string = '';

  qrImageUrl: string = '';
  isLoading: boolean = false;
  hasError: boolean = false;

  constructor(private qrService: QrService) {}

  ngOnInit(): void {
    this.loadQR();
  }

  loadQR(): void {
    if (!this.verifyUrl) return;

    this.isLoading = true;
    this.hasError = false;
    this.qrImageUrl = '';

    this.qrService.generateQR(this.verifyUrl).subscribe({
      next: (blob: Blob) => {
        this.qrImageUrl = URL.createObjectURL(blob);
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  downloadQR(): void {
    if (!this.qrImageUrl) return;

    const a = document.createElement('a');
    a.href = this.qrImageUrl;
    a.download = 'qrcode.png';
    a.click();
  }
}
