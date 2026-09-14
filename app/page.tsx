import Storefront from '@/components/storefront-v3';
import catalog from '../public/catalog.json';
import brandCatalog from '../public/brands.json';
import {COMPANY,CHANNELS} from '@/lib/storefront';
export default function Home(){
 const organization={'@context':'https://schema.org','@type':'Organization',name:COMPANY,alternateName:'หลงฉื่อ ขึ้นชื่อเรื่องยาง',url:'https://lctyre.com/',telephone:'+66985795449',sameAs:CHANNELS.map(c=>c.url)};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organization).replace(/</g,'\\u003c')}}/><Storefront products={catalog.products} brands={brandCatalog.brands}/></>;
}
