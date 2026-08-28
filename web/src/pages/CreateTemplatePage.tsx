import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../api/client';

interface VariableInput {
  name: string;
  defaultValue: string;
}

export function CreateTemplatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [variables, setVariables] = useState<VariableInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateVariable = (index: number, patch: Partial<VariableInput>) =>
    setVariables((current) =>
      current.map((variable, i) => (i === index ? { ...variable, ...patch } : variable)),
    );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.createTemplate({
        name,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        content,
        variables: variables
          .filter((variable) => variable.name.trim() !== '')
          .map((variable) => ({
            name: variable.name.trim(),
            defaultValue: variable.defaultValue === '' ? null : variable.defaultValue,
          })),
      });
      navigate(`/templates/${created.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3} component="form" onSubmit={handleSubmit}>
      <Stack>
        <Typography variant="h4">New template</Typography>
        <Typography color="text.secondary">
          Use <code>{'{{variable}}'}</code> placeholders inside the content.
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={2.5}>
            <TextField
              label="Name"
              value={name}
              required
              fullWidth
              slotProps={{ htmlInput: { maxLength: 50 } }}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Tags"
              helperText="Comma separated"
              value={tags}
              required
              fullWidth
              onChange={(e) => setTags(e.target.value)}
            />
            <TextField
              label="Content"
              value={content}
              required
              fullWidth
              multiline
              minRows={6}
              placeholder="Hello {{name}}, thank you!"
              onChange={(e) => setContent(e.target.value)}
            />

            <Divider />

            <Typography variant="subtitle1">Variables</Typography>
            {variables.map((variable, index) => (
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }} key={index}>
                <TextField
                  label="Name"
                  size="small"
                  value={variable.name}
                  onChange={(e) => updateVariable(index, { name: e.target.value })}
                />
                <TextField
                  label="Default value"
                  size="small"
                  fullWidth
                  value={variable.defaultValue}
                  onChange={(e) => updateVariable(index, { defaultValue: e.target.value })}
                />
                <IconButton
                  aria-label="Remove variable"
                  onClick={() =>
                    setVariables((current) => current.filter((_, i) => i !== index))
                  }
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Stack>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() =>
                setVariables((current) => [...current, { name: '', defaultValue: '' }])
              }
              sx={{ alignSelf: 'flex-start' }}
            >
              Add variable
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={submitting}
        sx={{ alignSelf: 'flex-start' }}
      >
        {submitting ? 'Creating…' : 'Create template'}
      </Button>
    </Stack>
  );
}
