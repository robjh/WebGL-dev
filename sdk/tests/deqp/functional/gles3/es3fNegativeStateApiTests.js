/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL ES 3.0 Module
 * -------------------------------------------------
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
 *//*!
 * \file
 * \brief Negative GL State API tests.
 *//*--------------------------------------------------------------------*/
'use strict';
goog.provide('functional.gles3.es3fNegativeStateApiTests');

goog.require('framework.common.tcuTestCase');
goog.require('framework.common.tcuTexture');
goog.require('functional.gles3.es3fApiCase');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.opengl.simplereference.sglrGLContext');

goog.scope(function() {

	var es3fNegativeStateApiTests = functional.gles3.es3fNegativeStateApiTests;
	var tcuTexture = framework.common.tcuTexture;
	var es3fApiCase = functional.gles3.es3fApiCase;
	var tcuTestCase = framework.common.tcuTestCase;
	var gluShaderProgram = framework.opengl.gluShaderProgram;
	var sglrGLContext = framework.opengl.simplereference.sglrGLContext;

	/**
	* @type {string}
	* @const
	*/
	var uniformTestVertSource = '#version 300 es\n' +
	'uniform mediump vec4 vUnif_vec4;\n' +
	'in mediump vec4 attr;\n' +
	'layout(shared) uniform Block { mediump vec4 blockVar; };\n' +
	'void main (void)\n' +
	'{\n' +
	'	gl_Position = vUnif_vec4 + blockVar + attr;\n' +
	'}\n';

	/**
	* @type {string}
	* @const
	*/
	var uniformTestFragSource = '#version 300 es\n' +
	'uniform mediump ivec4 fUnif_ivec4;\n' +
	'uniform mediump uvec4 fUnif_uvec4;\n' +
	'layout(location = 0) out mediump vec4 fragColor;\n' +
	'void main (void)\n' +
	'{\n' +
	'	fragColor = vec4(vec4(fUnif_ivec4) + vec4(fUnif_uvec4));\n' +
	'}\n';

	/**
	* @param {WebGL2RenderingContext} gl
	*/
	es3fNegativeStateApiTests.init = function(gl) {

		var testGroup = tcuTestCase.runner.testCases;

		// Enabling & disabling states

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('enable', 'Invalid gl.enable() usage', gl, function()
		{
			bufferedLogToConsole('gl.INVALID_ENUM is generated if cap is not one of the allowed values.');
			gl.enable(-1);
			this.expectError(gl.INVALID_ENUM);

		}));
		testGroup.addChild(new es3fApiCase.ApiCaseCallback('disable', 'Invalid gl.disable() usage', gl, function()
		{
			bufferedLogToConsole('gl.INVALID_ENUM is generated if cap is not one of the allowed values.');
			gl.disable(-1);
			this.expectError(gl.INVALID_ENUM);

		}));

		// Simple state queries

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_booleanv', 'Invalid glGetBooleanv() usage', gl, function()
		{
			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not one of the allowed values.');
			/** @type{boolean} */ var  params = false;
			//glGetBooleanv(-1, params);
			params = /** @type{boolean} */ (gl.getParameter(-1));
			this.expectError(gl.INVALID_ENUM);

		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_floatv', 'Invalid glGetFloatv() usage', gl, function()
		{
			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not one of the allowed values.');
			/** @type{number} */ var params = 0.0;
			// glGetFloatv(-1, params);
			params = /** @type{number} */ (gl.getParameter(-1));
			this.expectError(gl.INVALID_ENUM);

		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_integerv', 'Invalid gl.getParameter() usage', gl, function()
		{
			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not one of the allowed values.');
			/** @type{number} */ var params = -1;
			// gl.getParameter(-1, params);
			params = /** @type{number} */ (gl.getParameter(-1));
			this.expectError(gl.INVALID_ENUM);

		}));
		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_integer64v', 'Invalid glGetInteger64v() usage', gl, function()
		{
			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not one of the allowed values.');
			/** @type{number} */ var params = -1;
			params = /** @type{number} */ (gl.getParameter(-1));
			this.expectError(gl.INVALID_ENUM);

		}));
		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_integeri_v', 'Invalid glGetIntegeri_v() usage', gl, function()
		{
			/** @type{number} */ var data = -1;
			/** @type{number} */ var maxUniformBufferBindings;

			bufferedLogToConsole('gl.INVALID_ENUM is generated if name is not an accepted value.');
			data = /** @type{number} */ (gl.getIndexedParameter(-1, 0));
			this.expectError(gl.INVALID_ENUM);


			bufferedLogToConsole('gl.INVALID_VALUE is generated if index is outside of the valid range for the indexed state target.');
			maxUniformBufferBindings = /** @type{number} */ (gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS));
			this.expectError(gl.NO_ERROR);
			data = /** @type{number} */ (gl.getIndexedParameter(gl.UNIFORM_BUFFER_BINDING, maxUniformBufferBindings));
			this.expectError(gl.INVALID_VALUE);

		}));
		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_integer64i_v', 'Invalid gl.getIndexedParameter() usage', gl, function()
		{
			/** @type{number} */ var data = -1;
			/** @type{number} */ var maxUniformBufferBindings;

			bufferedLogToConsole('gl.INVALID_ENUM is generated if name is not an accepted value.');
			data = /** @type{number} */ (gl.getIndexedParameter(-1, 0));
			this.expectError(gl.INVALID_ENUM);


			bufferedLogToConsole('gl.INVALID_VALUE is generated if index is outside of the valid range for the indexed state target.');
			maxUniformBufferBindings = /** @type{number} */ (gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS));
			this.expectError(gl.NO_ERROR);
			data = /** @type{number} */ (gl.getIndexedParameter(gl.UNIFORM_BUFFER_START, maxUniformBufferBindings));
			this.expectError(gl.INVALID_VALUE);

		}));
		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_string', 'Invalid glGetString() usage', gl, function()
		{
			bufferedLogToConsole('gl.INVALID_ENUM is generated if name is not an accepted value.');
			gl.getParameter(-1);
			this.expectError(gl.INVALID_ENUM);

		}));

		// NOTE: the target "gl.EXTENSIONS" is not valid. this test should be removed.
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_stringi', 'Invalid glGetStringi() usage', gl, function()
		// {
		// 	/** @type{number} */ var numExtensions;
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if name is not an accepted value.');
		// 	gl.getParameter(-1);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if index is outside the valid range for indexed state name.');
		// 	numExtensions = /** @type{number} */ (gl.getParameter(gl.NUM_EXTENSIONS));
		// 	gl.getParameter(gl.EXTENSIONS, numExtensions);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		// }));

		// Enumerated state queries: Shaders

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_attached_shaders', 'Invalid gl.getAttachedShaders() usage', gl, function()
		{
			/** @type{Array<WebGLShader>} */ var shaders = [];
			/** @type{WebGLShader} */ var shaderObject = gl.createShader(gl.VERTEX_SHADER);
			/** @type{WebGLProgram} */ var program = gl.createProgram();

			bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
			shaders = gl.getAttachedShaders(null);
			this.expectError(gl.INVALID_VALUE);

			bufferedLogToConsole('gl.INVALID_VALUE is generated if maxCount is less than 0.');
			shaders = gl.getAttachedShaders(program);
			this.expectError(gl.INVALID_VALUE);


			gl.deleteShader(shaderObject);
			gl.deleteProgram(program);
		}));

		// NOTE: SHADER_COMPILER attribute was removed from webgl spec, so we won't test that
		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_shaderiv', 'Invalid glGetShaderiv() usage', gl, function()
		{
			// /** @type{boolean} */ var  shaderCompilerSupported;
			// glGetBooleanv(gl.SHADER_COMPILER, &shaderCompilerSupported);
			// bufferedLogToConsole('// gl.SHADER_COMPILER = ' + (shaderCompilerSupported ? 'gl.TRUE' : 'false'));

			/** @type{WebGLShader} */ var shader = gl.createShader(gl.VERTEX_SHADER);
			/** @type{WebGLProgram} */ var program = gl.createProgram();
			/** @type{number} */ var param = -1;

			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
			param = /** @type{number} */ (gl.getShaderParameter(shader, -1));
			this.expectError(gl.INVALID_ENUM);


			bufferedLogToConsole('gl.INVALID_VALUE is generated if shader is not a value generated by OpenGL.');
			param = /** @type{number} */ (gl.getShaderParameter(null, gl.SHADER_TYPE));
			this.expectError(gl.INVALID_VALUE);

			gl.deleteShader(shader);
			gl.deleteProgram(program);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_shader_info_log', 'Invalid gl.getShaderInfoLog() usage', gl, function()
		{
			/** @type{WebGLShader} */ var shader = gl.createShader(gl.VERTEX_SHADER);
			/** @type{WebGLProgram} */ var program = gl.createProgram();
			/** @type{string} */ var infoLog;

			bufferedLogToConsole('gl.INVALID_VALUE is generated if shader is not a value generated by OpenGL.');
			infoLog = gl.getShaderInfoLog(null);
			this.expectError(gl.INVALID_VALUE);

			bufferedLogToConsole('gl.INVALID_VALUE is generated if maxLength is less than 0.');
			infoLog = gl.getShaderInfoLog(shader);
			this.expectError(gl.INVALID_VALUE);


			gl.deleteShader(shader);
			gl.deleteProgram(program);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_shader_precision_format', 'Invalid gl.getShaderPrecisionFormat() usage', gl, function()
		{
			/** @type{WebGLShaderPrecisionFormat } */ var precision;

			bufferedLogToConsole('gl.INVALID_ENUM is generated if shaderType or precisionType is not an accepted value.');
			precision = gl.getShaderPrecisionFormat (-1, gl.MEDIUM_FLOAT);
			this.expectError(gl.INVALID_ENUM);
			precision = gl.getShaderPrecisionFormat (gl.VERTEX_SHADER, -1);
			this.expectError(gl.INVALID_ENUM);
			precision = gl.getShaderPrecisionFormat (-1, -1);
			this.expectError(gl.INVALID_ENUM);

		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_shader_source', 'Invalid gl.getShaderSource() usage', gl, function()
		{
			/** @type{string} */ var source;
			/** @type{WebGLProgram} */ var program = gl.createProgram();
			/** @type{WebGLShader} */ var shader = gl.createShader(gl.VERTEX_SHADER);

			bufferedLogToConsole('gl.INVALID_VALUE is generated if shader is not a value generated by OpenGL.');
			source = gl.getShaderSource(null);
			this.expectError(gl.INVALID_VALUE);

			bufferedLogToConsole('gl.INVALID_VALUE is generated if bufSize is less than 0.');
			source = gl.getShaderSource(shader);
			this.expectError(gl.INVALID_VALUE);


			gl.deleteProgram(program);
			gl.deleteShader(shader);
		}));

		// Enumerated state queries: Programs

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_programiv', 'Invalid gl.getProgramParameter() usage', gl, function()
		{
			/** @type{WebGLProgram} */ var program = gl.createProgram();
			/** @type{WebGLShader} */ var shader = gl.createShader(gl.VERTEX_SHADER);
			/** @type{boolean} */ var params;

			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
			params = /** @type{boolean} */ (gl.getProgramParameter(program, -1));
			this.expectError(gl.INVALID_ENUM);

			bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
			params = /** @type{boolean} */ (gl.getProgramParameter(null, gl.LINK_STATUS));
			this.expectError(gl.INVALID_VALUE);

			gl.deleteProgram(program);
			gl.deleteShader(shader);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_program_info_log', 'Invalid gl.getProgramInfoLog() usage', gl, function()
		{
			/** @type{WebGLProgram} */ var program = gl.createProgram();
			/** @type{WebGLShader} */ var shader = gl.createShader(gl.VERTEX_SHADER);
			/** @type{string} */ var infoLog;

			bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
			infoLog = gl.getProgramInfoLog (null);
			this.expectError(gl.INVALID_VALUE);

			bufferedLogToConsole('gl.INVALID_VALUE is generated if maxLength is less than 0.');
			infoLog = gl.getProgramInfoLog (program);
			this.expectError(gl.INVALID_VALUE);


			gl.deleteProgram(program);
			gl.deleteShader(shader);
		}));

		// Enumerated state queries: Shader variables

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_tex_parameterfv', 'Invalid gl.texParameterf() usage', gl, function()
		{
			/** @type{number} */ var params = 0;

			bufferedLogToConsole('gl.INVALID_ENUM is generated if target or pname is not an accepted value.');
			gl.texParameterf (-1, gl.TEXTURE_MAG_FILTER, params);
			this.expectError(gl.INVALID_ENUM);
			gl.texParameterf (gl.TEXTURE_2D, -1, params);
			this.expectError(gl.INVALID_ENUM);
			gl.texParameterf (-1, -1, params);
			this.expectError(gl.INVALID_ENUM);

		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_tex_parameteriv', 'Invalid gl.texParameteri() usage', gl, function()
		{
			/** @type{number} */ var params = 0;

			bufferedLogToConsole('gl.INVALID_ENUM is generated if target or pname is not an accepted value.');
			gl.texParameteri (-1, gl.TEXTURE_MAG_FILTER, params);
			this.expectError(gl.INVALID_ENUM);
			gl.texParameteri (gl.TEXTURE_2D, -1, params);
			this.expectError(gl.INVALID_ENUM);
			gl.texParameteri (-1, -1, params);
			this.expectError(gl.INVALID_ENUM);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_uniformfv', 'Invalid gl.getUniform() usage', gl, function()
		{
			/** @type{gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl,gluShaderProgram.makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
			gl.useProgram(program.getProgram());

			/** @type{WebGLUniformLocation} */ var unif = gl.getUniformLocation(program.getProgram(), 'vUnif_vec4');	// vec4
			assertMsgOptions(unif != null, 'Failed to retrieve uniform location', false, true);

			/** @type{WebGLShader} */ var shader = gl.createShader(gl.VERTEX_SHADER);
			/** @type{WebGLProgram} */ var programEmpty = gl.createProgram();
			/** @type{*} */ var params;

			bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
			params = gl.getUniform (null, unif);
			this.expectError(gl.INVALID_VALUE);

			bufferedLogToConsole('gl.INVALID_OPERATION is generated if program has not been successfully linked.');
			params = gl.getUniform (programEmpty, unif);
			this.expectError(gl.INVALID_OPERATION);


			bufferedLogToConsole('gl.INVALID_OPERATION is generated if location does not correspond to a valid uniform variable location for the specified program object.');
			params = gl.getUniform (program.getProgram(), null);
			this.expectError(gl.INVALID_OPERATION);


			gl.deleteShader(shader);
			gl.deleteProgram(programEmpty);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_uniformiv', 'Invalid params = gl.getUniform() usage', gl, function()
		{
			/** @type{gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl,gluShaderProgram.makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
			gl.useProgram(program.getProgram());

			/** @type{WebGLUniformLocation} */ var unif = gl.getUniformLocation(program.getProgram(), 'fUnif_ivec4');	// ivec4
			assertMsgOptions(unif != null, 'Failed to retrieve uniform location', false, true);

			/** @type{WebGLShader} */ var shader = gl.createShader(gl.VERTEX_SHADER);
			/** @type{WebGLProgram} */ var programEmpty = gl.createProgram();
			/** @type{*} */ var params;

			bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
			params = gl.getUniform (null, unif);
			this.expectError(gl.INVALID_VALUE);

			bufferedLogToConsole('gl.INVALID_OPERATION is generated if program has not been successfully linked.');
			params = gl.getUniform (programEmpty, unif);
			this.expectError(gl.INVALID_OPERATION);


			bufferedLogToConsole('gl.INVALID_OPERATION is generated if location does not correspond to a valid uniform variable location for the specified program object.');
			params = gl.getUniform (program.getProgram(), null);
			this.expectError(gl.INVALID_OPERATION);

			gl.deleteShader(shader);
			gl.deleteProgram(programEmpty);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_uniformuiv', 'Invalid params = gl.getUniform() usage', gl, function()
		{
			/** @type{gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl,gluShaderProgram.makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
			gl.useProgram(program.getProgram());

			/** @type{WebGLUniformLocation} */ var unif = gl.getUniformLocation(program.getProgram(), 'fUnif_uvec4');	// uvec4
			assertMsgOptions(unif != null, 'Failed to retrieve uniform location', false, true);

			/** @type{WebGLShader} */ var shader = gl.createShader(gl.VERTEX_SHADER);
			/** @type{WebGLProgram} */ var programEmpty = gl.createProgram();
			/** @type{*} */ var params;

			bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
			params = gl.getUniform (null, unif);
			this.expectError(gl.INVALID_VALUE);

			bufferedLogToConsole('gl.INVALID_OPERATION is generated if program has not been successfully linked.');
			params = gl.getUniform (programEmpty, unif);
			this.expectError(gl.INVALID_OPERATION);


			bufferedLogToConsole('gl.INVALID_OPERATION is generated if location does not correspond to a valid uniform variable location for the specified program object.');
			params = gl.getUniform (program.getProgram(), null);
			this.expectError(gl.INVALID_OPERATION);

			gl.deleteShader(shader);
			gl.deleteProgram(programEmpty);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_active_uniform', 'Invalid gl.getActiveUniform() usage', gl, function()
		{
			/** @type{WebGLShader} */ var shader = gl.createShader(gl.VERTEX_SHADER);
			/** @type{gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl,gluShaderProgram.makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
			/** @type{number} */ var numActiveUniforms	= -1;

			numActiveUniforms = /** @type{number} */ (gl.getProgramParameter(program.getProgram(), gl.ACTIVE_UNIFORMS));
			bufferedLogToConsole('// gl.ACTIVE_UNIFORMS = ' + numActiveUniforms + ' (expected 4).');

			bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
			gl.getActiveUniform(null, 0);
			this.expectError(gl.INVALID_VALUE);

			bufferedLogToConsole('gl.INVALID_VALUE is generated if index is greater than or equal to the number of active uniform variables in program.');
			gl.useProgram(program.getProgram());
			gl.getActiveUniform(program.getProgram(), numActiveUniforms);
			this.expectError(gl.INVALID_VALUE);


			bufferedLogToConsole('gl.INVALID_VALUE is generated if bufSize is less than 0.');
			gl.getActiveUniform(program.getProgram(), 0);
			this.expectError(gl.INVALID_VALUE);

			gl.useProgram(null);
			gl.deleteShader(shader);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_active_uniformsiv', 'Invalid gl.getActiveUniforms() usage', gl, function()
		{
			/** @type{WebGLShader} */ var shader  = gl.createShader(gl.VERTEX_SHADER);
			/** @type{gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl,gluShaderProgram.makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
			/** @type{Array<number>} */ var dummyUniformIndex = [1];
			/** @type{Array<number>} */ var dummyParamDst;
			/** @type{number} */ var numActiveUniforms = -1;

			gl.useProgram(program.getProgram());

			numActiveUniforms = /** @type{number} */ (gl.getProgramParameter(program.getProgram(), gl.ACTIVE_UNIFORMS));
			bufferedLogToConsole('// gl.ACTIVE_UNIFORMS = ' + numActiveUniforms + ' (expected 4).');

			bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
			dummyParamDst = gl.getActiveUniforms(null, dummyUniformIndex, gl.UNIFORM_TYPE);
			this.expectError(gl.INVALID_VALUE);

			bufferedLogToConsole('gl.INVALID_VALUE is generated if any value in uniformIndices is greater than or equal to the value of gl.ACTIVE_UNIFORMS for program.');
			/** @type{Array<number>} */ var invalidUniformIndices;
			/** @type{Array<number>} */ var dummyParamsDst;
			for (var excess = 0; excess <= 2; excess++)	{
				invalidUniformIndices = [1, numActiveUniforms - 1 + excess, 1];
				dummyParamsDst = gl.getActiveUniforms(program.getProgram(), invalidUniformIndices, gl.UNIFORM_TYPE);
				this.expectError(excess == 0 ? gl.NO_ERROR : gl.INVALID_VALUE);
			}

			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted token.');
			dummyParamDst = gl.getActiveUniforms(program.getProgram(), dummyUniformIndex, -1);
			this.expectError(gl.INVALID_ENUM);


			gl.useProgram(null);
			gl.deleteShader(shader);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_active_uniform_blockiv', 'Invalid gl.getActiveUniformBlockParameter() usage', gl, function()
		{
			/** @type{gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl,gluShaderProgram.makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
			/** @type{*} */ var params;
			/** @type{number} */ var numActiveBlocks = -1;

			numActiveBlocks = /** @type{number} */ (gl.getProgramParameter(program.getProgram(), gl.ACTIVE_UNIFORM_BLOCKS));
			bufferedLogToConsole('// gl.ACTIVE_UNIFORM_BLOCKS = ' + numActiveBlocks + ' (expected 1).');
			this.expectError(gl.NO_ERROR);

			bufferedLogToConsole('gl.INVALID_VALUE is generated if uniformBlockIndex is greater than or equal to the value of gl.ACTIVE_UNIFORM_BLOCKS or is not the index of an active uniform block in program.');
			gl.useProgram(program.getProgram());
			this.expectError(gl.NO_ERROR);
			params = gl.getActiveUniformBlockParameter(program.getProgram(), numActiveBlocks, gl.UNIFORM_BLOCK_BINDING);
			this.expectError(gl.INVALID_VALUE);


			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not one of the accepted tokens.');
			params = gl.getActiveUniformBlockParameter(program.getProgram(), 0, -1);
			this.expectError(gl.INVALID_ENUM);

			gl.useProgram(null);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_active_uniform_block_name', 'Invalid gl.getActiveUniformBlockName() usage', gl, function()
		{
			/** @type{gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl,gluShaderProgram.makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
			/** @type{number} */ var length	= -1;
			/** @type{number} */ var numActiveBlocks = -1;
			/** @type{string} */ var uniformBlockName;

			numActiveBlocks = /** @type{number} */ (gl.getProgramParameter(program.getProgram(), gl.ACTIVE_UNIFORM_BLOCKS));
			bufferedLogToConsole('// gl.ACTIVE_UNIFORM_BLOCKS = ' + numActiveBlocks + ' (expected 1).');
			this.expectError(gl.NO_ERROR);

			bufferedLogToConsole('gl.INVALID_VALUE is generated if uniformBlockIndex is greater than or equal to the value of gl.ACTIVE_UNIFORM_BLOCKS or is not the index of an active uniform block in program.');
			gl.useProgram(program.getProgram());
			this.expectError(gl.NO_ERROR);
			uniformBlockName = gl.getActiveUniformBlockName(program.getProgram(), numActiveBlocks);
			this.expectError(gl.INVALID_VALUE);

			gl.useProgram(null);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_active_attrib', 'Invalid gl.getActiveAttrib() usage', gl, function()
		{
			/** @type{WebGLShader} */ var shader = gl.createShader(gl.VERTEX_SHADER);
			/** @type{gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl,gluShaderProgram.makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
			/** @type{number} */ var numActiveAttributes	= -1;

			/** @type{WebGLActiveInfo} */ var activeInfo;
			/** @type{number} */ var size = -1;
			/** @type{number} */ var type = -1;
			/** @type{string} */ var name;

			numActiveAttributes = /** @type{number} */(gl.getProgramParameter(program.getProgram(), gl.ACTIVE_ATTRIBUTES));
			bufferedLogToConsole('// gl.ACTIVE_ATTRIBUTES = ' + numActiveAttributes + ' (expected 1).');

			gl.useProgram(program.getProgram());

			bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
			activeInfo = gl.getActiveAttrib(null, 0);
			this.expectError(gl.INVALID_VALUE);

			bufferedLogToConsole('gl.INVALID_VALUE is generated if index is greater than or equal to gl.ACTIVE_ATTRIBUTES.');
			activeInfo = gl.getActiveAttrib(program.getProgram(), numActiveAttributes);
			this.expectError(gl.INVALID_VALUE);

			bufferedLogToConsole('gl.INVALID_VALUE is generated if bufSize is less than 0.');
			activeInfo = gl.getActiveAttrib(program.getProgram(), 0);
			this.expectError(gl.INVALID_VALUE);

			gl.useProgram(null);
			gl.deleteShader(shader);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_uniform_indices', 'Invalid gl.getUniformIndices() usage', gl, function()
		{
			/** @type{WebGLShader} */ var shader = gl.createShader(gl.VERTEX_SHADER);
			/** @type{gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl,gluShaderProgram.makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
			gl.useProgram(program.getProgram());
			/** @type{number} */ var numActiveBlocks = -1;
			/** @type{Array<string>} */ var uniformName = ['Block.blockVar'];
			/** @type{Array<number>} */ var uniformIndices = [-1];

			numActiveBlocks = /** @type{number} */(gl.getProgramParameter(program.getProgram(), gl.ACTIVE_UNIFORM_BLOCKS));
			bufferedLogToConsole('// gl.ACTIVE_UNIFORM_BLOCKS = ' + numActiveBlocks);
			this.expectError		(gl.NO_ERROR);

			bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not name of program or shader object.');
			uniformIndices = gl.getUniformIndices(null, uniformName);
			this.expectError(gl.INVALID_VALUE);

			gl.useProgram(null);
			gl.deleteShader(shader);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_vertex_attribfv', 'Invalid gl.getVertexAttrib() usage', gl, function()
		{
			/** @type{*} */ var params;

			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
			params = gl.getVertexAttrib(0, -1);
			this.expectError(gl.INVALID_ENUM);


			bufferedLogToConsole('gl.INVALID_VALUE is generated if index is greater than or equal to gl.MAX_VERTEX_ATTRIBS.');
			/** @type{number} */ var maxVertexAttribs;
			maxVertexAttribs = /** @type{number} */ (gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
			params = gl.getVertexAttrib(maxVertexAttribs, gl.VERTEX_ATTRIB_ARRAY_ENABLED);
			this.expectError(gl.INVALID_VALUE);

		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_vertex_attribiv', 'Invalid gl.getVertexAttrib() usage', gl, function()
		{
			/** @type{*} */ var params;

			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
			params = gl.getVertexAttrib(0, -1);
			this.expectError(gl.INVALID_ENUM);


			bufferedLogToConsole('gl.INVALID_VALUE is generated if index is greater than or equal to gl.MAX_VERTEX_ATTRIBS.');
			/** @type{number} */ var maxVertexAttribs;
			maxVertexAttribs = /** @type{number} */ (gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
			params = gl.getVertexAttrib(maxVertexAttribs, gl.VERTEX_ATTRIB_ARRAY_ENABLED);
			this.expectError(gl.INVALID_VALUE);

		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_vertex_attribi_iv', 'Invalid gl.getVertexAttrib() usage', gl, function()
		{
			/** @type{*} */ var params;

			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
			params = gl.getVertexAttrib(0, -1);
			this.expectError(gl.INVALID_ENUM);


			bufferedLogToConsole('gl.INVALID_VALUE is generated if index is greater than or equal to gl.MAX_VERTEX_ATTRIBS.');
			/** @type{number} */ var maxVertexAttribs;
			maxVertexAttribs = /** @type{number} */ (gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
			params = gl.getVertexAttrib(maxVertexAttribs, gl.VERTEX_ATTRIB_ARRAY_ENABLED);
			this.expectError(gl.INVALID_VALUE);

		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_vertex_attribi_uiv', 'Invalid gl.getVertexAttrib() usage', gl, function()
		{
			/** @type{*} */ var params;

			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
			params = gl.getVertexAttrib(0, -1);
			this.expectError(gl.INVALID_ENUM);


			bufferedLogToConsole('gl.INVALID_VALUE is generated if index is greater than or equal to gl.MAX_VERTEX_ATTRIBS.');
			/** @type{number} */ var maxVertexAttribs;
			maxVertexAttribs = /** @type{number} */ (gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
			params = gl.getVertexAttrib(maxVertexAttribs, gl.VERTEX_ATTRIB_ARRAY_ENABLED);
			this.expectError(gl.INVALID_VALUE);

		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_vertex_attrib_pointerv', 'Invalid gl.getVertexAttribOffset() usage', gl, function()
		{
			/** @type{number} */ var ptr;

			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
			ptr = gl.getVertexAttribOffset(0, -1);
			this.expectError(gl.INVALID_ENUM);


			bufferedLogToConsole('gl.INVALID_VALUE is generated if index is greater than or equal to gl.MAX_VERTEX_ATTRIBS.');
			/** @type{number} */ var maxVertexAttribs;
			maxVertexAttribs = /** @type{number} */ (gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
			ptr = gl.getVertexAttribOffset(maxVertexAttribs, gl.VERTEX_ATTRIB_ARRAY_POINTER);
			this.expectError(gl.INVALID_VALUE);

		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_frag_data_location', 'Invalid gl.getFragDataLocation() usage', gl, function()
		{
			/** @type{WebGLShader} */ var shader = gl.createShader(gl.VERTEX_SHADER);
			/** @type{WebGLProgram} */ var program = gl.createProgram();

			bufferedLogToConsole('gl.INVALID_OPERATION is generated if program has not been linked.');
			gl.getFragDataLocation(program, 'gl_FragColor');
			this.expectError(gl.INVALID_OPERATION);

			gl.deleteProgram(program);
			gl.deleteShader(shader);
		}));

		// Enumerated state queries: Buffers

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_buffer_parameteriv', 'Invalid gl.getBufferParameter() usage', gl, function()
		{
			/** @type{number} */ var params = -1;
			/** @type{WebGLBuffer} */ var buf;
			buf = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buf);

			bufferedLogToConsole('gl.INVALID_ENUM is generated if target or value is not an accepted value.');
			params = /** @type{number} */ (gl.getBufferParameter(-1, gl.BUFFER_SIZE));
			this.expectError(gl.INVALID_ENUM);
			params = /** @type{number} */ (gl.getBufferParameter(gl.ARRAY_BUFFER, -1));
			this.expectError(gl.INVALID_ENUM);
			params = /** @type{number} */ (gl.getBufferParameter(-1, -1));
			this.expectError(gl.INVALID_ENUM);

			bufferedLogToConsole('gl.INVALID_OPERATION is generated if the reserved buffer object name 0 is bound to target.');
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			params = /** @type{number} */ (gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE));
			this.expectError(gl.INVALID_OPERATION);

			gl.deleteBuffer(buf);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_buffer_parameteri64v', 'Invalid gl.getBufferParameter() usage', gl, function()
		{
			/** @type{number} */ var params = -1;
			/** @type{WebGLBuffer} */ var buf;
			buf = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buf);

			bufferedLogToConsole('gl.INVALID_ENUM is generated if target or value is not an accepted value.');
			params = /** @type{number} */ (gl.getBufferParameter(-1, gl.BUFFER_SIZE));
			this.expectError(gl.INVALID_ENUM);
			params = /** @type{number} */ (gl.getBufferParameter(gl.ARRAY_BUFFER, -1));
			this.expectError(gl.INVALID_ENUM);
			params = /** @type{number} */ (gl.getBufferParameter(-1, -1));
			this.expectError(gl.INVALID_ENUM);


			bufferedLogToConsole('gl.INVALID_OPERATION is generated if the reserved buffer object name 0 is bound to target.');
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
			this.expectError(gl.INVALID_OPERATION);


			gl.deleteBuffer(buf);
		}));

		// // NOTE: attribute BUFFER_MAP_POINTER is not defined in webgl
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_buffer_pointerv', 'Invalid gl.getVertexAttribOffset() usage', gl, function()
		// {
		// 	/** @type{number} */ var params = -1;
		// 	/** @type{WebGLBuffer} */ var buf;
		// 	buf = gl.createBuffer();
		// 	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if target or pname is not an accepted value.');
		// 	params = /** @type{number} */ (gl.getVertexAttribOffset(gl.ARRAY_BUFFER, -1));
		// 	this.expectError(gl.INVALID_ENUM);
		// 	params = /** @type{number} */ (gl.getVertexAttribOffset(-1, gl.BUFFER_MAP_POINTER));
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if the reserved buffer object name 0 is bound to target.');
		// 	gl.bindBuffer(gl.ARRAY_BUFFER, null);
		// 	params = /** @type{number} */ (gl.getVertexAttribOffset(gl.ARRAY_BUFFER, gl.BUFFER_MAP_POINTER));
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		// 	gl.deleteBuffer(buf);
		// }));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_framebuffer_attachment_parameteriv', 'Invalid gl.getFramebufferAttachmentParameter() usage', gl, function()
		{
			/** @type{*} */ var params;
			/** @type{WebGLFramebuffer} */ var fbo;
			/** @type{Array<WebGLRenderbuffer>} */ var rbo = [];

			fbo = gl.createFramebuffer();
			rbo[0] = gl.createRenderbuffer();
			rbo[1] = gl.createRenderbuffer();

			gl.bindFramebuffer			(gl.FRAMEBUFFER,	fbo);
			gl.bindRenderbuffer			(gl.RENDERBUFFER,	rbo[0]);
			gl.renderbufferStorage		(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 16, 16);
			gl.framebufferRenderbuffer	(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo[0]);
			gl.bindRenderbuffer			(gl.RENDERBUFFER,	rbo[1]);
			gl.renderbufferStorage		(gl.RENDERBUFFER, gl.STENCIL_INDEX8, 16, 16);
			gl.framebufferRenderbuffer	(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, rbo[1]);
			gl.checkFramebufferStatus	(gl.FRAMEBUFFER);
			this.expectError					(gl.NO_ERROR);

			bufferedLogToConsole('gl.INVALID_ENUM is generated if target is not one of the accepted tokens.');
			gl.getFramebufferAttachmentParameter(-1, gl.DEPTH_ATTACHMENT, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE);					// TYPE is gl.RENDERBUFFER
			this.expectError(gl.INVALID_ENUM);


			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not valid for the value of gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE.');
			gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL);	// TYPE is gl.RENDERBUFFER
			this.expectError(gl.INVALID_ENUM);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.BACK, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME);					// TYPE is gl.FRAMEBUFFER_DEFAULT
			this.expectError(gl.INVALID_ENUM);
			gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);


			bufferedLogToConsole('gl.INVALID_OPERATION is generated if attachment is gl.DEPTH_STENCIL_ATTACHMENT and different objects are bound to the depth and stencil attachment points of target.');
			gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME);
			this.expectError(gl.INVALID_OPERATION);


			bufferedLogToConsole('gl.INVALID_OPERATION is generated if the value of gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE is gl.NONE and pname is not gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME.');
			gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME);		// TYPE is gl.NONE
			this.expectError(gl.NO_ERROR);
			gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE);	// TYPE is gl.NONE
			this.expectError(gl.INVALID_OPERATION);


			bufferedLogToConsole('gl.INVALID_OPERATION or gl.INVALID_ENUM is generated if attachment is not one of the accepted values for the current binding of target.');
			gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.BACK, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME);					// A FBO is bound so gl.BACK is invalid
			this.expectError([gl.INVALID_OPERATION, gl.INVALID_ENUM]);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME);		// Default framebuffer is bound so gl.COLOR_ATTACHMENT0 is invalid
			this.expectError([gl.INVALID_OPERATION, gl.INVALID_ENUM]);

			gl.deleteFramebuffer(fbo);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_renderbuffer_parameteriv', 'Invalid gl.getRenderbufferParameter() usage', gl, function()
		{
			/** @type{number} */ var params = -1;
			/** @type{WebGLRenderbuffer} */ var rbo;
			rbo = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);

			bufferedLogToConsole('gl.INVALID_ENUM is generated if target is not gl.RENDERBUFFER.');
			gl.getRenderbufferParameter(-1, gl.RENDERBUFFER_WIDTH);
			this.expectError(gl.INVALID_ENUM);

			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not one of the accepted tokens.');
			gl.getRenderbufferParameter(gl.RENDERBUFFER, -1);
			this.expectError(gl.INVALID_ENUM);

			gl.deleteRenderbuffer(rbo);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_internalformativ', 'Invalid gl.getInternalformatParameter() usage', gl, function()
		{
			/** @type{number} */ var params;

			// deMemset(params[0], 0xcd, sizeof(params));

			bufferedLogToConsole('gl.INVALID_VALUE is generated if bufSize is negative.');
			gl.getInternalformatParameter	(gl.RENDERBUFFER, gl.RGBA8, gl.NUM_SAMPLE_COUNTS);
			this.expectError				(gl.INVALID_VALUE);


			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not gl.SAMPLES or gl.NUM_SAMPLE_COUNTS.');
			gl.getInternalformatParameter	(gl.RENDERBUFFER, gl.RGBA8, -1);
			this.expectError				(gl.INVALID_ENUM);


			bufferedLogToConsole('gl.INVALID_ENUM is generated if internalformat is not color-, depth-, or stencil-renderable.');
			gl.getInternalformatParameter	(gl.RENDERBUFFER, gl.RG8_SNORM, gl.NUM_SAMPLE_COUNTS);
			this.expectError				(gl.INVALID_ENUM);
			gl.getInternalformatParameter	(gl.RENDERBUFFER, gl.COMPRESSED_RGB8_ETC2, gl.NUM_SAMPLE_COUNTS);
			this.expectError				(gl.INVALID_ENUM);


			bufferedLogToConsole('gl.INVALID_ENUM is generated if target is not gl.RENDERBUFFER.');
			gl.getInternalformatParameter	(-1, gl.RGBA8, gl.NUM_SAMPLE_COUNTS);
			this.expectError				(gl.INVALID_ENUM);
			gl.getInternalformatParameter	(gl.FRAMEBUFFER, gl.RGBA8, gl.NUM_SAMPLE_COUNTS);
			this.expectError				(gl.INVALID_ENUM);
			gl.getInternalformatParameter	(gl.TEXTURE_2D, gl.RGBA8, gl.NUM_SAMPLE_COUNTS);
			this.expectError				(gl.INVALID_ENUM);

		}));

		// Query object queries

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_queryiv', 'Invalid gl.getQuery() usage', gl, function()
		{
			/** @type{number} */ var params = -1;

			bufferedLogToConsole('gl.INVALID_ENUM is generated if target or pname is not an accepted value.');
			gl.getQuery	(gl.ANY_SAMPLES_PASSED, -1);
			this.expectError		(gl.INVALID_ENUM);
			gl.getQuery	(-1, gl.CURRENT_QUERY);
			this.expectError		(gl.INVALID_ENUM);
			gl.getQuery	(-1, -1);
			this.expectError		(gl.INVALID_ENUM);

		}));

		testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_query_objectuiv', 'Invalid gl.getQueryParameter() usage', gl, function()
		{

			/** @type{WebGLQuery} */ var id;
			id = gl.createQuery();

			bufferedLogToConsole('gl.INVALID_OPERATION is generated if id is not the name of a query object.');
			gl.getQueryParameter	(null, gl.QUERY_RESULT_AVAILABLE);
			this.expectError			(gl.INVALID_OPERATION);
			bufferedLogToConsole('// Note: ' + id + ' is not a query object yet, since it hasn\'t been used by gl.beginQuery');
			gl.getQueryParameter	(id, gl.QUERY_RESULT_AVAILABLE);
			this.expectError			(gl.INVALID_OPERATION);

			gl.beginQuery		(gl.ANY_SAMPLES_PASSED, id);
			gl.endQuery			(gl.ANY_SAMPLES_PASSED);

			bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
			gl.getQueryParameter	(id, -1);
			this.expectError			(gl.INVALID_ENUM);

			bufferedLogToConsole('gl.INVALID_OPERATION is generated if id is the name of a currently active query object.');
			gl.beginQuery		(gl.ANY_SAMPLES_PASSED, id);
			this.expectError			(gl.NO_ERROR);
			gl.getQueryParameter	(id, gl.QUERY_RESULT_AVAILABLE);
			this.expectError			(gl.INVALID_OPERATION);
			gl.endQuery			(gl.ANY_SAMPLES_PASSED);
			this.expectError			(gl.NO_ERROR);

			gl.deleteQuery(id);
		}));

		// Sync object queries

		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_synciv', 'Invalid glGetSynciv() usage', gl, function()
		// {
		// 	GLsizei length	= -1;
		// 	/** @type{number} */ var	values[32];
		// 	GLsync	sync;
		//
		// 	deMemset(&values[0], 0xcd, sizeof(values));
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if sync is not the name of a sync object.');
		// 	glGetSynciv	(0, gl.OBJECT_TYPE, 32, &length, &values[0]);
		// 	this.expectError	(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not one of the accepted tokens.');
		// 	sync = glFenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
		// 	this.expectError	(gl.NO_ERROR);
		// 	glGetSynciv	(sync, -1, 32, &length, &values[0]);
		// 	this.expectError	(gl.INVALID_ENUM);
		//
		// }));
		//
		// // Enumerated boolean state queries
		//
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('is_enabled', 'Invalid glIsEnabled() usage', gl, function()
		// {
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if cap is not an accepted value.');
		// 	glIsEnabled(-1);
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glIsEnabled(gl.TRIANGLES);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		// }));
		//
		// // Hints
		//
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('hint', 'Invalid glHint() usage', gl, function()
		// {
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if either target or mode is not an accepted value.');
		// 	glHint(gl.GENERATE_MIPMAP_HINT, -1);
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glHint(-1, gl.FASTEST);
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glHint(-1, -1);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		// }));
		//
		// // Named Object Usage
		//
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('is_buffer', 'Invalid glIsBuffer() usage', gl, function()
		// {
		// 	GLuint		buffer = 0;
		// 	/** @type{boolean} */ var 	isBuffer;
		//
		// 	bufferedLogToConsole('A name returned by glGenBuffers, but not yet associated with a buffer object by calling glBindBuffer, is not the name of a buffer object.');
		// 	isBuffer		= glIsBuffer(buffer);
		// 	checkBooleans	(isBuffer, false);
		//
		// 	glGenBuffers	(1, &buffer);
		// 	isBuffer		= glIsBuffer(buffer);
		// 	checkBooleans	(isBuffer, false);
		//
		// 	glBindBuffer	(gl.ARRAY_BUFFER, buffer);
		// 	isBuffer		= glIsBuffer(buffer);
		// 	checkBooleans	(isBuffer, gl.TRUE);
		//
		// 	glBindBuffer	(gl.ARRAY_BUFFER, 0);
		// 	glDeleteBuffers	(1, &buffer);
		// 	isBuffer		= glIsBuffer(buffer);
		// 	checkBooleans	(isBuffer, false);
		//
		//
		// 	this.expectError			(gl.NO_ERROR);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('is_framebuffer', 'Invalid glIsFramebuffer() usage', gl, function()
		// {
		// 	GLuint		fbo = 0;
		// 	/** @type{boolean} */ var 	isFbo;
		//
		// 	bufferedLogToConsole('A name returned by glGenFramebuffers, but not yet bound through a call to gl.bindFramebuffer is not the name of a framebuffer object.');
		// 	isFbo				= glIsFramebuffer(fbo);
		// 	checkBooleans		(isFbo, false);
		//
		// 	glGenFramebuffers	(1, &fbo);
		// 	isFbo				= glIsFramebuffer(fbo);
		// 	checkBooleans		(isFbo, false);
		//
		// 	gl.bindFramebuffer	(gl.FRAMEBUFFER, fbo);
		// 	isFbo				= glIsFramebuffer(fbo);
		// 	checkBooleans		(isFbo, gl.TRUE);
		//
		// 	gl.bindFramebuffer	(gl.FRAMEBUFFER, 0);
		// 	glDeleteFramebuffers(1, &fbo);
		// 	isFbo				= glIsFramebuffer(fbo);
		// 	checkBooleans		(isFbo, false);
		//
		//
		// 	this.expectError			(gl.NO_ERROR);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('is_program', 'Invalid glIsProgram() usage', gl, function()
		// {
		// 	GLuint		program = 0;
		// 	/** @type{boolean} */ var 	isProgram;
		//
		// 	bufferedLogToConsole('A name created with gl.createProgram, and not yet deleted with glDeleteProgram is a name of a program object.');
		// 	isProgram			= glIsProgram(program);
		// 	checkBooleans		(isProgram, false);
		//
		// 	program				= gl.createProgram();
		// 	isProgram			= glIsProgram(program);
		// 	checkBooleans		(isProgram, gl.TRUE);
		//
		// 	glDeleteProgram		(program);
		// 	isProgram			= glIsProgram(program);
		// 	checkBooleans		(isProgram, false);
		//
		//
		// 	this.expectError			(gl.NO_ERROR);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('is_renderbuffer', 'Invalid glIsRenderbuffer() usage', gl, function()
		// {
		// 	GLuint		rbo = 0;
		// 	/** @type{boolean} */ var 	isRbo;
		//
		// 	bufferedLogToConsole('A name returned by glGenRenderbuffers, but not yet bound through a call to gl.bindRenderbuffer or gl.framebufferRenderbuffer is not the name of a renderbuffer object.');
		// 	isRbo					= glIsRenderbuffer(rbo);
		// 	checkBooleans			(isRbo, false);
		//
		// 	glGenRenderbuffers		(1, &rbo);
		// 	isRbo					= glIsRenderbuffer(rbo);
		// 	checkBooleans			(isRbo, false);
		//
		// 	gl.bindRenderbuffer		(gl.RENDERBUFFER, rbo);
		// 	isRbo					= glIsRenderbuffer(rbo);
		// 	checkBooleans			(isRbo, gl.TRUE);
		//
		// 	gl.bindRenderbuffer		(gl.RENDERBUFFER, 0);
		// 	glDeleteRenderbuffers	(1, &rbo);
		// 	isRbo					= glIsRenderbuffer(rbo);
		// 	checkBooleans			(isRbo, false);
		//
		//
		// 	this.expectError			(gl.NO_ERROR);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('is_shader', 'Invalid glIsShader() usage', gl, function()
		// {
		// 	GLuint		shader = 0;
		// 	/** @type{boolean} */ var 	isShader;
		//
		// 	bufferedLogToConsole('A name created with glCreateShader, and not yet deleted with glDeleteShader is a name of a shader object.');
		// 	isShader			= glIsProgram(shader);
		// 	checkBooleans		(isShader, false);
		//
		// 	shader				= gl.createShader(gl.VERTEX_SHADER);
		// 	isShader			= glIsShader(shader);
		// 	checkBooleans		(isShader, gl.TRUE);
		//
		// 	glDeleteShader		(shader);
		// 	isShader			= glIsShader(shader);
		// 	checkBooleans		(isShader, false);
		//
		//
		// 	this.expectError			(gl.NO_ERROR);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('is_texture', 'Invalid glIsTexture() usage', gl, function()
		// {
		// 	GLuint		texture = 0;
		// 	/** @type{boolean} */ var 	isTexture;
		//
		// 	bufferedLogToConsole('A name returned by glGenTextures, but not yet bound through a call to glBindTexture is not the name of a texture.');
		// 	isTexture			= glIsTexture(texture);
		// 	checkBooleans		(isTexture, false);
		//
		// 	glGenTextures		(1, &texture);
		// 	isTexture			= glIsTexture(texture);
		// 	checkBooleans		(isTexture, false);
		//
		// 	glBindTexture		(gl.TEXTURE_2D, texture);
		// 	isTexture			= glIsTexture(texture);
		// 	checkBooleans		(isTexture, gl.TRUE);
		//
		// 	glBindTexture		(gl.TEXTURE_2D, 0);
		// 	glDeleteTextures	(1, &texture);
		// 	isTexture			= glIsTexture(texture);
		// 	checkBooleans		(isTexture, false);
		//
		//
		// 	this.expectError			(gl.NO_ERROR);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('is_query', 'Invalid glIsQuery() usage', gl, function()
		// {
		// 	GLuint		query = 0;
		// 	/** @type{boolean} */ var 	isQuery;
		//
		// 	bufferedLogToConsole('A name returned by glGenQueries, but not yet associated with a query object by calling gl.beginQuery, is not the name of a query object.');
		// 	isQuery				= glIsQuery(query);
		// 	checkBooleans		(isQuery, false);
		//
		// 	glGenQueries		(1, &query);
		// 	isQuery				= glIsQuery(query);
		// 	checkBooleans		(isQuery, false);
		//
		// 	gl.beginQuery		(gl.ANY_SAMPLES_PASSED, query);
		// 	isQuery				= glIsQuery(query);
		// 	checkBooleans		(isQuery, gl.TRUE);
		//
		// 	gl.endQuery			(gl.ANY_SAMPLES_PASSED);
		// 	gl.deleteQuery		(1, &query);
		// 	isQuery				= glIsQuery(query);
		// 	checkBooleans		(isQuery, false);
		//
		//
		// 	this.expectError			(gl.NO_ERROR);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('is_sampler', 'Invalid glIsSampler() usage', gl, function()
		// {
		// 	GLuint		sampler = 0;
		// 	/** @type{boolean} */ var 	isSampler;
		//
		// 	bufferedLogToConsole('A name returned by glGenSamplers is the name of a sampler object.');
		// 	isSampler			= glIsSampler(sampler);
		// 	checkBooleans		(isSampler, false);
		//
		// 	glGenSamplers		(1, &sampler);
		// 	isSampler			= glIsSampler(sampler);
		// 	checkBooleans		(isSampler, gl.TRUE);
		//
		// 	glBindSampler		(0, sampler);
		// 	isSampler			= glIsSampler(sampler);
		// 	checkBooleans		(isSampler, gl.TRUE);
		//
		// 	glDeleteSamplers	(1, &sampler);
		// 	isSampler			= glIsSampler(sampler);
		// 	checkBooleans		(isSampler, false);
		//
		//
		// 	this.expectError			(gl.NO_ERROR);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('is_sync', 'Invalid glIsSync() usage', gl, function()
		// {
		// 	GLsync		sync = 0;
		// 	/** @type{boolean} */ var 	isSync;
		//
		// 	bufferedLogToConsole('A name returned by glFenceSync is the name of a sync object.');
		// 	isSync			= glIsSync(sync);
		// 	checkBooleans	(isSync, false);
		//
		// 	sync			= glFenceSync (gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
		// 	isSync			= glIsSync(sync);
		// 	checkBooleans	(isSync, gl.TRUE);
		//
		// 	glDeleteSync	(sync);
		// 	isSync			= glIsSync(sync);
		// 	checkBooleans	(isSync, false);
		//
		//
		// 	this.expectError			(gl.NO_ERROR);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('is_transform_feedback', 'Invalid glIsTransformFeedback() usage', gl, function()
		// {
		// 	GLuint		tf = 0;
		// 	/** @type{boolean} */ var 	isTF;
		//
		// 	bufferedLogToConsole('A name returned by glGenTransformFeedbacks, but not yet bound using glBindTransformFeedback, is not the name of a transform feedback object.');
		// 	isTF						= glIsTransformFeedback(tf);
		// 	checkBooleans				(isTF, false);
		//
		// 	glGenTransformFeedbacks		(1, &tf);
		// 	isTF						= glIsTransformFeedback(tf);
		// 	checkBooleans				(isTF, false);
		//
		// 	glBindTransformFeedback		(gl.TRANSFORM_FEEDBACK, tf);
		// 	isTF						= glIsTransformFeedback(tf);
		// 	checkBooleans				(isTF, gl.TRUE);
		//
		// 	glBindTransformFeedback		(gl.TRANSFORM_FEEDBACK, 0);
		// 	glDeleteTransformFeedbacks	(1, &tf);
		// 	isTF						= glIsTransformFeedback(tf);
		// 	checkBooleans				(isTF, false);
		//
		//
		// 	this.expectError			(gl.NO_ERROR);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('is_vertex_array', 'Invalid glIsVertexArray() usage', gl, function()
		// {
		// 	GLuint		vao = 0;
		// 	/** @type{boolean} */ var 	isVao;
		//
		// 	bufferedLogToConsole('A name returned by glGenVertexArrays, but not yet bound using glBindVertexArray, is not the name of a vertex array object.');
		// 	isVao					= glIsVertexArray(vao);
		// 	checkBooleans			(isVao, false);
		//
		// 	glGenVertexArrays			(1, &vao);
		// 	isVao					= glIsVertexArray(vao);
		// 	checkBooleans			(isVao, false);
		//
		// 	glBindVertexArray			(vao);
		// 	isVao					= glIsVertexArray(vao);
		// 	checkBooleans			(isVao, gl.TRUE);
		//
		// 	glBindVertexArray		(0);
		// 	glDeleteVertexArrays	(1, &vao);
		// 	isVao					= glIsVertexArray(vao);
		// 	checkBooleans			(isVao, false);
		//
		//
		// 	this.expectError			(gl.NO_ERROR);
		// }));
	};

	/**
	* @param {WebGL2RenderingContext} gl
	*/
	es3fNegativeStateApiTests.run = function(gl) {
		var testName = 'state';
		var testDescription = 'Negative GL State API Cases';
		var state = tcuTestCase.runner;

		state.testName = testName;
		state.testCases = tcuTestCase.newTest(testName, testDescription, null);

		//Set up name and description of this test series.
		setCurrentTestName(testName);
		description(testDescription);
		try {
			es3fNegativeStateApiTests.init(gl);
			tcuTestCase.runner.runCallback(tcuTestCase.runTestCases);
		} catch (err) {
			bufferedLogToConsole(err);
			tcuTestCase.runner.terminate();
		}
	};

});
