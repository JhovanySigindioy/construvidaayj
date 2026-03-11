# 🚀 PROMPT PROFESIONAL PARA GENERAR SISTEMA DE GESTIÓN EMPRESARIAL MODERNO

---

## 📋 PROMPT PARA IA/DESARROLLADOR

```
Necesito que crees un SISTEMA DE GESTIÓN EMPRESARIAL MODERNO Y PROFESIONAL con las siguientes características:

## 🎯 OBJETIVO DEL SISTEMA
Desarrollar una aplicación web completa para la gestión de [DEFINIR: afiliaciones/clientes/ventas/inventario/etc.] 
con soporte multi-oficina, sistema de reportes avanzados, facturación automática y análisis de datos en tiempo real.

---

## 🏗️ STACK TECNOLÓGICO REQUERIDO

### **Frontend**
- **Framework**: Next.js 14+ (App Router, Server Components, Server Actions)
- **Lenguaje**: TypeScript 5+ (strict mode)
- **Estilos**: 
  - TailwindCSS 3.4+
  - Shadcn/UI (componentes accesibles y modernos)
  - Framer Motion (animaciones)
- **Gestión de Estado**:
  - Zustand o Jotai (estado global ligero)
  - TanStack Query v5 (server state, caching)
- **Formularios**: React Hook Form + Zod (validación)
- **Tablas**: TanStack Table v8 (tablas avanzadas)
- **Gráficos**: Recharts o Tremor (dashboards modernos)
- **Iconos**: Lucide React
- **Notificaciones**: Sonner (toast notifications)

### **Backend** (Opcional - si se requiere)
- **Runtime**: Node.js 20+ / Bun
- **Framework**: Next.js API Routes o tRPC (type-safe)
- **ORM**: Prisma 5+ (PostgreSQL/MySQL)
- **Autenticación**: NextAuth.js v5 o Clerk
- **Validación**: Zod
- **API**: RESTful o tRPC

### **Base de Datos**
- PostgreSQL 15+ (recomendado) o MySQL 8+
- Redis (caché y sesiones)

### **Infraestructura**
- **Hosting**: Vercel / Railway / AWS
- **Storage**: AWS S3 / Cloudinary (archivos)
- **CDN**: Cloudflare
- **Monitoreo**: Sentry (errores)

---

## 🔐 SISTEMA DE AUTENTICACIÓN Y AUTORIZACIÓN

### **Requisitos:**
1. **Login/Registro** con email y contraseña
2. **Autenticación con JWT** o sesiones seguras
3. **Roles de usuario**:
   - Super Admin (acceso total)
   - Admin (gestión de oficina)
   - Usuario (operaciones básicas)
   - Visualizador (solo lectura)
4. **Selector de Oficina/Sucursal** después del login
5. **Protección de rutas** según rol y permisos
6. **Sesión persistente** con refresh tokens
7. **Logout seguro** con limpieza de caché

### **Flujo de Autenticación:**
```
1. Usuario ingresa credenciales
2. Backend valida y retorna JWT + datos de usuario
3. Frontend almacena token (httpOnly cookie o localStorage)
4. Usuario selecciona oficina/sucursal de trabajo
5. Sistema carga datos específicos de la oficina
6. Acceso a dashboard y funcionalidades
```

---

## 💼 MÓDULOS Y FUNCIONALIDADES PRINCIPALES

### **1. DASHBOARD PRINCIPAL**
- **KPIs en tiempo real**:
  - Total de registros activos
  - Ingresos del mes
  - Pendientes de pago
  - Nuevos registros del día
  - Tasa de conversión/retención
- **Gráficos interactivos**:
  - Ingresos mensuales (barras/líneas)
  - Distribución por categoría (pie/donut)
  - Tendencias temporales
  - Comparativas mes vs mes
- **Acciones rápidas**: Botones para crear, buscar, reportes
- **Notificaciones**: Alertas de pagos pendientes, vencimientos

### **2. GESTIÓN DE REGISTROS (CRUD COMPLETO)**

#### **Tabla de Datos Avanzada:**
- ✅ **Columnas configurables** (mostrar/ocultar)
- ✅ **Filtros avanzados**:
  - Búsqueda global (todos los campos)
  - Búsqueda por columna específica
  - Filtros por rango de fechas
  - Filtros por estado (activo/inactivo/pendiente)
  - Filtros por categoría/tipo
  - Filtros combinados (AND/OR)
- ✅ **Ordenamiento** por cualquier columna (ASC/DESC)
- ✅ **Paginación** (10/25/50/100 items por página)
- ✅ **Selección múltiple** (checkboxes)
- ✅ **Acciones masivas**:
  - Exportar seleccionados
  - Eliminar múltiples
  - Cambiar estado en lote
  - Asignar categoría
- ✅ **Exportación de datos**:
  - Excel (.xlsx)
  - CSV
  - PDF (con formato)
- ✅ **Vistas guardadas**: Guardar configuraciones de filtros
- ✅ **Responsive**: Adaptable a móvil/tablet

#### **Columnas de Datos Sugeridas:**
```typescript
- ID (único)
- Nombre completo
- Identificación/Documento
- Empresa/Organización
- Teléfono(s) - array
- Email
- Estado (Activo/Pendiente/Inactivo)
- Fecha de registro
- Fecha de última actualización
- Valor/Monto
- Método de pago
- Observaciones
- Usuario que creó
- Factura asociada
- [Campos específicos del negocio]
```

#### **Acciones por Registro:**
- 🔵 **Ver detalles** (modal o página)
- 🟢 **Editar** (formulario completo)
- 🔴 **Eliminar** (soft delete con confirmación)
- 🟣 **Generar documento** (factura/contrato/certificado)
- 🟡 **Historial de cambios** (auditoría)
- 📧 **Enviar email/notificación**
- 📄 **Duplicar registro**

#### **Formularios de Creación/Edición:**
- **Validación en tiempo real** (Zod + React Hook Form)
- **Campos dinámicos** según tipo de registro
- **Autocompletado** en campos de selección
- **Carga de archivos** (drag & drop)
- **Vista previa** antes de guardar
- **Guardado automático** (draft)
- **Campos calculados** automáticamente

### **3. GESTIÓN DE DESAFILIACIONES/BAJAS**

#### **Funcionalidades:**
- ✅ Registro de motivo de baja
- ✅ Costo de desafiliación (si aplica)
- ✅ Estado de pago de la baja
- ✅ Fecha de baja
- ✅ Usuario que procesó la baja
- ✅ Observaciones adicionales
- ✅ Documentos asociados
- ✅ Historial completo del registro
- ✅ Posibilidad de reactivación

#### **Vista de Desafiliados:**
- Tabla similar a registros activos
- Filtros específicos (motivo, fecha, usuario)
- Estadísticas de bajas (por mes, por motivo)
- Exportación de reportes

### **4. SISTEMA DE FACTURACIÓN**

#### **Características:**
- ✅ **Generación automática** de facturas
- ✅ **Numeración consecutiva** automática
- ✅ **Estados de factura**:
  - Borrador
  - Emitida
  - Pagada
  - Anulada
  - Reemplazada
- ✅ **Plantillas personalizables** (HTML/PDF)
- ✅ **Datos de factura**:
  - Número de factura
  - Fecha de emisión
  - Fecha de vencimiento
  - Cliente/Empresa
  - Items/Conceptos
  - Subtotal, IVA, Total
  - Método de pago
  - Observaciones
- ✅ **Generación de PDF** profesional
- ✅ **Envío por email** automático
- ✅ **Descarga de PDF**
- ✅ **Anulación de facturas** (con motivo)
- ✅ **Notas de crédito**
- ✅ **Historial de facturas** por cliente

### **5. SISTEMA DE REPORTES AVANZADOS**

#### **Reportes Básicos:**

##### **A. Reporte Diario**
- Nuevos registros del día
- Pagos recibidos del día
- Filtros por oficina y fecha
- Totales y subtotales
- Exportación a Excel/PDF

##### **B. Reporte Mensual**
- Gráfico de ingresos por mes
- Comparativa con mes anterior
- Diferenciación por tipo/categoría
- Proyección de ingresos
- Tendencias

##### **C. Reporte Anual**
- Resumen ejecutivo del año
- Gráficos de tendencias
- Comparativa año vs año
- Metas vs resultados

#### **Reportes Avanzados (NUEVOS):**

##### **D. Reporte de Morosidad**
- Pagos pendientes por antigüedad
- Clasificación: 0-30, 31-60, 61-90, +90 días
- Monto total en mora
- Contactos de clientes morosos
- Acciones sugeridas
- Exportación para cobranza

##### **E. Reporte de Ingresos Proyectados**
- Predicción de ingresos (ML básico o promedio móvil)
- Basado en histórico
- Por mes, trimestre, año
- Escenarios: optimista, realista, pesimista

##### **F. Reporte de Desempeño por Usuario**
- Registros creados por empleado
- Ingresos generados por empleado
- Tiempo promedio de procesamiento
- Ranking de desempeño
- Metas individuales vs logros

##### **G. Reporte de Empresas/Clientes**
- Top 10 clientes por ingresos
- Distribución de clientes por categoría
- Clientes nuevos vs recurrentes
- Tasa de retención
- Valor de vida del cliente (LTV)

##### **H. Reporte de Retención/Churn**
- Tasa de desafiliación mensual
- Motivos principales de baja
- Análisis de cohortes
- Predicción de churn
- Estrategias de retención

##### **I. Reporte de Métodos de Pago**
- Distribución por método de pago
- Preferencias de clientes
- Tiempos de procesamiento
- Costos por método

##### **J. Reporte Comparativo**
- Mes vs mes
- Año vs año
- Oficina vs oficina
- Categoría vs categoría
- Gráficos de variación porcentual

##### **K. Reporte de Cumplimiento**
- Afiliaciones vs meta mensual
- Porcentaje de cumplimiento
- Días restantes del mes
- Proyección de cumplimiento
- Alertas de bajo rendimiento

##### **L. Reporte de Auditoría**
- Historial de cambios en registros
- Acciones por usuario
- Fechas y horas de modificaciones
- Valores anteriores vs nuevos
- Exportación para compliance

#### **Características de Reportes:**
- **Filtros dinámicos**: Fecha, oficina, usuario, categoría
- **Visualizaciones interactivas**: Hover, drill-down, zoom
- **Exportación múltiple**: Excel, PDF, CSV, PNG (gráficos)
- **Programación de reportes**: Envío automático por email
- **Dashboards personalizables**: Arrastrar y soltar widgets
- **Comparativas**: Períodos anteriores, metas, benchmarks

---

## 🎨 DISEÑO Y EXPERIENCIA DE USUARIO

### **Principios de Diseño:**
1. **Minimalista y Limpio**: Espacios en blanco, jerarquía clara
2. **Consistente**: Mismos patrones en toda la app
3. **Accesible**: WCAG 2.1 AA compliance
4. **Responsive**: Mobile-first, adaptable a todos los dispositivos
5. **Rápido**: Optimización de rendimiento, lazy loading

### **Paleta de Colores Moderna:**
```css
/* Modo Claro */
--primary: #0ea5e9 (Sky Blue)
--secondary: #8b5cf6 (Purple)
--success: #10b981 (Green)
--warning: #f59e0b (Amber)
--danger: #ef4444 (Red)
--info: #3b82f6 (Blue)
--background: #ffffff
--foreground: #0f172a
--muted: #f1f5f9
--border: #e2e8f0

/* Modo Oscuro */
--primary: #38bdf8
--secondary: #a78bfa
--success: #34d399
--warning: #fbbf24
--danger: #f87171
--info: #60a5fa
--background: #0f172a
--foreground: #f8fafc
--muted: #1e293b
--border: #334155
```

### **Tipografía:**
- **Fuente Principal**: Inter, Geist Sans, o SF Pro
- **Fuente Monoespaciada**: Geist Mono, JetBrains Mono (código/números)
- **Tamaños**: Sistema de escalado (text-xs a text-4xl)

### **Componentes UI (Shadcn/UI):**
- Button (variantes: default, destructive, outline, ghost, link)
- Input, Textarea, Select
- Dialog, Sheet, Popover
- Table, DataTable
- Card, Badge, Avatar
- Tabs, Accordion
- Calendar, DatePicker
- Command (búsqueda con ⌘K)
- Toast, Alert
- Skeleton (loading states)
- Progress, Spinner

### **Animaciones:**
- **Transiciones suaves**: 150-300ms ease-in-out
- **Micro-interacciones**: Hover, focus, click feedback
- **Page transitions**: Fade, slide
- **Loading states**: Skeletons, spinners
- **Scroll animations**: Fade-in on scroll (Framer Motion)

### **Layout:**
```
┌─────────────────────────────────────────┐
│  Navbar (Logo, Menú, Usuario, Notif.)  │
├──────┬──────────────────────────────────┤
│      │  Breadcrumbs                     │
│      ├──────────────────────────────────┤
│ Side │                                  │
│ bar  │  Contenido Principal             │
│      │  (Dashboard, Tablas, Forms)      │
│ (Nav)│                                  │
│      │                                  │
└──────┴──────────────────────────────────┘
```

- **Navbar**: Sticky top, con logo, menú principal, búsqueda global, notificaciones, perfil
- **Sidebar**: Colapsable, iconos + texto, indicador de página activa
- **Breadcrumbs**: Navegación jerárquica
- **Content Area**: Padding adecuado, max-width para legibilidad

---

## 📱 CARACTERÍSTICAS MODERNAS

### **1. Búsqueda Global (⌘K / Ctrl+K)**
- Búsqueda instantánea en toda la app
- Resultados agrupados por tipo
- Navegación rápida
- Historial de búsquedas
- Comandos rápidos (crear, ir a, exportar)

### **2. Notificaciones en Tiempo Real**
- WebSockets o Server-Sent Events
- Notificaciones push (PWA)
- Centro de notificaciones
- Marcado como leído
- Filtros por tipo

### **3. Modo Oscuro**
- Toggle en navbar
- Persistencia de preferencia
- Transición suave
- Todos los componentes adaptados

### **4. PWA (Progressive Web App)**
- Instalable en dispositivos
- Funciona offline (Service Workers)
- Caché de datos críticos
- Sincronización en background

### **5. Drag & Drop**
- Reordenar columnas de tabla
- Subir archivos
- Organizar dashboards
- Priorizar tareas

### **6. Atajos de Teclado**
- ⌘K: Búsqueda global
- ⌘N: Nuevo registro
- ⌘S: Guardar
- ⌘P: Imprimir/Exportar
- ESC: Cerrar modales
- ←→: Navegar páginas de tabla

### **7. Exportación Programada**
- Configurar reportes automáticos
- Frecuencia: diaria, semanal, mensual
- Envío por email
- Formatos: Excel, PDF

### **8. Historial de Cambios (Auditoría)**
- Registro de todas las modificaciones
- Quién, cuándo, qué cambió
- Valores anteriores vs nuevos
- Posibilidad de revertir cambios

### **9. Colaboración**
- Comentarios en registros
- Menciones (@usuario)
- Asignación de tareas
- Notificaciones de actividad

### **10. Integraciones**
- API REST documentada (Swagger/OpenAPI)
- Webhooks para eventos
- Exportación a Google Sheets
- Integración con email (SendGrid, Resend)
- Integración con WhatsApp Business API

---

## 🔒 SEGURIDAD Y COMPLIANCE

### **Medidas de Seguridad:**
- ✅ HTTPS obligatorio
- ✅ Autenticación JWT con refresh tokens
- ✅ Encriptación de contraseñas (bcrypt, argon2)
- ✅ Rate limiting en API
- ✅ CORS configurado correctamente
- ✅ Sanitización de inputs (prevenir XSS, SQL Injection)
- ✅ CSRF protection
- ✅ Headers de seguridad (CSP, HSTS, etc.)
- ✅ Logs de acceso y errores
- ✅ Backup automático de base de datos
- ✅ Recuperación de contraseña segura
- ✅ 2FA (Two-Factor Authentication) opcional

### **Compliance:**
- GDPR (si aplica en EU)
- Política de privacidad
- Términos y condiciones
- Consentimiento de cookies
- Derecho al olvido (eliminar datos)

---

## 📊 OPTIMIZACIÓN Y RENDIMIENTO

### **Frontend:**
- Code splitting (Next.js automático)
- Lazy loading de componentes
- Imágenes optimizadas (next/image)
- Memoización (React.memo, useMemo, useCallback)
- Virtualización de listas largas (react-window)
- Debouncing en búsquedas
- Throttling en scroll events
- Service Workers para caché

### **Backend:**
- Índices en base de datos
- Queries optimizadas (N+1 problem)
- Caché con Redis
- Paginación en API
- Compresión de respuestas (gzip)
- CDN para assets estáticos

### **Monitoreo:**
- Sentry (errores)
- Vercel Analytics (métricas)
- Lighthouse CI (performance)
- Core Web Vitals

---

## 🧪 TESTING

### **Tipos de Tests:**
- **Unit Tests**: Vitest o Jest
- **Integration Tests**: Testing Library
- **E2E Tests**: Playwright o Cypress
- **Visual Regression**: Chromatic

### **Cobertura Mínima:**
- 80% en funciones críticas
- 100% en lógica de negocio
- Tests de rutas protegidas
- Tests de formularios
- Tests de API endpoints

---

## 📚 DOCUMENTACIÓN

### **Requerida:**
- README.md completo
- Guía de instalación
- Variables de entorno (.env.example)
- Guía de contribución
- Documentación de API (Swagger)
- Guía de usuario (para clientes)
- Diagramas de arquitectura
- Changelog

---

## 🚀 DEPLOYMENT

### **Entornos:**
- **Development**: Local
- **Staging**: Preview en Vercel
- **Production**: Vercel / Railway

### **CI/CD:**
- GitHub Actions o Vercel automático
- Tests automáticos en PR
- Deploy automático en merge a main
- Rollback fácil

### **Monitoreo Post-Deploy:**
- Uptime monitoring (UptimeRobot)
- Error tracking (Sentry)
- Analytics (Vercel, Google Analytics)

---

## 📋 ENTREGABLES

### **Código:**
- Repositorio Git (GitHub/GitLab)
- Código limpio y comentado
- TypeScript strict mode
- ESLint + Prettier configurados
- Commits semánticos (Conventional Commits)

### **Documentación:**
- README.md
- API documentation
- User guide
- Deployment guide

### **Extras:**
- Figma/Design files (si aplica)
- Database schema (diagrama)
- Postman collection (API)

---

## 🎯 CRITERIOS DE ÉXITO

El sistema debe cumplir:
- ✅ Funciona en Chrome, Firefox, Safari, Edge (últimas 2 versiones)
- ✅ Responsive en móvil, tablet, desktop
- ✅ Tiempo de carga inicial < 3 segundos
- ✅ Lighthouse score > 90 en Performance, Accessibility, Best Practices
- ✅ Sin errores en consola
- ✅ Todas las funcionalidades CRUD operativas
- ✅ Sistema de autenticación seguro
- ✅ Reportes generan correctamente
- ✅ Exportaciones funcionan (Excel, PDF)
- ✅ Formularios validan correctamente
- ✅ Notificaciones funcionan
- ✅ Modo oscuro funciona
- ✅ Búsqueda global funciona

---

## 🔄 ROADMAP FUTURO

### **Fase 2 (Post-MVP):**
- App móvil nativa (React Native / Flutter)
- Integraciones con ERPs (SAP, Odoo)
- BI avanzado (Power BI, Tableau)
- Machine Learning para predicciones
- Chat en vivo con clientes
- Firma digital de documentos
- Geolocalización de oficinas
- Multi-idioma (i18n)
- Multi-moneda

---

## 💡 NOTAS ADICIONALES

- Priorizar **experiencia de usuario** sobre complejidad técnica
- Código debe ser **mantenible y escalable**
- Seguir **mejores prácticas** de la industria
- Documentar **decisiones de arquitectura**
- Pensar en **escalabilidad** desde el inicio
- **Seguridad** es prioridad #1
- **Performance** es prioridad #2
- **Accesibilidad** es obligatoria, no opcional

---

## 🎨 INSPIRACIÓN DE DISEÑO

Tomar inspiración de:
- Linear (UI/UX moderna)
- Vercel Dashboard (limpio y rápido)
- Stripe Dashboard (profesional)
- Notion (flexible y potente)
- Shadcn UI Examples (componentes)

---

## ✅ CHECKLIST DE INICIO

Antes de empezar, asegúrate de:
- [ ] Definir modelo de datos (entidades, relaciones)
- [ ] Crear wireframes/mockups básicos
- [ ] Configurar repositorio Git
- [ ] Configurar entorno de desarrollo
- [ ] Instalar dependencias base
- [ ] Configurar ESLint + Prettier
- [ ] Configurar TypeScript
- [ ] Crear estructura de carpetas
- [ ] Configurar base de datos
- [ ] Configurar autenticación
- [ ] Crear componentes base (Button, Input, etc.)
- [ ] Implementar layout principal
- [ ] Configurar routing

---

## 🚀 ¡COMENCEMOS!

Con este prompt, deberías tener un sistema moderno, escalable y profesional que supere 
ampliamente las expectativas de un MVP y esté listo para producción.

**Tiempo estimado de desarrollo**: 4-8 semanas (1 desarrollador full-stack senior)
**Complejidad**: Media-Alta
**Nivel requerido**: Senior Full-Stack Developer

---

**¿Listo para construir el futuro? 🚀**
```

---

## 📝 VARIANTES DEL PROMPT

### **Versión Corta (Para Chat Rápido):**
```
Crea un sistema de gestión empresarial con Next.js 14, TypeScript, Shadcn/UI y TailwindCSS.
Debe incluir:
- Autenticación multi-rol
- CRUD completo con tabla avanzada (filtros, búsqueda, exportación)
- Dashboard con KPIs y gráficos
- Sistema de facturación
- 12 tipos de reportes diferentes
- Modo oscuro
- Responsive
- Búsqueda global (⌘K)
- Exportación a Excel/PDF

Stack: Next.js, TypeScript, Prisma, PostgreSQL, TanStack Query, Zustand, React Hook Form, Zod.
```

### **Versión Específica (Para Afiliaciones):**
```
Crea un sistema de gestión de afiliaciones a seguridad social con:
- Multi-oficina
- CRUD de afiliaciones (nombre, cédula, empresa, EPS, ARL, CCF, pensión, valor, estado pago)
- Gestión de desafiliaciones (motivo, costo, estado pago)
- Facturación automática con PDF
- Reportes: diario, mensual, morosidad, desempeño, retención
- Tabla con 20+ columnas configurables
- Filtros avanzados
- Exportación Excel/PDF

Tecnologías: Next.js 14, TypeScript, Shadcn/UI, Prisma, PostgreSQL, TanStack Query.
```

---

## 🎓 RECURSOS ADICIONALES

### **Documentación Oficial:**
- [Next.js Docs](https://nextjs.org/docs)
- [Shadcn/UI](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Prisma](https://www.prisma.io/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

### **Tutoriales Recomendados:**
- [Next.js 14 Full Course](https://www.youtube.com/results?search_query=nextjs+14+full+course)
- [Shadcn/UI Tutorial](https://www.youtube.com/results?search_query=shadcn+ui+tutorial)
- [TanStack Table Advanced](https://tanstack.com/table/latest/docs/guide/introduction)

### **Ejemplos de Código:**
- [Shadcn UI Examples](https://ui.shadcn.com/examples)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
- [Taxonomy (Next.js App)](https://github.com/shadcn-ui/taxonomy)

---

**Creado con ❤️ para desarrolladores que construyen el futuro**
