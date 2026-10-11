"""Gera js/assuntos/provas-questoes.js a partir de docs/questoes-ineditas.md.
Uso (na raiz do projeto):  python3 docs/gerar-banco-questoes.py docs/questoes-ineditas.md js/assuntos/provas-questoes.js
Blocos especiais no .md: ```fig ID``` (figura SVG), ```conta + (números)``` (conta armada),
```sistema```, ```matriz NOME```, ```det``` (notação matemática)."""
import re, json, sys, html
src=open(sys.argv[1]).read()
def inline(t):
    t=html.escape(t, quote=False)
    t=re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t=re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<i>\1</i>', t)
    return t
def md(text):
    lines=text.strip('\n').split('\n'); out=[]; i=0
    while i<len(lines):
        l=lines[i]
        if l.startswith('```'):
            kind=l[3:].strip().split(' ',1); tag=kind[0]; arg=kind[1] if len(kind)>1 else ''
            j=i+1; buf=[]
            while not lines[j].startswith('```'): buf.append(lines[j]); j+=1
            i=j+1
            if tag=='fig':      # figura/gráfico em SVG, desenhado por js/assuntos/provas-figuras.js
                out.append(f'<figure class="bq-figure" data-fig="{arg}"></figure>')
            elif tag=='conta':  # conta armada: o resultado é calculado no app (contaArmada)
                out.append(f'<div class="bq-conta" data-op="{html.escape(arg)}" data-n="{html.escape("|".join(buf))}"></div>')
            elif tag=='sistema':
                out.append('<div class="bq-sys" role="math">'+''.join(f'<span>{inline(x)}</span>' for x in buf)+'</div>')
            elif tag in ('matriz','det'):
                rows=[x for x in buf if not x.startswith('=')]; tail=[x for x in buf if x.startswith('=')]
                name=f'<span class="bq-mat-name">{inline(arg)} =</span>' if arg else ''
                body='<table class="bq-mat-t">'+''.join('<tr>'+''.join(f'<td>{inline(c)}</td>' for c in r.split())+'</tr>' for r in rows)+'</table>'
                out.append(f'<div class="bq-mat-row" role="math">{name}<span class="bq-mat {tag}">{body}</span>'+(f'<span class="bq-mat-tail">{inline(tail[0])}</span>' if tail else '')+'</div>')
            else:
                out.append('<pre class="bq-pre">'+'\n'.join(html.escape(x, quote=False) for x in buf)+'</pre>')
            continue
        if l.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].startswith('|'):
                cells=[c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?',c) for c in cells): rows.append(cells)
                i+=1
            h='<div class="bq-tw"><table class="bq-table"><thead><tr>'+''.join(f'<th>{inline(c)}</th>' for c in rows[0])+'</tr></thead><tbody>'
            h+=''.join('<tr>'+''.join(f'<td>{inline(c)}</td>' for c in r)+'</tr>' for r in rows[1:])+'</tbody></table></div>'
            out.append(h); continue
        if re.match(r'\s*- ',l):
            items=[]
            while i<len(lines) and re.match(r'\s*- ',lines[i]):
                items.append(re.sub(r'^\s*- ','',lines[i])); i+=1
            out.append('<ul>'+''.join(f'<li>{inline(x)}</li>' for x in items)+'</ul>'); continue
        if not l.strip(): i+=1; continue
        buf=[]
        while i<len(lines) and lines[i].strip() and not lines[i].startswith(('```','|')) and not re.match(r'\s*- ',lines[i]):
            buf.append(lines[i]); i+=1
        out.append('<p>'+'<br>'.join(inline(x) for x in buf)+'</p>')
    return ''.join(out)

KEYS={'ENEM':'enem','ETEC':'etec','FUVEST':'fuvest','UNICAMP':'unicamp','UNESP':'unesp','OBMEP':'obmep'}
bank={}
parts=re.split(r'\n# [^\n]*?(ENEM|ETEC|FUVEST|UNICAMP|UNESP|OBMEP)[^\n]*\n', src)
for k in range(1,len(parts),2):
    name, body = parts[k], parts[k+1]
    qs_txt, rest = body.split('\n## ✅',1)
    gab_tbl = rest.split('\n## 📝',1)[0]
    letters=[c.strip() for c in gab_tbl.strip().split('\n')[-1].strip('|').split('|')]
    sols_txt = rest.split('\n## 📝',1)[1].split('\n',1)[1]
    sols=re.split(r'\n\*\*Questão (\d+) — ', '\n'+sols_txt)
    soldict={}
    for s in range(1,len(sols),2):
        n=int(sols[s]); t=sols[s+1].split('\n---')[0]
        head,bodys=t.split('**\n',1)
        soldict[n]=(head.strip(), md(bodys))
    qs=[]
    for blk in re.split(r'\n### [A-Z]+ · Questão ', qs_txt)[1:]:
        n=int(blk.split('\n',1)[0]); b=blk.split('\n',1)[1].split('\n---')[0]
        m=re.match(r'\*\*Conteúdo:\*\* (.+?) · \*\*Dificuldade:\*\* (\w+)\n', b)
        cont, dif = m.group(1), m.group(2); b=b[m.end():]
        bl=b.rstrip().split('\n'); opts=[]
        while bl and re.match(r'^\(?[A-Ea-e]\)\s', bl[-1]):
            opts.insert(0, re.sub(r'^\(?[A-Ea-e]\)\s','',bl.pop()))
        assert len(opts) in (4,5), (name,n,opts)
        L=letters[n-1].upper(); ans='ABCDE'.index(L)
        assert ans<len(opts)
        head,solh=soldict[n]
        assert head.lstrip("(").upper().startswith(L), (name,n,head)
        qs.append({'n':n,'topic':cont,'diff':dif,'html':md('\n'.join(bl)),'opts':[inline(o.rstrip('.') if False else o) for o in opts],'ans':ans,'solHead':inline(head),'sol':solh})
    assert len(qs)==10,(name,len(qs))
    bank[KEYS[name]]=qs
js='/* =========================================================\n   QUESTÕES INÉDITAS POR PROVA — 10 por prova, no estilo de cada uma\n   Usadas no "Simulado da prova" (js/telas/simulado-prova.js).\n   ARQUIVO GERADO: edite docs/questoes-ineditas.md e rode docs/gerar-banco-questoes.py.\n   Questões INÉDITAS, criadas pelo Matemática Show no estilo de cada prova (não são oficiais).\n   Campos: topic (assunto), diff (fácil/média/difícil), html (enunciado),\n   opts (alternativas), ans (índice da correta), solHead + sol (resolução).\n   ========================================================= */\nconst EXAM_BANK = '+json.dumps(bank, ensure_ascii=False, indent=1)+';\n'
open(sys.argv[2],'w').write(js)
print({k:len(v) for k,v in bank.items()}, [ (k,[q['ans'] for q in v]) for k,v in bank.items()])
