define(["./AttributeCompression-8ecc041c","./EllipsoidTangentPlane-c4704d0f","./Transforms-e9dbfb40","./Cartesian2-49b1de22","./when-54c2dc71","./TerrainEncoding-2b05357a","./IndexDatatype-46306178","./Math-44e92d6b","./OrientedBoundingBox-3669ebd4","./Check-6c0211bc","./WebMercatorProjection-8d5f5f84","./createTaskProcessorWorker","./IntersectionTests-6ead8677","./Plane-8f7e53d1","./RuntimeError-2109023a","./ComponentDatatype-6d99a1ee","./WebGLConstants-76bb35d1"],function(ie,oe,ae,se,de,ce,ue,he,le,e,Ie,t,r,n,i,o,a){"use strict";function me(){e.DeveloperError.throwInstantiationError()}Object.defineProperties(me.prototype,{errorEvent:{get:e.DeveloperError.throwInstantiationError},credit:{get:e.DeveloperError.throwInstantiationError},tilingScheme:{get:e.DeveloperError.throwInstantiationError},ready:{get:e.DeveloperError.throwInstantiationError},readyPromise:{get:e.DeveloperError.throwInstantiationError},hasWaterMask:{get:e.DeveloperError.throwInstantiationError},hasVertexNormals:{get:e.DeveloperError.throwInstantiationError},availability:{get:e.DeveloperError.throwInstantiationError}});var s=[];me.getRegularGridIndices=function(e,t){var r=s[e];de.defined(r)||(s[e]=r=[]);var n=r[t];return de.defined(n)||m(e,t,n=e*t<he.CesiumMath.SIXTY_FOUR_KILOBYTES?r[t]=new Uint16Array((e-1)*(t-1)*6):r[t]=new Uint32Array((e-1)*(t-1)*6),0),n};var d=[];me.getRegularGridIndicesAndEdgeIndices=function(e,t){var r=d[e];de.defined(r)||(d[e]=r=[]);var n,i,o,a,s=r[t];return de.defined(s)||(n=me.getRegularGridIndices(e,t),i=(a=I(e,t)).westIndicesSouthToNorth,o=a.southIndicesEastToWest,e=a.eastIndicesNorthToSouth,a=a.northIndicesWestToEast,s=r[t]={indices:n,westIndicesSouthToNorth:i,southIndicesEastToWest:o,eastIndicesNorthToSouth:e,northIndicesWestToEast:a}),s};var l=[];function I(e,t){for(var r=new Array(t),n=new Array(e),i=new Array(t),o=new Array(e),a=0;a<e;++a)n[o[a]=a]=e*t-1-a;for(a=0;a<t;++a)i[a]=(a+1)*e-1,r[a]=(t-a-1)*e;return{westIndicesSouthToNorth:r,southIndicesEastToWest:n,eastIndicesNorthToSouth:i,northIndicesWestToEast:o}}function m(e,t,r,n){for(var i=0,o=0;o<t-1;++o){for(var a=0;a<e-1;++a){var s=i+e,d=s+1,c=i+1;r[n++]=i,r[n++]=s,r[n++]=c,r[n++]=c,r[n++]=s,r[n++]=d,++i}++i}}function c(e,t,r,n){for(var i=e[0],o=e.length,a=1;a<o;++a){var s=e[a];r[n++]=i,r[n++]=s,r[n++]=t,r[n++]=t,r[n++]=s,r[n++]=t+1,i=s,++t}return n}me.getRegularGridAndSkirtIndicesAndEdgeIndices=function(e,t){var r=l[e];de.defined(r)||(l[e]=r=[]);var n,i,o,a,s,d,c,u,h=r[t];return de.defined(h)||(o=(n=e*t)+(d=2*e+2*t),u=(i=(e-1)*(t-1)*6)+6*Math.max(0,d-4),a=(c=I(e,t)).westIndicesSouthToNorth,s=c.southIndicesEastToWest,d=c.eastIndicesNorthToSouth,c=c.northIndicesWestToEast,m(e,t,u=ue.IndexDatatype.createTypedArray(o,u),0),me.addSkirtIndices(a,s,d,c,n,u,i),h=r[t]={indices:u,westIndicesSouthToNorth:a,southIndicesEastToWest:s,eastIndicesNorthToSouth:d,northIndicesWestToEast:c,indexCountWithoutSkirts:i}),h},me.addSkirtIndices=function(e,t,r,n,i,o,a){a=c(e,i,o,a),a=c(t,i+=e.length,o,a),a=c(r,i+=t.length,o,a),c(n,i+=r.length,o,a)},me.heightmapTerrainQuality=.25,me.getEstimatedLevelZeroGeometricErrorForAHeightmap=function(e,t,r){return 2*e.maximumRadius*Math.PI*me.heightmapTerrainQuality/(t*r)},me.prototype.requestTileGeometry=e.DeveloperError.throwInstantiationError,me.prototype.getLevelMaximumGeometricError=e.DeveloperError.throwInstantiationError,me.prototype.getTileDataAvailable=e.DeveloperError.throwInstantiationError,me.prototype.loadTileDataAvailability=e.DeveloperError.throwInstantiationError;var ge=32767,Te=new se.Cartesian3,pe=new se.Cartesian3,Ee=new se.Cartesian3,ye=new se.Cartographic,fe=new se.Cartesian2,ve=new se.Cartesian3,Ne=new ae.Matrix4,we=new ae.Matrix4;function xe(e,t,r,n,i,o,a,s,d){var c=Number.POSITIVE_INFINITY,u=i.north,h=i.south,l=i.east,I=i.west;l<I&&(l+=he.CesiumMath.TWO_PI);for(var m=e.length,g=0;g<m;++g){var T=e[g],p=r[T],T=n[T];ye.longitude=he.CesiumMath.lerp(I,l,T.x),ye.latitude=he.CesiumMath.lerp(h,u,T.y),ye.height=p-t;p=o.cartographicToCartesian(ye,Te);ae.Matrix4.multiplyByPoint(a,p,p),se.Cartesian3.minimumByComponent(p,s,s),se.Cartesian3.maximumByComponent(p,d,d),c=Math.min(c,ye.height)}return c}function Me(e,t,r,n,i,o,a,s,d,c,u,h,l,I,m){var g=de.defined(a),T=d.north,p=d.south,E=d.east,y=d.west;E<y&&(E+=he.CesiumMath.TWO_PI);for(var f=r.length,v=0;v<f;++v){var N=r[v],w=i[N],x=o[N];ye.longitude=he.CesiumMath.lerp(y,E,x.x)+I,ye.latitude=he.CesiumMath.lerp(p,T,x.y)+m,ye.height=w-c;var M,b,C=s.cartographicToCartesian(ye,Te);g&&(M=2*N,fe.x=a[M],fe.y=a[1+M],1!==u&&(w=ie.AttributeCompression.octDecode(fe.x,fe.y,ve),N=ae.Transforms.eastNorthUpToFixedFrame(Te,s,we),M=ae.Matrix4.inverseTransformation(N,Ne),ae.Matrix4.multiplyByPointAsVector(M,w,w),w.z*=u,se.Cartesian3.normalize(w,w),ae.Matrix4.multiplyByPointAsVector(N,w,w),se.Cartesian3.normalize(w,w),ie.AttributeCompression.octEncode(w,fe))),n.hasWebMercatorT&&(b=(Ie.WebMercatorProjection.geodeticLatitudeToMercatorAngle(ye.latitude)-h)*l),t=n.encode(e,t,C,x,ye.height,fe,b)}}function be(e,t){var r;return"function"==typeof e.slice&&"function"!=typeof(r=e.slice()).sort&&(r=void 0),(r=!de.defined(r)?Array.prototype.slice.call(e):r).sort(t),r}return t(function(e,t){var r,n,i=(ne=e.quantizedVertices).length/3,o=e.octEncodedNormals,a=e.westIndices.length+e.eastIndices.length+e.southIndices.length+e.northIndices.length,s=e.includeWebMercatorT,d=se.Rectangle.clone(e.rectangle),c=d.west,u=d.south,h=d.east,l=d.north,I=se.Ellipsoid.clone(e.ellipsoid),m=e.exaggeration,g=e.minimumHeight*m,T=e.maximumHeight*m,p=e.relativeToCenter,E=ae.Transforms.eastNorthUpToFixedFrame(p,I),y=ae.Matrix4.inverseTransformation(E,new ae.Matrix4);s&&(r=Ie.WebMercatorProjection.geodeticLatitudeToMercatorAngle(u),n=1/(Ie.WebMercatorProjection.geodeticLatitudeToMercatorAngle(l)-r));var f=ne.subarray(0,i),v=ne.subarray(i,2*i),N=ne.subarray(2*i,3*i),w=de.defined(o),x=new Array(i),M=new Array(i),b=new Array(i),C=s?new Array(i):[],S=pe;S.x=Number.POSITIVE_INFINITY,S.y=Number.POSITIVE_INFINITY,S.z=Number.POSITIVE_INFINITY;var A=Ee;A.x=Number.NEGATIVE_INFINITY,A.y=Number.NEGATIVE_INFINITY,A.z=Number.NEGATIVE_INFINITY;for(var P=Number.POSITIVE_INFINITY,W=Number.NEGATIVE_INFINITY,D=Number.POSITIVE_INFINITY,B=Number.NEGATIVE_INFINITY,F=0;F<i;++F){var k=f[F],V=v[F],_=k/ge,H=V/ge,k=he.CesiumMath.lerp(g,T,N[F]/ge);ye.longitude=he.CesiumMath.lerp(c,h,_),ye.latitude=he.CesiumMath.lerp(u,l,H),ye.height=k,P=Math.min(ye.longitude,P),W=Math.max(ye.longitude,W),D=Math.min(ye.latitude,D),B=Math.max(ye.latitude,B);V=I.cartographicToCartesian(ye);x[F]=new se.Cartesian2(_,H),M[F]=k,b[F]=V,s&&(C[F]=(Ie.WebMercatorProjection.geodeticLatitudeToMercatorAngle(ye.latitude)-r)*n),ae.Matrix4.multiplyByPoint(y,V,Te),se.Cartesian3.minimumByComponent(Te,S,S),se.Cartesian3.maximumByComponent(Te,A,A)}var O,G,Y,z=be(e.westIndices,function(e,t){return x[e].y-x[t].y}),R=be(e.eastIndices,function(e,t){return x[t].y-x[e].y}),L=be(e.southIndices,function(e,t){return x[t].x-x[e].x}),U=be(e.northIndices,function(e,t){return x[e].x-x[t].x});1!==m&&(G=ae.BoundingSphere.fromPoints(b),O=le.OrientedBoundingBox.fromRectangle(d,g,T,I)),(1!==m||g<0)&&(Y=new ce.EllipsoidalOccluder(I).computeHorizonCullingPointPossiblyUnderEllipsoid(p,b,g));var j=g,j=Math.min(j,xe(e.westIndices,e.westSkirtHeight,M,x,d,I,y,S,A));j=Math.min(j,xe(e.southIndices,e.southSkirtHeight,M,x,d,I,y,S,A)),j=Math.min(j,xe(e.eastIndices,e.eastSkirtHeight,M,x,d,I,y,S,A)),j=Math.min(j,xe(e.northIndices,e.northSkirtHeight,M,x,d,I,y,S,A));for(var q,Q,K,X=new oe.AxisAlignedBoundingBox(S,A,p),Z=new ce.TerrainEncoding(X,j,T,E,w,s),J=Z.getStride(),$=new Float32Array(i*J+a*J),ee=0,te=0;te<i;++te)w&&(K=2*te,fe.x=o[K],fe.y=o[1+K],1!==m&&(q=ie.AttributeCompression.octDecode(fe.x,fe.y,ve),Q=ae.Transforms.eastNorthUpToFixedFrame(b[te],I,we),K=ae.Matrix4.inverseTransformation(Q,Ne),ae.Matrix4.multiplyByPointAsVector(K,q,q),q.z*=m,se.Cartesian3.normalize(q,q),ae.Matrix4.multiplyByPointAsVector(Q,q,q),se.Cartesian3.normalize(q,q),ie.AttributeCompression.octEncode(q,fe))),ee=Z.encode($,ee,b[te],x[te],M[te],fe,C[te]);var re=Math.max(0,2*(a-4)),ne=e.indices.length+3*re;return(X=ue.IndexDatatype.createTypedArray(i+a,ne)).set(e.indices,0),re=-(j=1e-4*(W-P)),a=j,j=-(ne=E=1e-4*(B-D)),Me($,E=i*J,z,Z,M,x,o,I,d,e.westSkirtHeight,m,r,n,re,0),Me($,E+=e.westIndices.length*J,L,Z,M,x,o,I,d,e.southSkirtHeight,m,r,n,0,j),Me($,E+=e.southIndices.length*J,R,Z,M,x,o,I,d,e.eastSkirtHeight,m,r,n,a,0),Me($,E+=e.eastIndices.length*J,U,Z,M,x,o,I,d,e.northSkirtHeight,m,r,n,0,ne),me.addSkirtIndices(z,L,R,U,i,X,e.indices.length),t.push($.buffer,X.buffer),{vertices:$.buffer,indices:X.buffer,westIndicesSouthToNorth:z,southIndicesEastToWest:L,eastIndicesNorthToSouth:R,northIndicesWestToEast:U,vertexStride:J,center:p,minimumHeight:g,maximumHeight:T,boundingSphere:G,orientedBoundingBox:O,occludeePointInScaledSpace:Y,encoding:Z,indexCountWithoutSkirts:e.indices.length}})});
