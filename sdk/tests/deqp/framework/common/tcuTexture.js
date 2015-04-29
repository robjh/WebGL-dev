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
goog.provide('framework.common.tcuTexture');
goog.require('framework.common.tcuFloat');
goog.require('framework.delibs.debase.deMath');

goog.scope(function() {

var tcuTexture = framework.common.tcuTexture;
var deMath = framework.delibs.debase.deMath;
var tcuFloat = framework.common.tcuFloat;

var DE_ASSERT = function(x) {
    if (!x)
        throw new Error('Assert failed');
};

/**
 * Texture tcuTexture.channel order
 * @enum
 */
tcuTexture.ChannelOrder = {
    R: 0,
    A: 1,
    I: 2,
    L: 3,
    LA: 4,
    RG: 5,
    RA: 6,
    RGB: 7,
    RGBA: 8,
    ARGB: 9,
    BGRA: 10,

    sRGB: 11,
    sRGBA: 12,

    D: 13,
    S: 14,
    DS: 15
};

/**
 * Texture tcuTexture.channel type
 * @enum
 */
tcuTexture.ChannelType = {
    SNORM_INT8: 0,
    SNORM_INT16: 1,
    SNORM_INT32: 2,
    UNORM_INT8: 3,
    UNORM_INT16: 4,
    UNORM_INT32: 5,
    UNORM_SHORT_565: 6,
    UNORM_SHORT_555: 7,
    UNORM_SHORT_4444: 8,
    UNORM_SHORT_5551: 9,
    UNORM_INT_101010: 10,
    UNORM_INT_1010102_REV: 11,
    UNSIGNED_INT_1010102_REV: 12,
    UNSIGNED_INT_11F_11F_10F_REV: 13,
    UNSIGNED_INT_999_E5_REV: 14,
    UNSIGNED_INT_24_8: 15,
    SIGNED_INT8: 16,
    SIGNED_INT16: 17,
    SIGNED_INT32: 18,
    UNSIGNED_INT8: 19,
    UNSIGNED_INT16: 20,
    UNSIGNED_INT32: 21,
    HALF_FLOAT: 22,
    FLOAT: 23,
    FLOAT_UNSIGNED_INT_24_8_REV: 24
};

/**
 * Contruct texture format
 * @param {tcuTexture.ChannelOrder} order
 * @param {tcuTexture.ChannelType} type
 *
 * @constructor
 */
tcuTexture.TextureFormat = function(order, type) {
    this.order = order;
    this.type = type;
};

/**
 * Compare two formats
 * @param {tcuTexture.TextureFormat} format Format to compare with
 * @return {boolean}
 */
tcuTexture.TextureFormat.prototype.isEqual = function(format) {
    return this.order === format.order && this.type === format.type;
};

/**
 * Is format sRGB?
 * @return {boolean}
 */
tcuTexture.TextureFormat.prototype.isSRGB = function() {
    return this.order === tcuTexture.ChannelOrder.sRGB || this.order === tcuTexture.ChannelOrder.sRGBA;
};

tcuTexture.TextureFormat.prototype.getNumStencilBits = function() {
    switch (this.order) {
        case tcuTexture.ChannelOrder.S:
            switch (this.type) {
                case tcuTexture.ChannelType.UNSIGNED_INT8: return 8;
                case tcuTexture.ChannelType.UNSIGNED_INT16: return 16;
                case tcuTexture.ChannelType.UNSIGNED_INT32: return 32;
                default:
                    throw new Error('Wrong type: ' + this.type);
            }

        case tcuTexture.ChannelOrder.DS:
            switch (this.type) {
                case tcuTexture.ChannelType.UNSIGNED_INT_24_8: return 8;
                case tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV: return 8;
                default:
                    throw new Error('Wrong type: ' + this.type);
            }

        default:
            throw new Error('Wrong order: ' + this.order);
    }
};

/**
 * Get TypedArray type that can be used to access texture.
 * @param {tcuTexture.ChannelType} type
 * @return TypedArray that supports the tcuTexture.channel type.
 */
tcuTexture.getTypedArray = function(type) {
    switch (type) {
        case tcuTexture.ChannelType.SNORM_INT8: return Int8Array;
        case tcuTexture.ChannelType.SNORM_INT16: return Int16Array;
        case tcuTexture.ChannelType.SNORM_INT32: return Int32Array;
        case tcuTexture.ChannelType.UNORM_INT8: return Uint8Array;
        case tcuTexture.ChannelType.UNORM_INT16: return Uint16Array;
        case tcuTexture.ChannelType.UNORM_INT32: return Uint32Array;
        case tcuTexture.ChannelType.UNORM_SHORT_565: return Uint16Array;
        case tcuTexture.ChannelType.UNORM_SHORT_555: return Uint16Array;
        case tcuTexture.ChannelType.UNORM_SHORT_4444: return Uint16Array;
        case tcuTexture.ChannelType.UNORM_SHORT_5551: return Uint16Array;
        case tcuTexture.ChannelType.UNORM_INT_101010: return Uint32Array;
        case tcuTexture.ChannelType.UNORM_INT_1010102_REV: return Uint32Array;
        case tcuTexture.ChannelType.UNSIGNED_INT_1010102_REV: return Uint32Array;
        case tcuTexture.ChannelType.UNSIGNED_INT_11F_11F_10F_REV: return Uint32Array;
        case tcuTexture.ChannelType.UNSIGNED_INT_999_E5_REV: return Uint32Array;
        case tcuTexture.ChannelType.UNSIGNED_INT_24_8: return Uint32Array;
        case tcuTexture.ChannelType.FLOAT: return Float32Array;
        case tcuTexture.ChannelType.SIGNED_INT8: return Int8Array;
        case tcuTexture.ChannelType.SIGNED_INT16: return Int16Array;
        case tcuTexture.ChannelType.SIGNED_INT32: return Int32Array;
        case tcuTexture.ChannelType.UNSIGNED_INT8: return Uint8Array;
        case tcuTexture.ChannelType.UNSIGNED_INT16: return Uint16Array;
        case tcuTexture.ChannelType.UNSIGNED_INT32: return Uint32Array;
        case tcuTexture.ChannelType.HALF_FLOAT: return Uint16Array;
        case tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV: return Float32Array; /* this type is a special case */
    }

    throw new Error('Unrecognized type ' + type);
};

/**
 * @return {number} pixel size in bytes
 */
tcuTexture.TextureFormat.prototype.getPixelSize = function() {
    if (this.type == null || this.order == null) {
        // Invalid/empty format.
        return 0;
    } else if (this.type == tcuTexture.ChannelType.UNORM_SHORT_565 ||
             this.type == tcuTexture.ChannelType.UNORM_SHORT_555 ||
             this.type == tcuTexture.ChannelType.UNORM_SHORT_4444 ||
             this.type == tcuTexture.ChannelType.UNORM_SHORT_5551) {
        DE_ASSERT(this.order == tcuTexture.ChannelOrder.RGB || this.order == tcuTexture.ChannelOrder.RGBA);
        return 2;
    } else if (this.type == tcuTexture.ChannelType.UNORM_INT_101010 ||
             this.type == tcuTexture.ChannelType.UNSIGNED_INT_999_E5_REV ||
             this.type == tcuTexture.ChannelType.UNSIGNED_INT_11F_11F_10F_REV) {
        DE_ASSERT(this.order == tcuTexture.ChannelOrder.RGB);
        return 4;
    } else if (this.type == tcuTexture.ChannelType.UNORM_INT_1010102_REV ||
             this.type == tcuTexture.ChannelType.UNSIGNED_INT_1010102_REV) {
        DE_ASSERT(this.order == tcuTexture.ChannelOrder.RGBA);
        return 4;
    } else if (this.type == tcuTexture.ChannelType.UNSIGNED_INT_24_8) {
        DE_ASSERT(this.order == tcuTexture.ChannelOrder.D || this.order == tcuTexture.ChannelOrder.DS);
        return 4;
    } else if (this.type == tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV) {
        DE_ASSERT(this.order == tcuTexture.ChannelOrder.DS);
        return 8;
    } else {
        var numChannels;
        var channelSize;

        switch (this.order) {
            case tcuTexture.ChannelOrder.R: numChannels = 1; break;
            case tcuTexture.ChannelOrder.A: numChannels = 1; break;
            case tcuTexture.ChannelOrder.I: numChannels = 1; break;
            case tcuTexture.ChannelOrder.L: numChannels = 1; break;
            case tcuTexture.ChannelOrder.LA: numChannels = 2; break;
            case tcuTexture.ChannelOrder.RG: numChannels = 2; break;
            case tcuTexture.ChannelOrder.RA: numChannels = 2; break;
            case tcuTexture.ChannelOrder.RGB: numChannels = 3; break;
            case tcuTexture.ChannelOrder.RGBA: numChannels = 4; break;
            case tcuTexture.ChannelOrder.ARGB: numChannels = 4; break;
            case tcuTexture.ChannelOrder.BGRA: numChannels = 4; break;
            case tcuTexture.ChannelOrder.sRGB: numChannels = 3; break;
            case tcuTexture.ChannelOrder.sRGBA: numChannels = 4; break;
            case tcuTexture.ChannelOrder.D: numChannels = 1; break;
            case tcuTexture.ChannelOrder.S: numChannels = 1; break;
            case tcuTexture.ChannelOrder.DS: numChannels = 2; break;
            default: DE_ASSERT(false);
        }

        switch (this.type) {
            case tcuTexture.ChannelType.SNORM_INT8: channelSize = 1; break;
            case tcuTexture.ChannelType.SNORM_INT16: channelSize = 2; break;
            case tcuTexture.ChannelType.SNORM_INT32: channelSize = 4; break;
            case tcuTexture.ChannelType.UNORM_INT8: channelSize = 1; break;
            case tcuTexture.ChannelType.UNORM_INT16: channelSize = 2; break;
            case tcuTexture.ChannelType.UNORM_INT32: channelSize = 4; break;
            case tcuTexture.ChannelType.SIGNED_INT8: channelSize = 1; break;
            case tcuTexture.ChannelType.SIGNED_INT16: channelSize = 2; break;
            case tcuTexture.ChannelType.SIGNED_INT32: channelSize = 4; break;
            case tcuTexture.ChannelType.UNSIGNED_INT8: channelSize = 1; break;
            case tcuTexture.ChannelType.UNSIGNED_INT16: channelSize = 2; break;
            case tcuTexture.ChannelType.UNSIGNED_INT32: channelSize = 4; break;
            case tcuTexture.ChannelType.HALF_FLOAT: channelSize = 2; break;
            case tcuTexture.ChannelType.FLOAT: channelSize = 4; break;
            default: DE_ASSERT(false);
        }

        return numChannels * channelSize;
    }
};

/**
 * @enum
 */
tcuTexture.CubeFace = {
    CUBEFACE_NEGATIVE_X: 0,
    CUBEFACE_POSITIVE_X: 1,
    CUBEFACE_NEGATIVE_Y: 2,
    CUBEFACE_POSITIVE_Y: 3,
    CUBEFACE_NEGATIVE_Z: 4,
    CUBEFACE_POSITIVE_Z: 5
};

/**
 * Renamed from ArrayBuffer due to name clash
 * Wraps ArrayBuffer.
 * @constructor
 * @param {number=} numElements
 */
tcuTexture.DeqpArrayBuffer = function(numElements) {
    if (numElements)
        this.m_ptr = new ArrayBuffer(numElements);
};

/**
 * Set array size
 * @param {number} numElements Size in bytes
 */
tcuTexture.DeqpArrayBuffer.prototype.setStorage = function(numElements) {
    this.m_ptr = new ArrayBuffer(numElements);
};

/**
 * @return {number} Buffer size
 */
tcuTexture.DeqpArrayBuffer.prototype.size = function() {
    if (this.m_ptr)
        return this.m_ptr.byteLength;

    return 0;
};

/**
 * Is the buffer empty (zero size)?
 * @return {boolean}
 */
tcuTexture.DeqpArrayBuffer.prototype.empty = function() {
    if (!this.m_ptr)
        return true;
    return this.size() == 0;
};

/**
 * @enum
 * The values are negative to avoid conflict with channels 0 - 3
 */
tcuTexture.channel = {
    ZERO: -1,
    ONE: -2
};

/**
 * @param {tcuTexture.ChannelOrder} order
 * @return {Array<Number|tcuTexture.channel>}
 */
tcuTexture.getChannelReadMap = function(order) {
    switch (order) {
    /*static const Channel INV[] = { tcuTexture.channel.ZERO, tcuTexture.channel.ZERO, tcuTexture.channel.ZERO, tcuTexture.channel.ONE }; */

    case tcuTexture.ChannelOrder.R: return [0, tcuTexture.channel.ZERO, tcuTexture.channel.ZERO, tcuTexture.channel.ONE];
    case tcuTexture.ChannelOrder.A: return [tcuTexture.channel.ZERO, tcuTexture.channel.ZERO, tcuTexture.channel.ZERO, 0];
    case tcuTexture.ChannelOrder.I: return [0, 0, 0, 0];
    case tcuTexture.ChannelOrder.L: return [0, 0, 0, tcuTexture.channel.ONE];
    case tcuTexture.ChannelOrder.LA: return [0, 0, 0, 1];
    case tcuTexture.ChannelOrder.RG: return [0, 1, tcuTexture.channel.ZERO, tcuTexture.channel.ONE];
    case tcuTexture.ChannelOrder.RA: return [0, tcuTexture.channel.ZERO, tcuTexture.channel.ZERO, 1];
    case tcuTexture.ChannelOrder.RGB: return [0, 1, 2, tcuTexture.channel.ONE];
    case tcuTexture.ChannelOrder.RGBA: return [0, 1, 2, 3];
    case tcuTexture.ChannelOrder.BGRA: return [2, 1, 0, 3];
    case tcuTexture.ChannelOrder.ARGB: return [1, 2, 3, 0];
    case tcuTexture.ChannelOrder.sRGB: return [0, 1, 2, tcuTexture.channel.ONE];
    case tcuTexture.ChannelOrder.sRGBA: return [0, 1, 2, 3];
    case tcuTexture.ChannelOrder.D: return [0, tcuTexture.channel.ZERO, tcuTexture.channel.ZERO, tcuTexture.channel.ONE];
    case tcuTexture.ChannelOrder.S: return [tcuTexture.channel.ZERO, tcuTexture.channel.ZERO, tcuTexture.channel.ZERO, 0];
    case tcuTexture.ChannelOrder.DS: return [0, tcuTexture.channel.ZERO, tcuTexture.channel.ZERO, 1];
    }

    throw new Error('Unrecognized order ' + order);
};

/**
 * @param {tcuTexture.ChannelOrder} order
 * @return {Array<number>}
 */
tcuTexture.getChannelWriteMap = function(order) {
    switch (order) {
        case tcuTexture.ChannelOrder.R: return [0];
        case tcuTexture.ChannelOrder.A: return [3];
        case tcuTexture.ChannelOrder.I: return [0];
        case tcuTexture.ChannelOrder.L: return [0];
        case tcuTexture.ChannelOrder.LA: return [0, 3];
        case tcuTexture.ChannelOrder.RG: return [0, 1];
        case tcuTexture.ChannelOrder.RA: return [0, 3];
        case tcuTexture.ChannelOrder.RGB: return [0, 1, 2];
        case tcuTexture.ChannelOrder.RGBA: return [0, 1, 2, 3];
        case tcuTexture.ChannelOrder.ARGB: return [3, 0, 1, 2];
        case tcuTexture.ChannelOrder.BGRA: return [2, 1, 0, 3];
        case tcuTexture.ChannelOrder.sRGB: return [0, 1, 2];
        case tcuTexture.ChannelOrder.sRGBA: return [0, 1, 2, 3];
        case tcuTexture.ChannelOrder.D: return [0];
        case tcuTexture.ChannelOrder.S: return [3];
        case tcuTexture.ChannelOrder.DS: return [0, 3];
    }
    throw new Error('Unrecognized order ' + order);
};

/**
 * @param {tcuTexture.ChannelType} type
 * @return {number}
 */
tcuTexture.getChannelSize = function(type) {
    switch (type) {
        case tcuTexture.ChannelType.SNORM_INT8: return 1;
        case tcuTexture.ChannelType.SNORM_INT16: return 2;
        case tcuTexture.ChannelType.SNORM_INT32: return 4;
        case tcuTexture.ChannelType.UNORM_INT8: return 1;
        case tcuTexture.ChannelType.UNORM_INT16: return 2;
        case tcuTexture.ChannelType.UNORM_INT32: return 4;
        case tcuTexture.ChannelType.SIGNED_INT8: return 1;
        case tcuTexture.ChannelType.SIGNED_INT16: return 2;
        case tcuTexture.ChannelType.SIGNED_INT32: return 4;
        case tcuTexture.ChannelType.UNSIGNED_INT8: return 1;
        case tcuTexture.ChannelType.UNSIGNED_INT16: return 2;
        case tcuTexture.ChannelType.UNSIGNED_INT32: return 4;
        case tcuTexture.ChannelType.HALF_FLOAT: return 2;
        case tcuTexture.ChannelType.FLOAT: return 4;

    }
    throw new Error('Unrecognized type ' + type);
};

/**
 * @param {number} src Source value
 * @param {number} bits Source value size in bits
 * @return {number} Normalized value
 */
tcuTexture.channelToNormFloat = function(src, bits) {
    var maxVal = (1 << bits) - 1;
    return src / maxVal;
};

/**
 * @param {number} value Source value
 * @param {tcuTexture.ChannelType} type
 * @return {number} Source value converted to float
 */
tcuTexture.channelToFloat = function(value, type) {
    switch (type) {
        case tcuTexture.ChannelType.SNORM_INT8: return Math.max(-1, value / 127);
        case tcuTexture.ChannelType.SNORM_INT16: return Math.max(-1, value / 32767);
        case tcuTexture.ChannelType.SNORM_INT32: return Math.max(-1, value / 2147483647);
        case tcuTexture.ChannelType.UNORM_INT8: return value / 255;
        case tcuTexture.ChannelType.UNORM_INT16: return value / 65535;
        case tcuTexture.ChannelType.UNORM_INT32: return value / 4294967295;
        case tcuTexture.ChannelType.SIGNED_INT8: return value;
        case tcuTexture.ChannelType.SIGNED_INT16: return value;
        case tcuTexture.ChannelType.SIGNED_INT32: return value;
        case tcuTexture.ChannelType.UNSIGNED_INT8: return value;
        case tcuTexture.ChannelType.UNSIGNED_INT16: return value;
        case tcuTexture.ChannelType.UNSIGNED_INT32: return value;
        case tcuTexture.ChannelType.HALF_FLOAT: return tcuFloat.halfFloatToNumber(value);
        case tcuTexture.ChannelType.FLOAT: return value;
    }
    throw new Error('Unrecognized tcuTexture.channel type ' + type);
};

/**
 * @param {number} value Source value
 * @param {tcuTexture.ChannelType} type
 * @return {number} Source value converted to int
 */
tcuTexture.channelToInt = function(value, type) {
    switch (type) {
        case tcuTexture.ChannelType.HALF_FLOAT: return Math.round(tcuFloat.halfFloatToNumber(value));
        case tcuTexture.ChannelType.FLOAT: return Math.round(value);
        default:
            return value;
    }
};

/**
 * @param {tcuTexture.ChannelOrder} order
 * @return {number}
 */
tcuTexture.getNumUsedChannels = function(order) {
    switch (order) {
        case tcuTexture.ChannelOrder.R: return 1;
        case tcuTexture.ChannelOrder.A: return 1;
        case tcuTexture.ChannelOrder.I: return 1;
        case tcuTexture.ChannelOrder.L: return 1;
        case tcuTexture.ChannelOrder.LA: return 2;
        case tcuTexture.ChannelOrder.RG: return 2;
        case tcuTexture.ChannelOrder.RA: return 2;
        case tcuTexture.ChannelOrder.RGB: return 3;
        case tcuTexture.ChannelOrder.RGBA: return 4;
        case tcuTexture.ChannelOrder.ARGB: return 4;
        case tcuTexture.ChannelOrder.BGRA: return 4;
        case tcuTexture.ChannelOrder.sRGB: return 3;
        case tcuTexture.ChannelOrder.sRGBA: return 4;
        case tcuTexture.ChannelOrder.D: return 1;
        case tcuTexture.ChannelOrder.S: return 1;
        case tcuTexture.ChannelOrder.DS: return 2;
    }
    throw new Error('Unrecognized tcuTexture.channel order ' + order);
};

/**
 * @enum
 */
tcuTexture.WrapMode = {
    CLAMP_TO_EDGE: 0, //! Clamp to edge
    CLAMP_TO_BORDER: 1, //! Use border color at edge
    REPEAT_GL: 2, //! Repeat with OpenGL semantics
    REPEAT_CL: 3, //! Repeat with OpenCL semantics
    MIRRORED_REPEAT_GL: 4, //! Mirrored repeat with OpenGL semantics
    MIRRORED_REPEAT_CL: 5 //! Mirrored repeat with OpenCL semantics
};

/**
 * @enum
 */
tcuTexture.FilterMode = {
    NEAREST: 0,
    LINEAR: 1,

    NEAREST_MIPMAP_NEAREST: 2,
    NEAREST_MIPMAP_LINEAR: 3,
    LINEAR_MIPMAP_NEAREST: 4,
    LINEAR_MIPMAP_LINEAR: 5
};

/**
 * @enum
 */
tcuTexture.CompareMode = {
    COMPAREMODE_NONE: 0,
    COMPAREMODE_LESS: 1,
    COMPAREMODE_LESS_OR_EQUAL: 2,
    COMPAREMODE_GREATER: 3,
    COMPAREMODE_GREATER_OR_EQUAL: 4,
    COMPAREMODE_EQUAL: 5,
    COMPAREMODE_NOT_EQUAL: 6,
    COMPAREMODE_ALWAYS: 7,
    COMPAREMODE_NEVER: 8
};

/**
 * @constructor
 * @param {tcuTexture.WrapMode} wrapS
 * @param {tcuTexture.WrapMode} wrapT
 * @param {tcuTexture.WrapMode} wrapR
 * @param {tcuTexture.FilterMode} minFilter
 * @param {tcuTexture.FilterMode} magFilter
 * @param {number=} lodThreshold
 * @param {boolean=} normalizedCoords
 * @param {tcuTexture.CompareMode=} compare
 * @param {number=} compareChannel
 * @param {Array<number>=} borderColor
 * @param {boolean=} seamlessCubeMap
 */
tcuTexture.Sampler = function(wrapS, wrapT, wrapR, minFilter, magFilter, lodThreshold, normalizedCoords, compare, compareChannel, borderColor, seamlessCubeMap) {
    this.wrapS = wrapS;
    this.wrapT = wrapT;
    this.wrapR = wrapR;
    this.minFilter = minFilter;
    this.magFilter = magFilter;
    this.lodThreshold = lodThreshold || 0;
    this.normalizedCoords = normalizedCoords === undefined ? true : normalizedCoords;
    this.compare = compare || tcuTexture.CompareMode.COMPAREMODE_NONE;
    this.compareChannel = compareChannel || 0;
    this.borderColor = borderColor || [0, 0, 0, 0];
    this.seamlessCubeMap = seamlessCubeMap || false;
};

/**
 * Special unnormalization for REPEAT_CL and MIRRORED_REPEAT_CL tcuTexture.wrap modes; otherwise ordinary unnormalization.
 * @param {tcuTexture.WrapMode} mode
 * @param {number} c Value to tcuTexture.unnormalize
 * @param {number} size Unnormalized type size (integer)
 * @return {number}
 */
tcuTexture.unnormalize = function(mode, c, size) {
    switch (mode) {
        case tcuTexture.WrapMode.CLAMP_TO_EDGE:
        case tcuTexture.WrapMode.CLAMP_TO_BORDER:
        case tcuTexture.WrapMode.REPEAT_GL:
        case tcuTexture.WrapMode.MIRRORED_REPEAT_GL: // Fall-through (ordinary case).
            return size * c;

        case tcuTexture.WrapMode.REPEAT_CL:
            return size * (c - Math.floor(c));

        case tcuTexture.WrapMode.MIRRORED_REPEAT_CL:
            return size * Math.abs(c - 2 * deMath.rint(0.5 * c));
    }
    throw new Error('Unrecognized tcuTexture.wrap mode ' + mode);
};

/**
 * @param {tcuTexture.WrapMode} mode
 * @param {number} c Source value (integer)
 * @param {number} size Type size (integer)
 * @return {number}
 */
tcuTexture.wrap = function(mode, c, size) {
    switch (mode) {
        case tcuTexture.WrapMode.CLAMP_TO_BORDER:
            return deMath.clamp(c, -1, size);

        case tcuTexture.WrapMode.CLAMP_TO_EDGE:
            return deMath.clamp(c, 0, size - 1);

        case tcuTexture.WrapMode.REPEAT_GL:
            return deMath.imod(c, size);

        case tcuTexture.WrapMode.REPEAT_CL:
            return deMath.imod(c, size);

        case tcuTexture.WrapMode.MIRRORED_REPEAT_GL:
            return (size - 1) - deMath.mirror(deMath.imod(c, 2 * size) - size);

        case tcuTexture.WrapMode.MIRRORED_REPEAT_CL:
            return deMath.clamp(c, 0, size - 1); // \note Actual mirroring done already in unnormalization function.
    }
    throw new Error('Unrecognized tcuTexture.wrap mode ' + mode);
};

/**
 * @param {number} cs
 * @return {number}
 */
tcuTexture.sRGBChannelToLinear = function(cs) {
    if (cs <= 0.04045)
        return cs / 12.92;
    else
        return Math.pow((cs + 0.055) / 1.055, 2.4);
};

/**
 * Convert sRGB to linear colorspace
 * @param {Array<number>} cs Vec4
 * @return {Array<number>} Vec4
 */
tcuTexture.sRGBToLinear = function(cs) {
    return [
        tcuTexture.sRGBChannelToLinear(cs[0]),
        tcuTexture.sRGBChannelToLinear(cs[1]),
        tcuTexture.sRGBChannelToLinear(cs[2]),
        cs[3]
        ];
};

/**
 * Texel tcuTexture.lookup with color conversion.
 * @param {tcuTexture.ConstPixelBufferAccess} access
 * @param {number} i
 * @param {number} j
 * @param {number} k
 * @return {Array<number>} Vec4 pixel color
 */
tcuTexture.lookup = function(access, i, j, k) {
    var p = access.getPixel(i, j, k);
    // console.log('Lookup at ' + i + ' ' + j + ' ' + k + ' ' + p);
    return access.getFormat().isSRGB() ? tcuTexture.sRGBToLinear(p) : p;
};

/**
 * @param {tcuTexture.ConstPixelBufferAccess} access
 * @param {tcuTexture.Sampler} sampler
 * @param {number} u
 * @param {number} v
 * @param {number} depth (integer)
 * @return {Array<number>} Vec4 pixel color
 */
tcuTexture.sampleLinear2D = function(access, sampler, u, v, depth) {
    /**
     * @param {Array<number>} p00
     * @param {Array<number>} p10
     * @param {Array<number>} p01
     * @param {Array<number>} p11
     * @param {number} a
     * @param {number} b
     */
    var interpolateQuad = function(p00, p10, p01, p11, a, b) {
        var v1 = deMath.scale(p00, (1 - a) * (1 - b));
        var v2 = deMath.scale(p10, a * (1 - b));
        var v3 = deMath.scale(p01, (1 - a) * b);
        var v4 = deMath.scale(p11, a * b);
        return deMath.add(deMath.add(v1, v2), deMath.add(v3, v4));
    };

    var w = access.getWidth();
    var h = access.getHeight();

    var x0 = Math.floor(u - 0.5);
    var x1 = x0 + 1;
    var y0 = Math.floor(v - 0.5);
    var y1 = y0 + 1;

    var i0 = tcuTexture.wrap(sampler.wrapS, x0, w);
    var i1 = tcuTexture.wrap(sampler.wrapS, x1, w);
    var j0 = tcuTexture.wrap(sampler.wrapT, y0, h);
    var j1 = tcuTexture.wrap(sampler.wrapT, y1, h);

    var a = deMath.deFloatFrac(u - 0.5);
    var b = deMath.deFloatFrac(v - 0.5);

    var i0UseBorder = sampler.wrapS == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(i0, 0, w);
    var i1UseBorder = sampler.wrapS == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(i1, 0, w);
    var j0UseBorder = sampler.wrapT == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(j0, 0, h);
    var j1UseBorder = sampler.wrapT == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(j1, 0, h);

    // Border color for out-of-range coordinates if using CLAMP_TO_BORDER, otherwise execute lookups.
    var p00 = (i0UseBorder || j0UseBorder) ? sampler.borderColor : tcuTexture.lookup(access, i0, j0, depth);
    var p10 = (i1UseBorder || j0UseBorder) ? sampler.borderColor : tcuTexture.lookup(access, i1, j0, depth);
    var p01 = (i0UseBorder || j1UseBorder) ? sampler.borderColor : tcuTexture.lookup(access, i0, j1, depth);
    var p11 = (i1UseBorder || j1UseBorder) ? sampler.borderColor : tcuTexture.lookup(access, i1, j1, depth);

    // Interpolate.
    return interpolateQuad(p00, p10, p01, p11, a, b);
};

/**
 * @param {tcuTexture.ConstPixelBufferAccess} access
 * @param {tcuTexture.Sampler} sampler
 * @param {number} u
 * @param {number} v
 * @param {number} w
 * @return {Array<number>} Vec4 pixel color
 */
tcuTexture.sampleLinear3D = function(access, sampler, u, v, w) {
    /**
     * @param {Array<number>} p000
     * @param {Array<number>} p100
     * @param {Array<number>} p010
     * @param {Array<number>} p110
     * @param {Array<number>} p001
     * @param {Array<number>} p101
     * @param {Array<number>} p011
     * @param {Array<number>} p111
     * @param {number} a
     * @param {number} b
     * @param {number} c
     */
    var interpolateCube = function(p000, p100, p010, p110, p001, p101, p011, p111, a, b, c) {
        var v1 = deMath.scale(p000, (1 - a) * (1 - b) * (1 - c));
        var v2 = deMath.scale(p100, a * (1 - b) * (1 - c));
        var v3 = deMath.scale(p010, (1 - a) * b * (1 - c));
        var v4 = deMath.scale(p110, a * b * (1 - c));
        var v5 = deMath.scale(p001, (1 - a) * (1 - b) * c);
        var v6 = deMath.scale(p101, a * (1 - b) * c);
        var v7 = deMath.scale(p011, (1 - a) * b * c);
        var v8 = deMath.scale(p111, a * b * c);
        return deMath.add(deMath.add(deMath.add(v1, v2), deMath.add(v3, v4)), deMath.add(deMath.add(v5, v6), deMath.add(v7, v8)));
    };

    var width = access.getWidth();
    var height = access.getHeight();
    var depth = access.getDepth();

    var x0 = Math.floor(u - 0.5);
    var x1 = x0 + 1;
    var y0 = Math.floor(v - 0.5);
    var y1 = y0 + 1;
    var z0 = Math.floor(w - 0.5);
    var z1 = z0 + 1;

    var i0 = tcuTexture.wrap(sampler.wrapS, x0, width);
    var i1 = tcuTexture.wrap(sampler.wrapS, x1, width);
    var j0 = tcuTexture.wrap(sampler.wrapT, y0, height);
    var j1 = tcuTexture.wrap(sampler.wrapT, y1, height);
    var k0 = tcuTexture.wrap(sampler.wrapR, z0, depth);
    var k1 = tcuTexture.wrap(sampler.wrapR, z1, depth);

    var a = deMath.deFloatFrac(u - 0.5);
    var b = deMath.deFloatFrac(v - 0.5);
    var c = deMath.deFloatFrac(w - 0.5);

    var i0UseBorder = sampler.wrapS == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(i0, 0, width);
    var i1UseBorder = sampler.wrapS == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(i1, 0, width);
    var j0UseBorder = sampler.wrapT == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(j0, 0, height);
    var j1UseBorder = sampler.wrapT == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(j1, 0, height);
    var k0UseBorder = sampler.wrapR == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(k0, 0, depth);
    var k1UseBorder = sampler.wrapR == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(k1, 0, depth);

    // Border color for out-of-range coordinates if using CLAMP_TO_BORDER, otherwise execute lookups.
    var p000 = (i0UseBorder || j0UseBorder || k0UseBorder) ? sampler.borderColor : tcuTexture.lookup(access, i0, j0, k0);
    var p100 = (i1UseBorder || j0UseBorder || k0UseBorder) ? sampler.borderColor : tcuTexture.lookup(access, i1, j0, k0);
    var p010 = (i0UseBorder || j1UseBorder || k0UseBorder) ? sampler.borderColor : tcuTexture.lookup(access, i0, j1, k0);
    var p110 = (i1UseBorder || j1UseBorder || k0UseBorder) ? sampler.borderColor : tcuTexture.lookup(access, i1, j1, k0);
    var p001 = (i0UseBorder || j0UseBorder || k1UseBorder) ? sampler.borderColor : tcuTexture.lookup(access, i0, j0, k1);
    var p101 = (i1UseBorder || j0UseBorder || k1UseBorder) ? sampler.borderColor : tcuTexture.lookup(access, i1, j0, k1);
    var p011 = (i0UseBorder || j1UseBorder || k1UseBorder) ? sampler.borderColor : tcuTexture.lookup(access, i0, j1, k1);
    var p111 = (i1UseBorder || j1UseBorder || k1UseBorder) ? sampler.borderColor : tcuTexture.lookup(access, i1, j1, k1);

    // Interpolate.
    return interpolateCube(p000, p100, p010, p110, p001, p101, p011, p111, a, b, c);
};

/**
 * @param {tcuTexture.ConstPixelBufferAccess} access
 * @param {tcuTexture.Sampler} sampler
 * @param {number} u
 * @param {number} v
 * @param {number} depth (integer)
 * @return {Array<number>} Vec4 pixel color
 */
tcuTexture.sampleNearest2D = function(access, sampler, u, v, depth) {
    var width = access.getWidth();
    var height = access.getHeight();

    /* TODO: Shouldn't it be just Math.round? */
    var x = Math.round(Math.floor(u));
    var y = Math.round(Math.floor(v));

    // Check for CLAMP_TO_BORDER.
    if ((sampler.wrapS == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(x, 0, width)) ||
        (sampler.wrapT == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(y, 0, height)))
        return sampler.borderColor;

    var i = tcuTexture.wrap(sampler.wrapS, x, width);
    var j = tcuTexture.wrap(sampler.wrapT, y, height);

    return tcuTexture.lookup(access, i, j, depth);
};

/**
 * @param {tcuTexture.ConstPixelBufferAccess} access
 * @param {tcuTexture.Sampler} sampler
 * @param {number} u
 * @param {number} v
 * @param {number} w
 * @return {Array<number>} Vec4 pixel color
 */
tcuTexture.sampleNearest3D = function(access, sampler, u, v, w) {
    var width = access.getWidth();
    var height = access.getHeight();
    var depth = access.getDepth();

    var x = Math.round(Math.floor(u));
    var y = Math.round(Math.floor(v));
    var z = Math.round(Math.floor(w));

    // Check for CLAMP_TO_BORDER.
    if ((sampler.wrapS == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(x, 0, width)) ||
        (sampler.wrapT == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(y, 0, height)) ||
        (sampler.wrapR == tcuTexture.WrapMode.CLAMP_TO_BORDER && !deMath.deInBounds32(z, 0, depth)))
        return sampler.borderColor;

    var i = tcuTexture.wrap(sampler.wrapS, x, width);
    var j = tcuTexture.wrap(sampler.wrapT, y, height);
    var k = tcuTexture.wrap(sampler.wrapR, z, depth);

    return tcuTexture.lookup(access, i, j, k);
};

/**
 * @param {Array<number>} color Vec4 color
 * @return {number} The color in packed 32 bit format
 */
tcuTexture.packRGB999E5 = function(color) {
    /** @const */ var mBits = 9;
    /** @const */ var eBits = 5;
    /** @const */ var eBias = 15;
    /** @const */ var eMax = (1 << eBits) - 1;
    /** @const */ var maxVal = (((1 << mBits) - 1) * (1 << (eMax - eBias))) / (1 << mBits);

    var rc = deMath.clamp(color[0], 0, maxVal);
    var gc = deMath.clamp(color[1], 0, maxVal);
    var bc = deMath.clamp(color[2], 0, maxVal);
    var maxc = Math.max(rc, gc, bc);
    var expp = Math.max(-eBias - 1, Math.floor(Math.log2(maxc))) + 1 + eBias;
    var e = Math.pow(2, expp - eBias - mBits);
    var maxs = Math.floor(maxc / e + 0.5);

    var exps = maxs == (1 << mBits) ? expp + 1 : expp;
    var rs = deMath.clamp(Math.floor(rc / e + 0.5), 0, (1 << 9) - 1);
    var gs = deMath.clamp(Math.floor(gc / e + 0.5), 0, (1 << 9) - 1);
    var bs = deMath.clamp(Math.floor(bc / e + 0.5), 0, (1 << 9) - 1);

    DE_ASSERT((exps & ~((1 << 5) - 1)) == 0);
    DE_ASSERT((rs & ~((1 << 9) - 1)) == 0);
    DE_ASSERT((gs & ~((1 << 9) - 1)) == 0);
    DE_ASSERT((bs & ~((1 << 9) - 1)) == 0);

    return rs | (gs << 9) | (bs << 18) | (exps << 27);
};

/**
 * @param {number} color Color in packed 32 bit format
 * @return {Array<number>} The color in unpacked format
 */
tcuTexture.unpackRGB999E5 = function(color) {
    var mBits = 9;
    var eBias = 15;

    var exp = (color >> 27) & ((1 << 5) - 1);
    var bs = (color >> 18) & ((1 << 9) - 1);
    var gs = (color >> 9) & ((1 << 9) - 1);
    var rs = color & ((1 << 9) - 1);

    var e = Math.pow(2, (exp - eBias - mBits));
    var r = rs * e;
    var g = gs * e;
    var b = bs * e;

    return [r, g, b, 1];
};

/**
 * \brief Read-only pixel data access
 *
 * tcuTexture.ConstPixelBufferAccess encapsulates pixel data pointer along with
 * format and layout information. It can be used for read-only access
 * to arbitrary pixel buffers.
 *
 * Access objects are like iterators or pointers. They can be passed around
 * as values and are valid as long as the storage doesn't change.
 * @constructor
 */
tcuTexture.ConstPixelBufferAccess = function(descriptor) {
    if (descriptor) {
        this.m_offset = descriptor.offset || 0;
        this.m_format = descriptor.format || new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA, tcuTexture.ChannelType.FLOAT);
        this.m_width = descriptor.width;
        this.m_height = descriptor.height;
        if (descriptor.depth)
            this.m_depth = descriptor.depth;
        else
            this.m_depth = 1;
        this.m_data = descriptor.data;
        if (descriptor.rowPitch)
            this.m_rowPitch = descriptor.rowPitch;
        else
            this.m_rowPitch = this.m_width * this.m_format.getPixelSize();

        if (descriptor.slicePitch)
            this.m_slicePitch = descriptor.slicePitch;
        else
            this.m_slicePitch = this.m_rowPitch * this.m_height;
    }
};

/** @return {number} */
tcuTexture.ConstPixelBufferAccess.prototype.getDataSize = function() { return this.m_depth * this.m_slicePitch; };
tcuTexture.ConstPixelBufferAccess.prototype.isEmpty = function() { return this.m_width == 0 || this.m_height == 0 || this.m_depth == 0; };
/** @return {goog.TypedArray} */
tcuTexture.ConstPixelBufferAccess.prototype.getDataPtr = function() {
    var arrayType = tcuTexture.getTypedArray(this.m_format.type);
    return new arrayType(this.m_data, this.m_offset);
};
/** @return {ArrayBuffer} */
tcuTexture.ConstPixelBufferAccess.prototype.getBuffer = function() {
    return this.m_data;
};
/** @return {number} */
tcuTexture.ConstPixelBufferAccess.prototype.getRowPitch = function() { return this.m_rowPitch; };
/** @return {number} */
tcuTexture.ConstPixelBufferAccess.prototype.getWidth = function() { return this.m_width; };
/** @return {number} */
tcuTexture.ConstPixelBufferAccess.prototype.getHeight = function() { return this.m_height; };
/** @return {number} */
tcuTexture.ConstPixelBufferAccess.prototype.getDepth = function() { return this.m_depth; };
/** @return {number} */
tcuTexture.ConstPixelBufferAccess.prototype.getSlicePitch = function() { return this.m_slicePitch; };
/** @return {tcuTexture.TextureFormat} */
tcuTexture.ConstPixelBufferAccess.prototype.getFormat = function() { return this.m_format; };

/**
 * @param {number} x
 * @param {number} y
 * @param {number=} z
 * @return {number} stencil value
 */
tcuTexture.ConstPixelBufferAccess.prototype.getPixStencil = function(x, y, z) {
    z = z || 0;

    DE_ASSERT(deMath.deInBounds32(x, 0, this.m_width));
    DE_ASSERT(deMath.deInBounds32(y, 0, this.m_height));
    DE_ASSERT(deMath.deInBounds32(z, 0, this.m_depth));

    // Make sure that the position is 'integer'
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);

    var pixelSize = this.m_format.getPixelSize();
    var arrayType = tcuTexture.getTypedArray(this.m_format.type);
    var offset = z * this.m_slicePitch + y * this.m_rowPitch + x * pixelSize;
    var pixelPtr = new arrayType(this.m_data, offset + this.m_offset);

    switch (this.m_format.type) {
        case tcuTexture.ChannelType.UNSIGNED_INT_24_8:
            switch (this.m_format.order) {
                case tcuTexture.ChannelOrder.S: return (pixelPtr[0] >> 8) & 0xff;
                case tcuTexture.ChannelOrder.DS: return pixelPtr[0] & 0xff;

                default:
                    DE_ASSERT(false);
                    return 0;
            }

        case tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV:
            DE_ASSERT(this.m_format.order == tcuTexture.ChannelOrder.DS);
            var u32array = new Uint32Array(this.m_data, offset + this.m_offset + 4, 1);
            return u32array[0] & 0xff;

        default: {
            if (this.m_format.order == tcuTexture.ChannelOrder.S)
                return tcuTexture.channelToInt(pixelPtr[0], this.m_format.type);
            else {
                DE_ASSERT(this.m_format.order == tcuTexture.ChannelOrder.DS);
                var stencilChannelIndex = 3;
                return tcuTexture.channelToInt(pixelPtr[stencilChannelIndex], this.m_format.type);
            }
        }
    }
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number=} z
 * @return {number}
 */
tcuTexture.ConstPixelBufferAccess.prototype.getPixDepth = function(x, y, z) {
    if (z == null)
        z = 0;
    DE_ASSERT(deMath.deInBounds32(x, 0, this.m_width));
    DE_ASSERT(deMath.deInBounds32(y, 0, this.m_height));
    DE_ASSERT(deMath.deInBounds32(z, 0, this.m_depth));

    // Make sure that the position is 'integer'
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);

    var pixelSize = this.m_format.getPixelSize();
    var arrayType = tcuTexture.getTypedArray(this.m_format.type);
    var offset = z * this.m_slicePitch + y * this.m_rowPitch + x * pixelSize;
    var pixelPtr = new arrayType(this.m_data, offset + this.m_offset);

    var ub = function(pixel, offset, count) {
        return (pixel >> offset) & ((1 << count) - 1);
    };
    var nb = function(pixel, offset, count) {
        return tcuTexture.channelToNormFloat(ub(pixel, offset, count), count);
    };

    // Packed formats.
    switch (this.m_format.type) {
        case tcuTexture.ChannelType.UNSIGNED_INT_24_8:
            switch (this.m_format.order) {
                case tcuTexture.ChannelOrder.D: // fall-through
                case tcuTexture.ChannelOrder.DS:
                    return nb(pixelPtr[0], 8, 24);
                default:
                    throw new Error('Unsupported tcuTexture.channel order ' + this.m_format.order);
            }
            break;

        case tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV: {
            DE_ASSERT(this.m_format.order == tcuTexture.ChannelOrder.DS);
            return pixelPtr[0];
            break;
        }

        default: {
            DE_ASSERT(this.m_format.order == tcuTexture.ChannelOrder.D || this.m_format.order == tcuTexture.ChannelOrder.DS);
            return tcuTexture.channelToFloat(pixelPtr[0], this.m_format.type);
        }
    }
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number=} z
 * @return {Array<number>} Pixel value as Vec4
 */
tcuTexture.ConstPixelBufferAccess.prototype.getPixel = function(x, y, z) {
    z = z || 0;
    // console.log(this);
    // console.log('(' + x + ',' + y + ',' + z + ')');

    DE_ASSERT(deMath.deInBounds32(x, 0, this.m_width));
    DE_ASSERT(deMath.deInBounds32(y, 0, this.m_height));
    DE_ASSERT(deMath.deInBounds32(z, 0, this.m_depth));

    // Make sure that the position is 'integer'
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);

    var pixelSize = this.m_format.getPixelSize();
    var arrayType = tcuTexture.getTypedArray(this.m_format.type);
    var offset = z * this.m_slicePitch + y * this.m_rowPitch + x * pixelSize;
    var pixelPtr = new arrayType(this.m_data, offset + this.m_offset);

    var ub = function(pixel, offset, count) {
        return (pixel >> offset) & ((1 << count) - 1);
    };
    var nb = function(pixel, offset, count) {
        return tcuTexture.channelToNormFloat(ub(pixel, offset, count), count);
    };

    var pixel = pixelPtr[0];

    // Packed formats.
    switch (this.m_format.type) {
        case tcuTexture.ChannelType.UNORM_SHORT_565: return [nb(pixel, 11, 5), nb(pixel, 5, 6), nb(pixel, 0, 5), 1];
        case tcuTexture.ChannelType.UNORM_SHORT_555: return [nb(pixel, 10, 5), nb(pixel, 5, 5), nb(pixel, 0, 5), 1];
        case tcuTexture.ChannelType.UNORM_SHORT_4444: return [nb(pixel, 12, 4), nb(pixel, 8, 4), nb(pixel, 4, 4), nb(pixel, 0, 4)];
        case tcuTexture.ChannelType.UNORM_SHORT_5551: return [nb(pixel, 11, 5), nb(pixel, 6, 5), nb(pixel, 1, 5), nb(pixel, 0, 1)];
        case tcuTexture.ChannelType.UNORM_INT_101010: return [nb(pixel, 22, 10), nb(pixel, 12, 10), nb(pixel, 2, 10), 1];
        case tcuTexture.ChannelType.UNORM_INT_1010102_REV: return [nb(pixel, 0, 10), nb(pixel, 10, 10), nb(pixel, 20, 10), nb(pixel, 30, 2)];
        case tcuTexture.ChannelType.UNSIGNED_INT_1010102_REV: return [ub(pixel, 0, 10), ub(pixel, 10, 10), ub(pixel, 20, 10), ub(pixel, 30, 2)];
        case tcuTexture.ChannelType.UNSIGNED_INT_999_E5_REV: return tcuTexture.unpackRGB999E5(pixel);

        case tcuTexture.ChannelType.UNSIGNED_INT_24_8:
            switch (this.m_format.order) {
                // \note Stencil is always ignored.
                case tcuTexture.ChannelOrder.D: return [nb(pixel, 8, 24), 0, 0, 1];
                case tcuTexture.ChannelOrder.DS: return [nb(pixel, 8, 24), 0, 0, 1 /* (float)ub(0, 8) */];
                default:
                    DE_ASSERT(false);
            }

        case tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV: {
            DE_ASSERT(this.m_format.order == tcuTexture.ChannelOrder.DS);
            // \note Stencil is ignored.
            return [pixel, 0, 0, 1];
        }

        case tcuTexture.ChannelType.UNSIGNED_INT_11F_11F_10F_REV: {
            var f11 = function(value) {
                return tcuFloat.float11ToNumber(value);
            };
            var f10 = function(value) {
                return tcuFloat.float10ToNumber(value);
            };
            return [f11(ub(pixel, 0, 11)), f11(ub(pixel, 11, 11)), f10(ub(pixel, 22, 10)), 1];
        }

        default:
            break;
    }

    // Generic path.
    var result = [];
    result.length = 4;
    var channelMap = tcuTexture.getChannelReadMap(this.m_format.order);
    var channelSize = tcuTexture.getChannelSize(this.m_format.type);

    for (var c = 0; c < 4; c++) {
        var map = channelMap[c];
        if (map == tcuTexture.channel.ZERO)
            result[c] = 0;
        else if (map == tcuTexture.channel.ONE)
            result[c] = 1;
        else
            result[c] = tcuTexture.channelToFloat(pixelPtr[map], this.m_format.type);
    }

    return result;
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @return {Array<number>} Pixel value as Vec4
 */
tcuTexture.ConstPixelBufferAccess.prototype.getPixelInt = function(x, y, z) {
    z = z || 0;
    DE_ASSERT(deMath.deInBounds32(x, 0, this.m_width));
    DE_ASSERT(deMath.deInBounds32(y, 0, this.m_height));
    DE_ASSERT(deMath.deInBounds32(z, 0, this.m_depth));

    // Make sure that the position is 'integer'
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);

    var pixelSize = this.m_format.getPixelSize();
    var arrayType = tcuTexture.getTypedArray(this.m_format.type);
    var offset = z * this.m_slicePitch + y * this.m_rowPitch + x * pixelSize;
    var pixelPtr = new arrayType(this.m_data, offset + this.m_offset);

    var ub = function(pixel, offset, count) {
        return (pixel >> offset) & ((1 << count) - 1);
    };

    var pixel = pixelPtr[0];

    // Packed formats.
    switch (this.m_format.type) {
        case tcuTexture.ChannelType.UNORM_SHORT_565: return [ub(pixel, 11, 5), ub(pixel, 5, 6), ub(pixel, 0, 5), 1];
        case tcuTexture.ChannelType.UNORM_SHORT_555: return [ub(pixel, 10, 5), ub(pixel, 5, 5), ub(pixel, 0, 5), 1];
        case tcuTexture.ChannelType.UNORM_SHORT_4444: return [ub(pixel, 12, 4), ub(pixel, 8, 4), ub(pixel, 4, 4), ub(pixel, 0, 4)];
        case tcuTexture.ChannelType.UNORM_SHORT_5551: return [ub(pixel, 11, 5), ub(pixel, 6, 5), ub(pixel, 1, 5), ub(pixel, 0, 1)];
        case tcuTexture.ChannelType.UNORM_INT_101010: return [ub(pixel, 22, 10), ub(pixel, 12, 10), ub(pixel, 2, 10), 1];
        case tcuTexture.ChannelType.UNORM_INT_1010102_REV: return [ub(pixel, 0, 10), ub(pixel, 10, 10), ub(pixel, 20, 10), ub(pixel, 30, 2)];
        case tcuTexture.ChannelType.UNSIGNED_INT_1010102_REV: return [ub(pixel, 0, 10), ub(pixel, 10, 10), ub(pixel, 20, 10), ub(pixel, 30, 2)];

        case tcuTexture.ChannelType.UNSIGNED_INT_24_8:
            switch (this.m_format.order) {
                // \note Stencil is always ignored.
                case tcuTexture.ChannelOrder.D: return [ub(pixel, 8, 24), 0, 0, 1];
                case tcuTexture.ChannelOrder.DS: return [ub(pixel, 8, 24), 0, 0, 1 /* (float)ub(0, 8) */];
                default:
                    DE_ASSERT(false);
            }

        case tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV: {
            DE_ASSERT(this.m_format.order == tcuTexture.ChannelOrder.DS);
            // \note Stencil is ignored.
            return [pixel, 0, 0, 1];
        }

        default:
            break;
    }

    // Generic path.
    var result = [];
    result.length = 4;
    var channelMap = tcuTexture.getChannelReadMap(this.m_format.order);
    var channelSize = tcuTexture.getChannelSize(this.m_format.type);

    for (var c = 0; c < 4; c++) {
        var map = channelMap[c];
        if (map == tcuTexture.channel.ZERO)
            result[c] = 0;
        else if (map == tcuTexture.channel.ONE)
            result[c] = 1;
        else
            result[c] = tcuTexture.channelToInt(pixelPtr[map], this.m_format.type);
    }

    return result;
};

/**
 * @param {tcuTexture.Sampler} sampler
 * @param {tcuTexture.FilterMode} filter
 * @param {number} s
 * @param {number} t
 * @param {number} depth (integer)
 * @return {Array<number>} Sample color
 */
tcuTexture.ConstPixelBufferAccess.prototype.sample2D = function(sampler, filter, s, t, depth) {
    DE_ASSERT(deMath.deInBounds32(depth, 0, this.m_depth));

    // Non-normalized coordinates.
    var u = s;
    var v = t;

    if (sampler.normalizedCoords) {
        u = tcuTexture.unnormalize(sampler.wrapS, s, this.m_width);
        v = tcuTexture.unnormalize(sampler.wrapT, t, this.m_height);
    }

    switch (filter) {
        case tcuTexture.FilterMode.NEAREST: return tcuTexture.sampleNearest2D(this, sampler, u, v, depth);
        case tcuTexture.FilterMode.LINEAR: return tcuTexture.sampleLinear2D(this, sampler, u, v, depth);
        default:
            throw new Error('Invalid filter:' + filter);
    }
    throw new Error('Unimplemented');
};

/**
 * @param {tcuTexture.Sampler} sampler
 * @param {tcuTexture.FilterMode} filter
 * @param {number} s
 * @param {number} t
 * @param {number} r
 * @return {Array<number>} Sample color
 */
tcuTexture.ConstPixelBufferAccess.prototype.sample3D = function(sampler, filter, s, t, r) {
    // Non-normalized coordinates.
    var u = s;
    var v = t;
    var w = r;

    if (sampler.normalizedCoords) {
        u = tcuTexture.unnormalize(sampler.wrapS, s, this.m_width);
        v = tcuTexture.unnormalize(sampler.wrapT, t, this.m_height);
        w = tcuTexture.unnormalize(sampler.wrapR, r, this.m_depth);
    }

    switch (filter) {
        case tcuTexture.FilterMode.NEAREST: return tcuTexture.sampleNearest3D(this, sampler, u, v, w);
        case tcuTexture.FilterMode.LINEAR: return tcuTexture.sampleLinear3D(this, sampler, u, v, w);
        default:
            throw new Error('Invalid filter:' + filter);
    }
    throw new Error('Unimplemented');
};

    /* TODO: do we need any of these? */ {
        // template<typename T>
        // Vector<T, 4> getPixelT (int x, int y, int z = 0) const;

        // Vec4 sample3D (const tcuTexture.Sampler& sampler, tcuTexture.Sampler::tcuTexture.FilterMode filter, float s, float t, float r) const;

        // Vec4 sample2DOffset (const tcuTexture.Sampler& sampler, tcuTexture.Sampler::tcuTexture.FilterMode filter, float s, float t, const IVec3& offset) const;
        // Vec4 sample3DOffset (const tcuTexture.Sampler& sampler, tcuTexture.Sampler::tcuTexture.FilterMode filter, float s, float t, float r, const IVec3& offset) const;

        // float sample2DCompare (const tcuTexture.Sampler& sampler, tcuTexture.Sampler::tcuTexture.FilterMode filter, float ref, float s, float t, const IVec3& offset) const;
    };

/** Common type limits
 *
 */
tcuTexture.deTypes = {
    deInt8: {min: -(1 << 7), max: (1 << 7) - 1},
    deInt16: {min: -(1 << 15), max: (1 << 15) - 1},
    deInt32: {min: -2147483648, max: 2147483647},
    deUint8: {min: 0, max: (1 << 8) - 1},
    deUint16: {min: 0, max: (1 << 16) - 1},
    deUint32: {min: 0, max: 4294967295}
};

/**
 * Round to even and saturate
 * @param {{max: number, min: number}} deType from tcuTexture.deTypes
 * @param {number} value
 * @return {number}
 */
tcuTexture.convertSatRte = function(deType, value) {
    var minVal = deType.min;
    var maxVal = deType.max;
    var floor = Math.floor(value);
    var frac = value - floor;
    if (frac == 0.5)
        if (floor % 2 != 0)
            floor += 1;
    else if (frac > 0.5)
        floor += 1;

    return Math.max(minVal, Math.min(maxVal, floor));
};

/**
 * Saturate value to type range
 * @param { {max: number, min: number}} deType from tcuTexture.deTypes
 * @param {number} src
 * @return {number}
 */
tcuTexture.convertSat = function(deType, src) {
    var minVal = deType.min;
    var maxVal = deType.max;
    if (src < minVal)
        return minVal;
    else if (src > maxVal)
        return maxVal;
    else
        return src;
};

/**
 * @param {number} src Input integer value
 * @param {tcuTexture.ChannelType} type
 * @return {number}
 */
tcuTexture.intToChannel = function(src, type) {
    var dst;
    switch (type) {
        case tcuTexture.ChannelType.SNORM_INT8: dst = tcuTexture.convertSat(tcuTexture.deTypes.deInt8, src); break;
        case tcuTexture.ChannelType.SNORM_INT16: dst = tcuTexture.convertSat(tcuTexture.deTypes.deInt16, src); break;
        case tcuTexture.ChannelType.UNORM_INT8: dst = tcuTexture.convertSat(tcuTexture.deTypes.deUint8, src); break;
        case tcuTexture.ChannelType.UNORM_INT16: dst = tcuTexture.convertSat(tcuTexture.deTypes.deUint16, src); break;
        case tcuTexture.ChannelType.SIGNED_INT8: dst = tcuTexture.convertSat(tcuTexture.deTypes.deInt8, src); break;
        case tcuTexture.ChannelType.SIGNED_INT16: dst = tcuTexture.convertSat(tcuTexture.deTypes.deInt16, src); break;
        case tcuTexture.ChannelType.SIGNED_INT32: dst = tcuTexture.convertSat(tcuTexture.deTypes.deInt32, src); break;
        case tcuTexture.ChannelType.UNSIGNED_INT8: dst = tcuTexture.convertSat(tcuTexture.deTypes.deUint8, src); break;
        case tcuTexture.ChannelType.UNSIGNED_INT16: dst = tcuTexture.convertSat(tcuTexture.deTypes.deUint16, src); break;
        case tcuTexture.ChannelType.UNSIGNED_INT32: dst = tcuTexture.convertSat(tcuTexture.deTypes.deUint32, src); break;
        case tcuTexture.ChannelType.HALF_FLOAT: dst = tcuFloat.numberToHalfFloat(src); break;
        case tcuTexture.ChannelType.FLOAT: dst = src; break;
        default:
            throw new Error('Unrecognized tcuTexture.channel type: ' + type);
    }
    return dst;
};

/**
 * @param {number} src
 * @param {number} bits
 * @return {number}
 */
tcuTexture.normFloatToChannel = function(src, bits) {
    var maxVal = (1 << bits) - 1;
    var intVal = tcuTexture.convertSatRte(tcuTexture.deTypes.deUint32, src * maxVal);
    return Math.min(maxVal, intVal);
};

/**
 * @param {number} src
 * @param {number} bits
 * @return {number}
 */
tcuTexture.uintToChannel = function(src, bits) {
    var maxVal = (1 << bits) - 1;
    return Math.min(maxVal, src);
};

/**
 * @param {number} src
 * @param {tcuTexture.ChannelType} type
 * @return {number} Converted src color value
 */
tcuTexture.floatToChannel = function(src, type) {
    switch (type) {
        case tcuTexture.ChannelType.SNORM_INT8: return tcuTexture.convertSatRte(tcuTexture.deTypes.deInt8, src * 127);
        case tcuTexture.ChannelType.SNORM_INT16: return tcuTexture.convertSatRte(tcuTexture.deTypes.deInt16, src * 32767);
        case tcuTexture.ChannelType.SNORM_INT32: return tcuTexture.convertSatRte(tcuTexture.deTypes.deInt32, src * 2147483647);
        case tcuTexture.ChannelType.UNORM_INT8: return tcuTexture.convertSatRte(tcuTexture.deTypes.deUint8, src * 255);
        case tcuTexture.ChannelType.UNORM_INT16: return tcuTexture.convertSatRte(tcuTexture.deTypes.deUint16, src * 65535);
        case tcuTexture.ChannelType.UNORM_INT32: return tcuTexture.convertSatRte(tcuTexture.deTypes.deUint32, src * 4294967295);
        case tcuTexture.ChannelType.SIGNED_INT8: return tcuTexture.convertSatRte(tcuTexture.deTypes.deInt8, src);
        case tcuTexture.ChannelType.SIGNED_INT16: return tcuTexture.convertSatRte(tcuTexture.deTypes.deInt16, src);
        case tcuTexture.ChannelType.SIGNED_INT32: return tcuTexture.convertSatRte(tcuTexture.deTypes.deInt32, src);
        case tcuTexture.ChannelType.UNSIGNED_INT8: return tcuTexture.convertSatRte(tcuTexture.deTypes.deUint8, src);
        case tcuTexture.ChannelType.UNSIGNED_INT16: return tcuTexture.convertSatRte(tcuTexture.deTypes.deUint16, src);
        case tcuTexture.ChannelType.UNSIGNED_INT32: return tcuTexture.convertSatRte(tcuTexture.deTypes.deUint32, src);
        case tcuTexture.ChannelType.HALF_FLOAT: return tcuFloat.numberToHalfFloat(src);
        case tcuTexture.ChannelType.FLOAT: return src;
    }
    throw new Error('Unrecognized type ' + type);
};

/**
 * \brief Read-write pixel data access
 *
 * This class extends read-only access object by providing write functionality.
 *
 * \note tcuTexture.PixelBufferAccess may not have any data members nor add any
 *         virtual functions. It must be possible to reinterpret_cast<>
 *         tcuTexture.PixelBufferAccess to tcuTexture.ConstPixelBufferAccess.
 * @constructor
 * @extends {tcuTexture.ConstPixelBufferAccess}
 *
 */
tcuTexture.PixelBufferAccess = function(descriptor) {
    tcuTexture.ConstPixelBufferAccess.call(this, descriptor);
};

tcuTexture.PixelBufferAccess.prototype = Object.create(tcuTexture.ConstPixelBufferAccess.prototype);
tcuTexture.PixelBufferAccess.prototype.constructor = tcuTexture.PixelBufferAccess;

/**
 * @param {Array<number>} color Vec4 color to set
 * @param {number} x
 * @param {number} y
 * @param {number=} z
 */
tcuTexture.PixelBufferAccess.prototype.setPixel = function(color, x, y, z) {
    z = z || 0;
    DE_ASSERT(deMath.deInBounds32(x, 0, this.m_width));
    DE_ASSERT(deMath.deInBounds32(y, 0, this.m_height));
    DE_ASSERT(deMath.deInBounds32(z, 0, this.m_depth));

    // Make sure that the position is 'integer'
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);

    var pixelSize = this.m_format.getPixelSize();
    var arrayType = tcuTexture.getTypedArray(this.m_format.type);
    var offset = z * this.m_slicePitch + y * this.m_rowPitch + x * pixelSize;
    var pixelPtr = new arrayType(this.m_data, offset + this.m_offset);

    var pn = function(val, offs, bits) {
        /* Check if the value is normalized (in [0, 1] range) */
        DE_ASSERT(deMath.deInRange32(val, 0, 1));
        return tcuTexture.normFloatToChannel(val, bits) << offs;
    };

    var pu = function(val, offs, bits) {
        return tcuTexture.uintToChannel(val, bits) << offs;
    };

    // Packed formats.
    switch (this.m_format.type) {
        case tcuTexture.ChannelType.UNORM_SHORT_565: pixelPtr[0] = pn(color[0], 11, 5) | pn(color[1], 5, 6) | pn(color[2], 0, 5); break;
        case tcuTexture.ChannelType.UNORM_SHORT_555: pixelPtr[0] = pn(color[0], 10, 5) | pn(color[1], 5, 5) | pn(color[2], 0, 5); break;
        case tcuTexture.ChannelType.UNORM_SHORT_4444: pixelPtr[0] = pn(color[0], 12, 4) | pn(color[1], 8, 4) | pn(color[2], 4, 4) | pn(color[3], 0, 4); break;
        case tcuTexture.ChannelType.UNORM_SHORT_5551: pixelPtr[0] = pn(color[0], 11, 5) | pn(color[1], 6, 5) | pn(color[2], 1, 5) | pn(color[3], 0, 1); break;
        case tcuTexture.ChannelType.UNORM_INT_101010: pixelPtr[0] = pn(color[0], 22, 10) | pn(color[1], 12, 10) | pn(color[2], 2, 10); break;
        case tcuTexture.ChannelType.UNORM_INT_1010102_REV: pixelPtr[0] = pn(color[0], 0, 10) | pn(color[1], 10, 10) | pn(color[2], 20, 10) | pn(color[3], 30, 2); break;
        case tcuTexture.ChannelType.UNSIGNED_INT_1010102_REV: pixelPtr[0] = pu(color[0], 0, 10) | pu(color[1], 10, 10) | pu(color[2], 20, 10) | pu(color[3], 30, 2); break;
        case tcuTexture.ChannelType.UNSIGNED_INT_999_E5_REV: pixelPtr[0] = tcuTexture.packRGB999E5(color); break;

        case tcuTexture.ChannelType.UNSIGNED_INT_24_8:
            switch (this.m_format.order) {
                // \note Stencil is always ignored.
                case tcuTexture.ChannelOrder.D: pixelPtr[0] = pn(color[0], 8, 24); break;
                case tcuTexture.ChannelOrder.S: pixelPtr[0] = pn(color[3], 8, 24); break;
                case tcuTexture.ChannelOrder.DS: pixelPtr[0] = pn(color[0], 8, 24) | pu(color[3], 0, 8); break;
                default:
                    throw new Error('Unsupported tcuTexture.channel order ' + this.m_format.order);
            }
            break;

        case tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV: {
            pixelPtr[0] = color[0];
            var u32array = new Uint32Array(this.m_data, offset + this.m_offset + 4, 1);
            u32array[0] = pu(color[3], 0, 8);
            break;
        }

        case tcuTexture.ChannelType.UNSIGNED_INT_11F_11F_10F_REV: {
            var f11 = function(value) {
                return tcuFloat.numberToFloat11(value);
            };
            var f10 = function(value) {
                return tcuFloat.numberToFloat10(value);
            };

            pixelPtr[0] = f11(color[0]) | (f11(color[1]) << 11) | (f10(color[2]) << 22);
            break;
        }
        case tcuTexture.ChannelType.FLOAT:
            if (this.m_format.order == tcuTexture.ChannelOrder.D) {
                pixelPtr[0] = color[0];
                break;
            }
            // else fall-through to default case!

        default: {
            // Generic path.
            var numChannels = tcuTexture.getNumUsedChannels(this.m_format.order);
            var map = tcuTexture.getChannelWriteMap(this.m_format.order);

            for (var c = 0; c < numChannels; c++)
                pixelPtr[c] = tcuTexture.floatToChannel(color[map[c]], this.m_format.type);
        }
    }
};

/**
 * @param {Array<number>} color Vec4 color to set (unnormalized)
 * @param {number} x
 * @param {number} y
 * @param {number=} z
 */
tcuTexture.PixelBufferAccess.prototype.setPixelInt = function(color, x, y, z) {
    z = z || 0;
    DE_ASSERT(deMath.deInBounds32(x, 0, this.m_width));
    DE_ASSERT(deMath.deInBounds32(y, 0, this.m_height));
    DE_ASSERT(deMath.deInBounds32(z, 0, this.m_depth));

    // Make sure that the position is 'integer'
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);

    var pixelSize = this.m_format.getPixelSize();
    var arrayType = tcuTexture.getTypedArray(this.m_format.type);
    var offset = z * this.m_slicePitch + y * this.m_rowPitch + x * pixelSize;
    var pixelPtr = new arrayType(this.m_data, offset + this.m_offset);

    var pu = function(val, offs, bits) {
        return tcuTexture.uintToChannel(val, bits) << offs;
    };

    // Packed formats.
    switch (this.m_format.type) {
        case tcuTexture.ChannelType.UNORM_SHORT_565: pixelPtr[0] = pu(color[0], 11, 5) | pu(color[1], 5, 6) | pu(color[2], 0, 5); break;
        case tcuTexture.ChannelType.UNORM_SHORT_555: pixelPtr[0] = pu(color[0], 10, 5) | pu(color[1], 5, 5) | pu(color[2], 0, 5); break;
        case tcuTexture.ChannelType.UNORM_SHORT_4444: pixelPtr[0] = pu(color[0], 12, 4) | pu(color[1], 8, 4) | pu(color[2], 4, 4) | pu(color[3], 0, 4); break;
        case tcuTexture.ChannelType.UNORM_SHORT_5551: pixelPtr[0] = pu(color[0], 11, 5) | pu(color[1], 6, 5) | pu(color[2], 1, 5) | pu(color[3], 0, 1); break;
        case tcuTexture.ChannelType.UNORM_INT_101010: pixelPtr[0] = pu(color[0], 22, 10) | pu(color[1], 12, 10) | pu(color[2], 2, 10); break;
        case tcuTexture.ChannelType.UNORM_INT_1010102_REV: pixelPtr[0] = pu(color[0], 0, 10) | pu(color[1], 10, 10) | pu(color[2], 20, 10) | pu(color[3], 30, 2); break;
        case tcuTexture.ChannelType.UNSIGNED_INT_1010102_REV: pixelPtr[0] = pu(color[0], 0, 10) | pu(color[1], 10, 10) | pu(color[2], 20, 10) | pu(color[3], 30, 2); break;

        case tcuTexture.ChannelType.UNSIGNED_INT_24_8:
            switch (this.m_format.order) {
                // \note Stencil is always ignored.
                case tcuTexture.ChannelOrder.D: pixelPtr[0] = pu(color[0], 8, 24); break;
                case tcuTexture.ChannelOrder.S: pixelPtr[0] = pu(color[3], 8, 24); break;
                case tcuTexture.ChannelOrder.DS: pixelPtr[0] = pu(color[0], 8, 24) | pu(color[3], 0, 8); break;
                default:
                    throw new Error('Unsupported tcuTexture.channel order ' + this.m_format.order);
            }
            break;

        case tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV: {
            pixelPtr[0] = color[0];
            var u32array = new Uint32Array(this.m_data, offset + this.m_offset + 4, 1);
            u32array[0] = pu(color[3], 0, 8);
            break;
        }

        default: {
            // Generic path.
            var numChannels = tcuTexture.getNumUsedChannels(this.m_format.order);
            var map = tcuTexture.getChannelWriteMap(this.m_format.order);

            for (var c = 0; c < numChannels; c++)
                pixelPtr[c] = tcuTexture.intToChannel(color[map[c]], this.m_format.type);
        }
    }
};

/**
 * @param {Array<number>=} color Vec4 color to set, optional.
 * @param {Array<number>=} x Range in x axis, optional.
 * @param {Array<number>=} y Range in y axis, optional.
 * @param {Array<number>=} z Range in z axis, optional.
 */
tcuTexture.PixelBufferAccess.prototype.clear = function(color, x, y, z) {
    var c = color || [0, 0, 0, 0];
    var numChannels = tcuTexture.getNumUsedChannels(this.m_format.order);
    var range_x = x || [0, this.m_width];
    var range_y = y || [0, this.m_height];
    var range_z = z || [0, this.m_depth];
    var pixelSize = this.m_format.getPixelSize();
    var width = range_x[1] - range_x[0];
    var height = range_y[1] - range_y[0];
    var depth = range_z[1] - range_z[0];

    //copy first pixel over other pixels in the row
    var fillRow = function(pixelPtr, numChannels, width) {
        for (var i = 1; i < width; i++)
            for (var c = 0; c < numChannels; c++)
                pixelPtr[i * numChannels + c] = pixelPtr[c];
    };
    // copy first row to other rows in all planes
    var fillPlanes = function(buffer, arrayType, src, offset, rowStride, planeStride, width, height, depth) {
        for (var j = 0; j < depth; j++)
        for (var i = (j == 0 ? 1 : 0); i < height; i++) {
            var dst = new arrayType(buffer, offset + i * rowStride + j * planeStride, width);
            dst.set(src);
        }
    };

    this.setPixel(c, range_x[0], range_y[0], range_z[0]);
    var arrayType = tcuTexture.getTypedArray(this.m_format.type);
    var offset = range_z[0] * this.m_slicePitch + range_y[0] * this.m_rowPitch + range_x[0] * pixelSize;
    var pixelPtr = new arrayType(this.m_data, offset + this.m_offset, width * numChannels);

    fillRow(pixelPtr, numChannels, width);
    fillPlanes(this.m_data, arrayType, pixelPtr, offset + this.m_offset, this.m_rowPitch, this.m_slicePitch, width * numChannels, height, depth);
};

/**
 * @param {number} depth to set
 * @param {number} x
 * @param {number} y
 * @param {number=} z
 */
tcuTexture.PixelBufferAccess.prototype.setPixDepth = function(depth, x, y, z) {
    if (z == null)
        z = 0;
    DE_ASSERT(deMath.deInBounds32(x, 0, this.m_width));
    DE_ASSERT(deMath.deInBounds32(y, 0, this.m_height));
    DE_ASSERT(deMath.deInBounds32(z, 0, this.m_depth));

    // Make sure that the position is 'integer'
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);

    var pixelSize = this.m_format.getPixelSize();
    var arrayType = tcuTexture.getTypedArray(this.m_format.type);
    var offset = z * this.m_slicePitch + y * this.m_rowPitch + x * pixelSize;
    var pixelPtr = new arrayType(this.m_data, offset + this.m_offset);

    var pn = function(val, offs, bits) {
        return tcuTexture.normFloatToChannel(val, bits) << offs;
    };

    // Packed formats.
    switch (this.m_format.type) {
        case tcuTexture.ChannelType.UNSIGNED_INT_24_8:
            switch (this.m_format.order) {
                case tcuTexture.ChannelOrder.D: pixelPtr[0] = pn(depth, 8, 24); break;
                case tcuTexture.ChannelOrder.DS: pixelPtr[0] = pn(depth, 8, 24) | (pixelPtr[0] & 0xFF); break;
                default:
                    throw new Error('Unsupported tcuTexture.channel order ' + this.m_format.order);
            }
            break;

        case tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV: {
            DE_ASSERT(this.m_format.order == tcuTexture.ChannelOrder.DS);
            pixelPtr[0] = depth;
            break;
        }

        default: {
            DE_ASSERT(this.m_format.order == tcuTexture.ChannelOrder.D || this.m_format.order == tcuTexture.ChannelOrder.DS);
            pixelPtr[0] = tcuTexture.floatToChannel(depth, this.m_format.type);
        }
    }
};

/**
 * @param {number} stencil to set
 * @param {number} x
 * @param {number} y
 * @param {number=} z
 */
tcuTexture.PixelBufferAccess.prototype.setPixStencil = function(stencil, x, y, z) {
    if (z == null)
        z = 0;
    DE_ASSERT(deMath.deInBounds32(x, 0, this.m_width));
    DE_ASSERT(deMath.deInBounds32(y, 0, this.m_height));
    DE_ASSERT(deMath.deInBounds32(z, 0, this.m_depth));

    // Make sure that the position is 'integer'
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);

    var pixelSize = this.m_format.getPixelSize();
    var arrayType = tcuTexture.getTypedArray(this.m_format.type);
    var offset = z * this.m_slicePitch + y * this.m_rowPitch + x * pixelSize;
    var pixelPtr = new arrayType(this.m_data, offset + this.m_offset);

    var pu = function(val, offs, bits) {
        return tcuTexture.uintToChannel(val, bits) << offs;
    };

    // Packed formats.
    switch (this.m_format.type) {
        case tcuTexture.ChannelType.UNSIGNED_INT_24_8:
            switch (this.m_format.order) {
                case tcuTexture.ChannelOrder.S: pixelPtr[0] = pu(stencil, 8, 24); break;
                case tcuTexture.ChannelOrder.DS: pixelPtr[0] = pu(stencil, 0, 8) | (pixelPtr[0] & 0xFFFFFF00); break;
                default:
                    throw new Error('Unsupported tcuTexture.channel order ' + this.m_format.order);
            }
            break;

        case tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV: {
            var u32array = new Uint32Array(this.m_data, offset + 4, 1);
            u32array[0] = pu(stencil, 0, 8);
            break;
        }

        default: {
            if (this.m_format.order == tcuTexture.ChannelOrder.S)
                pixelPtr[0] = tcuTexture.floatToChannel(stencil, this.m_format.type);
            else {
                DE_ASSERT(this.m_format.order == tcuTexture.ChannelOrder.DS);
                pixelPtr[3] = tcuTexture.floatToChannel(stencil, this.m_format.type);
            }
        }
    }
};

/**
 * newFromTextureLevel
 * @param {tcuTexture.TextureLevel} level
 */
tcuTexture.PixelBufferAccess.newFromTextureLevel = function(level) {
    var descriptor = new Object();
    descriptor.format = level.getFormat();
    descriptor.width = level.getWidth();
    descriptor.height = level.getHeight();
    descriptor.depth = level.m_depth;
    descriptor.data = level.m_data.m_ptr;

    return new tcuTexture.PixelBufferAccess(descriptor);
};

/**
 * newFromTextureFormat
 * @param {tcuTexture.TextureFormat} format
 * @param {number} width
 * @param {number} height
 * @param {number} depth
 * @param {number} rowPitch
 * @param {number} slicePitch
 * @param {ArrayBuffer} data
 */
tcuTexture.PixelBufferAccess.newFromTextureFormat = function(format, width, height, depth, rowPitch, slicePitch, data) {
    var descriptor = new Object();
    descriptor.format = format;
    descriptor.width = width;
    descriptor.height = height;
    descriptor.depth = depth;
    descriptor.rowPitch = rowPitch;
    descriptor.slicePitch = slicePitch;
    descriptor.data = data;

    return new tcuTexture.PixelBufferAccess(descriptor);
};

/* TODO: Port */
// {
// public:
//                             tcuTexture.PixelBufferAccess (void) {}
//                             tcuTexture.PixelBufferAccess (const tcuTexture.TextureFormat& format, int width, int height, int depth, void* data);

//     void*                    getDataPtr (void) const { return m_data; }

//     void setPixels (const void* buf, int bufSize) const;
//     void setPixel (const tcu::Vec4& color, int x, int y, int z = 0) const;
//     void setPixel (const tcu::IVec4& color, int x, int y, int z = 0) const;
//     void setPixel (const tcu::UVec4& color, int x, int y, int z = 0) const { setPixel(color.cast<int>(), x, y, z); }

//     void setPixDepth (float depth, int x, int y, int z = 0) const;
//     void setPixStencil (int stencil, int x, int y, int z = 0) const;
// };

/**
 * @constructor
 * @param {tcuTexture.TextureFormat} format
 * @param {number} numLevels
 */
tcuTexture.TextureLevelPyramid = function(format, numLevels) {
    /* tcuTexture.TextureFormat */this.m_format = format;
    /* LevelData */ this.m_data = [];
    for (var i = 0; i < numLevels; i++)
        this.m_data.push(new tcuTexture.DeqpArrayBuffer());
    /* {Array<tcuTexture.PixelBufferAccess>} */ this.m_access = [];
    this.m_access.length = numLevels;
};

/** @return {boolean} */
tcuTexture.TextureLevelPyramid.prototype.isLevelEmpty = function(levelNdx) { return this.m_data[levelNdx].empty(); };
/** @return {tcuTexture.TextureFormat} */
tcuTexture.TextureLevelPyramid.prototype.getFormat = function() { return this.m_format; };
/** @return {number} */
tcuTexture.TextureLevelPyramid.prototype.getNumLevels = function() { return this.m_access.length; };
/** @return {tcuTexture.PixelBufferAccess} */
tcuTexture.TextureLevelPyramid.prototype.getLevel = function(ndx) { return this.m_access[ndx]; };
/** @return {Array<tcuTexture.PixelBufferAccess>} */
tcuTexture.TextureLevelPyramid.prototype.getLevels = function() { return this.m_access; };

/**
 * @param {number} levelNdx
 * @param {number} width
 * @param {number} height
 * @param {number} depth
 */
tcuTexture.TextureLevelPyramid.prototype.allocLevel = function(levelNdx, width, height, depth) {
    var size = this.m_format.getPixelSize() * width * height * depth;

    DE_ASSERT(this.isLevelEmpty(levelNdx));

    this.m_data[levelNdx].setStorage(size);
    this.m_access[levelNdx] = new tcuTexture.PixelBufferAccess({
        format: this.m_format,
        width: width,
        height: height,
        depth: depth,
        data: this.m_data[levelNdx].m_ptr
    });
};

tcuTexture.TextureLevelPyramid.prototype.clearLevel = function(levelNdx) {
    /* TODO: Implement */
    throw new Error('Not implemented');
};

/**
 * @param {Array<tcuTexture.ConstPixelBufferAccess>} levels
 * @param {number} numLevels
 * @param {tcuTexture.Sampler} sampler
 * @param {number} s
 * @param {number} t
 * @param {number} depth (integer)
 * @param {number=} lod
 * @return {Array<number>} Vec4 pixel color
 */
tcuTexture.sampleLevelArray2D = function(levels, numLevels, sampler, s, t, depth, lod) {
    if (lod === undefined) lod = 0;
    var magnified = lod <= sampler.lodThreshold;
    var filterMode = magnified ? sampler.magFilter : sampler.minFilter;

    switch (filterMode) {
        case tcuTexture.FilterMode.NEAREST: return levels[0].sample2D(sampler, filterMode, s, t, depth);
        case tcuTexture.FilterMode.LINEAR: return levels[0].sample2D(sampler, filterMode, s, t, depth);

        case tcuTexture.FilterMode.NEAREST_MIPMAP_NEAREST:
        case tcuTexture.FilterMode.LINEAR_MIPMAP_NEAREST: {
            var maxLevel = numLevels - 1;
            var level = deMath.clamp(Math.ceil(lod + 0.5) - 1, 0, maxLevel);
            var levelFilter = (filterMode == tcuTexture.FilterMode.LINEAR_MIPMAP_NEAREST) ? tcuTexture.FilterMode.LINEAR : tcuTexture.FilterMode.NEAREST;

            return levels[level].sample2D(sampler, levelFilter, s, t, depth);
        }

        case tcuTexture.FilterMode.NEAREST_MIPMAP_LINEAR:
        case tcuTexture.FilterMode.LINEAR_MIPMAP_LINEAR: {
            var maxLevel = numLevels - 1;
            var level0 = deMath.clamp(Math.ceil(lod + 0.5) - 1, 0, maxLevel);
            var level1 = Math.min(maxLevel, level0 + 1);
            var levelFilter = (filterMode == tcuTexture.FilterMode.LINEAR_MIPMAP_LINEAR) ? tcuTexture.FilterMode.LINEAR : tcuTexture.FilterMode.NEAREST;
            var f = deMath.deFloatFrac(lod);
            var t0 = levels[level0].sample2D(sampler, levelFilter, s, t, depth);
            var t1 = levels[level1].sample2D(sampler, levelFilter, s, t, depth);

            return deMath.add(deMath.scale(t0, 1 - f), deMath.scale(t1, f));
        }

        default:
            throw new Error('Invalid filter mode:' + filterMode);
    }
    throw new Error('Unimplemented');
};

/**
 * @param {Array<tcuTexture.ConstPixelBufferAccess>} levels
 * @param {number} numLevels
 * @param {tcuTexture.Sampler} sampler
 * @param {number} s
 * @param {number} t
 * @param {number} r
 * @param {number} lod
 * @return {Array<number>} Vec4 pixel color
 */
tcuTexture.sampleLevelArray3D = function(levels, numLevels, sampler, s, t, r, lod) {
    var magnified = lod <= sampler.lodThreshold;
    var filterMode = magnified ? sampler.magFilter : sampler.minFilter;

    switch (filterMode) {
        case tcuTexture.FilterMode.NEAREST: return levels[0].sample3D(sampler, filterMode, s, t, r);
        case tcuTexture.FilterMode.LINEAR: return levels[0].sample3D(sampler, filterMode, s, t, r);

        case tcuTexture.FilterMode.NEAREST_MIPMAP_NEAREST:
        case tcuTexture.FilterMode.LINEAR_MIPMAP_NEAREST: {
            var maxLevel = numLevels - 1;
            var level = deMath.clamp(Math.ceil(lod + 0.5) - 1, 0, maxLevel);
            var levelFilter = (filterMode == tcuTexture.FilterMode.LINEAR_MIPMAP_NEAREST) ? tcuTexture.FilterMode.LINEAR : tcuTexture.FilterMode.NEAREST;

            return levels[level].sample3D(sampler, levelFilter, s, t, r);
        }

        case tcuTexture.FilterMode.NEAREST_MIPMAP_LINEAR:
        case tcuTexture.FilterMode.LINEAR_MIPMAP_LINEAR: {
            var maxLevel = numLevels - 1;
            var level0 = deMath.clamp(Math.ceil(lod + 0.5) - 1, 0, maxLevel);
            var level1 = Math.min(maxLevel, level0 + 1);
            var levelFilter = (filterMode == tcuTexture.FilterMode.LINEAR_MIPMAP_LINEAR) ? tcuTexture.FilterMode.LINEAR : tcuTexture.FilterMode.NEAREST;
            var f = deMath.deFloatFrac(lod);
            var t0 = levels[level0].sample3D(sampler, levelFilter, s, t, r);
            var t1 = levels[level1].sample3D(sampler, levelFilter, s, t, r);

            return deMath.add(deMath.scale(t0, 1 - f), deMath.scale(t1, f));
        }

        default:
           throw new Error('Invalid filter mode:' + filterMode);
    }
    throw new Error('Unimplemented');
};

/**
 * @constructor
 * @param {tcuTexture.CubeFace} face
 * @param {Array<number>} coords
 */
tcuTexture.CubeFaceCoords = function(face, coords) {
    this.face = face;
    this.s = coords[0];
    this.t = coords[1];
};

/**
 * \brief 2D Texture View
 * @constructor
 * @param {number} numLevels
 * @param {?Array<tcuTexture.ConstPixelBufferAccess>} levels
 */
tcuTexture.Texture2DView = function(numLevels, levels) {
    this.m_numLevels = numLevels;
    this.m_levels = levels;
};

/** @return {number} */
tcuTexture.Texture2DView.prototype.getNumLevels = function() { return this.m_numLevels; };
/** @return {number} */
tcuTexture.Texture2DView.prototype.getWidth = function() { return this.m_numLevels > 0 ? this.m_levels[0].getWidth() : 0; };
/** @return {number} */
tcuTexture.Texture2DView.prototype.getHeight = function() { return this.m_numLevels > 0 ? this.m_levels[0].getHeight() : 0; };
/**
 * @param {number} ndx
 * @return {tcuTexture.ConstPixelBufferAccess}
 */
tcuTexture.Texture2DView.prototype.getLevel = function(ndx) { DE_ASSERT(deMath.deInBounds32(ndx, 0, this.m_numLevels)); return this.m_levels[ndx]; };
/** @return {Array<tcuTexture.ConstPixelBufferAccess>} */
tcuTexture.Texture2DView.prototype.getLevels = function() { return this.m_levels; };

/**
 * @param {number} baseLevel
 * @param {number} maxLevel
 * return {tcuTexture.Texture2DView}
 */
tcuTexture.Texture2DView.prototype.getSubView = function(baseLevel, maxLevel) {
    var clampedBase = deMath.clamp(baseLevel, 0, this.m_numLevels - 1);
    var clampedMax = deMath.clamp(maxLevel, clampedBase, this.m_numLevels - 1);
    var numLevels = clampedMax - clampedBase + 1;
    return new tcuTexture.Texture2DView(numLevels, this.m_levels.slice(clampedBase, numLevels));
};

/**
 * @param {tcuTexture.Sampler} sampler
 * @param {Array<number>} texCoord
 * @param {number=} lod
 * @return {Array<number>} Pixel color
 */
tcuTexture.Texture2DView.prototype.sample = function(sampler, texCoord, lod) {
    return tcuTexture.sampleLevelArray2D(this.m_levels, this.m_numLevels, sampler, texCoord[0], texCoord[1], 0 /* depth */, lod);
};

/**
 * @param {tcuTexture.Sampler} sampler
 * @param {number} ref
 * @param {Array<number>} texCoord
 * @param {number} lod
 * @return {number}
 */
tcuTexture.Texture2DView.prototype.sampleCompare = function(sampler, ref, texCoord, lod) {
    throw new Error('Unimplemented');
};

    /* TODO: Port
    Vec4 sample (const tcuTexture.Sampler& sampler, float s, float t, float lod) const;
    Vec4 sampleOffset (const tcuTexture.Sampler& sampler, float s, float t, float lod, const IVec2& offset) const;
    float sampleCompare (const tcuTexture.Sampler& sampler, float ref, float s, float t, float lod) const;
    float sampleCompareOffset (const tcuTexture.Sampler& sampler, float ref, float s, float t, float lod, const IVec2& offset) const;

    Vec4 gatherOffsets (const tcuTexture.Sampler& sampler, float s, float t, int componentNdx, const IVec2 (&offsets)[4]) const;
    Vec4 gatherOffsetsCompare(const tcuTexture.Sampler& sampler, float ref, float s, float t, const IVec2 (&offsets)[4]) const;
    */

/**
 * @constructor
 * @param {number} numLevels
 * @param {Array<tcuTexture.ConstPixelBufferAccess>} levels
 */
tcuTexture.Texture2DArrayView = function(numLevels, levels) {
    this.m_numLevels = numLevels;
    this.m_levels = levels;
};

/** @return {number} */
tcuTexture.Texture2DArrayView.prototype.getNumLevels = function() { return this.m_numLevels; };
/** @return {number} */
tcuTexture.Texture2DArrayView.prototype.getWidth = function() { return this.m_numLevels > 0 ? this.m_levels[0].getWidth() : 0; };
/** @return {number} */
tcuTexture.Texture2DArrayView.prototype.getHeight = function() { return this.m_numLevels > 0 ? this.m_levels[0].getHeight() : 0; };
/** @return {number} */
tcuTexture.Texture2DArrayView.prototype.getNumLayers = function() { return this.m_numLevels > 0 ? this.m_levels[0].getDepth() : 0; };
/**
 * @param {number} ndx
 * @return {tcuTexture.ConstPixelBufferAccess}
 */
tcuTexture.Texture2DArrayView.prototype.getLevel = function(ndx) { DE_ASSERT(deMath.deInBounds32(ndx, 0, this.m_numLevels)); return this.m_levels[ndx]; };
/** @return {Array<tcuTexture.ConstPixelBufferAccess>} */
tcuTexture.Texture2DArrayView.prototype.getLevels = function() { return this.m_levels; };

/**
 * @param {number} r
 * @return {number} layer corresponding to requested sampling 'r' coordinate
 */
tcuTexture.Texture2DArrayView.prototype.selectLayer = function(r) {
    DE_ASSERT(this.m_numLevels > 0 && this.m_levels);
    return deMath.clamp(Math.round(r), 0, this.m_levels[0].getDepth() - 1);
};

/**
 * @param {tcuTexture.Sampler} sampler
 * @param {Array<number>} texCoord
 * @param {number} lod
 * @return {Array<number>} Pixel color
 */
tcuTexture.Texture2DArrayView.prototype.sample = function(sampler, texCoord, lod) {
    return tcuTexture.sampleLevelArray2D(this.m_levels, this.m_numLevels, sampler, texCoord[0], texCoord[1], this.selectLayer(texCoord[2]), lod);
};

/**
 * @param {tcuTexture.Sampler} sampler
 * @param {number} ref
 * @param {Array<number>} texCoord
 * @param {number} lod
 * @return {number}
 */
tcuTexture.Texture2DArrayView.prototype.sampleCompare = function(sampler, ref, texCoord, lod) {
    throw new Error('Unimplemented');
};

/**
 * @constructor
 * @param {number} numLevels
 * @param {Array<tcuTexture.ConstPixelBufferAccess>} levels
 */
tcuTexture.Texture3DView = function(numLevels, levels) {
    this.m_numLevels = numLevels;
    this.m_levels = levels;
};

/** @return {number} */
tcuTexture.Texture3DView.prototype.getNumLevels = function() { return this.m_numLevels; };
/** @return {number} */
tcuTexture.Texture3DView.prototype.getWidth = function() { return this.m_numLevels > 0 ? this.m_levels[0].getWidth() : 0; };
/** @return {number} */
tcuTexture.Texture3DView.prototype.getHeight = function() { return this.m_numLevels > 0 ? this.m_levels[0].getHeight() : 0; };
/** @return {number} */
tcuTexture.Texture3DView.prototype.getDepth = function() { return this.m_numLevels > 0 ? this.m_levels[0].getDepth() : 0; };
/**
 * @param {number} ndx
 * @return {tcuTexture.ConstPixelBufferAccess}
 */
tcuTexture.Texture3DView.prototype.getLevel = function(ndx) { DE_ASSERT(deMath.deInBounds32(ndx, 0, this.m_numLevels)); return this.m_levels[ndx]; };
/** @return {Array<tcuTexture.ConstPixelBufferAccess>} */
tcuTexture.Texture3DView.prototype.getLevels = function() { return this.m_levels; };

/**
 * @param {number} baseLevel
 * @param {number} maxLevel
 * return {tcuTexture.Texture3DView}
 */
tcuTexture.Texture3DView.prototype.getSubView = function(baseLevel, maxLevel) {
    var clampedBase = deMath.clamp(baseLevel, 0, this.m_numLevels - 1);
    var clampedMax = deMath.clamp(maxLevel, clampedBase, this.m_numLevels - 1);
    var numLevels = clampedMax - clampedBase + 1;
    return new tcuTexture.Texture3DView(numLevels, this.m_levels.slice(clampedBase, numLevels));
};

/**
 * @param {tcuTexture.Sampler} sampler
 * @param {Array<number>} texCoord
 * @param {number} lod
 * @return {Array<number>} Pixel color
 */
tcuTexture.Texture3DView.prototype.sample = function(sampler, texCoord, lod) {
    return tcuTexture.sampleLevelArray3D(this.m_levels, this.m_numLevels, sampler, texCoord[0], texCoord[1], texCoord[2], lod);
};

/**
 * @param {tcuTexture.Sampler} sampler
 * @param {number} ref
 * @param {Array<number>} texCoord
 * @param {number} lod
 * @return {number}
 */
tcuTexture.Texture3DView.prototype.sampleCompare = function(sampler, ref, texCoord, lod) {
    throw new Error('Unimplemented');
};

/* TODO: All view classes are very similar. They should have a common base class */

/**
 * @param {number} width
 * @param {number=} height
 * @return {number} Number of pyramid levels
 */
tcuTexture.computeMipPyramidLevels = function(width, height) {
    var h = height || width;
    return Math.floor(Math.log2(Math.max(width, h))) + 1;
};

/**
 * @param {number} baseLevelSize
 * @param {number} levelNdx
 */
tcuTexture.getMipPyramidLevelSize = function(baseLevelSize, levelNdx) {
    return Math.max(baseLevelSize >> levelNdx, 1);
};

/**
 * @param {Array<number>} coords Vec3 cube coordinates
 * @return {tcuTexture.CubeFaceCoords}
 */
tcuTexture.getCubeFaceCoords = function(coords) {
    var face = tcuTexture.selectCubeFace(coords);
    return new tcuTexture.CubeFaceCoords(face, tcuTexture.projectToFace(face, coords));
};

/**
 * @constructor
 * @extends {tcuTexture.TextureLevelPyramid}
 * @param {tcuTexture.TextureFormat} format
 * @param {number} width
 * @param {number} height
 */
tcuTexture.Texture2D = function(format, width, height) {
    tcuTexture.TextureLevelPyramid.call(this, format, tcuTexture.computeMipPyramidLevels(width, height));
    this.m_width = width;
    this.m_height = height;
    this.m_view = new tcuTexture.Texture2DView(this.getNumLevels(), this.getLevels());
};

tcuTexture.Texture2D.prototype = Object.create(tcuTexture.TextureLevelPyramid.prototype);
tcuTexture.Texture2D.prototype.constructor = tcuTexture.Texture2D;

tcuTexture.Texture2D.prototype.getWidth = function() { return this.m_width; };
tcuTexture.Texture2D.prototype.getHeight = function() { return this.m_height; };

/**
 * @param {number} baseLevel
 * @param {number} maxLevel
 * @return {tcuTexture.Texture2DView}
 */
tcuTexture.Texture2D.prototype.getSubView = function(baseLevel, maxLevel) { return this.m_view.getSubView(baseLevel, maxLevel); };

/**
 * @param {number} levelNdx
 */
tcuTexture.Texture2D.prototype.allocLevel = function(levelNdx) {
    DE_ASSERT(deMath.deInBounds32(levelNdx, 0, this.getNumLevels()));

    var width = tcuTexture.getMipPyramidLevelSize(this.m_width, levelNdx);
    var height = tcuTexture.getMipPyramidLevelSize(this.m_height, levelNdx);

    // console.log('w ' + width + ' h ' + height);
    tcuTexture.TextureLevelPyramid.prototype.allocLevel.call(this, levelNdx, width, height, 1);
};

/**
 * @constructor
 * @extends {tcuTexture.TextureLevelPyramid}
 * @param {tcuTexture.TextureFormat} format
 * @param {number} width
 * @param {number} height
 * @param {number} numLayers
 */
tcuTexture.Texture2DArray = function(format, width, height, numLayers) {
    tcuTexture.TextureLevelPyramid.call(this, format, tcuTexture.computeMipPyramidLevels(width, height));
    this.m_width = width;
    this.m_height = height;
    this.m_numLayers = numLayers;
    this.m_view = new tcuTexture.Texture2DArrayView(this.getNumLevels(), this.getLevels());
};

tcuTexture.Texture2DArray.prototype = Object.create(tcuTexture.TextureLevelPyramid.prototype);
tcuTexture.Texture2DArray.prototype.constructor = tcuTexture.Texture2DArray;
/** @return {tcuTexture.Texture2DArrayView} */
tcuTexture.Texture2DArray.prototype.getView = function() { return this.m_view; };

/**
 * @param {number} levelNdx
 */
tcuTexture.Texture2DArray.prototype.allocLevel = function(levelNdx) {
    DE_ASSERT(deMath.deInBounds32(levelNdx, 0, this.getNumLevels()));

    var width = tcuTexture.getMipPyramidLevelSize(this.m_width, levelNdx);
    var height = tcuTexture.getMipPyramidLevelSize(this.m_height, levelNdx);

    tcuTexture.TextureLevelPyramid.prototype.allocLevel.call(this, levelNdx, width, height, this.m_numLayers);
};

/**
 * @constructor
 * @extends {tcuTexture.TextureLevelPyramid}
 * @param {tcuTexture.TextureFormat} format
 * @param {number} width
 * @param {number} height
 * @param {number} depth
 */
tcuTexture.Texture3D = function(format, width, height, depth) {
    tcuTexture.TextureLevelPyramid.call(this, format, tcuTexture.computeMipPyramidLevels(width, height));
    this.m_width = width;
    this.m_height = height;
    this.m_depth = depth;
    this.m_view = new tcuTexture.Texture3DView(this.getNumLevels(), this.getLevels());
};

tcuTexture.Texture3D.prototype = Object.create(tcuTexture.TextureLevelPyramid.prototype);
tcuTexture.Texture3D.prototype.constructor = tcuTexture.Texture3D;

tcuTexture.Texture3D.prototype.getWidth = function() { return this.m_width; };
tcuTexture.Texture3D.prototype.getHeight = function() { return this.m_height; };
tcuTexture.Texture3D.prototype.getDepth = function() { return this.m_depth; };

/**
 * @param {number} baseLevel
 * @param {number} maxLevel
 * @return {tcuTexture.Texture3DView}
 */
tcuTexture.Texture3D.prototype.getSubView = function(baseLevel, maxLevel) { return this.m_view.getSubView(baseLevel, maxLevel); };

/**
 * @param {number} levelNdx
 */
tcuTexture.Texture3D.prototype.allocLevel = function(levelNdx) {
    DE_ASSERT(deMath.deInBounds32(levelNdx, 0, this.getNumLevels()));

    var width = tcuTexture.getMipPyramidLevelSize(this.m_width, levelNdx);
    var height = tcuTexture.getMipPyramidLevelSize(this.m_height, levelNdx);
    var depth = tcuTexture.getMipPyramidLevelSize(this.m_depth, levelNdx);

    tcuTexture.TextureLevelPyramid.prototype.allocLevel.call(this, levelNdx, width, height, depth);
};

/**
 * @constructor
 * @param {number} numLevels
 * @param {Array<Array<tcuTexture.ConstPixelBufferAccess>>} levels
 */
tcuTexture.TextureCubeView = function(numLevels, levels) {
    this.m_numLevels = numLevels;
    this.m_levels = levels;
};

/**
 * @param {tcuTexture.Sampler} sampler
 * @param {Array<number>} texCoord
 * @param {number} lod
 * @return {Array<number>} Pixel color
 */
tcuTexture.TextureCubeView.prototype.sample = function(sampler, texCoord, lod) {
    DE_ASSERT(sampler.compare == tcuTexture.CompareMode.COMPAREMODE_NONE);

    // Computes (face, s, t).
    var coords = tcuTexture.getCubeFaceCoords(texCoord);
    if (sampler.seamlessCubeMap)
        throw new Error('Not implemented');
//        return sampleLevelArrayCubeSeamless(this.m_levels, this.m_numLevels, coords.face, sampler, coords.s, coords.t, 0 /* depth */, lod);
    else
        return tcuTexture.sampleLevelArray2D(this.m_levels[coords.face], this.m_numLevels, sampler, coords.s, coords.t, 0 /* depth */, lod);
};

/**
 * @param {tcuTexture.CubeFace} face
 * @return {Array<tcuTexture.ConstPixelBufferAccess>}
 */
tcuTexture.TextureCubeView.prototype.getFaceLevels = function(face) { return this.m_levels[face]; };
/** @return {number} */
tcuTexture.TextureCubeView.prototype.getSize = function() { return this.m_numLevels > 0 ? this.m_levels[0][0].getWidth() : 0; };

/**
 * @param {number} baseLevel
 * @param {number} maxLevel
 * @return {tcuTexture.TextureCubeView}
 */
tcuTexture.TextureCubeView.prototype.getSubView = function(baseLevel, maxLevel) {
    var clampedBase = deMath.clamp(baseLevel, 0, this.m_numLevels - 1);
    var clampedMax = deMath.clamp(maxLevel, clampedBase, this.m_numLevels - 1);
    var numLevels = clampedMax - clampedBase + 1;
    var levels = [];
    for (var face in tcuTexture.CubeFace)
        levels.push(this.getFaceLevels(tcuTexture.CubeFace[face]).slice(clampedBase, numLevels));

    return new tcuTexture.TextureCubeView(numLevels, levels);
};

/**
 * @constructor
 * @param {tcuTexture.TextureFormat} format
 * @param {number} size
 */
tcuTexture.TextureCube = function(format, size) {
    this.m_format = format;
    this.m_size = size;
    this.m_data = [];
    this.m_data.length = Object.keys(tcuTexture.CubeFace).length;
    this.m_access = [];
    this.m_access.length = Object.keys(tcuTexture.CubeFace).length;

    var numLevels = tcuTexture.computeMipPyramidLevels(this.m_size);
    var levels = [];
    levels.length = Object.keys(tcuTexture.CubeFace).length;

    for (var face in tcuTexture.CubeFace) {
        this.m_data[tcuTexture.CubeFace[face]] = [];
        for (var i = 0; i < numLevels; i++)
            this.m_data[tcuTexture.CubeFace[face]].push(new tcuTexture.DeqpArrayBuffer());
        this.m_access[tcuTexture.CubeFace[face]] = [];
        this.m_access[tcuTexture.CubeFace[face]].length = numLevels;
        levels[tcuTexture.CubeFace[face]] = this.m_access[tcuTexture.CubeFace[face]];
    }

    this.m_view = new tcuTexture.TextureCubeView(numLevels, levels);
};

/** @return {tcuTexture.TextureFormat} */
tcuTexture.TextureCube.prototype.getFormat = function() { return this.m_format; };
/** @return {number} */
tcuTexture.TextureCube.prototype.getSize = function() { return this.m_size; };
/**
 * @param {number} ndx Level index
 * @param {tcuTexture.CubeFace} face
 * @return {tcuTexture.ConstPixelBufferAccess}
 */
tcuTexture.TextureCube.prototype.getLevelFace = function(ndx, face) { return this.m_access[face][ndx]; };
/** @return {number} */
tcuTexture.TextureCube.prototype.getNumLevels = function() { return this.m_access[0].length; };

/**
 * @param {tcuTexture.Sampler} sampler
 * @param {Array<number>} texCoord
 * @param {number} lod
 * @return {Array<number>} Pixel color
 */
tcuTexture.TextureCube.prototype.sample = function(sampler, texCoord, lod) {
    return this.m_view.sample(sampler, texCoord, lod);
};

/**
 * @param {number} baseLevel
 * @param {number} maxLevel
 * @return {tcuTexture.TextureCubeView}
 */
tcuTexture.TextureCube.prototype.getSubView = function(baseLevel, maxLevel) { return this.m_view.getSubView(baseLevel, maxLevel); };

/**
 * @param {tcuTexture.CubeFace} face
 * @param {number} levelNdx
 * @return {boolean}
 */
tcuTexture.TextureCube.prototype.isLevelEmpty = function(face, levelNdx) {
    return this.m_data[face][levelNdx].empty();
};

/**
 * @param {tcuTexture.CubeFace} face
 * @param {number} levelNdx
 */
tcuTexture.TextureCube.prototype.allocLevel = function(face, levelNdx) {
    /** @const */ var size = tcuTexture.getMipPyramidLevelSize(this.m_size, levelNdx);
    /** @const*/ var dataSize = this.m_format.getPixelSize() * size * size;
    DE_ASSERT(this.isLevelEmpty(face, levelNdx));

    this.m_data[face][levelNdx].setStorage(dataSize);
    this.m_access[face][levelNdx] = new tcuTexture.PixelBufferAccess({
        format: this.m_format,
        width: size,
        height: size,
        depth: 1,
        data: this.m_data[face][levelNdx].m_ptr
    });
};

/**
 * @param {Array<number>} coords Cube coordinates
 * @return {tcuTexture.CubeFace}
 */
tcuTexture.selectCubeFace = function(coords) {
    var x = coords[0];
    var y = coords[1];
    var z = coords[2];
    var ax = Math.abs(x);
    var ay = Math.abs(y);
    var az = Math.abs(z);

    if (ay < ax && az < ax)
        return x >= 0 ? tcuTexture.CubeFace.CUBEFACE_POSITIVE_X : tcuTexture.CubeFace.CUBEFACE_NEGATIVE_X;
    else if (ax < ay && az < ay)
        return y >= 0 ? tcuTexture.CubeFace.CUBEFACE_POSITIVE_Y : tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Y;
    else if (ax < az && ay < az)
        return z >= 0 ? tcuTexture.CubeFace.CUBEFACE_POSITIVE_Z : tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Z;
    else {
        // Some of the components are equal. Use tie-breaking rule.
        if (ax == ay) {
            if (ax < az)
                return z >= 0 ? tcuTexture.CubeFace.CUBEFACE_POSITIVE_Z : tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Z;
            else
                return x >= 0 ? tcuTexture.CubeFace.CUBEFACE_POSITIVE_X : tcuTexture.CubeFace.CUBEFACE_NEGATIVE_X;
        } else if (ax == az) {
            if (az < ay)
                return y >= 0 ? tcuTexture.CubeFace.CUBEFACE_POSITIVE_Y : tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Y;
            else
                return z >= 0 ? tcuTexture.CubeFace.CUBEFACE_POSITIVE_Z : tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Z;
        } else if (ay == az) {
            if (ay < ax)
                return x >= 0 ? tcuTexture.CubeFace.CUBEFACE_POSITIVE_X : tcuTexture.CubeFace.CUBEFACE_NEGATIVE_X;
            else
                return y >= 0 ? tcuTexture.CubeFace.CUBEFACE_POSITIVE_Y : tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Y;
        } else
            return x >= 0 ? tcuTexture.CubeFace.CUBEFACE_POSITIVE_X : tcuTexture.CubeFace.CUBEFACE_NEGATIVE_X;
    }
};

/**
 * @param {tcuTexture.CubeFace} face
 * @param {Array<number>} coord Cube coordinates (Vec3)
 * @return {Array<number>} face coordinates (Vec2)
 */
tcuTexture.projectToFace = function(face, coord) {
    var rx = coord[0];
    var ry = coord[1];
    var rz = coord[2];
    var sc = 0;
    var tc = 0;
    var ma = 0;

    switch (face) {
        case tcuTexture.CubeFace.CUBEFACE_NEGATIVE_X: sc = +rz; tc = -ry; ma = -rx; break;
        case tcuTexture.CubeFace.CUBEFACE_POSITIVE_X: sc = -rz; tc = -ry; ma = +rx; break;
        case tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Y: sc = +rx; tc = -rz; ma = -ry; break;
        case tcuTexture.CubeFace.CUBEFACE_POSITIVE_Y: sc = +rx; tc = +rz; ma = +ry; break;
        case tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Z: sc = -rx; tc = -ry; ma = -rz; break;
        case tcuTexture.CubeFace.CUBEFACE_POSITIVE_Z: sc = +rx; tc = -ry; ma = +rz; break;
        default:
            throw new Error('Unrecognized face ' + face);
    }

    // Compute s, t
    var s = ((sc / ma) + 1) / 2;
    var t = ((tc / ma) + 1) / 2;

    return [s, t];
};

/**
 * @constructor
 * @param {tcuTexture.TextureFormat} format
 * @param {number} width
 * @param {number} height
 * @param {number=} depth
 */
tcuTexture.TextureLevel = function(format, width, height, depth) {
    this.m_format = format;
    this.m_width = width;
    this.m_height = height;
    this.m_depth = depth === undefined ? 1 : depth;
    this.m_data = new tcuTexture.DeqpArrayBuffer();
    this.setSize(this.m_width, this.m_height, this.m_depth);
};

tcuTexture.TextureLevel.prototype.constructor = tcuTexture.TextureLevel;

/**
 * @param {tcuTexture.TextureFormat} format
 * @param {number} width
 * @param {number} height
 * @param {number} depth
 */
tcuTexture.TextureLevel.prototype.setStorage = function(format, width, height, depth) {
    this.m_format = format;
    this.setSize(width, height, depth);
};

/**
 * @param {number} width
 * @param {number} height
 * @param {number} depth
 */
tcuTexture.TextureLevel.prototype.setSize = function(width, height, depth) {
    var pixelSize = this.m_format.getPixelSize();

    this.m_width = width;
    this.m_height = height;
    this.m_depth = depth;

    this.m_data.setStorage(this.m_width * this.m_height * this.m_depth * pixelSize);
};

tcuTexture.TextureLevel.prototype.getAccess = function() {
    return new tcuTexture.PixelBufferAccess({
                    format: this.m_format,
                    width: this.m_width,
                    height: this.m_height,
                    depth: this.m_depth,
                    data: this.m_data.m_ptr
                });

};

/**
 * @return {number}
 */
tcuTexture.TextureLevel.prototype.getWidth = function() {
    return this.m_width;
};

/**
 * @return {number}
 */
tcuTexture.TextureLevel.prototype.getHeight = function() {
    return this.m_height;
};

/**
 * @return {number}
 */
tcuTexture.TextureLevel.prototype.getDepth = function() {
    return this.m_depth;
};

/**
 * @return {?tcuTexture.TextureFormat}
 */
tcuTexture.TextureLevel.prototype.getFormat = function() {
    return this.m_format;
};

});
