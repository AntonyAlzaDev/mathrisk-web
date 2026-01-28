import { Component, OnDestroy, OnInit, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

interface Service {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

interface Client {
  name: string;
  logo: string;
}

interface Stat {
  value: string;
  label: string;
  suffix?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  // Carousel
  currentSlide = 0;
  private autoPlayInterval?: ReturnType<typeof setInterval>;
  private readonly AUTO_PLAY_DELAY = 5000;
  
  // Parallax effect
  scrollY = 0;
  
  // Platform check
  private isBrowser: boolean;

  // Stats animados
  stats: Stat[] = [
    { value: '15', label: 'Años de experiencia', suffix: '+' },
    { value: '50', label: 'Clientes satisfechos', suffix: '+' },
    { value: '200', label: 'Proyectos completados', suffix: '+' },
    { value: '98', label: 'Tasa de satisfacción', suffix: '%' }
  ];

  services: Service[] = [
    {
      icon: 'education',
      title: 'Capacitación en Gestión de Riesgos',
      description: 'Programas de formación especializados que fortalecen las capacidades de tu equipo',
      features: [
        'Riesgo de Mercado, ALM y Liquidez',
        'Riesgo Cambiario',
        'Riesgo de Contraparte & Margin Calls',
        'Herramientas de Pricing',
        'Big Data y Herramientas Analíticas'
      ]
    },
    {
      icon: 'consulting',
      title: 'Consultoría Estratégica',
      description: 'Asesoría especializada para optimizar la gestión integral de riesgos',
      features: [
        'Validación de Modelos',
        'Gobierno y Gestión de Riesgos',
        'Matrices de Riesgos y Controles',
        'Implementación de Herramientas'
      ]
    },
    {
      icon: 'development',
      title: 'Desarrollo de Software',
      description: 'Soluciones tecnológicas personalizadas y escalables',
      features: [
        'Gestión del Riesgo de Mercado',
        'Gestión del Riesgo de ALM',
        'Simuladores Financieros',
        'Desarrollos Inhouse'
      ]
    }
  ];

  clients: Client[] = [
    {
      name: 'Banco de la Nación',
      logo: '/assets/images/clients/logo-bn.png'
    },
    {
      name: 'InSur',
      logo: '/assets/images/clients/logoInsur.png'
    },
    {
      name: 'Primax',
      logo: '/assets/images/clients/logoPrimax.png'
    },
    {
      name: 'Mambrino',
      logo: '/assets/images/clients/logoMambrino.jpg'
    }
  ];

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private meta: Meta,
    private title: Title
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.setupSEO();
    
    if (this.isBrowser) {
      this.initAnimations();
      this.startAutoPlay();
      this.preloadImages();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.isBrowser) {
      this.scrollY = window.scrollY;
    }
  }

  // Carousel methods
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.clients.length;
    this.resetAutoPlay();
  }

  previousSlide(): void {
    this.currentSlide = this.currentSlide === 0 
      ? this.clients.length - 1 
      : this.currentSlide - 1;
    this.resetAutoPlay();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetAutoPlay();
  }

  private startAutoPlay(): void {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.AUTO_PLAY_DELAY);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  private resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  // Animations
  private initAnimations(): void {
    if (!this.isBrowser) return;

    // Intersection Observer para animaciones al scroll
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.15,
      rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          
          // Animar números si es una stat
          if (entry.target.classList.contains('stat-value')) {
            this.animateNumber(entry.target as HTMLElement);
          }
          
          // Desconectar después de animar
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observar todos los elementos animables
    setTimeout(() => {
      const elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in, .stat-value');
      elements.forEach((el) => observer.observe(el));
    }, 100);
  }

  private animateNumber(element: HTMLElement): void {
    const target = parseInt(element.getAttribute('data-target') || '0');
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target.toString();
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current).toString();
      }
    }, 16);
  }

  // SEO Optimization
  private setupSEO(): void {
    this.title.setTitle('MathRisk Solution | Gestión Integral de Riesgos Financieros');
    
    this.meta.updateTag({ 
      name: 'description', 
      content: 'Soluciones especializadas en gestión de riesgos financieros, modelado avanzado, consultoría estratégica y desarrollo de software. Más de 15 años transformando la gestión de riesgos.' 
    });

    this.meta.updateTag({ 
      name: 'keywords', 
      content: 'gestión de riesgos, riesgo financiero, riesgo de mercado, ALM, consultoría financiera, software financiero, modelado de riesgos, capacitación financiera' 
    });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: 'MathRisk Solution | Gestión Integral de Riesgos Financieros' });
    this.meta.updateTag({ property: 'og:description', content: 'Transformamos la gestión de riesgos financieros con soluciones innovadoras y tecnología de punta' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://mathrisksolution.com' });
    this.meta.updateTag({ property: 'og:image', content: 'https://mathrisksolution.com/assets/images/og-image.jpg' });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: 'MathRisk Solution | Gestión Integral de Riesgos Financieros' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Soluciones especializadas en gestión de riesgos financieros' });

    // Structured Data (JSON-LD)
    if (this.isBrowser) {
      this.addStructuredData();
    }
  }

  private addStructuredData(): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'MathRisk Solution',
      'url': 'https://mathrisksolution.com',
      'logo': 'https://mathrisksolution.com/assets/images/logo.png',
      'description': 'Soluciones integrales para la gestión de Riesgos Financieros y de Mercado',
      'address': {
        '@type': 'PostalAddress',
        'addressCountry': 'PE'
      },
      'sameAs': [
        'https://www.linkedin.com/company/mathrisk-solution'
      ]
    });
    document.head.appendChild(script);
  }

  // Performance optimization
  private preloadImages(): void {
    this.clients.forEach(client => {
      const img = new Image();
      img.src = client.logo;
    });
  }

  // Parallax effect getter
  getParallaxTransform(): string {
    return `translateY(${this.scrollY * 0.3}px)`;
  }
}