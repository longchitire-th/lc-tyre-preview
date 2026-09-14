import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
await fs.mkdir(path.join(root,'public','assets'),{recursive:true});
await fs.mkdir(path.join(root,'audit'),{recursive:true});
const homepage=await fetch('https://lctyre.com/');
if(!homepage.ok)throw new Error('Homepage '+homepage.status);
await fs.writeFile(path.join(root,'audit','homepage-public-snapshot.html'),await homepage.text());
const queries=['205/55R16','195/55R15','265/65R17'];
const all=[];
for(const q of queries){
 const response=await fetch('https://lctyre.com/wp-json/wc/store/v1/products?per_page=12&search='+encodeURIComponent(q));
 if(!response.ok)throw new Error('Catalog '+response.status);
 all.push(...await response.json());
}
const items=[...new Map(all.map(p=>[p.id,p])).values()];
const products=[];
const images=new Map();
for(const p of items){
 let image='';
 if(p.images?.[0]){
  const src=p.images[0].src;
  if(!images.has(src)){
   const filename='tire-'+p.images[0].id+path.extname(new URL(src).pathname);
   const r=await fetch(src);if(!r.ok)throw new Error('Asset '+r.status);
   await fs.writeFile(path.join(root,'public','assets',filename),Buffer.from(await r.arrayBuffer()));
   images.set(src,'/assets/'+filename);
  }
  image=images.get(src);
 }
 const size=p.name.match(/\d{3}\/\d{2}R\d{2}/i)?.[0]||'';
 const brand=p.name.match(/MICHELIN|CONTINENTAL|BRIDGESTONE|GOODYEAR|KUMHO|NAZZ|DUNLOP|YOKOHAMA|MAXXIS|NEXEN|TOYO|PIRELLI/i)?.[0]||'LC TYRE';
 const model=p.name.split('รุ่น ')[1]?.split(' ราค')[0]||p.name;
 products.push({id:p.id,name:p.name,url:p.permalink,brand,model,size,year:p.name.match(/ปี (\d{4})/)?.[1]||'',price:Number(p.prices.price)/10**p.prices.currency_minor_unit,regularPrice:Number(p.prices.regular_price)/10**p.prices.currency_minor_unit,stock:p.is_in_stock,image,sourceImage:p.images?.[0]?.src||'',runflat:/RUN\s?FLAT|RUNFLAT/i.test(p.name)});
}
const data={capturedAt:new Date().toISOString(),source:'https://lctyre.com/wp-json/wc/store/v1/products',scope:'Public product snapshot only; NOT a WordPress database or full site backup',products};
await fs.writeFile(path.join(root,'public','catalog.json'),JSON.stringify(data,null,2));
console.log(JSON.stringify({products:products.length,images:images.size,capturedAt:data.capturedAt}));
