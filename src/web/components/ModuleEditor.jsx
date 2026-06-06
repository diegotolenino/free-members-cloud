import React from 'react';
import ConfirmDialog from './ConfirmDialog';
import InternalLibraryModal from './InternalLibraryModal';
import LessonEditor from './LessonEditor';
import Icon from './Icons';
import { traceCourseBuilder } from '../lib/debugTrace';
import { getLessonValidationState, hasMeaningfulLessonData } from '../lib/lessonValidation';

const defaultModule = {
  section_id: '',
  client_key: '',
  title: '',
  description: '',
  cover_image_id: 0,
  cover_image_url: '',
  cover_image_thumb_url: '',
  status: 'published',
  sort_order: 0,
  lessons: [],
};

const defaultLesson = {
  client_key: '',
  title: '',
  slug: '',
  excerpt: '',
  content_type: 'video',
  content_source: 'external_url',
  content_url: '',
  duration_seconds: 0,
  is_preview: 0,
  status: 'published',
  sort_order: 0,
  materials: [],
};

const defaultSection = {
  client_key: '',
  title: '',
  status: 'published',
  sort_order: 0,
  modules: [],
};

function createTempId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
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

function normalizeOrder(items) {
  return items.map((item, index) => ({
    ...item,
    sort_order: index + 1,
  }));
}

function mergeVisibleWithArchived(currentItems, nextVisibleItems) {
  const archivedItems = (currentItems || []).filter((item) => item.status === 'archived');
  return [...nextVisibleItems, ...archivedItems];
}

function normalizeModules(items) {
  const visibleItems = (items || []).filter((item) => item.status !== 'archived');
  const archivedItems = (items || []).filter((item) => item.status === 'archived');
  return [...normalizeOrder(visibleItems), ...archivedItems];
}

function normalizeSections(items) {
  const visibleItems = (items || []).filter((item) => item.status !== 'archived');
  const archivedItems = (items || []).filter((item) => item.status === 'archived');
  return [...normalizeOrder(visibleItems), ...archivedItems];
}

function attachModulesToSections(sections = [], modules = []) {
  const sectionModulesMap = {};

  (modules || []).forEach((module) => {
    const sectionRef = String(module?.section_id || '').trim();

    if (!sectionRef) {
      return;
    }

    if (!sectionModulesMap[sectionRef]) {
      sectionModulesMap[sectionRef] = [];
    }

    sectionModulesMap[sectionRef].push(module);
  });

  return (sections || []).map((section) => ({
    ...section,
    modules: normalizeOrder(sectionModulesMap[String(section?.id || section?.client_key || '')] || []),
  }));
}

function buildVisibleSections(sections = [], modules = [], enabled = false) {
  if (!enabled) {
    return [];
  }

  const visibleSections = attachModulesToSections(
    (sections || []).filter((section) => section.status !== 'archived').sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)),
    (modules || []).filter((module) => module.status !== 'archived')
  );
  const unassignedModules = (modules || [])
    .filter((module) => module.status !== 'archived' && !String(module.section_id || '').trim())
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  if (!visibleSections.length && unassignedModules.length) {
    return [
      {
        ...defaultSection,
        id: 'implicit-section',
        client_key: 'implicit-section',
        title: 'Sessão principal',
        sort_order: 1,
        isImplicit: true,
        modules: unassignedModules,
      },
    ];
  }

  if (unassignedModules.length) {
    return [
      {
        ...defaultSection,
        id: 'implicit-section',
        client_key: 'implicit-section',
        title: 'Sessão principal',
        sort_order: visibleSections.length + 1,
        isImplicit: true,
        modules: unassignedModules,
      },
      ...visibleSections,
    ];
  }

  return visibleSections;
}

function isModuleTitleValid(title) {
  return String(title || '').trim().length > 0;
}

function canModuleCreateLessons(title) {
  return String(title || '').trim().length >= 2;
}

function validateModuleCoverFile(file) {
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return 'Use apenas imagens JPG, PNG ou WebP.';
  }

  if (file.size > maxSize) {
    return 'A capa do módulo deve ter no máximo 5MB.';
  }

  return '';
}

function matchesItemRef(currentRef, item) {
  return String(currentRef) === String(item?.id) || String(currentRef) === String(item?.client_key || '');
}

function getVisibleLessons(module) {
  return (module?.lessons || []).filter((lesson) => lesson.status !== 'archived').sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function getLessonRef(lesson) {
  return lesson?.client_key || lesson?.id || '';
}

function isLessonReadyForNext(lesson) {
  return Boolean(String(lesson?.title || '').trim()) && Boolean(String(lesson?.content_url || '').trim());
}

function ModuleItemCard({
  activeLessonId,
  activeModuleId,
  autosavingModuleId,
  creatingLessonModuleId,
  draggingLessonId,
  draggingModuleId,
  index,
  module,
  moduleCoversEnabled,
  moduleError,
  lessonErrors,
  lessonFocusTarget,
  onArchiveModule,
  onAppendNextLesson,
  onArchiveLesson,
  onDragLesson,
  onDragModule,
  onDropLesson,
  onDropModule,
  onLessonFieldChange,
  onLessonFieldsChange,
  onSelectLesson,
  onSelectModule,
  onUpdateModuleCover,
  onUpdateModuleField,
}) {
  const [coverModalOpen, setCoverModalOpen] = React.useState(false);
  const expanded = matchesItemRef(activeModuleId, module);
  const activeLessons = (module.lessons || []).filter((lesson) => lesson.status !== 'archived');
  const totalDuration = activeLessons.reduce((sum, lesson) => sum + Number(lesson.duration_seconds || 0), 0);
  const coverPreview = module.cover_image_thumb_url || module.cover_image_url || '';
  const isCreatingLesson = String(creatingLessonModuleId) === String(module.id);
  const isAutosaving = String(autosavingModuleId) === String(module.id);
  const activeLesson = activeLessons.find((lesson) => matchesItemRef(activeLessonId, lesson)) || null;
  const lastVisibleLesson = activeLessons[activeLessons.length - 1] || null;
  const lessonForSequence = activeLesson || lastVisibleLesson;
  const canCreateLesson = canModuleCreateLessons(module.title);
  const canAppendNextLesson = Boolean(lessonForSequence) && isLessonReadyForNext(lessonForSequence);
  const lessonActionLabel = 'Adicionar Aula';

  function handleKeyDown(event) {
    const interactiveSelector = 'input, textarea, select, button, a, [contenteditable="true"]';

    if (event.target instanceof Element && event.target.closest(interactiveSelector)) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectModule(module.id);
    }
  }

  return (
    <article
      className={`fm-module-card ${expanded ? 'is-expanded' : ''}`}
      draggable
      onDragOver={(event) => event.preventDefault()}
      onDragStart={() => onDragModule(module.id)}
      onDrop={() => onDropModule(draggingModuleId, module.id)}
    >
      <div
        aria-expanded={expanded}
        className="fm-module-card__toggle"
        onClick={() => onSelectModule(module.client_key || module.id)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        <div className="fm-module-card__identity">
          {moduleCoversEnabled ? (
            <button
              className={`fm-module-card__cover-picker ${coverPreview ? 'has-image' : ''}`}
              onClick={(event) => {
                event.stopPropagation();
                void traceCourseBuilder('module-cover-open', {
                  moduleId: module.id,
                  hasCover: Boolean(coverPreview),
                });
                setCoverModalOpen(true);
              }}
              type="button"
            >
              {coverPreview ? <img alt="" src={coverPreview} /> : <span>Capa</span>}
            </button>
          ) : (
            <span className="fm-module-card__leading-icon" aria-hidden="true">
              <Icon name="module" size={16} />
            </span>
          )}

          <div className="fm-module-card__copy">
            <span className="fm-module-card__eyebrow">Módulo {index + 1}</span>

            {expanded ? (
              <input
                autoFocus={!String(module.title || '').trim()}
                className={`fm-module-card__title-input is-inline ${moduleError ? 'has-error' : ''}`}
                onChange={(event) => onUpdateModuleField(module.id, 'title', event.target.value, { autosave: true })}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                placeholder="Nome do módulo"
                value={module.title || ''}
              />
            ) : (
              <strong>{module.title || 'Novo módulo'}</strong>
            )}

            <p>
              {activeLessons.length} aulas • {formatDuration(totalDuration)}
            </p>

            {moduleError ? <span className="fm-module-card__validation">{moduleError}</span> : null}
          </div>
        </div>

        <div className="fm-module-card__meta">
          {isAutosaving ? <span className="fm-module-card__hint">Salvando...</span> : null}
          <button
            aria-label="Excluir módulo"
            className="fm-module-card__trash"
            onClick={(event) => {
              event.stopPropagation();
              onArchiveModule(module);
            }}
            type="button"
          >
            <Icon name="trash" size={14} />
          </button>
          <span className="fm-module-card__chevron" aria-hidden="true">
            <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={16} />
          </span>
        </div>
      </div>

      <div className={`fm-module-card__body-shell ${expanded ? 'is-expanded' : ''}`}>
        <div className="fm-module-card__body">
          {isCreatingLesson ? <div className="fm-module-card__saving-row"><span className="fm-module-card__hint">Criando aula...</span></div> : null}

          <LessonEditor
            activeLessonId={activeLessonId}
            draggingLessonId={draggingLessonId}
            focusTarget={lessonFocusTarget}
            lessonErrors={lessonErrors}
            lessons={module.lessons || []}
            moduleOrder={index + 1}
            moduleId={module.id}
            onArchiveLesson={onArchiveLesson}
            onDragLesson={onDragLesson}
            onDropLesson={onDropLesson}
            onLessonFieldChange={onLessonFieldChange}
            onLessonFieldsChange={onLessonFieldsChange}
            onSelectLesson={(lessonRef) => onSelectLesson(matchesItemRef(activeLessonId, { id: lessonRef, client_key: lessonRef }) ? null : lessonRef)}
          />

          <div className="fm-module-card__actions">
            <button
              className="fm-button fm-button--gradient"
              disabled={isCreatingLesson || !canCreateLesson || (activeLessons.length > 0 && !canAppendNextLesson)}
              onClick={() => onAppendNextLesson(module.id)}
              type="button"
            >
              <Icon name="plus" size={15} />
              <span>{isCreatingLesson ? 'Salvando...' : lessonActionLabel}</span>
            </button>
          </div>
        </div>
      </div>

      {moduleCoversEnabled ? (
        <InternalLibraryModal
          accept="image"
          confirmLabel="Usar capa"
          description="Escolha uma imagem da biblioteca interna ou envie um novo banner para este módulo."
          onClose={() => setCoverModalOpen(false)}
          onSelect={(file) => {
            void traceCourseBuilder('module-cover-select', {
              moduleId: module.id,
              fileId: file?.id || 0,
              filename: file?.filename || '',
            });
            onUpdateModuleCover(module.id, file);
            setCoverModalOpen(false);
          }}
          open={coverModalOpen}
          purpose="module-cover"
          selectedId={Number(module.cover_image_id || 0)}
          title="Capa do módulo"
          validateUpload={validateModuleCoverFile}
        />
      ) : null}
    </article>
  );
}

function SectionItemCard({
  activeLessonId,
  activeModuleId,
  autosavingModuleId,
  creatingLessonModuleId,
  draggingLessonId,
  draggingModuleId,
  draggingSectionId,
  lessonErrors,
  lessonFocusTarget,
  moduleCoversEnabled,
  moduleErrorById,
  moduleIndexMap,
  onArchiveLesson,
  onArchiveModule,
  onArchiveSection,
  onAppendNextLesson,
  onCreateModule,
  onDragLesson,
  onDragModule,
  onDragSection,
  onDropLesson,
  onDropModule,
  onDropSection,
  onLessonFieldChange,
  onLessonFieldsChange,
  onSelectLesson,
  onSelectModule,
  onUpdateModuleCover,
  onUpdateModuleField,
  onUpdateSectionField,
  section,
  sectionError,
}) {
  const sectionModules = (section.modules || []).filter((module) => module.status !== 'archived');
  const canCreateModule = !section.isImplicit && String(section.title || '').trim().length > 0;

  return (
    <article
      className="fm-section-card"
      draggable={!section.isImplicit}
      onDragOver={(event) => event.preventDefault()}
      onDragStart={() => {
        if (!section.isImplicit) {
          onDragSection(section.id);
        }
      }}
      onDrop={() => {
        if (!section.isImplicit) {
          onDropSection(draggingSectionId, section.id);
        }
      }}
    >
      <div className="fm-section-card__title-band">
        {section.isImplicit ? (
          <span className="fm-section-card__title-chip is-static">{section.title || 'Sessão principal'}</span>
        ) : (
          <input
            autoFocus={!String(section.title || '').trim()}
            className={`fm-section-card__title-chip ${sectionError ? 'has-error' : ''}`}
            onChange={(event) => onUpdateSectionField(section.id, event.target.value, { autosave: true })}
            placeholder="Nome da sessão"
            value={section.title || ''}
          />
        )}

        {!section.isImplicit ? (
          <button
            aria-label="Excluir sessão"
            className="fm-module-card__trash fm-section-card__trash"
            onClick={() => onArchiveSection(section)}
            type="button"
          >
            <Icon name="trash" size={14} />
          </button>
        ) : null}
      </div>

      <div className="fm-section-card__body">
        {sectionModules.length ? (
          <div className="fm-stack-sm">
            {sectionModules.map((module) => (
              <ModuleItemCard
                activeLessonId={activeLessonId}
                activeModuleId={activeModuleId}
                autosavingModuleId={autosavingModuleId}
                creatingLessonModuleId={creatingLessonModuleId}
                draggingLessonId={draggingLessonId}
                draggingModuleId={draggingModuleId}
                index={moduleIndexMap[String(module.client_key || module.id)] ?? 0}
                key={module.client_key || module.id}
                lessonErrors={lessonErrors}
                lessonFocusTarget={lessonFocusTarget}
                module={module}
                moduleCoversEnabled={moduleCoversEnabled}
                moduleError={moduleErrorById[String(module.id)] || ''}
                onArchiveModule={onArchiveModule}
                onAppendNextLesson={onAppendNextLesson}
                onArchiveLesson={onArchiveLesson}
                onDragLesson={onDragLesson}
                onDragModule={onDragModule}
                onDropLesson={onDropLesson}
                onDropModule={onDropModule}
                onLessonFieldChange={onLessonFieldChange}
                onLessonFieldsChange={onLessonFieldsChange}
                onSelectLesson={onSelectLesson}
                onSelectModule={onSelectModule}
                onUpdateModuleCover={onUpdateModuleCover}
                onUpdateModuleField={onUpdateModuleField}
              />
            ))}
          </div>
        ) : null}

        {!section.isImplicit ? (
          <div className="fm-structure-create-module-row is-section-centered">
            <button
              className="fm-button fm-button--ghost fm-structure-create-module"
              disabled={!canCreateModule}
              onClick={() => onCreateModule(section.id)}
              type="button"
            >
              <Icon name="plus" size={16} />
              <span>Novo módulo</span>
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function ModuleEditor({
  externalValidation = null,
  moduleCoversEnabled = false,
  sections = [],
  modules = [],
  onChange,
  onPersistStructure,
  onToggleModuleCovers,
}) {
  const [activeSectionId, setActiveSectionId] = React.useState(null);
  const [activeModuleId, setActiveModuleId] = React.useState(null);
  const [activeLessonId, setActiveLessonId] = React.useState(null);
  const [draggingSectionId, setDraggingSectionId] = React.useState(null);
  const [draggingModuleId, setDraggingModuleId] = React.useState(null);
  const [draggingLessonId, setDraggingLessonId] = React.useState(null);
  const [autosavingSectionId, setAutosavingSectionId] = React.useState(null);
  const [autosavingModuleId, setAutosavingModuleId] = React.useState(null);
  const [creatingLessonModuleId, setCreatingLessonModuleId] = React.useState(null);
  const [structureError, setStructureError] = React.useState('');
  const [sectionErrors, setSectionErrors] = React.useState({});
  const [moduleErrors, setModuleErrors] = React.useState({});
  const [lessonErrors, setLessonErrors] = React.useState({});
  const [lessonFocusTarget, setLessonFocusTarget] = React.useState(null);
  const [pendingArchiveSection, setPendingArchiveSection] = React.useState(null);
  const [pendingArchiveModule, setPendingArchiveModule] = React.useState(null);
  const [pendingArchiveLesson, setPendingArchiveLesson] = React.useState(null);
  const [toasts, setToasts] = React.useState([]);
  const autosaveTimeoutRef = React.useRef(null);
  const toastTimeoutsRef = React.useRef(new Map());
  const visibleSections = buildVisibleSections(sections, modules, moduleCoversEnabled);
  const activeModules = (modules || []).filter((module) => module.status !== 'archived').sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const moduleIndexMap = activeModules.reduce((map, module, index) => {
    map[String(module?.client_key || module?.id)] = index;
    map[String(module?.id)] = index;
    return map;
  }, {});
  const hasModules = activeModules.length > 0;
  const hasSections = visibleSections.length > 0;
  const nextSortOrder = activeModules.reduce((highest, module) => Math.max(highest, Number(module.sort_order || 0)), 0) + 1;
  const nextSectionSortOrder = visibleSections.filter((section) => !section.isImplicit).reduce((highest, section) => Math.max(highest, Number(section.sort_order || 0)), 0) + 1;

  function appendBlankLessonToModules(sourceModules, moduleId) {
    const targetModule = sourceModules.find((module) => String(module.id) === String(moduleId));
    const visibleLessons = getVisibleLessons(targetModule);
    const nextLessonOrder = (visibleLessons[visibleLessons.length - 1]?.sort_order || 0) + 1;
    const lessonKey = createTempId('lesson');
    const nextModules = sourceModules.map((module) =>
      String(module.id) === String(moduleId)
        ? {
            ...module,
            lessons: [
              ...(module.lessons || []),
              {
                ...defaultLesson,
                id: lessonKey,
                client_key: lessonKey,
                sort_order: nextLessonOrder,
              },
            ],
          }
        : module
    );

    return {
      nextModules,
      lessonKey,
    };
  }

  React.useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }

      toastTimeoutsRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      toastTimeoutsRef.current.clear();
    };
  }, []);

  React.useEffect(() => {
    if (!moduleCoversEnabled) {
      setActiveSectionId(null);
      return;
    }

    if (!visibleSections.length) {
      setActiveSectionId(null);
      return;
    }

    if (!activeSectionId) {
      setActiveSectionId(visibleSections[0]?.client_key || visibleSections[0]?.id || null);
      return;
    }

    if (activeSectionId && !visibleSections.some((section) => matchesItemRef(activeSectionId, section))) {
      setActiveSectionId(visibleSections[0]?.client_key || visibleSections[0]?.id || null);
    }
  }, [activeSectionId, moduleCoversEnabled, visibleSections]);

  React.useEffect(() => {
    if (!activeModules.length) {
      setActiveModuleId(null);
      return;
    }

    if (activeModuleId && !activeModules.some((module) => matchesItemRef(activeModuleId, module))) {
      setActiveModuleId(null);
    }
  }, [activeModuleId, activeModules]);

  React.useEffect(() => {
    const currentModule = activeModules.find((module) => matchesItemRef(activeModuleId, module));

    if (!currentModule) {
      setActiveLessonId(null);
      return;
    }

    const visibleLessons = getVisibleLessons(currentModule);

    if (!visibleLessons.length) {
      setActiveLessonId(null);
      return;
    }

    if (!visibleLessons.some((lesson) => matchesItemRef(activeLessonId, lesson))) {
      setActiveLessonId(null);
    }
  }, [activeLessonId, activeModuleId, activeModules, modules]);

  React.useEffect(() => {
    if (!externalValidation?.nonce) {
      return;
    }

    if (externalValidation.moduleRef) {
      setActiveModuleId(externalValidation.moduleRef);
    }

    if (externalValidation.lessonRef) {
      setActiveLessonId(externalValidation.lessonRef);
      setLessonErrors((current) => ({
        ...current,
        [String(externalValidation.lessonRef)]: {
          title: Boolean(externalValidation.missingFields?.title),
          content_url: Boolean(externalValidation.missingFields?.content_url),
        },
      }));

      if (externalValidation.focusField) {
        setLessonFocusTarget({
          lessonRef: externalValidation.lessonRef,
          field: externalValidation.focusField,
          nonce: Date.now(),
        });
      }

      if (externalValidation.message) {
        pushToast(externalValidation.message);
      }
    }
  }, [externalValidation]);

  function cancelPendingAutosave() {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }

    setAutosavingModuleId(null);
  }

  function dismissToast(toastId) {
    const timeoutId = toastTimeoutsRef.current.get(toastId);

    if (timeoutId) {
      clearTimeout(timeoutId);
      toastTimeoutsRef.current.delete(toastId);
    }

    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }

  function pushToast(message) {
    if (!message) {
      return;
    }

    const toastId = `toast-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

    setToasts((current) => [...current, { id: toastId, message }]);

    const timeoutId = setTimeout(() => {
      dismissToast(toastId);
    }, 3200);

    toastTimeoutsRef.current.set(toastId, timeoutId);
  }

  function updateAllModules(nextModules) {
    onChange?.({
      modules: normalizeModules(nextModules),
      sections: attachModulesToSections(normalizeSections(sections), normalizeModules(nextModules)),
    });
  }

  function updateVisibleModules(nextModules) {
    const normalizedModules = mergeVisibleWithArchived(modules, normalizeOrder(nextModules));
    onChange?.({
      modules: normalizedModules,
      sections: attachModulesToSections(normalizeSections(sections), normalizedModules),
    });
  }

  function updateStructure(nextSections, nextModules) {
    const normalizedSections = normalizeSections(nextSections);
    const normalizedModules = normalizeModules(nextModules);
    onChange?.({
      sections: attachModulesToSections(normalizedSections, normalizedModules),
      modules: normalizedModules,
    });
  }

  function setSectionError(sectionId, message = '') {
    setSectionErrors((current) => {
      const next = { ...current };

      if (!message) {
        delete next[String(sectionId)];
        return next;
      }

      next[String(sectionId)] = message;
      return next;
    });
  }

  function setModuleError(moduleId, message = '') {
    setModuleErrors((current) => {
      const next = { ...current };

      if (!message) {
        delete next[String(moduleId)];
        return next;
      }

      next[String(moduleId)] = message;
      return next;
    });
  }

  function setLessonErrorState(lessonId, missingFields = null) {
    setLessonErrors((current) => {
      const next = { ...current };
      const normalizedLessonId = String(lessonId || '');

      if (!normalizedLessonId) {
        return next;
      }

      if (!missingFields || (!missingFields.title && !missingFields.content_url)) {
        delete next[normalizedLessonId];
        return next;
      }

      next[normalizedLessonId] = {
        title: Boolean(missingFields.title),
        content_url: Boolean(missingFields.content_url),
      };

      return next;
    });
  }

  function clearLessonFieldError(lessonId, field) {
    if (!field || (field !== 'title' && field !== 'content_url')) {
      return;
    }

    setLessonErrors((current) => {
      const lessonKey = String(lessonId || '');
      const currentError = current[lessonKey];

      if (!currentError) {
        return current;
      }

      const next = { ...current };
      const nextError = {
        ...currentError,
        [field]: false,
      };

      if (!nextError.title && !nextError.content_url) {
        delete next[lessonKey];
      } else {
        next[lessonKey] = nextError;
      }

      return next;
    });
  }

  function focusLessonField(lessonRef, field) {
    if (!lessonRef || !field) {
      return;
    }

    setLessonFocusTarget({
      lessonRef,
      field,
      nonce: Date.now(),
    });
  }

  function surfaceLessonValidation(moduleRef, lesson, validation) {
    const lessonRef = getLessonRef(lesson);

    setStructureError('');
    setActiveModuleId(moduleRef);
    setActiveLessonId(lessonRef);
    setLessonErrorState(lessonRef, validation.missingFields);
    focusLessonField(lessonRef, validation.focusField);
    pushToast(validation.message);
  }

  async function persistModules(nextModules, options = {}, nextSections = sections) {
    if (!onPersistStructure) {
      return null;
    }

    try {
      const response = await onPersistStructure({ modules: nextModules, sections: nextSections, __options: options });
      setStructureError('');
      return response;
    } catch (error) {
      setStructureError(error?.message || 'Nao foi possivel salvar a estrutura do curso.');
      throw error;
    }
  }

  function scheduleModuleAutosave(nextModules, moduleId) {
    const targetModule = nextModules.find((item) => matchesItemRef(moduleId, item));

    if (!targetModule || !isModuleTitleValid(targetModule.title)) {
      setModuleError(moduleId, 'Informe um nome para o módulo.');
      return;
    }

    setModuleError(moduleId, '');

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    setAutosavingModuleId(moduleId);

    autosaveTimeoutRef.current = setTimeout(async () => {
      try {
        await persistModules(nextModules, { silentSuccess: true, skipCatalogRefresh: true }, sections);
      } catch (error) {
        // O erro ja foi refletido no estado global da estrutura.
      } finally {
        setAutosavingModuleId(null);
      }
    }, 500);
  }

  function scheduleLessonAutosave(nextModules, moduleId) {
    const targetModule = nextModules.find((item) => matchesItemRef(moduleId, item));

    if (!targetModule || !canModuleCreateLessons(targetModule.title)) {
      return;
    }

    const hasMeaningfulDraft = getVisibleLessons(targetModule).some((lesson) => hasMeaningfulLessonData(lesson));

    if (!hasMeaningfulDraft) {
      return;
    }

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    setAutosavingModuleId(targetModule.id);

    autosaveTimeoutRef.current = setTimeout(async () => {
      try {
        await persistModules(nextModules, { silentSuccess: true, skipCatalogRefresh: true }, sections);
      } catch (error) {
        // O erro ja foi refletido no estado global da estrutura.
      } finally {
        setAutosavingModuleId(null);
      }
    }, 700);
  }

  function handleCreateSection() {
    const tempId = createTempId('section');
    const nextSections = [
      ...visibleSections.filter((section) => !section.isImplicit).map((section) => ({
        ...section,
        modules: [],
      })),
      {
        ...defaultSection,
        id: tempId,
        client_key: tempId,
        title: '',
        sort_order: nextSectionSortOrder,
      },
    ];

    updateStructure(nextSections, modules || []);
    setActiveSectionId(tempId);
    setSectionError(tempId, 'Informe um nome para a sessão.');
  }

  function handleUpdateSectionField(sectionId, value, options = {}) {
    const nextSections = normalizeSections(
      (sections || []).map((section) => (matchesItemRef(sectionId, section) ? { ...section, title: value } : section))
    );

    if (!String(value || '').trim()) {
      setSectionError(sectionId, 'Informe um nome para a sessão.');
    } else {
      setSectionError(sectionId, '');
    }

    updateStructure(nextSections, modules || []);

    if (options.autosave) {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }

      setAutosavingSectionId(sectionId);
      autosaveTimeoutRef.current = setTimeout(async () => {
        try {
          await persistModules(modules || [], { silentSuccess: true, skipCatalogRefresh: true }, nextSections);
        } catch (error) {
          // O erro ja foi refletido no estado global da estrutura.
        } finally {
          setAutosavingSectionId(null);
        }
      }, 500);
    }
  }

  function archiveSection(sectionId) {
    const nextSections = (sections || []).map((section) => (matchesItemRef(sectionId, section) ? { ...section, status: 'archived' } : section));
    const nextModules = (modules || []).map((module) =>
      String(module.section_id || '') === String(sectionId)
        ? {
            ...module,
            status: 'archived',
            lessons: (module.lessons || []).map((lesson) => ({ ...lesson, status: 'archived' })),
          }
        : module
    );

    updateStructure(nextSections, nextModules);
    setSectionError(sectionId, '');
    setActiveSectionId((current) => (String(current) === String(sectionId) ? null : current));
    setActiveModuleId(null);
    setActiveLessonId(null);
  }

  function handleArchiveSection(section) {
    if (!section) {
      return;
    }

    const sectionModules = (section.modules || []).filter((module) => module.status !== 'archived');

    if (!sectionModules.length) {
      archiveSection(section.id);
      return;
    }

    setPendingArchiveSection({
      sectionId: section.id,
      title: section.title || 'Nova sessão',
      moduleCount: sectionModules.length,
    });
  }

  function handleCreateModule(sectionId = '') {
    const tempId = createTempId('module');
    const normalizedSectionId = sectionId || '';
    void traceCourseBuilder('module-create-local', {
      tempModuleId: tempId,
      sectionId: normalizedSectionId,
      nextSortOrder,
    });

    const nextModules = [
      ...activeModules,
      {
        ...defaultModule,
        id: tempId,
        client_key: tempId,
        section_id: normalizedSectionId,
        title: '',
        sort_order: nextSortOrder,
      },
    ];

    if (moduleCoversEnabled) {
      updateStructure(sections || [], nextModules);
      setActiveSectionId(sectionId || activeSectionId);
    } else {
      updateVisibleModules(nextModules);
    }

    setActiveModuleId(tempId);
    setActiveLessonId(null);
    setModuleError(tempId, 'Informe um nome para o módulo.');
  }

  function handleUpdateModuleField(moduleId, field, value, options = {}) {
    const nextModules = (modules || []).map((module) => (String(module.id) === String(moduleId) ? { ...module, [field]: value } : module));
    updateAllModules(nextModules);

    if (field === 'title') {
      if (!isModuleTitleValid(value)) {
        setModuleError(moduleId, 'Informe um nome para o módulo.');
      } else {
        setModuleError(moduleId, '');
      }
    }

    if (options.autosave) {
      scheduleModuleAutosave(nextModules, moduleId);
    }
  }

  function handleUpdateModuleCover(moduleId, file) {
    const nextModules = (modules || []).map((module) =>
      String(module.id) === String(moduleId)
        ? {
            ...module,
            cover_image_id: Number(file?.id || 0),
            cover_image_url: file?.sizes?.large?.url || file?.url || '',
            cover_image_thumb_url: file?.sizes?.medium?.url || file?.thumb_url || file?.url || '',
          }
        : module
    );

    updateAllModules(nextModules);
    scheduleModuleAutosave(nextModules, moduleId);
  }

  function archiveModule(moduleId) {
    const nextModules = (modules || []).map((module) => (String(module.id) === String(moduleId) ? { ...module, status: 'archived' } : module));
    updateAllModules(nextModules);
    setModuleError(moduleId, '');

    if ((modules || []).some((module) => String(module.id) === String(moduleId) && matchesItemRef(activeModuleId, module))) {
      setActiveModuleId(null);
      setActiveLessonId(null);
    }
  }

  function handleArchiveModule(module) {
    if (!module) {
      return;
    }

    const visibleLessons = getVisibleLessons(module);

    if (!visibleLessons.length) {
      archiveModule(module.id);
      return;
    }

    setPendingArchiveModule({
      moduleId: module.id,
      title: module.title || 'Novo módulo',
      lessonCount: visibleLessons.length,
    });
  }

  function archiveLesson(moduleId, lessonId) {
    const nextModules = (modules || []).map((module) =>
      matchesItemRef(moduleId, module)
        ? {
            ...module,
            lessons: (module.lessons || []).map((lesson) => (matchesItemRef(lessonId, lesson) ? { ...lesson, status: 'archived' } : lesson)),
          }
        : module
    );

    updateAllModules(nextModules);
    setLessonErrorState(lessonId, null);
    setStructureError('');

    const targetModule = nextModules.find((module) => matchesItemRef(moduleId, module));
    const visibleLessons = getVisibleLessons(targetModule);

    if (matchesItemRef(activeLessonId, { id: lessonId, client_key: lessonId })) {
      setActiveLessonId(visibleLessons[0] ? getLessonRef(visibleLessons[0]) : null);
    }
  }

  function handleRequestArchiveLesson(moduleId, lesson) {
    if (!lesson) {
      return;
    }

    if (!hasMeaningfulLessonData(lesson)) {
      archiveLesson(moduleId, lesson.id);
      return;
    }

    setPendingArchiveLesson({
      moduleId,
      lessonId: lesson.id,
      title: lesson.title || 'Nova aula',
    });
  }

  async function handleAppendNextLesson(moduleId) {
    cancelPendingAutosave();
    const targetModule = activeModules.find((module) => String(module.id) === String(moduleId));

    if (!targetModule) {
      return;
    }

    if (!isModuleTitleValid(targetModule.title)) {
      setModuleError(moduleId, 'Defina um nome para o módulo antes de adicionar aulas.');
      setActiveModuleId(moduleId);
      return;
    }

    if (!canModuleCreateLessons(targetModule.title)) {
      setModuleError(moduleId, 'Digite ao menos 2 caracteres no nome do módulo antes de adicionar aulas.');
      setActiveModuleId(moduleId);
      return;
    }

    const visibleLessons = getVisibleLessons(targetModule);

    if (!visibleLessons.length) {
      const { nextModules, lessonKey } = appendBlankLessonToModules(modules || [], moduleId);
      void traceCourseBuilder('lesson-sequence-start', {
        moduleId,
        firstLessonKey: lessonKey,
      });
      updateAllModules(nextModules);
      setActiveModuleId(moduleId);
      setActiveLessonId(lessonKey);
      setStructureError('');
      return;
    }

    const currentLesson = visibleLessons.find((lesson) => matchesItemRef(activeLessonId, lesson)) || visibleLessons[visibleLessons.length - 1];
    const validation = getLessonValidationState(currentLesson);

    if (!validation.isValid) {
      surfaceLessonValidation(moduleId, currentLesson, validation);
      void traceCourseBuilder('lesson-sequence-blocked', {
        moduleId,
        lessonRef: getLessonRef(currentLesson),
      });
      return;
    }

    void traceCourseBuilder('lesson-sequence-save-current', {
      moduleId,
      lessonRef: getLessonRef(currentLesson),
    });

    setCreatingLessonModuleId(moduleId);
    setStructureError('');

    try {
      const response = await persistModules(modules, {
        silentSuccess: true,
        actionKey: 'lesson-sequence-save',
        skipCatalogRefresh: true,
      }, sections);
      const persistedModules = response?.modules || modules || [];
      const persistedModule = persistedModules.find((module) => matchesItemRef(moduleId, module) || String(module.id) === String(moduleId)) || targetModule;
      const { nextModules, lessonKey } = appendBlankLessonToModules(persistedModules, persistedModule.id);

      void traceCourseBuilder('lesson-sequence-next-created', {
        moduleId: persistedModule.id,
        nextLessonKey: lessonKey,
      });

      updateAllModules(nextModules);
      setActiveModuleId(persistedModule.client_key || persistedModule.id);
      setActiveLessonId(lessonKey);
    } catch (error) {
      setStructureError(error?.message || 'Nao foi possivel salvar a aula atual antes de abrir a próxima.');
    } finally {
      setCreatingLessonModuleId(null);
    }
  }

  function handleLessonFieldChange(moduleId, lessonId, field, value) {
    handleLessonFieldsChange(moduleId, lessonId, { [field]: value });
  }

  function handleLessonFieldsChange(moduleId, lessonId, changes) {
    const nextModules = (modules || []).map((module) =>
        matchesItemRef(moduleId, module)
          ? {
              ...module,
              lessons: (module.lessons || []).map((lesson) =>
                matchesItemRef(lessonId, lesson)
                  ? {
                      ...lesson,
                      ...changes,
                    }
                  : lesson
              ),
            }
          : module
      );

    updateAllModules(nextModules);
    scheduleLessonAutosave(nextModules, moduleId);
    if (Object.prototype.hasOwnProperty.call(changes, 'title')) {
      clearLessonFieldError(lessonId, 'title');
    }
    if (Object.prototype.hasOwnProperty.call(changes, 'content_url')) {
      clearLessonFieldError(lessonId, 'content_url');
    }
    setStructureError('');
  }


  function handleDropModule(sourceId, targetId) {
    if (!sourceId || !targetId || String(sourceId) === String(targetId)) {
      return;
    }

    const ordered = [...activeModules];
    const sourceIndex = ordered.findIndex((module) => String(module.id) === String(sourceId));
    const targetIndex = ordered.findIndex((module) => String(module.id) === String(targetId));

    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    const [moved] = ordered.splice(sourceIndex, 1);
    const targetModule = ordered[targetIndex] || activeModules[targetIndex];
    const targetSectionId = targetModule?.section_id || '';
    ordered.splice(targetIndex, 0, moved);

    const nextModules = ordered.map((module) =>
      String(module.id) === String(sourceId)
        ? {
            ...module,
          section_id: targetSectionId || '',
          }
        : module
    );

    if (moduleCoversEnabled) {
      updateStructure(sections || [], nextModules);
    } else {
      updateVisibleModules(nextModules);
    }
    setDraggingModuleId(null);
  }

  function handleDropSection(sourceId, targetId) {
    if (!sourceId || !targetId || String(sourceId) === String(targetId)) {
      return;
    }

    const orderedSections = visibleSections.filter((section) => !section.isImplicit);
    const sourceIndex = orderedSections.findIndex((section) => String(section.id) === String(sourceId));
    const targetIndex = orderedSections.findIndex((section) => String(section.id) === String(targetId));

    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    const [movedSection] = orderedSections.splice(sourceIndex, 1);
    orderedSections.splice(targetIndex, 0, movedSection);
    updateStructure(orderedSections, modules || []);
    setDraggingSectionId(null);
  }

  function handleDropLesson(moduleId, sourceLessonId, targetLessonId) {
    if (!sourceLessonId || !targetLessonId || String(sourceLessonId) === String(targetLessonId)) {
      return;
    }

    updateAllModules(
      (modules || []).map((module) => {
        if (String(module.id) !== String(moduleId)) {
          return module;
        }

        const orderedLessons = [...((module.lessons || []).filter((lesson) => lesson.status !== 'archived'))].sort(
          (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
        );
        const sourceIndex = orderedLessons.findIndex((lesson) => String(lesson.id) === String(sourceLessonId));
        const targetIndex = orderedLessons.findIndex((lesson) => String(lesson.id) === String(targetLessonId));

        if (sourceIndex < 0 || targetIndex < 0) {
          return module;
        }

        const [movedLesson] = orderedLessons.splice(sourceIndex, 1);
        orderedLessons.splice(targetIndex, 0, movedLesson);

        return {
          ...module,
          lessons: mergeVisibleWithArchived(module.lessons || [], normalizeOrder(orderedLessons)),
        };
      })
    );
    setDraggingLessonId(null);
  }

  return (
    <div className="fm-structure-layout">
      {toasts.length ? (
        <div className="fm-toast-stack" role="status" aria-live="polite">
          {toasts.map((toast) => (
            <div className="fm-toast fm-toast--error" key={toast.id}>
              <div className="fm-toast__icon" aria-hidden="true">
                <Icon name="help" size={16} />
              </div>
              <div className="fm-toast__content">
                <strong>Preenchimento pendente</strong>
                <span>{toast.message}</span>
              </div>
              <button aria-label="Fechar notificação" className="fm-toast__close" onClick={() => dismissToast(toast.id)} type="button">
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="fm-structure-toolbar">
        <div className="fm-structure-toolbar__heading">
          <h4>Estrutura do curso</h4>
        </div>
        <div className="fm-structure-toolbar__actions">
          <label className="fm-switch-field">
            <span>Capas em módulos</span>
            <button
              aria-pressed={moduleCoversEnabled}
              className={`fm-switch ${moduleCoversEnabled ? 'is-active' : ''}`}
              onClick={() => onToggleModuleCovers?.(!moduleCoversEnabled)}
              type="button"
            >
              <span className="fm-switch__thumb" aria-hidden="true" />
            </button>
          </label>
        </div>
      </div>

      {structureError ? <div className="fm-admin-alert is-error">{structureError}</div> : null}

      {moduleCoversEnabled ? (
        !hasSections ? (
          <div className="fm-structure-empty-state">
            <button className="fm-button fm-button--ghost fm-structure-create-module" onClick={handleCreateSection} type="button">
              <Icon name="plus" size={16} />
              <span>Inserir sessão</span>
            </button>
          </div>
        ) : (
          <div className="fm-stack-sm">
            {visibleSections.map((section) => (
              <SectionItemCard
                activeLessonId={activeLessonId}
                activeModuleId={activeModuleId}
                activeSectionId={activeSectionId}
                autosavingModuleId={autosavingModuleId}
                creatingLessonModuleId={creatingLessonModuleId}
                draggingLessonId={draggingLessonId}
                draggingModuleId={draggingModuleId}
                draggingSectionId={draggingSectionId}
                key={section.client_key || section.id}
                lessonErrors={lessonErrors}
                lessonFocusTarget={lessonFocusTarget}
                moduleCoversEnabled={moduleCoversEnabled}
                moduleErrorById={moduleErrors}
                moduleIndexMap={moduleIndexMap}
                onArchiveLesson={handleRequestArchiveLesson}
                onArchiveModule={handleArchiveModule}
                onArchiveSection={handleArchiveSection}
                onAppendNextLesson={handleAppendNextLesson}
                onCreateModule={handleCreateModule}
                onDragLesson={setDraggingLessonId}
                onDragModule={setDraggingModuleId}
                onDragSection={setDraggingSectionId}
                onDropLesson={handleDropLesson}
                onDropModule={handleDropModule}
                onDropSection={handleDropSection}
                onLessonFieldChange={handleLessonFieldChange}
                onLessonFieldsChange={handleLessonFieldsChange}
                onSelectLesson={setActiveLessonId}
                onSelectModule={(moduleId) => {
                  setActiveModuleId((currentId) => (String(currentId) === String(moduleId) ? null : moduleId));
                  setActiveLessonId(null);
                }}
                onSelectSection={(sectionId) => {
                  setActiveSectionId((currentId) => (String(currentId) === String(sectionId) ? null : sectionId));
                }}
                onUpdateModuleCover={handleUpdateModuleCover}
                onUpdateModuleField={handleUpdateModuleField}
                onUpdateSectionField={handleUpdateSectionField}
                section={section}
                sectionError={sectionErrors[String(section.id)] || (autosavingSectionId && String(autosavingSectionId) === String(section.id) ? 'Salvando...' : '')}
              />
            ))}

            <div className="fm-structure-create-module-row">
              <button className="fm-button fm-button--ghost fm-structure-create-module" onClick={handleCreateSection} type="button">
                <Icon name="plus" size={16} />
                <span>Nova sessão</span>
              </button>
            </div>
          </div>
        )
      ) : !hasModules ? (
        <div className="fm-structure-empty-state">
          <button className="fm-button fm-button--ghost fm-structure-create-module" onClick={() => handleCreateModule('')} type="button">
            <Icon name="plus" size={16} />
            <span>Inserir módulo</span>
          </button>
        </div>
      ) : (
        <div className="fm-stack-sm">
          {activeModules.map((module, index) => (
            <ModuleItemCard
              activeLessonId={activeLessonId}
              activeModuleId={activeModuleId}
              autosavingModuleId={autosavingModuleId}
              creatingLessonModuleId={creatingLessonModuleId}
              draggingLessonId={draggingLessonId}
              draggingModuleId={draggingModuleId}
              index={index}
              key={module.client_key || module.id}
              lessonErrors={lessonErrors}
              lessonFocusTarget={lessonFocusTarget}
              module={module}
              moduleCoversEnabled={moduleCoversEnabled}
              moduleError={moduleErrors[String(module.id)] || ''}
              onArchiveModule={handleArchiveModule}
              onAppendNextLesson={handleAppendNextLesson}
              onArchiveLesson={handleRequestArchiveLesson}
              onDragLesson={setDraggingLessonId}
              onDragModule={setDraggingModuleId}
              onDropLesson={handleDropLesson}
              onDropModule={handleDropModule}
              onLessonFieldChange={handleLessonFieldChange}
              onLessonFieldsChange={handleLessonFieldsChange}
              onSelectLesson={setActiveLessonId}
              onSelectModule={(moduleId) => {
                setActiveModuleId((currentId) => (String(currentId) === String(moduleId) ? null : moduleId));
                setActiveLessonId(null);
              }}
              onUpdateModuleCover={handleUpdateModuleCover}
              onUpdateModuleField={handleUpdateModuleField}
            />
          ))}

          <div className="fm-structure-create-module-row">
            <button className="fm-button fm-button--ghost fm-structure-create-module" onClick={() => handleCreateModule('')} type="button">
              <Icon name="plus" size={16} />
              <span>Novo módulo</span>
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        confirmLabel="Excluir sessão"
        description="Tem certeza que deseja excluir a sessão"
        details={
          pendingArchiveSection?.moduleCount
            ? `Os ${pendingArchiveSection.moduleCount} módulo(s) e as aulas vinculadas também serão removidos desta estrutura.`
            : ''
        }
        highlight={pendingArchiveSection?.title || 'Nova sessão'}
        onCancel={() => setPendingArchiveSection(null)}
        onConfirm={() => {
          if (pendingArchiveSection?.sectionId) {
            archiveSection(pendingArchiveSection.sectionId);
          }
          setPendingArchiveSection(null);
        }}
        open={Boolean(pendingArchiveSection)}
        title="Excluir sessão?"
        tone="danger"
      />

      <ConfirmDialog
        confirmLabel="Excluir módulo"
        description="Tem certeza que deseja excluir o módulo"
        details={
          pendingArchiveModule?.lessonCount
            ? `As ${pendingArchiveModule.lessonCount} aula(s) vinculadas também serão removidas desta estrutura.`
            : ''
        }
        highlight={pendingArchiveModule?.title || 'Novo módulo'}
        onCancel={() => setPendingArchiveModule(null)}
        onConfirm={() => {
          if (pendingArchiveModule?.moduleId) {
            archiveModule(pendingArchiveModule.moduleId);
          }
          setPendingArchiveModule(null);
        }}
        open={Boolean(pendingArchiveModule)}
        title="Excluir módulo?"
        tone="danger"
      />

      <ConfirmDialog
        confirmLabel="Excluir aula"
        description="Tem certeza que deseja excluir a aula"
        highlight={pendingArchiveLesson?.title || 'Nova aula'}
        onCancel={() => setPendingArchiveLesson(null)}
        onConfirm={() => {
          if (pendingArchiveLesson?.moduleId && pendingArchiveLesson?.lessonId) {
            archiveLesson(pendingArchiveLesson.moduleId, pendingArchiveLesson.lessonId);
          }
          setPendingArchiveLesson(null);
        }}
        open={Boolean(pendingArchiveLesson)}
        title="Excluir aula?"
        tone="danger"
      />
    </div>
  );
}
