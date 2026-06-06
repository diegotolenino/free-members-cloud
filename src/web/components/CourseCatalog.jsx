import React, { useEffect, useId, useRef, useState } from 'react';
import EmptyState from './EmptyState';
import Icon from './Icons';
import { CourseGridSkeleton } from './LoadingSkeleton';
import { getCourseCatalogViewState } from '../lib/courseCatalog';

function CourseListItemMenu({ course, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleOutside(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <div className="fm-course-list-item__menu-wrap" ref={wrapRef}>
      <button
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Mais ações do curso"
        className={`fm-course-list-item__menu ${open ? 'is-open' : ''}`}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        type="button"
      >
        <Icon name="more" size={16} />
      </button>

      {open ? (
        <div className="fm-course-menu" role="menu">
          <button
            onClick={() => {
              setOpen(false);
              onEdit(course.id);
            }}
            role="menuitem"
            type="button"
          >
            <Icon name="edit" size={16} />
            <span>Editar curso</span>
          </button>
          <div className="fm-course-menu__divider" aria-hidden="true" />
          <button
            className="is-danger"
            onClick={() => {
              setOpen(false);
              onDelete(course);
            }}
            role="menuitem"
            type="button"
          >
            <Icon name="trash" size={16} />
            <span>Apagar curso</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function getCourseInitials(title = '') {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() || '')
    .join('');
}

function statusLabel(status) {
  if (status === 'published') {
    return 'Publicado';
  }

  if (status === 'archived') {
    return 'Arquivado';
  }

  return 'Rascunho';
}

function CourseListItem({ course, isActive, onEdit, onOpen, onDelete }) {
  const imageUrl = course.cover_image_thumb_url || course.cover_image_url || '';
  const moduleCount = Number(course.stats?.modules || 0);
  const lessonCount = Number(course.stats?.lessons || 0);
  const titleRef = useRef(null);
  const tooltipId = useId();
  const [isTitleTruncated, setIsTitleTruncated] = useState(false);
  const [showTitleTooltip, setShowTitleTooltip] = useState(false);

  useEffect(() => {
    function updateTruncationState() {
      const titleElement = titleRef.current;

      if (!titleElement) {
        setIsTitleTruncated(false);
        return;
      }

      const hasOverflowY = titleElement.scrollHeight - titleElement.clientHeight > 1;
      const hasOverflowX = titleElement.scrollWidth - titleElement.clientWidth > 1;
      setIsTitleTruncated(hasOverflowY || hasOverflowX);
    }

    updateTruncationState();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateTruncationState);
    }

    let resizeObserver = null;

    if (typeof ResizeObserver !== 'undefined' && titleRef.current) {
      resizeObserver = new ResizeObserver(() => updateTruncationState());
      resizeObserver.observe(titleRef.current);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateTruncationState);
      }

      resizeObserver?.disconnect();
    };
  }, [course.title]);

  useEffect(() => {
    if (!isTitleTruncated && showTitleTooltip) {
      setShowTitleTooltip(false);
    }
  }, [isTitleTruncated, showTitleTooltip]);

  return (
    <article
      className={`fm-course-list-item ${isActive ? 'is-active' : ''} ${showTitleTooltip ? 'is-tooltip-visible' : ''}`}
      onMouseLeave={() => setShowTitleTooltip(false)}
    >
      <button
        aria-describedby={showTitleTooltip && isTitleTruncated ? tooltipId : undefined}
        className="fm-course-list-item__main"
        onBlur={() => setShowTitleTooltip(false)}
        onClick={() => onOpen(course.id)}
        type="button"
      >
        {imageUrl ? (
          <img alt="" className="fm-course-list-item__image" src={imageUrl} />
        ) : (
          <div className="fm-course-list-item__thumb" aria-hidden="true">
            <div className="fm-course-list-item__thumb-badge">
              <Icon name="courses" size={14} />
            </div>
            <span>{getCourseInitials(course.title)}</span>
          </div>
        )}

        <div className="fm-course-list-item__content">
          <strong
            ref={titleRef}
            className="fm-course-list-item__title"
            onFocus={() => setShowTitleTooltip(isTitleTruncated)}
            onMouseEnter={() => setShowTitleTooltip(isTitleTruncated)}
            tabIndex={isTitleTruncated ? 0 : undefined}
          >
            {course.title}
          </strong>
          <div className="fm-course-list-item__meta">
            <span>{moduleCount} módulos</span>
            <span aria-hidden="true">•</span>
            <span>{lessonCount} aulas</span>
          </div>
        </div>
      </button>

      {isTitleTruncated ? (
        <div
          aria-hidden={!showTitleTooltip}
          className={`fm-course-list-item__title-tooltip ${showTitleTooltip ? 'is-visible' : ''}`}
          id={tooltipId}
          role="tooltip"
        >
          {course.title}
        </div>
      ) : null}

      <CourseListItemMenu course={course} onDelete={onDelete} onEdit={onEdit} />
    </article>
  );
}

export default function CourseCatalog({
  courses,
  loading,
  onCreate,
  onDelete,
  onEdit,
  onOpen,
  onSearch,
  searchValue,
  selectedCourseId,
  totalCoursesCount = 0,
}) {
  const [expanded, setExpanded] = useState(false);
  const { hasAnyCourses, showToggleButton, toggleLabel, visibleCourses } = getCourseCatalogViewState({
    courses,
    expanded,
    totalCoursesCount,
  });

  useEffect(() => {
    setExpanded(false);
  }, [totalCoursesCount, courses]);

  return (
    <section className="fm-courses-catalog fm-surface-card">
      <div className="fm-catalog-header">
        <div className="fm-catalog-header__title">
          <span className="fm-catalog-header__icon" aria-hidden="true">
            <Icon name="courseLibrary" size={18} />
          </span>
          <h3>Seus cursos</h3>
        </div>
        {hasAnyCourses ? (
          <button className="fm-button fm-button--gradient" onClick={onCreate} type="button">
            <Icon name="plus" size={16} />
            <span>Novo curso</span>
          </button>
        ) : null}
      </div>

      {hasAnyCourses ? (
        <label className="fm-catalog-search">
          <span aria-hidden="true">
            <Icon name="search" size={16} />
          </span>
          <input onChange={(event) => onSearch(event.target.value)} placeholder="Buscar curso..." value={searchValue} />
        </label>
      ) : null}

      {loading ? <CourseGridSkeleton /> : null}

      {!loading && !hasAnyCourses ? (
        <div className="fm-catalog-first-course">
          <button className="fm-button fm-button--gradient" onClick={onCreate} type="button">
            <Icon name="plus" size={16} />
            <span>Crie seu primeiro curso</span>
          </button>
        </div>
      ) : null}

      {!loading && hasAnyCourses && !courses.length ? (
        <EmptyState
          compact
          description="Tente outro termo de busca."
          icon="courses"
          title="Nenhum curso encontrado"
        />
      ) : null}

      {!loading && visibleCourses.length ? (
        <div className="fm-course-list">
          {visibleCourses.map((course) => (
            <CourseListItem
              course={course}
              isActive={Number(selectedCourseId) === Number(course.id)}
              key={course.id}
              onDelete={onDelete}
              onEdit={onEdit}
              onOpen={onOpen}
            />
          ))}
        </div>
      ) : null}

      {!loading && showToggleButton ? (
        <button
          aria-expanded={expanded}
          className="fm-catalog-footer-button"
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          {toggleLabel}
        </button>
      ) : null}
    </section>
  );
}
