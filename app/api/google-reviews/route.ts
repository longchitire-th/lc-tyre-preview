// Server-only. No key is accepted from a browser or sent back in a response.
export async function GET(request:Request){
 const headers={'Cache-Control':'no-store'};
 const key=process.env.GOOGLE_PLACES_API_KEY,place=process.env.GOOGLE_REVIEW_PLACE_ID;
 if(process.env.GOOGLE_REVIEWS_ENABLED!=='true'||!key||!place)return Response.json({status:'not_configured'},{status:503,headers});
 if(!/^[A-Za-z0-9_-]+$/.test(place))return Response.json({status:'invalid_configuration'},{status:503,headers});
 const lang=new URL(request.url).searchParams.get('lang')==='en'?'en':'th';
 try{const result=await fetch(`https://places.googleapis.com/v1/places/${place}?languageCode=${lang}`,{headers:{'X-Goog-Api-Key':key,'X-Goog-FieldMask':'rating,userRatingCount,googleMapsUri,reviews'},signal:AbortSignal.timeout(8000)});if(!result.ok)return Response.json({status:'upstream_unavailable'},{status:502,headers});const d=await result.json() as {rating?:number;userRatingCount?:number;googleMapsUri?:string;reviews?:unknown[]};return Response.json({rating:d.rating,userRatingCount:d.userRatingCount,googleMapsUri:d.googleMapsUri,reviews:d.reviews||[]},{headers})}catch{return Response.json({status:'upstream_unavailable'},{status:502,headers})}
}
