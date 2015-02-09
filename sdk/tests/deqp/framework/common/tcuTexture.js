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

define(['../delibs/debase/deInt32'], function(deInt32)  {
'use strict';

	var DE_ASSERT = function(x) {
		if (!x)
			throw new Error('Assert failed');
	};
	var DE_FALSE = false;

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
		this.m_depth = descriptor.depth;
		this.m_data = descriptor.data;
		if (descriptor.rowPitch)
			this.m_rowPitch = descriptor.rowPitch;
		else
			this.m_rowPitch = this.width * this.m_format.getPixelSize();

		if (descriptor.slicePitch)
			this.m_slicePitch = descriptor.slicePitch;
		else
			this.m_slicePitch = this.m_rowPitch * this.m_height;
	}
};

	ConstPixelBufferAccess.prototype.getDataSize = function() { return this.m_depth * this.m_slicePitch;	};

	ConstPixelBufferAccess.prototype.getPixel = function(x, y, z) {
		/* TODO: implement */
		throw new Error('Not implemented');
	};

	/* TODO: do we need any of these? */
	{
		// template<typename T>
		// Vector<T, 4>			getPixelT					(int x, int y, int z = 0) const;

		// float					getPixDepth					(int x, int y, int z = 0) const;
		// int						getPixStencil				(int x, int y, int z = 0) const;

		// Vec4					sample1D					(const Sampler& sampler, Sampler::FilterMode filter, float s, int level) const;
		// Vec4					sample2D					(const Sampler& sampler, Sampler::FilterMode filter, float s, float t, int depth) const;
		// Vec4					sample3D					(const Sampler& sampler, Sampler::FilterMode filter, float s, float t, float r) const;

		// Vec4					sample1DOffset				(const Sampler& sampler, Sampler::FilterMode filter, float s, const IVec2& offset) const;
		// Vec4					sample2DOffset				(const Sampler& sampler, Sampler::FilterMode filter, float s, float t, const IVec3& offset) const;
		// Vec4					sample3DOffset				(const Sampler& sampler, Sampler::FilterMode filter, float s, float t, float r, const IVec3& offset) const;

		// float					sample1DCompare				(const Sampler& sampler, Sampler::FilterMode filter, float ref, float s, const IVec2& offset) const;
		// float					sample2DCompare				(const Sampler& sampler, Sampler::FilterMode filter, float ref, float s, float t, const IVec3& offset) const;
	}

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
	/* TextureFormat */this.m_format = format;
	/* LevelData */ this.m_data = [];
	for (var i = 0; i < numLevels; i++)
		this.m_data.push(new DeqpArrayBuffer());
	/* PixelBufferAccess */ this.m_access = [];
	this.m_access.length = numLevels;
};
/*
 * @return {bool}
 */

	TextureLevelPyramid.prototype.isLevelEmpty	= function(levelNdx) { return this.m_data[levelNdx].empty();	};

	TextureLevelPyramid.prototype.getNumLevels	= function()			{ return this.m_access.length;		};
	TextureLevelPyramid.prototype.getLevel	= function(ndx) 			{ return this.m_access[ndx];				};
	TextureLevelPyramid.prototype.getLevels	= function()			{ return this.m_access;				};
	TextureLevelPyramid.prototype.allocLevel = function(levelNdx, width, height, depth) {
	/*const int*/ var	size	= this.m_format.getPixelSize()*width*height*depth;

	DE_ASSERT(this.isLevelEmpty(levelNdx));

	this.m_data[levelNdx].setStorage(size);
	this.m_access[levelNdx] = new PixelBufferAccess({
		format: this.m_format,
		width: width,
		height: height,
		depth: depth,
		data: this.m_data[levelNdx]
	});

	};

	TextureLevelPyramid.prototype.clearLevel = function(levelNdx) {
		/* TODO: Implement */
		throw new Error('Not implemented');
	};

/*--------------------------------------------------------------------*//*!
 * \brief 2D Texture View
 *//*--------------------------------------------------------------------*/
 /* TODO: Port */
var Texture2DView = function(numLevels, levels) {
	this.m_numLevels = numLevels;
	this.levels = levels;
};

	Texture2DView.prototype.getNumLevels = function()	{ return this.m_numLevels;										};
	Texture2DView.prototype.getWidth = function() 	{ return this.m_numLevels > 0 ? this.m_levels[0].getWidth()	: 0;	};
	Texture2DView.prototype.getHeight = function() { return this.m_numLevels > 0 ? this.m_levels[0].getHeight()	: 0;	};
	/*const ConstPixelBufferAccess&*/ Texture2DView.prototype.getLevel	= function(ndx) { DE_ASSERT(deInt32.deInBounds32(ndx, 0, this.m_numLevels)); return this.m_levels[ndx];	};
	/*const ConstPixelBufferAccess**/ Texture2DView.prototype.getLevels	= function() { return this.m_levels;											};

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
}

var Texture2D = function(format, width, height) {
	TextureLevelPyramid.call(this, format, computeMipPyramidLevels(width, height));
	this.m_width = width;
	this.m_height = height;
	this.m_view = new Texture2DView(this.getNumLevels(), this.getLevels());
};

Texture2D.prototype = Object.create(TextureLevelPyramid.prototype);
Texture2D.prototype.constructor = Texture2D;

	return {
		TextureFormat: TextureFormat,
		ChannelType: ChannelType,
		ChannelOrder: ChannelOrder,
		DeqpArrayBuffer: DeqpArrayBuffer,
		/* TODO: remove - it shouldn't be exported */
		TextureLevelPyramid: TextureLevelPyramid,
		Texture2D: Texture2D
	};
});
