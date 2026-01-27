import { Request, Response, NextFunction } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    // Log request
    console.log(`[${timestamp}] → ${req.method} ${req.url}`);

    // Hook into response finish to log status and duration
    res.on("finish", () => {
        const duration = Date.now() - start;
        const status = res.statusCode;

        let logColor = "\x1b[0m"; // Reset
        if (status >= 500) logColor = "\x1b[31m"; // Red
        else if (status >= 400) logColor = "\x1b[33m"; // Yellow
        else if (status >= 300) logColor = "\x1b[36m"; // Cyan
        else if (status >= 200) logColor = "\x1b[32m"; // Green

        console.log(`[${timestamp}] ${logColor}← ${req.method} ${req.url} ${status} (${duration}ms)\x1b[0m`);
    });

    next();
};
