import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Tabs, Tab, Box, Container,
  ThemeProvider, createTheme, CssBaseline, IconButton
} from '@mui/material';
import {
  AccountTree as NetworkIcon,
  TableChart as TableIcon,
  BarChart as ChartIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';
import NetworkVisualization from './components/NetworkVisualization';
import ResultsTables from './components/ResultsTables';
import StatisticalCharts from './components/StatisticalCharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#2C3E50',
    },
    secondary: {
      main: '#3498DB',
    },
    background: {
      default: '#F8F9FA',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      color: '#2C3E50',
    },
    h5: {
      fontWeight: 550,
      color: '#92aecaff',
    },
    h6: {
      fontWeight: 500,
      color: '#34495E',
    },
  },
});

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
              Análisis eQTL - Genes Neuronas Espejo en Autismo
            </Typography>
            <IconButton
              color="inherit"
              href="https://github.com/AnaaSol/autism-mirror-neuron-analysis"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
            >
              <GitHubIcon />
            </IconButton>
          </Toolbar>
          <Box sx={{ bgcolor: 'primary.dark' }}>
            <Container maxWidth="xl">
              <Tabs
                value={value}
                onChange={handleChange}
                textColor="inherit"
                indicatorColor="secondary"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab
                  icon={<NetworkIcon />}
                  label="Red Interactiva"
                  {...a11yProps(0)}
                  sx={{ minHeight: 64 }}
                />
                <Tab
                  icon={<TableIcon />}
                  label="Resultados y Tablas"
                  {...a11yProps(1)}
                  sx={{ minHeight: 64 }}
                />
                <Tab
                  icon={<ChartIcon />}
                  label="Análisis Estadístico"
                  {...a11yProps(2)}
                  sx={{ minHeight: 64 }}
                />
              </Tabs>
            </Container>
          </Box>
        </AppBar>

        <Container maxWidth="xl">
          <TabPanel value={value} index={0}>
            <NetworkVisualization />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <ResultsTables />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <StatisticalCharts />
          </TabPanel>
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 3,
            mt: 5,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="body1" gutterBottom>
              Análisis de Genes Candidatos Neuronas Espejo en Autismo
            </Typography>
            <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
              Basado en datos reales de GTEx v8 y Grove et al. 2019 GWAS
            </Typography>
            <Typography variant="caption" color="inherit" sx={{ opacity: 0.6, mt: 1, display: 'block' }}>
              © 2025 - Análisis eQTL Network Visualization
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
