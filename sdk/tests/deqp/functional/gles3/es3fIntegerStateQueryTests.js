/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL ES Utilities
 * ------------------------------------------------
 *
 * Copyright 2014 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

'use strict';
goog.provide('functional.gles3.es3fIntegerStateQueryTests');
goog.require('framework.common.tcuTestCase');
goog.require('framework.delibs.debase.deRandom');
goog.require('functional.gles3.es3fApiCase');
goog.require('modules.shared.glsStateQuery');

goog.scope(function() {
	var es3fIntegerStateQueryTests = functional.gles3.es3fIntegerStateQueryTests;
    var tcuTestCase = framework.common.tcuTestCase;
	var deRandom = framework.delibs.debase.deRandom;
	var es3fApiCase = functional.gles3.es3fApiCase;
	var glsStateQuery = modules.shared.glsStateQuery;

	// shaders (line 907)
	/** @type {string} */ var transformFeedbackTestVertSource = '' +
		"#version 300 es\n" +
		"void main (void)\n" +
		"{\n" +
		"	gl_Position = vec4(0.0);\n" +
		"}\n";

	/** @type {string} */ var transformFeedbackTestFragSource = '' +
		"#version 300 es\n" +
		"layout(location = 0) out mediump vec4 fragColor;" +
		"void main (void)\n" +
		"{\n" +
		"	fragColor = vec4(0.0);\n" +
		"}\n";

	/** @type {string} */ var testVertSource = '' +
		"#version 300 es\n" +
		"void main (void)\n" +
		"{\n" +
		"	gl_Position = vec4(0.0);\n" +
		"}\n";

	/** @type {string} */ var testFragSource = '' +
		"#version 300 es\n" +
		"layout(location = 0) out mediump vec4 fragColor;" +
		"void main (void)\n" +
		"{\n" +
		"	fragColor = vec4(0.0);\n" +
		"}\n";

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 */
	es3fIntegerStateQueryTests.TransformFeedbackTestCase = function(name, description) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
		/** @type {WebGLTransformFeedback} */ this.m_transformfeedback;
	};

	es3fIntegerStateQueryTests.TransformFeedbackTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.TransformFeedbackTestCase.prototype.constructor = es3fIntegerStateQueryTests.TransformFeedbackTestCase;

	es3fIntegerStateQueryTests.TransformFeedbackTestCase.prototype.testTransformFeedback = function() {
		throw new Error('This method should be implemented by child classes.');
	};

	es3fIntegerStateQueryTests.TransformFeedbackTestCase.prototype.test = function() {
		this.beforeTransformFeedbackTest(); // [dag] added this as there is no other way this method would be called.

		this.m_transformfeedback = gl.createTransformFeedback();

		/** @type {WebGLShader} */ var shaderVert = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(shaderVert, transformFeedbackTestVertSource);
		gl.compileShader(shaderVert);

		/** @type {boolean} */ var compileStatus = /** @type {boolean} */ (gl.getShaderParameter(shaderVert, gl.COMPILE_STATUS));
		glsStateQuery.compare(compileStatus, true);

		/** @type {WebGLShader} */ var shaderFrag = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(shaderFrag, transformFeedbackTestFragSource);
		gl.compileShader(shaderFrag);

		compileStatus = /** @type {boolean} */ (gl.getShaderParameter(shaderFrag, gl.COMPILE_STATUS));
		glsStateQuery.compare(compileStatus, true);

		/** @type {WebGLProgram} */ var shaderProg = gl.createProgram();
		gl.attachShader(shaderProg, shaderVert);
		gl.attachShader(shaderProg, shaderFrag);
		/** @type {Array<string>} */ var transform_feedback_outputs = ["gl_Position"];
		gl.transformFeedbackVaryings(shaderProg, transform_feedback_outputs, gl.INTERLEAVED_ATTRIBS);
		gl.linkProgram(shaderProg);

		/** @type {boolean} */ var linkStatus = /** @type {boolean} */ (gl.getProgramParameter(shaderProg, gl.LINK_STATUS));
		glsStateQuery.compare(linkStatus, true);

		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.m_transformfeedback);


		/** @type {WebGLBuffer} */ var feedbackBufferId = gl.createBuffer();
		gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, feedbackBufferId);
		gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, new Float32Array(16), gl.DYNAMIC_READ);
		gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, feedbackBufferId);

		gl.useProgram(shaderProg);

		this.testTransformFeedback();

		gl.useProgram(null);
		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
		gl.deleteTransformFeedback(this.m_transformfeedback);
		gl.deleteBuffer(feedbackBufferId);
		gl.deleteShader(shaderVert);
		gl.deleteShader(shaderFrag);
		gl.deleteProgram(shaderProg);

		this.afterTransformFeedbackTest(); // [dag] added this as there is no other way this method would be called.
	};

	/**
	 * @constructor
	 * @extends {es3fIntegerStateQueryTests.TransformFeedbackTestCase}
	 * @param {string} name
	 */
	es3fIntegerStateQueryTests.TransformFeedbackBindingTestCase = function(name) {
		es3fIntegerStateQueryTests.TransformFeedbackTestCase.call(this, name, 'GL_TRANSFORM_FEEDBACK_BINDING');
	};

	es3fIntegerStateQueryTests.TransformFeedbackBindingTestCase.prototype = Object.create(es3fIntegerStateQueryTests.TransformFeedbackTestCase.prototype);
	es3fIntegerStateQueryTests.TransformFeedbackBindingTestCase.prototype.constructor = es3fIntegerStateQueryTests.TransformFeedbackBindingTestCase;


	es3fIntegerStateQueryTests.TransformFeedbackBindingTestCase.prototype.beforeTransformFeedbackTest = function() {
		this.check(glsStateQuery.verify(gl.TRANSFORM_FEEDBACK_BINDING, null), 'beforeTransformFeedbackTest');
	};

	es3fIntegerStateQueryTests.TransformFeedbackBindingTestCase.prototype.testTransformFeedback = function() {
		this.check(glsStateQuery.verify(gl.TRANSFORM_FEEDBACK_BINDING, this.m_transformfeedback), 'testTransformFeedback');
	};

	es3fIntegerStateQueryTests.TransformFeedbackBindingTestCase.prototype.afterTransformFeedbackTest = function() {
		this.check(glsStateQuery.verify(gl.TRANSFORM_FEEDBACK_BINDING, null), 'afterTransformFeedbackTest');
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 * @param {number} targetName
	 * @param {number} minValue
	 */
	es3fIntegerStateQueryTests.ConstantMinimumValueTestCase = function(name, description, targetName, minValue) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
		/** @type {number} */ this.m_targetName = targetName;
		/** @type {number} */ this.m_minValue = minValue;
	};

	es3fIntegerStateQueryTests.ConstantMinimumValueTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.ConstantMinimumValueTestCase.prototype.constructor = es3fIntegerStateQueryTests.ConstantMinimumValueTestCase;

	es3fIntegerStateQueryTests.ConstantMinimumValueTestCase.prototype.test = function() {
		this.check(glsStateQuery.verifyGreaterOrEqual(this.m_targetName, this.m_minValue), 'Fail');
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 * @param {number} targetName
	 * @param {number} minValue
	 */
	es3fIntegerStateQueryTests.ConstantMaximumValueTestCase = function(name, description, targetName, minValue) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
		/** @type {number} */ this.m_targetName = targetName;
		/** @type {number} */ this.m_minValue = minValue;
	};

	es3fIntegerStateQueryTests.ConstantMaximumValueTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.ConstantMaximumValueTestCase.prototype.constructor = es3fIntegerStateQueryTests.ConstantMaximumValueTestCase;

	es3fIntegerStateQueryTests.ConstantMaximumValueTestCase.prototype.test = function() {
		this.check(glsStateQuery.verifyLessOrEqual(this.m_targetName, this.m_minValue), 'Fail');
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 */
	es3fIntegerStateQueryTests.SampleBuffersTestCase = function(name, description) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
	};

	es3fIntegerStateQueryTests.SampleBuffersTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.SampleBuffersTestCase.prototype.constructor = es3fIntegerStateQueryTests.SampleBuffersTestCase;

	es3fIntegerStateQueryTests.SampleBuffersTestCase.prototype.test = function() {
		/** @type {number} */ var expectedSampleBuffers = (/** @type {number} */ (gl.getParameter(gl.SAMPLES)) > 1) ? 1 : 0;

		bufferedLogToConsole("Sample count is " + expectedSampleBuffers + ", expecting GL_SAMPLE_BUFFERS to be " + expectedSampleBuffers);

		this.check(glsStateQuery.verify(gl.SAMPLE_BUFFERS, expectedSampleBuffers));
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 */
	es3fIntegerStateQueryTests.SamplesTestCase = function(name, description) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
	};

	es3fIntegerStateQueryTests.SamplesTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.SamplesTestCase.prototype.constructor = es3fIntegerStateQueryTests.SamplesTestCase;

	es3fIntegerStateQueryTests.SamplesTestCase.prototype.test = function() {
		/** @type {number} */ var numSamples = /** @type {number} */ (gl.getParameter(gl.SAMPLES));
		// MSAA?
		if (numSamples > 1) {
			bufferedLogToConsole("Sample count is " + numSamples);

			this.check(glsStateQuery.verify(gl.SAMPLES, numSamples));
		} else {
			/** @type {Array<number>} */ var validSamples = [0, 1];

			bufferedLogToConsole("Expecting GL_SAMPLES to be 0 or 1");

			this.check(glsStateQuery.verifyAnyOf(gl.SAMPLES, validSamples));
		}
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 * @param {number} targetName
	 */
	es3fIntegerStateQueryTests.HintTestCase = function(name, description, targetName) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
		/** @type {number} */ this.m_targetName = targetName;
	};

	es3fIntegerStateQueryTests.HintTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.HintTestCase.prototype.constructor = es3fIntegerStateQueryTests.HintTestCase;

	es3fIntegerStateQueryTests.HintTestCase.prototype.test = function() {
		this.check(glsStateQuery.verify(this.m_targetName, gl.DONT_CARE));

		gl.hint(this.m_targetName, gl.NICEST);
		this.check(glsStateQuery.verify(this.m_targetName, gl.NICEST));

		gl.hint(this.m_targetName, gl.FASTEST);
		this.check(glsStateQuery.verify(this.m_targetName, gl.FASTEST));

		gl.hint(this.m_targetName, gl.DONT_CARE);
		this.check(glsStateQuery.verify(this.m_targetName, gl.DONT_CARE));
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 */
	es3fIntegerStateQueryTests.DepthFuncTestCase = function(name, description) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
	};

	es3fIntegerStateQueryTests.DepthFuncTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.DepthFuncTestCase.prototype.constructor = es3fIntegerStateQueryTests.DepthFuncTestCase;

	es3fIntegerStateQueryTests.DepthFuncTestCase.prototype.test = function() {
		this.check(glsStateQuery.verify(gl.DEPTH_FUNC, gl.LESS));

		/** @type {Array<number>} */ var depthFunctions = [gl.NEVER, gl.ALWAYS, gl.LESS, gl.LEQUAL, gl.EQUAL, gl.GREATER, gl.GEQUAL, gl.NOTEQUAL];
		for (var ndx = 0; ndx < depthFunctions.length; ndx++) {
			gl.depthFunc(depthFunctions[ndx]);

			this.check(glsStateQuery.verify(gl.DEPTH_FUNC, depthFunctions[ndx]));
		}
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 */
	es3fIntegerStateQueryTests.CullFaceTestCase = function(name, description) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
	};

	es3fIntegerStateQueryTests.CullFaceTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.CullFaceTestCase.prototype.constructor = es3fIntegerStateQueryTests.CullFaceTestCase;

	es3fIntegerStateQueryTests.CullFaceTestCase.prototype.test = function() {
		this.check(glsStateQuery.verify(gl.CULL_FACE_MODE, gl.BACK));

		/** @type {Array<number>} */ var cullFaces = [gl.FRONT, gl.BACK, gl.FRONT_AND_BACK];
		for (var ndx = 0; ndx < cullFaces.length; ndx++) {
			gl.cullFace(cullFaces[ndx]);

			this.check(glsStateQuery.verify(gl.CULL_FACE_MODE, cullFaces[ndx]));
		}
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 */
	es3fIntegerStateQueryTests.FrontFaceTestCase = function(name, description) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
	};

	es3fIntegerStateQueryTests.FrontFaceTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.FrontFaceTestCase.prototype.constructor = es3fIntegerStateQueryTests.FrontFaceTestCase;

	es3fIntegerStateQueryTests.FrontFaceTestCase.prototype.test = function() {
		this.check(glsStateQuery.verify(gl.FRONT_FACE, gl.CCW));

		/** @type {Array<number>} */ var frontFaces = [gl.CW, gl.CCW];
		for (var ndx = 0; ndx < frontFaces.length; ndx++) {
			gl.frontFace(frontFaces[ndx]);

			this.check(glsStateQuery.verify(gl.FRONT_FACE, frontFaces[ndx]));
		}
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 */
	es3fIntegerStateQueryTests.ViewPortTestCase = function(name, description) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
	};

	es3fIntegerStateQueryTests.ViewPortTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.ViewPortTestCase.prototype.constructor = es3fIntegerStateQueryTests.ViewPortTestCase;

	es3fIntegerStateQueryTests.ViewPortTestCase.prototype.test = function() {
		/** @type {deRandom.Random} */ var rnd = new deRandom.Random(0xabcdef);

		/** @type {Array<number>} */ var maxViewportDimensions = /** @type {Array<number>} */ (gl.getParameter(gl.MAX_VIEWPORT_DIMS));

		// verify initial value of first two values
		this.check(glsStateQuery.verify(gl.VIEWPORT, new Int32Array([0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight])));

		/** @type {number} */ var numIterations = 120;
		for (var i = 0; i < numIterations; ++i) {
			/** @type {number} */ var x = rnd.getInt(-64000, 64000);
			/** @type {number} */ var y = rnd.getInt(-64000, 64000);
			/** @type {number} */ var width = rnd.getInt(0, maxViewportDimensions[0]);
			/** @type {number} */ var height = rnd.getInt(0, maxViewportDimensions[1]);

			gl.viewport(x, y, width, height);
			this.check(glsStateQuery.verify(gl.VIEWPORT, new Int32Array([x, y, width, height])));
		}
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 */
	es3fIntegerStateQueryTests.ScissorBoxTestCase = function(name, description) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
	};

	es3fIntegerStateQueryTests.ScissorBoxTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.ScissorBoxTestCase.prototype.constructor = es3fIntegerStateQueryTests.ScissorBoxTestCase;

	es3fIntegerStateQueryTests.ScissorBoxTestCase.prototype.test = function() {
		/** @type {deRandom.Random} */ var rnd = new deRandom.Random(0xabcdef);

		// verify initial value of first two values
		// m_verifier->verifyInteger4Mask(gl.SCISSOR_BOX, 0, true, 0, true, 0, false, 0, false);
		this.check(glsStateQuery.verifyMask(gl.SCISSOR_BOX, [0, 0, 0, 0], [true, true, false, false])); // TODO: check this line

		/** @type {number} */ var numIterations = 120;
		for (var i = 0; i < numIterations; ++i) {
			/** @type {number} */ var left = rnd.getInt(-64000, 64000);
			/** @type {number} */ var bottom = rnd.getInt(-64000, 64000);
			/** @type {number} */ var width = rnd.getInt(0, 64000);
			/** @type {number} */ var height = rnd.getInt(0, 64000);

			gl.scissor(left, bottom, width, height);
			this.check(glsStateQuery.verify(gl.SCISSOR_BOX, new Int32Array([left, bottom, width, height])));
		}
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 */
	es3fIntegerStateQueryTests.MaxViewportDimsTestCase = function(name, description) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
	};

	es3fIntegerStateQueryTests.MaxViewportDimsTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.MaxViewportDimsTestCase.prototype.constructor = es3fIntegerStateQueryTests.MaxViewportDimsTestCase;

	es3fIntegerStateQueryTests.MaxViewportDimsTestCase.prototype.test = function() {
		this.check(glsStateQuery.verifyGreaterOrEqual(gl.MAX_VIEWPORT_DIMS, [gl.drawingBufferWidth, gl.drawingBufferHeight]));
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 * @param {number} testTargetName
	 */
	es3fIntegerStateQueryTests.StencilRefTestCase = function(name, description, testTargetName) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
		/** @type {number} */ this.m_testTargetName = testTargetName;
	};

	es3fIntegerStateQueryTests.StencilRefTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.StencilRefTestCase.prototype.constructor = es3fIntegerStateQueryTests.StencilRefTestCase;

	es3fIntegerStateQueryTests.StencilRefTestCase.prototype.test = function() {
		this.check(glsStateQuery.verify(this.m_testTargetName, 0));

		/** @type {number} */ var stencilBits = /** @type {number} */ (gl.getParameter(gl.STENCIL_BITS));

		for (var stencilBit = 0; stencilBit < stencilBits; ++stencilBit) {
			/** @type {number} */ var ref = 1 << stencilBit;

			gl.stencilFunc(gl.ALWAYS, ref, 0); // mask should not affect the REF

			this.check(glsStateQuery.verify(this.m_testTargetName, ref));

			gl.stencilFunc(gl.ALWAYS, ref, ref);

			this.check(glsStateQuery.verify(this.m_testTargetName, ref));
		}
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 * @param {number} testTargetName
	 * @param {number} stencilFuncTargetFace
	 */
	es3fIntegerStateQueryTests.StencilRefSeparateTestCase = function(name, description, testTargetName, stencilFuncTargetFace) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
		/** @type {number} */ this.m_testTargetName = testTargetName;
		/** @type {number} */ this.m_stencilFuncTargetFace = stencilFuncTargetFace;
	};

	es3fIntegerStateQueryTests.StencilRefSeparateTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.StencilRefSeparateTestCase.prototype.constructor = es3fIntegerStateQueryTests.StencilRefSeparateTestCase;

	es3fIntegerStateQueryTests.StencilRefSeparateTestCase.prototype.test = function() {
		this.check(glsStateQuery.verify(this.m_testTargetName, 0));

		/** @type {number} */ var stencilBits = /** @type {number} */ (gl.getParameter(gl.STENCIL_BITS));

		for (var stencilBit = 0; stencilBit < stencilBits; ++stencilBit) {
			/** @type {number} */ var ref = 1 << stencilBit;

			gl.stencilFuncSeparate(this.m_stencilFuncTargetFace, gl.ALWAYS, ref, 0);

			this.check(glsStateQuery.verify(this.m_testTargetName, ref));

			gl.stencilFuncSeparate(this.m_stencilFuncTargetFace, gl.ALWAYS, ref, ref);

			this.check(glsStateQuery.verify(this.m_testTargetName, ref));
		}
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 * @param {number} stencilOpName
	 */
	es3fIntegerStateQueryTests.StencilOpTestCase = function(name, description, stencilOpName) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
		/** @type {number} */ this.m_stencilOpName = stencilOpName;
	};

	es3fIntegerStateQueryTests.StencilOpTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.StencilOpTestCase.prototype.constructor = es3fIntegerStateQueryTests.StencilOpTestCase;

	es3fIntegerStateQueryTests.StencilOpTestCase.prototype.test = function() {
		this.check(glsStateQuery.verify(this.m_stencilOpName, gl.KEEP));

		/** @type {Array<number>} */ var stencilOpValues = [gl.KEEP, gl.ZERO, gl.REPLACE, gl.INCR, gl.DECR, gl.INVERT, gl.INCR_WRAP, gl.DECR_WRAP];

		for (var ndx = 0; ndx < stencilOpValues.length; ++ndx) {
			this.SetStencilOp(stencilOpValues[ndx]);

			this.check(glsStateQuery.verify(this.m_stencilOpName, stencilOpValues[ndx]));
		}
	};

	/**
	 * @param  {number} stencilOpValue
	 */
	es3fIntegerStateQueryTests.StencilOpTestCase.prototype.SetStencilOp = function(stencilOpValue) {
		switch (this.m_stencilOpName) {
			case gl.STENCIL_FAIL:
			case gl.STENCIL_BACK_FAIL:
				gl.stencilOp(stencilOpValue, gl.KEEP, gl.KEEP);
				break;

			case gl.STENCIL_PASS_DEPTH_FAIL:
			case gl.STENCIL_BACK_PASS_DEPTH_FAIL:
				gl.stencilOp(gl.KEEP, stencilOpValue, gl.KEEP);
				break;

			case gl.STENCIL_PASS_DEPTH_PASS:
			case gl.STENCIL_BACK_PASS_DEPTH_PASS:
				gl.stencilOp(gl.KEEP, gl.KEEP, stencilOpValue);
				break;

			default:
				throw new Error("should not happen");
		}
	};

	/**
	 * @constructor
	 * @extends {es3fIntegerStateQueryTests.StencilOpTestCase}
	 * @param {string} name
	 * @param {string} description
	 * @param {number} stencilOpName
	 * @param {number} stencilOpFace
	 */
	es3fIntegerStateQueryTests.StencilOpSeparateTestCase = function(name, description, stencilOpName, stencilOpFace) {
		es3fIntegerStateQueryTests.StencilOpTestCase.call(this, name, description, stencilOpName);
		/** @type {number} */ this.m_stencilOpName = stencilOpName;
		/** @type {number} */ this.m_stencilOpFace = stencilOpFace;
	};

	es3fIntegerStateQueryTests.StencilOpSeparateTestCase.prototype = Object.create(es3fIntegerStateQueryTests.StencilOpTestCase.prototype);
	es3fIntegerStateQueryTests.StencilOpSeparateTestCase.prototype.constructor = es3fIntegerStateQueryTests.StencilOpSeparateTestCase;

	es3fIntegerStateQueryTests.StencilOpSeparateTestCase.prototype.test = function() {};

	/**
	 * @param  {number} stencilOpValue
	 */
	es3fIntegerStateQueryTests.StencilOpSeparateTestCase.prototype.SetStencilOp = function(stencilOpValue) {
		switch (this.m_stencilOpName) {
			case gl.STENCIL_FAIL:
			case gl.STENCIL_BACK_FAIL:
				gl.stencilOpSeparate(this.m_stencilOpFace, stencilOpValue, gl.KEEP, gl.KEEP);
				break;

			case gl.STENCIL_PASS_DEPTH_FAIL:
			case gl.STENCIL_BACK_PASS_DEPTH_FAIL:
				gl.stencilOpSeparate(this.m_stencilOpFace, gl.KEEP, stencilOpValue, gl.KEEP);
				break;

			case gl.STENCIL_PASS_DEPTH_PASS:
			case gl.STENCIL_BACK_PASS_DEPTH_PASS:
				gl.stencilOpSeparate(this.m_stencilOpFace, gl.KEEP, gl.KEEP, stencilOpValue);
				break;

			default:
				throw new Error("should not happen");
		}
	};

	// line 1519

	// /**
	//  * @constructor
	//  * @extends {es3fApiCase.ApiCase}
	//  * @param {string} name
	//  * @param {string} description
	//  */
	// es3fIntegerStateQueryTests.ViewPortTestCase = function(name, description) {
	// 	es3fApiCase.ApiCase.call(this, name, description, gl);
	// };
	//
	// es3fIntegerStateQueryTests.ViewPortTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	// es3fIntegerStateQueryTests.ViewPortTestCase.prototype.constructor = es3fIntegerStateQueryTests.ViewPortTestCase;
	//
	// es3fIntegerStateQueryTests.ViewPortTestCase.prototype.test = function() {};
	//
	// /**
	//  * @constructor
	//  * @extends {es3fApiCase.ApiCase}
	//  * @param {string} name
	//  * @param {string} description
	//  */
	// es3fIntegerStateQueryTests.ViewPortTestCase = function(name, description) {
	// 	es3fApiCase.ApiCase.call(this, name, description, gl);
	// };
	//
	// es3fIntegerStateQueryTests.ViewPortTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	// es3fIntegerStateQueryTests.ViewPortTestCase.prototype.constructor = es3fIntegerStateQueryTests.ViewPortTestCase;
	//
	// es3fIntegerStateQueryTests.ViewPortTestCase.prototype.test = function() {};
	//
	// /**
	//  * @constructor
	//  * @extends {es3fApiCase.ApiCase}
	//  * @param {string} name
	//  * @param {string} description
	//  */
	// es3fIntegerStateQueryTests.ViewPortTestCase = function(name, description) {
	// 	es3fApiCase.ApiCase.call(this, name, description, gl);
	// };
	//
	// es3fIntegerStateQueryTests.ViewPortTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	// es3fIntegerStateQueryTests.ViewPortTestCase.prototype.constructor = es3fIntegerStateQueryTests.ViewPortTestCase;
	//
	// es3fIntegerStateQueryTests.ViewPortTestCase.prototype.test = function() {};
	//
	// /**
	//  * @constructor
	//  * @extends {es3fApiCase.ApiCase}
	//  * @param {string} name
	//  * @param {string} description
	//  */
	// es3fIntegerStateQueryTests.ViewPortTestCase = function(name, description) {
	// 	es3fApiCase.ApiCase.call(this, name, description, gl);
	// };
	//
	// es3fIntegerStateQueryTests.ViewPortTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	// es3fIntegerStateQueryTests.ViewPortTestCase.prototype.constructor = es3fIntegerStateQueryTests.ViewPortTestCase;
	//
	// es3fIntegerStateQueryTests.ViewPortTestCase.prototype.test = function() {};

    /**
    * @constructor
    * @extends {tcuTestCase.DeqpTest}
    */
    es3fIntegerStateQueryTests.IntegerStateQueryTests = function() {
        tcuTestCase.DeqpTest.call(this, "integers", "Integer Values");
    };

    es3fIntegerStateQueryTests.IntegerStateQueryTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fIntegerStateQueryTests.IntegerStateQueryTests.prototype.constructor = es3fIntegerStateQueryTests.IntegerStateQueryTests;

    es3fIntegerStateQueryTests.IntegerStateQueryTests.prototype.init = function() {


		/**
		 * @struct
		 * @constructor
		 * @param {string} name
		 * @param {string} description
		 * @param {number} targetName
		 * @param {number} value
		 */
		var LimitedStateInteger = function(name, description, targetName, value) {
			/** @type {string} */ this.name = name;
			/** @type {string} */ this.description = description;
			/** @type {number} */ this.targetName = targetName;
			/** @type {number} */ this.value = value;
		};

		/** @type {Array<LimitedStateInteger>} */ var implementationMinLimits = [
			new LimitedStateInteger("subpixel_bits", "SUBPIXEL_BITS has minimum value of 4", gl.SUBPIXEL_BITS, 4),
			new LimitedStateInteger("max_3d_texture_size", "MAX_3D_TEXTURE_SIZE has minimum value of 256", gl.MAX_3D_TEXTURE_SIZE, 256),
			new LimitedStateInteger("max_texture_size", "MAX_TEXTURE_SIZE has minimum value of 2048", gl.MAX_TEXTURE_SIZE, 2048),
			new LimitedStateInteger("max_array_texture_layers", "MAX_ARRAY_TEXTURE_LAYERS has minimum value of 256", gl.MAX_ARRAY_TEXTURE_LAYERS, 256),
			new LimitedStateInteger("max_cube_map_texture_size", "MAX_CUBE_MAP_TEXTURE_SIZE has minimum value of 2048", gl.MAX_CUBE_MAP_TEXTURE_SIZE, 2048),
			new LimitedStateInteger("max_renderbuffer_size", "MAX_RENDERBUFFER_SIZE has minimum value of 2048", gl.MAX_RENDERBUFFER_SIZE, 2048),
			new LimitedStateInteger("max_draw_buffers", "MAX_DRAW_BUFFERS has minimum value of 4", gl.MAX_DRAW_BUFFERS, 4),
			new LimitedStateInteger("max_color_attachments", "MAX_COLOR_ATTACHMENTS has minimum value of 4", gl.MAX_COLOR_ATTACHMENTS, 4),
			new LimitedStateInteger("max_elements_indices", "MAX_ELEMENTS_INDICES has minimum value of 0", gl.MAX_ELEMENTS_INDICES, 0),
			new LimitedStateInteger("max_elements_vertices", "MAX_ELEMENTS_VERTICES has minimum value of 0", gl.MAX_ELEMENTS_VERTICES, 0),
			// TODO: update for WebGL
			// new LimitedStateInteger("num_extensions", "NUM_EXTENSIONS has minimum value of 0", gl.NUM_EXTENSIONS, 0),
			// new LimitedStateInteger("major_version", "MAJOR_VERSION has minimum value of 3", gl.MAJOR_VERSION, 3),
			// new LimitedStateInteger("minor_version", "MINOR_VERSION has minimum value of 0", gl.MINOR_VERSION, 0),
			new LimitedStateInteger("max_vertex_attribs", "MAX_VERTEX_ATTRIBS has minimum value of 16", gl.MAX_VERTEX_ATTRIBS, 16),
			new LimitedStateInteger("max_vertex_uniform_components", "MAX_VERTEX_UNIFORM_COMPONENTS has minimum value of 1024", gl.MAX_VERTEX_UNIFORM_COMPONENTS, 1024),
			new LimitedStateInteger("max_vertex_uniform_vectors", "MAX_VERTEX_UNIFORM_VECTORS has minimum value of 256", gl.MAX_VERTEX_UNIFORM_VECTORS, 256),
			new LimitedStateInteger("max_vertex_uniform_blocks", "MAX_VERTEX_UNIFORM_BLOCKS has minimum value of 12", gl.MAX_VERTEX_UNIFORM_BLOCKS, 12),
			new LimitedStateInteger("max_vertex_output_components", "MAX_VERTEX_OUTPUT_COMPONENTS has minimum value of 64", gl.MAX_VERTEX_OUTPUT_COMPONENTS, 64),
			new LimitedStateInteger("max_vertex_texture_image_units", "MAX_VERTEX_TEXTURE_IMAGE_UNITS has minimum value of 16", gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS, 16),
			new LimitedStateInteger("max_fragment_uniform_components", "MAX_FRAGMENT_UNIFORM_COMPONENTS has minimum value of 896", gl.MAX_FRAGMENT_UNIFORM_COMPONENTS, 896),
			new LimitedStateInteger("max_fragment_uniform_vectors", "MAX_FRAGMENT_UNIFORM_VECTORS has minimum value of 224", gl.MAX_FRAGMENT_UNIFORM_VECTORS, 224),
			new LimitedStateInteger("max_fragment_uniform_blocks", "MAX_FRAGMENT_UNIFORM_BLOCKS has minimum value of 12", gl.MAX_FRAGMENT_UNIFORM_BLOCKS, 12),
			new LimitedStateInteger("max_fragment_input_components", "MAX_FRAGMENT_INPUT_COMPONENTS has minimum value of 60", gl.MAX_FRAGMENT_INPUT_COMPONENTS, 60),
			new LimitedStateInteger("max_texture_image_units", "MAX_TEXTURE_IMAGE_UNITS has minimum value of 16", gl.MAX_TEXTURE_IMAGE_UNITS, 16),
			new LimitedStateInteger("max_program_texel_offset", "MAX_PROGRAM_TEXEL_OFFSET has minimum value of 7", gl.MAX_PROGRAM_TEXEL_OFFSET, 7),
			new LimitedStateInteger("max_uniform_buffer_bindings", "MAX_UNIFORM_BUFFER_BINDINGS has minimum value of 24", gl.MAX_UNIFORM_BUFFER_BINDINGS, 24),
			new LimitedStateInteger("max_combined_uniform_blocks", "MAX_COMBINED_UNIFORM_BLOCKS has minimum value of 24", gl.MAX_COMBINED_UNIFORM_BLOCKS, 24),
			new LimitedStateInteger("max_varying_components", "MAX_VARYING_COMPONENTS has minimum value of 60", gl.MAX_VARYING_COMPONENTS, 60),
			new LimitedStateInteger("max_varying_vectors", "MAX_VARYING_VECTORS has minimum value of 15", gl.MAX_VARYING_VECTORS, 15),
			new LimitedStateInteger("max_combined_texture_image_units", "MAX_COMBINED_TEXTURE_IMAGE_UNITS has minimum value of 32", gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS, 32),
			new LimitedStateInteger("max_transform_feedback_interleaved_components", "MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS has minimum value of 64", gl.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS, 64),
			new LimitedStateInteger("max_transform_feedback_separate_attribs", "MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS has minimum value of 4", gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS, 4),
			new LimitedStateInteger("max_transform_feedback_separate_components", "MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS has minimum value of 4", gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS, 4),
			new LimitedStateInteger("max_samples", "MAX_SAMPLES has minimum value of 4", gl.MAX_SAMPLES, 4),
			new LimitedStateInteger("red_bits", "RED_BITS has minimum value of 0", gl.RED_BITS, 0),
			new LimitedStateInteger("green_bits", "GREEN_BITS has minimum value of 0", gl.GREEN_BITS, 0),
			new LimitedStateInteger("blue_bits", "BLUE_BITS has minimum value of 0", gl.BLUE_BITS, 0),
			new LimitedStateInteger("alpha_bits", "ALPHA_BITS has minimum value of 0", gl.ALPHA_BITS, 0),
			new LimitedStateInteger("depth_bits", "DEPTH_BITS has minimum value of 0", gl.DEPTH_BITS, 0),
			new LimitedStateInteger("stencil_bits", "STENCIL_BITS has minimum value of 0", gl.STENCIL_BITS, 0)
		];

		/** @type {Array<LimitedStateInteger>} */ var implementationMaxLimits = [
			new LimitedStateInteger("min_program_texel_offset", "MIN_PROGRAM_TEXEL_OFFSET has maximum value of -8", gl.MIN_PROGRAM_TEXEL_OFFSET, -8),
			new LimitedStateInteger("uniform_buffer_offset_alignment", "UNIFORM_BUFFER_OFFSET_ALIGNMENT has minimum value of 1", gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT, 256)
		];

		// \note implementation defined limits have their own tests so just check the conversions to boolean, int64 and float
		///** @type {Array<es3fIntegerStateQueryTests.StateVerifier>} */ var  implementationLimitVerifiers = [this.m_verifierBoolean, this.m_verifierInteger64, this.m_verifierFloat];

		var testCtx = this;

		// TODO: commenting until this is implemented
		for (var testNdx = 0; testNdx < implementationMinLimits.length; testNdx++)
			testCtx.addChild(new es3fIntegerStateQueryTests.ConstantMinimumValueTestCase(implementationMinLimits[testNdx].name, implementationMinLimits[testNdx].description, implementationMinLimits[testNdx].targetName, implementationMinLimits[testNdx].value));

		for (var testNdx = 0; testNdx < implementationMaxLimits.length; testNdx++)
			testCtx.addChild(new es3fIntegerStateQueryTests.ConstantMaximumValueTestCase(implementationMaxLimits[testNdx].name, implementationMaxLimits[testNdx].description, implementationMaxLimits[testNdx].targetName, implementationMaxLimits[testNdx].value));

		// /** @type {Array<es3fIntegerStateQueryTests.StateVerifier>} */ var  normalVerifiers = [this.m_verifierBoolean, this.m_verifierInteger, this.m_verifierInteger64, this.m_verifierFloat];
		testCtx.addChild(new es3fIntegerStateQueryTests.SampleBuffersTestCase("sample_buffers", "SAMPLE_BUFFERS"));
		//
		testCtx.addChild(new es3fIntegerStateQueryTests.SamplesTestCase("samples" , "SAMPLES"));
		testCtx.addChild(new es3fIntegerStateQueryTests.HintTestCase("generate_mipmap_hint", "GENERATE_MIPMAP_HINT", gl.GENERATE_MIPMAP_HINT));
		testCtx.addChild(new es3fIntegerStateQueryTests.HintTestCase("fragment_shader_derivative_hint", "FRAGMENT_SHADER_DERIVATIVE_HINT", gl.FRAGMENT_SHADER_DERIVATIVE_HINT));
		testCtx.addChild(new es3fIntegerStateQueryTests.DepthFuncTestCase("depth_func", "DEPTH_FUNC"));
		testCtx.addChild(new es3fIntegerStateQueryTests.CullFaceTestCase("cull_face_mode", "CULL_FACE_MODE"));
		testCtx.addChild(new es3fIntegerStateQueryTests.FrontFaceTestCase("front_face_mode", "FRONT_FACE"));
		testCtx.addChild(new es3fIntegerStateQueryTests.ViewPortTestCase("viewport", "VIEWPORT"));
		testCtx.addChild(new es3fIntegerStateQueryTests.ScissorBoxTestCase("scissor_box", "SCISSOR_BOX"));
		testCtx.addChild(new es3fIntegerStateQueryTests.MaxViewportDimsTestCase("max_viewport_dims", "MAX_VIEWPORT_DIMS"));
		testCtx.addChild(new es3fIntegerStateQueryTests.StencilRefTestCase("stencil_ref", "STENCIL_REF", gl.STENCIL_REF));
		testCtx.addChild(new es3fIntegerStateQueryTests.StencilRefTestCase("stencil_back_ref", "STENCIL_BACK_REF", gl.STENCIL_BACK_REF));
		testCtx.addChild(new es3fIntegerStateQueryTests.StencilRefSeparateTestCase("stencil_ref_separate", "STENCIL_REF (separate)", gl.STENCIL_REF, gl.FRONT));
		testCtx.addChild(new es3fIntegerStateQueryTests.StencilRefSeparateTestCase("stencil_ref_separate_both", "STENCIL_REF (separate)", gl.STENCIL_REF, gl.FRONT_AND_BACK));
		testCtx.addChild(new es3fIntegerStateQueryTests.StencilRefSeparateTestCase("stencil_back_ref_separate", "STENCIL_BACK_REF (separate)", gl.STENCIL_BACK_REF, gl.BACK));
		testCtx.addChild(new es3fIntegerStateQueryTests.StencilRefSeparateTestCase("stencil_back_ref_separate_both", "STENCIL_BACK_REF (separate)", gl.STENCIL_BACK_REF, gl.FRONT_AND_BACK));

		/**
		 * @struct
		 * @constructor
		 * @param {string} name
		 * @param {string} frontDescription
		 * @param {number} frontTarget
		 * @param {string} backDescription
		 * @param {number} backTarget
		 */
		 var NamedStencilOp = function(name, frontDescription, frontTarget, backDescription, backTarget) {
			/** @type {string} */ this.name = name;
    		/** @type {string} */ this.frontDescription = frontDescription;
    		/** @type {number} */ this.frontTarget = frontTarget;
    		/** @type {string} */ this.backDescription = backDescription;
    		/** @type {number} */ this.backTarget = backTarget;
		};

		/** @type {Array<NamedStencilOp>} */ var stencilOps = [
			new NamedStencilOp("fail", "STENCIL_FAIL", gl.STENCIL_FAIL, "STENCIL_BACK_FAIL", gl.STENCIL_BACK_FAIL),
			new NamedStencilOp("depth_fail", "STENCIL_PASS_DEPTH_FAIL", gl.STENCIL_PASS_DEPTH_FAIL, "STENCIL_BACK_PASS_DEPTH_FAIL", gl.STENCIL_BACK_PASS_DEPTH_FAIL),
			new NamedStencilOp("depth_pass", "STENCIL_PASS_DEPTH_PASS", gl.STENCIL_PASS_DEPTH_PASS, "STENCIL_BACK_PASS_DEPTH_PASS", gl.STENCIL_BACK_PASS_DEPTH_PASS)
		];

		for (var testNdx = 0; testNdx < stencilOps.length; testNdx++) {
			testCtx.addChild(new es3fIntegerStateQueryTests.StencilOpTestCase("stencil_" + stencilOps[testNdx].name, stencilOps[testNdx].frontDescription, stencilOps[testNdx].frontTarget));
			testCtx.addChild(new es3fIntegerStateQueryTests.StencilOpTestCase("stencil_back_" + stencilOps[testNdx].name, stencilOps[testNdx].backDescription, stencilOps[testNdx].backTarget));

			testCtx.addChild(new es3fIntegerStateQueryTests.StencilOpSeparateTestCase("stencil_" + stencilOps[testNdx].name + "_separate_both", stencilOps[testNdx].frontDescription, stencilOps[testNdx].frontTarget, gl.FRONT_AND_BACK));
			testCtx.addChild(new es3fIntegerStateQueryTests.StencilOpSeparateTestCase("stencil_back_" + stencilOps[testNdx].name + "_separate_both", stencilOps[testNdx].backDescription, stencilOps[testNdx].backTarget, gl.FRONT_AND_BACK));

			testCtx.addChild(new es3fIntegerStateQueryTests.StencilOpSeparateTestCase("stencil_" + stencilOps[testNdx].name + "_separate", stencilOps[testNdx].frontDescription, stencilOps[testNdx].frontTarget, gl.FRONT));
			testCtx.addChild(new es3fIntegerStateQueryTests.StencilOpSeparateTestCase("stencil_back_" + stencilOps[testNdx].name + "_separate", stencilOps[testNdx].backDescription, stencilOps[testNdx].backTarget, gl.BACK));
		}
		//
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilFuncTestCase(verifier, "stencil_func" + verifier.getTestNamePostfix(), "STENCIL_FUNC")); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilFuncSeparateTestCase(verifier, "stencil_func_separate" + verifier.getTestNamePostfix(), "STENCIL_FUNC (separate)", gl.STENCIL_FUNC, gl.FRONT)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilFuncSeparateTestCase(verifier, "stencil_func_separate_both" + verifier.getTestNamePostfix(), "STENCIL_FUNC (separate)", gl.STENCIL_FUNC, gl.FRONT_AND_BACK)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilFuncSeparateTestCase(verifier, "stencil_back_func_separate" + verifier.getTestNamePostfix(), "STENCIL_FUNC (separate)", gl.STENCIL_BACK_FUNC, gl.BACK)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilFuncSeparateTestCase(verifier, "stencil_back_func_separate_both" + verifier.getTestNamePostfix(), "STENCIL_FUNC (separate)", gl.STENCIL_BACK_FUNC, gl.FRONT_AND_BACK)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilMaskTestCase(verifier, "stencil_value_mask" + verifier.getTestNamePostfix(), "STENCIL_VALUE_MASK", gl.STENCIL_VALUE_MASK)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilMaskTestCase(verifier, "stencil_back_value_mask" + verifier.getTestNamePostfix(), "STENCIL_BACK_VALUE_MASK", gl.STENCIL_BACK_VALUE_MASK)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilMaskSeparateTestCase(verifier, "stencil_value_mask_separate" + verifier.getTestNamePostfix(), "STENCIL_VALUE_MASK (separate)", gl.STENCIL_VALUE_MASK, gl.FRONT)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilMaskSeparateTestCase(verifier, "stencil_value_mask_separate_both" + verifier.getTestNamePostfix(), "STENCIL_VALUE_MASK (separate)", gl.STENCIL_VALUE_MASK, gl.FRONT_AND_BACK)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilMaskSeparateTestCase(verifier, "stencil_back_value_mask_separate" + verifier.getTestNamePostfix(), "STENCIL_BACK_VALUE_MASK (separate)", gl.STENCIL_BACK_VALUE_MASK, gl.BACK)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilMaskSeparateTestCase(verifier, "stencil_back_value_mask_separate_both" + verifier.getTestNamePostfix(), "STENCIL_BACK_VALUE_MASK (separate)", gl.STENCIL_BACK_VALUE_MASK, gl.FRONT_AND_BACK)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilWriteMaskTestCase(verifier, "stencil_writemask" + verifier.getTestNamePostfix(), "STENCIL_WRITEMASK", gl.STENCIL_WRITEMASK)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilWriteMaskTestCase(verifier, "stencil_back_writemask" + verifier.getTestNamePostfix(), "STENCIL_BACK_WRITEMASK", gl.STENCIL_BACK_WRITEMASK)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilWriteMaskSeparateTestCase(verifier, "stencil_writemask_separate" + verifier.getTestNamePostfix(), "STENCIL_WRITEMASK (separate)", gl.STENCIL_WRITEMASK, gl.FRONT)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilWriteMaskSeparateTestCase(verifier, "stencil_writemask_separate_both" + verifier.getTestNamePostfix(), "STENCIL_WRITEMASK (separate)", gl.STENCIL_WRITEMASK, gl.FRONT_AND_BACK)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilWriteMaskSeparateTestCase(verifier, "stencil_back_writemask_separate" + verifier.getTestNamePostfix(), "STENCIL_BACK_WRITEMASK (separate)", gl.STENCIL_BACK_WRITEMASK, gl.BACK)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilWriteMaskSeparateTestCase(verifier, "stencil_back_writemask_separate_both" + verifier.getTestNamePostfix(), "STENCIL_BACK_WRITEMASK (separate)", gl.STENCIL_BACK_WRITEMASK, gl.FRONT_AND_BACK)); });
		//
		// /**
		//  * @struct
		//  * @constructor
		//  * @param {string} name
		//  * @param {string} description
		//  * @param {number} target
		//  * @param {number} initialValue
		//  */
		// PixelStoreState = function(name, description, target, initialValue) {
		//     /** @type {string} */ this.name = name;
		//     /** @type {string} */ this.description = description;
		//     /** @type {number} */ this.target = target;
		//     /** @type {number} */ this.initialValue = initialValue;
		// };
		//
		// /** @type {Array<PixelStoreState>} */ var pixelStoreStates = [
		// 	new PixelStoreState("unpack_image_height", "UNPACK_IMAGE_HEIGHT", gl.UNPACK_IMAGE_HEIGHT, 0),
		// 	new PixelStoreState("unpack_skip_images", "UNPACK_SKIP_IMAGES", gl.UNPACK_SKIP_IMAGES, 0),
		// 	new PixelStoreState("unpack_row_length", "UNPACK_ROW_LENGTH", gl.UNPACK_ROW_LENGTH, 0),
		// 	new PixelStoreState("unpack_skip_rows", "UNPACK_SKIP_ROWS", gl.UNPACK_SKIP_ROWS, 0),
		// 	new PixelStoreState("unpack_skip_pixels", "UNPACK_SKIP_PIXELS", gl.UNPACK_SKIP_PIXELS, 0),
		// 	new PixelStoreState("pack_row_length", "PACK_ROW_LENGTH", gl.PACK_ROW_LENGTH, 0),
		// 	new PixelStoreState("pack_skip_rows", "PACK_SKIP_ROWS", gl.PACK_SKIP_ROWS, 0),
		// 	new PixelStoreState("pack_skip_pixels", "PACK_SKIP_PIXELS", gl.PACK_SKIP_PIXELS, 0)
		// ];
		//
		// for (var testNdx = 0; testNdx < pixelStoreStates.length; testNdx++)
		// 	normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.PixelStoreTestCase(verifier, pixelStoreStates[testNdx].name + verifier.getTestNamePostfix(), pixelStoreStates[testNdx].description, pixelStoreStates[testNdx].target, pixelStoreStates[testNdx].initialValue)); });
		//
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.PixelStoreAlignTestCase(verifier, "unpack_alignment" + verifier.getTestNamePostfix(), "UNPACK_ALIGNMENT", gl.UNPACK_ALIGNMENT)); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.PixelStoreAlignTestCase(verifier, "pack_alignment" + verifier.getTestNamePostfix(), "PACK_ALIGNMENT", gl.PACK_ALIGNMENT)); });
		//
		// /**
		//  * @struct
		//  * @constructor
		//  * @param {string} name
		//  * @param {string} description
		//  * @param {number} target
		//  * @param {number} initialValue
		//  */
		// BlendColorState = function(name, description, target, initialValue) {
		//     /** @type {string} */ this.name = name;
		//     /** @type {string} */ this.description = description;
		//     /** @type {number} */ this.target = target;
		//     /** @type {number} */ this.initialValue = initialValue;
		// };
		//
		// /** @type {Array<PixelStoreState>} */ var blendColorStates = [
		// 	new BlendColorState("blend_src_rgb", "BLEND_SRC_RGB", gl.BLEND_SRC_RGB, gl.ONE),
		// 	new BlendColorState("blend_src_alpha", "BLEND_SRC_ALPHA", gl.BLEND_SRC_ALPHA, gl.ONE),
		// 	new BlendColorState("blend_dst_rgb", "BLEND_DST_RGB", gl.BLEND_DST_RGB, gl.ZERO),
		// 	new BlendColorState("blend_dst_alpha", "BLEND_DST_ALPHA", gl.BLEND_DST_ALPHA, gl.ZERO)
		// ];
		//
		// for (var testNdx = 0; testNdx < blendColorStates.length; testNdx++) {
		// 	normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.BlendFuncTestCase(verifier, blendColorStates[testNdx].name + verifier.getTestNamePostfix(), blendColorStates[testNdx].description,	blendColorStates[testNdx].target, blendColorStates[testNdx].initialValue)); });
		// 	normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.BlendFuncSeparateTestCase(verifier, blendColorStates[testNdx].name + "_separate" + verifier.getTestNamePostfix(), blendColorStates[testNdx].description, blendColorStates[testNdx].target, blendColorStates[testNdx].initialValue)); });
		// }
		//
		// /**
		//  * @struct
		//  * @constructor
		//  * @param {string} name
		//  * @param {string} description
		//  * @param {number} target
		//  * @param {number} initialValue
		//  */
		// BlendEquationState = function(name, description, target, initialValue) {
		//     /** @type {string} */ this.name = name;
		//     /** @type {string} */ this.description = description;
		//     /** @type {number} */ this.target = target;
		//     /** @type {number} */ this.initialValue = initialValue;
		// };
		//
		// /** @type {Array<PixelStoreState>} */ var blendColorStates = [
		// 	new BlendEquationState("blend_equation_rgb", "BLEND_EQUATION_RGB", gl.BLEND_EQUATION_RGB, gl.FUNC_ADD),
		// 	new BlendEquationState("blend_equation_alpha", "BLEND_EQUATION_ALPHA", gl.BLEND_EQUATION_ALPHA, gl.FUNC_ADD)
		// ];
		//
		// for (var testNdx = 0; testNdx < blendEquationStates.length; testNdx++) {
		// 	normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.BlendEquationTestCase(verifier, blendEquationStates[testNdx].name + verifier.getTestNamePostfix(), blendEquationStates[testNdx].description, blendEquationStates[testNdx].target, blendEquationStates[testNdx].initialValue)); });
		// 	normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.BlendEquationSeparateTestCase(verifier, blendEquationStates[testNdx].name + "_separate" + verifier.getTestNamePostfix(), blendEquationStates[testNdx].description, blendEquationStates[testNdx].target, blendEquationStates[testNdx].initialValue)); });
		// }
		//
		// /**
		//  * @struct
		//  * @constructor
		//  * @param {string} name
		//  * @param {string} description
		//  * @param {number} target
		//  * @param {number} targetLengthTarget
		//  * @param {number} minLength
		//  */
		// ImplementationArrayReturningState = function(name, description, target, targetLengthTarget, minLength) {
		//     /** @type {string} */ this.name = name;
		//     /** @type {string} */ this.description = description;
		//     /** @type {number} */ this.target = target;
		//     /** @type {number} */ this.targetLengthTarget = targetLengthTarget;
		//     /** @type {number} */ this.minLength = minLength;
		// };
		//
		// /** @type {Array<ImplementationArrayReturningState>} */ var implementationArrayReturningStates = [
		// 	new ImplementationArrayReturningState("compressed_texture_formats", "COMPRESSED_TEXTURE_FORMATS", gl.COMPRESSED_TEXTURE_FORMATS, gl.NUM_COMPRESSED_TEXTURE_FORMATS, 10),
		// 	new ImplementationArrayReturningState("program_binary_formats", "PROGRAM_BINARY_FORMATS", gl.PROGRAM_BINARY_FORMATS, gl.NUM_PROGRAM_BINARY_FORMATS, 0),
		// 	new ImplementationArrayReturningState("shader_binary_formats", "SHADER_BINARY_FORMATS", gl.SHADER_BINARY_FORMATS, gl.NUM_SHADER_BINARY_FORMATS, 0)
		// ];
		//
		// for (var testNdx = 0; testNdx < implementationArrayReturningStates.length; testNdx++)
		// 	normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.ImplementationArrayTestCase(verifier, implementationArrayReturningStates[testNdx].name + verifier.getTestNamePostfix(), implementationArrayReturningStates[testNdx].description,	implementationArrayReturningStates[testNdx].target,	implementationArrayReturningStates[testNdx].targetLengthTarget,	implementationArrayReturningStates[testNdx].minLength)); });
		//
		// /**
		//  * @struct
		//  * @constructor
		//  * @param {string} name
		//  * @param {string} description
		//  * @param {number} target
		//  * @param {number} type
		//  */
		// BufferBindingState = function(name, description, target, type) {
		// 	/** @type {string} */ this.name = name;
		// 	/** @type {string} */ this.description = description;
		// 	/** @type {number} */ this.target = target;
		// 	/** @type {number} */ this.type = type;
		// };
		//
		// /** @type {Array<BufferBindingState>} */ var bufferBindingStates = [
		// 	new BufferBindingState("array_buffer_binding", "ARRAY_BUFFER_BINDING", gl.ARRAY_BUFFER_BINDING, gl.ARRAY_BUFFER),
		// 	new BufferBindingState("uniform_buffer_binding", "UNIFORM_BUFFER_BINDING", gl.UNIFORM_BUFFER_BINDING, gl.UNIFORM_BUFFER),
		// 	new BufferBindingState("pixel_pack_buffer_binding", "PIXEL_PACK_BUFFER_BINDING", gl.PIXEL_PACK_BUFFER_BINDING, gl.PIXEL_PACK_BUFFER),
		// 	new BufferBindingState("pixel_unpack_buffer_binding", "PIXEL_UNPACK_BUFFER_BINDING", gl.PIXEL_UNPACK_BUFFER_BINDING, gl.PIXEL_UNPACK_BUFFER),
		// 	new BufferBindingState("transform_feedback_buffer_binding", "TRANSFORM_FEEDBACK_BUFFER_BINDING", gl.TRANSFORM_FEEDBACK_BUFFER_BINDING, gl.TRANSFORM_FEEDBACK_BUFFER),
		// 	new BufferBindingState("copy_read_buffer_binding", "COPY_READ_BUFFER_BINDING", gl.COPY_READ_BUFFER_BINDING, gl.COPY_READ_BUFFER),
		// 	new BufferBindingState("copy_write_buffer_binding", "COPY_WRITE_BUFFER_BINDING", gl.COPY_WRITE_BUFFER_BINDING, gl.COPY_WRITE_BUFFER)
		// ];
		//
		// for (vartestNdx = 0; testNdx < bufferBindingStates.length; testNdx++)
		// 	normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.BufferBindingTestCase(verifier, bufferBindingStates[testNdx].name + verifier.getTestNamePostfix(), bufferBindingStates[testNdx].description, bufferBindingStates[testNdx].target, bufferBindingStates[testNdx].type)); });
		//
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.ElementArrayBufferBindingTestCase(verifier, "element_array_buffer_binding" + verifier.getTestNamePostfix())); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.TransformFeedbackBindingTestCase(verifier, "transform_feedback_binding" + verifier.getTestNamePostfix())); });
		testCtx.addChild(new es3fIntegerStateQueryTests.TransformFeedbackBindingTestCase("transform_feedback_binding"));
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.CurrentProgramBindingTestCase(verifier, "current_program_binding" + verifier.getTestNamePostfix(),	"CURRENT_PROGRAM")); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.VertexArrayBindingTestCase(verifier, "vertex_array_binding" + verifier.getTestNamePostfix(),	"VERTEX_ARRAY_BINDING")); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilClearValueTestCase(verifier, "stencil_clear_value" + verifier.getTestNamePostfix(),	"STENCIL_CLEAR_VALUE")); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.ActiveTextureTestCase(verifier, "active_texture" + verifier.getTestNamePostfix(),	"ACTIVE_TEXTURE")); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.RenderbufferBindingTestCase(verifier, "renderbuffer_binding" + verifier.getTestNamePostfix(),	"RENDERBUFFER_BINDING")); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.SamplerObjectBindingTestCase(verifier, "sampler_binding" + verifier.getTestNamePostfix(),	"SAMPLER_BINDING")); });
		//
		// /**
		//  * @struct
		//  * @constructor
		//  * @param {string} name
		//  * @param {string} description
		//  * @param {number} target
		//  * @param {number} type
		//  */
		// TextureBinding = function(name, description, target, type) {
		// 	/** @type {string} */ this.name = name;
		// 	/** @type {string} */ this.description = description;
		// 	/** @type {number} */ this.target = target;
		// 	/** @type {number} */ this.type = type;
		// };
		//
		// /** @type {Array<TextureBinding>} */ var textureBindings = [
		// 	new TextureBinding("texture_binding_2d", "TEXTURE_BINDING_2D", gl.TEXTURE_BINDING_2D, gl.TEXTURE_2D),
		// 	new TextureBinding("texture_binding_3d", "TEXTURE_BINDING_3D", gl.TEXTURE_BINDING_3D, gl.TEXTURE_3D),
		// 	new TextureBinding("texture_binding_2d_array", "TEXTURE_BINDING_2D_ARRAY", gl.TEXTURE_BINDING_2D_ARRAY, gl.TEXTURE_2D_ARRAY),
		// 	new TextureBinding("texture_binding_cube_map", "TEXTURE_BINDING_CUBE_MAP", gl.TEXTURE_BINDING_CUBE_MAP, gl.TEXTURE_CUBE_MAP)
		// ];
		//
		// for (var testNdx = 0; testNdx < textureBindings.length; testNdx++)
		// 	normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.TextureBindingTestCase(verifier, textureBindings[testNdx].name + verifier.getTestNamePostfix(), textureBindings[testNdx].description, textureBindings[testNdx].target, textureBindings[testNdx].type)); });
		//
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.FrameBufferBindingTestCase(verifier, "framebuffer_binding" + verifier.getTestNamePostfix(), "DRAW_FRAMEBUFFER_BINDING and READ_FRAMEBUFFER_BINDING")); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.ImplementationColorReadTestCase(verifier, "implementation_color_read" + verifier.getTestNamePostfix(), "IMPLEMENTATION_COLOR_READ_TYPE and IMPLEMENTATION_COLOR_READ_FORMAT")); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.ReadBufferCase(verifier, "read_buffer" + verifier.getTestNamePostfix(), "READ_BUFFER")); });
		// normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.DrawBufferCase(verifier, "draw_buffer" + verifier.getTestNamePostfix(), "DRAW_BUFFER")); });

	};

	es3fIntegerStateQueryTests.IntegerStateQueryTests.prototype.deinit = function() {
		if (this.m_verifierBoolean !== null) this.m_verifierBoolean = null;
		if (this.m_verifierInteger !== null) this.m_verifierInteger = null;
		if (this.m_verifierInteger64 !== null) this.m_verifierInteger64 = null;
		if (this.m_verifierFloat !== null) this.m_verifierFloat = null;
	};

    /**
    * Run test
    * @param {WebGL2RenderingContext} context
    */
    es3fIntegerStateQueryTests.run = function(context) {
    	gl = context;
    	//Set up Test Root parameters
    	var state = tcuTestCase.runner;
    	state.setRoot(new es3fIntegerStateQueryTests.IntegerStateQueryTests());

    	//Set up name and description of this test series.
    	setCurrentTestName(state.testCases.fullName());
    	description(state.testCases.getDescription());

    	try {
    		//Run test cases
    		tcuTestCase.runTestCases();
    	}
    	catch (err) {
    		testFailedOptions('Failed to es3fIntegerStateQueryTests.run tests', false);
    		tcuTestCase.runner.terminate();
    	}
    };

});
