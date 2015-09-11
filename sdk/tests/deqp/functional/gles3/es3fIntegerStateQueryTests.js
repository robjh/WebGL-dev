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
goog.require('functional.gles3.es3fApiCase');

goog.scope(function() {
	var es3fIntegerStateQueryTests = functional.gles3.es3fIntegerStateQueryTests;
    var tcuTestCase = framework.common.tcuTestCase;
	var es3fApiCase = functional.gles3.es3fApiCase;

	/**
	 * @constructor
	 * @param  {string} testNamePostfix
	 */
	es3fIntegerStateQueryTests.StateVerifier = function(testNamePostfix) {
		/** @type {string} */ var this.m_testNamePostfix = testNamePostfix;
	};

	es3fIntegerStateQueryTests.StateVerifier.prototype.getTestNamePostfix = function() {
		return this.m_testNamePostfix;
	};

	/**
	 * @constructor
	 * @extends {es3fIntegerStateQueryTests.StateVerifier}
	 * @param  {string} testNamePostfix
	 */
	es3fIntegerStateQueryTests.GetBooleanVerifier = function(testNamePostfix) {
		es3fIntegerStateQueryTests.StateVerifier.call(this, '_getboolean');
	};

	es3fIntegerStateQueryTests.GetBooleanVerifier.prototype = Object.create(es3fIntegerStateQueryTests.StateVerifier.prototype);
	es3fIntegerStateQueryTests.GetBooleanVerifier.prototype.constructor = es3fIntegerStateQueryTests.GetBooleanVerifier;

	/**
	 * @param  {number} name
	 * @param  {number} reference
	 */
	es3fIntegerStateQueryTests.GetBooleanVerifier.prototype.verifyInteger = function(name, reference) {
		/** @type {boolean} */ var state = /** @type {boolean} */ (gl.getParameter(name));

		/** @type {boolean} */ var expectedGLState = reference ? true : false;

		if (state != expectedGLState) {
			bufferedLogToConsole("ERROR: expected " + (expectedGLState === true ? "true" : "false") + "; got " + (state === true ? "true" : (state === false ? "false" : "non-boolean")));
			testFailedOptions("Got invalid boolean value", false);
		}
	};

	/**
	 * @param  {number} name
	 * @param  {number} reference0
	 * @param  {number} reference1
	 * @param  {number} reference2
	 * @param  {number} reference3
	 */
	es3fIntegerStateQueryTests.GetBooleanVerifier.prototype.verifyInteger4 = function(name, reference0, reference1, reference2, reference3) {
		es3fIntegerStateQueryTests.verifyInteger4Mask(name, reference0, true, reference1, true, reference2, true, reference3, true);
	};

	/**
	 * @param  {number} name
	 * @param  {number} reference0
	 * @param  {boolean} enableRef0
	 * @param  {number} reference1
	 * @param  {boolean} enableRef1
	 * @param  {number} reference2
	 * @param  {boolean} enableRef2
	 * @param  {number} reference3
	 * @param  {boolean} enableRef3
	 */
	es3fIntegerStateQueryTests.GetBooleanVerifier.prototype.verifyInteger4Mask = function(name, reference0, enableRef0, reference1, enableRef1, reference2, enableRef2, reference3, enableRef3) {
		/** @type {Array<boolean>} */ var boolVector4 = /** @type {Array<boolean>} */ (gl.getParameter(name));

		/** @type {Array<boolean>} */ var referenceAsGLBoolean = [
			reference0 ? true : false,
			reference1 ? true : false,
			reference2 ? true : false,
			reference3 ? true : false,
		];

		if ((enableRef0 && (boolVector4[0] != referenceAsGLBoolean[0])) ||
			(enableRef1 && (boolVector4[1] != referenceAsGLBoolean[1])) ||
			(enableRef2 && (boolVector4[2] != referenceAsGLBoolean[2])) ||
			(enableRef3 && (boolVector4[3] != referenceAsGLBoolean[3])))
		{
			bufferedLogToConsole("// ERROR: expected " +
				(enableRef0 ? (referenceAsGLBoolean[0] ? "true" : "false") : " - ") + ", " +
				(enableRef1 ? (referenceAsGLBoolean[1] ? "true" : "false") : " - ") + ", " +
				(enableRef2 ? (referenceAsGLBoolean[2] ? "true" : "false") : " - ") + ", " +
				(enableRef3 ? (referenceAsGLBoolean[3] ? "true" : "false") : " - ") );

			testFailedOptions('Got invalid boolean value', false);
		}
	};

	/**
	 * @param  {number} name
	 * @param  {number} reference
	 */
	es3fIntegerStateQueryTests.GetBooleanVerifier.prototype.verifyIntegerGreaterOrEqual = function(name, reference) {
		/** @type {Array<boolean>} */ var state = /** @type {Array<boolean>} */ (gl.getParameter(name));

		if (state === true) // state is non-zero, could be greater than reference (correct)
			return;

		if (state === false) {
			// state is zero
			if (reference > 0)  {
				// and reference is greater than zero?
				bufferedLogToConsole("ERROR: expected true");
				testFailedOptions("Got invalid boolean value. Expected true", false);
			}
		} else {
			bufferedLogToConsole('ERROR: expected true or false');
			testFailedOptions("Got invalid boolean value. Expected true or false.", false);
		}
	};

	/**
	 * @param  {number} name
	 * @param  {number} reference
	 */
	es3fIntegerStateQueryTests.GetBooleanVerifier.prototype.verifyUnsignedIntegerGreaterOrEqual = function(name, reference) {
		/** @type {Array<boolean>} */ var state = /** @type {Array<boolean>} */ (gl.getParameter(name));
		if (state === true) // state is non-zero, could be greater than reference (correct)
			return;

		if (state === false)  {
			// state is zero
			if (reference > 0)  {
				// and reference is greater than zero?
				bufferedLogToConsole('ERROR: expected true');
				testFailedOptions("Got invalid boolean value. Expected true.", false);
			}
		} else {
			bufferedLogToConsole('ERROR: expected true or false');
			testFailedOptions("Got invalid boolean value. Expected true or false", false);
		}
	};

	/**
	 * @param  {number} name
	 * @param  {number} reference
	 */
	es3fIntegerStateQueryTests.GetBooleanVerifier.prototype.verifyIntegerLessOrEqual = function(name, reference) {
		/** @type {Array<boolean>} */ var state = /** @type {Array<boolean>} */ (gl.getParameter(name));

		if (state === true) // state is non-zero, could be less than reference (correct)
			return;

		if (state === false)  {
			// state is zero
			if (reference < 0)  {
				// and reference is less than zero?
				bufferedLogToConsole('ERROR: expected true');
				testFailedOptions("Got invalid boolean value. Expected true", false);
			}
		} else {
			bufferedLogToConsole('ERROR: expected true or false');
			testFailedOptions("Got invalid boolean value. Expected true or false", false);
		}
	};

	/**
	 * @param  {number} name
	 * @param  {number} reference0
	 * @param  {number} reference1
	 */
	es3fIntegerStateQueryTests.GetBooleanVerifier.prototype.verifyIntegerGreaterOrEqual2 = function(name, reference0, reference1) {
		/** @type {Array<boolean>} */ var boolVector = /** @type {Array<boolean>} */ (gl.getParameter(name));

		/** @type {Array<boolean>} */ var referenceAsGLBoolean = [
			reference0 ? true : false,
			reference1 ? true : false
		];

		for (int ndx = 0; ndx < referenceAsGLBoolean.length; ++ndx) {
			if (boolVector[ndx] === true)  {
				// state is non-zero, could be greater than any integer
				continue;
			} else if (boolVector[ndx] === false)  {
				// state is zero
				if (referenceAsGLBoolean[ndx] > 0)  {
					// and reference is greater than zero?
					bufferedLogToConsole('ERROR: expected true');
					testFailedOptions("Got invalid boolean value. Expected true", false);
				}
			} else {
				bufferedLogToConsole('ERROR: expected true or false');
				testFailedOptions("Got invalid boolean value. Expected true or false", false);
			}
		}
	};

	/**
	 * @param  {number} name
	 * @param  {Array<number>} references
	 */
	es3fIntegerStateQueryTests.GetBooleanVerifier.prototype.verifyIntegerAnyOf = function(name, references) {
		/** @type {Array<boolean>} */ var state = /** @type {Array<boolean>} */ (gl.getParameter(name));

		for (var ndx = 0; ndx < references.length; ++ndx) {
			/** @type {boolean} */ var expectedGLState = references[ndx] ? true : false;

			if (state === expectedGLState)
				return;
		}

		bufferedLogToConsole("ERROR: got " + (state === true ? "true" : "false"));
		testFailedOptions("Got invalid boolean value", false);
	};

	/**
	 * @param  {number} name
	 * @param  {number} stencilBits
	 */
	es3fIntegerStateQueryTests.GetBooleanVerifier.prototype.verifyStencilMaskInitial = function(name, stencilBits) {
		// if stencilBits == 0, the mask is allowed to be either true or false
		// otherwise it must be true

		/** @type {Array<boolean>} */ var state = /** @type {Array<boolean>} */ (gl.getParameter(name));

		if (stencilBits > 0 && state !== true) {
			bufferedLogToConsole('ERROR: expected true');
			testFailedOptions("Got invalid boolean value. Expected true", false);
		}
	};

	// continue at line 349
	/**
	 * @constructor
	 * @extends {es3fIntegerStateQueryTests.StateVerifier}
	 * @param  {string} testNamePostfix
	 */
	es3fIntegerStateQueryTests.GetIntegerVerifier = function(testNamePostfix) {
		es3fIntegerStateQueryTests.StateVerifier.call(this, '_getinteger');
	};

	es3fIntegerStateQueryTests.GetIntegerVerifier.prototype = Object.create(es3fIntegerStateQueryTests.StateVerifier.prototype);
	es3fIntegerStateQueryTests.GetIntegerVerifier.prototype.constructor = es3fIntegerStateQueryTests.GetIntegerVerifier;

	// continue at line 538
	/**
	 * @constructor
	 * @extends {es3fIntegerStateQueryTests.StateVerifier}
	 * @param  {string} testNamePostfix
	 */
	es3fIntegerStateQueryTests.GetInteger64Verifier = function(testNamePostfix) {
		es3fIntegerStateQueryTests.StateVerifier.call(this, '_getinteger64');
	};

	es3fIntegerStateQueryTests.GetInteger64Verifier.prototype = Object.create(es3fIntegerStateQueryTests.StateVerifier.prototype);
	es3fIntegerStateQueryTests.GetInteger64Verifier.prototype.constructor = es3fIntegerStateQueryTests.GetInteger64Verifier;

	// continue at line 724
	/**
	 * @constructor
	 * @extends {es3fIntegerStateQueryTests.StateVerifier}
	 * @param  {string} testNamePostfix
	 */
	es3fIntegerStateQueryTests.GetFloatVerifier = function(testNamePostfix) {
		es3fIntegerStateQueryTests.StateVerifier.call(this, '_getfloat');
	};

	es3fIntegerStateQueryTests.GetFloatVerifier.prototype = Object.create(es3fIntegerStateQueryTests.StateVerifier.prototype);
	es3fIntegerStateQueryTests.GetFloatVerifier.prototype.constructor = es3fIntegerStateQueryTests.GetFloatVerifier;

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

	// Test Cases (line 931)
	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {es3fIntegerStateQueryTests.StateVerifier} verifier
	 * @param {string} name
	 * @param {string} description
	 */
	es3fIntegerStateQueryTests.TransformFeedbackTestCase = function(verifier, name, description) {
		es3fApiCase.ApiCase.call(namee, description, gl);
		/** @type {es3fIntegerStateQueryTests.StateVerifier} */ this.m_verifier = verifier;
		/** @type {number} */ this.m_transformfeedback = 0;
	};

	es3fIntegerStateQueryTests.TransformFeedbackTestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fIntegerStateQueryTests.TransformFeedbackTestCase.prototype.constructor = es3fIntegerStateQueryTests.TransformFeedbackTestCase;

	es3fIntegerStateQueryTests.TransformFeedbackTestCase.prototype.testTransformFeedback = function() {
		throw new Error('This method should be implemented by child classes.');
	}

	es3fIntegerStateQueryTests.TransformFeedbackTestCase.prototype.test = function() {
		this.m_transformfeedback = gl.createTransformFeedback();

		/** @type {WebGLShader} */ var shaderVert = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(shaderVert, transformFeedbackTestVertSource);
		gl.compileShader(shaderVert);

		/** @type {boolean} */ var compileStatus = /** @type {boolean} */ (gl.getShaderParameter(shaderVert, gl.COMPILE_STATUS));
		checkBooleans(compileStatus, true);

		/** @type {WebGLShader} */ var shaderFrag = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(shaderFrag, transformFeedbackTestFragSource);
		gl.compileShader(shaderFrag);

		compileStatus = /** @type {boolean} */ (gl.getShaderParameter(shaderFrag, gl.COMPILE_STATUS));
		checkBooleans(compileStatus, true);

		/** @type {WebGLProgram} */ var shaderProg = gl.createProgram();
		gl.attachShader(shaderProg, shaderVert);
		gl.attachShader(shaderProg, shaderFrag);
		/** @type {string} */ var transform_feedback_outputs = "gl_Position";
		gl.transformFeedbackVaryings(shaderProg, transform_feedback_outputs, gl.INTERLEAVED_ATTRIBS);
		gl.linkProgram(shaderProg);

		/** @type {boolean} */ var linkStatus = gl.getProgramParameter(shaderProg, gl.LINK_STATUS);
		checkBooleans(linkStatus, true);

		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.m_transformfeedback);


		/** @type {WebGLBuffer} */ var feedbackBufferId = gl.createBuffer();
		gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, feedbackBufferId);
		gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, new Float32Array(16), gl.DYNAMIC_READ);
		gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, feedbackBufferId);

		gl.useProgram(shaderProg);

		this.testTransformFeedback();

		gl.useProgram(null);
		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
		gl.deleteTransformFeedbacks(this.m_transformfeedback);
		gl.deleteBuffers(feedbackBufferId);
		gl.deleteShader(shaderVert);
		gl.deleteShader(shaderFrag);
		gl.deleteProgram(shaderProg);
	};

	// continue at line 1003, TransformFeedbackBindingTestCase

    /**
    * @constructor
    * @extends {tcuTestCase.DeqpTest}
    */
    es3fIntegerStateQueryTests.IntegerStateQueryTests = function() {
        tcuTestCase.DeqpTest.call(this, "integers", "Integer Values");
		/** @type {es3fIntegerStateQueryTests.GetBooleanVerifier} */ this.m_verifierBoolean = null;
		/** @type {es3fIntegerStateQueryTests.GetIntegerVerifier} */ this.m_verifierInteger = null;
		/** @type {es3fIntegerStateQueryTests.GetInteger64Verifier} */ this.m_verifierInteger64 = null;
		/** @type {es3fIntegerStateQueryTests.GetFloatVerifier} */ this.m_verifierFloat = null;
    };

    es3fIntegerStateQueryTests.IntegerStateQueryTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fIntegerStateQueryTests.IntegerStateQueryTests.prototype.constructor = es3fIntegerStateQueryTests.IntegerStateQueryTests;

    es3fIntegerStateQueryTests.IntegerStateQueryTests.prototype.init = function() {
		assertMsgOptions(this.m_verifierBoolean === null, 'm_verifierBoolean to be null', false, true);
		assertMsgOptions(this.m_verifierInteger === null, 'm_verifierInteger to be null', false, true);
		assertMsgOptions(this.m_verifierInteger64 === null, 'm_verifierInteger64 to be null', false, true);
		assertMsgOptions(this.m_verifierFloat === null, 'm_verifierFloat to be null', false, true);

		this.m_verifierBoolean = new es3fIntegerStateQueryTests.GetBooleanVerifier();
		this.m_verifierInteger = new es3fIntegerStateQueryTests.GetIntegerVerifier();
		this.m_verifierInteger64 = new es3fIntegerStateQueryTests.GetInteger64Verifier();
		this.m_verifierFloat = new es3fIntegerStateQueryTests.GetFloatVerifier();

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
			new LimitedStateInteger("num_extensions", "NUM_EXTENSIONS has minimum value of 0", gl.NUM_EXTENSIONS, 0),
			new LimitedStateInteger("major_version", "MAJOR_VERSION has minimum value of 3", gl.MAJOR_VERSION, 3),
			new LimitedStateInteger("minor_version", "MINOR_VERSION has minimum value of 0", gl.MINOR_VERSION, 0),
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
			new LimitedStateInteger("stencil_bits", "STENCIL_BITS has minimum value of 0", gl.STENCIL_BITS, 0),
		];

		/** @type {Array<LimitedStateInteger>} */ var implementationMaxLimits = [
			new LimitedStateInteger("min_program_texel_offset", "MIN_PROGRAM_TEXEL_OFFSET has maximum value of -8", gl.MIN_PROGRAM_TEXEL_OFFSET, -8),
			new LimitedStateInteger("uniform_buffer_offset_alignment", "UNIFORM_BUFFER_OFFSET_ALIGNMENT has minimum value of 1", gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT, 256),
		];

		// \note implementation defined limits have their own tests so just check the conversions to boolean, int64 and float
		/** @type {Array<es3fIntegerStateQueryTests.StateVerifier>} */ var  implementationLimitVerifiers = [this.m_verifierBoolean, this.m_verifierInteger64, this.m_verifierFloat];

		var testCtx = this;

		for (var testNdx = 0; testNdx < implementationMinLimits.length; testNdx++)
			implementationLimitVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.ConstantMinimumValueTestCase(verifier, implementationMinLimits[testNdx].name + verifier.getTestNamePostfix(), implementationMinLimits[testNdx].description, implementationMinLimits[testNdx].targetName, implementationMinLimits[testNdx].value)); });

		for (var testNdx = 0; testNdx < implementationMaxLimits.length; testNdx++)
			implementationLimitVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.ConstantMaximumValueTestCase(verifier, implementationMaxLimits[testNdx].name + verifier.getTestNamePostfix(), implementationMaxLimits[testNdx].description, implementationMaxLimits[testNdx].targetName, implementationMaxLimits[testNdx].value)); });

		/** @type {Array<es3fIntegerStateQueryTests.StateVerifier>} */ var  normalVerifiers = [this.m_verifierBoolean, this.m_verifierInteger, this.m_verifierInteger64, this.m_verifierFloat];
		implementationLimitVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.SampleBuffersTestCase(verifier, "sample_buffers" + verifier.getTestNamePostfix(), "SAMPLE_BUFFERS")); });

		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.SamplesTestCase(verifier, "samples" + verifier.getTestNamePostfix(), "SAMPLES")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.HintTestCase(verifier, "generate_mipmap_hint" + verifier.getTestNamePostfix(), "GENERATE_MIPMAP_HINT", gl.GENERATE_MIPMAP_HINT)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.HintTestCase(verifier, "fragment_shader_derivative_hint" + verifier.getTestNamePostfix(), "FRAGMENT_SHADER_DERIVATIVE_HINT", gl.FRAGMENT_SHADER_DERIVATIVE_HINT)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.DepthFuncTestCase(verifier, "depth_func" + verifier.getTestNamePostfix(), "DEPTH_FUNC")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.CullFaceTestCase(verifier, "cull_face_mode" + verifier.getTestNamePostfix(), "CULL_FACE_MODE")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.FrontFaceTestCase(verifier, "front_face_mode" + verifier.getTestNamePostfix(), "FRONT_FACE")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.ViewPortTestCase(verifier, "viewport" + verifier.getTestNamePostfix(), "VIEWPORT")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.ScissorBoxTestCase(verifier, "scissor_box" + verifier.getTestNamePostfix(), "SCISSOR_BOX")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.MaxViewportDimsTestCase(verifier, "max_viewport_dims" + verifier.getTestNamePostfix(), "MAX_VIEWPORT_DIMS")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilRefTestCase(verifier, "stencil_ref" + verifier.getTestNamePostfix(), "STENCIL_REF", gl.STENCIL_REF)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilRefTestCase(verifier, "stencil_back_ref" + verifier.getTestNamePostfix(), "STENCIL_BACK_REF", gl.STENCIL_BACK_REF)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilRefSeparateTestCase(verifier, "stencil_ref_separate" + verifier.getTestNamePostfix(), "STENCIL_REF (separate)", gl.STENCIL_REF, gl.FRONT)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilRefSeparateTestCase(verifier, "stencil_ref_separate_both" + verifier.getTestNamePostfix(), "STENCIL_REF (separate)", gl.STENCIL_REF, gl.FRONT_AND_BACK)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilRefSeparateTestCase(verifier, "stencil_back_ref_separate" + verifier.getTestNamePostfix(), "STENCIL_BACK_REF (separate)", gl.STENCIL_BACK_REF, gl.BACK)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilRefSeparateTestCase(verifier, "stencil_back_ref_separate_both" + verifier.getTestNamePostfix(), "STENCIL_BACK_REF (separate)", gl.STENCIL_BACK_REF, gl.FRONT_AND_BACK)); });

		/**
		 * @struct
		 * @constructor
		 * @param {string} name
		 * @param {string} frontDescription
		 * @param {number} frontTarget
		 * @param {string} backDescription
		 * @param {number} backTarget
		 */
		 NamedStencilOp = function(name, frontDescription, frontTarget, backDescription, backTarget) {
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
			normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilOpTestCase(verifier, "stencil_" + stencilOps[testNdx].name + verifier.getTestNamePostfix(), stencilOps[testNdx].frontDescription, stencilOps[testNdx].frontTarget)); });
			normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilOpTestCase(verifier, "stencil_back_" + stencilOps[testNdx].name + verifier.getTestNamePostfix(), stencilOps[testNdx].backDescription, stencilOps[testNdx].backTarget)); });

			normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilOpSeparateTestCase(verifier, "stencil_" + stencilOps[testNdx].name + "_separate_both" + verifier.getTestNamePostfix(), stencilOps[testNdx].frontDescription, stencilOps[testNdx].frontTarget, gl.FRONT_AND_BACK)); });
			normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilOpSeparateTestCase(verifier, "stencil_back_" + stencilOps[testNdx].name + "_separate_both" + verifier.getTestNamePostfix(), stencilOps[testNdx].backDescription, stencilOps[testNdx].backTarget, gl.FRONT_AND_BACK)); });

			normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilOpSeparateTestCase(verifier, "stencil_" + stencilOps[testNdx].name + "_separate" + verifier.getTestNamePostfix(), stencilOps[testNdx].frontDescription, stencilOps[testNdx].frontTarget, gl.FRONT)); });
			normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.StencilOpSeparateTestCase(verifier, "stencil_back_" + stencilOps[testNdx].name + "_separate" + verifier.getTestNamePostfix(), stencilOps[testNdx].backDescription, stencilOps[testNdx].backTarget, gl.BACK)); });
		}

		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilFuncTestCase(verifier, "stencil_func" + verifier.getTestNamePostfix(), "STENCIL_FUNC")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilFuncSeparateTestCase(verifier, "stencil_func_separate" + verifier.getTestNamePostfix(), "STENCIL_FUNC (separate)", gl.STENCIL_FUNC, gl.FRONT)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilFuncSeparateTestCase(verifier, "stencil_func_separate_both" + verifier.getTestNamePostfix(), "STENCIL_FUNC (separate)", gl.STENCIL_FUNC, gl.FRONT_AND_BACK)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilFuncSeparateTestCase(verifier, "stencil_back_func_separate" + verifier.getTestNamePostfix(), "STENCIL_FUNC (separate)", gl.STENCIL_BACK_FUNC, gl.BACK)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilFuncSeparateTestCase(verifier, "stencil_back_func_separate_both" + verifier.getTestNamePostfix(), "STENCIL_FUNC (separate)", gl.STENCIL_BACK_FUNC, gl.FRONT_AND_BACK)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilMaskTestCase(verifier, "stencil_value_mask" + verifier.getTestNamePostfix(), "STENCIL_VALUE_MASK", gl.STENCIL_VALUE_MASK)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilMaskTestCase(verifier, "stencil_back_value_mask" + verifier.getTestNamePostfix(), "STENCIL_BACK_VALUE_MASK", gl.STENCIL_BACK_VALUE_MASK)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilMaskSeparateTestCase(verifier, "stencil_value_mask_separate" + verifier.getTestNamePostfix(), "STENCIL_VALUE_MASK (separate)", gl.STENCIL_VALUE_MASK, gl.FRONT)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilMaskSeparateTestCase(verifier, "stencil_value_mask_separate_both" + verifier.getTestNamePostfix(), "STENCIL_VALUE_MASK (separate)", gl.STENCIL_VALUE_MASK, gl.FRONT_AND_BACK)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilMaskSeparateTestCase(verifier, "stencil_back_value_mask_separate" + verifier.getTestNamePostfix(), "STENCIL_BACK_VALUE_MASK (separate)", gl.STENCIL_BACK_VALUE_MASK, gl.BACK)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilMaskSeparateTestCase(verifier, "stencil_back_value_mask_separate_both" + verifier.getTestNamePostfix(), "STENCIL_BACK_VALUE_MASK (separate)", gl.STENCIL_BACK_VALUE_MASK, gl.FRONT_AND_BACK)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilWriteMaskTestCase(verifier, "stencil_writemask" + verifier.getTestNamePostfix(), "STENCIL_WRITEMASK", gl.STENCIL_WRITEMASK)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilWriteMaskTestCase(verifier, "stencil_back_writemask" + verifier.getTestNamePostfix(), "STENCIL_BACK_WRITEMASK", gl.STENCIL_BACK_WRITEMASK)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilWriteMaskSeparateTestCase(verifier, "stencil_writemask_separate" + verifier.getTestNamePostfix(), "STENCIL_WRITEMASK (separate)", gl.STENCIL_WRITEMASK, gl.FRONT)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilWriteMaskSeparateTestCase(verifier, "stencil_writemask_separate_both" + verifier.getTestNamePostfix(), "STENCIL_WRITEMASK (separate)", gl.STENCIL_WRITEMASK, gl.FRONT_AND_BACK)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilWriteMaskSeparateTestCase(verifier, "stencil_back_writemask_separate" + verifier.getTestNamePostfix(), "STENCIL_BACK_WRITEMASK (separate)", gl.STENCIL_BACK_WRITEMASK, gl.BACK)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilWriteMaskSeparateTestCase(verifier, "stencil_back_writemask_separate_both" + verifier.getTestNamePostfix(), "STENCIL_BACK_WRITEMASK (separate)", gl.STENCIL_BACK_WRITEMASK, gl.FRONT_AND_BACK)); });

		/**
		 * @struct
		 * @constructor
		 * @param {string} name
		 * @param {string} description
		 * @param {number} target
		 * @param {number} initialValue
		 */
		PixelStoreState = function(name, description, target, initialValue) {
		    /** @type {string} */ this.name = name;
		    /** @type {string} */ this.description = description;
		    /** @type {number} */ this.target = target;
		    /** @type {number} */ this.initialValue = initialValue;
		};

		/** @type {Array<PixelStoreState>} */ var pixelStoreStates = [
			new PixelStoreState("unpack_image_height", "UNPACK_IMAGE_HEIGHT", gl.UNPACK_IMAGE_HEIGHT, 0),
			new PixelStoreState("unpack_skip_images", "UNPACK_SKIP_IMAGES", gl.UNPACK_SKIP_IMAGES, 0),
			new PixelStoreState("unpack_row_length", "UNPACK_ROW_LENGTH", gl.UNPACK_ROW_LENGTH, 0),
			new PixelStoreState("unpack_skip_rows", "UNPACK_SKIP_ROWS", gl.UNPACK_SKIP_ROWS, 0),
			new PixelStoreState("unpack_skip_pixels", "UNPACK_SKIP_PIXELS", gl.UNPACK_SKIP_PIXELS, 0),
			new PixelStoreState("pack_row_length", "PACK_ROW_LENGTH", gl.PACK_ROW_LENGTH, 0),
			new PixelStoreState("pack_skip_rows", "PACK_SKIP_ROWS", gl.PACK_SKIP_ROWS, 0),
			new PixelStoreState("pack_skip_pixels", "PACK_SKIP_PIXELS", gl.PACK_SKIP_PIXELS, 0)
		];

		for (var testNdx = 0; testNdx < pixelStoreStates.length; testNdx++)
			normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.PixelStoreTestCase(verifier, pixelStoreStates[testNdx].name + verifier.getTestNamePostfix(), pixelStoreStates[testNdx].description, pixelStoreStates[testNdx].target, pixelStoreStates[testNdx].initialValue)); });

		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.PixelStoreAlignTestCase(verifier, "unpack_alignment" + verifier.getTestNamePostfix(), "UNPACK_ALIGNMENT", gl.UNPACK_ALIGNMENT)); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.PixelStoreAlignTestCase(verifier, "pack_alignment" + verifier.getTestNamePostfix(), "PACK_ALIGNMENT", gl.PACK_ALIGNMENT)); });

		/**
		 * @struct
		 * @constructor
		 * @param {string} name
		 * @param {string} description
		 * @param {number} target
		 * @param {number} initialValue
		 */
		BlendColorState = function(name, description, target, initialValue) {
		    /** @type {string} */ this.name = name;
		    /** @type {string} */ this.description = description;
		    /** @type {number} */ this.target = target;
		    /** @type {number} */ this.initialValue = initialValue;
		};

		/** @type {Array<PixelStoreState>} */ var blendColorStates = [
			new BlendColorState("blend_src_rgb", "BLEND_SRC_RGB", gl.BLEND_SRC_RGB, gl.ONE),
			new BlendColorState("blend_src_alpha", "BLEND_SRC_ALPHA", gl.BLEND_SRC_ALPHA, gl.ONE),
			new BlendColorState("blend_dst_rgb", "BLEND_DST_RGB", gl.BLEND_DST_RGB, gl.ZERO),
			new BlendColorState("blend_dst_alpha", "BLEND_DST_ALPHA", gl.BLEND_DST_ALPHA, gl.ZERO)
		];

		for (var testNdx = 0; testNdx < blendColorStates.length; testNdx++) {
			normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.BlendFuncTestCase(verifier, blendColorStates[testNdx].name + verifier.getTestNamePostfix(), blendColorStates[testNdx].description,	blendColorStates[testNdx].target, blendColorStates[testNdx].initialValue)); });
			normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegerStateQueryTests.BlendFuncSeparateTestCase(verifier, blendColorStates[testNdx].name + "_separate" + verifier.getTestNamePostfix(), blendColorStates[testNdx].description, blendColorStates[testNdx].target, blendColorStates[testNdx].initialValue)); });
		}

		/**
		 * @struct
		 * @constructor
		 * @param {string} name
		 * @param {string} description
		 * @param {number} target
		 * @param {number} initialValue
		 */
		BlendEquationState = function(name, description, target, initialValue) {
		    /** @type {string} */ this.name = name;
		    /** @type {string} */ this.description = description;
		    /** @type {number} */ this.target = target;
		    /** @type {number} */ this.initialValue = initialValue;
		};

		/** @type {Array<PixelStoreState>} */ var blendColorStates = [
			new BlendEquationState("blend_equation_rgb", "BLEND_EQUATION_RGB", gl.BLEND_EQUATION_RGB, gl.FUNC_ADD),
			new BlendEquationState("blend_equation_alpha", "BLEND_EQUATION_ALPHA", gl.BLEND_EQUATION_ALPHA, gl.FUNC_ADD),
		];

		for (var testNdx = 0; testNdx < blendEquationStates.length; testNdx++) {
			normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.BlendEquationTestCase(verifier, blendEquationStates[testNdx].name + verifier.getTestNamePostfix(), blendEquationStates[testNdx].description, blendEquationStates[testNdx].target, blendEquationStates[testNdx].initialValue)); });
			normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.BlendEquationSeparateTestCase(verifier, blendEquationStates[testNdx].name + "_separate" + verifier.getTestNamePostfix(), blendEquationStates[testNdx].description, blendEquationStates[testNdx].target, blendEquationStates[testNdx].initialValue)); });
		}

		/**
		 * @struct
		 * @constructor
		 * @param {string} name
		 * @param {string} description
		 * @param {number} target
		 * @param {number} targetLengthTarget
		 * @param {number} minLength
		 */
		ImplementationArrayReturningState = function(name, description, target, targetLengthTarget, minLength) {
		    /** @type {string} */ this.name = name;
		    /** @type {string} */ this.description = description;
		    /** @type {number} */ this.target = target;
		    /** @type {number} */ this.targetLengthTarget = targetLengthTarget;
		    /** @type {number} */ this.minLength = minLength;
		};

		/** @type {Array<ImplementationArrayReturningState>} */ var implementationArrayReturningStates = [
			new ImplementationArrayReturningState("compressed_texture_formats", "COMPRESSED_TEXTURE_FORMATS", gl.COMPRESSED_TEXTURE_FORMATS, gl.NUM_COMPRESSED_TEXTURE_FORMATS, 10),
			new ImplementationArrayReturningState("program_binary_formats", "PROGRAM_BINARY_FORMATS", gl.PROGRAM_BINARY_FORMATS, gl.NUM_PROGRAM_BINARY_FORMATS, 0),
			new ImplementationArrayReturningState("shader_binary_formats", "SHADER_BINARY_FORMATS", gl.SHADER_BINARY_FORMATS, gl.NUM_SHADER_BINARY_FORMATS, 0)
		];

		for (var testNdx = 0; testNdx < implementationArrayReturningStates.length; testNdx++)
			normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.ImplementationArrayTestCase(verifier, implementationArrayReturningStates[testNdx].name + verifier.getTestNamePostfix(), implementationArrayReturningStates[testNdx].description,	implementationArrayReturningStates[testNdx].target,	implementationArrayReturningStates[testNdx].targetLengthTarget,	implementationArrayReturningStates[testNdx].minLength)); });

		/**
		 * @struct
		 * @constructor
		 * @param {string} name
		 * @param {string} description
		 * @param {number} target
		 * @param {number} type
		 */
		BufferBindingState = function(name, description, target, type) {
			/** @type {string} */ this.name = name;
			/** @type {string} */ this.description = description;
			/** @type {number} */ this.target = target;
			/** @type {number} */ this.type = type;
		};

		/** @type {Array<BufferBindingState>} */ var bufferBindingStates = [
			new BufferBindingState("array_buffer_binding", "ARRAY_BUFFER_BINDING", gl.ARRAY_BUFFER_BINDING, gl.ARRAY_BUFFER),
			new BufferBindingState("uniform_buffer_binding", "UNIFORM_BUFFER_BINDING", gl.UNIFORM_BUFFER_BINDING, gl.UNIFORM_BUFFER),
			new BufferBindingState("pixel_pack_buffer_binding", "PIXEL_PACK_BUFFER_BINDING", gl.PIXEL_PACK_BUFFER_BINDING, gl.PIXEL_PACK_BUFFER),
			new BufferBindingState("pixel_unpack_buffer_binding", "PIXEL_UNPACK_BUFFER_BINDING", gl.PIXEL_UNPACK_BUFFER_BINDING, gl.PIXEL_UNPACK_BUFFER),
			new BufferBindingState("transform_feedback_buffer_binding", "TRANSFORM_FEEDBACK_BUFFER_BINDING", gl.TRANSFORM_FEEDBACK_BUFFER_BINDING, gl.TRANSFORM_FEEDBACK_BUFFER),
			new BufferBindingState("copy_read_buffer_binding", "COPY_READ_BUFFER_BINDING", gl.COPY_READ_BUFFER_BINDING, gl.COPY_READ_BUFFER),
			new BufferBindingState("copy_write_buffer_binding", "COPY_WRITE_BUFFER_BINDING", gl.COPY_WRITE_BUFFER_BINDING, gl.COPY_WRITE_BUFFER)
		];

		for (vartestNdx = 0; testNdx < bufferBindingStates.length; testNdx++)
			normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.BufferBindingTestCase(verifier, bufferBindingStates[testNdx].name + verifier.getTestNamePostfix(), bufferBindingStates[testNdx].description, bufferBindingStates[testNdx].target, bufferBindingStates[testNdx].type)); });

		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.ElementArrayBufferBindingTestCase(verifier, "element_array_buffer_binding" + verifier.getTestNamePostfix())); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.TransformFeedbackBindingTestCase(verifier, "transform_feedback_binding" + verifier.getTestNamePostfix())); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.CurrentProgramBindingTestCase(verifier, "current_program_binding" + verifier.getTestNamePostfix(),	"CURRENT_PROGRAM")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.VertexArrayBindingTestCase(verifier, "vertex_array_binding" + verifier.getTestNamePostfix(),	"VERTEX_ARRAY_BINDING")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.StencilClearValueTestCase(verifier, "stencil_clear_value" + verifier.getTestNamePostfix(),	"STENCIL_CLEAR_VALUE")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.ActiveTextureTestCase(verifier, "active_texture" + verifier.getTestNamePostfix(),	"ACTIVE_TEXTURE")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.RenderbufferBindingTestCase(verifier, "renderbuffer_binding" + verifier.getTestNamePostfix(),	"RENDERBUFFER_BINDING")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.SamplerObjectBindingTestCase(verifier, "sampler_binding" + verifier.getTestNamePostfix(),	"SAMPLER_BINDING")); });

		/**
		 * @struct
		 * @constructor
		 * @param {string} name
		 * @param {string} description
		 * @param {number} target
		 * @param {number} type
		 */
		TextureBinding = function(name, description, target, type) {
			/** @type {string} */ this.name = name;
			/** @type {string} */ this.description = description;
			/** @type {number} */ this.target = target;
			/** @type {number} */ this.type = type;
		};

		/** @type {Array<TextureBinding>} */ var textureBindings = [
			new TextureBinding("texture_binding_2d", "TEXTURE_BINDING_2D", gl.TEXTURE_BINDING_2D, gl.TEXTURE_2D),
			new TextureBinding("texture_binding_3d", "TEXTURE_BINDING_3D", gl.TEXTURE_BINDING_3D, gl.TEXTURE_3D),
			new TextureBinding("texture_binding_2d_array", "TEXTURE_BINDING_2D_ARRAY", gl.TEXTURE_BINDING_2D_ARRAY, gl.TEXTURE_2D_ARRAY),
			new TextureBinding("texture_binding_cube_map", "TEXTURE_BINDING_CUBE_MAP", gl.TEXTURE_BINDING_CUBE_MAP, gl.TEXTURE_CUBE_MAP)
		];

		for (var testNdx = 0; testNdx < textureBindings.length; testNdx++)
			normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.TextureBindingTestCase(verifier, textureBindings[testNdx].name + verifier.getTestNamePostfix(), textureBindings[testNdx].description, textureBindings[testNdx].target, textureBindings[testNdx].type)); });

		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.FrameBufferBindingTestCase(verifier, "framebuffer_binding" + verifier.getTestNamePostfix(), "DRAW_FRAMEBUFFER_BINDING and READ_FRAMEBUFFER_BINDING")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.ImplementationColorReadTestCase(verifier, "implementation_color_read" + verifier.getTestNamePostfix(), "IMPLEMENTATION_COLOR_READ_TYPE and IMPLEMENTATION_COLOR_READ_FORMAT")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.ReadBufferCase(verifier, "read_buffer" + verifier.getTestNamePostfix(), "READ_BUFFER")); });
		normalVerifiers.forEach(function(verifier) { testCtx.addChild(new es3fIntegetStateQueryTests.DrawBufferCase(verifier, "draw_buffer" + verifier.getTestNamePostfix(), "DRAW_BUFFER")); });

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
