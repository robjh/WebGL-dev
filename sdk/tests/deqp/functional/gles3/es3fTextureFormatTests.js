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
define(['framework/opengl/gluShaderUtil', 'framework/common/tcuTestCase', 'framework/common/tcuSurface',  'framework/opengl/gluTexture', 'framework/opengl/gluTextureUtil', 'framework/common/tcuTexture', 'modules/shared/glsTextureTestUtil', 'framework/common/tcuTextureUtil'],
	 function(gluShaderUtil, deqpTests, tcuSurface, gluTexture, gluTextureUtil, tcuTexture, glsTextureTestUtil, tcuTextureUtil) {
    'use strict';

var	GLU_EXPECT_NO_ERROR = function(error, message) {
	assertMsgOptions(error === gl.NONE, message, false, true);
};


var Texture2DFormatCase = function(name, description, descriptor){
	this.m_name = name;
	this.m_description = description;
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
	
	/* TODO: remove the block below */
	if (0) {
		var data = this.m_texture.getRefTexture().getLevel(0).m_data;
			var a = this.m_texture.getRefTexture().getLevel(0);
		for (var y = 0; y < this.m_height; y++) {
			for (var x = 0; x < this.m_width; x++) {
				var color = [x / this.m_width, y / this.m_height , 0.5];
				a.setPixel(color, x, y);
			}
		}
				    var print565 = function(pixel) {
		    	var out = '(' + pixel[0] * 31 + ',' + pixel[1] * 63 + ',' + pixel[2] * 31 + ')';
		    	return out;
		    }

		for (var y = 0; y < this.m_height; y++) {
			for (var x = 0; x < this.m_width; x++) {
				var pixel = a.getPixel(x, y);
		    		var output = '(' + x + ',' + y + '): '
		    		output += print565(pixel);
		    		// console.log(output);
			}
		}
	}

};

Texture2DFormatCase.prototype.deinit = function() {
	/* TODO: Implement */
};

Texture2DFormatCase.prototype.iterate = function() {
	/* TODO: Implement */	

	// var viewport	= new glsTextureTestUtil.RandomViewport(canvas, this.m_width, this.m_height/*, deStringHash(getName())*/);
	var viewport	= new glsTextureTestUtil.RandomViewport(canvas, 200, 200/*, deStringHash(getName())*/);

	/* tcu::Surface	 */	var	renderedFrame	= new tcuSurface.Surface(viewport.width, viewport.height);
	/* tcu::Surface	 */	var	referenceFrame	= new tcuSurface.Surface(viewport.width, viewport.height);
	/* TODO: Implement
	// tcu::RGBA				threshold			= m_renderCtx.getRenderTarget().getPixelFormat().getColorThreshold() + tcu::RGBA(1,1,1,1);
	*/
	var threshold = [3, 3, 3, 3];
	var renderParams = new glsTextureTestUtil.ReferenceParams(glsTextureTestUtil.textureType.TEXTURETYPE_2D);

	// tcu::TextureFormatInfo	spec				= tcu::getTextureFormatInfo(m_texture->getRefTexture().getFormat());
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
	// renderParams.colorScale		= spec.lookupScale;
	// renderParams.colorBias		= spec.lookupBias;

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
				// p[1] = 0;
				// referenceFrame.setPixel(x, y, p);
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

	assertMsgOptions(isOk, 'Image comparison', true, true);
};

var Texture2DCubeFormatCase = function(name, description, descriptor){
	this.m_name = name;
	this.m_description = description;
	this.m_format = descriptor.format;
	this.m_dataType = descriptor.dataType;
	this.m_width = descriptor.width;
	this.m_height = descriptor.height;
	this.m_renderer = new glsTextureTestUtil.TextureRenderer("100 es", gluShaderUtil.precision.PRECISION_HIGHP);
	DE_ASSERT(this.m_width == this.m_height);
};

Texture2DCubeFormatCase.prototype.init = function() {
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
			  ? gluTexture.construccubeFromFormattFromFormat(gl, this.m_format, this.m_dataType, this.m_width)	// Implicit internal format.
			  : gluTexture.cubeFromInternalFormat(gl, this.m_format, this.m_width);				// Explicit internal format.

	// Fill level 0.
	for (var i = 0; i < tcuTexture.CubeFace.length; i++)
	{
		var face = tcuTexture.CubeFace[i];
		var gMin = null;
		var gMax = null;

		switch (face)
		{
			case 0: gMin = spec.valueMin.swizzle(0, 1, 2, 3); gMax = spec.valueMax.swizzle(0, 1, 2, 3); break;
			case 1: gMin = spec.valueMin.swizzle(2, 1, 0, 3); gMax = spec.valueMax.swizzle(2, 1, 0, 3); break;
			case 2: gMin = spec.valueMin.swizzle(1, 2, 0, 3); gMax = spec.valueMax.swizzle(1, 2, 0, 3); break;
			case 3: gMin = spec.valueMax.swizzle(0, 1, 2, 3); gMax = spec.valueMin.swizzle(0, 1, 2, 3); break;
			case 4: gMin = spec.valueMax.swizzle(2, 1, 0, 3); gMax = spec.valueMin.swizzle(2, 1, 0, 3); break;
			case 5: gMin = spec.valueMax.swizzle(1, 2, 0, 3); gMax = spec.valueMin.swizzle(1, 2, 0, 3); break;
			default:
				DE_ASSERT(false);
		}

		this.m_texture.getRefTexture().allocLevel(face, 0);
		tcuTextureUtil.fillWithComponentGradients(this.m_texture.getRefTexture().getLevelFace(0, face), gMin, gMax);
	
	}	/* TODO: remove the block below */
};

var init = function(filter) {
	var test = new Texture2DFormatCase('Test', 'description', {
		format: gl.RGB565,
		width: 128,
		height: 128,
	});
	console.log(test);
	test.init();
	test.iterate();
};
    /**
     * Create and execute the test cases
     * @param {string} filter Optional filter
     */
    var run = function(filter) {
    	try {
        	init(filter);
        } catch (err) {
        	console.log(err);
        	bufferedLogToConsole(err);
        }
        deqpTests.runner.terminate();
        
    };

    return {
        run: run
    };
});