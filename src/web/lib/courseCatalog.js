export const INITIAL_COURSE_CATALOG_LIMIT = 5;

export function getCourseCatalogViewState({
  courses = [],
  expanded = false,
  totalCoursesCount = 0,
  limit = INITIAL_COURSE_CATALOG_LIMIT,
} = {}) {
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeLimit = Math.max(1, Number(limit || INITIAL_COURSE_CATALOG_LIMIT));
  const hasAnyCourses = Number(totalCoursesCount || 0) > 0;
  const hasVisibleCourses = safeCourses.length > 0;
  const shouldTruncate = hasVisibleCourses && safeCourses.length > safeLimit && !expanded;
  const visibleCourses = shouldTruncate ? safeCourses.slice(0, safeLimit) : safeCourses;
  const showToggleButton = hasVisibleCourses && safeCourses.length > safeLimit;

  return {
    hasAnyCourses,
    hasVisibleCourses,
    showToggleButton,
    toggleLabel: expanded ? 'Mostrar menos' : 'Ver todos os cursos',
    visibleCourses,
  };
}
