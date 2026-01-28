import { Timestamp } from '@angular/fire/firestore';

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    email: string;
    photoURL?: string;
  };
  coverImage: string;
  coverImageAlt?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
  views: number;
  
  // SEO y Social Media
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string; // Open Graph image para compartir
  
  // Timestamps
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  publishedAt?: Timestamp | Date;
  
  // Estadísticas
  readTime?: number; // minutos estimados de lectura
  likes?: number;
}

export interface BlogCategory {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface BlogComment {
  id?: string;
  postId: string;
  author: string;
  email: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  createdAt: Timestamp | Date;
}
