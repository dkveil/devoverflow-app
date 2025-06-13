class RequestError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(statusCode: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'RequestError';
  }
}

class ValidationError extends RequestError {
  constructor(fieldErrors: Record<string, string[]>) {
    const message = ValidationError.formatFieldErrors(fieldErrors);
    super(400, message, fieldErrors);
    this.name = 'ValidationError';
    this.errors = fieldErrors;
  }

  static formatFieldErrors(errors: Record<string, string[]>) {
    const formattedErrors = Object.entries(errors)
      .map(([field, messages]) => {
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1);

        if (messages[0] === 'required') {
          return `${fieldName} is required`;
        } else {
          return `${fieldName}: ${messages.join(' and ')}`;
        }
      });

    return formattedErrors.join(', ');
  }
}

class BadRequestError extends RequestError {
  constructor(message: string = 'Bad request') {
    super(400, message);
    this.name = 'BadRequestError';
  }
}

class UnauthorizedError extends RequestError {
  constructor(message: string = 'Unauthorized access') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends RequestError {
  constructor(message: string = 'Access forbidden') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends RequestError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

class MethodNotAllowedError extends RequestError {
  constructor(method: string, allowedMethods: string[] = []) {
    const message = allowedMethods.length > 0
      ? `Method ${method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`
      : `Method ${method} not allowed`;
    super(405, message);
    this.name = 'MethodNotAllowedError';
  }
}

class ConflictError extends RequestError {
  constructor(message: string = 'Resource conflict') {
    super(409, message);
    this.name = 'ConflictError';
  }
}

class PreconditionFailedError extends RequestError {
  constructor(message: string = 'Precondition failed') {
    super(412, message);
    this.name = 'PreconditionFailedError';
  }
}

class PayloadTooLargeError extends RequestError {
  constructor(message: string = 'Payload too large') {
    super(413, message);
    this.name = 'PayloadTooLargeError';
  }
}

class UnsupportedMediaTypeError extends RequestError {
  constructor(mediaType?: string) {
    const message = mediaType
      ? `Unsupported media type: ${mediaType}`
      : 'Unsupported media type';
    super(415, message);
    this.name = 'UnsupportedMediaTypeError';
  }
}

class UnprocessableEntityError extends RequestError {
  constructor(message: string = 'Unprocessable entity', errors?: Record<string, string[]>) {
    super(422, message, errors);
    this.name = 'UnprocessableEntityError';
  }
}

class TooManyRequestsError extends RequestError {
  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(429, message);
    this.name = 'TooManyRequestsError';
    if (retryAfter) {
      this.retryAfter = retryAfter;
    }
  }

  retryAfter?: number;
}

class InternalServerError extends RequestError {
  constructor(message: string = 'Internal server error') {
    super(500, message);
    this.name = 'InternalServerError';
  }
}

class NotImplementedError extends RequestError {
  constructor(message: string = 'Not implemented') {
    super(501, message);
    this.name = 'NotImplementedError';
  }
}

class BadGatewayError extends RequestError {
  constructor(message: string = 'Bad gateway') {
    super(502, message);
    this.name = 'BadGatewayError';
  }
}

class ServiceUnavailableError extends RequestError {
  constructor(message: string = 'Service unavailable', retryAfter?: number) {
    super(503, message);
    this.name = 'ServiceUnavailableError';
    if (retryAfter) {
      this.retryAfter = retryAfter;
    }
  }

  retryAfter?: number;
}

class GatewayTimeoutError extends RequestError {
  constructor(message: string = 'Gateway timeout') {
    super(504, message);
    this.name = 'GatewayTimeoutError';
  }
}

export {
  BadGatewayError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  GatewayTimeoutError,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  NotImplementedError,
  PayloadTooLargeError,
  PreconditionFailedError,
  RequestError,
  ServiceUnavailableError,
  TooManyRequestsError,
  UnauthorizedError,
  UnprocessableEntityError,
  UnsupportedMediaTypeError,
  ValidationError,
};
