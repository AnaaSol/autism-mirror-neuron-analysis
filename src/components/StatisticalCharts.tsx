import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts';

interface GeneData {
  Gene: string;
  Total_eQTLs: number;
  Significant_p05: number;
  Highly_Sig_p001: number;
  Mean_Effect_Size: number;
  Tissues: number;
  Min_p_value_CORRECTED: string;
  Max_neg_log10_pval: number;
}

interface ConnectionData {
  gene1: string;
  gene2: string;
  connection_type: string;
  weight: number;
  evidence_strength: string;
  details: string;
}

const COLORS = ['#E67E22', '#9B59B6', '#2ECC71', '#E74C3C', '#3498DB'];

const StatisticalCharts: React.FC = () => {
  const [geneData, setGeneData] = useState<GeneData[]>([]);
  const [connectionData, setConnectionData] = useState<ConnectionData[]>([]);
  const [selectedChart, setSelectedChart] = useState('eqtls');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load gene data
        const geneResponse = await fetch('/data/CORRECTED_real_data_summary_stats.csv');
        const geneText = await geneResponse.text();
        const geneLines = geneText.trim().split('\n');
        
        const genes: GeneData[] = geneLines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',');
            return {
              Gene: values[0],
              Total_eQTLs: parseInt(values[1]),
              Significant_p05: parseInt(values[2]),
              Highly_Sig_p001: parseInt(values[3]),
              Mean_Effect_Size: parseFloat(values[4]),
              Tissues: parseInt(values[5]),
              Min_p_value_CORRECTED: values[6],
              Max_neg_log10_pval: parseFloat(values[7])
            };
          });

        // Load connection data
        const connResponse = await fetch('/data/fresh_network_connections.csv');
        const connText = await connResponse.text();
        const connLines = connText.trim().split('\n');
        
        const connections: ConnectionData[] = connLines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',');
            return {
              gene1: values[0],
              gene2: values[1],
              connection_type: values[2],
              weight: parseFloat(values[3]),
              evidence_strength: values[4],
              details: values[5].replace(/"/g, '')
            };
          });

        setGeneData(genes);
        setConnectionData(connections);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Prepare data for different charts
  const eqtlData = geneData.map((gene, index) => ({
    ...gene,
    fill: COLORS[index % COLORS.length]
  }));

  const effectSizeData = geneData.map((gene, index) => ({
    Gene: gene.Gene,
    'Tamaño de Efecto': Math.abs(gene.Mean_Effect_Size),
    'Dirección': gene.Mean_Effect_Size > 0 ? 'Positivo' : 'Negativo',
    fill: gene.Mean_Effect_Size > 0 ? '#2ECC71' : '#E74C3C'
  }));

  const significanceData = geneData.map(gene => ({
    Gene: gene.Gene,
    'P < 0.05': gene.Significant_p05,
    'P < 0.001': gene.Highly_Sig_p001
  }));

  const connectionTypeData = connectionData.reduce((acc, conn) => {
    const existing = acc.find(item => item.name === conn.connection_type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({
        name: conn.connection_type,
        value: 1,
        fill: conn.connection_type === 'Statistical Similarity' ? '#F39C12' : '#2ECC71'
      });
    }
    return acc;
  }, [] as Array<{name: string, value: number, fill: string}>);

  const strengthData = connectionData.reduce((acc, conn) => {
    const existing = acc.find(item => item.name === conn.evidence_strength);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({
        name: conn.evidence_strength,
        value: 1
      });
    }
    return acc;
  }, [] as Array<{name: string, value: number}>);

  const radarData = geneData.map(gene => ({
    Gene: gene.Gene,
    eQTLs: (gene.Total_eQTLs / Math.max(...geneData.map(g => g.Total_eQTLs))) * 100,
    Significancia: (gene.Max_neg_log10_pval / Math.max(...geneData.map(g => g.Max_neg_log10_pval))) * 100,
    Tejidos: (gene.Tissues / Math.max(...geneData.map(g => g.Tissues))) * 100,
    'Efecto Absoluto': (Math.abs(gene.Mean_Effect_Size) / Math.max(...geneData.map(g => Math.abs(g.Mean_Effect_Size)))) * 100
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography>Cargando datos estadísticos...</Typography>
      </Box>
    );
  }

  const renderChart = () => {
    switch (selectedChart) {
      case 'eqtls':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={eqtlData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Gene" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Total_eQTLs" name="Total eQTLs" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'effect':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={effectSizeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Gene" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Tamaño de Efecto" name="Tamaño de Efecto (Absoluto)" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'significance':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={significanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Gene" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="P < 0.05" fill="#3498DB" name="P < 0.05" />
              <Bar dataKey="P < 0.001" fill="#E74C3C" name="P < 0.001" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'connections':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom align="center">
                Tipos de Conexión
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={connectionTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, value}) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {connectionTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom align="center">
                Fuerza de Evidencia
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={strengthData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, value}) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {strengthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        );
      
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="Gene" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Puntuación Normalizada"
                dataKey="eQTLs"
                stroke="#E67E22"
                fill="#E67E22"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Radar
                name="Significancia"
                dataKey="Significancia"
                stroke="#3498DB"
                fill="#3498DB"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Radar
                name="Tejidos"
                dataKey="Tejidos"
                stroke="#2ECC71"
                fill="#2ECC71"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Radar
                name="Efecto Absoluto"
                dataKey="Efecto Absoluto"
                stroke="#E74C3C"
                fill="#E74C3C"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
        Análisis Estadístico y Visualizaciones
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Seleccionar Visualización</InputLabel>
            <Select
              value={selectedChart}
              label="Seleccionar Visualización"
              onChange={(e) => setSelectedChart(e.target.value)}
            >
              <MenuItem value="eqtls">Distribución de eQTLs por Gen</MenuItem>
              <MenuItem value="effect">Tamaños de Efecto</MenuItem>
              <MenuItem value="significance">Niveles de Significancia</MenuItem>
              <MenuItem value="connections">Análisis de Conexiones</MenuItem>
              <MenuItem value="radar">Comparación Multidimensional</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minHeight: 400 }}>
          {renderChart()}
        </Box>

        {/* Chart descriptions */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Descripción
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedChart === 'eqtls' && 
              'Muestra la distribución del número total de eQTLs (Expression Quantitative Trait Loci) identificados para cada gen candidato.'
            }
            {selectedChart === 'effect' && 
              'Visualiza el tamaño de efecto promedio (valor absoluto) de las asociaciones eQTL para cada gen. Los valores positivos y negativos indican la dirección del efecto.'
            }
            {selectedChart === 'significance' && 
              'Compara el número de asociaciones eQTL significativas a diferentes umbrales de p-valor (p < 0.05 y p < 0.001) para cada gen.'
            }
            {selectedChart === 'connections' && 
              'Analiza los tipos de conexiones en la red génica y la distribución de la fuerza de evidencia para cada conexión identificada.'
            }
            {selectedChart === 'radar' && 
              'Comparación multidimensional normalizada de todos los genes en diferentes métricas: número de eQTLs, significancia estadística, número de tejidos y tamaño de efecto.'
            }
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default StatisticalCharts;