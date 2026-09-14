export function locationShareLinks(url: string, text: string) {
  return {
    line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  } as const;
}

export function websiteLocationUrl(origin: string, source: string) {
  const url = new URL('/', origin);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', 'share');
  url.searchParams.set('utm_campaign', 'branch_location');
  url.hash = 'branches';
  return url.toString();
}
