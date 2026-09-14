import fs from 'node:fs/promises';
import path from 'node:path';
const assetDir=path.join(process.cwd(),'public','assets');
await fs.copyFile('C:/Users/usEr/Downloads/ดีไซน์ที่ยังไม่ได้ตั้งชื่อ (26).png',path.join(assetDir,'long-ci-logo.png'));
await fs.copyFile('C:/Users/usEr/Documents/Codex/2026-09-07/new-chat/work/hero-assets/lc-tyre-suv-sunset.png',path.join(assetDir,'suv-sunset.png'));
const source='https://www.autotirechecking.com/';
const response=await fetch(source);if(!response.ok)throw Error('Brand source '+response.status);
const html=await response.text();
const brands=[];
for(const match of html.matchAll(/<img\b[^>]+>/g)){
 const tag=match[0],src=tag.match(/src="([^"]*logobrand[^\"]+)"/)?.[1],name=tag.match(/alt="([^"]+)"/)?.[1];
 if(!src||!name||brands.some(b=>b.name===name))continue;
 const url=new URL(src,source).href;
 const slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
 const asset=await fetch(url);if(!asset.ok){console.log('Unavailable '+name);continue}
 const local='/assets/brand-'+slug+'.png';
 await fs.writeFile(path.join(process.cwd(),'public',local),Buffer.from(await asset.arrayBuffer()));
 brands.push({name,logo:local,source,sourceImage:url,market:'Thailand',stockVerified:false});
}
const priority=['MICHELIN','BRIDGESTONE','CONTINENTAL','GOODYEAR','YOKOHAMA','KUMHO','MAXXIS','TOYO'];
brands.sort((a,b)=>(priority.includes(a.name)?priority.indexOf(a.name):100)-(priority.includes(b.name)?priority.indexOf(b.name):100)||a.name.localeCompare(b.name));
await fs.writeFile(path.join(process.cwd(),'public','brands.json'),JSON.stringify({checkedAt:new Date().toISOString(),note:'Verified subset, not an exhaustive list of all brands sold in Thailand. Brand availability does not imply LC Tyre stocks the brand. Logos are unmodified third-party marks; validate official brand usage guidance before public release.',brands},null,2));
console.log(JSON.stringify({logos:brands.length,names:brands.map(b=>b.name)}));
