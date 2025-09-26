import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';

// User validation schemas
export const userSchemas = {
	create: Joi.object({
		name: Joi.string().min(2).max(50).required().messages({
			'string.min': 'Name must be at least 2 characters long',
			'string.max': 'Name cannot exceed 50 characters',
			'any.required': 'Name is required',
		}),
		email: Joi.string().email().required().messages({
			'string.email': 'Please provide a valid email address',
			'any.required': 'Email is required',
		}),
	}),

	update: Joi.object({
		name: Joi.string().min(2).max(50).optional().messages({
			'string.min': 'Name must be at least 2 characters long',
			'string.max': 'Name cannot exceed 50 characters',
		}),
		email: Joi.string().email().optional().messages({
			'string.email': 'Please provide a valid email address',
		}),
	})
		.min(1)
		.messages({
			'object.min': 'At least one field (name or email) must be provided for update',
		}),

	params: Joi.object({
		id: Joi.number().integer().positive().required().messages({
			'number.base': 'User ID must be a number',
			'number.integer': 'User ID must be an integer',
			'number.positive': 'User ID must be positive',
			'any.required': 'User ID is required',
		}),
	}),
};

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'params' | 'query' = 'body') => {
	return (req: Request, _res: Response, next: NextFunction): void => {
		const { error } = schema.validate(req[property], { abortEarly: false });

		if (error) {
			const errorMessage = error.details.map((detail) => detail.message).join(', ');
			return next(new AppError(errorMessage, 400));
		}

		next();
	};
};
