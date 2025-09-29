import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';

// Authentication validation schemas
export const authSchemas = {
	register: Joi.object({
		name: Joi.string().min(2).max(50).required().messages({
			'string.min': 'Name must be at least 2 characters long',
			'string.max': 'Name cannot exceed 50 characters',
			'any.required': 'Name is required',
		}),
		email: Joi.string().email().required().messages({
			'string.email': 'Please provide a valid email address',
			'any.required': 'Email is required',
		}),
		password: Joi.string().min(8).max(128).pattern(
			new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')
		).required().messages({
			'string.min': 'Password must be at least 8 characters long',
			'string.max': 'Password cannot exceed 128 characters',
			'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
			'any.required': 'Password is required',
		}),
	}),

	login: Joi.object({
		email: Joi.string().email().required().messages({
			'string.email': 'Please provide a valid email address',
			'any.required': 'Email is required',
		}),
		password: Joi.string().required().messages({
			'any.required': 'Password is required',
		}),
	}),

	changePassword: Joi.object({
		currentPassword: Joi.string().required().messages({
			'any.required': 'Current password is required',
		}),
		newPassword: Joi.string().min(8).max(128).pattern(
			new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')
		).required().messages({
			'string.min': 'New password must be at least 8 characters long',
			'string.max': 'New password cannot exceed 128 characters',
			'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, and one number',
			'any.required': 'New password is required',
		}),
	}),
};

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
