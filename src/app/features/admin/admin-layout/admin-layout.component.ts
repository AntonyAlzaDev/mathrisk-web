import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <div class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" class="logo-icon">
              <defs>
                <linearGradient id="grad_admin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#4a4a4a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#2c2c2c;stop-opacity:1" />
                </linearGradient>
              </defs>
              <path d="M10 90 L35 40 L60 90 L85 40 L110 90"
                    fill="none"
                    stroke="url(#grad_admin)"
                    stroke-width="8"
                    stroke-linecap="round"
                    stroke-linejoin="round" />
              <circle cx="53" cy="34" r="4" fill="#FF6B6B" />
              <circle cx="67" cy="34" r="4" fill="#FF6B6B" />
              <circle cx="60" cy="25" r="4" fill="#FF6B6B" />
            </svg>
            @if (!sidebarCollapsed()) {
              <span class="logo-text">Admin Panel</span>
            }
          </div>
          <button 
            class="toggle-btn" 
            (click)="toggleSidebar()"
            [attr.aria-label]="sidebarCollapsed() ? 'Expandir sidebar' : 'Colapsar sidebar'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav class="sidebar-nav">
          <ul class="nav-list">
            @for (item of menuItems; track item.route) {
              <li>
                <a 
                  [routerLink]="item.route" 
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{exact: item.route === '/admin'}"
                  class="nav-link"
                  [attr.title]="sidebarCollapsed() ? item.label : null">
                  <svg class="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <g [innerHTML]="item.icon"></g>
                  </svg>
                  @if (!sidebarCollapsed()) {
                    <span class="nav-label">{{ item.label }}</span>
                  }
                </a>
              </li>
            }
          </ul>
        </nav>

        <div class="sidebar-footer">
          <button class="back-to-site" (click)="goToMainSite()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            @if (!sidebarCollapsed()) {
              <span>Volver al sitio</span>
            }
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Top Bar -->
        <header class="top-bar">
          <div class="top-bar-left">
            <button class="mobile-menu-toggle" (click)="toggleSidebar()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1 class="page-title">Panel de Administración</h1>
          </div>

          <div class="top-bar-right">
            <div class="user-info">
              <div class="user-avatar">
                {{ getInitials() }}
              </div>
              <div class="user-details">
                <span class="user-name">{{ userProfile()?.displayName }}</span>
                <span class="user-role">Administrador</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <!-- Mobile Overlay -->
    @if (!sidebarCollapsed()) {
      <div class="mobile-overlay" (click)="toggleSidebar()"></div>
    }
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: #f5f7fa;
    }

    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 1000;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);

      &.collapsed {
        width: 80px;

        .logo-text,
        .nav-label {
          opacity: 0;
          width: 0;
        }
      }

      @media (max-width: 768px) {
        transform: translateX(-100%);

        &:not(.collapsed) {
          transform: translateX(0);
        }
      }
    }

    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;

      .logo-icon {
        width: 40px;
        height: 35px;
        flex-shrink: 0;
      }

      .logo-text {
        font-size: 1.3rem;
        font-weight: 700;
        transition: all 0.3s ease;
        white-space: nowrap;
      }
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      @media (max-width: 768px) {
        display: none;
      }
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 0;
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 20px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.3s ease;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: #FF6B6B;
        transform: scaleY(0);
        transition: transform 0.3s ease;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      &.active {
        background: rgba(255, 107, 107, 0.2);
        color: white;

        &::before {
          transform: scaleY(1);
        }

        .nav-icon {
          stroke: #FF6B6B;
        }
      }
    }

    .nav-icon {
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .nav-label {
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .back-to-site {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateX(-4px);
      }

      svg {
        flex-shrink: 0;
      }

      span {
        transition: all 0.3s ease;
      }
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      @media (max-width: 768px) {
        margin-left: 0;
      }
    }

    .sidebar.collapsed + .main-content {
      margin-left: 80px;

      @media (max-width: 768px) {
        margin-left: 0;
      }
    }

    .top-bar {
      background: white;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      position: sticky;
      top: 0;
      z-index: 100;

      @media (max-width: 768px) {
        padding: 0 20px;
      }
    }

    .top-bar-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .mobile-menu-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: #2c3e50;

      @media (max-width: 768px) {
        display: block;
      }
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0;

      @media (max-width: 768px) {
        font-size: 1.2rem;
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6BA8CC 0%, #8DC6E6 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      box-shadow: 0 2px 8px rgba(107, 168, 204, 0.3);
    }

    .user-details {
      display: flex;
      flex-direction: column;

      @media (max-width: 768px) {
        display: none;
      }
    }

    .user-name {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.95rem;
    }

    .user-role {
      font-size: 0.8rem;
      color: #FF6B6B;
      font-weight: 500;
    }

    .content {
      padding: 30px;
      min-height: calc(100vh - 70px);

      @media (max-width: 768px) {
        padding: 20px;
      }
    }

    .mobile-overlay {
      display: none;

      @media (max-width: 768px) {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
      }
    }
  `]
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  sidebarCollapsed = signal(false);
  userProfile = this.authService.userProfile;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>',
      route: '/admin'
    },
    {
      label: 'Gestionar Blog',
      icon: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',
      route: '/admin/blog'
    },
    {
      label: 'Gestionar Cursos',
      icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>',
      route: '/admin/cursos'
    },
    {
      label: 'Certificados',
      icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>',
      route: '/admin/certificados'
    },
    {
      label: 'Usuarios',
      icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
      route: '/admin/usuarios'
    }
  ];

  toggleSidebar() {
    this.sidebarCollapsed.update(value => !value);
  }

  goToMainSite() {
    this.router.navigate(['/']);
  }

  getInitials(): string {
    const name = this.userProfile()?.displayName || 'User';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}