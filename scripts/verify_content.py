#!/usr/bin/env python3
"""Verify static assets and, optionally, every result against the supplied paper sources.
Usage: python3 scripts/verify_content.py [--source-zip SOURCE.zip] [--paper-text paper.txt]
The optional text file must be produced by pdftotext -layout.
"""
import argparse
import hashlib
import json
import re
import subprocess
import sys
import zipfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--source-zip', type=Path)
parser.add_argument('--paper-text', type=Path)
args = parser.parse_args()
data = json.loads((ROOT/'assets/data/results.json').read_text())
figures = json.loads((ROOT/'assets/data/figures.json').read_text())
benchmarks = data['benchmarks']
rows = [row for key in ('smac1','smac2','mpe') for row in benchmarks[key]['scores']]
averages = [benchmarks[key]['averages'] for key in ('smac1','smac2','mpe')]
assert sum(map(len, rows)) == 194
assert sum(map(len, averages)) == 26

class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.files = [], [], []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        for key in ('href','src','data-figure'):
            url = attrs.get(key)
            if not url: continue
            if url.startswith('#'): self.links.append(url[1:])
            elif not urlsplit(url).scheme: self.files.append(unquote(urlsplit(url).path))

html = (ROOT/'index.html').read_text()
assets = AssetParser(); assets.feed(html)
assert len(assets.ids) == len(set(assets.ids)), 'Duplicate HTML IDs'
assert set(assets.links) <= set(assets.ids), 'Broken anchor'
for path in assets.files:
    target = ROOT/path
    assert target.is_file() or (target.is_dir() and (target/'index.html').is_file()), f'Missing asset: {path}'
assert 'Anonymous' not in html and 'Submitted to' not in html
for figure in figures:
    original = ROOT/'assets/figures/original'/Path(figure['overleafFile']).name
    assert hashlib.sha256(original.read_bytes()).hexdigest() == figure['sha256']
assert hashlib.sha256((ROOT/'assets/paper/paper.pdf').read_bytes()).hexdigest() == data['source']['manuscriptSha256']
subprocess.run([sys.executable, str(ROOT/'scripts/build_results.py')], check=True, capture_output=True)
assert (ROOT/'index.html').read_text() == html, 'Rendered tables differ from canonical data; regenerated index.html, review changes'
print('PASS: local assets, anchors, original figure hashes, manuscript hash, and deterministic table rendering.')

if args.source_zip:
    assert hashlib.sha256(args.source_zip.read_bytes()).hexdigest() == data['source']['sourceArchiveSha256']
    with zipfile.ZipFile(args.source_zip) as archive:
        tex = archive.read('tables/q1-eval.tex').decode()
        tex = '\n'.join(line.split('%')[0] for line in tex.splitlines())
        source_rows, source_averages = [], []
        for row in tex.split(r'\\'):
            scores = re.findall(r'\\score\{([^}]+)\}\{([^}]+)\}', row)
            if scores: source_rows.append([list(score) for score in scores])
            elif 'Average rewards' in row: source_averages.append(re.findall(r'\$(\d+\.\d+)\$', row))
        assert source_rows == rows and source_averages == averages
        for figure in figures:
            assert archive.read(figure['overleafFile']) == (ROOT/'assets/figures/original'/Path(figure['overleafFile']).name).read_bytes()
        experiments = archive.read('content/04_experiments.tex').decode()
        teacher_rows = []
        for row in experiments.split(r'\\'):
            values = re.findall(r'\b0\.\d{3}\b',row)
            if len(values)==4: teacher_rows.append(values)
        assert teacher_rows == data['teacher']['scores']
    print('PASS: 194 mean/2σ pairs, 26 reported averages, 16 teacher metrics, and 5 original PDFs match Camera-ready source.')

if args.paper_text:
    paper = args.paper_text.read_text().split('\f')
    page = paper[8]
    paper_rows = [re.findall(r'(-?\d+\.\d+)\s*±\s*(\d+\.\d+)',line.replace('−','-')) for line in page.splitlines()]
    paper_rows = [values for values in paper_rows if values]
    assert paper_rows == [[tuple(s) for s in row] for row in rows]
    for average in averages:
        assert any(re.findall(r'(?<!\d)\d+\.\d+',line)==average for line in page.splitlines() if 'Average rewards' in line)
    for values in data['teacher']['scores']:
        assert any(re.findall(r'\b0\.\d{3}\b',line)==values for line in paper[6].splitlines())
    print('PASS: all benchmark and teacher values also match the supplied rendered manuscript text (pages 7 and 9).')
