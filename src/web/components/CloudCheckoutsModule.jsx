import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';

// ─── inline SVG helpers ───────────────────────────────────────────────────────

function Svg({ size = 16, children, ...props }) {
  return (
    <svg aria-hidden="true" fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size} {...props}>
      {children}
    </svg>
  );
}

const BookOpen = (p) => <Svg {...p}><path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" /></Svg>;
const CreditCard = (p) => <Svg {...p}><rect height="14" rx="2" width="20" x="2" y="5" /><path d="M2 10h20" /></Svg>;
const Wallet = (p) => <Svg {...p}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></Svg>;
const ImageIcon = (p) => <Svg {...p}><rect height="18" rx="2" width="18" x="3" y="3" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></Svg>;
const LayoutPanelTop = (p) => <Svg {...p}><rect height="7" rx="1" width="18" x="3" y="3" /><rect height="7" rx="1" width="7" x="3" y="14" /><rect height="7" rx="1" width="7" x="14" y="14" /></Svg>;
const TimerIcon = (p) => <Svg {...p}><path d="M10 2h4" /><path d="M12 14v-4" /><circle cx="12" cy="14" r="8" /></Svg>;
const Barcode = (p) => <Svg {...p}><path d="M3 5v14" /><path d="M8 5v14" /><path d="M12 5v14" /><path d="M17 5v14" /><path d="M21 5v14" /></Svg>;
const Plus = (p) => <Svg {...p}><path d="M5 12h14" /><path d="M12 5v14" /></Svg>;
const X = (p) => <Svg {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Svg>;
const Search = (p) => <Svg {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Svg>;
const Ticket = (p) => <Svg {...p}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /></Svg>;
const Tag = (p) => <Svg {...p}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /></Svg>;
const MoreHorizontal = (p) => <Svg {...p}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></Svg>;
const ExternalLink = (p) => <Svg {...p}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></Svg>;
const ShieldCheck = (p) => <Svg {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></Svg>;
const GripVertical = (p) => <Svg {...p}><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></Svg>;
const Mail = (p) => <Svg {...p}><rect height="16" rx="2" width="20" x="2" y="4" /><path d="m22 7-8.97 5.7a2 2 0 0 1-2.06 0L2 7" /></Svg>;
const MessageCircle = (p) => <Svg {...p}><path d="M7 18h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v10l3.5-2z" /></Svg>;

// ─── pix / card inline icons (simplified) ────────────────────────────────────

function PixIcon({ size = 18 }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 48 48" width={size}>
      <path d="M11.4 18.6 24 6l12.6 12.6a6 6 0 0 1 0 8.48L24 39.54 11.4 27.08a6 6 0 0 1 0-8.48Z" fill="#32bcad" />
    </svg>
  );
}

function CardIcon({ size = 18 }) { return <CreditCard size={size} />; }
function BoletoIcon({ size = 18 }) { return <Barcode size={size} />; }

// ─── helpers ──────────────────────────────────────────────────────────────────

const MAX_CHECKOUT_PRICE = 99999;
const MAX_ORDER_BUMPS = 10;

function money(value, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));
}

function formatPriceBR(value) {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));
}

function parsePriceBR(input) {
  const digits = String(input || '').replace(/\D/g, '').slice(0, 7);
  return Math.min(MAX_CHECKOUT_PRICE, Number(digits) / 100);
}

function sanitizeHexColor(value, fallback = '#16a34a') {
  const normalized = String(value || '').trim();
  return /^#([0-9a-fA-F]{6})$/.test(normalized) ? normalized.toLowerCase() : fallback;
}

function hexToRgba(hex, alpha = 1) {
  const safeHex = sanitizeHexColor(hex).replace('#', '');
  const r = Number.parseInt(safeHex.slice(0, 2), 16);
  const g = Number.parseInt(safeHex.slice(2, 4), 16);
  const b = Number.parseInt(safeHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function youtubeEmbedUrl(url = '') {
  const value = String(url || '').trim();
  if (!value) return '';
  const match = value.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : value;
}

function courseThumb(course = {}, settings = {}) {
  const custom = settings.course_images?.[String(course.id)] || settings.course_images?.[Number(course.id)];
  return custom || course.cover_image_thumb_url || course.cover_image_url || '';
}

function installmentOptionLabel(option = {}, showFinalAmount = true, basePrice = 0) {
  const installments = Math.max(1, Number(option.installments || 1));
  const amount = money(option.installment_amount || 0);
  const total = Number(option.total_amount || 0);
  const rate = Number(option.installment_rate || 0);
  const expectedTotal = Number(basePrice || 0) || Number(option.installment_amount || 0) * installments;
  const hasInterest = rate > 0 || (total > 0 && total > expectedTotal + 0.01);
  const finalAmount = showFinalAmount && total > 0 ? ` (${money(total)})` : '';
  const marker = !showFinalAmount && hasInterest ? '*' : '';
  return `${installments}x de ${amount}${finalAmount}${marker}`;
}

function moveItem(items = [], fromIndex = 0, toIndex = 0) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

// ─── defaults ─────────────────────────────────────────────────────────────────

const emptyCheckout = {
  name: 'Membro Pro',
  slug: '',
  status: 'active',
  price: 497,
  currency: 'BRL',
  gateway_id: 'mercadopago',
  document_mode: 'both',
  banner_enabled: true,
  banner_url: '',
  course_ids: [],
  courses: [],
  main_course_id: 0,
  extra_courses: [],
  payment_methods: [
    { id: 'card', enabled: true, discount: 0, preselected_installments: 12, max_installments: 12, interest_free_installments: 1, interest_rate: 0, show_final_amount: true, default: true },
    { id: 'pix', enabled: true, discount: 0, expiration_minutes: 15, default: false },
    { id: 'boleto', enabled: true, discount: 0, due_days: 3, default: false },
  ],
  settings: {
    video_enabled: false, video_url: '', side_image_enabled: false, side_image_url: '',
    testimonials_enabled: false, testimonials: [], content_order: ['video', 'image', 'testimonials'],
    course_images: {}, timer_enabled: false, timer_minutes: 15,
    timer_message: 'Seu tempo acabou! Finalize a compra imediatamente.',
    email_notifications_enabled: true, email_template: 'default',
    whatsapp_notifications_enabled: false, order_bumps_enabled: false,
    order_bump_style: 'classic', order_bump_primary_color: '#16a34a', order_bumps: [],
  },
};

const contentMeta = {
  video: { title: 'Vídeo', description: 'Youtube' },
  image: { title: 'Imagem', description: 'Imagem complementar ao lado do checkout' },
  testimonials: { title: 'Depoimentos/Reviews', description: 'Com os reviews, você cria argumentos de confiança para seu cliente finalizar a compra.' },
};

const methodMeta = {
  card: { label: 'Cartão de crédito', icon: CardIcon },
  pix: { label: 'Pix', icon: PixIcon },
  boleto: { label: 'Boleto bancário', icon: BoletoIcon },
};

const emailTemplateOptions = [{ value: 'default', label: 'Padrão' }];
const ORDER_BUMP_STYLE_OPTIONS = [{ value: 'classic', label: 'Clássico' }, { value: 'modern', label: 'Moderno' }];

// ─── normalizers ──────────────────────────────────────────────────────────────

function normalizeSettings(settings = {}) {
  const base = emptyCheckout.settings;
  const contentOrder = Array.isArray(settings.content_order) ? settings.content_order.filter((item) => contentMeta[item]) : base.content_order;
  return {
    ...base,
    ...settings,
    testimonials: Array.isArray(settings.testimonials) ? settings.testimonials : base.testimonials,
    content_order: [...contentOrder, ...base.content_order.filter((item) => !contentOrder.includes(item))],
    course_images: settings.course_images && typeof settings.course_images === 'object' ? settings.course_images : {},
    order_bumps_enabled: !!settings.order_bumps_enabled,
    order_bump_style: settings.order_bump_style === 'modern' ? 'modern' : 'classic',
    order_bump_primary_color: sanitizeHexColor(settings.order_bump_primary_color || base.order_bump_primary_color),
    order_bumps: normalizeOrderBumps(settings.order_bumps),
  };
}

function normalizeOrderBumps(orderBumps = []) {
  return (Array.isArray(orderBumps) ? orderBumps : []).slice(0, MAX_ORDER_BUMPS).map((ob, i) => ({
    id: String(ob?.id || `bump-${i + 1}`),
    course_id: Number(ob?.course_id || 0),
    course_title: String(ob?.course_title || ''),
    course_cover_image_url: String(ob?.course_cover_image_url || ''),
    price: Number(ob?.price || 0),
    anchor_price_enabled: !!ob?.anchor_price_enabled,
    anchor_price: Number(ob?.anchor_price || 0),
    title: String(ob?.title || ''),
    description: String(ob?.description || ''),
  }));
}

function normalizePaymentMethods(methods = []) {
  const defaults = emptyCheckout.payment_methods;
  const byId = new Map(defaults.map((m) => [m.id, m]));
  const ordered = Array.isArray(methods) ? methods.filter((m) => byId.has(m.id)).map((m) => ({ ...byId.get(m.id), ...m })) : [];
  defaults.forEach((m) => { if (!ordered.some((item) => item.id === m.id)) ordered.push({ ...m }); });
  return ordered.map((m, i) => ({ ...m, enabled: i === 0 ? true : !!m.enabled }));
}

function normalizeCheckout(checkout = {}) {
  const courseIds = Array.isArray(checkout.course_ids) ? checkout.course_ids.map(Number).filter(Boolean) : [];
  const delays = (checkout.settings && checkout.settings.course_delays) || {};
  return {
    ...emptyCheckout,
    ...checkout,
    price: Number(checkout.price || emptyCheckout.price),
    course_ids: courseIds,
    courses: Array.isArray(checkout.courses) ? checkout.courses : [],
    main_course_id: courseIds[0] || 0,
    extra_courses: courseIds.slice(1).map((id) => ({ course_id: id, delay_days: Number(delays[id] || 0) })),
    payment_methods: normalizePaymentMethods(checkout.payment_methods),
    settings: normalizeSettings(checkout.settings),
  };
}

// ─── URL image picker (simplified — no WordPress media library) ───────────────

function CloudMediaField({ label, previewUrl, onChange }) {
  const [url, setUrl] = useState(String(previewUrl || ''));
  useEffect(() => { setUrl(String(previewUrl || '')); }, [previewUrl]);
  return (
    <div className="fm-cloud-media-field">
      {label ? <span>{label}</span> : null}
      {url ? <img alt="preview" src={url} style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 4 }} /> : null}
      <input
        onChange={(e) => setUrl(e.target.value)}
        onBlur={() => onChange({ url })}
        placeholder="URL da imagem..."
        style={{ width: '100%', fontSize: '.85rem' }}
        type="url"
        value={url}
      />
    </div>
  );
}

// ─── payment method config ────────────────────────────────────────────────────

function PaymentMethodConfigCard({ canDisable = true, financingMode = 'mercadopago', gatewayId = 'mercadopago', index = 0, method, onChange, onMove, price }) {
  const meta = methodMeta[method.id];
  const Icon = meta.icon;
  const mpOptions = Array.isArray(method.installment_options) && method.installment_options.length ? method.installment_options : [];
  const maxInstall = Math.max(1, Math.min(24, Number(method.max_installments || 12)));
  const installChoices = Array.from({ length: 24 }, (_, i) => i + 1);
  const freeChoices = Array.from({ length: maxInstall }, (_, i) => i + 1);
  const preselChoices = Array.from({ length: maxInstall }, (_, i) => i + 1);
  return (
    <article
      className="fm-payment-config-card"
      draggable
      onDragOver={(e) => e.preventDefault()}
      onDragStart={(e) => e.dataTransfer.setData('text/plain', String(index))}
      onDrop={(e) => onMove(Number(e.dataTransfer.getData('text/plain')), index)}
    >
      <div className="fm-payment-config-card__head">
        <button aria-label="Arrastar método" className="fm-checkout-drag-handle" type="button"><GripVertical size={16} /></button>
        <Icon size={18} />
        <strong>{meta.label}</strong>
        {!canDisable ? <span className="fm-payment-default-badge">Padrão</span> : null}
        <label className={`fm-switch ${!canDisable ? 'is-disabled' : ''}`}>
          <input checked={method.enabled} disabled={!canDisable} onChange={(e) => onChange({ enabled: e.target.checked })} type="checkbox" />
          <span />
        </label>
      </div>
      {method.enabled && method.id === 'card' ? (
        <div className="fm-payment-config-card__fields">
          <label>
            <span>Parcelas</span>
            {gatewayId === 'mercadopago' && financingMode === 'mercadopago' ? (
              <select onChange={(e) => onChange({ preselected_installments: e.target.value })} value={method.preselected_installments}>
                {mpOptions.map((o) => <option key={o.installments} value={o.installments}>{installmentOptionLabel(o, method.show_final_amount !== false, price)}</option>)}
                {!mpOptions.length ? <option value="12">Buscando Mercado Pago...</option> : null}
              </select>
            ) : (
              <select onChange={(e) => { const n = parseInt(e.target.value, 10) || 1; onChange({ max_installments: n, interest_free_installments: Math.min(Number(method.interest_free_installments || 1), n), preselected_installments: Math.min(Number(method.preselected_installments || 1), n) }); }} value={method.max_installments || 12}>
                {installChoices.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            )}
          </label>
          {gatewayId === 'mercadopago' && financingMode === 'free_members' ? (
            <>
              <label><span>Parcelas sem juros</span><select onChange={(e) => onChange({ interest_free_installments: parseInt(e.target.value, 10) || 1 })} value={method.interest_free_installments || 1}>{freeChoices.map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
              <label><span>Taxa de juros (%)</span><input onChange={(e) => onChange({ interest_rate: e.target.value })} value={method.interest_rate || 0} /></label>
              <label><span>Parcela pré-selecionada</span><select onChange={(e) => onChange({ preselected_installments: parseInt(e.target.value, 10) || 1 })} value={method.preselected_installments || 12}>{preselChoices.map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
            </>
          ) : null}
          <label><span>Desconto automático</span><select onChange={(e) => onChange({ discount: e.target.value })} value={method.discount}><option value="0">0%</option><option value="5">5%</option><option value="10">10%</option></select></label>
          <div className="fm-payment-inline-toggle">
            <span>Mostrar valor final</span>
            <label className="fm-switch"><input checked={method.show_final_amount !== false} onChange={(e) => onChange({ show_final_amount: e.target.checked })} type="checkbox" /><span /></label>
            <small>{method.show_final_amount === false ? 'Não' : 'Sim'}</small>
          </div>
        </div>
      ) : null}
      {method.enabled && method.id === 'pix' ? (
        <div className="fm-payment-config-card__fields">
          <label><span>Expiração do Pix</span><input onChange={(e) => onChange({ expiration_minutes: parseInt(e.target.value, 10) || 15 })} value={`${method.expiration_minutes || 15} min`} /></label>
          <label><span>Desconto automático</span><select onChange={(e) => onChange({ discount: e.target.value })} value={method.discount}><option value="0">0%</option><option value="5">5%</option><option value="10">10%</option></select></label>
        </div>
      ) : null}
      {method.enabled && method.id === 'boleto' ? (
        <div className="fm-payment-config-card__fields">
          <label><span>Vencimento</span><input onChange={(e) => onChange({ due_days: parseInt(e.target.value, 10) || 3 })} value={`${method.due_days || 3} dias`} /></label>
          <label><span>Desconto automático</span><select onChange={(e) => onChange({ discount: e.target.value })} value={method.discount}><option value="0">0%</option><option value="5">5%</option><option value="10">10%</option></select></label>
        </div>
      ) : null}
    </article>
  );
}

// ─── order bump components ────────────────────────────────────────────────────

function OrderBumpEditorCard({ courses = [], onChange, onRemove, orderBump = {} }) {
  const selectedCourse = courses.find((c) => Number(c.id) === Number(orderBump.course_id)) || null;
  return (
    <article className="fm-order-bump-editor-card">
      <div className="fm-order-bump-editor-card__top">
        <strong>Order bump</strong>
        <button className="fm-checkout-extra-remove" onClick={onRemove} type="button"><X size={14} /></button>
      </div>
      <div className="fm-payment-config-card__fields fm-order-bump-editor-card__fields">
        <label>
          <span>Produto</span>
          <select onChange={(e) => { const c = courses.find((item) => Number(item.id) === Number(e.target.value)); onChange({ course_id: Number(e.target.value) || 0, course_title: c?.title || '', title: orderBump.title || c?.title || '' }); }} value={orderBump.course_id || ''}>
            <option value="">Selecione um curso</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <label><span>Preço</span><div className="fm-checkout-price-input"><span>R$</span><input inputMode="numeric" onChange={(e) => onChange({ price: parsePriceBR(e.target.value) })} value={formatPriceBR(orderBump.price)} /></div></label>
        <label><span>Título</span><input onChange={(e) => onChange({ title: e.target.value })} placeholder={selectedCourse?.title || 'Título da oferta'} value={orderBump.title || ''} /></label>
        <label className="is-full"><span>Descrição</span><textarea onChange={(e) => onChange({ description: e.target.value })} placeholder="Descreva rapidamente o benefício adicional." rows={3} value={orderBump.description || ''} /></label>
      </div>
      <div className="fm-order-bump-editor-card__footer">
        <label className="fm-order-bump-anchor-toggle"><input checked={!!orderBump.anchor_price_enabled} onChange={(e) => onChange({ anchor_price_enabled: e.target.checked })} type="checkbox" /><span>Mostrar preço âncora</span></label>
        {orderBump.anchor_price_enabled ? (
          <label className="fm-checkout-field fm-order-bump-anchor-field">
            <span>Preço âncora</span>
            <div className="fm-checkout-price-input"><span>R$</span><input inputMode="numeric" onChange={(e) => onChange({ anchor_price: parsePriceBR(e.target.value) })} value={formatPriceBR(orderBump.anchor_price || orderBump.price)} /></div>
          </label>
        ) : null}
      </div>
    </article>
  );
}

function OrderBumpPreviewCard({ orderBump, settings = {} }) {
  if (!orderBump) return <div className="fm-order-bump-preview-empty">Adicione ao menos um produto para visualizar o layout.</div>;
  const color = sanitizeHexColor(settings.order_bump_primary_color || '#16a34a');
  const isModern = settings.order_bump_style === 'modern';
  const style = { '--fm-order-bump-color': color, '--fm-order-bump-soft': hexToRgba(color, isModern ? 0.12 : 0.16), '--fm-order-bump-border': hexToRgba(color, isModern ? 0.65 : 0.4) };
  return (
    <div className={`fm-order-bump-preview-card is-${settings.order_bump_style || 'classic'}`} style={style}>
      <strong>Prévia do order bump</strong>
      <div className="fm-order-bump-preview-card__body">
        <div className="fm-order-bump-preview-card__copy">
          <span>Você pode gostar</span>
          <h4>{orderBump.title || orderBump.course_title || 'Oferta adicional'}</h4>
          <p>{orderBump.description || 'Descrição do benefício adicional.'}</p>
          <div className="fm-order-bump-preview-card__prices">
            {orderBump.anchor_price_enabled && orderBump.anchor_price > orderBump.price ? <small>{money(orderBump.anchor_price)}</small> : null}
            <b>{money(orderBump.price)}</b>
          </div>
        </div>
        <div className="fm-order-bump-preview-card__cta">
          {isModern ? <span>Comprar junto por apenas mais {money(orderBump.price)}.</span> : <span>Adicionar esta oferta ao pedido.</span>}
        </div>
      </div>
    </div>
  );
}

// ─── content block ────────────────────────────────────────────────────────────

function ContentBlockEditor({ blockId, index, onMove, settings, updateSettings, updateTestimonial, addTestimonial, removeTestimonial, editingTestimonials, setEditingTestimonials }) {
  const meta = contentMeta[blockId];
  const enabledKey = blockId === 'image' ? 'side_image_enabled' : `${blockId}_enabled`;
  const isEnabled = !!settings[enabledKey];
  return (
    <article className="fm-checkout-content-block" draggable onDragOver={(e) => e.preventDefault()} onDragStart={(e) => e.dataTransfer.setData('text/plain', String(index))} onDrop={(e) => onMove(Number(e.dataTransfer.getData('text/plain')), index)}>
      <div className="fm-checkout-extra-row">
        <button aria-label="Arrastar bloco" className="fm-checkout-drag-handle" type="button"><GripVertical size={16} /></button>
        <div className="fm-checkout-toggle-title"><strong>{meta.title}</strong><small>{meta.description}</small></div>
        <label className="fm-switch"><input checked={isEnabled} onChange={(e) => updateSettings({ [enabledKey]: e.target.checked })} type="checkbox" /><span /></label>
      </div>
      {blockId === 'video' && isEnabled ? (
        <label className="fm-checkout-url-field"><span>https://</span><input onChange={(e) => updateSettings({ video_url: e.target.value })} placeholder="www.youtube.com/watch?v=..." value={settings.video_url} /></label>
      ) : null}
      {blockId === 'image' && isEnabled ? (
        <CloudMediaField label="" onChange={(file) => updateSettings({ side_image_url: file.url })} previewUrl={settings.side_image_url} />
      ) : null}
      {blockId === 'testimonials' && isEnabled ? (
        <div className="fm-checkout-testimonials-editor">
          {settings.testimonials.map((testimonial, i) => (
            <article className="fm-checkout-testimonial-form" key={i}>
              <header>
                <strong>#{i + 1}</strong>
                <label className="fm-testimonial-active"><span className="fm-switch"><input checked={testimonial.enabled !== false} onChange={(e) => updateTestimonial(i, { enabled: e.target.checked })} type="checkbox" /><span /></span>Ativo</label>
                <button className="fm-testimonial-preview-btn" onClick={() => setEditingTestimonials((c) => ({ ...c, [i]: !c[i] }))} type="button">{testimonial.image_url && !editingTestimonials[i] ? 'Editar' : 'Preview'}</button>
                <button onClick={() => removeTestimonial(i)} type="button"><X size={14} /></button>
              </header>
              {testimonial.image_url && !editingTestimonials[i] ? (
                <div className="fm-checkout-testimonial-render"><img alt="" src={testimonial.image_url} /><div><strong>{testimonial.name || 'Nome'}</strong><span>{'★'.repeat(Number(testimonial.rating || 5))} <small>{testimonial.rating || 5}</small></span><p>{testimonial.text || 'descrição'}</p></div></div>
              ) : (
                <div className="fm-checkout-testimonial-fields">
                  <CloudMediaField label="" onChange={(file) => updateTestimonial(i, { image_url: file.url })} previewUrl={testimonial.image_url || ''} />
                  <label><span>Classificação</span><select onChange={(e) => updateTestimonial(i, { rating: Number(e.target.value) })} value={testimonial.rating || 5}>{[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{'★'.repeat(r)} {r}</option>)}</select></label>
                  <label><span>Nome</span><input onChange={(e) => updateTestimonial(i, { name: e.target.value })} placeholder="Informe um nome" value={testimonial.name || ''} /></label>
                  <label><span>Depoimento</span><textarea onChange={(e) => updateTestimonial(i, { text: e.target.value })} placeholder="Digite o depoimento" value={testimonial.text || ''} /></label>
                  <button className="fm-checkout-save-testimonial" onClick={() => setEditingTestimonials((c) => ({ ...c, [i]: false }))} type="button">Salvar depoimento</button>
                </div>
              )}
            </article>
          ))}
          <button className="fm-checkout-add-testimonial" onClick={addTestimonial} type="button"><Plus size={14} />Inserir novo depoimento</button>
        </div>
      ) : null}
    </article>
  );
}

// ─── checkout preview ─────────────────────────────────────────────────────────

function previewInstallmentLabel(price, cardConfig = {}, financingMode = 'mercadopago') {
  const installments = Math.max(1, Number(cardConfig.preselected_installments || 12));
  if (financingMode === 'mercadopago') {
    const option = (cardConfig.installment_options || []).find((item) => Number(item.installments) === installments);
    return option ? installmentOptionLabel(option, cardConfig.show_final_amount !== false, price) : `${installments}x de ${money(Number(price || 0) / installments)}`;
  }
  const freeUntil = Math.max(1, Number(cardConfig.interest_free_installments || 1));
  const rate = Math.max(0, Number(cardConfig.interest_rate || 0));
  const total = installments > freeUntil && rate > 0 ? Number(price || 0) * (1 + rate / 100) : Number(price || 0);
  const hasInterest = installments > freeUntil && rate > 0;
  const finalAmount = cardConfig.show_final_amount !== false && hasInterest ? ` (${money(total)})` : '';
  const marker = cardConfig.show_final_amount === false && hasInterest ? '*' : '';
  return `${installments}x de ${money(total / installments)}${finalAmount}${marker}`;
}

function CheckoutPreview({ checkout, financingMode, activeMethods, cardConfig }) {
  const previewInstallment = previewInstallmentLabel(checkout.price, cardConfig, financingMode);
  const settings = normalizeSettings(checkout.settings);
  const previewOrderBump = settings.order_bumps_enabled ? settings.order_bumps[0] : null;
  const mainCourse = (checkout.courses || [])[0] || {};
  const productName = mainCourse.title || checkout.name || 'Membro Pro';
  const productImage = courseThumb(mainCourse, settings);
  return (
    <div className="fm-checkout-mockup is-mobile">
      <div className="fm-checkout-mockup__chrome"><span>18:30</span><b /></div>
      <div className="fm-checkout-mockup__viewport">
        <div className="fm-checkout-preview is-mobile">
          {settings.timer_enabled ? <div className="fm-checkout-preview__timer">00 : 00 <span>{settings.timer_message}</span></div> : null}
          {checkout.banner_enabled && checkout.banner_url ? <img alt="" className="fm-checkout-preview__banner" src={checkout.banner_url} /> : <div className="fm-checkout-preview__banner is-empty" />}
          <section className="fm-checkout-preview__product">
            {productImage ? <img alt="" src={productImage} /> : <span>Free Members</span>}
            <div><h3>{productName}</h3><strong>{money(checkout.price, checkout.currency)}</strong></div>
          </section>
          <div className="fm-checkout-preview__form">
            <strong>Seus dados</strong>
            <div><span className="fm-checkout-preview__field">Digite o seu nome completo</span><span className="fm-checkout-preview__field">seu@email.com</span></div>
            <div><span className="fm-checkout-preview__field">{checkout.document_mode === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00'}</span><span className="fm-checkout-preview__field">(11) 95099-5059</span></div>
          </div>
          <strong className="fm-checkout-preview__label">Escolha a forma de pagamento</strong>
          <div className="fm-checkout-preview__methods">{activeMethods.map((m, i) => { const meta = methodMeta[m.id]; const Icon = meta.icon; return <span className={i === 0 ? 'is-active' : ''} key={m.id}><Icon size={16} />{meta.label}</span>; })}</div>
          {previewOrderBump ? (
            <div className={`fm-checkout-preview__order-bump is-${settings.order_bump_style}`} style={{ '--fm-order-bump-color': settings.order_bump_primary_color, '--fm-order-bump-soft': hexToRgba(settings.order_bump_primary_color, settings.order_bump_style === 'modern' ? 0.12 : 0.16), '--fm-order-bump-border': hexToRgba(settings.order_bump_primary_color, settings.order_bump_style === 'modern' ? 0.65 : 0.35) }}>
              <span className="fm-checkout-preview__order-bump-label">Você pode gostar</span>
              <strong>{previewOrderBump.title || previewOrderBump.course_title}</strong>
              {previewOrderBump.description ? <p>{previewOrderBump.description}</p> : null}
              <div className="fm-checkout-preview__order-bump-price">
                {previewOrderBump.anchor_price_enabled && previewOrderBump.anchor_price > previewOrderBump.price ? <small>{money(previewOrderBump.anchor_price)}</small> : null}
                <b>{money(previewOrderBump.price)}</b>
              </div>
            </div>
          ) : null}
          <div className="fm-checkout-preview__card-fields">
            <span className="fm-checkout-preview__field is-full">0000 0000 0000 0000</span>
            <div><span className="fm-checkout-preview__field">MM/AA</span><span className="fm-checkout-preview__field">3 ou 4 dígitos</span></div>
            <span className="fm-checkout-preview__field is-full">{previewInstallment}</span>
            <span className="fm-checkout-preview__field is-full">Insira o nome impresso no cartão</span>
          </div>
          <div className="fm-checkout-preview__total"><span>Total a pagar</span><strong>{money(checkout.price, checkout.currency)}</strong><small>ou até {previewInstallment}</small></div>
          <span className="fm-checkout-preview__pay">Pagar agora</span>
          <span className="fm-checkout-preview__secure"><ShieldCheck size={14} />Ambiente 100% seguro</span>
        </div>
      </div>
      <div className="fm-checkout-mockup__safari"><span>Aa</span><strong>freemembers.cloud</strong><span>↻</span></div>
    </div>
  );
}

// ─── course picker ────────────────────────────────────────────────────────────

function CoursePicker({ courses = [], label, onImageChange, onPriceChange, onSearchChange, onSelect, price, searchValue = '', settings = {}, value }) {
  const [choosing, setChoosing] = useState(!value);
  const selected = courses.find((c) => Number(c.id) === Number(value));
  const filtered = courses.filter((c) => String(c.title || '').toLowerCase().includes(String(searchValue || '').toLowerCase()));

  useEffect(() => { setChoosing(!value); }, [value]);

  return (
    <div className="fm-checkout-course-picker">
      <span>{label}</span>
      {selected ? (
        <div className="fm-checkout-selected-course">
          <img alt="" src={courseThumb(selected, settings) || ''} />
          <strong>{selected.title}</strong>
          <button onClick={() => setChoosing(true)} type="button">Trocar</button>
        </div>
      ) : null}
      {choosing ? (
        <>
          <label className="fm-checkout-course-search"><Search size={14} /><input onChange={(e) => onSearchChange(e.target.value)} placeholder="Pesquisar curso" value={searchValue} /></label>
          <div className="fm-checkout-course-options">
            {filtered.map((c) => (
              <button className={Number(c.id) === Number(value) ? 'is-selected' : ''} key={c.id} onClick={() => { onSelect(c.id); setChoosing(false); }} type="button">
                <img alt="" src={courseThumb(c, settings) || ''} />
                <span>{c.title}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}
      {selected && typeof onPriceChange === 'function' ? (
        <label className="fm-checkout-field fm-checkout-price-field">
          <span>Valor</span>
          <div className="fm-checkout-price-input"><span>R$</span><input inputMode="numeric" onChange={(e) => onPriceChange(parsePriceBR(e.target.value))} value={formatPriceBR(price)} /></div>
        </label>
      ) : null}
    </div>
  );
}

// ─── notification config ──────────────────────────────────────────────────────

function NotificationConfigCard({ enabled = false, icon: Icon, onChange, template = 'default', templateOptions = [], type = 'email' }) {
  const isEmail = type === 'email';
  return (
    <article className="fm-payment-config-card">
      <div className="fm-payment-config-card__head">
        <Icon size={18} />
        <strong>{isEmail ? 'Email' : 'WhatsApp'}</strong>
        {isEmail ? <span className="fm-payment-default-badge">Padrão</span> : null}
        <label className="fm-switch"><input checked={enabled} onChange={(e) => onChange(isEmail ? { email_notifications_enabled: e.target.checked } : { whatsapp_notifications_enabled: e.target.checked })} type="checkbox" /><span /></label>
      </div>
      {enabled ? (
        <div className="fm-payment-config-card__fields">
          {isEmail ? (
            <label><span>Modelo de email</span><select onChange={(e) => onChange({ email_template: e.target.value })} value={template}>{templateOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
          ) : (
            <div className="fm-checkout-notification-note"><span>Canal preparado</span><p>O envio por WhatsApp será conectado nas próximas etapas.</p></div>
          )}
        </div>
      ) : null}
    </article>
  );
}

// ─── main module ──────────────────────────────────────────────────────────────

export default function CloudCheckoutsModule() {
  const [checkouts, setCheckouts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(emptyCheckout);
  const [viewMode, setViewMode] = useState('list');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingTestimonials, setEditingTestimonials] = useState({});
  const [courseSearch, setCourseSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setError('');
    try {
      const [checkoutData, coursesData, gatewaysData] = await Promise.all([
        apiFetch('/api/checkouts'),
        apiFetch('/api/courses'),
        apiFetch('/api/checkouts/gateways'),
      ]);
      const checkoutList = Array.isArray(checkoutData?.items) ? checkoutData.items : (Array.isArray(checkoutData) ? checkoutData : []);
      setCheckouts(checkoutList);
      const courseList = Array.isArray(coursesData?.courses) ? coursesData.courses : (Array.isArray(coursesData) ? coursesData : []);
      setCourses(courseList.filter((c) => c.status === 'published'));
      const gatewayList = Array.isArray(gatewaysData?.gateways) ? gatewaysData.gateways : (Array.isArray(gatewaysData) ? gatewaysData : []);
      setGateways(gatewayList);
    } catch (err) {
      setError(err.message || 'Falha ao carregar checkouts.');
    }
  }

  const filteredCheckouts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return checkouts.filter((c) => !term || String(c.name || '').toLowerCase().includes(term));
  }, [checkouts, search]);

  const draftSettings = useMemo(() => normalizeSettings(draft.settings), [draft.settings]);

  const draftCourseIds = useMemo(() => {
    const ids = [Number(draft.main_course_id) || 0, ...((draft.extra_courses || []).map((item) => Number(item.course_id) || 0))];
    return ids.filter((id, i) => id > 0 && ids.indexOf(id) === i);
  }, [draft.main_course_id, draft.extra_courses]);

  const selectedCourses = useMemo(() => draftCourseIds.map((id) => courses.find((c) => Number(c.id) === id)).filter(Boolean), [courses, draftCourseIds]);

  const configuredOrderBumps = useMemo(() => draftSettings.order_bumps.map((ob) => {
    const course = courses.find((c) => Number(c.id) === Number(ob.course_id));
    return { ...ob, course_title: ob.course_title || course?.title || 'Curso adicional', course_cover_image_url: ob.course_cover_image_url || courseThumb(course || {}, draftSettings) };
  }), [courses, draftSettings]);

  const activeMethods = normalizePaymentMethods(draft.payment_methods).filter((m) => m.enabled);
  const cardConfig = draft.payment_methods.find((m) => m.id === 'card') || emptyCheckout.payment_methods[0];
  const gatewayConfig = gateways.find((g) => g.id === draft.gateway_id) || {};
  const isMercadoPago = draft.gateway_id === 'mercadopago';
  const financingMode = isMercadoPago ? (gatewayConfig.financing_mode || 'mercadopago') : 'free_members';
  const previewOrderBump = configuredOrderBumps[0] || null;
  const publicUrl = draft.public_url || (draft.slug ? `/checkout/${draft.slug}` : '');

  function updateDraft(patch) { setDraft((c) => ({ ...c, ...patch })); }
  function updateMethod(id, patch) { updateDraft({ payment_methods: normalizePaymentMethods(draft.payment_methods).map((m, i) => { if (m.id !== id) return patch.default ? { ...m, default: false } : m; return { ...m, ...patch, enabled: i === 0 ? true : patch.enabled ?? m.enabled }; }) }); }
  function movePaymentMethod(from, to) { updateDraft({ payment_methods: normalizePaymentMethods(moveItem(normalizePaymentMethods(draft.payment_methods), from, to)) }); }
  function moveContentBlock(from, to) { const s = normalizeSettings(draft.settings); updateSettings({ content_order: moveItem(s.content_order, from, to) }); }
  function updateSettings(patch) { updateDraft({ settings: normalizeSettings({ ...(draft.settings || {}), ...patch }) }); }
  function updateTestimonial(index, patch) { const ts = [...normalizeSettings(draft.settings).testimonials]; ts[index] = { ...(ts[index] || {}), ...patch }; updateSettings({ testimonials: ts }); }
  function addTestimonial() { const i = normalizeSettings(draft.settings).testimonials.length; updateSettings({ testimonials: [...normalizeSettings(draft.settings).testimonials, { enabled: true, image_url: '', rating: 5, name: 'Nome', text: 'descrição' }] }); setEditingTestimonials((c) => ({ ...c, [i]: true })); }
  function removeTestimonial(index) { updateSettings({ testimonials: normalizeSettings(draft.settings).testimonials.filter((_, i) => i !== index) }); }
  function addOrderBump() {
    const obs = normalizeOrderBumps(draftSettings.order_bumps);
    if (obs.length >= MAX_ORDER_BUMPS) return;
    updateSettings({ order_bumps: [...obs, { id: `bump-${Date.now()}`, course_id: 0, price: 0, anchor_price_enabled: false, anchor_price: 0, title: '', description: '' }] });
  }
  function updateOrderBump(index, patch) {
    const obs = normalizeOrderBumps(draftSettings.order_bumps);
    updateSettings({ order_bumps: obs.map((ob, i) => { if (i !== index) return ob; const next = { ...ob, ...patch }; const c = courses.find((course) => Number(course.id) === Number(next.course_id)); return { ...next, course_title: next.course_title || c?.title || '', course_cover_image_url: next.course_cover_image_url || courseThumb(c || {}, draftSettings), anchor_price_enabled: !!next.anchor_price_enabled, anchor_price: next.anchor_price_enabled ? Math.max(Number(next.anchor_price || 0), Number(next.price || 0)) : 0 }; }) });
  }
  function removeOrderBump(index) { updateSettings({ order_bumps: normalizeOrderBumps(draftSettings.order_bumps).filter((_, i) => i !== index) }); }
  function availableOrderBumpCourses(index) {
    const usedIds = normalizeOrderBumps(draftSettings.order_bumps).filter((_, i) => i !== index).map((ob) => Number(ob.course_id || 0)).filter(Boolean);
    return courses.filter((c) => { const id = Number(c.id); const isCurrent = id === Number(draftSettings.order_bumps[index]?.course_id || 0); return isCurrent || (!draftCourseIds.includes(id) && !usedIds.includes(id)); });
  }
  function setMainCourse(courseId) { const id = Number(courseId) || 0; updateDraft({ main_course_id: id, extra_courses: (draft.extra_courses || []).filter((item) => Number(item.course_id) !== id) }); }
  function addExtraCourse() { updateDraft({ extra_courses: [...(draft.extra_courses || []), { course_id: 0, delay_days: 0 }] }); }
  function updateExtraCourse(index, patch) { updateDraft({ extra_courses: (draft.extra_courses || []).map((item, i) => (i === index ? { ...item, ...patch } : item)) }); }
  function removeExtraCourse(index) { updateDraft({ extra_courses: (draft.extra_courses || []).filter((_, i) => i !== index) }); }

  function createCheckout() { setSelectedId(null); setDraft({ ...emptyCheckout, main_course_id: courses[0]?.id ? Number(courses[0].id) : 0, extra_courses: [], payment_methods: normalizePaymentMethods(emptyCheckout.payment_methods) }); setViewMode('edit'); setMessage(''); setError(''); }
  function editCheckout(checkout) { setSelectedId(checkout.id); setDraft(normalizeCheckout(checkout)); setViewMode('edit'); setMessage(''); setError(''); setOpenMenuId(null); }

  async function deleteCheckout(checkout) {
    setOpenMenuId(null);
    if (!window.confirm(`Apagar o checkout "${checkout.name}"?`)) return;
    try {
      await apiFetch(`/api/checkouts/${checkout.id}`, { method: 'DELETE' });
      setCheckouts((items) => items.filter((item) => Number(item.id) !== Number(checkout.id)));
      setViewMode('list');
    } catch (err) { setError(err.message || 'Nao foi possivel apagar o checkout.'); }
  }

  async function copyCheckoutLink(checkout) {
    const url = checkout.public_url || `${window.location.origin}/checkout/${checkout.slug}`;
    setOpenMenuId(null);
    try { await navigator.clipboard.writeText(url); setMessage('Link copiado'); }
    catch { window.prompt('Copie o link do checkout:', url); }
  }

  function openCheckout(checkout) { setOpenMenuId(null); window.open(checkout.public_url || `/checkout/${checkout.slug}`, '_blank', 'noopener,noreferrer'); }

  async function saveCheckout() {
    setSaving(true); setMessage(''); setError('');
    try {
      const mainId = Number(draft.main_course_id) || 0;
      const extras = (draft.extra_courses || []).map((item) => Number(item.course_id) || 0).filter((id) => id > 0 && id !== mainId);
      const courseIds = [mainId, ...extras].filter((id, i, arr) => id > 0 && arr.indexOf(id) === i);
      const courseDelays = {};
      (draft.extra_courses || []).forEach((item) => { const id = Number(item.course_id) || 0; if (id > 0 && id !== mainId) courseDelays[id] = Math.max(0, parseInt(item.delay_days, 10) || 0); });
      const payload = { ...draft, price: Number(draft.price || 0), course_ids: courseIds, payment_methods: normalizePaymentMethods(draft.payment_methods), settings: { ...normalizeSettings(draft.settings), course_delays: courseDelays } };
      const saved = selectedId
        ? await apiFetch(`/api/checkouts/${selectedId}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await apiFetch('/api/checkouts', { method: 'POST', body: JSON.stringify(payload) });
      setSelectedId(saved.id);
      setDraft(normalizeCheckout(saved));
      setCheckouts((items) => [saved, ...items.filter((item) => Number(item.id) !== Number(saved.id))]);
      setMessage('Salvo agora');
      setViewMode('list');
    } catch (err) { setError(err.message || 'Nao foi possivel salvar o checkout.'); }
    finally { setSaving(false); }
  }

  return (
    <section className={`fm-checkouts-screen ${viewMode === 'list' ? 'is-listing' : 'is-editing'}`}>
      <aside className="fm-checkouts-list">
        <div className="fm-checkouts-list__head"><h2>Seus checkouts</h2></div>
        <button className="fm-checkouts-create" onClick={createCheckout} type="button"><Plus size={16} />Criar checkout</button>
        <label className="fm-checkouts-search">
          <span>Buscar checkout...</span>
          <input onChange={(e) => setSearch(e.target.value)} value={search} />
          <Search size={16} />
        </label>
        <div className="fm-checkouts-shortcuts">
          <button type="button"><Ticket size={15} />Pixels</button>
          <button type="button"><Tag size={15} />Cupons</button>
        </div>
        <div className="fm-checkouts-items">
          {filteredCheckouts.map((c) => (
            <button className={`fm-checkout-item ${Number(selectedId) === Number(c.id) ? 'is-active' : ''}`} key={c.id} onClick={() => editCheckout(c)} type="button">
              <span className="fm-checkout-item__thumb">{c.banner_url ? <img alt="" src={c.banner_url} /> : <CreditCard size={18} />}</span>
              <span className="fm-checkout-item__copy"><strong>{c.name}</strong><small>{money(c.price, c.currency)} · {c.status === 'active' ? 'Ativo' : 'Rascunho'}</small></span>
              <span className="fm-checkout-item__more"><MoreHorizontal size={16} /></span>
            </button>
          ))}
          {!filteredCheckouts.length ? <p className="fm-checkouts-empty">Nenhum checkout criado ainda.</p> : null}
        </div>
      </aside>

      {viewMode === 'list' ? (
        <main className="fm-checkouts-board">
          <header className="fm-checkouts-board__head">
            <div><h1>Checkouts</h1><p>Gerencie seus checkouts públicos, links e status de pagamento.</p></div>
            <button className="fm-checkouts-create" onClick={createCheckout} type="button"><Plus size={16} />Criar checkout</button>
          </header>
          {error ? <div className="fm-checkout-error">{error}</div> : null}
          {message ? <div className="fm-checkout-success">{message}</div> : null}
          <div className="fm-checkout-board-grid">
            {filteredCheckouts.map((c) => (
              <article className="fm-checkout-board-card" key={c.id}>
                <div className="fm-checkout-board-card__media">
                  {c.banner_url ? <img alt="" src={c.banner_url} /> : <CreditCard size={24} />}
                  <button onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)} type="button"><MoreHorizontal size={18} /></button>
                  {openMenuId === c.id ? (
                    <div className="fm-checkout-card-menu">
                      <button onClick={() => openCheckout(c)} type="button">Ir para o checkout</button>
                      <button onClick={() => copyCheckoutLink(c)} type="button">Copiar link</button>
                      <button onClick={() => editCheckout(c)} type="button">Editar</button>
                      <button onClick={() => deleteCheckout(c)} type="button">Apagar</button>
                    </div>
                  ) : null}
                </div>
                <div className="fm-checkout-board-card__body">
                  <span>{c.status === 'active' ? 'Ativo' : 'Rascunho'}</span>
                  <h2>{c.name}</h2>
                  <p>{money(c.price, c.currency)} · {(c.courses || []).length || c.course_ids?.length || 0} cursos</p>
                  <small>{c.public_url || `/checkout/${c.slug}`}</small>
                </div>
                <footer>
                  <button onClick={() => editCheckout(c)} type="button">Editar checkout</button>
                  <button onClick={() => openCheckout(c)} type="button">Abrir</button>
                </footer>
              </article>
            ))}
            {!filteredCheckouts.length ? (
              <div className="fm-checkout-board-empty">
                <CreditCard size={28} />
                <h2>Nenhum checkout criado ainda</h2>
                <p>Crie o primeiro checkout para gerar uma slug pública de pagamento.</p>
                <button className="fm-checkouts-create" onClick={createCheckout} type="button"><Plus size={16} />Criar checkout</button>
              </div>
            ) : null}
          </div>
        </main>
      ) : (
        <>
          <main className="fm-checkout-editor">
            <header className="fm-checkout-editor__top">
              <div><h1>Editor de checkout</h1><span className="fm-checkout-save-state">{message || 'Salvo há 2 min'}</span></div>
              <div className="fm-checkout-editor__actions">
                <button className="fm-checkout-light-btn" type="button">Ações</button>
                <button className="fm-checkout-light-btn" onClick={() => setViewMode('list')} type="button">Voltar</button>
              </div>
            </header>
            {error ? <div className="fm-checkout-error">{error}</div> : null}

            <section className="fm-checkout-card fm-checkout-card--info">
              <h3><BookOpen size={16} />Informações do checkout</h3>
              <label className="fm-checkout-field is-full"><span>Nome do checkout</span><input onChange={(e) => updateDraft({ name: e.target.value })} value={draft.name} /></label>
              <div className="fm-checkout-grid fm-checkout-grid--course-only">
                <CoursePicker courses={courses} label="Curso principal" onImageChange={() => {}} onPriceChange={(v) => updateDraft({ price: v })} onSearchChange={setCourseSearch} onSelect={setMainCourse} price={draft.price} searchValue={courseSearch} settings={draftSettings} value={draft.main_course_id || ''} />
              </div>
              <div className="fm-checkout-extra-courses">
                {(draft.extra_courses || []).map((item, i) => (
                  <div className="fm-checkout-extra-course" key={i}>
                    <CoursePicker courses={courses.filter((c) => Number(c.id) === Number(item.course_id) || !draftCourseIds.includes(Number(c.id)))} label="Curso adicional" onImageChange={() => {}} onSearchChange={setCourseSearch} onSelect={(id) => updateExtraCourse(i, { course_id: Number(id) || 0 })} searchValue={courseSearch} settings={draftSettings} value={item.course_id || ''} />
                    <label className="fm-checkout-delay"><input inputMode="numeric" onChange={(e) => updateExtraCourse(i, { delay_days: Math.max(0, parseInt(e.target.value, 10) || 0) })} value={item.delay_days || 0} /><span>dias</span></label>
                    <button className="fm-checkout-extra-remove" onClick={() => removeExtraCourse(i)} type="button"><X size={14} /></button>
                  </div>
                ))}
                <button className="fm-checkout-add-course" onClick={addExtraCourse} type="button"><Plus size={14} />Inserir mais cursos</button>
              </div>
            </section>

            <section className="fm-checkout-card fm-checkout-card--payments">
              <h3><Wallet size={16} />Pagamentos</h3>
              <div className="fm-checkout-grid">
                <label className="fm-checkout-field"><span>Gateway de pagamento</span><select onChange={(e) => updateDraft({ gateway_id: e.target.value })} value={draft.gateway_id}>{gateways.length ? gateways.map((g) => <option key={g.id} value={g.id}>{g.name}</option>) : <option value="mercadopago">Mercado Pago</option>}</select></label>
                <div className="fm-checkout-field"><span>Documento permitido</span><div className="fm-checkout-docs">{[['cpf', 'CPF'], ['cnpj', 'CNPJ'], ['both', 'Ambos']].map(([v, l]) => <button className={draft.document_mode === v ? 'is-active' : ''} key={v} onClick={() => updateDraft({ document_mode: v })} type="button">{l}</button>)}</div></div>
              </div>
              {!gateways.length ? <p className="fm-checkout-warning">Configure um gateway em Integrações para ativar pagamentos.</p> : null}
              <div className="fm-payment-config-list">
                {normalizePaymentMethods(draft.payment_methods).map((method, i) => (
                  <PaymentMethodConfigCard canDisable={i > 0} financingMode={financingMode} gatewayId={draft.gateway_id} index={i} key={method.id} method={method} onChange={(patch) => updateMethod(method.id, patch)} onMove={movePaymentMethod} price={draft.price} />
                ))}
              </div>
            </section>

            <section className="fm-checkout-card fm-checkout-card--order-bumps">
              <div className="fm-checkout-card__heading">
                <h3><Tag size={16} />Order Bumps</h3>
                <label className="fm-switch"><input checked={!!draftSettings.order_bumps_enabled} onChange={(e) => updateSettings({ order_bumps_enabled: e.target.checked })} type="checkbox" /><span /></label>
              </div>
              <p className="fm-checkout-order-bump-note">Configure até {MAX_ORDER_BUMPS} ofertas adicionais.</p>
              {draftSettings.order_bumps_enabled ? (
                <div className="fm-checkout-order-bumps-editor">
                  <div className="fm-checkout-order-bumps-list">
                    {draftSettings.order_bumps.map((ob, i) => <OrderBumpEditorCard courses={availableOrderBumpCourses(i)} key={ob.id || i} onChange={(patch) => updateOrderBump(i, patch)} onRemove={() => removeOrderBump(i)} orderBump={configuredOrderBumps[i] || ob} />)}
                    <button className="fm-checkout-add-course fm-checkout-add-bump" disabled={draftSettings.order_bumps.length >= MAX_ORDER_BUMPS} onClick={addOrderBump} type="button"><Plus size={14} />{draftSettings.order_bumps.length >= MAX_ORDER_BUMPS ? 'Limite de 10 order bumps' : 'Adicionar order bump'}</button>
                  </div>
                  <div className="fm-checkout-order-bump-visuals">
                    <div className="fm-checkout-order-bump-visuals__header"><strong>Opções visuais</strong><small>Aplicadas a todos os order bumps deste checkout.</small></div>
                    <div className="fm-checkout-grid">
                      <label className="fm-checkout-field fm-checkout-color-field"><span>Cor principal</span><div className="fm-checkout-color-input"><input onChange={(e) => updateSettings({ order_bump_primary_color: e.target.value })} type="color" value={draftSettings.order_bump_primary_color || '#16a34a'} /><code>{draftSettings.order_bump_primary_color || '#16a34a'}</code></div></label>
                    </div>
                    <div className="fm-checkout-order-bump-styles">{ORDER_BUMP_STYLE_OPTIONS.map((s) => <button className={draftSettings.order_bump_style === s.value ? 'is-active' : ''} key={s.value} onClick={() => updateSettings({ order_bump_style: s.value })} type="button">{s.label}</button>)}</div>
                    <OrderBumpPreviewCard orderBump={previewOrderBump} settings={draftSettings} />
                  </div>
                </div>
              ) : null}
            </section>

            <section className="fm-checkout-card fm-checkout-card--visual">
              <div className="fm-checkout-card__heading">
                <h3><ImageIcon size={16} />Visual</h3>
                <label className="fm-switch"><input checked={draft.banner_enabled} onChange={(e) => updateDraft({ banner_enabled: e.target.checked })} type="checkbox" /><span /></label>
              </div>
              <div className="fm-checkout-visual-row is-banner">
                <div className="fm-checkout-visual-main">
                  <div className="fm-checkout-toggle-title"><strong>Banner</strong><small>Imagem de destaque do seu checkout</small></div>
                  {draft.banner_enabled ? <CloudMediaField label="" onChange={(file) => updateDraft({ banner_url: file.url })} previewUrl={draft.banner_url} /> : null}
                </div>
              </div>
            </section>

            <section className="fm-checkout-card fm-checkout-card--content">
              <div className="fm-checkout-card__heading"><h3><LayoutPanelTop size={16} />Conteúdos</h3></div>
              {draftSettings.content_order.map((blockId, i) => (
                <ContentBlockEditor addTestimonial={addTestimonial} blockId={blockId} editingTestimonials={editingTestimonials} index={i} key={blockId} onMove={moveContentBlock} removeTestimonial={removeTestimonial} setEditingTestimonials={setEditingTestimonials} settings={draftSettings} updateSettings={updateSettings} updateTestimonial={updateTestimonial} />
              ))}
            </section>

            <section className="fm-checkout-card fm-checkout-card--notifications">
              <div className="fm-checkout-card__heading"><h3><Mail size={16} />Notificações</h3></div>
              <div className="fm-payment-config-list">
                <NotificationConfigCard enabled={!!draftSettings.email_notifications_enabled} icon={Mail} onChange={updateSettings} template={draftSettings.email_template || 'default'} templateOptions={emailTemplateOptions} type="email" />
                <NotificationConfigCard enabled={!!draftSettings.whatsapp_notifications_enabled} icon={MessageCircle} onChange={updateSettings} type="whatsapp" />
              </div>
            </section>

            <section className="fm-checkout-card fm-checkout-card--triggers">
              <div className="fm-checkout-card__heading"><h3><TimerIcon size={16} />Gatilhos</h3></div>
              <div className="fm-checkout-extra-row">
                <div className="fm-checkout-toggle-title"><strong>Contador Regressivo</strong><small>Mostra uma barra de urgência no topo do checkout.</small></div>
                <label className="fm-switch"><input checked={!!draftSettings.timer_enabled} onChange={(e) => updateSettings({ timer_enabled: e.target.checked })} type="checkbox" /><span /></label>
              </div>
              {draftSettings.timer_enabled ? (
                <div className="fm-checkout-trigger-fields">
                  <label><span>Tempo de expiração</span><div><input onChange={(e) => updateSettings({ timer_minutes: parseInt(e.target.value, 10) || 1 })} value={draftSettings.timer_minutes} /><small>minutos</small></div></label>
                  <label><span>Mensagem</span><textarea onChange={(e) => updateSettings({ timer_message: e.target.value })} value={draftSettings.timer_message} /></label>
                </div>
              ) : null}
            </section>

            <footer className="fm-checkout-editor__footer">
              <button className="fm-checkout-light-btn" onClick={() => setViewMode('list')} type="button">Cancelar</button>
              <button className="fm-checkout-save-btn" disabled={saving} onClick={saveCheckout} type="button">{saving ? 'Salvando...' : selectedId ? 'Salvar checkout' : 'Criar checkout'}</button>
            </footer>
          </main>

          <aside className="fm-checkout-preview-panel">
            <header>
              <h2>Pré-visualização</h2>
              <div>{publicUrl ? <a href={publicUrl} rel="noreferrer" target="_blank">Abrir em nova aba <ExternalLink size={14} /></a> : null}</div>
            </header>
            <CheckoutPreview activeMethods={activeMethods} cardConfig={cardConfig} checkout={{ ...draft, courses: selectedCourses, settings: draftSettings }} financingMode={financingMode} />
          </aside>
        </>
      )}
    </section>
  );
}
