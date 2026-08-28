import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import { TemplateVersionOrm } from '@/template/infrastructure/persistence/entities/template-version.orm.entity';

@Entity('templates')
export class TemplateOrm {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ name: 'current_version', type: 'integer' })
  currentVersion: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => TemplateVersionOrm, (version) => version.template, {
    cascade: false,
  })
  versions: TemplateVersionOrm[];
}
