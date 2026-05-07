import { randomUUID } from 'node:crypto';

import { TemplateVariable } from './template-variable.entity';

export interface CreateTemplateProps {
  name: string;
  tags: string[];
  content: string;
  variables: TemplateVariable[];
}

export interface ReconstituteTemplateProps {
  id: string;
  name: string;
  tags: string[];
  content: string;
  variables: TemplateVariable[];
  currentVersion: number;
  createdAt: Date;
}

export class Template {
  readonly id: string;
  readonly name: string;
  readonly tags: readonly string[];
  readonly content: string;
  readonly variables: readonly TemplateVariable[];
  readonly currentVersion: number;
  readonly createdAt: Date;

  private constructor(props: ReconstituteTemplateProps) {
    this.id = props.id;
    this.name = props.name;
    this.tags = props.tags;
    this.content = props.content;
    this.variables = props.variables;
    this.currentVersion = props.currentVersion;
    this.createdAt = props.createdAt;
  }

  static create(props: CreateTemplateProps): Template {
    return new Template({
      id: randomUUID(),
      name: props.name,
      tags: props.tags,
      content: props.content,
      variables: props.variables,
      currentVersion: 1,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: ReconstituteTemplateProps): Template {
    return new Template(props);
  }
}
