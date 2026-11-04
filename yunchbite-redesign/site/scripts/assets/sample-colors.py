import sys,json
from PIL import Image, ImageDraw
import numpy as np
D='/home/user/dssd/yunchbite-redesign/research/current-site/assets/images/'
C={
'peri-peri':('makhana-peri.jpg',(330,100,720,230)),
'cheese-herbs':('makhana-cheese.jpg',(320,130,730,250)),
'pudina':('makhana-pudina.jpg',(215,220,330,440)),
'salt-pepper':('makhana-salt.jpg',(520,200,640,640)),
'popcorn-salted':('popcorn-salted-hq.jpg',(290,215,490,270)),
'popcorn-butter':('popcorn-butter-hq.jpg',(160,215,500,320)),
'popcorn-pudina':('popcorn-pudina-hq.jpg',(200,300,260,560)),
'raw-almonds':('dryfruits-raw-almonds-hq.jpg',(235,200,320,600)),
'raw-cashews':('dryfruits-raw-cashews-hq.jpg',(160,250,270,780)),
'roasted-almonds':('dryfruits-roasted-almonds-hq.jpg',(265,230,330,600)),
'roasted-cashews':('dryfruits-roasted-cashews-hq.jpg',(160,640,195,770)),
}
out={};W=Image.new('RGB',(1650,300),'white')
for i,(k,(f,b)) in enumerate(C.items()):
    im=Image.open(D+f).convert('RGB');a=np.array(im.crop(b)).reshape(-1,3)
    L=a.sum(1);a=a[L>=np.percentile(L,50)];med=np.median(a,axis=0).astype(int);out[k]='#%02X%02X%02X'%tuple(med)
    t=im.copy().resize((150,150));d=ImageDraw.Draw(t);s=150/1024
    d.rectangle([b[0]*s,b[1]*s,b[2]*s,b[3]*s],outline=(255,0,255));
    W.paste(t,(i*150,0));d=ImageDraw.Draw(W);d.rectangle([i*150,150,i*150+150,300],fill=tuple(med))
    d.text((i*150+3,152),out[k],fill=(255,255,255))
W.save(sys.argv[1]+'/colors.png');print(json.dumps(out,indent=1))
