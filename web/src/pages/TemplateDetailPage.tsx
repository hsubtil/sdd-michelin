import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { api } from '../api/client';
import type { TemplateVersion, TemplateWithVersion } from '../api/types';

function ContentBlock({ children }: { children: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: 'grey.50',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 14,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
      }}
    >
      {children}
    </Paper>
  );
}

export function TemplateDetailPage() {
  const { id = '' } = useParams();
  const [template, setTemplate] = useState<TemplateWithVersion | null>(null);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getTemplate(id), api.getVersions(id)])
      .then(([templateResult, versionsResult]) => {
        setTemplate(templateResult);
        setVersions(versionsResult);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!template) return null;

  return (
    <Stack spacing={3}>
      <Button
        component={Link}
        to="/templates"
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: 'flex-start' }}
      >
        All templates
      </Button>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              {template.name}
            </Typography>
            <Chip color="primary" label={`current v${template.currentVersion}`} />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Created {new Date(template.createdAt).toLocaleString()}
          </Typography>

          <Stack direction="row" spacing={0.5} sx={{ mt: 1.5, mb: 2, flexWrap: 'wrap' }}>
            {template.tags.map((tag) => (
              <Chip key={tag} size="small" variant="outlined" label={tag} />
            ))}
          </Stack>

          <ContentBlock>{template.content}</ContentBlock>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Variables
          </Typography>
          {template.variables.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              None
            </Typography>
          ) : (
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
              {template.variables.map((variable) => (
                <Chip
                  key={variable.id}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  label={
                    variable.defaultValue
                      ? `${variable.name} = ${variable.defaultValue}`
                      : variable.name
                  }
                />
              ))}
            </Stack>
          )}

          <Button
            component={Link}
            to={`/prompts/new?templateId=${template.id}`}
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            sx={{ mt: 3 }}
          >
            Generate prompt
          </Button>
        </CardContent>
      </Card>

      <Typography variant="h6">Versions ({versions.length})</Typography>

      <Box>
        {versions.map((version) => (
          <Accordion key={version.versionNumber} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1.5} sx={{ width: '100%', alignItems: 'center' }}>
                <Chip size="small" label={`v${version.versionNumber}`} />
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                  {new Date(version.createdAt).toLocaleString()}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                  {version.tags.map((tag) => (
                    <Chip key={tag} size="small" variant="outlined" label={tag} />
                  ))}
                </Stack>
                <ContentBlock>{version.content}</ContentBlock>
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Stack>
  );
}
