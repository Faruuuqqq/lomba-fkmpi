import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpStatus, 
  BadRequestException 
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch(BadRequestException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.BAD_REQUEST;
    let message = 'Validation failed';
    let errors: any[] = [];

    if (exception.getResponse) {
      const exceptionResponse = exception.getResponse() as any;
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (exceptionResponse.message) {
        if (Array.isArray(exceptionResponse.message)) {
          // Handle class-validator errors
          errors = this.formatValidationErrors(exceptionResponse.message);
          message = 'Validation failed';
        } else {
          message = exceptionResponse.message;
        }
        
        statusCode = exceptionResponse.status || HttpStatus.BAD_REQUEST;
      }
    }

    const errorResponse = {
      statusCode,
      message,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
      path: (request as any).url,
      method: (request as any).method,
    };

    // Log validation errors for monitoring
    console.warn(`Validation Error: ${JSON.stringify(errorResponse)}`);

    response.status(statusCode).json(errorResponse);
  }

  private formatValidationErrors(validationErrors: ValidationError[]): any[] {
    return validationErrors.map(error => {
      const constraints = error.constraints;
      const property = error.property;
      
      // Get the first error message for each property
      const firstConstraint = constraints ? Object.values(constraints)[0] : 'Invalid value';
      
      return {
        field: property,
        message: firstConstraint,
        value: error.value,
      };
    });
  }
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Handle specific error types
    if (exception.status) {
      statusCode = exception.status;
      message = exception.message || 'An error occurred';
    } else if (exception.code === 'P2002') {
      // Prisma unique constraint violation
      statusCode = HttpStatus.CONFLICT;
      message = 'Resource already exists';
    } else if (exception.code === 'P2025') {
      // Prisma record not found
      statusCode = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
    } else if (exception.name === 'ValidationError') {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Validation error';
    }

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production' && statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      message = 'Something went wrong';
    }

    const errorResponse = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: (request as any).url,
      method: (request as any).method,
    };

    // Log errors for monitoring
    console.error(`Error: ${JSON.stringify({
      ...errorResponse,
      stack: exception.stack,
    })}`);

    response.status(statusCode).json(errorResponse);
  }
}