"""Writes src/data/sixnineRange.json from the owner's "SIXNINE Wheels Catalogue" Google Sheet.

The sheet is a scrape of sixnine-wheels.com (19 November 2026). Export it from Google Sheets as
.xlsx (File > Download > Microsoft Excel) and run, from the repository root:

    python3 scripts/sixnine-range-from-sheet.py path/to/SIXNINE_Wheels_Catalogue.xlsx

It needs Python 3 with openpyxl (pip install openpyxl). It reads the "Wheel sizes" tab, one row
per size and bolt pattern, and keeps only what Sixnine publishes about the wheel itself: size,
offset, bolt pattern, finishes, load rating, centre bore, concavity, weight and construction.
Prices, stock, delivery dates, certificates and shop links are left out on purpose: they are
Sixnine's terms for its own shop in Germany, in euro, not this shop's (see AGENTS.md).
"""

import json
import os
import sys
from collections import Counter

import openpyxl

SERIES_ORDER = ['FF-ONE', 'FF-TWO', 'FF-THREE', 'EVO-ONE', 'EVO-TWO', 'OEM+ONE']
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'data', 'sixnineRange.json')


def num(value):
    """A number from the sheet, or None for blanks and text such as 'ETX (vehicle-specific)'."""
    if isinstance(value, (int, float)):
        return int(value) if float(value).is_integer() else round(float(value), 2)
    return None


def text(value):
    return None if value in (None, '') else str(value).strip()


def construction(value):
    """The sheet's wording, reduced to what the page may say. 'Not stated' becomes None."""
    value = text(value) or ''
    if value.startswith('Flow forged'):
        return 'Flow forged'
    if value.startswith('Flow form'):
        return 'Flow formed'
    if value.startswith('Forged, 2-piece'):
        return 'Forged, 2-piece'
    if value.startswith('Forged, 1-piece'):
        return 'Forged, 1-piece'
    return None


def main(path):
    sheet = openpyxl.load_workbook(path, data_only=True, read_only=True)['Wheel sizes']
    rows = [r for r in sheet.iter_rows(values_only=True) if any(c not in (None, '') for c in r)]
    head = rows[0]
    col = {name: head.index(name) for name in head if name}

    by_series = {code: [] for code in SERIES_ORDER}
    for r in rows[1:]:
        get = lambda name: r[col[name]]
        code = text(get('Series'))
        if code not in by_series:
            raise SystemExit(f'Unknown series {code!r}: add it to SERIES_ORDER and to src/data/sixnineSeries.ts')
        is_set = text(get('Sold as')) == 'Set of 4 wheels'
        finishes = text(get('Colours offered')) or ''
        pcd = text(get('Bolt pattern (PCD)')) or ''
        by_series[code].append({
            'size': text(get('Size')),
            'diameter': num(get('Diameter (inch)')),
            'width': num(get('Width (J)')),
            'offset': num(get('Offset (ET)')),
            'boltPatterns': [p.strip() for p in pcd.split('/') if p.strip()],
            'note': text(get('Edition or fitment note')),
            # A set's finishes are free text on the sheet ("Standard colours included, ..."); a single
            # wheel's are Sixnine's finish names, comma-separated, each one CamelCase word.
            'finishes': [] if is_set else [f.strip() for f in finishes.split(',') if f.strip()],
            'finishesText': finishes if is_set else None,
            'soldAs': 'set' if is_set else 'wheel',
            'preOrder': text(get('Pre-order')) == 'Yes',
            'loadKg': num(get('Load rating (kg)')),
            'centreBoreMm': num(get('Centre bore (mm)')),
            'concavityMm': num(get('Concavity or deep lip (mm)')),
            'concavityNote': text(get('Concavity note')),
            'weightKg': num(get('Weight (kg, approx.)')),
            'construction': construction(get('Construction')),
            'flag': text(get('Data flag')),
        })

    series = []
    for code in SERIES_ORDER:
        sizes = by_series[code]
        if not sizes:
            raise SystemExit(f'{code} has no sizes on the sheet')
        # A construction is said of the whole series only when most single-wheel sizes state it.
        singles = [s for s in sizes if s['soldAs'] == 'wheel']
        stated = Counter(s['construction'] for s in singles if s['construction'])
        top = stated.most_common(1)
        series_construction = top[0][0] if top and top[0][1] * 2 > len(singles) else None
        series.append({'code': code, 'construction': series_construction, 'sizes': sizes})

    data = {
        'source': {
            'title': 'SIXNINE Wheels Catalogue (owner\'s Google Sheet, "Wheel sizes" tab)',
            'scrapedFrom': 'https://sixnine-wheels.com',
            'scrapedOn': '2026-11-19',
        },
        'series': series,
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(f'Wrote {sum(len(s["sizes"]) for s in series)} sizes in {len(series)} series to {os.path.relpath(OUT)}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
