import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware } from '../../src/middleware/auth.middleware.js';
import jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken');

const makeRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};
const makeNext = () => vi.fn();

describe('AuthMiddleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = 'testsecret';
    });

    it('devrait accepter un token valide et attacher l\'utilisateur à req', () => {
        const decodedUser = { id: 1, email: 'test@test.com' };
        jwt.verify.mockReturnValue(decodedUser);

        const req = { headers: { authorization: 'Bearer valid-token' } };
        const next = makeNext();
        authMiddleware(req, makeRes(), next);

        expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'testsecret');
        expect(req.user).toEqual(decodedUser);
        expect(next).toHaveBeenCalledWith(); // next() sans argument = succès
    });

    it('devrait rejeter une requête sans header Authorization', () => {
        const req = { headers: {} };
        const next = makeNext();
        authMiddleware(req, makeRes(), next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('manquant') }));
    });

    it('devrait rejeter un header Authorization sans "Bearer"', () => {
        const req = { headers: { authorization: 'Basic dXNlcjpwYXNz' } };
        const next = makeNext();
        authMiddleware(req, makeRes(), next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('manquant') }));
    });

    it('devrait rejeter un token invalide ou expiré', () => {
        jwt.verify.mockImplementation(() => { throw new Error('invalid signature'); });

        const req = { headers: { authorization: 'Bearer bad-token' } };
        const next = makeNext();
        authMiddleware(req, makeRes(), next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});

describe('ErrorMiddleware', () => {
    it('devrait retourner 400 pour une MetierException', async () => {
        const { errorHandler } = await import('../../src/middleware/error.middleware.js');
        const { MetierException } = await import('../../src/errors/MetierException.js');

        const err = new MetierException('Solde insuffisant.');
        const res = makeRes();
        errorHandler(err, {}, res, makeNext());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Solde insuffisant.' }));
    });

    it('devrait retourner le statusCode personnalisé d\'une MetierException', async () => {
        const { errorHandler } = await import('../../src/middleware/error.middleware.js');
        const { MetierException } = await import('../../src/errors/MetierException.js');

        const err = new MetierException('Non trouvé.', 404);
        const res = makeRes();
        errorHandler(err, {}, res, makeNext());

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 401 pour un token JWT invalide', async () => {
        const { errorHandler } = await import('../../src/middleware/error.middleware.js');
        const err = new Error('invalid token');
        err.name = 'JsonWebTokenError';
        const res = makeRes();
        errorHandler(err, {}, res, makeNext());

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('devrait retourner 500 pour une erreur interne inconnue', async () => {
        const { errorHandler } = await import('../../src/middleware/error.middleware.js');
        const err = new Error('Erreur quelconque');
        const res = makeRes();
        errorHandler(err, {}, res, makeNext());

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
