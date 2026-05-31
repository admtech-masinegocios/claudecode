// History stored in localStorage — max 50 posts
const STORAGE_KEY = 'pg_history';
const MAX_ITEMS = 50;

export function savePost(post) {
  const history = getHistory();
  const entry = {
    id: Date.now(),
    date: new Date().toISOString(),
    platform: post.platform,
    template: post.template,
    contentType: post.contentType,
    topic: post.topic,
    content: post.content,
  };
  const updated = [entry, ...history].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return entry;
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function deletePost(id) {
  const updated = getHistory().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
