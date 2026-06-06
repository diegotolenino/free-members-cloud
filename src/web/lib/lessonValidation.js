function getItemRef(item = {}) {
  return item?.client_key || item?.id || '';
}

export function getLessonValidationState(lesson = {}) {
  const missingFields = {
    title: !String(lesson?.title || '').trim(),
    content_url: !String(lesson?.content_url || '').trim(),
  };

  const missingCount = Number(missingFields.title) + Number(missingFields.content_url);

  if (!missingCount) {
    return {
      isValid: true,
      message: '',
      missingFields,
      focusField: '',
    };
  }

  if (missingCount === 2) {
    return {
      isValid: false,
      message: 'Preencha o nome e o link do vídeo desta aula antes de continuar.',
      missingFields,
      focusField: 'title',
    };
  }

  if (missingFields.title) {
    return {
      isValid: false,
      message: 'Preencha o nome da aula antes de continuar.',
      missingFields,
      focusField: 'title',
    };
  }

  return {
    isValid: false,
    message: 'Preencha o link do vídeo desta aula antes de continuar.',
    missingFields,
    focusField: 'content_url',
  };
}

export function hasMeaningfulLessonData(lesson = {}) {
  const hasTitle = Boolean(String(lesson?.title || '').trim());
  const hasExcerpt = Boolean(String(lesson?.excerpt || '').replace(/<[^>]*>/g, '').trim());
  const hasContentUrl = Boolean(String(lesson?.content_url || '').trim());
  const hasMaterials = Array.isArray(lesson?.materials) && lesson.materials.some((item) => item?.status !== 'archived' && (item?.title || item?.url));

  return hasTitle || hasExcerpt || hasContentUrl || hasMaterials;
}

export function validateStructureForPersist(modules = []) {
  const activeModules = (modules || []).filter((module) => module?.status !== 'archived');

  if (!activeModules.length) {
    return {
      isValid: false,
      message: 'Adicione ao menos um módulo antes de avançar.',
      moduleRef: '',
      lessonRef: '',
      missingFields: null,
      focusField: '',
    };
  }

  const activeLessons = activeModules.flatMap((module) => (module?.lessons || []).filter((lesson) => lesson?.status !== 'archived'));

  if (!activeLessons.length) {
    return {
      isValid: false,
      message: 'Adicione ao menos uma aula antes de avançar.',
      moduleRef: '',
      lessonRef: '',
      missingFields: null,
      focusField: '',
    };
  }

  for (const module of activeModules) {
    if (String(module?.title || '').trim().length < 2) {
      return {
        isValid: false,
        message: 'Cada módulo precisa ter pelo menos 2 caracteres no nome antes de avançar.',
        moduleRef: getItemRef(module),
        lessonRef: '',
        missingFields: null,
        focusField: 'moduleTitle',
      };
    }

    const moduleLessons = (module?.lessons || []).filter((lesson) => lesson?.status !== 'archived');

    for (const lesson of moduleLessons) {
      const validation = getLessonValidationState(lesson);

      if (!validation.isValid) {
        return {
          ...validation,
          moduleRef: getItemRef(module),
          lessonRef: getItemRef(lesson),
        };
      }
    }
  }

  return {
    isValid: true,
    message: '',
    moduleRef: '',
    lessonRef: '',
    missingFields: null,
    focusField: '',
  };
}
