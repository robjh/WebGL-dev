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

define(['framework/opengl/gluTextureUtil' , 'framework/common/tcuTexture', 'framework/delibs/debase/deInt32' ], function(gluTextureUtil, tcuTexture, deInt32) {
	'use strict';

var DE_ASSERT = function(x) {
	if (!x)
		throw new Error('Assert failed');
};
var DE_FALSE = false;

var Texture2D = function(gl, format, isCompressed, refTexture) {
	this.gl = gl;
	this.m_glTexture = gl.createTexture();
	this.m_isCompressed = isCompressed;
	this.m_format = format; // Internal format
	this.m_refTexture = refTexture;
};

Texture2D.prototype.getRefTexture = function() {
	return this.m_refTexture;
};

Texture2D.prototype.getGLTexture = function() {
	return this.m_glTexture;
};

var constructFromInternalFormat = function(gl, internalFormat, width, height) {
	var tex = new Texture2D(gl, internalFormat, false, new tcuTexture.Texture2D(gluTextureUtil.mapGLInternalFormat(internalFormat), width, height));
	return tex;
};

var computePixelStore = function(/*const tcu::TextureFormat&*/ format)
{
	var pixelSize = format.getPixelSize();
	if (deInt32.deIsPowerOfTwo32(pixelSize))
		return Math.min(pixelSize, 8);
	else
		return 1;
}

Texture2D.prototype.upload = function() {
	DE_ASSERT(!this.m_isCompressed);

	if (this.m_glTexture == null)
		testFailedOptions('Failed to create GL texture', true);

	gl.bindTexture(gl.TEXTURE_2D, this.m_glTexture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, computePixelStore(this.m_refTexture.getFormat()));
	assertMsgOptions(gl.getError() === gl.NO_ERROR, "Setting pixel store failed", false, true);

	var transferFormat = gluTextureUtil.getTransferFormat(this.m_refTexture.getFormat());

	for (var levelNdx = 0; levelNdx < this.m_refTexture.getNumLevels(); levelNdx++)
	{
		if (this.m_refTexture.isLevelEmpty(levelNdx))
			continue; // Don't upload.

		var access = this.m_refTexture.getLevel(levelNdx);
		DE_ASSERT(access.getRowPitch() == access.getFormat().getPixelSize()*access.getWidth());
		var data = access.getDataPtr();
		console.log(data);
		console.log('Level ' + levelNdx + ' format ' + this.m_format.toString(16) + ' transfer Format ' + transferFormat.format.toString(16) + ' datatype ' + transferFormat.dataType.toString(16));
		gl.texImage2D(gl.TEXTURE_2D, levelNdx, this.m_format, access.getWidth(), access.getHeight(), 0 /* border */, transferFormat.format, transferFormat.dataType, access.getDataPtr());
	}

	assertMsgOptions(gl.getError() === gl.NO_ERROR, "Texture upload failed", false, true);
};

return {
	Texture2D: Texture2D,
	constructFromInternalFormat: constructFromInternalFormat
}
});