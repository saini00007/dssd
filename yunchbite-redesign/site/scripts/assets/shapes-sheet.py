import sys, glob, os
d = sys.argv[1]
cells = ''.join(f'<figure><img src="file://{f}"><figcaption>{os.path.basename(f)[:-4]}</figcaption></figure>' for f in sorted(glob.glob(d + '/*.svg')))
open(sys.argv[2], 'w').write(f'<style>body{{margin:0;background:#FFFDF5;font:12px sans-serif;display:grid;grid-template-columns:repeat(7,1fr)}}figure{{margin:0;padding:10px;text-align:center}}img{{width:170px;height:170px}}</style>{cells}')
