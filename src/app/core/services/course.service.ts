import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  getDocs, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from '@angular/fire/firestore';

export interface Course {
  id?: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  instructor: string;
  coverImage: string;
  duration: number; // en horas
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  category: string;
  price: number;
  currency: string;
  topics: string[];
  requirements: string[];
  objectives: string[];
  published: boolean;
  featured: boolean;
  enrolledCount: number;
  rating: number;
  reviewsCount: number;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseEnrollment {
  id?: string;
  courseId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  enrolledAt: Date;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  progress: number; // 0-100
  certificateIssued: boolean;
  certificateId?: string;
}

export interface Certificate {
  id?: string;
  certificateNumber: string;
  studentName: string;
  courseName: string;
  completionDate: string; // Formato: DD/MM/YYYY
  durationHours: number;
  instructorName: string;
  // Campos opcionales para futura expansión
  courseId?: string;
  studentEmail?: string;
  studentId?: string;
  issuedAt?: Date;
  expiresAt?: Date | null;
  credentialUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private firestore: Firestore = inject(Firestore);
  private coursesCollection = 'courses';
  private enrollmentsCollection = 'enrollments';
  private certificatesCollection = 'certificates';

  constructor() {}

  // ========== COURSES ==========

  /**
   * Create a new course
   */
  async createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'enrolledCount' | 'rating' | 'reviewsCount'>): Promise<string> {
    try {
      const coursesCol = collection(this.firestore, this.coursesCollection);
      const now = new Date();
      
      const newCourse = {
        ...course,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        startDate: course.startDate ? Timestamp.fromDate(course.startDate) : null,
        endDate: course.endDate ? Timestamp.fromDate(course.endDate) : null,
        enrolledCount: 0,
        rating: 0,
        reviewsCount: 0
      };

      const docRef = await addDoc(coursesCol, newCourse);
      return docRef.id;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  /**
   * Update a course
   */
  async updateCourse(courseId: string, course: Partial<Course>): Promise<void> {
    try {
      const courseDoc = doc(this.firestore, this.coursesCollection, courseId);
      const updateData: any = {
        ...course,
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      if (course.startDate) {
        updateData.startDate = Timestamp.fromDate(course.startDate);
      }
      if (course.endDate) {
        updateData.endDate = Timestamp.fromDate(course.endDate);
      }
      
      await updateDoc(courseDoc, updateData);
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  /**
   * Delete a course
   */
  async deleteCourse(courseId: string): Promise<void> {
    try {
      const courseDoc = doc(this.firestore, this.coursesCollection, courseId);
      await deleteDoc(courseDoc);
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  /**
   * Get course by ID
   */
  async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const courseDoc = doc(this.firestore, this.coursesCollection, courseId);
      const docSnap = await getDoc(courseDoc);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...this.convertTimestamps(docSnap.data()) } as Course;
      }
      return null;
    } catch (error) {
      console.error('Error getting course:', error);
      throw error;
    }
  }

  /**
   * Get all published courses
   */
  async getPublishedCourses(): Promise<Course[]> {
    try {
      const coursesCol = collection(this.firestore, this.coursesCollection);
      const q = query(
        coursesCol,
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamps(doc.data())
      } as Course));
    } catch (error) {
      console.error('Error getting published courses:', error);
      throw error;
    }
  }

  /**
   * Get all courses (admin)
   */
  async getAllCourses(): Promise<Course[]> {
    try {
      const coursesCol = collection(this.firestore, this.coursesCollection);
      const q = query(coursesCol, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamps(doc.data())
      } as Course));
    } catch (error) {
      console.error('Error getting all courses:', error);
      throw error;
    }
  }

  // ========== ENROLLMENTS ==========

  /**
   * Enroll student in course
   */
  async enrollStudent(enrollment: Omit<CourseEnrollment, 'id' | 'enrolledAt' | 'progress' | 'certificateIssued'>): Promise<string> {
    try {
      const enrollmentsCol = collection(this.firestore, this.enrollmentsCollection);
      
      const newEnrollment = {
        ...enrollment,
        enrolledAt: Timestamp.fromDate(new Date()),
        progress: 0,
        certificateIssued: false
      };

      const docRef = await addDoc(enrollmentsCol, newEnrollment);
      
      // Increment enrolled count
      await this.incrementEnrolledCount(enrollment.courseId);
      
      return docRef.id;
    } catch (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
  }

  /**
   * Get enrollments by course
   */
  async getEnrollmentsByCourse(courseId: string): Promise<CourseEnrollment[]> {
    try {
      const enrollmentsCol = collection(this.firestore, this.enrollmentsCollection);
      const q = query(
        enrollmentsCol,
        where('courseId', '==', courseId),
        orderBy('enrolledAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamps(doc.data())
      } as CourseEnrollment));
    } catch (error) {
      console.error('Error getting enrollments:', error);
      throw error;
    }
  }

  /**
   * Update enrollment progress
   */
  async updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<void> {
    try {
      const enrollmentDoc = doc(this.firestore, this.enrollmentsCollection, enrollmentId);
      await updateDoc(enrollmentDoc, { progress });
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  // ========== CERTIFICATES ==========

  /**
   * Create certificate with all data (for migration and manual creation)
   */
  async createCertificate(certificate: Omit<Certificate, 'id'>): Promise<string> {
    try {
      const certificatesCol = collection(this.firestore, this.certificatesCollection);

      const newCertificate: any = {
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        completionDate: certificate.completionDate,
        durationHours: certificate.durationHours,
        instructorName: certificate.instructorName,
        createdAt: Timestamp.fromDate(new Date())
      };

      // Add optional fields if provided
      if (certificate.courseId) newCertificate.courseId = certificate.courseId;
      if (certificate.studentEmail) newCertificate.studentEmail = certificate.studentEmail;
      if (certificate.studentId) newCertificate.studentId = certificate.studentId;
      if (certificate.credentialUrl) newCertificate.credentialUrl = certificate.credentialUrl;

      const docRef = await addDoc(certificatesCol, newCertificate);
      return docRef.id;
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  }

  /**
   * Bulk create certificates (for migration)
   */
  async bulkCreateCertificates(certificates: Omit<Certificate, 'id'>[]): Promise<string[]> {
    const ids: string[] = [];
    for (const cert of certificates) {
      const id = await this.createCertificate(cert);
      ids.push(id);
    }
    return ids;
  }

  /**
   * Get all certificates (admin)
   */
  async getAllCertificates(): Promise<Certificate[]> {
    try {
      const certificatesCol = collection(this.firestore, this.certificatesCollection);
      const q = query(certificatesCol, orderBy('certificateNumber', 'asc'));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamps(doc.data())
      } as Certificate));
    } catch (error) {
      console.error('Error getting all certificates:', error);
      throw error;
    }
  }

  /**
   * Get certificate by ID
   */
  async getCertificateById(certificateId: string): Promise<Certificate | null> {
    try {
      const certDoc = doc(this.firestore, this.certificatesCollection, certificateId);
      const docSnap = await getDoc(certDoc);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...this.convertTimestamps(docSnap.data()) } as Certificate;
      }
      return null;
    } catch (error) {
      console.error('Error getting certificate:', error);
      throw error;
    }
  }

  /**
   * Verify certificate by number
   */
  async verifyCertificate(certificateNumber: string): Promise<Certificate | null> {
    try {
      const certificatesCol = collection(this.firestore, this.certificatesCollection);
      const q = query(certificatesCol, where('certificateNumber', '==', certificateNumber));
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...this.convertTimestamps(doc.data()) } as Certificate;
      }
      return null;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw error;
    }
  }

  // ========== HELPERS ==========

  private async incrementEnrolledCount(courseId: string): Promise<void> {
    try {
      const courseDoc = doc(this.firestore, this.coursesCollection, courseId);
      const docSnap = await getDoc(courseDoc);
      
      if (docSnap.exists()) {
        const currentCount = docSnap.data()['enrolledCount'] || 0;
        await updateDoc(courseDoc, { enrolledCount: currentCount + 1 });
      }
    } catch (error) {
      console.error('Error incrementing enrolled count:', error);
    }
  }

  private generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MRS-${year}-${random}`;
  }

  private convertTimestamps(data: any): any {
    const converted = { ...data };
    
    if (converted.createdAt?.toDate) converted.createdAt = converted.createdAt.toDate();
    if (converted.updatedAt?.toDate) converted.updatedAt = converted.updatedAt.toDate();
    if (converted.startDate?.toDate) converted.startDate = converted.startDate.toDate();
    if (converted.endDate?.toDate) converted.endDate = converted.endDate.toDate();
    if (converted.enrolledAt?.toDate) converted.enrolledAt = converted.enrolledAt.toDate();
    if (converted.issuedAt?.toDate) converted.issuedAt = converted.issuedAt.toDate();
    if (converted.expiresAt?.toDate) converted.expiresAt = converted.expiresAt.toDate();
    
    return converted;
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
}
