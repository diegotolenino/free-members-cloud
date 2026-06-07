export interface Env {
  DB: D1Database;
  ASSETS?: R2Bucket;
  APP_ENV: string;
  APP_VERSION: string;
}

type JsonValue = Record<string, unknown> | Array<unknown>;

const SESSION_COOKIE = 'fm_cloud_session';
const SESSION_DAYS = 30;
const PASSWORD_ITERATIONS = 100000;

function json(data: JsonValue, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  });
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function randomToken(bytes = 32): string {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return bytesToBase64(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return bytesToBase64(new Uint8Array(digest));
}

async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PASSWORD_ITERATIONS },
    key,
    256
  );
  return `pbkdf2_sha256$${PASSWORD_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(new Uint8Array(bits))}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2_sha256') {
    return false;
  }
  const iterations = Number(parts[1] || 0);
  if (!Number.isFinite(iterations) || iterations < 1) {
    return false;
  }
  const salt = base64ToBytes(parts[2]);
  const expected = parts[3];
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    256
  );
  return constantTimeEqual(bytesToBase64(new Uint8Array(bits)), expected);
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

function parseCookies(request: Request): Record<string, string> {
  const header = request.headers.get('Cookie') || '';
  return Object.fromEntries(
    header.split(';').map((item) => {
      const [name, ...value] = item.trim().split('=');
      return [name, decodeURIComponent(value.join('=') || '')];
    }).filter(([name]) => Boolean(name))
  );
}

function sessionCookie(token: string, request: Request): string {
  const url = new URL(request.url);
  const secure = url.protocol === 'https:' ? '; Secure' : '';
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function clearSessionCookie(request: Request): string {
  const url = new URL(request.url);
  const secure = url.protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

function futureDate(days: number): string {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar_url: string | null;
}

async function currentUser(request: Request, env: Env): Promise<{ user: CurrentUser | null; tokenHash: string }> {
  const token = parseCookies(request)[SESSION_COOKIE] || '';
  if (!token) {
    return { user: null, tokenHash: '' };
  }

  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(
    `select users.id, users.name, users.email, users.role, users.status, users.avatar_url
     from sessions
     inner join users on users.id = sessions.user_id
     where sessions.token_hash = ? and sessions.expires_at > datetime('now') and users.status = 'active'
     limit 1`
  ).bind(tokenHash).first<CurrentUser>();

  return { user: row || null, tokenHash };
}

async function requireUser(request: Request, env: Env): Promise<CurrentUser | Response> {
  const { user } = await currentUser(request, env);
  if (!user) {
    return json({ error: 'not_authenticated', message: 'Usuario nao autenticado.' }, { status: 401 });
  }
  return user;
}

function isAdminRole(role: string): boolean {
  return ['owner', 'admin', 'teacher'].includes(role);
}

async function requireAdmin(request: Request, env: Env): Promise<CurrentUser | Response> {
  const user = await requireUser(request, env);
  if (user instanceof Response) {
    return user;
  }
  if (!isAdminRole(user.role)) {
    return json({ error: 'forbidden', message: 'Permissao insuficiente.' }, { status: 403 });
  }
  return user;
}

async function hasOwner(env: Env): Promise<boolean> {
  const row = await env.DB.prepare("select id from users where role = 'owner' limit 1").first<{ id: number }>();
  return Boolean(row?.id);
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'curso';
}

async function uniqueCourseSlug(env: Env, base: string, ignoreId = 0): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let index = 2;

  while (true) {
    const existing = await env.DB.prepare('select id from courses where slug = ? and id <> ? limit 1').bind(candidate, ignoreId).first<{ id: number }>();
    if (!existing?.id) {
      return candidate;
    }
    candidate = `${root}-${index}`;
    index += 1;
  }
}

function coursePayload(payload: Record<string, unknown>): {
  title: string;
  slug: string;
  excerpt: string;
  description_html: string;
  status: string;
  visibility: string;
  cover_image_url: string;
  banner_image_url: string;
  module_covers_enabled: number;
  appearance_json: string;
} {
  const title = text(payload.title);
  const status = ['draft', 'published', 'archived'].includes(text(payload.status)) ? text(payload.status) : 'draft';
  const visibility = ['public', 'private'].includes(text(payload.visibility)) ? text(payload.visibility) : 'private';

  return {
    title,
    slug: text(payload.slug),
    excerpt: text(payload.excerpt),
    description_html: typeof payload.description_html === 'string' ? payload.description_html : (typeof payload.description === 'string' ? payload.description : ''),
    status,
    visibility,
    cover_image_url: text(payload.cover_image_url),
    banner_image_url: text(payload.banner_image_url),
    module_covers_enabled: positiveInt(payload.module_covers_enabled),
    appearance_json: JSON.stringify(payload.appearance_settings || payload.appearance_json || {}),
  };
}

function contentStatus(value: unknown, fallback = 'draft'): string {
  const status = text(value);
  return ['draft', 'published', 'archived'].includes(status) ? status : fallback;
}

function positiveInt(value: unknown, fallback = 0): number {
  const number = typeof value === 'number' ? value : Number(text(value));
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
}

async function courseExists(env: Env, courseId: number): Promise<boolean> {
  const course = await env.DB.prepare('select id from courses where id = ? limit 1').bind(courseId).first<{ id: number }>();
  return Boolean(course?.id);
}

async function moduleExists(env: Env, moduleId: number, courseId: number): Promise<boolean> {
  const module = await env.DB.prepare('select id from modules where id = ? and course_id = ? limit 1').bind(moduleId, courseId).first<{ id: number }>();
  return Boolean(module?.id);
}

async function sectionExists(env: Env, sectionId: number, courseId: number): Promise<boolean> {
  if (!sectionId) {
    return true;
  }
  const section = await env.DB.prepare('select id from course_sections where id = ? and course_id = ? limit 1').bind(sectionId, courseId).first<{ id: number }>();
  return Boolean(section?.id);
}

function notFound(): Response {
  return json({ error: 'not_found', message: 'Rota nao encontrada.' }, { status: 404 });
}

async function health(env: Env): Promise<Response> {
  const database = await env.DB.prepare('select 1 as ok').first<{ ok: number }>();
  return json({
    ok: true,
    app: 'free-members-cloud',
    version: env.APP_VERSION,
    environment: env.APP_ENV,
    database: database?.ok === 1 ? 'ok' : 'unknown',
  });
}

async function bootstrap(request: Request, env: Env): Promise<Response> {
  const settings = await env.DB.prepare('select key, value_json from settings').all<{ key: string; value_json: string }>();
  const ownerExists = await hasOwner(env);
  const { user } = await currentUser(request, env);
  const mapped = Object.fromEntries(
    (settings.results || []).map((item) => {
      try {
        return [item.key, JSON.parse(item.value_json)];
      } catch {
        return [item.key, null];
      }
    })
  );

  return json({
    app: {
      name: 'Free Members',
      version: env.APP_VERSION,
    },
    settings: mapped,
    installation: {
      has_owner: ownerExists,
      requires_setup: !ownerExists,
    },
    current_user: user,
  });
}

async function courses(env: Env): Promise<Response> {
  const rows = await env.DB.prepare(
    `select
      courses.id,
      courses.title,
      courses.slug,
      courses.excerpt,
      courses.description_html,
      courses.status,
      courses.visibility,
      courses.cover_image_url,
      courses.created_at,
      courses.updated_at,
      (select count(*) from modules where modules.course_id = courses.id and modules.status <> 'archived') as modules_count,
      (select count(*) from lessons where lessons.course_id = courses.id and lessons.status <> 'archived') as lessons_count
     from courses
     where courses.status <> ?
     order by courses.updated_at desc, courses.id desc`
  ).bind('archived').all();

  const mapped = (rows.results || []).map((course: Record<string, unknown>) => ({
    ...course,
    description: course.description_html || course.excerpt || '',
    cover_image_thumb_url: course.cover_image_url || '',
    cover_image_id: Number(course.cover_image_id || (course.cover_image_url ? course.id || 0 : 0)),
    stats: {
      modules: Number(course.modules_count || 0),
      lessons: Number(course.lessons_count || 0),
    },
  }));

  return json({ courses: mapped });
}

function buildAdminCourseTree(course: Record<string, unknown>, sections: Record<string, unknown>[], modules: Record<string, unknown>[], lessons: Record<string, unknown>[]): Record<string, unknown> {
  const normalizedLessons: Record<string, unknown>[] = lessons.map((lesson) => ({
    ...lesson,
    excerpt: lesson.description_html || '',
    content_type: 'video',
    content_source: lesson.video_provider || 'external_url',
    content_url: lesson.video_url || '',
    is_preview: 0,
    materials: typeof lesson.materials_json === 'string' ? JSON.parse(String(lesson.materials_json || '[]')) : [],
  }));
  const modulesWithLessons: Record<string, unknown>[] = modules.map((module) => ({
    ...module,
    section_id: module.section_id || '',
    cover_image_thumb_url: module.cover_image_url || '',
    cover_image_id: Number(module.cover_image_id || (module.cover_image_url ? module.id || 0 : 0)),
    lessons: normalizedLessons.filter((lesson) => Number(lesson.module_id || 0) === Number(module.id || 0)),
  }));
  const sectionsWithModules = sections.map((section) => ({
    ...section,
    modules: modulesWithLessons.filter((module) => Number(module.section_id || 0) === Number(section.id || 0)),
  }));

  return {
    ...course,
    description: course.description_html || course.excerpt || '',
    cover_image_thumb_url: course.cover_image_url || '',
    cover_image_id: Number(course.cover_image_id || (course.cover_image_url ? course.id || 0 : 0)),
    appearance_settings: typeof course.appearance_json === 'string' ? JSON.parse(String(course.appearance_json || '{}')) : course.appearance_json || {},
    sections: sectionsWithModules,
    modules: modulesWithLessons,
    stats: {
      modules: modulesWithLessons.filter((module) => module.status !== 'archived').length,
      lessons: normalizedLessons.filter((lesson) => lesson.status !== 'archived').length,
    },
  };
}

async function courseDetail(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) {
    return admin;
  }

  const course = await env.DB.prepare('select * from courses where id = ? limit 1').bind(id).first();
  if (!course) {
    return json({ error: 'course_not_found', message: 'Curso nao encontrado.' }, { status: 404 });
  }

  const [sections, modules, lessons] = await Promise.all([
    env.DB.prepare('select * from course_sections where course_id = ? order by sort_order asc, id asc').bind(id).all(),
    env.DB.prepare('select * from modules where course_id = ? order by sort_order asc, id asc').bind(id).all(),
    env.DB.prepare('select * from lessons where course_id = ? order by sort_order asc, id asc').bind(id).all(),
  ]);

  const courseTree = buildAdminCourseTree(
    course as Record<string, unknown>,
    (sections.results || []) as Record<string, unknown>[],
    (modules.results || []) as Record<string, unknown>[],
    (lessons.results || []) as Record<string, unknown>[]
  );

  return json({
    course: courseTree,
    sections: sections.results || [],
    modules: modules.results || [],
    lessons: lessons.results || [],
  });
}

async function publicCourse(env: Env, slug: string): Promise<Response> {
  const course = await env.DB.prepare(
    "select id, title, slug, excerpt, description_html, visibility, cover_image_url, banner_image_url, appearance_json from courses where slug = ? and status = 'published' limit 1"
  ).bind(slug).first<{ id: number }>();
  if (!course) {
    return json({ error: 'course_not_found', message: 'Curso nao encontrado.' }, { status: 404 });
  }

  const [sections, modules, lessons] = await Promise.all([
    env.DB.prepare("select id, title, sort_order from course_sections where course_id = ? and status = 'published' order by sort_order asc, id asc").bind(course.id).all(),
    env.DB.prepare("select id, section_id, title, description, cover_image_url, sort_order from modules where course_id = ? and status = 'published' order by sort_order asc, id asc").bind(course.id).all(),
    env.DB.prepare("select id, module_id, title, description_html, video_provider, video_url, video_embed_html, duration_seconds, sort_order from lessons where course_id = ? and status = 'published' order by sort_order asc, id asc").bind(course.id).all(),
  ]);

  return json({
    course,
    sections: sections.results || [],
    modules: modules.results || [],
    lessons: lessons.results || [],
  });
}

async function createCourse(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) {
    return admin;
  }

  const payload = coursePayload(await readJson(request));
  if (!payload.title) {
    return json({ error: 'course_title_required', message: 'Informe o nome do curso.' }, { status: 400 });
  }

  const slug = await uniqueCourseSlug(env, payload.slug || payload.title);
  const result = await env.DB.prepare(
    `insert into courses
      (title, slug, excerpt, description_html, status, visibility, cover_image_url, banner_image_url, appearance_json, module_covers_enabled)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    payload.title,
    slug,
    payload.excerpt,
    payload.description_html,
    payload.status,
    payload.visibility,
    payload.cover_image_url,
    payload.banner_image_url,
    payload.appearance_json,
    payload.module_covers_enabled
  ).run();

  const created = await env.DB.prepare('select * from courses where id = ?').bind(result.meta.last_row_id).first();
  return json({ course: created }, { status: 201 });
}

async function updateCourse(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) {
    return admin;
  }

  const existing = await env.DB.prepare('select * from courses where id = ? limit 1').bind(id).first<{ id: number; title: string; slug: string }>();
  if (!existing) {
    return json({ error: 'course_not_found', message: 'Curso nao encontrado.' }, { status: 404 });
  }

  const payload = coursePayload(await readJson(request));
  if (!payload.title) {
    return json({ error: 'course_title_required', message: 'Informe o nome do curso.' }, { status: 400 });
  }

  const slugBase = payload.slug || payload.title;
  const slug = await uniqueCourseSlug(env, slugBase, id);

  await env.DB.prepare(
    `update courses
     set title = ?, slug = ?, excerpt = ?, description_html = ?, status = ?, visibility = ?, cover_image_url = ?, banner_image_url = ?, appearance_json = ?, module_covers_enabled = ?, updated_at = current_timestamp
     where id = ?`
  ).bind(
    payload.title,
    slug,
    payload.excerpt,
    payload.description_html,
    payload.status,
    payload.visibility,
    payload.cover_image_url,
    payload.banner_image_url,
    payload.appearance_json,
    payload.module_covers_enabled,
    id
  ).run();

  const updated = await env.DB.prepare('select * from courses where id = ?').bind(id).first();
  return json({ course: updated });
}

async function archiveCourse(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) {
    return admin;
  }

  await env.DB.prepare("update courses set status = 'archived', updated_at = current_timestamp where id = ?").bind(id).run();
  return json({ archived: true });
}

async function createSection(request: Request, env: Env, courseId: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  if (!(await courseExists(env, courseId))) {
    return json({ error: 'course_not_found', message: 'Curso nao encontrado.' }, { status: 404 });
  }

  const body = await readJson(request);
  const title = text(body.title);
  if (!title) {
    return json({ error: 'section_title_required', message: 'Informe o nome da secao.' }, { status: 400 });
  }

  const result = await env.DB.prepare(
    'insert into course_sections (course_id, title, status, sort_order) values (?, ?, ?, ?)'
  ).bind(courseId, title, contentStatus(body.status, 'published'), positiveInt(body.sort_order)).run();
  const section = await env.DB.prepare('select * from course_sections where id = ?').bind(result.meta.last_row_id).first();
  return json({ section }, { status: 201 });
}

async function updateSection(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const existing = await env.DB.prepare('select * from course_sections where id = ? limit 1').bind(id).first<{ id: number }>();
  if (!existing) {
    return json({ error: 'section_not_found', message: 'Secao nao encontrada.' }, { status: 404 });
  }

  const body = await readJson(request);
  const title = text(body.title);
  if (!title) {
    return json({ error: 'section_title_required', message: 'Informe o nome da secao.' }, { status: 400 });
  }

  await env.DB.prepare(
    'update course_sections set title = ?, status = ?, sort_order = ?, updated_at = current_timestamp where id = ?'
  ).bind(title, contentStatus(body.status, 'published'), positiveInt(body.sort_order), id).run();
  const section = await env.DB.prepare('select * from course_sections where id = ?').bind(id).first();
  return json({ section });
}

async function archiveSection(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  await env.DB.prepare("update course_sections set status = 'archived', updated_at = current_timestamp where id = ?").bind(id).run();
  return json({ archived: true });
}

async function createModule(request: Request, env: Env, courseId: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  if (!(await courseExists(env, courseId))) {
    return json({ error: 'course_not_found', message: 'Curso nao encontrado.' }, { status: 404 });
  }

  const body = await readJson(request);
  const title = text(body.title);
  const sectionId = positiveInt(body.section_id);
  if (!title) {
    return json({ error: 'module_title_required', message: 'Informe o nome do modulo.' }, { status: 400 });
  }
  if (!(await sectionExists(env, sectionId, courseId))) {
    return json({ error: 'section_not_found', message: 'Secao nao encontrada.' }, { status: 404 });
  }

  const result = await env.DB.prepare(
    'insert into modules (course_id, section_id, title, description, status, cover_image_url, sort_order) values (?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    courseId,
    sectionId || null,
    title,
    text(body.description),
    contentStatus(body.status),
    text(body.cover_image_url),
    positiveInt(body.sort_order)
  ).run();
  const module = await env.DB.prepare('select * from modules where id = ?').bind(result.meta.last_row_id).first();
  return json({ module }, { status: 201 });
}

async function updateModule(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const existing = await env.DB.prepare('select * from modules where id = ? limit 1').bind(id).first<{ id: number; course_id: number }>();
  if (!existing) {
    return json({ error: 'module_not_found', message: 'Modulo nao encontrado.' }, { status: 404 });
  }

  const body = await readJson(request);
  const title = text(body.title);
  const sectionId = positiveInt(body.section_id);
  if (!title) {
    return json({ error: 'module_title_required', message: 'Informe o nome do modulo.' }, { status: 400 });
  }
  if (!(await sectionExists(env, sectionId, existing.course_id))) {
    return json({ error: 'section_not_found', message: 'Secao nao encontrada.' }, { status: 404 });
  }

  await env.DB.prepare(
    `update modules
     set section_id = ?, title = ?, description = ?, status = ?, cover_image_url = ?, sort_order = ?, updated_at = current_timestamp
     where id = ?`
  ).bind(sectionId || null, title, text(body.description), contentStatus(body.status), text(body.cover_image_url), positiveInt(body.sort_order), id).run();
  const module = await env.DB.prepare('select * from modules where id = ?').bind(id).first();
  return json({ module });
}

async function archiveModule(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  await env.DB.prepare("update modules set status = 'archived', updated_at = current_timestamp where id = ?").bind(id).run();
  return json({ archived: true });
}

function videoProvider(value: unknown): string {
  const provider = text(value);
  return ['youtube', 'vimeo', 'bunny', 'direct_video', 'embed', 'external_url', 'none'].includes(provider) ? provider : 'external_url';
}

async function createLesson(request: Request, env: Env, courseId: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  if (!(await courseExists(env, courseId))) {
    return json({ error: 'course_not_found', message: 'Curso nao encontrado.' }, { status: 404 });
  }

  const body = await readJson(request);
  const moduleId = positiveInt(body.module_id);
  const title = text(body.title);
  if (!title || !moduleId) {
    return json({ error: 'lesson_required_fields', message: 'Informe modulo e nome da aula.' }, { status: 400 });
  }
  if (!(await moduleExists(env, moduleId, courseId))) {
    return json({ error: 'module_not_found', message: 'Modulo nao encontrado.' }, { status: 404 });
  }

  const result = await env.DB.prepare(
    `insert into lessons
      (course_id, module_id, title, description_html, video_provider, video_url, video_embed_html, duration_seconds, status, materials_json, sort_order)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    courseId,
    moduleId,
    title,
    typeof body.description_html === 'string' ? body.description_html : (typeof body.excerpt === 'string' ? body.excerpt : ''),
    videoProvider(body.video_provider || body.content_source),
    text(body.video_url || body.content_url),
    typeof body.video_embed_html === 'string' ? body.video_embed_html : '',
    positiveInt(body.duration_seconds),
    contentStatus(body.status, 'published'),
    JSON.stringify(Array.isArray(body.materials) ? body.materials : []),
    positiveInt(body.sort_order)
  ).run();
  const lesson = await env.DB.prepare('select * from lessons where id = ?').bind(result.meta.last_row_id).first();
  return json({ lesson }, { status: 201 });
}

async function updateLesson(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const existing = await env.DB.prepare('select * from lessons where id = ? limit 1').bind(id).first<{ id: number; course_id: number }>();
  if (!existing) {
    return json({ error: 'lesson_not_found', message: 'Aula nao encontrada.' }, { status: 404 });
  }

  const body = await readJson(request);
  const moduleId = positiveInt(body.module_id);
  const title = text(body.title);
  if (!title || !moduleId) {
    return json({ error: 'lesson_required_fields', message: 'Informe modulo e nome da aula.' }, { status: 400 });
  }
  if (!(await moduleExists(env, moduleId, existing.course_id))) {
    return json({ error: 'module_not_found', message: 'Modulo nao encontrado.' }, { status: 404 });
  }

  await env.DB.prepare(
    `update lessons
     set module_id = ?, title = ?, description_html = ?, video_provider = ?, video_url = ?, video_embed_html = ?, duration_seconds = ?, status = ?, materials_json = ?, sort_order = ?, updated_at = current_timestamp
     where id = ?`
  ).bind(
    moduleId,
    title,
    typeof body.description_html === 'string' ? body.description_html : (typeof body.excerpt === 'string' ? body.excerpt : ''),
    videoProvider(body.video_provider || body.content_source),
    text(body.video_url || body.content_url),
    typeof body.video_embed_html === 'string' ? body.video_embed_html : '',
    positiveInt(body.duration_seconds),
    contentStatus(body.status, 'published'),
    JSON.stringify(Array.isArray(body.materials) ? body.materials : []),
    positiveInt(body.sort_order),
    id
  ).run();
  const lesson = await env.DB.prepare('select * from lessons where id = ?').bind(id).first();
  return json({ lesson });
}

async function archiveLesson(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  await env.DB.prepare("update lessons set status = 'archived', updated_at = current_timestamp where id = ?").bind(id).run();
  return json({ archived: true });
}

async function createOwner(request: Request, env: Env): Promise<Response> {
  if (await hasOwner(env)) {
    return json({ error: 'owner_exists', message: 'A instalacao ja possui um administrador.' }, { status: 409 });
  }

  const body = await readJson(request);
  const name = text(body.name);
  const email = text(body.email).toLowerCase();
  const password = text(body.password);

  if (!name || !isEmail(email) || password.length < 8) {
    return json({ error: 'invalid_owner_payload', message: 'Informe nome, email valido e senha com pelo menos 8 caracteres.' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const result = await env.DB.prepare(
    `insert into users (name, email, password_hash, role, status, metadata_json)
     values (?, ?, ?, 'owner', 'active', '{}')`
  ).bind(name, email, passwordHash).run();

  return json({
    success: true,
    user: {
      id: result.meta.last_row_id,
      name,
      email,
      role: 'owner',
      status: 'active',
    },
  }, { status: 201 });
}

async function login(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = text(body.email).toLowerCase();
  const password = text(body.password);

  if (!isEmail(email) || !password) {
    return json({ error: 'invalid_login_payload', message: 'Informe email e senha.' }, { status: 400 });
  }

  const user = await env.DB.prepare(
    'select id, name, email, password_hash, role, status, avatar_url from users where email = ? limit 1'
  ).bind(email).first<CurrentUser & { password_hash: string }>();

  if (!user || user.status !== 'active' || !(await verifyPassword(password, user.password_hash))) {
    return json({ error: 'invalid_credentials', message: 'Email ou senha invalidos.' }, { status: 401 });
  }

  const token = randomToken();
  const tokenHash = await sha256(token);
  await env.DB.prepare(
    'insert into sessions (user_id, token_hash, user_agent, ip_address, expires_at) values (?, ?, ?, ?, ?)'
  ).bind(
    user.id,
    tokenHash,
    request.headers.get('User-Agent') || '',
    request.headers.get('CF-Connecting-IP') || '',
    futureDate(SESSION_DAYS)
  ).run();

  const publicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatar_url: user.avatar_url,
  };

  return json({ success: true, user: publicUser }, {
    headers: {
      'Set-Cookie': sessionCookie(token, request),
    },
  });
}

async function logout(request: Request, env: Env): Promise<Response> {
  const { tokenHash } = await currentUser(request, env);
  if (tokenHash) {
    await env.DB.prepare('delete from sessions where token_hash = ?').bind(tokenHash).run();
  }
  return json({ success: true }, {
    headers: {
      'Set-Cookie': clearSessionCookie(request),
    },
  });
}

async function me(request: Request, env: Env): Promise<Response> {
  const { user } = await currentUser(request, env);
  if (!user) {
    return json({ error: 'not_authenticated', message: 'Usuario nao autenticado.' }, { status: 401 });
  }
  return json({ user });
}

// ─── STUDENTS ────────────────────────────────────────────────────────────────

async function studentMetrics(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString();

  const [total, active, thisMonth, lastMonth] = await Promise.all([
    env.DB.prepare("select count(*) as count from users where role = 'student'").first<{ count: number }>(),
    env.DB.prepare("select count(*) as count from users where role = 'student' and status = 'active'").first<{ count: number }>(),
    env.DB.prepare("select count(*) as count from users where role = 'student' and created_at >= ?").bind(thisMonthStart).first<{ count: number }>(),
    env.DB.prepare("select count(*) as count from users where role = 'student' and created_at >= ? and created_at < ?").bind(lastMonthStart, thisMonthStart).first<{ count: number }>(),
  ]);

  const totalCount = total?.count || 0;
  const activeCount = active?.count || 0;
  const newThisMonth = thisMonth?.count || 0;
  const newLastMonth = lastMonth?.count || 0;
  const prevPct = newLastMonth > 0 ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100) : (newThisMonth > 0 ? 100 : 0);

  return json({
    total: totalCount,
    active: activeCount,
    new_this_month: newThisMonth,
    avg_completion_rate: 0,
    trends: {
      total: { direction: 'up', pct: 0 },
      active: { direction: 'up', pct: 0 },
      new_this_month: { direction: newThisMonth >= newLastMonth ? 'up' : 'down', pct: Math.abs(prevPct) },
      avg_completion_rate: { direction: 'up', pct: 0 },
    },
  });
}

async function listStudents(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';

  let query = "select id, name, email, status, avatar_url, created_at from users where role = 'student' and status <> 'deleted'";
  const bindings: string[] = [];

  if (search) {
    query += ' and (name like ? or email like ?)';
    bindings.push(`%${search}%`, `%${search}%`);
  }

  query += ' order by created_at desc';

  const stmt = env.DB.prepare(query);
  const rows = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();

  const studentIds = (rows.results || []).map((s: Record<string, unknown>) => Number(s.id || 0)).filter(Boolean);
  const enrollmentMap: Record<number, number[]> = {};

  if (studentIds.length > 0) {
    const placeholders = studentIds.map(() => '?').join(',');
    const enrollments = await env.DB.prepare(
      `select user_id, course_id from enrollments where user_id in (${placeholders}) and status = 'active'`
    ).bind(...studentIds).all();

    for (const row of (enrollments.results || []) as Record<string, unknown>[]) {
      const uid = Number(row.user_id || 0);
      if (!enrollmentMap[uid]) enrollmentMap[uid] = [];
      enrollmentMap[uid].push(Number(row.course_id || 0));
    }
  }

  const students = (rows.results || []).map((s: Record<string, unknown>) => ({
    ...s,
    phone: '',
    course_ids: enrollmentMap[Number(s.id || 0)] || [],
  }));

  return json({ items: students });
}

async function getStudent(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const student = await env.DB.prepare(
    "select id, name, email, status, avatar_url, created_at from users where id = ? and role = 'student' limit 1"
  ).bind(id).first();

  if (!student) return json({ error: 'student_not_found', message: 'Aluno nao encontrado.' }, { status: 404 });

  const enrollments = await env.DB.prepare(
    "select course_id from enrollments where user_id = ? and status = 'active'"
  ).bind(id).all();

  return json({
    ...student,
    phone: '',
    course_ids: (enrollments.results || []).map((e: Record<string, unknown>) => Number(e.course_id || 0)),
    achievements: { badges: [], points: 0, missions_completed: 0 },
  });
}

async function createStudent(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const body = await readJson(request);
  const name = text(body.name);
  const email = text(body.email);
  const phone = text(body.phone);

  if (!name || !email) return json({ error: 'validation', message: 'Nome e email sao obrigatorios.' }, { status: 422 });
  if (!isEmail(email)) return json({ error: 'validation', message: 'Email invalido.' }, { status: 422 });

  const exists = await env.DB.prepare('select id from users where email = ? limit 1').bind(email).first<{ id: number }>();
  if (exists?.id) return json({ error: 'email_taken', message: 'Email ja cadastrado.' }, { status: 409 });

  const password = await hashPassword(`auto_${randomToken(12)}`);
  const courseIds = Array.isArray(body.course_ids) ? body.course_ids.map(Number).filter(Boolean) : [];

  const result = await env.DB.prepare(
    "insert into users (name, email, password_hash, role, status) values (?, ?, ?, 'student', 'active')"
  ).bind(name, email, password).run();

  const studentId = result.meta.last_row_id as number;

  for (const courseId of courseIds) {
    await env.DB.prepare(
      "insert or ignore into enrollments (user_id, course_id, status, source) values (?, ?, 'active', 'manual')"
    ).bind(studentId, courseId).run();
  }

  const student = await env.DB.prepare('select id, name, email, status from users where id = ? limit 1').bind(studentId).first();
  return json({ ...(student || {}), phone, course_ids: courseIds }, { status: 201 });
}

async function getStudentCourses(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const enrollments = await env.DB.prepare(
    `select courses.id, courses.title, courses.slug, courses.cover_image_url, courses.status,
      enrollments.enrolled_at, enrollments.status as enrollment_status
     from enrollments
     inner join courses on courses.id = enrollments.course_id
     where enrollments.user_id = ? and enrollments.status = 'active'
     order by enrollments.enrolled_at desc`
  ).bind(id).all();

  return json({ items: enrollments.results || [] });
}

async function getStudentActivity(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  return json({ items: [] });
}

async function updateStudentEnrollments(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const body = await readJson(request);
  const operations = Array.isArray(body.operations) ? body.operations : [];

  for (const op of operations as Record<string, unknown>[]) {
    const courseId = Number(op.course_id || 0);
    if (!courseId) continue;
    if (op.action === 'enroll') {
      await env.DB.prepare(
        "insert or ignore into enrollments (user_id, course_id, status, source) values (?, ?, 'active', 'manual')"
      ).bind(id, courseId).run();
    } else if (op.action === 'unenroll') {
      await env.DB.prepare(
        "update enrollments set status = 'cancelled' where user_id = ? and course_id = ?"
      ).bind(id, courseId).run();
    }
  }

  return json({ ok: true });
}

async function bulkStudentAction(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const body = await readJson(request);
  const action = text(body.action);
  const studentIds = Array.isArray(body.student_ids) ? body.student_ids.map(Number).filter(Boolean) : [];
  const courseIds = Array.isArray(body.course_ids) ? body.course_ids.map(Number).filter(Boolean) : [];

  if (!studentIds.length) return json({ error: 'validation', message: 'Nenhum aluno selecionado.' }, { status: 422 });

  for (const studentId of studentIds) {
    if (action === 'delete') {
      await env.DB.prepare("update users set status = 'deleted' where id = ? and role = 'student'").bind(studentId).run();
    } else if (action === 'enroll') {
      for (const courseId of courseIds) {
        await env.DB.prepare(
          "insert or ignore into enrollments (user_id, course_id, status, source) values (?, ?, 'active', 'manual')"
        ).bind(studentId, courseId).run();
      }
    } else if (action === 'unenroll') {
      for (const courseId of courseIds) {
        await env.DB.prepare(
          "update enrollments set status = 'cancelled' where user_id = ? and course_id = ?"
        ).bind(studentId, courseId).run();
      }
    }
  }

  return json({ ok: true });
}

// ─── INTEGRATIONS ─────────────────────────────────────────────────────────────

const INTEGRATION_PROVIDERS = [
  { id: 'mercadopago', name: 'Mercado Pago', category: 'payments', icon: 'mercadopago', description: 'Gateway de pagamento via OAuth.' },
  { id: 'pagarme', name: 'Pagar.me', category: 'payments', icon: 'pagarme', description: 'Gateway de pagamento via API Key.' },
  { id: 'smtp', name: 'SMTP', category: 'messages', icon: 'email', description: 'Envio de emails transacionais.' },
];

async function listIntegrations(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const rows = await env.DB.prepare('select * from integrations order by created_at desc').all();
  const items = (rows.results || []).map((i: Record<string, unknown>) => ({
    ...i,
    settings: typeof i.settings_json === 'string' ? JSON.parse(String(i.settings_json || '{}')) : {},
  }));
  return json(items);
}

async function listProviders(_request: Request, _env: Env): Promise<Response> {
  return json(INTEGRATION_PROVIDERS);
}

async function createIntegration(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const body = await readJson(request);
  const provider = text(body.provider);
  const name = text(body.name) || provider;
  const settings = typeof body.settings === 'object' ? JSON.stringify(body.settings || {}) : '{}';

  if (!provider) return json({ error: 'validation', message: 'Provider obrigatorio.' }, { status: 422 });

  const result = await env.DB.prepare(
    "insert into integrations (provider, name, status, settings_json) values (?, ?, 'active', ?)"
  ).bind(provider, name, settings).run();

  const integration = await env.DB.prepare('select * from integrations where id = ? limit 1').bind(result.meta.last_row_id).first();
  const parsed = integration ? JSON.parse(String((integration as Record<string, unknown>).settings_json || '{}')) : {};
  return json({ ...(integration || {}), settings: parsed }, { status: 201 });
}

async function updateIntegration(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const existing = await env.DB.prepare('select id from integrations where id = ? limit 1').bind(id).first<{ id: number }>();
  if (!existing?.id) return json({ error: 'not_found', message: 'Integracao nao encontrada.' }, { status: 404 });

  const body = await readJson(request);
  const name = text(body.name);
  const status = ['active', 'inactive'].includes(text(body.status)) ? text(body.status) : 'active';
  const settings = typeof body.settings === 'object' ? JSON.stringify(body.settings || {}) : '{}';

  await env.DB.prepare(
    "update integrations set name = ?, status = ?, settings_json = ?, updated_at = datetime('now') where id = ?"
  ).bind(name, status, settings, id).run();

  const integration = await env.DB.prepare('select * from integrations where id = ? limit 1').bind(id).first();
  return json({ ...(integration || {}), settings: JSON.parse(settings) });
}

async function deleteIntegration(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  await env.DB.prepare('delete from integrations where id = ?').bind(id).run();
  return json({ ok: true });
}

async function testIntegration(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const integration = await env.DB.prepare('select id from integrations where id = ? limit 1').bind(id).first<{ id: number }>();
  if (!integration?.id) return json({ error: 'not_found', message: 'Integracao nao encontrada.' }, { status: 404 });

  return json({ ok: true, message: 'Conexao testada com sucesso.' });
}

async function testSmtpEndpoint(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  return json({ ok: true, message: 'SMTP testado.' });
}

// ─── CHECKOUTS ────────────────────────────────────────────────────────────────

function normalizeCheckoutRow(c: Record<string, unknown>): Record<string, unknown> {
  return {
    ...c,
    course_ids: typeof c.course_ids_json === 'string' ? JSON.parse(String(c.course_ids_json || '[]')) : [],
    payment_methods: typeof c.payment_methods_json === 'string' ? JSON.parse(String(c.payment_methods_json || '[]')) : [],
    settings: typeof c.settings_json === 'string' ? JSON.parse(String(c.settings_json || '{}')) : {},
    courses: [],
    public_url: c.slug ? `/checkout/${c.slug}` : (c.public_url || ''),
  };
}

async function uniqueCheckoutSlug(env: Env, base: string, ignoreId = 0): Promise<string> {
  const root = slugify(base) || 'checkout';
  let candidate = root;
  let idx = 2;
  while (true) {
    const existing = await env.DB.prepare('select id from checkouts where slug = ? and id <> ? limit 1').bind(candidate, ignoreId).first<{ id: number }>();
    if (!existing?.id) return candidate;
    candidate = `${root}-${idx}`;
    idx += 1;
  }
}

async function listCheckouts(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const rows = await env.DB.prepare("select * from checkouts where status <> 'archived' order by updated_at desc, id desc").all();
  const checkouts = (rows.results || []).map((c) => normalizeCheckoutRow(c as Record<string, unknown>));
  return json(checkouts);
}

async function getCheckoutGateways(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const integrations = await env.DB.prepare(
    "select * from integrations where provider in ('mercadopago', 'pagarme') and status = 'active'"
  ).all();

  const gateways = (integrations.results || []).map((i: Record<string, unknown>) => {
    const settings = typeof i.settings_json === 'string' ? JSON.parse(String(i.settings_json || '{}')) : {};
    return {
      id: i.provider,
      name: i.provider === 'mercadopago' ? 'Mercado Pago' : 'Pagar.me',
      financing_mode: settings.financing_mode || 'free_members',
    };
  });

  return json(gateways);
}

async function createCheckout(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const body = await readJson(request);
  const name = text(body.name) || 'Checkout';
  const slug = await uniqueCheckoutSlug(env, text(body.slug) || name);
  const status = ['active', 'draft'].includes(text(body.status)) ? text(body.status) : 'draft';
  const price = Number(body.price || 0);
  const currency = text(body.currency) || 'BRL';
  const gateway_id = text(body.gateway_id) || 'mercadopago';
  const document_mode = text(body.document_mode) || 'both';
  const banner_enabled = body.banner_enabled !== false ? 1 : 0;
  const banner_url = text(body.banner_url);
  const course_ids = Array.isArray(body.course_ids) ? body.course_ids.map(Number).filter(Boolean) : [];
  const payment_methods = Array.isArray(body.payment_methods) ? body.payment_methods : [];
  const settings = typeof body.settings === 'object' && body.settings !== null ? body.settings : {};

  const result = await env.DB.prepare(
    `insert into checkouts (name, slug, status, price, currency, gateway_id, document_mode,
     banner_enabled, banner_url, course_ids_json, payment_methods_json, settings_json, public_url)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    name, slug, status, price, currency, gateway_id, document_mode, banner_enabled, banner_url,
    JSON.stringify(course_ids), JSON.stringify(payment_methods), JSON.stringify(settings),
    `/checkout/${slug}`
  ).run();

  const checkout = await env.DB.prepare('select * from checkouts where id = ? limit 1').bind(result.meta.last_row_id).first();
  return json(normalizeCheckoutRow(checkout as Record<string, unknown>), { status: 201 });
}

async function updateCheckout(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const existing = await env.DB.prepare('select id, slug from checkouts where id = ? limit 1').bind(id).first<{ id: number; slug: string }>();
  if (!existing?.id) return json({ error: 'not_found', message: 'Checkout nao encontrado.' }, { status: 404 });

  const body = await readJson(request);
  const name = text(body.name) || 'Checkout';
  const rawSlug = text(body.slug) || name;
  const slug = rawSlug !== existing.slug ? await uniqueCheckoutSlug(env, rawSlug, id) : existing.slug;
  const status = ['active', 'draft'].includes(text(body.status)) ? text(body.status) : 'draft';
  const price = Number(body.price || 0);
  const currency = text(body.currency) || 'BRL';
  const gateway_id = text(body.gateway_id) || 'mercadopago';
  const document_mode = text(body.document_mode) || 'both';
  const banner_enabled = body.banner_enabled !== false ? 1 : 0;
  const banner_url = text(body.banner_url);
  const course_ids = Array.isArray(body.course_ids) ? body.course_ids.map(Number).filter(Boolean) : [];
  const payment_methods = Array.isArray(body.payment_methods) ? body.payment_methods : [];
  const settings = typeof body.settings === 'object' && body.settings !== null ? body.settings : {};

  await env.DB.prepare(
    `update checkouts set name = ?, slug = ?, status = ?, price = ?, currency = ?, gateway_id = ?,
     document_mode = ?, banner_enabled = ?, banner_url = ?, course_ids_json = ?, payment_methods_json = ?,
     settings_json = ?, public_url = ?, updated_at = datetime('now') where id = ?`
  ).bind(
    name, slug, status, price, currency, gateway_id, document_mode, banner_enabled, banner_url,
    JSON.stringify(course_ids), JSON.stringify(payment_methods), JSON.stringify(settings),
    `/checkout/${slug}`, id
  ).run();

  const checkout = await env.DB.prepare('select * from checkouts where id = ? limit 1').bind(id).first();
  return json(normalizeCheckoutRow(checkout as Record<string, unknown>));
}

async function deleteCheckout(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  await env.DB.prepare('delete from checkouts where id = ?').bind(id).run();
  return json({ ok: true });
}

// ─── ORDERS / SALES ───────────────────────────────────────────────────────────

async function listOrders(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const perPage = Math.min(50, Math.max(1, Number(url.searchParams.get('per_page') || 20)));
  const offset = (page - 1) * perPage;

  const [rows, countResult] = await Promise.all([
    env.DB.prepare('select * from orders order by created_at desc limit ? offset ?').bind(perPage, offset).all(),
    env.DB.prepare('select count(*) as count from orders').first<{ count: number }>(),
  ]);

  return json({
    items: rows.results || [],
    total: countResult?.count || 0,
    page,
    per_page: perPage,
  });
}

// ─── DASHBOARD SETTINGS ───────────────────────────────────────────────────────

async function getDashboardSettings(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const { user } = await currentUser(request, env);

  const styleRow = await env.DB.prepare("select value_json from settings where key = 'style' limit 1").first<{ value_json: string }>();
  const style = styleRow ? JSON.parse(styleRow.value_json) : {
    color_mode: 'single',
    primary_color: '#ff3d73',
    secondary_color: '#ff7a45',
    default_theme: 'dark',
  };

  const admins = await env.DB.prepare(
    "select id, name, email, role, avatar_url from users where role in ('owner', 'admin', 'teacher') order by id asc"
  ).all();

  return json({
    profile: {
      id: user?.id || 0,
      name: user?.name || '',
      email: user?.email || '',
      photo_id: 0,
      photo_url: user?.avatar_url || '',
    },
    style,
    admins: admins.results || [],
    community: { community_enabled: false },
  });
}

async function saveDashboardProfile(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const { user } = await currentUser(request, env);
  if (!user) return json({ error: 'not_authenticated' }, { status: 401 });

  const body = await readJson(request);
  const name = text(body.name) || user.name;
  const email = text(body.email) || user.email;
  const password = text(body.password);
  const avatar_url = text(body.photo_url);

  if (password && password.length < 8) {
    return json({ error: 'validation', message: 'Senha deve ter ao menos 8 caracteres.' }, { status: 422 });
  }

  if (password) {
    const hash = await hashPassword(password);
    await env.DB.prepare('update users set name = ?, email = ?, password_hash = ?, avatar_url = ? where id = ?')
      .bind(name, email, hash, avatar_url, user.id).run();
  } else {
    await env.DB.prepare('update users set name = ?, email = ?, avatar_url = ? where id = ?')
      .bind(name, email, avatar_url, user.id).run();
  }

  return getDashboardSettings(request, env);
}

async function saveDashboardStyle(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const body = await readJson(request);
  const style = {
    color_mode: text(body.color_mode) === 'gradient' ? 'gradient' : 'single',
    primary_color: text(body.primary_color) || '#ff3d73',
    secondary_color: text(body.secondary_color) || '#ff7a45',
    default_theme: text(body.default_theme) === 'light' ? 'light' : 'dark',
    nav_menu: body.nav_menu || {},
    logo_square_light_url: text(body.logo_square_light_url),
    logo_square_dark_url: text(body.logo_square_dark_url),
    logo_wide_light_url: text(body.logo_wide_light_url),
    logo_wide_dark_url: text(body.logo_wide_dark_url),
    site_icon_url: text(body.site_icon_url),
  };

  await env.DB.prepare(
    "insert or replace into settings (key, value_json, updated_at) values ('style', ?, datetime('now'))"
  ).bind(JSON.stringify(style)).run();

  return getDashboardSettings(request, env);
}

async function createDashboardAdmin(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  const body = await readJson(request);
  const name = text(body.name);
  const email = text(body.email);
  const password = text(body.password);
  const role = ['teacher', 'admin'].includes(text(body.role)) ? text(body.role) : 'teacher';

  if (!name || !email || !password) {
    return json({ error: 'validation', message: 'Nome, email e senha obrigatorios.' }, { status: 422 });
  }
  if (password.length < 8) {
    return json({ error: 'validation', message: 'Senha deve ter ao menos 8 caracteres.' }, { status: 422 });
  }

  const exists = await env.DB.prepare('select id from users where email = ? limit 1').bind(email).first<{ id: number }>();
  if (exists?.id) return json({ error: 'email_taken', message: 'Email ja cadastrado.' }, { status: 409 });

  const hash = await hashPassword(password);
  await env.DB.prepare("insert into users (name, email, password_hash, role, status) values (?, ?, ?, ?, 'active')")
    .bind(name, email, hash, role).run();

  return getDashboardSettings(request, env);
}

async function deleteDashboardAdmin(request: Request, env: Env, id: number): Promise<Response> {
  const { user } = await currentUser(request, env);
  if (!user) return json({ error: 'not_authenticated' }, { status: 401 });
  if (user.id === id) return json({ error: 'cannot_delete_self', message: 'Voce nao pode apagar sua propria conta.' }, { status: 422 });

  const target = await env.DB.prepare('select id, role from users where id = ? limit 1').bind(id).first<{ id: number; role: string }>();
  if (!target) return json({ error: 'not_found' }, { status: 404 });
  if (target.role === 'owner') return json({ error: 'cannot_delete_owner', message: 'Nao e possivel apagar o owner.' }, { status: 422 });

  await env.DB.prepare('delete from users where id = ?').bind(id).run();
  return getDashboardSettings(request, env);
}

// ─── ROUTING ──────────────────────────────────────────────────────────────────

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (request.method === 'GET' && path === '/api/health') {
    return health(env);
  }

  if (request.method === 'GET' && path === '/api/bootstrap') {
    return bootstrap(request, env);
  }

  if (request.method === 'GET' && path === '/api/courses') {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) {
      return admin;
    }
    return courses(env);
  }

  const publicCourseMatch = path.match(/^\/api\/public\/courses\/([a-zA-Z0-9_-]+)$/);
  if (request.method === 'GET' && publicCourseMatch) {
    return publicCourse(env, publicCourseMatch[1]);
  }

  if (request.method === 'POST' && path === '/api/courses') {
    return createCourse(request, env);
  }

  const courseMatch = path.match(/^\/api\/courses\/(\d+)$/);
  if (courseMatch) {
    const id = Number(courseMatch[1]);
    if (request.method === 'GET') {
      return courseDetail(request, env, id);
    }
    if (request.method === 'PUT' || request.method === 'PATCH') {
      return updateCourse(request, env, id);
    }
    if (request.method === 'DELETE') {
      return archiveCourse(request, env, id);
    }
  }

  const courseChildMatch = path.match(/^\/api\/courses\/(\d+)\/(sections|modules|lessons)$/);
  if (courseChildMatch && request.method === 'POST') {
    const courseId = Number(courseChildMatch[1]);
    const child = courseChildMatch[2];
    if (child === 'sections') return createSection(request, env, courseId);
    if (child === 'modules') return createModule(request, env, courseId);
    if (child === 'lessons') return createLesson(request, env, courseId);
  }

  const moduleLessonMatch = path.match(/^\/api\/modules\/(\d+)\/lessons$/);
  if (moduleLessonMatch && request.method === 'POST') {
    const moduleId = Number(moduleLessonMatch[1]);
    const module = await env.DB.prepare('select course_id from modules where id = ? limit 1').bind(moduleId).first<{ course_id: number }>();

    if (!module?.course_id) {
      return json({ error: 'module_not_found', message: 'Modulo nao encontrado.' }, { status: 404 });
    }

    const body = await readJson(request);
    return createLesson(new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify({
        ...body,
        module_id: moduleId,
      }),
    }), env, Number(module.course_id));
  }

  const childMatch = path.match(/^\/api\/(sections|modules|lessons)\/(\d+)$/);
  if (childMatch) {
    const child = childMatch[1];
    const id = Number(childMatch[2]);
    if (child === 'sections') {
      if (request.method === 'PUT' || request.method === 'PATCH') return updateSection(request, env, id);
      if (request.method === 'DELETE') return archiveSection(request, env, id);
    }
    if (child === 'modules') {
      if (request.method === 'PUT' || request.method === 'PATCH') return updateModule(request, env, id);
      if (request.method === 'DELETE') return archiveModule(request, env, id);
    }
    if (child === 'lessons') {
      if (request.method === 'PUT' || request.method === 'PATCH') return updateLesson(request, env, id);
      if (request.method === 'DELETE') return archiveLesson(request, env, id);
    }
  }

  if (request.method === 'POST' && path === '/api/install/owner') {
    return createOwner(request, env);
  }

  if (request.method === 'POST' && path === '/api/auth/login') {
    return login(request, env);
  }

  if (request.method === 'POST' && path === '/api/auth/logout') {
    return logout(request, env);
  }

  if (request.method === 'GET' && path === '/api/me') {
    return me(request, env);
  }

  // ── Students ──────────────────────────────────────────────────────────────
  if (request.method === 'GET' && path === '/api/students/metrics') {
    return studentMetrics(request, env);
  }

  if (request.method === 'POST' && path === '/api/students/bulk') {
    return bulkStudentAction(request, env);
  }

  if (request.method === 'GET' && path === '/api/students') {
    return listStudents(request, env);
  }

  if (request.method === 'POST' && path === '/api/students') {
    return createStudent(request, env);
  }

  const studentMatch = path.match(/^\/api\/students\/(\d+)$/);
  if (studentMatch) {
    const sid = Number(studentMatch[1]);
    if (request.method === 'GET') return getStudent(request, env, sid);
  }

  const studentCoursesMatch = path.match(/^\/api\/students\/(\d+)\/courses$/);
  if (request.method === 'GET' && studentCoursesMatch) {
    return getStudentCourses(request, env, Number(studentCoursesMatch[1]));
  }

  const studentActivityMatch = path.match(/^\/api\/students\/(\d+)\/activity$/);
  if (request.method === 'GET' && studentActivityMatch) {
    return getStudentActivity(request, env, Number(studentActivityMatch[1]));
  }

  const studentEnrollmentsMatch = path.match(/^\/api\/students\/(\d+)\/enrollments$/);
  if (request.method === 'POST' && studentEnrollmentsMatch) {
    return updateStudentEnrollments(request, env, Number(studentEnrollmentsMatch[1]));
  }

  // ── Integrations ──────────────────────────────────────────────────────────
  if (request.method === 'GET' && path === '/api/integrations/providers') {
    return listProviders(request, env);
  }

  if (request.method === 'POST' && path === '/api/integrations/smtp/test') {
    return testSmtpEndpoint(request, env);
  }

  if (request.method === 'GET' && path === '/api/integrations') {
    return listIntegrations(request, env);
  }

  if (request.method === 'POST' && path === '/api/integrations') {
    return createIntegration(request, env);
  }

  const integrationMatch = path.match(/^\/api\/integrations\/(\d+)$/);
  if (integrationMatch) {
    const iid = Number(integrationMatch[1]);
    if (request.method === 'PUT' || request.method === 'PATCH') return updateIntegration(request, env, iid);
    if (request.method === 'DELETE') return deleteIntegration(request, env, iid);
  }

  const integrationTestMatch = path.match(/^\/api\/integrations\/(\d+)\/test$/);
  if (request.method === 'POST' && integrationTestMatch) {
    return testIntegration(request, env, Number(integrationTestMatch[1]));
  }

  // ── Checkouts ─────────────────────────────────────────────────────────────
  if (request.method === 'GET' && path === '/api/checkouts/gateways') {
    return getCheckoutGateways(request, env);
  }

  if (request.method === 'GET' && path === '/api/checkouts') {
    return listCheckouts(request, env);
  }

  if (request.method === 'POST' && path === '/api/checkouts') {
    return createCheckout(request, env);
  }

  const checkoutMatch = path.match(/^\/api\/checkouts\/(\d+)$/);
  if (checkoutMatch) {
    const cid = Number(checkoutMatch[1]);
    if (request.method === 'PUT' || request.method === 'PATCH') return updateCheckout(request, env, cid);
    if (request.method === 'DELETE') return deleteCheckout(request, env, cid);
  }

  // ── Orders / Sales ────────────────────────────────────────────────────────
  if (request.method === 'GET' && path === '/api/orders') {
    return listOrders(request, env);
  }

  // ── Dashboard settings ────────────────────────────────────────────────────
  if (request.method === 'GET' && path === '/api/dashboard/settings') {
    return getDashboardSettings(request, env);
  }

  if (request.method === 'POST' && path === '/api/dashboard/profile') {
    return saveDashboardProfile(request, env);
  }

  if (request.method === 'POST' && path === '/api/dashboard/style') {
    return saveDashboardStyle(request, env);
  }

  if (request.method === 'POST' && path === '/api/dashboard/admins') {
    return createDashboardAdmin(request, env);
  }

  const dashboardAdminMatch = path.match(/^\/api\/dashboard\/admins\/(\d+)$/);
  if (request.method === 'DELETE' && dashboardAdminMatch) {
    return deleteDashboardAdmin(request, env, Number(dashboardAdminMatch[1]));
  }

  return notFound();
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  'Access-Control-Allow-Credentials': 'true',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    try {
      const response = await route(request, env);
      const headers = new Headers(response.headers);
      Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
      return new Response(response.body, { status: response.status, headers });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'internal_error', message: String(err) }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' } },
      );
    }
  },
};
