import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('prompts')
export class PromptOrm {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @Column({ name: 'version_used', type: 'integer' })
  versionUsed: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb' })
  variables: Record<string, string>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
