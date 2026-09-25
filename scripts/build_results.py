#!/usr/bin/env python3
"""Render paper-verified results as static HTML. No build step is needed to serve the site."""
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'assets/data/results.json').read_text())

def table(identifier, methods, columns, scores, averages=None):
    # scores are dataset-major; transpose only the layout, never round or recompute values.
    values = [[scores[c][m] for c in range(len(columns))] for m in range(len(methods))]
    if averages is not None:
        columns = columns + ['Average']
        for i, v in enumerate(values):
            v.append([averages[i], None])
    ranks = [sorted({float(v[c][0]) for v in values}, reverse=True) for c in range(len(columns))]
    html = [f'<div class="table-scroll" role="region" aria-label="{escape(identifier)} results, scroll horizontally" tabindex="0"><table>',
            f'<caption class="sr-only">{escape(identifier)}. Higher is better.</caption>',
            '<thead><tr><th scope="col">Method</th>']
    for c in columns:
        label = escape(c).replace('_', '_<wbr>')
        html.append(f'<th scope="col">{label} <span class="arrow" aria-label="higher is better">↑</span></th>')
    html.append('</tr></thead><tbody>')
    for m, method in enumerate(methods):
        html.append('<tr' + (' class="ours"' if method == 'MoSDOT' else '') + '>')
        html.append(f'<th scope="row">{escape(method)}' + (' <span class="ours-label">Ours</span>' if method == 'MoSDOT' else '') + '</th>')
        for c, (mean, uncertainty) in enumerate(values[m]):
            rank = ranks[c].index(float(mean))
            cls = 'best' if rank == 0 else 'second' if rank == 1 else ''
            label = 'Best mean' if rank == 0 else 'Second-best mean' if rank == 1 else ''
            number = escape(mean).replace('-', '−')
            html.append(f'<td><span class="score {cls}"' + (f' title="{label}"' if label else '') + f'>{number}')
            if uncertainty is not None:
                html.append(f'<span class="uncertainty"> ± {escape(uncertainty)}</span>')
            html.append('</span></td>')
        html.append('</tr>')
    html.append('</tbody></table></div>')
    return ''.join(html)

def render():
    out=[]
    for key, benchmark in data['benchmarks'].items():
        b=benchmark
        out.append(f'<section id="panel-{key}" class="benchmark-panel" aria-labelledby="tab-{key}">')
        if key=='smac1':
            out.append('<div class="panel-heading"><div><h3>SMACv1</h3><p>Five scenarios, three dataset qualities.</p></div><label class="scenario-control">View <select id="scenario-select"><option value="average">All scenarios · reported average</option>')
            for s in b['scenarios']:
                out.append(f'<option value="{s}">{s}</option>')
            out.append('</select></label></div>')
            out.append('<div class="scenario-panel" data-scenario="average"><h4 class="fallback-title">All scenarios · reported average</h4>')
            out.append(table(b['title']+' published average',b['methods'],[],[],b['averages'])+'</div>')
            for i,s in enumerate(b['scenarios']):
                out.append(f'<div class="scenario-panel" data-scenario="{s}"><h4 class="fallback-title">{s}</h4>')
                out.append(table(b['title']+' / '+s,b['methods'],b['columns'],b['scores'][3*i:3*i+3])+'</div>')
        else:
            desc='Continuous actions · four dataset qualities' if key=='mpe' else 'Discrete actions · replay datasets'
            out.append(f'<div class="panel-heading"><div><h3>{b["title"]}</h3><p>{desc}</p></div><span class="source-tag">Paper · Table {b["table"]}</span></div>')
            out.append(table(b['title'],b['methods'],b['columns'],b['scores'],b['averages']))
        notes={'mpe':'MoSDOT leads on Medium, Medium-Replay, and Random; ICQ has the highest Expert mean.',
               'smac1':'Reported average reward: MoSDOT 16.7; MAC-Flow and DoF 15.6. Select a scenario to inspect all means and uncertainties.',
               'smac2':'DoF has the highest reported average (14.0), followed by MAC-Flow (13.1); MoSDOT reports 11.9.'}
        out.append(f'<p class="table-takeaway">{notes[key]}</p></section>')
    return '\n'.join(out)

html=(ROOT/'index.html').read_text()
start='<!-- BENCHMARK_TABLES_START -->'
end='<!-- BENCHMARK_TABLES_END -->'
a,rest=html.split(start)
_,b=rest.split(end)
html=a+start+'\n'+render()+'\n'+end+b
start='<!-- TEACHER_TABLE_START -->';end='<!-- TEACHER_TABLE_END -->'
a,rest=html.split(start);_,b=rest.split(end)
t=data['teacher'];scores=[[[row[c],None] for row in t['scores']] for c in range(4)]
html=a+start+'\n'+table('Joint-teacher landmark diagnostics',t['methods'],t['columns'],scores)+'\n'+end+b
(ROOT/'index.html').write_text(html)
print('Rendered all benchmark values and teacher diagnostics without rounding.')
