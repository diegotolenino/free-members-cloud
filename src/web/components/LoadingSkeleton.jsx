import React from 'react';

export function MetricsSkeleton() {
  return (
    <div className="fm-metrics-grid">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="fm-skeleton-card is-metric" key={index} />
      ))}
    </div>
  );
}

export function CourseGridSkeleton() {
  return (
    <div className="fm-course-grid">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="fm-skeleton-card" key={index} />
      ))}
    </div>
  );
}

export function WorkspaceSkeleton() {
  return <div className="fm-editor-skeleton" />;
}
