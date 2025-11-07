# **App Name**: Wiga Sales Hub

## Core Features:

- Autenticación: Autenticación segura de usuarios utilizando Firebase Authentication con correo electrónico/contraseña y recuperación de contraseña. Control de acceso basado en roles para diferentes niveles de usuario (Administrador, Director Comercial, Ejecutivo Comercial, Soporte).
- Onboarding de Usuario: Proceso de onboarding para el primer inicio de sesión para recopilar información del perfil del usuario (nombre, rol, detalles de contacto) y almacenarla en Firestore. Mostrar un mensaje de bienvenida con el logotipo de la empresa.
- Gestión de Leads: Crear, leer, actualizar y eliminar leads, rastreando información del cliente/empresa, detalles de contacto, fuente del lead, estado del lead, asesor asignado y probabilidad de compra. Permitir filtrar por estado, fecha y asesor. El sistema sugiere una probabilidad de compra basada en la actividad.
- Seguimiento de Actividades: Registrar y mostrar todas las interacciones con un lead (llamadas, visitas, correos electrónicos, reuniones) con detalles sobre el tipo de actividad, fecha/hora y notas. Mostrar una línea de tiempo cronológica de las interacciones por lead. Basado en interacciones recientes, esta herramienta puede sugerir acciones.
- Gestión de Cotizaciones: Crear cotizaciones vinculadas a leads con fechas de emisión/validez, listas de productos/servicios, cantidades, precios unitarios, subtotales, impuestos, totales y estado. Generar cotizaciones en PDF editables/descargables. Esta herramienta puede sugerir qué descuentos se pueden dar a los clientes.
- Envío de Cotizaciones por Correo Electrónico: Enviar cotizaciones directamente a los clientes por correo electrónico utilizando Firebase Functions.
- Panel de Control: Panel de control para métricas clave (leads activos/cerrados/nuevos, tasa de conversión, ventas totales, porcentaje de compradores recurrentes) visualizadas utilizando gráficos dinámicos (Chart.js o Google Charts). Mostrar indicadores separados por asesor y mes.

## Style Guidelines:

- Color primario: Naranja corporativo (#FF6600) para reflejar la identidad de la marca.
- Color secundario: Negro (#000000) para texto y acentos.
- Color de fondo: Gris claro (#F9F9F9) para proporcionar un fondo limpio y moderno.
- Fuente del cuerpo y del encabezado: 'Poppins' (sans-serif) para una apariencia moderna, minimalista y profesional. Nota: actualmente solo se admiten Google Fonts.
- Usar iconos limpios y simples para representar diferentes funciones y estados de los leads.
- Usar TailwindCSS o el sistema de diseño de Firebase Studio para elementos visuales consistentes y capacidad de respuesta.
- Animaciones sutiles para estados de carga y transiciones para mejorar la experiencia del usuario.