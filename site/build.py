#!/usr/bin/env python3
"""Build the standalone MBTI introduction from its own copy and actual profile data."""
import argparse, html, json, re, shutil
from pathlib import Path
H=html.escape

def profiles(repo):
 source=(repo/'src/data/core/mbti-data.ts').read_text().split('export const mbtiTypes: MBTIType[] = [',1)[1].split('\n];',1)[0]
 records=[]
 for block in re.split(r'\n  \{\n    type: ',source)[1:]:
  fields={name:re.search(r'(?<!\w)'+name+r': "([^"]+)"',('type: '+block)).group(1) for name in ['type','title','image','color','cognitiveFunctions']}
  records.append(fields)
 assert len(records)==16
 return records

def build(repo,out):
 cfg=json.loads((repo/'site/project.json').read_text());content=json.loads((repo/'site/content.json').read_text());data=profiles(repo)
 out.mkdir(parents=True,exist_ok=True);media=out/'media';media.mkdir(exist_ok=True)
 for name in ['style.css','demo.js']:shutil.copy(repo/'site'/name,out/name)
 shutil.copy(repo/'docs/readme/assets/frankie.svg',media/'signature.svg');shutil.copy(repo/'docs/readme/banner.png',media/'banner.png')
 for name in ['types-current.png','profile-current.png','groups-current.png','claims-current.png','pairing-current.png']:shutil.copy(repo/'site/assets'/name,media/name)
 for p in data:shutil.copy(repo/'public/mbti_img'/p['image'],media/p['image'])
 (out/'.nojekyll').touch()
 for lang,c in content.items():
  zh=lang=='zh';pre='../' if zh else './';dest=out/'zh' if zh else out;dest.mkdir(exist_ok=True)
  rows=lambda xs:''.join('<article><h3>'+H(a)+'</h3><p>'+H(b)+'</p></article>' for a,b in xs)
  controls=''.join(f'<button type="button" data-dimension="{i}" aria-label="{H(pair[1])}"><span>{a}</span><span class="track"><span class="knob"></span></span><span>{b}</span></button>' for i,(a,b,pair) in enumerate(zip('ESTJ','INFP',c['pairs'])))
  gallery=''.join(f'<figure><a href="{pre}media/{name}"><img src="{pre}media/{name}" width="1468" height="1247" alt="{H(caption)}" loading="lazy"></a><figcaption>{H(caption)}</figcaption></figure>' for name,caption in zip(['types-current.png','profile-current.png','groups-current.png','claims-current.png','pairing-current.png'],c['captions']))
  j=json.dumps({'profiles':data,'stack':c['stack'],'prefix':pre+'media/'},ensure_ascii=False).replace('<','\\u003c')
  page=f'''<!doctype html><html lang="{'zh-CN' if zh else 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Frank MBTI | {'偏好、类型与认知功能' if zh else 'Preferences, types & functions'}</title><meta name="description" content="{H(c['intro'])}"><meta name="theme-color" content="#ffffff"><link rel="canonical" href="{cfg['pages_url']+('zh/' if zh else '')}"><link rel="alternate" hreflang="en" href="{cfg['pages_url']}"><link rel="alternate" hreflang="zh-CN" href="{cfg['pages_url']}zh/"><link rel="stylesheet" href="{pre}style.css"><meta property="og:type" content="website"><meta property="og:url" content="{cfg['pages_url']+('zh/' if zh else '')}"><meta property="og:title" content="Frank MBTI"><meta property="og:description" content="{H(c['intro'])}"><meta property="og:image" content="{cfg['pages_url']}media/banner.png"></head><body>
<a class="skip" href="#main">{'跳至内容' if zh else 'Skip to content'}</a><header class="shell"><a class="brand" href="{pre}">Frank <span>MBTI</span></a><nav aria-label="{'页面导航' if zh else 'Page navigation'}"><a href="#framework">{c['nav'][0]}</a><a href="#use">{c['nav'][1]}</a><a href="#screens">{c['nav'][2]}</a><a href="{pre}" lang="en" {'aria-current="page"' if not zh else ''}>EN</a><a href="{pre}zh/" lang="zh-CN" {'aria-current="page"' if zh else ''}>中文</a></nav></header>
<main id="main" class="shell"><section class="hero"><div><h1>{H(c['headline']).replace(chr(10),'<br>')}</h1><p class="intro">{H(c['intro'])}</p><div class="actions"><a class="button" href="{cfg['app_url']}">{H(c['open'])} ↗</a><a href="#demo">{H(c['try'])}</a></div></div><figure class="hero-screen"><img src="{pre}media/types-current.png" width="1468" height="1247" alt="{H(c['captions'][0])}" fetchpriority="high"></figure></section>
<section class="section" id="framework"><h2>{H(c['concept_title'])}</h2><p class="lead">{H(c['concept'])}</p><div class="pairs">{''.join('<article><span class="pair-code">'+H(a)+'</span><h3>'+H(b)+'</h3><p>'+H(d)+'</p></article>' for a,b,d in c['pairs'])}</div><p class="reference">{H(c['reference'])} <a href="https://www.myersbriggs.org/my-mbti-personality-type/the-mbti-preferences/">Myers & Briggs Foundation ↗</a></p></section>
<section class="section demo" id="demo"><div><h2>{H(c['demo_title'])}</h2><p>{H(c['demo_note'])}</p><div class="switches">{controls}</div><p class="small">{H(c['profile_note'])}</p></div><div class="stage"><div class="stage-title" aria-live="polite"><strong id="type-code">INFP</strong><span id="type-title">调停者</span></div><img id="type-art" src="{pre}media/Mediator.svg" alt="INFP" width="270" height="330" loading="lazy"><div class="stack"><span>{H(c['stack'])}</span><strong id="type-stack">Fi → Ne → Si → Te</strong></div></div></section>
<section class="section functions"><div><h2>{H(c['functions_title'])}</h2><p class="lead">{H(c['functions_intro'])}</p></div><p class="example">{H(c['example'])}</p></section>
<section class="section"><h2>{H(c['views_title'])}</h2><div class="views">{rows(c['views'])}</div></section>
<section class="section claims"><div><h2>{H(c['claims_title'])}</h2><p class="lead">{H(c['claims'])}</p><p class="small">{H(c['claims_note'])}</p></div><img src="{pre}media/claims-current.png" width="1468" height="1247" alt="{H(c['captions'][3])}" loading="lazy"></section>
<section class="section" id="use"><h2>{H(c['workflow_title'])}</h2><ol class="steps">{''.join('<li><h3>'+H(a)+'</h3><p>'+H(b)+'</p></li>' for a,b in c['steps'])}</ol></section>
<section class="section" id="screens"><h2>{H(c['gallery_title'])}</h2><div class="gallery">{gallery}</div></section>
<section class="section runtime" id="start"><div><h2>{H(c['start_title'])}</h2><p>{H(c['runtime'])}</p><details><summary>{'可选咨询与数据' if zh else 'Optional consultation & data'}</summary><p>{H(c['ai'])}</p></details><p class="small">{H(c['limits'])}</p></div><div><h3>{H(c['local'])}</h3><pre><code>npm ci\nnpm run dev</code></pre><p>{H(c['local_note'])}</p><a href="https://github.com/{cfg['repository']}/blob/main/site/GUIDE.md">{H(c['guide'])} ↗</a></div></section></main>
<footer class="shell"><img src="{pre}media/signature.svg" width="86" height="36" alt="Frankie"><span>{H(c['footer'])}</span><a href="https://github.com/{cfg['repository']}">{H(c['source'])} ↗</a></footer><script id="profile-data" type="application/json">{j}</script><script src="{pre}demo.js" defer></script></body></html>'''
  (dest/'index.html').write_text(page)
 print(out)
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--out',default='_site');a=ap.parse_args();build(Path(__file__).resolve().parents[1],Path(a.out).resolve())
