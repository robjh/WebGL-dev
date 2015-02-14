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

define(['framework/delibs/debase/deInt32'], function(deInt32)  {
'use strict';

	var DE_ASSERT = function(x) {
		if (!x)
			throw new Error('Assert failed');
	};
	var DE_FALSE = false;

	/* TODO: It's not really a class.
	 * The code should be refactored to use an array directly
	 */
	var Vec4 = function(a, b, c, d) {
		return [a, b, c, d];
	};
	var UVec4 = function(a, b, c, d) {
		return [a, b, c, d];
	};


	var ChannelOrder = {
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
		sRGBA:12,

		D: 13,
		S: 14,
		DS: 15
	};

	var ChannelType = {
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

	var TextureFormat = function(order, type) {
		this.order = order;
		this.type = type;
	};

var isSRGB = function(/*TextureFormat*/ format) {
	return format.order == ChannelOrder.sRGB || format.order == ChannelOrder.sRGBA;
};

/**
 * Get TypedArray type that can be used to access texture.
 * @param {ChannelType} type
 * @return {TypedArray}
 */
var getTypedArray = function(type) {
	switch(type) {
		case ChannelType.SNORM_INT8: return  Int8Array;
		case ChannelType.SNORM_INT16: return  Uint16Array;
		case ChannelType.SNORM_INT32: return  Uint32Array;
		case ChannelType.UNORM_INT8: return  Uint8Array;
		case ChannelType.UNORM_INT16: return  Uint16Array;
		case ChannelType.UNORM_INT32: return  Uint32Array;
		case ChannelType.UNORM_SHORT_565: return  Uint16Array;
		case ChannelType.UNORM_SHORT_555: return  Uint16Array;
		case ChannelType.UNORM_SHORT_4444: return  Uint16Array;
		case ChannelType.UNORM_SHORT_5551: return  Uint16Array;
		case ChannelType.UNORM_INT_101010: return  Uint32Array;
		case ChannelType.UNORM_INT_1010102_REV: return  Uint32Array;
		case ChannelType.UNSIGNED_INT_1010102_REV: return  Uint32Array;
		case ChannelType.UNSIGNED_INT_11F_11F_10F_REV: return  Uint32Array;
		case ChannelType.UNSIGNED_INT_999_E5_REV: return  Uint32Array;
		case ChannelType.UNSIGNED_INT_24_8: return  Uint32A
		case ChannelType.FLOAT: return  Float32Array;rray;
		case ChannelType.SIGNED_INT8: return  Int8Array;
		case ChannelType.SIGNED_INT16: return  Int16Array;
		case ChannelType.SIGNED_INT32: return  Int32Array;
		case ChannelType.UNSIGNED_INT8: return  Uint8Array;
		case ChannelType.UNSIGNED_INT16: return  Uint16Array;
		case ChannelType.UNSIGNED_INT32: return  Uint32Array;
		case ChannelType.HALF_FLOAT: return  Uint16Array;
		case ChannelType.FLOAT_UNSIGNED_INT_24_8_REV: return  Float32Array;
	}

	throw new Error('Unrecognized type ' + type);
};

TextureFormat.prototype.getPixelSize = function() {
	if (this.type == null || this.order == null)
	{
		// Invalid/empty format.
		return 0;
	}
	else if (this.type == ChannelType.UNORM_SHORT_565	||
			 this.type == ChannelType.UNORM_SHORT_555	||
			 this.type == ChannelType.UNORM_SHORT_4444	||
			 this.type == ChannelType.UNORM_SHORT_5551)
	{
		DE_ASSERT(this.order == ChannelOrder.RGB || this.order == ChannelOrder.RGBA);
		return 2;
	}
	else if (this.type == ChannelType.UNORM_INT_101010			||
			 this.type == ChannelType.UNSIGNED_INT_999_E5_REV	||
			 this.type == ChannelType.UNSIGNED_INT_11F_11F_10F_REV)
	{
		DE_ASSERT(this.order == ChannelOrder.RGB);
		return 4;
	}
	else if (this.type == ChannelType.UNORM_INT_1010102_REV		||
			 this.type == ChannelType.UNSIGNED_INT_1010102_REV)
	{
		DE_ASSERT(this.order == ChannelOrder.RGBA);
		return 4;
	}
	else if (this.type == ChannelType.UNSIGNED_INT_24_8)
	{
		DE_ASSERT(this.order == ChannelOrder.D || this.order == ChannelOrder.DS);
		return 4;
	}
	else if (this.type == ChannelType.FLOAT_UNSIGNED_INT_24_8_REV)
	{
		DE_ASSERT(this.order == ChannelOrder.DS);
		return 8;
	}
	else
	{
		var numChannels;
		var channelSize;

		switch (this.order)
		{
			case ChannelOrder.R:			numChannels = 1;	break;
			case ChannelOrder.A:			numChannels = 1;	break;
			case ChannelOrder.I:			numChannels = 1;	break;
			case ChannelOrder.L:			numChannels = 1;	break;
			case ChannelOrder.LA:		numChannels = 2;	break;
			case ChannelOrder.RG:		numChannels = 2;	break;
			case ChannelOrder.RA:		numChannels = 2;	break;
			case ChannelOrder.RGB:		numChannels = 3;	break;
			case ChannelOrder.RGBA:		numChannels = 4;	break;
			case ChannelOrder.ARGB:		numChannels = 4;	break;
			case ChannelOrder.BGRA:		numChannels = 4;	break;
			case ChannelOrder.sRGB:		numChannels = 3;	break;
			case ChannelOrder.sRGBA:		numChannels = 4;	break;
			case ChannelOrder.D:			numChannels = 1;	break;
			case ChannelOrder.S:			numChannels = 1;	break;
			case ChannelOrder.DS:		numChannels = 2;	break;
			default:		DE_ASSERT(DE_FALSE);
		}

		switch (this.type)
		{
			case ChannelType.SNORM_INT8:		channelSize = 1;	break;
			case ChannelType.SNORM_INT16:		channelSize = 2;	break;
			case ChannelType.SNORM_INT32:		channelSize = 4;	break;
			case ChannelType.UNORM_INT8:		channelSize = 1;	break;
			case ChannelType.UNORM_INT16:		channelSize = 2;	break;
			case ChannelType.UNORM_INT32:		channelSize = 4;	break;
			case ChannelType.SIGNED_INT8:		channelSize = 1;	break;
			case ChannelType.SIGNED_INT16:		channelSize = 2;	break;
			case ChannelType.SIGNED_INT32:		channelSize = 4;	break;
			case ChannelType.UNSIGNED_INT8:		channelSize = 1;	break;
			case ChannelType.UNSIGNED_INT16:	channelSize = 2;	break;
			case ChannelType.UNSIGNED_INT32:	channelSize = 4;	break;
			case ChannelType.HALF_FLOAT:		channelSize = 2;	break;
			case ChannelType.FLOAT:				channelSize = 4;	break;
			default:				DE_ASSERT(DE_FALSE);
		}

		return numChannels*channelSize;
	}
};

/*
 * Renamed from ArrayBuffer due to name clash
 * Wraps ArrayBuffer.
 */
var DeqpArrayBuffer = function(numElements) {
	if (numElements)
		this.m_ptr = new ArrayBuffer(numElements);
};

DeqpArrayBuffer.prototype.setStorage = function(numElements) {
	this.m_ptr = new ArrayBuffer(numElements);
};

DeqpArrayBuffer.prototype.size = function() {
	if (this.m_ptr)
		return this.m_ptr.byteLength;

	return 0;
};
	/*bool*/ DeqpArrayBuffer.prototype.empty = function() {
		if (!this.m_ptr)
			return true;
		return this.size() == 0;
	};

/*
 * @enum
 * The values are negative to avoid conflict with channels 0 - 3
 */
var channel = {
	ZERO: -1,
	ONE: -2,
};

var getChannelReadMap = function(order) {
	switch (order) {
	/*static const Channel INV[]	= { channel.ZERO,	channel.ZERO,	channel.ZERO,	channel.ONE }; */

	case ChannelOrder.R: return    [0,		channel.ZERO,	channel.ZERO,	channel.ONE ];
	case ChannelOrder.A: return  [ channel.ZERO,	channel.ZERO,	channel.ZERO,	0	];
	case ChannelOrder.I: return  [ 0,		0,		0,		0	];
	case ChannelOrder.L: return  [ 0,		0,		0,		channel.ONE	];
	case ChannelOrder.LA: return  [ 0,		0,		0,		1	];
	case ChannelOrder.RG: return  [ 0,		1,		channel.ZERO,	channel.ONE	];
	case ChannelOrder.RA: return  [ 0,		channel.ZERO,	channel.ZERO,	1	];
	case ChannelOrder.RGB: return  [ 0,		1,		2,		channel.ONE	];
	case ChannelOrder.RGBA: return  [ 0,		1,		2,		3	];
	case ChannelOrder.BGRA: return  [ 2,		1,		0,		3	];
	case ChannelOrder.ARGB: return  [ 1,		2,		3,		0	];
	case ChannelOrder.D: return  [ 0,		channel.ZERO,	channel.ZERO,	channel.ONE	];
	case ChannelOrder.S: return  [ channel.ZERO,	channel.ZERO,	channel.ZERO,	0	];
	case ChannelOrder.DS: return  [ 0,		channel.ZERO,	channel.ZERO,	1	];
	}

	throw new Error('Unrecognized order ' + order);
};

var getChannelWriteMap = function(order)
{
	switch (order)
	{
		case ChannelOrder.R:			return [ 0];
		case ChannelOrder.A:			return [ 3];
		case ChannelOrder.I:			return [ 0];
		case ChannelOrder.L:			return [ 0];
		case ChannelOrder.LA:			return [ 0, 3];
		case ChannelOrder.RG:			return [ 0, 1];
		case ChannelOrder.RA:			return [ 0, 3];
		case ChannelOrder.RGB:		return [ 0, 1, 2];
		case ChannelOrder.RGBA:		return [ 0, 1, 2, 3];
		case ChannelOrder.ARGB:		return [ 3, 0, 1, 2];
		case ChannelOrder.BGRA:		return [ 2, 1, 0, 3];
		case ChannelOrder.sRGB:		return [ 0, 1, 2];
		case ChannelOrder.sRGBA:		return [ 0, 1, 2, 3];
		case ChannelOrder.D:			return [ 0];
		case ChannelOrder.S:			return [ 3];
		case ChannelOrder.DS:			return [ 0, 3];
	}
	throw new Error('Unrecognized order '+ order);
};

var getChannelSize = function(/* ChannelType */ type)
{
	switch(type) {
		case ChannelType.SNORM_INT8: return 			 1;
		case ChannelType.SNORM_INT16: return 		 2;
		case ChannelType.SNORM_INT32: return 		 4;
		case ChannelType.UNORM_INT8: return 			 1;
		case ChannelType.UNORM_INT16: return 		 2;
		case ChannelType.UNORM_INT32: return 		 4;
		case ChannelType.SIGNED_INT8: return 		 1;
		case ChannelType.SIGNED_INT16: return 		 2;
		case ChannelType.SIGNED_INT32: return 		 4;
		case ChannelType.UNSIGNED_INT8: return 		 1;
		case ChannelType.UNSIGNED_INT16: return 		 2;
		case ChannelType.UNSIGNED_INT32: return 		 4;
		case ChannelType.HALF_FLOAT: return 			 2;
		case ChannelType.FLOAT: return 				 4;

	};
	throw new Error('Unrecognized type ' + type);
};

var channelToNormFloat = function(src, bits) {
	var maxVal = (1 << bits) - 1;
	return src / maxVal;
};

var channelToFloat = function(value, /*ChannelType*/ type)
{
	switch (type)
	{
		case ChannelType.SNORM_INT8:			return Math.max(-1, value / 127);
		case ChannelType.SNORM_INT16:		return Math.max(-1, value / 32767);
		case ChannelType.SNORM_INT32:		return Math.max(-1, value / 2147483647);
		case ChannelType.UNORM_INT8:			return value / 255;
		case ChannelType.UNORM_INT16:		return value / 65535;
		case ChannelType.UNORM_INT32:		return value / 4294967295;
		case ChannelType.SIGNED_INT8:		return value;
		case ChannelType.SIGNED_INT16:		return value;
		case ChannelType.SIGNED_INT32:		return value;
		case ChannelType.UNSIGNED_INT8:		return value;
		case ChannelType.UNSIGNED_INT16:		return value;
		case ChannelType.UNSIGNED_INT32:		return value;
		case ChannelType.HALF_FLOAT:			return deFloat16To32(value); /*TODO: Implement */
		case ChannelType.FLOAT:				return value;
		default:
			DE_ASSERT(DE_FALSE);
			return 0;
	}
};

var getNumUsedChannels = function(order)
{
	switch (order)
	{
		case ChannelOrder.R:			return 1;
		case ChannelOrder.A:			return 1;
		case ChannelOrder.I:			return 1;
		case ChannelOrder.L:			return 1;
		case ChannelOrder.LA:			return 2;
		case ChannelOrder.RG:			return 2;
		case ChannelOrder.RA:			return 2;
		case ChannelOrder.RGB:		return 3;
		case ChannelOrder.RGBA:		return 4;
		case ChannelOrder.ARGB:		return 4;
		case ChannelOrder.BGRA:		return 4;
		case ChannelOrder.sRGB:		return 3;
		case ChannelOrder.sRGBA:		return 4;
		case ChannelOrder.D:			return 1;
		case ChannelOrder.S:			return 1;
		case ChannelOrder.DS:			return 2;
		default:
			DE_ASSERT(DE_FALSE);
			return 0;
	}
};

/**
 * @enum
 */
var WrapMode = {
	CLAMP_TO_EDGE: 0,	//! Clamp to edge
	CLAMP_TO_BORDER: 1,	//! Use border color at edge
	REPEAT_GL: 2,			//! Repeat with OpenGL semantics
	REPEAT_CL: 3,			//! Repeat with OpenCL semantics
	MIRRORED_REPEAT_GL: 4,	//! Mirrored repeat with OpenGL semantics
	MIRRORED_REPEAT_CL: 5 //! Mirrored repeat with OpenCL semantics
};

/**
 * @enum
 */
var FilterMode = {
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
var CompareMode = {
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

var Sampler = function(wrapS, wrapT, wrapR, minFilter, magFilter, lodThreshold, normalizedCoords, compare, compareChannel, borderColor, seamlessCubeMap) {
	this.wrapS = wrapS;
	this.wrapT = wrapT;
	this.wrapR = wrapR;
	this.minFilter = minFilter;
	this.magFilter = magFilter;
	this.lodThreshold = lodThreshold || 0;
	this.normalizedCoords = normalizedCoords || true;
	this.compare = compare || CompareMode.COMPAREMODE_NONE;
	this.compareChannel = compareChannel || 0;
	this.borderColor = borderColor || [0, 0, 0, 0];
	this.seamlessCubeMap = seamlessCubeMap || false;
};

// Special unnormalization for REPEAT_CL and MIRRORED_REPEAT_CL wrap modes; otherwise ordinary unnormalization.
var unnormalize = function(/*Sampler::WrapMode*/ mode, c, /*int*/ size) {
	switch (mode)
	{
		case WrapMode.CLAMP_TO_EDGE:
		case WrapMode.CLAMP_TO_BORDER:
		case WrapMode.REPEAT_GL:
		case WrapMode.MIRRORED_REPEAT_GL: // Fall-through (ordinary case).
			return size * c;

		case WrapMode.REPEAT_CL:
			return size * (c - Math.floor(c));

		case WrapMode.MIRRORED_REPEAT_CL:
			return size * Math.abs(c - 2 * Math.rint(0.5 * c));
	}
	throw new Error('Unrecognized wrap mode ' + mode);
};

var wrap = function(/*Sampler::WrapMode*/ mode, /*int*/ c, /*int*/ size) {
	switch (mode)
	{
		case WrapMode.CLAMP_TO_BORDER:
			return c.clamp(-1, size);

		case WrapMode.CLAMP_TO_EDGE:
			return c.clamp(0, size-1);

		case WrapMode.REPEAT_GL:
			return c.imod(size);

		case WrapMode.REPEAT_CL:
			return c.imod(size);

		case WrapMode.MIRRORED_REPEAT_GL:
			return (size - 1) - (c.imod(2*size) - size).mirror();

		case WrapMode.MIRRORED_REPEAT_CL:
			return c.clamp(0, size-1); // \note Actual mirroring done already in unnormalization function.
	}
	throw new Error('Unrecognized wrap mode ' + mode);
};

// Texel lookup with color conversion.
var lookup = function(/*const ConstPixelBufferAccess&*/ access, i, j, k) {
	var p = access.getPixel(i, j, k);
	// console.log('Lookup at ' + i + ' ' + j + ' ' + k);
	// console.log(p);
	return isSRGB(access.getFormat()) ? sRGBToLinear(p) : p;
};

var sampleNearest2D = function (/*const ConstPixelBufferAccess&*/ access, /*const Sampler&*/ sampler, u, v, /*int*/ depth) {
	var width	= access.getWidth();
	var height	= access.getHeight();

	var x = Math.round(Math.floor(u));
	var y = Math.round(Math.floor(v));

	// Check for CLAMP_TO_BORDER.
	if ((sampler.wrapS == WrapMode.CLAMP_TO_BORDER && !deInt32.deInBounds32(x, 0, width)) ||
		(sampler.wrapT == WrapMode.CLAMP_TO_BORDER && !deInt32.deInBounds32(y, 0, height)))
		return sampler.borderColor;

	var i = wrap(sampler.wrapS, x, width);
	var j = wrap(sampler.wrapT, y, height);

	return lookup(access, i, j, depth);
};

/*--------------------------------------------------------------------*//*!
 * \brief Read-only pixel data access
 *
 * ConstPixelBufferAccess encapsulates pixel data pointer along with
 * format and layout information. It can be used for read-only access
 * to arbitrary pixel buffers.
 *
 * Access objects are like iterators or pointers. They can be passed around
 * as values and are valid as long as the storage doesn't change.
 *//*--------------------------------------------------------------------*/
var  ConstPixelBufferAccess = function(descriptor) {
	if (descriptor) {
		this.m_format = descriptor.format;
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

	ConstPixelBufferAccess.prototype.getDataSize = function() { return this.m_depth * this.m_slicePitch;	};
	ConstPixelBufferAccess.prototype.getDataPtr = function() {
			var arrayType = getTypedArray(this.m_format.type);
 			return new arrayType(this.m_data);
 	};

	ConstPixelBufferAccess.prototype.getRowPitch = function() { return this.m_rowPitch;	};
	ConstPixelBufferAccess.prototype.getWidth = function() { return this.m_width;	};
	ConstPixelBufferAccess.prototype.getHeight = function() { return this.m_height;	};
	ConstPixelBufferAccess.prototype.getFormat = function() { return this.m_format;	};

	ConstPixelBufferAccess.prototype.getPixel = function(x, y, z) {
		if (z == null)
			z = 0;
	DE_ASSERT(deInt32.deInBounds32(x, 0, this.m_width));
	DE_ASSERT(deInt32.deInBounds32(y, 0, this.m_height));
	DE_ASSERT(deInt32.deInBounds32(z, 0, this.m_depth));

	var				pixelSize		= this.m_format.getPixelSize();
	var arrayType = getTypedArray(this.m_format.type);
	var offset = z * this.m_slicePitch + y * this.m_rowPitch + x * pixelSize;
	var pixelPtr = new arrayType(this.m_data, z * this.m_slicePitch + y * this.m_rowPitch + x * pixelSize);

	var ub = function(pixel, offset, count) {
		return (pixel >> offset) & ((1 << count) - 1);
	};
	var nb = function(pixel, offset, count) {
		return channelToNormFloat(ub(pixel, offset, count), count);
	};

	var pixel = pixelPtr[0];

	// Packed formats.
	switch (this.m_format.type)
	{
		case ChannelType.UNORM_SHORT_565:			return Vec4(nb(pixel, 11,  5), nb(pixel,  5,  6), nb(pixel,  0,  5), 1);
		case ChannelType.UNORM_SHORT_555:			return Vec4(nb(pixel, 10,  5), nb(pixel,  5,  5), nb(pixel,  0,  5), 1);
		case ChannelType.UNORM_SHORT_4444:			return Vec4(nb(pixel, 12,  4), nb(pixel,  8,  4), nb(pixel,  4,  4), nb(pixel,  0, 4));
		case ChannelType.UNORM_SHORT_5551:			return Vec4(nb(pixel, 11,  5), nb(pixel,  6,  5), nb(pixel,  1,  5), nb(pixel,  0, 1));
		case ChannelType.UNORM_INT_101010:			return Vec4(nb(pixel, 22, 10), nb(pixel, 12, 10), nb(pixel,  2, 10), 1);
		case ChannelType.UNORM_INT_1010102_REV:		return Vec4(nb(pixel,  0, 10), nb(pixel, 10, 10), nb(pixel, 20, 10), nb(pixel, 30, 2));
		case ChannelType.UNSIGNED_INT_1010102_REV:	return UVec4(ub(pixel, 0, 10), ub(pixel, 10, 10), ub(pixel, 20, 10), ub(pixel, 30, 2));
		case ChannelType.UNSIGNED_INT_999_E5_REV:	return undefined; /* TODO: Port unpackRGB999E5(*((const deUint32*)pixelPtr));  */

		case ChannelType.UNSIGNED_INT_24_8:
			switch (this.m_format.order)
			{
				// \note Stencil is always ignored.
				case ChannelType.D:	return Vec4(nb(pixel, 8, 24), 0, 0, 1);
				case ChannelType.DS:	return Vec4(nb(pixel, 8, 24), 0, 0, 1 /* (float)ub(0, 8) */);
				default:
					DE_ASSERT(false);
			}

		case ChannelType.FLOAT_UNSIGNED_INT_24_8_REV:
		{
			DE_ASSERT(this.m_format.order == ChannelType.DS);
			// \note Stencil is ignored.
			return Vec4(pixel, 0, 0, 1);
		}

		case ChannelType.UNSIGNED_INT_11F_11F_10F_REV:
			return undefined;
			/* TODO: Implement
			return Vec4(Float11(ub(pixel, 0, 11)).asFloat(), Float11(ub(pixel, 11, 11)).asFloat(), Float10(ub(pixel, 22, 10)).asFloat(), 1);
			*/

		default:
			break;
	}

	// Generic path.
	var			result  = [];
	result.length = 4;
	var	channelMap	= getChannelReadMap(this.m_format.order);
	var				channelSize	= getChannelSize(this.m_format.type);

	for (var c = 0; c < 4; c++)
	{
		var map = channelMap[c];
		if (map == channelMap.ZERO)
			result[c] = 0;
		else if (map == channelMap.ONE)
			result[c] = 1;
		else
			result[c] = channelToFloat(pixelPtr[map], this.m_format.type);
	}

	return result;
};

ConstPixelBufferAccess.prototype.sample2D = function(/*const Sampler&*/ sampler, /*Sampler::FilterMode*/ filter, s, t, /*int*/ depth) {
	DE_ASSERT(deInt32.deInBounds32(depth, 0, this.m_depth));

	// Non-normalized coordinates.
	var u = s;
	var v = t;

	if (sampler.normalizedCoords) {
		u = unnormalize(sampler.wrapS, s, this.m_width);
		v = unnormalize(sampler.wrapT, t, this.m_height);
	}

	switch (filter)
	{
		case FilterMode.NEAREST:	return sampleNearest2D(this, sampler, u, v, depth);
		// case Sampler::LINEAR:	return sampleLinear2D	(*this, sampler, u, v, depth);
		// default:
		// 	DE_ASSERT(DE_FALSE);
		// 	return Vec4(0.0f);
	}
	throw new Error('Unimplemented');
};


	/* TODO: do we need any of these? */
	{
		// template<typename T>
		// Vector<T, 4>			getPixelT					(int x, int y, int z = 0) const;

		// float					getPixDepth					(int x, int y, int z = 0) const;
		// int						getPixStencil				(int x, int y, int z = 0) const;

		// Vec4					sample1D					(const Sampler& sampler, Sampler::FilterMode filter, float s, int level) const;
		// Vec4					sample3D					(const Sampler& sampler, Sampler::FilterMode filter, float s, float t, float r) const;

		// Vec4					sample1DOffset				(const Sampler& sampler, Sampler::FilterMode filter, float s, const IVec2& offset) const;
		// Vec4					sample2DOffset				(const Sampler& sampler, Sampler::FilterMode filter, float s, float t, const IVec3& offset) const;
		// Vec4					sample3DOffset				(const Sampler& sampler, Sampler::FilterMode filter, float s, float t, float r, const IVec3& offset) const;

		// float					sample1DCompare				(const Sampler& sampler, Sampler::FilterMode filter, float ref, float s, const IVec2& offset) const;
		// float					sample2DCompare				(const Sampler& sampler, Sampler::FilterMode filter, float ref, float s, float t, const IVec3& offset) const;
	}

/* Common type limits */
var deTypes = {
	deInt8: {min: -(1<<7), max: (1<<7) - 1},
	deInt16: {min: -(1<<15), max: (1<<15) - 1},
	deInt32: {min: -(1<<31), max: (1<<31) - 1},
	deUint8: {min: 0, max: (1<<8) - 1},
	deUint16: {min: 0, max: (1<<16) - 1},
	deUint32: {min: 0, max: 4294967295}
};

/*
 * @param {deTypes} deType
 */
var convertSatRte = function(deType, value) {
	var minVal = deType.min;
	var maxVal = deType.max;
	var floor = Math.floor(value);
	var frac = value - floor;
	if (frac == 0.5)
		if (floor % 2  != 0)
			floor += 1;
	else if (frac > 0.5)
		floor += 1;

	return Math.max(minVal, Math.min(maxVal, floor));
};

var normFloatToChannel = function(src, bits) {
	var maxVal = (1 << bits) - 1;
	var intVal = convertSatRte(deTypes.deUint32, src * maxVal);
	return Math.min(maxVal, intVal);
};

var uintToChannel = function(src, bits) {
	var maxVal = (1 << bits) - 1;
	return Math.min(maxVal, src);
};

/*
 * @return Converted src color value
 */
var floatToChannel = function(src, type) {
	switch (type)
	{
		case ChannelType.SNORM_INT8: return convertSatRte(deTypes.deInt8, src * 127);
		case ChannelType.SNORM_INT16: return convertSatRte(deTypes.deInt16, src * 32767);
		case ChannelType.SNORM_INT32: return convertSatRte(deTypes.deInt32, src * 2147483647);
		case ChannelType.UNORM_INT8: return convertSatRte(deTypes.deUint8, src * 255);
		case ChannelType.UNORM_INT16: return convertSatRte(deTypes.deUint16, src * 65535);
		case ChannelType.UNORM_INT32: return convertSatRte(deTypes.deUint32, src * 4294967295);
		case ChannelType.SIGNED_INT8: return convertSatRte(deTypes.deInt8, src);
		case ChannelType.SIGNED_INT16: return convertSatRte(deTypes.deInt16, src);
		case ChannelType.SIGNED_INT32: return convertSatRte(deTypes.deInt32, src);
		case ChannelType.UNSIGNED_INT8: return convertSatRte(deTypes.deUint8, src);
		case ChannelType.UNSIGNED_INT16: return convertSatRte(deTypes.deUint16, src);
		case ChannelType.UNSIGNED_INT32: return convertSatRte(deTypes.deUint32, src);
		case ChannelType.HALF_FLOAT: return deFloat32To16(src); /* TODO: Port */
		case ChannelType.FLOAT: return src;
	}
	throw new Error('Unrecognized type ' + type);
};

/*--------------------------------------------------------------------*//*!
 * \brief Read-write pixel data access
 *
 * This class extends read-only access object by providing write functionality.
 *
 * \note PixelBufferAccess may not have any data members nor add any
 *		 virtual functions. It must be possible to reinterpret_cast<>
 *		 PixelBufferAccess to ConstPixelBufferAccess.
 *//*--------------------------------------------------------------------*/
var PixelBufferAccess = function(descriptor) {
	ConstPixelBufferAccess.call(this, descriptor);
};

PixelBufferAccess.prototype = Object.create(ConstPixelBufferAccess.prototype);
PixelBufferAccess.prototype.constructor = PixelBufferAccess;

PixelBufferAccess.prototype.setPixel = function(color, x, y, z) {
		if (z == null)
			z = 0;
	DE_ASSERT(deInt32.deInBounds32(x, 0, this.m_width));
	DE_ASSERT(deInt32.deInBounds32(y, 0, this.m_height));
	DE_ASSERT(deInt32.deInBounds32(z, 0, this.m_depth));

	var				pixelSize		= this.m_format.getPixelSize();
	var arrayType = getTypedArray(this.m_format.type);
	var offset = z * this.m_slicePitch + y * this.m_rowPitch + x * pixelSize;
	var pixelPtr = new arrayType(this.m_data, z * this.m_slicePitch + y * this.m_rowPitch + x * pixelSize);

	var pn = function(val, offs, bits) {
		return normFloatToChannel(val, bits) << offs;
	};

	var pu = function(val, offs, bits) {
		return uintToChannel(val, bits << offs);
	};

	// Packed formats.
	switch (this.m_format.type)
	{
		case ChannelType.UNORM_SHORT_565:			pixelPtr[0] = pn(color[0], 11,  5)| pn(color[1],  5,  6)| pn(color[2],  0,  5); break;
		case ChannelType.UNORM_SHORT_555:			pixelPtr[0] = pn(color[0], 10,  5)| pn(color[1],  5,  5)| pn(color[2],  0,  5); break;
		case ChannelType.UNORM_SHORT_4444:			pixelPtr[0] = pn(color[0], 12,  4)| pn(color[1],  8,  4)| pn(color[2],  4,  4)| pn(color[3],  0, 4); break;
		case ChannelType.UNORM_SHORT_5551:			pixelPtr[0] = pn(color[0], 11,  5)| pn(color[1],  6,  5)| pn(color[2],  1,  5)| pn(color[3],  0, 1); break;
		case ChannelType.UNORM_INT_101010:			pixelPtr[0] = pn(color[0], 22, 10)| pn(color[1], 12, 10)| pn(color[2],  2, 10); break;
		case ChannelType.UNORM_INT_1010102_REV:		pixelPtr[0] = pn(color[0],  0, 10)| pn(color[1], 10, 10)| pn(color[2], 20, 10)| pn(color[3], 30, 2); break;
		case ChannelType.UNSIGNED_INT_1010102_REV:	pixelPtr[0] = pu(color[0],  0, 10)| pu(color[1], 10, 10)| pu(color[2], 20, 10)| pu(color[3], 30, 2); break;
		case ChannelType.UNSIGNED_INT_999_E5_REV:	pixelPtr[0] = undefined;  break;/* TODO: Port*/

		case ChannelType.UNSIGNED_INT_24_8:
			switch (this.m_format.order)
			{
				// \note Stencil is always ignored.
				case ChannelType.D:	pixelPtr[0] = pn(color[0], 8, 24);
				case ChannelType.S:	pixelPtr[0] = pn(color[3], 8, 24);
				case ChannelType.DS:	pixelPtr[0] = pn(color[0], 8, 24) | pu(color[3], 0, 8);
				default:
					DE_ASSERT(false);
			}
			break;

		case ChannelType.FLOAT_UNSIGNED_INT_24_8_REV:
		{
			/*TODO: Port */
			throw new Error('Unimplemented');
		}

		case ChannelType.UNSIGNED_INT_11F_11F_10F_REV:
		{
			/*TODO: Port */
			throw new Error('Unimplemented');
		}
		case ChannelType.FLOAT:
			if (this.m_format.order == ChannelOrder.D)
			{
				pixelPtr[0] = color[0];
				break;
			}
			// else fall-through to default case!

		default:
		{
			// Generic path.
			var			numChannels	= getNumUsedChannels(this.m_format.order);
			var	map			= getChannelWriteMap(this.m_format.order);

			for (var c = 0; c < numChannels; c++)
				floatToChannel(pixelPtr[c], color[map[c]], this.m_format.type);
		}
	}
};

/* TODO: Port */
// {
// public:
// 							PixelBufferAccess			(void) {}
// 							PixelBufferAccess			(TextureLevel& level);
// 							PixelBufferAccess			(const TextureFormat& format, int width, int height, int depth, void* data);
// 							PixelBufferAccess			(const TextureFormat& format, int width, int height, int depth, int rowPitch, int slicePitch, void* data);

// 	void*					getDataPtr					(void) const { return m_data; }

// 	void					setPixels					(const void* buf, int bufSize) const;
// 	void					setPixel					(const tcu::Vec4& color, int x, int y, int z = 0) const;
// 	void					setPixel					(const tcu::IVec4& color, int x, int y, int z = 0) const;
// 	void					setPixel					(const tcu::UVec4& color, int x, int y, int z = 0) const { setPixel(color.cast<int>(), x, y, z); }

// 	void					setPixDepth					(float depth, int x, int y, int z = 0) const;
// 	void					setPixStencil				(int stencil, int x, int y, int z = 0) const;
// };

/*
 * @param {TextureFormat} format
 */
var TextureLevelPyramid = function(format, numLevels) {
	console.log('In Pyramid constructor');
	/* TextureFormat */this.m_format = format;
	/* LevelData */ this.m_data = [];
	for (var i = 0; i < numLevels; i++)
		this.m_data.push(new DeqpArrayBuffer());
	/* PixelBufferAccess */ this.m_access = [];
	this.m_access.length = numLevels;
	console.log('In Pyramid constructor' + this.m_format);
};
/*
 * @return {bool}
 */

	TextureLevelPyramid.prototype.isLevelEmpty	= function(levelNdx) { return this.m_data[levelNdx].empty();	};
	TextureLevelPyramid.prototype.getFormat	= function()			{ return this.m_format;		};
	TextureLevelPyramid.prototype.getNumLevels	= function()			{ return this.m_access.length;		};
	TextureLevelPyramid.prototype.getLevel	= function(ndx) 			{ return this.m_access[ndx];				};
	TextureLevelPyramid.prototype.getLevels	= function()			{ return this.m_access;				};
	TextureLevelPyramid.prototype.allocLevel = function(levelNdx, width, height, depth) {
	console.log('In Pyramid allocLevel 1' + this);
	console.log('In Pyramid allocLevel 2'  + this.m_format);
	/*const int*/ var	size	= this.m_format.getPixelSize()*width*height*depth;

	DE_ASSERT(this.isLevelEmpty(levelNdx));

	this.m_data[levelNdx].setStorage(size);
	this.m_access[levelNdx] = new PixelBufferAccess({
		format: this.m_format,
		width: width,
		height: height,
		depth: depth,
		data: this.m_data[levelNdx].m_ptr
	});

	};

	TextureLevelPyramid.prototype.clearLevel = function(levelNdx) {
		/* TODO: Implement */
		throw new Error('Not implemented');
	};

var sampleLevelArray2D = function(/*const ConstPixelBufferAccess* */ levels, /*int*/ numLevels, /*const Sampler&*/ sampler, s, t, /*int*/ depth, lod) {
	var					magnified	= lod <= sampler.lodThreshold;
	var		filterMode	= magnified ? sampler.magFilter : sampler.minFilter;

	switch (filterMode)
	{
		case FilterMode.NEAREST:	return levels[0].sample2D(sampler, filterMode, s, t, depth);
		/* TODO: Implement other filters */
		// case Sampler::LINEAR:	return levels[0].sample2D(sampler, filterMode, s, t, depth);

		// case Sampler::NEAREST_MIPMAP_NEAREST:
		// case Sampler::LINEAR_MIPMAP_NEAREST:
		// {
		// 	int					maxLevel	= (int)numLevels-1;
		// 	int					level		= deClamp32((int)deFloatCeil(lod + 0.5f) - 1, 0, maxLevel);
		// 	Sampler::FilterMode	levelFilter	= (filterMode == Sampler::LINEAR_MIPMAP_NEAREST) ? Sampler::LINEAR : Sampler::NEAREST;

		// 	return levels[level].sample2D(sampler, levelFilter, s, t, depth);
		// }

		// case Sampler::NEAREST_MIPMAP_LINEAR:
		// case Sampler::LINEAR_MIPMAP_LINEAR:
		// {
		// 	int					maxLevel	= (int)numLevels-1;
		// 	int					level0		= deClamp32((int)deFloatFloor(lod), 0, maxLevel);
		// 	int					level1		= de::min(maxLevel, level0 + 1);
		// 	Sampler::FilterMode	levelFilter	= (filterMode == Sampler::LINEAR_MIPMAP_LINEAR) ? Sampler::LINEAR : Sampler::NEAREST;
		// 	float				f			= deFloatFrac(lod);
		// 	tcu::Vec4			t0			= levels[level0].sample2D(sampler, levelFilter, s, t, depth);
		// 	tcu::Vec4			t1			= levels[level1].sample2D(sampler, levelFilter, s, t, depth);

		// 	return t0*(1.0f - f) + t1*f;
		// }

		// default:
		// 	DE_ASSERT(DE_FALSE);
		// 	return Vec4(0.0f);
	}
	throw new Error('Unimplemented');
};

/*--------------------------------------------------------------------*//*!
 * \brief 2D Texture View
 *//*--------------------------------------------------------------------*/
 /* TODO: Port */
var Texture2DView = function(numLevels, levels) {
	this.m_numLevels = numLevels;
	this.m_levels = levels;
};

	Texture2DView.prototype.getNumLevels = function()	{ return this.m_numLevels;										};
	Texture2DView.prototype.getWidth = function() 	{ return this.m_numLevels > 0 ? this.m_levels[0].getWidth()	: 0;	};
	Texture2DView.prototype.getHeight = function() { return this.m_numLevels > 0 ? this.m_levels[0].getHeight()	: 0;	};
	/*const ConstPixelBufferAccess&*/ Texture2DView.prototype.getLevel	= function(ndx) { DE_ASSERT(deInt32.deInBounds32(ndx, 0, this.m_numLevels)); return this.m_levels[ndx];	};
	/*const ConstPixelBufferAccess**/ Texture2DView.prototype.getLevels	= function() { return this.m_levels;											};

Texture2DView.prototype.getSubView = function(baseLevel, maxLevel) {
	var	clampedBase	= baseLevel.clamp(0, this.m_numLevels-1);
	var	clampedMax	= maxLevel.clamp(clampedBase, this.m_numLevels-1);
	var	numLevels	= clampedMax-clampedBase+1;
	return new Texture2DView(numLevels, this.m_levels.slice(clampedBase,numLevels));
};

Texture2DView.prototype.sample = function(/*const Sampler&*/ sampler, s,t, lod) {
	return sampleLevelArray2D(this.m_levels, this.m_numLevels, sampler, s, t, 0 /* depth */, lod);
};

	/* TODO: Port
	Vec4							sample				(const Sampler& sampler, float s, float t, float lod) const;
	Vec4							sampleOffset		(const Sampler& sampler, float s, float t, float lod, const IVec2& offset) const;
	float							sampleCompare		(const Sampler& sampler, float ref, float s, float t, float lod) const;
	float							sampleCompareOffset	(const Sampler& sampler, float ref, float s, float t, float lod, const IVec2& offset) const;

	Vec4							gatherOffsets		(const Sampler& sampler, float s, float t, int componentNdx, const IVec2 (&offsets)[4]) const;
	Vec4							gatherOffsetsCompare(const Sampler& sampler, float ref, float s, float t, const IVec2 (&offsets)[4]) const;
	*/

var computeMipPyramidLevels = function(width, height) {
	return Math.floor(Math.log2(Math.max(width, height))) + 1;
};

var getMipPyramidLevelSize = function(baseLevelSize, levelNdx) {
	return Math.max(baseLevelSize >> levelNdx, 1);
};


var Texture2D = function(format, width, height) {
	console.log('In Texture 2D constructor');
	TextureLevelPyramid.call(this, format, computeMipPyramidLevels(width, height));
	this.m_width = width;
	this.m_height = height;
	this.m_view = new Texture2DView(this.getNumLevels(), this.getLevels());
	console.log('In Texture2D constructor' + this.m_format);
};

Texture2D.prototype = Object.create(TextureLevelPyramid.prototype);
Texture2D.prototype.constructor = Texture2D;

Texture2D.prototype.getSubView = function(baseLevel, maxLevel) { return this.m_view.getSubView(baseLevel, maxLevel); }
Texture2D.prototype.allocLevel = function(levelNdx) {
	console.log('In Texture 2D allocLevel'  + this.m_format);
	DE_ASSERT(deInt32.deInBounds32(levelNdx, 0, this.getNumLevels()));

	var	width	= getMipPyramidLevelSize(this.m_width, levelNdx);
	var height	= getMipPyramidLevelSize(this.m_height, levelNdx);

	console.log('w ' + width + ' h ' + height);
	TextureLevelPyramid.prototype.allocLevel.call(this, levelNdx, width, height, 1);
};
	return {
		TextureFormat: TextureFormat,
		ChannelType: ChannelType,
		ChannelOrder: ChannelOrder,
		DeqpArrayBuffer: DeqpArrayBuffer,
		/* TODO: remove - it shouldn't be exported */
		TextureLevelPyramid: TextureLevelPyramid,
		ConstPixelBufferAccess: ConstPixelBufferAccess,
		PixelBufferAccess: PixelBufferAccess,
		Texture2D: Texture2D,
		WrapMode: WrapMode,
		FilterMode: FilterMode,
		Sampler: Sampler
	};
});
