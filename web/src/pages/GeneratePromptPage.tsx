import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { api } from '../api/client';
import type { Prompt, TemplateSummary, TemplateWithVersion } from '../api/types';

const monospaceBox = {
  p: 2,
  bgcolor: 'grey.50',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 14,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
} as const;

export function GeneratePromptPage() {
  const [searchParams] = useSearchParams();
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [templateId, setTemplateId] = useState(searchParams.get('templateId') ?? '');
  const [template, setTemplate] = useState<TemplateWithVersion | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .listTemplates()
      .then(setTemplates)
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!templateId) {
      setTemplate(null);
      return;
    }
    api
      .getTemplate(templateId)
      .then((result) => {
        setTemplate(result);
        setValues(
          Object.fromEntries(result.variables.map((v) => [v.name, v.defaultValue ?? ''])),
        );
        setError(null);
      })
      .catch((err: Error) => setError(err.message));
  }, [templateId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      setPrompt(await api.generatePrompt({ templateId, variables: values }));
    } catch (err) {
      setPrompt(null);
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4">Generate prompt</Typography>
        <Typography color="text.secondary">
          Pick a template, fill its variables, get the rendered prompt.
        </Typography>
      </Stack>

      <Card component="form" onSubmit={handleSubmit}>
        <CardContent>
          <Stack spacing={2.5}>
            <TextField
              select
              label="Template"
              value={templateId}
              required
              fullWidth
              onChange={(e) => setTemplateId(e.target.value)}
            >
              {templates.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name} (v{t.currentVersion})
                </MenuItem>
              ))}
            </TextField>

            {template && (
              <>
                <Paper variant="outlined" sx={monospaceBox}>
                  {template.content}
                </Paper>
                <Divider />
                {template.variables.map((variable) => (
                  <TextField
                    key={variable.id}
                    label={variable.name}
                    fullWidth
                    value={values[variable.name] ?? ''}
                    onChange={(e) =>
                      setValues((current) => ({ ...current, [variable.name]: e.target.value }))
                    }
                  />
                ))}
              </>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<AutoAwesomeIcon />}
              disabled={submitting || !templateId}
              sx={{ alignSelf: 'flex-start' }}
            >
              {submitting ? 'Generating…' : 'Generate'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {prompt && (
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Result
              </Typography>
              <Chip size="small" color="primary" label={`v${prompt.versionUsed}`} />
              <Button
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() => navigator.clipboard.writeText(prompt.content)}
              >
                Copy
              </Button>
            </Stack>
            <Paper variant="outlined" sx={{ ...monospaceBox, mt: 2 }}>
              {prompt.content}
            </Paper>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {new Date(prompt.createdAt).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
