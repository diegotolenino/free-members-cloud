import React from 'react';
import Icon from './Icons';

const tabIcons = {
  overview: 'courses',
  structure: 'module',
  appearance: 'appearance',
  settings: 'settings',
};

export default function CourseTabs({ activeTab, onChange, tabs }) {
  return (
    <div className="fm-editor-tabs" role="tablist">
      <div className="fm-editor-tabs__list">
        {tabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? 'is-active' : ''}
            disabled={tab.disabled}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            type="button"
          >
            <span className="fm-editor-tabs__icon" aria-hidden="true">
              <Icon name={tabIcons[tab.id] || 'settings'} size={16} />
            </span>
            <span>{tab.label}</span>
            {tab.badge ? <small>{tab.badge}</small> : null}
          </button>
        ))}
      </div>

      <button aria-label="Mais opcoes" className="fm-editor-tabs__more" type="button">
        <Icon name="more" size={18} />
      </button>
    </div>
  );
}
