import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@repo/prisma-client/client';
import { NextFunction, Request, Response, Router } from 'express';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // console.log(req.body)
        const { username, password }: { username: string; password: string } = req.body;

        // Check if the user exists
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);

        // Send the token to the client
        res.status(201).json({ token });

    } catch (error) {
        next(error); // Pass any errors to the error handler
    }
});

// Register route (example for creating a new user)
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password }: { username: string; password: string } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Create a new user in the database
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        });
        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);

        res.status(201).json({ message: "Successful", token });
    } catch (error: any) {
        next(error)
    }
});
