import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../api/client';
import type { TemplateSummary } from '../api/types';

const SEARCH_DEBOUNCE_MS = 300;

export function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nameInput, setNameInput] = useState('');
  const [name, setName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setName(nameInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [nameInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listTemplates({ name, tags: selectedTags })
      .then((result) => {
        if (cancelled) return;
        setTemplates(result);
        setError(null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [name, selectedTags]);

  // Tag choices come from the unfiltered list so they stay stable while filtering.
  useEffect(() => {
    api
      .listTemplates()
      .then((result) =>
        setAllTags([...new Set(result.flatMap((template) => template.tags))].sort()),
      )
      .catch(() => undefined);
  }, []);

  const hasFilters = name.length > 0 || selectedTags.length > 0;

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  const clearFilters = () => {
    setNameInput('');
    setSelectedTags([]);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4">Templates</Typography>
          <Typography color="text.secondary">
            Browse every prompt template and its versions.
          </Typography>
        </Box>
        <Button component={Link} to="/templates/new" variant="contained" startIcon={<AddIcon />}>
          New template
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder="Search templates by name"
              size="small"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: nameInput !== '' && (
                    <InputAdornment position="end">
                      <IconButton size="small" aria-label="Clear search" onClick={() => setNameInput('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {allTags.length > 0 && (
              <>
                <Divider />
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Filter by tag
                  </Typography>
                  {hasFilters && (
                    <Button size="small" startIcon={<ClearIcon />} onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )}
                </Stack>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {allTags.map((tag) => {
                    const selected = selectedTags.includes(tag);
                    return (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        color={selected ? 'primary' : 'default'}
                        variant={selected ? 'filled' : 'outlined'}
                        onClick={() => toggleTag(tag)}
                        onDelete={selected ? () => toggleTag(tag) : undefined}
                        sx={{ fontWeight: 500 }}
                      />
                    );
                  })}
                </Stack>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {!loading && !error && templates.length > 0 && (
        <Typography variant="body2" color="text.secondary">
          {templates.length} template{templates.length > 1 ? 's' : ''}
          {hasFilters ? ' matching filters' : ''}
        </Typography>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && templates.length === 0 && (
        <Alert severity="info">
          {hasFilters
            ? 'No template matches these filters.'
            : 'No template yet. Create the first one.'}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
        }}
      >
        {templates.map((template) => (
          <Card key={template.id}>
            <CardActionArea component={Link} to={`/templates/${template.id}`}>
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                    {template.name}
                  </Typography>
                  <Chip size="small" color="primary" label={`v${template.currentVersion}`} />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {new Date(template.createdAt).toLocaleString()}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                  {template.tags.map((tag) => (
                    <Chip key={tag} size="small" variant="outlined" label={tag} />
                  ))}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
