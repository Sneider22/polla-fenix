# 🎯 Sistema de Polla de Animalitos El Fenix

Una aplicación web completa para gestionar y mostrar apuestas de animales con sistema de ganadores personalizable y ordenamiento inteligente.

## ✨ Características Principales

- **Importación desde Excel/CSV**: Soporte para archivos .xlsx, .xls y .csv
- **Selección manual de ganadores**: Elige exactamente qué números serán ganadores
- **Cantidad personalizable**: Selecciona de 1 a 10 números ganadores
- **Ganadores estrictos**: Solo son ganadores quienes tienen TODOS los números seleccionados
- **Ordenamiento inteligente**: Los ganadores completos aparecen primero
- **Estadísticas en tiempo real**: Muestra cantidad de ganadores, premio total y jugadas
- **Diseño responsivo**: Funciona perfectamente en móviles y escritorio
- **Persistencia de datos**: Guarda automáticamente en el navegador
- **Interfaz moderna**: Diseño limpio y profesional

## 📊 Formato del Archivo de Datos

Tu archivo Excel o CSV debe tener el siguiente formato:

| A (Número) | B (Nombre) | C (Animal 1) | D (Animal 2) | E (Animal 3) | F (Animal 4) | G (Animal 5) | H (Animal 6) |
|------------|------------|--------------|--------------|--------------|--------------|--------------|--------------|
| 1          | Juan Pérez | 5            | 12           | 23           | 30           | 00           | 15           |
| 2          | María García| 8            | 19           | 27           | 33           | 7            | 22           |
| 3          | Carlos López| 3            | 11           | 25           | 36           | 14           | 29           |

### 📋 Reglas de Formato:

- **Columna A**: Número de jugador (entero)
- **Columna B**: Nombre del jugador (texto)
- **Columnas C-H**: Números de animales (0-36, 00)
- **Números válidos**: 0, 1, 2, 3, ..., 36, 00
- **Máximo 6 animales** por jugador
- **Encabezados opcionales**: La primera fila puede contener títulos

## 🚀 Cómo Usar la Aplicación

### 1. **Abrir la Aplicación**
- Abre el archivo `index.html` en tu navegador web
- No requiere instalación ni servidor

### 2. **Importar Datos**
- Haz clic en **"Seleccionar Archivo"**
- Elige tu archivo Excel (.xlsx, .xls) o CSV (.csv)
- Haz clic en **"Importar Datos"**
- Verás la lista de jugadores cargada

### 3. **Seleccionar Números Ganadores**
- Haz clic en **"Seleccionar Números Ganadores"**
- En el modal que aparece:
  - **Elige la cantidad** de números ganadores (1-10)
  - **Haz clic en "Actualizar"** para aplicar el cambio
  - **Selecciona los números** que quieres que sean ganadores
  - **Confirma la selección**

### 4. **Ver Resultados**
- Los jugadores se reordenan automáticamente
- Los ganadores completos aparecen primero
- Se muestran badges con aciertos (ej: "5/5 aciertos")
- Las posiciones (1°, 2°, 3°) aparecen para ganadores

## 🎯 Sistema de Ganadores

### **Regla Estricta de Ganadores:**
- **Solo son ganadores** quienes tienen TODOS los números seleccionados
- **Ejemplo**: Si seleccionas 5 números, solo ganan quienes tienen esos 5 exactos

### **Ordenamiento Inteligente:**
1. **Ganadores completos** (todos los números) - Primero
2. **Jugadores con aciertos parciales** - Ordenados por cantidad de aciertos
3. **Jugadores sin aciertos** - Al final

### **Indicadores Visuales:**
- 🥇 **1° lugar**: Fondo dorado + posición
- 🥈 **2° lugar**: Fondo dorado + posición  
- 🥉 **3° lugar**: Fondo dorado + posición
- ✅ **Badge de aciertos**: Muestra "X/Y aciertos"
- 🟢 **Números ganadores**: Resaltados en verde

## 📱 Panel de Control

### **Estadísticas Superiores:**
- **Cantidad de Ganadores**: Solo ganadores completos
- **Premios a Repartir**: Premio por ganador
- **Premio Total**: Premio total del sorteo

### **Controles de Datos:**
- **Seleccionar Archivo**: Importar datos
- **Importar Datos**: Procesar archivo
- **Limpiar Datos**: Borrar todo
- **Seleccionar Números Ganadores**: Elegir ganadores

### **Tabla de Jugadores:**
- **Columna POS**: Posición de ganadores (1°, 2°, 3°)
- **Columna #**: Número de jugador
- **Columna NOMBRE**: Nombre + badge de aciertos
- **Columnas N°1-N°6**: Números de animales

## 💾 Persistencia de Datos

- **Guardado automático**: Los datos se guardan en el navegador
- **Persistencia**: Al recargar la página, todo se mantiene
- **Datos guardados**: Jugadores, números ganadores, estadísticas

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos y responsivos
- **JavaScript ES6+**: Funcionalidad avanzada
- **SheetJS**: Lectura de archivos Excel/CSV
- **LocalStorage**: Persistencia de datos
- **Grid/Flexbox**: Layout moderno

## 📱 Diseño Responsivo

- **Escritorio**: Interfaz completa con todas las funciones
- **Tablet**: Adaptación automática del layout
- **Móvil**: Interfaz optimizada para pantallas pequeñas
- **Navegadores**: Compatible con Chrome, Firefox, Safari, Edge

## 🔧 Personalización

### **Modificar Premio:**
```javascript
// En app.js, línea donde dice:
const PREMIO_POR_JUGADA = 30; // Cambia este valor
```

### **Cambiar Colores:**
```css
/* En style.css, modifica las variables de color */
.winner-row { background-color: #tu-color; }
.hits-badge { background-color: #tu-color; }
```

### **Ajustar Cantidad Máxima:**
```javascript
// En el HTML del modal, cambia:
<input type="number" id="number-count" min="1" max="10" value="6">
```

## 🚨 Solución de Problemas

### **No se pueden importar archivos:**
1. Verifica el formato del archivo
2. Asegúrate de que los números sean válidos (0-36, 00)
3. Comprueba que el archivo no esté corrupto
4. Intenta con archivos más pequeños

### **Los ganadores no aparecen:**
1. Verifica que hayas seleccionado números ganadores
2. Recuerda: solo son ganadores quienes tienen TODOS los números
3. Revisa que los números en el archivo sean correctos

### **Problemas de rendimiento:**
1. Usa archivos con menos de 1000 jugadores
2. Cierra otras pestañas del navegador
3. Actualiza el navegador a la última versión

## 📞 Soporte

### **Verificación de Datos:**
- Abre la consola del navegador (F12)
- Revisa los logs para información detallada
- Los errores se muestran con explicaciones claras

### **Formato de Archivo:**
- **Excel**: .xlsx, .xls
- **CSV**: .csv (separado por comas)
- **Codificación**: UTF-8 recomendado

---

## 🎉 ¡Disfruta del Sistema de Polla de Animalitos El Fenix!

Un sistema completo, moderno y fácil de usar para gestionar tus sorteos de animales con precisión y profesionalismo. 