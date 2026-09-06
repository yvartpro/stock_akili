import bcrypt from 'bcryptjs';
import { User } from '../models.old/index.js';
import { logAudit } from '../middleware/audit.js';

export async function getUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'active', 'lastLogin', 'createdAt'],
      order: [['name', 'ASC']]
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors du chargement des utilisateurs.' });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe sont requis.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'gestionnaire',
      active: true
    });

    await logAudit({
      req,
      action: 'CREATION_UTILISATEUR',
      entityType: 'User',
      entityId: user.id,
      details: `Création du compte ${user.name} (${user.email}, rôle: ${user.role})`
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erreur lors de la création.' });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, active, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (role) user.role = role;
    if (active !== undefined) user.active = active;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    await logAudit({
      req,
      action: 'MODIF_UTILISATEUR',
      entityType: 'User',
      entityId: user.id,
      details: `Modification de l'utilisateur ${user.name} (Rôle: ${user.role}, Actif: ${user.active})`
    });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
}
