export async function fetchPortfolio(endpoint='/api/platform/public') {
  const response=await fetch(endpoint,{cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('Portföyler yüklenemedi. Lütfen tekrar deneyin veya bize ulaşın.');
  const data=await response.json();
  if(!Array.isArray(data.records))throw new Error('Portföy bilgisi alınamadı.');
  return data;
}

export async function fetchPortfolioOrFallback(endpoint,fallback,loader=fetchPortfolio){
  try{
    const data=await loader(endpoint);
    return {records:data.records,revision:data.revision,error:''};
  }catch(error){
    return {records:fallback,revision:null,error:error.message || 'Güncel portföyler alınamadı.'};
  }
}
