import { Timestamp } from '@angular/fire/firestore';

export interface Course {
  id?: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  
  // Información del curso
  duration: number; // en horas
  startDate?: Timestamp | null; // Opcional: puede ser null para cursos sin fecha definida
  endDate?: Timestamp | null; // Opcional: puede ser null para cursos sin fecha definida
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  
  // Instructor
  instructor: {
    name: string;
    title: string;
    photo: string;
  };
  
  // Precios
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  
  // Imágenes e iconos
  featuredImage: string;
  icon: string;
  
  // Estudiantes
  maxStudents: number;
  enrolledStudents: number;
  
  // Estado
  status: 'Programado' | 'En curso' | 'Finalizado';
  active: boolean;
  featured: boolean;
  
  // Contenido
  syllabus: CourseModule[];
  requirements: string[];
  whatYouWillLearn: string[];
  
  // Ofertas
  launchOffer: {
    active: boolean;
    message: string;
    availableSeats: number;
  };
  
  // Metadata
  category: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CourseModule {
  moduleNumber: number;
  title: string;
  topics: string[];
  duration: number; // en horas
}

export interface CourseEnrollment {
  id?: string;
  courseId: string;
  courseName: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  company?: string;
  enrollmentDate: Timestamp;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  certificateIssued: boolean;
}
