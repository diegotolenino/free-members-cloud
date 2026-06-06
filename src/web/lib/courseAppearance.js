export const DEFAULT_APPEARANCE_SETTINGS = {
  hero_style: 'compact',
  carousel_enabled: true,
  active_banner_index: 0,
  hero_banners: [],
  cards_per_row: 4,
  card_gap: 13,
  section_gap: 28,
  banner_details_enabled: true,
  banner_details: {
    title: true,
    description: true,
    continue_watching: true,
    course_details: true,
    progress: true,
  },
  card_details_enabled: true,
  card_details: {
    title: true,
    lesson_count: true,
    progress: true,
  },
  card_info_style: 'hover',
};

function clamp(value, min, max, fallback) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numericValue));
}

function normalizeBannerItem(item = {}, index = 0) {
  return {
    id: Number(item?.id || 0),
    title: String(item?.title || `Banner ${index + 1}`).slice(0, 120),
    url: String(item?.url || ''),
    thumbUrl: String(item?.thumbUrl || item?.thumb_url || item?.url || ''),
  };
}

export function normalizeAppearanceSettings(settings = {}) {
  const bannerDetails = settings?.banner_details || {};
  const legacyShowDescription = settings?.show_course_description !== false;
  const cardDetails = settings?.card_details || {};
  const heroBanners = Array.isArray(settings?.hero_banners) ? settings.hero_banners.map(normalizeBannerItem).filter((item) => item.url).slice(0, 7) : [];

  return {
    hero_style: ['compact', 'standard', 'cinema'].includes(settings?.hero_style)
      ? settings.hero_style
      : ['compact', 'standard', 'cinema'].includes(settings?.hero_height)
        ? settings.hero_height
        : DEFAULT_APPEARANCE_SETTINGS.hero_style,
    carousel_enabled: settings?.carousel_enabled !== false,
    active_banner_index: clamp(settings?.active_banner_index, 0, Math.max(heroBanners.length - 1, 0), DEFAULT_APPEARANCE_SETTINGS.active_banner_index),
    hero_banners: heroBanners,
    cards_per_row: clamp(settings?.cards_per_row, 2, 6, DEFAULT_APPEARANCE_SETTINGS.cards_per_row),
    card_gap: clamp(settings?.card_gap, 12, 28, DEFAULT_APPEARANCE_SETTINGS.card_gap),
    section_gap: clamp(settings?.section_gap, 20, 56, DEFAULT_APPEARANCE_SETTINGS.section_gap),
    banner_details_enabled: settings?.banner_details_enabled !== false,
    banner_details: {
      title: bannerDetails?.title !== false,
      description: bannerDetails?.description !== false && legacyShowDescription,
      continue_watching: bannerDetails?.continue_watching !== false,
      course_details: bannerDetails?.course_details !== false,
      progress: bannerDetails?.progress !== false,
    },
    card_details_enabled: settings?.card_details_enabled !== false,
    card_details: {
      title: cardDetails?.title !== false,
      lesson_count: cardDetails?.lesson_count !== false,
      progress: cardDetails?.progress !== false,
    },
    card_info_style: ['fixed', 'hover'].includes(settings?.card_info_style) ? settings.card_info_style : DEFAULT_APPEARANCE_SETTINGS.card_info_style,
  };
}

export function buildAppearanceRows(sections = [], modules = []) {
  const visibleSections = (sections || [])
    .filter((section) => section?.status !== 'archived')
    .sort((left, right) => Number(left?.sort_order || 0) - Number(right?.sort_order || 0))
    .map((section) => ({
      ...section,
      modules: (section?.modules || [])
        .filter((module) => module?.status !== 'archived')
        .sort((left, right) => Number(left?.sort_order || 0) - Number(right?.sort_order || 0)),
    }))
    .filter((section) => section.modules.length > 0);

  if (visibleSections.length > 0) {
    return visibleSections;
  }

  const standaloneModules = (modules || [])
    .filter((module) => module?.status !== 'archived')
    .sort((left, right) => Number(left?.sort_order || 0) - Number(right?.sort_order || 0));

  if (!standaloneModules.length) {
    return [];
  }

  return [
    {
      id: 'default-row',
      client_key: 'default-row',
      title: 'Módulos em destaque',
      modules: standaloneModules,
    },
  ];
}
