import * as Joi from 'joi';

export interface AppEnv {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  DB_TYPE: 'postgres' | 'mysql';
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
}

export const envValidationSchema: Joi.ObjectSchema<AppEnv> = Joi.object<AppEnv>(
  {
    NODE_ENV: Joi.string()
      .valid('development', 'test', 'production')
      .default('development'),
    PORT: Joi.number().port().default(3000),
    DB_TYPE: Joi.string().valid('postgres', 'mysql').default('postgres'),
    DB_HOST: Joi.string().hostname().required(),
    DB_PORT: Joi.number().port().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
  },
);
