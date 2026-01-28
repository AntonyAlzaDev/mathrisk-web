import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { BlogService } from '../../../core/services/blog.service';
import { BlogPost } from '../../../core/models/blog-post.model';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { DriveImagePipe } from '@shared/pipes/drive-image.pipe';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, SafeHtmlPipe, DriveImagePipe],
  template: `
    <article *ngIf="post$ | async as post" class="blog-detail-container">
      <!-- Header Image -->
      <div class="post-header-image">
        <img [src]="post.coverImage | driveImage:'full'" [alt]="post.coverImageAlt || post.title">
        <div class="header-overlay"></div>
      </div>

      <!-- Post Content -->
      <div class="post-content-wrapper">
        <div class="post-container">
          <!-- Breadcrumb -->
          <nav class="breadcrumb">
            <a routerLink="/blog">Blog</a>
            <span class="separator">/</span>
            <span class="current">{{ post.title }}</span>
          </nav>

          <!-- Post Header -->
          <header class="post-header">
            <div class="post-category">{{ post.category }}</div>
            <h1 class="post-title">{{ post.title }}</h1>
            
            <!-- Post Meta -->
            <div class="post-meta">
              <div class="author-info">
                <img 
                  [src]="(post.author.photoURL | driveImage:'thumbnail') || '/assets/images/default-avatar.png'" 
                  [alt]="post.author.name"
                  class="author-avatar"
                >
                <div class="author-details">
                  <span class="author-name">{{ post.author.name }}</span>
                  <div class="meta-items">
                    <span class="date">{{ formatDate(post.publishedAt) }}</span>
                    <span class="separator">•</span>
                    <span class="read-time">{{ post.readTime || 5 }} min de lectura</span>
                    <span class="separator">•</span>
                    <span class="views">👁 {{ post.views || 0 }} vistas</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Social Share -->
            <div class="social-share">
              <span class="share-label">Compartir:</span>
              <div class="share-buttons">
                <button 
                  class="share-btn linkedin"
                  (click)="shareOnLinkedIn(post)"
                  title="Compartir en LinkedIn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </button>
                
                <button 
                  class="share-btn twitter"
                  (click)="shareOnTwitter(post)"
                  title="Compartir en Twitter"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                  Twitter
                </button>
                
                <button 
                  class="share-btn facebook"
                  (click)="shareOnFacebook(post)"
                  title="Compartir en Facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                  Facebook
                </button>
                
                <button 
                  class="share-btn copy"
                  (click)="copyLink()"
                  title="Copiar enlace"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  Copiar
                </button>
              </div>
              <span *ngIf="linkCopied" class="copy-feedback">¡Enlace copiado!</span>
            </div>

            <!-- Tags -->
            <div class="post-tags">
              <span *ngFor="let tag of post.tags" class="tag">#{{ tag }}</span>
            </div>
          </header>

          <!-- Post Body -->
          <div class="post-body" [innerHTML]="post.content | safeHtml"></div>

          <!-- Post Footer -->
          <footer class="post-footer">
            <div class="footer-actions">
              <button class="action-btn like-btn" [class.liked]="isLiked">
                ❤️ {{ post.likes || 0 }} Me gusta
              </button>
              <button class="action-btn share-again-btn" (click)="scrollToTop()">
                ↑ Volver arriba
              </button>
            </div>

            <!-- Author Box -->
            <div class="author-box">
              <img 
                [src]="(post.author.photoURL | driveImage:'thumbnail') || '/assets/images/default-avatar.png'" 
                [alt]="post.author.name"
                class="author-box-avatar"
              >
              <div class="author-box-content">
                <h3>Escrito por {{ post.author.name }}</h3>
                <p class="author-box-bio">
                  Especialista en gestión de riesgos financieros y análisis cuantitativo en MathRisk Solution.
                </p>
              </div>
            </div>

            <!-- Related Posts -->
            <div class="related-posts">
              <h3>Artículos Relacionados</h3>
              <div class="related-grid">
                <div 
                  *ngFor="let relatedPost of relatedPosts$ | async"
                  class="related-card"
                >
                  <a [routerLink]="['/blog', relatedPost.slug]">
                    <img [src]="relatedPost.coverImage | driveImage:'card'" [alt]="relatedPost.title">
                    <div class="related-content">
                      <h4>{{ relatedPost.title }}</h4>
                      <span class="related-date">{{ formatDate(relatedPost.publishedAt) }}</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <!-- Back to Blog -->
            <div class="back-to-blog">
              <a routerLink="/blog" class="back-btn">
                ← Volver al blog
              </a>
            </div>
          </footer>
        </div>
      </div>
    </article>

    <!-- Loading State -->
    <div *ngIf="!(post$ | async)" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando artículo...</p>
    </div>
  `,
  styles: [`
    .blog-detail-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    }

    /* Header Image - Modern */
    .post-header-image {
      position: relative;
      width: 100%;
      height: 50vh;
      min-height: 400px;
      max-height: 550px;
      overflow: hidden;
    }

    .post-header-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    .header-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60%;
      background: linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent);
    }

    /* Content Wrapper - Glassmorphism */
    .post-content-wrapper {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      margin: -80px auto 0;
      position: relative;
      z-index: 1;
      border-radius: 32px 32px 0 0;
      box-shadow: 0 -10px 40px rgba(0,0,0,0.08);
    }

    .post-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 48px 24px 100px;
    }

    /* Breadcrumb */
    .breadcrumb {
      margin-bottom: 32px;
      font-size: 0.9rem;
      color: #64748b;
    }

    .breadcrumb a {
      color: #5D9DBF;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .breadcrumb a:hover {
      color: #87CEEB;
    }

    .separator {
      margin: 0 12px;
      color: #cbd5e1;
    }

    /* Post Header */
    .post-header {
      margin-bottom: 48px;
      padding-bottom: 40px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }

    .post-category {
      display: inline-block;
      background: linear-gradient(135deg, #87CEEB 0%, #6DB3D9 100%);
      color: white;
      padding: 8px 18px;
      border-radius: 30px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .post-title {
      font-size: clamp(2rem, 4vw, 2.8rem);
      font-weight: 800;
      line-height: 1.2;
      color: #0f172a;
      margin-bottom: 28px;
      letter-spacing: -0.02em;
    }

    /* Post Meta */
    .post-meta {
      margin-bottom: 28px;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .author-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(135, 206, 235, 0.3);
    }

    .author-details {
      flex: 1;
    }

    .author-name {
      display: block;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }

    .meta-items {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.9rem;
      color: #64748b;
      flex-wrap: wrap;
    }

    /* Social Share - Modern Card */
    .social-share {
      display: flex;
      align-items: center;
      gap: 20px;
      margin: 28px 0;
      padding: 24px;
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.1) 0%, rgba(109, 179, 217, 0.1) 100%);
      border-radius: 20px;
      border: 1px solid rgba(135, 206, 235, 0.2);
    }

    .share-label {
      font-weight: 700;
      color: #0f172a;
    }

    .share-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .share-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 18px;
      border: none;
      border-radius: 14px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: white;
    }

    .share-btn:hover {
      transform: translateY(-2px);
    }

    .share-btn.linkedin {
      background: linear-gradient(135deg, #0077B5 0%, #005885 100%);
      box-shadow: 0 4px 12px rgba(0, 119, 181, 0.3);
    }

    .share-btn.linkedin:hover {
      box-shadow: 0 6px 20px rgba(0, 119, 181, 0.4);
    }

    .share-btn.twitter {
      background: linear-gradient(135deg, #1DA1F2 0%, #0d8bd9 100%);
      box-shadow: 0 4px 12px rgba(29, 161, 242, 0.3);
    }

    .share-btn.twitter:hover {
      box-shadow: 0 6px 20px rgba(29, 161, 242, 0.4);
    }

    .share-btn.facebook {
      background: linear-gradient(135deg, #1877F2 0%, #0d5cb8 100%);
      box-shadow: 0 4px 12px rgba(24, 119, 242, 0.3);
    }

    .share-btn.facebook:hover {
      box-shadow: 0 6px 20px rgba(24, 119, 242, 0.4);
    }

    .share-btn.copy {
      background: linear-gradient(135deg, #475569 0%, #334155 100%);
      box-shadow: 0 4px 12px rgba(71, 85, 105, 0.3);
    }

    .share-btn.copy:hover {
      box-shadow: 0 6px 20px rgba(71, 85, 105, 0.4);
    }

    .copy-feedback {
      color: #5D9DBF;
      font-size: 0.9rem;
      font-weight: 600;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Tags */
    .post-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 24px;
    }

    .tag {
      background: #f1f5f9;
      color: #475569;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .tag:hover {
      background: #e2e8f0;
      color: #334155;
    }

    /* Post Body - Beautiful Typography */
    .post-body {
      font-size: 1.125rem;
      line-height: 1.85;
      color: #334155;
      margin-bottom: 60px;
    }

    .post-body :deep(h2) {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 48px 0 24px;
      color: #0f172a;
      letter-spacing: -0.01em;
    }

    .post-body :deep(h3) {
      font-size: 1.35rem;
      font-weight: 700;
      margin: 36px 0 18px;
      color: #0f172a;
    }

    .post-body :deep(p) {
      margin-bottom: 24px;
    }

    .post-body :deep(ul),
    .post-body :deep(ol) {
      margin: 24px 0;
      padding-left: 28px;
    }

    .post-body :deep(li) {
      margin-bottom: 12px;
    }

    .post-body :deep(a) {
      color: #5D9DBF;
      text-decoration: none;
      border-bottom: 2px solid rgba(135, 206, 235, 0.4);
      transition: all 0.2s ease;
    }

    .post-body :deep(a:hover) {
      color: #87CEEB;
      border-bottom-color: #87CEEB;
    }

    .post-body :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 20px;
      margin: 36px 0;
      box-shadow: 0 8px 30px rgba(0,0,0,0.1);
    }

    .post-body :deep(blockquote) {
      border-left: 4px solid linear-gradient(180deg, #87CEEB, #6DB3D9);
      border-image: linear-gradient(180deg, #87CEEB, #6DB3D9) 1;
      padding: 20px 24px;
      margin: 36px 0;
      font-style: italic;
      color: #475569;
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.08) 0%, rgba(109, 179, 217, 0.08) 100%);
      border-radius: 0 16px 16px 0;
    }

    .post-body :deep(code) {
      background: #f1f5f9;
      padding: 4px 8px;
      border-radius: 6px;
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 0.9em;
      color: #5D9DBF;
    }

    .post-body :deep(pre) {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #e2e8f0;
      padding: 24px;
      border-radius: 16px;
      overflow-x: auto;
      margin: 36px 0;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }

    .post-body :deep(pre code) {
      background: none;
      padding: 0;
      color: inherit;
    }

    /* Post Footer */
    .post-footer {
      margin-top: 60px;
    }

    .footer-actions {
      display: flex;
      gap: 16px;
      margin-bottom: 48px;
      padding-bottom: 40px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }

    .action-btn {
      flex: 1;
      padding: 16px 28px;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      background: rgba(255,255,255,0.8);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: #475569;
    }

    .action-btn:hover {
      border-color: #87CEEB;
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.1) 0%, rgba(109, 179, 217, 0.1) 100%);
      color: #5D9DBF;
    }

    .like-btn.liked {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
      border-color: #ef4444;
      color: #ef4444;
    }

    /* Author Box - Modern Card */
    .author-box {
      display: flex;
      gap: 24px;
      padding: 32px;
      background: linear-gradient(135deg, rgba(135, 206, 235, 0.08) 0%, rgba(109, 179, 217, 0.08) 100%);
      border-radius: 24px;
      margin-bottom: 48px;
      border: 1px solid rgba(135, 206, 235, 0.15);
    }

    .author-box-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(135, 206, 235, 0.4);
      flex-shrink: 0;
    }

    .author-box-content h3 {
      font-size: 1.2rem;
      margin-bottom: 10px;
      color: #0f172a;
      font-weight: 700;
    }

    .author-box-bio {
      color: #64748b;
      line-height: 1.7;
      font-size: 0.95rem;
    }

    /* Related Posts - Modern Cards */
    .related-posts {
      margin-bottom: 48px;
    }

    .related-posts h3 {
      font-size: 1.5rem;
      margin-bottom: 28px;
      color: #0f172a;
      font-weight: 700;
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
    }

    .related-card {
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid rgba(255,255,255,0.8);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .related-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.12);
    }

    .related-card a {
      text-decoration: none;
      color: inherit;
    }

    .related-card img {
      width: 100%;
      height: 160px;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .related-card:hover img {
      transform: scale(1.05);
    }

    .related-content {
      padding: 20px;
    }

    .related-content h4 {
      font-size: 1.05rem;
      margin-bottom: 10px;
      color: #0f172a;
      line-height: 1.5;
      font-weight: 600;
    }

    .related-date {
      font-size: 0.85rem;
      color: #94a3b8;
    }

    /* Back to Blog - Elegant Button */
    .back-to-blog {
      text-align: center;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 16px 36px;
      background: linear-gradient(135deg, #87CEEB 0%, #6DB3D9 100%);
      color: white;
      text-decoration: none;
      border-radius: 16px;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 6px 20px rgba(135, 206, 235, 0.4);
    }

    .back-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(135, 206, 235, 0.5);
    }

    /* Loading State */
    .loading-state {
      min-height: 80vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 3px solid #e2e8f0;
      border-top-color: #87CEEB;
      border-radius: 50%;
      animation: spin 0.8s ease-in-out infinite;
      margin-bottom: 24px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .post-header-image {
        height: 35vh;
        min-height: 280px;
      }

      .post-content-wrapper {
        margin-top: -60px;
        border-radius: 24px 24px 0 0;
      }

      .post-container {
        padding: 32px 20px 80px;
      }

      .social-share {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .share-buttons {
        width: 100%;
      }

      .share-btn {
        flex: 1;
        justify-content: center;
      }

      .author-box {
        flex-direction: column;
        text-align: center;
        padding: 28px;
      }

      .author-box-avatar {
        margin: 0 auto;
      }

      .footer-actions {
        flex-direction: column;
      }

      .related-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private blogService = inject(BlogService);
  private metaService = inject(Meta);
  private titleService = inject(Title);
  private destroy$ = new Subject<void>();

  post$!: Observable<BlogPost | undefined>;
  relatedPosts$!: Observable<BlogPost[]>;
  linkCopied = false;
  isLiked = false;

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const slug = params['slug'];
      this.loadPost(slug);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPost(slug: string): void {
    this.post$ = this.blogService.getPostBySlug(slug);
    
    this.post$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(post => {
      if (post) {
        this.updateMetaTags(post);
        this.loadRelatedPosts(post.category, post.id);
      }
    });
  }

  loadRelatedPosts(category: string, currentPostId?: string): void {
    this.relatedPosts$ = this.blogService.getPostsByCategory(category, 3);
  }

  updateMetaTags(post: BlogPost): void {
    const url = `https://mathrisksolution.com/blog/${post.slug}`;
    const imageUrl = post.ogImage || post.coverImage;

    // Título
    this.titleService.setTitle(`${post.title} | MathRisk Solution Blog`);

    // Meta tags estándar
    this.metaService.updateTag({ name: 'description', content: post.metaDescription || post.excerpt });
    this.metaService.updateTag({ name: 'keywords', content: post.metaKeywords?.join(', ') || post.tags.join(', ') });
    this.metaService.updateTag({ name: 'author', content: post.author.name });

    // Open Graph tags para redes sociales
    this.metaService.updateTag({ property: 'og:type', content: 'article' });
    this.metaService.updateTag({ property: 'og:title', content: post.title });
    this.metaService.updateTag({ property: 'og:description', content: post.excerpt });
    this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:site_name', content: 'MathRisk Solution' });

    // Twitter Card tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: post.title });
    this.metaService.updateTag({ name: 'twitter:description', content: post.excerpt });
    this.metaService.updateTag({ name: 'twitter:image', content: imageUrl });

    // Article tags
    this.metaService.updateTag({ property: 'article:published_time', content: post.publishedAt?.toString() || '' });
    this.metaService.updateTag({ property: 'article:author', content: post.author.name });
    this.metaService.updateTag({ property: 'article:section', content: post.category });
    post.tags.forEach(tag => {
      this.metaService.addTag({ property: 'article:tag', content: tag });
    });
  }

  shareOnLinkedIn(post: BlogPost): void {
    const url = `https://mathrisksolution.com/blog/${post.slug}`;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=600');
  }

  shareOnTwitter(post: BlogPost): void {
    const url = `https://mathrisksolution.com/blog/${post.slug}`;
    const text = `${post.title} - ${post.excerpt.substring(0, 100)}...`;
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'width=600,height=600');
  }

  shareOnFacebook(post: BlogPost): void {
    const url = `https://mathrisksolution.com/blog/${post.slug}`;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=600');
  }

  copyLink(): void {
    const url = `${window.location.origin}${window.location.pathname}`;
    navigator.clipboard.writeText(url).then(() => {
      this.linkCopied = true;
      setTimeout(() => this.linkCopied = false, 3000);
    });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
