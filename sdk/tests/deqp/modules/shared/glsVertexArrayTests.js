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
    'framework/opengl/gluShaderProgram',
    'framework/opengl/gluShaderUtil',
    'framework/opengl/gluDrawUtil',
    'framework/delibs/debase/deMath',
    'framework/delibs/debase/deRandom',
    'framework/delibs/debase/deString'
],
function(
    deqpTests,
    deqpProgram,
    deqpUtils,
    deqpDraw,
    deMath,
    deRandom,
    deString
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

    /**
     * deArray interface
     */
    var deArray;

    /**
     * deArray.Target enum
     * @enum deArray.Target
     */
    deArray.Target = {
        ELEMENT_ARRAY: 0,
        ARRAY: 1
    };

    /**
     * deArray.InputType enum
     * @enum deArray.InputType
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
     * @enum deArray.OutputType
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
     * @enum deArray.Usage
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
     * @enum deArray.Storage
     */
    deArray.Storage = {
        USER: 0,
        BUFFER: 1
    };

    /**
     * deArray.Primitive enum
     * @enum deArray.Primitive
     */
    deArray.Primitive = {
        POINTS: 0,
        TRIANGLES: 1,
        TRIANGLE_FAN: 2,
        TRIANGLE_STRIP: 3
    };

    /**
     * @interface
     */
    var deArray = function() {};

    //deArray static functions

    /**
     * @param {deArray.Target} target
     * @return {string}
     */
    deArray.targetToString = function (target) {
        DE_ASSERT(target < Object.keys(deArray.TARGET).length);

        /** @type {Array.<string>} */ var targets =
        [
            "element_array",    // deArray.Target.ELEMENT_ARRAY
            "array"             // deArray.Target.ARRAY
        ];
        DE_ASSERT(targets.length == Object.keys(deArray.TARGET).length);

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
            "float",            // deArray.InputType.FLOAT
            "fixed",            // deArray.InputType.FIXED
            "double",           // deArray.InputType.DOUBLE

            "byte",             // deArray.InputType.BYTE
            "short",            // deArray.InputType.SHORT

            "unsigned_byte",    // deArray.InputType.UNSIGNED_BYTE
            "unsigned_short",   // deArray.InputType.UNSIGNED_SHORT

            "int",                      // deArray.InputType.INT
            "unsigned_int",             // deArray.InputType.UNSIGNED_INT
            "half",                     // deArray.InputType.HALF
            "usigned_int2_10_10_10",    // deArray.InputType.UNSIGNED_INT_2_10_10_10
            "int2_10_10_10"             // deArray.InputType.INT_2_10_10_10
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
            "dynamic_copy", // deArray.Usage.DYNAMIC_COPY
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
            "points",           // deArray.Primitive.POINTS
            "triangles",        // deArray.Primitive.TRIANGLES
            "triangle_fan",     // deArray.Primitive.TRIANGLE_FAN
            "triangle_strip"    // deArray.Primitive.TRIANGLE_STRIP
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
            4,      // deArray.InputType.FLOAT
            4,      // deArray.InputType.FIXED
            8,      // deArray.InputType.DOUBLE

            8,      // deArray.InputType.BYTE
            16,     // deArray.InputType.SHORT

            8,      // deArray.InputType.UNSIGNED_BYTE
            16,     // deArray.InputType.UNSIGNED_SHORT

            32,     // deArray.InputType.INT
            32,     // deArray.InputType.UNSIGNED_INT
            16,     // deArray.InputType.HALF
            32 / 4, // deArray.InputType.UNSIGNED_INT_2_10_10_10
            32 / 4  // deArray.InputType.INT_2_10_10_10
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
        /** @type {deArray.Storage} */ this.m_ctx = context;
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
            GLU_EXPECT_NO_ERROR(m_ctx.getError(), "gl.genBuffers()");
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
    ContextArray.prototype.isBound = function () const { return this.m_bound; };

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
            GLU_EXPECT_NO_ERROR(m_ctx.getError(), "gl.bindBuffer()");

            this.m_ctx.bufferData(ContextArray.targetToGL(target), size, ptr, ContextArray.usageToGL(usage));
            GLU_EXPECT_NO_ERROR(m_ctx.getError(), "gl.bufferData()");
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
            GLU_EXPECT_NO_ERROR(m_ctx.getError(), "gl.bindBuffer()");

            m_ctx.bufferSubData(ContextArray.targetToGL(target), offset, size, ptr);
            GLU_EXPECT_NO_ERROR(m_ctx.getError(), "gl.bufferSubData()");
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
    ContextArray.prototype.bind = function (attribNdx, offset, size, inputType, outType, normalized, stride) {
        this.m_attribNdx         = attribNdx;
        this.m_bound             = true;
        this.m_componentCount    = size;
        this.m_inputType         = inputType;
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
            GLU_EXPECT_NO_ERROR(m_ctx.getError(), "gl.bindBuffer()");

            if (!inputTypeIsFloatType(this.m_inputType))
            {
                // Input is not float type

                if (outputTypeIsFloatType(this.m_outputType))
                {
                    // Output type is float type
                    this.m_ctx.vertexAttribPointer(loc, this.m_componentCount, ContextArray.inputTypeToGL(this.m_inputType), this.m_normalize, this.m_stride, this.m_offset);
                    GLU_EXPECT_NO_ERROR(m_ctx.getError(), "gl.vertexAttribPointer()");
                }
                else
                {
                    // Output type is int type
                    this.m_ctx.vertexAttribIPointer(loc, this.m_componentCount, ContextArray.inputTypeToGL(this.m_inputType), this.m_stride, this.m_offset);
                    GLU_EXPECT_NO_ERROR(m_ctx.getError(), "gl.vertexAttribPointer()");
                }
            }
            else
            {
                // Input type is float type

                // Output type must be float type
                DE_ASSERT(this.m_outputType == deArray.OutputType.FLOAT || this.m_outputType == deArray.OutputType.VEC2 || this.m_outputType == deArray.OutputType.VEC3 || this.m_outputType == deArray.OutputType.VEC4);

                this.m_ctx.vertexAttribPointer(loc, this.m_componentCount, ContextArray.inputTypeToGL(this.m_inputType), this.m_normalize, this.m_stride, this.m_offset);
                GLU_EXPECT_NO_ERROR(m_ctx.getError(), "gl.vertexAttribPointer()");
            }

            this.m_ctx.bindBuffer(ContextArray.targetToGL(this.m_target), 0);
        }
        else if (this.m_storage == deArray.Storage.USER) {
            m_ctx.bindBuffer(targetToGL(m_target), 0);
            GLU_EXPECT_NO_ERROR(m_ctx.getError(), "gl.bindBuffer()");

            if (!inputTypeIsFloatType(this.m_inputType)) {
                // Input is not float type

                if (outputTypeIsFloatType(this.m_outputType)) {
                    // Output type is float type
                    this.m_ctx.vertexAttribPointer(loc, this.m_componentCount, ContextArray.inputTypeToGL(this.m_inputType), this.m_normalize, this.m_stride, this.m_data.subarray(this.m_offset));
                    GLU_EXPECT_NO_ERROR(m_ctx.getError(), "gl.vertexAttribPointer()");
                }
                else {
                    // Output type is int type
                    this.m_ctx.vertexAttribIPointer(loc, this.m_componentCount, ContextArray.inputTypeToGL(this.m_inputType), this.m_stride, this.m_data.subarray(this.m_offset));
                    GLU_EXPECT_NO_ERROR(m_ctx.getError(), "gl.vertexAttribIPointer()");
                }
            }
            else {
                // Input type is float type

                // Output type must be float type
                DE_ASSERT(this.this.m_outputType == deArray.OutType.FLOAT || this.m_outputType == deArray.OutType.VEC2 || this.m_outputType == deArray.OutType.VEC3 || this.m_outputType == deArray.OutType.VEC4);

                this.m_ctx.vertexAttribPointer(loc, this.m_componentCount, ContextArray.inputTypeToGL(this.m_inputType), this.m_normalize, this.m_stride, this.m_data.subarray(this.m_offset));
                GLU_EXPECT_NO_ERROR(m_ctx.getError(), "gl.vertexAttribPointer()");
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
            "uvec4",        // deArray.OutputType.UVEC4
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
        /** @type {ReferenceRasterizerContext} */ this.m_ctx = drawContext;

        /** @type {Array.<ContextArray>} */ this.m_arrays = [];
        /** @type {ShaderProgram} */ this.m_program = DE_NULL;
        /** @type {tcuSurface.Surface} */ this.m_screen = new tcuSurface.Surface(
            Math.min(512, renderCtx.getRenderTarget().getWidth()), 
            Math.min(512, renderCtx.getRenderTarget().getHeight())
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
    ContextArrayPack.newArray = functional(storage)
    {
        this.m_arrays.push(new ContextArray(storage, this.m_ctx));
    };

    /*{
    public:
        ContextArrayPack    (glu::RenderContext& renderCtx, sglr::Context& drawContext);
        virtual                     ~ContextArrayPack   (void);
        virtual Array*              getArray            (int i);
        virtual int                 getArrayCount       (void);
        virtual void                newArray            (Array::Storage storage);
        virtual void                render              (Array::Primitive primitive, int firstVertex, int vertexCount, bool useVao, float coordScale, float colorScale);
        
        const tcu::Surface&         getSurface          (void) const { return m_screen; }
    private:
        void                        updateProgram       (void);
        glu::RenderContext&         m_renderCtx;
        sglr::Context&              m_ctx;
        
        std::vector<ContextArray*>  m_arrays;
        sglr::ShaderProgram*        m_program;
        tcu::Surface                m_screen;
    };*/
});

