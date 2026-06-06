import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icons';
import { apiFetch } from '../lib/api';

// ─── helpers ─────────────────────────────────────────────────────────────────

function getInitials(name = '') {
  return String(name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

function formatNumber(value) {
  return String(Number(value || 0));
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(0)}%`;
}

function trendPoints(value, delta = 0) {
  const current = Math.max(0, Number(value || 0));
  const prev = delta === 100 ? 0 : Math.max(0, Math.round(current / (1 + Number(delta || 0) / 100)));
  const mid = Math.round((prev + current) / 2);
  return [
    Math.max(0, Math.round(prev * 0.86)),
    Math.max(0, Math.round(prev)),
    Math.max(0, Math.round(mid * 0.95)),
    Math.max(0, Math.round(mid)),
    Math.max(0, Math.round((mid + current) / 2)),
    Math.max(0, Math.round(current * 0.96)),
    Math.max(0, Math.round(current)),
  ];
}

// ─── sub-components ───────────────────────────────────────────────────────────

function Sparkline({ points = [], tone = 'pink' }) {
  const strokes = { pink: '#ff4d88', orange: '#ff8a34', blue: '#4f7cff', green: '#22a861', purple: '#7c3aed' };
  const values = points.length ? points.map((v) => Math.max(0, Number(v || 0))) : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...values, 1);
  const w = 88; const h = 28;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)} ${(h - (v / max) * 22 - 3).toFixed(1)}`).join(' ');
  return (
    <svg className="fm-metric-card__sparkline" fill="none" viewBox="0 0 88 28" xmlns="http://www.w3.org/2000/svg">
      <path d={path} stroke={strokes[tone] || strokes.pink} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
    </svg>
  );
}

function ProgressRing({ percent = 0 }) {
  const n = Math.max(0, Math.min(100, Number(percent || 0)));
  return (
    <div aria-hidden="true" className="fm-progress-ring fm-progress-ring--students" style={{ background: `conic-gradient(#7c3aed 0 ${n}%, #ece9ff ${n}% 100%)` }}>
      <span />
    </div>
  );
}

function MetricCard({ detail, icon, progress, title, tone, value }) {
  return (
    <article className="fm-student-metric-card">
      <div className="fm-student-metric-card__main">
        <div className={`fm-metric-card__icon is-${tone}`} aria-hidden="true"><Icon name={icon} size={18} /></div>
        <div className="fm-student-metric-card__content">
          <span className="fm-student-metric-card__label">{title}</span>
          <strong className="fm-student-metric-card__value">{value}</strong>
          <small className="fm-student-metric-card__detail">{detail}</small>
        </div>
      </div>
      <div className="fm-student-metric-card__chart" aria-hidden="true">
        {typeof progress === 'number' ? <ProgressRing percent={progress} /> : <Sparkline points={progress} tone={tone} />}
      </div>
    </article>
  );
}

function StudentsMetrics({ metrics, compact = false }) {
  const delta = metrics?.trends?.new_this_month?.pct || 0;
  const cards = [
    { key: 'total', title: 'Total de alunos', value: formatNumber(metrics?.total), detail: `↑ 0% em relacao ao mes passado`, icon: 'students', tone: 'pink', progress: trendPoints(metrics?.total, 0) },
    { key: 'active', title: 'Alunos ativos', value: formatNumber(metrics?.active), detail: `↑ 0% em relacao ao mes passado`, icon: 'students', tone: 'orange', progress: trendPoints(metrics?.active, 0) },
    { key: 'new', title: 'Novos este mes', value: formatNumber(metrics?.new_this_month), detail: `↑ ${delta}% em relacao ao mes passado`, icon: 'plus', tone: 'green', progress: trendPoints(metrics?.new_this_month, delta) },
    { key: 'completion', title: 'Taxa de conclusao media', value: formatPercent(metrics?.avg_completion_rate), detail: `↑ 0% em relacao ao mes passado`, icon: 'chart', tone: 'purple', progress: Number(metrics?.avg_completion_rate || 0) },
  ];
  return (
    <section className={`fm-students-metrics-panel ${compact ? 'is-compact-grid' : ''}`}>
      {cards.map((card) => (
        <MetricCard detail={card.detail} icon={card.icon} key={card.key} progress={card.progress} title={card.title} tone={card.tone} value={card.value} />
      ))}
    </section>
  );
}

function StudentStatusBadge({ status, label }) {
  const toneMap = { active: 'green', inactive: 'gray', suspended: 'red' };
  const tone = toneMap[status] || 'gray';
  return <span className={`fm-status-badge is-${tone}`}>{label || status}</span>;
}

function StudentListItem({ isActive, isSelected, onDelete, onQuickEnroll, onSelect, onToggleSelected, student }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handlePointer(event) {
      if (!menuRef.current || menuRef.current.contains(event.target)) return;
      setMenuOpen(false);
    }
    document.addEventListener('mousedown', handlePointer);
    return () => document.removeEventListener('mousedown', handlePointer);
  }, []);

  const courseCount = (student.course_ids || []).length;

  return (
    <article className={`fm-student-list-item ${isActive ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''}`}>
      <button aria-label={`${isSelected ? 'Desmarcar' : 'Marcar'} ${student.name}`} className="fm-student-check" onClick={() => onToggleSelected(student.id)} type="button">
        {isSelected ? <Icon name="published" size={14} /> : null}
      </button>
      <button className="fm-student-list-item__main" onClick={() => onSelect(student.id)} type="button">
        <div className="fm-student-list-item__head">
          {student.avatar_url ? (
            <img alt={student.name} className="fm-student-list-item__avatar" src={student.avatar_url} />
          ) : (
            <div className="fm-student-list-item__avatar is-fallback" aria-hidden="true">{getInitials(student.name)}</div>
          )}
          <strong className="fm-student-list-item__name">{student.name}</strong>
        </div>
        <div className="fm-student-list-item__meta">
          <span className="fm-student-list-item__email">{student.email}</span>
          {student.phone ? <span className="fm-student-list-item__phone">{student.phone}</span> : null}
        </div>
        <div className="fm-student-list-item__foot">
          <StudentStatusBadge status={courseCount > 0 ? 'active' : 'inactive'} label={courseCount > 0 ? `${courseCount} curso${courseCount === 1 ? '' : 's'}` : 'Inativo'} />
          <div className="fm-student-list-progress" aria-hidden="true"><span style={{ width: '0%' }} /></div>
        </div>
      </button>
      <div className="fm-course-list-item__menu-wrap" ref={menuRef}>
        <button aria-label={`Acoes para ${student.name}`} className={`fm-course-list-item__menu ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen((c) => !c)} type="button">
          <Icon name="more" size={16} />
        </button>
        {menuOpen ? (
          <div className="fm-course-menu">
            <button onClick={() => { setMenuOpen(false); onSelect(student.id); }} type="button"><Icon name="eye" size={14} /><span>Selecionar aluno</span></button>
            <button onClick={() => { setMenuOpen(false); onQuickEnroll(student.id); }} type="button"><Icon name="plus" size={14} /><span>Matricular cursos</span></button>
            <button onClick={() => { setMenuOpen(false); onDelete(student.id); }} type="button"><Icon name="trash" size={14} /><span>Apagar aluno</span></button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function StudentsList({ students, loading, selectedStudentId, selectedStudentIds, page, pageSize, totalPages, searchValue, filterCount, bulkMode, allSelected, onSelect, onSearch, onPageChange, onPageSizeChange, onFilter, onToggleSelected, onToggleAll, onDeleteStudent, onQuickEnroll, onCreateStudent }) {
  return (
    <div className="fm-students-rail__panel">
      <div className="fm-catalog-header">
        <div className="fm-catalog-header__title">
          <span className="fm-catalog-header__icon" aria-hidden="true"><Icon name="students" size={16} /></span>
          <h3>Seus alunos</h3>
        </div>
        <button className="fm-button fm-button--gradient" onClick={onCreateStudent} type="button">
          {selectedStudentIds.length > 0 ? <><Icon name="settings" size={14} /><span>Ações</span></> : <><Icon name="plus" size={14} /><span>Novo aluno</span></>}
        </button>
      </div>

      <div className="fm-students-search-row">
        <label className="fm-catalog-search">
          <Icon name="search" size={16} />
          <input onChange={(e) => onSearch(e.target.value)} placeholder="Buscar aluno..." value={searchValue} />
        </label>
        <button className={`fm-icon-button ${filterCount > 0 ? 'is-active' : ''}`} onClick={onFilter} type="button">
          <Icon name="filter" size={16} />
          {filterCount > 0 ? <span className="fm-filter-badge">{filterCount}</span> : null}
        </button>
      </div>

      <div className="fm-students-select-all">
        <label className="fm-student-check-all">
          <input checked={allSelected} onChange={onToggleAll} type="checkbox" />
          <span>Selecionar todos</span>
        </label>
      </div>

      {loading ? (
        <div className="fm-editor-skeleton" style={{ height: 200 }} />
      ) : students.length === 0 ? (
        <div className="fm-cloud-empty" style={{ padding: '2rem 1rem' }}>
          <strong>Nenhum aluno</strong>
          <p>Cadastre o primeiro aluno ou ajuste a busca.</p>
        </div>
      ) : (
        students.map((student) => (
          <StudentListItem
            isActive={Number(selectedStudentId) === Number(student.id)}
            isSelected={selectedStudentIds.includes(Number(student.id))}
            key={student.id}
            onDelete={onDeleteStudent}
            onQuickEnroll={onQuickEnroll}
            onSelect={onSelect}
            onToggleSelected={(id) => onToggleSelected(Number(id))}
            student={student}
          />
        ))
      )}

      {totalPages > 1 ? (
        <div className="fm-students-pagination">
          <label>
            Mostrar
            <select onChange={(e) => onPageSizeChange(Number(e.target.value))} value={pageSize}>
              {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <span>
            <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} type="button"><Icon name="arrowLeft" size={14} /></button>
            {page} / {totalPages}
            <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} type="button"><Icon name="arrowRight" size={14} /></button>
          </span>
        </div>
      ) : null}
    </div>
  );
}

function StudentProfileHeader({ student }) {
  return (
    <div className="fm-student-profile-header">
      <div className="fm-student-profile-header__avatar">
        {student.avatar_url ? (
          <img alt={student.name} src={student.avatar_url} />
        ) : (
          <div className="fm-student-profile-header__initials">{getInitials(student.name)}</div>
        )}
      </div>
      <div className="fm-student-profile-header__info">
        <strong>{student.name}</strong>
        <span>{student.email}</span>
        {student.phone ? <small>{student.phone}</small> : null}
        <span className="fm-student-profile-header__since">Desde {new Date(student.created_at || '').toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  );
}

function StudentCoursesTable({ courses, onEnroll }) {
  return (
    <div className="fm-student-courses-table">
      <div className="fm-student-courses-table__header">
        <strong>Cursos matriculados</strong>
        <button className="fm-button fm-button--gradient" onClick={onEnroll} type="button"><Icon name="plus" size={14} />Gerenciar</button>
      </div>
      {courses.length === 0 ? (
        <p className="fm-student-courses-table__empty">Este aluno não está matriculado em nenhum curso.</p>
      ) : (
        <div className="fm-student-courses-list">
          {courses.map((course) => (
            <div className="fm-student-course-row" key={course.id}>
              {course.cover_image_url ? <img alt="" src={course.cover_image_url} /> : <span className="fm-student-course-row__icon"><Icon name="courseLibrary" size={14} /></span>}
              <div>
                <strong>{course.title}</strong>
                <span className={`fm-status-badge is-${course.enrollment_status === 'active' ? 'green' : 'gray'}`}>{course.enrollment_status === 'active' ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EnrollModal({ open, onClose, student, courses, availableCourses, onConfirm, loading }) {
  const [pendingActions, setPendingActions] = useState({});
  const [search, setSearch] = useState('');

  const enrolledIds = useMemo(() => availableCourses.filter((c) => c.isEnrolled).map((c) => Number(c.id)), [availableCourses]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return availableCourses.filter((c) => !q || String(c.title || '').toLowerCase().includes(q));
  }, [availableCourses, search]);

  function toggle(course) {
    setPendingActions((current) => {
      const next = { ...current };
      if (course.isEnrolled) {
        next[course.id] = next[course.id] === 'unenroll' ? undefined : 'unenroll';
      } else {
        next[course.id] = next[course.id] === 'enroll' ? undefined : 'enroll';
      }
      if (next[course.id] === undefined) delete next[course.id];
      return next;
    });
  }

  const operations = Object.entries(pendingActions).map(([courseId, action]) => ({ action, course_id: Number(courseId) }));

  if (!open) return null;
  return (
    <div className="fm-modal-backdrop" role="presentation">
      <div aria-modal="true" className="fm-modal-card fm-modal-card--enroll" role="dialog">
        <div className="fm-modal-card__header">
          <div><h3>Gerenciar matrículas</h3><p>{student?.name || 'Aluno'}</p></div>
          <button className="fm-icon-button" onClick={onClose} type="button"><Icon name="close" size={16} /></button>
        </div>
        <div className="fm-modal-card__body">
          <label className="fm-catalog-search" style={{ margin: '0 0 1rem' }}>
            <Icon name="search" size={15} />
            <input onChange={(e) => setSearch(e.target.value)} placeholder="Buscar curso..." value={search} />
          </label>
          <div className="fm-enroll-list">
            {filtered.map((course) => {
              const pending = pendingActions[course.id];
              const isEnrolled = course.isEnrolled;
              const willEnroll = isEnrolled ? pending !== 'unenroll' : pending === 'enroll';
              return (
                <button
                  className={`fm-enroll-item ${willEnroll ? 'is-enrolled' : ''}`}
                  key={course.id}
                  onClick={() => toggle(course)}
                  type="button"
                >
                  {course.cover_image_thumb_url ? <img alt="" src={course.cover_image_thumb_url} /> : <Icon name="courseLibrary" size={14} />}
                  <span>{course.title}</span>
                  <span className={`fm-status-badge is-${willEnroll ? 'green' : 'gray'}`}>{willEnroll ? 'Matriculado' : 'Nao matriculado'}</span>
                </button>
              );
            })}
            {!filtered.length ? <p style={{ padding: '1rem', color: 'var(--fm-text-3)' }}>Nenhum curso encontrado.</p> : null}
          </div>
        </div>
        <div className="fm-admin-actions">
          <button className="fm-button fm-button--ghost" onClick={onClose} type="button">Cancelar</button>
          <button className="fm-button fm-button--gradient" disabled={loading || !operations.length} onClick={() => onConfirm(operations)} type="button">
            {loading ? 'Salvando...' : `Salvar (${operations.length} alteração${operations.length === 1 ? '' : 'ões'})`}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateStudentModal({ open, onClose, onConfirm, loading, courses, allCourses }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (allCourses || []).filter((c) => !q || String(c.title || '').toLowerCase().includes(q));
  }, [allCourses, search]);

  function toggleCourse(id) {
    setSelectedCourseIds((current) => current.includes(Number(id)) ? current.filter((c) => c !== Number(id)) : [...current, Number(id)]);
  }

  if (!open) return null;
  return (
    <div className="fm-modal-backdrop" role="presentation">
      <div aria-modal="true" className="fm-modal-card fm-modal-card--create-student" role="dialog">
        <div className="fm-modal-card__header">
          <div><h3>Novo aluno</h3><p>Cadastre um aluno e libere os cursos desejados.</p></div>
          <button className="fm-icon-button" onClick={onClose} type="button"><Icon name="close" size={16} /></button>
        </div>
        <div className="fm-modal-card__body">
          <div className="fm-create-student-form">
            <label><span>Nome</span><input onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder="Nome completo" value={form.name} /></label>
            <label><span>Email</span><input onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} placeholder="email@dominio.com" type="email" value={form.email} /></label>
            <label><span>Telefone</span><input onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))} placeholder="(11) 99999-9999" value={form.phone} /></label>
          </div>
          {allCourses?.length > 0 ? (
            <>
              <strong style={{ display: 'block', marginTop: '1rem', marginBottom: '.5rem', fontSize: '.8rem' }}>Cursos (opcional)</strong>
              <label className="fm-catalog-search" style={{ marginBottom: '.5rem' }}>
                <Icon name="search" size={15} />
                <input onChange={(e) => setSearch(e.target.value)} placeholder="Buscar curso..." value={search} />
              </label>
              <div className="fm-enroll-list" style={{ maxHeight: 180 }}>
                {filtered.map((course) => (
                  <button className={`fm-enroll-item ${selectedCourseIds.includes(Number(course.id)) ? 'is-enrolled' : ''}`} key={course.id} onClick={() => toggleCourse(course.id)} type="button">
                    <Icon name="courseLibrary" size={14} />
                    <span>{course.title}</span>
                    {selectedCourseIds.includes(Number(course.id)) ? <Icon name="published" size={14} /> : null}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
        <div className="fm-admin-actions">
          <button className="fm-button fm-button--ghost" onClick={onClose} type="button">Cancelar</button>
          <button className="fm-button fm-button--gradient" disabled={loading || !form.name || !form.email} onClick={() => onConfirm({ ...form, course_ids: selectedCourseIds })} type="button">
            {loading ? 'Cadastrando...' : 'Cadastrar aluno'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main module ─────────────────────────────────────────────────────────────

export default function CloudStudentsModule() {
  const [students, setStudents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCourses, setStudentCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadStudents = useCallback(async (search) => {
    setLoading(true);
    setError('');
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await apiFetch(`/api/students${q}`);
      setStudents(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setError(err.message || 'Nao foi possivel carregar os alunos.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMetrics = useCallback(async () => {
    try {
      const data = await apiFetch('/api/students/metrics');
      setMetrics(data);
    } catch {
      // silently fail
    }
  }, []);

  const loadStudentDetail = useCallback(async (id) => {
    if (!id) { setSelectedStudent(null); setStudentCourses([]); return; }
    setLoadingDetail(true);
    try {
      const [studentData, coursesData] = await Promise.all([
        apiFetch(`/api/students/${id}`),
        apiFetch(`/api/students/${id}/courses`),
      ]);
      setSelectedStudent(studentData);
      setStudentCourses(Array.isArray(coursesData?.items) ? coursesData.items : []);
    } catch (err) {
      setError(err.message || 'Nao foi possivel carregar o aluno.');
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const loadCourses = useCallback(async () => {
    try {
      const data = await apiFetch('/api/courses');
      const items = Array.isArray(data?.courses) ? data.courses : (Array.isArray(data) ? data : []);
      setAllCourses(items.filter((c) => c.status === 'published'));
    } catch { /* silently */ }
  }, []);

  useEffect(() => { loadStudents(searchValue); }, [loadStudents, searchValue]);
  useEffect(() => { loadMetrics(); }, [loadMetrics]);
  useEffect(() => { loadStudentDetail(selectedStudentId); }, [loadStudentDetail, selectedStudentId]);

  const visibleStudents = useMemo(() => students, [students]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(visibleStudents.length / pageSize)), [pageSize, visibleStudents.length]);
  const paginatedStudents = useMemo(() => visibleStudents.slice((page - 1) * pageSize, page * pageSize), [page, pageSize, visibleStudents]);
  const allPageSelected = paginatedStudents.length > 0 && paginatedStudents.every((s) => selectedStudentIds.includes(Number(s.id)));

  const enrollAvailableCourses = useMemo(() => allCourses.map((c) => ({
    ...c,
    isEnrolled: studentCourses.some((sc) => Number(sc.id) === Number(c.id)),
  })), [allCourses, studentCourses]);

  async function handleCreateStudent(form) {
    setSaving(true);
    setError('');
    try {
      const created = await apiFetch('/api/students', { method: 'POST', body: JSON.stringify(form) });
      await Promise.all([loadStudents(searchValue), loadMetrics()]);
      setSelectedStudentId(created?.id || null);
      setMessage('Aluno cadastrado.');
      setIsCreateOpen(false);
    } catch (err) {
      setError(err.message || 'Nao foi possivel cadastrar o aluno.');
    } finally {
      setSaving(false);
    }
  }

  async function handleEnrollConfirm(operations) {
    if (!selectedStudentId || !operations.length) return;
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/api/students/${selectedStudentId}/enrollments`, { method: 'POST', body: JSON.stringify({ operations }) });
      await Promise.all([loadStudents(searchValue), loadStudentDetail(selectedStudentId), loadMetrics()]);
      setMessage('Matrículas atualizadas.');
      setIsEnrollOpen(false);
    } catch (err) {
      setError(err.message || 'Nao foi possivel atualizar as matriculas.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStudent(id) {
    if (!window.confirm('Apagar este aluno?')) return;
    setError('');
    try {
      await apiFetch('/api/students/bulk', { method: 'POST', body: JSON.stringify({ action: 'delete', student_ids: [Number(id)], course_ids: [] }) });
      await Promise.all([loadStudents(searchValue), loadMetrics()]);
      if (Number(selectedStudentId) === Number(id)) setSelectedStudentId(null);
      setMessage('Aluno apagado.');
    } catch (err) {
      setError(err.message || 'Nao foi possivel apagar o aluno.');
    }
  }

  function openCreateOrBulk() {
    if (selectedStudentIds.length > 0) return; // Bulk actions later
    loadCourses();
    setIsCreateOpen(true);
  }

  function openEnroll(id = selectedStudentId) {
    if (id) setSelectedStudentId(id);
    loadCourses();
    setIsEnrollOpen(true);
  }

  function toggleStudentSelection(id) {
    setSelectedStudentIds((current) => current.includes(id) ? current.filter((i) => i !== id) : [...current, id]);
  }

  function toggleAll() {
    const ids = paginatedStudents.map((s) => Number(s.id));
    setSelectedStudentIds((current) => ids.every((id) => current.includes(id)) ? current.filter((id) => !ids.includes(id)) : Array.from(new Set([...current, ...ids])));
  }

  const hasSelection = Boolean(selectedStudent);

  return (
    <section className="fm-admin-section fm-students-screen">
      {error ? <div className="fm-admin-alert fm-admin-alert--error">{error}</div> : null}
      {message ? <div className="fm-admin-alert fm-admin-alert--success">{message}</div> : null}

      <div className={`fm-students-unified-surface ${hasSelection ? 'has-selection' : 'is-overview'}`}>
        <div className="fm-students-body">
          <aside className="fm-students-rail" id="students-list-section">
            <StudentsList
              allSelected={allPageSelected}
              bulkMode={selectedStudentIds.length > 0}
              filterCount={0}
              loading={loading}
              onCreateStudent={openCreateOrBulk}
              onDeleteStudent={handleDeleteStudent}
              onFilter={() => {}}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onQuickEnroll={openEnroll}
              onSearch={setSearchValue}
              onSelect={setSelectedStudentId}
              onToggleAll={toggleAll}
              onToggleSelected={toggleStudentSelection}
              page={page}
              pageSize={pageSize}
              searchValue={searchValue}
              selectedStudentId={selectedStudentId}
              selectedStudentIds={selectedStudentIds}
              students={paginatedStudents}
              totalPages={totalPages}
            />
          </aside>

          <div className="fm-students-content">
            <div className="fm-students-content__section">
              {loadingDetail ? (
                <div className="fm-editor-skeleton" style={{ height: 300 }} />
              ) : selectedStudent ? (
                <div className="fm-students-detail-stack">
                  <StudentProfileHeader student={selectedStudent} />
                  <StudentCoursesTable courses={studentCourses} onEnroll={() => openEnroll()} />
                </div>
              ) : (
                <div className={`fm-students-empty-panel ${visibleStudents.length > 0 ? 'has-students' : 'is-empty'}`}>
                  {visibleStudents.length > 0 ? (
                    <div className="fm-students-empty-metrics">
                      <StudentsMetrics compact metrics={metrics} />
                    </div>
                  ) : (
                    <>
                      <section className="fm-students-empty-hero">
                        <div className="fm-students-empty-hero__badge" aria-hidden="true"><Icon name="students" size={18} /></div>
                        <div className="fm-students-empty-hero__copy">
                          <span className="fm-students-empty-hero__eyebrow">Base de alunos</span>
                          <h3>Nenhum aluno encontrado no momento</h3>
                          <p>Cadastre um novo aluno ou ajuste os filtros atuais.</p>
                        </div>
                      </section>
                      <div className="fm-students-empty-actions">
                        <button className="fm-button fm-button--gradient" onClick={openCreateOrBulk} type="button"><Icon name="plus" size={14} /><span>Novo aluno</span></button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateStudentModal
        allCourses={allCourses}
        courses={allCourses}
        loading={saving}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleCreateStudent}
        open={isCreateOpen}
      />

      <EnrollModal
        availableCourses={enrollAvailableCourses}
        courses={allCourses}
        loading={saving}
        onClose={() => setIsEnrollOpen(false)}
        onConfirm={handleEnrollConfirm}
        open={isEnrollOpen}
        student={selectedStudent}
      />
    </section>
  );
}
