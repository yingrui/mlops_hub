import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridRowId,
  GridInitialState,
} from '@mui/x-data-grid';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Edit, Delete, Download, MoreVert } from '@mui/icons-material';

export interface DataTableProps {
  rows: any[];
  columns: GridColDef[];
  loading?: boolean;
  onRowClick?: (params: GridRowParams) => void;
  onEdit?: (id: GridRowId) => void;
  onDelete?: (id: GridRowId) => void;
  onDownload?: (id: GridRowId) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  checkboxSelection?: boolean;
  disableSelectionOnClick?: boolean;
  getRowId?: (row: any) => string | number;
  density?: 'comfortable' | 'standard' | 'compact';
  initialState?: GridInitialState;
}

const DataTable: React.FC<DataTableProps> = ({
  rows,
  columns,
  loading = false,
  onRowClick,
  onEdit,
  onDelete,
  onDownload,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  checkboxSelection = false,
  disableSelectionOnClick = false,
  getRowId,
  density = 'comfortable',
  initialState,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = React.useState<any>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleMenuClose();
  };

  // Check if there's already an actions column
  const hasActionsColumn = columns.some(
    col => col.field === 'actions' || col.type === 'actions'
  );

  const actionColumns: GridColDef[] = [];

  if ((onEdit || onDelete || onDownload) && !hasActionsColumn) {
    actionColumns.push({
      field: 'table_actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: params => (
        <IconButton onClick={e => handleMenuOpen(e, params.row)} size="small">
          <MoreVert />
        </IconButton>
      ),
    });
  }

  const allColumns = [...columns, ...actionColumns];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={allColumns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { pageSize: pageSize },
          },
          ...initialState,
        }}
        pageSizeOptions={pageSizeOptions}
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick={disableSelectionOnClick}
        onRowClick={onRowClick}
        getRowId={getRowId}
        density={density}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            cursor: onRowClick ? 'pointer' : 'default',
          },
        }}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {onDownload && (
          <MenuItem
            onClick={() => handleAction(() => onDownload(selectedRow?.id))}
          >
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={() => handleAction(() => onEdit(selectedRow?.id))}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem
            onClick={() => handleAction(() => onDelete(selectedRow?.id))}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default DataTable;
