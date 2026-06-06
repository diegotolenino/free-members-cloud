import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import Icon from './Icons';

function statusLabel(status) {
  if (status === 'published') {
    return 'Publicado';
  }

  if (status === 'archived') {
    return 'Arquivado';
  }

  return 'Em configuração';
}

function stripHtml(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getDescription(course) {
  return stripHtml(course?.description || course?.excerpt || '');
}

function getStats(course) {
  const modulesFromStats = Number(course?.stats?.modules || 0);
  const lessonsFromStats = Number(course?.stats?.lessons || 0);

  if (modulesFromStats || lessonsFromStats) {
    return {
      modules: modulesFromStats,
      lessons: lessonsFromStats,
    };
  }

  const activeModules = (course?.modules || []).filter((module) => module.status !== 'archived');
  const activeLessons = activeModules.flatMap((module) => (module.lessons || []).filter((lesson) => lesson.status !== 'archived'));

  return {
    modules: activeModules.length,
    lessons: activeLessons.length,
  };
}

function getDuration(course) {
  const activeModules = (course?.modules || []).filter((module) => module.status !== 'archived');
  const activeLessons = activeModules.flatMap((module) => (module.lessons || []).filter((lesson) => lesson.status !== 'archived'));
  const totalSeconds = activeLessons.reduce((sum, lesson) => sum + Number(lesson.duration_seconds || 0), 0);

  if (!totalSeconds) {
    return '--';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes} min`;
}

function formatLastUpdate(value) {
  if (!value) {
    return '--';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  const now = new Date();
  const isSameDay =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate();

  const time = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  if (isSameDay) {
    return `Hoje, ${time}`;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function getEnrollmentCount(course) {
  return course?.stats?.students ?? course?.stats?.enrollments ?? null;
}

function titleClassName(title) {
  const length = String(title || '').trim().length;

  if (length > 0 && length <= 10) {
    return 'is-short';
  }

  if (length > 34) {
    return 'is-long';
  }

  if (length > 22) {
    return 'is-medium';
  }

  return '';
}

/**
 * Detects whether a clamped element is actually truncated (text hidden by
 * line-clamp / overflow). Re-measures on resize and whenever `text` changes.
 */
function useIsTruncated(ref, text) {
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    let frameId = 0;

    function measureNaturalHeight(element) {
      const computedStyle = window.getComputedStyle(element);
      const clone = element.cloneNode(true);
      const { width } = element.getBoundingClientRect();

      clone.removeAttribute('id');
      clone.style.position = 'absolute';
      clone.style.left = '-99999px';
      clone.style.top = '0';
      clone.style.visibility = 'hidden';
      clone.style.pointerEvents = 'none';
      clone.style.zIndex = '-1';
      clone.style.width = `${width}px`;
      clone.style.minWidth = `${width}px`;
      clone.style.maxWidth = `${width}px`;
      clone.style.height = 'auto';
      clone.style.minHeight = '0';
      clone.style.maxHeight = 'none';
      clone.style.overflow = 'visible';
      clone.style.display = 'block';
      clone.style.webkitLineClamp = 'unset';
      clone.style.webkitBoxOrient = 'unset';
      clone.style.contain = 'layout style paint';
      clone.style.font = computedStyle.font;
      clone.style.fontFamily = computedStyle.fontFamily;
      clone.style.fontSize = computedStyle.fontSize;
      clone.style.fontWeight = computedStyle.fontWeight;
      clone.style.fontStyle = computedStyle.fontStyle;
      clone.style.lineHeight = computedStyle.lineHeight;
      clone.style.letterSpacing = computedStyle.letterSpacing;
      clone.style.textTransform = computedStyle.textTransform;
      clone.style.wordBreak = computedStyle.wordBreak;
      clone.style.overflowWrap = computedStyle.overflowWrap;
      clone.style.whiteSpace = computedStyle.whiteSpace;
      clone.style.padding = computedStyle.padding;
      clone.style.border = computedStyle.border;
      clone.style.boxSizing = computedStyle.boxSizing;
      clone.style.margin = '0';

      document.body.appendChild(clone);
      const naturalHeight = clone.getBoundingClientRect().height;
      clone.remove();

      return naturalHeight;
    }

    function measure() {
      const element = ref.current;

      if (!element) {
        setTruncated(false);
        return;
      }

      const clampedHeight = element.getBoundingClientRect().height;
      const naturalHeight = measureNaturalHeight(element);

      // Compare the visible clamped box against an off-DOM clone measured with
      // the same computed typography. This avoids false positives on short
      // titles caused by mutating the live clamped node.
      setTruncated(naturalHeight - clampedHeight > 1);
    }

    function scheduleMeasure() {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        measure();
      });
    }

    scheduleMeasure();

    let resizeObserver = null;

    if (typeof ResizeObserver !== 'undefined' && ref.current) {
      resizeObserver = new ResizeObserver(() => scheduleMeasure());
      resizeObserver.observe(ref.current);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', scheduleMeasure);
    }

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => scheduleMeasure()).catch(() => {});
    }

    return () => {
      resizeObserver?.disconnect();

      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', scheduleMeasure);
      }
    };
  }, [ref, text]);

  return truncated;
}

/**
 * Renders the hero title/description with a max line count and, only when the
 * text is genuinely cut off, a glassmorphism tooltip showing the full content.
 */
function ClampedText({ as: Tag = 'p', className, placement, text }) {
  const ref = useRef(null);
  const tooltipId = useId();
  const truncated = useIsTruncated(ref, text);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!truncated && visible) {
      setVisible(false);
    }
  }, [truncated, visible]);

  const show = truncated && visible;

  return (
    <span
      className={`fm-hero-clamp ${truncated ? 'is-truncated' : ''} ${show ? 'is-tooltip-visible' : ''}`}
      onMouseEnter={() => setVisible(truncated)}
      onMouseLeave={() => setVisible(false)}
    >
      <Tag
        aria-describedby={show ? tooltipId : undefined}
        className={className}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible((current) => (truncated ? !current : false))}
        onFocus={() => setVisible(truncated)}
        ref={ref}
        tabIndex={truncated ? 0 : undefined}
      >
        {text}
      </Tag>

      {truncated ? (
        <span
          aria-hidden={!show}
          className={`fm-hero-tooltip fm-hero-tooltip--${placement} ${show ? 'is-visible' : ''}`}
          id={tooltipId}
          role="tooltip"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

export default function SelectedCourseHero({ course, onEdit, previewUrl = '' }) {
  const coverImage = course?.cover_image_url || course?.cover_image_thumb_url || '';
  const title = course?.title || 'Curso sem título';
  const description = getDescription(course);
  const stats = useMemo(() => getStats(course), [course]);
  const duration = useMemo(() => getDuration(course), [course]);
  const lastUpdate = useMemo(() => formatLastUpdate(course?.updated_at || course?.created_at || ''), [course]);
  const students = useMemo(() => getEnrollmentCount(course), [course]);
  const backgroundStyle = coverImage ? { backgroundImage: `url(${coverImage})` } : undefined;

  return (
    <section className="fm-selected-course-hero">
      <div className="fm-selected-course-hero__banner">
        <div className="fm-selected-course-hero__backdrop" style={backgroundStyle} aria-hidden="true" />
        <div className="fm-selected-course-hero__glow" aria-hidden="true" />

        <div className="fm-selected-course-hero__banner-layout">
          <div className="fm-selected-course-hero__content">
            <span className={`fm-selected-course-hero__status is-${course?.status || 'draft'}`}>
              <span className="fm-selected-course-hero__status-dot" aria-hidden="true" />
              {statusLabel(course?.status)}
            </span>

            <div className="fm-selected-course-hero__content-main">
              <ClampedText
                as="h2"
                className={`fm-selected-course-hero__title ${titleClassName(title)}`.trim()}
                placement="title"
                text={title}
              />

              <span className="fm-selected-course-hero__divider" aria-hidden="true" />

              {description ? (
                <ClampedText
                  as="p"
                  className="fm-selected-course-hero__description"
                  placement="description"
                  text={description}
                />
              ) : null}
            </div>

            <div className="fm-selected-course-hero__stats">
              <div className="fm-selected-course-hero__stat">
                <span className="fm-selected-course-hero__stat-icon">
                  <Icon className="fm-selected-course-hero__stat-symbol is-modules" name="layers" size={22} />
                </span>
                <div className="fm-selected-course-hero__stat-copy">
                  <strong>{stats.modules}</strong>
                  <span>módulos</span>
                </div>
              </div>

              <div className="fm-selected-course-hero__stat">
                <span className="fm-selected-course-hero__stat-icon is-accent">
                  <Icon className="fm-selected-course-hero__stat-symbol is-lessons" name="play" size={22} />
                </span>
                <div className="fm-selected-course-hero__stat-copy">
                  <strong>{stats.lessons}</strong>
                  <span>aulas</span>
                </div>
              </div>

              <a
                aria-label="Abrir conteúdo do curso"
                className="fm-selected-course-hero__play"
                href={previewUrl || '#'}
                onClick={(event) => {
                  if (!previewUrl) {
                    event.preventDefault();
                  }
                }}
                rel="noopener noreferrer"
                target="_blank"
                title="Ver aulas e conteúdo do curso"
              >
                <span className="fm-selected-course-hero__play-ring" aria-hidden="true">
                  <Icon name="play" size={26} />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="fm-selected-course-summary">
        <div className="fm-selected-course-summary__item">
          <span className="fm-selected-course-summary__icon is-pink" aria-hidden="true">
            <Icon name="calendar" size={20} />
          </span>
          <div className="fm-selected-course-summary__copy">
            <strong>Última atualização</strong>
            <span>{lastUpdate}</span>
          </div>
        </div>

        <div className="fm-selected-course-summary__item">
          <span className="fm-selected-course-summary__icon is-amber" aria-hidden="true">
            <Icon name="clock" size={20} />
          </span>
          <div className="fm-selected-course-summary__copy">
            <strong>Duração total</strong>
            <span>{duration}</span>
          </div>
        </div>

        <div className="fm-selected-course-summary__item">
          <span className="fm-selected-course-summary__icon is-green" aria-hidden="true">
            <Icon name="students" size={20} />
          </span>
          <div className="fm-selected-course-summary__copy">
            <strong>Alunos inscritos</strong>
            <span>{students ?? '--'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
