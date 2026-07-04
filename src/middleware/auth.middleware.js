import jwt from 'jsonwebtoken';
import { MetierException } from '../errors/MetierException.js';

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new MetierException("Token d'authentification manquant.", 401);
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        
        if (!secret) {
            throw new Error("JWT_SECRET n'est pas défini");
        }

        const decoded = jwt.verify(token, secret);
        
        // Attacher l'utilisateur à l'objet request
        req.user = decoded;
        next();
    } catch (err) {
        next(err);
    }
};
