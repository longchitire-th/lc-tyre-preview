import {notFound} from 'next/navigation';
import {articleSeeds,COMPANY} from '../../../lib/storefront';
import catalog from '../../../public/catalog.json';
import {articlesEn} from '../../../lib/articles-en';

type Props={params:Promise<{slug:string}>;searchParams:Promise<{lang?:string}>};
export async function generateMetadata({params,searchParams}:Props){
 const {slug}=await params; const en=(await searchParams).lang==='en';const source=articleSeeds.find(a=>a.slug===slug);const article=en&&source?{...source,...articlesEn[slug]}:source;
 if(!article)return {title:'ไม่พบบทความ'};
 return {title:`${article.title} | LC TYRE`,description:article.description,robots:{index:false,follow:false},openGraph:{title:article.title,description:article.description,type:'article',locale:en?'en_US':'th_TH'}};
}
export default async function Article({params,searchParams}:Props){
 const {slug}=await params;const en=(await searchParams).lang==='en';const source=articleSeeds.find(a=>a.slug===slug);if(!source)notFound();const a=en?{...source,...articlesEn[slug]}:source;const t=(th:string,english:string)=>en?english:th;
 const related=catalog.products.filter(p=>a.productIds.includes(p.id));
 const schema={'@context':'https://schema.org','@graph':[{'@type':'Article',headline:a.title,description:a.description,inLanguage:en?'en':'th',articleBody:a.body},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:t('หน้าแรก','Home'),item:'http://localhost:3000/'},{'@type':'ListItem',position:2,name:a.title,item:`http://localhost:3000/articles/${a.slug}${en?'?lang=en':''}`}]}]};
 return <div lang={en?'en':'th'}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><header className="reading-header"><a href="/">← LC TYRE · {t('กลับหน้าแรก','Back to home')}</a><a href={`?lang=${en?'th':'en'}`}>{en?'ไทย':'English'}</a></header><main className="reading-wrap"><p>{t('บทความตัวอย่าง • รอตรวจทานก่อนเผยแพร่','Draft guide • Pending editorial review')}</p><h1>{a.title}</h1><p>{a.description}</p><article className="reading-body">{a.body.split('\n\n').map((p,i)=><p key={i}>{p}</p>)}</article>{a.source&&<p>{t('อ้างอิง','Source')}: <a href={a.source} target="_blank" rel="noopener noreferrer">Michelin Thailand</a></p>}<h2>{t('สินค้าที่เกี่ยวข้อง','Related products')}</h2><p>{t('รายการเพื่อศึกษาเพิ่มเติม ไม่ใช่การยืนยันว่าสามารถติดตั้งกับรถของคุณได้','For further research; not a confirmation of compatibility with your vehicle.')}</p>{related.map(p=><p key={p.id}><a href={p.url} target="_blank" rel="noopener noreferrer">{p.brand} {p.model} — {p.size} → {t('ดูข้อมูลบนเว็บเดิม','View on the existing store')}</a></p>)}{!related.length&&<a href="/#products">{t('ค้นหายางและสอบถามเจ้าหน้าที่','Find tyres and ask staff')} →</a>}<p>{t(COMPANY,'Long Ci Group Co., Ltd.')}</p></main></div>;
}
