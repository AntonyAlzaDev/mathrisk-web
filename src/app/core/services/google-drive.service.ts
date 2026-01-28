import { Injectable } from '@angular/core';

/**
 * Google Drive Service
 * Maneja la conversión de URLs de Google Drive para uso en la aplicación
 *
 * IMPORTANTE: Google Drive tiene limitaciones:
 * - Límite de bandwidth (puede bloquear imágenes con mucho tráfico)
 * - URLs pueden cambiar si Google modifica su estructura
 * - No es un CDN, las imágenes cargan más lento
 *
 * Carpeta principal: https://drive.google.com/drive/folders/1ocYgD1slWwFk56donFWwE3a7dfr3u1YN
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {

  // ID de la carpeta principal de MathRisk en Google Drive
  readonly MAIN_FOLDER_ID = '1ocYgD1slWwFk56donFWwE3a7dfr3u1YN';

  // URLs base de Google Drive
  private readonly DRIVE_VIEW_URL = 'https://drive.google.com/uc?export=view&id=';
  private readonly DRIVE_THUMBNAIL_URL = 'https://drive.google.com/thumbnail?id=';
  private readonly DRIVE_DOWNLOAD_URL = 'https://drive.google.com/uc?export=download&id=';

  /**
   * Extrae el ID de archivo de una URL de Google Drive
   * Soporta múltiples formatos de URL:
   * - https://drive.google.com/file/d/FILE_ID/view
   * - https://drive.google.com/open?id=FILE_ID
   * - https://drive.google.com/uc?id=FILE_ID
   * - FILE_ID (solo el ID)
   */
  extractFileId(url: string): string | null {
    if (!url) return null;

    // Si ya es solo un ID (sin URL completa)
    if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) {
      return url;
    }

    // Formato: /file/d/FILE_ID/
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) return fileMatch[1];

    // Formato: ?id=FILE_ID o &id=FILE_ID
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) return idMatch[1];

    // Formato: /folders/FOLDER_ID
    const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch) return folderMatch[1];

    return null;
  }

  /**
   * Convierte una URL de Google Drive a una URL de visualización directa
   * Ideal para imágenes en tags <img>
   */
  getDirectViewUrl(urlOrId: string): string {
    const fileId = this.extractFileId(urlOrId);
    if (!fileId) return urlOrId; // Retorna original si no es URL de Drive

    return `${this.DRIVE_VIEW_URL}${fileId}`;
  }

  /**
   * Obtiene URL de thumbnail con tamaño específico
   * Útil para optimizar carga de imágenes pequeñas
   * @param urlOrId URL o ID del archivo
   * @param size Tamaño en píxeles (ej: 200, 400, 800)
   */
  getThumbnailUrl(urlOrId: string, size: number = 400): string {
    const fileId = this.extractFileId(urlOrId);
    if (!fileId) return urlOrId;

    return `${this.DRIVE_THUMBNAIL_URL}${fileId}&sz=w${size}`;
  }

  /**
   * Obtiene URL de descarga directa
   * Útil para PDFs y archivos descargables
   */
  getDownloadUrl(urlOrId: string): string {
    const fileId = this.extractFileId(urlOrId);
    if (!fileId) return urlOrId;

    return `${this.DRIVE_DOWNLOAD_URL}${fileId}`;
  }

  /**
   * Verifica si una URL es de Google Drive
   */
  isDriveUrl(url: string): boolean {
    if (!url) return false;
    return url.includes('drive.google.com') || /^[a-zA-Z0-9_-]{25,}$/.test(url);
  }

  /**
   * Convierte automáticamente cualquier URL de imagen
   * Si es de Google Drive, la convierte; si no, la retorna igual
   */
  processImageUrl(url: string, useThumbnail: boolean = false, thumbnailSize: number = 800): string {
    if (!url) return '';

    if (this.isDriveUrl(url)) {
      return useThumbnail
        ? this.getThumbnailUrl(url, thumbnailSize)
        : this.getDirectViewUrl(url);
    }

    return url;
  }

  /**
   * Genera la URL para una imagen en una subcarpeta específica
   * Estructura recomendada en Drive:
   * - /blog-covers/
   * - /course-covers/
   * - /certificates/
   * - /general/
   *
   * @param fileId ID del archivo
   * @param folder Nombre de la carpeta (solo informativo, el ID ya contiene la ubicación)
   */
  getImageUrl(fileId: string): string {
    return this.getDirectViewUrl(fileId);
  }

  /**
   * Helper para obtener URL optimizada según el contexto
   */
  getOptimizedUrl(urlOrId: string, context: 'thumbnail' | 'card' | 'full' | 'cover'): string {
    const sizes: Record<string, number> = {
      thumbnail: 200,
      card: 400,
      full: 1200,
      cover: 800
    };

    if (context === 'full') {
      return this.getDirectViewUrl(urlOrId);
    }

    return this.getThumbnailUrl(urlOrId, sizes[context] || 400);
  }
}
