import React, { useEffect, useRef, useState } from 'react';
import { Network, DataSet } from 'vis-network/standalone';
import { Box, Typography, Paper, Chip, Grid } from '@mui/material';

interface NetworkConnection {
  gene1: string;
  gene2: string;
  connection_type: string;
  weight: number;
  evidence_strength: string;
  details: string;
  color: string;
}

interface GeneInfo {
  gene: string;
  description: string;
  total_eQTLs: number;
  highly_sig: number;
  mean_effect: number;
  tissues: number;
  min_pvalue: string;
  max_neg_log10: number;
}

interface NetworkData {
  nodes: any[];
  edges: any[];
}

const NetworkVisualization: React.FC = () => {
  const networkContainer = useRef<HTMLDivElement>(null);
  const [networkData, setNetworkData] = useState<NetworkData>({ nodes: [], edges: [] });
  const [selectedConnection, setSelectedConnection] = useState<NetworkConnection | null>(null);
  const [selectedGene, setSelectedGene] = useState<GeneInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        // Load network connections
        const response = await fetch('/data/fresh_network_connections.csv');
        const csvText = await response.text();
        
        // Load gene statistics  
        const statsResponse = await fetch('/data/CORRECTED_real_data_summary_stats.csv');
        const statsText = await statsResponse.text();
        const statsLines = statsText.trim().split('\n');
        
        const stats: {[key: string]: any} = {};
        statsLines.slice(1).filter(line => line.trim()).forEach(line => {
          const values = line.split(',');
          stats[values[0]] = {
            total_eQTLs: parseInt(values[1]),
            highly_sig: parseInt(values[3]),
            mean_effect: parseFloat(values[4]),
            tissues: parseInt(values[5]),
            min_pvalue: values[6],
            max_neg_log10: parseFloat(values[7])
          };
        });
        
        const lines = csvText.trim().split('\n');
        const connections: NetworkConnection[] = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            // Parse CSV line properly handling quoted fields
            const values: string[] = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim()); // Add the last value
            
            const connection = {
              gene1: values[0],
              gene2: values[1],
              connection_type: values[2],
              weight: parseFloat(values[3]),
              evidence_strength: values[4],
              details: values[5].replace(/"/g, ''),
              color: values[6]
            };
            
            
            return connection;
          });

        // Create nodes
        const geneSet = new Set<string>();
        connections.forEach(conn => {
          geneSet.add(conn.gene1);
          geneSet.add(conn.gene2);
        });

        const geneColors = {
          'CACNA1C': '#E67E22',
          'CHD8': '#9B59B6',
          'CNTNAP2': '#2ECC71',
          'FOXP2': '#E74C3C',
          'THEMIS': '#3498DB'
        };

        const nodes = Array.from(geneSet).map(gene => {
          const geneData = stats[gene] || {};
          const descriptions = {
            'CACNA1C': 'Canal de calcio dependiente de voltaje tipo L',
            'CHD8': 'Helicase remodeladora de cromatina 8',
            'CNTNAP2': 'Proteína asociada a contactina 2',
            'FOXP2': 'Factor de transcripción forkhead box P2',
            'THEMIS': 'Proteína de señalización de células T'
          };
          
          return {
            id: gene,
            label: gene,
            color: {
              background: geneColors[gene as keyof typeof geneColors] || '#95A5A6',
              border: '#2C3E50',
              highlight: {
                background: '#F39C12',
                border: '#E67E22'
              }
            },
            font: {
              color: '#FFFFFF',
              size: 14,
              face: 'Arial'
            },
            size: Math.max(30, (geneData.total_eQTLs || 0) / 4 + 20),
            shadow: true,
            geneInfo: {
              gene: gene,
              description: descriptions[gene as keyof typeof descriptions] || 'Gen candidato',
              total_eQTLs: geneData.total_eQTLs || 0,
              highly_sig: geneData.highly_sig || 0,
              mean_effect: geneData.mean_effect || 0,
              tissues: geneData.tissues || 0,
              min_pvalue: geneData.min_pvalue || 'N/A',
              max_neg_log10: geneData.max_neg_log10 || 0
            }
          };
        });

        // Create edges - sin hover tooltip, solo panel lateral
        const edges = connections.map((conn, index) => ({
          id: index,
          from: conn.gene1,
          to: conn.gene2,
          color: {
            color: conn.color,
            highlight: '#F39C12',
            hover: '#F39C12',
            inherit: false
          },
          width: Math.max(3, conn.weight * 2),
          selectionWidth: Math.max(5, conn.weight * 3),
          hoverWidth: Math.max(4, conn.weight * 2.5),
          smooth: {
            enabled: true,
            type: 'continuous',
            roundness: 0.2
          },
          physics: true,
          connectionData: conn
          // Sin título para eliminar tooltip
        }));

        
        setNetworkData({ nodes, edges });
        setLoading(false);
      } catch (error) {
        console.error('Error loading network data:', error);
        setLoading(false);
      }
    };

    loadNetworkData();
  }, []);

  useEffect(() => {
    if (!loading && networkContainer.current && networkData.nodes.length > 0) {
      const data = {
        nodes: new DataSet(networkData.nodes),
        edges: new DataSet(networkData.edges)
      };

      const options = {
        width: '100%',
        height: '600px',
        physics: {
          enabled: true,
          stabilization: { iterations: 100 },
          barnesHut: {
            gravitationalConstant: -2000,
            centralGravity: 0.3,
            springLength: 200,
            springConstant: 0.04,
            damping: 0.09
          }
        },
        interaction: {
          hover: true,
          hoverConnectedEdges: true,
          selectConnectedEdges: false,
          tooltipDelay: 300,
          hideEdgesOnDrag: false,
          hideNodesOnDrag: false
        },
        nodes: {
          borderWidth: 2,
          borderWidthSelected: 4,
          chosen: true
        },
        edges: {
          arrows: {
            to: { enabled: false }
          },
          smooth: true,
          width: 2,
          selectionWidth: 4,
          hoverWidth: 3,
          chosen: true
        },
        configure: {
          enabled: false
        }
      };

      const network = new Network(networkContainer.current, data, options);

      // Manejar selección de edges
      network.on('selectEdge', (params) => {
        if (params.edges.length > 0) {
          const edgeId = params.edges[0];
          const edge = networkData.edges.find(e => e.id === edgeId);
          if (edge && edge.connectionData) {
            setSelectedConnection(edge.connectionData);
          }
        }
      });

      // Manejar click en edges y nodes
      network.on('click', (params) => {
        if (params.edges.length > 0) {
          const edgeId = params.edges[0];
          const edge = networkData.edges.find(e => e.id === edgeId);
          if (edge && edge.connectionData) {
            console.log('Selected connection data:', edge.connectionData);
            setSelectedConnection(edge.connectionData);
            setSelectedGene(null);
          }
        } else if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const node = networkData.nodes.find(n => n.id === nodeId);
          if (node && node.geneInfo) {
            setSelectedGene(node.geneInfo);
            setSelectedConnection(null);
          }
        } else {
          // Click en espacio vacío, deseleccionar todo
          setSelectedConnection(null);
          setSelectedGene(null);
        }
      });

      // Manejar deselección
      network.on('deselectEdge', () => {
        // No deseleccionar automáticamente para permitir ver detalles
      });

      // Manejar selección de nodos
      network.on('selectNode', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const node = networkData.nodes.find(n => n.id === nodeId);
          if (node && node.geneInfo) {
            setSelectedGene(node.geneInfo);
            setSelectedConnection(null);
          }
        }
      });
    }
  }, [loading, networkData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography>Cargando red de genes...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
        Red Interactiva de Genes Mirror Neuron en Autismo
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Red de Conexiones Génicas
            </Typography>
            <Box 
              ref={networkContainer} 
              sx={{ 
                border: '1px solid #ddd', 
                borderRadius: 1,
                height: '600px'
              }} 
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom>
              {selectedConnection ? 'Información de Conexión' : selectedGene ? 'Información del Gen' : 'Información'}
            </Typography>
            
            {selectedConnection ? (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {selectedConnection.gene1} ↔ {selectedConnection.gene2}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tipo de Conexión:
                  </Typography>
                  <Chip 
                    label={selectedConnection.connection_type}
                    color={selectedConnection.connection_type === 'Statistical Similarity' ? 'primary' : 'secondary'}
                    sx={{ mb: 1 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fuerza de Evidencia:
                  </Typography>
                  <Chip 
                    label={selectedConnection.evidence_strength}
                    color={selectedConnection.evidence_strength === 'Strong' ? 'success' : 'warning'}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Peso de Conexión:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedConnection.weight.toFixed(3)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Detalles:
                  </Typography>
                  <Typography variant="body2">
                    {selectedConnection.details}
                  </Typography>
                </Box>
              </Box>
            ) : selectedGene ? (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  🧬 {selectedGene.gene}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Descripción:
                  </Typography>
                  <Typography variant="body1">
                    {selectedGene.description}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total de eQTLs:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {selectedGene.total_eQTLs}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Altamente Significativos (p &lt; 0.001):
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedGene.highly_sig}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tamaño de Efecto Promedio:
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: selectedGene.mean_effect > 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    {selectedGene.mean_effect > 0 ? '+' : ''}{selectedGene.mean_effect.toFixed(3)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tejidos Analizados:
                  </Typography>
                  <Typography variant="body1">
                    {selectedGene.tissues}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    P-valor Mínimo:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {selectedGene.min_pvalue}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    -log10(P) Máximo:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedGene.max_neg_log10.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Haga click sobre la red para obtener más información
              </Typography>
            )}
          </Paper>

          <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Leyenda
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Genes:
              </Typography>
              {['CACNA1C', 'CHD8', 'CNTNAP2', 'FOXP2', 'THEMIS'].map(gene => (
                <Box key={gene} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%',
                      backgroundColor: {
                        'CACNA1C': '#E67E22',
                        'CHD8': '#9B59B6',
                        'CNTNAP2': '#2ECC71',
                        'FOXP2': '#E74C3C',
                        'THEMIS': '#3498DB'
                      }[gene],
                      mr: 1
                    }} 
                  />
                  <Typography variant="body2">{gene}</Typography>
                </Box>
              ))}
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tipos de Conexión:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 20, height: 3, backgroundColor: '#F39C12', mr: 1 }} />
                <Typography variant="body2">Similitud Estadística</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 20, height: 3, backgroundColor: '#2ECC71', mr: 1 }} />
                <Typography variant="body2">Evidencia Coloc</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NetworkVisualization;