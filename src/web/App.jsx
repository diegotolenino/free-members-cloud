import { useEffect, useMemo, useState } from 'react';
import AdminShell from './components/AdminShell';
import CourseCatalog from './components/CourseCatalog';
import CloudCourseWorkspace from './components/CloudCourseWorkspace';
import CloudCoursesModule from './components/CloudCoursesModule';
import CloudStudentsModule from './components/CloudStudentsModule';
import CloudIntegrationsModule from './components/CloudIntegrationsModule';
import CloudCheckoutsModule from './components/CloudCheckoutsModule';
import CloudSalesModule from './components/CloudSalesModule';
import CloudDashboardModule from './components/CloudDashboardModule';
import Icon from './components/Icons';
import { apiFetch } from './lib/api';
import { setBootstrap } from './lib/bootstrap';

const sectionMeta = {
  dashboard: {
    title: 'Painel',
    description: 'Perfil, estilo e administradores da plataforma.',
  },
  courses: {
    title: 'Cursos',
    description: 'Crie e organize seus cursos, módulos e aulas.',
  },
  students: {
    title: 'Alunos',
    description: 'Gerencie sua base de alunos e matrículas.',
  },
  checkouts: {
    title: 'Checkouts',
    description: 'Builder de páginas de pagamento e ofertas.',
  },
  messages: {
    title: 'Notificações',
    description: 'Templates de email e notificações automáticas.',
  },
  integrations: {
    title: 'Integrações',
    description: 'Gateways, SMTP, WhatsApp e automações.',
  },
  pages: {
    title: 'Páginas',
    description: 'Prévia da área do aluno e páginas públicas.',
  },
  sales: {
    title: 'Vendas',
    description: 'Pedidos e métricas comerciais da plataforma.',
  },
};

function StatusCard({ icon, title, value, description }) {
  return (
    <article className="fm-cloud-status-card">
      <span><Icon name={icon} size={18} /></span>
      <div>
        <strong>{value}</strong>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

function SectionHeader({ activeSection }) {
  const meta = sectionMeta[activeSection] || sectionMeta.dashboard;
  return (
    <header className="fm-cloud-section-header">
      <div>
        <span>Free Members Cloud</span>
        <h1>{meta.title}</h1>
        <p>{meta.description}</p>
      </div>
    </header>
  );
}

function DashboardView({ bootstrap, health }) {
  return (
    <div className="fm-cloud-dashboard">
      <div className="fm-cloud-status-grid">
        <StatusCard icon="shield" title="Instalação" value={health?.database === 'ok' ? 'Saudável' : 'Aguardando D1'} description="Endpoint /api/health preparado para o dashboard instalador." />
        <StatusCard icon="cube" title="Versão" value={bootstrap?.app?.version || '0.1.0'} description="A instalação reporta versão para updates futuros." />
        <StatusCard icon="courseLibrary" title="Frontend" value="React" description="Visual herdado da Free Members atual, sem dependência WordPress." />
      </div>

      <section className="fm-cloud-note">
        <h2>Base iniciada</h2>
        <p>
          Este repo já tem Worker, D1 migration e a primeira casca visual. A próxima etapa é portar autenticação e o módulo de cursos.
        </p>
      </section>
    </div>
  );
}

const emptyCourseForm = {
  id: 0,
  title: '',
  slug: '',
  excerpt: '',
  status: 'draft',
  visibility: 'private',
  cover_image_url: '',
  banner_image_url: '',
};

const emptySectionForm = { id: 0, title: '', status: 'published', sort_order: 0 };
const emptyModuleForm = { id: 0, title: '', description: '', section_id: 0, status: 'draft', sort_order: 0, cover_image_url: '' };
const emptyLessonForm = {
  id: 0,
  title: '',
  module_id: 0,
  description_html: '',
  video_provider: 'youtube',
  video_url: '',
  video_embed_html: '',
  duration_seconds: 0,
  status: 'draft',
  sort_order: 0,
};

function normalizeCourseSummary(course = {}) {
  return {
    ...course,
    id: Number(course.id || 0),
    title: course.title || '',
    slug: course.slug || '',
    excerpt: course.excerpt || '',
    description: course.description || course.description_html || course.excerpt || '',
    cover_image_url: course.cover_image_url || '',
    cover_image_thumb_url: course.cover_image_thumb_url || course.cover_image_url || '',
    cover_image_id: Number(course.cover_image_id || (course.cover_image_url ? course.id || 0 : 0)),
    status: course.status || 'draft',
    visibility: course.visibility || 'private',
    stats: {
      modules: Number(course.stats?.modules || course.modules_count || 0),
      lessons: Number(course.stats?.lessons || course.lessons_count || 0),
    },
  };
}

function normalizeLessonForPlugin(lesson = {}) {
  return {
    ...lesson,
    id: Number(lesson.id || 0),
    module_id: Number(lesson.module_id || 0),
    title: lesson.title || '',
    description: lesson.description || lesson.description_html || '',
    content_source: lesson.content_source || lesson.video_provider || 'none',
    content_url: lesson.content_url || lesson.video_url || '',
    embed_html: lesson.embed_html || lesson.video_embed_html || '',
    duration_seconds: Number(lesson.duration_seconds || 0),
    materials: Array.isArray(lesson.materials) ? lesson.materials : [],
    status: lesson.status || 'draft',
    sort_order: Number(lesson.sort_order || 0),
  };
}

function normalizeModuleForPlugin(module = {}, lessons = []) {
  const moduleId = Number(module.id || 0);

  return {
    ...module,
    id: moduleId,
    section_id: module.section_id ? Number(module.section_id) : '',
    title: module.title || '',
    description: module.description || '',
    cover_image_url: module.cover_image_url || '',
    status: module.status || 'draft',
    sort_order: Number(module.sort_order || 0),
    lessons: lessons
      .filter((lesson) => Number(lesson.module_id || 0) === moduleId)
      .map(normalizeLessonForPlugin),
  };
}

function normalizeCourseDetailForPlugin(data = {}) {
  const rawCourse = data.course || data || {};
  const rawLessons = Array.isArray(data.lessons) ? data.lessons : [];
  const modules = (Array.isArray(data.modules) ? data.modules : []).map((module) => normalizeModuleForPlugin(module, rawLessons));
  const sections = (Array.isArray(data.sections) ? data.sections : []).map((section) => ({
    ...section,
    id: Number(section.id || 0),
    title: section.title || '',
    status: section.status || 'published',
    sort_order: Number(section.sort_order || 0),
    modules: modules.filter((module) => Number(module.section_id || 0) === Number(section.id || 0)),
  }));

  return {
    ...normalizeCourseSummary(rawCourse),
    description: rawCourse.description || rawCourse.description_html || rawCourse.excerpt || '',
    sections,
    modules,
    stats: {
      modules: modules.filter((module) => module.status !== 'archived').length,
      lessons: modules.reduce(
        (sum, module) => sum + (module.lessons || []).filter((lesson) => lesson.status !== 'archived').length,
        0
      ),
    },
  };
}

function coursePayloadFromPluginForm(form = {}) {
  const description = form.description || form.description_html || form.excerpt || '';

  return {
    title: form.title || '',
    slug: form.slug || '',
    excerpt: form.excerpt || description.replace(/<[^>]+>/g, '').slice(0, 220),
    description_html: description,
    status: form.status || 'published',
    visibility: form.visibility || 'private',
    cover_image_url: form.cover_image_url || form.cover_image_thumb_url || '',
    banner_image_url: form.banner_image_url || '',
  };
}

function CourseStructure({
  course,
  detail,
  forms,
  onArchiveItem,
  onEditItem,
  onFieldChange,
  onSubmitItem,
  onResetItem,
  saving,
}) {
  if (!course?.id) {
    return <div className="fm-cloud-empty"><strong>Selecione um curso</strong><p>Crie ou edite um curso para montar seções, módulos e aulas.</p></div>;
  }

  const sections = (detail?.sections || []).filter((item) => item.status !== 'archived');
  const modules = (detail?.modules || []).filter((item) => item.status !== 'archived');
  const lessons = (detail?.lessons || []).filter((item) => item.status !== 'archived');
  const looseModules = modules.filter((module) => !Number(module.section_id || 0));

  function renderModule(module) {
    const moduleLessons = lessons.filter((lesson) => Number(lesson.module_id) === Number(module.id));
    return (
      <div className="fm-cloud-module-card" key={module.id}>
        <header>
          <div>
            <strong>{module.title}</strong>
            {module.description ? <p>{module.description}</p> : null}
            <small>{moduleLessons.length} aula{moduleLessons.length === 1 ? '' : 's'}</small>
          </div>
          <div>
            <button onClick={() => onEditItem('module', module)} type="button">Editar</button>
            <button onClick={() => onArchiveItem('module', module)} type="button">Arquivar</button>
          </div>
        </header>
        <div className="fm-cloud-lessons-list">
          {moduleLessons.length ? moduleLessons.map((lesson) => (
            <div className="fm-cloud-lesson-row" key={lesson.id}>
              <span>{lesson.video_provider || 'none'}</span>
              <strong>{lesson.title}</strong>
              <button onClick={() => onEditItem('lesson', lesson)} type="button">Editar</button>
              <button onClick={() => onArchiveItem('lesson', lesson)} type="button">Arquivar</button>
            </div>
          )) : <p className="fm-cloud-structure-empty">Nenhuma aula neste módulo.</p>}
        </div>
      </div>
    );
  }

  return (
    <section className="fm-cloud-structure">
      <header>
        <div>
          <span>Estrutura do curso</span>
          <h2>{course.title}</h2>
        </div>
        <div className="fm-cloud-structure-stats">
          <strong>{sections.length}<span>seções</span></strong>
          <strong>{modules.length}<span>módulos</span></strong>
          <strong>{lessons.length}<span>aulas</span></strong>
        </div>
      </header>

      <div className="fm-cloud-structure-forms">
        <form onSubmit={(event) => { event.preventDefault(); onSubmitItem('section'); }}>
          <strong>{forms.section.id ? 'Editar seção' : 'Nova seção'}</strong>
          <input value={forms.section.title} onChange={(event) => onFieldChange('section', 'title', event.target.value)} placeholder="Nome da seção" />
          <div>
            {forms.section.id ? <button className="is-ghost" onClick={() => onResetItem('section')} type="button">Cancelar</button> : null}
            <button disabled={saving} type="submit">{forms.section.id ? 'Salvar' : 'Adicionar'}</button>
          </div>
        </form>

        <form onSubmit={(event) => { event.preventDefault(); onSubmitItem('module'); }}>
          <strong>{forms.module.id ? 'Editar módulo' : 'Novo módulo'}</strong>
          <input value={forms.module.title} onChange={(event) => onFieldChange('module', 'title', event.target.value)} placeholder="Nome do módulo" />
          <select value={forms.module.section_id || 0} onChange={(event) => onFieldChange('module', 'section_id', Number(event.target.value))}>
            <option value={0}>Sem seção</option>
            {sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}
          </select>
          <textarea value={forms.module.description} onChange={(event) => onFieldChange('module', 'description', event.target.value)} placeholder="Descrição curta" />
          <div>
            {forms.module.id ? <button className="is-ghost" onClick={() => onResetItem('module')} type="button">Cancelar</button> : null}
            <button disabled={saving} type="submit">{forms.module.id ? 'Salvar' : 'Adicionar'}</button>
          </div>
        </form>

        <form onSubmit={(event) => { event.preventDefault(); onSubmitItem('lesson'); }}>
          <strong>{forms.lesson.id ? 'Editar aula' : 'Nova aula'}</strong>
          <input value={forms.lesson.title} onChange={(event) => onFieldChange('lesson', 'title', event.target.value)} placeholder="Nome da aula" />
          <select value={forms.lesson.module_id || 0} onChange={(event) => onFieldChange('lesson', 'module_id', Number(event.target.value))}>
            <option value={0}>Selecione o módulo</option>
            {modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
          </select>
          <select value={forms.lesson.video_provider} onChange={(event) => onFieldChange('lesson', 'video_provider', event.target.value)}>
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="external_url">URL externa</option>
            <option value="embed">Embed HTML</option>
            <option value="none">Sem vídeo</option>
          </select>
          {forms.lesson.video_provider === 'embed' ? (
            <textarea value={forms.lesson.video_embed_html} onChange={(event) => onFieldChange('lesson', 'video_embed_html', event.target.value)} placeholder="<iframe ...></iframe>" />
          ) : (
            <input value={forms.lesson.video_url} onChange={(event) => onFieldChange('lesson', 'video_url', event.target.value)} placeholder="https://..." />
          )}
          <div>
            {forms.lesson.id ? <button className="is-ghost" onClick={() => onResetItem('lesson')} type="button">Cancelar</button> : null}
            <button disabled={saving} type="submit">{forms.lesson.id ? 'Salvar' : 'Adicionar'}</button>
          </div>
        </form>
      </div>

      <div className="fm-cloud-structure-tree">
        {sections.length ? sections.map((section) => {
          const sectionModules = modules.filter((module) => Number(module.section_id || 0) === Number(section.id));
          return (
            <article className="fm-cloud-section-card" key={section.id}>
              <header>
                <strong>{section.title}</strong>
                <div>
                  <button onClick={() => onEditItem('section', section)} type="button">Editar</button>
                  <button onClick={() => onArchiveItem('section', section)} type="button">Arquivar</button>
                </div>
              </header>
              {sectionModules.length ? sectionModules.map(renderModule) : <p className="fm-cloud-structure-empty">Nenhum módulo nesta seção.</p>}
            </article>
          );
        }) : <div className="fm-cloud-empty"><strong>Nenhuma seção</strong><p>Adicione uma seção para começar a organizar o curso.</p></div>}

        {looseModules.length ? (
          <article className="fm-cloud-section-card">
            <header>
              <strong>Sem seção</strong>
            </header>
            {looseModules.map(renderModule)}
          </article>
        ) : null}
      </div>
    </section>
  );
}

function CoursesView({ courseDetail, courses, form, loading, saving, selectedCourse, structureForms, structureSaving, onArchive, onArchiveItem, onCancel, onChange, onEdit, onEditItem, onSelectCourse, onStructureChange, onStructureReset, onStructureSubmit, onSubmit }) {
  if (loading) {
    return <div className="fm-editor-skeleton" />;
  }

  return (
    <div className="fm-cloud-courses-layout">
      <form className="fm-cloud-course-form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
        <div>
          <span>{form.id ? 'Editar curso' : 'Novo curso'}</span>
          <h2>{form.id ? form.title : 'Criar curso'}</h2>
        </div>
        <label>
          <span>Nome do curso</span>
          <input value={form.title} onChange={(event) => onChange('title', event.target.value)} placeholder="Marketing Digital" />
        </label>
        <label>
          <span>Slug</span>
          <input value={form.slug} onChange={(event) => onChange('slug', event.target.value)} placeholder="gerado automaticamente" />
        </label>
        <label>
          <span>Resumo</span>
          <textarea value={form.excerpt} onChange={(event) => onChange('excerpt', event.target.value)} placeholder="Uma descrição curta para identificar o curso." />
        </label>
        <div className="fm-cloud-course-form__grid">
          <label>
            <span>Status</span>
            <select value={form.status} onChange={(event) => onChange('status', event.target.value)}>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </label>
          <label>
            <span>Visibilidade</span>
            <select value={form.visibility} onChange={(event) => onChange('visibility', event.target.value)}>
              <option value="private">Privado</option>
              <option value="public">Publico</option>
            </select>
          </label>
        </div>
        <label>
          <span>Capa por URL</span>
          <input value={form.cover_image_url} onChange={(event) => onChange('cover_image_url', event.target.value)} placeholder="https://..." />
        </label>
        <div className="fm-cloud-course-form__actions">
          {form.id ? <button className="is-ghost" onClick={onCancel} type="button">Cancelar</button> : null}
          <button disabled={saving} type="submit">{saving ? 'Salvando...' : form.id ? 'Salvar curso' : 'Criar curso'}</button>
        </div>
      </form>

      <div className="fm-cloud-list">
        {courses.length ? courses.map((course) => (
          <article className="fm-cloud-list-row fm-cloud-course-row" key={course.id}>
            <span><Icon name="courseLibrary" size={17} /></span>
            <div>
              <strong>{course.title}</strong>
              <small>{course.slug}</small>
              {course.excerpt ? <p>{course.excerpt}</p> : null}
            </div>
            <em>{course.status}</em>
            <div>
              <button onClick={() => onEdit(course)} type="button">Editar</button>
              <button onClick={() => onSelectCourse(course)} type="button">Estrutura</button>
              <button onClick={() => onArchive(course)} type="button">Arquivar</button>
            </div>
          </article>
        )) : (
          <div className="fm-cloud-empty">
            <strong>Nenhum curso ainda</strong>
            <p>Crie o primeiro curso para validar o fluxo D1 da versão Cloud.</p>
          </div>
        )}
      </div>

      <CourseStructure
        course={selectedCourse}
        detail={courseDetail}
        forms={structureForms}
        onArchiveItem={onArchiveItem}
        onEditItem={onEditItem}
        onFieldChange={onStructureChange}
        onResetItem={onStructureReset}
        onSubmitItem={onStructureSubmit}
        saving={structureSaving}
      />
    </div>
  );
}

function PluginCoursesView({
  activeCourse,
  courses,
  isCreatingNew,
  isEditing,
  loading,
  onArchive,
  onCreate,
  onEdit,
  onOpen,
  onCancel,
  onPublishComplete,
  onSearch,
  onSubmit,
  saving,
  searchValue,
}) {
  const filteredCourses = useMemo(() => {
    const search = String(searchValue || '').trim().toLowerCase();

    if (!search) {
      return courses;
    }

    return courses.filter((course) => {
      const title = String(course.title || '').toLowerCase();
      const slug = String(course.slug || '').toLowerCase();
      return title.includes(search) || slug.includes(search);
    });
  }, [courses, searchValue]);

  return (
    <section className={`fm-admin-section fm-admin-section--courses ${isCreatingNew ? 'is-creating' : ''}`}>
      <div className={`fm-courses-layout ${isCreatingNew ? 'is-creating' : ''}`}>
        <CourseCatalog
          courses={filteredCourses}
          loading={loading}
          onCreate={onCreate}
          onDelete={onArchive}
          onEdit={onEdit}
          onOpen={onOpen}
          onSearch={onSearch}
          searchValue={searchValue}
          selectedCourseId={activeCourse?.id || 0}
          totalCoursesCount={courses.length}
        />

        <CloudCourseWorkspace
          activeCourse={activeCourse}
          hasCourses={courses.length > 0}
          isCreatingNew={isCreatingNew}
          isEditing={isEditing}
          loading={loading}
          onCancel={onCancel}
          onEdit={() => activeCourse?.id && onEdit(activeCourse.id)}
          onPublishComplete={onPublishComplete}
          onSubmit={onSubmit}
          previewUrl={activeCourse?.slug ? `/course/${activeCourse.slug}` : '#'}
          saving={saving}
        />
      </div>
    </section>
  );
}

function PlaceholderView({ activeSection }) {
  const meta = sectionMeta[activeSection] || sectionMeta.dashboard;
  return (
    <div className="fm-cloud-empty">
      <strong>{meta.title}</strong>
      <p>Esta area sera portada em uma das proximas partes da migracao Cloud.</p>
    </div>
  );
}

function StudentPreview({ courses }) {
  const published = courses.filter((course) => course.status === 'published');
  const [slug, setSlug] = useState(published[0]?.slug || '');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    if (!published.length) return;
    if (!slug) setSlug(published[0].slug);
  }, [published, slug]);

  useEffect(() => {
    if (!slug) return;
    async function loadPreview() {
      setLoading(true);
      setPreviewError('');
      try {
        const data = await apiFetch(`/api/public/courses/${slug}`);
        setPreview(data);
      } catch (err) {
        setPreviewError(err.message || 'Falha ao carregar preview.');
      } finally {
        setLoading(false);
      }
    }
    loadPreview();
  }, [slug]);

  const sections = preview?.sections || [];
  const modules = preview?.modules || [];
  const lessons = preview?.lessons || [];

  return (
    <div className="fm-cloud-student-preview">
      <aside>
        <strong>Preview aluno</strong>
        <select value={slug} onChange={(event) => setSlug(event.target.value)}>
          <option value="">Selecione um curso publicado</option>
          {published.map((course) => <option key={course.id} value={course.slug}>{course.title}</option>)}
        </select>
        <p>Este preview usa o endpoint público que a área do aluno irá consumir.</p>
      </aside>
      <main>
        {loading ? <div className="fm-editor-skeleton" /> : null}
        {previewError ? <div className="fm-cloud-error">{previewError}</div> : null}
        {!loading && !preview ? <div className="fm-cloud-empty"><strong>Nenhum curso publicado</strong><p>Publique um curso para visualizar a experiência do aluno.</p></div> : null}
        {preview ? (
          <article className="fm-cloud-student-course">
            {preview.course?.cover_image_url ? <img alt="" src={preview.course.cover_image_url} /> : null}
            <div>
              <span>Curso</span>
              <h2>{preview.course.title}</h2>
              {preview.course.excerpt ? <p>{preview.course.excerpt}</p> : null}
            </div>
            <section>
              {sections.map((section) => (
                <div className="fm-cloud-student-section" key={section.id}>
                  <h3>{section.title}</h3>
                  {modules.filter((module) => Number(module.section_id || 0) === Number(section.id)).map((module) => (
                    <div className="fm-cloud-student-module" key={module.id}>
                      <strong>{module.title}</strong>
                      {lessons.filter((lesson) => Number(lesson.module_id) === Number(module.id)).map((lesson) => (
                        <div className="fm-cloud-student-lesson" key={lesson.id}>
                          <Icon name="play" size={14} />
                          <span>{lesson.title}</span>
                          <em>{lesson.video_provider}</em>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </section>
          </article>
        ) : null}
      </main>
    </div>
  );
}

function AuthShell({ children, subtitle, title }) {
  return (
    <main className="fm-cloud-auth">
      <section className="fm-cloud-auth-card">
        <div className="fm-cloud-auth-card__brand">
          <span>Free Members Cloud</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}

function SetupScreen({ error, loading, onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <AuthShell title="Configurar instalação" subtitle="Crie o primeiro administrador desta Free Members Cloud.">
      <form className="fm-cloud-auth-form" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
        <label>
          <span>Nome</span>
          <input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Seu nome" />
        </label>
        <label>
          <span>Email</span>
          <input value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="voce@seudominio.com" type="email" />
        </label>
        <label>
          <span>Senha</span>
          <input value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="Mínimo 8 caracteres" type="password" />
        </label>
        {error ? <div className="fm-cloud-error">{error}</div> : null}
        <button disabled={loading} type="submit">{loading ? 'Criando...' : 'Criar administrador'}</button>
      </form>
    </AuthShell>
  );
}

function LoginScreen({ error, loading, onSubmit }) {
  const [form, setForm] = useState({ email: '', password: '' });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <AuthShell title="Entrar" subtitle="Acesse o painel da sua instalação Cloud.">
      <form className="fm-cloud-auth-form" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
        <label>
          <span>Email</span>
          <input value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="voce@seudominio.com" type="email" />
        </label>
        <label>
          <span>Senha</span>
          <input value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="Sua senha" type="password" />
        </label>
        {error ? <div className="fm-cloud-error">{error}</div> : null}
        <button disabled={loading} type="submit">{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
    </AuthShell>
  );
}

export default function App() {
  const initialSection = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('section') || 'dashboard' : 'dashboard';
  const [activeSection, setActiveSection] = useState(initialSection);
  const [bootstrap, setBootstrapState] = useState(null);
  const [health, setHealth] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetail, setCourseDetail] = useState({ sections: [], modules: [], lessons: [] });
  const [structureForms, setStructureForms] = useState({ section: emptySectionForm, module: emptyModuleForm, lesson: emptyLessonForm });
  const [courseSearch, setCourseSearch] = useState('');
  const [isCreatingNewCourse, setIsCreatingNewCourse] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingStructure, setSavingStructure] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadInitialData() {
    setError('');
    try {
      const [bootstrapData, healthData] = await Promise.all([
        apiFetch('/api/bootstrap'),
        apiFetch('/api/health'),
      ]);
      setBootstrap(bootstrapData);
      setBootstrapState(bootstrapData);
      setHealth(healthData);
    } catch (err) {
      setError(err.message || 'Falha ao carregar a instalação.');
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadCourses() {
    setLoadingCourses(true);
    setError('');
    try {
      const data = await apiFetch('/api/courses');
      setCourses(Array.isArray(data?.courses) ? data.courses.map(normalizeCourseSummary) : []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar cursos.');
    } finally {
      setLoadingCourses(false);
    }
  }

  async function loadCourseDetail(course = selectedCourse) {
    if (!course?.id) return;
    const data = await apiFetch(`/api/courses/${course.id}`);
    const normalizedCourse = normalizeCourseDetailForPlugin(data);
    setSelectedCourse(normalizedCourse || normalizeCourseSummary(course));
    setCourseDetail({
      sections: Array.isArray(data?.sections) ? data.sections : [],
      modules: Array.isArray(data?.modules) ? data.modules : [],
      lessons: Array.isArray(data?.lessons) ? data.lessons : [],
    });
  }

  useEffect(() => {
    if (activeSection !== 'courses' && activeSection !== 'pages') return;
    loadCourses();
  }, [activeSection]);

  function updateCourseForm(field, value) {
    setCourseForm((current) => ({ ...current, [field]: value }));
  }

  function startCreateCourse() {
    setSelectedCourse(null);
    setCourseForm(emptyCourseForm);
    setCourseDetail({ sections: [], modules: [], lessons: [] });
    setIsCreatingNewCourse(true);
    setIsEditingCourse(true);
  }

  function cancelCourseEditing() {
    setIsCreatingNewCourse(false);
    setIsEditingCourse(false);
    setCourseForm(emptyCourseForm);
  }

  async function editCourse(courseOrId) {
    const course = typeof courseOrId === 'object'
      ? courseOrId
      : courses.find((item) => Number(item.id) === Number(courseOrId));

    if (!course?.id) {
      return;
    }

    setCourseForm({
      ...emptyCourseForm,
      id: Number(course.id || 0),
      title: course.title || '',
      slug: course.slug || '',
      excerpt: course.excerpt || '',
      status: course.status || 'draft',
      visibility: course.visibility || 'private',
      cover_image_url: course.cover_image_url || '',
      banner_image_url: course.banner_image_url || '',
    });
    setSelectedCourse(normalizeCourseSummary(course));
    setIsCreatingNewCourse(false);
    setIsEditingCourse(true);
    await loadCourseDetail(course);
  }

  async function selectCourse(courseOrId) {
    const course = typeof courseOrId === 'object'
      ? courseOrId
      : courses.find((item) => Number(item.id) === Number(courseOrId));

    if (!course?.id) {
      return;
    }

    setSelectedCourse(normalizeCourseSummary(course));
    setStructureForms({ section: emptySectionForm, module: emptyModuleForm, lesson: emptyLessonForm });
    setIsCreatingNewCourse(false);
    setIsEditingCourse(false);
    await loadCourseDetail(course);
  }

  function publishComplete(course) {
    setSelectedCourse(normalizeCourseDetailForPlugin(course));
    setIsCreatingNewCourse(false);
    setIsEditingCourse(false);
  }

  async function saveCourse() {
    setSavingCourse(true);
    setError('');
    try {
      const payload = { ...courseForm };
      const path = courseForm.id ? `/api/courses/${courseForm.id}` : '/api/courses';
      const method = courseForm.id ? 'PUT' : 'POST';
      await apiFetch(path, { method, body: JSON.stringify(payload) });
      setCourseForm(emptyCourseForm);
      await loadCourses();
      if (selectedCourse?.id) {
        await loadCourseDetail(selectedCourse);
      }
    } catch (err) {
      setError(err.message || 'Não foi possível salvar o curso.');
    } finally {
      setSavingCourse(false);
    }
  }

  async function savePluginCourse(pluginForm) {
    setSavingCourse(true);
    setError('');
    try {
      const payload = coursePayloadFromPluginForm(pluginForm);
      const courseId = Number(pluginForm?.id || 0);
      const path = courseId ? `/api/courses/${courseId}` : '/api/courses';
      const method = courseId ? 'PUT' : 'POST';
      const response = await apiFetch(path, { method, body: JSON.stringify(payload) });
      const normalizedCourse = normalizeCourseDetailForPlugin(response);

      setSelectedCourse(normalizedCourse);
      setIsCreatingNewCourse(false);
      await loadCourses();

      if (normalizedCourse?.id) {
        await loadCourseDetail(normalizedCourse);
      }

      return normalizedCourse;
    } catch (err) {
      setError(err.message || 'Não foi possível salvar o curso.');
      throw err;
    } finally {
      setSavingCourse(false);
    }
  }

  function updateStructureForm(type, field, value) {
    setStructureForms((current) => ({
      ...current,
      [type]: {
        ...current[type],
        [field]: value,
      },
    }));
  }

  function resetStructureForm(type) {
    setStructureForms((current) => ({
      ...current,
      [type]: type === 'section' ? emptySectionForm : type === 'module' ? emptyModuleForm : emptyLessonForm,
    }));
  }

  function editStructureItem(type, item) {
    if (type === 'section') {
      setStructureForms((current) => ({ ...current, section: { ...emptySectionForm, ...item } }));
    }
    if (type === 'module') {
      setStructureForms((current) => ({ ...current, module: { ...emptyModuleForm, ...item, section_id: Number(item.section_id || 0) } }));
    }
    if (type === 'lesson') {
      setStructureForms((current) => ({ ...current, lesson: { ...emptyLessonForm, ...item, module_id: Number(item.module_id || 0) } }));
    }
  }

  async function saveStructureItem(type) {
    if (!selectedCourse?.id) return;
    setSavingStructure(true);
    setError('');
    try {
      const payload = structureForms[type];
      const collection = type === 'section' ? 'sections' : type === 'module' ? 'modules' : 'lessons';
      const itemPath = type === 'section' ? 'sections' : type === 'module' ? 'modules' : 'lessons';
      const path = payload.id ? `/api/${itemPath}/${payload.id}` : `/api/courses/${selectedCourse.id}/${collection}`;
      const method = payload.id ? 'PUT' : 'POST';
      await apiFetch(path, { method, body: JSON.stringify(payload) });
      resetStructureForm(type);
      await loadCourseDetail(selectedCourse);
    } catch (err) {
      setError(err.message || 'Não foi possível salvar a estrutura.');
    } finally {
      setSavingStructure(false);
    }
  }

  async function archiveStructureItem(type, item) {
    if (!window.confirm(`Arquivar "${item.title}"?`)) return;
    setError('');
    try {
      const path = type === 'section' ? `/api/sections/${item.id}` : type === 'module' ? `/api/modules/${item.id}` : `/api/lessons/${item.id}`;
      await apiFetch(path, { method: 'DELETE', body: JSON.stringify({}) });
      await loadCourseDetail(selectedCourse);
    } catch (err) {
      setError(err.message || 'Não foi possível arquivar o item.');
    }
  }

  async function archiveCourse(course) {
    if (!window.confirm(`Arquivar o curso "${course.title}"?`)) {
      return;
    }
    setError('');
    try {
      await apiFetch(`/api/courses/${course.id}`, { method: 'DELETE', body: JSON.stringify({}) });
      if (Number(courseForm.id) === Number(course.id)) {
        setCourseForm(emptyCourseForm);
      }
      if (Number(selectedCourse?.id || 0) === Number(course.id || 0)) {
        setSelectedCourse(null);
        setIsCreatingNewCourse(false);
        setIsEditingCourse(false);
      }
      await loadCourses();
    } catch (err) {
      setError(err.message || 'Não foi possível arquivar o curso.');
    }
  }

  async function createOwner(form) {
    setAuthLoading(true);
    setError('');
    try {
      await apiFetch('/api/install/owner', { method: 'POST', body: JSON.stringify(form) });
      await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: form.email, password: form.password }) });
      await loadInitialData();
    } catch (err) {
      setError(err.message || 'Não foi possível configurar a instalação.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function login(form) {
    setAuthLoading(true);
    setError('');
    try {
      await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(form) });
      await loadInitialData();
    } catch (err) {
      setError(err.message || 'Não foi possível entrar.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) });
    await loadInitialData();
  }

  const activeContent = useMemo(() => {
    if (activeSection === 'dashboard') {
      return <CloudDashboardModule />;
    }
    if (activeSection === 'courses') {
      return <CloudCoursesModule />;
    }
    if (activeSection === 'pages') {
      return <StudentPreview courses={courses} />;
    }
    if (activeSection === 'students') {
      return <CloudStudentsModule />;
    }
    if (activeSection === 'integrations') {
      return <CloudIntegrationsModule />;
    }
    if (activeSection === 'checkouts') {
      return <CloudCheckoutsModule />;
    }
    if (activeSection === 'sales') {
      return <CloudSalesModule />;
    }
    return <PlaceholderView activeSection={activeSection} />;
  }, [activeSection, bootstrap, courseSearch, courses, health, isCreatingNewCourse, isEditingCourse, loadingCourses, savingCourse, selectedCourse]);

  if (!bootstrap && !error) {
    return <div className="fm-cloud-auth"><div className="fm-editor-skeleton" /></div>;
  }

  if (bootstrap?.installation?.requires_setup) {
    return <SetupScreen error={error} loading={authLoading} onSubmit={createOwner} />;
  }

  if (bootstrap && !bootstrap.current_user) {
    return <LoginScreen error={error} loading={authLoading} onSubmit={login} />;
  }

  return (
    <AdminShell activeSection={activeSection} onSectionChange={setActiveSection}>
      <section className={`fm-cloud-screen ${activeSection === 'courses' ? 'is-courses' : ''}`}>
        {activeSection !== 'courses' ? <SectionHeader activeSection={activeSection} /> : null}
        {activeSection !== 'courses' ? (
          <div className="fm-cloud-userbar">
            <span>{bootstrap?.current_user?.name || 'Administrador'}</span>
            <button onClick={logout} type="button">Sair</button>
          </div>
        ) : null}
        {error ? <div className="fm-cloud-error">{error}</div> : null}
        {activeContent}
      </section>
    </AdminShell>
  );
}
