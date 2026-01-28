import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '@app/core/services/contact.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatSnackBarModule  // ← IMPORTANTE: Agregar esto
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  isSubmitting = false;
  showSuccessMessage = false;

  // Información de contacto de la empresa
  companyInfo = {
    email: 'contacto@mathrisksolution.com',
    phone: '+51 980 789 070',
    address: 'Lima, Perú',
    linkedin: 'https://www.linkedin.com/company/mathrisksolution',
    whatsapp: 'https://wa.me/51980789070'
  };

  // Opciones de motivo de contacto
  contactReasons = [
    { value: 'consultoria', label: 'Consultoría y Asesoramiento' },
    { value: 'cursos', label: 'Cursos y Capacitación' },
    { value: 'software', label: 'Desarrollo de Software' },
    { value: 'alianza', label: 'Alianzas Estratégicas' },
    { value: 'otro', label: 'Otro' }
  ];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initializeForm(): void {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]],
      company: [''],
      reason: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  /**
   * Obtiene los mensajes de error para cada campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (field?.hasError('email')) {
      return 'Ingrese un correo electrónico válido';
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    
    if (field?.hasError('pattern')) {
      return 'Formato inválido';
    }
    
    return '';
  }

  /**
   * Maneja el envío del formulario
   */
  async onSubmit(): Promise<void> {
    if (this.contactForm.invalid) {
      this.markFormGroupTouched(this.contactForm);
      this.showNotification('Por favor, complete todos los campos correctamente', 'error');
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.contactForm.value;
      
      // Agregar metadata adicional
      const contactData = {
        ...formData,
        timestamp: new Date().toISOString(),
        source: 'website',
        status: 'nuevo'
      };

      // Enviar datos a través del servicio
      await this.contactService.submitContact(contactData);
      
      this.showSuccessMessage = true;
      this.contactForm.reset();
      this.showNotification('¡Mensaje enviado exitosamente! Nos pondremos en contacto pronto.', 'success');
      
      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);

    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      this.showNotification('Hubo un error al enviar el mensaje. Por favor, intente nuevamente.', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Marca todos los campos del formulario como tocados para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Muestra notificaciones al usuario
   */
  private showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }

  /**
   * Abre WhatsApp
   */
  openWhatsApp(): void {
    window.open(this.companyInfo.whatsapp, '_blank');
  }

  /**
   * Abre el cliente de correo
   */
  openEmail(): void {
    window.location.href = `mailto:${this.companyInfo.email}`;
  }

  /**
   * Abre LinkedIn
   */
  openLinkedIn(): void {
    window.open(this.companyInfo.linkedin, '_blank');
  }
}