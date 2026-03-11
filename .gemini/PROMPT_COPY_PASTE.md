# 🎯 PROMPT COPY-PASTE DIRECTO

---

## 📋 VERSIÓN PARA COPIAR Y PEGAR

```
Necesito que crees un sistema web de gestión con estas pantallas:

1️⃣ PANTALLA DE LOGIN
- Formulario con email y contraseña
- Logo de la empresa
- Botón "Iniciar Sesión"
- Diseño moderno con degradado verde y azul

2️⃣ PANTALLA DE SELECCIÓN DE OFICINA
- Mostrar tarjetas en grid con las oficinas del usuario
- Cada tarjeta tiene: logo, nombre de oficina, nombre del representante
- Al hacer click, entra al sistema de esa oficina

3️⃣ PANTALLA PRINCIPAL (LA MÁS IMPORTANTE)

Navbar arriba con:
- Logo
- Menú: Oficinas | Afiliaciones | Retirados | Reportes
- Nombre de usuario
- Botón Salir

Controles de la página:
- Selector de mes y año
- Barra de búsqueda
- Botón para mostrar/ocultar columnas
- Botón verde "Nueva Afiliación"

TABLA con estas columnas:
- Estado de Pago (dropdown: Pendiente/En Proceso/Pagado)
- Método de Pago
- No. Factura
- Nombre Completo
- Cédula
- Empresa
- Teléfono
- Fecha de Pago
- Fecha de Afiliación
- Valor (en pesos colombianos)
- EPS, ARL, Riesgo, CCF, Fondo de Pensión
- Acciones (botones: Editar, Eliminar, Generar Factura, Ver Factura)

La tabla debe tener:
- Paginación (10 por página)
- Búsqueda que funcione en tiempo real
- Poder ordenar por cualquier columna
- Colores alternados en las filas
- Efecto hover
- Responsive (scroll horizontal en móvil)

4️⃣ MODAL PARA CREAR/EDITAR

Formulario en 2 columnas con:
- Empresa (select)
- Nombre Completo
- Cédula
- Teléfono
- Valor
- EPS (select)
- ARL (select)
- Riesgo (select: I, II, III, IV, V)
- CCF (select)
- Fondo de Pensión (select)
- Método de Pago (select)
- Observaciones (textarea, ocupa 2 columnas)
- Fecha de Pago
- Fecha de Afiliación

Botones: Cancelar (rojo) y Guardar (verde)

5️⃣ PANTALLA DE RETIRADOS
- Igual que la tabla principal pero con columnas extra:
  - Razón del retiro
  - Costo del retiro
  - Estado de pago del retiro
  - Fecha de pago del retiro
  - Quién lo desafilió

6️⃣ PANTALLA DE REPORTES
- Selector para elegir tipo de reporte
- Reporte de pagos del día (con filtro de fecha y oficina)
- Reporte mensual (gráfico de barras con ingresos por mes)

TECNOLOGÍAS:
- Next.js 14 con TypeScript
- TailwindCSS para estilos
- Shadcn/UI para componentes
- Prisma + PostgreSQL para base de datos

DISEÑO:
- Colores: verde esmeralda y azul cielo
- Fuente: Roboto
- Bordes redondeados
- Sombras suaves
- Animaciones smooth
- Responsive (funciona en móvil y desktop)

IMPORTANTE:
- Todos los formularios deben validar campos
- Mostrar mensajes de confirmación al guardar/eliminar
- Loading spinners cuando carga datos
- Mensajes de error claros
- La tabla debe poder exportar a Excel
- Las facturas se generan en PDF

¿Puedes empezar creando la estructura del proyecto y la pantalla de login?
```

---

## 🚀 VERSIÓN ULTRA CORTA (1 PÁRRAFO)

```
Crea un sistema web con: 1) Login (email/contraseña), 2) Selección de oficina 
(grid de tarjetas), 3) Tabla CRUD de afiliaciones con columnas: nombre, cédula, 
empresa, teléfono, valor, EPS, ARL, estado de pago, fechas, y acciones 
(editar/eliminar/factura). Los formularios van en modales. Incluye pantalla de 
retirados y reportes con gráficos. Tech stack: Next.js 14, TypeScript, TailwindCSS, 
Shadcn/UI, Prisma, PostgreSQL. Diseño moderno verde y azul, responsive.
```

---

## 💬 VERSIÓN CONVERSACIONAL

```
Hola! Necesito tu ayuda para crear un sistema de gestión.

Es para manejar afiliaciones a seguridad social. El flujo es así:

1. El usuario entra y ve un login bonito con el logo de la empresa
2. Después de loguearse, ve las oficinas que tiene asignadas (en tarjetas)
3. Selecciona una oficina y entra al sistema principal

En el sistema principal hay una tabla grande con todas las afiliaciones.
La tabla debe tener búsqueda, filtros por mes/año, paginación, y poder 
mostrar/ocultar columnas.

Las columnas son: nombre, cédula, empresa, teléfono, valor, EPS, ARL, 
estado de pago, fechas, etc.

Cada fila tiene botones para:
- Editar (abre un modal con formulario)
- Eliminar (pide confirmación)
- Generar factura (crea un PDF)
- Ver factura (descarga el PDF)

También necesito:
- Una pantalla para ver los retirados (desafiliaciones)
- Una pantalla de reportes con gráficos

Tecnologías: Next.js, TypeScript, TailwindCSS, Shadcn/UI

El diseño debe ser moderno, con colores verde y azul, y funcionar bien 
en móvil y computadora.

¿Me ayudas a crearlo paso a paso?
```

---

## 🎨 VERSIÓN CON ÉNFASIS EN DISEÑO

```
Crea un sistema de gestión empresarial MODERNO Y PROFESIONAL con:

🔐 LOGIN ELEGANTE:
- Formulario centrado con sombra
- Logo grande arriba
- Inputs con iconos (usuario y candado)
- Botón con gradiente verde-azul
- Fondo con patrón sutil

🏢 SELECCIÓN DE OFICINA VISUAL:
- Grid de tarjetas (1 en móvil, 4 en desktop)
- Cada tarjeta con:
  - Logo de la oficina (grande)
  - Nombre en negrita
  - Representante en gris
  - Hover effect (sombra + scale)

📊 TABLA PROFESIONAL:
- Header sticky con fondo azul
- Filas con zebra striping (gris claro/blanco)
- Badges de colores para estados:
  - Pendiente: amarillo
  - En Proceso: azul
  - Pagado: verde
- Botones de acción con iconos
- Paginación moderna abajo
- Barra de búsqueda con icono de lupa
- Filtros con dropdowns elegantes

📝 MODALES LIMPIOS:
- Backdrop con blur
- Formulario en grid 2 columnas
- Labels en negrita
- Inputs con border y focus ring azul
- Botones grandes abajo (Cancelar izq, Guardar der)

🎨 PALETA:
- Primary: #10b981 (verde esmeralda)
- Secondary: #0ea5e9 (azul cielo)
- Success: #22c55e
- Danger: #ef4444
- Neutral: grises (#f1f5f9 a #1e293b)

✨ ANIMACIONES:
- Fade in al cargar páginas (0.3s)
- Hover en botones (scale 1.05)
- Transiciones suaves (200ms)
- Loading spinners cuando carga

Tech: Next.js 14, TypeScript, TailwindCSS, Shadcn/UI
```

---

## 🎯 VERSIÓN ENFOCADA EN FUNCIONALIDAD

```
Sistema de gestión con estas funcionalidades CLAVE:

✅ AUTENTICACIÓN:
- Login con JWT
- Sesión persistente
- Logout seguro

✅ MULTI-OFICINA:
- Usuario puede tener varias oficinas
- Selecciona con cuál trabajar
- Datos filtrados por oficina

✅ CRUD COMPLETO:
- Crear: Modal con formulario validado
- Leer: Tabla con paginación y búsqueda
- Actualizar: Modal de edición + cambio inline de estado
- Eliminar: Soft delete con confirmación

✅ TABLA AVANZADA:
- 20+ columnas (configurables)
- Búsqueda global en tiempo real
- Filtros por mes/año
- Ordenamiento por columna
- Paginación (10/25/50 items)
- Exportar a Excel
- Responsive

✅ FACTURACIÓN:
- Generar factura automática
- Numeración consecutiva
- Descargar PDF
- Estados: Emitida/Anulada/Reemplazada

✅ DESAFILIACIONES:
- Registro de motivo
- Costo de retiro
- Estado de pago
- Historial completo

✅ REPORTES:
- Pagos del día (filtros por fecha/oficina)
- Reporte mensual (gráfico de barras)
- Exportación a Excel

✅ UX:
- Feedback en todas las acciones
- Confirmaciones antes de eliminar
- Loading states
- Mensajes de error claros
- Responsive (móvil + desktop)

Stack: Next.js 14, TypeScript, TailwindCSS, Shadcn/UI, Prisma, PostgreSQL
```

---

## 📱 VERSIÓN CON EJEMPLOS VISUALES

```
Crea un sistema así:

LOGIN (como Vercel/Linear):
┌─────────────────────────┐
│       [LOGO]            │
│                         │
│  ┌─────────────────┐   │
│  │ 📧 Email        │   │
│  └─────────────────┘   │
│  ┌─────────────────┐   │
│  │ 🔒 Password     │   │
│  └─────────────────┘   │
│                         │
│  [Iniciar Sesión]      │
└─────────────────────────┘

SELECCIÓN DE OFICINA:
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ Logo │ │ Logo │ │ Logo │ │ Logo │
│Office│ │Office│ │Office│ │Office│
│Rep.  │ │Rep.  │ │Rep.  │ │Rep.  │
└──────┘ └──────┘ └──────┘ └──────┘

TABLA PRINCIPAL:
┌────────────────────────────────────────┐
│ [Buscar...] [Mes▼] [Año▼] [+ Nueva]  │
├────────────────────────────────────────┤
│ Estado│Nombre│Cédula│Empresa│Acciones│
├────────────────────────────────────────┤
│ 🟢    │Juan  │123   │ABC    │✏️🗑️📄 │
│ 🟡    │María │456   │XYZ    │✏️🗑️📄 │
│ 🔵    │Pedro │789   │DEF    │✏️🗑️📄 │
├────────────────────────────────────────┤
│        ◀ 1 2 3 4 5 ▶                  │
└────────────────────────────────────────┘

MODAL:
┌─────────────────────────────┐
│ Editar Afiliación      [X]  │
├─────────────────────────────┤
│ Empresa:    [Select▼]       │
│ Nombre:     [________]      │
│ Cédula:     [________]      │
│ Teléfono:   [________]      │
│ ...                         │
├─────────────────────────────┤
│        [Cancelar] [Guardar] │
└─────────────────────────────┘

Tech: Next.js 14, TypeScript, TailwindCSS, Shadcn/UI
```

---

## 🎓 PARA USAR CON IA

**Copia cualquiera de las versiones de arriba y pégala en:**
- ChatGPT (GPT-4)
- Claude (Sonnet/Opus)
- Gemini
- Cursor AI
- GitHub Copilot Chat
- Windsurf
- Bolt.new

**Luego pide:**
- "Genera el código paso a paso"
- "Empieza por la estructura del proyecto"
- "Crea primero el login"
- "Ahora la tabla con todos los filtros"
- etc.

---

## ✅ CHECKLIST PARA VERIFICAR

El sistema debe tener:
- [ ] Login funcional
- [ ] Selección de oficina
- [ ] Tabla con CRUD completo
- [ ] Búsqueda en tiempo real
- [ ] Filtros por mes/año
- [ ] Paginación
- [ ] Modales para crear/editar
- [ ] Confirmación al eliminar
- [ ] Generación de facturas PDF
- [ ] Pantalla de retirados
- [ ] Pantalla de reportes
- [ ] Navbar responsive
- [ ] Diseño moderno
- [ ] Funciona en móvil

---

**¡Listo para copiar y pegar! 🚀**

Elige la versión que más te guste y úsala directamente.
