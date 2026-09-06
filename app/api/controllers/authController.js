import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { JWT_SECRET } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Veuillez saisir votre email et mot de passe.' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides.' });
      }

      if (!user.active) {
        return res.status(403).json({ error: 'Ce compte utilisateur a été désactivé.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Identifiants invalides.' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Sign JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Audit log
      await logAudit({
        req,
        user,
        action: 'CONNEXION',
        entityType: 'User',
        entityId: user.id,
        details: `Connexion réussie de ${user.name} (${user.role})`
      });

      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Erreur lors de l\'authentification.' });
    }
  }

  async getMe(req, res) {
    try {
      return res.json({
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erreur serveur.' });
    }
  }

  async logout(req, res) {
    try {
      if (req.user) {
        await logAudit({
          req,
          user: req.user,
          action: 'DECONNEXION',
          entityType: 'User',
          entityId: req.user.id,
          details: `Déconnexion de ${req.user.name}`
        });
      }
      return res.json({ message: 'Déconnexion réussie.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la déconnexion.' });
    }
  }
}

const authController = new AuthController();
export default authController;