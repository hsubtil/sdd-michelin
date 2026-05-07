import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const problem = this.buildProblemFromHttpException(payload, status, request.url);
      response.status(status).json(problem);
      return;
    }

    const problem: ProblemDetails = {
      type: 'about:blank',
      title: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: 'An unexpected error occurred',
      instance: request.url,
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(problem);
  }

  private buildProblemFromHttpException(
    payload: string | object,
    status: number,
    path: string,
  ): ProblemDetails {
    if (typeof payload === 'string') {
      return {
        type: 'about:blank',
        title: this.defaultTitle(status),
        status,
        detail: payload,
        instance: path,
      };
    }

    const payloadRecord = payload as Record<string, unknown>;
    const message = payloadRecord.message;
    const detail = Array.isArray(message)
      ? message.join(', ')
      : typeof message === 'string'
        ? message
        : this.defaultTitle(status);

    const title =
      typeof payloadRecord.error === 'string'
        ? payloadRecord.error
        : this.defaultTitle(status);

    return {
      type: 'about:blank',
      title,
      status,
      detail,
      instance: path,
    };
  }

  private defaultTitle(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Validation Error';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      default:
        return 'Error';
    }
  }
}
