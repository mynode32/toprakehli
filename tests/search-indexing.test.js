import test from 'node:test';
import assert from 'node:assert/strict';
import {indexingEnabled,robotsContent,indexableHomeHtml} from '../scripts/search-indexing.mjs';
import {propertyHtml} from '../server/seo.mjs';
import {referenceListings} from '../src/data/reference-listings.js';
import {readFileSync} from 'node:fs';

test('only an intentional production publication becomes crawlable',()=>{
  assert.equal(indexingEnabled({VERCEL_ENV:'production',TOPRAK_DEPLOY_MODE:'online'}),true);
  assert.equal(indexingEnabled({VERCEL_ENV:'preview',TOPRAK_DEPLOY_MODE:'online'}),false);
  assert.equal(indexingEnabled({VERCEL_ENV:'production',TOPRAK_DEPLOY_MODE:'demo'}),false);
  assert.equal(indexingEnabled({VERCEL_ENV:'production'}),false);
  assert.match(robotsContent(false),/Disallow: \/$/m);
  assert.match(robotsContent(true,'https://www.toprakehli.com'),/Sitemap: https:\/\/www\.toprakehli\.com\/sitemap\.xml/);
});

test('home may be indexed while unverified source detail remains blocked',()=>{
  const home=indexableHomeHtml('<head><meta name="robots" content="noindex, nofollow"></head>');
  assert.doesNotMatch(home,/noindex/);
  const source=propertyHtml('',referenceListings[0],'https://www.toprakehli.com',true);
  assert.match(source,/<meta name="robots" content="noindex, nofollow">/);
  const published={id:'real-1',region:'Tekirdağ',local:'Test',title:'Test',photos:[],status:'published',publicationApproved:true,isDemo:false};
  const real=propertyHtml('',published,'https://www.toprakehli.com',true);
  assert.doesNotMatch(real,/<meta name="robots" content="noindex, nofollow">/);
});

test('Vercel keeps admin pages out of search without blocking the homepage',()=>{
  const config=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
  const root=config.headers.find(rule=>rule.source==='/(.*)');
  assert.ok(!root.headers.some(header=>header.key==='X-Robots-Tag'));
  for(const path of ['/admin','/admin/','/admin/:path*']){
    const rule=config.headers.find(item=>item.source===path);
    assert.equal(rule.headers.find(header=>header.key==='X-Robots-Tag')?.value,'noindex, nofollow');
  }
});
