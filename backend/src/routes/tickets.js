const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// SLA hours by priority
const SLA_HOURS = { low: 72, medium: 48, high: 24, critical: 4 };

// GET /api/tickets - list tickets (filtered by role)
router.get('/', authenticate, async (req, res) => {
  const { status, priority, category, page = 1, limit = 10, search } = req.query;
  const offset = (page - 1) * limit;

  try {
    let whereClauses = [];
    let params = [];
    let idx = 1;

    // Role-based filtering
    if (req.user.role === 'user') {
      whereClauses.push(`t.reporter_id = $${idx++}`);
      params.push(req.user.id);
    } else if (req.user.role === 'staff') {
      whereClauses.push(`(t.assigned_to = $${idx++} OR t.status = 'reported')`);
      params.push(req.user.id);
    }
    // admin sees all

    if (status) { whereClauses.push(`t.status = $${idx++}`); params.push(status); }
    if (priority) { whereClauses.push(`t.priority = $${idx++}`); params.push(priority); }
    if (category) { whereClauses.push(`t.category = $${idx++}`); params.push(category); }
    if (search) {
      whereClauses.push(`(t.title ILIKE $${idx++} OR t.ticket_id ILIKE $${idx - 1} OR t.location ILIKE $${idx - 1})`);
      params.push(`%${search}%`);
    }

    const where = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM tickets t ${where}`,
      params
    );

    const result = await pool.query(
      `SELECT t.*, 
        u.name AS reporter_name, u.email AS reporter_email,
        s.name AS assignee_name, s.email AS assignee_email,
        CASE WHEN t.sla_deadline < NOW() AND t.status NOT IN ('resolved','closed') THEN true ELSE false END AS sla_breached
       FROM tickets t
       LEFT JOIN users u ON t.reporter_id = u.id
       LEFT JOIN users s ON t.assigned_to = s.id
       ${where}
       ORDER BY 
         CASE t.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
         t.created_at DESC
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
    console.error('Get tickets error:', err);
    res.status(500).json({ error: 'Failed to fetch tickets.' });
  }
});

// GET /api/tickets/:id - single ticket
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*,
        u.name AS reporter_name, u.email AS reporter_email,
        s.name AS assignee_name, s.email AS assignee_email, s.department AS assignee_department,
        CASE WHEN t.sla_deadline < NOW() AND t.status NOT IN ('resolved','closed') THEN true ELSE false END AS sla_breached
       FROM tickets t
       LEFT JOIN users u ON t.reporter_id = u.id
       LEFT JOIN users s ON t.assigned_to = s.id
       WHERE t.id = $1 OR t.ticket_id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ticket = result.rows[0];

    // Users can only view their own tickets
    if (req.user.role === 'user' && ticket.reporter_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Fetch comments (exclude internal for regular users)
    const commentsQuery = req.user.role === 'user'
      ? `SELECT c.*, u.name AS author_name, u.role AS author_role
         FROM comments c JOIN users u ON c.user_id = u.id
         WHERE c.ticket_id = $1 AND c.is_internal = false ORDER BY c.created_at ASC`
      : `SELECT c.*, u.name AS author_name, u.role AS author_role
         FROM comments c JOIN users u ON c.user_id = u.id
         WHERE c.ticket_id = $1 ORDER BY c.created_at ASC`;

    const comments = await pool.query(commentsQuery, [ticket.id]);

    res.json({ ticket, comments: comments.rows });
  } catch (err) {
    console.error('Get ticket error:', err);
    res.status(500).json({ error: 'Failed to fetch ticket.' });
  }
});

// POST /api/tickets - create ticket
router.post('/', authenticate, upload.single('photo'), async (req, res) => {
  const { title, description, category, priority, location, building, floor } = req.body;

  if (!title || !description || !category || !location) {
    return res.status(400).json({ error: 'Title, description, category, and location are required.' });
  }

  try {
    const slaHours = SLA_HOURS[priority] || SLA_HOURS.medium;
    const slaDeadline = new Date(Date.now() + slaHours * 3600 * 1000);
    const photoUrl = req.file ? `/uploads/photos/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO tickets (title, description, category, priority, location, building, floor, photo_url, reporter_id, sla_deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title.trim(), description.trim(), category, priority || 'medium', location.trim(), building || null, floor || null, photoUrl, req.user.id, slaDeadline]
    );

    const ticket = result.rows[0];

    // Log activity
    await pool.query(
      `INSERT INTO comments (ticket_id, user_id, content, type, new_status, is_internal)
       VALUES ($1, $2, 'Ticket created and submitted for review.', 'status_change', 'reported', false)`,
      [ticket.id, req.user.id]
    );

    res.status(201).json({ ticket });
  } catch (err) {
    console.error('Create ticket error:', err);
    res.status(500).json({ error: 'Failed to create ticket.' });
  }
});

// PUT /api/tickets/:id/status - change status (staff/admin)
router.put('/:id/status', authenticate, authorize('staff', 'admin'), async (req, res) => {
  const { status, comment, isInternal } = req.body;
  const validStatuses = ['reported', 'assigned', 'in_progress', 'resolved', 'closed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    const ticketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [req.params.id]);
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ticket = ticketResult.rows[0];
    const oldStatus = ticket.status;

    const updates = { status };
    if (status === 'resolved') updates.resolved_at = new Date();
    if (status === 'closed') updates.closed_at = new Date();

    const result = await pool.query(
      `UPDATE tickets SET status = $1, resolved_at = $2, closed_at = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [status, updates.resolved_at || ticket.resolved_at, updates.closed_at || ticket.closed_at, req.params.id]
    );

    // Log status change
    const logMsg = comment || `Status changed from ${oldStatus.replace('_', ' ')} to ${status.replace('_', ' ')}.`;
    await pool.query(
      `INSERT INTO comments (ticket_id, user_id, content, type, old_status, new_status, is_internal)
       VALUES ($1, $2, $3, 'status_change', $4, $5, $6)`,
      [req.params.id, req.user.id, logMsg, oldStatus, status, isInternal || false]
    );

    res.json({ ticket: result.rows[0] });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update ticket status.' });
  }
});

// PUT /api/tickets/:id/assign - assign ticket (staff/admin)
router.put('/:id/assign', authenticate, authorize('staff', 'admin'), async (req, res) => {
  const { assignedTo, department } = req.body;

  try {
    // Verify assignee exists
    if (assignedTo) {
      const staffResult = await pool.query("SELECT id FROM users WHERE id = $1 AND role IN ('staff','admin')", [assignedTo]);
      if (staffResult.rows.length === 0) {
        return res.status(400).json({ error: 'Assignee not found or is not staff.' });
      }
    }

    const result = await pool.query(
      `UPDATE tickets SET assigned_to = $1, department = $2, status = CASE WHEN status = 'reported' THEN 'assigned' ELSE status END, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [assignedTo || null, department || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    // Get assignee name
    let assigneeName = 'Unassigned';
    if (assignedTo) {
      const staffInfo = await pool.query('SELECT name FROM users WHERE id = $1', [assignedTo]);
      if (staffInfo.rows.length > 0) assigneeName = staffInfo.rows[0].name;
    }

    await pool.query(
      `INSERT INTO comments (ticket_id, user_id, content, type, is_internal)
       VALUES ($1, $2, $3, 'assignment', false)`,
      [req.params.id, req.user.id, `Ticket assigned to ${assigneeName}.`]
    );

    res.json({ ticket: result.rows[0] });
  } catch (err) {
    console.error('Assign ticket error:', err);
    res.status(500).json({ error: 'Failed to assign ticket.' });
  }
});

// PUT /api/tickets/:id/resolve - upload resolution proof
router.put('/:id/resolve', authenticate, authorize('staff', 'admin'), upload.single('proof'), async (req, res) => {
  const { resolutionNotes } = req.body;
  req.uploadType = 'proof';

  try {
    const proofUrl = req.file ? `/uploads/proofs/${req.file.filename}` : null;

    const result = await pool.query(
      `UPDATE tickets SET 
        resolution_notes = $1, resolution_proof_url = COALESCE($2, resolution_proof_url),
        status = 'resolved', resolved_at = NOW(), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [resolutionNotes || null, proofUrl, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    await pool.query(
      `INSERT INTO comments (ticket_id, user_id, content, type, old_status, new_status, is_internal)
       VALUES ($1, $2, $3, 'status_change', 'in_progress', 'resolved', false)`,
      [req.params.id, req.user.id, resolutionNotes || 'Issue has been resolved.']
    );

    res.json({ ticket: result.rows[0] });
  } catch (err) {
    console.error('Resolve ticket error:', err);
    res.status(500).json({ error: 'Failed to resolve ticket.' });
  }
});

// POST /api/tickets/:id/comments - add comment
router.post('/:id/comments', authenticate, async (req, res) => {
  const { content, isInternal } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content is required.' });
  }

  // Only staff/admin can post internal comments
  const internal = req.user.role !== 'user' && isInternal;

  try {
    const ticketResult = await pool.query('SELECT id, reporter_id FROM tickets WHERE id = $1', [req.params.id]);
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ticket = ticketResult.rows[0];
    if (req.user.role === 'user' && ticket.reporter_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const result = await pool.query(
      `INSERT INTO comments (ticket_id, user_id, content, is_internal, type)
       VALUES ($1, $2, $3, $4, 'comment') RETURNING *`,
      [req.params.id, req.user.id, content.trim(), internal]
    );

    const comment = await pool.query(
      `SELECT c.*, u.name AS author_name, u.role AS author_role
       FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({ comment: comment.rows[0] });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

// POST /api/tickets/:id/rate - rate resolution
router.post('/:id/rate', authenticate, async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  try {
    const ticketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [req.params.id]);
    if (ticketResult.rows.length === 0) return res.status(404).json({ error: 'Ticket not found.' });

    const ticket = ticketResult.rows[0];
    if (ticket.reporter_id !== req.user.id) return res.status(403).json({ error: 'Access denied.' });
    if (!['resolved', 'closed'].includes(ticket.status)) return res.status(400).json({ error: 'Can only rate resolved tickets.' });

    const result = await pool.query(
      `UPDATE tickets SET rating = $1, rating_comment = $2, status = 'closed', closed_at = COALESCE(closed_at, NOW()), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [rating, comment || null, req.params.id]
    );

    res.json({ ticket: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit rating.' });
  }
});

module.exports = router;
