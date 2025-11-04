import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  Description as TextIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Run } from '../../types';
import { apiService } from '../../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';

const RunDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['artifacts'])
  );
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<any>(null);
  const [artifactsLoading, setArtifactsLoading] = useState(false);
  const [artifactsError, setArtifactsError] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileContentLoading, setFileContentLoading] = useState(false);
  const [fileContentError, setFileContentError] = useState<string | null>(null);
  const [selectedFileInfo, setSelectedFileInfo] = useState<any>(null);

  // Prevent duplicate API calls
  const hasLoadedRun = useRef(false);
  const hasLoadedArtifacts = useRef(false);

  useEffect(() => {
    if (id && !hasLoadedRun.current) {
      loadRun();
    }
  }, [id]);

  useEffect(() => {
    if (id && run && !hasLoadedArtifacts.current) {
      loadArtifacts();
    }
  }, [id, run]);

  const loadRun = async () => {
    if (!id || hasLoadedRun.current) return;
    
    try {
      hasLoadedRun.current = true;
      setLoading(true);
      setError(null);

      const response = await apiService.getRun(id);
      const convertedRun = apiService.convertMLflowToRun(response);
      setRun(convertedRun);
    } catch (err) {
      console.error('Failed to load run:', err);
      setError(`Failed to load run: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadArtifacts = async () => {
    if (!id || hasLoadedArtifacts.current) return;
    
    try {
      hasLoadedArtifacts.current = true;
      setArtifactsLoading(true);
      setArtifactsError(null);

      const response = await apiService.listArtifacts(id);
      const fileTree = apiService.convertMLflowArtifactsToFileTree(response);
      setArtifacts(fileTree);
    } catch (err) {
      console.error('Failed to load artifacts:', err);
      setArtifactsError(`Failed to load artifacts: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setArtifactsLoading(false);
    }
  };

  const handleDownloadArtifact = async (filePath: string) => {
    if (!id) return;
    
    try {
      // Remove leading slash from filePath for MLflow API
      const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
      console.log('Downloading artifact:', filePath, '-> clean path:', cleanPath);
      
      const blob = await apiService.downloadArtifact(id, cleanPath);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filePath.split('/').pop() || 'artifact';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download artifact:', err);
      // You could add a toast notification here
    }
  };

  const handleDirectoryExpand = async (dirPath: string) => {
    if (!id) return;
    
    try {
      // Remove leading slash from dirPath for MLflow API
      const cleanPath = dirPath.startsWith('/') ? dirPath.substring(1) : dirPath;
      console.log('Expanding directory:', dirPath, '-> clean path:', cleanPath);
      
      const contents = await apiService.loadDirectoryContents(id, cleanPath);
      
      // Update the file tree to include the loaded directory contents
      const updateFileTree = (node: any): any => {
        if (node.path === dirPath && node.isDir) {
          return {
            ...node,
            children: contents,
            loaded: true
          };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(updateFileTree)
          };
        }
        return node;
      };
      
      setArtifacts(updateFileTree(artifacts));
    } catch (err) {
      console.error('Failed to load directory contents:', err);
      // You could add a toast notification here
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };


  const getFileExtension = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  const isTextFile = (filename: string, isBinary?: boolean): boolean => {
    // MLmodel is a special MLflow file that should always be treated as text
    if (filename === 'MLmodel') return true;
    
    if (isBinary) return false;
    
    const extension = getFileExtension(filename);
    const textExtensions = [
      'txt', 'md', 'json', 'yaml', 'yml', 'xml', 'html', 'css', 'js', 'ts', 'jsx', 'tsx',
      'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift',
      'sql', 'sh', 'bash', 'ps1', 'bat', 'log', 'csv', 'ini', 'cfg', 'conf', 'env',
      'dockerfile', 'makefile', 'cmake', 'gradle', 'maven', 'pom', 'xml'
    ];
    
    return textExtensions.includes(extension);
  };

  const loadFileContent = async (filePath: string, fileInfo: any) => {
    if (!id) return;
    
    // Special handling for MLmodel file - always load it regardless of binary status
    const isMLmodel = fileInfo.name === 'MLmodel';
    
    // Don't load if file is binary or too large (> 1MB), except for MLmodel
    if (!isMLmodel && (fileInfo.isBinary || (fileInfo.size && fileInfo.size > 1024 * 1024))) {
      setFileContent(null);
      setFileContentError(null);
      return;
    }
    
    // Don't load if it's not a text file, except for MLmodel
    if (!isMLmodel && !isTextFile(fileInfo.name, fileInfo.isBinary)) {
      setFileContent(null);
      setFileContentError(null);
      return;
    }
    
    try {
      setFileContentLoading(true);
      setFileContentError(null);
      
      const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
      const content = await apiService.downloadArtifact(id, cleanPath);
      
      // Convert Blob to text
      const textContent = await content.text();
      setFileContent(textContent);
    } catch (err) {
      console.error('Failed to load file content:', err);
      setFileContentError('Failed to load file content');
      setFileContent(null);
    } finally {
      setFileContentLoading(false);
    }
  };

  const handleFileSelect = (filePath: string, fileInfo: any) => {
    setSelectedFile(filePath);
    setSelectedFileInfo(fileInfo);
    setFileContent(null);
    setFileContentError(null);
    
    // Load file content if it's a text file and not too large
    if (fileInfo && !fileInfo.isDir) {
      loadFileContent(filePath, fileInfo);
    }
  };

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTreeItem = (item: any, level: number = 0) => {
    const isExpanded = expandedFolders.has(item.path || item.name);
    const isFolder = item.type === 'folder';
    const isSelected = selectedFile === item.path;

    return (
      <Box key={item.path || item.name}>
        <Box
          onClick={() => {
            if (isFolder) {
              if (!isExpanded) {
                // Expand folder and load contents if not loaded
                if (!item.loaded && item.isDir) {
                  handleDirectoryExpand(item.path);
                }
                toggleFolder(item.path || item.name);
              } else {
                toggleFolder(item.path || item.name);
              }
            } else {
              handleFileSelect(item.path, item);
            }
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            pl: level * 2 + 0.5,
            cursor: 'pointer',
            backgroundColor: isSelected ? 'primary.main' : 'transparent',
            color: isSelected ? 'white' : 'inherit',
            '&:hover': {
              backgroundColor: isSelected ? 'primary.dark' : 'grey.100',
            },
            borderRadius: 0.5,
            mb: 0.25,
          }}
        >
          {/* Expand/Collapse Icon */}
          {isFolder && (
            <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
              {isExpanded ? (
                <ExpandMoreIcon sx={{ fontSize: 16 }} />
              ) : (
                <ChevronRightIcon sx={{ fontSize: 16 }} />
              )}
            </Box>
          )}
          {!isFolder && <Box sx={{ width: 20 }} />}

          {/* File/Folder Icon */}
          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
            {isFolder ? (
              isExpanded ? (
                <FolderOpenIcon sx={{ fontSize: 18 }} />
              ) : (
                <FolderIcon sx={{ fontSize: 18 }} />
              )
            ) : (
              getFileIcon(item.type)
            )}
          </Box>

          {/* Name */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: isFolder ? 600 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {item.name}
          </Typography>

          {/* Size (for files only) */}
          {!isFolder && item.size && (
            <Typography
              variant="caption"
              sx={{
                ml: 1,
                fontFamily: 'monospace',
                fontSize: '0.75rem',
              }}
            >
              {formatFileSize(item.size)}
            </Typography>
          )}
        </Box>

        {/* Children (if folder is expanded) */}
        {isFolder && isExpanded && item.children && (
          <Box>
            {item.children.map((child: any) =>
              renderFileTreeItem(child, level + 1)
            )}
          </Box>
        )}
      </Box>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'finished':
        return <CheckCircleIcon color="success" />;
      case 'running':
        return <PlayIcon color="primary" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'cancelled':
        return <StopIcon color="warning" />;
      default:
        return <ScheduleIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'finished':
        return 'success';
      case 'running':
        return 'primary';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const safeTimestampToLocaleString = (timestamp: string | number | undefined | null): string => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Details Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Run ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {run?.id || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={run?.status || 'Unknown'}
                  color={getStatusColor(run?.status || '') as any}
                  size="small"
                  icon={getStatusIcon(run?.status || '')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Experiment ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {run?.experimentId || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">
                  {run?.duration ? formatDuration(run.duration) : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Started
                </Typography>
                <Typography variant="body1">
                  {safeTimestampToLocaleString(run?.startedAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Ended
                </Typography>
                <Typography variant="body1">
                  {safeTimestampToLocaleString(run?.endedAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Dataset Used
                </Typography>
                <Typography variant="body1">
                  {run?.dataset || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Solution
                </Typography>
                <Typography variant="body1">
                  Text Classification Pipeline
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Registered Models
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'primary.main',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': {
                      color: 'primary.dark',
                    },
                  }}
                  onClick={() => navigate('/models/1/versions/3')}
                >
                  BERT Sentiment Classifier
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {run?.tags?.map(tag => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Parameters Section */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Parameters
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Parameter</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(run?.parameters || {}).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {key}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {String(value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Metrics Section */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Metrics
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(run?.metrics || {}).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {key}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {typeof value === 'number' && key !== 'loss'
                          ? (value * 100).toFixed(3) + '%'
                          : String(value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'model':
        return <CodeIcon />;
      case 'log':
        return <TextIcon />;
      case 'metrics':
        return <FileIcon />;
      case 'config':
        return <FileIcon />;
      default:
        return <FileIcon />;
    }
  };

  const renderArtifacts = () => {
    if (artifactsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Box sx={{ textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body1">Loading artifacts...</Typography>
          </Box>
        </Box>
      );
    }

    // Create file tree structure from artifacts data
    const fileTree = artifacts || {
      name: 'artifacts',
      type: 'folder',
      children: []
    };

    if (artifactsError) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" color="error" gutterBottom>
              {artifactsError}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => {
                hasLoadedArtifacts.current = false;
                loadArtifacts();
              }}
            >
              Retry
            </Button>
          </Box>
        </Box>
      );
    }

    return (
      <Grid container spacing={2} sx={{ height: '600px' }}>
        {/* File Tree Panel */}
        <Grid item xs={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Artifacts
              </Typography>
              <Box sx={{ height: '500px', overflow: 'auto' }}>
                {fileTree.children && fileTree.children.length > 0 ? (
                  fileTree.children.map((child: any) => renderFileTreeItem(child, 0))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No artifacts found for this run.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Content Viewer Panel */}
        <Grid item xs={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {selectedFile
                    ? selectedFile.split('/').pop()
                    : 'Select a file to view'}
                </Typography>
                {selectedFile && selectedFileInfo && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadArtifact(selectedFile)}
                  >
                    Download
                  </Button>
                )}
              </Box>
              <Box
                sx={{
                  height: '400px',
                  overflow: 'auto',
                  backgroundColor: '#f5f5f5',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                {selectedFile ? (
                  (() => {
                    // Show loading state
                    if (fileContentLoading) {
                      return (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center',
                          }}
                        >
                          <LinearProgress sx={{ width: '100%', mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            Loading file content...
                          </Typography>
                        </Box>
                      );
                    }

                    // Show error state
                    if (fileContentError) {
                      return (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center',
                          }}
                        >
                          <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                          <Typography variant="h6" color="error" gutterBottom>
                            Error Loading File
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {fileContentError}
                          </Typography>
                        </Box>
                      );
                    }

                    // Show binary file message (except for MLmodel)
                    if (selectedFileInfo && selectedFileInfo.name !== 'MLmodel' && (selectedFileInfo.isBinary || !isTextFile(selectedFileInfo.name, selectedFileInfo.isBinary))) {
                      return (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center',
                          }}
                        >
                          <FileIcon
                            sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
                          />
                          <Typography
                            variant="h6"
                            color="text.secondary"
                            gutterBottom
                          >
                            {selectedFileInfo.isBinary ? 'Binary File' : 'Unsupported File Type'}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            paragraph
                          >
                            {selectedFileInfo.isBinary 
                              ? 'This file cannot be displayed as text. It\'s a binary file that needs to be downloaded.'
                              : 'This file type is not supported for text display. Please download the file to view its contents.'
                            }
                          </Typography>
                          {selectedFileInfo.size && selectedFileInfo.size > 1024 * 1024 && (
                            <Typography
                              variant="body2"
                              color="warning.main"
                              paragraph
                            >
                              File size ({formatFileSize(selectedFileInfo.size)}) exceeds 1MB limit for text display.
                            </Typography>
                          )}
                        </Box>
                      );
                    }

                    // Show file content
                    if (fileContent) {
                      return (
                        <Box
                          component="pre"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {fileContent}
                        </Box>
                      );
                    }

                    // Show no content message
                    return (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          textAlign: 'center',
                        }}
                      >
                        <FileIcon
                          sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          File content not available
                        </Typography>
                      </Box>
                    );
                  })()
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Click on a file in the left panel to view its contents
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderLogs = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              TensorBoard Logs
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
                textAlign: 'center',
                py: 4,
              }}
            >
              <ErrorIcon
                sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                TensorBoard is not configured
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This run does not have TensorBoard logging enabled. To view
                training metrics and visualizations, configure TensorBoard
                logging in your training script.
              </Typography>
              <Button variant="outlined" size="small">
                Configure TensorBoard
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderMetrics = () => {
    if (!run || !run.metrics) return null;
    
    // Create data array with single run for bar charts
    const runData = [run];
    
    // Get all available metrics from the run
    const availableMetrics = Object.keys(run.metrics).filter(key => 
      run.metrics[key] !== null && run.metrics[key] !== undefined
    );
    
    // If no metrics available, show message
    if (availableMetrics.length === 0) {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Metrics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No metrics available for this run.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }
    
    // Define colors for different metrics
    const metricColors = [
      '#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', 
      '#d32f2f', '#7b1fa2', '#388e3c', '#f57c00',
      '#5d4037', '#455a64', '#e91e63', '#3f51b5'
    ];
    
    // Helper function to format metric names
    const formatMetricName = (key: string) => {
      return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    };
    
    // Helper function to determine if metric should be displayed as percentage
    const isPercentageMetric = (key: string) => {
      const percentageKeys = ['accuracy', 'precision', 'recall', 'f1_score', 'f1', 'score'];
      return percentageKeys.some(pk => key.toLowerCase().includes(pk));
    };
    
    // Helper function to format metric value
    const formatMetricValue = (key: string, value: number) => {
      if (isPercentageMetric(key)) {
        return (value * 100).toFixed(1) + '%';
      }
      return value.toFixed(4);
    };

    return (
      <Grid container spacing={3}>
        {availableMetrics.map((metricKey, index) => {
          const color = metricColors[index % metricColors.length];
          const isPercentage = isPercentageMetric(metricKey);
          const yAxisDomain = isPercentage ? [0, 1] : undefined;
          
          return (
            <Grid item xs={12} md={6} key={metricKey}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {formatMetricName(metricKey)}
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={runData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={yAxisDomain} />
                      <RechartsTooltip
                        formatter={(value: number) => [
                          formatMetricValue(metricKey, value),
                          formatMetricName(metricKey),
                        ]}
                      />
                      <Bar 
                        dataKey={`metrics.${metricKey}`} 
                        fill={color} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderTraces = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Execution Traces
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
                textAlign: 'center',
                py: 4,
              }}
            >
              <ScheduleIcon
                sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No traces recorded
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This run does not have execution traces enabled. Traces provide
                detailed information about function calls, execution time, and
                resource usage during training.
              </Typography>
              <Button variant="outlined" size="small">
                Enable Tracing
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Run Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Run configuration and settings will be implemented in future
              versions.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Loading state
  if (loading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Loading Run...
          </Typography>
        </Box>
        <LinearProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Error Loading Run
          </Typography>
        </Box>
        <Card>
          <CardContent>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="contained" 
              onClick={() => {
                hasLoadedRun.current = false;
                loadRun();
              }}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // No run data
  if (!run) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Run Not Found
          </Typography>
        </Box>
        <Card>
          <CardContent>
            <Typography>The requested run could not be found.</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {run?.name || 'Unknown Run'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Run ID: {run?.id || 'N/A'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => console.log('Delete run')}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Tags */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {run?.tags?.map(tag => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Box>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<TimelineIcon />} label="Overview" />
            <Tab icon={<AssessmentIcon />} label="Metrics" />
            <Tab icon={<CodeIcon />} label="Logs" />
            <Tab icon={<TimelineIcon />} label="Traces" />
            <Tab icon={<SettingsIcon />} label="Artifacts" />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && renderOverview()}
          {activeTab === 1 && renderMetrics()}
          {activeTab === 2 && renderLogs()}
          {activeTab === 3 && renderTraces()}
          {activeTab === 4 && renderArtifacts()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RunDetail;
