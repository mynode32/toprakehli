from pathlib import Path
import zipfile,json,hashlib
root=Path(__file__).resolve().parents[1]
meta=json.loads((root/'releases/latest-demo.json').read_text(encoding='utf-8'))
web=Path(meta['directory']);target=root/'releases/TOPRAK_EHLI_DEMO_TESLIM_2026-10-31.zip'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
 for p in web.rglob('*'):
  if p.is_file():z.write(p,Path('01_DEMO_SITE')/p.relative_to(web))
 for folder in ['src','admin','online','api','server','scripts','supabase','tests','content']:
  for p in (root/folder).rglob('*'):
   if p.is_file() and '__pycache__' not in p.parts and p.suffix not in ['.log','.bak']:z.write(p,Path('02_KAYNAK')/p.relative_to(root))
 for name in ['package.json','package-lock.json','index.html','vercel.json','eslint.config.mjs','.gitignore','.vercelignore','.env.example','README.md','DEPLOYMENT.md','ADMIN_GUIDE.md','SECURITY_CHECKLIST.md','HANDOVER.md','TEST_REPORT.md']:
  z.write(root/name,Path('02_KAYNAK')/name)
 for p in (root/'docs').glob('*.md'):z.write(p,Path('03_BELGELER')/p.name)
with zipfile.ZipFile(target) as z:
 assert z.testzip() is None
 assert len(z.namelist())==len(set(z.namelist()))
 assert all(not any(x in {'.git','.private','.env.local','node_modules','.vercel','.test-environments'} for x in Path(n).parts) for n in z.namelist())
print(json.dumps({'package':str(target),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'integrity':'passed'}))
