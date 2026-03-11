# 📊 ANÁLISIS COMPLETO DEL PROYECTO - CONSTRUVIDA AYJ

## 🎯 OBJETIVO DEL SISTEMA
Sistema de gestión de afiliaciones a seguridad social para múltiples oficinas, permitiendo el control de clientes, pagos, desafiliaciones, facturación y reportes analíticos.

---

## 🏗️ ARQUITECTURA Y TECNOLOGÍAS

### **Frontend Stack**
- **Framework Base**: React 19.0.0 + TypeScript 5.7.2
- **Build Tool**: Vite 6.3.1
- **Routing**: React Router DOM 6.30.0
- **Estilos**: TailwindCSS 3.4.17 + PostCSS
- **Fuente**: Google Fonts (Roboto)

### **Gestión de Estado y Datos**
- **State Management**: React Context API (AuthContext, ListsContext)
- **Data Fetching**: TanStack Query (React Query) 5.81.5
- **HTTP Client**: Axios 1.11.0

### **UI/UX Components**
- **Headless UI**: @headlessui/react 2.2.2
- **Iconos**: Lucide React 0.507.0 + React Icons 5.5.0
- **Notificaciones**: SweetAlert2 11.6.13
- **Gráficos**: Nivo (@nivo/bar, @nivo/line, @nivo/core) 0.98.0

### **Utilidades**
- **Fechas**: date-fns 4.1.0
- **JWT**: jwt-decode 4.0.0

---

## 📁 ESTRUCTURA DEL PROYECTO

```
src/
├── api/                    # Servicios de API
│   └── reportsService.ts
├── assets/                 # Recursos estáticos
├── components/            # Componentes reutilizables
│   ├── login/            # Componentes de login
│   ├── reports/          # Componentes de reportes
│   │   ├── Monthly/
│   │   └── UsersPaid/
│   ├── ColumnSelector.tsx
│   ├── GlobalFilter.tsx
│   ├── Loading.tsx
│   ├── ModalForm.tsx
│   ├── ModalFormCreate.tsx
│   ├── MonthYearSelector.tsx
│   ├── Navbar.tsx
│   ├── Pagination.tsx
│   ├── PaymentStatusSelector.tsx
│   └── Table.tsx
├── context/              # Contextos de React
│   ├── AuthContext.tsx
│   └── ListsContext.tsx
├── customHooks/          # Hooks personalizados
│   ├── useApiMutation.tsx
│   ├── useApiQuery.tsx
│   ├── useClienteDataTable.tsx
│   ├── useDailyNewAffiliations.tsx
│   ├── useDailyOldAffiliations.tsx
│   ├── useReports.ts
│   └── useUnsubscribedAffiliationsData.tsx
├── globalConfig/         # Configuración global
│   └── config.ts
├── helpers/              # Funciones auxiliares
│   └── formatDateForInput.ts
├── interfaces/           # Interfaces TypeScript
├── pages/                # Páginas principales
│   ├── ConstruvidaayjRoutes.tsx
│   ├── CustomerManagementPage.tsx
│   ├── LoginPage.tsx
│   ├── OfficeSelectPage.tsx
│   ├── ReportsPage.tsx
│   ├── UnsubscriptionsPage.tsx
│   └── UploadPage.tsx
├── router/               # Configuración de rutas
│   ├── AppRouter.tsx
│   ├── PrivateRoute.tsx
│   └── PublicRoute.tsx
├── types/                # Tipos TypeScript
│   ├── dataClient.ts
│   ├── office.ts
│   ├── user.ts
│   └── ...
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🔐 SISTEMA DE AUTENTICACIÓN

### **Flujo de Autenticación**
1. **Login** → Usuario ingresa credenciales
2. **Validación** → Backend retorna token JWT + datos de usuario
3. **Almacenamiento** → LocalStorage guarda: `user`, `selectedOffice`, `lists`
4. **Selección de Oficina** → Usuario elige oficina de trabajo
5. **Acceso al Sistema** → Rutas protegidas disponibles

### **Contexto de Autenticación (AuthContext)**
```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  selectedOfficeId: string | number | null;
  setSelectedOfficeId: (officeId: string | number | null) => void;
  isInitialAuthCheckComplete: boolean;
}
```

### **Rutas del Sistema**
- **Públicas**: `/login`
- **Semi-protegidas**: `/office_select` (requiere autenticación)
- **Protegidas**: 
  - `/customer_management` (Gestión de afiliaciones)
  - `/unsubscriptions` (Desafiliaciones)
  - `/reports` (Reportes)
  - `/upload` (Carga masiva)

---

## 💼 FUNCIONALIDADES PRINCIPALES

### **1. GESTIÓN DE AFILIACIONES** (`CustomerManagementPage`)

#### **Características:**
- ✅ **CRUD Completo** de afiliaciones
- ✅ **Tabla dinámica** con columnas configurables
- ✅ **Filtros avanzados**:
  - Búsqueda global o por columna específica
  - Selector de mes/año
  - Filtros por estado de pago
- ✅ **Paginación** (10 items por página)
- ✅ **Selector de columnas visibles**
- ✅ **Actualización de estado de pago** (Pendiente/En Proceso/Pagado)
- ✅ **Generación de facturas** automática
- ✅ **Visualización/descarga de facturas** en PDF
- ✅ **Edición inline** de registros
- ✅ **Desafiliación** (soft delete con registro de motivo)

#### **Columnas de Datos:**
```typescript
- paid (Estado de pago - selector interactivo)
- paymentMethodName (Método de pago)
- facturaNumero (Número de factura)
- observation (Observaciones)
- fullName (Nombre completo)
- identification (Cédula)
- companyName (Empresa)
- phones (Teléfonos - array)
- datePaidReceived (Fecha de pago)
- govRegistryCompletedAt (Fecha de afiliación)
- value (Valor - formato moneda COP)
- eps, arl, risk, ccf, pensionFund
```

#### **Acciones por Registro:**
- 🔵 **Editar** → Modal con formulario completo
- 🔴 **Eliminar** → Desafiliación con registro de motivo
- 🟢 **Generar Factura** → Si no existe factura
- 🟣 **Ver Factura** → Si ya existe factura

---

### **2. GESTIÓN DE DESAFILIACIONES** (`UnsubscriptionsPage`)

#### **Características:**
- ✅ Visualización de afiliaciones retiradas
- ✅ Información completa del retiro:
  - Razón de desafiliación
  - Costo del retiro
  - Estado de pago del retiro
  - Fecha de pago del retiro
  - Usuario que realizó la desafiliación
- ✅ **Edición de datos de retiro**
- ✅ **Actualización de estado de pago** del retiro
- ✅ Visualización de factura asociada (si existe)
- ✅ Filtros y búsqueda similares a afiliaciones

#### **Columnas Adicionales:**
```typescript
- unsubscriptionReason (Razón del retiro)
- unsubscriptionCost (Costo del retiro)
- unsubscriptionPaidStatus (Estado de pago del retiro)
- unsubscriptionPaidDate (Fecha de pago del retiro)
- deletedAt (Fecha de inactivación)
- deletedByUserName (Usuario que desafilió)
```

---

### **3. SISTEMA DE REPORTES** (`ReportsPage`)

#### **Reportes Disponibles:**

##### **A. Pagos del Día** (`UsersPaidReport`)
- **Usuarios Nuevos**: Afiliaciones creadas en el día seleccionado
- **Usuarios Antiguos**: Pagos recibidos en el día seleccionado
- Filtros por fecha y oficina
- Tablas separadas con totales

##### **B. Reporte Mensual** (`MonthlyReportChart`)
- **Gráfico de barras apiladas** (Nivo)
- Comparación de ingresos por mes
- Diferenciación entre afiliaciones nuevas y antiguas
- Totales por mes mostrados sobre las barras
- Formato de moneda colombiana (COP)
- Selector de año

##### **C. Subir Afiliaciones Masivas** (`UploadPage`)
- Carga de archivos CSV/Excel
- Procesamiento batch de afiliaciones

---

### **4. COMPONENTES REUTILIZABLES**

#### **Table Component** (Genérico con TypeScript)
```typescript
interface TableProps<T> {
  headers: (keyof T)[];
  headerLabels?: Record<keyof T, string>;
  data: T[];
  cellRenderers?: Partial<Record<keyof T, CellRenderer<T>>>;
  rowActions?: (row: T) => ReactNode;
  idKey: keyof T;
}
```

**Características:**
- Genérico con tipos
- Renderizadores personalizados por celda
- Acciones por fila
- Estilos condicionales por ruta
- Sticky header
- Responsive

#### **GlobalFilter Component**
- Búsqueda global o por columna
- Selector de columna de búsqueda
- Debounce implícito

#### **ColumnSelector Component**
- Multiselect de columnas visibles
- Persistencia de preferencias

#### **MonthYearSelector Component**
- Selector de mes y año
- Valores por defecto (mes/año actual)

#### **Pagination Component**
- Navegación por páginas
- Botones de primera/última página
- Indicador de página actual

#### **PaymentStatusSelector Component**
- Selector de estado de pago
- Actualización automática al backend
- Indicador de carga
- Feedback visual (SweetAlert2)

---

## 🎨 DISEÑO Y UX

### **Paleta de Colores**
- **Primary**: Emerald (verde) - `emerald-400`, `emerald-600`
- **Secondary**: Sky (azul) - `sky-400`, `blue-600`
- **Success**: Green - `green-100`, `green-600`
- **Warning**: Yellow - `yellow-100`, `yellow-600`
- **Danger**: Red - `red-100`, `red-600`
- **Info**: Blue - `blue-100`, `blue-600`
- **Neutral**: Gray - `gray-50` a `gray-900`

### **Tipografía**
- **Fuente**: Roboto (Google Fonts)
- **Pesos**: 400 (Regular), 500 (Medium), 700 (Bold)

### **Animaciones**
- **Fade-in**: Transición suave al cargar páginas (0.8s ease-in)
- **Hover effects**: En botones, filas de tabla, enlaces
- **Loading spinners**: En selectores y botones de acción

### **Responsive Design**
- **Mobile-first**: Diseño adaptable desde 320px
- **Breakpoints**: sm, md, lg, xl (TailwindCSS)
- **Navbar**: Hamburger menu en móvil, horizontal en desktop
- **Tablas**: Scroll horizontal en móvil

### **Feedback Visual**
- **SweetAlert2**: Confirmaciones, errores, éxitos
- **Toast notifications**: Actualizaciones de estado
- **Loading states**: Spinners y estados de carga
- **Badges**: Estados de pago, fechas, facturas

---

## 🔄 GESTIÓN DE DATOS

### **Custom Hooks con TanStack Query**

#### **useClientsData**
```typescript
const { data, isLoading, error, refetch } = useClientsData({
  month: number,
  year: number
});
```

#### **useUnsubscribedAffiliationsData**
```typescript
const { data, isLoading, error, refetch } = useUnsubscribedAffiliationsData({
  month: number,
  year: number
});
```

#### **useMonthlyReport**
```typescript
const { monthlyReportQuery } = useMonthlyReport({ year: number });
```

### **Contexto de Listas** (`ListsContext`)
Carga y cachea listas de referencia:
- Empresas (companies)
- EPS
- ARL
- CCF (Cajas de Compensación Familiar)
- Fondos de Pensión (pensionFunds)
- Métodos de Pago (paymentMethods)

---

## 🔌 INTEGRACIÓN CON BACKEND

### **Configuración de API**
```typescript
export const urlBase: string = import.meta.env.VITE_API_URL;
```

### **Endpoints Principales**

#### **Autenticación**
- `POST /auth/login` - Login de usuario

#### **Afiliaciones**
- `GET /monthly-affiliations` - Obtener afiliaciones por mes/año
- `POST /monthly-affiliations-copy` - Verificar afiliaciones al seleccionar oficina
- `PUT /affiliations` - Actualizar afiliación
- `PUT /affiliations/paid` - Actualizar estado de pago
- `DELETE /affiliations` - Desafiliar (soft delete)

#### **Facturas**
- `POST /facturas/generate-from-affiliation` - Generar factura
- `GET /facturas/{id}/download` - Descargar PDF de factura

#### **Reportes**
- `GET /reports/monthly-affiliations` - Reporte mensual

#### **Desafiliaciones**
- Endpoints específicos para gestión de retiros

---

## 📊 MODELOS DE DATOS

### **DataClient (Afiliación)**
```typescript
interface DataClient {
  clientId: number;
  affiliationId: number;
  fullName: string;
  identification: string;
  companyName: string;
  value: number;
  risk: string;
  observation: string | null;
  paid: PaymentStatus; // "Pagado" | "Pendiente" | "En Proceso"
  datePaidReceived: string | null;
  govRegistryCompletedAt: string | null;
  eps: string | null;
  arl: string | null;
  ccf: string | null;
  pensionFund: string | null;
  paymentMethodName: string | null;
  phones: string[];
  facturaId: number | null;
  facturaNumero: string | null;
  facturaInvoiceStatus: string | null;
  facturaPdfPath: string | null;
}
```

### **User**
```typescript
interface User {
  id: number;
  username: string;
  token: string;
  offices: Office[];
}
```

### **Office**
```typescript
interface Office {
  office_id: number;
  name: string;
  representative_name: string;
  logo_url: string;
}
```

---

## 🚀 CARACTERÍSTICAS DESTACADAS

### **1. Multi-Oficina**
- Soporte para múltiples oficinas por usuario
- Selección de oficina de trabajo
- Datos aislados por oficina

### **2. Sistema de Facturación**
- Generación automática de facturas
- Numeración automática
- Estados: Emitida, Anulada, Reemplazada
- Descarga de PDF
- Integración con afiliaciones

### **3. Filtros Avanzados**
- Búsqueda global o por columna
- Filtros por mes/año
- Filtros por estado de pago
- Filtros por oficina (en reportes)
- Combinación de múltiples filtros

### **4. Experiencia de Usuario**
- Feedback inmediato en todas las acciones
- Confirmaciones antes de acciones destructivas
- Loading states en operaciones asíncronas
- Mensajes de error descriptivos
- Animaciones suaves

### **5. Optimización de Rendimiento**
- React Query para caching
- Memoización con useMemo y useCallback
- Paginación de datos
- Lazy loading de componentes
- Debouncing en búsquedas

---

## 🔒 SEGURIDAD

### **Implementaciones de Seguridad**
- ✅ Autenticación con JWT
- ✅ Tokens en headers de peticiones
- ✅ Rutas protegidas (PrivateRoute)
- ✅ Validación de permisos por oficina
- ✅ Logout con limpieza de localStorage
- ✅ Verificación de token en cada petición

---

## 📱 RESPONSIVE & ACCESIBILIDAD

### **Responsive**
- Mobile-first design
- Breakpoints de TailwindCSS
- Tablas con scroll horizontal
- Menú hamburguesa en móvil
- Grids adaptables

### **Accesibilidad**
- Etiquetas semánticas HTML5
- Labels en formularios
- ARIA attributes en componentes interactivos
- Contraste de colores adecuado
- Focus states visibles

---

## 🎯 MEJORAS SUGERIDAS PARA VERSIÓN MODERNA

### **1. Tecnologías Adicionales**
- **Next.js 14+**: SSR, App Router, Server Components
- **Shadcn/UI**: Componentes modernos y accesibles
- **Zustand o Jotai**: State management más ligero
- **React Hook Form**: Gestión de formularios
- **Zod**: Validación de esquemas
- **Prisma**: ORM para backend
- **tRPC**: Type-safe API

### **2. Funcionalidades Nuevas**
- **Dashboard Analítico**: Métricas en tiempo real
- **Notificaciones Push**: Alertas de pagos pendientes
- **Exportación de Datos**: Excel, PDF, CSV
- **Historial de Cambios**: Auditoría completa
- **Roles y Permisos**: Sistema granular
- **Firma Digital**: Para documentos
- **Chat/Soporte**: Integrado en la app
- **Modo Oscuro**: Dark mode
- **PWA**: Instalable en dispositivos

### **3. Reportes Adicionales**
- **Reporte de Morosidad**: Pagos pendientes por antigüedad
- **Reporte de Ingresos Proyectados**: Predicción de ingresos
- **Reporte de Desempeño por Usuario**: Afiliaciones por empleado
- **Reporte de Empresas**: Análisis por empresa cliente
- **Reporte de Retención**: Tasa de desafiliación
- **Reporte de Métodos de Pago**: Preferencias de pago
- **Reporte Comparativo**: Mes vs mes, año vs año
- **Reporte de Cumplimiento**: Afiliaciones vs meta

### **4. UX/UI Mejorado**
- **Drag & Drop**: Para reordenar columnas
- **Filtros Guardados**: Guardar configuraciones de filtros
- **Vistas Personalizadas**: Layouts configurables
- **Atajos de Teclado**: Navegación rápida
- **Búsqueda Inteligente**: Con sugerencias
- **Gráficos Interactivos**: Drill-down en datos
- **Exportación Programada**: Reportes automáticos

---

## 📈 MÉTRICAS DEL PROYECTO

- **Componentes**: ~30+
- **Páginas**: 6 principales
- **Custom Hooks**: 7+
- **Contextos**: 2
- **Tipos TypeScript**: 10+
- **Dependencias**: 26
- **Líneas de Código**: ~5000+ (estimado)

---

## 🎓 CONCLUSIÓN

Este sistema es una **aplicación empresarial completa** para gestión de afiliaciones a seguridad social, con:
- ✅ Arquitectura escalable y mantenible
- ✅ TypeScript para type-safety
- ✅ UI/UX moderna y responsive
- ✅ Gestión de estado eficiente
- ✅ Integración completa con backend
- ✅ Sistema de reportes robusto
- ✅ Seguridad implementada
- ✅ Optimización de rendimiento

Es un **excelente punto de partida** para sistemas similares de gestión administrativa, CRM, o ERP ligeros.
