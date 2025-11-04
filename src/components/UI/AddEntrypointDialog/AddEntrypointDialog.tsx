import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { apiService } from '../../../services/api';
import { InferenceService } from '../../../types';

interface AddEntrypointDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (entrypoint: any) => Promise<void>;
}

const AddEntrypointDialog: React.FC<AddEntrypointDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    version: '1.0.0',
    type: 'api',
    status: 'inactive',
    method: 'POST',
    inferenceServiceId: '',
    modelName: '',
    modelType: '',
    path: '/predict',
    fullInferencePath: '',
    tags: JSON.stringify([]),
    visibility: 'private',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [inferenceServices, setInferenceServices] = useState<InferenceService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadInferenceServices();
    }
  }, [open]);

  const loadInferenceServices = async () => {
    try {
      setServicesLoading(true);
      const services = await apiService.getInferenceServices();
      setInferenceServices(services);
    } catch (err) {
      console.error('Failed to load inference services:', err);
    } finally {
      setServicesLoading(false);
    }
  };

  const loadModelsForService = async (serviceId: number) => {
    if (!serviceId) {
      setAvailableModels([]);
      return;
    }
    
    try {
      setModelsLoading(true);
      const models = await apiService.getInferenceServiceLoadedModels(serviceId);
      setAvailableModels(models);
    } catch (err) {
      console.error('Failed to load models:', err);
      setAvailableModels([]);
    } finally {
      setModelsLoading(false);
    }
  };

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData((prev: any) => ({
      ...prev,
      [field]: field === 'inferenceServiceId' ? (value ? Number(value) : null) : value,
    }));
  };

  const handleSelectChange = (field: string) => (
    event: any
  ) => {
    const value = event.target.value;
    setFormData((prev: any) => {
      const newFormData = {
        ...prev,
        [field]: value,
      };
      
      // When inference service changes, load models
      if (field === 'inferenceServiceId' && value) {
        loadModelsForService(Number(value));
      }
      
      return newFormData;
    });
  };

  const handleModelSelect = (event: any) => {
    const modelName = event.target.value;
    // Find the selected model to get its uri
    const selectedModel = availableModels.find((m: any) => (m.name || m) === modelName);
    
    if (selectedModel && selectedModel.uri) {
      // Use the uri from the inference server response
      setFormData((prev: any) => ({
        ...prev,
        modelName: modelName,
        modelType: selectedModel.type || '',
        fullInferencePath: selectedModel.uri,
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        modelName: modelName,
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const currentTags = formData.tags ? JSON.parse(formData.tags) : [];
      if (!currentTags.includes(tagInput.trim())) {
        const newTags = [...currentTags, tagInput.trim()];
        setFormData((prev: any) => ({
          ...prev,
          tags: JSON.stringify(newTags),
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = formData.tags ? JSON.parse(formData.tags) : [];
    const newTags = currentTags.filter((tag: string) => tag !== tagToRemove);
    setFormData((prev: any) => ({
      ...prev,
      tags: JSON.stringify(newTags),
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Basic validation
      if (!formData.name?.trim()) {
        setError('Entrypoint name is required');
        return;
      }
      
      if (!formData.inferenceServiceId) {
        setError('Inference service is required');
        return;
      }

      if (!formData.fullInferencePath?.trim()) {
        setError('Inference API path is required');
        return;
      }

      await onSave(formData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entrypoint');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      version: '1.0.0',
      type: 'api',
      status: 'inactive',
      method: 'POST',
      inferenceServiceId: '',
      modelName: '',
      modelType: '',
      path: '/predict',
      fullInferencePath: '',
      tags: JSON.stringify([]),
      visibility: 'private',
    });
    setTagInput('');
    setAvailableModels([]);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Entrypoint</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Entrypoint Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
              placeholder="e.g., sentiment-analysis-api"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Version"
              value={formData.version}
              onChange={handleInputChange('version')}
              placeholder="1.0.0"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              multiline
              rows={2}
              placeholder="Describe the purpose of this entrypoint"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={handleSelectChange('type')}
              >
                <MenuItem value="api">API</MenuItem>
                <MenuItem value="batch">Batch</MenuItem>
                <MenuItem value="streaming">Streaming</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="webhook">Webhook</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Method</InputLabel>
              <Select
                value={formData.method}
                label="Method"
                onChange={handleSelectChange('method')}
              >
                <MenuItem value="GET">GET</MenuItem>
                <MenuItem value="POST">POST</MenuItem>
                <MenuItem value="PUT">PUT</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
                <MenuItem value="PATCH">PATCH</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Inference Service Configuration
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel required>Inference Service</InputLabel>
              <Select
                value={formData.inferenceServiceId || ''}
                label="Inference Service"
                onChange={handleSelectChange('inferenceServiceId')}
                disabled={servicesLoading}
              >
                {inferenceServices.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
                  </MenuItem>
                ))}
              </Select>
              {servicesLoading && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption">Loading services...</Typography>
                </Box>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel required>Model</InputLabel>
              <Select
                value={formData.modelName || ''}
                label="Model"
                onChange={handleModelSelect}
                disabled={!formData.inferenceServiceId || modelsLoading}
              >
                {availableModels.length > 0 ? (
                  availableModels.map((model, index) => {
                    const displayName = model.name || model;
                    const type = model.type || 'unknown';
                    return (
                      <MenuItem key={index} value={displayName}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body1">{displayName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Type: {type} • URI: {model.uri || '/infer/unknown/unknown'}
                          </Typography>
                        </Box>
                      </MenuItem>
                    );
                  })
                ) : (
                  <MenuItem value="" disabled>
                    {formData.inferenceServiceId ? 'No models available' : 'Select inference service first'}
                  </MenuItem>
                )}
              </Select>
              {modelsLoading && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption">Loading models...</Typography>
                </Box>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Inference API Path"
              value={formData.fullInferencePath}
              onChange={handleInputChange('fullInferencePath')}
              placeholder="/infer/text-classification/emotion-classifier"
              helperText="Auto-filled when model is selected, or enter custom path"
              required
            />
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Tags
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="Add Tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Enter tag name"
                size="small"
              />
              <Button variant="outlined" onClick={handleAddTag} size="small">
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(formData.tags ? JSON.parse(formData.tags) : []).map((tag: string, index: number) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Creating...' : 'Create Entrypoint'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEntrypointDialog;

