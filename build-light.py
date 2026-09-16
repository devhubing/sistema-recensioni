"""Regenerate the light HTML variants after changes to their dark sources."""
from pathlib import Path
import json
import re

BASE = Path(__file__).resolve().parent
SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>'
MOON = '<path d="M20 14a8.5 8.5 0 0 1-10-10 8.5 8.5 0 1 0 10 10Z"/>'


def navigation(html, target, label, icon):
    control = f'<!-- theme-switch:start --><a class="theme-switch" href="{target}" aria-label="Passa alla versione {label.lower()}" title="Versione {label.lower()}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true">{icon}</svg><span>{label}</span></a><!-- theme-switch:end -->'
    # The theme control stays next to the brand, outside the collapsible menu.
    return re.sub(r'(<a class="brand".*?</a>)', lambda match: match[0] + control, html, count=1, flags=re.S)


for name in ('desgin-codex.html', 'demo.html'):
    original = (BASE / name).read_text(encoding='utf-8')
    original = re.sub(r'<!-- theme-switch:start -->.*?<!-- theme-switch:end -->', '', original, flags=re.S)
    original = original.replace('<link rel="stylesheet" href="theme-switch.css">', '')
    light_name = name.replace('.html', '-light.html')
    dark = navigation(original, light_name, 'Light', SUN)
    dark = dark.replace('</head>', '<link rel="stylesheet" href="theme-switch.css"></head>')
    (BASE / name).write_text(dark, encoding='utf-8')

    light = original.replace('<html lang="it">', '<html lang="it" data-theme="light">')
    light = re.sub(r'(<title>)(.*?)(</title>)', r'\1\2 / Light\3', light)
    light = light.replace('name="theme-color" content="#191919"', 'name="theme-color" content="#f2f0e9"')
    light = light.replace('href="demo.html', 'href="demo-light.html')
    light = light.replace('href="desgin-codex.html', 'href="desgin-codex-light.html')
    light = light.replace('Rosso + Carbone', 'Rosso + Avorio').replace('Rosso + Dark', 'Rosso + Light')
    light = light.replace('Rosso che prende posizione. Dark che lascia spazio.', 'Rosso che prende posizione. Luce che lascia spazio.')
    light = light.replace('Design system & motion playground</span>', 'Design system & motion playground / Light</span>')
    light = light.replace('Desgin Codex / Demo animata</span>', 'Desgin Codex / Demo animata / Light</span>')
    light = light.replace('ROSSO, DARK E UN PUNTO DI VISTA.', 'ROSSO, LUCE E UN PUNTO DI VISTA.')

    if name == 'desgin-codex.html':
        light = light.replace('Un rosso energico su neri morbidi e stratificati. L\'avorio introduce respiro e rende ogni contrasto intenzionale.', 'Un fondo avorio caldo, superfici gesso e testi carbone. Il rosso mantiene energia e riconoscibilità in un sistema luminoso.')
        colors = [
            ('swatch-dark', '#F2F0E9', 'Avorio', '02 / Canvas', '--canvas'),
            ('swatch-surface', '#FFFDF8', 'Gesso', '03 / Surface', '--surface'),
            ('swatch-paper', '#191919', 'Carbone', '04 / Contrast', '--ink'),
        ]
        for cls, color, title, role, token in colors:
            tile = f'<button class="swatch {cls} reveal" data-copy="{color}" aria-label="Copia {title}, {color}"><span class="swatch-top"><span class="mono">{role}</span><span class="copy-icon">↗</span></span><span class="swatch-data"><span class="swatch-title">{title}</span><small>{color}</small><small>{token}</small></span></button>'
            light = re.sub(r'<button class="swatch ' + cls + r' reveal".*?</button>', lambda match: tile, light, flags=re.S)
        light = light.replace('Testi carbone sul rosso; avorio sul dark.', 'Testi carbone su avorio e rosso. Rosso profondo per etichette e link.')
        light = light.replace('Avorio / Carbone <b', 'Carbone / Avorio <b')
        light = light.replace('<span>65% dark</span><span>25% avorio</span>', '<span>65% avorio</span><span>25% carbone</span>')
        light = light.replace('#B3D9B3', '#356441').replace('#EACA8A', '#80570D').replace('#FF5264', '#B7182E')
        light = light.replace("const tokens = ['red'", "const tokens = ['canvas','ink','accent-text','error','red'")
        light = light.replace('desgin-codex / v.01 — Design tokens', 'desgin-codex / v.01 — Light design tokens')
        light = light.replace("anchor.download = 'desgin-codex-tokens.css'", "anchor.download = 'desgin-codex-light-tokens.css'")
        light = light.replace('Scarica i token CSS', 'Scarica i token light')

    light = navigation(light, name, 'Dark', MOON)
    light = light.replace('</head>', '<link rel="stylesheet" href="theme-switch.css"><link rel="stylesheet" href="light.css"></head>')
    (BASE / light_name).write_text(light, encoding='utf-8')

# Full light token set, including inherited brand/spacing/typography tokens.
tokens = json.loads((BASE / 'tokens.json').read_text(encoding='utf-8'))
overrides = re.search(r':root\s*\{(.*?)\}', (BASE / 'light.css').read_text(), re.S)[1]
tokens.update({name: value.strip() for name, value in re.findall(r'--([\w-]+):\s*([^;]+);', overrides)})
(BASE / 'tokens-light.json').write_text(json.dumps(tokens, indent=2) + '\n', encoding='utf-8')
css = '/* desgin-codex / Light - Full token set. Use --canvas and --ink for the page. */\n:root {\n  color-scheme: light;\n'
css += ''.join(f'  --{key}: {value};\n' for key, value in tokens.items()) + '}\n'
(BASE / 'tokens-light.css').write_text(css, encoding='utf-8')
print('Generated: demo-light.html, desgin-codex-light.html, light tokens, theme links.')
