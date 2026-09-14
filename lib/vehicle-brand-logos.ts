import logos from '@/public/assets/vehicle-brands/vehicle-brand-logos.json';

export type VehicleBrandLogo={
  make:string;
  displayName:string;
  logo:string;
  exists:boolean;
};

const map=new Map((logos as VehicleBrandLogo[]).map(x=>[x.make.toUpperCase(),x]));

export function getVehicleBrandLogo(make:string){
  return map.get(make.trim().toUpperCase())||null;
}

export const vehicleBrandLogos=logos as VehicleBrandLogo[];
