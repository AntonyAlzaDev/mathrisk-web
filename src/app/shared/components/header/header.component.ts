import { Component, HostListener, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private authService = inject(AuthService);

  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  isUserMenuOpen = signal(false);

  // Exponer propiedades del AuthService
  currentUser = this.authService.currentUser;
  userProfile = this.authService.userProfile;
  isAdmin = () => this.authService.isAdmin();
  isAuthenticated = () => this.authService.isAuthenticated();

  constructor() {
    // Prevenir scroll cuando el menú móvil está abierto
    effect(() => {
      if (this.isMobileMenuOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  @HostListener('window:resize')
  onWindowResize() {
    // Cerrar menú móvil al cambiar a desktop
    if (window.innerWidth >= 1024 && this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
    if (this.isUserMenuOpen()) {
      this.closeUserMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.isUserMenuOpen() && !target.closest('.user-menu-container')) {
      this.closeUserMenu();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  toggleUserMenu() {
    this.isUserMenuOpen.update(value => !value);
  }

  closeUserMenu() {
    this.isUserMenuOpen.set(false);
  }

  async logout() {
    this.closeUserMenu();
    this.closeMobileMenu();
    await this.authService.logout();
  }

  getInitials(name: string | undefined): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}