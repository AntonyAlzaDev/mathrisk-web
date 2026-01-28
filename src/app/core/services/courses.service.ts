import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  CollectionReference,
  DocumentReference
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, of } from 'rxjs';
import { Course, CourseEnrollment } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private firestore = inject(Firestore);
  private coursesCollection = collection(this.firestore, 'courses') as CollectionReference<Course>;
  private enrollmentsCollection = collection(this.firestore, 'enrollments') as CollectionReference<CourseEnrollment>;

  // ==================== MÉTODOS PÚBLICOS ====================
  
  /**
   * Obtiene todos los cursos activos ordenados por fecha de inicio
   */
  getAllActiveCourses(): Observable<Course[]> {
    const q = query(
      this.coursesCollection,
      where('active', '==', true),
      orderBy('startDate', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course))),
      catchError(error => {
        console.error('Error al obtener cursos:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene cursos destacados
   */
  getFeaturedCourses(limit: number = 3): Observable<Course[]> {
    const q = query(
      this.coursesCollection,
      where('active', '==', true),
      where('featured', '==', true),
      orderBy('startDate', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        const courses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Course));
        return courses.slice(0, limit);
      }),
      catchError(error => {
        console.error('Error al obtener cursos destacados:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene un curso por su ID
   */
  getCourseById(id: string): Observable<Course | null> {
    const docRef = doc(this.firestore, 'courses', id) as DocumentReference<Course>;
    
    return from(getDoc(docRef)).pipe(
      map(doc => {
        if (!doc.exists()) return null;
        return { id: doc.id, ...doc.data() } as Course;
      }),
      catchError(error => {
        console.error('Error al obtener curso:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene un curso por su slug
   */
  getCourseBySlug(slug: string): Observable<Course | null> {
    const q = query(this.coursesCollection, where('slug', '==', slug));
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Course;
      }),
      catchError(error => {
        console.error('Error al obtener curso por slug:', error);
        return of(null);
      })
    );
  }

  /**
   * Busca cursos por término
   */
  searchCourses(searchTerm: string): Observable<Course[]> {
    return this.getAllActiveCourses().pipe(
      map(courses => {
        const term = searchTerm.toLowerCase();
        return courses.filter(course => 
          course.title.toLowerCase().includes(term) ||
          course.description.toLowerCase().includes(term) ||
          course.category.toLowerCase().includes(term) ||
          course.tags.some(tag => tag.toLowerCase().includes(term))
        );
      })
    );
  }

  /**
   * Filtra cursos por categoría
   */
  getCoursesByCategory(category: string): Observable<Course[]> {
    const q = query(
      this.coursesCollection,
      where('active', '==', true),
      where('category', '==', category),
      orderBy('startDate', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course))),
      catchError(error => {
        console.error('Error al filtrar cursos:', error);
        return of([]);
      })
    );
  }

  /**
   * Filtra cursos por nivel
   */
  getCoursesByLevel(level: string): Observable<Course[]> {
    const q = query(
      this.coursesCollection,
      where('active', '==', true),
      where('level', '==', level),
      orderBy('startDate', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course))),
      catchError(error => {
        console.error('Error al filtrar cursos:', error);
        return of([]);
      })
    );
  }

  // ==================== MÉTODOS DE INSCRIPCIÓN ====================
  
  /**
   * Registra una inscripción a un curso
   */
  async enrollInCourse(enrollment: Omit<CourseEnrollment, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.enrollmentsCollection, {
        ...enrollment,
        enrollmentDate: Timestamp.now()
      });
      
      // Incrementar contador de estudiantes inscritos
      if (enrollment.courseId) {
        await this.incrementEnrolledStudents(enrollment.courseId);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error al inscribir en curso:', error);
      throw error;
    }
  }

  /**
   * Incrementa el contador de estudiantes inscritos
   */
  private async incrementEnrolledStudents(courseId: string): Promise<void> {
    try {
      const courseRef = doc(this.firestore, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      
      if (courseDoc.exists()) {
        const currentEnrolled = courseDoc.data()['enrolledStudents'] || 0;
        await updateDoc(courseRef, {
          enrolledStudents: currentEnrolled + 1
        });
      }
    } catch (error) {
      console.error('Error al incrementar estudiantes:', error);
    }
  }

  // ==================== MÉTODOS DE ADMINISTRACIÓN ====================
  
  /**
   * Obtiene todos los cursos (incluyendo inactivos) para administración
   */
  getAllCoursesAdmin(): Observable<Course[]> {
    const q = query(
      this.coursesCollection,
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course))),
      catchError(error => {
        console.error('Error al obtener cursos (admin):', error);
        return of([]);
      })
    );
  }

  /**
   * Crea un nuevo curso
   */
  async createCourse(course: Omit<Course, 'id'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(this.coursesCollection, {
        ...course,
        createdAt: now,
        updatedAt: now,
        enrolledStudents: 0
      });
      return docRef.id;
    } catch (error) {
      console.error('Error al crear curso:', error);
      throw error;
    }
  }

  /**
   * Actualiza un curso existente
   */
  async updateCourse(id: string, course: Partial<Course>): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'courses', id);
      await updateDoc(docRef, {
        ...course,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error al actualizar curso:', error);
      throw error;
    }
  }

  /**
   * Elimina un curso (soft delete - marca como inactivo)
   */
  async deactivateCourse(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'courses', id);
      await updateDoc(docRef, {
        active: false,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error al desactivar curso:', error);
      throw error;
    }
  }

  /**
   * Elimina un curso permanentemente
   */
  async deleteCourse(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'courses', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error al eliminar curso:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las inscripciones de un curso
   */
  getCourseEnrollments(courseId: string): Observable<CourseEnrollment[]> {
    const q = query(
      this.enrollmentsCollection,
      where('courseId', '==', courseId),
      orderBy('enrollmentDate', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CourseEnrollment))),
      catchError(error => {
        console.error('Error al obtener inscripciones:', error);
        return of([]);
      })
    );
  }

  /**
   * Genera un slug único a partir del título
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Calcula el porcentaje de descuento
   */
  calculateDiscountPercentage(original: number, discounted: number): number {
    if (original <= 0) return 0;
    return Math.round(((original - discounted) / original) * 100);
  }
}
