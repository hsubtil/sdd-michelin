import { BadRequestException, NotFoundException } from '@nestjs/common';

import { UpdateTemplateUseCase } from '@/template/application/use-cases/update-template.use-case';
import { Template } from '@/template/domain/entities/template.entity';
import { ITemplateRepository } from '@/template/domain/ports/out/i-template.repository';

describe('UpdateTemplateUseCase', () => {
  const mockTemplate = Template.create({
    name: 'Customer Email',
    tags: ['email'],
    content: 'Hello {{name}}',
    variables: [],
  });

  const buildRepository = (template: Template | null): ITemplateRepository => ({
    findByName: jest.fn(),
    findById: jest.fn().mockResolvedValue(template),
    createTemplateWithInitialVersion: jest.fn(),
    addNewVersion: jest.fn().mockImplementation(async (_id, data) =>
      Template.reconstitute({
        id: mockTemplate.id,
        name: mockTemplate.name,
        tags: data.tags,
        content: data.content,
        variables: data.variables,
        currentVersion: mockTemplate.currentVersion + 1,
        createdAt: mockTemplate.createdAt,
      }),
    ),
    findVersionsByTemplateId: jest.fn(),
    findVersionByNumber: jest.fn(),
  });

  it('creates a new version with updated content', async () => {
    const repository = buildRepository(mockTemplate);
    const useCase = new UpdateTemplateUseCase(repository);

    const result = await useCase.execute(mockTemplate.id, { content: 'New content' });

    expect(result.content).toBe('New content');
    expect(result.currentVersion).toBe(2);
    expect(repository.addNewVersion).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundException when template does not exist', async () => {
    const repository = buildRepository(null);
    const useCase = new UpdateTemplateUseCase(repository);

    await expect(useCase.execute('missing-id', { content: 'x' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws BadRequestException when neither content nor tags are provided', async () => {
    const repository = buildRepository(mockTemplate);
    const useCase = new UpdateTemplateUseCase(repository);

    await expect(useCase.execute(mockTemplate.id, {})).rejects.toBeInstanceOf(BadRequestException);
  });
});
