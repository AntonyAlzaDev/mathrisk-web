import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CoursesService } from '@core/services/courses.service';
import { Course, CourseModule } from '@core/models/course.model';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-courses-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './courses-management.component.html',
  styleUrls: ['./courses-management.component.scss']
})
export class CoursesManagementComponent implements OnInit {
  private coursesService = inject(CoursesService);
  private fb = inject(FormBuilder);

  courses = signal<Course[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingCourse = signal<Course | null>(null);

  // Autocomplete data
  existingCategories = signal<string[]>([]);
  existingTags = signal<string[]>([]);
  filteredCategories = signal<string[]>([]);
  filteredTags = signal<string[]>([]);
  showCategoryAutocomplete = signal(false);
  showTagAutocomplete = signal(false);

  courseForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadCourses();
  }

  initForm(): void {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      slug: [''],
      description: ['', Validators.required],
      longDescription: ['', Validators.required],
      duration: [0, [Validators.required, Validators.min(1)]],
      startDate: [''], // Ahora es opcional
      endDate: [''], // Ahora es opcional
      hasDefinedDates: [false], // Nuevo campo para controlar si tiene fechas
      level: ['Básico', Validators.required],
      instructorName: ['', Validators.required],
      instructorTitle: ['', Validators.required],
      instructorPhoto: ['https://via.placeholder.com/150', Validators.required],
      originalPrice: [0, [Validators.required, Validators.min(0)]],
      discountedPrice: [0, [Validators.required, Validators.min(0)]],
      featuredImage: ['https://via.placeholder.com/800x400', Validators.required],
      icon: ['https://via.placeholder.com/64', Validators.required],
      maxStudents: [30, [Validators.required, Validators.min(1)]],
      status: ['Programado', Validators.required],
      active: [true],
      featured: [false],
      category: ['', Validators.required],
      tags: [''],
      launchOfferActive: [false],
      launchOfferMessage: [''],
      launchOfferSeats: [0],
      whatYouWillLearn: this.fb.array([]),
      requirements: this.fb.array([]),
      syllabus: this.fb.array([])
    });

    // Watch title changes to generate slug
    this.courseForm.get('title')?.valueChanges.subscribe(title => {
      if (title && !this.editingCourse()) {
        const slug = this.coursesService.generateSlug(title);
        this.courseForm.patchValue({ slug }, { emitEvent: false });
      }
    });
  }

  get whatYouWillLearnArray(): FormArray {
    return this.courseForm.get('whatYouWillLearn') as FormArray;
  }

  get requirementsArray(): FormArray {
    return this.courseForm.get('requirements') as FormArray;
  }

  get syllabusArray(): FormArray {
    return this.courseForm.get('syllabus') as FormArray;
  }

  addWhatYouWillLearn(): void {
    this.whatYouWillLearnArray.push(this.fb.control('', Validators.required));
  }

  removeWhatYouWillLearn(index: number): void {
    this.whatYouWillLearnArray.removeAt(index);
  }

  addRequirement(): void {
    this.requirementsArray.push(this.fb.control('', Validators.required));
  }

  removeRequirement(index: number): void {
    this.requirementsArray.removeAt(index);
  }

  addModule(): void {
    const moduleGroup = this.fb.group({
      moduleNumber: [this.syllabusArray.length + 1, Validators.required],
      title: ['', Validators.required],
      duration: [0, [Validators.required, Validators.min(1)]],
      topics: this.fb.array([this.fb.control('', Validators.required)])
    });
    this.syllabusArray.push(moduleGroup);
  }

  removeModule(index: number): void {
    this.syllabusArray.removeAt(index);
  }

  getModuleTopics(moduleIndex: number): FormArray {
    return this.syllabusArray.at(moduleIndex).get('topics') as FormArray;
  }

  addTopic(moduleIndex: number): void {
    this.getModuleTopics(moduleIndex).push(this.fb.control('', Validators.required));
  }

  removeTopic(moduleIndex: number, topicIndex: number): void {
    this.getModuleTopics(moduleIndex).removeAt(topicIndex);
  }

  loadCourses(): void {
    this.loading.set(true);
    this.coursesService.getAllCoursesAdmin().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
        this.loading.set(false);
      }
    });
  }

  openCreateForm(): void {
    this.editingCourse.set(null);
    this.courseForm.reset({
      level: 'Básico',
      status: 'Programado',
      active: true,
      featured: false,
      instructorPhoto: 'https://via.placeholder.com/150',
      featuredImage: 'https://via.placeholder.com/800x400',
      icon: 'https://via.placeholder.com/64',
      maxStudents: 30,
      launchOfferActive: false,
      launchOfferSeats: 0
    });
    this.whatYouWillLearnArray.clear();
    this.requirementsArray.clear();
    this.syllabusArray.clear();
    this.showForm.set(true);
  }

  editCourse(course: Course): void {
    this.editingCourse.set(course);
    
    // Convert timestamps to date strings for form
    const startDate = course.startDate?.toDate().toISOString().split('T')[0];
    const endDate = course.endDate?.toDate().toISOString().split('T')[0];
    
    this.courseForm.patchValue({
      title: course.title,
      slug: course.slug,
      description: course.description,
      longDescription: course.longDescription,
      duration: course.duration,
      startDate,
      endDate,
      level: course.level,
      instructorName: course.instructor.name,
      instructorTitle: course.instructor.title,
      instructorPhoto: course.instructor.photo,
      originalPrice: course.originalPrice,
      discountedPrice: course.discountedPrice,
      featuredImage: course.featuredImage,
      icon: course.icon,
      maxStudents: course.maxStudents,
      status: course.status,
      active: course.active,
      featured: course.featured,
      category: course.category,
      tags: course.tags.join(', '),
      launchOfferActive: course.launchOffer?.active || false,
      launchOfferMessage: course.launchOffer?.message || '',
      launchOfferSeats: course.launchOffer?.availableSeats || 0
    });

    // Populate arrays
    this.whatYouWillLearnArray.clear();
    course.whatYouWillLearn?.forEach(item => {
      this.whatYouWillLearnArray.push(this.fb.control(item, Validators.required));
    });

    this.requirementsArray.clear();
    course.requirements?.forEach(req => {
      this.requirementsArray.push(this.fb.control(req, Validators.required));
    });

    this.syllabusArray.clear();
    course.syllabus?.forEach(module => {
      const moduleGroup = this.fb.group({
        moduleNumber: [module.moduleNumber, Validators.required],
        title: [module.title, Validators.required],
        duration: [module.duration, [Validators.required, Validators.min(1)]],
        topics: this.fb.array(module.topics.map(topic => this.fb.control(topic, Validators.required)))
      });
      this.syllabusArray.push(moduleGroup);
    });

    this.showForm.set(true);
  }

  async onSubmit(): Promise<void> {
    if (this.courseForm.valid) {
      const formValue = this.courseForm.value;
      
      const courseData: Omit<Course, 'id'> = {
        title: formValue.title,
        slug: formValue.slug,
        description: formValue.description,
        longDescription: formValue.longDescription,
        duration: formValue.duration,
        startDate: Timestamp.fromDate(new Date(formValue.startDate)),
        endDate: Timestamp.fromDate(new Date(formValue.endDate)),
        level: formValue.level,
        instructor: {
          name: formValue.instructorName,
          title: formValue.instructorTitle,
          photo: formValue.instructorPhoto
        },
        originalPrice: formValue.originalPrice,
        discountedPrice: formValue.discountedPrice,
        discountPercentage: this.coursesService.calculateDiscountPercentage(
          formValue.originalPrice,
          formValue.discountedPrice
        ),
        featuredImage: formValue.featuredImage,
        icon: formValue.icon,
        maxStudents: formValue.maxStudents,
        enrolledStudents: this.editingCourse()?.enrolledStudents || 0,
        status: formValue.status,
        active: formValue.active,
        featured: formValue.featured,
        syllabus: this.syllabusArray.value,
        requirements: this.requirementsArray.value,
        whatYouWillLearn: this.whatYouWillLearnArray.value,
        launchOffer: {
          active: formValue.launchOfferActive,
          message: formValue.launchOfferMessage,
          availableSeats: formValue.launchOfferSeats
        },
        category: formValue.category,
        tags: formValue.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      try {
        if (this.editingCourse()) {
          await this.coursesService.updateCourse(this.editingCourse()!.id!, courseData);
          alert('Curso actualizado exitosamente');
        } else {
          await this.coursesService.createCourse(courseData);
          alert('Curso creado exitosamente');
        }
        this.showForm.set(false);
        this.loadCourses();
      } catch (error) {
        console.error('Error al guardar curso:', error);
        alert('Error al guardar el curso');
      }
    }
  }

  async deactivateCourse(course: Course): Promise<void> {
    if (confirm(`¿Estás seguro de desactivar el curso "${course.title}"?`)) {
      try {
        await this.coursesService.deactivateCourse(course.id!);
        alert('Curso desactivado exitosamente');
        this.loadCourses();
      } catch (error) {
        console.error('Error al desactivar curso:', error);
        alert('Error al desactivar el curso');
      }
    }
  }

  async deleteCourse(course: Course): Promise<void> {
    if (confirm(`¿Estás seguro de eliminar permanentemente el curso "${course.title}"? Esta acción no se puede deshacer.`)) {
      try {
        await this.coursesService.deleteCourse(course.id!);
        alert('Curso eliminado exitosamente');
        this.loadCourses();
      } catch (error) {
        console.error('Error al eliminar curso:', error);
        alert('Error al eliminar el curso');
      }
    }
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingCourse.set(null);
    this.courseForm.reset();
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  }
}
