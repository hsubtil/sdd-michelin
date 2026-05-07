import { Template } from '@/template/domain/entities/template.entity';

/**
 * Driven port for template persistence operations.
 */
export interface ITemplateRepository {
  findByName(name: string): Promise<Template | null>;
  createTemplateWithInitialVersion(template: Template): Promise<Template>;
}
