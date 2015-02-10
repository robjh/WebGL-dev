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

define(['./gluTextureUtil', '../common/tcuTexture'], function(gluTextureUtil, tcuTexture) {
var Texture2D = function(gl, format, isCompressed, refTexture) {
	this.gl = gl;
	this.m_texture = gl.createTexture();
	this.m_isCompressed = isCompressed;
	this.m_format = format; // Internal format
	this.m_refTexture = refTexture;
};

var constructFromInternalFormat = function(gl, internalFormat, width, height) {
	var tex = new Texture2D(gl, internalFormat, false, new tcuTexture.Texture2D(gluTextureUtil.mapGLInternalFormat(internalFormat), width, height));
	return tex;
};

return {
	Texture2D: Texture2D,
	constructFromInternalFormat: constructFromInternalFormat
}
});