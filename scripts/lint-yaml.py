# Flags frontmatter scalars that YAML would misparse: unquoted values containing ": " or " #".
import re, sys, glob
bad = 0
for f in sorted(glob.glob('src/content/**/*.mdx', recursive=True)):
    fm = open(f).read().split('---')[1]
    in_block = False
    for n, line in enumerate(fm.split('\n'), 2):
        if re.match(r'^\s*[\w]+: [|>]-?\s*$', line) or re.match(r'^\s*- [\w]+: [|>]-?\s*$', line):
            in_block = True; indent = len(line) - len(line.lstrip()); continue
        if in_block:
            if line.strip() == '' or len(line) - len(line.lstrip()) > indent: continue
            in_block = False
        m = re.match(r'^\s*(?:- )?(?:[\w]+: )?(.*)$', line)
        val = m.group(1) if m else ''
        if not val or val[0] in '\'"[{|>': continue
        if ': ' in val or ' #' in val or val.startswith(('`', '*', '@', '%', '!', '&')):
            print(f'{f}:{n}: {line.strip()[:90]}'); bad += 1
sys.exit(1 if bad else 0)
