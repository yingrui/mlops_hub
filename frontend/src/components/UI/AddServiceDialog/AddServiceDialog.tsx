import React, { useState } from 'react';
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
} from '@mui/material';
import { InferenceService } from '../../../types';

interface AddServiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (service: Partial<InferenceService>) => Promise<void>;
}

const AddServiceDialog: React.FC<AddServiceDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<InferenceService>>({
    name: '',
    description: '',
    baseUrl: '',
    namespace: 'default',
    replicas: 1,
    cpu: '1',
    memory: '2Gi',
    image: '',
    port: 8080,
    tags: JSON.stringify([]),
    status: 'pending',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field: keyof InferenceService) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'replicas' || field === 'port' ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const currentTags = formData.tags ? JSON.parse(formData.tags) : [];
      if (!currentTags.includes(tagInput.trim())) {
        const newTags = [...currentTags, tagInput.trim()];
        setFormData(prev => ({
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
    setFormData(prev => ({
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
        setError('Service name is required');
        return;
      }
      
      if (!formData.baseUrl?.trim()) {
        setError('Base URL is required');
        return;
      }

      await onSave(formData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      baseUrl: '',
      namespace: 'default',
      replicas: 1,
      cpu: '1',
      memory: '2Gi',
      image: '',
      port: 8080,
      tags: JSON.stringify([]),
      status: 'pending',
    });
    setTagInput('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Inference Service</DialogTitle>
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
              label="Service Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
              placeholder="e.g., nlp-inference-service"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              multiline
              rows={2}
              placeholder="Describe the purpose of this inference service"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Base URL"
              value={formData.baseUrl}
              onChange={handleInputChange('baseUrl')}
              required
              placeholder="e.g., https://nlp-service.mlops-hub.com"
            />
          </Grid>

          {/* Kubernetes Service Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Kubernetes Service Settings
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Namespace"
              value={formData.namespace}
              onChange={handleInputChange('namespace')}
              placeholder="e.g., mlops-prod"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Image"
              value={formData.image}
              onChange={handleInputChange('image')}
              placeholder="e.g., paddlepaddle/paddlenlp:latest"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Port"
              type="number"
              value={formData.port}
              onChange={handleInputChange('port')}
              placeholder="8080"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Replicas"
              type="number"
              value={formData.replicas}
              onChange={handleInputChange('replicas')}
              placeholder="1"
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="CPU"
              value={formData.cpu}
              onChange={handleInputChange('cpu')}
              placeholder="e.g., 1, 500m"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Memory"
              value={formData.memory}
              onChange={handleInputChange('memory')}
              placeholder="e.g., 2Gi, 512Mi"
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
          {loading ? 'Creating...' : 'Create Service'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddServiceDialog;