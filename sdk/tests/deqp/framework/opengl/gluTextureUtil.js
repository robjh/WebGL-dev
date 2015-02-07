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
define(['../common/tcuTexture.js'], function(textureFormat)
{

var getTransferFormat = function(/*tcu::TextureFormat*/ texFormat) {
	var	format	= gl.NONE;
	var	type	= gl.NONE;
	/*bool*/ var	isInt	= false;

	switch (texFormat.type)
	{
		case textureFormat.ChannelType.SIGNED_INT8:
		case textureFormat.ChannelType.SIGNED_INT16:
		case textureFormat.ChannelType.SIGNED_INT32:
		case textureFormat.ChannelType.UNSIGNED_INT8:
		case textureFormat.ChannelType.UNSIGNED_INT16:
		case textureFormat.ChannelType.UNSIGNED_INT32:
		case textureFormat.ChannelType.UNSIGNED_INT_1010102_REV:
			isInt = true;
			break;

		default:
			isInt = false;
			break;
	}

	switch (texFormat.order)
	{
		case  textureFormat.ChannelOrder.A:		format = gl.ALPHA;								break;
		case  textureFormat.ChannelOrder.L:		format = gl.LUMINANCE;							break;
		case  textureFormat.ChannelOrder.LA:		format = gl.LUMINANCE_ALPHA;					break;
		case  textureFormat.ChannelOrder.R:		format = isInt ? gl.RED_INTEGER		: gl.RED;	break;
		case  textureFormat.ChannelOrder.RG:		format = isInt ? gl.RG_INTEGER		: gl.RG;	break;
		case  textureFormat.ChannelOrder.RGB:	format = isInt ? gl.RGB_INTEGER		: gl.RGB;	break;
		case  textureFormat.ChannelOrder.RGBA:	format = isInt ? gl.RGBA_INTEGER	: gl.RGBA;	break;
		case  textureFormat.ChannelOrder.sRGB:	format = gl.RGB;								break;
		case  textureFormat.ChannelOrder.sRGBA:	format = gl.RGBA;								break;
		case  textureFormat.ChannelOrder.D:		format = gl.DEPTH_COMPONENT;					break;
		case  textureFormat.ChannelOrder.DS:		format = gl.DEPTH_STENCIL;						break;
		case  textureFormat.ChannelOrder.S:		format = gl.STENCIL_INDEX;						break;

		default:
			throw new Error('Unknown ChannelOrder ' + texFormat.order);
	}

	switch (texFormat.type)
	{
		case textureFormat.ChannelType.SNORM_INT8:						type = gl.BYTE;								break;
		case textureFormat.ChannelType.SNORM_INT16:					type = gl.SHORT;							break;
		case textureFormat.ChannelType.UNORM_INT8:						type = gl.UNSIGNED_BYTE;					break;
		case textureFormat.ChannelType.UNORM_INT16:					type = gl.UNSIGNED_SHORT;					break;
		case textureFormat.ChannelType.UNORM_SHORT_565:				type = gl.UNSIGNED_SHORT_5_6_5;				break;
		case textureFormat.ChannelType.UNORM_SHORT_4444:				type = gl.UNSIGNED_SHORT_4_4_4_4;			break;
		case textureFormat.ChannelType.UNORM_SHORT_5551:				type = gl.UNSIGNED_SHORT_5_5_5_1;			break;
		case textureFormat.ChannelType.SIGNED_INT8:					type = gl.BYTE;								break;
		case textureFormat.ChannelType.SIGNED_INT16:					type = gl.SHORT;							break;
		case textureFormat.ChannelType.SIGNED_INT32:					type = gl.INT;								break;
		case textureFormat.ChannelType.UNSIGNED_INT8:					type = gl.UNSIGNED_BYTE;					break;
		case textureFormat.ChannelType.UNSIGNED_INT16:					type = gl.UNSIGNED_SHORT;					break;
		case textureFormat.ChannelType.UNSIGNED_INT32:					type = gl.UNSIGNED_INT;						break;
		case textureFormat.ChannelType.FLOAT:							type = gl.FLOAT;							break;
		case textureFormat.ChannelType.UNORM_INT_101010:				type = gl.UNSIGNED_INT_2_10_10_10_REV;		break;
		case textureFormat.ChannelType.UNORM_INT_1010102_REV:			type = gl.UNSIGNED_INT_2_10_10_10_REV;		break;
		case textureFormat.ChannelType.UNSIGNED_INT_1010102_REV:		type = gl.UNSIGNED_INT_2_10_10_10_REV;		break;
		case textureFormat.ChannelType.UNSIGNED_INT_11F_11F_10F_REV:	type = gl.UNSIGNED_INT_10F_11F_11F_REV;		break;
		case textureFormat.ChannelType.UNSIGNED_INT_999_E5_REV:		type = gl.UNSIGNED_INT_5_9_9_9_REV;			break;
		case textureFormat.ChannelType.HALF_FLOAT:						type = gl.HALF_FLOAT;						break;
		case textureFormat.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV:	type = gl.FLOAT_32_UNSIGNED_INT_24_8_REV;	break;
		case textureFormat.ChannelType.UNSIGNED_INT_24_8:				type = texFormat.order == textureFormat.ChannelType.D
																 ? gl.UNSIGNED_INT
																 : gl.UNSIGNED_INT_24_8;				break;

		default:
			throw new Error("Can't map texture format to GL transfer format " + textureFormat.type);
	}

	/* TODO: Implement TransferFormat */
	return TransferFormat(format, type);
}

/*--------------------------------------------------------------------*//*!
 * \brief Map tcu::TextureFormat to GL internal sized format.
 *
 * Maps generic texture format description to GL internal format.
 * If no mapping is found, throws tcu::InternalError.
 *
 * \param texFormat Generic texture format.
 * \return GL sized internal format.
 *//*--------------------------------------------------------------------*/
var getInternalFormat = function(/*tcu::TextureFormat*/ texFormat)
{

	var stringify = function(order, type) {
		return "" + order + " " + type;
	};

	switch (stringify(texFormat.order, texFormat.type))
	{
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.UNORM_SHORT_5551):				return gl.RGB5_A1;
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.UNORM_SHORT_4444):				return gl.RGBA4;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.UNORM_SHORT_565):				return gl.RGB565;
		case stringify(texFormat.ChannelOrder.D, texFormat.ChannelType.UNORM_INT16):					return gl.DEPTH_COMPONENT16;
		case stringify(texFormat.ChannelOrder.S, texFormat.ChannelType.UNSIGNED_INT8):					return gl.STENCIL_INDEX8;

		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.FLOAT):							return gl.RGBA32F;
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.SIGNED_INT32):					return gl.RGBA32I;
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.UNSIGNED_INT32):				return gl.RGBA32UI;
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.UNORM_INT16):					return gl.RGBA16;
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.SNORM_INT16):					return gl.RGBA16_SNORM;
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.HALF_FLOAT):					return gl.RGBA16F;
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.SIGNED_INT16):					return gl.RGBA16I;
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.UNSIGNED_INT16):				return gl.RGBA16UI;
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.UNORM_INT8):					return gl.RGBA8;
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.SIGNED_INT8):					return gl.RGBA8I;
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.UNSIGNED_INT8):					return gl.RGBA8UI;
		case stringify(texFormat.ChannelOrder.sRGBA, texFormat.ChannelType.UNORM_INT8):					return gl.SRGB8_ALPHA8;
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.UNORM_INT_1010102_REV):			return gl.RGB10_A2;
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.UNSIGNED_INT_1010102_REV):		return gl.RGB10_A2UI;
		case stringify(texFormat.ChannelOrder.RGBA, texFormat.ChannelType.SNORM_INT8):					return gl.RGBA8_SNORM;

		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.UNORM_INT8):					return gl.RGB8;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.UNSIGNED_INT_11F_11F_10F_REV):	return gl.R11F_G11F_B10F;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.FLOAT):							return gl.RGB32F;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.SIGNED_INT32):					return gl.RGB32I;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.UNSIGNED_INT32):				return gl.RGB32UI;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.UNORM_INT16):					return gl.RGB16;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.SNORM_INT16):					return gl.RGB16_SNORM;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.HALF_FLOAT):					return gl.RGB16F;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.SIGNED_INT16):					return gl.RGB16I;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.UNSIGNED_INT16):				return gl.RGB16UI;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.SNORM_INT8):					return gl.RGB8_SNORM;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.SIGNED_INT8):					return gl.RGB8I;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.UNSIGNED_INT8):					return gl.RGB8UI;
		case stringify(texFormat.ChannelOrder.sRGB, texFormat.ChannelType.UNORM_INT8):					return gl.SRGB8;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.UNSIGNED_INT_999_E5_REV):		return gl.RGB9_E5;
		case stringify(texFormat.ChannelOrder.RGB, texFormat.ChannelType.UNORM_INT_1010102_REV):			return gl.RGB10;

		case stringify(texFormat.ChannelOrder.RG, texFormat.ChannelType.FLOAT):							return gl.RG32F;
		case stringify(texFormat.ChannelOrder.RG, texFormat.ChannelType.SIGNED_INT32):					return gl.RG32I;
		case stringify(texFormat.ChannelOrder.RG, texFormat.ChannelType.UNSIGNED_INT32):				return gl.RG32UI;
		case stringify(texFormat.ChannelOrder.RG, texFormat.ChannelType.UNORM_INT16):					return gl.RG16;
		case stringify(texFormat.ChannelOrder.RG, texFormat.ChannelType.SNORM_INT16):					return gl.RG16_SNORM;
		case stringify(texFormat.ChannelOrder.RG, texFormat.ChannelType.HALF_FLOAT):					return gl.RG16F;
		case stringify(texFormat.ChannelOrder.RG, texFormat.ChannelType.SIGNED_INT16):					return gl.RG16I;
		case stringify(texFormat.ChannelOrder.RG, texFormat.ChannelType.UNSIGNED_INT16):				return gl.RG16UI;
		case stringify(texFormat.ChannelOrder.RG, texFormat.ChannelType.UNORM_INT8):					return gl.RG8;
		case stringify(texFormat.ChannelOrder.RG, texFormat.ChannelType.SIGNED_INT8):					return gl.RG8I;
		case stringify(texFormat.ChannelOrder.RG, texFormat.ChannelType.UNSIGNED_INT8):					return gl.RG8UI;
		case stringify(texFormat.ChannelOrder.RG, texFormat.ChannelType.SNORM_INT8):					return gl.RG8_SNORM;

		case stringify(texFormat.ChannelOrder.R, texFormat.ChannelType.FLOAT):							return gl.R32F;
		case stringify(texFormat.ChannelOrder.R, texFormat.ChannelType.SIGNED_INT32):					return gl.R32I;
		case stringify(texFormat.ChannelOrder.R, texFormat.ChannelType.UNSIGNED_INT32):				return gl.R32UI;
		case stringify(texFormat.ChannelOrder.R, texFormat.ChannelType.UNORM_INT16):					return gl.R16;
		case stringify(texFormat.ChannelOrder.R, texFormat.ChannelType.SNORM_INT16):					return gl.R16_SNORM;
		case stringify(texFormat.ChannelOrder.R, texFormat.ChannelType.HALF_FLOAT):					return gl.R16F;
		case stringify(texFormat.ChannelOrder.R, texFormat.ChannelType.SIGNED_INT16):					return gl.R16I;
		case stringify(texFormat.ChannelOrder.R, texFormat.ChannelType.UNSIGNED_INT16):				return gl.R16UI;
		case stringify(texFormat.ChannelOrder.R, texFormat.ChannelType.UNORM_INT8):					return gl.R8;
		case stringify(texFormat.ChannelOrder.R, texFormat.ChannelType.SIGNED_INT8):					return gl.R8I;
		case stringify(texFormat.ChannelOrder.R, texFormat.ChannelType.UNSIGNED_INT8):					return gl.R8UI;
		case stringify(texFormat.ChannelOrder.R, texFormat.ChannelType.SNORM_INT8):					return gl.R8_SNORM;

		case stringify(texFormat.ChannelOrder.D, texFormat.ChannelType.FLOAT):							return gl.DEPTH_COMPONENT32F;
		case stringify(texFormat.ChannelOrder.D, texFormat.ChannelType.UNSIGNED_INT_24_8):				return gl.DEPTH_COMPONENT24;
		case stringify(texFormat.ChannelOrder.D, texFormat.ChannelType.UNSIGNED_INT32):				return gl.DEPTH_COMPONENT32;
		case stringify(texFormat.ChannelOrder.DS, texFormat.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV):	return gl.DEPTH32F_STENCIL8;
		case stringify(texFormat.ChannelOrder.DS, texFormat.ChannelType.UNSIGNED_INT_24_8):				return gl.DEPTH24_STENCIL8;

		default:
			throw new Error("Can't map texture format to GL internal format");
	}
};

/*--------------------------------------------------------------------*//*!
 * \brief Map generic compressed format to GL compressed format enum.
 *
 * Maps generic compressed format to GL compressed format enum value.
 * If no mapping is found, throws tcu::InternalError.
 *
 * \param format Generic compressed format.
 * \return GL compressed texture format.
 *//*--------------------------------------------------------------------*/
 /*TODO: implement 
deUint32 getGLFormat (tcu::CompressedTexture::Format format)
{
	switch (format)
	{
		case tcu::CompressedTexture::ETC1_RGB8:							return gl.ETC1_RGB8_OES;
		case tcu::CompressedTexture::EAC_R11:							return gl.COMPRESSED_R11_EAC;
		case tcu::CompressedTexture::EAC_SIGNED_R11:					return gl.COMPRESSED_SIGNED_R11_EAC;
		case tcu::CompressedTexture::EAC_RG11:							return gl.COMPRESSED_RG11_EAC;
		case tcu::CompressedTexture::EAC_SIGNED_RG11:					return gl.COMPRESSED_SIGNED_RG11_EAC;
		case tcu::CompressedTexture::ETC2_RGB8:							return gl.COMPRESSED_RGB8_ETC2;
		case tcu::CompressedTexture::ETC2_SRGB8:						return gl.COMPRESSED_SRGB8_ETC2;
		case tcu::CompressedTexture::ETC2_RGB8_PUNCHTHROUGH_ALPHA1:		return gl.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2;
		case tcu::CompressedTexture::ETC2_SRGB8_PUNCHTHROUGH_ALPHA1:	return gl.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2;
		case tcu::CompressedTexture::ETC2_EAC_RGBA8:					return gl.COMPRESSED_RGBA8_ETC2_EAC;
		case tcu::CompressedTexture::ETC2_EAC_SRGB8_ALPHA8:				return gl.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC;

		case tcu::CompressedTexture::ASTC_4x4_RGBA:						return gl.COMPRESSED_RGBA_ASTC_4x4_KHR;
		case tcu::CompressedTexture::ASTC_5x4_RGBA:						return gl.COMPRESSED_RGBA_ASTC_5x4_KHR;
		case tcu::CompressedTexture::ASTC_5x5_RGBA:						return gl.COMPRESSED_RGBA_ASTC_5x5_KHR;
		case tcu::CompressedTexture::ASTC_6x5_RGBA:						return gl.COMPRESSED_RGBA_ASTC_6x5_KHR;
		case tcu::CompressedTexture::ASTC_6x6_RGBA:						return gl.COMPRESSED_RGBA_ASTC_6x6_KHR;
		case tcu::CompressedTexture::ASTC_8x5_RGBA:						return gl.COMPRESSED_RGBA_ASTC_8x5_KHR;
		case tcu::CompressedTexture::ASTC_8x6_RGBA:						return gl.COMPRESSED_RGBA_ASTC_8x6_KHR;
		case tcu::CompressedTexture::ASTC_8x8_RGBA:						return gl.COMPRESSED_RGBA_ASTC_8x8_KHR;
		case tcu::CompressedTexture::ASTC_10x5_RGBA:					return gl.COMPRESSED_RGBA_ASTC_10x5_KHR;
		case tcu::CompressedTexture::ASTC_10x6_RGBA:					return gl.COMPRESSED_RGBA_ASTC_10x6_KHR;
		case tcu::CompressedTexture::ASTC_10x8_RGBA:					return gl.COMPRESSED_RGBA_ASTC_10x8_KHR;
		case tcu::CompressedTexture::ASTC_10x10_RGBA:					return gl.COMPRESSED_RGBA_ASTC_10x10_KHR;
		case tcu::CompressedTexture::ASTC_12x10_RGBA:					return gl.COMPRESSED_RGBA_ASTC_12x10_KHR;
		case tcu::CompressedTexture::ASTC_12x12_RGBA:					return gl.COMPRESSED_RGBA_ASTC_12x12_KHR;
		case tcu::CompressedTexture::ASTC_4x4_SRGB8_ALPHA8:				return gl.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR;
		case tcu::CompressedTexture::ASTC_5x4_SRGB8_ALPHA8:				return gl.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR;
		case tcu::CompressedTexture::ASTC_5x5_SRGB8_ALPHA8:				return gl.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR;
		case tcu::CompressedTexture::ASTC_6x5_SRGB8_ALPHA8:				return gl.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR;
		case tcu::CompressedTexture::ASTC_6x6_SRGB8_ALPHA8:				return gl.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR;
		case tcu::CompressedTexture::ASTC_8x5_SRGB8_ALPHA8:				return gl.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR;
		case tcu::CompressedTexture::ASTC_8x6_SRGB8_ALPHA8:				return gl.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR;
		case tcu::CompressedTexture::ASTC_8x8_SRGB8_ALPHA8:				return gl.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR;
		case tcu::CompressedTexture::ASTC_10x5_SRGB8_ALPHA8:			return gl.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR;
		case tcu::CompressedTexture::ASTC_10x6_SRGB8_ALPHA8:			return gl.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR;
		case tcu::CompressedTexture::ASTC_10x8_SRGB8_ALPHA8:			return gl.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR;
		case tcu::CompressedTexture::ASTC_10x10_SRGB8_ALPHA8:			return gl.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR;
		case tcu::CompressedTexture::ASTC_12x10_SRGB8_ALPHA8:			return gl.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR;
		case tcu::CompressedTexture::ASTC_12x12_SRGB8_ALPHA8:			return gl.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR;

		default:
			throw tcu::InternalError("Can't map compressed format to GL format");
	}
}
*/

/*
 *
 * @return {textureFormat.ChannelType}
 */
var mapGLChannelType = function(/*deUint32*/ dataType, /*bool*/ normalized) {
	// \note Normalized bit is ignored where it doesn't apply.

	switch (dataType)
	{
		case gl.UNSIGNED_BYTE:					return normalized ? textureFormat.ChannelType.UNORM_INT8	: textureFormat.ChannelType.UNSIGNED_INT8;
		case gl.BYTE:							return normalized ? textureFormat.ChannelType.SNORM_INT8	: textureFormat.ChannelType.SIGNED_INT8;
		case gl.UNSIGNED_SHORT:					return normalized ? textureFormat.ChannelType.UNORM_INT16	: textureFormat.ChannelType.UNSIGNED_INT16;
		case gl.SHORT:							return normalized ? textureFormat.ChannelType.SNORM_INT16	: textureFormat.ChannelType.SIGNED_INT16;
		case gl.UNSIGNED_INT:					return normalized ? textureFormat.ChannelType.UNORM_INT32	: textureFormat.ChannelType.UNSIGNED_INT32;
		case gl.INT:							return normalized ? textureFormat.ChannelType.SNORM_INT32	: textureFormat.ChannelType.SIGNED_INT32;
		case gl.FLOAT:							return textureFormat.ChannelType.FLOAT;
		case gl.UNSIGNED_SHORT_4_4_4_4:			return textureFormat.ChannelType.UNORM_SHORT_4444;
		case gl.UNSIGNED_SHORT_5_5_5_1:			return textureFormat.ChannelType.UNORM_SHORT_5551;
		case gl.UNSIGNED_SHORT_5_6_5:			return textureFormat.ChannelType.UNORM_SHORT_565;
		case gl.HALF_FLOAT:						return textureFormat.ChannelType.HALF_FLOAT;
		case gl.UNSIGNED_INT_2_10_10_10_REV:	return normalized ? textureFormat.ChannelType.UNORM_INT_1010102_REV : textureFormat.ChannelType.UNSIGNED_INT_1010102_REV;
		case gl.UNSIGNED_INT_10F_11F_11F_REV:	return textureFormat.ChannelType.UNSIGNED_INT_11F_11F_10F_REV;
		case gl.UNSIGNED_INT_24_8:				return textureFormat.ChannelType.UNSIGNED_INT_24_8;
		case gl.FLOAT_32_UNSIGNED_INT_24_8_REV:	return textureFormat.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV;
		case gl.UNSIGNED_INT_5_9_9_9_REV:		return textureFormat.ChannelType.UNSIGNED_INT_999_E5_REV;

		default:
			throw new Error('Unsupported dataType ' + dataType)
	}
};

/*--------------------------------------------------------------------*//*!
 * \brief Map GL pixel transfer format to tcu::TextureFormat.
 *
 * If no mapping is found, throws tcu::InternalError.
 *
 * \param format	GL pixel format.
 * \param dataType	GL data type.
 * \return Generic texture format.
 *//*--------------------------------------------------------------------*/
/*
 * @return {textureFormat.TextureFormat}
*/
var mapGLTransferFormat = function(/*deUint32*/ format, /*deUint32*/ dataType)
{
	switch (format)
	{
		case gl.ALPHA:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.A,		mapGLChannelType(dataType, true));
		case gl.LUMINANCE:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.L,		mapGLChannelType(dataType, true));
		case gl.LUMINANCE_ALPHA:	return new textureFormat.TextureFormat( textureFormat.ChannelOrder.LA,		mapGLChannelType(dataType, true));
		case gl.RGB:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB,	mapGLChannelType(dataType, true));
		case gl.RGBA:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA,	mapGLChannelType(dataType, true));
		case gl.BGRA:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.BGRA,	mapGLChannelType(dataType, true));
		case gl.RG:					return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RG,		mapGLChannelType(dataType, true));
		case gl.RED:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.R,		mapGLChannelType(dataType, true));
		case gl.RGBA_INTEGER:		return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA,	mapGLChannelType(dataType, false));
		case gl.RGB_INTEGER:		return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB,	mapGLChannelType(dataType, false));
		case gl.RG_INTEGER:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RG,		mapGLChannelType(dataType, false));
		case gl.RED_INTEGER:		return new textureFormat.TextureFormat( textureFormat.ChannelOrder.R,		mapGLChannelType(dataType, false));

		case gl.DEPTH_COMPONENT:	return new textureFormat.TextureFormat( textureFormat.ChannelOrder.D,		mapGLChannelType(dataType, true));
		case gl.DEPTH_STENCIL:		return new textureFormat.TextureFormat( textureFormat.ChannelOrder.DS,		mapGLChannelType(dataType, true));

		default:
			throw new Error("Can't map GL pixel format (" + format + ", " + dataType.toString(16) + ") to texture format");
	}
};

/*--------------------------------------------------------------------*//*!
 * \brief Map GL internal texture format to tcu::TextureFormat.
 *
 * If no mapping is found, throws tcu::InternalError.
 *
 * \param internalFormat Sized internal format.
 * \return Generic texture format.
 *//*--------------------------------------------------------------------*/
/*
 * @return {textureFormat.TextureFormat}
*/
var mapGLInternalFormat = function(/*deUint32*/ internalFormat)
{
	if (internalFormat === undefined)
		throw new Error("internalformat is undefined");

	switch (internalFormat)
	{
		case gl.RGB5_A1:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.UNORM_SHORT_5551);
		case gl.RGBA4:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.UNORM_SHORT_4444);
		case gl.RGB565:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.UNORM_SHORT_565);
		case gl.DEPTH_COMPONENT16:	return new textureFormat.TextureFormat( textureFormat.ChannelOrder.D,	 textureFormat.ChannelType.UNORM_INT16);
		case gl.STENCIL_INDEX8:		return new textureFormat.TextureFormat( textureFormat.ChannelOrder.S,	 textureFormat.ChannelType.UNSIGNED_INT8);

		case gl.RGBA32F:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.FLOAT);
		case gl.RGBA32I:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.SIGNED_INT32);
		case gl.RGBA32UI:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.UNSIGNED_INT32);
		case gl.RGBA16:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.UNORM_INT16);
		case gl.RGBA16_SNORM:		return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.SNORM_INT16);
		case gl.RGBA16F:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.HALF_FLOAT);
		case gl.RGBA16I:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.SIGNED_INT16);
		case gl.RGBA16UI:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.UNSIGNED_INT16);
		case gl.RGBA8:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.UNORM_INT8);
		case gl.RGBA8I:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.SIGNED_INT8);
		case gl.RGBA8UI:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.UNSIGNED_INT8);
		case gl.SRGB8_ALPHA8:		return new textureFormat.TextureFormat( textureFormat.ChannelOrder.sRGBA, textureFormat.ChannelType.UNORM_INT8);
		case gl.RGB10_A2:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.UNORM_INT_1010102_REV);
		case gl.RGB10_A2UI:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.UNSIGNED_INT_1010102_REV);
		case gl.RGBA8_SNORM:		return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGBA, textureFormat.ChannelType.SNORM_INT8);

		case gl.RGB8:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.UNORM_INT8);
		case gl.R11F_G11F_B10F:		return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.UNSIGNED_INT_11F_11F_10F_REV);
		case gl.RGB32F:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.FLOAT);
		case gl.RGB32I:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.SIGNED_INT32);
		case gl.RGB32UI:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.UNSIGNED_INT32);
		case gl.RGB16:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.UNORM_INT16);
		case gl.RGB16_SNORM:		return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.SNORM_INT16);
		case gl.RGB16F:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.HALF_FLOAT);
		case gl.RGB16I:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.SIGNED_INT16);
		case gl.RGB16UI:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.UNSIGNED_INT16);
		case gl.RGB8_SNORM:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.SNORM_INT8);
		case gl.RGB8I:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.SIGNED_INT8);
		case gl.RGB8UI:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.UNSIGNED_INT8);
		case gl.SRGB8:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.sRGB, textureFormat.ChannelType.UNORM_INT8);
		case gl.RGB9_E5:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.UNSIGNED_INT_999_E5_REV);
		case gl.RGB10:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RGB, textureFormat.ChannelType.UNORM_INT_1010102_REV);

		case gl.RG32F:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RG,	 textureFormat.ChannelType.FLOAT);
		case gl.RG32I:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RG,	 textureFormat.ChannelType.SIGNED_INT32);
		case gl.RG32UI:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RG,	 textureFormat.ChannelType.UNSIGNED_INT32);
		case gl.RG16:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RG,	 textureFormat.ChannelType.UNORM_INT16);
		case gl.RG16_SNORM:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RG,	 textureFormat.ChannelType.SNORM_INT16);
		case gl.RG16F:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RG,	 textureFormat.ChannelType.HALF_FLOAT);
		case gl.RG16I:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RG,	 textureFormat.ChannelType.SIGNED_INT16);
		case gl.RG16UI:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RG,	 textureFormat.ChannelType.UNSIGNED_INT16);
		case gl.RG8:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RG,	 textureFormat.ChannelType.UNORM_INT8);
		case gl.RG8I:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RG,	 textureFormat.ChannelType.SIGNED_INT8);
		case gl.RG8UI:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RG,	 textureFormat.ChannelType.UNSIGNED_INT8);
		case gl.RG8_SNORM:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.RG,	 textureFormat.ChannelType.SNORM_INT8);

		case gl.R32F:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.R,	 textureFormat.ChannelType.FLOAT);
		case gl.R32I:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.R,	 textureFormat.ChannelType.SIGNED_INT32);
		case gl.R32UI:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.R,	 textureFormat.ChannelType.UNSIGNED_INT32);
		case gl.R16:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.R,	 textureFormat.ChannelType.UNORM_INT16);
		case gl.R16_SNORM:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.R,	 textureFormat.ChannelType.SNORM_INT16);
		case gl.R16F:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.R,	 textureFormat.ChannelType.HALF_FLOAT);
		case gl.R16I:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.R,	 textureFormat.ChannelType.SIGNED_INT16);
		case gl.R16UI:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.R,	 textureFormat.ChannelType.UNSIGNED_INT16);
		case gl.R8:					return new textureFormat.TextureFormat( textureFormat.ChannelOrder.R,	 textureFormat.ChannelType.UNORM_INT8);
		case gl.R8I:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.R,	 textureFormat.ChannelType.SIGNED_INT8);
		case gl.R8UI:				return new textureFormat.TextureFormat( textureFormat.ChannelOrder.R,	 textureFormat.ChannelType.UNSIGNED_INT8);
		case gl.R8_SNORM:			return new textureFormat.TextureFormat( textureFormat.ChannelOrder.R,	 textureFormat.ChannelType.SNORM_INT8);

		case gl.DEPTH_COMPONENT32F:	return new textureFormat.TextureFormat( textureFormat.ChannelOrder.D,	 textureFormat.ChannelType.FLOAT);
		case gl.DEPTH_COMPONENT24:	return new textureFormat.TextureFormat( textureFormat.ChannelOrder.D,	 textureFormat.ChannelType.UNSIGNED_INT_24_8);
		case gl.DEPTH_COMPONENT32:	return new textureFormat.TextureFormat( textureFormat.ChannelOrder.D,	 textureFormat.ChannelType.UNSIGNED_INT32);
		case gl.DEPTH32F_STENCIL8:	return new textureFormat.TextureFormat( textureFormat.ChannelOrder.DS,	 textureFormat.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV);
		case gl.DEPTH24_STENCIL8:	return new textureFormat.TextureFormat( textureFormat.ChannelOrder.DS,	 textureFormat.ChannelType.UNSIGNED_INT_24_8);

		default:
			throw new Error("Can't map GL sized internal format (" + internalFormat.toString(16) + ") to texture format");
	}
}

/*
 * @return {bool}
 */
var isGLInternalColorFormatFilterable = function(/*deUint32*/ format)
{
	switch (format)
	{
		case gl.R8:
		case gl.R8_SNORM:
		case gl.RG8:
		case gl.RG8_SNORM:
		case gl.RGB8:
		case gl.RGB8_SNORM:
		case gl.RGB565:
		case gl.RGBA4:
		case gl.RGB5_A1:
		case gl.RGBA8:
		case gl.RGBA8_SNORM:
		case gl.RGB10_A2:
		case gl.SRGB8:
		case gl.SRGB8_ALPHA8:
		case gl.R16F:
		case gl.RG16F:
		case gl.RGB16F:
		case gl.RGBA16F:
		case gl.R11F_G11F_B10F:
		case gl.RGB9_E5:
			return true;

		case gl.RGB10_A2UI:
		case gl.R32F:
		case gl.RG32F:
		case gl.RGB32F:
		case gl.RGBA32F:
		case gl.R8I:
		case gl.R8UI:
		case gl.R16I:
		case gl.R16UI:
		case gl.R32I:
		case gl.R32UI:
		case gl.RG8I:
		case gl.RG8UI:
		case gl.RG16I:
		case gl.RG16UI:
		case gl.RG32I:
		case gl.RG32UI:
		case gl.RGB8I:
		case gl.RGB8UI:
		case gl.RGB16I:
		case gl.RGB16UI:
		case gl.RGB32I:
		case gl.RGB32UI:
		case gl.RGBA8I:
		case gl.RGBA8UI:
		case gl.RGBA16I:
		case gl.RGBA16UI:
		case gl.RGBA32I:
		case gl.RGBA32UI:
			return false;

		default:
			throw new Error("Unrecognized format " + format);
	}
}


/* TODO: Port the code below */

// static inline tcu::Sampler::WrapMode mapGLWrapMode (deUint32 wrapMode)
// {
// 	switch (wrapMode)
// 	{
// 		case gl.CLAMP_TO_EDGE:		return tcu::Sampler::CLAMP_TO_EDGE;
// 		case gl.CLAMP_TO_BORDER:	return tcu::Sampler::CLAMP_TO_BORDER;
// 		case gl.REPEAT:				return tcu::Sampler::REPEAT_GL;
// 		case gl.MIRRORED_REPEAT:	return tcu::Sampler::MIRRORED_REPEAT_GL;
// 		default:
// 			throw tcu::InternalError("Can't map GL wrap mode " + tcu::toHex(wrapMode).toString());
// 	}
// }

// static inline tcu::Sampler::FilterMode mapGLFilterMode (deUint32 filterMode)
// {
// 	switch (filterMode)
// 	{
// 		case gl.NEAREST:				return tcu::Sampler::NEAREST;
// 		case gl.LINEAR:					return tcu::Sampler::LINEAR;
// 		case gl.NEAREST_MIPMAP_NEAREST:	return tcu::Sampler::NEAREST_MIPMAP_NEAREST;
// 		case gl.NEAREST_MIPMAP_LINEAR:	return tcu::Sampler::NEAREST_MIPMAP_LINEAR;
// 		case gl.LINEAR_MIPMAP_NEAREST:	return tcu::Sampler::LINEAR_MIPMAP_NEAREST;
// 		case gl.LINEAR_MIPMAP_LINEAR:	return tcu::Sampler::LINEAR_MIPMAP_LINEAR;
// 		default:
// 			throw tcu::InternalError("Can't map GL filter mode" + tcu::toHex(filterMode).toString());
// 	}
// }

// /*--------------------------------------------------------------------*//*!
//  * \brief Map GL sampler parameters to tcu::Sampler.
//  *
//  * If no mapping is found, throws tcu::InternalError.
//  *
//  * \param wrapS		S-component wrap mode
//  * \param minFilter	Minification filter mode
//  * \param magFilter	Magnification filter mode
//  * \return Sampler description.
//  *//*--------------------------------------------------------------------*/
// /*tcu::Sampler mapGLSampler (deUint32 wrapS, deUint32 minFilter, deUint32 magFilter)
// {
// 	return mapGLSampler(wrapS, wrapS, wrapS, minFilter, magFilter);
// }
// */

// /*--------------------------------------------------------------------*//*!
//  * \brief Map GL sampler parameters to tcu::Sampler.
//  *
//  * If no mapping is found, throws tcu::InternalError.
//  *
//  * \param wrapS		S-component wrap mode
//  * \param wrapT		T-component wrap mode
//  * \param minFilter	Minification filter mode
//  * \param magFilter	Magnification filter mode
//  * \return Sampler description.
//  *//*--------------------------------------------------------------------*/
// tcu::Sampler mapGLSampler (deUint32 wrapS, deUint32 wrapT, deUint32 minFilter, deUint32 magFilter)
// {
// 	return mapGLSampler(wrapS, wrapT, wrapS, minFilter, magFilter);
// }

// /*--------------------------------------------------------------------*//*!
//  * \brief Map GL sampler parameters to tcu::Sampler.
//  *
//  * If no mapping is found, throws tcu::InternalError.
//  *
//  * \param wrapS		S-component wrap mode
//  * \param wrapT		T-component wrap mode
//  * \param wrapR		R-component wrap mode
//  * \param minFilter	Minification filter mode
//  * \param magFilter	Magnification filter mode
//  * \return Sampler description.
//  *//*--------------------------------------------------------------------*/
// tcu::Sampler mapGLSampler (deUint32 wrapS, deUint32 wrapT, deUint32 wrapR, deUint32 minFilter, deUint32 magFilter)
// {
// 	return tcu::Sampler(mapGLWrapMode(wrapS), mapGLWrapMode(wrapT), mapGLWrapMode(wrapR),
// 						mapGLFilterMode(minFilter), mapGLFilterMode(magFilter),
// 						0.0f /* lod threshold */,
// 						true /* normalized coords */,
// 						tcu::Sampler::COMPAREMODE_NONE /* no compare */,
// 						0 /* compare channel */,
// 						tcu::Vec4(0.0f) /* border color, not used */);
// }

// /*--------------------------------------------------------------------*//*!
//  * \brief Map GL compare function to tcu::Sampler::CompareMode.
//  *
//  * If no mapping is found, throws tcu::InternalError.
//  *
//  * \param mode GL compare mode
//  * \return Compare mode
//  *//*--------------------------------------------------------------------*/
// tcu::Sampler::CompareMode mapGLCompareFunc (deUint32 mode)
// {
// 	switch (mode)
// 	{
// 		case gl.LESS:		return tcu::Sampler::COMPAREMODE_LESS;
// 		case gl.LEQUAL:		return tcu::Sampler::COMPAREMODE_LESS_OR_EQUAL;
// 		case gl.GREATER:	return tcu::Sampler::COMPAREMODE_GREATER;
// 		case gl.GEQUAL:		return tcu::Sampler::COMPAREMODE_GREATER_OR_EQUAL;
// 		case gl.EQUAL:		return tcu::Sampler::COMPAREMODE_EQUAL;
// 		case gl.NOTEQUAL:	return tcu::Sampler::COMPAREMODE_NOT_EQUAL;
// 		case gl.ALWAYS:		return tcu::Sampler::COMPAREMODE_ALWAYS;
// 		case gl.NEVER:		return tcu::Sampler::COMPAREMODE_NEVER;
// 		default:
// 			throw tcu::InternalError("Can't map GL compare mode " + tcu::toHex(mode).toString());
// 	}
// }

// /*--------------------------------------------------------------------*//*!
//  * \brief Get GL wrap mode.
//  *
//  * If no mapping is found, throws tcu::InternalError.
//  *
//  * \param wrapMode Wrap mode
//  * \return GL wrap mode
//  *//*--------------------------------------------------------------------*/
// deUint32 getGLWrapMode (tcu::Sampler::WrapMode wrapMode)
// {
// 	DE_ASSERT(wrapMode != tcu::Sampler::WRAPMODE_LAST);
// 	switch (wrapMode)
// 	{
// 		case tcu::Sampler::CLAMP_TO_EDGE:		return gl.CLAMP_TO_EDGE;
// 		case tcu::Sampler::CLAMP_TO_BORDER:		return gl.CLAMP_TO_BORDER;
// 		case tcu::Sampler::REPEAT_GL:			return gl.REPEAT;
// 		case tcu::Sampler::MIRRORED_REPEAT_GL:	return gl.MIRRORED_REPEAT;
// 		default:
// 			throw tcu::InternalError("Can't map wrap mode");
// 	}
// }

// /*--------------------------------------------------------------------*//*!
//  * \brief Get GL filter mode.
//  *
//  * If no mapping is found, throws tcu::InternalError.
//  *
//  * \param filterMode Filter mode
//  * \return GL filter mode
//  *//*--------------------------------------------------------------------*/
// deUint32 getGLFilterMode (tcu::Sampler::FilterMode filterMode)
// {
// 	DE_ASSERT(filterMode != tcu::Sampler::FILTERMODE_LAST);
// 	switch (filterMode)
// 	{
// 		case tcu::Sampler::NEAREST:					return gl.NEAREST;
// 		case tcu::Sampler::LINEAR:					return gl.LINEAR;
// 		case tcu::Sampler::NEAREST_MIPMAP_NEAREST:	return gl.NEAREST_MIPMAP_NEAREST;
// 		case tcu::Sampler::NEAREST_MIPMAP_LINEAR:	return gl.NEAREST_MIPMAP_LINEAR;
// 		case tcu::Sampler::LINEAR_MIPMAP_NEAREST:	return gl.LINEAR_MIPMAP_NEAREST;
// 		case tcu::Sampler::LINEAR_MIPMAP_LINEAR:	return gl.LINEAR_MIPMAP_LINEAR;
// 		default:
// 			throw tcu::InternalError("Can't map filter mode");
// 	}
// }

// /*--------------------------------------------------------------------*//*!
//  * \brief Get GL compare mode.
//  *
//  * If no mapping is found, throws tcu::InternalError.
//  *
//  * \param compareMode Compare mode
//  * \return GL compare mode
//  *//*--------------------------------------------------------------------*/
// deUint32 getGLCompareFunc (tcu::Sampler::CompareMode compareMode)
// {
// 	DE_ASSERT(compareMode != tcu::Sampler::COMPAREMODE_NONE);
// 	switch (compareMode)
// 	{
// 		case tcu::Sampler::COMPAREMODE_NONE:				return gl.NONE;
// 		case tcu::Sampler::COMPAREMODE_LESS:				return gl.LESS;
// 		case tcu::Sampler::COMPAREMODE_LESS_OR_EQUAL:		return gl.LEQUAL;
// 		case tcu::Sampler::COMPAREMODE_GREATER:				return gl.GREATER;
// 		case tcu::Sampler::COMPAREMODE_GREATER_OR_EQUAL:	return gl.GEQUAL;
// 		case tcu::Sampler::COMPAREMODE_EQUAL:				return gl.EQUAL;
// 		case tcu::Sampler::COMPAREMODE_NOT_EQUAL:			return gl.NOTEQUAL;
// 		case tcu::Sampler::COMPAREMODE_ALWAYS:				return gl.ALWAYS;
// 		case tcu::Sampler::COMPAREMODE_NEVER:				return gl.NEVER;
// 		default:
// 			throw tcu::InternalError("Can't map compare mode");
// 	}
// }

// /*--------------------------------------------------------------------*//*!
//  * \brief Get GL cube face.
//  *
//  * If no mapping is found, throws tcu::InternalError.
//  *
//  * \param face Cube face
//  * \return GL cube face
//  *//*--------------------------------------------------------------------*/
// deUint32 getGLCubeFace (tcu::CubeFace face)
// {
// 	DE_ASSERT(face != tcu::CUBEFACE_LAST);
// 	switch (face)
// 	{
// 		case tcu::CUBEFACE_NEGATIVE_X:	return gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
// 		case tcu::CUBEFACE_POSITIVE_X:	return gl.TEXTURE_CUBE_MAP_POSITIVE_X;
// 		case tcu::CUBEFACE_NEGATIVE_Y:	return gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
// 		case tcu::CUBEFACE_POSITIVE_Y:	return gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
// 		case tcu::CUBEFACE_NEGATIVE_Z:	return gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
// 		case tcu::CUBEFACE_POSITIVE_Z:	return gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
// 		default:
// 			throw tcu::InternalError("Can't map cube face");
// 	}
// }

// /*--------------------------------------------------------------------*//*!
//  * \brief Get GLSL sampler type for texture format.
//  *
//  * If no mapping is found, glu::TYPE_LAST is returned.
//  *
//  * \param format Texture format
//  * \return GLSL 1D sampler type for format
//  *//*--------------------------------------------------------------------*/
// DataType getSampler1DType (tcu::TextureFormat format)
// {
// 	using tcu::TextureFormat;

// 	if (format.order ==  textureFormat.ChannelOrder.D || format.order ==  textureFormat.ChannelOrder.DS)
// 		return TYPE_SAMPLER_1D;

// 	if (format.order ==  textureFormat.ChannelOrder.S)
// 		return TYPE_LAST;

// 	switch (tcu::getTextureChannelClass(format.type))
// 	{
// 		case tcu::TEXTURECHANNELCLASS_FLOATING_POINT:
// 		case tcu::TEXTURECHANNELCLASS_SIGNED_FIXED_POINT:
// 		case tcu::TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT:
// 			return glu::TYPE_SAMPLER_1D;

// 		case tcu::TEXTURECHANNELCLASS_SIGNED_INTEGER:
// 			return glu::TYPE_INT_SAMPLER_1D;

// 		case tcu::TEXTURECHANNELCLASS_UNSIGNED_INTEGER:
// 			return glu::TYPE_UINT_SAMPLER_1D;

// 		default:
// 			return glu::TYPE_LAST;
// 	}
// }

// /*--------------------------------------------------------------------*//*!
//  * \brief Get GLSL sampler type for texture format.
//  *
//  * If no mapping is found, glu::TYPE_LAST is returned.
//  *
//  * \param format Texture format
//  * \return GLSL 2D sampler type for format
//  *//*--------------------------------------------------------------------*/
// DataType getSampler2DType (tcu::TextureFormat format)
// {
// 	using tcu::TextureFormat;

// 	if (format.order ==  textureFormat.ChannelOrder.D || format.order ==  textureFormat.ChannelOrder.DS)
// 		return TYPE_SAMPLER_2D;

// 	if (format.order ==  textureFormat.ChannelOrder.S)
// 		return TYPE_LAST;

// 	switch (tcu::getTextureChannelClass(format.type))
// 	{
// 		case tcu::TEXTURECHANNELCLASS_FLOATING_POINT:
// 		case tcu::TEXTURECHANNELCLASS_SIGNED_FIXED_POINT:
// 		case tcu::TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT:
// 			return glu::TYPE_SAMPLER_2D;

// 		case tcu::TEXTURECHANNELCLASS_SIGNED_INTEGER:
// 			return glu::TYPE_INT_SAMPLER_2D;

// 		case tcu::TEXTURECHANNELCLASS_UNSIGNED_INTEGER:
// 			return glu::TYPE_UINT_SAMPLER_2D;

// 		default:
// 			return glu::TYPE_LAST;
// 	}
// }

// /*--------------------------------------------------------------------*//*!
//  * \brief Get GLSL sampler type for texture format.
//  *
//  * If no mapping is found, glu::TYPE_LAST is returned.
//  *
//  * \param format Texture format
//  * \return GLSL cube map sampler type for format
//  *//*--------------------------------------------------------------------*/
// DataType getSamplerCubeType (tcu::TextureFormat format)
// {
// 	using tcu::TextureFormat;

// 	if (format.order ==  textureFormat.ChannelOrder.D || format.order ==  textureFormat.ChannelOrder.DS)
// 		return TYPE_SAMPLER_CUBE;

// 	if (format.order ==  textureFormat.ChannelOrder.S)
// 		return TYPE_LAST;

// 	switch (tcu::getTextureChannelClass(format.type))
// 	{
// 		case tcu::TEXTURECHANNELCLASS_FLOATING_POINT:
// 		case tcu::TEXTURECHANNELCLASS_SIGNED_FIXED_POINT:
// 		case tcu::TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT:
// 			return glu::TYPE_SAMPLER_CUBE;

// 		case tcu::TEXTURECHANNELCLASS_SIGNED_INTEGER:
// 			return glu::TYPE_INT_SAMPLER_CUBE;

// 		case tcu::TEXTURECHANNELCLASS_UNSIGNED_INTEGER:
// 			return glu::TYPE_UINT_SAMPLER_CUBE;

// 		default:
// 			return glu::TYPE_LAST;
// 	}
// }

// /*--------------------------------------------------------------------*//*!
//  * \brief Get GLSL sampler type for texture format.
//  *
//  * If no mapping is found, glu::TYPE_LAST is returned.
//  *
//  * \param format Texture format
//  * \return GLSL 2D array sampler type for format
//  *//*--------------------------------------------------------------------*/
// DataType getSampler2DArrayType (tcu::TextureFormat format)
// {
// 	using tcu::TextureFormat;

// 	if (format.order ==  textureFormat.ChannelOrder.D || format.order ==  textureFormat.ChannelOrder.DS)
// 		return TYPE_SAMPLER_2D_ARRAY;

// 	if (format.order ==  textureFormat.ChannelOrder.S)
// 		return TYPE_LAST;

// 	switch (tcu::getTextureChannelClass(format.type))
// 	{
// 		case tcu::TEXTURECHANNELCLASS_FLOATING_POINT:
// 		case tcu::TEXTURECHANNELCLASS_SIGNED_FIXED_POINT:
// 		case tcu::TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT:
// 			return glu::TYPE_SAMPLER_2D_ARRAY;

// 		case tcu::TEXTURECHANNELCLASS_SIGNED_INTEGER:
// 			return glu::TYPE_INT_SAMPLER_2D_ARRAY;

// 		case tcu::TEXTURECHANNELCLASS_UNSIGNED_INTEGER:
// 			return glu::TYPE_UINT_SAMPLER_2D_ARRAY;

// 		default:
// 			return glu::TYPE_LAST;
// 	}
// }

// /*--------------------------------------------------------------------*//*!
//  * \brief Get GLSL sampler type for texture format.
//  *
//  * If no mapping is found, glu::TYPE_LAST is returned.
//  *
//  * \param format Texture format
//  * \return GLSL 3D sampler type for format
//  *//*--------------------------------------------------------------------*/
// DataType getSampler3DType (tcu::TextureFormat format)
// {
// 	using tcu::TextureFormat;

// 	if (format.order ==  textureFormat.ChannelOrder.D || format.order ==  textureFormat.ChannelOrder.DS)
// 		return TYPE_SAMPLER_3D;

// 	if (format.order ==  textureFormat.ChannelOrder.S)
// 		return TYPE_LAST;

// 	switch (tcu::getTextureChannelClass(format.type))
// 	{
// 		case tcu::TEXTURECHANNELCLASS_FLOATING_POINT:
// 		case tcu::TEXTURECHANNELCLASS_SIGNED_FIXED_POINT:
// 		case tcu::TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT:
// 			return glu::TYPE_SAMPLER_3D;

// 		case tcu::TEXTURECHANNELCLASS_SIGNED_INTEGER:
// 			return glu::TYPE_INT_SAMPLER_3D;

// 		case tcu::TEXTURECHANNELCLASS_UNSIGNED_INTEGER:
// 			return glu::TYPE_UINT_SAMPLER_3D;

// 		default:
// 			return glu::TYPE_LAST;
// 	}
// }

// /*--------------------------------------------------------------------*//*!
//  * \brief Get GLSL sampler type for texture format.
//  *
//  * If no mapping is found, glu::TYPE_LAST is returned.
//  *
//  * \param format Texture format
//  * \return GLSL cube map array sampler type for format
//  *//*--------------------------------------------------------------------*/
// DataType getSamplerCubeArrayType (tcu::TextureFormat format)
// {
// 	using tcu::TextureFormat;

// 	if (format.order ==  textureFormat.ChannelOrder.D || format.order ==  textureFormat.ChannelOrder.DS)
// 		return TYPE_SAMPLER_CUBE_ARRAY;

// 	if (format.order ==  textureFormat.ChannelOrder.S)
// 		return TYPE_LAST;

// 	switch (tcu::getTextureChannelClass(format.type))
// 	{
// 		case tcu::TEXTURECHANNELCLASS_FLOATING_POINT:
// 		case tcu::TEXTURECHANNELCLASS_SIGNED_FIXED_POINT:
// 		case tcu::TEXTURECHANNELCLASS_UNSIGNED_FIXED_POINT:
// 			return glu::TYPE_SAMPLER_CUBE_ARRAY;

// 		case tcu::TEXTURECHANNELCLASS_SIGNED_INTEGER:
// 			return glu::TYPE_INT_SAMPLER_CUBE_ARRAY;

// 		case tcu::TEXTURECHANNELCLASS_UNSIGNED_INTEGER:
// 			return glu::TYPE_UINT_SAMPLER_CUBE_ARRAY;

// 		default:
// 			return glu::TYPE_LAST;
// 	}
// }

// enum RenderableType
// {
// 	RENDERABLE_COLOR	= (1<<0),
// 	RENDERABLE_DEPTH	= (1<<1),
// 	RENDERABLE_STENCIL	= (1<<2)
// };

// static deUint32 getRenderableBitsES3 (const ContextInfo& contextInfo, deUint32 internalFormat)
// {
// 	switch (internalFormat)
// 	{
// 		// Color-renderable formats
// 		case gl.RGBA32I:
// 		case gl.RGBA32UI:
// 		case gl.RGBA16I:
// 		case gl.RGBA16UI:
// 		case gl.RGBA8:
// 		case gl.RGBA8I:
// 		case gl.RGBA8UI:
// 		case gl.SRGB8_ALPHA8:
// 		case gl.RGB10_A2:
// 		case gl.RGB10_A2UI:
// 		case gl.RGBA4:
// 		case gl.RGB5_A1:
// 		case gl.RGB8:
// 		case gl.RGB565:
// 		case gl.RG32I:
// 		case gl.RG32UI:
// 		case gl.RG16I:
// 		case gl.RG16UI:
// 		case gl.RG8:
// 		case gl.RG8I:
// 		case gl.RG8UI:
// 		case gl.R32I:
// 		case gl.R32UI:
// 		case gl.R16I:
// 		case gl.R16UI:
// 		case gl.R8:
// 		case gl.R8I:
// 		case gl.R8UI:
// 			return RENDERABLE_COLOR;

// 		// gl.EXT_color_buffer_float
// 		case gl.RGBA32F:
// 		case gl.R11F_G11F_B10F:
// 		case gl.RG32F:
// 		case gl.R32F:
// 			if (contextInfo.isExtensionSupported("gl.EXT_color_buffer_float"))
// 				return RENDERABLE_COLOR;
// 			else
// 				return 0;

// 		// gl.EXT_color_buffer_float / gl.EXT_color_buffer_half_float
// 		case gl.RGBA16F:
// 		case gl.RG16F:
// 		case gl.R16F:
// 			if (contextInfo.isExtensionSupported("gl.EXT_color_buffer_float") ||
// 				contextInfo.isExtensionSupported("gl.EXT_color_buffer_half_float"))
// 				return RENDERABLE_COLOR;
// 			else
// 				return 0;

// 		// Depth formats
// 		case gl.DEPTH_COMPONENT32F:
// 		case gl.DEPTH_COMPONENT24:
// 		case gl.DEPTH_COMPONENT16:
// 			return RENDERABLE_DEPTH;

// 		// Depth+stencil formats
// 		case gl.DEPTH32F_STENCIL8:
// 		case gl.DEPTH24_STENCIL8:
// 			return RENDERABLE_DEPTH|RENDERABLE_STENCIL;

// 		// Stencil formats
// 		case gl.STENCIL_INDEX8:
// 			return RENDERABLE_STENCIL;

// 		default:
// 			return 0;
// 	}
// }

// /*--------------------------------------------------------------------*//*!
//  * \brief Check if sized internal format is color-renderable.
//  * \note Works currently only on ES3 context.
//  *//*--------------------------------------------------------------------*/
// bool isSizedFormatColorRenderable (const RenderContext& renderCtx, const ContextInfo& contextInfo, deUint32 sizedFormat)
// {
// 	deUint32 renderable = 0;

// 	if (renderCtx.getType().getAPI() == ApiType::es(3,0))
// 		renderable = getRenderableBitsES3(contextInfo, sizedFormat);
// 	else
// 		throw tcu::InternalError("Context type not supported in query");

// 	return (renderable & RENDERABLE_COLOR) != 0;
// }

return {
	mapGLInternalFormat: mapGLInternalFormat
};

});