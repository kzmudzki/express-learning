import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { authService } from '../services/authService';
import { authSchemas, validate } from '../utils/validation';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = authSchemas.register.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message),
          timestamp: new Date().toISOString(),
        });
      }

      const authResponse = await authService.register(value);

      const response: ApiResponse = {
        success: true,
        message: 'User registered successfully',
        data: authResponse,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = authSchemas.login.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message),
          timestamp: new Date().toISOString(),
        });
      }

      const authResponse = await authService.login(value);

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: authResponse,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Profile retrieved successfully',
        data: req.user,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
      }

      // Generate new token
      const token = authService.generateToken({
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token,
          expiresIn: '7d',
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
};
