import type { Metadata } from 'next';
import './storefront.css';
import './v3.css';
import './services.css';

export const metadata: Metadata = {
  title: 'หลงฉื่อ ขึ้นชื่อเรื่องยาง | LC TYRE — ตัวอย่าง',
  description: 'ค้นหายางตามขนาด รถ และแบรนด์ พร้อมช่องทางซื้อและบริการติดตั้ง โดย บริษัท หลงฉื่อ กรุ๊ป จำกัด — ตัวอย่างก่อนใช้จริง',
  openGraph: {title:'หลงฉื่อ ขึ้นชื่อเรื่องยาง | LC TYRE',description:'ค้นหายาง สอบถามราคา และเลือกช่องทางซื้อที่สะดวก — ตัวอย่างก่อนใช้จริง',type:'website',locale:'th_TH'},
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        {children}
      </body>
    </html>
  );
}
