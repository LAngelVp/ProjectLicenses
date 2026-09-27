import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoLicenciaService {
  private keyPair: { privateKey: CryptoKey; publicKey?: CryptoKey } | null = null;

  // 1. Generar Nuevas Claves RSA-2048
  async generarClavesRSA(): Promise<{ privada: string; publica: string }> {
    const pair = await window.crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: 'SHA-256'
      },
      true,
      ['sign', 'verify']
    );

    this.keyPair = pair;

    const privadaPEM = await this.exportKeyToPEM(pair.privateKey, 'PRIVATE KEY');
    const publicaPEM = await this.exportKeyToPEM(pair.publicKey, 'PUBLIC KEY');

    return { privada: privadaPEM, publica: publicaPEM };
  }

  // 2. Cargar un archivo "licencia_privada.pem" existente
  async cargarClavePrivadaPEM(pemTexto: string): Promise<boolean> {
    try {
      const pemLimpio = pemTexto
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\s+/g, '');

      const binaryDerString = atob(pemLimpio);
      const binaryDer = new Uint8Array(binaryDerString.length);
      for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
      }

      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        binaryDer.buffer,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256'
        },
        false,
        ['sign']
      );

      this.keyPair = { privateKey };
      return true;
    } catch (error) {
      console.error('Error al importar la clave privada:', error);
      throw new Error('El archivo no es una clave privada PEM válida (PKCS#8).');
    }
  }

  // 3. Generar y Firmar Licencia Criptográfica
  async generarLicencia(cliente: string, hardwareId: string, vencimiento: string): Promise<{ claveLicencia: string; nombreArchivo: string }> {
    if (!this.keyPair || !this.keyPair.privateKey) {
      throw new Error('No hay ninguna clave privada cargada en el sistema.');
    }

    const payload = {
      cliente: cliente.trim(),
      hardware_id: hardwareId.trim().toUpperCase(),
      vencimiento: vencimiento.trim()
    };

    const payloadJsonText = JSON.stringify(payload);
    const payloadBase64 = btoa(unescape(encodeURIComponent(payloadJsonText)));

    const encoder = new TextEncoder();
    const dataToSign = encoder.encode(payloadBase64);

    const signatureBuffer = await window.crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      this.keyPair.privateKey,
      dataToSign
    );

    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const firmaBase64 = btoa(String.fromCharCode(...signatureArray));

    const claveLicencia = `${payloadBase64}.${firmaBase64}`;

    const fechaCreacion = new Date().toISOString().split('T')[0];
    const clienteLimpio = cliente.trim().replace(/[^a-zA-Z0-9]/g, '_');
    const nombreArchivo = `${clienteLimpio}_${fechaCreacion}_${vencimiento}.txt`;

    return { claveLicencia, nombreArchivo };
  }

  // Utilidades
  private async exportKeyToPEM(key: CryptoKey, label: string): Promise<string> {
    const format = key.type === 'private' ? 'pkcs8' : 'spki';
    const exported = await window.crypto.subtle.exportKey(format, key);
    const exportedArray = Array.from(new Uint8Array(exported));
    const base64 = btoa(String.fromCharCode(...exportedArray));

    const pemHeader = `-----BEGIN ${label}-----\n`;
    const pemFooter = `\n-----END ${label}-----`;
    const pemBody = base64.match(/.{1,64}/g)?.join('\n') || '';

    return pemHeader + pemBody + pemFooter;
  }

  descargarArchivo(nombreArchivo: string, contenido: string) {
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  tieneClaveActiva(): boolean {
    return !!this.keyPair?.privateKey;
  }
}