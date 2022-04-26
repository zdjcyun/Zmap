define(["./when-54c2dc71","./Cartesian2-49b1de22","./ArcType-dc1c5aee","./GeometryOffsetAttribute-d889f085","./Transforms-e9dbfb40","./Check-6c0211bc","./ComponentDatatype-6d99a1ee","./EllipsoidTangentPlane-c4704d0f","./GeometryAttribute-669569db","./GeometryAttributes-4fcfcf40","./GeometryInstance-6d66d24e","./GeometryPipeline-39e647e8","./IndexDatatype-46306178","./Math-44e92d6b","./PolygonGeometryLibrary-2ed36c92","./PolygonPipeline-72c97573","./RuntimeError-2109023a","./WebGLConstants-76bb35d1","./IntersectionTests-6ead8677","./Plane-8f7e53d1","./AttributeCompression-8ecc041c","./EncodedCartesian3-7ff81df8","./arrayRemoveDuplicates-216006b0","./EllipsoidRhumbLine-9b557f71"],function(m,d,E,b,P,e,A,_,v,G,L,T,H,C,O,D,t,i,r,o,n,a,l,s){"use strict";var x=[],I=[];function c(e){var t,i=e.polygonHierarchy,r=m.defaultValue(e.ellipsoid,d.Ellipsoid.WGS84),o=m.defaultValue(e.granularity,C.CesiumMath.RADIANS_PER_DEGREE),n=m.defaultValue(e.perPositionHeight,!1),a=n&&m.defined(e.extrudedHeight),l=m.defaultValue(e.arcType,E.ArcType.GEODESIC),s=m.defaultValue(e.height,0),y=m.defaultValue(e.extrudedHeight,s);a||(t=Math.max(s,y),y=Math.min(s,y),s=t),this._ellipsoid=d.Ellipsoid.clone(r),this._granularity=o,this._height=s,this._extrudedHeight=y,this._arcType=l,this._polygonHierarchy=i,this._perPositionHeight=n,this._perPositionHeightExtrude=a,this._offsetAttribute=e.offsetAttribute,this._workerName="createPolygonOutlineGeometry",this.packedLength=O.PolygonGeometryLibrary.computeHierarchyPackedLength(i)+d.Ellipsoid.packedLength+8}c.pack=function(e,t,i){return i=m.defaultValue(i,0),i=O.PolygonGeometryLibrary.packPolygonHierarchy(e._polygonHierarchy,t,i),d.Ellipsoid.pack(e._ellipsoid,t,i),i+=d.Ellipsoid.packedLength,t[i++]=e._height,t[i++]=e._extrudedHeight,t[i++]=e._granularity,t[i++]=e._perPositionHeightExtrude?1:0,t[i++]=e._perPositionHeight?1:0,t[i++]=e._arcType,t[i++]=m.defaultValue(e._offsetAttribute,-1),t[i]=e.packedLength,t};var g=d.Ellipsoid.clone(d.Ellipsoid.UNIT_SPHERE),f={polygonHierarchy:{}};return c.unpack=function(e,t,i){t=m.defaultValue(t,0);var r=O.PolygonGeometryLibrary.unpackPolygonHierarchy(e,t);t=r.startingIndex,delete r.startingIndex;var o=d.Ellipsoid.unpack(e,t,g);t+=d.Ellipsoid.packedLength;var n=e[t++],a=e[t++],l=e[t++],s=1===e[t++],y=1===e[t++],u=e[t++],p=e[t++],t=e[t];return(i=!m.defined(i)?new c(f):i)._polygonHierarchy=r,i._ellipsoid=d.Ellipsoid.clone(o,i._ellipsoid),i._height=n,i._extrudedHeight=a,i._granularity=l,i._perPositionHeight=y,i._perPositionHeightExtrude=s,i._arcType=u,i._offsetAttribute=-1===p?void 0:p,i.packedLength=t,i},c.fromPositions=function(e){return new c({polygonHierarchy:{positions:(e=m.defaultValue(e,m.defaultValue.EMPTY_OBJECT)).positions},height:e.height,extrudedHeight:e.extrudedHeight,ellipsoid:e.ellipsoid,granularity:e.granularity,perPositionHeight:e.perPositionHeight,arcType:e.arcType,offsetAttribute:e.offsetAttribute})},c.createGeometry=function(e){var t=e._ellipsoid,i=e._granularity,r=e._polygonHierarchy,o=e._perPositionHeight,n=e._arcType,a=O.PolygonGeometryLibrary.polygonOutlinesFromHierarchy(r,!o,t);if(0!==a.length){var l,s,y,u,p,d,c=[],g=C.CesiumMath.chordLength(i,t.maximumRadius),f=e._height,h=e._extrudedHeight;if(e._perPositionHeightExtrude||!C.CesiumMath.equalsEpsilon(f,h,0,C.CesiumMath.EPSILON2))for(l=0;l<a.length;l++)(u=function(e,t,i,r,o){var n,a=_.EllipsoidTangentPlane.fromPoints(t,e).projectPointsOntoPlane(t,x);D.PolygonPipeline.computeWindingOrder2D(a)===D.WindingOrder.CLOCKWISE&&(a.reverse(),t=t.slice().reverse());var l=t.length,s=new Array(l),y=0;if(r)for(n=new Float64Array(2*l*3*2),b=0;b<l;++b){s[b]=y/3;var u=t[b],p=t[(b+1)%l];n[y++]=u.x,n[y++]=u.y,n[y++]=u.z,n[y++]=p.x,n[y++]=p.y,n[y++]=p.z}else{var d,c=0;if(o===E.ArcType.GEODESIC)for(b=0;b<l;b++)c+=O.PolygonGeometryLibrary.subdivideLineCount(t[b],t[(b+1)%l],i);else if(o===E.ArcType.RHUMB)for(b=0;b<l;b++)c+=O.PolygonGeometryLibrary.subdivideRhumbLineCount(e,t[b],t[(b+1)%l],i);for(n=new Float64Array(3*c*2),b=0;b<l;++b){s[b]=y/3,o===E.ArcType.GEODESIC?d=O.PolygonGeometryLibrary.subdivideLine(t[b],t[(b+1)%l],i,I):o===E.ArcType.RHUMB&&(d=O.PolygonGeometryLibrary.subdivideRhumbLine(e,t[b],t[(b+1)%l],i,I));for(var g=d.length,f=0;f<g;++f)n[y++]=d[f]}}l=n.length/6;for(var h=s.length,r=2*(2*l+h),m=H.IndexDatatype.createTypedArray(l+h,r),y=0,b=0;b<l;++b)m[y++]=b,m[y++]=(b+1)%l,m[y++]=b+l,m[y++]=(b+1)%l+l;for(b=0;b<h;b++){var P=s[b];m[y++]=P,m[y++]=P+l}return new L.GeometryInstance({geometry:new v.Geometry({attributes:new G.GeometryAttributes({position:new v.GeometryAttribute({componentDatatype:A.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:n})}),indices:m,primitiveType:v.PrimitiveType.LINES})})}(t,a[l],g,o,n)).geometry=O.PolygonGeometryLibrary.scaleToGeodeticHeightExtruded(u.geometry,f,h,t,o),m.defined(e._offsetAttribute)&&(s=u.geometry.attributes.position.values.length/3,y=new Uint8Array(s),y=e._offsetAttribute===b.GeometryOffsetAttribute.TOP?b.arrayFill(y,1,0,s/2):(d=e._offsetAttribute===b.GeometryOffsetAttribute.NONE?0:1,b.arrayFill(y,d)),u.geometry.attributes.applyOffset=new v.GeometryAttribute({componentDatatype:A.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:y})),c.push(u);else for(l=0;l<a.length;l++)(u=function(e,t,i,r,o){var n,a=_.EllipsoidTangentPlane.fromPoints(t,e).projectPointsOntoPlane(t,x);D.PolygonPipeline.computeWindingOrder2D(a)===D.WindingOrder.CLOCKWISE&&(a.reverse(),t=t.slice().reverse());var l=t.length,s=0;if(r)for(n=new Float64Array(2*l*3),h=0;h<l;h++){var y=t[h],u=t[(h+1)%l];n[s++]=y.x,n[s++]=y.y,n[s++]=y.z,n[s++]=u.x,n[s++]=u.y,n[s++]=u.z}else{var p,d=0;if(o===E.ArcType.GEODESIC)for(h=0;h<l;h++)d+=O.PolygonGeometryLibrary.subdivideLineCount(t[h],t[(h+1)%l],i);else if(o===E.ArcType.RHUMB)for(h=0;h<l;h++)d+=O.PolygonGeometryLibrary.subdivideRhumbLineCount(e,t[h],t[(h+1)%l],i);for(n=new Float64Array(3*d),h=0;h<l;h++){o===E.ArcType.GEODESIC?p=O.PolygonGeometryLibrary.subdivideLine(t[h],t[(h+1)%l],i,I):o===E.ArcType.RHUMB&&(p=O.PolygonGeometryLibrary.subdivideRhumbLine(e,t[h],t[(h+1)%l],i,I));for(var c=p.length,g=0;g<c;++g)n[s++]=p[g]}}for(var r=2*(l=n.length/3),f=H.IndexDatatype.createTypedArray(l,r),s=0,h=0;h<l-1;h++)f[s++]=h,f[s++]=h+1;return f[s++]=l-1,f[s++]=0,new L.GeometryInstance({geometry:new v.Geometry({attributes:new G.GeometryAttributes({position:new v.GeometryAttribute({componentDatatype:A.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:n})}),indices:f,primitiveType:v.PrimitiveType.LINES})})}(t,a[l],g,o,n)).geometry.attributes.position.values=D.PolygonPipeline.scaleToGeodeticHeight(u.geometry.attributes.position.values,f,t,!o),m.defined(e._offsetAttribute)&&(p=u.geometry.attributes.position.values.length,p=new Uint8Array(p/3),d=e._offsetAttribute===b.GeometryOffsetAttribute.NONE?0:1,b.arrayFill(p,d),u.geometry.attributes.applyOffset=new v.GeometryAttribute({componentDatatype:A.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:p})),c.push(u);r=T.GeometryPipeline.combineInstances(c)[0],i=P.BoundingSphere.fromVertices(r.attributes.position.values);return new v.Geometry({attributes:r.attributes,indices:r.indices,primitiveType:r.primitiveType,boundingSphere:i,offsetAttribute:e._offsetAttribute})}},function(e,t){return(e=m.defined(t)?c.unpack(e,t):e)._ellipsoid=d.Ellipsoid.clone(e._ellipsoid),c.createGeometry(e)}});
