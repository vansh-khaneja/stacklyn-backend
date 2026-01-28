import { Request, Response, NextFunction } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Hook into response finish to log status and duration
    res.on("finish", () => {
        const duration = Date.now() - start;
        const status = res.statusCode;

        // Only log errors, slow requests, or health checks
        if (status >= 400) {
            // Error requests
            console.log(`❌ ${req.method} ${req.url} → ${status} (${duration}ms)`);
        } else if (duration > 2000) {
            // Slow requests
            console.log(` ${req.method} ${req.url} → ${status} (${duration}ms)`);
        } else if (req.url === '/health') {
            // Health check
            console.log(`💚 Health check → OK`);
        }
        // Skip logging for successful fast requests
    });

    next();
};
