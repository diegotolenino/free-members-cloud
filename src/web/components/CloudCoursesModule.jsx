import { useEffect, useMemo, useRef, useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import CourseCatalog from './CourseCatalog';
import CourseWorkspace from './CourseWorkspace';
import ToastStack from './ToastStack';
import { apiFetch } from '../lib/api';
import { getBootstrap } from '../lib/bootstrap';
import { traceCourseBuilder } from '../lib/debugTrace';

function sortByOrder(items = []) {
  return [...items].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function isPersistedId(value) {
  return /^\d+$/.test(String(value || ''));
}

function matchesCollectionItem(reference = {}, candidate = {}) {
  const referenceClientKey = String(reference.client_key || '').trim();
  const candidateClientKey = String(candidate.client_key || '').trim();

  if (referenceClientKey && candidateClientKey && referenceClientKey === candidateClientKey) {
    return true;
  }

  return isPersistedId(reference.id) && isPersistedId(candidate.id) && Number(reference.id) === Number(candidate.id);
}

function findMatchingCollectionItem(reference = {}, collection = []) {
  return collection.find((candidate) => matchesCollectionItem(reference, candidate)) || null;
}

function isBlankDraftLesson(lesson = {}) {
  if (isPersistedId(lesson.id)) {
    return false;
  }

  const hasTitle = Boolean(String(lesson.title || '').trim());
  const hasExcerpt = Boolean(String(lesson.excerpt || '').replace(/<[^>]*>/g, '').trim());
  const hasContentUrl = Boolean(String(lesson.content_url || '').trim());
  const hasMaterials = Array.isArray(lesson.materials) && lesson.materials.some((item) => item?.status !== 'archived' && (item?.title || item?.url));

  return !hasTitle && !hasExcerpt && !hasContentUrl && !hasMaterials;
}

function normalizeCoursePayload(payload = {}) {
  return {
    title: payload.title || '',
    slug: payload.slug || '',
    excerpt: payload.excerpt || '',
    description: payload.description || '',
    cover_image_id: Number(payload.cover_image_id || 0),
    cover_image_url: payload.cover_image_url || payload.cover_image_thumb_url || '',
    cover_image_thumb_url: payload.cover_image_thumb_url || payload.cover_image_url || '',
    module_covers_enabled: payload.module_covers_enabled ? 1 : 0,
    appearance_settings: payload.appearance_settings || {},
    status: payload.status || 'published',
    visibility: payload.visibility || 'private',
    sort_order: Number(payload.sort_order || 0),
  };
}

function normalizeModulePayload(module = {}, index = 0) {
  return {
    section_id: Number(module.section_id || 0),
    title: module.title || '',
    description: module.description || '',
    cover_image_id: Number(module.cover_image_id || 0),
    cover_image_url: module.cover_image_url || module.cover_image_thumb_url || '',
    cover_image_thumb_url: module.cover_image_thumb_url || module.cover_image_url || '',
    status: module.status || 'published',
    sort_order: Number(module.sort_order ?? index + 1),
  };
}

function normalizeSectionPayload(section = {}, index = 0) {
  return {
    title: section.title || '',
    status: section.status || 'published',
    sort_order: Number(section.sort_order ?? index + 1),
  };
}

function normalizeLessonPayload(lesson = {}, index = 0) {
  return {
    title: lesson.title || '',
    slug: lesson.slug || '',
    excerpt: lesson.excerpt || '',
    content_type: lesson.content_type || 'video',
    content_source: lesson.content_source || 'external_url',
    content_url: lesson.content_url || '',
    duration_seconds: Number(lesson.duration_seconds || 0),
    is_preview: lesson.is_preview ? 1 : 0,
    status: lesson.status || 'published',
    sort_order: Number(lesson.sort_order ?? index + 1),
    materials: (lesson.materials || []).map((item, materialIndex) => ({
      ...(isPersistedId(item.id) ? { id: Number(item.id) } : {}),
      title: item.title || '',
      type: item.type || 'link',
      url: item.url || '',
      sort_order: Number(item.sort_order ?? materialIndex + 1),
      status: item.status || 'active',
    })),
  };
}

function summarizeModules(modules = []) {
  const visibleModules = modules.filter((module) => module.status !== 'archived');
  const lessonCount = visibleModules.reduce(
    (sum, module) => sum + (module.lessons || []).filter((lesson) => lesson.status !== 'archived').length,
    0
  );

  return {
    modules: visibleModules.length,
    lessons: lessonCount,
  };
}

function mergeLessonCollections(persistedLessons = [], latestLessons = []) {
  const mergedPersistedLessons = persistedLessons.map((persistedLesson) => {
    const latestLesson =
      latestLessons.find((lesson) => String(lesson.client_key || '') === String(persistedLesson.client_key || '')) ||
      latestLessons.find((lesson) => Number(lesson.id || 0) === Number(persistedLesson.id || 0));

    if (!latestLesson) {
      return persistedLesson;
    }

    return {
      ...latestLesson,
      ...persistedLesson,
      id: persistedLesson.id,
      client_key: persistedLesson.client_key || latestLesson.client_key || '',
      module_id: persistedLesson.module_id,
    };
  });

  const onlyLatestLessons = latestLessons.filter((latestLesson) => {
    return !persistedLessons.some(
      (persistedLesson) =>
        String(persistedLesson.client_key || '') === String(latestLesson.client_key || '') ||
        (Number(persistedLesson.id || 0) > 0 && Number(persistedLesson.id || 0) === Number(latestLesson.id || 0))
    );
  });

  return [...mergedPersistedLessons, ...onlyLatestLessons];
}

function mergeModuleCollections(persistedModules = [], latestModules = []) {
  const mergedPersistedModules = persistedModules.map((persistedModule) => {
    const latestModule =
      latestModules.find((module) => String(module.client_key || '') === String(persistedModule.client_key || '')) ||
      latestModules.find((module) => Number(module.id || 0) === Number(persistedModule.id || 0));

    if (!latestModule) {
      return persistedModule;
    }

    return {
      ...latestModule,
      ...persistedModule,
      id: persistedModule.id,
      client_key: persistedModule.client_key || latestModule.client_key || '',
      course_id: persistedModule.course_id,
      lessons: mergeLessonCollections(persistedModule.lessons || [], latestModule.lessons || []),
    };
  });

  const onlyLatestModules = latestModules.filter((latestModule) => {
    return !persistedModules.some(
      (persistedModule) =>
        String(persistedModule.client_key || '') === String(latestModule.client_key || '') ||
        (Number(persistedModule.id || 0) > 0 && Number(persistedModule.id || 0) === Number(latestModule.id || 0))
    );
  });

  return [...mergedPersistedModules, ...onlyLatestModules];
}

function mergeSectionCollections(persistedSections = [], latestSections = []) {
  const mergedPersistedSections = persistedSections.map((persistedSection) => {
    const latestSection =
      latestSections.find((section) => String(section.client_key || '') === String(persistedSection.client_key || '')) ||
      latestSections.find((section) => Number(section.id || 0) === Number(persistedSection.id || 0));

    if (!latestSection) {
      return persistedSection;
    }

    return {
      ...latestSection,
      ...persistedSection,
      id: persistedSection.id,
      client_key: persistedSection.client_key || latestSection.client_key || '',
      course_id: persistedSection.course_id,
      modules: latestSection.modules || persistedSection.modules || [],
    };
  });

  const onlyLatestSections = latestSections.filter((latestSection) => {
    return !persistedSections.some(
      (persistedSection) =>
        String(persistedSection.client_key || '') === String(latestSection.client_key || '') ||
        (Number(persistedSection.id || 0) > 0 && Number(persistedSection.id || 0) === Number(latestSection.id || 0))
    );
  });

  return [...mergedPersistedSections, ...onlyLatestSections];
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
    modules: sortByOrder(sectionModulesMap[String(section?.id || section?.client_key || '')] || []),
  }));
}

export default function CoursesScreen() {
  const bootstrap = getBootstrap();
  const appRoute = String(bootstrap.appRoute || '/app').replace(/\/$/, '');
  const initialSection = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('section') || 'courses' : 'courses';
  const [activeSection, setActiveSection] = useState(initialSection);
  const [searchValue, setSearchValue] = useState('');
  const [courses, setCourses] = useState([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [courseViewMode, setCourseViewMode] = useState('preview');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [savingKey, setSavingKey] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmState, setConfirmState] = useState(null);
  const selectedCourseRef = useRef(selectedCourse);
  const toastItems = [
    ...(error ? [{ id: 'courses-error', type: 'error', title: 'Falha na operacao', message: error }] : []),
    ...(message ? [{ id: 'courses-message', type: 'success', title: 'Tudo certo', message }] : []),
  ];

  const selectedCourseSummary = useMemo(
    () => courses.find((course) => Number(course.id) === Number(selectedCourseId)) || null,
    [courses, selectedCourseId]
  );
  const activeCourse = isCreatingNew ? null : selectedCourse || selectedCourseSummary || null;

  function buildAdminUtilityUrl(path) {
    const adminUrl = String(bootstrap.adminUrl || '/wp-admin/');
    const base = adminUrl.includes('admin.php') ? adminUrl.slice(0, adminUrl.indexOf('admin.php')) : adminUrl;
    return `${base.replace(/\/?$/, '/')}${path.replace(/^\//, '')}`;
  }

  const filteredCourses = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return courses;
    }

    return courses.filter((course) => {
      const haystack = [course.title, course.slug, course.excerpt, course.status, course.visibility].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [courses, searchValue]);

  function getCoursePlayerPreviewUrl(course) {
    if (course?.preview_entry_path) {
      return `${appRoute}${course.preview_entry_path}?preview=1`;
    }

    if (Number(course?.module_covers_enabled || 0) === 1 && course?.id) {
      return `${appRoute}/courses/${course.id}?preview=1`;
    }

    const firstLesson = (course?.modules || [])
      .filter((module) => module?.status !== 'archived')
      .flatMap((module) =>
        (module?.lessons || [])
          .filter((lesson) => lesson?.status !== 'archived')
          .sort((left, right) => Number(left?.sort_order || 0) - Number(right?.sort_order || 0))
      )[0];

    if (!firstLesson?.id) {
      return '';
    }

    return `${appRoute}/lessons/${firstLesson.id}?preview=1`;
  }

  async function loadCourses(options = {}) {
    const { autoSelectFirst = false, preferredCourseId = selectedCourseId } = options;
    setLoadingCourses(true);
    setError('');

    try {
      const data = await apiFetch('/courses');
      const nextCourses = (Array.isArray(data) ? data : []).filter((course) => course.status !== 'archived');
      setCourses(nextCourses);

      if (preferredCourseId && nextCourses.some((course) => Number(course.id) === Number(preferredCourseId))) {
        setSelectedCourseId(preferredCourseId);
        return nextCourses;
      }

      if (nextCourses.length && !isCreatingNew && autoSelectFirst) {
        setSelectedCourseId(nextCourses[0].id);
        return nextCourses;
      }

      if (!nextCourses.length) {
        setSelectedCourseId(null);
        setSelectedCourse(null);
      }

      return nextCourses;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoadingCourses(false);
    }
  }

  async function loadCourse(courseId) {
    if (!courseId) {
      setSelectedCourse(null);
      return null;
    }

    setLoadingCourse(true);

    try {
      const data = await apiFetch(`/courses/${courseId}`);
      if (data?.status === 'archived') {
        setSelectedCourse(null);
        selectedCourseRef.current = null;
        return null;
      }
      selectedCourseRef.current = data;
      setSelectedCourse(data);
      return data;
    } catch (err) {
      setError(err.message);
      setSelectedCourse(null);
      selectedCourseRef.current = null;
      return null;
    } finally {
      setLoadingCourse(false);
    }
  }

  useEffect(() => {
    loadCourses({ autoSelectFirst: false, preferredCourseId: null });
  }, []);

  useEffect(() => {
    selectedCourseRef.current = selectedCourse;
  }, [selectedCourse]);

  useEffect(() => {
    if (isCreatingNew) {
      setSelectedCourse(null);
      selectedCourseRef.current = null;
      return;
    }

    loadCourse(selectedCourseId);
  }, [isCreatingNew, selectedCourseId]);

  async function refreshSelectedCourse(courseId = selectedCourseId) {
    await loadCourses({ preferredCourseId: courseId });

    if (courseId) {
      return await loadCourse(courseId);
    }

    return null;
  }

  async function runAction(key, action, successMessage) {
    setSavingKey(key);
    setError('');
    setMessage('');

    try {
      const result = await action();
      if (successMessage) {
        setMessage(successMessage);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSavingKey('');
    }
  }

  async function handleConfirmDialog() {
    if (!confirmState?.onConfirm) {
      setConfirmState(null);
      return;
    }

    const action = confirmState.onConfirm;
    setConfirmState(null);
    await action();
  }

  async function handleCourseSave(payload, options = {}) {
    const wasCreatingNew = isCreatingNew;
    const successMessage = options.successMessage ?? (options.silentSuccess ? '' : 'Curso salvo com sucesso.');
    const actionKey = options.actionKey || 'course-save';

    return runAction(actionKey, async () => {
      void traceCourseBuilder('course-save-start', {
        courseId: payload?.id || 0,
        isCreatingNew: wasCreatingNew,
        moduleCount: (payload.modules || []).length,
      });
      const latestModules = typeof options.getLatestModules === 'function' ? options.getLatestModules() : payload.modules || [];
      const latestSections = typeof options.getLatestSections === 'function' ? options.getLatestSections() : payload.sections || [];
      const editingCourseId = isPersistedId(payload?.id) ? Number(payload.id) : 0;
      const endpoint = editingCourseId ? `/courses/${editingCourseId}` : '/courses';
      const method = editingCourseId ? 'PUT' : 'POST';
      const response = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(normalizeCoursePayload(payload)),
      });

      const courseId = Number(response.id);
      const orderedSections = sortByOrder(payload.sections || []);
      const orderedModules = sortByOrder(payload.modules || []);
      const persistedSections = [];
      const persistedModules = [];
      const selectedSections = sortByOrder(selectedCourseRef.current?.sections || []);
      const selectedModules = sortByOrder(selectedCourseRef.current?.modules || []);

      for (let sectionIndex = 0; sectionIndex < orderedSections.length; sectionIndex += 1) {
        const section = orderedSections[sectionIndex];
        const matchingSelectedSection = findMatchingCollectionItem(section, selectedSections);

        if (section.status === 'archived') {
          const archivedSectionId = isPersistedId(section.id) ? Number(section.id) : Number(matchingSelectedSection?.id || 0);

          if (archivedSectionId) {
            await apiFetch(`/sections/${archivedSectionId}`, { method: 'DELETE' });
          }
          continue;
        }

        let sectionId = isPersistedId(section.id) ? Number(section.id) : Number(matchingSelectedSection?.id || 0);
        let persistedSectionData = null;

        if (sectionId) {
          persistedSectionData = await apiFetch(`/sections/${sectionId}`, {
            method: 'PUT',
            body: JSON.stringify(normalizeSectionPayload(section, sectionIndex)),
          });
        } else {
          persistedSectionData = await apiFetch(`/courses/${courseId}/sections`, {
            method: 'POST',
            body: JSON.stringify(normalizeSectionPayload(section, sectionIndex)),
          });
          sectionId = Number(persistedSectionData?.id || 0);
        }

        if (!sectionId || !persistedSectionData?.id) {
          throw new Error('Nao foi possivel confirmar a persistencia da sessão.');
        }

        persistedSections.push({
          ...section,
          ...(persistedSectionData || {}),
          id: sectionId,
          course_id: courseId,
          client_key: section.client_key || (!isPersistedId(section.id) ? section.id : ''),
        });
      }

      for (let moduleIndex = 0; moduleIndex < orderedModules.length; moduleIndex += 1) {
        const module = orderedModules[moduleIndex];
        const matchingSelectedModule = findMatchingCollectionItem(module, selectedModules);

        if (module.status === 'archived') {
          const archivedModuleId = isPersistedId(module.id) ? Number(module.id) : Number(matchingSelectedModule?.id || 0);

          if (archivedModuleId) {
            await apiFetch(`/modules/${archivedModuleId}`, { method: 'DELETE' });
          }
          continue;
        }

        let moduleId = isPersistedId(module.id) ? Number(module.id) : Number(matchingSelectedModule?.id || 0);
        let persistedModuleData = null;
        const matchingPersistedSection =
          persistedSections.find((section) => String(section.client_key || '') === String(module.section_id || '')) ||
          persistedSections.find((section) => Number(section.id || 0) === Number(module.section_id || 0)) ||
          null;
        const normalizedSectionId = Number(matchingPersistedSection?.id || module.section_id || matchingSelectedModule?.section_id || 0);
        const normalizedModulePayload = normalizeModulePayload(
          {
            ...module,
            section_id: normalizedSectionId || 0,
          },
          moduleIndex
        );

        if (moduleId) {
          void traceCourseBuilder('module-update', {
            moduleId,
            moduleIndex,
            lessonCount: (module.lessons || []).length,
          });
          persistedModuleData = await apiFetch(`/modules/${moduleId}`, {
            method: 'PUT',
            body: JSON.stringify(normalizedModulePayload),
          });
        } else {
          void traceCourseBuilder('module-create', {
            tempModuleId: module.id,
            moduleIndex,
            lessonCount: (module.lessons || []).length,
          });
          const createdModule = await apiFetch(`/courses/${courseId}/modules`, {
            method: 'POST',
            body: JSON.stringify(normalizedModulePayload),
          });
          moduleId = Number(createdModule.id);
          persistedModuleData = createdModule;
        }

        if (!moduleId || !persistedModuleData?.id) {
          throw new Error('Nao foi possivel confirmar a persistencia do módulo.');
        }

        const orderedLessons = sortByOrder(module.lessons || []);
        const persistedLessons = [];
        const selectedLessons = sortByOrder(matchingSelectedModule?.lessons || []);

        for (let lessonIndex = 0; lessonIndex < orderedLessons.length; lessonIndex += 1) {
          const lesson = orderedLessons[lessonIndex];
          const matchingSelectedLesson = findMatchingCollectionItem(lesson, selectedLessons);
          const existingLessonId = isPersistedId(lesson.id) ? Number(lesson.id) : Number(matchingSelectedLesson?.id || 0);

          if (lesson.status === 'archived') {
            if (existingLessonId) {
              await apiFetch(`/lessons/${existingLessonId}`, { method: 'DELETE' });
            }
            continue;
          }

          if (isBlankDraftLesson(lesson)) {
            continue;
          }

          const lessonPayload = normalizeLessonPayload(lesson, lessonIndex);
          let persistedLessonData = null;

          if (existingLessonId) {
            void traceCourseBuilder('lesson-update', {
              lessonId: existingLessonId,
              moduleId,
              lessonIndex,
            });
            persistedLessonData = await apiFetch(`/lessons/${existingLessonId}`, {
              method: 'PUT',
              body: JSON.stringify(lessonPayload),
            });
          } else {
            void traceCourseBuilder('lesson-create', {
              tempLessonId: lesson.id,
              moduleId,
              lessonIndex,
            });
            persistedLessonData = await apiFetch(`/modules/${moduleId}/lessons`, {
              method: 'POST',
              body: JSON.stringify(lessonPayload),
            });
          }

          if (!persistedLessonData?.id) {
            throw new Error(`Nao foi possivel confirmar a persistencia da aula "${lesson.title || `#${lessonIndex + 1}`}".`);
          }

          persistedLessons.push({
            ...lesson,
            ...(persistedLessonData || {}),
            id: Number(persistedLessonData?.id || existingLessonId || lesson.id),
            module_id: moduleId,
            client_key: lesson.client_key || matchingSelectedLesson?.client_key || (!isPersistedId(lesson.id) ? lesson.id : ''),
          });
        }

        persistedModules.push({
          ...module,
          ...(persistedModuleData || {}),
          id: moduleId,
          course_id: courseId,
          section_id: normalizedSectionId || 0,
          client_key: module.client_key || (!isPersistedId(module.id) ? module.id : ''),
          lessons: persistedLessons,
        });
      }

      const nextStats = summarizeModules(persistedModules.length ? persistedModules : payload.modules || response.modules || []);
      const finalModules = mergeModuleCollections(persistedModules, latestModules);
      const finalSections = attachModulesToSections(mergeSectionCollections(persistedSections, latestSections), finalModules);
      const finalStats = summarizeModules(finalModules.length ? finalModules : persistedModules);

      setIsCreatingNew(false);
      setSelectedCourseId(courseId);
      setCourseViewMode('edit');

      if (options.skipCatalogRefresh && !wasCreatingNew) {
        const mergedCourse = {
          ...(selectedCourseRef.current || {}),
          ...response,
          ...payload,
          id: courseId,
          module_covers_enabled: payload.module_covers_enabled ? 1 : 0,
          stats: finalStats.modules || finalStats.lessons ? finalStats : nextStats,
          sections: finalSections,
          modules: finalModules.length ? finalModules : persistedModules,
        };

        void traceCourseBuilder('course-save-finish', {
          courseId,
          mode: 'single-refresh',
          moduleCount: (finalModules.length ? finalModules : persistedModules).length,
        });

        selectedCourseRef.current = mergedCourse;
        setSelectedCourse(mergedCourse);
        setCourses((current) =>
          current.map((course) => (Number(course.id) === courseId ? { ...course, ...mergedCourse, stats: mergedCourse.stats } : course))
        );
        return mergedCourse;
      }

      const refreshedCourse = await refreshSelectedCourse(courseId);
      selectedCourseRef.current = refreshedCourse;
      void traceCourseBuilder('course-save-finish', {
        courseId,
        mode: 'full-refresh',
        moduleCount: refreshedCourse?.modules?.length || 0,
      });
      return refreshedCourse;
    }, successMessage);
  }

  function handleNewCourse() {
    setActiveSection('courses');
    setIsCreatingNew(true);
    setCourseViewMode('edit');
    setSelectedCourseId(null);
    setSelectedCourse(null);
    selectedCourseRef.current = null;
    setMessage('');
    setError('');
  }

  function handleEditCourse() {
    if (!activeCourse?.id) {
      return;
    }

    setIsCreatingNew(false);
    setCourseViewMode('edit');
    setMessage('');
    setError('');
  }

  function handleCancelEdit() {
    setMessage('');
    setError('');

    if (isCreatingNew) {
      setIsCreatingNew(false);
      setCourseViewMode('preview');
      loadCourses({ autoSelectFirst: true });
      return;
    }

    setCourseViewMode('preview');
    refreshSelectedCourse(selectedCourseId);
  }

  function handleRequestDeleteCourse(course) {
    if (!course?.id) {
      return;
    }

    const moduleCount = Number(course.stats?.modules || 0);
    const lessonCount = Number(course.stats?.lessons || 0);

    setConfirmState({
      title: 'Apagar curso?',
      description: 'Tem certeza que deseja apagar o curso',
      highlight: course.title || 'sem título',
      details: `${moduleCount} ${moduleCount === 1 ? 'módulo' : 'módulos'} • ${lessonCount} ${lessonCount === 1 ? 'aula' : 'aulas'}`,
      confirmLabel: 'Apagar curso',
      tone: 'danger',
      onConfirm: async () => {
        await runAction(`course-delete-${course.id}`, async () => {
          await apiFetch(`/courses/${course.id}`, { method: 'DELETE' });

          if (Number(selectedCourseId) === Number(course.id)) {
            setSelectedCourse(null);
            selectedCourseRef.current = null;
            setSelectedCourseId(null);
            setIsCreatingNew(false);
            setCourseViewMode('preview');
            await loadCourses({ autoSelectFirst: true, preferredCourseId: null });
            return;
          }

          await loadCourses({ preferredCourseId: selectedCourseId });
        }, 'Curso apagado com sucesso.');
      },
    });
  }

  function handleSectionChange(nextSection) {
    setActiveSection(nextSection);
    setMessage('');
    setError('');
    setSearchValue('');
    if (nextSection !== 'courses') {
      setIsCreatingNew(false);
      setCourseViewMode('preview');
    }
  }

  function renderCoursesSection() {
    return (
      <section className="fm-admin-section">
        <ToastStack
          items={toastItems}
          onDismiss={(id) => {
            if (id === 'courses-error') {
              setError('');
            }
            if (id === 'courses-message') {
              setMessage('');
            }
          }}
        />

        <div className={`fm-courses-layout ${isCreatingNew ? 'is-creating' : ''}`}>
          <CourseCatalog
            courses={filteredCourses}
            loading={loadingCourses}
            onCreate={handleNewCourse}
            onDelete={handleRequestDeleteCourse}
            onEdit={(courseId) => {
              setIsCreatingNew(false);
              setSelectedCourseId(courseId);
              setCourseViewMode('edit');
              setMessage('');
              setError('');
            }}
            onOpen={(courseId) => {
              setIsCreatingNew(false);
              setCourseViewMode('preview');
              setSelectedCourseId(courseId);
            }}
            onSearch={setSearchValue}
            searchValue={searchValue}
            selectedCourseId={selectedCourseId}
            totalCoursesCount={courses.length}
          />

          <CourseWorkspace
            activeCourse={activeCourse}
            hasCourses={courses.length > 0}
            isEditing={courseViewMode === 'edit'}
            isCreatingNew={isCreatingNew}
            loading={loadingCourse}
            onCancel={handleCancelEdit}
            onEdit={handleEditCourse}
            previewUrl={getCoursePlayerPreviewUrl(activeCourse)}
            onPublishComplete={() => setCourseViewMode('preview')}
            onSubmit={handleCourseSave}
            saving={savingKey === 'course-save'}
          />
        </div>
      </section>
    );
  }

  function renderPlaceholder() {
    return null;
  }

  function handleCreateAction() {
    if (activeSection === 'students') {
      window.open(buildAdminUtilityUrl('user-new.php'), '_blank', 'noopener,noreferrer');
      return;
    }

    handleNewCourse();
  }

  function handleOpenAllStudents() {
    window.open(buildAdminUtilityUrl('users.php'), '_blank', 'noopener,noreferrer');
  }

  function renderLazySection(children) {
    return children;
  }

  return (
    <>
      {renderCoursesSection()}

      <ConfirmDialog
        confirmLabel={confirmState?.confirmLabel || 'Confirmar'}
        description={confirmState?.description || ''}
        details={confirmState?.details || ''}
        highlight={confirmState?.highlight || ''}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirmDialog}
        open={Boolean(confirmState)}
        title={confirmState?.title || 'Confirmar acao'}
        tone={confirmState?.tone || 'danger'}
      />
    </>
  );
}
