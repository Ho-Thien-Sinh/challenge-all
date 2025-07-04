import { RequestHandler } from 'express';

export declare const authenticateToken: RequestHandler;
export declare const authorizeRole: (roles: string[]) => RequestHandler;
