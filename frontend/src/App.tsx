import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Datasets from './pages/Datasets/Datasets';
import DatasetDetail from './pages/Datasets/DatasetDetail';
import DatasetUpload from './pages/Datasets/DatasetUpload';
import Models from './pages/Models/Models';
import ModelDetail from './pages/Models/ModelDetail';
import Solutions from './pages/Solutions/Solutions';
import SolutionDetail from './pages/Solutions/SolutionDetail';
import InferenceServices from './pages/InferenceServices/InferenceServices';
import InferenceServiceDetail from './pages/InferenceServices/InferenceServiceDetail';
import Entrypoints from './pages/Entrypoints/Entrypoints';
import EntrypointDetail from './pages/Entrypoints/EntrypointDetail';
import Experiments from './pages/Experiments/Experiments';
import ExperimentDetail from './pages/Experiments/ExperimentDetail';
import RunDetail from './pages/Runs/RunDetail';
import Monitoring from './pages/Monitoring/Monitoring';
import MonitoringDetail from './pages/Monitoring/MonitoringDetail';
import ReportPage from './pages/Monitoring/ReportPage';
import Schedules from './pages/Schedules/Schedules';
import ScheduleDetail from './pages/Schedules/ScheduleDetail';
import Activities from './pages/Activities/Activities';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound/NotFound';

// Create a custom theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--logo-bg-color': '#ffffff',
          '--logo-primary-color': '#1976d2',
          '--logo-text-color': '#1976d2',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Public route - accessible without authentication */}
                <Route path="/" element={<Home />} />

                {/* Protected routes - require authentication */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/datasets"
                  element={
                    <ProtectedRoute>
                      <Datasets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/datasets/:id"
                  element={
                    <ProtectedRoute>
                      <DatasetDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/datasets/upload"
                  element={
                    <ProtectedRoute>
                      <DatasetUpload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/models"
                  element={
                    <ProtectedRoute>
                      <Models />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/models/:id"
                  element={
                    <ProtectedRoute>
                      <ModelDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/models/:id/versions/:version"
                  element={
                    <ProtectedRoute>
                      <ModelDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/solutions"
                  element={
                    <ProtectedRoute>
                      <Solutions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/solutions/:id"
                  element={
                    <ProtectedRoute>
                      <SolutionDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inference-services"
                  element={
                    <ProtectedRoute>
                      <InferenceServices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inference-services/:id"
                  element={
                    <ProtectedRoute>
                      <InferenceServiceDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/entrypoints"
                  element={
                    <ProtectedRoute>
                      <Entrypoints />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/entrypoints/:id"
                  element={
                    <ProtectedRoute>
                      <EntrypointDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/experiments"
                  element={
                    <ProtectedRoute>
                      <Experiments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/experiments/:id"
                  element={
                    <ProtectedRoute>
                      <ExperimentDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/runs/:id"
                  element={
                    <ProtectedRoute>
                      <RunDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/monitoring"
                  element={
                    <ProtectedRoute>
                      <Monitoring />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/monitoring/:id"
                  element={
                    <ProtectedRoute>
                      <MonitoringDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/monitoring/:id/reports/:reportId"
                  element={
                    <ProtectedRoute>
                      <ReportPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/schedules"
                  element={
                    <ProtectedRoute>
                      <Schedules />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/schedules/:id"
                  element={
                    <ProtectedRoute>
                      <ScheduleDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activities"
                  element={
                    <ProtectedRoute>
                      <Activities />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
