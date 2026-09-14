export type Fitment={make:string;model:string;year:string;trim:string;front:string;rear:string;source:string};
export const widths=Array.from({length:16},(_,i)=>String(165+i*10));
export function parseSize(value:string){const n=value.toUpperCase().replace(/[\s/R-]/g,'');if(!/^\d{7}$/.test(n))return null;const w=Number(n.slice(0,3)),r=Number(n.slice(3,5)),d=Number(n.slice(5));if(w<165||w>315||w%10!==5||r<20||r>85||r%5!==0||d<12||d>26)return null;return `${w}/${r}R${d}`}
export function validateFitments(input:unknown):Fitment[]{if(!Array.isArray(input)||input.length>10000)throw new Error('Expected an array, maximum 10,000 rows');return input.map((row,i)=>{if(!row||typeof row!=='object')throw new Error(`Row ${i+1}: invalid record`);const result={} as Fitment;for(const k of ['make','model','year','trim','front','rear','source'] as const){if(typeof row[k]!=='string'||!row[k].trim())throw new Error(`Row ${i+1}: ${k} is required`);result[k]=row[k].trim()}const f=parseSize(result.front),r=parseSize(result.rear);if(!f||!r)throw new Error(`Row ${i+1}: invalid tyre size`);return {...result,front:f,rear:r}})}
export const installationPoints=[
 {id:'main',th:'สาขาเจริญพัฒนา (กีบหมู)',en:'Charoen Phatthana (Kip Mu)',url:'https://share.google/QWSfJzMQSqOKv9VPh',free:true},
 {id:'partner1',th:'คู้บอน — อุดมชัย เลียบคลองสอง ซ.1',en:'Khu Bon — Udomchai, Liap Khlong Song Soi 1',url:'https://share.google/u78pULYfACYOCEFyi',free:false},
 {id:'partner2',th:'ประเวศ — MPK autoservice',en:'Prawet — MPK Autoservice',url:'https://share.google/ABF0LzTnLmTr19Jee',free:false},
 {id:'partner3',th:'แอล.เอช.ที.ไทร์',en:'L.H.T. Tyre',url:'https://share.google/iqSEDG1WQjqY0W8mX',free:false},
];
