import BasePrimitive from "./BasePrimitive.js";

class ChangeablePrimitive /* extends BasePrimitive  */ {
    constructor(options) {
        options = options || {};
        // super(options);


        // 复制其它属性
        Object.assign(this, Cesium.clone(options, true));

        this.ellipsoid = Cesium.defaultValue(this.ellipsoid, Cesium.Ellipsoid.WGS84);
        this.appearance = Cesium.defaultValue(this.appearance, new Cesium.MaterialAppearance({
            material: Cesium.Material.fromType("Color")
        }));

        this.show = Cesium.defaultValue(this.show, true);
        this.material = Cesium.defaultValue(this.material, Cesium.Material.fromType("Color"));
        this._geometry = this.geometry;

        this._ellipsoid = undefined;
        this._granularity = undefined;
        this._height = undefined;
        this._textureRotationAngle = undefined;
        this._id = undefined;

        // set the flags to initiate a first drawing
        this._createPrimitive = true;
        this._primitive = undefined;
        this._outlinePolygon = undefined;

        //this.destroyFuns.push(destroy);
    }


    setAttribute(name, value) {
        this[name] = value;
        this._createPrimitive = true;
    }

    getAttribute(name) {
        return this[name];
    }

    getGeometry() {
        return this._geometry;
    }

    getOutlineGeometry() {

    }

    /**
     * @private
     */
    update(frameState) {

        let context = frameState.context;
        if (!Cesium.defined(this.ellipsoid)) {
            throw new Cesium.DeveloperError('this.ellipsoid must be defined.');
        }

        if (!Cesium.defined(this.appearance)) {
            throw new Cesium.DeveloperError('this.material must be defined.');
        }

        if (this.granularity < 0.0) {
            throw new Cesium.DeveloperError('this.granularity and scene2D/scene3D overrides must be greater than zero.');
        }

        if (!this.show) {
            return;
        }

        if (!this._createPrimitive && (!Cesium.defined(this._primitive))) {
            // No positions/hierarchy to draw
            return;
        }

        if (this._createPrimitive ||
            (this._ellipsoid !== this.ellipsoid) ||
            (this._granularity !== this.granularity) ||
            (this._height !== this.height) ||
            (this._textureRotationAngle !== this.textureRotationAngle) ||
            (this._id !== this.id)) {

            var geometry = this.getGeometry();
            if (!geometry) {
                return;
            }

            this._createPrimitive = false;
            this._ellipsoid = this.ellipsoid;
            this._granularity = this.granularity;
            this._height = this.height;
            this._textureRotationAngle = this.textureRotationAngle;
            this._id = this.id;

            this._primitive = this._primitive && this._primitive.destroy();

            this._primitive = new Cesium.GroundPrimitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: geometry,
                    id: this.id,
                    pickPrimitive: this,
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 1.0, 1.0))
                    }
                }),
                appearance: this.appearance,
                asynchronous: this.asynchronous
            });

            this._outlinePolygon = this._outlinePolygon && this._outlinePolygon.destroy();
            if (this.strokeColor && this.getOutlineGeometry) {
                // create the highlighting frame
                this._outlinePolygon = new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: this.getOutlineGeometry(),
                        attributes: {
                            color: Cesium.ColorGeometryInstanceAttribute.fromColor(this.strokeColor)
                        }
                    }),
                    appearance: new Cesium.PerInstanceColorAppearance({
                        flat: true,
                        renderState: {
                            depthTest: {
                                enabled: true
                            },
                            lineWidth: Math.min(this.strokeWidth || 4.0, context._aliasedLineWidthRange[1])
                        }
                    })
                });
            }
        }

        var primitive = this._primitive;
        primitive.appearance.material = this.material;
        primitive.debugShowBoundingVolume = this.debugShowBoundingVolume;
        primitive.update(frameState);

        this._outlinePolygon && this._outlinePolygon.update(frameState);

    }

    isDestroyed() {
        return false;
    }

    setStrokeStyle(strokeColor, strokeWidth) {
        if (!this.strokeColor || !this.strokeColor.equals(strokeColor) || this.strokeWidth != strokeWidth) {
            this._createPrimitive = true;
            this.strokeColor = strokeColor;
            this.strokeWidth = strokeWidth;
        }
    }

    destroy() {
        this._primitive = this._primitive && this._primitive.destroy();
        this._outlinePolygon = this._outlinePolygon && this._outlinePolygon.destroy();
        return Cesium.destroyObject(this);
    }
}




export default ChangeablePrimitive;