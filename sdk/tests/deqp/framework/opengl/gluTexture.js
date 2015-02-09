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