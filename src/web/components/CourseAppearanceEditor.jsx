import React, { useEffect, useMemo, useRef, useState } from 'react';
import InternalLibraryModal from './InternalLibraryModal';
import Icon from './Icons';
import { buildAppearanceRows, normalizeAppearanceSettings } from '../lib/courseAppearance';

const BANNER_STYLE_OPTIONS = [
  { id: 'compact', label: 'Compacto' },
  { id: 'standard', label: 'Padrão' },
  { id: 'cinema', label: 'Cinema' },
];

function createBannerItemFromFile(file, index = 0) {
  return {
    id: Number(file?.id || 0),
    title: String(file?.title || file?.filename || `Banner ${index + 1}`).slice(0, 120),
    url: file?.sizes?.large?.url || file?.url || '',
    thumbUrl: file?.sizes?.medium?.url || file?.thumb_url || file?.url || '',
  };
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      aria-pressed={checked}
      className={`fm-appearance-toggle ${checked ? 'is-active' : ''}`}
      onClick={onChange}
      type="button"
    >
      <span className="fm-appearance-toggle__thumb" aria-hidden="true" />
    </button>
  );
}

function NumericStepper({ label, max, min, onChange, suffix = '', value }) {
  const canDecrease = Number(value) > Number(min);
  const canIncrease = Number(value) < Number(max);

  return (
    <div className="fm-appearance-stepper">
      <div className="fm-appearance-stepper__label-row">
        <span>{label}</span>
      </div>
      <div className="fm-appearance-stepper__control">
        <button disabled={!canDecrease} onClick={() => canDecrease && onChange(Number(value) - 1)} type="button">
          <span aria-hidden="true">-</span>
        </button>
        <div className="fm-appearance-stepper__value">
          <span>{value}</span>
          {suffix ? <small>{suffix}</small> : null}
        </div>
        <button disabled={!canIncrease} onClick={() => canIncrease && onChange(Number(value) + 1)} type="button">
          <Icon name="plus" size={14} />
        </button>
      </div>
    </div>
  );
}

function OptionToggleRow({ checked, label, onChange }) {
  return (
    <div className="fm-appearance-option-row">
      <div className="fm-appearance-option-row__label">
        <ToggleSwitch checked={checked} onChange={onChange} />
        <span>{label}</span>
      </div>
    </div>
  );
}

function BannerStyleOption({ active, id, label, onSelect }) {
  return (
    <button className={`fm-banner-style-option ${active ? 'is-active' : ''}`} onClick={() => onSelect(id)} type="button">
      <span className={`fm-banner-style-option__preview is-${id}`} aria-hidden="true">
        <span className="fm-banner-style-option__line is-top" />
        <span className="fm-banner-style-option__line is-bottom" />
      </span>
      <span className="fm-banner-style-option__label">{label}</span>
    </button>
  );
}

function ModulePreviewCard({ module, settings }) {
  const coverImage = module?.cover_image_url || module?.cover_image_thumb_url || '';
  const lessonCount = (module?.lessons || []).filter((lesson) => lesson?.status !== 'archived').length;
  const progressPercent = lessonCount > 0 ? 25 : 0;
  const showCardDetails = settings.card_details_enabled && Object.values(settings.card_details || {}).some(Boolean);
  const infoStyle = settings.card_info_style || 'hover';

  function renderCardDetails(className = '') {
    if (!showCardDetails) {
      return null;
    }

    return (
      <div className={`fm-appearance-card-details ${className}`.trim()}>
        {settings.card_details?.title ? <strong>{module?.title || 'Novo módulo'}</strong> : null}
        {settings.card_details?.lesson_count ? <span>{lessonCount} aula{lessonCount === 1 ? '' : 's'}</span> : null}
        {settings.card_details?.progress ? (
          <div className="fm-appearance-card-details__progress">
            <div className="fm-appearance-card-details__progress-bar">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <article className={`fm-appearance-preview__card is-${infoStyle}`}>
      <div className="fm-appearance-preview__card-media">
        {coverImage ? (
          <img alt="" className="fm-appearance-preview__card-image" src={coverImage} />
        ) : (
          <div className="fm-appearance-preview__card-fallback" aria-hidden="true">
            <span>{String(module?.title || 'M').slice(0, 1).toUpperCase()}</span>
          </div>
        )}
        {renderCardDetails(infoStyle === 'hover' ? 'is-hover' : 'is-fixed')}
      </div>
    </article>
  );
}

function PreviewShelfRow({ modules = [], settings, title }) {
  const railRef = useRef(null);

  function scrollRail(direction) {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const scrollAmount = Math.max(rail.clientWidth * 0.82, 260);
    rail.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  }

  return (
    <section className="fm-appearance-preview__shelf">
      <div className="fm-appearance-preview__shelf-head">
        <strong>{title || 'Nova seção'}</strong>
        <div className="fm-appearance-preview__shelf-nav">
          <button aria-label="Rolar fileira para a esquerda" onClick={() => scrollRail('prev')} type="button">
            <Icon name="arrowLeft" size={14} />
          </button>
          <button aria-label="Rolar fileira para a direita" onClick={() => scrollRail('next')} type="button">
            <Icon name="arrowRight" size={14} />
          </button>
        </div>
      </div>

      <div className="fm-appearance-preview__rail" ref={railRef}>
        {modules.map((module) => (
          <ModulePreviewCard key={module?.client_key || module?.id} module={module} settings={settings} />
        ))}
      </div>
    </section>
  );
}

export default function CourseAppearanceEditor({ course, onChange, settings }) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [editingBannerIndex, setEditingBannerIndex] = useState(-1);
  const autoSeededBannersRef = useRef('');
  const normalizedSettings = useMemo(() => normalizeAppearanceSettings(settings), [settings]);
  const previewRows = useMemo(() => buildAppearanceRows(course?.sections || [], course?.modules || []), [course?.modules, course?.sections]);
  const coverImage = course?.cover_image_url || course?.cover_image_thumb_url || '';
  const coverThumb = course?.cover_image_thumb_url || course?.cover_image_url || '';
  const totalLessons = useMemo(
    () => previewRows.reduce((sectionTotal, section) => sectionTotal + (section?.modules || []).reduce((moduleTotal, module) => moduleTotal + (module?.lessons || []).filter((lesson) => lesson?.status !== 'archived').length, 0), 0),
    [previewRows]
  );
  const previewProgress = totalLessons > 0 ? 25 : 0;
  const configuredHeroBanners = normalizedSettings.hero_banners || [];
  const activeBannerIndex = Math.min(Number(normalizedSettings.active_banner_index || 0), Math.max(configuredHeroBanners.length - 1, 0));
  const activeBanner = configuredHeroBanners[activeBannerIndex] || null;
  const previewHeroImage = normalizedSettings.carousel_enabled ? activeBanner?.url || coverImage : coverImage;
  const hasMultipleSections = previewRows.length > 1;
  const canAddMoreBanners = configuredHeroBanners.length < 7;
  const totalCarouselCards = configuredHeroBanners.length + (canAddMoreBanners ? 1 : 0);
  const carouselInteractionDisabled = !normalizedSettings.carousel_enabled;

  function updateSettings(nextSettings) {
    onChange?.(normalizeAppearanceSettings(nextSettings));
  }

  function updateSetting(field, value) {
    updateSettings({
      ...normalizedSettings,
      [field]: value,
    });
  }

  function updateNestedSetting(group, field, value) {
    updateSettings({
      ...normalizedSettings,
      [group]: {
        ...normalizedSettings[group],
        [field]: value,
      },
    });
  }

  function updateHeroBanners(nextBanners, nextActiveIndex = 0) {
    updateSettings({
      ...normalizedSettings,
      hero_banners: nextBanners,
      active_banner_index: nextActiveIndex,
    });
  }

  function openBannerLibrary(index = -1) {
    if (carouselInteractionDisabled) {
      return;
    }

    setEditingBannerIndex(index);
    setLibraryOpen(true);
  }

  function handleBannerSelect(file) {
    const nextBanner = createBannerItemFromFile(file, editingBannerIndex >= 0 ? editingBannerIndex : configuredHeroBanners.length);

    if (!nextBanner.url) {
      setLibraryOpen(false);
      setEditingBannerIndex(-1);
      return;
    }

    if (editingBannerIndex >= 0 && configuredHeroBanners[editingBannerIndex]) {
      const nextBanners = configuredHeroBanners.map((banner, index) => (index === editingBannerIndex ? nextBanner : banner));
      updateHeroBanners(nextBanners, editingBannerIndex);
    } else if (configuredHeroBanners.length < 7) {
      const nextBanners = [...configuredHeroBanners, nextBanner];
      updateHeroBanners(nextBanners, nextBanners.length - 1);
    }

    setLibraryOpen(false);
    setEditingBannerIndex(-1);
  }

  function handleRemoveBanner(index) {
    if (carouselInteractionDisabled) {
      return;
    }

    const nextBanners = configuredHeroBanners.filter((_, currentIndex) => currentIndex !== index);
    const nextActiveIndex = nextBanners.length ? Math.min(activeBannerIndex > index ? activeBannerIndex - 1 : activeBannerIndex, nextBanners.length - 1) : 0;
    updateHeroBanners(nextBanners, nextActiveIndex);
  }

  useEffect(() => {
    const courseKey = String(course?.id || course?.client_key || 'draft');

    if (autoSeededBannersRef.current !== courseKey) {
      autoSeededBannersRef.current = '';
    }

    if (!normalizedSettings.carousel_enabled || configuredHeroBanners.length || !coverImage) {
      return;
    }

    if (autoSeededBannersRef.current === courseKey) {
      return;
    }

    autoSeededBannersRef.current = courseKey;
    updateHeroBanners(
      [
        {
          id: Number(course?.cover_image_id || 0),
          title: course?.title || 'Banner principal',
          url: coverImage,
          thumbUrl: coverThumb,
        },
      ],
      0
    );
  }, [configuredHeroBanners.length, coverImage, coverThumb, course?.client_key, course?.cover_image_id, course?.id, course?.title, normalizedSettings.carousel_enabled]);

  return (
    <section className="fm-appearance-editor">
      <div className="fm-appearance-editor__preview">
        <div
          className={`fm-appearance-preview is-${normalizedSettings.hero_style}`}
          style={{
            '--fm-preview-columns': normalizedSettings.cards_per_row,
            '--fm-preview-gap': `${normalizedSettings.card_gap}px`,
            '--fm-preview-section-gap': `${normalizedSettings.section_gap}px`,
          }}
        >
          <div className="fm-appearance-preview__hero">
            {previewHeroImage ? <img alt="" className="fm-appearance-preview__hero-image" src={previewHeroImage} /> : null}
            <div className="fm-appearance-preview__hero-backdrop" aria-hidden="true" />
            <div className="fm-appearance-preview__hero-copy">
              {normalizedSettings.banner_details_enabled && normalizedSettings.banner_details?.title ? <h3>{course?.title || 'Seu curso aparece aqui'}</h3> : null}
              {normalizedSettings.banner_details_enabled && normalizedSettings.banner_details?.description ? (
                <p>{course?.description || 'Aprenda estratégias e táticas de marketing digital para crescer sua marca, atrair clientes e vender mais.'}</p>
              ) : null}

              <div className="fm-appearance-preview__hero-actions">
                {normalizedSettings.banner_details_enabled && normalizedSettings.banner_details?.continue_watching ? (
                  <button className="fm-appearance-preview__hero-button is-primary" type="button">
                    <Icon name="play" size={14} />
                    <span>Continuar assistindo</span>
                  </button>
                ) : null}

                {normalizedSettings.banner_details_enabled && normalizedSettings.banner_details?.course_details ? (
                  <button className="fm-appearance-preview__hero-button is-secondary" type="button">
                    <span>Detalhes do curso</span>
                  </button>
                ) : null}
              </div>

              {normalizedSettings.banner_details_enabled && normalizedSettings.banner_details?.progress ? (
                <div className="fm-appearance-preview__hero-progress">
                  <div className="fm-appearance-preview__hero-progress-labels">
                    <span>Seu progresso</span>
                    <strong>{previewProgress}% concluído</strong>
                  </div>
                  <div className="fm-appearance-preview__hero-progress-bar">
                    <span style={{ width: `${previewProgress}%` }} />
                  </div>
                </div>
              ) : null}
            </div>

            {normalizedSettings.carousel_enabled ? (
              <div className="fm-appearance-preview__hero-dots" aria-hidden="true">
                {(configuredHeroBanners.length ? configuredHeroBanners : [null]).slice(0, 7).map((_, index) => (
                  <span className={index === activeBannerIndex ? 'is-active' : ''} key={index} />
                ))}
              </div>
            ) : null}
          </div>

          {previewRows.length ? (
            <div className={`fm-appearance-preview__shelves ${hasMultipleSections ? 'has-scroll' : ''}`}>
              {previewRows.map((section) => (
                <PreviewShelfRow key={section?.client_key || section?.id} modules={section?.modules || []} settings={normalizedSettings} title={section?.title || 'Nova seção'} />
              ))}
            </div>
          ) : (
            <div className="fm-appearance-preview__empty">
              <strong>Adicione seções e módulos para visualizar a vitrine.</strong>
              <p>O preview mostra primeiro o banner principal do curso e, logo abaixo, as fileiras horizontais com os banners dos módulos.</p>
            </div>
          )}
        </div>
      </div>

      <div className="fm-appearance-editor__top-grid">
        <section className="fm-surface-card fm-appearance-panel fm-appearance-panel--banner-style">
          <div className="fm-appearance-panel__header">
            <h4>Estilo do banner</h4>
          </div>

          <div className="fm-banner-style-options">
            {BANNER_STYLE_OPTIONS.map((option) => (
              <BannerStyleOption active={normalizedSettings.hero_style === option.id} id={option.id} key={option.id} label={option.label} onSelect={(value) => updateSetting('hero_style', value)} />
            ))}
          </div>
        </section>

        <section className="fm-surface-card fm-appearance-panel">
          <div className="fm-appearance-panel__header">
            <h4>Informações no banner</h4>
            <ToggleSwitch checked={normalizedSettings.banner_details_enabled} onChange={() => updateSetting('banner_details_enabled', !normalizedSettings.banner_details_enabled)} />
          </div>

          <div className={`fm-appearance-panel__rows ${normalizedSettings.banner_details_enabled ? '' : 'is-muted'}`}>
            <OptionToggleRow checked={normalizedSettings.banner_details?.title} label="Título" onChange={() => updateNestedSetting('banner_details', 'title', !normalizedSettings.banner_details?.title)} />
            <OptionToggleRow checked={normalizedSettings.banner_details?.description} label="Descrição" onChange={() => updateNestedSetting('banner_details', 'description', !normalizedSettings.banner_details?.description)} />
            <OptionToggleRow checked={normalizedSettings.banner_details?.continue_watching} label="Continue assistindo" onChange={() => updateNestedSetting('banner_details', 'continue_watching', !normalizedSettings.banner_details?.continue_watching)} />
            <OptionToggleRow checked={normalizedSettings.banner_details?.course_details} label="Detalhes do curso" onChange={() => updateNestedSetting('banner_details', 'course_details', !normalizedSettings.banner_details?.course_details)} />
            <OptionToggleRow checked={normalizedSettings.banner_details?.progress} label="Barra de progresso" onChange={() => updateNestedSetting('banner_details', 'progress', !normalizedSettings.banner_details?.progress)} />
          </div>
        </section>
      </div>

      <section className="fm-surface-card fm-appearance-panel fm-appearance-panel--carousel">
        <div className={`fm-appearance-carousel-control ${carouselInteractionDisabled ? 'is-disabled' : ''}`}>
          <div className="fm-appearance-carousel-control__head">
            <strong>Carrossel</strong>
            <ToggleSwitch
              checked={normalizedSettings.carousel_enabled}
              onChange={() => {
                if (!normalizedSettings.carousel_enabled && !configuredHeroBanners.length && coverImage) {
                  updateSettings({
                    ...normalizedSettings,
                    carousel_enabled: true,
                    active_banner_index: 0,
                    hero_banners: [
                      {
                        id: Number(course?.cover_image_id || 0),
                        title: course?.title || 'Banner principal',
                        url: coverImage,
                        thumbUrl: coverThumb,
                      },
                    ],
                  });
                  return;
                }

                updateSettings({
                  ...normalizedSettings,
                  carousel_enabled: !normalizedSettings.carousel_enabled,
                });
              }}
            />
          </div>

          {carouselInteractionDisabled ? <p className="fm-appearance-carousel-control__hint">Ative o carrossel para selecionar, editar, excluir ou adicionar banners.</p> : null}

          <div
            className={`fm-appearance-carousel-strip ${normalizedSettings.carousel_enabled ? 'is-active' : ''} ${carouselInteractionDisabled ? 'is-disabled' : ''}`}
          >
            {configuredHeroBanners.map((banner, index) => (
              <article className={`fm-appearance-carousel-card ${index === activeBannerIndex ? 'is-active' : ''}`} key={`${banner.url}-${index}`}>
                <button
                  className="fm-appearance-carousel-card__select"
                  disabled={carouselInteractionDisabled}
                  onClick={() => !carouselInteractionDisabled && updateSetting('active_banner_index', index)}
                  type="button"
                >
                  {banner.thumbUrl || banner.url ? <img alt="" src={banner.thumbUrl || banner.url} /> : <span aria-hidden="true" />}
                  <span className="fm-appearance-carousel-card__title">{banner.title || `Banner ${index + 1}`}</span>
                </button>

                <div className="fm-appearance-carousel-card__actions">
                  <button aria-label="Editar banner" disabled={carouselInteractionDisabled} onClick={() => openBannerLibrary(index)} type="button">
                    <Icon name="edit" size={12} />
                  </button>
                  <button aria-label="Excluir banner" disabled={carouselInteractionDisabled} onClick={() => handleRemoveBanner(index)} type="button">
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              </article>
            ))}

            {canAddMoreBanners ? (
              <button className="fm-appearance-carousel-card fm-appearance-carousel-card--add" disabled={carouselInteractionDisabled} onClick={() => openBannerLibrary(-1)} type="button">
                <span className="fm-appearance-carousel-card__add-icon" aria-hidden="true">
                  <Icon name="plus" size={16} />
                </span>
                <span className="fm-appearance-carousel-card__title">Novo banner</span>
              </button>
            ) : null}
          </div>

          {normalizedSettings.carousel_enabled ? (
            <div className="fm-appearance-carousel-strip__dots" aria-hidden="true">
              {(configuredHeroBanners.length ? configuredHeroBanners : [null]).slice(0, 7).map((_, index) => (
                <span className={index === activeBannerIndex ? 'is-active' : ''} key={index} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <div className="fm-appearance-editor__bottom-grid">
        <section className="fm-surface-card fm-appearance-panel fm-appearance-panel--metrics">
          <div className="fm-appearance-panel__metrics">
            <NumericStepper label="Cards na tela" max={6} min={2} onChange={(value) => updateSetting('cards_per_row', value)} value={normalizedSettings.cards_per_row} />
            <NumericStepper label="Espaçamento entre cards" max={28} min={12} onChange={(value) => updateSetting('card_gap', value)} suffix="px" value={normalizedSettings.card_gap} />
            <NumericStepper label="Espaçamento entre seções" max={56} min={20} onChange={(value) => updateSetting('section_gap', value)} suffix="px" value={normalizedSettings.section_gap} />
          </div>
        </section>

        <section className="fm-surface-card fm-appearance-panel">
          <div className="fm-appearance-panel__header">
            <h4>Informações nos cards</h4>
            <ToggleSwitch checked={normalizedSettings.card_details_enabled} onChange={() => updateSetting('card_details_enabled', !normalizedSettings.card_details_enabled)} />
          </div>

          <div className={`fm-appearance-panel__rows ${normalizedSettings.card_details_enabled ? '' : 'is-muted'}`}>
            <OptionToggleRow checked={normalizedSettings.card_details?.title} label="Título" onChange={() => updateNestedSetting('card_details', 'title', !normalizedSettings.card_details?.title)} />
            <OptionToggleRow checked={normalizedSettings.card_details?.lesson_count} label="Quantidade de aulas" onChange={() => updateNestedSetting('card_details', 'lesson_count', !normalizedSettings.card_details?.lesson_count)} />
            <OptionToggleRow checked={normalizedSettings.card_details?.progress} label="Barra de progresso" onChange={() => updateNestedSetting('card_details', 'progress', !normalizedSettings.card_details?.progress)} />
          </div>

          <label className="fm-appearance-select-field">
            <span>Estilo</span>
            <div className="fm-appearance-select-wrap">
              <select onChange={(event) => updateSetting('card_info_style', event.target.value)} value={normalizedSettings.card_info_style}>
                <option value="fixed">Fixo</option>
                <option value="hover">Ao passar o mouse</option>
              </select>
              <Icon name="chevronDown" size={14} />
            </div>
          </label>
        </section>
      </div>

      <InternalLibraryModal
        accept="image"
        confirmLabel="Usar banner"
        description="Selecione um banner ja enviado ou suba uma nova imagem para o carrossel."
        onClose={() => {
          setLibraryOpen(false);
          setEditingBannerIndex(-1);
        }}
        onSelect={handleBannerSelect}
        open={libraryOpen}
        purpose="course-cover"
        selectedId={editingBannerIndex >= 0 ? Number(configuredHeroBanners[editingBannerIndex]?.id || 0) : 0}
        title="Biblioteca interna de banners"
      />
    </section>
  );
}
