import { NotFoundException } from '@nestjs/common';

import { GetTemplateUseCase } from '@/template/application/use-cases/get-template.use-case';
import { Template } from '@/template/domain/entities/template.entity';
import { ITemplateRepository } from '@/template/domain/ports/out/i-template.repository';

describe('GetTemplateUseCase', () => {
  const mockTemplate = Template.create({
    name: 'Customer Email',
    tags: ['email'],
    content: 'Hello {{name}}',
    variables: [],
  });

  it('returns the template when found', async () => {
    const repository: ITemplateRepository = {
      findByName: jest.fn(),
      findById: jest.fn().mockResolvedValue(mockTemplate),
      createTemplateWithInitialVersion: jest.fn(),
      addNewVersion: jest.fn(),
      findVersionsByTemplateId: jest.fn(),
      findVersionByNumber: jest.fn(),
    };

    const useCase = new GetTemplateUseCase(repository);
    const result = await useCase.execute(mockTemplate.id);

    expect(result.id).toBe(mockTemplate.id);
    expect(result.name).toBe('Customer Email');
    expect(result.content).toBe('Hello {{name}}');
  });

  it('throws NotFoundException when template is not found', async () => {
    const repository: ITemplateRepository = {
      findByName: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      createTemplateWithInitialVersion: jest.fn(),
      addNewVersion: jest.fn(),
      findVersionsByTemplateId: jest.fn(),
      findVersionByNumber: jest.fn(),
    };

    const useCase = new GetTemplateUseCase(repository);
    await expect(useCase.execute('non-existent-id')).rejects.toBeInstanceOf(NotFoundException);
  });
});
