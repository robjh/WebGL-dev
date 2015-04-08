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

define([
    'framework/common/tcuTestCase',
    'framework/common/tcuRGBA',
    'framework/common/tcuFloat',
    'framework/common/tcuSurface',
    'framework/common/tcuImageCompare',
    'framework/opengl/gluShaderUtil',
    'framework/opengl/simplereference/sglrReferenceContext',
    'framework/opengl/simplereference/sglrShaderProgram',
    'framework/delibs/debase/deMath',
    'framework/delibs/debase/deRandom',
    'framework/referencerenderer/rrVertexAttrib',
    'framework/referencerenderer/rrVertexPacket',
    'framework/referencerenderer/rrGenericVector'],
    function (
        tcuTestCase,
        tcuRGBA,
        tcuFloat,
        tcuSurface,
        tcuImageCompare,
        gluShaderUtil,
        sglrReferenceContext,
        sglrShaderProgram,
        deMath,
        deRandom,
        rrVertexAttrib,
        rrVertexPacket,
        rrGenericVector
    ) {
    'use strict';

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    var GLU_EXPECT_NO_ERROR = function(x, msg) {
        if (x) //error
            throw new Error(msg);
    };

    var TCU_FAIL = function(msg) {
        testFailedOptions(msg, true);
    };

    var DE_NULL = null;

    /**
     * @interface
     */
    var deArray = function() {};

    /**
     * deArray.Target enum
     * @enum
     */
    deArray.Target = {
        ELEMENT_ARRAY: 0,
        ARRAY: 1
    };

    /**
     * deArray.InputType enum
     * @enum
     */
    deArray.InputType = {
        FLOAT: 0,
        FIXED: 1,
        DOUBLE: 2,

        BYTE: 3,
        SHORT: 4,

        UNSIGNED_BYTE: 5,
        UNSIGNED_SHORT: 6,

        INT: 7,
        UNSIGNED_INT: 8,
        HALF: 9,
        UNSIGNED_INT_2_10_10_10: 10,
        INT_2_10_10_10: 11
    };

    /**
     * deArray.OutputType enum
     * @enum
     */
    deArray.OutputType = {
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
     * deArray.Usage enum
     * @enum
     */
    deArray.Usage = {
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
     * deArray.Storage enum
     * @enum
     */
    deArray.Storage = {
        USER: 0,
        BUFFER: 1
    };

    /**
     * deArray.Primitive enum
     * @enum
     */
    deArray.Primitive = {
        POINTS: 0,
        TRIANGLES: 1,
        TRIANGLE_FAN: 2,
        TRIANGLE_STRIP: 3
    };

    //deArray static functions

    /**
     * @param {deArray.Target} target
     * @return {string}
     */
    deArray.targetToString = function (target) {
        DE_ASSERT(target < Object.keys(deArray.Target).length);

        /** @type {Array.<string>} */ var targets =
        [
            "element_array",  // deArray.Target.ELEMENT_ARRAY
            "array"           // deArray.Target.ARRAY
        ];
        DE_ASSERT(targets.length == Object.keys(deArray.Target).length);

        return targets[target];
    };

    /**
     * @param {deArray.InputType} type
     * @return {string}
     */
    deArray.inputTypeToString = function (type) {
        DE_ASSERT(type < Object.keys(deArray.InputType).length);

        /** @type {Array.<string>} */ var types =
        [
            "float",          // deArray.InputType.FLOAT
            "fixed",          // deArray.InputType.FIXED
            "double",         // deArray.InputType.DOUBLE

            "byte",           // deArray.InputType.BYTE
            "short",          // deArray.InputType.SHORT

            "unsigned_byte",  // deArray.InputType.UNSIGNED_BYTE
            "unsigned_short", // deArray.InputType.UNSIGNED_SHORT

            "int",                    // deArray.InputType.INT
            "unsigned_int",           // deArray.InputType.UNSIGNED_INT
            "half",                   // deArray.InputType.HALF
            "usigned_int2_10_10_10",  // deArray.InputType.UNSIGNED_INT_2_10_10_10
            "int2_10_10_10"           // deArray.InputType.INT_2_10_10_10
        ];
        DE_ASSERT(types.length == Object.keys(deArray.InputType).length);

        return types[type];
    };

    /**
     * @param {deArray.OutputType} type
     * @return {string}
     */
    deArray.outputTypeToString = function (type) {
        DE_ASSERT(type < Object.keys(deArray.OutputType).length);

        /** @type {Array.<string>} */ var types =
        [
            "float",       // deArray.OutputType.FLOAT
            "vec2",        // deArray.OutputType.VEC2
            "vec3",        // deArray.OutputType.VEC3
            "vec4",        // deArray.OutputType.VEC4

            "int",         // deArray.OutputType.INT
            "uint",        // deArray.OutputType.UINT

            "ivec2",       // deArray.OutputType.IVEC2
            "ivec3",       // deArray.OutputType.IVEC3
            "ivec4",       // deArray.OutputType.IVEC4

            "uvec2",       // deArray.OutputType.UVEC2
            "uvec3",       // deArray.OutputType.UVEC3
            "uvec4"        // deArray.OutputType.UVEC4
        ];
        DE_ASSERT(types.length == Object.keys(deArray.OutputType).length);

        return types[type];
    };

    /**
     * @param {deArray.Usage} usage
     * @return {string}
     */
    deArray.usageTypeToString = function (usage) {
        DE_ASSERT(usage < Object.keys(deArray.Usage).length);

        /** @type {Array.<string>} */ var usages =
        [
            "dynamic_draw", // deArray.Usage.DYNAMIC_DRAW
            "static_draw",  // deArray.Usage.STATIC_DRAW
            "stream_draw",  // deArray.Usage.STREAM_DRAW

            "stream_read",  // deArray.Usage.STREAM_READ
            "stream_copy",  // deArray.Usage.STREAM_COPY

            "static_read",  // deArray.Usage.STATIC_READ
            "static_copy",  // deArray.Usage.STATIC_COPY

            "dynamic_read", // deArray.Usage.DYNAMIC_READ
            "dynamic_copy"  // deArray.Usage.DYNAMIC_COPY
        ];
        DE_ASSERT(usages.length == Object.keys(deArray.Usage).length);

        return usages[usage];
    };

    /**
     * @param {deArray.Storage} storage
     * @return {string}
     */
    deArray.storageToString = function (storage) {
        DE_ASSERT(storage < Object.keys(deArray.Storage).length);

        /** @type {Array.<string>} */ var storages =
        [
            "user_ptr", // deArray.Storage.USER
            "buffer"    // deArray.Storage.BUFFER
        ];
        DE_ASSERT(storages.length == Object.keys(deArray.Storage).length);

        return storages[storage];
    };

    /**
     * @param {deArray.Primitive} primitive
     * @return {string}
     */
    deArray.primitiveToString = function (primitive) {
        DE_ASSERT(primitive < Object.keys(deArray.Primitive).length);

        /** @type {Array.<string>} */ var primitives =
        [
            "points",          // deArray.Primitive.POINTS
            "triangles",       // deArray.Primitive.TRIANGLES
            "triangle_fan",    // deArray.Primitive.TRIANGLE_FAN
            "triangle_strip"   // deArray.Primitive.TRIANGLE_STRIP
        ];
        DE_ASSERT(primitives.length == Object.keys(deArray.Primitive).length);

        return primitives[primitive];
    };

    /**
     * @param {deArray.InputType} type
     * @return {number}
     */
    deArray.inputTypeSize = function (type) {
        DE_ASSERT(type < Object.keys(deArray.InputType).length);

        /** @type {Array.<number>} */ var size =
        [
            4,     // deArray.InputType.FLOAT
            4,     // deArray.InputType.FIXED
            8,     // deArray.InputType.DOUBLE

            8,     // deArray.InputType.BYTE
            16,    // deArray.InputType.SHORT

            8,     // deArray.InputType.UNSIGNED_BYTE
            16,    // deArray.InputType.UNSIGNED_SHORT

            32,    // deArray.InputType.INT
            32,    // deArray.InputType.UNSIGNED_INT
            16,    // deArray.InputType.HALF
            32 / 4,// deArray.InputType.UNSIGNED_INT_2_10_10_10
            32 / 4 // deArray.InputType.INT_2_10_10_10
        ];
        DE_ASSERT(size.length == Object.keys(deArray.InputType).length);

        return size[type];
    };

    /**
     * @param {deArray.InputType} type
     * @return {boolean}
     */
    var inputTypeIsFloatType = function (type) {
        if (type == deArray.InputType.FLOAT)
            return true;
        if (type == deArray.InputType.FIXED)
            return true;
        if (type == deArray.InputType.DOUBLE)
            return true;
        if (type == deArray.InputType.HALF)
            return true;
        return false;
    };

    /**
     * @param {deArray.OutputType} type
     * @return {boolean}
     */
    var outputTypeIsFloatType = function (type) {
        if (type == deArray.OutputType.FLOAT
            || type == deArray.OutputType.VEC2
            || type == deArray.OutputType.VEC3
            || type == deArray.OutputType.VEC4)
            return true;

        return false;
    };

    //deArray member functions (all virtual, since this is an interface)

    /**
     * @param {deArray.Target} target
     * @param {number} size
     * @param {Uint8Array} data
     * @param {deArray.Usage} usage
     */
    deArray.prototype.data = function (target, size, data, usage) {};

    /**
     * @param {deArray.Target} target
     * @param {number} offset
     * @param {number} size
     * @param {Uint8Array} data
     */
    deArray.prototype.subdata = function (target, offset, size, data) {};

    /**
     * @param {number} attribNdx
     * @param {number} offset
     * @param {number} size
     * @param {deArray.InputType} inType
     * @param {deArray.OutputType} outType
     * @param {boolean} normalized
     * @param {number} stride
     */
    deArray.prototype.bind = function (attribNdx, offset, size, inType, outType, normalized, stride) {};

    /**
     * unBind
     */
    deArray.prototype.unBind = function () {};

    /**
     * @return {boolean}
     */
    deArray.prototype.isBound = function () {};

    /**
     * @return {number}
     */
    deArray.prototype.getComponentCount = function () {};

    /**
     * @return {deArray.Target}
     */
    deArray.prototype.getTarget = function () {};

    /**
     * @return {deArray.InputType}
     */
    deArray.prototype.getInputType = function () {};

    /**
     * @return {deArray.OutputType}
     */
    deArray.prototype.getOutputType = function () {};

    /**
     * @return {deArray.Storage}
     */
    deArray.prototype.getStorageType = function () {};

    /**
     * @return {boolean}
     */
    deArray.prototype.getNormalized = function () {};

    /**
     * @return {number}
     */
    deArray.prototype.getStride = function () {};

    /**
     * @return {number}
     */
    deArray.prototype.getAttribNdx = function () {};

    /**
     * @param {number} attribNdx
     */
    deArray.prototype.setAttribNdx = function (attribNdx) {};

    //ContextArray class, implements deArray interface

    /**
     * @constructor
     * @implements {deArray}
     * @param {deArray.Storage} storage
     * @param {ReferenceRasterizerContext} context
     */
    var ContextArray = function (storage, context) {
        /** @type {deArray.Storage} */ this.m_storage = storage;
        /** @type {ReferenceRasterizerContext} */ this.m_ctx = context;
        /** @type {deMath.deUint32} */ this.m_glBuffer = 0;

        /** @type {boolean} */ this.m_bound = false;
        /** @type {number} */ this.m_attribNdx = 0;
        /** @type {number} */ this.m_size = 0;
        /** @type {Uint8Array} */ this.m_data = DE_NULL;
        /** @type {number} */ this.m_componentCount = 1;
        /** @type {deArray.Target} */ this.m_target = deArray.Target.ARRAY;
        /** @type {deArray.InputType} */ this.m_inputType = deArray.InputType.FLOAT;
        /** @type {deArray.OutputType} */ this.m_outputType = deArray.OutputType.FLOAT;
        /** @type {boolean} */ this.m_normalize = false;
        /** @type {number} */ this.m_stride = 0;
        /** @type {number} */ this.m_offset = 0;

        if (this.m_storage == deArray.Storage.BUFFER) {
            this.m_glBuffer = this.m_ctx.genBuffers(1)[0];
            GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.genBuffers()");
        }
    };

    // ContextArray member functions

    /**
     * unBind
     */
    ContextArray.prototype.unBind = function () { this.m_bound = false; };

    /**
     * @return {boolean}
     */
    ContextArray.prototype.isBound = function () { return this.m_bound; };

    /**
     * @return {number}
     */
    ContextArray.prototype.getComponentCount = function () { return this.m_componentCount; };

    /**
     * @return {deArray.Target}
     */
    ContextArray.prototype.getTarget = function () { return this.m_target; };

    /**
     * @return {deArray.InputType}
     */
    ContextArray.prototype.getInputType = function () { return this.m_inputType; };

    /**
     * @return {deArray.OutputType}
     */
    ContextArray.prototype.getOutputType = function () { return this.m_outputType; };

    /**
     * @return {deArray.Storage}
     */
    ContextArray.prototype.getStorageType = function () { return this.m_storage; };

    /**
     * @return {boolean}
     */
    ContextArray.prototype.getNormalized = function () { return this.m_normalize; };

    /**
     * @return {number}
     */
    ContextArray.prototype.getStride = function () { return this.m_stride; };

    /**
     * @return {number}
     */
    ContextArray.prototype.getAttribNdx = function () { return this.m_attribNdx; };

    /**
     * @param {number} attribNdx
     */
    ContextArray.prototype.setAttribNdx = function (attribNdx) { this.m_attribNdx = attribNdx; };

    /**
     * @param {deArray.Target} target
     * @param {number} size
     * @param {Uint8Array} ptr
     * @param {deArray.Usage} usage
     */
    ContextArray.prototype.data = function (target, size, ptr, usage) {
        this.m_size = size;
        this.m_target = target;

        if (this.m_storage == deArray.Storage.BUFFER) {
            this.m_ctx.bindBuffer(ContextArray.targetToGL(target), this.m_glBuffer);
            GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.bindBuffer()");

            this.m_ctx.bufferData(ContextArray.targetToGL(target), size, ptr, ContextArray.usageToGL(usage));
            GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.bufferData()");
        }
        else if (this.m_storage == deArray.Storage.USER) {
            this.m_data = new Uint8Array(size);
            for(var i = 0; i < size; i++)
                this.m_data[i] = ptr[i];
        }
        else
            throw new Error('ContextArray.prototype.data - Invalid storage type specified');
    };

    /**
     * @param {deArray.Target} target
     * @param {number} offset
     * @param {number} size
     * @param {Uint8Array} ptr
     */
    ContextArray.prototype.subdata =function (target, offset, size, ptr) {
        this.m_target = target;

        if (this.m_storage == deArray.Storage.BUFFER) {
            this.m_ctx.bindBuffer(ContextArray.targetToGL(target), this.m_glBuffer);
            GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.bindBuffer()");

            this.m_ctx.bufferSubData(ContextArray.targetToGL(target), offset, size, ptr);
            GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.bufferSubData()");
        }
        else if (this.m_storage == deArray.Storage.USER)
            for(var i = offset; i < size; i++)
                this.m_data[i] = ptr[i];
        else
            throw new Error('ContextArray.prototype.subdata - Invalid storage type specified');
    };

    /**
     * @param {number} attribNdx
     * @param {number} offset
     * @param {number} size
     * @param {deArray.InputType} inType
     * @param {deArray.OutputType} outType
     * @param {boolean} normalized
     * @param {number} stride
     */
    ContextArray.prototype.bind = function (attribNdx, offset, size, inType, outType, normalized, stride) {
        this.m_attribNdx         = attribNdx;
        this.m_bound             = true;
        this.m_componentCount    = size;
        this.m_inputType         = inType;
        this.m_outputType        = outType;
        this.m_normalize         = normalized;
        this.m_stride            = stride;
        this.m_offset            = offset;
    };

    /**
     * @param {deArray.Target} target
     */
    ContextArray.prototype.bindIndexArray = function (target) {
        if (this.m_storage == deArray.Storage.USER) {
        }
        else if (this.m_storage == deArray.Storage.BUFFER)
        {
            this.m_ctx.bindBuffer(ContextArray.targetToGL(target), this.m_glBuffer);
        }
    };

    /**
     * @param {number} loc
     */
    ContextArray.prototype.glBind = function (loc) {
        if (this.m_storage == deArray.Storage.BUFFER)
        {
            this.m_ctx.bindBuffer(ContextArray.targetToGL(this.m_target), this.m_glBuffer);
            GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.bindBuffer()");

            if (!inputTypeIsFloatType(this.m_inputType))
            {
                // Input is not float type

                if (outputTypeIsFloatType(this.m_outputType))
                {
                    // Output type is float type
                    this.m_ctx.vertexAttribPointer(loc, this.m_componentCount, ContextArray.inputTypeToGL(this.m_inputType), this.m_normalize, this.m_stride, this.m_offset);
                    GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.vertexAttribPointer()");
                }
                else
                {
                    // Output type is int type
                    this.m_ctx.vertexAttribIPointer(loc, this.m_componentCount, ContextArray.inputTypeToGL(this.m_inputType), this.m_stride, this.m_offset);
                    GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.vertexAttribPointer()");
                }
            }
            else
            {
                // Input type is float type

                // Output type must be float type
                DE_ASSERT(this.m_outputType == deArray.OutputType.FLOAT || this.m_outputType == deArray.OutputType.VEC2 || this.m_outputType == deArray.OutputType.VEC3 || this.m_outputType == deArray.OutputType.VEC4);

                this.m_ctx.vertexAttribPointer(loc, this.m_componentCount, ContextArray.inputTypeToGL(this.m_inputType), this.m_normalize, this.m_stride, this.m_offset);
                GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.vertexAttribPointer()");
            }

            this.m_ctx.bindBuffer(ContextArray.targetToGL(this.m_target), 0);
        }
        else if (this.m_storage == deArray.Storage.USER) {
            this.m_ctx.bindBuffer(ContextArray.targetToGL(this.m_target), 0);
            GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.bindBuffer()");

            if (!inputTypeIsFloatType(this.m_inputType)) {
                // Input is not float type

                if (outputTypeIsFloatType(this.m_outputType)) {
                    // Output type is float type
                    this.m_ctx.vertexAttribPointer(loc, this.m_componentCount, ContextArray.inputTypeToGL(this.m_inputType), this.m_normalize, this.m_stride, this.m_data.subarray(this.m_offset));
                    GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.vertexAttribPointer()");
                }
                else {
                    // Output type is int type
                    this.m_ctx.vertexAttribIPointer(loc, this.m_componentCount, ContextArray.inputTypeToGL(this.m_inputType), this.m_stride, this.m_data.subarray(this.m_offset));
                    GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.vertexAttribIPointer()");
                }
            }
            else {
                // Input type is float type

                // Output type must be float type
                DE_ASSERT(this.m_outputType == deArray.OutputType.FLOAT || this.m_outputType == deArray.OutputType.VEC2 || this.m_outputType == deArray.OutputType.VEC3 || this.m_outputType == deArray.OutputType.VEC4);

                this.m_ctx.vertexAttribPointer(loc, this.m_componentCount, ContextArray.inputTypeToGL(this.m_inputType), this.m_normalize, this.m_stride, this.m_data.subarray(this.m_offset));
                GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.vertexAttribPointer()");
            }
        }
        else
            throw new Error("ContextArray.prototype.glBind - Invalid storage type specified");
    };

    //ContextArray static functions

    /**
     * @param {deArray.Target} target
     * @return {GLenum}
     */
    ContextArray.targetToGL = function (target) {
        DE_ASSERT(target < Object.keys(deArray.Target).length);

        /** @type {Array.<GLenum>} */ var targets =
        [
            gl.ELEMENT_ARRAY_BUFFER,    // deArray.Target.ELEMENT_ARRAY
            gl.ARRAY_BUFFER             // deArray.Target.ARRAY
        ];

        return targets[target];
    };

    /**
     * @param {deArray.Usage} usage
     * @return {GLenum}
     */
    ContextArray.usageToGL = function (usage) {
        DE_ASSERT(usage < Object.keys(deArray.Usage).length);

        /** @type {Array.<GLenum>} */ var usages =
        [
            gl.DYNAMIC_DRAW,    // deArray.Usage.DYNAMIC_DRAW
            gl.STATIC_DRAW,     // deArray.Usage.STATIC_DRAW
            gl.STREAM_DRAW,     // deArray.Usage.STREAM_DRAW

            gl.STREAM_READ,     // deArray.Usage.STREAM_READ
            gl.STREAM_COPY,     // deArray.Usage.STREAM_COPY

            gl.STATIC_READ,     // deArray.Usage.STATIC_READ
            gl.STATIC_COPY,     // deArray.Usage.STATIC_COPY

            gl.DYNAMIC_READ,    // deArray.Usage.DYNAMIC_READ
            gl.DYNAMIC_COPY     // deArray.Usage.DYNAMIC_COPY
        ];
        DE_ASSERT(usages.length == Object.keys(deArray.Usage).length);

        return usages[usage];
    };

    /**
     * @param {deArray.InputType} type
     * @return {GLenum}
     */
    ContextArray.inputTypeToGL = function (type) {
        DE_ASSERT(type < Object.keys(deArray.InputType).length);

        /** @type {Array.<GLenum>} */ var types =
        [
            gl.FLOAT,               // deArray.InputType.FLOAT
            gl.FIXED,               // deArray.InputType.FIXED
            gl.DOUBLE,              // deArray.InputType.DOUBLE
            gl.BYTE,                // deArray.InputType.BYTE
            gl.SHORT,               // deArray.InputType.SHORT
            gl.UNSIGNED_BYTE,       // deArray.InputType.UNSIGNED_BYTE
            gl.UNSIGNED_SHORT,      // deArray.InputType.UNSIGNED_SHORT

            gl.INT,                 // deArray.InputType.INT
            gl.UNSIGNED_INT,        // deArray.InputType.UNSIGNED_INT
            gl.HALF_FLOAT,          // deArray.InputType.HALF
            gl.UNSIGNED_INT_2_10_10_10_REV, // deArray.InputType.UNSIGNED_INT_2_10_10_10
            gl.INT_2_10_10_10_REV           // deArray.InputType.INT_2_10_10_10
        ];
        DE_ASSERT(types.length == Object.keys(deArray.InputType).length);

        return types[type];
    };

    /**
     * @param {deArray.OutputType} type
     * @return {string}
     */
    ContextArray.outputTypeToGLType = function (type) {
        DE_ASSERT(type < Object.keys(deArray.OutputType).length);

        /** @type {Array.<string>} */ var types =
        [
            "float",        // deArray.OutputType.FLOAT
            "vec2",         // deArray.OutputType.VEC2
            "vec3",         // deArray.OutputType.VEC3
            "vec4",         // deArray.OutputType.VEC4

            "int",          // deArray.OutputType.INT
            "uint",         // deArray.OutputType.UINT

            "ivec2",        // deArray.OutputType.IVEC2
            "ivec3",        // deArray.OutputType.IVEC3
            "ivec4",        // deArray.OutputType.IVEC4

            "uvec2",        // deArray.OutputType.UVEC2
            "uvec3",        // deArray.OutputType.UVEC3
            "uvec4"         // deArray.OutputType.UVEC4
        ];
        DE_ASSERT(types.length == Object.keys(deArray.OutputType).length);

        return types[type];
    };

    /**
     * @param {deArray.Primitive} primitive
     * @return {GLenum}
     */
    ContextArray.primitiveToGL = function (primitive) {
        /** @type {Array.<GLenum>} */ var primitives =
        [
            gl.POINTS,          // deArray.Primitive.POINTS
            gl.TRIANGLES,       // deArray.Primitive.TRIANGLES
            gl.TRIANGLE_FAN,    // deArray.Primitive.TRIANGLE_FAN
            gl.TRIANGLE_STRIP   // deArray.Primitive.TRIANGLE_STRIP
        ];
        DE_ASSERT(primitives.length == Object.keys(deArray.Primitive).length);

        return primitives[primitive];
    };

    /**
     * @constructor
     * @param {WebGLRenderingContextBase} renderCtx
     * @param {ReferenceRasterizerContext} drawContext
     */
    var ContextArrayPack = function(renderCtx, drawContext) {
        /** @type {WebGLRenderingContextBase} */ this.m_renderCtx = renderCtx;
        //TODO: Reference rasterizer implementation.
        /** @type {GLContext} */ this.m_ctx = drawContext;

        /** @type {Array.<ContextArray>} */ this.m_arrays = [];
        /** @type {ShaderProgram} */ this.m_program = DE_NULL;
        /** @type {tcuSurface.Surface} */ this.m_screen = new tcuSurface.Surface(
            Math.min(512, canvas.width),
            Math.min(512, canvas.height)
        );
    };

    /**
     * @return {number}
     */
    ContextArrayPack.prototype.getArrayCount = function () {
        return this.m_arrays.length;
    };

    /**
     * @param {deArray.Storage} storage
     */
    ContextArrayPack.prototype.newArray = function (storage) {
        this.m_arrays.push(new ContextArray(storage, this.m_ctx));
    };

    /**
     * @param {number} i
     * @return {ContextArray}
     */
    ContextArrayPack.prototype.getArray = function (i) {
        return this.m_arrays[i];
    };

    /**
     * updateProgram
     */
    ContextArrayPack.prototype.updateProgram = function () {
        this.m_program = new ContextShaderProgram(this.m_renderCtx, this.m_arrays);
    };

    /**
     * @param {deArray.Primitive} primitive
     * @param {number} firstVertex
     * @param {number} vertexCount
     * @param {boolean} useVao
     * @param {number} coordScale
     * @param {number} colorScale
     */
    ContextArrayPack.prototype.render = function (primitive, firstVertex, vertexCount, useVao, coordScale, colorScale) {
        /** @type {number} */ var program = 0;
        /** @type {number} */ var vaoId = 0;

        this.updateProgram();

        this.m_ctx.viewport(0, 0, this.m_screen.getWidth(), this.m_screen.getHeight());
        this.m_ctx.clearColor(0.0, 0.0, 0.0, 1.0);
        this.m_ctx.clear(gl.COLOR_BUFFER_BIT);

        program = this.m_ctx.createProgram(this.m_program);

        this.m_ctx.useProgram(program);
        GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.useProgram()");

        this.m_ctx.uniform1f(this.m_ctx.getUniformLocation(program, "u_coordScale"), coordScale);
        this.m_ctx.uniform1f(this.m_ctx.getUniformLocation(program, "u_colorScale"), colorScale);

        if (useVao) {
            var vaoID = this.m_ctx.genVertexArrays(1, vaoId);
            this.m_ctx.bindVertexArray(vaoId);
        }

        for (var arrayNdx = 0; arrayNdx < this.m_arrays.length; arrayNdx++) {
            if (this.m_arrays[arrayNdx].isBound()) {
                /** @type {string} */ var attribName;
                attribName = 'a_' + this.m_arrays[arrayNdx].getAttribNdx();

                /** @type {number} */ var loc = this.m_ctx.getAttribLocation(program, attribName);
                this.m_ctx.enableVertexAttribArray(loc);
                GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.enableVertexAttribArray()");

                this.m_arrays[arrayNdx].glBind(loc);
            }
        }

        DE_ASSERT((firstVertex % 6) == 0);
        this.m_ctx.drawArrays(ContextArray.primitiveToGL(primitive), firstVertex, vertexCount - firstVertex);
        GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.drawArrays()");

        for (var arrayNdx = 0; arrayNdx < this.m_arrays.length; arrayNdx++) {
            if (this.m_arrays[arrayNdx].isBound()) {
                /** @type {string} */ var attribName;
                attribName = "a_" + this.m_arrays[arrayNdx].getAttribNdx();

                /** @type {number} */ var loc = this.m_ctx.getAttribLocation(program, attribName);

                this.m_ctx.disableVertexAttribArray(loc);
                GLU_EXPECT_NO_ERROR(this.m_ctx.getError(), "gl.disableVertexAttribArray()");
            }
        }

        if (useVao)
            vaoID = this.m_ctx.deleteVertexArrays(1, vaoId);

        this.m_ctx.deleteProgram(program);
        this.m_ctx.useProgram(0);
        this.m_ctx.readPixels(this.m_screen, 0, 0, this.m_screen.getWidth(), this.m_screen.getHeight());
    };

    /**
     * @return {tcuSurface.Surface}
     */
    ContextArrayPack.prototype.getSurface = function () { return this.m_screen; };

    /**
     * ContextShaderProgram class
     * @constructor
     * @extends {sglrShaderProgram.ShaderProgram}
     //* @param {GLRenderContext} ctx
     * @param {Array.<ContextArray>} arrays
     */
    var ContextShaderProgram = function (/*ctx,*/ arrays) {
        sglrShaderProgram.ShaderProgram.call(this, this.createProgramDeclaration(/*ctx,*/ arrays));
        this.m_componentCount = new Array(arrays.length);
        /** @type {Array.<rrGenericVector.GenericVecType>} */ this.m_attrType = new Array(arrays.length);

        for(var arrayNdx = 0; arrayNdx < arrays.length; arrayNdx++)
        {
            this.m_componentCount[arrayNdx] = this.getComponentCount(arrays[arrayNdx].getOutputType());
            this.m_attrType[arrayNdx] = this.mapOutputType(arrays[arrayNdx].getOutputType());
        }
    };

    ContextShaderProgram.prototype = Object.create(sglrShaderProgram.ShaderProgram.prototype);
    ContextShaderProgram.prototype.constructor = ContextShaderProgram;

    /**
     * calcShaderColorCoord function
     * @param {Array.<number>} coord (2 elements)
     * @param {Array.<number>} color (3 elements)
     * @param {Array.<number>} attribValue (4 elements)
     * @param {boolean} isCoordinate
     * @param {number} numComponents
     */
    var calcShaderColorCoord = function (coord, color, attribValue, isCoordinate, numComponents) {
        if (isCoordinate)
            switch (numComponents) {
                case 1: coord = [attribValue[0], attribValue[0]]; break;
                case 2: coord = [attribValue[0], attribValue[1]]; break;
                case 3: coord = [attribValue[0] + attribValue[2], attribValue[1]]; break;
                case 4: coord = [attribValue[0] + attribValue[2], attribValue[1] + attribValue[3]]; break;

                default:
                    throw new Error('calcShaderColorCoord - Invalid number of components');
            }
        else
        {
            switch (numComponents) {
                case 1:
                    color[0] = color[0] * attribValue[0];
                    break;

                case 2:
                    color[0] = color[0] * attribValue[0];
                    color[1] = color[1] * attribValue[1];
                    break;

                case 3:
                    color[0] = color[0] * attribValue[0];
                    color[1] = color[1] * attribValue[1];
                    color[2] = color[2] * attribValue[2];
                    break;

                case 4:
                    color[0] = color[0] * attribValue[0] * attribValue[3];
                    color[1] = color[1] * attribValue[1] * attribValue[3];
                    color[2] = color[2] * attribValue[2] * attribValue[3];
                    break;

                default:
                    throw new Error('calcShaderColorCoord - Invalid number of components');
            }
        }
    };

    /**
     * ContextShaderProgram.shadeVertices
     * @param {Array.<rrVertexAttrib.VertexAttrib>} inputs
     * @param {Array.<rrVertexPacket.VertexPacket>} packets
     * @param {number} numPackets
     */
    ContextShaderProgram.prototype.shadeVertices = function (inputs, packets, numPackets) {
        /** @type {number} */ var u_coordScale = this.getUniformByName("u_coordScale").value;
        /** @type {number} */ var u_colorScale = this.getUniformByName("u_colorScale").value;

        for (var packetNdx = 0; packetNdx < numPackets; ++packetNdx) {
            /** @type {number} */ var varyingLocColor = 0;

            /** @type {rrVertexPacket.VertexPacket} */ var packet = packets[packetNdx];

            // Calc output color
            /** @type {Array.<number>} */ var coord = [1.0, 1.0];
            /** @type {Array.<number>} */ var color = [1.0, 1.0, 1.0];

            for (var attribNdx = 0; attribNdx < this.m_attrType.length; attribNdx++) {
                /** @type {number} */ var numComponents = this.m_componentCount[attribNdx];

                calcShaderColorCoord(coord, color, rrVertexAttrib.readVertexAttrib(inputs[attribNdx], packet.instanceNdx, packet.vertexNdx, this.m_attrType[attribNdx]), attribNdx == 0, numComponents);
            }

            // Transform position
            packet.position = [u_coordScale * coord[0], u_coordScale * coord[1], 1.0, 1.0];

            // Pass color to FS
            packet.outputs[varyingLocColor] = [u_colorScale * color[0], u_colorScale * color[1], u_colorScale * color[2], 1.0];
        }
    }

    // REMOVED: @param {number} numPackets
    /**
     * @param {Array.<rrFragmentPacket.FragmentPacket>} packets
     * @param {rrShadingContext.FragmentShadingContext} context
     */
    ContextShaderProgram.prototype.shadeFragments = function (packets, /*numPackets,*/ context) {
        var varyingLocColor = 0;

        // Triangles are flashaded
        //var color = rrShadingContext.readTriangleVarying(packets[0], context, varyingLocColor, 0);

        // Normal shading
        for (var packetNdx = 0; packetNdx < packets.length; ++packetNdx)
            packets[packetNdx].color = rrShadingContext.readTriangleVarying(packets[packetNdx], context, varyingLocColor /*, 0*/);
            /*for (int fragNdx = 0; fragNdx < 4; ++fragNdx)
                rr::writeFragmentOutput(context, packetNdx, fragNdx, 0, color);*/
    };

    /**
     * @param {Array.<Array.<ContextArray>>} arrays
     * @return string
     */
    ContextShaderProgram.prototype.genVertexSource = function (arrays) {
        var vertexShaderSrc = '';
        var params = [];

        params["VTX_IN"]        = "in";
        params["VTX_OUT"]       = "out";
        params["FRAG_IN"]       = "in";
        params["FRAG_COLOR"]    = "dEQP_FragColor";
        params["VTX_HDR"]       = "#version 300 es\n";
        params["FRAG_HDR"]      = "#version 300 es\nlayout(location = 0) out mediump vec4 dEQP_FragColor;\n";


        vertexShaderSrc += params['VTX_HDR'];

        for (var arrayNdx = 0; arrayNdx < arrays.length; arrayNdx++) {
            vertexShaderSrc += params['VTX_IN'] + ' highp ' + ContextArray.outputTypeToGLType(arrays[arrayNdx].getOutputType()) + ' a_' + arrays[arrayNdx].getAttribNdx() + ';\n';
        }

        vertexShaderSrc +=
        'uniform highp float u_coordScale;\n' +
        'uniform highp float u_colorScale;\n' +
        params['VTX_OUT'] + ' mediump vec4 v_color;\n' +
        'void main(void)\n' +
        '{\n' +
        '\tgl_PointSize = 1.0;\n' +
        '\thighp vec2 coord = vec2(1.0, 1.0);\n' +
        '\thighp vec3 color = vec3(1.0, 1.0, 1.0);\n';

        for (var arrayNdx = 0; arrayNdx < arrays.length; arrayNdx++) {
            if (arrays[arrayNdx].getAttribNdx() == 0) {
                switch (arrays[arrayNdx].getOutputType()) {
                    case (deArray.OutputType.FLOAT):
                        vertexShaderSrc +=
                        '\tcoord = vec2(a_0);\n';
                        break;

                    case (deArray.OutputType.VEC2):
                        vertexShaderSrc +=
                        '\tcoord = a_0.xy;\n';
                        break;

                    case (deArray.OutputType.VEC3):
                        vertexShaderSrc +=
                        '\tcoord = a_0.xy;\n' +
                        '\tcoord.x = coord.x + a_0.z;\n';
                        break;

                    case (deArray.OutputType.VEC4):
                        vertexShaderSrc +=
                        '\tcoord = a_0.xy;\n' +
                        '\tcoord += a_0.zw;\n';
                        break;

                    case (deArray.OutputType.IVEC2):
                    case (deArray.OutputType.UVEC2):
                        vertexShaderSrc +=
                        '\tcoord = vec2(a_0.xy);\n';
                        break;

                    case (deArray.OutputType.IVEC3):
                    case (deArray.OutputType.UVEC3):
                        vertexShaderSrc +=
                        '\tcoord = vec2(a_0.xy);\n' +
                        '\tcoord.x = coord.x + float(a_0.z);\n';
                        break;

                    case (deArray.OutputType.IVEC4):
                    case (deArray.OutputType.UVEC4):
                        vertexShaderSrc +=
                        '\tcoord = vec2(a_0.xy);\n' +
                        '\tcoord += vec2(a_0.zw);\n';
                        break;

                    default:
                        throw new Error('Invalid output type');
                        break;
                }
                continue;
            }

            switch (arrays[arrayNdx].getOutputType())
            {
                case (deArray.OutputType.FLOAT):
                    vertexShaderSrc +=
                    "\tcolor = color * a_" + arrays[arrayNdx].getAttribNdx() + ";\n";
                    break;

                case (deArray.OutputType.VEC2):
                    vertexShaderSrc +=
                    "\tcolor.rg = color.rg * a_" + arrays[arrayNdx].getAttribNdx() + ".xy;\n";
                    break;

                case (deArray.OutputType.VEC3):
                    vertexShaderSrc +=
                    "\tcolor = color.rgb * a_" + arrays[arrayNdx].getAttribNdx() + ".xyz;\n";
                    break;

                case (deArray.OutputType.VEC4):
                    vertexShaderSrc +=
                    "\tcolor = color.rgb * a_" + arrays[arrayNdx].getAttribNdx() + ".xyz * a_" + arrays[arrayNdx].getAttribNdx() + ".w;\n";
                    break;

                default:
                    throw new Error('Invalid output type');
                    break;
            }
        }

        vertexShaderSrc +=
        "\tv_color = vec4(u_colorScale * color, 1.0);\n"
        "\tgl_Position = vec4(u_coordScale * coord, 1.0, 1.0);\n"
        "}\n";

        return vertexShaderSrc;
    };

    /**
     * @return {string}
     */
    ContextShaderProgram.prototype.genFragmentSource = function () {
        var params = [];

        params["VTX_IN"] = "in";
        params["VTX_OUT"] = "out";
        params["FRAG_IN"] = "in";
        params["FRAG_COLOR"] = "dEQP_FragColor";
        params["VTX_HDR"] = "#version 300 es\n";
        params["FRAG_HDR"] = "#version 300 es\nlayout(location = 0) out mediump vec4 dEQP_FragColor;\n";

        /* TODO: Check if glsl supported version check function is needed.*/

        var fragmentShaderSrc = params['FRAG_HDR'] +
        params['FRAG_IN'] + ' mediump vec4 v_color;\n' +
        'void main(void)\n' +
        '{\n' +
        '\t' + params['FRAG_COLOR'] + ' = v_color;\n' +
        '}\n';

        return fragmentShaderSrc;
    };

    /**
     * @param {deArray.OutputType} type
     * @return {rrGenericVector.GenericVecType}
     */
    ContextShaderProgram.prototype.mapOutputType = function (type) {
        switch (type) {
            case (deArray.OutputType.FLOAT):
            case (deArray.OutputType.VEC2):
            case (deArray.OutputType.VEC3):
            case (deArray.OutputType.VEC4):
                return rrGenericVector.GenericVecType.FLOAT;

            case (deArray.OutputType.INT):
            case (deArray.OutputType.IVEC2):
            case (deArray.OutputType.IVEC3):
            case (deArray.OutputType.IVEC4):
                return rrGenericVector.GenericVecType.INT32;

            case (deArray.OutputType.UINT):
            case (deArray.OutputType.UVEC2):
            case (deArray.OutputType.UVEC3):
            case (deArray.OutputType.UVEC4):
                return rrGenericVector.GenericVecType.UINT32;

            default:
                throw new Error('Invalid output type');
                return rrGenericVector.GenericVecType.LAST;
        }
    };

    /**
     * @param {deArray.OutputType} type
     * @return {number}
     */
    ContextShaderProgram.prototype.getComponentCount = function (type) {
        switch (type) {
            case (deArray.OutputType.FLOAT):
            case (deArray.OutputType.INT):
            case (deArray.OutputType.UINT):
                return 1;

            case (deArray.OutputType.VEC2):
            case (deArray.OutputType.IVEC2):
            case (deArray.OutputType.UVEC2):
                return 2;

            case (deArray.OutputType.VEC3):
            case (deArray.OutputType.IVEC3):
            case (deArray.OutputType.UVEC3):
                return 3;

            case (deArray.OutputType.VEC4):
            case (deArray.OutputType.IVEC4):
            case (deArray.OutputType.UVEC4):
                return 4;

            default:
                throw new Error('Invalid output type');
                return 0;
        }
    };

    /**
     * @param {Array.<Array.<ContextArray>>} arrays
     * @return {sglrShaderProgram.ShaderProgramDeclaration}
     */
    ContextShaderProgram.prototype.createProgramDeclaration = function (arrays) {
        /** @type {sglrShaderProgram.ShaderProgramDeclaration} */ var decl = new sglrShaderProgram.ShaderProgramDeclaration();

        for (var arrayNdx = 0; arrayNdx < arrays.length; arrayNdx++)
            decl.pushVertexAttribute(new sglrShaderProgram.VertexAttribute('a_' + arrayNdx, this.mapOutputType(arrays[arrayNdx].getOutputType())));

        decl.pushVertexToFragmentVarying(new sglrShaderProgram.VertexToFragmentVarying(rrGenericVector.GenericVecType.FLOAT));
        decl.pushFragmentOutput(new rrGenericVector.GenericVecType.FLOAT);

        decl.pushVertexSource(this.genVertexSource(/*ctx,*/ arrays));
        decl.pushFragmentSource(this.genFragmentSource(/*ctx*/));

        decl.pushUniform(new sglrShaderProgram.Uniform('u_coordScale', gluShaderUtil.DataType.FLOAT));
        decl.pushUniform(new sglrShaderProgram.Uniform('u_colorScale', gluShaderUtil.DataType.FLOAT));

        return decl;
    };

    /**
     * GLValue class
     * @constructor
     */
    var GLValue = function () {
        /** @type {Array | TypedArray} */ this.m_value = new Array(1);
        this.m_value[0] = 0;
        /** @type {deArray.InputType} */ this.m_type = undefined;
    };

    /**
     * @param {Uint8Array} dst
     * @param {GLValue} val
     */
    var copyGLValueToArray = function (dst, val)
    {
        /** @type {Uint8Array} */ var val8 = new Uint8Array(val.m_value.buffer); // TODO: Fix encapsulation issue
        dst.set(val8);
    };

    /**
     * @param {Uint8Array} dst
     * @param {TypedArray} src
     */
    var copyArray = function (dst, src)
    {
        /** @type {Uint8Array} */ var src8 = new Uint8Array(src.buffer).subarray(src.offset, src.offset + src.byteLength); // TODO: Fix encapsulation issue
        dst.set(src8);
    };

    /**
     * typeToTypedArray function. Determines which type of array will store the value, and stores it.
     * @param {number} value
     * @param {deArray.InputType} type
     */
    GLValue.typeToTypedArray = function (value, type) {
        var array;

        switch (type) {
            case deArray.InputType.FLOAT:
                array = new Float32Array(1);
                break;
            case deArray.InputType.FIXED:
                array = new Int32Array(1);
                break;
            case deArray.InputType.DOUBLE:
                array = new Float32Array(1); // 64-bit?
                break;

            case deArray.InputType.BYTE:
                array = new Int8Array(1);
                break;
            case deArray.InputType.SHORT:
                array = new Int16Array(1);
                break;

            case deArray.InputType.UNSIGNED_BYTE:
                array = new Uint8Array(1);
                break;
            case deArray.InputType.UNSIGNED_SHORT:
                array = new Uint16Array(1);
                break;

            case deArray.InputType.INT:
                array = new Int32Array(1);
                break;
            case deArray.InputType.UNSIGNED_INT:
                array = new Uint32Array(1);
                break;
            case deArray.InputType.HALF:
                array = new Uint16Array(1);
                value = GLValue.floatToHalf(value);
                break;
            case deArray.InputType.UNSIGNED_INT_2_10_10_10:
                array = new Uint32Array(1);
                break;
            case deArray.InputType.INT_2_10_10_10:
                array = new Int32Array(1);
                break;
            default:
                throw new Error('GLValue.typeToTypedArray - Invalid InputType');
        }

        array[0] = value;
        return array;
    };

    /**
     * GLValue.create
     * @param {number} value
     * @param {deArray.InputType} type
     */
    GLValue.create = function (value, type) {
        var v = new GLValue();
        v.m_value = GLValue.typeToTypedArray(value, type);
        v.m_type = type;
        return v;
    };

    /**
     * GLValue.halfToFloat
     * @param {number} value
     * @return {number}
     */
    GLValue.halfToFloat = function (value) {
        return tcuFloat.halfFloatToNumberNoDenorm(value);
    };

    /**
     * @param {number} f
     * @return {number}
     */
    GLValue.floatToHalf = function (f)
    {
        // No denorm support.
        return tcuFloat.numberToHalfFloatNoDenorm(f);
    }

    /**
     * GLValue.getMaxValue
     * @param {deArray.InputType} type
     * @return {GLValue}
     */
    GLValue.getMaxValue = function (type) {
        var value;

        switch (type) {
            case deArray.InputType.FLOAT:
                value =  127;
                break;
            case deArray.InputType.FIXED:
                value = 32760;
                break;
            case deArray.InputType.DOUBLE:
                value = 127;
                break;
            case deArray.InputType.BYTE:
                value = 127;
                break;
            case deArray.InputType.SHORT:
                value = 32760;
                break;
            case deArray.InputType.UNSIGNED_BYTE:
                value = 255;
                break;
            case deArray.InputType.UNSIGNED_SHORT:
                value = 65530;
                break;
            case deArray.InputType.INT:
                value = 2147483647;
                break;
            case deArray.InputType.UNSIGNED_INT:
                value = 4294967295;
                break;
            case deArray.InputType.HALF:
                value = 256;
                break;
            default:
                throw new Error('GLValue.getMaxValue - Invalid InputType');
        }

        return GLValue.create(value, type);
    };

    /**
     * GLValue.getMinValue
     * @param {deArray.InputType} type
     * @return {GLValue}
     */
    GLValue.getMinValue = function (type) {
        var value;

        switch (type) {
            case deArray.InputType.FLOAT:
                value =  -127;
                break;
            case deArray.InputType.FIXED:
                value = -32760;
                break;
            case deArray.InputType.DOUBLE:
                value = -127;
                break;
            case deArray.InputType.BYTE:
                value = -127;
                break;
            case deArray.InputType.SHORT:
                value = -32760;
                break;
            case deArray.InputType.UNSIGNED_BYTE:
                value = 0;
                break;
            case deArray.InputType.UNSIGNED_SHORT:
                value = 0;
                break;
            case deArray.InputType.INT:
                value = -2147483647;
                break;
            case deArray.InputType.UNSIGNED_INT:
                value = 0;
                break;
            case deArray.InputType.HALF:
                value = -256;
                break;

            default:
                throw new Error('GLValue.getMinValue - Invalid InputType');
        }

        return GLValue.create(value, type);
    };

    /**
     * GLValue.getRandom
     * @param {deRandom.Random} rnd
     * @param {GLValue} min
     * @param {GLValue} max
     * @return {GLValue}
     */
    GLValue.getRandom = function (rnd, min, max) {
        DE_ASSERT(min.getType() == max.getType());

        var minv = min.interpret();
        var maxv = max.interpret();
        var type = min.getType();
        var value;

        if (maxv < minv)
            return min;

        switch (type) {
            case deArray.InputType.FLOAT:
            case deArray.InputType.DOUBLE:
            case deArray.InputType.HALF: {
                return GLValue.create(minv + rnd.getFloat() * (maxv - minv), type);
                break;
            }

            case deArray.InputType.FIXED: {
                return minv == maxv ? min : GLValue.create(minv + rnd.getInt() % (maxv - minv), type);
                break;
            }

            case deArray.InputType.SHORT:
            case deArray.InputType.UNSIGNED_SHORT:
            case deArray.InputType.BYTE:
            case deArray.InputType.UNSIGNED_BYTE:
            case deArray.InputType.INT:
            case deArray.InputType.UNSIGNED_INT: {
                return GLValue.create(minv + rnd.getInt() % (maxv - minv), type);
                break;
            }

            default:
                throw new Error('GLValue.getRandom - Invalid input type');
                break;
        }
    };

    // Minimum difference required between coordinates

    /**
     * @param {deArray.InputType} type
     * @return {GLValue}
     */
    GLValue.minValue = function (type) {
        switch (type) {
            case deArray.InputType.FLOAT:
            case deArray.InputType.BYTE:
            case deArray.InputType.HALF:
            case deArray.InputType.DOUBLE:
                return GLValue.create(4, type);
            case deArray.InputType.SHORT:
            case deArray.InputType.UNSIGNED_SHORT:
                return GLValue.create(4 * 256, type);
            case deArray.InputType.UNSIGNED_BYTE:
                return GLValue.create(4 * 2, type);
            case deArray.InputType.FIXED:
                return GLValue.create(4 * 512, type);
            case deArray.InputType.INT:
            case deArray.InputType.UNSIGNED_INT:
                return GLValue.create(4 * 16777216, type);

            default:
                throw new Error('GLValue.minValue - Invalid input type');
        }
    };

    /**
     * @param {GLValue} val
     * @return {GLValue}
     */
    GLValue.abs = function (val)
    {
        var type = val.getType();
        switch(type) {
            case deArray.InputType.FIXED:
            case deArray.InputType.SHORT:
                return GLValue.create(0x7FFF & val.getValue(), type);
            case deArray.InputType.BYTE:
                return GLValue.create(0x7F & val.getValue(), type);
            case deArray.InputType.UNSIGNED_BYTE:
            case deArray.InputType.UNSIGNED_SHORT:
            case deArray.InputType.UNSIGNED_INT:
                return val;
            case deArray.InputType.FLOAT:
            case deArray.InputType.HALF:
            case deArray.InputType.DOUBLE:
                return GLValue.create(Math.abs(val.interpret()), type);
            case deArray.InputType.INT:
                return GLValue.create(0x7FFFFFFF & val.getValue(), type);
            default:
                throw new Error('GLValue.abs - Invalid input type');
        }
    };

    /**
     * @return {deArray.InputType}
     */
    GLValue.prototype.getType = function () {
        return this.m_type;
    };

    /**
     * GLValue.toFloat
     * @return {number}
     */
    GLValue.prototype.toFloat = function () {
        return this.interpret();
    };

    /**
     * GLValue.getValue
     * @return {number}
     */
    GLValue.prototype.getValue = function () {
        return this.m_value[0];
    };

    /**
     * interpret function. Returns the m_value as a quantity so arithmetic operations can be performed on it
     * Only some types require this.
     * @return {number}
     */
    GLValue.prototype.interpret = function () {
        if (this.m_type == deArray.InputType.HALF)
            return GLValue.halfToFloat(this.m_value[0]);
        else if (this.m_type == deArray.InputType.FIXED) {
            var maxValue = 65536;
            return Math.floor((2 * this.m_value[0] + 1) / (maxValue - 1));
        }

        return this.m_value[0];
    };

    /**
     * @param {GLValue} other
     * @return {GLValue}
     */
    GLValue.prototype.add = function (other) {
        return GLValue.create(this.interpret() + other.interpret(), this.m_type);
    };

    /**
     * @param {GLValue} other
     * @return {GLValue}
     */
    GLValue.prototype.mul = function (other) {
        return GLValue.create(this.interpret() * other.interpret(), this.m_type);
    };

    /**
     * @param {GLValue} other
     * @return {GLValue}
     */
    GLValue.prototype.div = function (other) {
        return GLValue.create(this.interpret() / other.interpret(), this.m_type);
    };

    /**
     * @param {GLValue} other
     * @return {GLValue}
     */
    GLValue.prototype.sub = function (other) {
        return GLValue.create(this.interpret() - other.interpret(), this.m_type);
    };

    /**
     * @param {GLValue} other
     * @return {GLValue}
     */
    GLValue.prototype.addToSelf = function (other) {
        this.m_value[0] = this.interpret() + other.interpret();
        return this;
    };

    /**
     * @param {GLValue} other
     * @return {GLValue}
     */
    GLValue.prototype.subToSelf = function (other) {
        this.m_value[0] = this.interpret() - other.interpret();
        return this;
    };

    /**
     * @param {GLValue} other
     * @return {GLValue}
     */
    GLValue.prototype.mulToSelf = function (other) {
        this.m_value[0] = this.interpret() * other.interpret();
        return this;
    };

    /**
     * @param {GLValue} other
     * @return {GLValue}
     */
    GLValue.prototype.divToSelf = function (other) {
        this.m_value[0] = this.interpret() / other.interpret();
        return this;
    };

    /**
     * @param {GLValue} other
     * @return {boolean}
     */
    GLValue.prototype.equals = function (other) {
        return this.m_value[0] == other.getValue();
    };

    /**
     * @param {GLValue} other
     * @return {boolean}
     */
    GLValue.prototype.lessThan = function (other) {
        return this.interpret() < other.interpret();
    };

    /**
     * @param {GLValue} other
     * @return {boolean}
     */
    GLValue.prototype.greaterThan = function (other) {
        return this.interpret() > other.interpret();
    };

    /**
     * @param {GLValue} other
     * @return {boolean}
     */
    GLValue.prototype.lessOrEqualThan = function (other) {
        return this.interpret() <= other.interpret();
    };

    /**
     * @param {GLValue} other
     * @return {boolean}
     */
    GLValue.prototype.greaterOrEqualThan = function (other) {
        return this.interpret() >= other.interpret();
    };

    /**
     * RandomArrayGenerator class. Contains static methods only
     */
    var RandomArrayGenerator = function () {};

    /**
     * RandomArrayGenerator.setData
     * @param {Uint8Array} data
     * @param {deArray.InputType} type
     * @param {deRandom.Random} rnd
     * @param {GLValue} min
     * @param {GLValue} max
     */
    RandomArrayGenerator.setData = function (data, type, rnd, min, max) {
        // Parameter type is not necessary, but we'll use it to assert the created GLValue is of the correct type.
        /** @type {GLValue} */ var value = GLValue.getRandom(rnd, min, max);
        DE_ASSERT(value.getType() == type);

        copyGLValueToArray(data, value);
    };

    /**
     * generateArray
     * @param {number} seed
     * @param {GLValue} min
     * @param {GLValue} max
     * @param {number} count
     * @param {number} componentCount
     * @param {number} stride
     * @param {deArray.InputType} type
     * @return {ArrayBuffer}
     */
    RandomArrayGenerator.generateArray = function (seed, min, max, count, componentCount, stride, type) {
        /** @type {ArrayBuffer} */ var data;
        /** @type {Uint8Array} */ var data8;

        var rnd = new deRandom.Random(seed);

        if (stride == 0)
            stride = componentCount * deArray.inputTypeSize(type);

        data = new ArrayBuffer(stride * count);
        data8 = new Uint8Array(data);

        for (var vertexNdx = 0; vertexNdx < count; vertexNdx++) {
            for (var componentNdx = 0; componentNdx < componentCount; componentNdx++) {
                RandomArrayGenerator.setData(data8.subarray(vertexNdx * stride + deArray.inputTypeSize(type) * componentNdx), type, rnd, min, max);
            }
        }

        return data;
    };


    /*{
        static char*    generateQuads           (int seed, int count, int componentCount, int offset, int stride, Array::Primitive primitive, Array::InputType type, GLValue min, GLValue max);
        static char*    generatePerQuad         (int seed, int count, int componentCount, int stride, Array::Primitive primitive, Array::InputType type, GLValue min, GLValue max);

    private:
        template<typename T>
        static char*    createQuads     (int seed, int count, int componentCount, int offset, int stride, Array::Primitive primitive, T min, T max);
        template<typename T>
        static char*    createPerQuads  (int seed, int count, int componentCount, int stride, Array::Primitive primitive, T min, T max);
        static char*    createQuadsPacked (int seed, int count, int componentCount, int offset, int stride, Array::Primitive primitive);
    };*/

    /**
     * @param {number} seed
     * @param {number} count
     * @param {number} componentCount
     * @param {number} offset
     * @param {number} stride
     * @param {deArray.Primitive} primitive
     * @param {deArray.InputType} type
     * @param {GLValue} min
     * @param {GLValue} max
     * @return {ArrayBuffer}
     */
    RandomArrayGenerator.generateQuads = function (seed, count, componentCount, offset, stride, primitive, type, min, max) {
        /** @type {ArrayBuffer} */ var data;

        switch (type) {
            case deArray.InputType.FLOAT:
            case deArray.InputType.FIXED:
            case deArray.InputType.DOUBLE:
            case deArray.InputType.BYTE:
            case deArray.InputType.SHORT:
            case deArray.InputType.UNSIGNED_BYTE:
            case deArray.InputType.UNSIGNED_SHORT:
            case deArray.InputType.UNSIGNED_INT:
            case deArray.InputType.INT:
            case deArray.InputType.HALF:
                data = RandomArrayGenerator.createQuads(seed, count, componentCount, offset, stride, primitive, min, max);
                break;

            case deArray.InputType.INT_2_10_10_10:
            case deArray.InputType.UNSIGNED_INT_2_10_10_10:
                data = RandomArrayGenerator.createQuadsPacked(seed, count, componentCount, offset, stride, primitive);
                break;

            default:
                throw new Error('RandomArrayGenerator.generateQuads - Invalid input type');
                break;
        }

        return data;
    };

    /**
     * @param {number} seed
     * @param {number} count
     * @param {number} componentCount
     * @param {number} offset
     * @param {number} stride
     * @param {deArray.Primitive} primitive
     * @return {ArrayBuffer}
     */
    RandomArrayGenerator.createQuadsPacked = function (seed, count, componentCount, offset, stride, primitive) {
        DE_ASSERT(componentCount == 4);
        //DE_UNREF(componentCount); // TODO: Check this
        /** @type {number} */ var quadStride = 0;

        if (stride == 0)
            stride = deMath.deUint32_size;

        switch (primitive) {
            case deArray.Primitive.TRIANGLES:
                quadStride = stride * 6;
                break;

            default:
                throw new Error('RandomArrayGenerator.createQuadsPacked - Invalid primitive');
                break;
        }

        /** @type {ArrayBuffer} */ var _data = new ArrayBuffer[offset + quadStride * (count - 1) + stride * 5 + componentCount * deArray.inputTypeSize(deArray.InputType.INT_2_10_10_10)]; // last element must be fully in the array
        /** @type {Uint8Array} */ var resultData  = new Uint8Array(_data).subarray(offset);

        /** @type {deMath.deUint32} */ var max = 1024;
        /** @type {deMath.deUint32} */ var min = 10;
        /** @type {deMath.deUint32} */ var max2 = 4;

        var rnd = new deRandom.Random(seed);

        switch (primitive) {
            case deArray.Primitive.TRIANGLES: {
                for (var quadNdx = 0; quadNdx < count; quadNdx++) {
                    /** @type {deMath.deUint32} */ var x1 = min + rnd.getInt() % (max - min);
                    /** @type {deMath.deUint32} */ var x2 = min + rnd.getInt() % (max - x1);

                    /** @type {deMath.deUint32} */ var y1 = min + rnd.getInt() % (max - min);
                    /** @type {deMath.deUint32} */ var y2 = min + rnd.getInt() % (max - y1);

                    /** @type {deMath.deUint32} */ var z  = min + rnd.getInt() % (max - min);
                    /** @type {deMath.deUint32} */ var w  = rnd.getInt() % max2;

                    /** @type {deMath.deUint32} */ var val1 = (w << 30) | (z << 20) | (y1 << 10) | x1;
                    /** @type {deMath.deUint32} */ var val2 = (w << 30) | (z << 20) | (y1 << 10) | x2;
                    /** @type {deMath.deUint32} */ var val3 = (w << 30) | (z << 20) | (y2 << 10) | x1;

                    /** @type {deMath.deUint32} */ var val4 = (w << 30) | (z << 20) | (y2 << 10) | x1;
                    /** @type {deMath.deUint32} */ var val5 = (w << 30) | (z << 20) | (y1 << 10) | x2;
                    /** @type {deMath.deUint32} */ var val6 = (w << 30) | (z << 20) | (y2 << 10) | x2;

                    copyArray(resultData.subarray(quadNdx * quadStride + stride * 0), new Uint32Array([val1]));
                    copyArray(resultData.subarray(quadNdx * quadStride + stride * 1), new Uint32Array([val2]));
                    copyArray(resultData.subarray(quadNdx * quadStride + stride * 2), new Uint32Array([val3]));
                    copyArray(resultData.subarray(quadNdx * quadStride + stride * 3), new Uint32Array([val4]));
                    copyArray(resultData.subarray(quadNdx * quadStride + stride * 4), new Uint32Array([val5]));
                    copyArray(resultData.subarray(quadNdx * quadStride + stride * 5), new Uint32Array([val6]));
                }

                break;
            }

            default:
                throw new Error('RandomArrayGenerator.createQuadsPacked - Invalid primitive');
                break;
        }

        return _data;
    };

    /**
     * @param {number} seed
     * @param {number} count
     * @param {number} componentCount
     * @param {number} offset
     * @param {number} stride
     * @param {deArray.Primitive} primitive
     * @param {GLValue} min
     * @param {GLValue} max
     * @return {ArrayBuffer}
     */
    RandomArrayGenerator.createQuads = function (seed, count, componentCount, offset, stride, primitive, min, max) {
        var componentStride = min.m_value.byteLength; //TODO: Fix encapsulation issue
        var quadStride = 0;
        var type = min.getType(); //Instead of using the template parameter.

        if (stride == 0)
            stride = componentCount * componentStride;
        DE_ASSERT(stride >= componentCount * componentStride);

        switch (primitive) {
            case deArray.Primitive.TRIANGLES:
                quadStride = stride * 6;
                break;

            default:
                throw new Error('RandomArrayGenerator.createQuads - Invalid primitive');
                break;
        }

        /** @type {ArrayBuffer} */ var _data = new ArrayBuffer(offset + quadStride * count);
        /** @type {Uint8Array} */ var resultData = new Uint8Array(_data).subarray(offset);

        var rnd = new deRandom.Random(seed);

        switch (primitive) {
            case deArray.Primitive.TRIANGLES: {
                for (var quadNdx = 0; quadNdx < count; ++quadNdx) {
                    /** @type {GLValue} */ var x1, x2 = null;
                    /** @type {GLValue} */ var y1, y2 = null;
                    /** @type {GLValue} */ var z, w = null;

                    // attempt to find a good (i.e not extremely small) quad
                    for (var attemptNdx = 0; attemptNdx < 4; ++attemptNdx) {
                        x1 = GLValue.getRandom(rnd, min, max);
                        x2 = GLValue.getRandom(rnd, GLValue.minValue(type), GLValue.abs(max.sub(x1)));

                        y1 = GLValue.getRandom(rnd, min, max);
                        y2 = GLValue.getRandom(rnd, GLValue.minValue(type), GLValue.abs(max.sub(y1)));

                        z = (componentCount > 2) ? (GLValue.getRandom(rnd, min, max)) : (GLValue.create(0, type));
                        w = (componentCount > 3) ? (GLValue.getRandom(rnd, min, max)) : (GLValue.create(1, type));

                        // no additional components, all is good
                        if (componentCount <= 2)
                            break;

                        // The result quad is too thin?
                        if ((Math.abs(x2.interpret() + z.interpret()) < GLValue.minValue(type).interpret()) ||
                            (Math.abs(y2.interpret() + w.interpret()) < GLValue.minValue(type).interpret()))
                            continue;

                        // all ok
                        break;
                    }

                    copyGLValueToArray(resultData.subarray(quadNdx * quadStride), x1);
                    copyGLValueToArray(resultData.subarray(quadNdx * quadStride + componentStride), y1);

                    copyGLValueToArray(resultData.subarray(quadNdx * quadStride + stride), x1.add(x2));
                    copyGLValueToArray(resultData.subarray(quadNdx * quadStride + stride + componentStride), y1);

                    copyGLValueToArray(resultData.subarray(quadNdx * quadStride + stride * 2), x1);
                    copyGLValueToArray(resultData.subarray(quadNdx * quadStride + stride * 2 + componentStride), y1.add(y2));

                    copyGLValueToArray(resultData.subarray(quadNdx * quadStride + stride * 3), x1);
                    copyGLValueToArray(resultData.subarray(quadNdx * quadStride + stride * 3 + componentStride), y1.add(y2));

                    copyGLValueToArray(resultData.subarray(quadNdx * quadStride + stride * 4), x1.add(x2));
                    copyGLValueToArray(resultData.subarray(quadNdx * quadStride + stride * 4 + componentStride), y1);

                    copyGLValueToArray(resultData.subarray(quadNdx * quadStride + stride * 5), x1.add(x2));
                    copyGLValueToArray(resultData.subarray(quadNdx * quadStride + stride * 5 + componentStride), y1.add(y2));

                    if (componentCount > 2) {
                        for (var i = 0; i < 6; i++)
                            copyGLValueToArray(resultData.subarray(quadNdx * quadStride + stride * i + componentStride * 2), z);
                    }

                    if (componentCount > 3) {
                        for (var i = 0; i < 6; i++)
                            copyGLValueToArray(resultData.subarray(quadNdx * quadStride + stride * i + componentStride * 3), w);
                    }
                }

                break;
            }

            default:
                throw new Error('RandomArrayGenerator.createQuads - Invalid primitive');
                break;
        }

        return _data;
    };

    /**
     * @param {number} seed
     * @param {number} count
     * @param {number} componentCount
     * @param {number} stride
     * @param {deArray.Primitive} primitive
     * @param {deArray.InputType} type
     * @param {GLValue} min
     * @param {GLValue} max
     */
    RandomArrayGenerator.generatePerQuad = function (seed, count, componentCount, stride, primitive, type, min, max) {
        /** @type {ArrayBuffer} */ var data = DE_NULL;

        data = RandomArrayGenerator.createPerQuads(seed, count, componentCount, stride, primitive, min, max);
        return data;
    };

    /**
     * @param {number} seed
     * @param {number} count
     * @param {number} componentCount
     * @param {number} stride
     * @param {deArray.Primitive} primitive
     * @param {GLValue} min
     * @param {GLValue} max
     */
    RandomArrayGenerator.createPerQuads = function (seed, count, componentCount, stride, primitive, min, max) {
        var rnd = new deRandom.Random(seed);

        var componentStride = min.m_value.byteLength; //TODO: Fix encapsulation issue.

        if (stride == 0)
            stride = componentStride * componentCount;

        var quadStride = 0;

        switch (primitive) {
            case deArray.Primitive.TRIANGLES:
                quadStride = stride * 6;
                break;

            default:
                throw new Error('RandomArrayGenerator.createPerQuads - Invalid primitive');
                break;
        }

        /** @type {ArrayBuffer} */ var data = new ArrayBuffer(count * quadStride);

        for (var quadNdx = 0; quadNdx < count; quadNdx++) {
            for (var componentNdx = 0; componentNdx < componentCount; componentNdx++) {
                /** @type {GLValue} */ var val = GLValue.getRandom(rnd, min, max);

                var data8 = new Uint8Array(data);
                copyGLValueToArray(data8.subarray(quadNdx * quadStride + stride * 0 + componentStride * componentNdx), val);
                copyGLValueToArray(data8.subarray(quadNdx * quadStride + stride * 1 + componentStride * componentNdx), val);
                copyGLValueToArray(data8.subarray(quadNdx * quadStride + stride * 2 + componentStride * componentNdx), val);
                copyGLValueToArray(data8.subarray(quadNdx * quadStride + stride * 3 + componentStride * componentNdx), val);
                copyGLValueToArray(data8.subarray(quadNdx * quadStride + stride * 4 + componentStride * componentNdx), val);
                copyGLValueToArray(data8.subarray(quadNdx * quadStride + stride * 5 + componentStride * componentNdx), val);
            }
        }

        return data;
    };

    /**
     * class VertexArrayTest
     * @constructor
     * @param {string} name
     * @param {string} description
     */
    var VertexArrayTest = function(name, description) {
        tcuTestCase.DeqpTest.call(this, name, description);

        this.m_pixelformat = new tcuPixelFormat.PixelFormat(gl.getParameter(gl.RED_BITS), gl.getParameter(gl.GREEN_BITS), gl.getParameter(gl.BLUE_BITS), gl.getParameter(gl.ALPHA_BITS));
        //TODO: Reference rasterizer implementation.
        /** @type {sglrReferenceContext.ReferenceContextBuffers} */ this.m_refBuffers = DE_NULL;
        /** @type {sglrReferenceContext.ReferenceContext} */ this.m_refContext = DE_NULL;
        /** @type {GLContext} */ this.m_glesContext = DE_NULL;
        /** @type {ContextArrayPack} */ this.m_glArrayPack = DE_NULL;
        /** @type {ContextArrayPack} */ this.m_rrArrayPack = DE_NULL;
        /** @type {boolean} */ this.m_isOk = false;
        /** @type {number} */ this.m_maxDiffRed = deMath.deCeilFloatToInt32(256.0 * (2.0 / (1 << this.m_pixelformat.redBits)));
        /** @type {number} */ this.m_maxDiffGreen = deMath.deCeilFloatToInt32(256.0 * (2.0 / (1 << this.m_pixelformat.greenBits))));
        /** @type {number} */ this.m_maxDiffBlue = deMath.deCeilFloatToInt32(256.0 * (2.0 / (1 << this.m_pixelformat.blueBits))));
    };

    VertexArrayTest.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    VertexArrayTest.prototype.constructor = VertexArrayTest;

    /**
     * init
     */
    VertexArrayTest.prototype.init = function () {
        /** @type {number}*/ var renderTargetWidth = Math.min(512, canvas.width);
        /** @type {number}*/ var renderTargetHeight  = Math.min(512, canvas.height);
        /** @type {sglrReferenceContext.ReferenceContextLimits} */ var limits = new sglrReferenceContext.ReferenceContextLimits(gl);

        //TODO: Reference rasterizer implementation.
        this.m_glesContext = new sglrReferenceContext.GLContext(this.m_renderCtx, this.m_testCtx.getLog(), sglrReferenceContext.GLContext.LOG_CALLS | sglrReferenceContext.GLContext.LOG_PROGRAMS, [0, 0, renderTargetWidth, renderTargetHeight]);
        this.m_refBuffers = new sglrReferenceContext.ReferenceContextBuffers(this.m_renderCtx.getRenderTarget().getPixelFormat(), 0, 0, renderTargetWidth, renderTargetHeight);
        this.m_refContext = new sglrReferenceContext.ReferenceContext(limits, this.m_refBuffers.getColorbuffer(), this.m_refBuffers.getDepthbuffer(), this.m_refBuffers.getStencilbuffer());

        this.m_glArrayPack = new ContextArrayPack(this.m_renderCtx, this.m_glesContext);
        //TODO: Reference rasterizer implementation.
        this.m_rrArrayPack = new ContextArrayPack(this.m_renderCtx, this.m_refContext);
    };

    /**
     * compare
     */
    VertexArrayTest.prototype.compare = function () {
        /** @type {tcuSurface.Surface} */ var ref = this.m_rrArrayPack.getSurface();
        /** @type {tcuSurface.Surface} */ var screen = this.m_glArrayPack.getSurface();

        if (this.m_renderCtx.getRenderTarget().getNumSamples() > 1) {
            // \todo [mika] Improve compare when using multisampling
            bufferedLogToConsole("Warning: Comparision of result from multisample render targets are not as stricts as without multisampling. Might produce false positives!");
            this.m_isOk = tcuImageCompare.fuzzyCompare("Compare Results", "Compare Results", ref.getAccess(), screen.getAccess(), 1.5);
        }
        else {
            /** @type {tcuRGBA.RGBA} */ var threshold = new tcuRGBA.RGBA(this.m_maxDiffRed, this.m_maxDiffGreen, this.m_maxDiffBlue, 255);
            /** @type {tcuSurface.Surface} */ var error = new tcuSurface.Surface(ref.getWidth(), ref.getHeight());

            this.m_isOk = true;

            for (var y = 1; y < ref.getHeight()-1; y++) {
                for (var x = 1; x < ref.getWidth()-1; x++) {
                    /** @type {tcuRGBA.RGBA} */ var refPixel = ref.getPixel(x, y);
                    /** @type {tcuRGBA.RGBA} */ var screenPixel = screen.getPixel(x, y);
                    /** @type {boolean} */ var isOkPixel = false;

                    // Don't do comparisons for this pixel if it belongs to a one-pixel-thin part (i.e. it doesn't have similar-color neighbors in both x and y directions) in both result and reference.
                    // This fixes some false negatives.
                    /** @type {boolean} */ var refThin = (!tcuRGBA.compareThreshold(refPixel, ref.getPixel(x - 1, y), threshold) && !tcuRGBA.compareThreshold(refPixel, ref.getPixel(x + 1, y), threshold)) ||
                    (!tcuRGBA.compareThreshold(refPixel, ref.getPixel(x, y - 1), threshold) && !tcuRGBA.compareThreshold(refPixel, ref.getPixel(x, y + 1), threshold));
                    /** @type {boolean} */ var screenThin = (!tcuRGBA.compareThreshold(screenPixel, screen.getPixel(x-1, y  ), threshold) && !tcuRGBA.compareThreshold(screenPixel, screen.getPixel(x + 1, y), threshold)) ||
                    (!tcuRGBA.compareThreshold(screenPixel, screen.getPixel(x, y - 1), threshold) && !tcuRGBA.compareThreshold(screenPixel, screen.getPixel(x, y + 1), threshold));

                    if (refThin && screenThin)
                        isOkPixel = true;
                    else {
                        for (var dy = -1; dy < 2 && !isOkPixel; dy++) {
                            for (var dx = -1; dx < 2 && !isOkPixel; dx++) {
                                // Check reference pixel against screen pixel
                                /** @type {tcuRGBA.RGBA} */ var screenCmpPixel  = screen.getPixel(x + dx, y + dy);
                                /** @type {deMath.deUint8} */ var r = Math.abs(refPixel.getRed() - screenCmpPixel.getRed());
                                /** @type {deMath.deUint8} */ var g = Math.abs(refPixel.getGreen() - screenCmpPixel.getGreen());
                                /** @type {deMath.deUint8} */ var b = Math.abs(refPixel.getBlue() - screenCmpPixel.getBlue());

                                if (r <= this.m_maxDiffRed && g <= this.m_maxDiffGreen && b <= this.m_maxDiffBlue)
                                    isOkPixel = true;

                                // Check screen pixels against reference pixel
                                /** @type {tcuRGBA.RGBA} */ var refCmpPixel = ref.getPixel(x+dx, y+dy);
                                r = Math.abs(refCmpPixel.getRed() - screenPixel.getRed());
                                g = Math.abs(refCmpPixel.getGreen() - screenPixel.getGreen());
                                b = Math.abs(refCmpPixel.getBlue() - screenPixel.getBlue());

                                    if (r <= this.m_maxDiffRed && g <= this.m_maxDiffGreen && b <= this.m_maxDiffBlue)
                                        isOkPixel = true;
                            }
                        }
                    }

                    if (isOkPixel)
                        error.setPixel(x, y, tcuRGBA.RGBA(screen.getPixel(x, y).getRed(), (screen.getPixel(x, y).getGreen() + 255) / 2, screen.getPixel(x, y).getBlue(), 255));
                    else {
                        error.setPixel(x, y, tcuRGBA.RGBA(255, 0, 0, 255));
                        this.m_isOk = false;
                    }
                }
            }

            if (!this.m_isOk) {
                debug("Image comparison failed, threshold = (" + this.m_maxDiffRed + ", " + this.m_maxDiffGreen + ", " + this.m_maxDiffBlue + ")");
                //log << TestLog::ImageSet("Compare result", "Result of rendering");
                tcuImageCompare.displayImages("Result",     "Result",       screen);
                tcuImageCompare.displayImages("Reference",  "Reference",    ref);
                tcuImageCompare.displayImages("ErrorMask",  "Error mask",   error);
            }
            else {
                //log << TestLog::ImageSet("Compare result", "Result of rendering")
                tcuImageCompare.displayImages("Result", "Result", screen);
            }
        }
    };

    //TODO: Is this actually used? -> VertexArrayTest&                operator=           (const VertexArrayTest& other);

    /**
     * MultiVertexArrayTest class
     * @constructor
     * @extends {VertexArrayTest}
     * @param {MultiVertexArrayTest.Spec} spec
     * @param {string} name
     * @param {string} desc
     */
    var MultiVertexArrayTest = function (spec, name, desc) {
        VertexArrayTest.call(this, name, desc);

        /** @type {MultiVertexArrayTest.Spec} */ this.m_spec = spec;
        /** @type {number} */ this.m_iteration = 0;
    };

    MultiVertexArrayTest.prototype = Object.create(VertexArrayTest.prototype);
    MultiVertexArrayTest.prototype.constructor = MultiVertexArrayTest;

    /**
     * MultiVertexArrayTest.Spec class
     * @constructor
     */
    MultiVertexArrayTest.Spec = function () {
        /** @type {deArray.Primitive} */ this.primitive = undefined;
        /** @type {number} */ this.drawCount = 0;
        /** @type {number} */ this.first = 0;
        /** @type {Array.<MultiVertexArrayTest.Spec.ArraySpec>} */ this.arrays = [];
    };

    /**
     * MultiVertexArrayTest.Spec.ArraySpec class
     * @constructor
     * @param {deArray.InputType} inputType_
     * @param {deArray.OutputType} outputType_
     * @param {deArray.Storage} storage_
     * @param {deArray.Usage} usage_
     * @param {number} componentCount_
     * @param {number} offset_
     * @param {number} stride_
     * @param {boolean} normalize_
     * @param {GLValue} min_
     * @param {GLValue} max_
     */
    MultiVertexArrayTest.Spec.ArraySpec = function (inputType_, outputType_, storage_, usage_, componentCount_, offset_, stride_, normalize_, min_, max_) {
        this.inputType = inputType_;
        this.outputType = outputType_;
        this.storage = storage_;
        this.usage = usage_;
        this.componentCount = componentCount_;
        this.offset = offset_;
        /** @type {number} */ this.stride = stride_;
        this.normalize = normalize_;
        this.min = min_;
        this.max = max_;
    };

    /**
     * getName
     * @return {string}
     */
    MultiVertexArrayTest.Spec.prototype.getName = function () {
        var name = '';

        for (var ndx = 0; ndx < this.arrays.length; ++ndx) {
            /** @type {MultiVertexArrayTest.Spec.ArraySpec} */ var array = this.arrays[ndx];

            if (this.arrays.length > 1)
                name += "array" + ndx + "_";

            name += deArray.storageToString(array.storage) + "_" +
            array.offset + "_" +
            array.stride + "_" +
            deArray.inputTypeToString(array.inputType);

            if (array.inputType != deArray.InputType.UNSIGNED_INT_2_10_10_10 && array.inputType != deArray.InputType.INT_2_10_10_10)
                name += array.componentCount;
            name += "_" +
            (array.normalize ? "normalized_" : "") +
            deArray.outputTypeToString(array.outputType) + "_" +
            deArray.usageTypeToString(array.usage) + "_";
        }

        if (this.first)
            name += "first" + this.first + "_";

        switch (this.primitive) {
            case deArray.Primitive.TRIANGLES:
                name += "quads_";
                break;
            case deArray.Primitive.POINTS:
                name += "points_";
                break;

            default:
                throw new Error('MultiVertexArrayTest.Spec.getName - Invalid primitive type');
                break;
        }

        name += this.drawCount;

        return name;
    };

    /**
     * getName
     * @return {string}
     */
    MultiVertexArrayTest.Spec.prototype.getDesc = function () {
        var desc = '';

        for (var ndx = 0; ndx < this.arrays.length; ++ndx) {
            /** @type {MultiVertexArrayTest.Spec.ArraySpec} */ var array = this.arrays[ndx];

            desc += "Array " + ndx + ": " +
            "Storage in " + deArray.storageToString(array.storage) + ", " +
            "stride " + array.stride + ", " +
            "input datatype " + deArray.inputTypeToString(array.inputType) + ", " +
            "input component count " + array.componentCount + ", " +
            (array.normalize ? "normalized, " : "") +
            "used as " + deArray.outputTypeToString(array.outputType) + ", ";
        }

        desc += "drawArrays(), " +
        "first " + this.first + ", " +
        this.drawCount;

        switch (this.primitive) {
            case deArray.Primitive.TRIANGLES:
                desc += "quads ";
                break;
            case deArray.Primitive.POINTS:
                desc += "points";
                break;

            default:
                throw new Error('MultiVertexArrayTest.Spec.getDesc - Invalid primitive type');
                break;
        }

        return desc;
    };

    /**
     * iterate
     * @return {tcuTestCase.runner.IterateResult}
     */
    MultiVertexArrayTest.prototype.iterate = function () {
        if (this.m_iteration == 0) {
            var primitiveSize = (this.m_spec.primitive == deArray.Primitive.TRIANGLES) ? (6) : (1); // in non-indexed draw Triangles means rectangles
            var coordScale = 1.0;
            var colorScale = 1.0;
            var useVao = true; // WebGL, WebGL 2.0 - gl.getType().getProfile() == glu::PROFILE_CORE;

            // Log info
            bufferedLogToConsole(this.m_spec.getDesc());

            // Color and Coord scale

            // First array is always position
            /** @type {MultiVertexArrayTest.Spec.ArraySpec} */ var arraySpec = this.m_spec.arrays[0];
            if (arraySpec.inputType == deArray.InputType.UNSIGNED_INT_2_10_10_10) {
                if (arraySpec.normalize)
                    coordScale = 1;
                else
                    coordScale = 1 / 1024;
            }
            else if (arraySpec.inputType == deArray.InputType.INT_2_10_10_10)
            {
                if (arraySpec.normalize)
                    coordScale = 1.0;
                else
                    coordScale = 1.0 / 512.0;
            }
            else
                coordScale = arraySpec.normalize && !inputTypeIsFloatType(arraySpec.inputType) ? 1.0 : 0.9 / arraySpec.max.toFloat();

            if (arraySpec.outputType == deArray.OutputType.VEC3 || arraySpec.outputType == deArray.OutputType.VEC4
                || arraySpec.outputType == deArray.OutputType.IVEC3 || arraySpec.outputType == deArray.OutputType.IVEC4
                || arraySpec.outputType == deArray.OutputType.UVEC3 || arraySpec.outputType == deArray.OutputType.UVEC4)
                coordScale = coordScale * 0.5;


            // And other arrays are color-like
            for (var arrayNdx = 1; arrayNdx < this.m_spec.arrays.length; arrayNdx++) {
                arraySpec = this.m_spec.arrays[arrayNdx];

                colorScale *= (arraySpec.normalize && !inputTypeIsFloatType(arraySpec.inputType) ? 1.0 : 1.0 / arraySpec.max.toFloat());
                if (arraySpec.outputType == deArray.OutputType.VEC4)
                    colorScale *= (arraySpec.normalize && !inputTypeIsFloatType(arraySpec.inputType) ? 1.0 : 1.0 / arraySpec.max.toFloat());
            }

            // Data

            for (var arrayNdx = 0; arrayNdx < this.m_spec.arrays.length; arrayNdx++) {
                arraySpec = this.m_spec.arrays[arrayNdx];
                /** @type {number} */ var seed = arraySpec.inputType + 10 * arraySpec.outputType + 100 * arraySpec.storage + 1000 * this.m_spec.primitive + 10000 * arraySpec.usage + this.m_spec.drawCount + 12 * arraySpec.componentCount + arraySpec.stride + arraySpec.normalize;
                /** @type {ArrayBuffer} */ var data = DE_NULL;
                /** @type {number} */ var stride = arraySpec.stride == 0 ? arraySpec.componentCount * deArray.inputTypeSize(arraySpec.inputType) : arraySpec.stride;
                /** @type {number} */ var bufferSize = arraySpec.offset + stride * (this.m_spec.drawCount * primitiveSize - 1) + arraySpec.componentCount  * deArray.inputTypeSize(arraySpec.inputType);

                switch (this.m_spec.primitive) {
                    //          case deArray.Primitive.POINTS:
                    //              data = RandomArrayGenerator.generateArray(seed, arraySpec.min, arraySpec.max, arraySpec.count, arraySpec.componentCount, arraySpec.stride, arraySpec.inputType);
                    //              break;
                    case deArray.Primitive.TRIANGLES:
                        if (arrayNdx == 0) {
                            data = RandomArrayGenerator.generateQuads(seed, this.m_spec.drawCount, arraySpec.componentCount, arraySpec.offset, arraySpec.stride, this.m_spec.primitive, arraySpec.inputType, arraySpec.min, arraySpec.max);
                        }
                        else {
                            DE_ASSERT(arraySpec.offset == 0); // \note [jarkko] it just hasn't been implemented
                            data = RandomArrayGenerator.generatePerQuad(seed, this.m_spec.drawCount, arraySpec.componentCount, arraySpec.stride, this.m_spec.primitive, arraySpec.inputType, arraySpec.min, arraySpec.max);
                        }
                        break;

                    default:
                        throw new Error('MultiVertexArrayTest.prototype.iterate - Invalid primitive type');
                        break;
                }

                this.m_glArrayPack.newArray(arraySpec.storage);
                this.m_rrArrayPack.newArray(arraySpec.storage);

                this.m_glArrayPack.getArray(arrayNdx).data(deArray.Target.ARRAY, bufferSize, new Uint8Array(data), arraySpec.usage);
                this.m_rrArrayPack.getArray(arrayNdx).data(deArray.Target.ARRAY, bufferSize, new Uint8Array(data), arraySpec.usage);

                this.m_glArrayPack.getArray(arrayNdx).bind(arrayNdx, arraySpec.offset, arraySpec.componentCount, arraySpec.inputType, arraySpec.outputType, arraySpec.normalize, arraySpec.stride);
                this.m_rrArrayPack.getArray(arrayNdx).bind(arrayNdx, arraySpec.offset, arraySpec.componentCount, arraySpec.inputType, arraySpec.outputType, arraySpec.normalize, arraySpec.stride);
            }

            try {
                this.m_glArrayPack.render(this.m_spec.primitive, this.m_spec.first, this.m_spec.drawCount * primitiveSize, useVao, coordScale, colorScale);
                this.m_rrArrayPack.render(this.m_spec.primitive, this.m_spec.first, this.m_spec.drawCount * primitiveSize, useVao, coordScale, colorScale);
            }
            catch (err) {
                // GL Errors are ok if the mode is not properly aligned

                bufferedLogToConsole("Got error: " + err.message);

                if (this.isUnalignedBufferOffsetTest())
                    testFailedOptions('Failed to draw with unaligned buffers', false); // TODO: QP_TEST_RESULT_COMPATIBILITY_WARNING
                else if (this.isUnalignedBufferStrideTest())
                    testFailedOptions('Failed to draw with unaligned stride', false); // QP_TEST_RESULT_COMPATIBILITY_WARNING
                else
                    throw new Error();

                return tcuTestCase.runner.IterateResult.STOP;
            }

            this.m_iteration++;
            return tcuTestCase.runner.IterateResult.CONTINUE;
        }
        else if (this.m_iteration == 1) {
            this.compare();

            if (this.m_isOk) {
                testPassedOptions('', true);
            }
            else {
                if (this.isUnalignedBufferOffsetTest())
                    testFailedOptions('Failed to draw with unaligned buffers', false); // QP_TEST_RESULT_COMPATIBILITY_WARNING
                else if (this.isUnalignedBufferStrideTest())
                    testFailedOptions('Failed to draw with unaligned stride', false); // QP_TEST_RESULT_COMPATIBILITY_WARNING
                else
                    testFailedOptions('Image comparison failed', false);
            }

            this.m_iteration++;
            return tcuTestCase.runner.IterateResult.STOP;
        }
        else {
            throw new Error('MultiVertexArrayTest.iterate - Invalid iteration stage');
            return tcuTestCase.runner.IterateResult.STOP;
        }
    };

    /**
     * isUnalignedBufferOffsetTest
     * @return {boolean}
     */
    MultiVertexArrayTest.prototype.isUnalignedBufferOffsetTest = function () {
        // Buffer offsets should be data type size aligned
        for (var i = 0; i < this.m_spec.arrays.length; ++i) {
            if (this.m_spec.arrays[i].storage == deArray.Storage.BUFFER) {
                /** @type {boolean} */ var inputTypePacked = this.m_spec.arrays[i].inputType == deArray.InputType.UNSIGNED_INT_2_10_10_10 || this.m_spec.arrays[i].inputType == deArray.InputType.INT_2_10_10_10;

                /** @type {number} */ var dataTypeSize = deArray.inputTypeSize(this.m_spec.arrays[i].inputType);
                if (inputTypePacked)
                    dataTypeSize = 4;

                if (this.m_spec.arrays[i].offset % dataTypeSize != 0)
                    return true;
            }
        }
        return false;
    };

    /**
     * isUnalignedBufferStrideTest
     * @return {boolean}
     */
    MultiVertexArrayTest.prototype.isUnalignedBufferStrideTest = function () {
        // Buffer strides should be data type size aligned
        for (var i = 0; i < this.m_spec.arrays.length; ++i) {
            if (this.m_spec.arrays[i].storage == deArray.Storage.BUFFER) {
                /** @type {boolean} */ var inputTypePacked = this.m_spec.arrays[i].inputType == deArray.InputType.UNSIGNED_INT_2_10_10_10 || this.m_spec.arrays[i].inputType == deArray.InputType.INT_2_10_10_10;

                /** @type {number} */ var dataTypeSize = deArray.inputTypeSize(this.m_spec.arrays[i].inputType);
                if (inputTypePacked)
                    dataTypeSize = 4;

                if (this.m_spec.arrays[i].stride % dataTypeSize != 0)
                    return true;
            }
        }
        return false;
    };

    return {
        deArray: deArray,
        MultiVertexArrayTest: MultiVertexArrayTest,
        GLValue: GLValue
    };

});
