/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL ES Utilities
 * ------------------------------------------------
 *
 * Copyright 2014 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

'use strict';
goog.provide('modules.shared.glsDrawTests');
goog.require('framework.common.tcuTestCase');
goog.require('framework.common.tcuRGBA');
goog.require('framework.common.tcuFloat');
goog.require('framework.common.tcuPixelFormat');
goog.require('framework.common.tcuSurface');
goog.require('framework.common.tcuImageCompare');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.opengl.gluStrUtil');
goog.require('framework.opengl.simplereference.sglrGLContext');
goog.require('framework.opengl.simplereference.sglrReferenceContext');
goog.require('framework.opengl.simplereference.sglrShaderProgram');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.delibs.debase.deRandom');
goog.require('framework.referencerenderer.rrFragmentOperations');
goog.require('framework.referencerenderer.rrGenericVector');
goog.require('framework.referencerenderer.rrShadingContext');
goog.require('framework.referencerenderer.rrVertexAttrib');
goog.require('framework.referencerenderer.rrVertexPacket');

goog.scope(function() {

    var glsDrawTests = modules.shared.glsDrawTests;
    var tcuTestCase = framework.common.tcuTestCase;
    var tcuRGBA = framework.common.tcuRGBA;
    var tcuFloat = framework.common.tcuFloat;
    var tcuPixelFormat = framework.common.tcuPixelFormat;
    var tcuSurface = framework.common.tcuSurface;
    var tcuImageCompare = framework.common.tcuImageCompare;
    var gluShaderUtil = framework.opengl.gluShaderUtil;
    var gluStrUtil = framework.opengl.gluStrUtil;
    var sglrGLContext = framework.opengl.simplereference.sglrGLContext;
    var sglrReferenceContext = framework.opengl.simplereference.sglrReferenceContext;
    var sglrShaderProgram = framework.opengl.simplereference.sglrShaderProgram;
    var deMath = framework.delibs.debase.deMath;
    var deRandom = framework.delibs.debase.deRandom;
    var rrFragmentOperations = framework.referencerenderer.rrFragmentOperations;
    var rrGenericVector = framework.referencerenderer.rrGenericVector;
    var rrShadingContext = framework.referencerenderer.rrShadingContext;
    var rrVertexAttrib = framework.referencerenderer.rrVertexAttrib;
    var rrVertexPacket = framework.referencerenderer.rrVertexPacket;

    //MethodInfo

    /**
     * @typedef {{indexed: boolean, instanced: boolean, ranged: boolean, first: boolean}}
     */
    glsDrawTests.MethodInfo = {
        /** @type {boolean} */ indexed: false,
        /** @type {boolean} */ instanced: false,
        /** @type {boolean} */ ranged: false,
        /** @type {boolean} */ first: false
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.DrawMethod} method
     * @return {glsDrawTests.MethodInfo}
     */
    glsDrawTests.getMethodInfo = function (method) {
        /** @type {Array<glsDrawTests.MethodInfo>} */ var infos = [
            //indexed        instanced         ranged        first
            {indexed: false, instanced: false, ranged:false, first:true}, //!< DRAWMETHOD_DRAWARRAYS,
            {indexed: false, instanced: true, ranged:false, first:true}, //!< DRAWMETHOD_DRAWARRAYS_INSTANCED,
            {indexed: true, instanced: false, ranged:false, first:false}, //!< DRAWMETHOD_DRAWELEMENTS,
            {indexed: true, instanced: false, ranged:true, first:false}, //!< DRAWMETHOD_DRAWELEMENTS_RANGED,
            {indexed: true, instanced: true, ranged:false, first:false} //!< DRAWMETHOD_DRAWELEMENTS_INSTANCED
        ];

        assertMsgOptions(infos.length == Object.keys(glsDrawTests.DrawTestSpec.DrawMethod).length,
            'Number of info names', false, true);
        assertMsgOptions(method < infos.length, 'Invalid method', false, true);
        return /** @type {glsDrawTests.MethodInfo} */ (infos[method]);
    };

    //GLValue

    /**
     * glsDrawTests.GLValue class
     * @constructor
     */
    glsDrawTests.GLValue = function() {
        /** @type {goog.NumberArray} */ this.m_value = [0];
        /** @type {glsDrawTests.DrawTestSpec.InputType} */ this.m_type;
    };

    /**
     * @param {Uint8Array} dst
     * @param {glsDrawTests.GLValue} val
     */
    glsDrawTests.copyGLValueToArray = function(dst, val) {
        /** @type {Uint8Array} */ var val8 = new Uint8Array(val.m_value.buffer); // TODO: Fix encapsulation issue
        dst.set(val8);
    };

    /**
     * @param {Uint8Array} dst
     * @param {goog.NumberArray} src
     */
    glsDrawTests.copyArray = function(dst, src) {
        /** @type {Uint8Array} */ var src8 = new Uint8Array(src.buffer).subarray(src.byteOffset, src.byteOffset + src.byteLength); // TODO: Fix encapsulation issue
        dst.set(src8);
    };

    /**
     * typeToTypedArray function. Determines which type of array will store the value, and stores it.
     * @param {number} value
     * @param {glsDrawTests.DrawTestSpec.InputType} type
     */
    glsDrawTests.GLValue.typeToTypedArray = function(value, type) {
        var array;

        switch (type) {
            case glsDrawTests.DrawTestSpec.InputType.FLOAT:
                array = new Float32Array(1);
                break;
            /*case glsDrawTests.DrawTestSpec.InputType.FIXED:
                array = new Int32Array(1);
                break;
            case glsDrawTests.DrawTestSpec.InputType.DOUBLE:
                array = new Float32Array(1); // 64-bit?
                break;*/

            case glsDrawTests.DrawTestSpec.InputType.BYTE:
                array = new Int8Array(1);
                break;
            case glsDrawTests.DrawTestSpec.InputType.SHORT:
                array = new Int16Array(1);
                break;

            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_BYTE:
                array = new Uint8Array(1);
                break;
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_SHORT:
                array = new Uint16Array(1);
                break;

            case glsDrawTests.DrawTestSpec.InputType.INT:
                array = new Int32Array(1);
                break;
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT:
                array = new Uint32Array(1);
                break;
            case glsDrawTests.DrawTestSpec.InputType.HALF:
                array = new Uint16Array(1);
                value = glsDrawTests.GLValue.floatToHalf(value);
                break;
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT_2_10_10_10:
                array = new Uint32Array(1);
                break;
            case glsDrawTests.DrawTestSpec.InputType.INT_2_10_10_10:
                array = new Int32Array(1);
                break;
            default:
                throw new Error('glsDrawTests.GLValue.typeToTypedArray - Invalid InputType');
        }

        array[0] = value;
        return array;
    };

    /**
     * glsDrawTests.GLValue.create
     * @param {number} value
     * @param {glsDrawTests.DrawTestSpec.InputType} type
     */
    glsDrawTests.GLValue.create = function(value, type) {
        var v = new glsDrawTests.GLValue();
        v.m_value = glsDrawTests.GLValue.typeToTypedArray(value, type);
        v.m_type = type;
        return v;
    };

    /**
     * glsDrawTests.GLValue.halfToFloat
     * @param {number} value
     * @return {number}
     */
    glsDrawTests.GLValue.halfToFloat = function(value) {
        return tcuFloat.halfFloatToNumberNoDenorm(value);
    };

    /**
     * @param {number} f
     * @return {number}
     */
    glsDrawTests.GLValue.floatToHalf = function(f) {
        // No denorm support.
        return tcuFloat.numberToHalfFloatNoDenorm(f);
    }

    /**
     * glsDrawTests.GLValue.getMaxValue
     * @param {glsDrawTests.DrawTestSpec.InputType} type
     * @return {glsDrawTests.GLValue}
     */
    glsDrawTests.GLValue.getMaxValue = function(type) {
        var value;

        switch (type) {
            case glsDrawTests.DrawTestSpec.InputType.FLOAT:
                value = 127;
                break;
            /*case glsDrawTests.DrawTestSpec.InputType.FIXED:
                value = 32760;
                break;
            case glsDrawTests.DrawTestSpec.InputType.DOUBLE:
                value = 127;
                break;*/
            case glsDrawTests.DrawTestSpec.InputType.BYTE:
                value = 127;
                break;
            case glsDrawTests.DrawTestSpec.InputType.SHORT:
                value = 32760;
                break;
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_BYTE:
                value = 255;
                break;
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_SHORT:
                value = 65530;
                break;
            case glsDrawTests.DrawTestSpec.InputType.INT:
                value = 2147483647;
                break;
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT:
                value = 4294967295;
                break;
            case glsDrawTests.DrawTestSpec.InputType.HALF:
                value = 256;
                break;
            default: //Original code returns garbage-filled GLValues
                return new glsDrawTests.GLValue();
        }

        return glsDrawTests.GLValue.create(value, type);
    };

    /**
     * glsDrawTests.GLValue.getMinValue
     * @param {glsDrawTests.DrawTestSpec.InputType} type
     * @return {glsDrawTests.GLValue}
     */
    glsDrawTests.GLValue.getMinValue = function(type) {
        var value;

        switch (type) {
            case glsDrawTests.DrawTestSpec.InputType.FLOAT:
                value = -127;
                break;
            /*case glsDrawTests.DrawTestSpec.InputType.FIXED:
                value = -32760;
                break;
            case glsDrawTests.DrawTestSpec.InputType.DOUBLE:
                value = -127;
                break;*/
            case glsDrawTests.DrawTestSpec.InputType.BYTE:
                value = -127;
                break;
            case glsDrawTests.DrawTestSpec.InputType.SHORT:
                value = -32760;
                break;
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_BYTE:
                value = 0;
                break;
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_SHORT:
                value = 0;
                break;
            case glsDrawTests.DrawTestSpec.InputType.INT:
                value = -2147483647;
                break;
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT:
                value = 0;
                break;
            case glsDrawTests.DrawTestSpec.InputType.HALF:
                value = -256;
                break;

            default: //Original code returns garbage-filled GLValues
                return new glsDrawTests.GLValue();
        }

        return glsDrawTests.GLValue.create(value, type);
    };

    /**
     * glsDrawTests.GLValue.getRandom
     * @param {deRandom.Random} rnd
     * @param {glsDrawTests.GLValue} min
     * @param {glsDrawTests.GLValue} max
     * @return {glsDrawTests.GLValue}
     */
    glsDrawTests.GLValue.getRandom = function(rnd, min, max) {
        assertMsgOptions(min.getType() == max.getType(), 'Min and max types differ', false, true);

        var minv = min.interpret();
        var maxv = max.interpret();
        var type = min.getType();
        var value;

        if (maxv < minv)
            return min;

        switch (type) {
            case glsDrawTests.DrawTestSpec.InputType.FLOAT:
            //case glsDrawTests.DrawTestSpec.InputType.DOUBLE:
            case glsDrawTests.DrawTestSpec.InputType.HALF: {
                return glsDrawTests.GLValue.create(minv + rnd.getFloat() * (maxv - minv), type);
                break;
            }

            /*case glsDrawTests.DrawTestSpec.InputType.FIXED: {
                return minv == maxv ? min : glsDrawTests.GLValue.create(minv + rnd.getInt() % (maxv - minv), type);
                break;
            }*/

            case glsDrawTests.DrawTestSpec.InputType.SHORT:
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_SHORT:
            case glsDrawTests.DrawTestSpec.InputType.BYTE:
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_BYTE:
            case glsDrawTests.DrawTestSpec.InputType.INT:
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT: {
                return glsDrawTests.GLValue.create(minv + rnd.getInt() % (maxv - minv), type);
                break;
            }

            default:
                throw new Error('glsDrawTests.GLValue.getRandom - Invalid input type');
                break;
        }
    };

    // Minimum difference required between coordinates

    /**
     * @param {glsDrawTests.DrawTestSpec.InputType} type
     * @return {glsDrawTests.GLValue}
     */
    glsDrawTests.GLValue.minValue = function(type) {
        switch (type) {
            case glsDrawTests.DrawTestSpec.InputType.FLOAT:
            case glsDrawTests.DrawTestSpec.InputType.BYTE:
            case glsDrawTests.DrawTestSpec.InputType.HALF:
            //case glsDrawTests.DrawTestSpec.InputType.DOUBLE:
                return glsDrawTests.GLValue.create(4, type);
            case glsDrawTests.DrawTestSpec.InputType.SHORT:
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_SHORT:
                return glsDrawTests.GLValue.create(4 * 256, type);
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_BYTE:
                return glsDrawTests.GLValue.create(4 * 2, type);
            /*case glsDrawTests.DrawTestSpec.InputType.FIXED:
                return glsDrawTests.GLValue.create(4 * 512, type);*/
            case glsDrawTests.DrawTestSpec.InputType.INT:
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT:
                return glsDrawTests.GLValue.create(4 * 16777216, type);

            default:
                throw new Error('glsDrawTests.GLValue.minValue - Invalid input type');
        }
    };

    /**
     * @param {glsDrawTests.GLValue} val
     * @return {glsDrawTests.GLValue}
     */
    glsDrawTests.GLValue.abs = function(val) {
        var type = val.getType();
        switch(type) {
            //case glsDrawTests.DrawTestSpec.InputType.FIXED:
            case glsDrawTests.DrawTestSpec.InputType.SHORT:
                return glsDrawTests.GLValue.create(0x7FFF & val.getValue(), type);
            case glsDrawTests.DrawTestSpec.InputType.BYTE:
                return glsDrawTests.GLValue.create(0x7F & val.getValue(), type);
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_BYTE:
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_SHORT:
            case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT:
                return val;
            case glsDrawTests.DrawTestSpec.InputType.FLOAT:
            case glsDrawTests.DrawTestSpec.InputType.HALF:
            //case glsDrawTests.DrawTestSpec.InputType.DOUBLE:
                return glsDrawTests.GLValue.create(Math.abs(val.interpret()), type);
            case glsDrawTests.DrawTestSpec.InputType.INT:
                return glsDrawTests.GLValue.create(0x7FFFFFFF & val.getValue(), type);
            default:
                throw new Error('glsDrawTests.GLValue.abs - Invalid input type');
        }
    };

    /**
     * @return {glsDrawTests.DrawTestSpec.InputType}
     */
    glsDrawTests.GLValue.prototype.getType = function() {
        return this.m_type;
    };

    /**
     * glsDrawTests.GLValue.toFloat
     * @return {number}
     */
    glsDrawTests.GLValue.prototype.toFloat = function() {
        return this.interpret();
    };

    /**
     * glsDrawTests.GLValue.getValue
     * @return {number}
     */
    glsDrawTests.GLValue.prototype.getValue = function() {
        return this.m_value[0];
    };

    /**
     * interpret function. Returns the m_value as a quantity so arithmetic operations can be performed on it
     * Only some types require this.
     * @return {number}
     */
    glsDrawTests.GLValue.prototype.interpret = function() {
        if (this.m_type == glsDrawTests.DrawTestSpec.InputType.HALF)
            return glsDrawTests.GLValue.halfToFloat(this.m_value[0]);
        /*else if (this.m_type == glsDrawTests.DrawTestSpec.InputType.FIXED) {
            var maxValue = 65536;
            return Math.floor((2 * this.m_value[0] + 1) / (maxValue - 1));
        }*/

        return this.m_value[0];
    };

    /**
     * @param {glsDrawTests.GLValue} other
     * @return {glsDrawTests.GLValue}
     */
    glsDrawTests.GLValue.prototype.add = function(other) {
        return glsDrawTests.GLValue.create(this.interpret() + other.interpret(), this.m_type);
    };

    /**
     * @param {glsDrawTests.GLValue} other
     * @return {glsDrawTests.GLValue}
     */
    glsDrawTests.GLValue.prototype.mul = function(other) {
        return glsDrawTests.GLValue.create(this.interpret() * other.interpret(), this.m_type);
    };

    /**
     * @param {glsDrawTests.GLValue} other
     * @return {glsDrawTests.GLValue}
     */
    glsDrawTests.GLValue.prototype.div = function(other) {
        return glsDrawTests.GLValue.create(this.interpret() / other.interpret(), this.m_type);
    };

    /**
     * @param {glsDrawTests.GLValue} other
     * @return {glsDrawTests.GLValue}
     */
    glsDrawTests.GLValue.prototype.sub = function(other) {
        return glsDrawTests.GLValue.create(this.interpret() - other.interpret(), this.m_type);
    };

    /**
     * @param {glsDrawTests.GLValue} other
     * @return {glsDrawTests.GLValue}
     */
    glsDrawTests.GLValue.prototype.addToSelf = function(other) {
        this.m_value[0] = this.interpret() + other.interpret();
        return this;
    };

    /**
     * @param {glsDrawTests.GLValue} other
     * @return {glsDrawTests.GLValue}
     */
    glsDrawTests.GLValue.prototype.subToSelf = function(other) {
        this.m_value[0] = this.interpret() - other.interpret();
        return this;
    };

    /**
     * @param {glsDrawTests.GLValue} other
     * @return {glsDrawTests.GLValue}
     */
    glsDrawTests.GLValue.prototype.mulToSelf = function(other) {
        this.m_value[0] = this.interpret() * other.interpret();
        return this;
    };

    /**
     * @param {glsDrawTests.GLValue} other
     * @return {glsDrawTests.GLValue}
     */
    glsDrawTests.GLValue.prototype.divToSelf = function(other) {
        this.m_value[0] = this.interpret() / other.interpret();
        return this;
    };

    /**
     * @param {glsDrawTests.GLValue} other
     * @return {boolean}
     */
    glsDrawTests.GLValue.prototype.equals = function(other) {
        return this.m_value[0] == other.getValue();
    };

    /**
     * @param {glsDrawTests.GLValue} other
     * @return {boolean}
     */
    glsDrawTests.GLValue.prototype.lessThan = function(other) {
        return this.interpret() < other.interpret();
    };

    /**
     * @param {glsDrawTests.GLValue} other
     * @return {boolean}
     */
    glsDrawTests.GLValue.prototype.greaterThan = function(other) {
        return this.interpret() > other.interpret();
    };

    /**
     * @param {glsDrawTests.GLValue} other
     * @return {boolean}
     */
    glsDrawTests.GLValue.prototype.lessOrEqualThan = function(other) {
        return this.interpret() <= other.interpret();
    };

    /**
     * @param {glsDrawTests.GLValue} other
     * @return {boolean}
     */
    glsDrawTests.GLValue.prototype.greaterOrEqualThan = function(other) {
        return this.interpret() >= other.interpret();
    };

    // AttriuteArray

    /**
     * AttributeArray
     * @constructor
     * @param {glsDrawTests.DrawTestSpec.Storage} storage
     * @param {sglrGLContext.GLContext | sglrReferenceContext.ReferenceContext} context
     */
    glsDrawTests.AttributeArray = function (storage, context) {
        /** @type {glsDrawTests.DrawTestSpec.Storage} */ this.m_storage = storage;
        /** @type {sglrGLContext.GLContext | sglrReferenceContext.ReferenceContext} */ this.m_ctx = context;
        /** @type {WebGLBuffer|sglrReferenceContext.DataBuffer|null} */ this.m_glBuffer;

        /** @type {number} */ this.m_size = 0;
        /** @type {Uint8Array} */ this.m_data; //NOTE: Used in unsupported user storage
        /** @type {number} */ this.m_componentCount;
        /** @type {boolean} */ this.m_bound = false;
        /** @type {glsDrawTests.DrawTestSpec.Target} */ this.m_target = glsDrawTests.DrawTestSpec.Target.ARRAY;
        /** @type {glsDrawTests.DrawTestSpec.InputType} */ this.m_inputType = glsDrawTests.DrawTestSpec.InputType.FLOAT;
        /** @type {glsDrawTests.DrawTestSpec.OutputType} */ this.m_outputType = glsDrawTests.DrawTestSpec.OutputType.VEC4;
        /** @type {boolean} */ this.m_normalize = false;
        /** @type {number} */ this.m_stride = 0;
        /** @type {number} */ this.m_offset = 0;
        /** @type {rrGenericVector.GenericVec4} */ this.m_defaultAttrib;
        /** @type {number} */ this.m_instanceDivisor = 0;
        /** @type {boolean} */ this.m_isPositionAttr = false;
        /** @type {boolean} */ this.m_bgraOrder = false;

        if (this.m_storage == glsDrawTests.DrawTestSpec.Storage.BUFFER) {
            this.m_glBuffer = this.m_ctx.createBuffer();
        }
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.Target} target
     * @param {number} size
     * @param {goog.TypedArray} ptr
     * @param {glsDrawTests.DrawTestSpec.Usage} usage
     */
    glsDrawTests.AttributeArray.prototype.data = function (target, size, ptr, usage) {
        this.m_size = size;
        this.m_target = target;

        if (this.m_storage == glsDrawTests.DrawTestSpec.Storage.BUFFER)
        {
            this.m_ctx.bindBuffer(glsDrawTests.targetToGL(target), this.m_glBuffer);
            this.m_ctx.bufferData(glsDrawTests.targetToGL(target), size, ptr, glsDrawTests.usageToGL(usage));
        }
        else
            throw new Error('Wrong storage type');
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.Target} target
     * @param {number} offset
     * @param {number} size
     * @param {goog.TypedArray} ptr
     */
    glsDrawTests.AttributeArray.prototype.subdata = function (target, offset, size, ptr) {
        this.m_target = target;

        if (this.m_storage == glsDrawTests.DrawTestSpec.Storage.BUFFER) {
            this.m_ctx.bindBuffer(glsDrawTests.targetToGL(target), this.m_glBuffer);

            this.m_ctx.bufferSubData(glsDrawTests.targetToGL(target), offset, size, ptr);
        }
        else
            throw new Error('Wrong storage type');
    };

    /**
     * @param {boolean} bound
     * @param {number} offset
     * @param {number} size
     * @param {glsDrawTests.DrawTestSpec.InputType} inputType
     * @param {glsDrawTests.DrawTestSpec.OutputType} outType
     * @param {boolean} normalized
     * @param {number} stride
     * @param {number} instanceDivisor
     * @param {rrGenericVector.GenericVec4} defaultAttrib
     * @param {boolean} isPositionAttr
     * @param {boolean} bgraComponentOrder
     */
    glsDrawTests.AttributeArray.prototype.setupArray = function (bound, offset, size, inputType, outType,
        normalized, stride, instanceDivisor, defaultAttrib, isPositionAttr, bgraComponentOrder) {
        this.m_componentCount = size;
        this.m_bound = bound;
        this.m_inputType = inputType;
        this.m_outputType = outType;
        this.m_normalize = normalized;
        this.m_stride = stride;
        this.m_offset = offset;
        this.m_defaultAttrib = defaultAttrib;
        this.m_instanceDivisor = instanceDivisor;
        this.m_isPositionAttr = isPositionAttr;
        this.m_bgraOrder = bgraComponentOrder;
    };

    /**
     * @param {number} loc (32-bit)
     */
    glsDrawTests.AttributeArray.prototype.bindAttribute = function (loc) {
        if (!this.isBound()) {
            switch (this.m_inputType) {
                case glsDrawTests.DrawTestSpec.InputType.FLOAT: {
                    /** @type {Array<number>} (4) */ var attr = this.m_defaultAttrib;

                    switch (this.m_componentCount) {
                        case 1: this.m_ctx.vertexAttrib1f(loc, attr[0]); break;
                        case 2: this.m_ctx.vertexAttrib2f(loc, attr[0], attr[1]); break;
                        case 3: this.m_ctx.vertexAttrib3f(loc, attr[0], attr[1], attr[2]); break;
                        case 4: this.m_ctx.vertexAttrib4f(loc, attr[0], attr[1], attr[2], attr[3]); break;
                        default: throw new Error('Invalid component count'); break;
                    }
                    break;
                }
                case glsDrawTests.DrawTestSpec.InputType.INT: {
                    /** @type {Array<number>} (4) */ var attr = this.m_defaultAttrib;
                    this.m_ctx.vertexAttribI4i(loc, attr[0], attr[1], attr[2], attr[3]);
                    break;
                }
                case glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT: {
                    /** @type {Array<number>} (4) */ var attr = this.m_defaultAttrib;
                    this.m_ctx.vertexAttribI4ui(loc, attr[0], attr[1], attr[2], attr[3]);
                    break;
                }
                default:
                    throw new Error('Invalid input type');
                    break;
            }
        } else {
            /** @type {Uint8Array} */ var basePtr = null;

            if (this.m_storage == glsDrawTests.DrawTestSpec.Storage.BUFFER) {
                this.m_ctx.bindBuffer(glsDrawTests.targetToGL(this.m_target), this.m_glBuffer);

                basePtr = null;
            } else
                throw new Error('Invalid storage type');

            if (!glsDrawTests.inputTypeIsFloatType(this.m_inputType)) {
                // Input is not float type

                if (glsDrawTests.outputTypeIsFloatType(this.m_outputType)) {
                    var size = (this.m_bgraOrder) ? (gl.BGRA) : (this.m_componentCount); //TODO: Check if BGRA will be in WebGL2

                    assertMsgOptions(!(this.m_bgraOrder && this.m_componentCount != 4), 'Bgra order must have 4 components', false, true);

                    // Output type is float type
                    this.m_ctx.vertexAttribPointer(loc, size, glsDrawTests.inputTypeToGL(this.m_inputType), this.m_normalize, this.m_stride, basePtr.subarray(this.m_offset));
                } else {
                    // Output type is int type
                    this.m_ctx.vertexAttribIPointer(loc, this.m_componentCount, glsDrawTests.inputTypeToGL(this.m_inputType), this.m_stride, basePtr.subarray(this.m_offset));
                }
            } else {
                // Input type is float type

                // Output type must be float type
                assertMsgOptions(glsDrawTests.outputTypeIsFloatType(this.m_outputType), 'Output type is not float', false, true);

                this.m_ctx.vertexAttribPointer(loc, this.m_componentCount, glsDrawTests.inputTypeToGL(this.m_inputType), this.m_normalize,
                    this.m_stride, basePtr.subarray(this.m_offset));
            }

            if (this.m_instanceDivisor)
                this.m_ctx.vertexAttribDivisor(loc, this.m_instanceDivisor);
        }
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.Target} target
     */
    glsDrawTests.AttributeArray.prototype.bindIndexArray = function (target) {
        if (this.m_storage == glsDrawTests.DrawTestSpec.Storage.BUFFER) {
            this.m_ctx.bindBuffer(glsDrawTests.targetToGL(target), this.m_glBuffer);
        }
    };

    // DrawTestSpec

    /**
     * @constructor
     */
    glsDrawTests.DrawTestSpec = function () {
        //TODO: Check if ApiType is needed --> /** @type {glsDrawTests.DrawTestSpec.ApiType} */ this.apiType;            //!< needed in spec validation
        /** @type {?glsDrawTests.DrawTestSpec.Primitive} */ this.primitive = null;
        /** @type {number} */ this.primitiveCount = 0;     //!< number of primitives to draw (per instance)

        /** @type {?glsDrawTests.DrawTestSpec.DrawMethod} */ this.drawMethod = null;
        /** @type {?glsDrawTests.DrawTestSpec.IndexType} */ this.indexType = null;          //!< used only if drawMethod = DrawElements*
        /** @type {number} */ this.indexPointerOffset = 0; //!< used only if drawMethod = DrawElements*
        /** @type {?glsDrawTests.DrawTestSpec.Storage} */ this.indexStorage = null;       //!< used only if drawMethod = DrawElements*
        /** @type {number} */ this.first = 0;              //!< used only if drawMethod = DrawArrays*
        /** @type {number} */ this.indexMin = 0;           //!< used only if drawMethod = Draw*Ranged
        /** @type {number} */ this.indexMax = 0;           //!< used only if drawMethod = Draw*Ranged
        /** @type {number} */ this.instanceCount = 0;      //!< used only if drawMethod = Draw*Instanced or Draw*Indirect
        /** @type {number} */ this.indirectOffset = 0;     //!< used only if drawMethod = Draw*Indirect
        /** @type {number} */ this.baseVertex = 0;         //!< used only if drawMethod = DrawElementsIndirect or *BaseVertex

        /** @type {Array<glsDrawTests.DrawTestSpec.AttributeSpec>} */ this.attribs = [];
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.Target} target
     * @return {string}
     */
    glsDrawTests.DrawTestSpec.targetToString = function(target) {
        assertMsgOptions(target != null, 'Target is null', false, true);

        var targets = [
            "element_array",    // TARGET_ELEMENT_ARRAY = 0,
            "array"                // TARGET_ARRAY,
        ];
        assertMsgOptions(targets.length == Object.keys(glsDrawTests.DrawTestSpec.Target).length,
            'The amount of target names is different than the amount of targets', false, true);

        return targets[target];
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.InputType} type
     * @return {string}
     */
    glsDrawTests.DrawTestSpec.inputTypeToString = function(type) {
        assertMsgOptions(type != null, 'Type is null', false, true);

        var types = [
            "float",            // INPUTTYPE_FLOAT = 0,
            "fixed",            // INPUTTYPE_FIXED,
            "double",            // INPUTTYPE_DOUBLE

            "byte",                // INPUTTYPE_BYTE,
            "short",            // INPUTTYPE_SHORT,

            "unsigned_byte",    // INPUTTYPE_UNSIGNED_BYTE,
            "unsigned_short",    // INPUTTYPE_UNSIGNED_SHORT,

            "int",                        // INPUTTYPE_INT,
            "unsigned_int",                // INPUTTYPE_UNSIGNED_INT,
            "half",                        // INPUTTYPE_HALF,
            "unsigned_int2_10_10_10",    // INPUTTYPE_UNSIGNED_INT_2_10_10_10,
            "int2_10_10_10"                // INPUTTYPE_INT_2_10_10_10,
        ];
        assertMsgOptions(types.length == Object.keys(glsDrawTests.DrawTestSpec.InputType).length,
            'The amount of type names is different than the amount of types', false, true);

        return types[type];
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.OutputType} type
     * @return {string}
     */
    glsDrawTests.DrawTestSpec.outputTypeToString = function (type) {
        assertMsgOptions(type != null, 'Type is null', false, true);

        var types = [
            "float",        // OUTPUTTYPE_FLOAT = 0,
            "vec2",            // OUTPUTTYPE_VEC2,
            "vec3",            // OUTPUTTYPE_VEC3,
            "vec4",            // OUTPUTTYPE_VEC4,

            "int",            // OUTPUTTYPE_INT,
            "uint",            // OUTPUTTYPE_UINT,

            "ivec2",        // OUTPUTTYPE_IVEC2,
            "ivec3",        // OUTPUTTYPE_IVEC3,
            "ivec4",        // OUTPUTTYPE_IVEC4,

            "uvec2",        // OUTPUTTYPE_UVEC2,
            "uvec3",        // OUTPUTTYPE_UVEC3,
            "uvec4"        // OUTPUTTYPE_UVEC4,
        ];
        assertMsgOptions(types.length == Object.keys(glsDrawTests.DrawTestSpec.InputType).length,
            'The amount of type names is different than the amount of types');

        return types[type];
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.Usage} usage
     * @return {string}
     */
    glsDrawTests.DrawTestSpec.usageTypeToString = function (usage) {
        assertMsgOptions(usage != null, 'Usage is null', false, true);

        var usages = [
            "dynamic_draw",    // USAGE_DYNAMIC_DRAW = 0,
            "static_draw",    // USAGE_STATIC_DRAW,
            "stream_draw",    // USAGE_STREAM_DRAW,

            "stream_read",    // USAGE_STREAM_READ,
            "stream_copy",    // USAGE_STREAM_COPY,

            "static_read",    // USAGE_STATIC_READ,
            "static_copy",    // USAGE_STATIC_COPY,

            "dynamic_read",    // USAGE_DYNAMIC_READ,
            "dynamic_copy"    // USAGE_DYNAMIC_COPY,
        ];
        assertMsgOptions(usages.length == Object.keys(glsDrawTests.DrawTestSpec.Usage).length,
            'The amount of usage names is different than the amount of usages', false, true);

        return usages[usage];
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.Storage} storage
     * @return {string}
     */
    glsDrawTests.DrawTestSpec.storageToString = function (storage) {
        assertMsgOptions(storage != null, 'Storage is null', false, true);

        var storages = [
            "user_ptr",    // STORAGE_USER = 0,
            "buffer"    // STORAGE_BUFFER,
        ];
        assertMsgOptions(storages.length == Object.keys(glsDrawTests.DrawTestSpec.Storage).length,
            'The amount of storage names is different than the amount of storages', false, true);

        return storages[storage];
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.Primitive} primitive
     * @return {string}
     */
    glsDrawTests.DrawTestSpec.primitiveToString = function (primitive) {
        assertMsgOptions(primitive == null, 'Primitive is null', false, true);

        var primitives = [
            "points",                    // PRIMITIVE_POINTS ,
            "triangles",                // PRIMITIVE_TRIANGLES,
            "triangle_fan",                // PRIMITIVE_TRIANGLE_FAN,
            "triangle_strip",            // PRIMITIVE_TRIANGLE_STRIP,
            "lines",                    // PRIMITIVE_LINES
            "line_strip",                // PRIMITIVE_LINE_STRIP
            "line_loop",                // PRIMITIVE_LINE_LOOP
            "lines_adjacency",            // PRIMITIVE_LINES_ADJACENCY
            "line_strip_adjacency",        // PRIMITIVE_LINE_STRIP_ADJACENCY
            "triangles_adjacency",        // PRIMITIVE_TRIANGLES_ADJACENCY
            "triangle_strip_adjacency"    // PRIMITIVE_TRIANGLE_STRIP_ADJACENCY
        ];
        assertMsgOptions(primitives.length == Object.keys(glsDrawTests.DrawTestSpec.Primitive).length,
            'The amount of primitive names is different than the amount of primitives', false, true);

        return primitives[primitive];
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.IndexType} type
     * @return {string}
     */
    glsDrawTests.DrawTestSpec.indexTypeToString = function (type) {
        assertMsgOptions(type != null, 'Index type is null', false, true);

        var indexTypes = [
            "byte",        // INDEXTYPE_BYTE = 0,
            "short",    // INDEXTYPE_SHORT,
            "int"        // INDEXTYPE_INT,
        ];
        assertMsgOptions(indexTypes.length == Object.keys(glsDrawTests.DrawTestSpec.IndexType).length,
            'The amount of index type names is different than the amount of index types', false, true);

        return indexTypes[type];
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.DrawMethod} method
     * @return {string}
     */
    glsDrawTests.DrawTestSpec.drawMethodToString = function (method) {
        assertMsgOptions(method != null, 'Method is null', false, true);

        var methods = [
            "draw_arrays",                            //!< DRAWMETHOD_DRAWARRAYS
            "draw_arrays_instanced",                //!< DRAWMETHOD_DRAWARRAYS_INSTANCED
            "draw_elements",                        //!< DRAWMETHOD_DRAWELEMENTS
            "draw_range_elements",                    //!< DRAWMETHOD_DRAWELEMENTS_RANGED
            "draw_elements_instanced"                //!< DRAWMETHOD_DRAWELEMENTS_INSTANCED
        ];
        assertMsgOptions(methods.length == Object.keys(glsDrawTests.DrawTestSpec.DrawMethod).length,
        'The amount of method names is different than the amount of methods', false, true);

        return methods[method];
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.InputType} type
     * @return {number}
     */
    glsDrawTests.DrawTestSpec.inputTypeSize = function (type) {
        assertMsgOptions(type != null, 'Input type is null', false, true);

        var size = [
            4,        // INPUTTYPE_FLOAT = 0,
            /*4,    // INPUTTYPE_FIXED,
            8,        // INPUTTYPE_DOUBLE*/

            1,        // INPUTTYPE_BYTE,
            2,    // INPUTTYPE_SHORT,

            1,    // INPUTTYPE_UNSIGNED_BYTE,
            2,    // INPUTTYPE_UNSIGNED_SHORT,

            4,        // INPUTTYPE_INT,
            4,        // INPUTTYPE_UNSIGNED_INT,
            2,        // INPUTTYPE_HALF,
            4 / 4,        // INPUTTYPE_UNSIGNED_INT_2_10_10_10,
            4 / 4        // INPUTTYPE_INT_2_10_10_10,
        ];
        assertMsgOptions(size.length == Object.keys(glsDrawTests.DrawTestSpec.InputType).length,
            'The amount of type names is different than the amount of types', false, true);

        return size[type];
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.IndexType} type
     * @return {number}
     */
    glsDrawTests.DrawTestSpec.indexTypeSize = function (type) {
        assertMsgOptions(type != null, 'Type is null', false, true);

        var size = [
            1,    // INDEXTYPE_BYTE,
            2,    // INDEXTYPE_SHORT,
            4    // INDEXTYPE_INT,
        ];
        assertMsgOptions(size.length == Object.keys(glsDrawTests.DrawTestSpec.IndexType).length,
            'The amount of type names is different than the amount of types', false, true);

        return size[type];
    };

    /**
     * @return {string}
     */
    glsDrawTests.DrawTestSpec.prototype.getName = function () {
        /** @type {glsDrawTests.MethodInfo} */ var methodInfo = glsDrawTests.getMethodInfo(this.drawMethod);
        /** @type {boolean} */ var hasFirst = methodInfo.first;
        /** @type {boolean} */ var instanced = methodInfo.instanced;
        /** @type {boolean} */ var ranged = methodInfo.ranged;
        /** @type {boolean} */ var indexed = methodInfo.indexed;

        var name = '';

        for (var ndx = 0; ndx < this.attribs.length; ++ndx) {
            /** @type {glsDrawTests.DrawTestSpec.AttributeSpec}*/ var attrib = this.attribs[ndx];

            if (attribs.length > 1)
                name += "attrib" + ndx + "_";

            if (ndx == 0|| attrib.additionalPositionAttribute)
                name += "pos_";
            else
                name += "col_";

            if (attrib.useDefaultAttribute) {
                name += "non_array_" +
                    glsDrawTests.DrawTestSpec.inputTypeToString(/** @type {glsDrawTests.DrawTestSpec.InputType} */ (attrib.inputType)) + "_" +
                    attrib.componentCount + "_" +
                    glsDrawTests.DrawTestSpec.outputTypeToString(attrib.outputType) + "_";
            } else {
                name += glsDrawTests.DrawTestSpec.storageToString(attrib.storage) + "_" +
                    attrib.offset + "_" +
                    attrib.stride + "_" +
                    glsDrawTests.DrawTestSpec.inputTypeToString(/** @type {glsDrawTests.DrawTestSpec.InputType} */ (attrib.inputType));
                if (attrib.inputType != glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT_2_10_10_10 && attrib.inputType != glsDrawTests.DrawTestSpec.InputType.INT_2_10_10_10)
                    name += attrib.componentCount;
                name += "_" +
                    (attrib.normalize ? "normalized_" : "") +
                    glsDrawTests.DrawTestSpec.outputTypeToString(attrib.outputType) + "_" +
                    glsDrawTests.DrawTestSpec.usageTypeToString(attrib.usage) + "_" +
                    attrib.instanceDivisor + "_";
            }
        }

        if (indexed)
            name += "index_" + glsDrawTests.DrawTestSpec.indexTypeToString(indexType) + "_" +
                glsDrawTests.DrawTestSpec.storageToString(indexStorage) + "_" +
                "offset" + indexPointerOffset + "_";
        if (hasFirst)
            name += "first" + first + "_";
        if (ranged)
            name += "ranged_" + indexMin + "_" + indexMax + "_";
        if (instanced)
            name += "instances" + instanceCount + "_";

        switch (primitive) {
            case glsDrawTests.DrawTestSpec.Primitive.POINTS:
                name += "points_";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLES:
                name += "triangles_";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLE_FAN:
                name += "triangle_fan_";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLE_STRIP:
                name += "triangle_strip_";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINES:
                name += "lines_";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINE_STRIP:
                name += "line_strip_";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINE_LOOP:
                name += "line_loop_";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINES_ADJACENCY:
                name += "line_adjancency";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINE_STRIP_ADJACENCY:
                name += "line_strip_adjancency";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLES_ADJACENCY:
                name += "triangles_adjancency";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLE_STRIP_ADJACENCY:
                name += "triangle_strip_adjancency";
                break;
            default:
                throw new Error('Invalid primitive');
                break;
        }

        name += primitiveCount;

        return name;
    };

    /**
     * @return {string}
     */
    glsDrawTests.DrawTestSpec.getDesc = function () {
        var desc = '';

        for (var ndx = 0; ndx < this.attribs.length; ++ndx) {
            /** @type {glsDrawTests.AttributeSpec} */ var attrib = this.attribs[ndx];

            if (attrib.useDefaultAttribute) {
                desc += "Attribute " + ndx + ": default, " + ((ndx == 0|| attrib.additionalPositionAttribute) ? ("position ,") : ("color ,")) +
                    "input datatype " + glsDrawTests.DrawTestSpec.inputTypeToString(/** @type {glsDrawTests.DrawTestSpec.InputType} */ (attrib.inputType)) + ", " +
                    "input component count " + attrib.componentCount + ", " +
                    "used as " + glsDrawTests.DrawTestSpec.outputTypeToString(attrib.outputType) + ", ";
            }
            else
            {
                desc += "Attribute " + ndx + ": " + ((ndx == 0|| attrib.additionalPositionAttribute) ? ("position ,") : ("color ,")) +
                    "Storage in " + glsDrawTests.DrawTestSpec.storageToString(attrib.storage) + ", " +
                    "stride " + attrib.stride + ", " +
                    "input datatype " + glsDrawTests.DrawTestSpec.inputTypeToString(/** @type {glsDrawTests.DrawTestSpec.InputType} */ (attrib.inputType)) + ", " +
                    "input component count " + attrib.componentCount + ", " +
                    (attrib.normalize ? "normalized, " : "") +
                    "used as " + glsDrawTests.DrawTestSpec.outputTypeToString(attrib.outputType) + ", " +
                    "instance divisor " + attrib.instanceDivisor + ", ";
            }
        }

        if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS) {
            desc += "drawArrays(), " +
                "first " + first + ", ";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS_INSTANCED) {
            desc += "drawArraysInstanced(), " +
                "first " + first + ", " +
                "instance count " + instanceCount + ", ";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS) {
            desc += "drawElements(), " +
                "index type " + glsDrawTests.DrawTestSpec.indexTypeToString(indexType) + ", " +
                "index storage in " + glsDrawTests.DrawTestSpec.storageToString(indexStorage) + ", " +
                "index offset " + indexPointerOffset + ", ";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_RANGED) {
            desc += "drawElementsRanged(), " +
                "index type " + glsDrawTests.DrawTestSpec.indexTypeToString(indexType) + ", " +
                "index storage in " + glsDrawTests.DrawTestSpec.storageToString(indexStorage) + ", " +
                "index offset " + indexPointerOffset + ", " +
                "range start " + indexMin + ", " +
                "range end " + indexMax + ", ";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_INSTANCED) {
            desc += "drawElementsInstanced(), " +
                "index type " + glsDrawTests.DrawTestSpec.indexTypeToString(indexType) + ", " +
                "index storage in " + glsDrawTests.DrawTestSpec.storageToString(indexStorage) + ", " +
                "index offset " + indexPointerOffset + ", " +
                "instance count " + instanceCount + ", ";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS_INDIRECT) {
            desc += "drawArraysIndirect(), " +
                "first " + first + ", " +
                "instance count " + instanceCount + ", " +
                "indirect offset " + indirectOffset + ", ";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_INDIRECT) {
            desc += "drawElementsIndirect(), " +
                "index type " + glsDrawTests.DrawTestSpec.indexTypeToString(indexType) + ", " +
                "index storage in " + glsDrawTests.DrawTestSpec.storageToString(indexStorage) + ", " +
                "index offset " + indexPointerOffset + ", " +
                "instance count " + instanceCount + ", " +
                "indirect offset " + indirectOffset + ", " +
                "base vertex " + baseVertex + ", ";
        } else
            throw new Error('Invalid draw method');

        desc += primitiveCount;

        switch (primitive) {
            case glsDrawTests.DrawTestSpec.Primitive.POINTS:
                desc += "points";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLES:
                desc += "triangles";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLE_FAN:
                desc += "triangles (fan)";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLE_STRIP:
                desc += "triangles (strip)";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINES:
                desc += "lines";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINE_STRIP:
                desc += "lines (strip)";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINE_LOOP:
                desc += "lines (loop)";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINES_ADJACENCY:
                desc += "lines (adjancency)";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINE_STRIP_ADJACENCY:
                desc += "lines (strip, adjancency)";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLES_ADJACENCY:
                desc += "triangles (adjancency)";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLE_STRIP_ADJACENCY:
                desc += "triangles (strip, adjancency)";
                break;
            default:
                throw new Error('Invalid primitive');
                break;
        }

        return desc;
    };

    /**
     * @return {string}
     */
    glsDrawTests.DrawTestSpec.getMultilineDesc = function () {
        var desc ='';

        for (var ndx = 0; ndx < this.attribs.length; ++ndx) {
            /** @type {glsDrawTests.AttributeSpec} */ var attrib = this.attribs[ndx];

            if (attrib.useDefaultAttribute) {
                desc += "Attribute " + ndx + ": default, " + ((ndx == 0|| attrib.additionalPositionAttribute) ? ("position\n") : ("color\n"))
                    + "\tinput datatype " + glsDrawTests.DrawTestSpec.inputTypeToString(/** @type {glsDrawTests.DrawTestSpec.InputType} */ (attrib.inputType)) + "\n"
                    + "\tinput component count " + attrib.componentCount + "\n"
                    + "\tused as " + glsDrawTests.DrawTestSpec.outputTypeToString(attrib.outputType) + "\n";
            } else {
                desc += "Attribute " + ndx + ": " + ((ndx == 0|| attrib.additionalPositionAttribute) ? ("position\n") : ("color\n")) +
                    "\tStorage in " + glsDrawTests.DrawTestSpec.storageToString(attrib.storage) + "\n" +
                    "\tstride " + attrib.stride + "\n" +
                    "\tinput datatype " + glsDrawTests.DrawTestSpec.inputTypeToString(/** @type {glsDrawTests.DrawTestSpec.InputType} */ (attrib.inputType)) + "\n" +
                    "\tinput component count " + attrib.componentCount + "\n" +
                    (attrib.normalize ? "\tnormalized\n" : "") +
                    "\tused as " + glsDrawTests.DrawTestSpec.outputTypeToString(attrib.outputType) + "\n" +
                    "\tinstance divisor " + attrib.instanceDivisor + "\n";
            }
        }

        if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS) {
            desc += "drawArrays()\n" +
                "\tfirst " + first + "\n";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS_INSTANCED) {
            desc += "drawArraysInstanced()\n" +
                "\tfirst " + first + "\n" +
                "\tinstance count " + instanceCount + "\n";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS) {
            desc += "drawElements()\n" +
                "\tindex type " + glsDrawTests.DrawTestSpec.indexTypeToString(indexType) + "\n" +
                "\tindex storage in " + glsDrawTests.DrawTestSpec.storageToString(indexStorage) + "\n" +
                "\tindex offset " + indexPointerOffset + "\n";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_RANGED) {
            desc += "drawElementsRanged()\n" +
                "\tindex type " + glsDrawTests.DrawTestSpec.indexTypeToString(indexType) + "\n" +
                "\tindex storage in " + glsDrawTests.DrawTestSpec.storageToString(indexStorage) + "\n" +
                "\tindex offset " + indexPointerOffset + "\n" +
                "\trange start " + indexMin + "\n" +
                "\trange end " + indexMax + "\n";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_INSTANCED) {
            desc += "drawElementsInstanced()\n" +
                "\tindex type " + glsDrawTests.DrawTestSpec.indexTypeToString(indexType) + "\n" +
                "\tindex storage in " + glsDrawTests.DrawTestSpec.storageToString(indexStorage) + "\n" +
                "\tindex offset " + indexPointerOffset + "\n" +
                "\tinstance count " + instanceCount + "\n";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS_INDIRECT) {
            desc += "drawArraysIndirect()\n" +
                "\tfirst " + first + "\n" +
                "\tinstance count " + instanceCount + "\n" +
                "\tindirect offset " + indirectOffset + "\n";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_INDIRECT) {
            desc += "drawElementsIndirect()\n" +
                "\tindex type " + glsDrawTests.DrawTestSpec.indexTypeToString(indexType) + "\n" +
                "\tindex storage in " + glsDrawTests.DrawTestSpec.storageToString(indexStorage) + "\n" +
                "\tindex offset " + indexPointerOffset + "\n" +
                "\tinstance count " + instanceCount + "\n" +
                "\tindirect offset " + indirectOffset + "\n" +
                "\tbase vertex " + baseVertex + "\n";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_BASEVERTEX) {
            desc += "drawElementsBaseVertex()\n"
                "\tindex type " + glsDrawTests.DrawTestSpec.indexTypeToString(indexType) + "\n" +
                "\tindex storage in " + glsDrawTests.DrawTestSpec.storageToString(indexStorage) + "\n" +
                "\tindex offset " + indexPointerOffset + "\n" +
                "\tbase vertex " + baseVertex + "\n";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_INSTANCED_BASEVERTEX) {
            desc += "drawElementsInstancedBaseVertex()\n" +
                "\tindex type " + glsDrawTests.DrawTestSpec.indexTypeToString(indexType) + "\n" +
                "\tindex storage in " + glsDrawTests.DrawTestSpec.storageToString(indexStorage) + "\n" +
                "\tindex offset " + indexPointerOffset + "\n" +
                "\tinstance count " + instanceCount + "\n" +
                "\tbase vertex " + baseVertex + "\n";
        } else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_RANGED_BASEVERTEX) {
            desc += "drawRangeElementsBaseVertex()\n" +
                "\tindex type " + glsDrawTests.DrawTestSpec.indexTypeToString(indexType) + "\n" +
                "\tindex storage in " + glsDrawTests.DrawTestSpec.storageToString(indexStorage) + "\n" +
                "\tindex offset " + indexPointerOffset + "\n" +
                "\tbase vertex " + baseVertex + "\n" +
                "\trange start " + indexMin + "\n" +
                "\trange end " + indexMax + "\n";
        } else
            throw new Error('Invalid draw method');

        desc += "\t" + primitiveCount + " ";

        switch (primitive) {
            case glsDrawTests.DrawTestSpec.Primitive.POINTS:
                desc += "points";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLES:
                desc += "triangles";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLE_FAN:
                desc += "triangles (fan)";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLE_STRIP:
                desc += "triangles (strip)";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINES:
                desc += "lines";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINE_STRIP:
                desc += "lines (strip)";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINE_LOOP:
                desc += "lines (loop)";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINES_ADJACENCY:
                desc += "lines (adjancency)";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.LINE_STRIP_ADJACENCY:
                desc += "lines (strip, adjancency)";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLES_ADJACENCY:
                desc += "triangles (adjancency)";
                break;
            case glsDrawTests.DrawTestSpec.Primitive.TRIANGLE_STRIP_ADJACENCY:
                desc += "triangles (strip, adjancency)";
                break;
            default:
                throw new Error('Invalid primitive');
                break;
        }

        desc += "\n";

        return desc;
    };

    /**
     * @enum {number}
     */
    glsDrawTests.DrawTestSpec.Target = {
        ELEMENT_ARRAY: 0,
        ARRAY: 1
    };

    /**
     * @enum {number}
     */
    glsDrawTests.DrawTestSpec.InputType = {
        FLOAT: 0,
        /*FIXED,
        DOUBLE,*/

        BYTE: 1,
        SHORT: 2,

        UNSIGNED_BYTE: 3,
        UNSIGNED_SHORT: 4,

        INT: 5,
        UNSIGNED_INT: 6,
        HALF: 7,
        UNSIGNED_INT_2_10_10_10: 8,
        INT_2_10_10_10: 9
    };

    /**
     * @enum {number}
     */
    glsDrawTests.DrawTestSpec.OutputType = {
        FLOAT: 0,
        VEC2: 1,
        VEC3: 2,
        VEC4: 3,

        INT: 4,
        UINT: 5,

        IVEC2: 6,
        IVEC3: 7,
        IVEC4: 8,

        UVEC2: 9,
        UVEC3: 10,
        UVEC4: 11
    };

    /**
     * @enum {number}
     */
    glsDrawTests.DrawTestSpec.Usage = {
        DYNAMIC_DRAW: 0,
        STATIC_DRAW: 1,
        STREAM_DRAW: 2,

        STREAM_READ: 3,
        STREAM_COPY: 4,

        STATIC_READ: 5,
        STATIC_COPY: 6,

        DYNAMIC_READ: 7,
        DYNAMIC_COPY: 8
    };

    /**
     * @enum {number}
     */
    glsDrawTests.DrawTestSpec.Storage = {
        USER: 0,
        BUFFER: 1
    };

    /**
     * @enum {number}
     */
    glsDrawTests.DrawTestSpec.Primitive = {
        POINTS: 0,
        TRIANGLES: 1,
        TRIANGLE_FAN: 2,
        TRIANGLE_STRIP: 3,
        LINES: 4,
        LINE_STRIP: 5,
        LINE_LOOP: 6,

        LINES_ADJACENCY: 7,
        LINE_STRIP_ADJACENCY: 8,
        TRIANGLES_ADJACENCY: 9,
        TRIANGLE_STRIP_ADJACENCY: 10
    };

    /**
     * @enum {number}
     */
    glsDrawTests.DrawTestSpec.IndexType = {
        BYTE: 0,
        SHORT: 1,
        INT: 2
    };


    /**
     * @enum {number}
     */
    glsDrawTests.DrawTestSpec.DrawMethod = {
         DRAWARRAYS: 0,
         DRAWARRAYS_INSTANCED: 1,
         DRAWELEMENTS: 3,
         DRAWELEMENTS_RANGED: 4,
         DRAWELEMENTS_INSTANCED: 5
    };

    /**
     * @enum {number}
     */
    glsDrawTests.DrawTestSpec.CompatibilityTestType = {
        NONE: 0,
        UNALIGNED_OFFSET: 1,
        UNALIGNED_STRIDE: 2
    };

    /**
     * @return {number}
     */
    glsDrawTests.DrawTestSpec.prototype.hash = function () {
        // Use only drawmode-relevant values in "hashing" as the unrelevant values might not be set (causing non-deterministic behavior).
        /** @type {glsDrawTests.MethodInfo} */ var methodInfo = glsDrawTests.getMethodInfo(drawMethod);
        /** @type {boolean} */ var arrayed = methodInfo.first;
        /** @type {boolean} */ var instanced = methodInfo.instanced;
        /** @type {boolean} */ var ranged = methodInfo.ranged;
        /** @type {boolean} */ var indexed = methodInfo.indexed;
        /** @type {boolean} */ var indirect = methodInfo.indirect;
        /** @type {boolean} */ var hasBaseVtx = methodInfo.baseVertex;

        /** @type {number} */ var indexHash = (!indexed) ? (0) : (indexType + 10 * indexPointerOffset + 100 * indexStorage);
        /** @type {number} */ var arrayHash = (!arrayed) ? (0) : (first);
        /** @type {number} */ var indexRangeHash = (!ranged) ? (0) : (indexMin + 10 * indexMax);
        /** @type {number} */ var instanceHash = (!instanced) ? (0) : (instanceCount);
        /** @type {number} */ var indirectHash = (!indirect) ? (0) : (indirectOffset);
        /** @type {number} */ var baseVtxHash = (!hasBaseVtx) ? (0) : (baseVertex);
        /** @type {number} */ var basicHash = primitive + 10 * primitiveCount + 100 * drawMethod;

        return indexHash + 3 * arrayHash + 5 * indexRangeHash + 7 * instanceHash + 13 * basicHash + 17 * attribs.length + 19 * primitiveCount + 23 * indirectHash + 27 * baseVtxHash;
    };

    /**
     * @return {boolean}
     */
    glsDrawTests.DrawTestSpec.valid = function () {
        //TODO: Need to implement ApiType? --> assertMsgOptions(apiType.getProfile() != glu::PROFILE_LAST);
        assertMsgOptions(primitive != null, 'Primitive is null', false, true);
        assertMsgOptions(drawMethod != null, 'Draw method is null', false, true);

        var methodInfo = glsDrawTests.getMethodInfo(drawMethod);

        /*TODO: ApiType? for (var ndx = 0; ndx < attribs.length; ++ndx)
            if (!attribs[ndx].valid(apiType))
                return false;*/

        if (methodInfo.ranged) {
            var maxIndexValue = 0;
            if (indexType == glsDrawTests.DrawTestSpec.IndexType.BYTE)
                maxIndexValue = glsDrawTests.GLValue.getMaxValue(glsDrawTests.DrawTestSpec.InputType.UNSIGNED_BYTE).interpret();
            else if (indexType == glsDrawTests.DrawTestSpec.IndexType.SHORT)
                maxIndexValue = glsDrawTests.GLValue.getMaxValue(glsDrawTests.DrawTestSpec.InputType.UNSIGNED_SHORT).interpret();
            else if (indexType == glsDrawTests.DrawTestSpec.IndexType.INT)
                maxIndexValue = glsDrawTests.GLValue.getMaxValue(glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT).interpret();
            else
                throw new Error('Invalid index type');

            if (indexMin > indexMax)
                return false;
            if (indexMin < 0 || indexMax < 0)
                return false;
            if (indexMin > maxIndexValue || indexMax > maxIndexValue)
                return false;
        }

        if (methodInfo.first && first < 0)
            return false;

        // TODO: Check this? --> GLES2 limits
        /*if (apiType == glu::ApiType::es(2,0)) {
            if (drawMethod != glsDrawTests.DrawTestSpec.DRAWMETHOD_DRAWARRAYS && drawMethod != gls::glsDrawTests.DrawTestSpec.DRAWMETHOD_DRAWELEMENTS)
                return false;
            if (drawMethod == gls::glsDrawTests.DrawTestSpec.DRAWMETHOD_DRAWELEMENTS && (indexType != glsDrawTests.DrawTestSpec.IndexType.BYTE && indexType != glsDrawTests.DrawTestSpec.IndexType.SHORT))
                return false;
        }*/

        return true;
    };

    /**
     * @return {glsDrawTests.DrawTestSpec.CompatibilityTestType}
     */
    glsDrawTests.DrawTestSpec.prototype.isCompatibilityTest = function () {
        var methodInfo = glsDrawTests.getMethodInfo(drawMethod);

        var bufferAlignmentBad = false;
        var strideAlignmentBad = false;

        // Attribute buffer alignment
        for (var ndx = 0; ndx < attribs.length; ++ndx)
            if (!attribs[ndx].isBufferAligned())
                bufferAlignmentBad = true;

        // Attribute stride alignment
        for (var ndx = 0; ndx < attribs.length; ++ndx)
            if (!attribs[ndx].isBufferStrideAligned())
                strideAlignmentBad = true;

        // Index buffer alignment
        if (methodInfo.indexed) {
            if (indexStorage == glsDrawTests.DrawTestSpec.Storage.BUFFER) {
                var indexSize = 0;
                if (indexType == glsDrawTests.DrawTestSpec.IndexType.BYTE)
                    indexSize = 1;
                else if (indexType == glsDrawTests.DrawTestSpec.IndexType.SHORT)
                    indexSize = 2;
                else if (indexType == glsDrawTests.DrawTestSpec.IndexType.INT)
                    indexSize = 4;
                else
                    throw new Error('');

                if (indexPointerOffset % indexSize != 0)
                    bufferAlignmentBad = true;
            }
        }

        // \note combination bad alignment & stride is treated as bad offset
        if (bufferAlignmentBad)
            return glsDrawTests.DrawTestSpec.CompatibilityTestType.UNALIGNED_OFFSET;
        else if (strideAlignmentBad)
            return glsDrawTests.DrawTestSpec.CompatibilityTestType.UNALIGNED_STRIDE;
        else
            return glsDrawTests.DrawTestSpec.CompatibilityTestType.NONE;
    };

    // DrawTestSpec.AttributeSpec

    /**
     * @constructor
     */
    glsDrawTests.DrawTestSpec.AttributeSpec  = function () {
        /** @type {InputType} */ this.inputType = null;
        /** @type {OutputType} */ this.outputType = null;
        /** @type {Storage} */ this.storage = null;
        /** @type {Usage} */ this.usage = null;
        /** @type {number} */ this.componentCount = 0;
        /** @type {number} */ this.offset = 0;
        /** @type {number} */ this.stride = 0;
        /** @type {boolean} */ this.normalize = false;
        /** @type {number} */ this.instanceDivisor = 0;                //!< used only if drawMethod = Draw*Instanced
        /** @type {boolean} */ this.useDefaultAttribute = false;

        /** @type {boolean} */ this.additionalPositionAttribute = false;    //!< treat this attribute as position attribute. Attribute at index 0 is alway treated as such. False by default
        /** @type {boolean} */ this.bgraComponentOrder = false;             //!< component order of this attribute is bgra, valid only for 4-component targets. False by default.
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.InputType} inputType
     * @param {glsDrawTests.DrawTestSpec.OutputType} outputType
     * @param {glsDrawTests.DrawTestSpec.Storage} storage
     * @param {glsDrawTests.DrawTestSpec.Usage} usage
     * @param {number} componentCount
     * @param {number} offset
     * @param {number} stride
     * @param {boolean} normalize
     * @param {number} instanceDivisor
     * @return {glsDrawTests.DrawTestSpec.AttributeSpec}
     */
    glsDrawTests.DrawTestSpec.AttributeSpec.createAttributeArray = function (inputType, outputType, storage, usage, componentCount,
        offset, stride, normalize, instanceDivisor) {
        /** @type {glsDrawTests.DrawTestSpec.AttributeSpec} */ var spec;

        spec.inputType = inputType;
        spec.outputType = outputType;
        spec.storage = storage;
        spec.usage = usage;
        spec.componentCount = componentCount;
        spec.offset = offset;
        spec.stride = stride;
        spec.normalize = normalize;
        spec.instanceDivisor = instanceDivisor;

        spec.useDefaultAttribute = false;

        return spec;
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.InputType} inputType
     * @param {glsDrawTests.DrawTestSpec.OutputType} outputType
     * @param {number} componentCount
     * @return {glsDrawTests.DrawTestSpec.AttributeSpec}
     */
    glsDrawTests.DrawTestSpec.AttributeSpec.createDefaultAttribute = function (inputType, outputType, componentCount) {
        assertMsgOptions(inputType == InputType.INT || inputType == InputType.UNSIGNED_INT || inputType == InputType.FLOAT, 'Invalid input type', false, true);
        assertMsgOptions(inputType == InputType.FLOAT || componentCount == 4, 'If not float, input type should have 4 components');

        /** @type {glsDrawTests.DrawTestSpec.AttributeSpec} */ var spec;

        spec.inputType = inputType;
        spec.outputType = outputType;
        spec.storage = null;
        spec.usage = null;
        spec.componentCount = componentCount;
        spec.offset = 0;
        spec.stride = 0;
        spec.normalize = 0;
        spec.instanceDivisor = 0;

        spec.useDefaultAttribute = true;

        return spec;
    };

    /**
     * @return {number}
     */
    glsDrawTests.DrawTestSpec.AttributeSpec.prototype.hash = function () {
        if (this.useDefaultAttribute) {
            return 1 * inputType + 7 * outputType + 13 * componentCount;
        }
        else
        {
            return 1 * inputType + 2 * outputType + 3 * storage + 5 * usage + 7 * componentCount + 11 * offset + 13 * stride + 17 * (normalize ? 0 : 1) + 19 * instanceDivisor;
        }
    };

    /**
     * @param {ApiType} ctxType
     * @return {boolean}
     */
    glsDrawTests.DrawTestSpec.AttributeSpec.prototype.valid = function (ctxType) {
        /** @type {boolean} */ var inputTypeFloat = inputType == glsDrawTests.DrawTestSpec.InputType.FLOAT || /*inputType  == glsDrawTests.DrawTestSpec.InputType.FIXED ||*/ inputType == glsDrawTests.DrawTestSpec.InputType.HALF;
        /** @type {boolean} */ var inputTypeUnsignedInteger = inputType == glsDrawTests.DrawTestSpec.InputType.UNSIGNED_BYTE || inputType == glsDrawTests.DrawTestSpec.InputType.UNSIGNED_SHORT || inputType  == glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT || inputType == glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT_2_10_10_10;
        /** @type {boolean} */ var inputTypeSignedInteger = inputType == glsDrawTests.DrawTestSpec.InputType.BYTE  || inputType == glsDrawTests.DrawTestSpec.InputType.SHORT || inputType == glsDrawTests.DrawTestSpec.InputType.INT || inputType == glsDrawTests.DrawTestSpec.InputType.INT_2_10_10_10;
        /** @type {boolean} */ var inputTypePacked = inputType == glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT_2_10_10_10 || inputType == glsDrawTests.DrawTestSpec.InputType.INT_2_10_10_10;

        /** @type {boolean} */ var outputTypeFloat = outputType == glsDrawTests.DrawTestSpec.OutputType.FLOAT || outputType == glsDrawTests.DrawTestSpec.OutputType.VEC2  || outputType == glsDrawTests.DrawTestSpec.OutputType.VEC3  || outputType == glsDrawTests.DrawTestSpec.OutputType.VEC4;
        /** @type {boolean} */ var outputTypeSignedInteger = outputType == glsDrawTests.DrawTestSpec.OutputType.INT   || outputType == glsDrawTests.DrawTestSpec.OutputType.IVEC2 || outputType == glsDrawTests.DrawTestSpec.OutputType.IVEC3 || outputType == glsDrawTests.DrawTestSpec.OutputType.IVEC4;
        /** @type {boolean} */ var outputTypeUnsignedInteger = outputType == glsDrawTests.DrawTestSpec.OutputType.UINT  || outputType == glsDrawTests.DrawTestSpec.OutputType.UVEC2 || outputType == glsDrawTests.DrawTestSpec.OutputType.UVEC3 || outputType == glsDrawTests.DrawTestSpec.OutputType.UVEC4;

        if (this.useDefaultAttribute) {
            if (inputType != glsDrawTests.DrawTestSpec.InputType.INT && inputType != glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT && inputType != glsDrawTests.DrawTestSpec.InputType.FLOAT)
                return false;

            if (inputType != glsDrawTests.DrawTestSpec.InputType.FLOAT && componentCount != 4)
                return false;

            // no casting allowed (undefined results)
            if (inputType == glsDrawTests.DrawTestSpec.InputType.INT && !outputTypeSignedInteger)
                return false;
            if (inputType == glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT && !outputTypeUnsignedInteger)
                return false;
        }

        if (inputTypePacked && componentCount != 4)
            return false;

        // Invalid conversions:

        // float -> [u]int
        if (inputTypeFloat && !outputTypeFloat)
            return false;

        // uint -> int        (undefined results)
        if (inputTypeUnsignedInteger && outputTypeSignedInteger)
            return false;

        // int -> uint        (undefined results)
        if (inputTypeSignedInteger && outputTypeUnsignedInteger)
            return false;

        // packed -> non-float (packed formats are converted to floats)
        if (inputTypePacked && !outputTypeFloat)
            return false;

        // Invalid normalize. Normalize is only valid if output type is float
        if (normalize && !outputTypeFloat)
            return false;

        // Allow reverse order (GL_BGRA) only for packed and 4-component ubyte
        if (bgraComponentOrder && componentCount != 4)
            return false;
        if (bgraComponentOrder && inputType != glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT_2_10_10_10 && inputType != glsDrawTests.DrawTestSpec.InputType.INT_2_10_10_10 && inputType != glsDrawTests.DrawTestSpec.InputType.UNSIGNED_BYTE)
            return false;
        if (bgraComponentOrder && normalize != true)
            return false;

        // TODO: Check if we need to get the webgl version
        // GLES2 limits
        /*if (ctxType == glu::ApiType::es(2,0)) {
            if (inputType != glsDrawTests.DrawTestSpec.InputType.FLOAT && inputType != glsDrawTests.DrawTestSpec.InputType.FIXED &&
                inputType != glsDrawTests.DrawTestSpec.InputType.BYTE  && inputType != glsDrawTests.DrawTestSpec.InputType.UNSIGNED_BYTE &&
                inputType != glsDrawTests.DrawTestSpec.InputType.SHORT && inputType != glsDrawTests.DrawTestSpec.InputType.UNSIGNED_SHORT)
                return false;

            if (!outputTypeFloat)
                return false;

            if (bgraComponentOrder)
                return false;
        }*/

        // GLES3 limits
        //if (ctxType.getProfile() == glu::PROFILE_ES && ctxType.getMajorVersion() == 3)
        //{
            if (bgraComponentOrder)
                return false;
        //}

        return true;
    };

    /**
     * @return {boolean}
     */
    glsDrawTests.DrawTestSpec.AttributeSpec.prototype.isBufferAligned = function () {
        var inputTypePacked = inputType == glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT_2_10_10_10 || inputType == glsDrawTests.DrawTestSpec.InputType.INT_2_10_10_10;

        // Buffer alignment, offset is a multiple of underlying data type size?
        if (storage == glsDrawTests.DrawTestSpec.Storage.BUFFER) {
            var dataTypeSize = glsDrawTests.DrawTestSpec.inputTypeSize(inputType);
            if (inputTypePacked)
                dataTypeSize = 4;

            if (offset % dataTypeSize != 0)
                return false;
        }

        return true;
    };

    /**
     * @return {boolean}
     */
    glsDrawTests.DrawTestSpec.AttributeSpec.prototype.isBufferStrideAligned = function () {
        var inputTypePacked = inputType == glsDrawTests.DrawTestSpec.InputType.UNSIGNED_INT_2_10_10_10 || inputType == glsDrawTests.DrawTestSpec.InputType.INT_2_10_10_10;

        // Buffer alignment, offset is a multiple of underlying data type size?
        if (storage == glsDrawTests.DrawTestSpec.Storage.BUFFER) {
            var dataTypeSize = glsDrawTests.DrawTestSpec.inputTypeSize(inputType);
            if (inputTypePacked)
                dataTypeSize = 4;

            if (stride % dataTypeSize != 0)
                return false;
        }

        return true;
    };

    /**
     * @param {glsDrawTests.DrawTestSpec} spec
     * @param {string} name
     * @param {string} desc
     * @constructor
     */
    glsDrawTests.DrawTest = function (spec, name, desc) {
        tcuTestCase.DeqpTest.call(this, name, desc, spec);

        /** @type {WebGL2RenderingContext} */ this.m_renderCtx = gl;

        /** @type {sglrReferenceContext.ReferenceContextBuffers} */ this.m_refBuffers = null;
        /** @type {sglrReferenceContext.ReferenceContext} */ this.m_refContext = null;
        /** @type {sglrGLContext.GLContext} */ this.m_glesContext = null;

        /** @type {AttributePack} */ this.m_glArrayPack = null;
        /** @type {AttributePack} */ this.m_rrArrayPack = null;

        /** @type {number} */ this.m_maxDiffRed = -1;
        /** @type {number} */ this.m_maxDiffGreen = -1;
        /** @type {number} */ this.m_maxDiffBlue = -1;

        /** @type {Array<glsDrawTests.DrawTestSpec>} */ this.m_specs = [];
        /** @type {Array<string> */this.m_iteration_descriptions = [];
        /** @type {number} */ this.m_iteration = 0;
        ///** @type {tcu::ResultCollector} */ this.m_result(testCtx.getLog(), "Iteration result: ");

        if (spec)
            this.addIteration(spec);
    };

    glsDrawTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    glsDrawTests.prototype.constructor = glsDrawTests.DrawTest;

    /**
     * @param {sglrReferenceContext.ReferenceContext | sglrGLContext.GLContext} drawContext
     * @param {Array<number>} screenSize (2 positive elements in array)
     * @param {boolean} useVao
     * @param {boolean} logEnabled
     * @constructor
     */
    glsDrawTests.AttributePack = function (drawContext, screenSize, useVao, logEnabled) {
        /** @type {sglrReferenceContext.ReferenceContext | sglrGLContext.GLContext} */ this.m_ctx = drawContext;

        /** @type {Array<glsDrawTests.AttributeArray>} */ this.m_arrays;
        /** @type {sglrShaderProgram.ShaderProgram} */ this.m_program;
        /** @type {tcuSurface.Surface} */ this.m_screen = null;
        /** @type {boolean} */ this.m_useVao = useVao;
        /** @type {boolean} */ this.m_logEnabled = logEnabled;
        /** @type {!WebGLProgram | sglrShaderProgram.ShaderProgram} */ this.m_programID = 0;
        /** @type {number} (32-bit) */ this.m_vaoID = 0;

        if (this.m_useVao)
            this.m_vaoID = this.m_ctx.createVertexArray();
    };

    /**
     * @param {number} i
     * @return {glsDrawTests.AttributeArray}
     */
    glsDrawTests.AttributePack.prototype.getArray = function (i) {
        return this.m_arrays[i];
    };

    /**
     * @return number
     */
    glsDrawTests.AttributePack.prototype.getArrayCount = function () {
        return this.m_arrays.length;
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.Storage} storage
     */
    glsDrawTests.AttributePack.prototype.newArray = function (storage) {
        this.m_arrays.push(new glsDrawTests.AttributeArray(storage, this.m_ctx));
    };

    /**
     * clearArrays
     */
    glsDrawTests.AttributePack.clearArrays = function () {
        this.m_arrays.length = 0;
    };

    /**
     * updateProgram
     */
    glsDrawTests.AttributePack.updateProgram = function () {
        if (this.m_programID)
            this.m_ctx.deleteProgram(this.m_programID);

        this.m_program = new glsDrawTests.DrawTestShaderProgram(this.m_arrays);
        this.m_programID = this.m_ctx.createProgram(this.m_program);
    };

    /**
     * @param {glsDrawTests.DrawTestSpec.Primitive} primitive
     * @param {glsDrawTests.DrawTestSpec.DrawMethod} drawMethod
     * @param {number} firstVertex
     * @param {number} vertexCount
     * @param {glsDrawTests.DrawTestSpec.IndexType} indexType
     * @param {number} indexOffset
     * @param {number} rangeStart
     * @param {number} rangeEnd
     * @param {number} instanceCount
     * @param {number} indirectOffset
     * @param {number} baseVertex
     * @param {number} coordScale
     * @param {number} colorScale
     * @param {glsDrawTests.AttributeArray} indexArray
     */
    glsDrawTests.AttributePack.prototype.render = function (primitive, drawMethod, firstVertex, vertexCount, indexType,
        indexOffset, rangeStart, rangeEnd, instanceCount, indirectOffset, baseVertex, coordScale, colorScale, indexArray) {
        assertMsgOptions(this.m_program != null, 'Program is null', false, true);
        assertMsgOptions(this.m_programID != null, 'No context created program', false, true);

        this.m_ctx.viewport(0, 0, this.m_screen.getWidth(), this.m_screen.getHeight());
        this.m_ctx.clearColor(0.0, 0.0, 0.0, 1.0);
        this.m_ctx.clear(gl.COLOR_BUFFER_BIT);

        this.m_ctx.useProgram(this.m_programID);

        this.m_ctx.uniform1f(this.m_ctx.getUniformLocation(this.m_programID, "u_coordScale"), coordScale);
        this.m_ctx.uniform1f(this.m_ctx.getUniformLocation(this.m_programID, "u_colorScale"), colorScale);

        if (this.m_useVao)
            this.m_ctx.bindVertexArray(this.m_vaoID);

        if (indexArray)
            indexArray.bindIndexArray(glsDrawTests.DrawTestSpec.Target.ELEMENT_ARRAY);

        for (var arrayNdx = 0; arrayNdx < this.m_arrays.length; arrayNdx++) {
            var attribName = '';
            attribName += "a_" + arrayNdx;

            var loc = this.m_ctx.getAttribLocation(this.m_programID, attribName);

            if (this.m_arrays[arrayNdx].isBound())
                this.m_ctx.enableVertexAttribArray(loc);

            this.m_arrays[arrayNdx].bindAttribute(loc);
        }

        if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS)
            this.m_ctx.drawArrays(glsDrawTests.glsDrawTests.primitiveToGL(primitive), firstVertex, vertexCount);
        else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWARRAYS_INSTANCED)
            this.m_ctx.drawArraysInstanced(glsDrawTests.primitiveToGL(primitive), firstVertex, vertexCount, instanceCount);
        else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS)
            this.m_ctx.drawElements(glsDrawTests.primitiveToGL(primitive), vertexCount, glsDrawTests.indexTypeToGL(indexType), indexOffset);
        else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_RANGED)
            this.m_ctx.drawRangeElements(glsDrawTests.primitiveToGL(primitive), rangeStart, rangeEnd, vertexCount, glsDrawTests.indexTypeToGL(indexType), indexOffset);
        else if (drawMethod == glsDrawTests.DrawTestSpec.DrawMethod.DRAWELEMENTS_INSTANCED)
            this.m_ctx.drawElementsInstanced(glsDrawTests.primitiveToGL(primitive), vertexCount, glsDrawTests.indexTypeToGL(indexType), indexOffset, instanceCount);
        else
            throw new Error('Invalid draw method');

        for (var arrayNdx = 0; arrayNdx < this.m_arrays.length; arrayNdx++) {
            if (this.m_arrays[arrayNdx].isBound()) {
                var attribName = '';
                attribName += "a_" + arrayNdx;

                var loc = this.m_ctx.getAttribLocation(this.m_programID, attribName);

                this.m_ctx.disableVertexAttribArray(loc);
            }
        }

        if (this.m_useVao)
            this.m_ctx.bindVertexArray(null);

        this.m_ctx.useProgram(null);
        this.m_ctx.readPixels(this.m_screen, 0, 0, this.m_screen.getWidth(), this.m_screen.getHeight());
    };
});
