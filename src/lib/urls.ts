/** Return a deployment-safe internal URL for both GitHub project Pages and root domains. */
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL;
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}${cleanPath}`.replace(/(?<!:)\/\/{2,}/g, '/');
}

export function absoluteUrl(path = ''): URL {
  return new URL(withBase(path), import.meta.env.SITE);
}
