import { Request, Response, NextFunction } from 'express';
import { errorHandler, createError, AppError } from '../errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      url: '/test',
      method: 'GET',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('errorHandler', () => {
    it('should handle custom errors with status code', () => {
      const error = createError('Test error', 400);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Test error',
        },
      });
    });

    it('should default to 500 status code for unknown errors', () => {
      const error = new Error('Unknown error') as AppError;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Unknown error',
        },
      });
    });
  });

  describe('createError', () => {
    it('should create error with custom message and status code', () => {
      const error = createError('Custom error', 404);

      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    it('should default to 400 status code', () => {
      const error = createError('Default error');

      expect(error.message).toBe('Default error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });
  });
});