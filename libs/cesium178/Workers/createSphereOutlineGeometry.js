define(["./when-54c2dc71","./Cartesian2-49b1de22","./Check-6c0211bc","./EllipsoidOutlineGeometry-0ede016d","./Math-44e92d6b","./GeometryOffsetAttribute-d889f085","./Transforms-e9dbfb40","./RuntimeError-2109023a","./ComponentDatatype-6d99a1ee","./WebGLConstants-76bb35d1","./GeometryAttribute-669569db","./GeometryAttributes-4fcfcf40","./IndexDatatype-46306178"],function(r,n,e,s,i,t,o,a,d,l,u,c,m){"use strict";function p(e){var i=r.defaultValue(e.radius,1),e={radii:new n.Cartesian3(i,i,i),stackPartitions:e.stackPartitions,slicePartitions:e.slicePartitions,subdivisions:e.subdivisions};this._ellipsoidGeometry=new s.EllipsoidOutlineGeometry(e),this._workerName="createSphereOutlineGeometry"}p.packedLength=s.EllipsoidOutlineGeometry.packedLength,p.pack=function(e,i,t){return s.EllipsoidOutlineGeometry.pack(e._ellipsoidGeometry,i,t)};var y=new s.EllipsoidOutlineGeometry,G={radius:void 0,radii:new n.Cartesian3,stackPartitions:void 0,slicePartitions:void 0,subdivisions:void 0};return p.unpack=function(e,i,t){i=s.EllipsoidOutlineGeometry.unpack(e,i,y);return G.stackPartitions=i._stackPartitions,G.slicePartitions=i._slicePartitions,G.subdivisions=i._subdivisions,r.defined(t)?(n.Cartesian3.clone(i._radii,G.radii),t._ellipsoidGeometry=new s.EllipsoidOutlineGeometry(G),t):(G.radius=i._radii.x,new p(G))},p.createGeometry=function(e){return s.EllipsoidOutlineGeometry.createGeometry(e._ellipsoidGeometry)},function(e,i){return r.defined(i)&&(e=p.unpack(e,i)),p.createGeometry(e)}});
