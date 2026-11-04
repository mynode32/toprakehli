export function deploymentMode(value){
  const mode=value || 'catalogue';
  if(!['catalogue','online','demo','live'].includes(mode))throw new Error(`Geçersiz yayın modu: ${mode}`);
  return {demo:mode==='demo',catalogue:mode==='catalogue'||mode==='online',online:mode==='online',live:mode==='live'};
}
