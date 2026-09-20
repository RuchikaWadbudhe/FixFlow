const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats - dashboard stats
router.get('/stats', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const [total, open, inProgress, resolved, closed, highPriority, avgResolution] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM tickets'),
      pool.query("SELECT COUNT(*) FROM tickets WHERE status IN ('reported', 'assigned')"),
      pool.query("SELECT COUNT(*) FROM tickets WHERE status = 'in_progress'"),
      pool.query("SELECT COUNT(*) FROM tickets WHERE status = 'resolved'"),
      pool.query("SELECT COUNT(*) FROM tickets WHERE status = 'closed'"),
      pool.query("SELECT COUNT(*) FROM tickets WHERE priority IN ('high','critical') AND status NOT IN ('resolved','closed')"),
      pool.query(`
        SELECT ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600)::numeric, 1) AS avg_hours
        FROM tickets WHERE resolved_at IS NOT NULL
      `),
    ]);

    // SLA breached
    const slaBreach = await pool.query(
      `SELECT COUNT(*) FROM tickets WHERE sla_deadline < NOW() AND status NOT IN ('resolved','closed')`
    );

    res.json({
      total: parseInt(total.rows[0].count),
      open: parseInt(open.rows[0].count),
      inProgress: parseInt(inProgress.rows[0].count),
      resolved: parseInt(resolved.rows[0].count),
      closed: parseInt(closed.rows[0].count),
      highPriority: parseInt(highPriority.rows[0].count),
      slaBreached: parseInt(slaBreach.rows[0].count),
      avgResolutionHours: parseFloat(avgResolution.rows[0].avg_hours) || 0,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// GET /api/admin/by-category
router.get('/by-category', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT category, COUNT(*) AS total,
        SUM(CASE WHEN status NOT IN ('resolved','closed') THEN 1 ELSE 0 END) AS open,
        SUM(CASE WHEN status IN ('resolved','closed') THEN 1 ELSE 0 END) AS resolved
       FROM tickets GROUP BY category ORDER BY total DESC`
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category stats.' });
  }
});

// GET /api/admin/by-priority
router.get('/by-priority', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT priority, COUNT(*) AS total,
        SUM(CASE WHEN status NOT IN ('resolved','closed') THEN 1 ELSE 0 END) AS open
       FROM tickets GROUP BY priority ORDER BY 
       CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END`
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch priority stats.' });
  }
});

// GET /api/admin/by-status
router.get('/by-status', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT status, COUNT(*) AS total FROM tickets GROUP BY status ORDER BY total DESC`
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status stats.' });
  }
});

// GET /api/admin/by-location
router.get('/by-location', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT location, COUNT(*) AS total,
        SUM(CASE WHEN priority IN ('high','critical') THEN 1 ELSE 0 END) AS high_priority
       FROM tickets GROUP BY location ORDER BY total DESC LIMIT 10`
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch location stats.' });
  }
});

// GET /api/admin/recent-tickets
router.get('/recent-tickets', authenticate, authorize('admin', 'staff'), async (req, res) => {
  const { page = 1, limit = 20, status, priority, category, search } = req.query;
  const offset = (page - 1) * limit;

  try {
    let whereClauses = [];
    let params = [];
    let idx = 1;

    if (status) { whereClauses.push(`t.status = $${idx++}`); params.push(status); }
    if (priority) { whereClauses.push(`t.priority = $${idx++}`); params.push(priority); }
    if (category) { whereClauses.push(`t.category = $${idx++}`); params.push(category); }
    if (search) {
      whereClauses.push(`(t.title ILIKE $${idx} OR t.ticket_id ILIKE $${idx} OR t.location ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    const countResult = await pool.query(`SELECT COUNT(*) FROM tickets t ${where}`, params);

    const result = await pool.query(
      `SELECT t.*, u.name AS reporter_name, s.name AS assignee_name,
        CASE WHEN t.sla_deadline < NOW() AND t.status NOT IN ('resolved','closed') THEN true ELSE false END AS sla_breached
       FROM tickets t
       LEFT JOIN users u ON t.reporter_id = u.id
       LEFT JOIN users s ON t.assigned_to = s.id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      tickets: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    });
  } catch (err) {
    console.error('Recent tickets error:', err);
    res.status(500).json({ error: 'Failed to fetch tickets.' });
  }
});

// GET /api/admin/users - list all users (admin only)
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.department, u.is_active, u.created_at,
        COUNT(t.id) AS ticket_count
       FROM users u
       LEFT JOIN tickets t ON (t.reporter_id = u.id OR t.assigned_to = u.id)
       GROUP BY u.id ORDER BY u.created_at DESC`
    );
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// PUT /api/admin/users/:id/role - change user role (admin only)
router.put('/users/:id/role', authenticate, authorize('admin'), async (req, res) => {
  const { role } = req.body;
  if (!['user', 'staff', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }
  try {
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role',
      [role, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

// GET /api/admin/trend - tickets over last 7 days
router.get('/trend', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('day', created_at), 'Mon DD') AS day,
        COUNT(*) AS total,
        SUM(CASE WHEN status IN ('resolved','closed') THEN 1 ELSE 0 END) AS resolved
      FROM tickets
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY DATE_TRUNC('day', created_at) ASC
    `);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trend data.' });
  }
});

module.exports = router;
