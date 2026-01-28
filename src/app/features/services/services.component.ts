import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  color: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent {
  services: Service[] = [
    {
      id: 'capacitacion',
      icon: 'education',
      title: 'Capacitación en Gestión de Riesgos',
      description: 'Programas de formación especializados que fortalecen las capacidades de tu equipo en gestión de riesgos financieros',
      features: [
        'Riesgo de Mercado, ALM y Liquidez',
        'Riesgo Cambiario',
        'Riesgo de Contraparte & Margin Calls',
        'Herramientas de Pricing',
        'Big Data y Herramientas Analíticas'
      ],
      color: '#8DC6E6'
    },
    {
      id: 'consultoria',
      icon: 'consulting',
      title: 'Consultoría Estratégica',
      description: 'Asesoría especializada para optimizar la gestión integral de riesgos en tu organización',
      features: [
        'Validación de Modelos',
        'Gobierno y Gestión de Riesgos',
        'Matrices de Riesgos y Controles',
        'Implementación de Herramientas'
      ],
      color: '#6BA8CC'
    },
    {
      id: 'desarrollo',
      icon: 'development',
      title: 'Desarrollo de Software',
      description: 'Soluciones tecnológicas personalizadas y escalables para la gestión de riesgos',
      features: [
        'Gestión del Riesgo de Mercado',
        'Gestión del Riesgo de ALM',
        'Simuladores Financieros',
        'Desarrollos Inhouse'
      ],
      color: '#FF8C42'
    }
  ];
}