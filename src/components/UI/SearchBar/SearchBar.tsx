import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Stack,
} from '@mui/material';
import { Search, FilterList, Clear } from '@mui/icons-material';

export interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
  filterOptions?: FilterOption[];
}

export interface SearchFilters {
  query: string;
  tags: string[];
  visibility: string;
  owner: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface FilterOption {
  label: string;
  value: string;
  options?: { label: string; value: string }[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search...',
  showFilters = true,
  filterOptions = [],
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    visibility: '',
    owner: '',
    dateRange: { start: '', end: '' },
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = () => {
    onSearch(query, { ...filters, query });
  };

  const handleClear = () => {
    setQuery('');
    setFilters({
      query: '',
      tags: [],
      visibility: '',
      owner: '',
      dateRange: { start: '', end: '' },
    });
    onSearch('', {
      query: '',
      tags: [],
      visibility: '',
      owner: '',
      dateRange: { start: '', end: '' },
    });
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box>
      <Box display="flex" gap={2} alignItems="center" mb={2}>
        <TextField
          fullWidth
          placeholder={placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton onClick={handleClear} edge="end">
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <IconButton onClick={handleSearch} color="primary">
          <Search />
        </IconButton>
        {showFilters && (
          <IconButton
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            color={showAdvancedFilters ? 'primary' : 'default'}
          >
            <FilterList />
          </IconButton>
        )}
      </Box>

      {showAdvancedFilters && (
        <Box mb={2}>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Visibility</InputLabel>
              <Select
                value={filters.visibility}
                onChange={e => handleFilterChange('visibility', e.target.value)}
                label="Visibility"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="private">Private</MenuItem>
                <MenuItem value="organization">Organization</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Owner"
              value={filters.owner}
              onChange={e => handleFilterChange('owner', e.target.value)}
              sx={{ minWidth: 150 }}
            />

            <TextField
              size="small"
              label="Start Date"
              type="date"
              value={filters.dateRange.start}
              onChange={e =>
                handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  start: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              size="small"
              label="End Date"
              type="date"
              value={filters.dateRange.end}
              onChange={e =>
                handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  end: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {filters.tags.length > 0 && (
            <Box mt={1}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {filters.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => {
                      const newTags = filters.tags.filter(
                        (_, i) => i !== index
                      );
                      handleFilterChange('tags', newTags);
                    }}
                    size="small"
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;
