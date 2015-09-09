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
goog.provide('functional.gles3.es3fIndexedStateQueryTests');
goog.require('functional.gles3.es3fApiCase');
goog.require('framework.common.tcuTestCase');

goog.scope(function() {
	var es3fIndexedStateQueryTests = functional.gles3.es3fIndexedStateQueryTests;
    var tcuTestCase = framework.common.tcuTestCase;
    var es3fApiCase = functional.gles3.es3fApiCase;

	/**
	 * @param {number} got
	 * @param {number} expected
	 */
	es3fIndexedStateQueryTests.checkIntEquals = function(got, expected) {
		if (got !== expected) {
			bufferedLogToConsole("ERROR: Expected " + expected + "; got " + got);
			testFailedOptions('got invalid value', false);
		}
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 */
	es3fIndexedStateQueryTests.TransformFeedbackCase = function(name, description) {
		es3fApiCase.ApiCase.call(name, description, gl);
	};

	es3fIndexedStateQueryTests.TransformFeedbackCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIndexedStateQueryTests.TransformFeedbackCase.prototype.constructor = es3fIndexedStateQueryTests.TransformFeedbackCase;

	es3fIndexedStateQueryTests.TransformFeedbackCase.prototype.testTransformFeedback = function() {
		throw new Error('This method should be overriden.')
	};

	es3fIndexedStateQueryTests.TransformFeedbackCase.prototype.test = function() {
		/** @type {string} */ var transformFeedbackTestVertSource = '' +
			'#version 300 es\n' +
			'out highp vec4 anotherOutput;\n' +
			'void main (void)\n' +
			'{\n' +
			'	gl_Position = vec4(0.0);\n' +
			'	anotherOutput = vec4(0.0);\n' +
			'}\n\0';
		/** @type {string} */ var transformFeedbackTestFragSource = '' +
			'#version 300 es\n' +
			'layout(location = 0) out mediump vec4 fragColor;' +
			'void main (void)\n' +
			'{\n' +
			'	fragColor = vec4(0.0);\n' +
			'}\n\0';

		/** @type {WebGLShader} */ var shaderVert = gl.createShader(gl.VERTEX_SHADER);
		/** @type {WebGLShader} */ var shaderFrag = gl.createShader(gl.FRAGMENT_SHADER);

		gl.shaderSource(shaderVert, transformFeedbackTestVertSource, null);
		gl.shaderSource(shaderFrag, transformFeedbackTestFragSource, null);

		gl.compileShader(shaderVert);
		gl.compileShader(shaderFrag);

		/** @type {WebGLProgram} */ var shaderProg = gl.createProgram();
		gl.attachShader(shaderProg, shaderVert);
		gl.attachShader(shaderProg, shaderFrag);

		/** @type {Array<string>} */ var transformFeedbackOutputs = [
			'gl_Position',
			'anotherOutput'
		];

		gl.transformFeedbackVaryings(shaderProg, transformFeedbackOutputs, gl.INTERLEAVED_ATTRIBS);
		gl.linkProgram(shaderProg);

		/** @type {WebGLTransformFeedback} */ var transformFeedbackId = gl.createTransformFeedback();
		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedbackId);

		this.testTransformFeedback();

		// cleanup

		gl.bindTransformFeedback(GL_TRANSFORM_FEEDBACK, null);

		gl.deleteTransformFeedbacks(transformFeedbackId);
		gl.deleteShader(shaderVert);
		gl.deleteShader(shaderFrag);
		gl.deleteProgram(shaderProg);
	};

	/**
	 * @constructor
	 * @extends {es3fIndexedStateQueryTests.TransformFeedbackCase}
	 * @param {string} name
	 * @param {string} description
	 */
	es3fIndexedStateQueryTests.TransformFeedbackBufferBindingCase = function(name, description) {
		es3fIndexedStateQueryTests.TransformFeedbackCase.call(this, name, description);
	};

	es3fIndexedStateQueryTests.TransformFeedbackBufferBindingCase.prototype = Object.create(es3fIndexedStateQueryTests.TransformFeedbackCase.prototype);
	es3fIndexedStateQueryTests.TransformFeedbackBufferBindingCase.prototype.constructor = es3fIndexedStateQueryTests.TransformFeedbackBufferBindingCase;

	es3fIndexedStateQueryTests.TransformFeedbackBufferBindingCase.prototype.testTransformFeedback = function() {
		/** @type {number} */ var feedbackPositionIndex = 0;
		/** @type {number} */ var feedbackOutputIndex = 1;
		/** @type {Array<number>} */ var feedbackIndex = [feedbackPositionIndex, feedbackOutputIndex];

		// bind bffers

		/** @type {Array<WebGLBuffer>} */ var feedbackBuffers;
		feedbackBuffers[0] = gl.createBuffer();
		feedbackBuffers[1] = gl.createBuffer();

		/** @type {Array<number>} */ var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

		for (var ndx = 0; ndx < 2; ++ndx) {
			gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, feedbackBuffers[ndx]);
			gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, new Float32Array(data), gl.DYNAMIC_READ);
			glBindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, feedbackIndex[ndx], feedbackBuffers[ndx]);
			expectError(gl.NO_ERROR);
		}

		// test TRANSFORM_FEEDBACK_BUFFER_BINDING

		for (var ndx = 0; ndx < 2; ++ndx) {
			// TODO: implement StateQueryMemoryWriteGuard or find workaround
			/** @type {StateQueryMemoryWriteGuard} */ var boundBuffer;
			boundBuffer = gl.getParameter(gl.TRANSFORM_FEEDBACK_BUFFER_BINDING);
			// boundBuffer.verifyValidity(m_testCtx);
			this.checkIntEquals(boundBuffer, feedbackBuffers[ndx]);
		}


		// cleanup

		gl.deleteBuffer(feedbackBuffers[0]);
		gl.deleteBuffer(feedbackBuffers[1]);
	};

    /**
    * @constructor
    * @extends {tcuTestCase.DeqpTest}
    */
    es3fIndexedStateQueryTests.IndexedStateQueryTests = function() {
        tcuTestCase.DeqpTest.call(this, 'indexed', 'Indexed Integer Values');
    };

    es3fIndexedStateQueryTests.IndexedStateQueryTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fIndexedStateQueryTests.IndexedStateQueryTests.prototype.constructor = es3fIndexedStateQueryTests.IndexedStateQueryTests;

    es3fIndexedStateQueryTests.IndexedStateQueryTests.prototype.init = function() {
		// transform feedback
		this.addChild(new es3fIndexedStateQueryTests.TransformFeedbackBufferBindingCase('transform_feedback_buffer_binding', 'TRANSFORM_FEEDBACK_BUFFER_BINDING'));
		this.addChild(new es3fIndexedStateQueryTests.TransformFeedbackBufferBufferCase('transform_feedback_buffer_start_size', 'TRANSFORM_FEEDBACK_BUFFER_START and TRANSFORM_FEEDBACK_BUFFER_SIZE'));

		// uniform buffers
		this.addChild(new es3fIndexedStateQueryTests.UniformBufferBindingCase('uniform_buffer_binding', 'UNIFORM_BUFFER_BINDING'));
		this.addChild(new es3fIndexedStateQueryTests.UniformBufferBufferCase('uniform_buffer_start_size', 'UNIFORM_BUFFER_START and UNIFORM_BUFFER_SIZE'));

    };

    /**
    * Run test
    * @param {WebGL2RenderingContext} context
    */
    es3fIndexedStateQueryTests.run = function(context) {
    	gl = context;
    	//Set up Test Root parameters
    	var state = tcuTestCase.runner;
    	state.setRoot(new es3fIndexedStateQueryTests.IndexedStateQueryTests());

    	//Set up name and description of this test series.
    	setCurrentTestName(state.testCases.fullName());
    	description(state.testCases.getDescription());

    	try {
    		//Run test cases
    		tcuTestCase.runTestCases();
    	}
    	catch (err) {
    		testFailedOptions('Failed to es3fIndexedStateQueryTests.run tests', false);
    		tcuTestCase.runner.terminate();
    	}
    };

});
