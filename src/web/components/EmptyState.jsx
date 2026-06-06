import React from 'react';
import Icon from './Icons';

export default function EmptyState({ action, compact = false, description, eyebrow, icon = 'courses', title }) {
  return (
    <div className={`fm-empty-state ${compact ? 'is-compact' : ''}`}>
      <div className="fm-empty-state__orb" aria-hidden="true" />
      <div className="fm-empty-state__icon" aria-hidden="true">
        <Icon name={icon} size={24} />
      </div>
      <div className="fm-empty-state__content">
        {eyebrow ? <p className="fm-admin-kicker">{eyebrow}</p> : null}
        <h4>{title}</h4>
        <p>{description}</p>
        {action}
      </div>
    </div>
  );
}
