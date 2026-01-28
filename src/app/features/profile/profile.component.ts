import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Mi Perfil</h1>
      <p>Componente en desarrollo...</p>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 800px;
      margin: 80px auto 40px;
      padding: 30px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }
  `]
})
export class ProfileComponent {}