import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Unique,
} from 'typeorm';

import { TemplateOrm } from '@/template/infrastructure/persistence/entities/template.orm.entity';
import { VariableOrm } from '@/template/infrastructure/persistence/entities/variable.orm.entity';

@Entity('template_versions')
@Unique('uq_template_version', ['templateId', 'versionNumber'])
export class TemplateVersionOrm {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'template_id', type: 'varchar', length: 36 })
  templateId: string;

  @ManyToOne(() => TemplateOrm, (template) => template.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'template_id' })
  template: TemplateOrm;

  @Column({ name: 'version_number', type: 'integer' })
  versionNumber: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json' })
  tags: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => VariableOrm, (variable) => variable.templateVersion, {
    cascade: false,
  })
  variables: VariableOrm[];
}
