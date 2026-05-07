import { BadRequestException, NotFoundException } from '@nestjs/common';

import { GeneratePromptUseCase } from '@/prompt/application/use-cases/generate-prompt.use-case';
import { Prompt } from '@/prompt/domain/entities/prompt.entity';
import { IPromptRepository } from '@/prompt/domain/ports/out/i-prompt.repository';
import { TemplateVariable } from '@/template/domain/entities/template-variable.entity';
import { Template } from '@/template/domain/entities/template.entity';
import { ITemplateRepository } from '@/template/domain/ports/out/i-template.repository';

describe('GeneratePromptUseCase', () => {
  const templateId = '550e8400-e29b-41d4-a716-446655440000';

  const buildMockTemplate = (variables: TemplateVariable[]): Template =>
    Template.reconstitute({
      id: templateId,
      name: 'Test',
      tags: ['test'],
      content: 'Hello {{name}}, welcome to {{company}}!',
      variables,
      currentVersion: 1,
      createdAt: new Date(),
    });

  const buildRepositories = (
    template: Template | null,
  ): { templateRepo: ITemplateRepository; promptRepo: IPromptRepository } => ({
    templateRepo: {
      findByName: jest.fn(),
      findById: jest.fn().mockResolvedValue(template),
      createTemplateWithInitialVersion: jest.fn(),
      addNewVersion: jest.fn(),
      findVersionsByTemplateId: jest.fn(),
      findVersionByNumber: jest.fn(),
    },
    promptRepo: {
      save: jest.fn().mockImplementation(async (p: Prompt) => p),
    },
  });

  it('generates prompt with all provided variables', async () => {
    const variables = [
      TemplateVariable.create({ name: 'name', defaultValue: 'Customer' }),
      TemplateVariable.create({ name: 'company', defaultValue: 'Acme' }),
    ];
    const { templateRepo, promptRepo } = buildRepositories(buildMockTemplate(variables));
    const useCase = new GeneratePromptUseCase(templateRepo, promptRepo);

    const result = await useCase.execute({
      templateId,
      variables: { name: 'John', company: 'MyCorp' },
    });

    expect(result.content).toBe('Hello John, welcome to MyCorp!');
    expect(result.versionUsed).toBe(1);
    expect(result.variables).toEqual({ name: 'John', company: 'MyCorp' });
  });

  it('uses default values for missing variables', async () => {
    const variables = [
      TemplateVariable.create({ name: 'name', defaultValue: 'Customer' }),
      TemplateVariable.create({ name: 'company', defaultValue: 'Acme' }),
    ];
    const { templateRepo, promptRepo } = buildRepositories(buildMockTemplate(variables));
    const useCase = new GeneratePromptUseCase(templateRepo, promptRepo);

    const result = await useCase.execute({ templateId, variables: { name: 'Jane' } });

    expect(result.content).toBe('Hello Jane, welcome to Acme!');
  });

  it('throws BadRequestException for missing required variables (no default)', async () => {
    const variables = [
      TemplateVariable.create({ name: 'name', defaultValue: null }),
      TemplateVariable.create({ name: 'company', defaultValue: 'Acme' }),
    ];
    const { templateRepo, promptRepo } = buildRepositories(buildMockTemplate(variables));
    const useCase = new GeneratePromptUseCase(templateRepo, promptRepo);

    await expect(useCase.execute({ templateId })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException when template does not exist', async () => {
    const { templateRepo, promptRepo } = buildRepositories(null);
    const useCase = new GeneratePromptUseCase(templateRepo, promptRepo);

    await expect(useCase.execute({ templateId })).rejects.toBeInstanceOf(NotFoundException);
    expect(promptRepo.save).not.toHaveBeenCalled();
  });
});
