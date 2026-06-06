import { useEffect, useMemo, useRef, useState } from 'react';
import CommunitySpaceModal from './CommunitySpaceModal';
import CourseAppearanceEditor from './CourseAppearanceEditor';
import CourseStructurePanel from './CourseStructurePanel';
import CourseTabs from './CourseTabs';
import Icon from './Icons';
import MediaPickerField from './MediaPickerField';
import ModuleEditor from './ModuleEditor';
import { apiFetch } from '../lib/api';
import { DEFAULT_APPEARANCE_SETTINGS, normalizeAppearanceSettings } from '../lib/courseAppearance';
import { validateStructureForPersist } from '../lib/lessonValidation';

const defaultState = {
  id: null,
  title: '',
  slug: '',
  description: '',
  cover_image_id: 0,
  cover_image_url: '',
  cover_image_thumb_url: '',
  module_covers_enabled: 0,
  appearance_settings: DEFAULT_APPEARANCE_SETTINGS,
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

function isPersistedId(value) {
  return /^\d+$/.test(String(value || ''));
}

function matchesStructureItem(reference = {}, candidate = {}) {
  const referenceClientKey = String(reference.client_key || '').trim();
  const candidateClientKey = String(candidate.client_key || '').trim();

  if (referenceClientKey && candidateClientKey && referenceClientKey === candidateClientKey) {
    return true;
  }

  return isPersistedId(reference.id) && isPersistedId(candidate.id) && Number(reference.id) === Number(candidate.id);
}

function mergeCurrentLessons(currentLessons = [], incomingLessons = []) {
  const mergedCurrentLessons = (currentLessons || []).map((currentLesson) => {
    const incomingLesson = (incomingLessons || []).find((lesson) => matchesStructureItem(currentLesson, lesson));

    if (!incomingLesson) {
      return currentLesson;
    }

    return {
      ...incomingLesson,
      ...currentLesson,
      id: incomingLesson.id || currentLesson.id,
      module_id: incomingLesson.module_id || currentLesson.module_id,
      client_key: incomingLesson.client_key || currentLesson.client_key || '',
      materials: currentLesson.materials || incomingLesson.materials || [],
    };
  });

  const onlyIncomingLessons = (incomingLessons || []).filter(
    (incomingLesson) => !(currentLessons || []).some((currentLesson) => matchesStructureItem(currentLesson, incomingLesson))
  );

  return [...mergedCurrentLessons, ...onlyIncomingLessons];
}

function mergeCurrentModules(currentModules = [], incomingModules = []) {
  const mergedCurrentModules = (currentModules || []).map((currentModule) => {
    const incomingModule = (incomingModules || []).find((module) => matchesStructureItem(currentModule, module));

    if (!incomingModule) {
      return currentModule;
    }

    return {
      ...incomingModule,
      ...currentModule,
      id: incomingModule.id || currentModule.id,
      course_id: incomingModule.course_id || currentModule.course_id,
      client_key: incomingModule.client_key || currentModule.client_key || '',
      lessons: mergeCurrentLessons(currentModule.lessons || [], incomingModule.lessons || []),
    };
  });

  const onlyIncomingModules = (incomingModules || []).filter(
    (incomingModule) => !(currentModules || []).some((currentModule) => matchesStructureItem(currentModule, incomingModule))
  );

  return [...mergedCurrentModules, ...onlyIncomingModules];
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

function mergeCurrentSections(currentSections = [], incomingSections = [], modules = []) {
  const mergedCurrentSections = (currentSections || []).map((currentSection) => {
    const incomingSection = (incomingSections || []).find((section) => matchesStructureItem(currentSection, section));

    if (!incomingSection) {
      return currentSection;
    }

    return {
      ...incomingSection,
      ...currentSection,
      id: incomingSection.id || currentSection.id,
      course_id: incomingSection.course_id || currentSection.course_id,
      client_key: incomingSection.client_key || currentSection.client_key || '',
      modules: incomingSection.modules || currentSection.modules || [],
    };
  });

  const onlyIncomingSections = (incomingSections || []).filter(
    (incomingSection) => !(currentSections || []).some((currentSection) => matchesStructureItem(currentSection, incomingSection))
  );

  return attachModulesToSections([...mergedCurrentSections, ...onlyIncomingSections], modules);
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

const defaultPrivateGroupState = {
  name: '',
  description: '',
  banner_url: '',
  type: 'private',
  linked_course_ids: [],
  allow_student_posts: true,
  status: 'active',
};

function uniqueIds(items = []) {
  return Array.from(new Set((items || []).map((item) => Number(item || 0)).filter((item) => item > 0)));
}

function normalizeLinkedCourseIds(space = {}) {
  const directIds = Array.isArray(space.linked_course_ids) ? space.linked_course_ids : [];
  const fallbackId = Number(space.linked_course_id || 0);
  return directIds.length ? uniqueIds(directIds) : (fallbackId > 0 ? [fallbackId] : []);
}

function normalizePrivateGroupForm(space = {}) {
  return {
    ...defaultPrivateGroupState,
    ...space,
    type: 'private',
    linked_course_ids: normalizeLinkedCourseIds(space),
  };
}

export default function CourseForm({
  initialValues,
  loadingStructure = false,
  onCancel,
  onPublishComplete,
  onSubmit,
  saving,
}) {
  const [form, setForm] = useState(
    initialValues
      ? {
          ...defaultState,
          ...initialValues,
          appearance_settings: normalizeAppearanceSettings(initialValues.appearance_settings || DEFAULT_APPEARANCE_SETTINGS),
        }
      : defaultState
  );
  const [activeTab, setActiveTab] = useState(initialValues?.id ? 'structure' : 'overview');
  const [moduleCoversEnabled, setModuleCoversEnabled] = useState(Boolean(Number(initialValues?.module_covers_enabled || 0)));
  const [advancingTabId, setAdvancingTabId] = useState('');
  const [tabError, setTabError] = useState('');
  const [structureValidationState, setStructureValidationState] = useState(null);
  const [communitySpaces, setCommunitySpaces] = useState([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState('');
  const [pendingPrivateGroupIds, setPendingPrivateGroupIds] = useState(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalSaving, setGroupModalSaving] = useState(false);
  const [groupModalError, setGroupModalError] = useState('');
  const [groupModalForm, setGroupModalForm] = useState(() => normalizePrivateGroupForm(defaultPrivateGroupState));
  const formRef = useRef(form);
  const loadedCourseIdRef = useRef(initialValues?.id ? Number(initialValues.id) : null);
  const communitySpacesRef = useRef([]);
  const tabs = [
    { id: 'overview', label: 'Visão geral' },
    { id: 'structure', label: 'Estrutura' },
    ...(moduleCoversEnabled ? [{ id: 'appearance', label: 'Aparência' }] : []),
    { id: 'settings', label: 'Configurações' },
  ];

  useEffect(() => {
    const nextCourseId = initialValues?.id ? Number(initialValues.id) : null;
    const courseChanged = loadedCourseIdRef.current !== nextCourseId;

    setForm((current) => {
      if (!initialValues) {
        return courseChanged ? defaultState : current;
      }

      if (courseChanged) {
        return {
          ...defaultState,
          ...initialValues,
          appearance_settings: normalizeAppearanceSettings(initialValues.appearance_settings || DEFAULT_APPEARANCE_SETTINGS),
        };
      }

      const mergedModules = mergeCurrentModules(current.modules || [], initialValues.modules || []);
      const mergedSections = mergeCurrentSections(current.sections || [], initialValues.sections || [], mergedModules);

      return {
        ...current,
        ...initialValues,
          appearance_settings: normalizeAppearanceSettings(initialValues.appearance_settings || current.appearance_settings || DEFAULT_APPEARANCE_SETTINGS),
        sections: mergedSections,
        modules: mergedModules,
        stats: summarizeStructure(mergedModules),
      };
    });

    if (courseChanged) {
      setActiveTab(initialValues?.id ? 'structure' : 'overview');
      setAdvancingTabId('');
      setTabError('');
      setStructureValidationState(null);
    }

    setModuleCoversEnabled(Boolean(Number(initialValues?.module_covers_enabled || 0)));
    loadedCourseIdRef.current = nextCourseId;
  }, [initialValues]);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    communitySpacesRef.current = communitySpaces;
  }, [communitySpaces]);

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab('structure');
    }
  }, [activeTab, tabs]);

  useEffect(() => {
    loadCommunitySpaces();
  }, []);

  useEffect(() => {
    setPendingPrivateGroupIds(null);
    setCommunityError('');
  }, [initialValues?.id]);

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

  const canAdvanceFromStructure = useMemo(() => {
    const activeModules = (form.modules || []).filter((module) => module.status !== 'archived');
    const activeLessons = activeModules.flatMap((module) => (module.lessons || []).filter((lesson) => lesson.status !== 'archived'));
    return activeModules.length > 0 && activeLessons.length > 0;
  }, [form.modules]);

  const privateGroups = useMemo(
    () => (communitySpaces || []).filter((space) => space?.status !== 'archived' && space?.type === 'private'),
    [communitySpaces]
  );
  const derivedPrivateGroupIds = useMemo(() => {
    const courseId = Number(form.id || 0);

    if (courseId <= 0) {
      return [];
    }

    return privateGroups
      .filter((space) => normalizeLinkedCourseIds(space).includes(courseId))
      .map((space) => Number(space.id))
      .filter((spaceId) => spaceId > 0);
  }, [form.id, privateGroups]);
  const selectedPrivateGroupIds = pendingPrivateGroupIds ?? derivedPrivateGroupIds;
  const selectedPrivateGroupSet = useMemo(() => new Set(selectedPrivateGroupIds.map((groupId) => Number(groupId))), [selectedPrivateGroupIds]);

  async function loadCommunitySpaces() {
    setCommunityLoading(true);

    try {
      const data = await apiFetch('/community/settings');
      setCommunitySpaces(Array.isArray(data?.spaces) ? data.spaces : []);
      setCommunityError('');
      return Array.isArray(data?.spaces) ? data.spaces : [];
    } catch (error) {
      setCommunityError(error.message || 'Nao foi possivel carregar os grupos privados.');
      return [];
    } finally {
      setCommunityLoading(false);
    }
  }

  function updateField(field, value) {
    setTabError('');
    setStructureValidationState(null);
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateAppearanceSettings(nextSettings) {
    setForm((current) => ({
      ...current,
      appearance_settings: normalizeAppearanceSettings(nextSettings),
    }));
  }

  function handleTitleChange(value) {
    setTabError('');
    setStructureValidationState(null);
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugify(value),
    }));
  }

  async function persistCourse(overrides = {}) {
    const { __options = {}, ...restOverrides } = overrides;
    const currentForm = formRef.current;
    const payload = {
      ...currentForm,
      module_covers_enabled: moduleCoversEnabled ? 1 : 0,
      ...restOverrides,
    };
    const response = await onSubmit(payload, {
      ...__options,
      getLatestModules: __options.getLatestModules || (() => formRef.current.modules || []),
      getLatestSections: __options.getLatestSections || (() => formRef.current.sections || []),
    });
    const persistedCourseId = Number(response?.id || payload.id || 0);

    if (persistedCourseId > 0 && !__options.skipPrivateGroupSync) {
      await syncPrivateGroupsForCourse(persistedCourseId, pendingPrivateGroupIds ?? derivedPrivateGroupIds);
    }

    if (response) {
      setForm((current) => {
        const mergedModules = response.modules ? mergeCurrentModules(current.modules || [], response.modules || []) : current.modules || [];
        const mergedSections = response.sections ? mergeCurrentSections(current.sections || [], response.sections || [], mergedModules) : current.sections || [];

        return {
          ...current,
          ...response,
          appearance_settings: normalizeAppearanceSettings(response.appearance_settings || current.appearance_settings || DEFAULT_APPEARANCE_SETTINGS),
          sections: mergedSections,
          modules: mergedModules,
          stats: summarizeStructure(mergedModules),
        };
      });
    }
    return response;
  }

  async function syncPrivateGroupsForCourse(courseId, selectedGroupIds = []) {
    const normalizedCourseId = Number(courseId || 0);

    if (normalizedCourseId <= 0) {
      return;
    }

    const normalizedSelection = uniqueIds(selectedGroupIds);
    const groups = (communitySpacesRef.current || []).filter((space) => space?.status !== 'archived' && space?.type === 'private');
    const updates = groups.reduce((queue, space) => {
      const currentCourseIds = normalizeLinkedCourseIds(space);
      const shouldIncludeCourse = normalizedSelection.includes(Number(space.id));
      const alreadyIncluded = currentCourseIds.includes(normalizedCourseId);

      if (shouldIncludeCourse === alreadyIncluded) {
        return queue;
      }

      const nextCourseIds = shouldIncludeCourse
        ? uniqueIds([...currentCourseIds, normalizedCourseId])
        : currentCourseIds.filter((courseIdItem) => Number(courseIdItem) !== normalizedCourseId);

      queue.push(
        apiFetch(`/community/spaces/${space.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...space,
            type: 'private',
            linked_course_ids: nextCourseIds,
          }),
        })
      );

      return queue;
    }, []);

    if (updates.length) {
      await Promise.all(updates);
    }

    await loadCommunitySpaces();
    setPendingPrivateGroupIds(null);
  }

  function togglePrivateGroup(spaceId) {
    setPendingPrivateGroupIds((current) => {
      const source = Array.isArray(current) ? current : selectedPrivateGroupIds;

      return source.some((groupId) => Number(groupId) === Number(spaceId))
        ? source.filter((groupId) => Number(groupId) !== Number(spaceId))
        : [...source, Number(spaceId)];
    });
  }

  function patchGroupModalForm(patch) {
    setGroupModalForm((current) => ({ ...current, ...patch }));
  }

  async function openCreatePrivateGroup() {
    setGroupModalError('');
    let courseId = Number(formRef.current.id || 0);

    if (courseId <= 0) {
      try {
        const persisted = await persistCourse({
          __options: {
            silentSuccess: true,
            skipCatalogRefresh: false,
          },
        });
        courseId = Number(persisted?.id || formRef.current.id || 0);
      } catch (error) {
        return;
      }
    }

    setGroupModalForm(normalizePrivateGroupForm({
      name: formRef.current.title || '',
      banner_url: formRef.current.cover_image_url || formRef.current.cover_image_thumb_url || '',
      linked_course_ids: courseId > 0 ? [courseId] : [],
      status: 'active',
      allow_student_posts: true,
    }));
    setGroupModalOpen(true);
  }

  async function savePrivateGroupFromCourse(event) {
    event.preventDefault();
    setGroupModalSaving(true);
    setGroupModalError('');

    try {
      const courseId = Number(formRef.current.id || 0);

      if (courseId <= 0) {
        throw new Error('Nao foi possivel identificar o curso para vincular o grupo.');
      }

      const created = await apiFetch('/community/spaces', {
        method: 'POST',
        body: JSON.stringify({
          ...groupModalForm,
          type: 'private',
          linked_course_ids: [courseId],
        }),
      });

      await loadCommunitySpaces();
      setPendingPrivateGroupIds(uniqueIds([...(pendingPrivateGroupIds ?? selectedPrivateGroupIds), Number(created?.id || 0)]));
      setGroupModalOpen(false);
    } catch (error) {
      setGroupModalError(error.message || 'Nao foi possivel criar o grupo.');
    } finally {
      setGroupModalSaving(false);
    }
  }

  function getPreviousTab() {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    return currentIndex > 0 ? tabs[currentIndex - 1]?.id || '' : '';
  }

  function getNextTab() {
    if (activeTab === 'structure' && !moduleCoversEnabled) {
      return 'settings';
    }

    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    return currentIndex >= 0 ? tabs[currentIndex + 1]?.id || '' : '';
  }

  async function handleAdvance(nextTab) {
    if (!nextTab) {
      return;
    }

    if (activeTab === 'structure') {
      const validationResult = validateStructureForPersist(formRef.current.modules || []);

      if (!validationResult.isValid) {
        setStructureValidationState({ ...validationResult, nonce: Date.now() });
        setTabError(validationResult.lessonRef ? '' : validationResult.message);
        return;
      }
    }

    setAdvancingTabId(nextTab);
    setTabError('');
    setStructureValidationState(null);

    try {
      await persistCourse({
        __options: {
          silentSuccess: activeTab !== 'structure',
          skipCatalogRefresh: activeTab === 'structure' ? false : Boolean(form?.id),
        },
      });
      setActiveTab(nextTab);
    } catch (error) {
      void error;
    } finally {
      setAdvancingTabId('');
    }
  }

  async function handlePublishAndShowHero() {
    try {
      const response = await persistCourse();
      onPublishComplete?.(response || formRef.current);
    } catch (error) {
      void error;
    }
  }

  function updateStructure(nextStructure) {
    const nextModules = nextStructure?.modules || [];
    const nextSections = nextStructure?.sections || [];
    setTabError('');
    setStructureValidationState(null);
    setForm((current) => ({
      ...current,
      sections: attachModulesToSections(nextSections, nextModules),
      modules: nextModules,
      stats: {
        modules: nextModules.filter((module) => module.status !== 'archived').length,
        lessons: nextModules.reduce(
          (sum, module) => sum + (module.lessons || []).filter((lesson) => lesson.status !== 'archived').length,
          0
        ),
      },
    }));
  }

  async function handleModuleCoversToggle(nextValue) {
    const normalizedValue = nextValue ? 1 : 0;
    setModuleCoversEnabled(Boolean(normalizedValue));
    setTabError('');

    setForm((current) => ({
      ...current,
      module_covers_enabled: normalizedValue,
    }));

    if (!normalizedValue && activeTab === 'appearance') {
      setActiveTab('structure');
    }

    if (!form?.id) {
      return;
    }

    try {
      await persistCourse({
        module_covers_enabled: normalizedValue,
        sections: form.sections || [],
        modules: form.modules || [],
        __options: { silentSuccess: true, skipCatalogRefresh: true },
      });
    } catch (error) {
      void error;
    }
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

        <div className="fm-course-hero__actions">
        </div>
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

  function renderStepNavigation({ nextLabel, nextTab, showSave = false, showNext = true }) {
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
              <span>{saving ? 'Salvando...' : 'Salvar e publicar'}</span>
            </button>
          ) : null}
          {nextTab && showNext ? (
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

              <MediaPickerField
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

        {renderOverviewActions()}
      </div>
    );
  }

  function renderStructure() {
    return (
      <CourseStructurePanel loading={loadingStructure}>
        {tabError ? <div className="fm-admin-alert is-error">{tabError}</div> : null}
        <ModuleEditor
          externalValidation={structureValidationState}
          moduleCoversEnabled={moduleCoversEnabled}
          sections={form.sections || []}
          modules={form.modules || []}
          onChange={updateStructure}
          onPersistStructure={persistCourse}
          onToggleModuleCovers={handleModuleCoversToggle}
          saving={saving}
        />
        <div className="fm-structure-navigation">
          {renderStepNavigation({
            nextLabel: 'Avançar',
            nextTab: getNextTab(),
            showNext: canAdvanceFromStructure,
          })}
        </div>
      </CourseStructurePanel>
    );
  }

  function renderAppearance() {
    return (
      <div className="fm-tab-panel">
        <CourseAppearanceEditor
          course={form}
          onChange={updateAppearanceSettings}
          settings={form.appearance_settings || DEFAULT_APPEARANCE_SETTINGS}
        />

        {renderStepNavigation({
          nextLabel: 'Avançar',
          nextTab: 'settings',
        })}
      </div>
    );
  }

  function renderSettings() {
    const previousTab = moduleCoversEnabled ? 'appearance' : 'structure';

    return (
      <div className="fm-tab-panel">
        <section className="fm-surface-card fm-step-card">
          <div className="fm-admin-section-header">
            <h4>Configurações</h4>
            <p>Defina os grupos privados que este curso pode acessar e mantenha a publicação automática ativa.</p>
          </div>

          <div className="fm-course-settings-grid">
            <div className="fm-settings-blank-state fm-course-settings-panel">
              <div className="fm-settings-blank-state__content">
                <strong>Publicação automática ativa</strong>
                <p>Ao salvar este curso, módulos e aulas ficam ativos sem fluxo de rascunho.</p>
              </div>
            </div>

            <div className="fm-course-settings-panel fm-course-private-groups">
              <div className="fm-course-private-groups__header">
                <div>
                  <strong>Acessar grupos privados</strong>
                  <p>Selecione um ou mais grupos privados que devem ficar vinculados a este curso.</p>
                </div>
              </div>

              {communityError ? <div className="fm-admin-alert is-error">{communityError}</div> : null}

              <div className="fm-course-private-groups__list">
                {communityLoading ? (
                  <div className="fm-admin-empty">Carregando grupos...</div>
                ) : privateGroups.length ? (
                  privateGroups.map((group) => (
                    <button
                      className={`fm-course-private-group-item ${selectedPrivateGroupSet.has(Number(group.id)) ? 'is-selected' : ''}`}
                      key={group.id}
                      onClick={() => togglePrivateGroup(Number(group.id))}
                      type="button"
                    >
                      <span className={`fm-course-private-group-item__thumb ${group.banner_url ? 'has-image' : ''}`} style={group.banner_url ? { backgroundImage: `url(${group.banner_url})` } : undefined}>
                        {!group.banner_url ? <Icon name="messages" size={16} /> : null}
                      </span>
                      <span className="fm-course-private-group-item__copy">
                        <strong>{group.name}</strong>
                        <small>{Number(group.members_count || 0)} membros</small>
                      </span>
                      <span className={`fm-student-check ${selectedPrivateGroupSet.has(Number(group.id)) ? 'is-checked' : ''}`}>{selectedPrivateGroupSet.has(Number(group.id)) ? <Icon name="published" size={14} /> : null}</span>
                    </button>
                  ))
                ) : (
                  <div className="fm-admin-empty">Nenhum grupo privado criado ainda.</div>
                )}
              </div>

              <button className="fm-button fm-button--ghost" onClick={openCreatePrivateGroup} type="button">
                <Icon name="plus" size={15} />
                <span>Criar novo grupo</span>
              </button>
            </div>
          </div>

          <div className="fm-wizard-footer">
            <button className="fm-button fm-button--ghost" onClick={() => setActiveTab(previousTab)} type="button">
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
        {activeTab === 'appearance' ? renderAppearance() : null}
        {activeTab === 'settings' ? renderSettings() : null}
      </div>
      <CommunitySpaceModal
        editingSpaceId={0}
        error={groupModalError}
        forcePrivate
        hideCourseSelector
        onChange={patchGroupModalForm}
        onClose={() => setGroupModalOpen(false)}
        onCourseSearch={() => {}}
        onSubmit={savePrivateGroupFromCourse}
        onToggleCourse={() => {}}
        open={groupModalOpen}
        saving={groupModalSaving}
        spaceForm={groupModalForm}
      />
    </section>
  );
}
