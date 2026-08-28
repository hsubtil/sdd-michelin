import type {
  CreateTemplatePayload,
  GeneratePromptPayload,
  Prompt,
  TemplateSummary,
  TemplateVersion,
  TemplateWithVersion,
} from './types';

const BASE_URL = '/api/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      detail?: string;
      title?: string;
    } | null;
    throw new Error(
      problem?.detail ??
        problem?.title ??
        `Request failed (${response.status})`,
    );
  }

  return (await response.json()) as T;
}

export const api = {
  listTemplates: () => request<TemplateSummary[]>('/template'),
  getTemplate: (id: string) => request<TemplateWithVersion>(`/template/${id}`),
  getVersions: (id: string) =>
    request<TemplateVersion[]>(`/template/${id}/versions`),
  createTemplate: (payload: CreateTemplatePayload) =>
    request<TemplateSummary>('/template', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  generatePrompt: (payload: GeneratePromptPayload) =>
    request<Prompt>('/prompt', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
