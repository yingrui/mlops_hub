import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Description as FileIcon,
  TextSnippet as TextIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

// Mock data for different report types
const mockReports = {
  '1': {
    id: '1',
    name: 'Data Drift Report - 2024-01-15',
    type: 'data_drift',
    status: 'completed',
    createdAt: '2024-01-15T16:00:00Z',
    size: '2.3 MB',
    description:
      'Data drift detection and analysis report for model performance monitoring',
    summary: {
      overallDrift: 0.12,
      severity: 'medium',
      featuresAnalyzed: 15,
      samplesCompared: 10000,
      timeRange: '2024-01-01 to 2024-01-15',
    },
    fileTree: {
      name: 'data_drift_report',
      type: 'folder',
      children: [
        {
          name: 'summary.html',
          type: 'html',
          path: '/reports/data_drift/summary.html',
          size: 2048,
          isBinary: false,
        },
        {
          name: 'feature_analysis.html',
          type: 'html',
          path: '/reports/data_drift/feature_analysis.html',
          size: 4096,
          isBinary: false,
        },
        {
          name: 'charts',
          type: 'folder',
          children: [
            {
              name: 'drift_timeline.html',
              type: 'html',
              path: '/reports/data_drift/charts/drift_timeline.html',
              size: 1536,
              isBinary: false,
            },
            {
              name: 'distribution_comparison.html',
              type: 'html',
              path: '/reports/data_drift/charts/distribution_comparison.html',
              size: 2560,
              isBinary: false,
            },
          ],
        },
        {
          name: 'raw_data',
          type: 'folder',
          children: [
            {
              name: 'drift_metrics.json',
              type: 'json',
              path: '/reports/data_drift/raw_data/drift_metrics.json',
              size: 1024,
              isBinary: false,
            },
            {
              name: 'feature_stats.csv',
              type: 'csv',
              path: '/reports/data_drift/raw_data/feature_stats.csv',
              size: 2048,
              isBinary: false,
            },
          ],
        },
      ],
    },
  },
  '2': {
    id: '2',
    name: 'Data Mining Report - 2024-01-14',
    type: 'data_mining',
    status: 'completed',
    createdAt: '2024-01-14T14:30:00Z',
    size: '1.8 MB',
    description: 'Data mining insights and pattern analysis report',
    summary: {
      patternsFound: 8,
      confidence: 0.87,
      dataPoints: 50000,
      timeRange: '2024-01-01 to 2024-01-14',
    },
    fileTree: {
      name: 'data_mining_report',
      type: 'folder',
      children: [
        {
          name: 'executive_summary.html',
          type: 'html',
          path: '/reports/data_mining/executive_summary.html',
          size: 3072,
          isBinary: false,
        },
        {
          name: 'pattern_analysis.html',
          type: 'html',
          path: '/reports/data_mining/pattern_analysis.html',
          size: 5120,
          isBinary: false,
        },
        {
          name: 'insights.html',
          type: 'html',
          path: '/reports/data_mining/insights.html',
          size: 2048,
          isBinary: false,
        },
        {
          name: 'visualizations',
          type: 'folder',
          children: [
            {
              name: 'heatmap.html',
              type: 'html',
              path: '/reports/data_mining/visualizations/heatmap.html',
              size: 1792,
              isBinary: false,
            },
            {
              name: 'trends.html',
              type: 'html',
              path: '/reports/data_mining/visualizations/trends.html',
              size: 2304,
              isBinary: false,
            },
          ],
        },
      ],
    },
  },
  '3': {
    id: '3',
    name: 'Sampling and Auto Label Report - 2024-01-13',
    type: 'sampling_auto_label',
    status: 'completed',
    createdAt: '2024-01-13T15:45:00Z',
    size: '3.1 MB',
    description: 'Automated sampling and labeling analysis report',
    summary: {
      samplesProcessed: 25000,
      accuracy: 0.94,
      labelsGenerated: 18000,
      timeRange: '2024-01-01 to 2024-01-13',
    },
    fileTree: {
      name: 'sampling_auto_label_report',
      type: 'folder',
      children: [
        {
          name: 'overview.html',
          type: 'html',
          path: '/reports/sampling_auto_label/overview.html',
          size: 2560,
          isBinary: false,
        },
        {
          name: 'sampling_results.html',
          type: 'html',
          path: '/reports/sampling_auto_label/sampling_results.html',
          size: 4096,
          isBinary: false,
        },
        {
          name: 'labeling_analysis.html',
          type: 'html',
          path: '/reports/sampling_auto_label/labeling_analysis.html',
          size: 3584,
          isBinary: false,
        },
        {
          name: 'methodology.html',
          type: 'html',
          path: '/reports/sampling_auto_label/methodology.html',
          size: 2048,
          isBinary: false,
        },
        {
          name: 'data',
          type: 'folder',
          children: [
            {
              name: 'sampling_metrics.json',
              type: 'json',
              path: '/reports/sampling_auto_label/data/sampling_metrics.json',
              size: 1536,
              isBinary: false,
            },
            {
              name: 'label_quality.csv',
              type: 'csv',
              path: '/reports/sampling_auto_label/data/label_quality.csv',
              size: 3072,
              isBinary: false,
            },
          ],
        },
      ],
    },
  },
};

const ReportPage: React.FC = () => {
  const { id, reportId } = useParams<{
    id: string;
    reportId: string;
  }>();
  const navigate = useNavigate();

  const report =
    mockReports[reportId as keyof typeof mockReports] || mockReports['1'];

  const [selectedFile, setSelectedFile] = React.useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(
    new Set([
      'data_drift_report',
      'data_mining_report',
      'sampling_auto_label_report',
    ])
  );

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'html':
        return <TextIcon sx={{ fontSize: 18 }} />;
      case 'json':
        return <FileIcon sx={{ fontSize: 18 }} />;
      case 'csv':
        return <FileIcon sx={{ fontSize: 18 }} />;
      default:
        return <FileIcon sx={{ fontSize: 18 }} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileContent = (filePath: string) => {
    // Mock HTML content based on file path
    if (
      filePath.includes('summary.html') ||
      filePath.includes('executive_summary.html') ||
      filePath.includes('overview.html')
    ) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Report Summary</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .metric { display: inline-block; margin: 10px 20px 10px 0; }
            .metric-value { font-size: 24px; font-weight: bold; color: #1976d2; }
            .metric-label { font-size: 14px; color: #666; }
            .section { margin: 20px 0; }
            .chart-placeholder { background: #f9f9f9; border: 2px dashed #ccc; padding: 40px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${report.name}</h1>
            <p>Generated on ${new Date(
              report.createdAt
            ).toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Key Metrics</h2>
            <div class="metric">
              <div class="metric-value">${
                report.type === 'data_drift'
                  ? (report.summary as any).overallDrift
                  : report.type === 'data_mining'
                  ? (report.summary as any).patternsFound
                  : (report.summary as any).samplesProcessed.toLocaleString()
              }</div>
              <div class="metric-label">${
                report.type === 'data_drift'
                  ? 'Overall Drift Score'
                  : report.type === 'data_mining'
                  ? 'Patterns Found'
                  : 'Samples Processed'
              }</div>
            </div>
          </div>
          
          <div class="section">
            <h2>Summary</h2>
            <p>${report.description}</p>
          </div>
          
          <div class="section">
            <h2>Visualization</h2>
            <div class="chart-placeholder">
              <p>Interactive chart would be displayed here</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    if (
      filePath.includes('feature_analysis.html') ||
      filePath.includes('pattern_analysis.html') ||
      filePath.includes('sampling_results.html')
    ) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Detailed Analysis</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; }
            .chart-placeholder { background: #f9f9f9; border: 2px dashed #ccc; padding: 40px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>Detailed Analysis</h1>
          <p>This page contains detailed analysis results and visualizations.</p>
          
          <div class="chart-placeholder">
            <p>Detailed charts and graphs would be displayed here</p>
          </div>
          
          <h2>Data Table</h2>
          <table>
            <tr><th>Metric</th><th>Value</th><th>Status</th></tr>
            <tr><td>Sample 1</td><td>0.85</td><td>Good</td></tr>
            <tr><td>Sample 2</td><td>0.92</td><td>Excellent</td></tr>
            <tr><td>Sample 3</td><td>0.78</td><td>Fair</td></tr>
          </table>
        </body>
        </html>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Content</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .content { max-width: 800px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="content">
          <h1>Report Content</h1>
          <p>This is the content for ${filePath.split('/').pop()}</p>
          <p>File type: ${filePath.split('.').pop()}</p>
        </div>
      </body>
      </html>
    `;
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
              toggleFolder(item.path || item.name);
            } else {
              setSelectedFile(item.path);
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
          <IconButton onClick={() => navigate(`/monitoring/${id}`)}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {report.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {report.description}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => console.log('Download report')}
          >
            Download
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={() => console.log('Share report')}
          >
            Share
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => console.log('Print report')}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Main Content - File Tree and HTML Viewer */}
      <Grid container spacing={2} sx={{ height: '600px' }}>
        {/* File Tree Panel */}
        <Grid item xs={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Files
              </Typography>
              <Box sx={{ height: '500px', overflow: 'auto' }}>
                {renderFileTreeItem((report as any).fileTree)}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* HTML Content Viewer Panel */}
        <Grid item xs={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedFile
                  ? selectedFile.split('/').pop()
                  : 'Select a file to view'}
              </Typography>
              <Box
                sx={{
                  height: '500px',
                  overflow: 'auto',
                  backgroundColor: '#f5f5f5',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                {selectedFile ? (
                  <Box
                    sx={{
                      height: '100%',
                      '& iframe': {
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        borderRadius: 1,
                      },
                    }}
                  >
                    <iframe
                      srcDoc={getFileContent(selectedFile)}
                      title="Report Content"
                    />
                  </Box>
                ) : (
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
                      Select a file to view
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click on a file in the left panel to view its content
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportPage;
