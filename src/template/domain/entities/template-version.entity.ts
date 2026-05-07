import { TemplateVariable } from './template-variable.entity';

export interface ReconstituteTemplateVersionProps {
  id: string;
  templateId: string;
  versionNumber: number;
  content: string;
  tags: string[];
  variables: TemplateVariable[];
  createdAt: Date;
}

export class TemplateVersion {
  readonly id: string;
  readonly templateId: string;
  readonly versionNumber: number;
  readonly content: string;
  readonly tags: readonly string[];
  readonly variables: readonly TemplateVariable[];
  readonly createdAt: Date;

  private constructor(props: ReconstituteTemplateVersionProps) {
    this.id = props.id;
    this.templateId = props.templateId;
    this.versionNumber = props.versionNumber;
    this.content = props.content;
    this.tags = props.tags;
    this.variables = props.variables;
    this.createdAt = props.createdAt;
  }

  static reconstitute(props: ReconstituteTemplateVersionProps): TemplateVersion {
    return new TemplateVersion(props);
  }
}
