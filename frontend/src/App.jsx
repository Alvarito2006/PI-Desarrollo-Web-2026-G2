import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { api } from './api.js';

function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  const login = (payload) => {
    localStorage.setItem('token', payload.token);
    localStorage.setItem('user', JSON.stringify(payload.user));
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateLocalUser = (changes) => {
    const updated = { ...user, ...changes };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  return { user, login, logout, updateLocalUser };
}

function Message({ type = 'info', children }) {
  if (!children) return null;
  return <div className={`message ${type}`}>{children}</div>;
}

function PublicOnly({ user, children }) {
  return user ? <Navigate to="/" replace /> : children;
}

function PrivateOnly({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

function AuthCard({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">FI</div>
        <h1>{title}</h1>
        <p className="muted center">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ academic_record: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(form) });
      onLogin(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Ingeniería USAC" subtitle="Opiniones de cursos y catedráticos">
      <form onSubmit={submit} className="stack">
        <label>Registro académico
          <input value={form.academic_record} onChange={(e) => setForm({ ...form, academic_record: e.target.value })} placeholder="Ej. 202501955" required />
        </label>
        <label>Contraseña
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Tu contraseña" required />
        </label>
        <Message type="error">{error}</Message>
        <button className="btn primary" disabled={loading}>{loading ? 'Ingresando...' : 'Iniciar sesión'}</button>
      </form>
      <div className="auth-links">
        <Link to="/registro">Crear cuenta</Link>
        <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
      </div>
    </AuthCard>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ academic_record: '', first_name: '', last_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/auth/register', { method: 'POST', body: JSON.stringify(form) });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Crear cuenta" subtitle="Regístrate para publicar y comentar">
      <form onSubmit={submit} className="stack">
        <label>Registro académico<input value={form.academic_record} onChange={set('academic_record')} required /></label>
        <div className="grid two">
          <label>Nombres<input value={form.first_name} onChange={set('first_name')} required /></label>
          <label>Apellidos<input value={form.last_name} onChange={set('last_name')} required /></label>
        </div>
        <label>Correo electrónico<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Contraseña<input type="password" minLength="6" value={form.password} onChange={set('password')} required /></label>
        <Message type="error">{error}</Message>
        <button className="btn primary" disabled={loading}>{loading ? 'Registrando...' : 'Registrarme'}</button>
      </form>
      <p className="center small">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </AuthCard>
  );
}

function ForgotPage() {
  const [form, setForm] = useState({ academic_record: '', email: '', new_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = await api('/auth/reset-password', { method: 'POST', body: JSON.stringify(form) });
      setMessage(data.message);
      setForm({ ...form, new_password: '' });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthCard title="Recuperar contraseña" subtitle="El registro académico y el correo deben coincidir">
      <form onSubmit={submit} className="stack">
        <label>Registro académico<input value={form.academic_record} onChange={(e) => setForm({ ...form, academic_record: e.target.value })} required /></label>
        <label>Correo electrónico<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
        <label>Nueva contraseña<input type="password" minLength="6" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} required /></label>
        <Message type="error">{error}</Message>
        <Message type="success">{message}</Message>
        <button className="btn primary">Cambiar contraseña</button>
      </form>
      <p className="center small"><Link to="/login">Volver al inicio de sesión</Link></p>
    </AuthCard>
  );
}

function AppLayout({ user, onLogout, children }) {
  const navigate = useNavigate();
  const [record, setRecord] = useState('');

  function searchUser(event) {
    event.preventDefault();
    const value = record.trim();
    if (!value) return;
    navigate(`/perfil/${encodeURIComponent(value)}`);
    setRecord('');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/"><span className="brand-icon">FI</span><span>Opiniones FIUSAC</span></Link>
        <form className="user-search" onSubmit={searchUser}>
          <input value={record} onChange={(e) => setRecord(e.target.value)} placeholder="Buscar registro académico" />
          <button className="btn ghost">Buscar</button>
        </form>
        <nav>
          <Link to="/">Inicio</Link>
          <Link to="/publicar">Publicar</Link>
          <Link to="/perfil">Mi perfil</Link>
          <button className="link-button" onClick={onLogout}>Salir</button>
        </nav>
      </header>
      <div className="welcome-strip">Hola, <strong>{user.first_name}</strong>. Comparte información útil y respetuosa con la comunidad.</div>
      {children}
    </div>
  );
}

function PostCard({ post }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const subject = post.subject_type === 'course'
    ? `${post.course_name} · Sección ${post.course_section || '-'}`
    : `${post.teacher_name}${post.teacher_section ? ` · Sección ${post.teacher_section}` : ''}`;

  async function loadComments() {
    setOpen((current) => !current);
    if (!open) {
      try {
        setComments(await api(`/posts/${post.id}/comments`));
      } catch (err) {
        setError(err.message);
      }
    }
  }

  async function addComment(event) {
    event.preventDefault();
    setError('');
    try {
      await api(`/posts/${post.id}/comments`, { method: 'POST', body: JSON.stringify({ message: text }) });
      setText('');
      setComments(await api(`/posts/${post.id}/comments`));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <article className="post-card">
      <div className="post-head">
        <div>
          <span className={`pill ${post.subject_type}`}>{post.subject_type === 'course' ? 'Curso' : 'Catedrático'}</span>
          <h3>{subject}</h3>
        </div>
        <time>{new Date(post.created_at).toLocaleString('es-GT')}</time>
      </div>
      <p className="post-message">{post.message}</p>
      <div className="post-meta">
        <Link to={`/perfil/${post.academic_record}`}>{post.first_name} {post.last_name}</Link>
        <button className="btn ghost compact" onClick={loadComments}>{open ? 'Ocultar comentarios' : `Comentarios (${post.comments_count})`}</button>
      </div>
      {open && (
        <div className="comments">
          {comments.length === 0 && <p className="muted small">Todavía no hay comentarios.</p>}
          {comments.map((comment) => (
            <div className="comment" key={comment.id}>
              <strong>{comment.first_name} {comment.last_name}</strong>
              <span>{comment.message}</span>
              <small>{new Date(comment.created_at).toLocaleString('es-GT')}</small>
            </div>
          ))}
          <form onSubmit={addComment} className="comment-form">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe una opinión adicional..." required />
            <button className="btn primary compact">Comentar</button>
          </form>
          <Message type="error">{error}</Message>
        </div>
      )}
    </article>
  );
}

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filters, setFilters] = useState({ courseId: '', teacherId: '', courseName: '', teacherName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadPosts(nextFilters = filters) {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      Object.entries(nextFilters).forEach(([key, value]) => value && params.set(key, value));
      const query = params.toString() ? `?${params}` : '';
      setPosts(await api(`/posts${query}`));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([api('/catalog/courses'), api('/catalog/teachers')])
      .then(([courseData, teacherData]) => {
        setCourses(courseData);
        setTeachers(teacherData);
      })
      .catch((err) => setError(err.message));
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submitFilters(event) {
    event.preventDefault();
    loadPosts();
  }

  function clearFilters() {
    const empty = { courseId: '', teacherId: '', courseName: '', teacherName: '' };
    setFilters(empty);
    loadPosts(empty);
  }

  return (
    <main className="page container">
      <div className="page-title-row">
        <div><h1>Publicaciones</h1><p className="muted">Las opiniones más recientes aparecen primero.</p></div>
        <Link className="btn primary" to="/publicar">+ Nueva publicación</Link>
      </div>

      <section className="panel filters-panel">
        <h2>Buscar y filtrar</h2>
        <form onSubmit={submitFilters} className="filters-grid">
          <label>Curso
            <select value={filters.courseId} onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}>
              <option value="">Todos</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.name} ({course.section})</option>)}
            </select>
          </label>
          <label>Catedrático
            <select value={filters.teacherId} onChange={(e) => setFilters({ ...filters, teacherId: e.target.value })}>
              <option value="">Todos</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.section || '-'})</option>)}
            </select>
          </label>
          <label>Nombre del curso
            <input value={filters.courseName} onChange={(e) => setFilters({ ...filters, courseName: e.target.value })} placeholder="Ej. Bases de Datos" />
          </label>
          <label>Nombre del catedrático
            <input value={filters.teacherName} onChange={(e) => setFilters({ ...filters, teacherName: e.target.value })} placeholder="Ej. Escobar" />
          </label>
          <div className="filter-actions">
            <button className="btn primary">Aplicar filtros</button>
            <button type="button" className="btn secondary" onClick={clearFilters}>Limpiar</button>
          </div>
        </form>
      </section>

      <Message type="error">{error}</Message>
      {loading ? <p className="loading">Cargando publicaciones...</p> : (
        <section className="posts-list">
          {posts.length === 0 ? <div className="empty">No hay publicaciones para los filtros seleccionados.</div> : posts.map((post) => <PostCard key={post.id} post={post} />)}
        </section>
      )}
    </main>
  );
}

function CreatePostPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ subject_type: 'course', subject_id: '', message: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/catalog/courses'), api('/catalog/teachers')])
      .then(([c, t]) => { setCourses(c); setTeachers(t); })
      .catch((err) => setError(err.message));
  }, []);

  const options = form.subject_type === 'course' ? courses : teachers;

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await api('/posts', { method: 'POST', body: JSON.stringify(form) });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page container narrow">
      <div className="page-title-row"><div><h1>Crear publicación</h1><p className="muted">Publica una experiencia sobre un curso o catedrático.</p></div></div>
      <section className="panel">
        <form onSubmit={submit} className="stack">
          <label>¿Sobre qué deseas publicar?
            <select value={form.subject_type} onChange={(e) => setForm({ ...form, subject_type: e.target.value, subject_id: '' })}>
              <option value="course">Curso</option>
              <option value="teacher">Catedrático</option>
            </select>
          </label>
          <label>{form.subject_type === 'course' ? 'Selecciona el curso' : 'Selecciona el catedrático'}
            <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {options.map((item) => (
                <option key={item.id} value={item.id}>
                  {form.subject_type === 'course' ? `${item.name} · Sección ${item.section || '-'}` : `${item.name} · ${item.course_name || 'Sin curso'} (${item.section || '-'})`}
                </option>
              ))}
            </select>
          </label>
          <label>Mensaje
            <textarea rows="7" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe tu experiencia de forma clara y respetuosa..." required />
          </label>
          <Message type="error">{error}</Message>
          <div className="actions"><button className="btn primary">Publicar</button><Link className="btn secondary" to="/">Cancelar</Link></div>
        </form>
      </section>
    </main>
  );
}

function ProfilePage({ currentUser, onUserUpdate }) {
  const params = useParams();
  const targetRecord = params.academicRecord || currentUser.academic_record;
  const isOwn = targetRecord === currentUser.academic_record;
  const [profile, setProfile] = useState(null);
  const [approved, setApproved] = useState({ courses: [], total_credits: 0 });
  const [catalog, setCatalog] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setError('');
    try {
      const [userData, courseData] = await Promise.all([
        isOwn ? api('/users/me') : api(`/users/${encodeURIComponent(targetRecord)}`),
        api(`/users/${encodeURIComponent(targetRecord)}/courses`)
      ]);
      setProfile(userData);
      setForm({ first_name: userData.first_name, last_name: userData.last_name, email: userData.email });
      setApproved(courseData);
      if (isOwn) setCatalog(await api('/catalog/courses'));
    } catch (err) {
      setProfile(null);
      setError(err.message);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [targetRecord]);

  const availableCourses = useMemo(() => {
    const ids = new Set(approved.courses.map((course) => course.id));
    return catalog.filter((course) => !ids.has(course.id));
  }, [catalog, approved.courses]);

  async function saveProfile(event) {
    event.preventDefault();
    setError(''); setMessage('');
    try {
      const data = await api('/users/me', { method: 'PUT', body: JSON.stringify(form) });
      setMessage(data.message);
      onUserUpdate(form);
      setEditing(false);
      await load();
    } catch (err) { setError(err.message); }
  }

  async function addCourse(event) {
    event.preventDefault();
    if (!selectedCourse) return;
    setError(''); setMessage('');
    try {
      const data = await api('/users/me/courses', { method: 'POST', body: JSON.stringify({ course_id: selectedCourse }) });
      setMessage(data.message);
      setSelectedCourse('');
      await load();
    } catch (err) { setError(err.message); }
  }

  async function removeCourse(courseId) {
    setError(''); setMessage('');
    try {
      await api(`/users/me/courses/${courseId}`, { method: 'DELETE' });
      await load();
    } catch (err) { setError(err.message); }
  }

  return (
    <main className="page container">
      <Message type="error">{error}</Message>
      <Message type="success">{message}</Message>
      {profile && (
        <>
          <section className="profile-hero panel">
            <div className="avatar">{profile.first_name?.[0]}{profile.last_name?.[0]}</div>
            <div className="profile-info">
              <span className="eyebrow">{isOwn ? 'Mi perfil' : 'Perfil de estudiante'}</span>
              <h1>{profile.first_name} {profile.last_name}</h1>
              <p><strong>Registro:</strong> {profile.academic_record}</p>
              <p><strong>Correo:</strong> {profile.email}</p>
            </div>
            {isOwn && <button className="btn secondary" onClick={() => setEditing(!editing)}>{editing ? 'Cancelar edición' : 'Editar perfil'}</button>}
          </section>

          {isOwn && editing && (
            <section className="panel">
              <h2>Editar información personal</h2>
              <p className="muted small">El registro académico no se puede modificar.</p>
              <form onSubmit={saveProfile} className="grid two">
                <label>Nombres<input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required /></label>
                <label>Apellidos<input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required /></label>
                <label>Correo<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
                <div className="align-end"><button className="btn primary">Guardar cambios</button></div>
              </form>
            </section>
          )}

          <section className="panel">
            <div className="section-title-row"><div><h2>Cursos aprobados</h2><p className="muted">Créditos acumulados según los cursos registrados.</p></div><div className="credit-badge"><strong>{approved.total_credits}</strong><span>créditos</span></div></div>

            {isOwn && (
              <form className="add-course" onSubmit={addCourse}>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                  <option value="">Selecciona un curso aprobado...</option>
                  {availableCourses.map((course) => <option key={course.id} value={course.id}>{course.name} · Sección {course.section || '-'} · {course.credits} créditos</option>)}
                </select>
                <button className="btn primary">Agregar</button>
              </form>
            )}

            <div className="course-list">
              {approved.courses.length === 0 ? <div className="empty">No hay cursos aprobados registrados.</div> : approved.courses.map((course) => (
                <div className="course-row" key={course.id}>
                  <div><strong>{course.name}</strong><span>Sección {course.section || '-'}{course.code ? ` · Código ${course.code}` : ''}</span></div>
                  <div className="course-actions"><span>{course.credits} créditos</span>{isOwn && <button className="danger-link" onClick={() => removeCourse(course.id)}>Eliminar</button>}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default function App() {
  const auth = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<PublicOnly user={auth.user}><LoginPage onLogin={auth.login} /></PublicOnly>} />
      <Route path="/registro" element={<PublicOnly user={auth.user}><RegisterPage /></PublicOnly>} />
      <Route path="/recuperar" element={<PublicOnly user={auth.user}><ForgotPage /></PublicOnly>} />

      <Route path="/" element={<PrivateOnly user={auth.user}>{auth.user && <AppLayout user={auth.user} onLogout={auth.logout}><HomePage /></AppLayout>}</PrivateOnly>} />
      <Route path="/publicar" element={<PrivateOnly user={auth.user}>{auth.user && <AppLayout user={auth.user} onLogout={auth.logout}><CreatePostPage /></AppLayout>}</PrivateOnly>} />
      <Route path="/perfil" element={<PrivateOnly user={auth.user}>{auth.user && <AppLayout user={auth.user} onLogout={auth.logout}><ProfilePage currentUser={auth.user} onUserUpdate={auth.updateLocalUser} /></AppLayout>}</PrivateOnly>} />
      <Route path="/perfil/:academicRecord" element={<PrivateOnly user={auth.user}>{auth.user && <AppLayout user={auth.user} onLogout={auth.logout}><ProfilePage currentUser={auth.user} onUserUpdate={auth.updateLocalUser} /></AppLayout>}</PrivateOnly>} />
      <Route path="*" element={<Navigate to={auth.user ? '/' : '/login'} replace />} />
    </Routes>
  );
}
