import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoursesService } from '@core/services/courses.service';
import { Course } from '@core/models/course.model';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  private coursesService = inject(CoursesService);

  courses = signal<Course[]>([]);
  filteredCourses = signal<Course[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  selectedLevels = signal<string[]>([]);
  selectedCategories = signal<string[]>([]);
  selectedTags = signal<string[]>([]);
  showFilters = signal(false);
  expandedCards = signal<Set<string>>(new Set());

  // Computed signals para obtener categorías y tags únicos
  availableCategories = computed(() => {
    const categories = this.courses()
      .map(course => course.category)
      .filter((category, index, self) => category && self.indexOf(category) === index)
      .sort();
    return categories;
  });

  // Tags filtrados según las categorías seleccionadas
  availableTags = computed(() => {
    const tagsSet = new Set<string>();
    const selectedCategories = this.selectedCategories();

    // Filtrar cursos por categoría si hay alguna seleccionada
    const coursesToFilter = selectedCategories.length === 0
      ? this.courses()
      : this.courses().filter(course => selectedCategories.includes(course.category));

    // Extraer tags únicos de los cursos filtrados
    coursesToFilter.forEach(course => {
      if (course.tags && Array.isArray(course.tags)) {
        course.tags.forEach(tag => tagsSet.add(tag));
      }
    });

    return Array.from(tagsSet).sort();
  });

  // Contador de filtros activos
  activeFiltersCount = computed(() => {
    return this.selectedLevels().length +
           this.selectedCategories().length +
           this.selectedTags().length;
  });

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading.set(true);
    this.coursesService.getAllActiveCourses().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.filteredCourses.set(courses);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
        this.loading.set(false);
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const term = input.value;
    this.searchTerm.set(term);
    this.applyFilters();
  }

  toggleLevelFilter(level: string): void {
    const current = this.selectedLevels();
    if (current.includes(level)) {
      this.selectedLevels.set(current.filter(l => l !== level));
    } else {
      this.selectedLevels.set([...current, level]);
    }
    this.applyFilters();
  }

  toggleCategoryFilter(category: string): void {
    const current = this.selectedCategories();
    if (current.includes(category)) {
      this.selectedCategories.set(current.filter(c => c !== category));
      // Limpiar tags que ya no estén disponibles
      const availableTags = this.availableTags();
      const currentTags = this.selectedTags();
      const validTags = currentTags.filter(tag => availableTags.includes(tag));
      if (validTags.length !== currentTags.length) {
        this.selectedTags.set(validTags);
      }
    } else {
      this.selectedCategories.set([...current, category]);
    }
    this.applyFilters();
  }

  toggleTagFilter(tag: string): void {
    const current = this.selectedTags();
    if (current.includes(tag)) {
      this.selectedTags.set(current.filter(t => t !== tag));
    } else {
      this.selectedTags.set([...current, tag]);
    }
    this.applyFilters();
  }

  isLevelSelected(level: string): boolean {
    return this.selectedLevels().includes(level);
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories().includes(category);
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }

  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  }

  clearFilters(): void {
    this.selectedLevels.set([]);
    this.selectedCategories.set([]);
    this.selectedTags.set([]);
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.courses();

    // Filtro de búsqueda
    const term = this.searchTerm().toLowerCase();
    if (term) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        (course.tags && course.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Filtro de nivel (multi-select)
    const selectedLevels = this.selectedLevels();
    if (selectedLevels.length > 0) {
      filtered = filtered.filter(course => selectedLevels.includes(course.level));
    }

    // Filtro de categoría (multi-select)
    const selectedCategories = this.selectedCategories();
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(course => selectedCategories.includes(course.category));
    }

    // Filtro de tags (multi-select)
    const selectedTags = this.selectedTags();
    if (selectedTags.length > 0) {
      filtered = filtered.filter(course =>
        course.tags && course.tags.some(tag => selectedTags.includes(tag))
      );
    }

    this.filteredCourses.set(filtered);
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

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Programado': 'status-scheduled',
      'En curso': 'status-active',
      'Finalizado': 'status-completed'
    };
    return classes[status] || '';
  }

  toggleCardExpansion(courseId: string, event: Event): void {
    event.stopPropagation();
    const expanded = new Set(this.expandedCards());
    if (expanded.has(courseId)) {
      expanded.delete(courseId);
    } else {
      expanded.add(courseId);
    }
    this.expandedCards.set(expanded);
  }

  isCardExpanded(courseId: string): boolean {
    return this.expandedCards().has(courseId);
  }
}
