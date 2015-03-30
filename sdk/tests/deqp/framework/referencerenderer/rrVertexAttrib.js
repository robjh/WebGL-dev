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

define(['framework/common/tcuTexture', 'framework/delibs/debase/deMath'], function(tcuTexture, deMath) {

    var DE_NULL = null;

    /**
     * VertexAttribType enum
     * @enum
     */
    var VertexAttribType = {
        // Can only be read as floats
        FLOAT: 0,
        HALF: 1,
        FIXED: 2,
        DOUBLE: 3,

        // Can only be read as floats, will be normalized
        NONPURE_UNORM8: 4,
        NONPURE_UNORM16: 5,
        NONPURE_UNORM32: 6,
        NONPURE_UNORM_2_10_10_10_REV: 7,          //!< Packed format, only size = 4 is allowed

        // Clamped formats, GLES3-style conversion: max{c / (2^(b-1) - 1), -1 }
        NONPURE_SNORM8_CLAMP: 8,
        NONPURE_SNORM16_CLAMP: 9,
        NONPURE_SNORM32_CLAMP: 10,
        NONPURE_SNORM_2_10_10_10_REV_CLAMP: 11,    //!< Packed format, only size = 4 is allowed

        // Scaled formats, GLES2-style conversion: (2c + 1) / (2^b - 1)
        NONPURE_SNORM8_SCALE: 12,
        NONPURE_SNORM16_SCALE: 13,
        NONPURE_SNORM32_SCALE: 14,
        NONPURE_SNORM_2_10_10_10_REV_SCALE: 15,    //!< Packed format, only size = 4 is allowed

        // can only be read as float, will not be normalized
        NONPURE_UINT8: 16,
        NONPURE_UINT16: 17,
        NONPURE_UINT32: 18,

        NONPURE_INT8: 19,
        NONPURE_INT16: 20,
        NONPURE_INT32: 21,

        NONPURE_UINT_2_10_10_10_REV: 22,   //!< Packed format, only size = 4 is allowed
        NONPURE_INT_2_10_10_10_REV: 23,    //!< Packed format, only size = 4 is allowed

        // can only be read as integers
        PURE_UINT8: 24,
        PURE_UINT16: 25,
        PURE_UINT32: 26,

        PURE_INT8: 27,
        PURE_INT16: 28,
        PURE_INT32: 29,

        // reordered formats of GL_ARB_vertex_array_bgra
        NONPURE_UNORM8_BGRA: 30,
        NONPURE_UNORM_2_10_10_10_REV_BGRA: 31,
        NONPURE_SNORM_2_10_10_10_REV_CLAMP_BGRA: 32,
        NONPURE_SNORM_2_10_10_10_REV_SCALE_BGRA: 33,

        // can be read as anything
        DONT_CARE: 34                 //!< Do not enforce type checking when reading GENERIC attribute. Used for current client side attributes.
    };

    /**
     * VertexAttrib class
     */
    var VertexAttrib = function () {
        /** @type {VertexAttribType} */ this.type = VertexAttribType.FLOAT;
        /** @type {number} */ this.size = 0;
        /** @type {number} */ this.stride = 0;
        /** @type {number} */ this.instanceDivisor = 0;
        /** @type {ArrayBuffer} TODO: Check if not Uint8Array*/ this.pointer = DE_NULL;
        /** @type {Array.<number> */ this.generic; //!< Generic attribute, used if pointer is null.
    };

});