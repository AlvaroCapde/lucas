SYSTEM INSTRUCTION: Frontend Design System - Data Extractor API v2.0

1. Vibe y Dirección de Arte

El estilo evoluciona de "Lujo Orgánico Playful" a "Precisión Técnica Premium". Al ser una herramienta B2B que maneja datos críticos (SAT, Buró de Crédito, información financiera), el diseño debe proyectar seguridad absoluta, transparencia y tecnología de punta, eliminando lo "juguetón" sin volverse corporativo y aburrido.

Sensación: Táctil, de alta fidelidad, analítica y confiable. Las micro-interacciones deben ser fluidas, usando curvas de easing suaves (ej. cubic-bezier(0.16, 1, 0.3, 1)).

Fondos: Uso extremo de espacio en blanco (bg-white), pero se introduce un uso estratégico de bg-zinc-50/50 o texturas de ruido muy finas (1-2% de opacidad) para delimitar zonas de contenido complejo sin usar bordes duros, reduciendo la fatiga visual.

Componentes: Los bordes pasan a ser rounded-xl o rounded-lg con bordes ultrafinos (border-zinc-200/60). El glassmorphism se actualiza a un efecto "Frost" o "Mica" (backdrop-blur-xl bg-white/70), que se siente como cristal pulido arquitectónico.

2. Paleta de Colores (Tailwind)

Base/Background: Blanco puro (#FFFFFF) y la escala de zinc neutra para generar profundidad sin ensuciar la interfaz.

Primary (Verde Corporativo Moderno): teal-600 a teal-700 para acciones primarias. Se utilizan acentos en emerald-500 exclusivamente para los "Happy Paths" (scraping exitoso, webhook enviado con 200 OK, score de solvencia alto).

Accent (Ámbar/Bronce): amber-500 a orange-500. Se usa para destacar anomalías, timeouts, o estados transaccionales (ej. "Resolviendo Captcha"). El tono ligeramente más naranja le da una urgencia profesional, alejándose del amarillo caricatura.

Texto: zinc-950 para jerarquía principal (RFCs, Montos, Razones Sociales), zinc-500 para metadatos y timestamps.

3. Tipografía

Sans-serif (UI General y Jerarquía): Satoshi (disponible vía Fontshare). A diferencia de Inter o Geist, Satoshi es una tipografía neo-grotesca con un ligero toque geométrico que se siente significativamente más premium, contemporánea y propia de una startup fintech de alto nivel. Mantiene una legibilidad perfecta en interfaces densas, pero sus terminales le dan un carácter único. Uso de font-medium con tracking-tight para controles, y font-semibold para métricas.

Monospace (Data, RFCs y Logs): IBM Plex Mono. Sustituye las opciones convencionales por una fuente con detalles de diseño más industriales y estructurados. Aporta una estética de ingeniería técnica, ideal para mostrar estructuras JSON, montos financieros, cadenas alfanuméricas del SAT y terminales de procesamiento.

4. Stack Tecnológico de Salida

Todo código generado debe usar: Next.js (App Router), React, Tailwind CSS, y shadcn/ui (ajustado globalmente en globals.css a un radio de --radius: 0.5rem o 0.75rem máximo). Se debe incorporar Framer Motion exclusivamente para transiciones de estado opacas, acordeones suaves, y la aparición de modales glassmórficos, garantizando que el rendimiento y la seriedad no se vean comprometidos por animaciones excesivas.