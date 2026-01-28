import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CoursesService } from '@core/services/courses.service';
import { Course } from '@core/models/course.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private coursesService = inject(CoursesService);
  
  course = signal<Course | null>(null);
  loading = signal(true);
  showEnrollForm = signal(false);

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(courseId);
    }
  }

  loadCourse(id: string): void {
    this.loading.set(true);
    this.coursesService.getCourseById(id).subscribe({
      next: (course) => {
        this.course.set(course);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar curso:', error);
        this.loading.set(false);
      }
    });
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  }

  toggleEnrollForm(): void {
    this.showEnrollForm.update(value => !value);
  }

  onEnroll(): void {
    // Aquí se implementaría la lógica de inscripción
    alert('Funcionalidad de inscripción en desarrollo');
  }
}
