import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  LinearProgress,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Share as ShareIcon,
  Description as DescriptionIcon,
  PlayArrow as DeployIcon,
  Assessment as PerformanceIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Model, MLflowRegisteredModel, MLflowModelVersion } from '../../types';
import { apiService } from '../../services/api';

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
      id={`model-tabpanel-${index}`}
      aria-labelledby={`model-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ModelDetail: React.FC = () => {
  const { id, version } = useParams<{ id: string; version?: string }>();
  const navigate = useNavigate();
  const [model, setModel] = useState<Model | null>(null);
  const [mlflowModel, setMlflowModel] = useState<MLflowRegisteredModel | null>(null);
  const [modelVersions, setModelVersions] = useState<MLflowModelVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<MLflowModelVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Prevent duplicate API calls
  const hasLoadedModelData = useRef(false);

  const safeTimestampToLocaleString = (timestamp: number | undefined): string => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return 'N/A';
      }
      return date.toLocaleString();
    } catch (error) {
      console.warn('Error converting timestamp:', timestamp, error);
      return 'N/A';
    }
  };

  // Mock training history data (would be fetched from MLflow runs)
  const trainingHistory = [
    { epoch: 1, accuracy: 0.75, loss: 0.65 },
    { epoch: 2, accuracy: 0.82, loss: 0.52 },
    { epoch: 3, accuracy: 0.87, loss: 0.41 },
    { epoch: 4, accuracy: 0.9, loss: 0.33 },
    { epoch: 5, accuracy: 0.92, loss: 0.28 },
    { epoch: 6, accuracy: 0.94, loss: 0.24 },
    { epoch: 7, accuracy: 0.95, loss: 0.21 },
    { epoch: 8, accuracy: 0.96, loss: 0.18 },
    { epoch: 9, accuracy: 0.97, loss: 0.16 },
    { epoch: 10, accuracy: 0.98, loss: 0.15 },
  ];

  useEffect(() => {
    if (id && !hasLoadedModelData.current) {
      loadModelData();
    }
  }, [id, version]);

  const loadModelData = async () => {
    if (hasLoadedModelData.current) return; // Prevent duplicate calls
    
    try {
      hasLoadedModelData.current = true;
      setLoading(true);
      setError(null);

      // Decode the model name in case it contains special characters
      const modelName = decodeURIComponent(id!);

      // Fetch MLflow model data
      const [mlflowModelData, versionsData] = await Promise.all([
        apiService.getMLflowModel(modelName),
        apiService.getMLflowModelVersions(modelName)
      ]);

      setMlflowModel(mlflowModelData);
      setModelVersions(versionsData.model_versions || []);

      // Find the specific version or use the latest
      let targetVersion = versionsData.model_versions?.[0];
      if (version) {
        targetVersion = versionsData.model_versions?.find(v => v.version === version) || targetVersion;
      }
      setSelectedVersion(targetVersion);

      // Convert to frontend Model format
      const convertedModel = apiService.convertMLflowToModel(mlflowModelData, targetVersion);
      setModel(convertedModel);
    } catch (err) {
      console.error('Failed to load model data:', err);
      console.error('Error details:', err);
      setError(`Failed to load model data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading model...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/models')} startIcon={<ArrowBackIcon />}>
          Back to Models
        </Button>
      </Box>
    );
  }

  if (!model) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          Model not found
        </Typography>
        <Button onClick={() => navigate('/models')} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Back to Models
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64 }}>
          <DescriptionIcon fontSize="large" />
        </Avatar>
        <Box flexGrow={1}>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Typography variant="h4">
              {model.name}
            </Typography>
            {selectedVersion && (
              <Chip
                label={`Version ${selectedVersion.version}`}
                color="primary"
                size="small"
              />
            )}
            {selectedVersion?.current_stage && (
              <Chip
                label={selectedVersion.current_stage}
                color={
                  selectedVersion.current_stage === 'Production'
                    ? 'success'
                    : selectedVersion.current_stage === 'Staging'
                    ? 'warning'
                    : selectedVersion.current_stage === 'Archived'
                    ? 'error'
                    : 'default'
                }
                size="small"
                variant="outlined"
              />
            )}
            {selectedVersion?.status && (
              <Chip
                label={selectedVersion.status}
                color={
                  selectedVersion.status === 'READY'
                    ? 'success'
                    : selectedVersion.status === 'FAILED'
                    ? 'error'
                    : 'warning'
                }
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            {model.description || selectedVersion?.description || 'No description available'}
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
            {model.tags.map((tag, index) => (
              <Chip key={index} label={tag} size="small" />
            ))}
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<DeployIcon />}
            onClick={() => console.log('Deploy model')}
          >
            Deploy
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={() => console.log('Share model')}
          >
            Share
          </Button>
        </Box>
      </Box>


      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<DescriptionIcon />} label="Overview" />
            <Tab icon={<PerformanceIcon />} label="Versions" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Model Information
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Name</strong>
                      </TableCell>
                      <TableCell>{model.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Version</strong>
                      </TableCell>
                      <TableCell>
                        {selectedVersion?.version || 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Run ID</strong>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {selectedVersion?.run_id || 'N/A'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Status</strong>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={selectedVersion?.status || 'Unknown'}
                          color={
                            selectedVersion?.status === 'READY'
                              ? 'success'
                              : selectedVersion?.status === 'FAILED'
                              ? 'error'
                              : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Owner</strong>
                      </TableCell>
                      <TableCell>{model.owner.username}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Created</strong>
                      </TableCell>
                      <TableCell>
                        {safeTimestampToLocaleString(new Date(model.createdAt).getTime())}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Last Updated</strong>
                      </TableCell>
                      <TableCell>
                        {safeTimestampToLocaleString(new Date(model.updatedAt).getTime())}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Model Tags
              </Typography>
              <Card>
                <CardContent>
                  {mlflowModel?.tags && mlflowModel.tags.length > 0 ? (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {mlflowModel.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={`${tag.key}: ${tag.value}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No tags available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Model Versions
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Version</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Run ID</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>User</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modelVersions.map((version) => (
                  <TableRow 
                    key={version.version}
                    selected={selectedVersion?.version === version.version}
                    hover
                    onClick={() => {
                      setSelectedVersion(version);
                      navigate(`/models/${id}/versions/${version.version}`);
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {version.version}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={version.status}
                        size="small"
                        color={
                          version.status === 'READY'
                            ? 'success'
                            : version.status === 'FAILED'
                            ? 'error'
                            : 'warning'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {version.run_id || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {safeTimestampToLocaleString(version.creation_timestamp)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {version.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>{version.user_id || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>


      </Card>
    </Box>
  );
};

export default ModelDetail;
