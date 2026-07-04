export const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.name}: ${err.message}`);
    
    if (err.name === 'MetierException') {
        return res.status(err.statusCode || 400).json({ message: err.message });
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Non autorisé: Token invalide ou expiré." });
    }

    res.status(500).json({ message: "Erreur interne du serveur." });
};
