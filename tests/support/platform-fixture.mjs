import {PGlite} from '@electric-sql/pglite';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {HttpError} from '../../server/validation.mjs';
export async function createSqlFixture(actor){
  const sql=new PGlite();
  await sql.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
  await sql.exec(await readFile('supabase/migrations/001_platform.sql','utf8'));
  await sql.query('insert into auth.users values($1)',[actor]);
  const tables=new Set(['te_state','te_sessions','te_limits','te_media','te_snapshots','te_audit','te_leads']);
  function queryParts(query=''){
    const params=new URLSearchParams(query),args=[],conditions=[];
    for(const [key,value] of params){if(['select','order','limit'].includes(key))continue;assert.match(key,/^[a-z_]+$/);const [operator,...parts]=value.split('.');assert.ok(['eq','lt'].includes(operator));args.push(parts.join('.'));conditions.push(`"${key}" ${operator==='eq'?'=':'<'} $${args.length}`);}
    return {params,args,where:conditions.length?' where '+conditions.join(' and '):''};
  }
  const objects=new Map();
  const db={
    async select(table,query){assert.ok(tables.has(table));const {params,args,where}=queryParts(query);const fields=params.get('select') || '*';assert.match(fields,/^[a-z_,*]+$/);let suffix='';if(params.has('order')){const [key,dir]=params.get('order').split('.');assert.match(key,/^[a-z_]+$/);assert.ok(['asc','desc'].includes(dir));suffix+=` order by ${key} ${dir}`;}if(params.has('limit'))suffix+=` limit ${Number(params.get('limit'))}`;return (await sql.query(`select ${fields} from ${table}${where}${suffix}`,args)).rows;},
    async insert(table,data){assert.ok(tables.has(table));const keys=Object.keys(data);return (await sql.query(`insert into ${table}(${keys.join(',')}) values(${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(data))).rows;},
    async remove(table,query){const {where,args}=queryParts(query);return sql.query(`delete from ${table}${where}`,args);},
    async patch(table,query,data){const {where,args}=queryParts(query),keys=Object.keys(data);return sql.query(`update ${table} set ${keys.map((key,i)=>`${key}=$${args.length+i+1}`).join(',')}${where}`,[...args,...Object.values(data)]);},
    async rpc(name,data){assert.match(name,/^te_[a-z_]+$/);try{return (await sql.query(`select ${name}(${Object.keys(data).map((key,i)=>`${key}=>$${i+1}`).join(',')}) as value`,Object.values(data).map(value=>value && typeof value==='object'?JSON.stringify(value):value))).rows[0].value;}catch(error){if(error.message.includes('revision_conflict'))throw new HttpError(409,'Revision conflict');if(error.message.includes('media_referenced'))throw new HttpError(409,'Media referenced');if(error.message.includes('archive_required'))throw new HttpError(400,'Archive required');throw error;}},
    async signIn(data){if(data.email==='admin@example.test' && data.password==='test-password')return {user:{id:actor}};throw new HttpError(401,'Bad credentials');},
    async request(path,options={}){if(options.method==='DELETE'){for(const key of JSON.parse(options.body).prefixes)objects.delete(key);return null;}const key=path.replace(/^\/storage\/v1\/object\/(authenticated\/)?te-photos\//,'');if(options.method==='POST'){objects.set(key,options.body);return {};}return new Response(objects.get(key),{headers:{'Content-Type':'image/webp'}});},
  };

return {sql,db,objects};
}
