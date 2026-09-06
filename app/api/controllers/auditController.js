import * as Models from '../models/index.js';
const { AuditLog, User } = Models;
class AuditController {
  async getAuditLogs(req, res) {
    try {
      const { action, limit = 100 } = req.query;
      const where = {};
      if (action) where.action = action;

      const logs = await AuditLog.findAll({
        where,
        limit: parseInt(limit, 10),
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }]
      });

      return res.json(logs);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des journaux d\'audit.' });
    }
  }
}

const auditController = new AuditController();
export default auditController;