import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

interface DashboardStats {
  totalPosts: number;
  totalCourses: number;
  totalCertificates: number;
  totalUsers: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="welcome-section">
        <h1 class="title">Bienvenido al Panel de Administración</h1>
        <p class="subtitle">Gestiona todo el contenido de MathRisk Solution desde aquí</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blog">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats().totalPosts }}</h3>
            <p class="stat-label">Posts del Blog</p>
          </div>
          <a routerLink="/admin/blog" class="stat-link">
            Ver todos
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>

        <div class="stat-card">
          <div class="stat-icon courses">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats().totalCourses }}</h3>
            <p class="stat-label">Cursos Activos</p>
          </div>
          <a routerLink="/admin/cursos" class="stat-link">
            Ver todos
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>

        <div class="stat-card">
          <div class="stat-icon certificates">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats().totalCertificates }}</h3>
            <p class="stat-label">Certificados Emitidos</p>
          </div>
          <a routerLink="/admin/certificados" class="stat-link">
            Ver todos
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>

        <div class="stat-card">
          <div class="stat-icon users">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats().totalUsers }}</h3>
            <p class="stat-label">Usuarios Registrados</p>
          </div>
          <a routerLink="/admin/usuarios" class="stat-link">
            Ver todos
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>
      </div>

      <div class="quick-actions">
        <h2 class="section-title">Acciones Rápidas</h2>
        <div class="actions-grid">
          <a routerLink="/admin/blog/nuevo" class="action-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <h3>Nuevo Post</h3>
            <p>Crear una nueva entrada de blog</p>
          </a>

          <a routerLink="/admin/cursos/nuevo" class="action-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <h3>Nuevo Curso</h3>
            <p>Agregar un nuevo curso o webinar</p>
          </a>

          <a routerLink="/admin/certificados" class="action-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <h3>Emitir Certificado</h3>
            <p>Generar certificado para un alumno</p>
          </a>

          <a routerLink="/admin/usuarios" class="action-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <h3>Gestionar Usuarios</h3>
            <p>Ver y administrar usuarios</p>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    .welcome-section {
      margin-bottom: 40px;
    }

    .title {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 1.1rem;
      color: #7f8c8d;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 50px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      gap: 16px;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.blog {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      &.courses {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }

      &.certificates {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
      }

      &.users {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
      }
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 4px 0;
    }

    .stat-label {
      font-size: 1rem;
      color: #7f8c8d;
      margin: 0;
    }

    .stat-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #6BA8CC;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;

      &:hover {
        gap: 10px;
        color: #4A90A4;
      }
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 24px 0;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
    }

    .action-card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      text-decoration: none;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      svg {
        color: #6BA8CC;
        transition: all 0.3s ease;
      }

      h3 {
        font-size: 1.2rem;
        font-weight: 600;
        color: #2c3e50;
        margin: 0;
      }

      p {
        font-size: 0.9rem;
        color: #7f8c8d;
        margin: 0;
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

        svg {
          transform: scale(1.1);
          color: #4A90A4;
        }
      }
    }

    @media (max-width: 768px) {
      .title {
        font-size: 1.5rem;
      }

      .subtitle {
        font-size: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private subscriptions: Subscription[] = [];
  
  stats = signal<DashboardStats>({
    totalPosts: 0,
    totalCourses: 0,
    totalCertificates: 0,
    totalUsers: 0
  });

  ngOnInit() {
    this.loadStats();
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadStats() {
    try {
      // Blog posts
      const postsCol = collection(this.firestore, 'blog-posts');
      const postsSub = collectionData(postsCol).subscribe({
        next: (posts) => {
          this.stats.update(current => ({ ...current, totalPosts: posts.length }));
        },
        error: (error) => {
          console.error('Error cargando posts:', error);
        }
      });
      this.subscriptions.push(postsSub);

      // Cursos
      const coursesCol = collection(this.firestore, 'courses');
      const coursesSub = collectionData(coursesCol).subscribe({
        next: (courses) => {
          this.stats.update(current => ({ ...current, totalCourses: courses.length }));
        },
        error: (error) => {
          console.error('Error cargando cursos:', error);
        }
      });
      this.subscriptions.push(coursesSub);

      // Certificados
      const certificatesCol = collection(this.firestore, 'certificates');
      const certsSub = collectionData(certificatesCol).subscribe({
        next: (certificates) => {
          this.stats.update(current => ({ ...current, totalCertificates: certificates.length }));
        },
        error: (error) => {
          console.error('Error cargando certificados:', error);
        }
      });
      this.subscriptions.push(certsSub);

      // Usuarios
      const usersCol = collection(this.firestore, 'users');
      const usersSub = collectionData(usersCol).subscribe({
        next: (users) => {
          this.stats.update(current => ({ ...current, totalUsers: users.length }));
        },
        error: (error) => {
          console.error('Error cargando usuarios:', error);
        }
      });
      this.subscriptions.push(usersSub);

    } catch (error) {
      console.error('Error inicializando estadísticas:', error);
    }
  }
}