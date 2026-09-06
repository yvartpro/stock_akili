import { AuditLog } from '../models/index.js';

export async function logAudit({ req, user, action, entityType, entityId, details }) {
  try {
    const userName = user ? user.name : (req?.user?.name || 'Système');
    const userId = user ? user.id : (req?.user?.id || null);
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : '127.0.0.1';

    await AuditLog.create({
      userId,
      userName,
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      ipAddress: String(ip)
    });
  } catch (err) {
    console.error('[AuditLog Error]', err);
  }
}
