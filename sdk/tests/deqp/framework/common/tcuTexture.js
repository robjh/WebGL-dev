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

define(function()  {
'use strict';

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
		/* TODO: Implement */
		throw new Error("Not implemented");
	};

	return {
		TextureFormat: TextureFormat,
		ChannelType: ChannelType,
		ChannelOrder: ChannelOrder
	};
});
