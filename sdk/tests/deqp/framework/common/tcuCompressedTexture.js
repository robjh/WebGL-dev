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

/*--------------------------------------------------------------------*//*!
 * \brief Map tcu::TextureFormat to GL pixel transfer format.
 *
 * Maps generic texture format description to GL pixel transfer format.
 * If no mapping is found, throws tcu::InternalError.
 *
 * \param texFormat Generic texture format.
 * \return GL pixel transfer format.
 *//*--------------------------------------------------------------------*/
define(['framework/common/tcuTexture', 'framework/delibs/debase/deInt32'], function(tcuTexture, deInt32) {

	var DE_ASSERT = function(x) {
		if (!x)
			throw new Error('Assert failed');
	};
	var DE_FALSE = false;

/**
 * @enum
 */
var Format = {
	ETC1_RGB8: 0,
	EAC_R11: 1,
	EAC_SIGNED_R11: 2,
	EAC_RG11: 3,
	EAC_SIGNED_RG11: 4,
	ETC2_RGB8: 5,
	ETC2_SRGB8: 6,
	ETC2_RGB8_PUNCHTHROUGH_ALPHA1: 7,
	ETC2_SRGB8_PUNCHTHROUGH_ALPHA1: 8,
	ETC2_EAC_RGBA8: 9,
	ETC2_EAC_SRGB8_ALPHA8: 10,

	ASTC_4x4_RGBA: 11,
	ASTC_5x4_RGBA: 12,
	ASTC_5x5_RGBA: 13,
	ASTC_6x5_RGBA: 14,
	ASTC_6x6_RGBA: 15,
	ASTC_8x5_RGBA: 16,
	ASTC_8x6_RGBA: 17,
	ASTC_8x8_RGBA: 18,
	ASTC_10x5_RGBA: 19,
	ASTC_10x6_RGBA: 20,
	ASTC_10x8_RGBA: 21,
	ASTC_10x10_RGBA: 22,
	ASTC_12x10_RGBA: 23,
	ASTC_12x12_RGBA: 24,
	ASTC_4x4_SRGB8_ALPHA8: 25,
	ASTC_5x4_SRGB8_ALPHA8: 26,
	ASTC_5x5_SRGB8_ALPHA8: 27,
	ASTC_6x5_SRGB8_ALPHA8: 28,
	ASTC_6x6_SRGB8_ALPHA8: 29,
	ASTC_8x5_SRGB8_ALPHA8: 30,
	ASTC_8x6_SRGB8_ALPHA8: 31,
	ASTC_8x8_SRGB8_ALPHA8: 32,
	ASTC_10x5_SRGB8_ALPHA8: 33,
	ASTC_10x6_SRGB8_ALPHA8: 34,
	ASTC_10x8_SRGB8_ALPHA8: 35,
	ASTC_10x10_SRGB8_ALPHA8: 36,
	ASTC_12x10_SRGB8_ALPHA8: 37,
	ASTC_12x12_SRGB8_ALPHA8: 38
};

var divRoundUp = function(a, b) {
	return a/b + ((a%b) ? 1 : 0);
};

var isEtcFormat = function(fmt) {
	switch (fmt) {
		case Format.ETC1_RGB8:
		case Format.EAC_R11:
		case Format.EAC_SIGNED_R11:
		case Format.EAC_RG11:
		case Format.EAC_SIGNED_RG11:
		case Format.ETC2_RGB8:
		case Format.ETC2_SRGB8:
		case Format.ETC2_RGB8_PUNCHTHROUGH_ALPHA1:
		case Format.ETC2_SRGB8_PUNCHTHROUGH_ALPHA1:
		case Format.ETC2_EAC_RGBA8:
		case Format.ETC2_EAC_SRGB8_ALPHA8:
			return true;

		default:
			return false;
	}
};


var etcDecompressInternal = function() {

var ETC2_BLOCK_WIDTH					= 4;
var ETC2_BLOCK_HEIGHT					= 4;
var ETC2_UNCOMPRESSED_PIXEL_SIZE_A8		= 1;
var ETC2_UNCOMPRESSED_PIXEL_SIZE_R11	= 2;
var ETC2_UNCOMPRESSED_PIXEL_SIZE_RG11	= 4;
var ETC2_UNCOMPRESSED_PIXEL_SIZE_RGB8	= 3;
var ETC2_UNCOMPRESSED_PIXEL_SIZE_RGBA8	= 4;
var ETC2_UNCOMPRESSED_BLOCK_SIZE_A8		= ETC2_BLOCK_WIDTH*ETC2_BLOCK_HEIGHT*ETC2_UNCOMPRESSED_PIXEL_SIZE_A8;
var ETC2_UNCOMPRESSED_BLOCK_SIZE_R11	= ETC2_BLOCK_WIDTH*ETC2_BLOCK_HEIGHT*ETC2_UNCOMPRESSED_PIXEL_SIZE_R11;
var ETC2_UNCOMPRESSED_BLOCK_SIZE_RG11	= ETC2_BLOCK_WIDTH*ETC2_BLOCK_HEIGHT*ETC2_UNCOMPRESSED_PIXEL_SIZE_RG11;
var ETC2_UNCOMPRESSED_BLOCK_SIZE_RGB8	= ETC2_BLOCK_WIDTH*ETC2_BLOCK_HEIGHT*ETC2_UNCOMPRESSED_PIXEL_SIZE_RGB8;
var ETC2_UNCOMPRESSED_BLOCK_SIZE_RGBA8	= ETC2_BLOCK_WIDTH*ETC2_BLOCK_HEIGHT*ETC2_UNCOMPRESSED_PIXEL_SIZE_RGBA8;

/**
 * @param {ArrayBuffer} src Source ArrayBuffer
 * @return {Uint8Array}
 */
var get64BitBlock = function(src,  blockNdx) {
	var block = new Uint8Array(src, blockNdx * 8, 8);
	return block;
};

/**
 * @param {ArrayBuffer} src Source ArrayBuffer
 * Return the first 64 bits of a 128 bit block.
 */
var get128BitBlockStart = function(src, blockNdx) {
	return get64BitBlock(src, 2*blockNdx);
};

/**
 * @param {ArrayBuffer} src Source ArrayBuffer
 * Return the last 64 bits of a 128 bit block.
 */
var get128BitBlockEnd = function(src, blockNdx) {
	return get64BitBlock(src, 2*blockNdx + 1);
};

var mask8 = function(src, low, high) {
	if (low > 7 || high < 0)
		return {
			value: 0,
			bits: 0
		};

	var numBits = high - low + 1;
	var mask = (1<<numBits) - 1;

	return {
		value: (src >> low) & mask,
		bits: numBits
	};
};


var getBits64 = function(src, low, high) {
	var result = 0;
	var bits = 0;
	var lowIndex = low;
	var highIndex = high;
	for (var i = 7 ; i >=0; i--) {
		var v = mask8(src[i], Math.max(0, lowIndex), Math.min(7, highIndex));
		lowIndex = lowIndex - 8;
		highIndex = highIndex - 8;
		result = result | (v.value << bits);
		bits = v.bits;
	};
	return result;
};

var getBit64 = function(src, bit) {
	return getBits64(src, bit, bit);
};

var extend11To16 = function(src) {
	return src *  32.015144;
};

var extend11To16WithSign = function(src) {
	if (src < 0)
		return -extend11To16(-src);
	else
		return extend11To16(src);
};

/**
 * @param {Uint16Array} dst
 * @param {Uint8Array} src
 * @param {boolean} signedMode
 */
var decompressEAC11Block = function(dst, src, signedMode)
{
	var modifierTable = [
		[-3,  -6,  -9, -15,  2,  5,  8, 14],
		[-3,  -7, -10, -13,  2,  6,  9, 12],
		[-2,  -5,  -8, -13,  1,  4,  7, 12],
		[-2,  -4,  -6, -13,  1,  3,  5, 12],
		[-3,  -6,  -8, -12,  2,  5,  7, 11],
		[-3,  -7,  -9, -11,  2,  6,  8, 10],
		[-4,  -7,  -8, -11,  3,  6,  7, 10],
		[-3,  -5,  -8, -11,  2,  4,  7, 10],
		[-2,  -6,  -8, -10,  1,  5,  7,  9],
		[-2,  -5,  -8, -10,  1,  4,  7,  9],
		[-2,  -4,  -8, -10,  1,  3,  7,  9],
		[-2,  -5,  -7, -10,  1,  4,  6,  9],
		[-3,  -4,  -7, -10,  2,  3,  6,  9],
		[-1,  -2,  -3, -10,  0,  1,  2,  9],
		[-4,  -6,  -8,  -9,  3,  5,  7,  8],
		[-3,  -5,  -7,  -9,  2,  4,  6,  8]
	];

	var multiplier	= getBits64(src, 52, 55);
	var tableNdx		= getBits64(src, 48, 51);
	var baseCodeword		= getBits64(src, 56, 63);

	if (signedMode) {
		if (baseCodeword > 127)
			baseCodeword -= 256;
		if (baseCodeword == -128)
			baseCodeword = -127;
	}

	var pixelNdx = 0;
	for (var x = 0; x < ETC2_BLOCK_WIDTH; x++) {
		for (var y = 0; y < ETC2_BLOCK_HEIGHT; y++) {
			 var		dstOffset		= (y*ETC2_BLOCK_WIDTH + x);
			 var		pixelBitNdx		= 45 - 3*pixelNdx;
			 var	modifierNdx		= (getBit64(src, pixelBitNdx + 2) << 2) | (getBit64(src, pixelBitNdx + 1) << 1) | getBit64(src, pixelBitNdx);
			 // console.log('TableIndex: ' + tableNdx + ' ModifierNdx: ' + modifierNdx);
			 var		modifier		= modifierTable[tableNdx][modifierNdx];

			if (signedMode)	{
				if (multiplier != 0)
					dst[dstOffset] = deInt32.clamp(baseCodeword*8 + multiplier*modifier*8, -1023, 1023);
				else
					dst[dstOffset] = deInt32.clamp(baseCodeword*8 + modifier, -1023, 1023);
			} else {
				if (multiplier != 0)
					dst[dstOffset] =deInt32.clamp(baseCodeword*8 + 4 + multiplier*modifier*8, 0, 2047);
				else
					dst[dstOffset] = deInt32.clamp(baseCodeword*8 + 4 + modifier, 0, 2047);
			}
			pixelNdx++;
		}
	}
};


var decompressEAC_R11= function(/*const tcu::PixelBufferAccess&*/ dst, width, height, src, signedMode) {
	/* @const */ var		numBlocksX		= divRoundUp(width, 4);
	/* @const */ var numBlocksY		= divRoundUp(height, 4);
	var	dstPtr;
	var		dstRowPitch		= dst.getRowPitch();
	var		dstPixelSize	= ETC2_UNCOMPRESSED_PIXEL_SIZE_R11;
	var		uncompressedBlockArray = new ArrayBuffer(ETC2_UNCOMPRESSED_BLOCK_SIZE_R11);
	var  uncompressedBlock16;
	if (signedMode) {
		dstPtr = new Int16Array(dst.m_data);
		uncompressedBlock16 = new Int16Array(uncompressedBlockArray);
	} else {
		dstPtr = new Uint16Array(dst.m_data);
		uncompressedBlock16 = new Uint16Array(uncompressedBlockArray);
	}

	for (var blockY = 0; blockY < numBlocksY; blockY++)	{
		for (var blockX = 0; blockX < numBlocksX; blockX++)	{
			/*const deUint64*/ var	compressedBlock = get64BitBlock(src, blockY*numBlocksX + blockX);

			// Decompress.
			decompressEAC11Block(uncompressedBlock16, compressedBlock, signedMode);

			// Write to dst.
			var baseX = blockX*ETC2_BLOCK_WIDTH;
			var baseY = blockY*ETC2_BLOCK_HEIGHT;
			for (var y = 0; y < Math.min(ETC2_BLOCK_HEIGHT, height-baseY); y++)	{
				for (var x = 0; x < Math.min(ETC2_BLOCK_WIDTH, width-baseX); x++) {
					DE_ASSERT(ETC2_UNCOMPRESSED_PIXEL_SIZE_R11 == 2);

					if (signedMode) {
						var srcIndex = y*ETC2_BLOCK_WIDTH + x;
						var dstIndex = (baseY+y)*dstRowPitch/dstPixelSize + baseX + x;

						dstPtr[dstIndex] = extend11To16WithSign(uncompressedBlock16[srcIndex]);
					} else {
						var srcIndex = y*ETC2_BLOCK_WIDTH + x;
						var dstIndex = (baseY+y)*dstRowPitch/dstPixelSize + baseX + x;

						dstPtr[dstIndex] = extend11To16(uncompressedBlock16[srcIndex]);
					}
				}
			}
		}
	}
};


var decompressEAC_RG11= function(/*const tcu::PixelBufferAccess&*/ dst, width, height, src, signedMode) {
	/* @const */ var		numBlocksX		= divRoundUp(width, 4);
	/* @const */ var numBlocksY		= divRoundUp(height, 4);
	var	dstPtr;
	var		dstRowPitch		= dst.getRowPitch();
	var		dstPixelSize	= ETC2_UNCOMPRESSED_PIXEL_SIZE_RG11;
	var		uncompressedBlockArrayR = new ArrayBuffer(ETC2_UNCOMPRESSED_BLOCK_SIZE_R11);
	var		uncompressedBlockArrayG = new ArrayBuffer(ETC2_UNCOMPRESSED_BLOCK_SIZE_R11);
	var  uncompressedBlockR16;
	var  uncompressedBlockG16;
	if (signedMode) {
		dstPtr = new Int16Array(dst.m_data);
		uncompressedBlockR16 = new Int16Array(uncompressedBlockArrayR);
		uncompressedBlockG16 = new Int16Array(uncompressedBlockArrayG);
	} else {
		dstPtr = new Uint16Array(dst.m_data);
		uncompressedBlockR16 = new Uint16Array(uncompressedBlockArrayR);
		uncompressedBlockG16 = new Uint16Array(uncompressedBlockArrayG);
	}

	for (var blockY = 0; blockY < numBlocksY; blockY++)	{
		for (var blockX = 0; blockX < numBlocksX; blockX++)	{
			/*const deUint64*/ var	compressedBlockR = get128BitBlockStart(src, blockY*numBlocksX + blockX);
			/*const deUint64*/ var	compressedBlockG = get128BitBlockEnd(src, blockY*numBlocksX + blockX);

			// Decompress.
			decompressEAC11Block(uncompressedBlockR16, compressedBlockR, signedMode);
			decompressEAC11Block(uncompressedBlockG16, compressedBlockG, signedMode);

			// Write to dst.
			var baseX = blockX*ETC2_BLOCK_WIDTH;
			var baseY = blockY*ETC2_BLOCK_HEIGHT;
			for (var y = 0; y < Math.min(ETC2_BLOCK_HEIGHT, height-baseY); y++)	{
				for (var x = 0; x < Math.min(ETC2_BLOCK_WIDTH, width-baseX); x++) {
					DE_ASSERT(ETC2_UNCOMPRESSED_PIXEL_SIZE_RG11 == 4);

					if (signedMode) {
						var srcIndex = y*ETC2_BLOCK_WIDTH + x;
						var dstIndex = 2*((baseY+y)*dstRowPitch/dstPixelSize + baseX + x);

						dstPtr[dstIndex] = extend11To16WithSign(uncompressedBlockR16[srcIndex]);
						dstPtr[dstIndex + 1] = extend11To16WithSign(uncompressedBlockG16[srcIndex]);
					} else {
						var srcIndex = y*ETC2_BLOCK_WIDTH + x;
						var dstIndex = 2*((baseY+y)*dstRowPitch/dstPixelSize + baseX + x);

						dstPtr[dstIndex] = extend11To16(uncompressedBlockR16[srcIndex]);
						dstPtr[dstIndex + 1] = extend11To16(uncompressedBlockG16[srcIndex]);
					}
				}
			}
		}
	}
};

return {
	decompressEAC_R11: decompressEAC_R11,
	decompressEAC_RG11: decompressEAC_RG11
};

}();

var CompressedTexture = function(format, width, height, depth) {
	this.setStorage(format, width, height, depth);
};

CompressedTexture.prototype.setStorage = function(format, width, height, depth) {
	this.m_format	= format;
	this.m_width	= width;
	this.m_height	= height;
	this.m_depth	= depth || 1;

	if (isEtcFormat(this.m_format))
	{
		DE_ASSERT(this.m_depth == 1);

		var blockSizeMultiplier = 0; // How many 64-bit parts each compressed block contains.

		switch (this.m_format)
		{
			case Format.ETC1_RGB8:							blockSizeMultiplier = 1;	break;
			case Format.EAC_R11:							blockSizeMultiplier = 1;	break;
			case Format.EAC_SIGNED_R11:					blockSizeMultiplier = 1;	break;
			case Format.EAC_RG11:							blockSizeMultiplier = 2;	break;
			case Format.EAC_SIGNED_RG11:					blockSizeMultiplier = 2;	break;
			case Format.ETC2_RGB8:							blockSizeMultiplier = 1;	break;
			case Format.ETC2_SRGB8:						blockSizeMultiplier = 1;	break;
			case Format.ETC2_RGB8_PUNCHTHROUGH_ALPHA1:		blockSizeMultiplier = 1;	break;
			case Format.ETC2_SRGB8_PUNCHTHROUGH_ALPHA1:	blockSizeMultiplier = 1;	break;
			case Format.ETC2_EAC_RGBA8:					blockSizeMultiplier = 2;	break;
			case Format.ETC2_EAC_SRGB8_ALPHA8:				blockSizeMultiplier = 2;	break;

			default:
				throw new Error("Unsupported format " + format);
				break;
		}

		this.m_array = new ArrayBuffer(blockSizeMultiplier * 8 * divRoundUp(this.m_width, 4) * divRoundUp(this.m_height, 4));
		this.m_data = new Uint8Array(this.m_array);
	}
	// else if (isASTCFormat(this.m_format))
	// {
	// 	if (this.m_depth > 1)
	// 		throw tcu::InternalError("3D ASTC textures not currently supported");

	// 	const IVec3 blockSize = getASTCBlockSize(this.m_format);
	// 	this.m_data.resize(ASTC_BLOCK_SIZE_BYTES * divRoundUp(this.m_width, blockSize.x()) * divRoundUp(this.m_height, blockSize.y()) * divRoundUp(this.m_depth, blockSize.z()));
	// }
	// else
	// {
	// 	DE_ASSERT(this.m_format == FORMAT_LAST);
	// 	DE_ASSERT(this.m_width == 0 && this.m_height == 0 && this.m_depth == 0);
	// 	this.m_data.resize(0);
	// }
}

/*--------------------------------------------------------------------*//*!
 * \brief Get uncompressed texture format
 *//*--------------------------------------------------------------------*/
CompressedTexture.prototype.getUncompressedFormat = function() {
	if (isEtcFormat(this.m_format))
	{
		switch (this.m_format)
		{
			case Format.ETC1_RGB8:							return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGB,	tcuTexture.ChannelType.UNORM_INT8);
			case Format.EAC_R11:							return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.R,		tcuTexture.ChannelType.UNORM_INT16);
			case Format.EAC_SIGNED_R11:					return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.R,		tcuTexture.ChannelType.SNORM_INT16);
			case Format.EAC_RG11:							return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RG,		tcuTexture.ChannelType.UNORM_INT16);
			case Format.EAC_SIGNED_RG11:					return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RG,		tcuTexture.ChannelType.SNORM_INT16);
			case Format.ETC2_RGB8:							return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGB,	tcuTexture.ChannelType.UNORM_INT8);
			case Format.ETC2_SRGB8:						return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.sRGB,	tcuTexture.ChannelType.UNORM_INT8);
			case Format.ETC2_RGB8_PUNCHTHROUGH_ALPHA1:		return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA,	tcuTexture.ChannelType.UNORM_INT8);
			case Format.ETC2_SRGB8_PUNCHTHROUGH_ALPHA1:	return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.sRGBA,	tcuTexture.ChannelType.UNORM_INT8);
			case Format.ETC2_EAC_RGBA8:					return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA,	tcuTexture.ChannelType.UNORM_INT8);
			case Format.ETC2_EAC_SRGB8_ALPHA8:				return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.sRGBA,	tcuTexture.ChannelType.UNORM_INT8);
			default:
				throw new Error('Unsupported format ' + this.m_format);
		}
	}
	// else if (isASTCFormat(m_format))
	// {
	// 	if (isASTCSRGBFormat(m_format))
	// 		return TextureFormat(tcuTexture.ChannelType.sRGBA, tcuTexture.ChannelType.UNORM_INT8);
	// 	else
	// 		return TextureFormat(tcuTexture.ChannelType.RGBA, tcuTexture.ChannelType.HALF_FLOAT);
	// }
	// else
	// {
	// 	DE_ASSERT(false);
	// 	return TextureFormat();
	// }
}

/*--------------------------------------------------------------------*//*!
 * \brief Decode to uncompressed pixel data
 * \param dst Destination buffer
 *//*--------------------------------------------------------------------*/
CompressedTexture.prototype.decompress = function(/*const tcu::PixelBufferAccess&*/ dst) {
	DE_ASSERT(dst.getWidth() == this.m_width && dst.getHeight() == this.m_height && dst.getDepth() == 1);
	var format = this.getUncompressedFormat();
	if (dst.getFormat().order != format.order || dst.getFormat().type != format.type)
		throw new Error('Formats do not match.');

	if (isEtcFormat(this.m_format))
	{
		switch (this.m_format)
		{
			case Format.ETC1_RGB8:							decompressETC1								(dst, this.m_width, this.m_height, this.m_data);			break;
			case Format.EAC_R11:							etcDecompressInternal.decompressEAC_R11(dst, this.m_width, this.m_height, this.m_array, false);	break;
			case Format.EAC_SIGNED_R11:						etcDecompressInternal.decompressEAC_R11(dst, this.m_width, this.m_height, this.m_array, true);		break;
			case Format.EAC_RG11:							etcDecompressInternal.decompressEAC_RG11(dst, this.m_width, this.m_height, this.m_array, false);	break;
			case Format.EAC_SIGNED_RG11:					etcDecompressInternal.decompressEAC_RG11(dst, this.m_width, this.m_height, this.m_array, true);		break;
			case Format.ETC2_RGB8:							decompressETC2								(dst, this.m_width, this.m_height, this.m_data);			break;
			case Format.ETC2_SRGB8:						decompressETC2								(dst, this.m_width, this.m_height, this.m_data);			break;
			case Format.ETC2_RGB8_PUNCHTHROUGH_ALPHA1:		decompressETC2_RGB8_PUNCHTHROUGH_ALPHA1		(dst, this.m_width, this.m_height, this.m_data);			break;
			case Format.ETC2_SRGB8_PUNCHTHROUGH_ALPHA1:	decompressETC2_RGB8_PUNCHTHROUGH_ALPHA1		(dst, this.m_width, this.m_height, this.m_data);			break;
			case Format.ETC2_EAC_RGBA8:					decompressETC2_EAC_RGBA8					(dst, this.m_width, this.m_height, this.m_data);			break;
			case Format.ETC2_EAC_SRGB8_ALPHA8:				decompressETC2_EAC_RGBA8					(dst, this.m_width, this.m_height, this.m_data);			break;

			default:
				throw new Error('Unsupported format ' + this.m_format);
				break;
		}
	}
	// else if (isASTCFormat(m_format))
	// {
	// 	const tcu::IVec3	blockSize		= getASTCBlockSize(m_format);
	// 	const bool			isSRGBFormat	= isASTCSRGBFormat(m_format);

	// 	if (blockSize.z() > 1)
	// 		throw tcu::InternalError("3D ASTC textures not currently supported");

	// 	decompressASTC(dst, m_width, m_height, &m_data[0], blockSize.x(), blockSize.y(), isSRGBFormat, isSRGBFormat || params.isASTCModeLDR);
	// }
	else
		throw new Error('Unsupported format ' + this.m_format);
};

return {
	Format: Format,
	CompressedTexture: CompressedTexture
 };

 });
