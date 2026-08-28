import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ViewListIcon from '@mui/icons-material/ViewList';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { CreateTemplatePage } from './pages/CreateTemplatePage';
import { GeneratePromptPage } from './pages/GeneratePromptPage';
import { TemplateDetailPage } from './pages/TemplateDetailPage';
import { TemplatesPage } from './pages/TemplatesPage';

const NAV_ITEMS = [
  { to: '/templates', label: 'Templates', icon: <ViewListIcon /> },
  { to: '/templates/new', label: 'New template', icon: <AddIcon /> },
  { to: '/prompts/new', label: 'Generate prompt', icon: <AutoAwesomeIcon /> },
];

export function App() {
  const { pathname } = useLocation();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 3 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
              Prompt Versioning
            </Typography>
            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  startIcon={item.icon}
                  color={pathname === item.to ? 'primary' : 'inherit'}
                  variant={pathname === item.to ? 'contained' : 'text'}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/templates" replace />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/templates/new" element={<CreateTemplatePage />} />
          <Route path="/templates/:id" element={<TemplateDetailPage />} />
          <Route path="/prompts/new" element={<GeneratePromptPage />} />
          <Route
            path="*"
            element={<Typography color="text.secondary">Page not found.</Typography>}
          />
        </Routes>
      </Container>
    </Box>
  );
}
