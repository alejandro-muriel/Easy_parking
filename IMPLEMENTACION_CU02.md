# Guía de Implementación: CU-02 Reservar Plaza de Parqueo

## 📋 Resumen de la Implementación

Se ha implementado completamente el **Caso de Uso 2: Reservar plaza de parqueo** siguiendo la arquitectura y estándares del proyecto Parquea Fácil.

### ✅ Componentes Implementados

#### 1. **Página de Reserva** (`/src/app/reserva/page.tsx`)
- ✓ Autenticación requerida (con `requireAuth()`)
- ✓ Layout responsive con 3 columnas en desktop
- ✓ Panel lateral con instrucciones paso a paso
- ✓ Panel de información del usuario (nombre, rol, estado de cuenta)
- ✓ Leyenda visual de estados de plazas
- ✓ Mensajes de error y éxito
- ✓ Botón de retorno y logout integrados

#### 2. **Componente de Formulario** (`/src/components/reserva/reserva-form.tsx`)
- ✓ Componente cliente (usa `'use client'`)
- ✓ Interfaz paso a paso (3 pasos)
- ✓ Carga dinámica de horarios y plazas
- ✓ Visualización de plazas en grid estilo "mapa de asientos" (tipo cine)
- ✓ Validación en tiempo real
- ✓ Estados visuales para plaza seleccionada
- ✓ Manejo de errores personalizado
- ✓ Loading states

#### 3. **APIs REST**

**GET `/api/horarios`**
- Parámetros: `userId` (opcional)
- Validación: Solo el usuario puede ver sus propios horarios
- Respuesta: Array de horarios ordenados por día y hora
- Seguridad: Requiere autenticación

**GET `/api/plazas`**
- Parámetros: `estado` (DISPONIBLE, RESERVADA, etc.), `zona`
- Respuesta: Array de plazas filtradas y ordenadas
- Seguridad: Requiere autenticación

**POST `/api/reservas`**
- Body: `{ horarioId, plazaId, userId }`
- Validaciones:
  - ✓ Usuario autenticado
  - ✓ Horario pertenece al usuario
  - ✓ Plaza disponible
  - ✓ Sin reservas duplicadas en el mismo día/plaza
- Transacción atómica:
  1. Crea reserva con estado ACTIVA
  2. Actualiza plaza a estado RESERVADA
  3. Registra timestamp de cambio
- Respuesta: Detalles de reserva creada

---

## 🔄 Flujo de Interacción (CU-02)

```
1. Usuario accede a /reserva
   ↓
2. Sistema verifica autenticación
   ↓
3. Página carga tabla de información del usuario
   ↓
4. Usuario hace clic en "Cargar Horarios"
   ↓
5. Componente fetch de GET /api/horarios?userId=...
   ↓
6. Usuario selecciona horario académico
   ↓
7. Sistema carga GET /api/plazas?estado=DISPONIBLE
   ↓
8. Usuario ve grid de plazas (visual estilo cine)
   ↓
9. Usuario selecciona una plaza (click)
   ↓
10. Sistema valida formulario (ambos campos llenos)
    ↓
11. Usuario hace clic en "Confirmar Reserva"
    ↓
12. POST /api/reservas
    ↓
13. Backend valida:
    - Horario del usuario ✓
    - Plaza disponible ✓
    - No hay reserva duplicada ✓
    ↓
14. Transacción:
    - Crea reserva con estado ACTIVA
    - Actualiza plaza a RESERVADA
    ↓
15. Respuesta 201 con detalles de reserva
    ↓
16. Redirección a /dashboard con mensaje de éxito
    ↓
17. Usuario ve: "Reserva creada exitosamente! Verifica tu correo."
```

---

## 🎨 Estilos y Diseño

### Coherencia con el Proyecto
- ✓ **Tailwind CSS** (utility-first)
- ✓ **Colores personalizados**: Verdes emerald (#059669), grises slate
- ✓ **Tipografía**: Segoe UI con escalas consistentes
- ✓ **Espaciado**: Múltiplos de 0.25rem
- ✓ **Bordes redondeados**: 2rem para cards principales
- ✓ **Sombras**: shadow-sm (0 1px 2px 0 rgba)

### Componentes Visuales
- **Grid de plazas**: 4 columnas (móvil), 6 columnas (desktop)
- **Estados de plaza**:
  - Verde esmeralda: DISPONIBLE (seleccionable)
  - Amarillo: RESERVADA (deshabilitada)
  - Gris: OCUPADA (deshabilitada)
  - Rojo: BLOQUEADA (deshabilitada)
- **Interactividad**: Hover effects, transiciones suaves
- **Accesibilidad**: Etiquetas semánticas, contraste adecuado

---

## 🔐 Validaciones de Seguridad

### En el Frontend
- ✓ Ambos campos (horario y plaza) deben estar seleccionados
- ✓ Botón "Confirmar" deshabilitado hasta que sean válidos
- ✓ Manejo de errores con feedback visual

### En el Backend
- ✓ `requireAuth()` en todas las rutas
- ✓ Validación de propiedad (horario pertenece al usuario)
- ✓ Validación de disponibilidad de plaza
- ✓ Prevención de duplicados
- ✓ Transacciones atómicas (todo o nada)
- ✓ Logs de error en consola del servidor

---

## 📱 Responsividad

### Móvil
- Stack único (1 columna)
- Grid de plazas: 4 columnas
- Botones a ancho completo
- Sidebar oculto o expandible

### Tablet
- Panel + Sidebar en 2 columnas
- Grid de plazas: 5 columnas

### Desktop
- Panel principal (2/3) + Sidebar (1/3)
- Grid de plazas: 6 columnas

---

## 🚀 Características por Implementar (Futuro)

### Fase 2
- [ ] Envío de correo de confirmación
- [ ] Notificación 15 minutos antes de la clase
- [ ] Opción de extender reserva (RF-24)
- [ ] Historial de reservas
- [ ] Cancelación de reserva
- [ ] Bloqueo temporal post-liberación (RF-27)

### Fase 3
- [ ] Visualización de mapa interactivo (Google Maps)
- [ ] Cobro automático fuera de horario (RF-09)
- [ ] Integración con sistema de pagos
- [ ] Reportes de ocupación
- [ ] Dashboard para celadores

---

## 📊 Base de Datos

### Tablas Utilizadas
- **Horario**: Horarios académicos por usuario
- **PlazaParqueo**: Catálogo de plazas con estado
- **Reserva**: Registro de reservas con relaciones
- **User**: Información del usuario autenticado

### Cambios de Estado

```
PlazaParqueo:
  DISPONIBLE ──→ RESERVADA (al crear reserva)
  RESERVADA ──→ DISPONIBLE (al cancelar)
  RESERVADA ──→ OCUPADA (entrada real)
  OCUPADA ──→ DISPONIBLE (salida)

Reserva:
  ACTIVA ──→ CANCELADA (usuario cancela)
  ACTIVA ──→ EXTENDIDA (usuario extiende)
  ACTIVA ──→ COMPLETADA (sistema, al tiempo)
```

---

## 🧪 Pruebas Sugeridas

### Functional Testing
```
1. ✓ Usuario sin horarios → mensaje de información
2. ✓ Seleccionar horario → activa opción de plaza
3. ✓ Seleccionar plaza unavailable → deshabilitada
4. ✓ Validación de formulario vacío → botón deshabilitado
5. ✓ Crear reserva válida → cambio de estado en BD
6. ✓ Intentar crear duplicado → error 409
7. ✓ Usuario anónimo → redirect a login
8. ✓ Usuario accediendo horarios ajenos → error 403
```

### Performance
- GET horarios: < 100ms
- GET plazas: < 100ms
- POST reserva: < 500ms

---

## 📝 Notas de Desarrollador

1. **Cliente vs Servidor**:
   - Página: Server Component (autenticación)
   - Formulario: Client Component (interactividad)
   
2. **API Design**:
   - RESTful siguiendo estándares HTTP
   - Inputs validados en ambos lados
   - Errores con códigos HTTP adecuados

3. **Performance**:
   - Lazy loading de datos (no al cargar página)
   - Transacciones para consistencia de datos
   - Sin N+1 queries

4. **Mantenibilidad**:
   - Ruta separada por recurso
   - Validaciones centralizadas
   - Mensajes de error claros
   - Documentación en código

---

## 🔗 Archivos Relacionados

```
src/
├── app/
│   ├── reserva/
│   │   └── page.tsx (NUEVO - Página principal)
│   └── api/
│       ├── horarios/route.ts (NUEVO - API de horarios)
│       ├── plazas/route.ts (NUEVO - API de plazas)
│       └── reservas/route.ts (NUEVO - API de reservas)
├── components/
│   └── reserva/
│       └── reserva-form.tsx (ACTUALIZADO - Formulario completo)
└── lib/
    ├── reserva.ts (Modelo existente)
    ├── plaza-parqueo.ts (Modelo existente)
    ├── horario.ts (Modelo existente)
    └── prisma.ts (Cliente Prisma)
```

---

## ✨ Conclusión

La implementación del CU-02 es **completa, segura y escalable**, integrando perfectamente con la arquitectura existente de Parquea Fácil. El flujo es intuitivo, los estilos son consistentes, y las validaciones aseguran integridad de datos.

**Próximo paso**: Ejecutar `npm run seed` para cargar datos de prueba y probar el flujo de reserva en `/reserva`.
