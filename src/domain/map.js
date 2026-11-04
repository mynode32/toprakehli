import {mapRegions} from '../data/map-regions.js';

export function portfolioLocation(property){
  const {latitude,longitude}=property;
  const exact=typeof latitude==='number'&&typeof longitude==='number'&&Number.isFinite(latitude)&&Number.isFinite(longitude)&&Math.abs(latitude)<=90&&Math.abs(longitude)<=180;
  const region=mapRegions.find(r=>`${property.local} ${property.region} ${property.neighborhood||''}`.toLocaleLowerCase('tr').includes(r.local.toLocaleLowerCase('tr')));
  if(!exact&&!region)return {kind:'unknown',label:property.region,search:`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${property.region} ${property.local} Türkiye`)}`};
  const lat=exact?latitude:region.latitude,lon=exact?longitude:region.longitude;
  const [south,north,west,east]=exact?[lat-.006,lat+.006,lon-.009,lon+.009]:region.bounds;
  const bbox=[west,south,east,north].map(v=>v.toFixed(6)).join(',');
  return {kind:exact?'provided':'region',lat,lon,label:property.local||property.region,
    embed:`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik${exact?`&marker=${lat},${lon}`:''}`,
    external:`https://www.openstreetmap.org/${exact?`?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`:region.source.split('openstreetmap.org/')[1]}`,
    satellite:`https://www.google.com/maps/@${lat},${lon},${exact?17:13}z/data=!3m1!1e3`,
    note:exact?'İlan yöneticisinin girdiği konum. Kadastro sınırı veya resmî parsel doğrulaması değildir.':'Yaklaşık mahalle / bölge görünümü. İlanın kesin parsel konumu sağlanmadı; haritada parsel işaretlenmez.'};
}
