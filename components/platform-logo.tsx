const logos: Record<string, string> = {
  shopee: 'shopee.png',
  lazada: 'lazada.ico',
  facebook: 'facebook.ico',
  instagram: 'instagram.png',
  tiktok: 'tiktok.png',
  line: 'line.png',
  lineshop: 'line.png',
  youtube: 'youtube.ico',
  threads: 'threads.ico',
  x: 'x.png',
  thaimart: 'thaimart.png',
};
export default function PlatformLogo({ name }: { name: string }) {
  return logos[name] ? (
    <img
      className={'platform-logo platform-' + name}
      src={'/assets/platform-' + logos[name]}
      alt=""
      loading="lazy"
    />
  ) : null;
}
