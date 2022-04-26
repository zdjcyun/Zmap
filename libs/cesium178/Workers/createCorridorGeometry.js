define(["./GeometryOffsetAttribute-d889f085","./arrayRemoveDuplicates-216006b0","./Transforms-e9dbfb40","./Cartesian2-49b1de22","./Check-6c0211bc","./ComponentDatatype-6d99a1ee","./PolylineVolumeGeometryLibrary-8f28f929","./CorridorGeometryLibrary-87f97344","./when-54c2dc71","./GeometryAttribute-669569db","./GeometryAttributes-4fcfcf40","./IndexDatatype-46306178","./Math-44e92d6b","./PolygonPipeline-72c97573","./VertexFormat-7572c785","./RuntimeError-2109023a","./WebGLConstants-76bb35d1","./EllipsoidTangentPlane-c4704d0f","./IntersectionTests-6ead8677","./Plane-8f7e53d1","./PolylinePipeline-eb80587e","./EllipsoidGeodesic-a2d57ae0","./EllipsoidRhumbLine-9b557f71"],function(E,y,m,rt,t,at,f,it,ot,nt,st,lt,dt,V,F,e,r,a,i,o,n,s,l){"use strict";var ut=new rt.Cartesian3,mt=new rt.Cartesian3,yt=new rt.Cartesian3,ft=new rt.Cartesian3,L=new rt.Cartesian3,pt=new rt.Cartesian3,ct=new rt.Cartesian3,ht=new rt.Cartesian3;function p(t,e){for(var r=0;r<t.length;r++)t[r]=e.scaleToGeodeticSurface(t[r],t[r]);return t}function gt(t,e,r,a,i,o){var n=t.normals,s=t.tangents,l=t.bitangents,t=rt.Cartesian3.normalize(rt.Cartesian3.cross(r,e,ct),ct);o.normal&&it.CorridorGeometryLibrary.addAttribute(n,e,a,i),o.tangent&&it.CorridorGeometryLibrary.addAttribute(s,t,a,i),o.bitangent&&it.CorridorGeometryLibrary.addAttribute(l,r,a,i)}function P(t,e,r){var a,i=t.positions,o=t.corners,n=t.endPositions,s=t.lefts,l=t.normals,d=new st.GeometryAttributes,u=0,m=0,y=0;for(N=0;N<i.length;N+=2)u+=a=i[N].length-3,y+=2*a,m+=i[N+1].length-3;for(u+=3,m+=3,N=0;N<o.length;N++){H=o[N];var f=o[N].leftPositions;ot.defined(f)?u+=a=f.length:m+=a=o[N].rightPositions.length,y+=a}var p,c=ot.defined(n);c&&(u+=p=n[0].length-3,m+=p,y+=6*(p/=3));var h,g,C,b,v,A,t=u+m,_=new Float64Array(t),w={normals:e.normal?new Float32Array(t):void 0,tangents:e.tangent?new Float32Array(t):void 0,bitangents:e.bitangent?new Float32Array(t):void 0},T=0,G=t-1,E=ut,V=mt,F=p/2,L=lt.IndexDatatype.createTypedArray(t/3,y),P=0;if(c){A=yt,v=ft;for(var x=n[0],E=rt.Cartesian3.fromArray(l,0,E),V=rt.Cartesian3.fromArray(s,0,V),N=0;N<F;N++)A=rt.Cartesian3.fromArray(x,3*(F-1-N),A),v=rt.Cartesian3.fromArray(x,3*(F+N),v),it.CorridorGeometryLibrary.addAttribute(_,v,T),it.CorridorGeometryLibrary.addAttribute(_,A,void 0,G),gt(w,E,V,T,G,e),b=(g=T/3)+1,C=(h=(G-2)/3)-1,L[P++]=h,L[P++]=g,L[P++]=C,L[P++]=C,L[P++]=g,L[P++]=b,T+=3,G-=3}var D,M,O=0,I=0,S=i[O++],R=i[O++];for(_.set(S,T),_.set(R,G-R.length+1),V=rt.Cartesian3.fromArray(s,I,V),a=R.length-3,N=0;N<a;N+=3)D=r.geodeticSurfaceNormal(rt.Cartesian3.fromArray(S,N,ct),ct),M=r.geodeticSurfaceNormal(rt.Cartesian3.fromArray(R,a-N,ht),ht),gt(w,E=rt.Cartesian3.normalize(rt.Cartesian3.add(D,M,E),E),V,T,G,e),b=(g=T/3)+1,C=(h=(G-2)/3)-1,L[P++]=h,L[P++]=g,L[P++]=C,L[P++]=C,L[P++]=g,L[P++]=b,T+=3,G-=3;for(D=r.geodeticSurfaceNormal(rt.Cartesian3.fromArray(S,a,ct),ct),M=r.geodeticSurfaceNormal(rt.Cartesian3.fromArray(R,a,ht),ht),E=rt.Cartesian3.normalize(rt.Cartesian3.add(D,M,E),E),I+=3,N=0;N<o.length;N++){var k,H,z,U,B=(H=o[N]).leftPositions,Y=H.rightPositions,W=pt,q=yt,J=ft;if(E=rt.Cartesian3.fromArray(l,I,E),ot.defined(B)){for(gt(w,E,V,void 0,G,e),G-=3,z=b,U=C,k=0;k<B.length/3;k++)W=rt.Cartesian3.fromArray(B,3*k,W),L[P++]=z,L[P++]=U-k-1,L[P++]=U-k,it.CorridorGeometryLibrary.addAttribute(_,W,void 0,G),q=rt.Cartesian3.fromArray(_,3*(U-k-1),q),J=rt.Cartesian3.fromArray(_,3*z,J),gt(w,E,V=rt.Cartesian3.normalize(rt.Cartesian3.subtract(q,J,V),V),void 0,G,e),G-=3;W=rt.Cartesian3.fromArray(_,3*z,W),q=rt.Cartesian3.subtract(rt.Cartesian3.fromArray(_,3*U,q),W,q),J=rt.Cartesian3.subtract(rt.Cartesian3.fromArray(_,3*(U-k),J),W,J),gt(w,E,V=rt.Cartesian3.normalize(rt.Cartesian3.add(q,J,V),V),T,void 0,e),T+=3}else{for(gt(w,E,V,T,void 0,e),T+=3,z=C,U=b,k=0;k<Y.length/3;k++)W=rt.Cartesian3.fromArray(Y,3*k,W),L[P++]=z,L[P++]=U+k,L[P++]=U+k+1,it.CorridorGeometryLibrary.addAttribute(_,W,T),q=rt.Cartesian3.fromArray(_,3*z,q),J=rt.Cartesian3.fromArray(_,3*(U+k),J),gt(w,E,V=rt.Cartesian3.normalize(rt.Cartesian3.subtract(q,J,V),V),T,void 0,e),T+=3;W=rt.Cartesian3.fromArray(_,3*z,W),q=rt.Cartesian3.subtract(rt.Cartesian3.fromArray(_,3*(U+k),q),W,q),J=rt.Cartesian3.subtract(rt.Cartesian3.fromArray(_,3*U,J),W,J),gt(w,E,V=rt.Cartesian3.normalize(rt.Cartesian3.negate(rt.Cartesian3.add(J,q,V),V),V),void 0,G,e),G-=3}for(S=i[O++],R=i[O++],S.splice(0,3),R.splice(R.length-3,3),_.set(S,T),_.set(R,G-R.length+1),a=R.length-3,I+=3,V=rt.Cartesian3.fromArray(s,I,V),k=0;k<R.length;k+=3)D=r.geodeticSurfaceNormal(rt.Cartesian3.fromArray(S,k,ct),ct),M=r.geodeticSurfaceNormal(rt.Cartesian3.fromArray(R,a-k,ht),ht),gt(w,E=rt.Cartesian3.normalize(rt.Cartesian3.add(D,M,E),E),V,T,G,e),g=(b=T/3)-1,h=(C=(G-2)/3)+1,L[P++]=h,L[P++]=g,L[P++]=C,L[P++]=C,L[P++]=g,L[P++]=b,T+=3,G-=3;T-=3,G+=3}if(gt(w,E=rt.Cartesian3.fromArray(l,l.length-3,E),V,T,G,e),c){T+=3,G-=3,A=yt,v=ft;var j=n[1];for(N=0;N<F;N++)A=rt.Cartesian3.fromArray(j,3*(p-N-1),A),v=rt.Cartesian3.fromArray(j,3*N,v),it.CorridorGeometryLibrary.addAttribute(_,A,void 0,G),it.CorridorGeometryLibrary.addAttribute(_,v,T),gt(w,E,V,T,G,e),g=(b=T/3)-1,h=(C=(G-2)/3)+1,L[P++]=h,L[P++]=g,L[P++]=C,L[P++]=C,L[P++]=g,L[P++]=b,T+=3,G-=3}if(d.position=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:_}),e.st){var K=new Float32Array(t/3*2),Q=0;if(c){u/=3,m/=3;var X,Z=Math.PI/(p+1),$=1/(u-p+1),tt=1/(m-p+1),et=p/2;for(N=1+et;N<p+1;N++)X=dt.CesiumMath.PI_OVER_TWO+Z*N,K[Q++]=tt*(1+Math.cos(X)),K[Q++]=.5*(1+Math.sin(X));for(N=1;N<m-p+1;N++)K[Q++]=N*tt,K[Q++]=0;for(N=p;et<N;N--)X=dt.CesiumMath.PI_OVER_TWO-N*Z,K[Q++]=1-tt*(1+Math.cos(X)),K[Q++]=.5*(1+Math.sin(X));for(N=et;0<N;N--)X=dt.CesiumMath.PI_OVER_TWO-Z*N,K[Q++]=1-$*(1+Math.cos(X)),K[Q++]=.5*(1+Math.sin(X));for(N=u-p;0<N;N--)K[Q++]=N*$,K[Q++]=1;for(N=1;N<1+et;N++)X=dt.CesiumMath.PI_OVER_TWO+Z*N,K[Q++]=$*(1+Math.cos(X)),K[Q++]=.5*(1+Math.sin(X))}else{for($=1/((u/=3)-1),tt=1/((m/=3)-1),N=0;N<m;N++)K[Q++]=N*tt,K[Q++]=0;for(N=u;0<N;N--)K[Q++]=(N-1)*$,K[Q++]=1}d.st=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:K})}return e.normal&&(d.normal=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:w.normals})),e.tangent&&(d.tangent=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:w.tangents})),e.bitangent&&(d.bitangent=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:w.bitangents})),{attributes:d,indices:L}}function x(t,e,r){r[e++]=t[0],r[e++]=t[1],r[e++]=t[2];for(var a=3;a<t.length;a+=3){var i=t[a],o=t[a+1],n=t[a+2];r[e++]=i,r[e++]=o,r[e++]=n,r[e++]=i,r[e++]=o,r[e++]=n}return r[e++]=t[0],r[e++]=t[1],r[e++]=t[2],r}function c(t,e){var r=new F.VertexFormat({position:e.position,normal:e.normal||e.bitangent||t.shadowVolume,tangent:e.tangent,bitangent:e.normal||e.bitangent,st:e.st}),a=t.ellipsoid,i=P(it.CorridorGeometryLibrary.computePositions(t),r,a),o=t.height,n=t.extrudedHeight,s=i.attributes,l=i.indices,d=s.position.values,u=d.length,m=new Float64Array(6*u),r=new Float64Array(u);r.set(d);i=new Float64Array(4*u),i=x(d=V.PolygonPipeline.scaleToGeodeticHeight(d,o,a),0,i);i=x(r=V.PolygonPipeline.scaleToGeodeticHeight(r,n,a),2*u,i),m.set(d),m.set(r,u),m.set(i,2*u),s.position.values=m,s=function(t,e){if(!(e.normal||e.tangent||e.bitangent||e.st))return t;var r,a=t.position.values;(e.normal||e.bitangent)&&(r=t.normal.values,l=t.bitangent.values);var i=t.position.values.length/18,o=3*i,n=2*i,s=2*o;if(e.normal||e.bitangent||e.tangent){for(var l,d=e.normal?new Float32Array(6*o):void 0,u=e.tangent?new Float32Array(6*o):void 0,m=e.bitangent?new Float32Array(6*o):void 0,y=ut,f=mt,p=yt,c=ft,h=L,g=pt,C=s,b=0;b<o;b+=3){var v=C+s,y=rt.Cartesian3.fromArray(a,b,y),f=rt.Cartesian3.fromArray(a,b+o,f),p=rt.Cartesian3.fromArray(a,(b+3)%o,p);f=rt.Cartesian3.subtract(f,y,f),p=rt.Cartesian3.subtract(p,y,p),c=rt.Cartesian3.normalize(rt.Cartesian3.cross(f,p,c),c),e.normal&&(it.CorridorGeometryLibrary.addAttribute(d,c,v),it.CorridorGeometryLibrary.addAttribute(d,c,v+3),it.CorridorGeometryLibrary.addAttribute(d,c,C),it.CorridorGeometryLibrary.addAttribute(d,c,C+3)),(e.tangent||e.bitangent)&&(g=rt.Cartesian3.fromArray(r,b,g),e.bitangent&&(it.CorridorGeometryLibrary.addAttribute(m,g,v),it.CorridorGeometryLibrary.addAttribute(m,g,v+3),it.CorridorGeometryLibrary.addAttribute(m,g,C),it.CorridorGeometryLibrary.addAttribute(m,g,C+3)),e.tangent&&(h=rt.Cartesian3.normalize(rt.Cartesian3.cross(g,c,h),h),it.CorridorGeometryLibrary.addAttribute(u,h,v),it.CorridorGeometryLibrary.addAttribute(u,h,v+3),it.CorridorGeometryLibrary.addAttribute(u,h,C),it.CorridorGeometryLibrary.addAttribute(u,h,C+3))),C+=6}if(e.normal){for(d.set(r),b=0;b<o;b+=3)d[b+o]=-r[b],d[b+o+1]=-r[b+1],d[b+o+2]=-r[b+2];t.normal.values=d}else t.normal=void 0;e.bitangent?(m.set(l),m.set(l,o),t.bitangent.values=m):t.bitangent=void 0,e.tangent&&(l=t.tangent.values,u.set(l),u.set(l,o),t.tangent.values=u)}if(e.st){var A=t.st.values,_=new Float32Array(6*n);_.set(A),_.set(A,n);for(var w=2*n,T=0;T<2;T++){for(_[w++]=A[0],_[w++]=A[1],b=2;b<n;b+=2){var G=A[b],E=A[b+1];_[w++]=G,_[w++]=E,_[w++]=G,_[w++]=E}_[w++]=A[0],_[w++]=A[1]}t.st.values=_}return t}(s,e);var y=u/3;if(t.shadowVolume){for(var f=s.normal.values,u=f.length,i=new Float32Array(6*u),p=0;p<u;p++)f[p]=-f[p];i.set(f,u),i=x(f,4*u,i),s.extrudeDirection=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:i}),e.normal||(s.normal=void 0)}ot.defined(t.offsetAttribute)&&(e=new Uint8Array(6*y),e=t.offsetAttribute===E.GeometryOffsetAttribute.TOP?(e=E.arrayFill(e,1,0,y),E.arrayFill(e,1,2*y,4*y)):(t=t.offsetAttribute===E.GeometryOffsetAttribute.NONE?0:1,E.arrayFill(e,t)),s.applyOffset=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:e}));var c=l.length,h=y+y,g=lt.IndexDatatype.createTypedArray(m.length/3,2*c+3*h);g.set(l);var C,b,v,A,_=c;for(p=0;p<c;p+=3){var w=l[p],T=l[p+1],G=l[p+2];g[_++]=G+y,g[_++]=T+y,g[_++]=w+y}for(p=0;p<h;p+=2)v=(C=p+h)+1,A=(b=C+h)+1,g[_++]=C,g[_++]=b,g[_++]=v,g[_++]=v,g[_++]=b,g[_++]=A;return{attributes:s,indices:g}}var h=new rt.Cartesian3,g=new rt.Cartesian3,C=new rt.Cartographic;function b(t,e,r,a,i,o){var n=rt.Cartesian3.subtract(e,t,h);rt.Cartesian3.normalize(n,n);var s=r.geodeticSurfaceNormal(t,g),l=rt.Cartesian3.cross(n,s,h);rt.Cartesian3.multiplyByScalar(l,a,l);var d=i.latitude,u=i.longitude,e=o.latitude,n=o.longitude;rt.Cartesian3.add(t,l,g),r.cartesianToCartographic(g,C);s=C.latitude,a=C.longitude,d=Math.min(d,s),u=Math.min(u,a),e=Math.max(e,s),n=Math.max(n,a);rt.Cartesian3.subtract(t,l,g),r.cartesianToCartographic(g,C),s=C.latitude,a=C.longitude,d=Math.min(d,s),u=Math.min(u,a),e=Math.max(e,s),n=Math.max(n,a),i.latitude=d,i.longitude=u,o.latitude=e,o.longitude=n}var v=new rt.Cartesian3,A=new rt.Cartesian3,_=new rt.Cartographic,w=new rt.Cartographic;function d(t,e,r,a,i){t=p(t,e);var o=y.arrayRemoveDuplicates(t,rt.Cartesian3.equalsEpsilon),n=o.length;if(n<2||r<=0)return new rt.Rectangle;var s,l,d=.5*r;_.latitude=Number.POSITIVE_INFINITY,_.longitude=Number.POSITIVE_INFINITY,w.latitude=Number.NEGATIVE_INFINITY,w.longitude=Number.NEGATIVE_INFINITY,a===f.CornerType.ROUNDED&&(m=o[0],rt.Cartesian3.subtract(m,o[1],v),rt.Cartesian3.normalize(v,v),rt.Cartesian3.multiplyByScalar(v,d,v),rt.Cartesian3.add(m,v,A),e.cartesianToCartographic(A,C),s=C.latitude,l=C.longitude,_.latitude=Math.min(_.latitude,s),_.longitude=Math.min(_.longitude,l),w.latitude=Math.max(w.latitude,s),w.longitude=Math.max(w.longitude,l));for(var u=0;u<n-1;++u)b(o[u],o[u+1],e,d,_,w);var m=o[n-1];rt.Cartesian3.subtract(m,o[n-2],v),rt.Cartesian3.normalize(v,v),rt.Cartesian3.multiplyByScalar(v,d,v),rt.Cartesian3.add(m,v,A),b(m,A,e,d,_,w),a===f.CornerType.ROUNDED&&(e.cartesianToCartographic(A,C),s=C.latitude,l=C.longitude,_.latitude=Math.min(_.latitude,s),_.longitude=Math.min(_.longitude,l),w.latitude=Math.max(w.latitude,s),w.longitude=Math.max(w.longitude,l));i=ot.defined(i)?i:new rt.Rectangle;return i.north=w.latitude,i.south=_.latitude,i.east=w.longitude,i.west=_.longitude,i}function T(t){var e=(t=ot.defaultValue(t,ot.defaultValue.EMPTY_OBJECT)).positions,r=t.width,a=ot.defaultValue(t.height,0),i=ot.defaultValue(t.extrudedHeight,a);this._positions=e,this._ellipsoid=rt.Ellipsoid.clone(ot.defaultValue(t.ellipsoid,rt.Ellipsoid.WGS84)),this._vertexFormat=F.VertexFormat.clone(ot.defaultValue(t.vertexFormat,F.VertexFormat.DEFAULT)),this._width=r,this._height=Math.max(a,i),this._extrudedHeight=Math.min(a,i),this._cornerType=ot.defaultValue(t.cornerType,f.CornerType.ROUNDED),this._granularity=ot.defaultValue(t.granularity,dt.CesiumMath.RADIANS_PER_DEGREE),this._shadowVolume=ot.defaultValue(t.shadowVolume,!1),this._workerName="createCorridorGeometry",this._offsetAttribute=t.offsetAttribute,this._rectangle=void 0,this.packedLength=1+e.length*rt.Cartesian3.packedLength+rt.Ellipsoid.packedLength+F.VertexFormat.packedLength+7}T.pack=function(t,e,r){r=ot.defaultValue(r,0);var a=t._positions,i=a.length;e[r++]=i;for(var o=0;o<i;++o,r+=rt.Cartesian3.packedLength)rt.Cartesian3.pack(a[o],e,r);return rt.Ellipsoid.pack(t._ellipsoid,e,r),r+=rt.Ellipsoid.packedLength,F.VertexFormat.pack(t._vertexFormat,e,r),r+=F.VertexFormat.packedLength,e[r++]=t._width,e[r++]=t._height,e[r++]=t._extrudedHeight,e[r++]=t._cornerType,e[r++]=t._granularity,e[r++]=t._shadowVolume?1:0,e[r]=ot.defaultValue(t._offsetAttribute,-1),e};var G=rt.Ellipsoid.clone(rt.Ellipsoid.UNIT_SPHERE),N=new F.VertexFormat,D={positions:void 0,ellipsoid:G,vertexFormat:N,width:void 0,height:void 0,extrudedHeight:void 0,cornerType:void 0,granularity:void 0,shadowVolume:void 0,offsetAttribute:void 0};return T.unpack=function(t,e,r){e=ot.defaultValue(e,0);for(var a=t[e++],i=new Array(a),o=0;o<a;++o,e+=rt.Cartesian3.packedLength)i[o]=rt.Cartesian3.unpack(t,e);var n=rt.Ellipsoid.unpack(t,e,G);e+=rt.Ellipsoid.packedLength;var s=F.VertexFormat.unpack(t,e,N);e+=F.VertexFormat.packedLength;var l=t[e++],d=t[e++],u=t[e++],m=t[e++],y=t[e++],f=1===t[e++],p=t[e];return ot.defined(r)?(r._positions=i,r._ellipsoid=rt.Ellipsoid.clone(n,r._ellipsoid),r._vertexFormat=F.VertexFormat.clone(s,r._vertexFormat),r._width=l,r._height=d,r._extrudedHeight=u,r._cornerType=m,r._granularity=y,r._shadowVolume=f,r._offsetAttribute=-1===p?void 0:p,r):(D.positions=i,D.width=l,D.height=d,D.extrudedHeight=u,D.cornerType=m,D.granularity=y,D.shadowVolume=f,D.offsetAttribute=-1===p?void 0:p,new T(D))},T.computeRectangle=function(t,e){var r=(t=ot.defaultValue(t,ot.defaultValue.EMPTY_OBJECT)).positions,a=t.width;return d(r,ot.defaultValue(t.ellipsoid,rt.Ellipsoid.WGS84),a,ot.defaultValue(t.cornerType,f.CornerType.ROUNDED),e)},T.createGeometry=function(t){var e=t._positions,r=t._width,a=t._ellipsoid,e=p(e,a),i=y.arrayRemoveDuplicates(e,rt.Cartesian3.equalsEpsilon);if(!(i.length<2||r<=0)){var o,n=t._height,s=t._extrudedHeight,l=!dt.CesiumMath.equalsEpsilon(n,s,0,dt.CesiumMath.EPSILON2),e=t._vertexFormat,r={ellipsoid:a,positions:i,width:r,cornerType:t._cornerType,granularity:t._granularity,saveAttributes:!0};l?(r.height=n,r.extrudedHeight=s,r.shadowVolume=t._shadowVolume,r.offsetAttribute=t._offsetAttribute,o=c(r,e)):((o=P(it.CorridorGeometryLibrary.computePositions(r),e,a)).attributes.position.values=V.PolygonPipeline.scaleToGeodeticHeight(o.attributes.position.values,n,a),ot.defined(t._offsetAttribute)&&(d=t._offsetAttribute===E.GeometryOffsetAttribute.NONE?0:1,u=o.attributes.position.values.length,u=new Uint8Array(u/3),E.arrayFill(u,d),o.attributes.applyOffset=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:u})));var d=o.attributes,u=m.BoundingSphere.fromVertices(d.position.values,void 0,3);return e.position||(o.attributes.position.values=void 0),new nt.Geometry({attributes:d,indices:o.indices,primitiveType:nt.PrimitiveType.TRIANGLES,boundingSphere:u,offsetAttribute:t._offsetAttribute})}},T.createShadowVolume=function(t,e,r){var a=t._granularity,i=t._ellipsoid,e=e(a,i),r=r(a,i);return new T({positions:t._positions,width:t._width,cornerType:t._cornerType,ellipsoid:i,granularity:a,extrudedHeight:e,height:r,vertexFormat:F.VertexFormat.POSITION_ONLY,shadowVolume:!0})},Object.defineProperties(T.prototype,{rectangle:{get:function(){return ot.defined(this._rectangle)||(this._rectangle=d(this._positions,this._ellipsoid,this._width,this._cornerType)),this._rectangle}},textureCoordinateRotationPoints:{get:function(){return[0,0,0,1,1,0]}}}),function(t,e){return(t=ot.defined(e)?T.unpack(t,e):t)._ellipsoid=rt.Ellipsoid.clone(t._ellipsoid),T.createGeometry(t)}});
