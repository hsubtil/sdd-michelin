import { TemplateVariable } from '@/template/domain/entities/template-variable.entity';
import { TemplateVersion } from '@/template/domain/entities/template-version.entity';
import { Template } from '@/template/domain/entities/template.entity';

/**
 * Driven port for template persistence operations.
 */
export interface ITemplateRepository {
  /** Find a template by its unique name (returns null if not found). */
  findByName(name: string): Promise<Template | null>;
  /** Find a template by its UUID, populated with the latest version (returns null if not found). */
  findById(id: string): Promise<Template | null>;
  /** Persist a new template with its first version. */
  createTemplateWithInitialVersion(template: Template): Promise<Template>;
  /** Create a new version for an existing template, carrying over variables. */
  addNewVersion(
    templateId: string,
    data: { content: string; tags: string[]; variables: TemplateVariable[] },
  ): Promise<Template>;
  /** Return all versions of a template ordered by version number descending. */
  findVersionsByTemplateId(templateId: string): Promise<TemplateVersion[]>;
  /** Return a specific version of a template, or null if not found. */
  findVersionByNumber(templateId: string, versionNumber: number): Promise<TemplateVersion | null>;
}
