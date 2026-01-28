import { Pipe, PipeTransform, inject } from '@angular/core';
import { GoogleDriveService } from '@core/services/google-drive.service';

/**
 * Pipe para convertir URLs de Google Drive en URLs directas de imagen
 *
 * Uso en templates:
 * <img [src]="post.coverImage | driveImage">
 * <img [src]="post.coverImage | driveImage:'thumbnail'">
 * <img [src]="post.coverImage | driveImage:'card'">
 * <img [src]="post.coverImage | driveImage:'cover'">
 * <img [src]="post.coverImage | driveImage:'full'">
 */
@Pipe({
  name: 'driveImage',
  standalone: true
})
export class DriveImagePipe implements PipeTransform {
  private driveService = inject(GoogleDriveService);

  transform(
    value: string | null | undefined,
    size: 'thumbnail' | 'card' | 'cover' | 'full' = 'full'
  ): string {
    if (!value) return '';

    return this.driveService.getOptimizedUrl(value, size);
  }
}
