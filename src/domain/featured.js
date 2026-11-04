export function featuredProperties(records,limit=8) {
  const eligible=records.filter(record=>record.image && !['draft','archived','sold'].includes(record.status));
  const marked=eligible.filter(record=>record.featured===true);
  const configured=records.some(record=>typeof record.featured==='boolean');
  return (configured?marked:eligible).slice().sort((a,b)=>(a.featuredOrder ?? 50)-(b.featuredOrder ?? 50)).slice(0,limit);
}
