define(["exports","./Math-44e92d6b"],function(r,b){"use strict";var t={computePositions:function(r,t,e,a,i){for(var n=.5*r,o=-n,r=a+a,s=new Float64Array(3*(i?2*r:r)),u=0,c=0,f=i?3*r:0,h=i?3*(r+a):3*a,y=0;y<a;y++){var M=y/a*b.CesiumMath.TWO_PI,d=Math.cos(M),m=Math.sin(M),v=d*e,M=m*e,d=d*t,m=m*t;s[c+f]=v,s[c+f+1]=M,s[c+f+2]=o,s[c+h]=d,s[c+h+1]=m,s[c+h+2]=n,c+=3,i&&(s[u++]=v,s[u++]=M,s[u++]=o,s[u++]=d,s[u++]=m,s[u++]=n)}return s}};r.CylinderGeometryLibrary=t});
