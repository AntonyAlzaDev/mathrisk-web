import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  Timestamp,
  QueryConstraint
} from '@angular/fire/firestore';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from '@angular/fire/storage';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { BlogPost, BlogCategory } from '../models/blog-post.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private postsCollection = collection(this.firestore, 'blog-posts');
  private categoriesCollection = collection(this.firestore, 'blog-categories');

  // Storage key para tracking de vistas por sesión
  private readonly VIEWS_STORAGE_KEY = 'mathrisk_blog_viewed_posts';

  // ==================== POSTS ====================

  /**
   * Obtener todos los posts publicados (vista pública)
   */
  getPublishedPosts(limitCount: number = 10): Observable<BlogPost[]> {
    const q = query(
      this.postsCollection,
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<BlogPost[]>;
  }

  /**
   * Obtener posts por categoría
   */
  getPostsByCategory(category: string, limitCount: number = 10): Observable<BlogPost[]> {
    const q = query(
      this.postsCollection,
      where('status', '==', 'published'),
      where('category', '==', category),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<BlogPost[]>;
  }

  /**
   * Obtener posts destacados
   */
  getFeaturedPosts(limitCount: number = 3): Observable<BlogPost[]> {
    const q = query(
      this.postsCollection,
      where('status', '==', 'published'),
      where('featured', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<BlogPost[]>;
  }

  /**
   * Obtener un post por su slug
   */
  getPostBySlug(slug: string): Observable<BlogPost | undefined> {
    const q = query(
      this.postsCollection,
      where('slug', '==', slug),
      limit(1)
    );
    
    return (collectionData(q, { idField: 'id' }) as Observable<BlogPost[]>).pipe(
      map(posts => posts.length > 0 ? posts[0] : undefined),
      switchMap(post => {
        if (post && post.id) {
          // Incrementar vistas
          this.incrementViews(post.id);
        }
        return of(post);
      })
    );
  }

  /**
   * Obtener un post por ID
   */
  getPostById(id: string): Observable<BlogPost> {
    const postDoc = doc(this.firestore, `blog-posts/${id}`);
    return docData(postDoc, { idField: 'id' }) as Observable<BlogPost>;
  }

  /**
   * Buscar posts
   */
  searchPosts(searchTerm: string): Observable<BlogPost[]> {
    // Nota: Firestore no tiene búsqueda de texto completo nativa
    // Esta es una solución básica. Para producción, considera Algolia o Elasticsearch
    return this.getPublishedPosts(100).pipe(
      map(posts => posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      ))
    );
  }

  /**
   * Incrementar contador de vistas (con protección de sesión)
   * Solo incrementa si el usuario no ha visto el post en esta sesión
   */
  private incrementViews(postId: string): void {
    // Verificar si ya se vio en esta sesión
    if (this.hasViewedPost(postId)) {
      return; // No incrementar si ya se vio
    }

    // Marcar como visto en esta sesión
    this.markPostAsViewed(postId);

    // Incrementar en Firestore
    const postDoc = doc(this.firestore, `blog-posts/${postId}`);
    updateDoc(postDoc, {
      views: increment(1)
    }).catch(error => console.error('Error incrementando vistas:', error));
  }

  /**
   * Verificar si un post ya fue visto en esta sesión
   */
  private hasViewedPost(postId: string): boolean {
    try {
      const viewedPosts = this.getViewedPosts();
      return viewedPosts.includes(postId);
    } catch {
      return false;
    }
  }

  /**
   * Marcar un post como visto en esta sesión
   */
  private markPostAsViewed(postId: string): void {
    try {
      const viewedPosts = this.getViewedPosts();
      if (!viewedPosts.includes(postId)) {
        viewedPosts.push(postId);
        sessionStorage.setItem(this.VIEWS_STORAGE_KEY, JSON.stringify(viewedPosts));
      }
    } catch {
      // sessionStorage no disponible (modo incógnito, etc.)
    }
  }

  /**
   * Obtener lista de posts vistos en esta sesión
   */
  private getViewedPosts(): string[] {
    try {
      const stored = sessionStorage.getItem(this.VIEWS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // ==================== ADMIN POSTS ====================

  /**
   * Obtener todos los posts (incluyendo drafts) - Solo admin
   */
  getAllPosts(): Observable<BlogPost[]> {
    const q = query(
      this.postsCollection,
      orderBy('createdAt', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<BlogPost[]>;
  }

  /**
   * Crear un nuevo post
   */
  createPost(post: Partial<BlogPost>): Observable<string> {
    const newPost = {
      ...post,
      slug: this.generateSlug(post.title || ''),
      status: post.status || 'draft',
      featured: post.featured || false,
      views: 0,
      likes: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      readTime: this.calculateReadTime(post.content || '')
    };

    if (newPost.status === 'published' && !newPost.publishedAt) {
      newPost.publishedAt = Timestamp.now();
    }

    return from(addDoc(this.postsCollection, newPost)).pipe(
      map(docRef => docRef.id)
    );
  }

  /**
   * Actualizar un post existente
   */
  updatePost(id: string, post: Partial<BlogPost>): Observable<void> {
    const postDoc = doc(this.firestore, `blog-posts/${id}`);
    const updateData = {
      ...post,
      updatedAt: Timestamp.now(),
      readTime: post.content ? this.calculateReadTime(post.content) : undefined
    };

    // Si se está publicando por primera vez
    if (post.status === 'published' && !post.publishedAt) {
      updateData.publishedAt = Timestamp.now();
    }

    return from(updateDoc(postDoc, updateData));
  }

  /**
   * Eliminar un post
   */
  deletePost(id: string, coverImageUrl?: string): Observable<void> {
    const postDoc = doc(this.firestore, `blog-posts/${id}`);

    return from(deleteDoc(postDoc)).pipe(
      switchMap(() => {
        // Eliminar imagen de portada si existe
        if (coverImageUrl && coverImageUrl.includes('firebase')) {
          return this.deleteImage(coverImageUrl);
        }
        return of(undefined);
      }),
      map(() => undefined)
    );
  }

  /**
   * Resetear contador de vistas a 0
   */
  resetViews(postId: string): Observable<void> {
    const postDoc = doc(this.firestore, `blog-posts/${postId}`);
    return from(updateDoc(postDoc, { views: 0 }));
  }

  // ==================== IMAGES ====================

  /**
   * Subir imagen a Firebase Storage
   */
  uploadImage(file: File, path: string = 'blog-images'): Observable<string> {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `${path}/${fileName}`;
    const storageRef = ref(this.storage, filePath);

    return from(uploadBytes(storageRef, file)).pipe(
      switchMap(() => getDownloadURL(storageRef))
    );
  }

  /**
   * Eliminar imagen de Firebase Storage
   */
  deleteImage(imageUrl: string): Observable<void> {
    try {
      const storageRef = ref(this.storage, imageUrl);
      return from(deleteObject(storageRef)).pipe(
        catchError(error => {
          console.error('Error eliminando imagen:', error);
          return of(undefined);
        })
      );
    } catch (error) {
      console.error('Error al procesar URL de imagen:', error);
      return of(undefined);
    }
  }

  // ==================== CATEGORIES ====================

  /**
   * Obtener todas las categorías
   */
  getCategories(): Observable<BlogCategory[]> {
    return collectionData(this.categoriesCollection, { idField: 'id' }) as Observable<BlogCategory[]>;
  }

  /**
   * Crear una categoría
   */
  createCategory(category: Partial<BlogCategory>): Observable<string> {
    const newCategory = {
      ...category,
      slug: this.generateSlug(category.name || ''),
      count: 0
    };

    return from(addDoc(this.categoriesCollection, newCategory)).pipe(
      map(docRef => docRef.id)
    );
  }

  /**
   * Actualizar categoría
   */
  updateCategory(id: string, category: Partial<BlogCategory>): Observable<void> {
    const categoryDoc = doc(this.firestore, `blog-categories/${id}`);
    return from(updateDoc(categoryDoc, category));
  }

  /**
   * Eliminar categoría
   */
  deleteCategory(id: string): Observable<void> {
    const categoryDoc = doc(this.firestore, `blog-categories/${id}`);
    return from(deleteDoc(categoryDoc));
  }

  // ==================== UTILITIES ====================

  /**
   * Generar slug a partir del título
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
      .trim()
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Eliminar guiones múltiples
      .substring(0, 100); // Limitar longitud
  }

  /**
   * Calcular tiempo de lectura estimado
   */
  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Generar extracto a partir del contenido
   */
  generateExcerpt(content: string, maxLength: number = 160): string {
    const plainText = content.replace(/<[^>]*>/g, ''); // Eliminar HTML
    if (plainText.length <= maxLength) {
      return plainText;
    }
    return plainText.substring(0, maxLength).trim() + '...';
  }
}
