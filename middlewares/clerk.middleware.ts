import { ClerkExpressRequireAuth, ClerkExpressWithAuth, StrictAuthProp, WithAuthProp, clerkClient } from '@clerk/clerk-sdk-node';
// Syncing image_url from Clerk to DB
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

// Middleware to require authentication
const clerkAuth = ClerkExpressRequireAuth({});

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    return clerkAuth(req, res, async (err?: any) => {
        if (err) {
            if (err.message !== 'Unauthenticated') {
                console.error(`❌ [AUTH] Authentication failed:`, err.message || err);
            }
            return next(err);
        }

        const clerkUserId = (req as any).auth?.userId;

        if (clerkUserId) {
            try {
                const user = await clerkClient.users.getUser(clerkUserId);
                const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
                const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || email;
                const imageUrl = user.imageUrl || null;

                if (email) {
                    const imageUrl = user.imageUrl;
                    let dbUser = await prisma.users.findUnique({
                        where: { email }
                    });

                    if (!dbUser) {
                        dbUser = await prisma.users.create({
                            data: {
                                email,
                                name: name || 'User',
                                image_url: imageUrl
                            }
                        });
                        console.log(`✅ [AUTH] New user created: ${email}`);
                    } else if (dbUser.image_url !== imageUrl || dbUser.name !== name) {
                        // Keep profile in sync
                        dbUser = await prisma.users.update({
                            where: { id: dbUser.id },
                            data: {
                                name: name || dbUser.name,
                                image_url: imageUrl
                            }
                        });
                        console.log(`🔄 [AUTH] User profile synced: ${email}`);
                    }

                    // Attach user data to request
                    (req as any).clerkUserId = clerkUserId;
                    (req as any).userEmail = email;
                    (req as any).userId = dbUser.id;
                }
            } catch (error: any) {
                console.error(`❌ [AUTH] Error:`, error.message || error);
                return res.status(500).json({ error: 'Authentication error' });
            }
        }

        next();
    });
}

declare global {
    namespace Express {
        interface Request extends WithAuthProp<StrictAuthProp> {
            clerkUserId?: string;
            userEmail?: string;
            userId?: string; // DB user UUID
        }
    }
}

// Middleware for optional authentication
export const optionalAuth = ClerkExpressWithAuth();

// Middleware to extract user ID from Clerk auth
export const extractClerkUser = (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).auth?.userId) {
        (req as any).clerkUserId = (req as any).auth.userId;
    }
    next();
};
