// Custom types for the application

export interface ApiResponse<T = any> {
	success: boolean;
	message: string;
	data?: T;
	timestamp: string;
}

export interface ErrorResponse {
	success: false;
	message: string;
	error?: string;
	stack?: string;
	timestamp: string;
}
