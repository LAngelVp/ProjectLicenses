# 🔐 Gestor y Generador Criptográfico de Licencias RSA (Angular)

Una aplicación web moderna desarrollada en **Angular** y **Angular Material** que permite la generación, gestión y firma digital de licencias de software por cliente y Hardware ID, ejecutando todo el proceso de firmado criptográfico **100% en el navegador (Client-Side)** mediante el API nativo **Web Crypto API**.

---

## 🚀 Características Principales

* **Generación Criptográfica RSA-2048:** Creación de pares de claves (pública y privada) directamente en el navegador en formato de codificación PEM (`PKCS#8` para la clave privada y `SPKI` para la clave pública).
* **Firmado Digital Seguro SHA-256:** Las licencias se firman usando la clave privada RSA, evitando cualquier posibilidad de manipulación o alteración de datos por parte del cliente.
* **Importación de Claves Existentes:** Permite cargar archivos `.pem` previamente creados para mantener una misma identidad criptográfica y reutilizar la clave privada maestra.
* **Licencias Vinculadas a Hardware ID:** Generación de un *payload* que vincula la validez del software al hardware específico del cliente y a una fecha de vencimiento limite.
* **Exportación Directa a Archivos (`.txt` y `.pem`):** Descarga automática de licencias en formato de texto plano con la nomenclatura estandarizada:
  `[NombreCliente]_[FechaCreacion]_[FechaVencimiento].txt`
* **Cero Dependencias de Servidor Backend:** Lógica criptográfica ejecutada de forma local y segura en memoria.

---

## 🛠️ Tecnologías Utilizadas

* **Framework Frontend:** [Angular](https://angular.dev/) (Componentes Standalone)
* **Librería UI:** [Angular Material](https://material.angular.dev/)
* **Criptografía:** Web Crypto API (`window.crypto.subtle`)
* **Entorno de Ejecución / Gestor de Paquetes:** [Bun](https://bun.sh/) / Node.js
* **Lenguaje:** TypeScript

---

## 📐 Estructura de la Licencia Generada

La clave de licencia que se emite sigue una arquitectura similar a un JSON Web Token (JWT) compuesta por dos partes separadas por un punto (`.`):

```text
[PAYLOAD_BASE64].[FIRMA_DIGITAL_SHA256_BASE64]