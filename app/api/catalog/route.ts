import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CATALOG_PATH = path.join(process.cwd(), 'public', 'catalog.json');

export async function GET() {
  try {
    if (fs.existsSync(CATALOG_PATH)) {
      const content = fs.readFileSync(CATALOG_PATH, 'utf8');
      const data = JSON.parse(content);
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }
    return NextResponse.json({ products: [] }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !Array.isArray(body.products)) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง: ต้องระบุ array ของ products' },
        { status: 400 }
      );
    }

    const payload = {
      capturedAt: new Date().toISOString(),
      source: 'LC Tyre Admin CMS',
      scope: 'Live product catalog updated by admin',
      products: body.products,
    };

    fs.writeFileSync(CATALOG_PATH, JSON.stringify(payload, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'บันทึกข้อมูลสินค้าเรียบร้อยแล้ว',
      total: body.products.length,
      updatedAt: payload.capturedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
