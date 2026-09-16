import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { pool, checkDatabase } from './db.js';
import { createToken, requireAuth } from './auth.js';

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

const clean = (value) => String(value ?? '').trim();

app.get('/api/health', async (_req, res) => {
  try {
    await checkDatabase();
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    res.status(500).json({ ok: false, database: 'disconnected', error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const academicRecord = clean(req.body.academic_record);
  const firstName = clean(req.body.first_name);
  const lastName = clean(req.body.last_name);
  const email = clean(req.body.email).toLowerCase();
  const password = String(req.body.password || '');

  if (!academicRecord || !firstName || !lastName || !email || password.length < 6) {
    return res.status(400).json({ message: 'Completa todos los campos. La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      `INSERT INTO users (academic_record, first_name, last_name, email, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [academicRecord, firstName, lastName, email, passwordHash]
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente.',
      user: { id: result.insertId, academic_record: academicRecord, first_name: firstName, last_name: lastName, email }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El registro académico o correo ya está registrado.' });
    }
    console.error(error);
    res.status(500).json({ message: 'No fue posible registrar el usuario.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const academicRecord = clean(req.body.academic_record);
  const password = String(req.body.password || '');

  const [rows] = await pool.execute('SELECT * FROM users WHERE academic_record = ? LIMIT 1', [academicRecord]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Registro académico o contraseña incorrectos.' });
  }

  res.json({
    token: createToken(user),
    user: {
      id: user.id,
      academic_record: user.academic_record,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    }
  });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const academicRecord = clean(req.body.academic_record);
  const email = clean(req.body.email).toLowerCase();
  const newPassword = String(req.body.new_password || '');

  if (!academicRecord || !email || newPassword.length < 6) {
    return res.status(400).json({ message: 'Datos incompletos o contraseña demasiado corta.' });
  }

  const [rows] = await pool.execute(
    'SELECT id FROM users WHERE academic_record = ? AND email = ? LIMIT 1',
    [academicRecord, email]
  );

  if (!rows.length) {
    return res.status(404).json({ message: 'El registro académico y el correo no coinciden.' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, rows[0].id]);
  res.json({ message: 'Contraseña actualizada correctamente.' });
});

app.get('/api/catalog/courses', async (_req, res) => {
  const [rows] = await pool.query('SELECT id, code, name, section, credits FROM courses ORDER BY name, section');
  res.json(rows);
});

app.get('/api/catalog/teachers', async (_req, res) => {
  const [rows] = await pool.query(`
    SELECT t.id, t.name, t.section, t.course_id,
           c.name AS course_name
    FROM teachers t
    LEFT JOIN courses c ON c.id = t.course_id
    ORDER BY t.name, c.name, t.section
  `);
  res.json(rows);
});

app.get('/api/posts', requireAuth, async (req, res) => {
  const conditions = [];
  const params = [];
  const { courseId, teacherId, courseName, teacherName } = req.query;

  if (courseId) {
    conditions.push('p.course_id = ?');
    params.push(courseId);
  }
  if (teacherId) {
    conditions.push('p.teacher_id = ?');
    params.push(teacherId);
  }
  if (courseName) {
    conditions.push('c.name LIKE ?');
    params.push(`%${clean(courseName)}%`);
  }
  if (teacherName) {
    conditions.push('t.name LIKE ?');
    params.push(`%${clean(teacherName)}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.execute(`
    SELECT p.id, p.subject_type, p.message, p.created_at,
           u.academic_record, u.first_name, u.last_name,
           c.id AS course_id, c.name AS course_name, c.section AS course_section,
           t.id AS teacher_id, t.name AS teacher_name, t.section AS teacher_section,
           (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id) AS comments_count
    FROM posts p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN courses c ON c.id = p.course_id
    LEFT JOIN teachers t ON t.id = p.teacher_id
    ${where}
    ORDER BY p.created_at DESC, p.id DESC
  `, params);

  res.json(rows);
});

app.post('/api/posts', requireAuth, async (req, res) => {
  const subjectType = clean(req.body.subject_type);
  const message = clean(req.body.message);
  const subjectId = Number(req.body.subject_id);

  if (!['course', 'teacher'].includes(subjectType) || !subjectId || message.length < 3) {
    return res.status(400).json({ message: 'Selecciona un curso o catedrático y escribe un mensaje.' });
  }

  const courseId = subjectType === 'course' ? subjectId : null;
  const teacherId = subjectType === 'teacher' ? subjectId : null;

  const [result] = await pool.execute(
    `INSERT INTO posts (user_id, subject_type, course_id, teacher_id, message)
     VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, subjectType, courseId, teacherId, message]
  );

  res.status(201).json({ id: result.insertId, message: 'Publicación creada correctamente.' });
});

app.get('/api/posts/:id/comments', requireAuth, async (req, res) => {
  const [rows] = await pool.execute(`
    SELECT cm.id, cm.message, cm.created_at,
           u.academic_record, u.first_name, u.last_name
    FROM comments cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.post_id = ?
    ORDER BY cm.created_at ASC, cm.id ASC
  `, [req.params.id]);
  res.json(rows);
});

app.post('/api/posts/:id/comments', requireAuth, async (req, res) => {
  const message = clean(req.body.message);
  if (message.length < 2) {
    return res.status(400).json({ message: 'Escribe un comentario.' });
  }

  const [postRows] = await pool.execute('SELECT id FROM posts WHERE id = ?', [req.params.id]);
  if (!postRows.length) {
    return res.status(404).json({ message: 'La publicación no existe.' });
  }

  const [result] = await pool.execute(
    'INSERT INTO comments (post_id, user_id, message) VALUES (?, ?, ?)',
    [req.params.id, req.user.id, message]
  );
  res.status(201).json({ id: result.insertId, message: 'Comentario agregado.' });
});

app.get('/api/users/me', requireAuth, async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, academic_record, first_name, last_name, email, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  res.json(rows[0]);
});

app.put('/api/users/me', requireAuth, async (req, res) => {
  const firstName = clean(req.body.first_name);
  const lastName = clean(req.body.last_name);
  const email = clean(req.body.email).toLowerCase();

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ message: 'Nombres, apellidos y correo son obligatorios.' });
  }

  try {
    await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?',
      [firstName, lastName, email, req.user.id]
    );
    res.json({ message: 'Perfil actualizado.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ese correo ya está siendo utilizado.' });
    }
    throw error;
  }
});

app.get('/api/users/:academicRecord', requireAuth, async (req, res) => {
  const [rows] = await pool.execute(`
    SELECT id, academic_record, first_name, last_name, email, created_at
    FROM users WHERE academic_record = ? LIMIT 1
  `, [req.params.academicRecord]);

  if (!rows.length) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }
  res.json(rows[0]);
});

app.get('/api/users/:academicRecord/courses', requireAuth, async (req, res) => {
  const [users] = await pool.execute('SELECT id FROM users WHERE academic_record = ? LIMIT 1', [req.params.academicRecord]);
  if (!users.length) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }

  const [courses] = await pool.execute(`
    SELECT c.id, c.code, c.name, c.section, c.credits, uc.approved_at
    FROM user_courses uc
    JOIN courses c ON c.id = uc.course_id
    WHERE uc.user_id = ?
    ORDER BY c.name, c.section
  `, [users[0].id]);

  const totalCredits = courses.reduce((sum, course) => sum + Number(course.credits || 0), 0);
  res.json({ courses, total_credits: totalCredits });
});

app.post('/api/users/me/courses', requireAuth, async (req, res) => {
  const courseId = Number(req.body.course_id);
  if (!courseId) {
    return res.status(400).json({ message: 'Selecciona un curso.' });
  }

  try {
    await pool.execute('INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)', [req.user.id, courseId]);
    res.status(201).json({ message: 'Curso aprobado agregado.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ese curso ya está en tu lista.' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }
    throw error;
  }
});

app.delete('/api/users/me/courses/:courseId', requireAuth, async (req, res) => {
  await pool.execute('DELETE FROM user_courses WHERE user_id = ? AND course_id = ?', [req.user.id, req.params.courseId]);
  res.json({ message: 'Curso eliminado de tu lista.' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Ocurrió un error inesperado en el servidor.' });
});

app.listen(PORT, async () => {
  console.log(`API disponible en http://localhost:${PORT}`);
  try {
    await checkDatabase();
    console.log('MySQL conectado correctamente.');
  } catch (error) {
    console.error('No se pudo conectar a MySQL:', error.message);
  }
});
