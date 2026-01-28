import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Certificate } from '@core/services/course.service';

// Datos de certificados existentes para migración
const EXISTING_CERTIFICATES: Omit<Certificate, 'id'>[] = [
  {
    certificateNumber: "CERT-2025-001",
    studentName: "GIULIANA ISABEL ALARCO VEGA",
    courseName: "APLICACIONES TÉCNICAS PARA LA GESTIÓN DEL RIESGO DE CRÉDITO FINANCIERO APLICANDO HERRAMIENTAS DE SQL",
    completionDate: "09/10/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-002",
    studentName: "LUIS ALBERTO BALLON GARCIA",
    courseName: "APLICACIONES TÉCNICAS PARA LA GESTIÓN DEL RIESGO DE CRÉDITO FINANCIERO APLICANDO HERRAMIENTAS DE SQL",
    completionDate: "09/10/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-003",
    studentName: "ENRIQUE ALONSO LOZANO ESPINOZA",
    courseName: "APLICACIONES TÉCNICAS PARA LA GESTIÓN DEL RIESGO DE CRÉDITO FINANCIERO APLICANDO HERRAMIENTAS DE SQL",
    completionDate: "09/10/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-004",
    studentName: "ISRAEL MARTINEZ CCALLATA",
    courseName: "APLICACIONES TÉCNICAS PARA LA GESTIÓN DEL RIESGO DE CRÉDITO FINANCIERO APLICANDO HERRAMIENTAS DE SQL",
    completionDate: "09/10/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-005",
    studentName: "SAID YUSSEF MEJIA LA ROSA",
    courseName: "APLICACIONES TÉCNICAS PARA LA GESTIÓN DEL RIESGO DE CRÉDITO FINANCIERO APLICANDO HERRAMIENTAS DE SQL",
    completionDate: "09/10/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-006",
    studentName: "MICHAEL RAUL MENDOZA CASTANEDA",
    courseName: "APLICACIONES TÉCNICAS PARA LA GESTIÓN DEL RIESGO DE CRÉDITO FINANCIERO APLICANDO HERRAMIENTAS DE SQL",
    completionDate: "09/10/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-007",
    studentName: "CINTHYA PIERINA MUZANTE MORENO",
    courseName: "APLICACIONES TÉCNICAS PARA LA GESTIÓN DEL RIESGO DE CRÉDITO FINANCIERO APLICANDO HERRAMIENTAS DE SQL",
    completionDate: "09/10/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-008",
    studentName: "ROCIO ROXANA PARIAHUAMAN HEREDIA",
    courseName: "APLICACIONES TÉCNICAS PARA LA GESTIÓN DEL RIESGO DE CRÉDITO FINANCIERO APLICANDO HERRAMIENTAS DE SQL",
    completionDate: "09/10/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-009",
    studentName: "APOLINAR PEDRO POLO NEYRA",
    courseName: "APLICACIONES TÉCNICAS PARA LA GESTIÓN DEL RIESGO DE CRÉDITO FINANCIERO APLICANDO HERRAMIENTAS DE SQL",
    completionDate: "09/10/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-010",
    studentName: "LUIS RODOLFO REBATTA TRUJILLO",
    courseName: "APLICACIONES TÉCNICAS PARA LA GESTIÓN DEL RIESGO DE CRÉDITO FINANCIERO APLICANDO HERRAMIENTAS DE SQL",
    completionDate: "09/10/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-011",
    studentName: "ENRIQUE ALONSO LOZANO ESPINOZA",
    courseName: "HERRAMIENTAS PARA ANALÍTICA DE DATOS Y VISUALIZACIÓN",
    completionDate: "22/12/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-012",
    studentName: "ISRAEL MARTÍNEZ CCALLATA",
    courseName: "HERRAMIENTAS PARA ANALÍTICA DE DATOS Y VISUALIZACIÓN",
    completionDate: "22/12/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-013",
    studentName: "LUIS ALBERTO BALLÓN GARCÍA",
    courseName: "HERRAMIENTAS PARA ANALÍTICA DE DATOS Y VISUALIZACIÓN",
    completionDate: "22/12/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-014",
    studentName: "LUIS RODOLFO REBATTA TRUJILLO",
    courseName: "HERRAMIENTAS PARA ANALÍTICA DE DATOS Y VISUALIZACIÓN",
    completionDate: "22/12/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-015",
    studentName: "MICHAEL RAÚL MENDOZA CASTAÑEDA",
    courseName: "HERRAMIENTAS PARA ANALÍTICA DE DATOS Y VISUALIZACIÓN",
    completionDate: "22/12/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-016",
    studentName: "ROMER MENDOZA VELÁSQUEZ",
    courseName: "HERRAMIENTAS PARA ANALÍTICA DE DATOS Y VISUALIZACIÓN",
    completionDate: "22/12/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-017",
    studentName: "NELY PACORI",
    courseName: "HERRAMIENTAS PARA ANALÍTICA DE DATOS Y VISUALIZACIÓN",
    completionDate: "22/12/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  },
  {
    certificateNumber: "CERT-2025-018",
    studentName: "SAID YUSSEF MEJÍA LA ROSA",
    courseName: "HERRAMIENTAS PARA ANALÍTICA DE DATOS Y VISUALIZACIÓN",
    completionDate: "22/12/2025",
    durationHours: 30,
    instructorName: "MathRisk Solution"
  }
];

@Component({
  selector: 'app-certificates-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificates-management.component.html',
  styleUrls: ['./certificates-management.component.scss']
})
export class CertificatesManagementComponent implements OnInit {
  private courseService = inject(CourseService);

  certificates = signal<Certificate[]>([]);
  isLoading = signal<boolean>(false);
  isMigrating = signal<boolean>(false);
  migrationMessage = signal<string>('');

  // Form for new certificate
  showForm = signal<boolean>(false);
  newCertificate = signal<Omit<Certificate, 'id'>>({
    certificateNumber: '',
    studentName: '',
    courseName: '',
    completionDate: '',
    durationHours: 30,
    instructorName: 'MathRisk Solution'
  });

  ngOnInit(): void {
    this.loadCertificates();
  }

  async loadCertificates(): Promise<void> {
    this.isLoading.set(true);
    try {
      const certs = await this.courseService.getAllCertificates();
      this.certificates.set(certs);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async migrateExistingCertificates(): Promise<void> {
    if (this.certificates().length > 0) {
      const confirm = window.confirm(
        `Ya existen ${this.certificates().length} certificados en la base de datos. ¿Deseas continuar con la migración? Esto podría crear duplicados.`
      );
      if (!confirm) return;
    }

    this.isMigrating.set(true);
    this.migrationMessage.set('Iniciando migración...');

    try {
      let migrated = 0;
      for (const cert of EXISTING_CERTIFICATES) {
        // Check if certificate already exists
        const existing = await this.courseService.verifyCertificate(cert.certificateNumber);
        if (!existing) {
          await this.courseService.createCertificate(cert);
          migrated++;
          this.migrationMessage.set(`Migrados ${migrated} de ${EXISTING_CERTIFICATES.length} certificados...`);
        }
      }

      this.migrationMessage.set(`Migración completada. ${migrated} certificados nuevos agregados.`);
      await this.loadCertificates();
    } catch (error) {
      console.error('Error during migration:', error);
      this.migrationMessage.set('Error durante la migración. Ver consola para detalles.');
    } finally {
      this.isMigrating.set(false);
    }
  }

  toggleForm(): void {
    this.showForm.update(v => !v);
    if (this.showForm()) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newCertificate.set({
      certificateNumber: '',
      studentName: '',
      courseName: '',
      completionDate: '',
      durationHours: 30,
      instructorName: 'MathRisk Solution'
    });
  }

  updateFormField(field: keyof Omit<Certificate, 'id'>, value: string | number): void {
    this.newCertificate.update(cert => ({
      ...cert,
      [field]: value
    }));
  }

  async saveCertificate(): Promise<void> {
    const cert = this.newCertificate();

    if (!cert.certificateNumber || !cert.studentName || !cert.courseName || !cert.completionDate) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      await this.courseService.createCertificate(cert);
      alert('Certificado creado exitosamente.');
      this.toggleForm();
      await this.loadCertificates();
    } catch (error) {
      console.error('Error creating certificate:', error);
      alert('Error al crear el certificado.');
    }
  }

  get existingCertificatesCount(): number {
    return EXISTING_CERTIFICATES.length;
  }
}
