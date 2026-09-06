import jwt from 'jsonwebtoken';
import { User } from '../models.old/index.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'aps_warehouse_jwt_secret_2026_super_secure';

export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Accès refusé. Jeton d\'authentification manquant.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'role', 'active']
    });

    if (!user || !user.active) {
      return res.status(403).json({ error: 'Compte inactif ou utilisateur introuvable.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Jeton invalide ou expiré.' });
  }
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise.' });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Accès non autorisé. Rôle requis: ${roles.join(' ou ')}.` 
      });
    }

    next();
  };
}
