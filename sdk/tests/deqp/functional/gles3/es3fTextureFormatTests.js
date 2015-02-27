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
define(['framework/opengl/gluShaderUtil', 'framework/delibs/debase/deRandom','framework/common/tcuTestCase', 'framework/common/tcuSurface',  'framework/opengl/gluTexture', 'framework/opengl/gluTextureUtil', 'framework/common/tcuTexture', 'modules/shared/glsTextureTestUtil', 'framework/common/tcuTextureUtil', 'framework/opengl/gluStrUtil', 'framework/delibs/debase/deMath',	'framework/common/tcuCompressedTexture' ],
	 function(gluShaderUtil, deRandom, deqpTests, tcuSurface, gluTexture, gluTextureUtil, tcuTexture, glsTextureTestUtil, tcuTextureUtil, gluStrUtil, deMath, tcuCompressedTexture) {
    'use strict';

var	GLU_EXPECT_NO_ERROR = function(error, message) {
	assertMsgOptions(error === gl.NONE, message, false, true);
};

var DE_ASSERT = function(x) {
	if (!x)
		throw new Error('Assert failed');
};

var version = "100 es";

var testDescription = function() {
	var test = deqpTests.runner.getState().currentTest;
	return test.description;
};

var Texture2DFormatCase = function(descriptor){
	this.m_format = descriptor.format;
	this.m_dataType = descriptor.dataType;
	this.m_width = descriptor.width;
	this.m_height = descriptor.height;
	this.m_renderer = new glsTextureTestUtil.TextureRenderer(version, gluShaderUtil.precision.PRECISION_HIGHP);
};

Texture2DFormatCase.prototype.init = function() {
	/*tcu::TextureFormat*/ var		fmt		= this.m_dataType ? gluTextureUtil.mapGLTransferFormat(this.m_format, this.m_dataType) : gluTextureUtil.mapGLInternalFormat(this.m_format);
	/*tcu::TextureFormatInfo*/ var	spec	= tcuTextureUtil.getTextureFormatInfo(fmt);
	console.log(spec);
	/* TODO : Port
	
	std::ostringstream		fmtName;

	if (m_dataType)
		fmtName << glu::getPixelFormatStr(m_format) << ", " << glu::getTypeStr(m_dataType);
	else
		fmtName << glu::getPixelFormatStr(m_format);

	log << TestLog::Message << "2D texture, " << fmtName.str() << ", " << m_width << "x" << m_height
							<< ",\n  fill with " << formatGradient(&spec.valueMin, &spec.valueMax) << " gradient"
		<< TestLog::EndMessage;
	*/

	this.m_texture = this.m_dataType
			  ? gluTexture.texture2DFromFormat(gl, this.m_format, this.m_dataType, this.m_width, this.m_height)	// Implicit internal format.
			  : gluTexture.texture2DFromInternalFormat(gl, this.m_format, this.m_width, this.m_height);				// Explicit internal format.

	// Fill level 0.
	this.m_texture.getRefTexture().allocLevel(0);
	tcuTextureUtil.fillWithComponentGradients(this.m_texture.getRefTexture().getLevel(0), spec.valueMin, spec.valueMax);
};

Texture2DFormatCase.prototype.deinit = function() {
	/* TODO: Implement */
};

Texture2DFormatCase.prototype.iterate = function() {
	/* TODO: Implement */	

	var viewport	= new glsTextureTestUtil.RandomViewport(canvas, this.m_width, this.m_height/*, deStringHash(getName())*/);

	/* tcu::Surface	 */	var	renderedFrame	= new tcuSurface.Surface(viewport.width, viewport.height);
	/* tcu::Surface	 */	var	referenceFrame	= new tcuSurface.Surface(viewport.width, viewport.height);
	/* TODO: Implement
	// tcu::RGBA				threshold			= m_renderCtx.getRenderTarget().getPixelFormat().getColorThreshold() + tcu::RGBA(1,1,1,1);
	*/
	var threshold = [3, 3, 3, 3];
	var renderParams = new glsTextureTestUtil.ReferenceParams(glsTextureTestUtil.textureType.TEXTURETYPE_2D);

	/* tcu::TextureFormatInfo*/ var	spec				= tcuTextureUtil.getTextureFormatInfo(this.m_texture.getRefTexture().getFormat());
	/* @const */ var			wrapS				= gl.CLAMP_TO_EDGE;
	/* @const */ var			wrapT				= gl.CLAMP_TO_EDGE;
	/* @const */ var			minFilter			= gl.NEAREST;
	/* @const */ var			magFilter			= gl.NEAREST;

	renderParams.flags.log_programs = true;
	renderParams.flags.log_uniforms = true;

	renderParams.samplerType	= glsTextureTestUtil.getSamplerType(this.m_texture.getRefTexture().getFormat());
	console.log('Sampler');
	console.log(renderParams.samplerType)
	renderParams.sampler		= new tcuTexture.Sampler(tcuTexture.WrapMode.CLAMP_TO_EDGE, tcuTexture.WrapMode.CLAMP_TO_EDGE, tcuTexture.WrapMode.CLAMP_TO_EDGE,
	 tcuTexture.FilterMode.NEAREST, tcuTexture.FilterMode.NEAREST);
	console.log(renderParams.sampler);
	renderParams.colorScale		= spec.lookupScale;
	renderParams.colorBias		= spec.lookupBias;

	var texCoord = glsTextureTestUtil.computeQuadTexCoord2D([0, 0], [1, 1]);

	// log << TestLog::Message << "Texture parameters:"
	// 						<< "\n  WRAP_S = " << glu::getTextureParameterValueStr(GL_TEXTURE_WRAP_S, wrapS)
	// 						<< "\n  WRAP_T = " << glu::getTextureParameterValueStr(GL_TEXTURE_WRAP_T, wrapT)
	// 						<< "\n  MIN_FILTER = " << glu::getTextureParameterValueStr(GL_TEXTURE_MIN_FILTER, minFilter)
	// 						<< "\n  MAG_FILTER = " << glu::getTextureParameterValueStr(GL_TEXTURE_MAG_FILTER, magFilter)
	// 	<< TestLog::EndMessage;

	// Setup base viewport.
	console.log(viewport);
	gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

	// Upload texture data to GL.
	this.m_texture.upload();

	// Bind to unit 0.
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.m_texture.getGLTexture());

	// Setup nearest neighbor filtering and clamp-to-edge.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);

	GLU_EXPECT_NO_ERROR(gl.getError(), "Set texturing state");

	// // Draw.
	this.m_renderer.renderQuad(0, texCoord, renderParams);
	gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, renderedFrame.getAccess().getDataPtr());

	GLU_EXPECT_NO_ERROR(gl.getError(), "glReadPixels()");

	// // Compute reference.
	glsTextureTestUtil.sampleTexture2D(new glsTextureTestUtil.SurfaceAccess(referenceFrame, undefined /*m_renderCtx.getRenderTarget().getPixelFormat()*/),
		this.m_texture.getRefTexture(), texCoord, renderParams);


	// Compare and log.
	var isOk = glsTextureTestUtil.compareImages(referenceFrame, renderedFrame, threshold);

	assertMsgOptions(isOk, testDescription(), true, true);
	return deqpTests.runner.IterateResult.STOP;
};

var TextureCubeFormatCase = function(descriptor){
	this.m_format = descriptor.format;
	this.m_dataType = descriptor.dataType;
	this.m_width = descriptor.width;
	this.m_height = descriptor.height;
	this.m_renderer = new glsTextureTestUtil.TextureRenderer(version, gluShaderUtil.precision.PRECISION_HIGHP);
	DE_ASSERT(this.m_width == this.m_height);
};

TextureCubeFormatCase.prototype.init = function() {
	/*tcu::TextureFormat*/ var		fmt		= this.m_dataType ? gluTextureUtil.mapGLTransferFormat(this.m_format, this.m_dataType) : gluTextureUtil.mapGLInternalFormat(this.m_format);
	/*tcu::TextureFormatInfo*/ var	spec	= tcuTextureUtil.getTextureFormatInfo(fmt);
	console.log(spec);
	/* TODO : Port
	
	std::ostringstream		fmtName;

	if (m_dataType)
		fmtName << glu::getPixelFormatStr(m_format) << ", " << glu::getTypeStr(m_dataType);
	else
		fmtName << glu::getPixelFormatStr(m_format);

	log << TestLog::Message << "2D texture, " << fmtName.str() << ", " << m_width << "x" << m_height
							<< ",\n  fill with " << formatGradient(&spec.valueMin, &spec.valueMax) << " gradient"
		<< TestLog::EndMessage;
	*/

	this.m_texture = this.m_dataType
			  ? gluTexture.cubeFromFormat(gl, this.m_format, this.m_dataType, this.m_width)	// Implicit internal format.
			  : gluTexture.cubeFromInternalFormat(gl, this.m_format, this.m_width);				// Explicit internal format.

	// Fill level 0.
	for (var face = 0; face < tcuTexture.CubeFace.TOTAL_FACES; face++) {
		var gMin = null;
		var gMax = null;

		switch (face) {
			case 0: gMin = deMath.swizzle(spec.valueMin, [0, 1, 2, 3]); gMax = deMath.swizzle(spec.valueMax, [0, 1, 2, 3]); break;
			case 1: gMin = deMath.swizzle(spec.valueMin, [2, 1, 0, 3]); gMax = deMath.swizzle(spec.valueMax, [2, 1, 0, 3]); break;
			case 2: gMin = deMath.swizzle(spec.valueMin, [1, 2, 0, 3]); gMax = deMath.swizzle(spec.valueMax, [1, 2, 0, 3]); break;
			case 3: gMin = deMath.swizzle(spec.valueMax, [0, 1, 2, 3]); gMax = deMath.swizzle(spec.valueMin, [0, 1, 2, 3]); break;
			case 4: gMin = deMath.swizzle(spec.valueMax, [2, 1, 0, 3]); gMax = deMath.swizzle(spec.valueMin, [2, 1, 0, 3]); break;
			case 5: gMin = deMath.swizzle(spec.valueMax, [1, 2, 0, 3]); gMax = deMath.swizzle(spec.valueMin, [1, 2, 0, 3]); break;
			default:
				DE_ASSERT(false);
		}

		this.m_texture.getRefTexture().allocLevel(face, 0);
		tcuTextureUtil.fillWithComponentGradients(this.m_texture.getRefTexture().getLevelFace(0, face), gMin, gMax);
	}

	this.m_texture.upload();
	this.m_curFace = 0;
	this.m_isOk = true;
};

TextureCubeFormatCase.prototype.testFace = function(face) {
	/* TODO: Implement */	

	var viewport	= new glsTextureTestUtil.RandomViewport(canvas, this.m_width, this.m_height/*, deStringHash(getName())*/);

	/* tcu::Surface	 */	var	renderedFrame	= new tcuSurface.Surface(viewport.width, viewport.height);
	/* tcu::Surface	 */	var	referenceFrame	= new tcuSurface.Surface(viewport.width, viewport.height);
	/* TODO: Implement
	// tcu::RGBA				threshold			= m_renderCtx.getRenderTarget().getPixelFormat().getColorThreshold() + tcu::RGBA(1,1,1,1);
	*/
	var threshold = [3, 3, 3, 3];
	var renderParams = new glsTextureTestUtil.ReferenceParams(glsTextureTestUtil.textureType.TEXTURETYPE_CUBE);

	/* tcu::TextureFormatInfo*/ var	spec				= tcuTextureUtil.getTextureFormatInfo(this.m_texture.getRefTexture().getFormat());
	/* @const */ var			wrapS				= gl.CLAMP_TO_EDGE;
	/* @const */ var			wrapT				= gl.CLAMP_TO_EDGE;
	/* @const */ var			minFilter			= gl.NEAREST;
	/* @const */ var			magFilter			= gl.NEAREST;

	renderParams.flags.log_programs = true;
	renderParams.flags.log_uniforms = true;

	renderParams.samplerType	= glsTextureTestUtil.getSamplerType(this.m_texture.getRefTexture().getFormat());
	console.log('Sampler');
	console.log(renderParams.samplerType)
	renderParams.sampler		= new tcuTexture.Sampler(tcuTexture.WrapMode.CLAMP_TO_EDGE, tcuTexture.WrapMode.CLAMP_TO_EDGE, tcuTexture.WrapMode.CLAMP_TO_EDGE,
	 tcuTexture.FilterMode.NEAREST, tcuTexture.FilterMode.NEAREST);
	console.log(renderParams.sampler);
	renderParams.colorScale		= spec.lookupScale;
	renderParams.colorBias		= spec.lookupBias;

	// Log render info on first face.
	if (face === tcuTexture.CubeFace.CUBEFACE_NEGATIVE_X) {
		renderParams.flags.log_programs = true;
		renderParams.flags.log_uniforms = true;
	}

	var texCoord = glsTextureTestUtil.computeQuadTexCoordCube(face);

	// log << TestLog::Message << "Texture parameters:"
	// 						<< "\n  WRAP_S = " << glu::getTextureParameterValueStr(GL_TEXTURE_WRAP_S, wrapS)
	// 						<< "\n  WRAP_T = " << glu::getTextureParameterValueStr(GL_TEXTURE_WRAP_T, wrapT)
	// 						<< "\n  MIN_FILTER = " << glu::getTextureParameterValueStr(GL_TEXTURE_MIN_FILTER, minFilter)
	// 						<< "\n  MAG_FILTER = " << glu::getTextureParameterValueStr(GL_TEXTURE_MAG_FILTER, magFilter)
	// 	<< TestLog::EndMessage;

	// Setup base viewport.
	console.log(viewport);
	gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

	// Bind to unit 0.
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.m_texture.getGLTexture());

	// Setup nearest neighbor filtering and clamp-to-edge.
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, wrapS);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, wrapT);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, minFilter);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, magFilter);

	GLU_EXPECT_NO_ERROR(gl.getError(), "Set texturing state");

	// // Draw.
	this.m_renderer.renderQuad(0, texCoord, renderParams);
	gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, renderedFrame.getAccess().getDataPtr());

	GLU_EXPECT_NO_ERROR(gl.getError(), "glReadPixels()");


	// // Compute reference.
	glsTextureTestUtil.sampleTextureCube(new glsTextureTestUtil.SurfaceAccess(referenceFrame, undefined /*m_renderCtx.getRenderTarget().getPixelFormat()*/),
		this.m_texture.getRefTexture(), texCoord, renderParams);

	// Compare and log.
	var isOk = glsTextureTestUtil.compareImages(referenceFrame, renderedFrame, threshold);

	assertMsgOptions(isOk, 'Face: ' + this.m_curFace + ' ' + testDescription(), true, true);
	return isOk;
};

TextureCubeFormatCase.prototype.iterate = function() {
	debug('Testing face ' + this.m_curFace);
	// Execute test for all faces.
	if (!this.testFace(this.m_curFace))
		this.m_isOk = false;

	this.m_curFace += 1;

	if (this.m_curFace == tcuTexture.CubeFace.TOTAL_FACES)
		return deqpTests.runner.IterateResult.STOP;
	else
		return deqpTests.runner.IterateResult.CONTINUE;
};

var Texture2DArrayFormatCase = function(descriptor){
	this.m_format = descriptor.format;
	this.m_dataType = descriptor.dataType;
	this.m_width = descriptor.width;
	this.m_height = descriptor.height;
	this.m_numLayers = descriptor.numLayers;
	this.m_renderer = new glsTextureTestUtil.TextureRenderer(version, gluShaderUtil.precision.PRECISION_HIGHP);
};

Texture2DArrayFormatCase.prototype.init = function() {
	/*tcu::TextureFormat*/ var		fmt		= this.m_dataType ? gluTextureUtil.mapGLTransferFormat(this.m_format, this.m_dataType) : gluTextureUtil.mapGLInternalFormat(this.m_format);
	/*tcu::TextureFormatInfo*/ var	spec	= tcuTextureUtil.getTextureFormatInfo(fmt);
	console.log(spec);
	/* TODO : Port
	
	std::ostringstream		fmtName;

	if (m_dataType)
		fmtName << glu::getPixelFormatStr(m_format) << ", " << glu::getTypeStr(m_dataType);
	else
		fmtName << glu::getPixelFormatStr(m_format);

	log << TestLog::Message << "2D texture, " << fmtName.str() << ", " << m_width << "x" << m_height
							<< ",\n  fill with " << formatGradient(&spec.valueMin, &spec.valueMax) << " gradient"
		<< TestLog::EndMessage;
	*/

	this.m_texture = this.m_dataType
			  ? gluTexture.texture2DArrayFromFormat(gl, this.m_format, this.m_dataType, this.m_width, this.m_height, this.m_numLayers)	// Implicit internal format.
			  : gluTexture.texture2DArrayFromInternalFormat(gl, this.m_format, this.m_width, this.m_height, this.m_numLayers);				// Explicit internal format.

	this.m_texture.getRefTexture().allocLevel(0);
	tcuTextureUtil.fillWithComponentGradients(this.m_texture.getRefTexture().getLevel(0), spec.valueMin, spec.valueMax);

	this.m_curLayer = 0;
	this.m_isOk = true;
};

Texture2DArrayFormatCase.prototype.testLayer = function(layerNdx) {
	/* TODO: Implement */	

	var viewport	= new glsTextureTestUtil.RandomViewport(canvas, this.m_width, this.m_height/*, deStringHash(getName())*/);

	/* tcu::Surface	 */	var	renderedFrame	= new tcuSurface.Surface(viewport.width, viewport.height);
	/* tcu::Surface	 */	var	referenceFrame	= new tcuSurface.Surface(viewport.width, viewport.height);
	/* TODO: Implement
	// tcu::RGBA				threshold			= m_renderCtx.getRenderTarget().getPixelFormat().getColorThreshold() + tcu::RGBA(1,1,1,1);
	*/
	var threshold = [3, 3, 3, 3];
	var renderParams = new glsTextureTestUtil.ReferenceParams(glsTextureTestUtil.textureType.TEXTURETYPE_2D_ARRAY);

	/* tcu::TextureFormatInfo*/ var	spec				= tcuTextureUtil.getTextureFormatInfo(this.m_texture.getRefTexture().getFormat());
	/* @const */ var			wrapS				= gl.CLAMP_TO_EDGE;
	/* @const */ var			wrapT				= gl.CLAMP_TO_EDGE;
	/* @const */ var			minFilter			= gl.NEAREST;
	/* @const */ var			magFilter			= gl.NEAREST;

	renderParams.flags.log_programs = true;
	renderParams.flags.log_uniforms = true;

	renderParams.samplerType	= glsTextureTestUtil.getSamplerType(this.m_texture.getRefTexture().getFormat());
	console.log('Sampler');
	console.log(renderParams.samplerType)
	renderParams.sampler		= new tcuTexture.Sampler(tcuTexture.WrapMode.CLAMP_TO_EDGE, tcuTexture.WrapMode.CLAMP_TO_EDGE, tcuTexture.WrapMode.CLAMP_TO_EDGE,
	 tcuTexture.FilterMode.NEAREST, tcuTexture.FilterMode.NEAREST);
	console.log(renderParams.sampler);
	renderParams.colorScale		= spec.lookupScale;
	renderParams.colorBias		= spec.lookupBias;


	var texCoord = glsTextureTestUtil.computeQuadTexCoord2DArray(layerNdx, [0, 0], [1, 1]);

	// log << TestLog::Message << "Texture parameters:"
	// 						<< "\n  WRAP_S = " << glu::getTextureParameterValueStr(GL_TEXTURE_WRAP_S, wrapS)
	// 						<< "\n  WRAP_T = " << glu::getTextureParameterValueStr(GL_TEXTURE_WRAP_T, wrapT)
	// 						<< "\n  MIN_FILTER = " << glu::getTextureParameterValueStr(GL_TEXTURE_MIN_FILTER, minFilter)
	// 						<< "\n  MAG_FILTER = " << glu::getTextureParameterValueStr(GL_TEXTURE_MAG_FILTER, magFilter)
	// 	<< TestLog::EndMessage;

	// Setup base viewport.
	console.log(viewport);
	gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

	this.m_texture.upload();

	// Bind to unit 0.
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.m_texture.getGLTexture());

	// Setup nearest neighbor filtering and clamp-to-edge.
	gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, wrapS);
	gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, wrapT);
	gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, minFilter);
	gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, magFilter);

	GLU_EXPECT_NO_ERROR(gl.getError(), "Set texturing state");

	// // Draw.
	this.m_renderer.renderQuad(0, texCoord, renderParams);
	gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, renderedFrame.getAccess().getDataPtr());

	GLU_EXPECT_NO_ERROR(gl.getError(), "glReadPixels()");


	// // Compute reference.
	glsTextureTestUtil.sampleTexture2DArray(new glsTextureTestUtil.SurfaceAccess(referenceFrame, undefined /*m_renderCtx.getRenderTarget().getPixelFormat()*/),
		this.m_texture.getRefTexture(), texCoord, renderParams);


	// Compare and log.
	var isOk = glsTextureTestUtil.compareImages(referenceFrame, renderedFrame, threshold);

	assertMsgOptions(isOk, 'Layer: ' + this.m_curLayer + ' ' + testDescription(), true, true);
	return isOk;
};

Texture2DArrayFormatCase.prototype.iterate = function() {
	debug('Testing layer ' + this.m_curLayer);
	// Execute test for all layers.
	if (!this.testLayer(this.m_curLayer))
		this.m_isOk = false;

	this.m_curLayer += 1;

	if (this.m_curLayer == this.m_numLayers)
		return deqpTests.runner.IterateResult.STOP;
	else
		return deqpTests.runner.IterateResult.CONTINUE;
};

var Texture3DFormatCase = function(descriptor){
	this.m_format = descriptor.format;
	this.m_dataType = descriptor.dataType;
	this.m_width = descriptor.width;
	this.m_height = descriptor.height;
	this.m_depth = descriptor.depth;
	this.m_renderer = new glsTextureTestUtil.TextureRenderer(version, gluShaderUtil.precision.PRECISION_HIGHP);
};

Texture3DFormatCase.prototype.init = function() {
	/*tcu::TextureFormat*/ var		fmt		= this.m_dataType ? gluTextureUtil.mapGLTransferFormat(this.m_format, this.m_dataType) : gluTextureUtil.mapGLInternalFormat(this.m_format);
	/*tcu::TextureFormatInfo*/ var	spec	= tcuTextureUtil.getTextureFormatInfo(fmt);
	console.log(spec);
	/* TODO : Port
	
	std::ostringstream		fmtName;

	if (m_dataType)
		fmtName << glu::getPixelFormatStr(m_format) << ", " << glu::getTypeStr(m_dataType);
	else
		fmtName << glu::getPixelFormatStr(m_format);

	log << TestLog::Message << "2D texture, " << fmtName.str() << ", " << m_width << "x" << m_height
							<< ",\n  fill with " << formatGradient(&spec.valueMin, &spec.valueMax) << " gradient"
		<< TestLog::EndMessage;
	*/

	this.m_texture = this.m_dataType
			  ? gluTexture.texture3DFromFormat(gl, this.m_format, this.m_dataType, this.m_width, this.m_height, this.m_depth)	// Implicit internal format.
			  : gluTexture.texture3DFromInternalFormat(gl, this.m_format, this.m_width, this.m_height, this.m_depth);				// Explicit internal format.

	this.m_texture.getRefTexture().allocLevel(0);
	tcuTextureUtil.fillWithComponentGradients(this.m_texture.getRefTexture().getLevel(0), spec.valueMin, spec.valueMax);

	this.m_curSlice = 0;
	this.m_isOk = true;
};

Texture3DFormatCase.prototype.testSlice = function(sliceNdx) {
	/* TODO: Implement */	

	var viewport	= new glsTextureTestUtil.RandomViewport(canvas, this.m_width, this.m_height/*, deStringHash(getName())*/);

	/* tcu::Surface	 */	var	renderedFrame	= new tcuSurface.Surface(viewport.width, viewport.height);
	/* tcu::Surface	 */	var	referenceFrame	= new tcuSurface.Surface(viewport.width, viewport.height);
	/* TODO: Implement
	// tcu::RGBA				threshold			= m_renderCtx.getRenderTarget().getPixelFormat().getColorThreshold() + tcu::RGBA(1,1,1,1);
	*/
	var threshold = [3, 3, 3, 3];
	var renderParams = new glsTextureTestUtil.ReferenceParams(glsTextureTestUtil.textureType.TEXTURETYPE_3D);

	/* tcu::TextureFormatInfo*/ var	spec				= tcuTextureUtil.getTextureFormatInfo(this.m_texture.getRefTexture().getFormat());
	var					r					= (sliceNdx + 0.5) / this.m_depth;
	/* @const */ var			wrapS				= gl.CLAMP_TO_EDGE;
	/* @const */ var			wrapT				= gl.CLAMP_TO_EDGE;
	/* @const */ var			minFilter			= gl.NEAREST;
	/* @const */ var			magFilter			= gl.NEAREST;

	renderParams.flags.log_programs = true;
	renderParams.flags.log_uniforms = true;

	renderParams.samplerType	= glsTextureTestUtil.getSamplerType(this.m_texture.getRefTexture().getFormat());
	console.log('Sampler');
	console.log(renderParams.samplerType)
	renderParams.sampler		= new tcuTexture.Sampler(tcuTexture.WrapMode.CLAMP_TO_EDGE, tcuTexture.WrapMode.CLAMP_TO_EDGE, tcuTexture.WrapMode.CLAMP_TO_EDGE,
	 tcuTexture.FilterMode.NEAREST, tcuTexture.FilterMode.NEAREST);
	console.log(renderParams.sampler);
	renderParams.colorScale		= spec.lookupScale;
	renderParams.colorBias		= spec.lookupBias;


	var texCoord = glsTextureTestUtil.computeQuadTexCoord3D([0, 0, r], [1, 1, r], [0, 1, 2]);

	// log << TestLog::Message << "Texture parameters:"
	// 						<< "\n  WRAP_S = " << glu::getTextureParameterValueStr(GL_TEXTURE_WRAP_S, wrapS)
	// 						<< "\n  WRAP_T = " << glu::getTextureParameterValueStr(GL_TEXTURE_WRAP_T, wrapT)
	// 						<< "\n  MIN_FILTER = " << glu::getTextureParameterValueStr(GL_TEXTURE_MIN_FILTER, minFilter)
	// 						<< "\n  MAG_FILTER = " << glu::getTextureParameterValueStr(GL_TEXTURE_MAG_FILTER, magFilter)
	// 	<< TestLog::EndMessage;

	// Setup base viewport.
	console.log(viewport);
	gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

	this.m_texture.upload();

	// Bind to unit 0.
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_3D, this.m_texture.getGLTexture());

	// Setup nearest neighbor filtering and clamp-to-edge.
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, wrapS);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, wrapT);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, minFilter);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, magFilter);

	GLU_EXPECT_NO_ERROR(gl.getError(), "Set texturing state");

	// // Draw.
	this.m_renderer.renderQuad(0, texCoord, renderParams);
	gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, renderedFrame.getAccess().getDataPtr());

	GLU_EXPECT_NO_ERROR(gl.getError(), "glReadPixels()");


	// // Compute reference.
	glsTextureTestUtil.sampleTexture3D(new glsTextureTestUtil.SurfaceAccess(referenceFrame, undefined /*m_renderCtx.getRenderTarget().getPixelFormat()*/),
		this.m_texture.getRefTexture(), texCoord, renderParams);


	// Compare and log.
	var isOk = glsTextureTestUtil.compareImages(referenceFrame, renderedFrame, threshold);

	assertMsgOptions(isOk, 'Slice: ' + this.m_curSlice + ' ' + testDescription(), true, true);
	return isOk;
};

Texture3DFormatCase.prototype.iterate = function() {
	debug('Testing slice ' + this.m_curSlice);
	// Execute test for all layers.
	if (!this.testSlice(this.m_curSlice))
		this.m_isOk = false;

	this.m_curSlice += 1;

	if (this.m_curSlice >= this.m_depth)
		return deqpTests.runner.IterateResult.STOP;
	else
		return deqpTests.runner.IterateResult.CONTINUE;
};

var Compressed2DFormatCase = function(descriptor){
	this.m_format = descriptor.format;
	this.m_dataType = descriptor.dataType;
	this.m_width = descriptor.width;
	this.m_height = descriptor.height;
	this.m_renderer = new glsTextureTestUtil.TextureRenderer(version, gluShaderUtil.precision.PRECISION_HIGHP);
};

Compressed2DFormatCase.prototype.init = function() {
	var compressed = new tcuCompressedTexture.CompressedTexture(this.m_format, this.m_width, this.m_height);
	var rand = new deRandom.Random(0);
	for (var i = 0; i < compressed.m_data.length; i++) {
		compressed.m_data[i] = rand.getInt(0, 255);
	}
	this.m_texture = gluTexture.compressed2DFromInternalFormat(gl, this.m_format, this.m_width, this.m_height, compressed);
};

Compressed2DFormatCase.prototype.deinit = function() {
	/* TODO: Implement */
};

Compressed2DFormatCase.prototype.iterate = function() {
	/* TODO: Implement */	

	var viewport	= new glsTextureTestUtil.RandomViewport(canvas, this.m_width, this.m_height/*, deStringHash(getName())*/);

	/* tcu::Surface	 */	var	renderedFrame	= new tcuSurface.Surface(viewport.width, viewport.height);
	/* tcu::Surface	 */	var	referenceFrame	= new tcuSurface.Surface(viewport.width, viewport.height);
	/* TODO: Implement
	// tcu::RGBA				threshold			= m_renderCtx.getRenderTarget().getPixelFormat().getColorThreshold() + tcu::RGBA(1,1,1,1);
	*/
	var threshold = [3, 3, 3, 3];
	var renderParams = new glsTextureTestUtil.ReferenceParams(glsTextureTestUtil.textureType.TEXTURETYPE_2D);

	/* tcu::TextureFormatInfo*/ var	spec				= tcuTextureUtil.getTextureFormatInfo(this.m_texture.getRefTexture().getFormat());
	/* @const */ var			wrapS				= gl.CLAMP_TO_EDGE;
	/* @const */ var			wrapT				= gl.CLAMP_TO_EDGE;
	/* @const */ var			minFilter			= gl.NEAREST;
	/* @const */ var			magFilter			= gl.NEAREST;

	renderParams.flags.log_programs = true;
	renderParams.flags.log_uniforms = true;

	renderParams.samplerType	= glsTextureTestUtil.getSamplerType(this.m_texture.getRefTexture().getFormat());
	console.log('Sampler');
	console.log(renderParams.samplerType)
	renderParams.sampler		= new tcuTexture.Sampler(tcuTexture.WrapMode.CLAMP_TO_EDGE, tcuTexture.WrapMode.CLAMP_TO_EDGE, tcuTexture.WrapMode.CLAMP_TO_EDGE,
	 tcuTexture.FilterMode.NEAREST, tcuTexture.FilterMode.NEAREST);
	console.log(renderParams.sampler);
	renderParams.colorScale		= spec.lookupScale;
	renderParams.colorBias		= spec.lookupBias;

	var texCoord = glsTextureTestUtil.computeQuadTexCoord2D([0, 0], [1, 1]);

	// log << TestLog::Message << "Texture parameters:"
	// 						<< "\n  WRAP_S = " << glu::getTextureParameterValueStr(GL_TEXTURE_WRAP_S, wrapS)
	// 						<< "\n  WRAP_T = " << glu::getTextureParameterValueStr(GL_TEXTURE_WRAP_T, wrapT)
	// 						<< "\n  MIN_FILTER = " << glu::getTextureParameterValueStr(GL_TEXTURE_MIN_FILTER, minFilter)
	// 						<< "\n  MAG_FILTER = " << glu::getTextureParameterValueStr(GL_TEXTURE_MAG_FILTER, magFilter)
	// 	<< TestLog::EndMessage;

	// Setup base viewport.
	console.log(viewport);
	gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

	// Bind to unit 0.
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.m_texture.getGLTexture());

	// Setup nearest neighbor filtering and clamp-to-edge.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);

	GLU_EXPECT_NO_ERROR(gl.getError(), "Set texturing state");

	// // Draw.
	this.m_renderer.renderQuad(0, texCoord, renderParams);
	GLU_EXPECT_NO_ERROR(gl.getError(), "Render");
	gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, renderedFrame.getAccess().getDataPtr());

	GLU_EXPECT_NO_ERROR(gl.getError(), "glReadPixels()");


	// // Compute reference.
	glsTextureTestUtil.sampleTexture2D(new glsTextureTestUtil.SurfaceAccess(referenceFrame, undefined /*m_renderCtx.getRenderTarget().getPixelFormat()*/),
		this.m_texture.getRefTexture(), texCoord, renderParams);

	// Compare and log.
	var isOk = glsTextureTestUtil.compareImages(referenceFrame, renderedFrame, threshold);

	assertMsgOptions(isOk, testDescription(), true, true);
	return deqpTests.runner.IterateResult.STOP;
};

var CompressedCubeFormatCase = function(descriptor){
	this.m_format = descriptor.format;
	this.m_dataType = descriptor.dataType;
	this.m_width = descriptor.width;
	this.m_height = descriptor.height;
	this.m_renderer = new glsTextureTestUtil.TextureRenderer(version, gluShaderUtil.precision.PRECISION_HIGHP);
	this.m_curFace = 0;
	this.m_isOk = true;
	DE_ASSERT(this.m_width == this.m_height);
};

CompressedCubeFormatCase.prototype.init = function() {
	var compressed = new tcuCompressedTexture.CompressedTexture(this.m_format, this.m_width, this.m_height);
	var rand = new deRandom.Random(0);
	for (var i = 0; i < compressed.m_data.length; i++) {
		compressed.m_data[i] = rand.getInt(0, 255);
	}
	this.m_texture = gluTexture.compressedCubeFromInternalFormat(gl, this.m_format, this.m_width, compressed);
};

CompressedCubeFormatCase.prototype.testFace = function(face) {
	/* TODO: Implement */	

	var viewport	= new glsTextureTestUtil.RandomViewport(canvas, this.m_width, this.m_height/*, deStringHash(getName())*/);

	/* tcu::Surface	 */	var	renderedFrame	= new tcuSurface.Surface(viewport.width, viewport.height);
	/* tcu::Surface	 */	var	referenceFrame	= new tcuSurface.Surface(viewport.width, viewport.height);
	/* TODO: Implement
	// tcu::RGBA				threshold			= m_renderCtx.getRenderTarget().getPixelFormat().getColorThreshold() + tcu::RGBA(1,1,1,1);
	*/
	var threshold = [3, 3, 3, 3];
	var renderParams = new glsTextureTestUtil.ReferenceParams(glsTextureTestUtil.textureType.TEXTURETYPE_CUBE);

	/* @const */ var			wrapS				= gl.CLAMP_TO_EDGE;
	/* @const */ var			wrapT				= gl.CLAMP_TO_EDGE;
	/* @const */ var			minFilter			= gl.NEAREST;
	/* @const */ var			magFilter			= gl.NEAREST;

	renderParams.flags.log_programs = true;
	renderParams.flags.log_uniforms = true;

	renderParams.samplerType	= glsTextureTestUtil.getSamplerType(this.m_texture.getRefTexture().getFormat());
	console.log('Sampler');
	console.log(renderParams.samplerType)
	renderParams.sampler		= new tcuTexture.Sampler(tcuTexture.WrapMode.CLAMP_TO_EDGE, tcuTexture.WrapMode.CLAMP_TO_EDGE, tcuTexture.WrapMode.CLAMP_TO_EDGE,
	 tcuTexture.FilterMode.NEAREST, tcuTexture.FilterMode.NEAREST);
	console.log(renderParams.sampler);

	// Log render info on first face.
	if (face === tcuTexture.CubeFace.CUBEFACE_NEGATIVE_X) {
		renderParams.flags.log_programs = true;
		renderParams.flags.log_uniforms = true;
	}

	var texCoord = glsTextureTestUtil.computeQuadTexCoordCube(face);

	// log << TestLog::Message << "Texture parameters:"
	// 						<< "\n  WRAP_S = " << glu::getTextureParameterValueStr(GL_TEXTURE_WRAP_S, wrapS)
	// 						<< "\n  WRAP_T = " << glu::getTextureParameterValueStr(GL_TEXTURE_WRAP_T, wrapT)
	// 						<< "\n  MIN_FILTER = " << glu::getTextureParameterValueStr(GL_TEXTURE_MIN_FILTER, minFilter)
	// 						<< "\n  MAG_FILTER = " << glu::getTextureParameterValueStr(GL_TEXTURE_MAG_FILTER, magFilter)
	// 	<< TestLog::EndMessage;

	// Setup base viewport.
	console.log(viewport);
	gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

	// Bind to unit 0.
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.m_texture.getGLTexture());

	// Setup nearest neighbor filtering and clamp-to-edge.
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, wrapS);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, wrapT);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, minFilter);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, magFilter);

	GLU_EXPECT_NO_ERROR(gl.getError(), "Set texturing state");

	// // Draw.
	this.m_renderer.renderQuad(0, texCoord, renderParams);
	gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, renderedFrame.getAccess().getDataPtr());

	GLU_EXPECT_NO_ERROR(gl.getError(), "glReadPixels()");

	// // Compute reference.
	glsTextureTestUtil.sampleTextureCube(new glsTextureTestUtil.SurfaceAccess(referenceFrame, undefined /*m_renderCtx.getRenderTarget().getPixelFormat()*/),
		this.m_texture.getRefTexture(), texCoord, renderParams);

	// Compare and log.
	var isOk = glsTextureTestUtil.compareImages(referenceFrame, renderedFrame, threshold);

	assertMsgOptions(isOk, 'Face: ' + this.m_curFace + ' ' + testDescription(), true, true);
	return isOk;
};

CompressedCubeFormatCase.prototype.iterate = function() {
	debug('Testing face ' + this.m_curFace);
	// Execute test for all faces.
	if (!this.testFace(this.m_curFace))
		this.m_isOk = false;

	this.m_curFace += 1;

	if (this.m_curFace == tcuTexture.CubeFace.TOTAL_FACES)
		return deqpTests.runner.IterateResult.STOP;
	else
		return deqpTests.runner.IterateResult.CONTINUE;
};

var genTestCases = function(filter) {
	var state = deqpTests.runner.getState();
	state.filter = filter;
	state.testCases = deqpTests.newTest(state.testName, 'Top level');
	var unsizedGroup = deqpTests.newTest('unsized', 'Unsized formats');
	var sizedGroup	= deqpTests.newTest("sized",		"Sized formats");
	var sized2DGroup	= deqpTests.newTest("2d",		"Sized formats (2D)");
	var sizedCubeGroup	= deqpTests.newTest("cube",		"Sized formats (Cubemap)");
	var sized2DArrayGroup	= deqpTests.newTest("2d_array",		"Sized formats (2D Array)");
	var sized3DGroup	= deqpTests.newTest("3d",		"Sized formats (3D)");
	var compressedGroup	= deqpTests.newTest("compressed",	"Compressed formats");

	sizedGroup.addChild(sized2DGroup);
	sizedGroup.addChild(sizedCubeGroup);
	sizedGroup.addChild(sized2DArrayGroup);
	sizedGroup.addChild(sized3DGroup);

	var texFormats = [
		[ "alpha",							gl.ALPHA,			gl.UNSIGNED_BYTE ],
		[ "luminance",						gl.LUMINANCE,		gl.UNSIGNED_BYTE ],
		[ "luminance_alpha",				gl.LUMINANCE_ALPHA,	gl.UNSIGNED_BYTE ],
		[ "rgb_unsigned_short_5_6_5",		gl.RGB,				gl.UNSIGNED_SHORT_5_6_5 ],
		[ "rgb_unsigned_byte",				gl.RGB,				gl.UNSIGNED_BYTE ],
		[ "rgba_unsigned_short_4_4_4_4",	gl.RGBA,			gl.UNSIGNED_SHORT_4_4_4_4 ],
		[ "rgba_unsigned_short_5_5_5_1",	gl.RGBA,			gl.UNSIGNED_SHORT_5_5_5_1 ],
		[ "rgba_unsigned_byte",				gl.RGBA,			gl.UNSIGNED_BYTE ]
	];
	texFormats.forEach(function(elem)	{
		var	format			= elem[1];
		var	dataType		= elem[2];
		var	nameBase		= elem[0];
		var	descriptionBase	= gluStrUtil.getPixelFormatName(format) + ", " + gluStrUtil.getTypeName(dataType);
		unsizedGroup.addChild(deqpTests.newTest(nameBase + '_2d_pot',
												descriptionBase + ' gl.TEXTURE_2D',
												new Texture2DFormatCase({
														format: format,
														dataType: dataType,
														width: 128,
														height: 128,
													})
		));
		unsizedGroup.addChild(deqpTests.newTest(nameBase + '_2d_npot',
												descriptionBase + ' gl.TEXTURE_2D',
												new Texture2DFormatCase({
														format: format,
														dataType: dataType,
														width: 63,
														height: 112,
													})
		));
		unsizedGroup.addChild(deqpTests.newTest(nameBase + '_cube_pot',
												descriptionBase + ' gl.TEXTURE_CUBE_MAP',
												new TextureCubeFormatCase({
														format: format,
														dataType: dataType,
														width: 64,
														height: 64,
													})
		));
		unsizedGroup.addChild(deqpTests.newTest(nameBase + '_cube_npot',
												descriptionBase + ' gl.TEXTURE_CUBE_MAP',
												new TextureCubeFormatCase({
														format: format,
														dataType: dataType,
														width: 57,
														height: 57,
													})
		));
		unsizedGroup.addChild(deqpTests.newTest(nameBase + '_2d_array_pot',
												descriptionBase + ' gl.TEXTURE_2D_ARRAY',
												new Texture2DArrayFormatCase({
														format: format,
														dataType: dataType,
														width: 64,
														height: 64,
														numLayers: 8 
													})
		));
		unsizedGroup.addChild(deqpTests.newTest(nameBase + '_2d_array_npot',
												descriptionBase + ' gl.TEXTURE_2D_ARRAY',
												new Texture2DArrayFormatCase({
														format: format,
														dataType: dataType,
														width: 63,
														height: 57,
														numLayers: 7
													})
		));
		unsizedGroup.addChild(deqpTests.newTest(nameBase + '_3d_pot',
												descriptionBase + ' gl.TEXTURE_3D',
												new Texture3DFormatCase({
														format: format,
														dataType: dataType,
														width: 8,
														height: 32,
														depth: 16,
													})
		));
		unsizedGroup.addChild(deqpTests.newTest(nameBase + '_3d_npot',
												descriptionBase + ' gl.TEXTURE_3D',
												new Texture3DFormatCase({
														format: format,
														dataType: dataType,
														width: 11,
														height: 31,
														depth: 7
													})
		));
	});

	var sizedColorFormats = [
		[ "rgba32f",			gl.RGBA32F,			],
		[ "rgba32i",			gl.RGBA32I,			],
		[ "rgba32ui",			gl.RGBA32UI,		],
		[ "rgba16f",			gl.RGBA16F,			],
		[ "rgba16i",			gl.RGBA16I,			],
		[ "rgba16ui",			gl.RGBA16UI,		],
		[ "rgba8",				gl.RGBA8,			],
		[ "rgba8i",				gl.RGBA8I,			],
		[ "rgba8ui",			gl.RGBA8UI,			],
		[ "srgb8_alpha8",		gl.SRGB8_ALPHA8,	],
		[ "rgb10_a2",			gl.RGB10_A2,		],
		[ "rgb10_a2ui",			gl.RGB10_A2UI,		],
		[ "rgba4",				gl.RGBA4,			],
		[ "rgb5_a1",			gl.RGB5_A1,			],
		[ "rgba8_snorm",		gl.RGBA8_SNORM,		],
		[ "rgb8",				gl.RGB8,			],
		[ "rgb565",				gl.RGB565,			],
		[ "r11f_g11f_b10f",		gl.R11F_G11F_B10F,	],
		[ "rgb32f",				gl.RGB32F,			],
		[ "rgb32i",				gl.RGB32I,			],
		[ "rgb32ui",			gl.RGB32UI,			],
		[ "rgb16f",				gl.RGB16F,			],
		[ "rgb16i",				gl.RGB16I,			],
		[ "rgb16ui",			gl.RGB16UI,			],
		[ "rgb8_snorm",			gl.RGB8_SNORM,		],
		[ "rgb8i",				gl.RGB8I,			],
		[ "rgb8ui",				gl.RGB8UI,			],
		[ "srgb8",				gl.SRGB8,			],
		[ "rgb9_e5",			gl.RGB9_E5,			],
		[ "rg32f",				gl.RG32F,			],
		[ "rg32i",				gl.RG32I,			],
		[ "rg32ui",				gl.RG32UI,			],
		[ "rg16f",				gl.RG16F,			],
		[ "rg16i",				gl.RG16I,			],
		[ "rg16ui",				gl.RG16UI,			],
		[ "rg8",				gl.RG8,				],
		[ "rg8i",				gl.RG8I,			],
		[ "rg8ui",				gl.RG8UI,			],
		[ "rg8_snorm",			gl.RG8_SNORM,		],
		[ "r32f",				gl.R32F,			],
		[ "r32i",				gl.R32I,			],
		[ "r32ui",				gl.R32UI,			],
		[ "r16f",				gl.R16F,			],
		[ "r16i",				gl.R16I,			],
		[ "r16ui",				gl.R16UI,			],
		[ "r8",					gl.R8,				],
		[ "r8i",				gl.R8I,				],
		[ "r8ui",				gl.R8UI,			],
		[ "r8_snorm",			gl.R8_SNORM,		]
	];

	sizedColorFormats.forEach(function(elem) {
		var internalFormat = elem[1];
		var nameBase = elem[0];
		var descriptionBase = gluStrUtil.getPixelFormatName(internalFormat);
		sized2DGroup.addChild(deqpTests.newTest(nameBase + '_pot',
												descriptionBase + ' gl.TEXTURE_2D',
												new Texture2DFormatCase({
														format: internalFormat,
														width: 128,
														height: 128,
													})
		));
		sized2DGroup.addChild(deqpTests.newTest(nameBase + '_npot',
												descriptionBase + ' gl.TEXTURE_2D',
												new Texture2DFormatCase({
														format: internalFormat,
														width: 63,
														height: 112,
													})
		));
		sizedCubeGroup.addChild(deqpTests.newTest(nameBase + '_pot',
												descriptionBase + ' gl.TEXTURE_CUBE_MAP',
												new TextureCubeFormatCase({
														format: internalFormat,
														width: 64,
														height: 64,
													})
		));
		sizedCubeGroup.addChild(deqpTests.newTest(nameBase + '_npot',
												descriptionBase + ' gl.TEXTURE_CUBE_MAP',
												new TextureCubeFormatCase({
														format: internalFormat,
														width: 57,
														height: 57,
													})
		));
		sized2DArrayGroup.addChild(deqpTests.newTest(nameBase + '_pot',
												descriptionBase + ' gl.TEXTURE_2D_ARRAY',
												new Texture2DArrayFormatCase({
														format: internalFormat,
														width: 64,
														height: 64,
														numLayers: 8 
													})
		));
		sized2DArrayGroup.addChild(deqpTests.newTest(nameBase + '_npot',
												descriptionBase + ' gl.TEXTURE_2D_ARRAY',
												new Texture2DArrayFormatCase({
														format: internalFormat,
														width: 63,
														height: 57,
														numLayers: 7
													})
		));
		sized3DGroup.addChild(deqpTests.newTest(nameBase + '_pot',
												descriptionBase + ' gl.TEXTURE_3D',
												new Texture3DFormatCase({
														format: internalFormat,
														width: 8,
														height: 32,
														depth: 16,
													})
		));
		sized3DGroup.addChild(deqpTests.newTest(nameBase + '_npot',
												descriptionBase + ' gl.TEXTURE_3D',
												new Texture3DFormatCase({
														format: internalFormat,
														width: 11,
														height: 31,
														depth: 7
													})
		));
	});

	var sizedDepthStencilFormats = [
		// Depth and stencil formats
		[ "depth_component32f",	gl.DEPTH_COMPONENT32F	],
		[ "depth_component24",	gl.DEPTH_COMPONENT24	],
		[ "depth_component16",	gl.DEPTH_COMPONENT16	],
		[ "depth32f_stencil8",	gl.DEPTH32F_STENCIL8	],
		[ "depth24_stencil8",	gl.DEPTH24_STENCIL8		]
	];
	sizedDepthStencilFormats.forEach(function(elem) {
		var internalFormat = elem[1];
		var nameBase = elem[0];
		var descriptionBase = gluStrUtil.getPixelFormatName(internalFormat);
		sized2DGroup.addChild(deqpTests.newTest(nameBase + '_pot',
												descriptionBase + ' gl.TEXTURE_2D',
												new Texture2DFormatCase({
														format: internalFormat,
														width: 128,
														height: 128,
													})
		));
		sized2DGroup.addChild(deqpTests.newTest(nameBase + '_npot',
												descriptionBase + ' gl.TEXTURE_2D',
												new Texture2DFormatCase({
														format: internalFormat,
														width: 63,
														height: 112,
													})
		));
		sizedCubeGroup.addChild(deqpTests.newTest(nameBase + '_pot',
												descriptionBase + ' gl.TEXTURE_CUBE_MAP',
												new TextureCubeFormatCase({
														format: internalFormat,
														width: 64,
														height: 64,
													})
		));
		sizedCubeGroup.addChild(deqpTests.newTest(nameBase + '_npot',
												descriptionBase + ' gl.TEXTURE_CUBE_MAP',
												new TextureCubeFormatCase({
														format: internalFormat,
														width: 57,
														height: 57,
													})
		));
		sized2DArrayGroup.addChild(deqpTests.newTest(nameBase + '_pot',
												descriptionBase + ' gl.TEXTURE_2D_ARRAY',
												new Texture2DArrayFormatCase({
														format: internalFormat,
														width: 64,
														height: 64,
														numLayers: 8 
													})
		));
		sized2DArrayGroup.addChild(deqpTests.newTest(nameBase + '_npot',
												descriptionBase + ' gl.TEXTURE_2D_ARRAY',
												new Texture2DArrayFormatCase({
														format: internalFormat,
														width: 63,
														height: 57,
														numLayers: 7
													})
		));
	});

	var etc2Formats = [
		[ "GL_COMPRESSED_R11_EAC",							"eac_r11",							tcuCompressedTexture.Format.EAC_R11						],
		[ "GL_COMPRESSED_SIGNED_R11_EAC",					"eac_signed_r11",					tcuCompressedTexture.Format.EAC_SIGNED_R11					],
		[ "GL_COMPRESSED_RG11_EAC",							"eac_rg11",							tcuCompressedTexture.Format.EAC_RG11						],
		[ "GL_COMPRESSED_SIGNED_RG11_EAC",					"eac_signed_rg11",					tcuCompressedTexture.Format.EAC_SIGNED_RG11				],
		[ "GL_COMPRESSED_RGB8_ETC2",						"etc2_rgb8",						tcuCompressedTexture.Format.ETC2_RGB8					],
		[ "GL_COMPRESSED_SRGB8_ETC2",						"etc2_srgb8",						tcuCompressedTexture.Format.ETC2_SRGB8					],
		[ "GL_COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2",	"etc2_rgb8_punchthrough_alpha1",	tcuCompressedTexture.Format.ETC2_RGB8_PUNCHTHROUGH_ALPHA1	],
		[ "GL_COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2",	"etc2_srgb8_punchthrough_alpha1",	tcuCompressedTexture.Format.ETC2_SRGB8_PUNCHTHROUGH_ALPHA1	],
		[ "GL_COMPRESSED_RGBA8_ETC2_EAC",					"etc2_eac_rgba8",					tcuCompressedTexture.Format.ETC2_EAC_RGBA8				],
		[ "GL_COMPRESSED_SRGB8_ALPHA8_ETC2_EAC",			"etc2_eac_srgb8_alpha8",			tcuCompressedTexture.Format.ETC2_EAC_SRGB8_ALPHA8			]
	];
	etc2Formats.forEach(function(elem)	{
		var nameBase = elem[1];
		var descriptionBase = elem[0];
		var format = elem[2];
		compressedGroup.addChild(deqpTests.newTest(nameBase + '_2d_pot', descriptionBase+ ', GL_TEXTURE_2D',
											new Compressed2DFormatCase({
												format: format,
												width: 128,
												height: 64,
											})
								));
		compressedGroup.addChild(deqpTests.newTest(nameBase + '_cube_pot', descriptionBase+ ', GL_TEXTURE_CUBE_MAP',
											new Compressed2DFormatCase({
												format: format,
												width: 64,
												height: 64,
											})
								));
		compressedGroup.addChild(deqpTests.newTest(nameBase + '_2d_pot', descriptionBase+ ', GL_TEXTURE_2D',
											new Compressed2DFormatCase({
												format: format,
												width: 128,
												height: 64,
											})
								));
		compressedGroup.addChild(deqpTests.newTest(nameBase + '_cube_npot', descriptionBase+ ', GL_TEXTURE_CUBE_MAP',
											new Compressed2DFormatCase({
												format: format,
												width: 51,
												height: 51,
											})
								));
	});

	state.testCases.addChild(unsizedGroup);
	state.testCases.addChild(sizedGroup);
	state.testCases.addChild(compressedGroup);
}

/**
 * Create and execute the test cases
 * @param {string} filter Optional filter
 */
var run = function(filter) {
	try {
    	genTestCases(filter);
    	deqpTests.runner.runCallback(deqpTests.runTestCases);
    } catch (err) {
    	bufferedLogToConsole(err);
    	deqpTests.runner.terminate();
    }

};

return {
    run: run
};

});