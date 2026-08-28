export interface TemplateSummary {
  id: string;
  name: string;
  tags: string[];
  currentVersion: number;
  createdAt: string;
}

export interface Variable {
  id: string;
  name: string;
  defaultValue: string | null;
}

export interface TemplateWithVersion extends TemplateSummary {
  content: string;
  variables: Variable[];
}

export interface TemplateVersion {
  versionNumber: number;
  templateId: string;
  content: string;
  variables: Variable[];
  tags: string[];
  createdAt: string;
}

export interface CreateTemplatePayload {
  name: string;
  tags: string[];
  content: string;
  variables?: { name: string; defaultValue?: string | null }[];
}

export interface GeneratePromptPayload {
  templateId: string;
  variables?: Record<string, string>;
}

export interface Prompt {
  id: string;
  templateId: string;
  versionUsed: number;
  content: string;
  variables: Record<string, string>;
  createdAt: string;
}
