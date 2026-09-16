import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'solo-desarrollo-cambia-esta-clave';

export function createToken(user) {
  return jwt.sign(
    { id: user.id, academic_record: user.academic_record },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Debes iniciar sesión.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Sesión inválida o vencida.' });
  }
}
