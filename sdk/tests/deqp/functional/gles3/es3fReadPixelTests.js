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

'use strict';
goog.provide('functional.gles3.es3fReadPixelTests');
goog.require('framework.common.tcuTestCase');
goog.require('framework.common.tcuTexture');
goog.require('framework.delibs.debase.deString');
goog.require('framework.opengl.gluTextureUtil');

goog.scope(function() {
	var es3fReadPixelTests = functional.gles3.es3fReadPixelTests;
    var tcuTestCase = framework.common.tcuTestCase;
    var tcuTexture = framework.common.tcuTexture;
	var deString = framework.delibs.debase.deString;
	var gluTextureUtil = framework.opengl.gluTextureUtil;

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
	 * @param  {string} name
	 * @param  {string} description
	 * @param  {boolean} chooseFormat
	 * @param  {number} alignment
	 * @param  {number} rowLength
	 * @param  {number} skipRows
	 * @param  {number} skipPixels
	 * @param  {number=} format
	 * @param  {number=} type
	 */
	es3fReadPixelTests.ReadPixelsTest = function(name, description, chooseFormat, alignment, rowLength, skipRows, skipPixels, format, type) {
		tcuTestCase.DeqpTest.call(this, name, description);

		if (format === undefined) format = gl.RGBA;
		if (type === undefined) format = gl.UNSIGNED_BYTE;

		/** @type {number} */ this.m_seed = deString.deStringHash(name);
		/** @type {boolean} */ this.m_chooseFormat = chooseFormat;
		/** @type {number} */ this.m_alignment = alignment;
		/** @type {number} */ this.m_rowLength = rowLength;
		/** @type {number} */ this.m_skipRows = skipRows;
		/** @type {number} */ this.m_skipPixels = skipPixels;
		/** @type {number} */ this.m_format = format;
		/** @type {number} */ this.m_type = type;

		/** @const {number} */ this.m_width = 13;
		/** @const {number} */ this.m_height = 13;
	};

	es3fReadPixelTests.ReadPixelsTest.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
	es3fReadPixelTests.ReadPixelsTest.prototype.constructor = es3fReadPixelTests.ReadPixelsTest;

	/**
	 * @param  {tcuTexture.Texture2D} reference
	 */
	es3fReadPixelTests.ReadPixelsTest.prototype.render = function(reference) {
		// Create program
		/** @type {string} */ var vertexSource = "#version 300 es\n" +
			"in mediump vec2 i_coord;\n" +
			"void main (void)\n" +
			"{\n" +
			"\tgl_Position = vec4(i_coord, 0.0, 1.0);\n" +
			"}\n";

		/** @type {string} */ var fragmentSource = "#version 300 es\n";

		if (reference.getFormat().type === tcuTexture.ChannelType.SIGNED_INT32)
			fragmentSource += "layout(location = 0) out mediump ivec4 o_color;\n";
		else if (reference.getFormat().type === tcuTexture.ChannelType.UNSIGNED_INT32)
			fragmentSource += "layout(location = 0) out mediump uvec4 o_color;\n";
		else
			fragmentSource += "layout(location = 0) out mediump vec4 o_color;\n";

		fragmentSource += "void main (void)\n" +
			"{\n";

		if (reference.getFormat().type === tcuTexture.ChannelType.UNSIGNED_INT32)
			fragmentSource += "\to_color = uvec4(0, 0, 0, 1000);\n";
		else if (reference.getFormat().type === tcuTexture.ChannelType.SIGNED_INT32)
			fragmentSource += "\to_color = ivec4(0, 0, 0, 1000);\n";
		else
			fragmentSource += "\to_color = vec4(0.0, 0.0, 0.0, 1.0);\n";

		fragmentSource += "}\n";

		/** @type {gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl, gluShaderProgram.makeVtxFragSources(vertexSource, fragmentSource));

		assertMsgOptions(program.isOk(), "Program failed", false, true););

		// Render
		/** @type {Array<number>} */ var coords = [
			-0.5, -0.5,
			0.5, -0.5,
			0.5, 0.5,

			0.5, 0.5,
			-0.5, 0.5,
			-0.5, -0.5
		];
		/** @type {number} */ var coordLoc;

		coordLoc = gl.getAttribLocation(program.getProgram(), 'i_coord');

		gl.enableVertexAttribArray(coordLoc);

		/** @type {WebGLBuffer} */ var coordsGLBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, coordsGLBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
		gl.vertexAttribPointer(coordLoc, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
		gl.disableVertexAttribArray(coordLoc);

		// Render reference

		/** @type {number} */ var coordX1 = Math.floor((-0.5 * reference.getWidth() / 2.0) + reference.getWidth() / 2.0);
		/** @type {number} */ var coordY1 = Math.floor((-0.5 * reference.getHeight() / 2.0) + reference.getHeight() / 2.0);
		/** @type {number} */ var coordX2 = Math.floor(( 0.5 * reference.getWidth() / 2.0) + reference.getWidth() / 2.0);
		/** @type {number} */ var coordY2 = Math.floor(( 0.5 * reference.getHeight() / 2.0) + reference.getHeight() / 2.0);

		for (var x = 0; x < reference.getWidth(); x++) {
			if (x < coordX1 || x > coordX2)
				continue;

			for (var y = 0; y < reference.getHeight(); y++) {
				if (y >= coordY1 && y <= coordY2) {
					if (reference.getFormat().type === tcuTexture.ChannelType.SIGNED_INT32)
						reference.getLevel(0).setPixel([0, 0, 0, 1000], x, y);
					else if (reference.getFormat().type === tcuTexture.ChannelType.UNSIGNED_INT32)
						reference.getLevel(0).setPixel([0, 0, 0, 1000], x, y);
					else
						reference.getLevel(0).setPixel([0.0, 0.0, 0.0, 1.0], x, y);
				}
			}
		}
	};

	/**
	 * @return {{format: tcuTexture.TextureFormat, pixelSize: number, align: boolean}}
	 */
	es3fReadPixelTests.ReadPixelsTest.prototype.getFormatInfo = function() {
		if (this.m_chooseFormat) {
			this.m_format = /** @type {number} */ (gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_FORMAT));
			this.m_type = /** @type {number} */ (gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_TYPE));
		}

		/** @type {tcuTexture.TextureFormat} */ var fmt = gluTextureUtil.mapGLTransferFormat(this.m_format, this.m_type);
		/** @type {boolean} */ var align_;
		switch (this.m_type) {
			case gl.BYTE:
			case gl.UNSIGNED_BYTE:
			case gl.SHORT:
			case gl.UNSIGNED_SHORT:
			case gl.INT:
			case gl.UNSIGNED_INT:
			case gl.FLOAT:
			case gl.HALF_FLOAT:
				align_ = true;
				break;

			case gl.UNSIGNED_SHORT_5_6_5:
			case gl.UNSIGNED_SHORT_4_4_4_4:
			case gl.UNSIGNED_SHORT_5_5_5_1:
			case gl.UNSIGNED_INT_2_10_10_10_REV:
			case gl.UNSIGNED_INT_10F_11F_11F_REV:
			case gl.UNSIGNED_INT_24_8:
			case gl.FLOAT_32_UNSIGNED_INT_24_8_REV:
			case gl.UNSIGNED_INT_5_9_9_9_REV:
				align_ = false;
				break;

			default:
				throw new Error("Unsupported format");
		}

		/** @type {number} */ var pxSize = fmt.getPixelSize();

		return {format: fmt, pixelSize: pxSize, align: align_};
	};

	// continue @ line 235
	es3fReadPixelTests.ReadPixelsTest.prototype.clearColor = function() {};
	es3fReadPixelTests.ReadPixelsTest.prototype.iterate = function() {};

    /**
    * @constructor
    * @extends {tcuTestCase.DeqpTest}
    */
    es3fReadPixelTests.ReadPixelTests = function() {
        tcuTestCase.DeqpTest.call(this, 'read_pixels', 'ReadPixel tests');
    };

    es3fReadPixelTests.ReadPixelTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fReadPixelTests.ReadPixelTests.prototype.constructor = es3fReadPixelTests.ReadPixelTests;

    es3fReadPixelTests.ReadPixelTests.prototype.init = function() {
		/** @type {tcuTestCase.DeqpTest} */ var groupAlignment = tcuTestCase.newTest('alignment', 'Read pixels pack alignment parameter tests');

		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_ubyte_1', '', false, 1, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE));
		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_ubyte_2', '', false, 2, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE));
		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_ubyte_4', '', false, 4, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE));
		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_ubyte_8', '', false, 8, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE));

		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_int_1', '', false, 1, 0, 0, 0, gl.RGBA_INTEGER, gl.INT));
		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_int_2', '', false, 2, 0, 0, 0, gl.RGBA_INTEGER, gl.INT));
		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_int_4', '', false, 4, 0, 0, 0, gl.RGBA_INTEGER, gl.INT));
		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_int_8', '', false, 8, 0, 0, 0, gl.RGBA_INTEGER, gl.INT));

		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_uint_1', '', false, 1, 0, 0, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT));
		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_uint_2', '', false, 2, 0, 0, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT));
		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_uint_4', '', false, 4, 0, 0, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT));
		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_uint_8', '', false, 8, 0, 0, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT));

		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('choose_1', '', true, 1, 0, 0, 0));
		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('choose_2', '', true, 2, 0, 0, 0));
		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('choose_4', '', true, 4, 0, 0, 0));
		groupAlignment.addChild(new es3fReadPixelTests.ReadPixelsTest('choose_8', '', true, 8, 0, 0, 0));

		this.addChild(groupAlignment);

		/** @type {tcuTestCase.DeqpTest} */ var groupRowLength = tcuTestCase.newTest('rowlength', 'Read pixels rowlength test');
		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_ubyte_17', '', false, 4, 17, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE));
		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_ubyte_19', '', false, 4, 19, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE));
		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_ubyte_23', '', false, 4, 23, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE));
		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_ubyte_29', '', false, 4, 29, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE));

		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_int_17', '', false, 4, 17, 0, 0, gl.RGBA_INTEGER, gl.INT));
		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_int_19', '', false, 4, 19, 0, 0, gl.RGBA_INTEGER, gl.INT));
		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_int_23', '', false, 4, 23, 0, 0, gl.RGBA_INTEGER, gl.INT));
		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_int_29', '', false, 4, 29, 0, 0, gl.RGBA_INTEGER, gl.INT));

		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_uint_17', '', false, 4, 17, 0, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT));
		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_uint_19', '', false, 4, 19, 0, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT));
		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_uint_23', '', false, 4, 23, 0, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT));
		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_uint_29', '', false, 4, 29, 0, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT));

		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('choose_17', '', true, 4, 17, 0, 0));
		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('choose_19', '', true, 4, 19, 0, 0));
		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('choose_23', '', true, 4, 23, 0, 0));
		groupRowLength.addChild(new es3fReadPixelTests.ReadPixelsTest('choose_29', '', true, 4, 29, 0, 0));

		this.addChild(groupRowLength);

		/** @type {tcuTestCase.DeqpTest} */ var groupSkip = tcuTestCase.newTest('skip', 'Read pixels skip pixels and rows test');
		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_ubyte_0_3', '', false, 4, 17, 0, 3, gl.RGBA, gl.UNSIGNED_BYTE));
		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_ubyte_3_0', '', false, 4, 17, 3, 0, gl.RGBA, gl.UNSIGNED_BYTE));
		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_ubyte_3_3', '', false, 4, 17, 3, 3, gl.RGBA, gl.UNSIGNED_BYTE));
		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_ubyte_3_5', '', false, 4, 17, 3, 5, gl.RGBA, gl.UNSIGNED_BYTE));

		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_int_0_3', '', false, 4, 17, 0, 3, gl.RGBA_INTEGER, gl.INT));
		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_int_3_0', '', false, 4, 17, 3, 0, gl.RGBA_INTEGER, gl.INT));
		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_int_3_3', '', false, 4, 17, 3, 3, gl.RGBA_INTEGER, gl.INT));
		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_int_3_5', '', false, 4, 17, 3, 5, gl.RGBA_INTEGER, gl.INT));

		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_uint_0_3', '', false, 4, 17, 0, 3, gl.RGBA_INTEGER, gl.UNSIGNED_INT));
		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_uint_3_0', '', false, 4, 17, 3, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT));
		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_uint_3_3', '', false, 4, 17, 3, 3, gl.RGBA_INTEGER, gl.UNSIGNED_INT));
		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('rgba_uint_3_5', '', false, 4, 17, 3, 5, gl.RGBA_INTEGER, gl.UNSIGNED_INT));

		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('choose_0_3', '', true, 4, 17, 0, 3));
		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('choose_3_0', '', true, 4, 17, 3, 0));
		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('choose_3_3', '', true, 4, 17, 3, 3));
		groupSkip.addChild(new es3fReadPixelTests.ReadPixelsTest('choose_3_5', '', true, 4, 17, 3, 5));

		this.addChild(groupSkip);
    };

    /**
    * Run test
    * @param {WebGL2RenderingContext} context
    */
    es3fReadPixelTests.run = function(context) {
    	gl = context;
    	//Set up Test Root parameters
    	var state = tcuTestCase.runner;
    	state.setRoot(new es3fReadPixelTests.ReadPixelTests());

    	//Set up name and description of this test series.
    	setCurrentTestName(state.testCases.fullName());
    	description(state.testCases.getDescription());

    	try {
    		//Run test cases
    		tcuTestCase.runTestCases();
    	}
    	catch (err) {
    		testFailedOptions('Failed to es3fReadPixelTests.run tests', false);
    		tcuTestCase.runner.terminate();
    	}
    };

});
