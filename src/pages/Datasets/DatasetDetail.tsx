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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Edit as EditIcon,
  Storage as DatasetIcon,
  Storage as StorageIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Dataset, DatasetVersion, DatasetFile } from '../../types';
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
      id={`dataset-tabpanel-${index}`}
      aria-labelledby={`dataset-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DatasetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Version management state
  const [versions, setVersions] = useState<DatasetVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<DatasetVersion | null>(
    null
  );
  const [files, setFiles] = useState<DatasetFile[]>([]);
  const [latestCommittedFiles, setLatestCommittedFiles] = useState<
    DatasetFile[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Pagination state
  const [versionsPage, setVersionsPage] = useState(1);
  const versionsPerPage = 10;

  // Delete version state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit dataset state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    fileFormat: 'Custom',
  });

  // Prevent duplicate API calls
  const hasLoadedDataset = useRef(false);
  const hasLoadedVersions = useRef(false);

  useEffect(() => {
    if (id && !hasLoadedDataset.current) {
      loadDataset();
    }
    if (id && !hasLoadedVersions.current) {
      loadVersions();
    }
  }, [id]);

  useEffect(() => {
    if (tabValue === 1 && id && !hasLoadedVersions.current) {
      // Load versions when switching to versions tab (in case they weren't loaded initially)
      loadVersions();
    }
  }, [tabValue, id]);

  useEffect(() => {
    if (currentVersion) {
      loadFiles(currentVersion.versionId);
    }
  }, [currentVersion]);

  useEffect(() => {
    if (versions.length > 0) {
      loadLatestCommittedFiles();
      // Reset to first page when versions change
      setVersionsPage(1);
    }
  }, [versions]);

  const loadDataset = async () => {
    if (hasLoadedDataset.current) return; // Prevent duplicate calls
    
    try {
      hasLoadedDataset.current = true;
      setLoading(true);
      setError(null);
      const data = await apiService.getDataset(id!);
      setDataset(data);
    } catch (err) {
      setError('Failed to load dataset');
      console.error('Error loading dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getLatestCommittedVersion = () => {
    if (versions.length === 0) return 'No versions';

    const committedVersions = versions.filter(v => v.status === 'COMMITTED');
    if (committedVersions.length === 0) return 'No committed versions';

    const latestCommitted = committedVersions.reduce((latest, current) =>
      current.versionNumber > latest.versionNumber ? current : latest
    );

    return `v${latestCommitted.versionNumber}`;
  };

  const getLatestCommittedVersionTotalSize = () => {
    if (latestCommittedFiles.length === 0) {
      if (versions.length === 0) return 'No versions';

      const committedVersions = versions.filter(v => v.status === 'COMMITTED');
      if (committedVersions.length === 0) return 'No committed versions';

      return 'No files in latest version';
    }

    const totalSize = latestCommittedFiles.reduce(
      (total, file) => total + (file.fileSize || 0),
      0
    );

    return formatFileSize(totalSize);
  };

  // Pagination functions
  const getPaginatedVersions = () => {
    const startIndex = (versionsPage - 1) * versionsPerPage;
    const endIndex = startIndex + versionsPerPage;
    return versions.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(versions.length / versionsPerPage);
  };

  const handleVersionsPageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setVersionsPage(page);
  };

  const handleDeleteVersion = (versionId: string) => {
    setVersionToDelete(versionId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteVersion = async () => {
    if (!id || !versionToDelete) return;

    try {
      setDeleting(true);
      await apiService.deleteVersion(id, versionToDelete);

      // Reload versions after successful deletion
      await loadVersions();

      // If the deleted version was the current version, set current version to null or another version
      if (currentVersion?.versionId === versionToDelete) {
        const remainingVersions = versions.filter(
          v => v.versionId !== versionToDelete
        );
        if (remainingVersions.length > 0) {
          // Set to latest draft or latest committed
          const latestDraft = remainingVersions.find(v => v.status === 'DRAFT');
          const latestCommitted = remainingVersions.find(
            v => v.status === 'COMMITTED'
          );
          setCurrentVersion(
            latestDraft || latestCommitted || remainingVersions[0]
          );
        } else {
          setCurrentVersion(null);
        }
      }

      setDeleteDialogOpen(false);
      setVersionToDelete(null);
    } catch (err) {
      console.error('Error deleting version:', err);
      setError('Failed to delete version');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = () => {
    if (dataset) {
      setEditForm({
        name: dataset.name || '',
        description: dataset.description || '',
        fileFormat: dataset.fileFormat || 'Custom',
      });
      setEditDialogOpen(true);
    }
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSubmit = async () => {
    if (!dataset || !id) return;

    try {
      setEditing(true);
      const updatedDataset = await apiService.updateDataset(id, {
        name: editForm.name,
        description: editForm.description,
        fileFormat: editForm.fileFormat,
      });
      setDataset(updatedDataset);
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating dataset:', err);
      setError('Failed to update dataset');
    } finally {
      setEditing(false);
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditForm({
      name: '',
      description: '',
      fileFormat: 'Custom',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileFormatFromMimeType = (mimeType?: string): string => {
    if (!mimeType) return 'Custom';
    switch (mimeType) {
      case 'text/csv':
        return 'CSV';
      case 'application/json':
        return 'JSON';
      case 'application/jsonl':
      case 'text/x-jsonl':
      case 'application/x-jsonl':
        return 'JSONL';
      case 'application/parquet':
        return 'Parquet';
      case 'application/x-hdf':
        return 'HDF5';
      case 'text/plain':
        return 'TXT';
      default:
        return 'Custom';
    }
  };

  // Version management functions
  const loadVersions = async () => {
    if (!id || hasLoadedVersions.current) return; // Prevent duplicate calls
    
    try {
      hasLoadedVersions.current = true;
      const versionsData = await apiService.getVersions(id);
      setVersions(versionsData);

      // Set current version to the latest draft or latest committed
      const latestDraft = versionsData.find(v => v.status === 'DRAFT');
      const latestCommitted = versionsData.find(v => v.status === 'COMMITTED');
      setCurrentVersion(latestDraft || latestCommitted || null);
    } catch (err) {
      console.error('Error loading versions:', err);
      setError('Failed to load versions');
    }
  };

  const loadFiles = async (versionId: string) => {
    if (!id) return;
    try {
      const filesData = await apiService.getFiles(id, versionId);
      setFiles(filesData);
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load files');
    }
  };

  const loadLatestCommittedFiles = async () => {
    if (!id || versions.length === 0) return;

    const committedVersions = versions.filter(v => v.status === 'COMMITTED');
    if (committedVersions.length === 0) {
      setLatestCommittedFiles([]);
      return;
    }

    const latestCommitted = committedVersions.reduce((latest, current) =>
      current.versionNumber > latest.versionNumber ? current : latest
    );

    try {
      const filesData = await apiService.getFiles(
        id,
        latestCommitted.versionId
      );
      setLatestCommittedFiles(filesData);
    } catch (err) {
      console.error('Error loading latest committed files:', err);
      setLatestCommittedFiles([]);
    }
  };

  const createNewVersion = async () => {
    if (!id) return;
    try {
      const newVersion = await apiService.createVersion(id, 'New version');
      setVersions(prev => [newVersion, ...prev]);
      setCurrentVersion(newVersion);
      await loadFiles(newVersion.versionId);
    } catch (err) {
      console.error('Error creating version:', err);
      setError('Failed to create new version');
    }
  };

  const commitVersion = async (versionId: string) => {
    if (!id) return;
    try {
      setCommitting(true);
      const committedVersion = await apiService.commitVersion(id, versionId);
      setVersions(prev =>
        prev.map(v => (v.versionId === versionId ? committedVersion : v))
      );
      setCurrentVersion(committedVersion);
      await loadLatestCommittedFiles(); // Reload latest committed files
    } catch (err) {
      console.error('Error committing version:', err);
      setError('Failed to commit version');
    } finally {
      setCommitting(false);
    }
  };

  const uploadFiles = async () => {
    if (!id || !currentVersion || selectedFiles.length === 0) return;

    try {
      setUploading(true);

      // Upload each file
      for (const file of selectedFiles) {
        await apiService.uploadFile(id, currentVersion.versionId, file);
      }

      // Reload files
      await loadFiles(currentVersion.versionId);

      setUploadDialogOpen(false);
      setSelectedFiles([]);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!id || !currentVersion) return;

    try {
      await apiService.deleteFile(id, currentVersion.versionId, fileId);
      await loadFiles(currentVersion.versionId);
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  const downloadFile = async (file: DatasetFile) => {
    if (!id || !currentVersion) return;

    try {
      await apiService.downloadVersionFile(
        id,
        currentVersion.versionId,
        file.fileId,
        file.fileName
      );
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading dataset...
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
        <Button onClick={() => navigate('/datasets')} sx={{ mt: 2 }}>
          Back to Datasets
        </Button>
      </Box>
    );
  }

  if (!dataset) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          Dataset not found
        </Typography>
        <Button onClick={() => navigate('/datasets')} sx={{ mt: 2 }}>
          Back to Datasets
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
          <DatasetIcon fontSize="large" />
        </Avatar>
        <Box flexGrow={1}>
          <Typography variant="h4" gutterBottom>
            {dataset.name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            {dataset.description || 'No description available'}
          </Typography>
          <Chip
            label="Dataset"
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
          >
            Edit
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<DescriptionIcon />} label="Overview" />
            <Tab icon={<HistoryIcon />} label="Versions" />
            <Tab icon={<VisibilityIcon />} label="Preview" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Dataset Information
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Dataset ID</strong>
                      </TableCell>
                      <TableCell>{dataset.id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>UUID</strong>
                      </TableCell>
                      <TableCell>{dataset.datasetUuid}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Name</strong>
                      </TableCell>
                      <TableCell>{dataset.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Description</strong>
                      </TableCell>
                      <TableCell>
                        {dataset.description || 'No description'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>File Format</strong>
                      </TableCell>
                      <TableCell>{dataset.fileFormat || 'Custom'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Latest Version</strong>
                      </TableCell>
                      <TableCell>{getLatestCommittedVersion()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Total Size</strong>
                      </TableCell>
                      <TableCell>
                        {getLatestCommittedVersionTotalSize()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Created</strong>
                      </TableCell>
                      <TableCell>
                        {new Date(dataset.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Updated</strong>
                      </TableCell>
                      <TableCell>
                        {new Date(dataset.updatedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Usage Code Section */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Usage Code
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <pre style={{ margin: 0, fontFamily: 'monospace' }}>
                  {`# Load dataset using pandas
import pandas as pd

# Download and load the dataset
df = pd.read_csv('${dataset.name}')

# Basic information
print(f"Dataset shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")

# Preview first few rows
print(df.head())

# Basic statistics
print(df.describe())`}
                </pre>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            {/* Version Management Header */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6">Version Management</Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={createNewVersion}
                >
                  New Version
                </Button>
                {currentVersion && currentVersion.status === 'DRAFT' && (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      onClick={() => setUploadDialogOpen(true)}
                    >
                      Upload Files
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => commitVersion(currentVersion.versionId)}
                      disabled={committing}
                      color="success"
                    >
                      {committing ? 'Committing...' : 'Commit Version'}
                    </Button>
                  </>
                )}
              </Box>
            </Box>

            {/* Left/Right Layout for Version History and Files */}
            <Grid container spacing={3}>
              {/* Left Side - Version History */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Version History
                    </Typography>
                    {versions.length === 0 ? (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ textAlign: 'center', py: 4 }}
                      >
                        No versions available. Create a new version to get
                        started.
                      </Typography>
                    ) : (
                      <>
                        <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                          {getPaginatedVersions().map(version => (
                            <Box
                              key={version.versionId}
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              p={1.5}
                              border={1}
                              borderColor="divider"
                              borderRadius={1}
                              mb={1}
                              sx={{
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'action.hover' },
                                backgroundColor:
                                  currentVersion?.versionId ===
                                  version.versionId
                                    ? 'action.selected'
                                    : 'transparent',
                              }}
                            >
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                onClick={() => {
                                  setCurrentVersion(version);
                                }}
                                sx={{ flexGrow: 1 }}
                              >
                                <Typography variant="body2" fontWeight="medium">
                                  v{version.versionNumber}
                                </Typography>
                                <Chip
                                  label={version.status}
                                  size="small"
                                  color={
                                    version.status === 'COMMITTED'
                                      ? 'success'
                                      : version.status === 'DRAFT'
                                      ? 'warning'
                                      : 'default'
                                  }
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {new Date(
                                    version.createdAt
                                  ).toLocaleDateString()}
                                </Typography>
                                {version.status === 'DRAFT' && (
                                  <IconButton
                                    size="small"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleDeleteVersion(version.versionId);
                                    }}
                                    sx={{
                                      color: 'error.main',
                                      '&:hover': {
                                        backgroundColor: 'error.light',
                                        color: 'error.dark',
                                      },
                                    }}
                                    title="Delete version"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Box>

                        {/* Pagination */}
                        {getTotalPages() > 1 && (
                          <Box
                            sx={{
                              mt: 2,
                              display: 'flex',
                              justifyContent: 'center',
                            }}
                          >
                            <Pagination
                              count={getTotalPages()}
                              page={versionsPage}
                              onChange={handleVersionsPageChange}
                              size="small"
                              color="primary"
                              showFirstButton
                              showLastButton
                            />
                          </Box>
                        )}

                        {/* Version count info */}
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ mt: 1, display: 'block', textAlign: 'center' }}
                        >
                          Showing {getPaginatedVersions().length} of{' '}
                          {versions.length} versions
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Side - Files List */}
              <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Typography variant="h6">
                        Files in Current Version
                      </Typography>
                      {currentVersion && (
                        <Typography variant="body2" color="textSecondary">
                          Version {currentVersion.versionNumber} •{' '}
                          {files.length} file{files.length !== 1 ? 's' : ''}
                        </Typography>
                      )}
                    </Box>
                    {files.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <StorageIcon
                          sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
                        />
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mb: 2 }}
                        >
                          No files in this version
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Upload files to get started
                        </Typography>
                      </Box>
                    ) : (
                      <TableContainer sx={{ maxHeight: '600px' }}>
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>File Name</TableCell>
                              <TableCell>Size</TableCell>
                              <TableCell>Format</TableCell>
                              <TableCell>File Path</TableCell>
                              <TableCell>Uploaded</TableCell>
                              <TableCell align="center">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {files.map(file => (
                              <TableRow key={file.fileId} hover>
                                <TableCell>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <StorageIcon
                                      fontSize="small"
                                      color="primary"
                                    />
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                    >
                                      {file.fileName}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {file.fileSize
                                      ? formatFileSize(file.fileSize)
                                      : 'Unknown'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={getFileFormatFromMimeType(
                                      file.fileFormat
                                    )}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    fontFamily="monospace"
                                    sx={{ fontSize: '0.75rem' }}
                                  >
                                    {file.filePath}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    {new Date(
                                      file.createdAt
                                    ).toLocaleDateString()}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Box
                                    display="flex"
                                    gap={1}
                                    justifyContent="center"
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() => downloadFile(file)}
                                      title="Download"
                                      color="primary"
                                    >
                                      <DownloadIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => deleteFile(file.fileId)}
                                      title="Delete"
                                      color="error"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Data Preview
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setPreviewDialogOpen(true)}
            startIcon={<VisibilityIcon />}
          >
            Preview Data
          </Button>
        </TabPanel>
      </Card>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Files to Version</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Select files to upload to the current version. Remember to commit
              the version when you're ready.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  Choose Files
                </Button>
              </label>
            </Box>
            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Files:
                </Typography>
                {selectedFiles.map((file, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py={1}
                  >
                    <Typography variant="body2">{file.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatFileSize(file.size)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={uploadFiles}
            variant="contained"
            disabled={selectedFiles.length === 0 || uploading}
          >
            {uploading
              ? 'Uploading...'
              : `Upload ${selectedFiles.length} File${
                  selectedFiles.length !== 1 ? 's' : ''
                }`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Data Preview</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Preview functionality will be implemented when file parsing is
            available
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Version Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Version</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this draft version?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This action cannot be undone. All files in this version will be
            permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteVersion}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={<DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete Version'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dataset Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Dataset</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Dataset Name"
              value={editForm.name}
              onChange={e => handleEditFormChange('name', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={editForm.description}
              onChange={e =>
                handleEditFormChange('description', e.target.value)
              }
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>File Format</InputLabel>
              <Select
                value={editForm.fileFormat}
                onChange={e =>
                  handleEditFormChange('fileFormat', e.target.value)
                }
                label="File Format"
              >
                <MenuItem value="Custom">Custom</MenuItem>
                <MenuItem value="JSONL">JSONL</MenuItem>
                <MenuItem value="JSON">JSON</MenuItem>
                <MenuItem value="CSV">CSV</MenuItem>
                <MenuItem value="Parquet">Parquet</MenuItem>
                <MenuItem value="HDF5">HDF5</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} disabled={editing}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={editing || !editForm.name.trim()}
            startIcon={<EditIcon />}
          >
            {editing ? 'Updating...' : 'Update Dataset'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DatasetDetail;
