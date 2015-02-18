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
define(['framework/opengl/gluShaderUtil', 'framework/common/tcuTestCase', 'framework/common/tcuSurface',  'framework/opengl/gluTexture', 'framework/opengl/gluTextureUtil', 'framework/common/tcuTexture', 'modules/shared/glsTextureTestUtil', 'framework/common/tcuTextureUtil', 'framework/opengl/gluStrUtil'],
	 function(gluShaderUtil, deqpTests, tcuSurface, gluTexture, gluTextureUtil, tcuTexture, glsTextureTestUtil, tcuTextureUtil, gluStrUtil) {
    'use strict';

var	GLU_EXPECT_NO_ERROR = function(error, message) {
	assertMsgOptions(error === gl.NONE, message, false, true);
};

var DE_ASSERT = function(x) {
	if (!x)
		throw new Error('Assert failed');
};

var testDescription = function() {
	var test = deqpTests.runner.getState().currentTest;
	return test.name + ' ' + test.description;
};

var Texture2DFormatCase = function(descriptor){
	this.m_format = descriptor.format;
	this.m_dataType = descriptor.dataType;
	this.m_width = descriptor.width;
	this.m_height = descriptor.height;
	this.m_renderer = new glsTextureTestUtil.TextureRenderer("100 es", gluShaderUtil.precision.PRECISION_HIGHP);
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
	console.log(tcuTexture.Sampler);
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
	if (0) {
		var p = new Uint8Array(4 * viewport.width * viewport.height);
		gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, p);
		GLU_EXPECT_NO_ERROR(gl.getError(), "glReadPixels()");
		console.log('Dumping array length: ' + p.length);
		console.log(p);
		for (var y = 0; y < viewport.height; y+=18) {
			for (var x = 0; x < viewport.width; x+=18) {
				var offset = 4 * (x + y * viewport.width);
				// p[1] = 0;
				// referenceFrame.setPixel(x, y, p);
	    		var output = '(' + x + ',' + y + ') = (' + p[offset + 0] + ',' + p[offset +1] + ',' + p[offset + 2] +')';
	    		console.log(output);
			}
		}

	}
	gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, renderedFrame.getAccess().getDataPtr());

	GLU_EXPECT_NO_ERROR(gl.getError(), "glReadPixels()");

	if (1) {
		console.log('Dumping array length: ' + renderedFrame.getAccess().getDataPtr().length);
		console.log(renderedFrame.getAccess().getDataPtr());
		console.log(renderedFrame.getAccess());
		for (var y = 0; y < renderedFrame.getHeight(); y+=37) {
			for (var x = 0; x < renderedFrame.getWidth(); x+=37) {
				var p = renderedFrame.getPixel(x, y);
	    		var output = '(' + x + ',' + y + ') = (' + p[0] + ',' + p[1] + ',' + p[2] +')';
	    		console.log(output);
			}
		}
	}

	// // Compute reference.
	glsTextureTestUtil.sampleTexture2D(new glsTextureTestUtil.SurfaceAccess(referenceFrame, undefined /*m_renderCtx.getRenderTarget().getPixelFormat()*/),
		this.m_texture.getRefTexture(), texCoord, renderParams);

	if (0) {
		for (var y = 0; y < referenceFrame.getHeight(); y+=37) {
			for (var x = 0; x < referenceFrame.getWidth(); x+=37) {
				var p = referenceFrame.getPixel(x, y);
				p[1] += 4;
				referenceFrame.setPixel(x, y, p);
	    		var output = '(' + x + ',' + y + ') = (' + p[0] + ',' + p[1] + ',' + p[2] +')';
	    		console.log(output);
			}
		}
	}

	// Compare and log.
	var isOk = glsTextureTestUtil.compareImages(referenceFrame, renderedFrame, threshold);

	assertMsgOptions(isOk, testDescription(), true, true);
	return true;
};

var TextureCubeFormatCase = function(descriptor){
	this.m_format = descriptor.format;
	this.m_dataType = descriptor.dataType;
	this.m_width = descriptor.width;
	this.m_height = descriptor.height;
	this.m_renderer = new glsTextureTestUtil.TextureRenderer("100 es", gluShaderUtil.precision.PRECISION_HIGHP);
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
			case 0: gMin = spec.valueMin.swizzle([0, 1, 2, 3]); gMax = spec.valueMax.swizzle([0, 1, 2, 3]); break;
			case 1: gMin = spec.valueMin.swizzle([2, 1, 0, 3]); gMax = spec.valueMax.swizzle([2, 1, 0, 3]); break;
			case 2: gMin = spec.valueMin.swizzle([1, 2, 0, 3]); gMax = spec.valueMax.swizzle([1, 2, 0, 3]); break;
			case 3: gMin = spec.valueMax.swizzle([0, 1, 2, 3]); gMax = spec.valueMin.swizzle([0, 1, 2, 3]); break;
			case 4: gMin = spec.valueMax.swizzle([2, 1, 0, 3]); gMax = spec.valueMin.swizzle([2, 1, 0, 3]); break;
			case 5: gMin = spec.valueMax.swizzle([1, 2, 0, 3]); gMax = spec.valueMin.swizzle([1, 2, 0, 3]); break;
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

	// var viewport	= new glsTextureTestUtil.RandomViewport(canvas, this.m_width, this.m_height/*, deStringHash(getName())*/);
	var viewport	= new glsTextureTestUtil.RandomViewport(canvas, 200, 200/*, deStringHash(getName())*/);

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
	console.log(tcuTexture.Sampler);
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
	if (0) {
		var p = new Uint8Array(4 * viewport.width * viewport.height);
		gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, p);
		GLU_EXPECT_NO_ERROR(gl.getError(), "glReadPixels()");
		console.log('Dumping array length: ' + p.length);
		console.log(p);
		for (var y = 0; y < viewport.height; y+=18) {
			for (var x = 0; x < viewport.width; x+=18) {
				var offset = 4 * (x + y * viewport.width);
				// p[1] = 0;
				// referenceFrame.setPixel(x, y, p);
	    		var output = '(' + x + ',' + y + ') = (' + p[offset + 0] + ',' + p[offset +1] + ',' + p[offset + 2] +')';
	    		console.log(output);
			}
		}

	}
	gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, renderedFrame.getAccess().getDataPtr());

	GLU_EXPECT_NO_ERROR(gl.getError(), "glReadPixels()");

	if (1) {
		console.log('Dumping array length: ' + renderedFrame.getAccess().getDataPtr().length);
		console.log(renderedFrame.getAccess().getDataPtr());
		console.log(renderedFrame.getAccess());
		for (var y = 0; y < renderedFrame.getHeight(); y+=37) {
			for (var x = 0; x < renderedFrame.getWidth(); x+=37) {
				var p = renderedFrame.getPixel(x, y);
				// p[1] = 0;
				// referenceFrame.setPixel(x, y, p);
	    		var output = '(' + x + ',' + y + ') = (' + p[0] + ',' + p[1] + ',' + p[2] +')';
	    		console.log(output);
			}
		}
	}

	// // Compute reference.
	glsTextureTestUtil.sampleTextureCube(new glsTextureTestUtil.SurfaceAccess(referenceFrame, undefined /*m_renderCtx.getRenderTarget().getPixelFormat()*/),
		this.m_texture.getRefTexture(), texCoord, renderParams);

	if (1) {
		for (var y = 0; y < referenceFrame.getHeight(); y+=37) {
			for (var x = 0; x < referenceFrame.getWidth(); x+=37) {
				var p = referenceFrame.getPixel(x, y);
	    		var output = '(' + x + ',' + y + ') = (' + p[0] + ',' + p[1] + ',' + p[2] +')';
	    		console.log(output);
			}
		}
	}

	// Compare and log.
	var isOk = glsTextureTestUtil.compareImages(referenceFrame, renderedFrame, threshold);

	assertMsgOptions(isOk, 'Image comparison', true, true);
	return isOk;
};

TextureCubeFormatCase.prototype.iterate = function() {
	debug('Testing face ' + this.m_curFace);
	// Execute test for all faces.
	if (!this.testFace(this.m_curFace))
		this.m_isOk = false;

	this.m_curFace += 1;

	if (this.m_curFace == tcuTexture.CubeFace.TOTAL_FACES)
	{
		assertMsgOptions(this.m_isOk, 'Image comparison', true, true);
		return true;
	}
	else
		return false;
};

var Texture2DArrayFormatCase = function(descriptor){
	this.m_format = descriptor.format;
	this.m_dataType = descriptor.dataType;
	this.m_width = descriptor.width;
	this.m_height = descriptor.height;
	this.m_numLayers = descriptor.numLayers;
	this.m_renderer = new glsTextureTestUtil.TextureRenderer("100 es", gluShaderUtil.precision.PRECISION_HIGHP);
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

	// var viewport	= new glsTextureTestUtil.RandomViewport(canvas, this.m_width, this.m_height/*, deStringHash(getName())*/);
	var viewport	= new glsTextureTestUtil.RandomViewport(canvas, 200, 200/*, deStringHash(getName())*/);

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
	console.log(tcuTexture.Sampler);
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
	if (0) {
		var p = new Uint8Array(4 * viewport.width * viewport.height);
		gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, p);
		GLU_EXPECT_NO_ERROR(gl.getError(), "glReadPixels()");
		console.log('Dumping array length: ' + p.length);
		console.log(p);
		for (var y = 0; y < viewport.height; y+=18) {
			for (var x = 0; x < viewport.width; x+=18) {
				var offset = 4 * (x + y * viewport.width);
				// p[1] = 0;
				// referenceFrame.setPixel(x, y, p);
	    		var output = '(' + x + ',' + y + ') = (' + p[offset + 0] + ',' + p[offset +1] + ',' + p[offset + 2] +')';
	    		console.log(output);
			}
		}

	}
	gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, renderedFrame.getAccess().getDataPtr());

	GLU_EXPECT_NO_ERROR(gl.getError(), "glReadPixels()");

	if (1) {
		console.log('Dumping array length: ' + renderedFrame.getAccess().getDataPtr().length);
		console.log(renderedFrame.getAccess().getDataPtr());
		console.log(renderedFrame.getAccess());
		for (var y = 0; y < renderedFrame.getHeight(); y+=37) {
			for (var x = 0; x < renderedFrame.getWidth(); x+=37) {
				var p = renderedFrame.getPixel(x, y);
				// p[1] = 0;
				// referenceFrame.setPixel(x, y, p);
	    		var output = '(' + x + ',' + y + ') = (' + p[0] + ',' + p[1] + ',' + p[2] +')';
	    		console.log(output);
			}
		}
	}

	// // Compute reference.
	glsTextureTestUtil.sampleTexture2DArray(new glsTextureTestUtil.SurfaceAccess(referenceFrame, undefined /*m_renderCtx.getRenderTarget().getPixelFormat()*/),
		this.m_texture.getRefTexture(), texCoord, renderParams);

	if (1) {
		for (var y = 0; y < referenceFrame.getHeight(); y+=37) {
			for (var x = 0; x < referenceFrame.getWidth(); x+=37) {
				var p = referenceFrame.getPixel(x, y);
	    		var output = '(' + x + ',' + y + ') = (' + p[0] + ',' + p[1] + ',' + p[2] +')';
	    		console.log(output);
			}
		}
	}

	// Compare and log.
	var isOk = glsTextureTestUtil.compareImages(referenceFrame, renderedFrame, threshold);

	assertMsgOptions(isOk, 'Image comparison', true, true);
	return isOk;
};

Texture2DArrayFormatCase.prototype.iterate = function() {
	debug('Testing layer ' + this.m_curLayer);
	// Execute test for all layers.
	if (!this.testLayer(this.m_curLayer))
		this.m_isOk = false;

	this.m_curLayer += 1;

	if (this.m_curLayer == this.m_numLayers)
	{
		assertMsgOptions(this.m_isOk, 'Image comparison', true, true);
		return true;
	}
	else
		return false;
};

var Texture3DFormatCase = function(descriptor){
	this.m_format = descriptor.format;
	this.m_dataType = descriptor.dataType;
	this.m_width = descriptor.width;
	this.m_height = descriptor.height;
	this.m_depth = descriptor.depth;
	this.m_renderer = new glsTextureTestUtil.TextureRenderer("100 es", gluShaderUtil.precision.PRECISION_HIGHP);
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

	// var viewport	= new glsTextureTestUtil.RandomViewport(canvas, this.m_width, this.m_height/*, deStringHash(getName())*/);
	var viewport	= new glsTextureTestUtil.RandomViewport(canvas, 200, 200/*, deStringHash(getName())*/);

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
	console.log(tcuTexture.Sampler);
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
	if (0) {
		var p = new Uint8Array(4 * viewport.width * viewport.height);
		gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, p);
		GLU_EXPECT_NO_ERROR(gl.getError(), "glReadPixels()");
		console.log('Dumping array length: ' + p.length);
		console.log(p);
		for (var y = 0; y < viewport.height; y+=18) {
			for (var x = 0; x < viewport.width; x+=18) {
				var offset = 4 * (x + y * viewport.width);
				// p[1] = 0;
				// referenceFrame.setPixel(x, y, p);
	    		var output = '(' + x + ',' + y + ') = (' + p[offset + 0] + ',' + p[offset +1] + ',' + p[offset + 2] +')';
	    		console.log(output);
			}
		}

	}
	gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, renderedFrame.getAccess().getDataPtr());

	GLU_EXPECT_NO_ERROR(gl.getError(), "glReadPixels()");

	if (1) {
		console.log('Dumping array length: ' + renderedFrame.getAccess().getDataPtr().length);
		console.log(renderedFrame.getAccess().getDataPtr());
		console.log(renderedFrame.getAccess());
		for (var y = 0; y < renderedFrame.getHeight(); y+=37) {
			for (var x = 0; x < renderedFrame.getWidth(); x+=37) {
				var p = renderedFrame.getPixel(x, y);
				// p[1] = 0;
				// referenceFrame.setPixel(x, y, p);
	    		var output = '(' + x + ',' + y + ') = (' + p[0] + ',' + p[1] + ',' + p[2] +')';
	    		console.log(output);
			}
		}
	}

	// // Compute reference.
	glsTextureTestUtil.sampleTexture3D(new glsTextureTestUtil.SurfaceAccess(referenceFrame, undefined /*m_renderCtx.getRenderTarget().getPixelFormat()*/),
		this.m_texture.getRefTexture(), texCoord, renderParams);

	if (1) {
		for (var y = 0; y < referenceFrame.getHeight(); y+=37) {
			for (var x = 0; x < referenceFrame.getWidth(); x+=37) {
				var p = referenceFrame.getPixel(x, y);
	    		var output = '(' + x + ',' + y + ') = (' + p[0] + ',' + p[1] + ',' + p[2] +')';
	    		console.log(output);
			}
		}
	}

	// Compare and log.
	var isOk = glsTextureTestUtil.compareImages(referenceFrame, renderedFrame, threshold);

	assertMsgOptions(isOk, 'Image comparison', true, true);
	return isOk;
};

Texture3DFormatCase.prototype.iterate = function() {
	debug('Testing slice ' + this.m_curSlice);
	// Execute test for all layers.
	if (!this.testSlice(this.m_curSlice))
		this.m_isOk = false;

	this.m_curSlice += 1;

	if (this.m_curSlice >= this.m_depth)
	{
		assertMsgOptions(this.m_isOk, 'Image comparison', true, true);
		return true;
	}
	else
		return false;
};

var genTestCases = function(filter) {
	var state = deqpTests.runner.getState();
	state.filter = filter;
	state.testCases = deqpTests.newTest(state.testName, 'Top level');
	var unsizedGroup = deqpTests.newTest('unsized', 'Unsized formats');

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
	});

	state.testCases.addChild(unsizedGroup);
};

var runTestCases = function() {
/** @type {Object} */ var state = deqpTests.runner.getState();
    state.currentTest = state.testCases.next(state.filter);
    if (state.currentTest) {
    	try {
	    	debug("Running: " + state.currentTest.name + ' ' + state.currentTest.description);
	    	state.currentTest.spec.init();
	    	while(!state.currentTest.spec.iterate());
	    } catch(err) {
	    	bufferedLogToConsole(err);
	    	testFailed('Exception thrown');
	    };
	    deqpTests.runner.runCallback(runTestCases);
    } else
        deqpTests.runner.terminate();
};

/**
 * Create and execute the test cases
 * @param {string} filter Optional filter
 */
var run = function(filter) {
	try {
    	genTestCases(filter);
    	deqpTests.runner.runCallback(runTestCases);
    } catch (err) {
    	bufferedLogToConsole(err);
    	deqpTests.runner.terminate();
    }

};

return {
    run: run
};

});