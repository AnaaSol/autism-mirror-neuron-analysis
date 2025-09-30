import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, Chip, Grid, Card, CardContent
} from '@mui/material';

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
  color: string;
}

interface NetworkSummary {
  total_genes: number;
  total_eqtls: number;
  total_connections: number;
  genes_in_network: number;
  connection_types: {
    "Statistical Similarity": number;
    "Coloc Evidence": number;
  };
  gene_degrees: {
    [key: string]: number;
  };
}

const ResultsTables: React.FC = () => {
  const [geneData, setGeneData] = useState<GeneData[]>([]);
  const [connectionData, setConnectionData] = useState<ConnectionData[]>([]);
  const [networkSummary, setNetworkSummary] = useState<NetworkSummary | null>(null);
  const [sortBy, setSortBy] = useState<keyof GeneData>('Total_eQTLs');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load gene summary data
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
              details: values[5].replace(/"/g, ''),
              color: values[6]
            };
          });

        // Load network summary
        const summaryResponse = await fetch('/data/fresh_network_summary.json');
        const summary: NetworkSummary = await summaryResponse.json();

        setGeneData(genes);
        setConnectionData(connections);
        setNetworkSummary(summary);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSort = (column: keyof GeneData) => {
    const isAsc = sortBy === column && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(column);
  };

  const sortedGeneData = [...geneData].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const formatPValue = (pValue: string): string => {
    const num = parseFloat(pValue);
    if (num < 0.001) {
      return num.toExponential(2);
    }
    return num.toFixed(6);
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Strong': return 'success';
      case 'Moderate': return 'warning';
      case 'Weak': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography>Cargando datos...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
        Resultados del Análisis eQTL
      </Typography>

      {/* Network Summary Cards */}
      {networkSummary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Genes
                </Typography>
                <Typography variant="h4" component="div">
                  {networkSummary.total_genes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de eQTLs
                </Typography>
                <Typography variant="h4" component="div">
                  {networkSummary.total_eqtls}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Conexiones Totales
                </Typography>
                <Typography variant="h4" component="div">
                  {networkSummary.total_connections}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Conexiones Coloc
                </Typography>
                <Typography variant="h4" component="div">
                  {networkSummary.connection_types["Coloc Evidence"]}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Gene Summary Table */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumen por Gen
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'Gene'}
                        direction={sortBy === 'Gene' ? sortOrder : 'asc'}
                        onClick={() => handleSort('Gene')}
                      >
                        Gen
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortBy === 'Total_eQTLs'}
                        direction={sortBy === 'Total_eQTLs' ? sortOrder : 'asc'}
                        onClick={() => handleSort('Total_eQTLs')}
                      >
                        Total eQTLs
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortBy === 'Highly_Sig_p001'}
                        direction={sortBy === 'Highly_Sig_p001' ? sortOrder : 'asc'}
                        onClick={() => handleSort('Highly_Sig_p001')}
                      >
                        P &lt; 0.001
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortBy === 'Mean_Effect_Size'}
                        direction={sortBy === 'Mean_Effect_Size' ? sortOrder : 'asc'}
                        onClick={() => handleSort('Mean_Effect_Size')}
                      >
                        Tamaño Efecto Promedio
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortBy === 'Tissues'}
                        direction={sortBy === 'Tissues' ? sortOrder : 'asc'}
                        onClick={() => handleSort('Tissues')}
                      >
                        Tejidos
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortBy === 'Min_p_value_CORRECTED'}
                        direction={sortBy === 'Min_p_value_CORRECTED' ? sortOrder : 'asc'}
                        onClick={() => handleSort('Min_p_value_CORRECTED')}
                      >
                        P-valor Mínimo
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortBy === 'Max_neg_log10_pval'}
                        direction={sortBy === 'Max_neg_log10_pval' ? sortOrder : 'asc'}
                        onClick={() => handleSort('Max_neg_log10_pval')}
                      >
                        -log10(P) Máximo
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedGeneData.map((row) => (
                    <TableRow key={row.Gene} hover>
                      <TableCell component="th" scope="row">
                        <Chip 
                          label={row.Gene} 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary">
                          {row.Total_eQTLs}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{row.Highly_Sig_p001}</TableCell>
                      <TableCell align="right">
                        <Typography 
                          color={row.Mean_Effect_Size > 0 ? 'success.main' : 'error.main'}
                          sx={{ fontWeight: 'bold' }}
                        >
                          {row.Mean_Effect_Size.toFixed(3)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{row.Tissues}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {formatPValue(row.Min_p_value_CORRECTED)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {row.Max_neg_log10_pval.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Connections Table */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Conexiones de Red
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Gen 1</TableCell>
                    <TableCell>Gen 2</TableCell>
                    <TableCell>Tipo de Conexión</TableCell>
                    <TableCell align="right">Peso</TableCell>
                    <TableCell>Fuerza de Evidencia</TableCell>
                    <TableCell>Detalles</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {connectionData.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Chip label={row.gene1} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Chip label={row.gene2} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.connection_type}
                          color={row.connection_type === 'Statistical Similarity' ? 'secondary' : 'success'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 'bold' }}>
                          {row.weight.toFixed(3)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.evidence_strength}
                          color={getStrengthColor(row.evidence_strength) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {row.details}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResultsTables;