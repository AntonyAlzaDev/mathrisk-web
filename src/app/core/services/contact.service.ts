import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  collectionData, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  docData 
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable } from 'rxjs';

export interface ContactData {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  reason: string;
  message: string;
  acceptTerms: boolean;
  timestamp?: string;
  source?: string;
  status?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  contactId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly COLLECTION_NAME = 'contacts';

  constructor(
    private firestore: Firestore,
    private functions: Functions
  ) {
    console.log('ContactService inicializado correctamente');
  }

  /**
   * Envía el formulario de contacto a Firestore
   */
  async submitContact(contactData: ContactData): Promise<ContactResponse> {
    try {
      console.log('Guardando contacto en Firestore...', contactData);
      
      // 1. Preparar datos con metadata
      const contactWithMetadata = {
        ...contactData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'nuevo',
        read: false,
        archived: false
      };

      // 2. Guardar en Firestore
      const contactsCollection = collection(this.firestore, this.COLLECTION_NAME);
      const docRef = await addDoc(contactsCollection, contactWithMetadata);

      console.log('✓ Contacto guardado con ID:', docRef.id);

      // 3. Intentar enviar email (opcional - puede fallar si no hay Cloud Functions configuradas)
      try {
        await this.sendEmailNotification(contactData, docRef.id);
        console.log('✓ Email enviado');
      } catch (emailError) {
        console.warn('⚠ Email no enviado (Cloud Functions no configuradas):', emailError);
        // No lanzamos error porque el contacto ya se guardó
      }

      return {
        success: true,
        message: 'Contacto guardado exitosamente',
        contactId: docRef.id
      };

    } catch (error) {
      console.error('✗ Error guardando contacto:', error);
      throw new Error('Error al guardar el contacto en la base de datos');
    }
  }

  /**
   * Envía notificación por email usando Cloud Functions
   */
  private async sendEmailNotification(contactData: ContactData, contactId: string): Promise<void> {
    const callable = httpsCallable(this.functions, 'sendContactEmail');
    
    const emailData = {
      contactId,
      ...contactData,
      recipientEmail: 'aalza@mathrisksolution.com',
      templateType: 'new_contact'
    };

    await callable(emailData);
  }

  /**
   * Obtiene todos los contactos (solo para admin)
   */
  getContacts(limitCount: number = 50): Observable<any[]> {
    const contactsCollection = collection(this.firestore, this.COLLECTION_NAME);
    const q = query(
      contactsCollection, 
      orderBy('createdAt', 'desc'), 
      limit(limitCount)
    );
    
    return collectionData(q, { idField: 'id' });
  }

  /**
   * Obtiene un contacto específico por ID
   */
  getContactById(id: string): Observable<any> {
    const contactDoc = doc(this.firestore, `${this.COLLECTION_NAME}/${id}`);
    return docData(contactDoc, { idField: 'id' });
  }

  /**
   * Actualiza el estado de un contacto
   */
  async updateContactStatus(contactId: string, status: string): Promise<void> {
    try {
      const contactDoc = doc(this.firestore, `${this.COLLECTION_NAME}/${contactId}`);
      await updateDoc(contactDoc, {
        status,
        updatedAt: serverTimestamp()
      });
      console.log('✓ Estado actualizado');
    } catch (error) {
      console.error('✗ Error actualizando estado:', error);
      throw error;
    }
  }

  /**
   * Marca un contacto como leído
   */
  async markAsRead(contactId: string): Promise<void> {
    try {
      const contactDoc = doc(this.firestore, `${this.COLLECTION_NAME}/${contactId}`);
      await updateDoc(contactDoc, {
        read: true,
        readAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✓ Contacto marcado como leído');
    } catch (error) {
      console.error('✗ Error marcando como leído:', error);
      throw error;
    }
  }
}