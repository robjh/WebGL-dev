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

define(['framework/common/tcuTexture', 'framework/delibs/debase/deInt32'], function(tcuTexture, deInt32) {
	'use strict';

var DE_ASSERT = function(x) {
	if (!x)
		throw new Error('Assert failed');
};
var DE_FALSE = false;

/*--------------------------------------------------------------------*//*!
 * \brief RGBA8888 surface
 *
 * Surface provides basic pixel storage functionality. Only single format
 * (RGBA8888) is supported.
 *
 * PixelBufferAccess (see tcuTexture.h) provides much more flexible API
 * for handling various pixel formats. This is mainly a convinience class.
 *//*--------------------------------------------------------------------*/
var Surface = function(width, heigth) {
	this.m_width = width;
	this.m_height = heigth;
	if (width * heigth > 0) {
		this.m_pixels = new ArrayBuffer(width * heigth);
		this.m_view = new Int8Array(this.m_pixels);
	}
};

Surface.prototype.setSize = function(width, height) {
	/* TODO: Duplicated code from constructor */
	this.m_width = width;
	this.m_height = heigth;
	if (width * heigth > 0) {
		this.m_pixels = new ArrayBuffer(width * heigth);
		this.m_view = new Int8Array(this.m_pixels);
	}
};

Surface.prototype.getWidth	= function() { return this.m_width;  }
Surface.prototype.getHeight	= function() { return this.m_height; }

/**
 * @param color Vec4 color
 */
Surface.prototype.setPixel	= function(x, y, color) {
	DE_ASSERT(deInt32deInBounds32(x, 0, this.m_width));
	DE_ASSERT(deInt32deInBounds32(y, 0, this.m_height));

	var offset = x + y * this.m_width;
	for (var i = 0; i < 4; i++)
		this.m_view[i] = color[i];
};

Surface.prototype.getPixel	= function(x, y) {
	DE_ASSERT(deInt32deInBounds32(x, 0, this.m_width));
	DE_ASSERT(deInt32deInBounds32(y, 0, this.m_height));

	var color = [];
	color.length = 4;

	var offset = x + y * this.m_width;
	for (var i = 0; i < 4; i++)
		color[i] = this.m_view[i];

	return color;
};

/**
 * @return {PixelBufferAccess} Pixel Buffer Access object
 */
Surface.prototype.getAccess	= function() {
	return new PixelBufferAccess({
					format: new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA, tcuTexture.ChannelType.UNORM_INT8),
					width: this.m_width,
					height: this.m_heigth,
					data: this.m_pixels
				});

};

Surface.prototype.getSubAccess	= function(x, y, width, heigth) {
	/* TODO: Implement. the deqp getSubAccess() looks broken. It will probably fail if
	 * x != 0 or width != m_width
	 */
	 throw new Error('Unimplemented');
};

return {
	Surface: Surface
};

});
