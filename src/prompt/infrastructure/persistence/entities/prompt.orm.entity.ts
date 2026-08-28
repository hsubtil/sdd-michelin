import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('prompts')
export class PromptOrm {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'template_id', type: 'varchar', length: 36 })
  templateId: string;

  @Column({ name: 'version_used', type: 'integer' })
  versionUsed: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json' })
  variables: Record<string, string>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
