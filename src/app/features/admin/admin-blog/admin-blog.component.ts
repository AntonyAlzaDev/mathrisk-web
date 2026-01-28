import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { SafeHtmlPipe } from '@app/shared/pipes/safe-html.pipe';
import { DriveImagePipe } from '@app/shared/pipes/drive-image.pipe';
import { BlogService } from '@app/core/services/blog.service';
import { GoogleDriveService } from '@app/core/services/google-drive.service';
import { BlogCategory, BlogPost } from '@app/core/models/blog-post.model';

@Component({
  selector: 'app-admin-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SafeHtmlPipe, DriveImagePipe],
  template: `
    <div class="admin-blog-container">
      <!-- Header -->
      <div class="admin-header">
        <h1>Gestión de Blog</h1>
        <button class="btn-primary" (click)="openPostEditor()">
          <span class="icon">+</span> Nuevo Artículo
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon published">📝</div>
          <div class="stat-content">
            <div class="stat-value">{{ publishedCount }}</div>
            <div class="stat-label">Publicados</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon draft">📄</div>
          <div class="stat-content">
            <div class="stat-value">{{ draftCount }}</div>
            <div class="stat-label">Borradores</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon views">👁</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalViews }}</div>
            <div class="stat-label">Vistas Totales</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon categories">🏷</div>
          <div class="stat-content">
            <div class="stat-value">{{ (categories$ | async)?.length || 0 }}</div>
            <div class="stat-label">Categorías</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Estado:</label>
          <select [(ngModel)]="filterStatus" (change)="applyFilters()">
            <option value="all">Todos</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Categoría:</label>
          <select [(ngModel)]="filterCategory" (change)="applyFilters()">
            <option value="">Todas</option>
            <option *ngFor="let cat of categories$ | async" [value]="cat.slug">
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div class="filter-group search-group">
          <input 
            type="text" 
            placeholder="Buscar por título..."
            [(ngModel)]="searchTerm"
            (input)="applyFilters()"
          >
        </div>
      </div>

      <!-- Posts Table -->
      <div class="posts-table-wrapper">
        <table class="posts-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Título</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Vistas</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let post of filteredPosts" [class.featured]="post.featured">
              <td class="post-image-cell">
                <img [src]="post.coverImage | driveImage:'thumbnail'" [alt]="post.title">
              </td>
              <td class="post-title-cell">
                <div class="title-wrapper">
                  {{ post.title }}
                  <span *ngIf="post.featured" class="featured-badge">⭐ Destacado</span>
                </div>
              </td>
              <td>
                <span class="category-badge">{{ post.category }}</span>
              </td>
              <td>
                <span class="status-badge" [class.published]="post.status === 'published'">
                  {{ post.status === 'published' ? 'Publicado' : 'Borrador' }}
                </span>
              </td>
              <td class="views-cell">
                <span class="views-count">👁 {{ post.views || 0 }}</span>
                <button
                  *ngIf="post.views && post.views > 0"
                  class="btn-reset-views"
                  (click)="resetPostViews(post)"
                  title="Resetear vistas a 0"
                >
                  ↺
                </button>
              </td>
              <td class="date-cell">
                {{ formatDate(post.publishedAt || post.createdAt) }}
              </td>
              <td class="actions-cell">
                <button class="btn-icon edit" (click)="editPost(post)" title="Editar">
                  ✏️
                </button>
                <button class="btn-icon delete" (click)="deletePostConfirm(post)" title="Eliminar">
                  🗑️
                </button>
                <button 
                  class="btn-icon"
                  (click)="toggleFeatured(post)" 
                  [title]="post.featured ? 'Quitar destacado' : 'Marcar como destacado'"
                >
                  {{ post.featured ? '⭐' : '☆' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="filteredPosts.length === 0" class="no-posts">
          <p>No se encontraron artículos.</p>
        </div>
      </div>

      <!-- Category Management -->
      <div class="categories-section">
        <h2>Gestión de Categorías</h2>
        <div class="categories-content">
          <div class="category-form">
            <input 
              type="text" 
              placeholder="Nueva categoría"
              [(ngModel)]="newCategoryName"
              (keyup.enter)="addCategory()"
            >
            <button class="btn-secondary" (click)="addCategory()">
              Agregar
            </button>
          </div>
          <div class="categories-list">
            <div *ngFor="let cat of categories$ | async" class="category-item">
              <span class="category-name">{{ cat.name }}</span>
              <span class="category-count">{{ cat.count || 0 }} posts</span>
              <button class="btn-icon delete-cat" (click)="deleteCategory(cat)">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Editor -->
    <div class="modal-overlay" *ngIf="showEditor" (click)="closeEditor()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ editingPost ? 'Editar Artículo' : 'Nuevo Artículo' }}</h2>
          <button class="close-btn" (click)="closeEditor()">×</button>
        </div>

        <form [formGroup]="postForm" class="post-form">
          <!-- Basic Info -->
          <div class="form-section">
            <h3>Información Básica</h3>
            
            <div class="form-group">
              <label>Título *</label>
              <input 
                type="text" 
                formControlName="title"
                placeholder="Título del artículo"
                (input)="generateSlug()"
              >
              <small *ngIf="postForm.get('title')?.hasError('required') && postForm.get('title')?.touched">
                El título es requerido
              </small>
            </div>

            <div class="form-group">
              <label>Slug (URL)</label>
              <input 
                type="text" 
                formControlName="slug"
                placeholder="url-del-articulo"
                readonly
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Categoría *</label>
                <select formControlName="category">
                  <option value="">Seleccionar categoría</option>
                  <option *ngFor="let cat of categories$ | async" [value]="cat.name">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Estado *</label>
                <select formControlName="status">
                  <option value="draft">Borrador</option>
                  <option value="published">Publicar</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Extracto / Resumen *</label>
              <textarea 
                formControlName="excerpt"
                rows="3"
                placeholder="Breve descripción del artículo (máx. 160 caracteres)"
                maxlength="160"
              ></textarea>
              <small class="char-count">
                {{ postForm.get('excerpt')?.value?.length || 0 }}/160
              </small>
            </div>
          </div>

          <!-- Cover Image - Google Drive -->
          <div class="form-section">
            <h3>Imagen de Portada * (Google Drive)</h3>

            <div class="drive-info-box">
              <p><strong>Instrucciones:</strong></p>
              <ol>
                <li>Sube la imagen a la <a href="https://drive.google.com/drive/folders/1ocYgD1slWwFk56donFWwE3a7dfr3u1YN" target="_blank">carpeta de Google Drive</a></li>
                <li>Haz clic derecho en la imagen > "Obtener enlace"</li>
                <li>Asegúrate que esté como "Cualquier persona con el enlace"</li>
                <li>Copia y pega el enlace aquí</li>
              </ol>
            </div>

            <div class="form-group">
              <label>URL de Google Drive *</label>
              <input
                type="text"
                formControlName="coverImage"
                placeholder="https://drive.google.com/file/d/ID_DEL_ARCHIVO/view"
                (input)="onDriveUrlChange()"
              >
              <small>Pega el enlace compartido de Google Drive</small>
            </div>

            <div *ngIf="coverImagePreview" class="image-preview">
              <img [src]="coverImagePreview | driveImage:'cover'" alt="Preview">
              <button type="button" class="remove-image" (click)="removeCoverImage()">
                × Eliminar
              </button>
            </div>

            <div class="form-group">
              <label>Texto alternativo (Alt)</label>
              <input
                type="text"
                formControlName="coverImageAlt"
                placeholder="Descripción de la imagen para SEO"
              >
            </div>
          </div>

          <!-- Content Editor -->
          <div class="form-section">
            <h3>Contenido del Artículo *</h3>
            
            <!-- Editor Toolbar -->
            <div class="editor-toolbar">
              <button type="button" class="toolbar-btn" (click)="insertFormat('bold')" title="Negrita">
                <strong>B</strong>
              </button>
              <button type="button" class="toolbar-btn" (click)="insertFormat('italic')" title="Cursiva">
                <em>I</em>
              </button>
              <button type="button" class="toolbar-btn" (click)="insertFormat('underline')" title="Subrayado">
                <u>U</u>
              </button>
              <span class="toolbar-separator"></span>
              <button type="button" class="toolbar-btn" (click)="insertFormat('h2')" title="Título 2">
                H2
              </button>
              <button type="button" class="toolbar-btn" (click)="insertFormat('h3')" title="Título 3">
                H3
              </button>
              <span class="toolbar-separator"></span>
              <button type="button" class="toolbar-btn" (click)="insertFormat('ul')" title="Lista">
                • Lista
              </button>
              <button type="button" class="toolbar-btn" (click)="insertFormat('ol')" title="Lista numerada">
                1. Lista
              </button>
              <button type="button" class="toolbar-btn" (click)="insertFormat('link')" title="Enlace">
                🔗
              </button>
              <button type="button" class="toolbar-btn" (click)="insertFormat('quote')" title="Cita">
                ""
              </button>
              <button type="button" class="toolbar-btn" (click)="insertImage()" title="Insertar imagen">
                🖼️
              </button>
            </div>

            <!-- Content Textarea -->
            <div class="editor-container">
              <textarea 
                formControlName="content"
                #contentEditor
                rows="20"
                placeholder="Escribe el contenido de tu artículo aquí..."
              ></textarea>
            </div>

            <!-- Preview Toggle -->
            <div class="preview-toggle">
              <label>
                <input type="checkbox" [(ngModel)]="showPreview" [ngModelOptions]="{standalone: true}">
                Vista previa
              </label>
            </div>

            <!-- Preview -->
            <div *ngIf="showPreview" class="content-preview">
              <h4>Vista Previa:</h4>
              <div class="preview-content" [innerHTML]="postForm.get('content')?.value || '' | safeHtml"></div>
            </div>
          </div>

          <!-- Tags -->
          <div class="form-section">
            <h3>Etiquetas</h3>
            
            <div class="tags-input-wrapper">
              <div class="tags-list">
                <span *ngFor="let tag of currentTags; let i = index" class="tag-item">
                  {{ tag }}
                  <button type="button" (click)="removeTag(i)">×</button>
                </span>
              </div>
              <input 
                type="text"
                [(ngModel)]="tagInput"
                [ngModelOptions]="{standalone: true}"
                placeholder="Agregar etiqueta (presiona Enter)"
                (keyup.enter)="addTag()"
              >
            </div>
          </div>

          <!-- SEO Section -->
          <div class="form-section">
            <h3>SEO y Redes Sociales</h3>
            
            <div class="form-group">
              <label>Meta Descripción</label>
              <textarea 
                formControlName="metaDescription"
                rows="2"
                placeholder="Descripción para motores de búsqueda (máx. 160 caracteres)"
                maxlength="160"
              ></textarea>
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" formControlName="featured">
                Marcar como artículo destacado
              </label>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="closeEditor()">
              Cancelar
            </button>
            <button 
              type="button" 
              class="btn-save-draft"
              (click)="savePost('draft')"
              [disabled]="saving"
            >
              {{ saving ? 'Guardando...' : 'Guardar Borrador' }}
            </button>
            <button 
              type="submit" 
              class="btn-publish"
              (click)="savePost('published')"
              [disabled]="!postForm.valid || saving"
            >
              {{ saving ? 'Publicando...' : 'Publicar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showDeleteConfirm" (click)="cancelDelete()">
      <div class="modal-content small" (click)="$event.stopPropagation()">
        <h3>Confirmar Eliminación</h3>
        <p>¿Estás seguro de que deseas eliminar este artículo?</p>
        <p class="warning">Esta acción no se puede deshacer.</p>
        <div class="form-actions">
          <button class="btn-cancel" (click)="cancelDelete()">Cancelar</button>
          <button class="btn-delete" (click)="confirmDelete()">Eliminar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-blog-container {
      padding: 32px;
      max-width: 1500px;
      margin: 0 auto;
      min-height: 100vh;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    }

    /* Header - Modern */
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 36px;
    }

    .admin-header h1 {
      font-size: 2rem;
      color: #0f172a;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    /* Buttons - Elegant Gradients */
    .btn-primary {
      display: flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #87CEEB 0%, #6DB3D9 100%);
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 14px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 14px rgba(135, 206, 235, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(135, 206, 235, 0.5);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #475569 0%, #334155 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(71, 85, 105, 0.3);
    }

    .btn-icon {
      background: rgba(255,255,255,0.8);
      border: none;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 10px;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .btn-icon:hover {
      background: white;
      transform: scale(1.1);
    }

    .btn-icon.edit:hover {
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.2) 0%, rgba(109, 179, 217, 0.2) 100%);
    }

    .btn-icon.delete:hover {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%);
    }

    /* Stats Grid - Glassmorphism Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 36px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      padding: 28px;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.06);
      border: 1px solid rgba(255,255,255,0.6);
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
    }

    .stat-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
    }

    .stat-icon.published {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%);
    }

    .stat-icon.draft {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%);
    }

    .stat-icon.views {
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.2) 0%, rgba(109, 179, 217, 0.15) 100%);
    }

    .stat-icon.categories {
      background: linear-gradient(135deg, rgba(255, 140, 66, 0.15) 0%, rgba(255, 140, 66, 0.1) 100%);
    }

    .stat-value {
      font-size: 2.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 500;
    }

    /* Filters - Elegant Card */
    .filters-section {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      padding: 24px;
      border-radius: 20px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      border: 1px solid rgba(255,255,255,0.6);
      margin-bottom: 24px;
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      align-items: flex-end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 200px;
    }

    .filter-group.search-group {
      flex: 1;
    }

    .filter-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .filter-group select,
    .filter-group input {
      padding: 14px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      background: rgba(255,255,255,0.8);
    }

    .filter-group select:focus,
    .filter-group input:focus {
      outline: none;
      border-color: #87CEEB;
      box-shadow: 0 0 0 4px rgba(135, 206, 235, 0.2);
    }

    /* Table - Modern Design */
    .posts-table-wrapper {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.06);
      border: 1px solid rgba(255,255,255,0.6);
      overflow: hidden;
      margin-bottom: 36px;
    }

    .posts-table {
      width: 100%;
      border-collapse: collapse;
    }

    .posts-table thead {
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.1) 0%, rgba(109, 179, 217, 0.1) 100%);
    }

    .posts-table th {
      padding: 18px 20px;
      text-align: left;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .posts-table td {
      padding: 18px 20px;
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }

    .posts-table tr {
      transition: all 0.2s ease;
    }

    .posts-table tr:hover {
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.06) 0%, rgba(109, 179, 217, 0.06) 100%);
    }

    .posts-table tr.featured {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%);
    }

    .post-image-cell img {
      width: 80px;
      height: 55px;
      object-fit: cover;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .post-title-cell {
      max-width: 300px;
    }

    .title-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      font-weight: 600;
      color: #0f172a;
    }

    .featured-badge {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .category-badge {
      background: linear-gradient(135deg, #87CEEB 0%, #6DB3D9 100%);
      color: white;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .status-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%);
      color: #b45309;
    }

    .status-badge.published {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
      color: #15803d;
    }

    .views-cell {
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-reset-views {
      background: rgba(239, 68, 68, 0.1);
      border: none;
      color: #ef4444;
      font-size: 0.9rem;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .btn-reset-views:hover {
      background: rgba(239, 68, 68, 0.2);
      transform: scale(1.1);
    }

    .date-cell {
      color: #64748b;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .actions-cell {
      display: flex;
      gap: 8px;
    }

    .no-posts {
      padding: 80px;
      text-align: center;
      color: #94a3b8;
      font-size: 1.1rem;
    }

    /* Categories Section - Modern Card */
    .categories-section {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      padding: 32px;
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.06);
      border: 1px solid rgba(255,255,255,0.6);
    }

    .categories-section h2 {
      font-size: 1.5rem;
      margin-bottom: 24px;
      color: #0f172a;
      font-weight: 700;
    }

    .category-form {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .category-form input {
      flex: 1;
      padding: 14px 18px;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .category-form input:focus {
      outline: none;
      border-color: #87CEEB;
      box-shadow: 0 0 0 4px rgba(135, 206, 235, 0.2);
    }

    .categories-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .category-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.08) 0%, rgba(109, 179, 217, 0.08) 100%);
      border-radius: 14px;
      border: 1px solid rgba(135, 206, 235, 0.15);
      transition: all 0.3s ease;
    }

    .category-item:hover {
      transform: translateX(4px);
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.12) 0%, rgba(109, 179, 217, 0.12) 100%);
    }

    .category-name {
      font-weight: 600;
      color: #0f172a;
    }

    .category-count {
      color: #64748b;
      font-size: 0.85rem;
    }

    /* Modal - Modern Glassmorphism */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      overflow-y: auto;
    }

    .modal-content {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 28px;
      width: 100%;
      max-width: 1000px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 80px rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.8);
    }

    .modal-content.small {
      max-width: 480px;
      border-radius: 24px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 28px 32px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.08) 0%, rgba(109, 179, 217, 0.08) 100%);
    }

    .modal-header h2 {
      font-size: 1.5rem;
      color: #0f172a;
      font-weight: 700;
    }

    .close-btn {
      background: rgba(0,0,0,0.05);
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #64748b;
      line-height: 1;
      padding: 0;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    /* Form - Elegant Design */
    .post-form {
      padding: 32px;
    }

    .form-section {
      margin-bottom: 36px;
      padding-bottom: 36px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }

    .form-section:last-of-type {
      border-bottom: none;
    }

    .form-section h3 {
      font-size: 1.15rem;
      margin-bottom: 20px;
      color: #0f172a;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .form-section h3::before {
      content: '';
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, #87CEEB, #6DB3D9);
      border-radius: 2px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: block;
      margin-bottom: 10px;
      font-weight: 600;
      color: #334155;
      font-size: 0.95rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 16px 18px;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      font-size: 1rem;
      font-family: inherit;
      transition: all 0.3s ease;
      background: rgba(255,255,255,0.8);
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #87CEEB;
      box-shadow: 0 0 0 4px rgba(135, 206, 235, 0.2);
      background: white;
    }

    .form-group small {
      display: block;
      margin-top: 8px;
      color: #64748b;
      font-size: 0.85rem;
    }

    .char-count {
      text-align: right;
      color: #94a3b8;
      font-weight: 500;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    /* Image Upload - Modern Style */
    .image-upload-area {
      margin-bottom: 20px;
    }

    .upload-placeholder input[type="file"] {
      display: none;
    }

    .upload-placeholder label {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      border: 2px dashed #cbd5e1;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.05) 0%, rgba(109, 179, 217, 0.05) 100%);
    }

    .upload-placeholder label:hover {
      border-color: #87CEEB;
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.1) 0%, rgba(109, 179, 217, 0.1) 100%);
    }

    /* Google Drive Info Box */
    .drive-info-box {
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.1) 0%, rgba(109, 179, 217, 0.08) 100%);
      border: 1px solid rgba(135, 206, 235, 0.3);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .drive-info-box p {
      margin: 0 0 12px 0;
      color: #334155;
    }

    .drive-info-box ol {
      margin: 0;
      padding-left: 20px;
      color: #475569;
      font-size: 0.9rem;
      line-height: 1.8;
    }

    .drive-info-box a {
      color: #5D9DBF;
      text-decoration: none;
      font-weight: 600;
    }

    .drive-info-box a:hover {
      color: #87CEEB;
      text-decoration: underline;
    }

    .upload-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .upload-placeholder p {
      font-weight: 600;
      color: #475569;
      margin-bottom: 6px;
    }

    .upload-placeholder small {
      color: #94a3b8;
    }

    .image-preview {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }

    .image-preview img {
      width: 100%;
      max-height: 400px;
      object-fit: cover;
    }

    .remove-image {
      position: absolute;
      top: 16px;
      right: 16px;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .remove-image:hover {
      transform: scale(1.05);
    }

    /* Editor Toolbar - Modern */
    .editor-toolbar {
      display: flex;
      gap: 6px;
      padding: 14px;
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.1) 0%, rgba(109, 179, 217, 0.1) 100%);
      border: 2px solid #e2e8f0;
      border-bottom: none;
      border-radius: 16px 16px 0 0;
      flex-wrap: wrap;
    }

    .toolbar-btn {
      padding: 10px 14px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.2s ease;
      color: #475569;
    }

    .toolbar-btn:hover {
      background: linear-gradient(135deg, #87CEEB 0%, #6DB3D9 100%);
      color: white;
      border-color: transparent;
      transform: translateY(-1px);
    }

    .toolbar-separator {
      width: 1px;
      background: #e2e8f0;
      margin: 0 6px;
    }

    .editor-container {
      border: 2px solid #e2e8f0;
      border-radius: 0 0 16px 16px;
      overflow: hidden;
    }

    .editor-container textarea {
      width: 100%;
      border: none;
      padding: 20px;
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 0.95rem;
      line-height: 1.7;
      resize: vertical;
      min-height: 400px;
      background: rgba(255,255,255,0.9);
    }

    .editor-container textarea:focus {
      outline: none;
      background: white;
    }

    .preview-toggle {
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .preview-toggle input[type="checkbox"] {
      width: 20px;
      height: 20px;
      accent-color: #87CEEB;
    }

    .preview-toggle label {
      font-weight: 600;
      color: #475569;
      cursor: pointer;
    }

    .content-preview {
      margin-top: 24px;
      padding: 24px;
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.08) 0%, rgba(109, 179, 217, 0.08) 100%);
      border-radius: 16px;
      border: 1px solid rgba(135, 206, 235, 0.15);
    }

    .content-preview h4 {
      margin-bottom: 20px;
      color: #0f172a;
      font-weight: 700;
    }

    .preview-content {
      background: white;
      padding: 28px;
      border-radius: 14px;
      line-height: 1.8;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }

    /* Tags Input - Modern */
    .tags-input-wrapper {
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      padding: 12px;
      background: rgba(255,255,255,0.8);
      transition: all 0.3s ease;
    }

    .tags-input-wrapper:focus-within {
      border-color: #87CEEB;
      box-shadow: 0 0 0 4px rgba(135, 206, 235, 0.2);
      background: white;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 10px;
    }

    .tag-item {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #87CEEB 0%, #6DB3D9 100%);
      color: white;
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .tag-item button {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      font-size: 1rem;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
    }

    .tag-item button:hover {
      background: rgba(255,255,255,0.4);
    }

    .tags-input-wrapper input {
      width: 100%;
      border: none;
      padding: 10px;
      font-size: 1rem;
      background: transparent;
    }

    .tags-input-wrapper input:focus {
      outline: none;
    }

    /* Form Actions - Modern Buttons */
    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      padding-top: 28px;
      border-top: 1px solid rgba(0,0,0,0.06);
    }

    .btn-cancel {
      padding: 14px 28px;
      background: #f1f5f9;
      color: #475569;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .btn-cancel:hover {
      background: #e2e8f0;
    }

    .btn-save-draft {
      padding: 14px 28px;
      background: linear-gradient(135deg, #475569 0%, #334155 100%);
      color: white;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(71, 85, 105, 0.25);
    }

    .btn-save-draft:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(71, 85, 105, 0.35);
    }

    .btn-publish {
      padding: 14px 28px;
      background: linear-gradient(135deg, #87CEEB 0%, #6DB3D9 100%);
      color: white;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 14px rgba(135, 206, 235, 0.4);
    }

    .btn-publish:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(135, 206, 235, 0.5);
    }

    .btn-publish:disabled,
    .btn-save-draft:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-delete {
      padding: 14px 28px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .btn-delete:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
    }

    .warning {
      color: #ef4444;
      font-weight: 600;
      padding: 12px 16px;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
      border-radius: 10px;
      margin: 10px 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .admin-blog-container {
        padding: 20px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .filters-section {
        flex-direction: column;
      }

      .posts-table {
        font-size: 0.85rem;
      }

      .posts-table th,
      .posts-table td {
        padding: 14px 12px;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class AdminBlogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private blogService = inject(BlogService);
  private driveService = inject(GoogleDriveService);

  // Observable data
  allPosts: BlogPost[] = [];
  filteredPosts: BlogPost[] = [];
  categories$!: Observable<BlogCategory[]>;

  // Stats
  publishedCount = 0;
  draftCount = 0;
  totalViews = 0;

  // Filters
  filterStatus = 'all';
  filterCategory = '';
  searchTerm = '';

  // Editor
  showEditor = false;
  editingPost: BlogPost | null = null;
  postForm!: FormGroup;
  saving = false;
  showPreview = false;

  // Image upload
  coverImagePreview: string | null = null;
  selectedCoverImageFile: File | null = null;

  // Tags
  currentTags: string[] = [];
  tagInput = '';

  // Category management
  newCategoryName = '';

  // Delete confirmation
  showDeleteConfirm = false;
  postToDelete: BlogPost | null = null;

  ngOnInit(): void {
    this.loadPosts();
    this.loadCategories();
    this.initForm();
  }

  initForm(): void {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      slug: [''],
      excerpt: ['', [Validators.required, Validators.maxLength(160)]],
      content: ['', Validators.required],
      category: ['', Validators.required],
      status: ['draft'],
      coverImage: [''],
      coverImageAlt: [''],
      metaDescription: [''],
      featured: [false]
    });
  }

  loadPosts(): void {
    this.blogService.getAllPosts().subscribe(posts => {
      this.allPosts = posts;
      this.applyFilters();
      this.calculateStats();
    });
  }

  loadCategories(): void {
    this.categories$ = this.blogService.getCategories();
  }

  calculateStats(): void {
    this.publishedCount = this.allPosts.filter(p => p.status === 'published').length;
    this.draftCount = this.allPosts.filter(p => p.status === 'draft').length;
    this.totalViews = this.allPosts.reduce((sum, p) => sum + (p.views || 0), 0);
  }

  applyFilters(): void {
    let filtered = [...this.allPosts];

    // Filter by status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === this.filterStatus);
    }

    // Filter by category
    if (this.filterCategory) {
      filtered = filtered.filter(p => p.category === this.filterCategory);
    }

    // Search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.excerpt.toLowerCase().includes(term)
      );
    }

    this.filteredPosts = filtered;
  }

  // ==================== POST EDITOR ====================

  openPostEditor(): void {
    this.editingPost = null;
    this.initForm();
    this.currentTags = [];
    this.coverImagePreview = null;
    this.showEditor = true;
  }

  editPost(post: BlogPost): void {
    this.editingPost = post;
    this.currentTags = [...post.tags];
    this.coverImagePreview = post.coverImage;
    
    this.postForm.patchValue({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      status: post.status,
      coverImage: post.coverImage,
      coverImageAlt: post.coverImageAlt,
      metaDescription: post.metaDescription,
      featured: post.featured
    });

    this.showEditor = true;
  }

  closeEditor(): void {
    this.showEditor = false;
    this.editingPost = null;
    this.coverImagePreview = null;
    this.selectedCoverImageFile = null;
  }

  generateSlug(): void {
    const title = this.postForm.get('title')?.value || '';
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 100);
    
    this.postForm.patchValue({ slug });
  }

  async savePost(status: 'draft' | 'published'): Promise<void> {
    if (!this.postForm.valid) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    this.saving = true;

    try {
      // Get cover image URL (Google Drive or direct URL)
      let coverImageUrl = this.postForm.get('coverImage')?.value;

      // If it's a Google Drive URL, extract the file ID and store it
      // The driveImage pipe will convert it when displaying
      if (coverImageUrl && this.driveService.isDriveUrl(coverImageUrl)) {
        const fileId = this.driveService.extractFileId(coverImageUrl);
        if (fileId) {
          // Store the direct view URL for consistency
          coverImageUrl = this.driveService.getDirectViewUrl(fileId);
        }
      }

      const postData: Partial<BlogPost> = {
        ...this.postForm.value,
        coverImage: coverImageUrl,
        tags: this.currentTags,
        status: status,
        author: {
          name: 'Admin', // TODO: Get from auth service
          email: 'admin@mathrisk.com'
        }
      };

      if (this.editingPost && this.editingPost.id) {
        await this.blogService.updatePost(this.editingPost.id, postData).toPromise();
        alert('Artículo actualizado correctamente');
      } else {
        await this.blogService.createPost(postData).toPromise();
        alert('Artículo creado correctamente');
      }

      this.closeEditor();
      this.loadPosts();
    } catch (error) {
      console.error('Error guardando artículo:', error);
      alert('Error al guardar el artículo');
    } finally {
      this.saving = false;
    }
  }

  // ==================== IMAGE HANDLING (Google Drive) ====================

  /**
   * Procesa el cambio de URL de Google Drive
   */
  onDriveUrlChange(): void {
    const url = this.postForm.get('coverImage')?.value;
    if (url && this.driveService.isDriveUrl(url)) {
      // Convertir a URL directa para preview
      this.coverImagePreview = this.driveService.getDirectViewUrl(url);
    } else if (url) {
      // Si no es URL de Drive, usar directamente
      this.coverImagePreview = url;
    } else {
      this.coverImagePreview = null;
    }
  }

  removeCoverImage(): void {
    this.coverImagePreview = null;
    this.selectedCoverImageFile = null;
    this.postForm.patchValue({ coverImage: '' });
  }

  // ==================== EDITOR FORMATTING ====================

  insertFormat(format: string): void {
    const textarea = document.querySelector('.editor-container textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = '';

    switch (format) {
      case 'bold':
        replacement = `<strong>${selectedText || 'texto en negrita'}</strong>`;
        break;
      case 'italic':
        replacement = `<em>${selectedText || 'texto en cursiva'}</em>`;
        break;
      case 'underline':
        replacement = `<u>${selectedText || 'texto subrayado'}</u>`;
        break;
      case 'h2':
        replacement = `\n\n<h2>${selectedText || 'Título de sección'}</h2>\n\n`;
        break;
      case 'h3':
        replacement = `\n\n<h3>${selectedText || 'Subtítulo'}</h3>\n\n`;
        break;
      case 'ul':
        replacement = `\n\n<ul>\n  <li>${selectedText || 'Elemento de lista'}</li>\n  <li>Elemento 2</li>\n</ul>\n\n`;
        break;
      case 'ol':
        replacement = `\n\n<ol>\n  <li>${selectedText || 'Primer elemento'}</li>\n  <li>Segundo elemento</li>\n</ol>\n\n`;
        break;
      case 'link':
        const url = prompt('Ingresa la URL:');
        if (url) {
          replacement = `<a href="${url}">${selectedText || 'texto del enlace'}</a>`;
        }
        break;
      case 'quote':
        replacement = `\n\n<blockquote>\n  ${selectedText || 'Texto de la cita'}\n</blockquote>\n\n`;
        break;
    }

    if (replacement) {
      const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
      this.postForm.patchValue({ content: newValue });
    }
  }

  insertImage(): void {
    const url = prompt('Ingresa la URL de la imagen:');
    if (url) {
      const textarea = document.querySelector('.editor-container textarea') as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const replacement = `\n\n<img src="${url}" alt="Imagen del artículo" style="max-width: 100%; height: auto; border-radius: 8px;">\n\n`;
      const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(start);
      this.postForm.patchValue({ content: newValue });
    }
  }

  // ==================== TAGS ====================

  addTag(): void {
    const tag = this.tagInput.trim();
    if (tag && !this.currentTags.includes(tag)) {
      this.currentTags.push(tag);
      this.tagInput = '';
    }
  }

  removeTag(index: number): void {
    this.currentTags.splice(index, 1);
  }

  // ==================== ACTIONS ====================

  toggleFeatured(post: BlogPost): void {
    if (post.id) {
      this.blogService.updatePost(post.id, { featured: !post.featured }).subscribe(() => {
        this.loadPosts();
      });
    }
  }

  resetPostViews(post: BlogPost): void {
    if (post.id && confirm(`¿Resetear las vistas de "${post.title}" a 0?`)) {
      this.blogService.resetViews(post.id).subscribe(() => {
        this.loadPosts();
        alert('Vistas reseteadas correctamente');
      });
    }
  }

  deletePostConfirm(post: BlogPost): void {
    this.postToDelete = post;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.postToDelete = null;
    this.showDeleteConfirm = false;
  }

  confirmDelete(): void {
    if (this.postToDelete && this.postToDelete.id) {
      this.blogService.deletePost(this.postToDelete.id, this.postToDelete.coverImage).subscribe(() => {
        alert('Artículo eliminado correctamente');
        this.loadPosts();
        this.cancelDelete();
      });
    }
  }

  // ==================== CATEGORIES ====================

  addCategory(): void {
    if (this.newCategoryName.trim()) {
      this.blogService.createCategory({ name: this.newCategoryName }).subscribe(() => {
        this.newCategoryName = '';
        this.loadCategories();
        alert('Categoría creada correctamente');
      });
    }
  }

  deleteCategory(category: BlogCategory): void {
    if (confirm(`¿Eliminar la categoría "${category.name}"?`)) {
      if (category.id) {
        this.blogService.deleteCategory(category.id).subscribe(() => {
          this.loadCategories();
          alert('Categoría eliminada correctamente');
        });
      }
    }
  }

  // ==================== UTILITIES ====================

  formatDate(date: any): string {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
