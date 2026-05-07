import { randomUUID } from 'node:crypto';

export interface TemplateVariableProps {
  name: string;
  defaultValue?: string | null;
}

export class TemplateVariable {
  readonly id: string;
  readonly name: string;
  readonly defaultValue: string | null;

  private constructor(id: string, name: string, defaultValue: string | null) {
    this.id = id;
    this.name = name;
    this.defaultValue = defaultValue;
  }

  static create(props: TemplateVariableProps): TemplateVariable {
    return new TemplateVariable(randomUUID(), props.name, props.defaultValue ?? null);
  }

  static reconstitute(id: string, name: string, defaultValue: string | null): TemplateVariable {
    return new TemplateVariable(id, name, defaultValue);
  }
}
