import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Storage as DatasetIcon,
  Psychology as ModelIcon,
  Science as ExperimentIcon,
  Monitor as MonitoringIcon,
  Schedule as ScheduleIcon,
  Cloud as CloudIcon,
  Api as ApiIcon,
  Extension as ExtensionIcon,
  Timeline as ActivityIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Psychology,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const features = [
    {
      title: 'Dataset Management',
      description:
        'Upload, version, and manage your ML datasets with comprehensive metadata tracking.',
      icon: <DatasetIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/datasets',
    },
    {
      title: 'Model Management',
      description:
        'Deploy, version, and monitor your machine learning models across different frameworks.',
      icon: <ModelIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      path: '/models',
    },
    {
      title: 'Experiment Tracking',
      description:
        'Track experiments, compare runs, and visualize metrics with interactive charts.',
      icon: <ExperimentIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      path: '/experiments',
    },
    {
      title: 'Model Monitoring',
      description:
        'Monitor model performance, detect drift, and get alerts on performance degradation.',
      icon: <MonitoringIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      path: '/monitoring',
    },
    {
      title: 'Automated Scheduling',
      description:
        'Schedule and automate ML workflows with cron-based job management.',
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      path: '/schedules',
    },
    {
      title: 'Inference Services',
      description:
        'Deploy models as scalable API endpoints with load balancing and health monitoring.',
      icon: <CloudIcon sx={{ fontSize: 40 }} />,
      color: '#00acc1',
      path: '/inference-services',
    },
  ];

  const benefits = [
    {
      icon: <SpeedIcon color="primary" />,
      title: 'Fast & Efficient',
      description:
        'Optimized for speed with real-time updates and responsive design.',
    },
    {
      icon: <SecurityIcon color="primary" />,
      title: 'Secure & Compliance',
      description: 'Enterprise-grade security with role-based access control.',
    },
    {
      icon: <GroupIcon color="primary" />,
      title: 'Collaborative',
      description: 'Share datasets, models, and experiments with your team.',
    },
    {
      icon: <CheckCircleIcon color="primary" />,
      title: 'Continuously Improvement',
      description:
        'Built for production with monitoring, alerting, and automation.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 4,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                fontWeight="bold"
              >
                MLOps Hub
              </Typography>
              <Typography
                variant="h6"
                component="p"
                sx={{ mb: 2, opacity: 0.9 }}
              >
                The comprehensive platform for managing your machine learning
                operations
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
                From dataset management to model deployment, experiment tracking
                to monitoring - everything you need to build, deploy, and scale
                machine learning systems.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {isAuthenticated ? (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/dashboard')}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={login}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    Sign In to Get Started
                  </Button>
                )}
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 200,
                }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    fontSize: 50,
                  }}
                >
                  <Psychology sx={{ fontSize: 50 }} />
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            component="h2"
            textAlign="center"
            gutterBottom
          >
            Everything You Need for MLOps
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            A complete platform that covers the entire machine learning
            lifecycle
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: `${feature.color}20`,
                          color: feature.color,
                          mr: 2,
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" component="h3">
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate(feature.path)}
                    >
                      Explore
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Benefits Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            component="h2"
            textAlign="center"
            gutterBottom
          >
            Why Choose MLOps Hub?
          </Typography>
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box sx={{ mr: 2, mt: 0.5 }}>{benefit.icon}</Box>
                  <Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
