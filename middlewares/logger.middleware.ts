import { Request, Response, NextFunction } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Hook into response finish to log status and duration
    res.on("finish", () => {
        const duration = Date.now() - start;
        const status = res.statusCode;

        // Skip health check logging to keep it clean
        if (req.url === '/health') {
            console.log(`💚 Health check → OK`);
            return;
        }

        // Log all API requests
        if (status >= 500) {
            // Server errors
            console.log(`❌ ${req.method} ${req.url} → ${status} (${duration}ms)`);
        } else if (status >= 400) {
            // Client errors
            console.log(`⚠️  ${req.method} ${req.url} → ${status} (${duration}ms)`);
        } else if (status >= 300) {
            // Redirects
            console.log(`↪️  ${req.method} ${req.url} → ${status} (${duration}ms)`);
        } else {
            // Success
            console.log(`✅ ${req.method} ${req.url} → ${status} (${duration}ms)`);
        }
    });

    next();
};
