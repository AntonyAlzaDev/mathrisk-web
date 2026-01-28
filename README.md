# MathRisk Solution - Plataforma Web Corporativa

## 📋 Descripción del Proyecto

Plataforma web corporativa profesional para MathRisk Solution, desarrollada con Angular 17+ y Google Cloud Platform. Esta aplicación moderna y escalable ofrece gestión completa de servicios, cursos, blog y certificados para una empresa de gestión de riesgos financieros.

## 🎨 Diseño y UX/UI

El diseño está inspirado en Apple, manteniendo los colores corporativos de MathRisk:
- **Azul Principal**: #87CEEB (Sky Blue)
- **Beige Secundario**: #E8E3D9
- **Marrón Acento**: #5D4E37
- **Verde WhatsApp**: #25D366

### Principios de Diseño
- Minimalismo y espacios en blanco
- Tipografía clara y legible (San Francisco style)
- Animaciones suaves y transiciones fluidas
- Diseño responsivo mobile-first
- Accesibilidad (WCAG 2.1 AA)

## 🏗️ Arquitectura del Proyecto

```
mathrisk-web/
├── src/
│   ├── app/
│   │   ├── core/                    # Servicios core y guards
│   │   │   ├── services/           # Servicios singleton
│   │   │   ├── guards/             # Guards de autenticación
│   │   │   ├── interceptors/       # HTTP interceptors
│   │   │   └── models/             # Interfaces y modelos
│   │   ├── shared/                  # Componentes compartidos
│   │   │   ├── components/         # Componentes reutilizables
│   │   │   │   ├── header/
│   │   │   │   ├── footer/
│   │   │   │   └── whatsapp-float/
│   │   │   ├── directives/         # Directivas personalizadas
│   │   │   └── pipes/              # Pipes personalizados
│   │   ├── features/                # Módulos de funcionalidades
│   │   │   ├── home/               # Página principal
│   │   │   ├── services/           # Servicios corporativos
│   │   │   ├── courses/            # Cursos y webinars
│   │   │   ├── blog/               # Blog y artículos
│   │   │   ├── contact/            # Formulario de contacto
│   │   │   ├── certificates/       # Verificación de certificados
│   │   │   └── admin/              # Panel de administración
│   │   │       ├── blog-management/
│   │   │       ├── courses-management/
│   │   │       └── certificates-management/
│   │   ├── app.component.ts        # Componente raíz
│   │   ├── app.config.ts           # Configuración de la app
│   │   └── app.routes.ts           # Rutas principales
│   ├── assets/                      # Recursos estáticos
│   │   ├── images/
│   │   └── icons/
│   ├── environments/                # Configuraciones de entorno
│   │   ├── environment.ts
│   │   └── environment.development.ts
│   ├── styles.scss                  # Estilos globales
│   ├── index.html                   # HTML principal
│   └── main.ts                      # Bootstrap de la aplicación
├── angular.json                     # Configuración de Angular
├── package.json                     # Dependencias del proyecto
├── tsconfig.json                    # Configuración de TypeScript
└── README.md                        # Este archivo
```

## 🚀 Tecnologías Utilizadas

### Frontend
- **Angular 17+**: Framework principal con standalone components
- **TypeScript**: Lenguaje de programación
- **SCSS**: Preprocesador CSS
- **RxJS**: Programación reactiva
- **Angular Router**: Navegación con lazy loading

### Backend & Cloud
- **Firebase Authentication**: Autenticación de usuarios
- **Cloud Firestore**: Base de datos NoSQL
- **Cloud Storage**: Almacenamiento de archivos
- **Cloud Functions**: Funciones serverless
- **Firebase Hosting**: Hosting del frontend

### Herramientas de Desarrollo
- **Angular CLI**: Herramienta de línea de comandos
- **Git**: Control de versiones
- **ESLint**: Linting de código
- **Prettier**: Formateo de código

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18.x o superior
- npm 9.x o superior
- Angular CLI 17.x
- Cuenta de Google Cloud / Firebase

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/mathrisk-web.git
cd mathrisk-web
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**

a. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)

b. Habilitar los siguientes servicios:
   - Authentication (Email/Password)
   - Cloud Firestore
   - Cloud Storage
   - Hosting

c. Copiar las credenciales de configuración y actualizar `src/environments/environment.ts` y `environment.development.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
  }
};
```

4. **Iniciar el servidor de desarrollo**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200/`

## 🔥 Configuración de Firebase

### 1. Firestore Database

Crear las siguientes colecciones:

#### **posts** (Blog)
```typescript
{
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorId: string;
  featuredImage: string;
  category: string;
  tags: string[];
  published: boolean;
  publishedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  views: number;
}
```

#### **courses** (Cursos)
```typescript
{
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  instructor: string;
  duration: number; // horas
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  price: number;
  featuredImage: string;
  syllabus: {
    module: string;
    topics: string[];
  }[];
  startDate: Timestamp;
  endDate: Timestamp;
  maxStudents: number;
  enrolledStudents: number;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### **certificates** (Certificados)
```typescript
{
  id: string;
  certificateNumber: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  issueDate: Timestamp;
  expirationDate: Timestamp | null;
  pdfUrl: string;
  verified: boolean;
}
```

#### **contacts** (Mensajes de contacto)
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved';
  createdAt: Timestamp;
  respondedAt: Timestamp | null;
}
```

### 2. Reglas de Seguridad de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Posts - lectura pública, escritura solo admin
    match /posts/{postId} {
      allow read: if resource.data.published == true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Courses - lectura pública, escritura solo admin
    match /courses/{courseId} {
      allow read: if resource.data.active == true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Certificates - lectura pública para verificación
    match /certificates/{certId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Contacts - solo escritura pública, lectura admin
    match /contacts/{contactId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### 3. Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    match /certificates/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## 🛠️ Desarrollo

### Comandos Disponibles

```bash
# Desarrollo
npm start                 # Inicia servidor de desarrollo
npm run watch            # Build en modo watch

# Build
npm run build            # Build de producción
npm run build:dev        # Build de desarrollo

# Testing
npm test                 # Ejecuta tests unitarios
npm run test:coverage    # Tests con cobertura

# Linting
npm run lint             # Ejecuta ESLint
npm run format           # Formatea código con Prettier
```

### Estructura de Componentes

#### Standalone Components (Angular 17+)
Todos los componentes son standalone para mejor modularidad:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ejemplo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejemplo.component.html',
  styleUrls: ['./ejemplo.component.scss']
})
export class EjemploComponent {}
```

### Lazy Loading de Rutas

```typescript
{
  path: 'cursos',
  loadComponent: () => import('./features/courses/courses.component')
    .then(m => m.CoursesComponent)
}
```

## 🎯 Funcionalidades Principales

### 1. **Home / Landing Page**
- Hero section con call-to-action
- Sección "¿Qué hacemos?"
- Tarjetas de servicios
- Sección de clientes
- Diseño responsive y animaciones

### 2. **Servicios**
- Listado de servicios con detalles
- Capacitación en gestión de riesgos
- Consultoría y fortalecimiento
- Desarrollo de software

### 3. **Cursos y Webinars**
- Catálogo de cursos
- Detalle de cada curso
- Inscripción en línea
- Gestión de asistentes

### 4. **Blog**
- Listado de artículos
- Vista detallada de posts
- Categorías y tags
- Búsqueda y filtros

### 5. **Contacto**
- Formulario de contacto
- Validación en tiempo real
- Integración con Firebase
- Notificaciones por email

### 6. **Certificados**
- Verificación de certificados
- Búsqueda por número
- Descarga de PDF
- Compartir en redes sociales

### 7. **Panel de Administración**
- Autenticación segura
- Gestión de blog posts
- Gestión de cursos
- Generación de certificados
- Dashboard con estadísticas

## 🔐 Seguridad

### Autenticación
- Firebase Authentication
- Guards de ruta para admin
- Token de sesión seguro
- Logout automático

### Reglas de Firestore
- Lectura pública para contenido publicado
- Escritura solo para administradores
- Validación de datos en el servidor

## 📱 Responsive Design

El diseño es completamente responsive con breakpoints:
- **Mobile**: < 576px
- **Tablet**: 576px - 768px
- **Desktop**: 768px - 992px
- **Large Desktop**: > 992px

## 🚀 Despliegue

### Firebase Hosting

1. **Instalar Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login en Firebase**
```bash
firebase login
```

3. **Inicializar proyecto**
```bash
firebase init hosting
```

4. **Build de producción**
```bash
npm run build
```

5. **Desplegar**
```bash
firebase deploy
```

### Variables de Entorno

Crear archivo `.env` para variables sensibles (no commitear):
```
FIREBASE_API_KEY=tu_api_key
FIREBASE_AUTH_DOMAIN=tu_auth_domain
# etc...
```

## 📊 Próximas Funcionalidades

- [ ] Sistema de pagos (Stripe/PayPal)
- [ ] Área de estudiantes
- [ ] Foro de discusión
- [ ] Sistema de calificaciones
- [ ] Integración con CRM
- [ ] Analytics avanzado
- [ ] Newsletter
- [ ] Chat en vivo
- [ ] PWA (Progressive Web App)
- [ ] Multiidioma (i18n)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Convenciones de Código

- **Componentes**: PascalCase (ej: `HomeComponent`)
- **Archivos**: kebab-case (ej: `home.component.ts`)
- **Variables**: camelCase (ej: `userName`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `API_URL`)
- **Interfaces**: PascalCase con prefijo I (ej: `IUser`)

## 🐛 Reporte de Bugs

Para reportar bugs, por favor crea un issue en GitHub con:
- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado
- Screenshots si aplica
- Información del navegador/dispositivo

## 📄 Licencia

Este proyecto es propiedad de MathRisk Solution S.A.C. Todos los derechos reservados.

## 👥 Equipo

- **Desarrollo**: Equipo de Desarrollo MathRisk
- **Diseño UX/UI**: Equipo de Diseño MathRisk
- **Product Owner**: MathRisk Solution

## 📞 Contacto

- **Email**: contacto@mathrisksolution.com
- **Website**: https://mathrisksolution.com
- **LinkedIn**: [MathRisk Solution](https://www.linkedin.com/company/mathrisk-solution)

---

**MathRisk Solution** - Soluciones integrales para la gestión de Riesgos Financieros
