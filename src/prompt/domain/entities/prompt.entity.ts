import { randomUUID } from 'node:crypto';

export interface CreatePromptProps {
  templateId: string;
  versionUsed: number;
  content: string;
  variables: Record<string, string>;
}

export interface ReconstitutePromptProps extends CreatePromptProps {
  id: string;
  createdAt: Date;
}

export class Prompt {
  readonly id: string;
  readonly templateId: string;
  readonly versionUsed: number;
  readonly content: string;
  readonly variables: Readonly<Record<string, string>>;
  readonly createdAt: Date;

  private constructor(props: ReconstitutePromptProps) {
    this.id = props.id;
    this.templateId = props.templateId;
    this.versionUsed = props.versionUsed;
    this.content = props.content;
    this.variables = props.variables;
    this.createdAt = props.createdAt;
  }

  static create(props: CreatePromptProps): Prompt {
    return new Prompt({
      ...props,
      id: randomUUID(),
      createdAt: new Date(),
    });
  }

  static reconstitute(props: ReconstitutePromptProps): Prompt {
    return new Prompt(props);
  }
}
