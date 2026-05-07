import { ConflictException } from '@nestjs/common';

import { CreateTemplateDto } from '@/template/application/dto/create-template.dto';
import { CreateTemplateUseCase } from '@/template/application/use-cases/create-template.use-case';
import { Template } from '@/template/domain/entities/template.entity';
import { ITemplateRepository } from '@/template/domain/ports/out/i-template.repository';

describe('CreateTemplateUseCase', () => {
  const baseDto: CreateTemplateDto = {
    name: 'Customer Email',
    tags: ['email', 'customer'],
    content: 'Hello {{name}}',
    variables: [{ name: 'name', defaultValue: 'Customer' }],
  };

  it('creates a template when the name is available', async () => {
    const repository: ITemplateRepository = {
      findByName: jest.fn().mockResolvedValue(null),
      createTemplateWithInitialVersion: jest.fn().mockImplementation(async (template: Template) => template),
    };

    const useCase = new CreateTemplateUseCase(repository);

    const response = await useCase.execute(baseDto);

    expect(response.name).toBe(baseDto.name);
    expect(response.currentVersion).toBe(1);
    expect(repository.createTemplateWithInitialVersion).toHaveBeenCalledTimes(1);
  });

  it('throws conflict when template name already exists', async () => {
    const repository: ITemplateRepository = {
      findByName: jest.fn().mockResolvedValue(
        Template.create({
          name: baseDto.name,
          tags: baseDto.tags,
          content: baseDto.content,
          variables: [],
        }),
      ),
      createTemplateWithInitialVersion: jest.fn(),
    };

    const useCase = new CreateTemplateUseCase(repository);

    await expect(useCase.execute(baseDto)).rejects.toBeInstanceOf(ConflictException);
    expect(repository.createTemplateWithInitialVersion).not.toHaveBeenCalled();
  });
});
