# 🚀 PROMPT SIMPLE - Sistema de Gestión con Login, Oficinas y CRUD

---

## 📝 PROMPT BÁSICO

```
Crea un sistema web de gestión con las siguientes pantallas y funcionalidades:

## 🔐 1. PANTALLA DE LOGIN
- Formulario con email y contraseña
- Validación de credenciales
- Botón "Iniciar Sesión"
- Logo de la empresa
- Diseño moderno con gradientes (verde y azul)
- Responsive (móvil y desktop)

## 🏢 2. PANTALLA DE SELECCIÓN DE OFICINA
- Mostrar tarjetas con las oficinas disponibles del usuario
- Cada tarjeta muestra:
  - Logo de la oficina
  - Nombre de la oficina
  - Nombre del representante
- Al hacer click en una oficina, redirige al sistema principal
- Grid responsive (1 columna en móvil, 4 en desktop)

## 📊 3. PANTALLA PRINCIPAL - GESTIÓN DE AFILIACIONES

### Navbar Superior:
- Logo de la empresa
- Menú de navegación: Oficinas | Afiliaciones | Retirados | Reportes
- Avatar del usuario con nombre
- Botón de "Salir"
- Menú hamburguesa en móvil

### Filtros y Controles:
- Selector de Mes y Año
- Barra de búsqueda global
- Selector de columnas visibles
- Botón "Nueva Afiliación" (verde, con icono +)

### Tabla de Datos:
Debe mostrar las siguientes columnas (configurables):
- Estado de Pago (selector: Pendiente/En Proceso/Pagado)
- Método de Pago
- No. Factura
- Observación
- Nombre Completo
- Cédula
- Empresa
- Teléfono(s)
- Fecha de Pago Recibido
- Fecha de Afiliación
- Valor (formato moneda COP)
- EPS, ARL, Riesgo, CCF, Fondo de Pensión
- Columna de Acciones

### Acciones por Fila:
- Botón Editar (azul, icono lápiz)
- Botón Eliminar (rojo, icono basura)
- Botón Generar Factura (verde, icono documento) - si no tiene factura
- Botón Ver Factura (morado, icono descarga) - si ya tiene factura

### Características de la Tabla:
- Paginación (10 items por página)
- Búsqueda en tiempo real
- Filtros por columna
- Ordenamiento por columnas
- Filas con hover effect
- Colores alternados (zebra striping)
- Scroll horizontal en móvil
- Badges de colores para estados

## 📝 4. MODAL DE CREAR/EDITAR AFILIACIÓN

Formulario con los siguientes campos (en grid de 2 columnas):
- Empresa (select)
- Nombre Completo (input text)
- Identificación (input text)
- Teléfono (input tel)
- Valor de Afiliación (input number)
- EPS (select)
- ARL (select)
- Nivel de Riesgo (select: I, II, III, IV, V)
- CCF (select)
- Fondo de Pensión (select)
- Método de Pago (select)
- Observaciones (textarea, 2 columnas)
- Fecha de Pago Recibido (date)
- Fecha Registro Gubernamental (date)

Botones:
- Cancelar (rojo)
- Guardar (verde)

Validaciones:
- Campos obligatorios marcados
- Validación en tiempo real
- Mensajes de error claros

## 🚪 5. PANTALLA DE RETIRADOS/DESAFILIACIONES

Similar a la pantalla de afiliaciones pero con columnas adicionales:
- Razón de Retiro
- Costo del Retiro
- Estado de Pago del Retiro (selector)
- Fecha de Pago del Retiro
- Usuario que Desafilió
- Fecha de Inactivación

Acciones:
- Editar datos del retiro
- Ver factura asociada

## 📈 6. PANTALLA DE REPORTES

Selector de tipo de reporte:
- Pagos del Día
- Reporte Mensual
- Subir Afiliaciones Masivas

### Reporte de Pagos del Día:
- Selector de fecha
- Selector de oficina
- Dos tablas:
  - Usuarios Nuevos (afiliaciones del día)
  - Usuarios Antiguos (pagos del día)
- Totales por tabla
- Exportación a Excel

### Reporte Mensual:
- Selector de año
- Gráfico de barras apiladas
- Muestra ingresos por mes
- Diferencia entre afiliaciones nuevas y antiguas
- Totales sobre las barras
- Formato de moneda colombiana

---

## 🎨 DISEÑO Y ESTILOS

### Colores:
- Primary: Verde esmeralda (#10b981)
- Secondary: Azul cielo (#0ea5e9)
- Success: Verde (#22c55e)
- Warning: Amarillo (#f59e0b)
- Danger: Rojo (#ef4444)
- Neutral: Grises (#f1f5f9 a #1e293b)

### Tipografía:
- Fuente: Roboto (Google Fonts)
- Tamaños: 12px (tabla), 14px (texto), 16px (inputs), 24px (títulos)

### Componentes:
- Botones con border-radius redondeado
- Inputs con border y focus ring
- Modales con backdrop blur
- Badges con colores según estado
- Animación fade-in al cargar páginas
- Hover effects en botones y filas
- Sombras sutiles en cards y modales

### Responsive:
- Mobile-first
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Navbar con menú hamburguesa en móvil
- Tabla con scroll horizontal en móvil
- Grid adaptable (1 col móvil, 2-4 desktop)

---

## 🔧 TECNOLOGÍAS SUGERIDAS

### Opción 1 - Moderna (Recomendada):
- **Frontend**: Next.js 14 + TypeScript
- **Estilos**: TailwindCSS + Shadcn/UI
- **Formularios**: React Hook Form + Zod
- **Tablas**: TanStack Table
- **Gráficos**: Recharts
- **Notificaciones**: Sonner
- **Backend**: Next.js API Routes + Prisma
- **Base de Datos**: PostgreSQL

### Opción 2 - Actual (Como el proyecto):
- **Frontend**: React + TypeScript + Vite
- **Estilos**: TailwindCSS
- **Routing**: React Router DOM
- **State**: Context API + TanStack Query
- **Notificaciones**: SweetAlert2
- **Gráficos**: Nivo
- **Backend**: API REST separada

---

## 📋 FLUJO DE USUARIO

1. Usuario abre la app → Pantalla de Login
2. Ingresa credenciales → Valida con backend
3. Si es válido → Pantalla de Selección de Oficina
4. Selecciona oficina → Carga datos de esa oficina
5. Redirige a → Pantalla Principal (Tabla de Afiliaciones)
6. Usuario puede:
   - Ver todas las afiliaciones del mes actual
   - Buscar por cualquier campo
   - Filtrar por mes/año
   - Crear nueva afiliación (modal)
   - Editar afiliación existente (modal)
   - Eliminar afiliación (confirmación)
   - Generar factura
   - Ver/descargar factura PDF
   - Cambiar estado de pago (selector inline)
7. Navegar a Retirados → Ver desafiliaciones
8. Navegar a Reportes → Ver estadísticas y gráficos
9. Cerrar sesión → Vuelve al Login

---

## ✅ FUNCIONALIDADES CLAVE

### CRUD Completo:
- ✅ **Create**: Modal con formulario completo
- ✅ **Read**: Tabla con paginación y filtros
- ✅ **Update**: Modal de edición + actualización inline de estado
- ✅ **Delete**: Soft delete con registro de motivo

### Filtros Avanzados:
- ✅ Búsqueda global (busca en todas las columnas)
- ✅ Búsqueda por columna específica
- ✅ Filtro por mes y año
- ✅ Selector de columnas visibles

### Facturación:
- ✅ Generación automática de factura
- ✅ Numeración consecutiva
- ✅ Descarga de PDF
- ✅ Estados: Emitida, Anulada, Reemplazada

### Reportes:
- ✅ Reporte diario (nuevos + pagos del día)
- ✅ Reporte mensual (gráfico de barras)
- ✅ Filtros por fecha y oficina
- ✅ Exportación a Excel

### UX:
- ✅ Feedback visual en todas las acciones
- ✅ Confirmaciones antes de eliminar
- ✅ Loading states (spinners)
- ✅ Mensajes de error descriptivos
- ✅ Animaciones suaves
- ✅ Responsive en todos los dispositivos

---

## 🎯 RESULTADO ESPERADO

Un sistema web profesional que permita:
1. **Autenticación segura** de usuarios
2. **Gestión multi-oficina** (cada usuario puede tener varias oficinas)
3. **CRUD completo** de afiliaciones con tabla avanzada
4. **Facturación automática** con generación de PDF
5. **Gestión de desafiliaciones** con registro de motivos
6. **Reportes visuales** con gráficos interactivos
7. **Interfaz moderna y responsive** que funcione en móvil y desktop
8. **Experiencia de usuario fluida** con feedback inmediato

---

## 📦 ENTREGABLES

- ✅ Código fuente completo
- ✅ README con instrucciones de instalación
- ✅ Variables de entorno (.env.example)
- ✅ Base de datos configurada (schema)
- ✅ Sistema funcional y desplegable

---

## ⏱️ TIEMPO ESTIMADO

- **Setup inicial**: 1 día
- **Login + Selección de Oficina**: 2 días
- **Tabla CRUD + Modales**: 5 días
- **Facturación**: 2 días
- **Desafiliaciones**: 2 días
- **Reportes**: 3 días
- **Testing y ajustes**: 2 días
- **TOTAL**: ~15-20 días (1 desarrollador)

---

## 🚀 EJEMPLO DE USO DEL PROMPT

Copia y pega esto en ChatGPT, Claude, o cualquier IA:

```
Necesito que crees un sistema web de gestión de afiliaciones con:

1. Pantalla de login (email/contraseña)
2. Pantalla de selección de oficina (grid de tarjetas)
3. Pantalla principal con tabla CRUD de afiliaciones
4. Modales para crear/editar registros
5. Sistema de facturación (generar y descargar PDF)
6. Pantalla de desafiliaciones
7. Pantalla de reportes con gráficos

Tecnologías: Next.js 14, TypeScript, TailwindCSS, Shadcn/UI, Prisma, PostgreSQL

La tabla debe tener: nombre, cédula, empresa, teléfono, valor, EPS, ARL, 
estado de pago (selector), fecha de pago, fecha de afiliación, acciones 
(editar, eliminar, generar factura).

Debe tener filtros por mes/año, búsqueda global, paginación, y columnas 
configurables.

Diseño moderno con colores verde esmeralda y azul cielo, responsive, 
con animaciones suaves.
```

---

**¡Listo para usar! 🎉**
```

---

## 💡 TIPS PARA USAR EL PROMPT

1. **Copia el prompt completo** o la versión corta del final
2. **Pégalo en tu IA favorita** (ChatGPT, Claude, Gemini)
3. **Especifica las tecnologías** que prefieres
4. **Pide que genere paso a paso** (primero login, luego tabla, etc.)
5. **Itera y mejora** según tus necesidades específicas

---

## 🎨 VARIANTES DEL PROMPT

### Ultra Corto (1 párrafo):
```
Crea un sistema web con login, selección de oficina, y tabla CRUD para 
gestión de afiliaciones. Debe tener modales para crear/editar, sistema 
de facturación PDF, pantalla de desafiliaciones, y reportes con gráficos. 
Tecnologías: Next.js, TypeScript, TailwindCSS, Shadcn/UI. Diseño moderno 
verde y azul, responsive.
```

### Detallado (Para mejores resultados):
Usa el prompt completo de arriba con todas las especificaciones.

---

**Creado para facilitar la generación de sistemas de gestión empresarial** 🚀
