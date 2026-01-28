import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../core/services/blog.service';
import { BlogPost, BlogCategory } from '../../../core/models/blog-post.model';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DriveImagePipe } from '@shared/pipes/drive-image.pipe';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DriveImagePipe],
  template: `
    <div class="blog-container">
      <!-- Hero Section -->
      <section class="blog-hero">
        <div class="hero-content">
          <h1 class="hero-title">Blog de MathRisk</h1>
          <p class="hero-subtitle">
            Insights, análisis y tendencias en gestión de riesgos financieros y tecnología
          </p>
        </div>
      </section>

      <div class="blog-content">
        <!-- Sidebar -->
        <aside class="blog-sidebar">
          <!-- Búsqueda -->
          <div class="sidebar-widget search-widget">
            <h3>Buscar</h3>
            <div class="search-box">
              <input 
                type="text" 
                placeholder="Buscar artículos..."
                [(ngModel)]="searchTerm"
                (input)="onSearch()"
              >
            </div>
          </div>

          <!-- Categorías -->
          <div class="sidebar-widget categories-widget">
            <h3>Categorías</h3>
            <ul class="categories-list">
              <li 
                *ngFor="let category of categories$ | async"
                [class.active]="selectedCategory === category.slug"
              >
                <a (click)="filterByCategory(category.slug)" class="category-link">
                  {{ category.name }}
                  <span class="count">{{ category.count || 0 }}</span>
                </a>
              </li>
              <li [class.active]="selectedCategory === null">
                <a (click)="filterByCategory(null)" class="category-link">
                  Todas las categorías
                  <span class="count">{{ (posts$ | async)?.length || 0 }}</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- Posts Destacados -->
          <div class="sidebar-widget featured-widget">
            <h3>Artículos Destacados</h3>
            <div class="featured-posts">
              <div 
                *ngFor="let post of featuredPosts$ | async"
                class="featured-post-item"
              >
                <a [routerLink]="['/blog', post.slug]" class="featured-link">
                  <img [src]="post.coverImage | driveImage:'thumbnail'" [alt]="post.coverImageAlt || post.title">
                  <div class="featured-content">
                    <h4>{{ post.title }}</h4>
                    <span class="date">{{ formatDate(post.publishedAt) }}</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="blog-main">
          <!-- Loading State -->
          <div *ngIf="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando artículos...</p>
          </div>

          <!-- Posts Grid -->
          <div *ngIf="!loading && (posts$ | async) as posts" class="posts-grid">
            <div *ngIf="posts.length === 0" class="no-posts">
              <p>No se encontraron artículos.</p>
            </div>

            <article 
              *ngFor="let post of posts"
              class="post-card"
              [class.featured]="post.featured"
            >
              <!-- Featured Badge -->
              <span *ngIf="post.featured" class="featured-badge">Destacado</span>

              <!-- Cover Image -->
              <a [routerLink]="['/blog', post.slug]" class="post-image-link">
                <img
                  [src]="post.coverImage | driveImage:'cover'"
                  [alt]="post.coverImageAlt || post.title"
                  class="post-image"
                >
              </a>

              <!-- Post Content -->
              <div class="post-content">
                <!-- Meta Info -->
                <div class="post-meta">
                  <span class="category">{{ post.category }}</span>
                  <span class="separator">•</span>
                  <span class="date">{{ formatDate(post.publishedAt) }}</span>
                  <span class="separator">•</span>
                  <span class="read-time">{{ post.readTime || 5 }} min lectura</span>
                </div>

                <!-- Title -->
                <h2 class="post-title">
                  <a [routerLink]="['/blog', post.slug]">{{ post.title }}</a>
                </h2>

                <!-- Excerpt -->
                <p class="post-excerpt">{{ post.excerpt }}</p>

                <!-- Tags -->
                <div class="post-tags">
                  <span *ngFor="let tag of post.tags" class="tag">
                    #{{ tag }}
                  </span>
                </div>

                <!-- Footer -->
                <div class="post-footer">
                  <div class="author">
                    <img 
                      [src]="(post.author.photoURL | driveImage:'thumbnail') || '/assets/images/default-avatar.png'" 
                      [alt]="post.author.name"
                      class="author-avatar"
                    >
                    <span class="author-name">{{ post.author.name }}</span>
                  </div>
                  <div class="post-stats">
                    <span class="views">
                      👁 {{ post.views || 0 }} vistas
                    </span>
                  </div>
                </div>

                <!-- Read More Button -->
                <a [routerLink]="['/blog', post.slug]" class="read-more-btn">
                  Leer más →
                </a>
              </div>
            </article>
          </div>

          <!-- Load More Button -->
          <div *ngIf="hasMore" class="load-more-section">
            <button 
              class="load-more-btn"
              (click)="loadMore()"
              [disabled]="loading"
            >
              {{ loading ? 'Cargando...' : 'Cargar más artículos' }}
            </button>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .blog-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    }

    /* Hero Section - Modern Elegant */
    .blog-hero {
      background: linear-gradient(135deg, #87CEEB 0%, #6DB3D9 50%, #5D9DBF 100%);
      padding: 100px 20px 120px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .blog-hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      opacity: 0.5;
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .hero-title {
      font-size: clamp(2.5rem, 5vw, 3.5rem);
      font-weight: 800;
      margin-bottom: 20px;
      letter-spacing: -0.02em;
      text-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .hero-subtitle {
      font-size: clamp(1rem, 2vw, 1.25rem);
      opacity: 0.95;
      line-height: 1.7;
      font-weight: 400;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Main Layout */
    .blog-content {
      max-width: 1400px;
      margin: -60px auto 0;
      padding: 0 24px 100px;
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 48px;
      position: relative;
      z-index: 2;
    }

    /* Sidebar - Glassmorphism */
    .blog-sidebar {
      position: sticky;
      top: 100px;
      height: fit-content;
    }

    .sidebar-widget {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      border: 1px solid rgba(255,255,255,0.6);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .sidebar-widget:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.12);
    }

    .sidebar-widget h3 {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 20px;
      color: #1e293b;
      letter-spacing: -0.01em;
    }

    /* Search Widget */
    .search-box {
      display: flex;
      gap: 0;
    }

    .search-box input {
      flex: 1;
      padding: 14px 18px;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      background: rgba(255,255,255,0.8);
    }

    .search-box input:focus {
      outline: none;
      border-color: #87CEEB;
      box-shadow: 0 0 0 4px rgba(135, 206, 235, 0.2);
    }

    .search-box input::placeholder {
      color: #94a3b8;
    }

    /* Categories */
    .categories-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .categories-list li {
      margin-bottom: 6px;
    }

    .category-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: #475569;
      text-decoration: none;
      font-weight: 500;
    }

    .category-link:hover {
      background: linear-gradient(135deg, #87CEEB 0%, #6DB3D9 100%);
      color: white;
      transform: translateX(4px);
    }

    .categories-list li.active .category-link {
      background: linear-gradient(135deg, #87CEEB 0%, #6DB3D9 100%);
      color: white;
    }

    .count {
      background: rgba(0,0,0,0.06);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .category-link:hover .count,
    .categories-list li.active .count {
      background: rgba(255,255,255,0.25);
      color: white;
    }

    /* Featured Posts */
    .featured-post-item {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }

    .featured-post-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .featured-link {
      display: flex;
      gap: 14px;
      text-decoration: none;
      color: #1e293b;
      transition: all 0.3s ease;
    }

    .featured-link:hover {
      transform: translateX(4px);
    }

    .featured-link img {
      width: 72px;
      height: 72px;
      object-fit: cover;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .featured-content h4 {
      font-size: 0.9rem;
      margin-bottom: 6px;
      line-height: 1.5;
      color: #1e293b;
      font-weight: 600;
    }

    .featured-content .date {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    /* Main Content */
    .blog-main {
      min-height: 600px;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 80px 20px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 3px solid #e2e8f0;
      border-top-color: #87CEEB;
      border-radius: 50%;
      animation: spin 0.8s ease-in-out infinite;
      margin: 0 auto 24px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Posts Grid */
    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 32px;
    }

    .no-posts {
      grid-column: 1 / -1;
      text-align: center;
      padding: 80px 20px;
      color: #64748b;
      font-size: 1.1rem;
    }

    /* Post Card - Modern Glassmorphism */
    .post-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      border: 1px solid rgba(255,255,255,0.8);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .post-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.12);
    }

    .post-card.featured {
      grid-column: span 2;
    }

    .featured-badge {
      position: absolute;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 30px;
      font-size: 0.75rem;
      font-weight: 700;
      z-index: 1;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }

    .post-image-link {
      display: block;
      overflow: hidden;
    }

    .post-image {
      width: 100%;
      height: 220px;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .post-card:hover .post-image {
      transform: scale(1.08);
    }

    .post-content {
      padding: 28px;
    }

    .post-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      font-size: 0.85rem;
      color: #64748b;
      flex-wrap: wrap;
    }

    .category {
      background: linear-gradient(135deg, #87CEEB 0%, #6DB3D9 100%);
      color: white;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .separator {
      color: #cbd5e1;
    }

    .post-title {
      font-size: 1.35rem;
      font-weight: 700;
      margin-bottom: 14px;
      line-height: 1.4;
      letter-spacing: -0.01em;
    }

    .post-title a {
      color: #1e293b;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .post-title a:hover {
      color: #5D9DBF;
    }

    .post-excerpt {
      color: #64748b;
      line-height: 1.7;
      margin-bottom: 20px;
      font-size: 0.95rem;
    }

    .post-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }

    .tag {
      background: #f1f5f9;
      color: #64748b;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .tag:hover {
      background: #e2e8f0;
      color: #475569;
    }

    .post-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20px;
      border-top: 1px solid rgba(0,0,0,0.06);
      margin-bottom: 20px;
    }

    .author {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .author-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(135, 206, 235, 0.3);
    }

    .author-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #1e293b;
    }

    .post-stats {
      font-size: 0.85rem;
      color: #94a3b8;
    }

    .read-more-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #87CEEB 0%, #6DB3D9 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 14px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 14px rgba(135, 206, 235, 0.4);
    }

    .read-more-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(135, 206, 235, 0.5);
    }

    /* Load More */
    .load-more-section {
      text-align: center;
      margin-top: 60px;
    }

    .load-more-btn {
      background: rgba(255,255,255,0.9);
      color: #5D9DBF;
      border: 2px solid #87CEEB;
      padding: 16px 40px;
      border-radius: 16px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .load-more-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #87CEEB 0%, #6DB3D9 100%);
      color: white;
      border-color: transparent;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(135, 206, 235, 0.4);
    }

    .load-more-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .blog-content {
        grid-template-columns: 1fr;
        gap: 32px;
      }

      .blog-sidebar {
        position: static;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
      }

      .sidebar-widget {
        margin-bottom: 0;
      }

      .post-card.featured {
        grid-column: span 1;
      }
    }

    @media (max-width: 768px) {
      .blog-hero {
        padding: 80px 20px 100px;
      }

      .blog-content {
        padding: 0 16px 60px;
        margin-top: -40px;
      }

      .posts-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .blog-sidebar {
        grid-template-columns: 1fr;
      }

      .sidebar-widget {
        padding: 24px;
      }

      .post-content {
        padding: 24px;
      }
    }
  `]
})
export class BlogListComponent implements OnInit {
  private blogService = inject(BlogService);

  posts$!: Observable<BlogPost[]>;
  featuredPosts$!: Observable<BlogPost[]>;
  categories$!: Observable<BlogCategory[]>;

  searchTerm = '';
  selectedCategory: string | null = null;
  loading = false;
  hasMore = true;
  currentLimit = 12;

  ngOnInit(): void {
    this.loadPosts();
    this.loadFeaturedPosts();
    this.loadCategories();
  }

  loadPosts(): void {
    this.loading = true;
    this.posts$ = this.blogService.getPublishedPosts(this.currentLimit);
    setTimeout(() => this.loading = false, 500);
  }

  loadFeaturedPosts(): void {
    this.featuredPosts$ = this.blogService.getFeaturedPosts(3);
  }

  loadCategories(): void {
    this.categories$ = this.blogService.getCategories();
  }

  filterByCategory(categorySlug: string | null): void {
    this.selectedCategory = categorySlug;
    this.loading = true;
    
    if (categorySlug) {
      this.posts$ = this.blogService.getPostsByCategory(categorySlug, this.currentLimit);
    } else {
      this.posts$ = this.blogService.getPublishedPosts(this.currentLimit);
    }
    
    setTimeout(() => this.loading = false, 300);
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.loading = true;
      this.posts$ = this.blogService.searchPosts(this.searchTerm);
      setTimeout(() => this.loading = false, 300);
    } else {
      this.loadPosts();
    }
  }

  loadMore(): void {
    this.currentLimit += 6;
    this.loadPosts();
  }

  formatDate(date: any): string {
    if (!date) return '';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
