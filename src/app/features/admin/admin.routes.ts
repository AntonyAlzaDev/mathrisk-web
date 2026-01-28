import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - Admin MathRisk'
      },
      {
        path: 'blog',
        loadComponent: () => import('./admin-blog/admin-blog.component').then(m => m.AdminBlogComponent),
        title: 'Nuevo Post - Admin MathRisk'
      },
      {
        path: 'blog/editar/:id',
        loadComponent: () => import('./admin-blog/admin-blog.component').then(m => m.AdminBlogComponent),
        title: 'Editar Post - Admin MathRisk'
      },
      {
        path: 'cursos',
        loadComponent: () => import('./courses-management/courses-management.component').then(m => m.CoursesManagementComponent),
        title: 'Gestionar Cursos - Admin MathRisk'
      },
      {
        path: 'certificados',
        loadComponent: () => import('./certificates-management/certificates-management.component').then(m => m.CertificatesManagementComponent),
        title: 'Gestionar Certificados - Admin MathRisk'
      }
    ]
  }
];