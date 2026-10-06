# Contexto del Dominio: Data Extractor API

## Giro de la Empresa
El sistema es el motor de un proyecto de análisis de solvencia corporativa para clientes B2B. Su propósito principal es recopilar información financiera y fiscal de empresas desde múltiples fuentes oficiales y privadas para poder evaluar de manera dinámica y precisa la solvencia y capacidad crediticia de las entidades evaluadas. Esta información es la base para el cálculo de un "score crediticio" personalizado, ajustado a los criterios de riesgo específicos de nuestros clientes.

## Lógica de Negocio y Arquitectura
Este servidor opera como un microservicio independiente (Data Extractor API) encargado de la extracción, procesamiento y estructuración de datos. No almacena el resultado final ni sirve la interfaz de usuario, sino que expone la data a un frontend u otros servicios a través de una API.

### Flujo de Operación
1. **Recepción de Petición:** El servidor recibe una petición a través de su API (ej. desde el frontend o un orquestador) indicando el objetivo de scraping (ej. RFC y credenciales para el portal del SAT).
2. **Encolamiento:** El trabajo de scraping se encola para su procesamiento asíncrono y control de concurrencia.
3. **Ejecución del Scraping:**
   - Navegación hacia el portal objetivo (ej. SAT).
   - Manejo de evasión de bloqueos (proxies, resolución de captchas, simulación de comportamiento humano).
   - Extracción del contenido HTML o respuestas de red relevantes (ej. declaraciones, facturas, opinión de cumplimiento).
4. **Parseo y Estructuración:** La data "cruda" es extraída de las páginas y estructurada en formatos estándar (JSON).
5. **Respuesta:** Los resultados estructurados son devueltos a quien los solicitó a través de un webhook, un polling system, o una respuesta síncrona si el tiempo lo permite.
