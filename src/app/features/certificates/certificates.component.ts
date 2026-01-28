import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService, Certificate } from '@core/services/course.service';

type ViewState = 'loading' | 'valid' | 'invalid' | 'search';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);

  viewState = signal<ViewState>('search');
  certificate = signal<Certificate | null>(null);
  searchCode = signal<string>('');
  isSearching = signal<boolean>(false);

  ngOnInit(): void {
    // Check if there's an ID in the query params
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.searchCode.set(id);
        this.verifyCertificate(id);
      }
    });
  }

  async verifyCertificate(code?: string): Promise<void> {
    const certificateCode = code || this.searchCode();

    if (!certificateCode.trim()) {
      return;
    }

    this.viewState.set('loading');
    this.isSearching.set(true);

    try {
      const cert = await this.courseService.verifyCertificate(certificateCode.trim().toUpperCase());

      if (cert) {
        this.certificate.set(cert);
        this.viewState.set('valid');
      } else {
        this.certificate.set(null);
        this.viewState.set('invalid');
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      this.viewState.set('invalid');
    } finally {
      this.isSearching.set(false);
    }
  }

  resetSearch(): void {
    this.viewState.set('search');
    this.certificate.set(null);
    this.searchCode.set('');
  }

  printCertificate(): void {
    window.print();
  }
}
