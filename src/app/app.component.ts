import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CryptoLicenciaService } from './services/crypto-licencia.service';

// Angular Material Components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private fb = inject(FormBuilder);
  public cryptoService = inject(CryptoLicenciaService);
  private snackBar = inject(MatSnackBar);

  licenciaForm: FormGroup = this.fb.group({
    cliente: ['', Validators.required],
    hardwareId: ['', Validators.required],
    vencimiento: ['', Validators.required]
  });

  nombreArchivoCargado: string | null = null;
  licenciaGenerada: string | null = null;

  // 1. Opción: Generar y Descargar Claves Nuevas (.pem)
  async generarClaves() {
    try {
      const claves = await this.cryptoService.generarClavesRSA();
      this.nombreArchivoCargado = 'Claves recién generadas';

      // Descargar ambas claves
      this.cryptoService.descargarArchivo('licencia_privada.pem', claves.privada);
      this.cryptoService.descargarArchivo('licencia_publica.pem', claves.publica);

      this.snackBar.open('🔑 Claves RSA-2048 generadas y descargadas (.pem)', 'Cerrar', { duration: 4000 });
    } catch (error: any) {
      this.snackBar.open(`Error: ${error.message}`, 'Cerrar', { duration: 4000 });
    }
  }

  // 2. Opción: Cargar "licencia_privada.pem" desde la PC
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const contenido = e.target?.result as string;
        await this.cryptoService.cargarClavePrivadaPEM(contenido);
        this.nombreArchivoCargado = file.name;
        this.snackBar.open(`✅ Clave privada "${file.name}" cargada con éxito`, 'Cerrar', { duration: 4000 });
      } catch (error: any) {
        this.nombreArchivoCargado = null;
        this.snackBar.open(`Error: ${error.message}`, 'Cerrar', { duration: 4000 });
      }
    };

    reader.readAsText(file);
  }

  // 3. Generar y Descargar Licencia .txt
  async onSubmit() {
    if (this.licenciaForm.invalid) return;

    if (!this.cryptoService.tieneClaveActiva()) {
      this.snackBar.open('⚠️ Primero debes cargar o generar la clave privada.', 'Cerrar', { duration: 4000 });
      return;
    }

    try {
      const values = this.licenciaForm.value;
      const fechaObj: Date = values.vencimiento;
      const fechaFormateada = fechaObj.toISOString().split('T')[0];

      const res = await this.cryptoService.generarLicencia(
        values.cliente,
        values.hardwareId,
        fechaFormateada
      );

      this.licenciaGenerada = res.claveLicencia;
      this.cryptoService.descargarArchivo(res.nombreArchivo, res.claveLicencia);

      this.snackBar.open(`🎟️ Licencia descargada: ${res.nombreArchivo}`, 'Cerrar', { duration: 4000 });
    } catch (error: any) {
      this.snackBar.open(`Error: ${error.message}`, 'Cerrar', { duration: 4000 });
    }
  }
}