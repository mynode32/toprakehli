export async function fetchPortfolio(endpoint='/api/platform/public') {
  const response=await fetch(endpoint,{cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('Portföyler yüklenemedi. Lütfen tekrar deneyin veya bize ulaşın.');
  const data=await response.json();
  if(!Array.isArray(data.records))throw new Error('Portföy bilgisi alınamadı.');
  return data;
}
