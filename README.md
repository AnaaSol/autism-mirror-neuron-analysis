# Análisis eQTL - Genes Mirror Neuron en Autismo

Aplicación web interactiva para el análisis de genes candidatos mirror neuron en autismo basado en datos reales de GTEx v8 y Grove et al. 2019 GWAS.

## 🧬 Descripción

Esta aplicación visualiza y analiza las relaciones entre genes candidatos asociados a las neuronas espejo en el autismo:

- **CACNA1C**: Canal de calcio tipo L
- **CHD8**: Helicase remodeladora de cromatina  
- **CNTNAP2**: Proteína asociada a contactina
- **FOXP2**: Factor de transcripción forkhead
- **THEMIS**: Proteína de señalización de células T

## 🔬 Características

### 🌐 Red Interactiva
- Visualización de red gene-gene con vis.js
- Conexiones basadas en similitud estadística y evidencia de co-localización
- Información detallada al seleccionar conexiones
- Leyenda interactiva con codificación por colores

### 📊 Resultados y Tablas
- Resumen estadístico por gen
- Tabla de conexiones de red ordenable
- Métricas de eQTL y significancia
- Tarjetas de resumen de la red

### 📈 Análisis Estadístico
- Gráficos de barras de distribución de eQTLs
- Análisis de tamaños de efecto
- Comparación de niveles de significancia
- Gráficos circulares de tipos de conexión
- Análisis multidimensional con radar charts

## 🚀 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start

# Construir para producción
npm run build
```

## 📁 Estructura de Datos

### Archivos de Datos
- `CORRECTED_real_data_summary_stats.csv`: Estadísticas por gen
- `fresh_network_connections.csv`: Conexiones de red
- `fresh_network_summary.json`: Resumen de red

### Métricas Principales
- **Total eQTLs**: 215 asociaciones identificadas
- **Genes analizados**: 5 genes candidatos
- **Conexiones totales**: 14 (10 estadísticas + 4 co-localización)
- **Tejidos**: Datos de múltiples regiones cerebrales

## 🔬 Metodología

### Datos Fuente
- **GTEx v8**: Expression Quantitative Trait Loci
- **Grove et al. 2019**: GWAS de autismo
- **Análisis de co-localización**: Evidencia de asociación compartida

### Métricas de Red
- **Similitud Estadística**: Basada en perfiles de expresión
- **Evidencia Coloc**: Co-localización de señales GWAS-eQTL
- **Pesos de Conexión**: Fuerza de asociación estadística

## 🎨 Tecnologías

- **Frontend**: React + TypeScript
- **UI**: Material-UI (MUI)
- **Visualización**: vis-network, Recharts
- **Datos**: CSV/JSON processing

## 📊 Resultados Destacados

- **CACNA1C**: Gen hub principal (136 eQTLs, 63% del total)
- **Red altamente conectada**: Todos los genes con grado 4
- **Especificidad tisular**: Cerebelo y cortex frontal más significativos
- **Conexiones más fuertes**: CNTNAP2-FOXP2, CHD8-THEMIS

## 🔗 Referencias

- Grove J, et al. (2019). Identification of common genetic risk variants for autism spectrum disorder. Nature Genetics.
- GTEx Consortium (2020). The GTEx Consortium atlas of genetic regulatory effects across human tissues. Science.

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver `LICENSE` para más detalles.

---

**© 2025 - Autism Mirror Neuron Research Project**