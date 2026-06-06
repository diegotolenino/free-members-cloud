import { useEffect, useMemo, useRef, useState } from 'react';
import CourseTabs from './CourseTabs';
import Icon from './Icons';
import CloudMediaPickerField from './CloudMediaPickerField';

const defaultState = {
  id: null,
  title: '',
  slug: '',
  description: '',
  cover_image_id: 0,
  cover_image_url: '',
  cover_image_thumb_url: '',
  module_covers_enabled: 0,
  status: 'published',
  visibility: 'private',
  sort_order: 0,
  sections: [],
  modules: [],
  stats: {
    modules: 0,
    lessons: 0,
  },
};

function slugify(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function formatDuration(totalSeconds) {
  const seconds = Number(totalSeconds || 0);

  if (!seconds) {
    return '0 min';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }

  return `${minutes} min`;
}

function attachModulesToSections(sections = [], modules = []) {
  const modulesBySection = (modules || []).reduce((map, module) => {
    const sectionId = String(module?.section_id || '').trim();

    if (!sectionId) {
      return map;
    }

    if (!map[sectionId]) {
      map[sectionId] = [];
    }

    map[sectionId].push(module);
    return map;
  }, {});

  return (sections || []).map((section) => ({
    ...section,
    modules: (modulesBySection[String(section?.id || section?.client_key || '')] || []).sort(
      (left, right) => Number(left?.sort_order || 0) - Number(right?.sort_order || 0)
    ),
  }));
}

function summarizeStructure(modules = []) {
  return {
    modules: (modules || []).filter((module) => module.status !== 'archived').length,
    lessons: (modules || []).reduce(
      (sum, module) => sum + (module.lessons || []).filter((lesson) => lesson.status !== 'archived').length,
      0
    ),
  };
}

function normalizeForm(initialValues) {
  if (!initialValues) {
    return defaultState;
  }

  const modules = Array.isArray(initialValues.modules) ? initialValues.modules : [];
  const sections = attachModulesToSections(Array.isArray(initialValues.sections) ? initialValues.sections : [], modules);

  return {
    ...defaultState,
    ...initialValues,
    description: initialValues.description || initialValues.description_html || initialValues.excerpt || '',
    cover_image_thumb_url: initialValues.cover_image_thumb_url || initialValues.cover_image_url || '',
    sections,
    modules,
    stats: initialValues.stats || summarizeStructure(modules),
  };
}

export default function CloudCourseForm({
  initialValues,
  loadingStructure = false,
  onCancel,
  onPublishComplete,
  onSubmit,
  saving,
}) {
  const [form, setForm] = useState(() => normalizeForm(initialValues));
  const [activeTab, setActiveTab] = useState(initialValues?.id ? 'structure' : 'overview');
  const [advancingTabId, setAdvancingTabId] = useState('');
  const [tabError, setTabError] = useState('');
  const formRef = useRef(form);
  const loadedCourseIdRef = useRef(initialValues?.id ? Number(initialValues.id) : null);
  const tabs = [
    { id: 'overview', label: 'Visão geral' },
    { id: 'structure', label: 'Estrutura' },
    { id: 'settings', label: 'Configurações' },
  ];

  useEffect(() => {
    const nextCourseId = initialValues?.id ? Number(initialValues.id) : null;
    const courseChanged = loadedCourseIdRef.current !== nextCourseId;

    setForm((current) => {
      if (!initialValues) {
        return courseChanged ? defaultState : current;
      }

      return normalizeForm(initialValues);
    });

    if (courseChanged) {
      setActiveTab(initialValues?.id ? 'structure' : 'overview');
      setAdvancingTabId('');
      setTabError('');
    }

    loadedCourseIdRef.current = nextCourseId;
  }, [initialValues]);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const courseStats = useMemo(() => {
    const activeModules = (form.modules || []).filter((module) => module.status !== 'archived');
    const activeLessons = activeModules.flatMap((module) => (module.lessons || []).filter((lesson) => lesson.status !== 'archived'));
    const totalDuration = activeLessons.reduce((sum, lesson) => sum + Number(lesson.duration_seconds || 0), 0);

    return {
      modules: activeModules.length,
      lessons: activeLessons.length,
      duration: formatDuration(totalDuration),
    };
  }, [form.modules]);

  function updateField(field, value) {
    setTabError('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleTitleChange(value) {
    setTabError('');
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugify(value),
    }));
  }

  async function persistCourse(overrides = {}) {
    const payload = {
      ...formRef.current,
      ...overrides,
    };
    const response = await onSubmit(payload);
    const nextCourse = response?.course || response || payload;

    if (nextCourse) {
      setForm(normalizeForm(nextCourse));
    }

    return nextCourse;
  }

  function getPreviousTab() {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    return currentIndex > 0 ? tabs[currentIndex - 1]?.id || '' : '';
  }

  async function handleAdvance(nextTab) {
    if (!nextTab) {
      return;
    }

    if (!formRef.current.title.trim()) {
      setTabError('Informe o título do curso para continuar.');
      return;
    }

    setAdvancingTabId(nextTab);
    setTabError('');

    try {
      await persistCourse();
      setActiveTab(nextTab);
    } finally {
      setAdvancingTabId('');
    }
  }

  async function handlePublishAndShowHero() {
    const response = await persistCourse({ status: 'published' });
    onPublishComplete?.(response || formRef.current);
  }

  function renderWizardHeader() {
    const coverImage = form.cover_image_url || form.cover_image_thumb_url || '';
    const title = form.title || (form.id ? 'Curso sem título' : 'Novo curso');

    return (
      <div className="fm-course-hero">
        <div className="fm-course-hero__media is-compact">
          {coverImage ? (
            <img alt="" className="fm-course-hero__media-image" src={coverImage} />
          ) : (
            <div className="fm-course-hero__media-placeholder" aria-hidden="true">
              <span>{title.slice(0, 1).toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="fm-course-hero__content">
          <div className="fm-course-hero__title-row">
            <h3>{title}</h3>
          </div>

          <div className="fm-course-hero__meta">
            <span>{courseStats.modules} módulos</span>
            <span>•</span>
            <span>{courseStats.lessons} aulas</span>
            <span>•</span>
            <span>{courseStats.duration} de conteúdo</span>
          </div>
        </div>

        <div className="fm-course-hero__actions" />
      </div>
    );
  }

  function renderOverviewActions() {
    return (
      <div className="fm-wizard-footer">
        <div className="fm-wizard-footer__spacer" />
        <button className="fm-button fm-button--gradient" disabled={saving || Boolean(advancingTabId)} onClick={() => handleAdvance('structure')} type="button">
          <span>{advancingTabId === 'structure' ? 'Avançando...' : 'Avançar'}</span>
          <Icon name="arrowRight" size={16} />
        </button>
      </div>
    );
  }

  function renderStepNavigation({ nextLabel, nextTab, showSave = false }) {
    const previousTab = getPreviousTab();
    const isAdvancing = advancingTabId === nextTab;

    return (
      <div className="fm-wizard-footer">
        <button className="fm-button fm-button--ghost" disabled={!previousTab || saving || Boolean(advancingTabId)} onClick={() => setActiveTab(previousTab)} type="button">
          <Icon name="arrowLeft" size={16} />
          <span>Voltar</span>
        </button>

        <div className="fm-wizard-footer__actions">
          {showSave ? (
            <button className="fm-button fm-button--gradient" disabled={saving} onClick={() => persistCourse()} type="button">
              <Icon name="save" size={16} />
              <span>{saving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          ) : null}
          {nextTab ? (
            <button className="fm-button fm-button--gradient" disabled={saving || Boolean(advancingTabId)} onClick={() => handleAdvance(nextTab)} type="button">
              <span>{isAdvancing ? 'Avançando...' : nextLabel}</span>
              <Icon name="arrowRight" size={16} />
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  function renderOverview() {
    return (
      <div className="fm-tab-panel">
        <section className="fm-overview-panel">
          <div className="fm-overview-layout">
            <div className="fm-form-section-card fm-form-section-card--overview fm-form-section-card--overview-cover">
              <div className="fm-form-section-card__header fm-form-section-card__header--overview">
                <div className="fm-form-section-card__eyebrow">
                  <span className="fm-form-section-card__eyebrow-icon is-orange" aria-hidden="true">
                    <Icon name="image" size={14} />
                  </span>
                  <span className="fm-admin-kicker">Banner</span>
                </div>
              </div>

              <CloudMediaPickerField
                label="Banner do curso"
                meta="(sugestão 1280 x 720 px)"
                onChange={({ id, url, thumbUrl }) => {
                  setForm((current) => ({
                    ...current,
                    cover_image_id: id,
                    cover_image_url: url,
                    cover_image_thumb_url: thumbUrl || url,
                  }));
                }}
                previewUrl={form.cover_image_url || form.cover_image_thumb_url || ''}
                value={Number(form.cover_image_id || 0)}
              />
            </div>

            <div className="fm-form-section-card fm-form-section-card--overview fm-form-section-card--overview-details">
              <div className="fm-form-section-card__header fm-form-section-card__header--overview">
                <div className="fm-form-section-card__eyebrow">
                  <span className="fm-form-section-card__eyebrow-icon" aria-hidden="true">
                    <Icon name="help" size={14} />
                  </span>
                  <span className="fm-admin-kicker">Informações</span>
                </div>
              </div>

              <div className="fm-admin-form">
                <label>
                  <span>Título do curso</span>
                  <input onChange={(event) => handleTitleChange(event.target.value)} placeholder="Marketing" required value={form.title} />
                </label>

                <label>
                  <span>Descrição</span>
                  <textarea onChange={(event) => updateField('description', event.target.value)} placeholder="Descreva o que o aluno vai aprender, os benefícios e o formato das aulas." rows="10" value={form.description} />
                </label>
              </div>
            </div>
          </div>
        </section>

        {tabError ? <div className="fm-admin-alert is-error">{tabError}</div> : null}
        {renderOverviewActions()}
      </div>
    );
  }

  function renderStructure() {
    const modules = (form.modules || []).filter((module) => module.status !== 'archived');

    return (
      <div className="fm-tab-panel">
        <section className="fm-surface-card fm-step-card">
          <div className="fm-admin-section-header">
            <h4>Estrutura</h4>
            <p>Base da estrutura conectada ao D1. O editor completo de módulos e aulas será o próximo bloco portado do plugin.</p>
          </div>

          {loadingStructure ? <div className="fm-editor-skeleton" /> : null}

          {!loadingStructure && modules.length ? (
            <div className="fm-course-private-groups__list">
              {modules.map((module) => (
                <div className="fm-course-private-group-item" key={module.id || module.client_key}>
                  <span className={`fm-course-private-group-item__thumb ${module.cover_image_url ? 'has-image' : ''}`} style={module.cover_image_url ? { backgroundImage: `url(${module.cover_image_url})` } : undefined}>
                    {!module.cover_image_url ? <Icon name="module" size={16} /> : null}
                  </span>
                  <span className="fm-course-private-group-item__copy">
                    <strong>{module.title}</strong>
                    <small>{(module.lessons || []).filter((lesson) => lesson.status !== 'archived').length} aulas</small>
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {!loadingStructure && !modules.length ? (
            <div className="fm-settings-blank-state">
              <div className="fm-settings-blank-state__content">
                <strong>Nenhum módulo criado ainda</strong>
                <p>Salve o curso para liberar a próxima etapa do editor estrutural.</p>
              </div>
            </div>
          ) : null}

          {renderStepNavigation({
            nextLabel: 'Avançar',
            nextTab: 'settings',
          })}
        </section>
      </div>
    );
  }

  function renderSettings() {
    return (
      <div className="fm-tab-panel">
        <section className="fm-surface-card fm-step-card">
          <div className="fm-admin-section-header">
            <h4>Configurações</h4>
            <p>Defina publicação e visibilidade do curso.</p>
          </div>

          <div className="fm-admin-form">
            <label>
              <span>Status</span>
              <select onChange={(event) => updateField('status', event.target.value)} value={form.status || 'published'}>
                <option value="published">Publicado</option>
                <option value="draft">Rascunho</option>
              </select>
            </label>
            <label>
              <span>Visibilidade</span>
              <select onChange={(event) => updateField('visibility', event.target.value)} value={form.visibility || 'private'}>
                <option value="private">Privado</option>
                <option value="public">Público</option>
              </select>
            </label>
          </div>

          <div className="fm-wizard-footer">
            <button className="fm-button fm-button--ghost" onClick={() => setActiveTab('structure')} type="button">
              <Icon name="arrowLeft" size={16} />
              <span>Voltar</span>
            </button>

            <div className="fm-wizard-footer__actions">
              {onCancel ? (
                <button className="fm-button fm-button--ghost" onClick={() => onCancel()} type="button">
                  <span>Cancelar</span>
                </button>
              ) : null}
              <button className="fm-button fm-button--gradient" disabled={saving} onClick={handlePublishAndShowHero} type="button">
                <Icon name="save" size={16} />
                <span>{saving ? 'Salvando...' : 'Salvar e publicar'}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <section className="fm-course-editor fm-surface-card">
      <div className="fm-course-editor__header">
        {renderWizardHeader()}
      </div>
      <div className="fm-course-editor__tabs">
        <CourseTabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
      </div>
      <div className="fm-course-editor__body">
        {activeTab === 'overview' ? renderOverview() : null}
        {activeTab === 'structure' ? renderStructure() : null}
        {activeTab === 'settings' ? renderSettings() : null}
      </div>
    </section>
  );
}
