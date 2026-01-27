import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/db";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // Types refresh trigger

export const register = async (data: { email: string; password: string; name?: string }) => {
    const existingUser = await prisma.users.findUnique({
        where: { email: data.email },
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.users.create({
        data: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
        } as any,
    });

    // Generate token immediately for convenience
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "7d",
    });

    return { user: { id: user.id, email: user.email, name: user.name }, token };
};

export const login = async (data: { email: string; password: string }) => {
    const user = await prisma.users.findUnique({
        where: { email: data.email },
    });

    if (!user || !(user as any).password) {
        throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(data.password, (user as any).password);

    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "7d",
    });

    return { user: { id: user.id, email: user.email, name: user.name }, token };
};
