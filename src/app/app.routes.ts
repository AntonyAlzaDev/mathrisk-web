import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'MathRisk Solution - Inicio'
  },
  {
    path: 'servicios',
    loadComponent: () => import('./features/services/services.component').then(m => m.ServicesComponent),
    title: 'Nuestros Servicios - MathRisk'
  },
  {
    path: 'cursos',
    loadComponent: () => import('./features/courses/courses.component').then(m => m.CoursesComponent),
    title: 'Cursos y Webinars - MathRisk'
  },
  {
    path: 'cursos/:id',
    loadComponent: () => import('./features/courses/course-detail/course-detail.component').then(m => m.CourseDetailComponent),
    title: 'Detalle del Curso - MathRisk'
  },
  {
    path: 'blog',
    loadChildren: () => 
      import('./features/blog/blog.routes').then(m => m.BLOG_ROUTES)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contacto - MathRisk'
  },
  {
    path: 'certificados',
    loadComponent: () => import('./features/certificates/certificates.component').then(m => m.CertificatesComponent),
    title: 'Verificar Certificado - MathRisk'
  },
  // Rutas de autenticación
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Iniciar Sesión - MathRisk'
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Registrarse - MathRisk'
  },
  // Perfil de usuario (requiere autenticación)
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Mi Perfil - MathRisk'
  },
  // {
  //   path: 'mis-cursos',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./features/user/my-courses/my-courses.component').then(m => m.MyCoursesComponent),
  //   title: 'Mis Cursos - MathRisk'
  // },
  // {
  //   path: 'mis-certificados',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./features/user/my-certificates/my-certificates.component').then(m => m.MyCertificatesComponent),
  //   title: 'Mis Certificados - MathRisk'
  // },
  // Panel de administración (requiere rol de admin)
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  // Redirección para rutas no encontradas
  {
    path: '**',
    redirectTo: ''
  }
];