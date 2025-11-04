import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Storage as DatasetIcon,
  Psychology as ModelIcon,
  Extension as SolutionsIcon,
  Api as EntrypointIcon,
  Science as ExperimentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Mock data for demonstration
const statsData = [
  {
    title: 'Total Datasets',
    value: 156,
    icon: <DatasetIcon />,
    color: '#1976d2',
    change: '+12%',
  },
  {
    title: 'Total Models',
    value: 89,
    icon: <ModelIcon />,
    color: '#dc004e',
    change: '+8%',
  },
  {
    title: 'Available Solutions',
    value: 45,
    icon: <SolutionsIcon />,
    color: '#ff6b35',
    change: '+18%',
  },
  {
    title: 'Active Experiments',
    value: 23,
    icon: <ExperimentIcon />,
    color: '#2e7d32',
    change: '+15%',
  },
  {
    title: 'Active Entrypoints',
    value: 12,
    icon: <EntrypointIcon />,
    color: '#9c27b0',
    change: '+25%',
  },
];

const recentActivity = [
  {
    id: '1',
    type: 'solution_download',
    user: 'Alex Brown',
    resource: 'Knowledge Extraction Solution',
    timestamp: '30 minutes ago',
    status: 'completed',
  },
  {
    id: '2',
    type: 'entrypoint_deploy',
    user: 'John Doe',
    resource: 'Sentiment Analysis API',
    timestamp: '1 hour ago',
    status: 'completed',
  },
  {
    id: '3',
    type: 'solution_create',
    user: 'Sarah Wilson',
    resource: 'Fraud Detection Engine',
    timestamp: '2 hours ago',
    status: 'completed',
  },
  {
    id: '4',
    type: 'dataset_upload',
    user: 'Jane Smith',
    resource: 'Customer Data v2.1',
    timestamp: '3 hours ago',
    status: 'completed',
  },
  {
    id: '5',
    type: 'model_upload',
    user: 'Mike Johnson',
    resource: 'BERT Classification Model',
    timestamp: '5 hours ago',
    status: 'completed',
  },
  {
    id: '6',
    type: 'experiment_create',
    user: 'David Lee',
    resource: 'Hyperparameter Tuning',
    timestamp: '7 hours ago',
    status: 'running',
  },
  {
    id: '7',
    type: 'alert_triggered',
    user: 'System',
    resource: 'Model Drift Alert',
    timestamp: '9 hours ago',
    status: 'warning',
  },
];

const growthData = [
  { name: 'Jan', models: 45, solutions: 12, datasets: 78 },
  { name: 'Feb', models: 52, solutions: 15, datasets: 85 },
  { name: 'Mar', models: 61, solutions: 18, datasets: 92 },
  { name: 'Apr', models: 68, solutions: 22, datasets: 98 },
  { name: 'May', models: 75, solutions: 28, datasets: 105 },
  { name: 'Jun', models: 89, solutions: 35, datasets: 120 },
];

const entrypointData = [
  {
    name: 'Sentiment Analysis API',
    calls: 15420,
    avgResponseTime: 120,
    status: 'active',
  },
  {
    name: 'Image Classification API',
    calls: 12850,
    avgResponseTime: 95,
    status: 'active',
  },
  {
    name: 'Fraud Detection API',
    calls: 9870,
    avgResponseTime: 45,
    status: 'active',
  },
  {
    name: 'Text Summarization API',
    calls: 7650,
    avgResponseTime: 180,
    status: 'active',
  },
  {
    name: 'Recommendation Engine',
    calls: 5430,
    avgResponseTime: 200,
    status: 'active',
  },
];

const inferenceServiceData = [
  {
    name: 'NLP Service #1',
    status: 'running',
    deployedModels: '3 models',
    apiCallsToday: 15420,
  },
  {
    name: 'NLP Service #2',
    status: 'running',
    deployedModels: '2 models',
    apiCallsToday: 12850,
  },
  {
    name: 'Embedding Service',
    status: 'running',
    deployedModels: '1 model',
    apiCallsToday: 9870,
  },
  {
    name: 'Image Classification',
    status: 'running',
    deployedModels: '2 models',
    apiCallsToday: 7650,
  },
];

const Dashboard: React.FC = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'running':
        return (
          <LinearProgress sx={{ width: 20, height: 20, borderRadius: '50%' }} />
        );
      case 'warning':
        return <WarningIcon color="warning" fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'info';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value.toLocaleString()}
                    </Typography>
                    <Typography color="textSecondary" variant="body2">
                      {stat.change} from last month
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Performance Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Platform Growth Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="models"
                    stroke="#dc004e"
                    strokeWidth={2}
                    name="Models"
                  />
                  <Line
                    type="monotone"
                    dataKey="solutions"
                    stroke="#ff6b35"
                    strokeWidth={2}
                    name="Solutions"
                  />
                  <Line
                    type="monotone"
                    dataKey="datasets"
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Datasets"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 1.5 }}>
                Recent Activity
              </Typography>
              <List dense sx={{ py: 0 }}>
                {recentActivity.map(activity => (
                  <ListItem
                    key={activity.id}
                    divider
                    sx={{
                      py: 0.75,
                      px: 0,
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 32 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 24,
                          height: 24,
                          fontSize: '0.75rem',
                        }}
                      >
                        {getStatusIcon(activity.status)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, lineHeight: 1.2 }}
                        >
                          {activity.resource}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ lineHeight: 1.2 }}
                        >
                          {activity.user} • {activity.timestamp}
                        </Typography>
                      }
                      sx={{ my: 0 }}
                    />
                    <Chip
                      label={activity.status}
                      color={getStatusColor(activity.status) as any}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Entrypoints */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Active Entrypoints
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Last Week
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={entrypointData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'calls'
                        ? `${value.toLocaleString()} calls/w`
                        : `${value}ms`,
                      name === 'calls' ? 'API Calls' : 'Avg Response Time',
                    ]}
                  />
                  <Bar dataKey="calls" fill="#1976d2" name="calls" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Inference Services */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inference Services Status
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current Status
              </Typography>
              <Box sx={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '8px 0',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}
                      >
                        Service
                      </th>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '8px 0',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '8px 0',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}
                      >
                        Models
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '8px 0',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}
                      >
                        API Calls Today
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inferenceServiceData.map((service, index) => (
                      <tr
                        key={index}
                        style={{ borderBottom: '1px solid #f0f0f0' }}
                      >
                        <td style={{ padding: '12px 0', fontSize: '0.875rem' }}>
                          <Typography variant="body2" fontWeight="medium">
                            {service.name}
                          </Typography>
                        </td>
                        <td style={{ padding: '12px 0' }}>
                          <Chip
                            label={service.status}
                            size="small"
                            color={
                              service.status === 'running'
                                ? 'success'
                                : 'default'
                            }
                            variant="outlined"
                          />
                        </td>
                        <td style={{ padding: '12px 0', fontSize: '0.875rem' }}>
                          <Typography variant="body2" color="text.secondary">
                            {service.deployedModels}
                          </Typography>
                        </td>
                        <td
                          style={{
                            padding: '12px 0',
                            textAlign: 'right',
                            fontSize: '0.875rem',
                          }}
                        >
                          <Typography variant="body2" fontWeight="medium">
                            {service.apiCallsToday.toLocaleString()}
                          </Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
