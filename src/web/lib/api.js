const LOCAL_LIBRARY_KEY = 'fm-cloud-library-files';

function normalizePath(path = '') {
  const normalized = String(path || '/');
  return normalized.startsWith('/api') ? normalized : `/api${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
}

function isPluginPath(path = '') {
  return !String(path || '').startsWith('/api');
}

function unwrapPluginResponse(path, data, method = 'GET') {
  const cleanPath = String(path || '').split('?')[0];

  if (cleanPath === '/courses') {
    if (String(method || 'GET').toUpperCase() !== 'GET') {
      return data?.course || data;
    }

    return data?.courses || data || [];
  }

  if (/^\/courses\/\d+$/.test(cleanPath)) {
    return data?.course || data;
  }

  if (/^\/courses\/\d+\/sections$/.test(cleanPath) || /^\/sections\/\d+$/.test(cleanPath)) {
    return data?.section || data;
  }

  if (/^\/courses\/\d+\/modules$/.test(cleanPath) || /^\/modules\/\d+$/.test(cleanPath)) {
    return data?.module || data;
  }

  if (/^\/modules\/\d+\/lessons$/.test(cleanPath) || /^\/courses\/\d+\/lessons$/.test(cleanPath) || /^\/lessons\/\d+$/.test(cleanPath)) {
    return data?.lesson || data;
  }

  return data;
}

function readLocalLibrary() {
  try {
    const items = JSON.parse(window.localStorage.getItem(LOCAL_LIBRARY_KEY) || '[]');
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function writeLocalLibrary(items) {
  window.localStorage.setItem(LOCAL_LIBRARY_KEY, JSON.stringify(items));
}

function extensionFromName(name = '') {
  const extension = String(name).split('.').pop() || '';
  return extension.toLowerCase();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

export async function apiFetch(path, options = {}) {
  if (isPluginPath(path) && String(path).startsWith('/library/files')) {
    const type = new URLSearchParams(String(path).split('?')[1] || '').get('type');
    const files = readLocalLibrary();

    if (type === 'image') {
      return files.filter((file) => file.is_image);
    }

    if (type === 'video') {
      return files.filter((file) => file.is_video);
    }

    return files;
  }

  if (isPluginPath(path) && String(path).startsWith('/community/settings')) {
    return { spaces: [], settings: {} };
  }

  if (isPluginPath(path) && String(path).startsWith('/community/spaces')) {
    return { spaces: [] };
  }

  const originalPath = String(path || '');
  const response = await fetch(normalizePath(path), {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Falha na operacao.');
  }

  return isPluginPath(originalPath) ? unwrapPluginResponse(originalPath, data, options.method || 'GET') : data;
}

export async function apiUpload(path, formData) {
  if (isPluginPath(path) && String(path).startsWith('/library/files')) {
    const file = formData.get('file');

    if (!(file instanceof File)) {
      throw new Error('Arquivo inválido.');
    }

    const url = await fileToDataUrl(file);
    const extension = extensionFromName(file.name);
    const id = Date.now();
    const item = {
      id,
      title: String(formData.get('title') || file.name.replace(/\.[^.]+$/, '')),
      filename: file.name,
      url,
      thumb_url: url,
      mime_type: file.type || '',
      extension,
      filesize: file.size || 0,
      is_image: String(file.type || '').startsWith('image/'),
      is_video: String(file.type || '').startsWith('video/'),
      width: 0,
      height: 0,
      created_at: new Date().toISOString(),
    };

    writeLocalLibrary([item, ...readLocalLibrary()]);
    return item;
  }

  const response = await fetch(normalizePath(path), {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Falha no upload.');
  }

  return isPluginPath(path) ? unwrapPluginResponse(path, data, 'POST') : data;
}
