import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from 'typeorm';

import { TemplateVersionOrm } from '@/template/infrastructure/persistence/entities/template-version.orm.entity';

@Entity('template_variables')
export class VariableOrm {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'template_version_id', type: 'uuid' })
  templateVersionId: string;

  @ManyToOne(() => TemplateVersionOrm, (templateVersion) => templateVersion.variables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'template_version_id' })
  templateVersion: TemplateVersionOrm;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'default_value', type: 'text', nullable: true })
  defaultValue: string | null;
}
