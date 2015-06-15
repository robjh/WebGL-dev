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
	'in mediump vec4 attr;' +
	'layout(shared) uniform Block { mediump vec4 blockVar; };\n' +
	'void main (void)\n' +
	'{\n' +
	'	gl_Position = vUnif_vec4 + blockVar + attr;\n' +
	'}\n\0';

	/**
	* @type {string}
	* @const
	*/
	var uniformTestFragSource = '#version 300 es\n' +
	'uniform mediump ivec4 fUnif_ivec4;\n' +
	'uniform mediump uvec4 fUnif_uvec4;\n' +
	'layout(location = 0) out mediump vec4 fragColor;' +
	'void main (void)\n' +
	'{\n' +
	'	fragColor = vec4(vec4(fUnif_ivec4) + vec4(fUnif_uvec4));\n' +
	'}\n\0';

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

		// NOTE: the target "gl.EXTENSIONS" is not valid. this test will be removed.
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

		// // Enumerated state queries: Shaders
		//
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_attached_shaders', 'Invalid glGetAttachedShaders() usage', gl, function()
		// {
		// 	GLuint shaders[1];
		// 	GLuint shaderObject = glCreateShader(gl.VERTEX_SHADER);
		// 	GLuint program		= glCreateProgram();
		// 	GLsizei count[1];
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
		// 	glGetAttachedShaders(-1, 1, &count[0], &shaders[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program is not a program object.');
		// 	glGetAttachedShaders(shaderObject, 1, &count[0], &shaders[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if maxCount is less than 0.');
		// 	glGetAttachedShaders(program, -1, &count[0], &shaders[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	glDeleteShader(shaderObject);
		// 	glDeleteProgram(program);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_shaderiv', 'Invalid glGetShaderiv() usage', gl, function()
		// {
		// 	/** @type{boolean} */ var  shaderCompilerSupported;
		// 	glGetBooleanv(gl.SHADER_COMPILER, &shaderCompilerSupported);
		// 	bufferedLogToConsole('// gl.SHADER_COMPILER = ' + (shaderCompilerSupported ? 'gl.TRUE' : 'false'));
		//
		// 	GLuint shader	= glCreateShader(gl.VERTEX_SHADER);
		// 	GLuint program	= glCreateProgram();
		// 	/** @type{number} */ var param[1]	= { -1 };
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
		// 	glGetShaderiv(shader, -1, &param[0]);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if shader is not a value generated by OpenGL.');
		// 	glGetShaderiv(-1, gl.SHADER_TYPE, &param[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if shader does not refer to a shader object.');
		// 	glGetShaderiv(program, gl.SHADER_TYPE, &param[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	glDeleteShader(shader);
		// 	glDeleteProgram(program);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_shader_info_log', 'Invalid glGetShaderInfoLog() usage', gl, function()
		// {
		// 	GLuint shader	= glCreateShader(gl.VERTEX_SHADER);
		// 	GLuint program	= glCreateProgram();
		// 	GLsizei length[1];
		// 	char infoLog[128];
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if shader is not a value generated by OpenGL.');
		// 	glGetShaderInfoLog(-1, 128, &length[0], &infoLog[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if shader is not a shader object.');
		// 	glGetShaderInfoLog(program, 128, &length[0], &infoLog[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if maxLength is less than 0.');
		// 	glGetShaderInfoLog(shader, -1, &length[0], &infoLog[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	glDeleteShader(shader);
		// 	glDeleteProgram(program);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_shader_precision_format', 'Invalid glGetShaderPrecisionFormat() usage', gl, function()
		// {
		// 	/** @type{boolean} */ var  shaderCompilerSupported;
		// 	glGetBooleanv(gl.SHADER_COMPILER, &shaderCompilerSupported);
		// 	bufferedLogToConsole('// gl.SHADER_COMPILER = ' + (shaderCompilerSupported ? 'gl.TRUE' : 'false'));
		//
		// 	/** @type{number} */ var range[2];
		// 	/** @type{number} */ var precision[1];
		//
		// 	deMemset(&range[0], 0xcd, sizeof(range));
		// 	deMemset(&precision[0], 0xcd, sizeof(precision));
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if shaderType or precisionType is not an accepted value.');
		// 	glGetShaderPrecisionFormat (-1, gl.MEDIUM_FLOAT, &range[0], &precision[0]);
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glGetShaderPrecisionFormat (gl.VERTEX_SHADER, -1, &range[0], &precision[0]);
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glGetShaderPrecisionFormat (-1, -1, &range[0], &precision[0]);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_shader_source', 'Invalid glGetShaderSource() usage', gl, function()
		// {
		// 	GLsizei length[1];
		// 	char source[1];
		// 	GLuint program	= glCreateProgram();
		// 	GLuint shader	= glCreateShader(gl.VERTEX_SHADER);
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if shader is not a value generated by OpenGL.');
		// 	glGetShaderSource(-1, 1, &length[0], &source[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if shader is not a shader object.');
		// 	glGetShaderSource(program, 1, &length[0], &source[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if bufSize is less than 0.');
		// 	glGetShaderSource(shader, -1, &length[0], &source[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	glDeleteProgram(program);
		// 	glDeleteShader(shader);
		// }));
		//
		// // Enumerated state queries: Programs
		//
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_programiv', 'Invalid glGetProgramiv() usage', gl, function()
		// {
		// 	GLuint program	= glCreateProgram();
		// 	GLuint shader	= glCreateShader(gl.VERTEX_SHADER);
		// 	/** @type{number} */ var params[1]	= { -1 };
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
		// 	glGetProgramiv(program, -1, params[0]);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
		// 	glGetProgramiv(-1, gl.LINK_STATUS, params[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program does not refer to a program object.');
		// 	glGetProgramiv(shader, gl.LINK_STATUS, params[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	glDeleteProgram(program);
		// 	glDeleteShader(shader);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_program_info_log', 'Invalid glGetProgramInfoLog() usage', gl, function()
		// {
		// 	GLuint program	= glCreateProgram();
		// 	GLuint shader	= glCreateShader(gl.VERTEX_SHADER);
		// 	GLsizei length[1];
		// 	char infoLog[1];
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
		// 	glGetProgramInfoLog (-1, 1, &length[0], &infoLog[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program is not a program object.');
		// 	glGetProgramInfoLog (shader, 1, &length[0], &infoLog[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if maxLength is less than 0.');
		// 	glGetProgramInfoLog (program, -1, &length[0], &infoLog[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	glDeleteProgram(program);
		// 	glDeleteShader(shader);
		// }));
		//
		// // Enumerated state queries: Shader variables
		//
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_tex_parameterfv', 'Invalid glGetTexParameterfv() usage', gl, function()
		// {
		// 	/** @type{number} */ var params[1];
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if target or pname is not an accepted value.');
		// 	glGetTexParameterfv (-1, gl.TEXTURE_MAG_FILTER, params[0]);
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glGetTexParameterfv (gl.TEXTURE_2D, -1, params[0]);
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glGetTexParameterfv (-1, -1, params[0]);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_tex_parameteriv', 'Invalid glGetTexParameteriv() usage', gl, function()
		// {
		// 	/** @type{number} */ var params[1];
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if target or pname is not an accepted value.');
		// 	glGetTexParameteriv (-1, gl.TEXTURE_MAG_FILTER, params[0]);
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glGetTexParameteriv (gl.TEXTURE_2D, -1, params[0]);
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glGetTexParameteriv (-1, -1, params[0]);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_uniformfv', 'Invalid glGetUniformfv() usage', gl, function()
		// {
		// 	glu::ShaderProgram program(m_context.getRenderContext(), glu::makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
		// 	glUseProgram(program.getProgram());
		//
		// 	/** @type{number} */ var unif = glGetUniformLocation(program.getProgram(), 'vUnif_vec4');	// vec4
		// 	if (unif == -1)
		// 	m_testCtx.setTestResult(QP_TEST_RESULT_FAIL, 'Failed to retrieve uniform location');
		//
		// 	GLuint shader		= glCreateShader(gl.VERTEX_SHADER);
		// 	GLuint programEmpty = glCreateProgram();
		// 	/** @type{number} */ var params[4];
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
		// 	glGetUniformfv (-1, unif, params[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program is not a program object.');
		// 	glGetUniformfv (shader, unif, params[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program has not been successfully linked.');
		// 	glGetUniformfv (programEmpty, unif, params[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if location does not correspond to a valid uniform variable location for the specified program object.');
		// 	glGetUniformfv (program.getProgram(), -1, params[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	glDeleteShader(shader);
		// 	glDeleteProgram(programEmpty);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_uniformiv', 'Invalid glGetUniformiv() usage', gl, function()
		// {
		// 	glu::ShaderProgram program(m_context.getRenderContext(), glu::makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
		// 	glUseProgram(program.getProgram());
		//
		// 	/** @type{number} */ var unif = glGetUniformLocation(program.getProgram(), 'fUnif_ivec4');	// ivec4
		// 	if (unif == -1)
		// 	m_testCtx.setTestResult(QP_TEST_RESULT_FAIL, 'Failed to retrieve uniform location');
		//
		// 	GLuint shader		= glCreateShader(gl.VERTEX_SHADER);
		// 	GLuint programEmpty = glCreateProgram();
		// 	/** @type{number} */ var params[4];
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
		// 	glGetUniformiv (-1, unif, params[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program is not a program object.');
		// 	glGetUniformiv (shader, unif, params[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program has not been successfully linked.');
		// 	glGetUniformiv (programEmpty, unif, params[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if location does not correspond to a valid uniform variable location for the specified program object.');
		// 	glGetUniformiv (program.getProgram(), -1, params[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	glDeleteShader(shader);
		// 	glDeleteProgram(programEmpty);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_uniformuiv', 'Invalid glGetUniformuiv() usage', gl, function()
		// {
		// 	glu::ShaderProgram program(m_context.getRenderContext(), glu::makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
		// 	glUseProgram(program.getProgram());
		//
		// 	/** @type{number} */ var unif = glGetUniformLocation(program.getProgram(), 'fUnif_uvec4');	// uvec4
		// 	if (unif == -1)
		// 	m_testCtx.setTestResult(QP_TEST_RESULT_FAIL, 'Failed to retrieve uniform location');
		//
		// 	GLuint shader		= glCreateShader(gl.VERTEX_SHADER);
		// 	GLuint programEmpty = glCreateProgram();
		// 	GLuint params[4];
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
		// 	glGetUniformuiv (-1, unif, params[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program is not a program object.');
		// 	glGetUniformuiv (shader, unif, params[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program has not been successfully linked.');
		// 	glGetUniformuiv (programEmpty, unif, params[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if location does not correspond to a valid uniform variable location for the specified program object.');
		// 	glGetUniformuiv (program.getProgram(), -1, params[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	glDeleteShader(shader);
		// 	glDeleteProgram(programEmpty);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_active_uniform', 'Invalid glGetActiveUniform() usage', gl, function()
		// {
		// 	GLuint				shader				= glCreateShader(gl.VERTEX_SHADER);
		// 	glu::ShaderProgram	program				(m_context.getRenderContext(), glu::makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
		// 	/** @type{number} */ var				numActiveUniforms	= -1;
		//
		// 	glGetProgramiv	(program.getProgram(), gl.ACTIVE_UNIFORMS,	&numActiveUniforms);
		// 	bufferedLogToConsole('// gl.ACTIVE_UNIFORMS = ' + numActiveUniforms + ' (expected 4).');
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
		// 	glGetActiveUniform(-1, 0, 0, 0, 0, 0, 0);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program is not a program object.');
		// 	glGetActiveUniform(shader, 0, 0, 0, 0, 0, 0);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if index is greater than or equal to the number of active uniform variables in program.');
		// 	glUseProgram(program.getProgram());
		// 	glGetActiveUniform(program.getProgram(), numActiveUniforms, 0, 0, 0, 0, 0);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if bufSize is less than 0.');
		// 	glGetActiveUniform(program.getProgram(), 0, -1, 0, 0, 0, 0);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	glUseProgram(0);
		// 	glDeleteShader(shader);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_active_uniformsiv', 'Invalid glGetActiveUniformsiv() usage', gl, function()
		// {
		// 	GLuint					shader				= glCreateShader(gl.VERTEX_SHADER);
		// 	glu::ShaderProgram		program				(m_context.getRenderContext(), glu::makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
		// 	GLuint					dummyUniformIndex	= 1;
		// 	/** @type{number} */ var					dummyParamDst		= -1;
		// 	/** @type{number} */ var					numActiveUniforms	= -1;
		//
		// 	glUseProgram(program.getProgram());
		//
		// 	glGetProgramiv	(program.getProgram(), gl.ACTIVE_UNIFORMS, &numActiveUniforms);
		// 	bufferedLogToConsole('// gl.ACTIVE_UNIFORMS = ' + numActiveUniforms + ' (expected 4).');
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
		// 	glGetActiveUniformsiv(-1, 1, &dummyUniformIndex, gl.UNIFORM_TYPE, &dummyParamDst);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program is not a program object.');
		// 	glGetActiveUniformsiv(shader, 1, &dummyUniformIndex, gl.UNIFORM_TYPE, &dummyParamDst);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if any value in uniformIndices is greater than or equal to the value of gl.ACTIVE_UNIFORMS for program.');
		// 	for (int excess = 0; excess <= 2; excess++)
		// 	{
		// 		std::vector<GLuint> invalidUniformIndices;
		// 		invalidUniformIndices.push_back(1);
		// 		invalidUniformIndices.push_back(numActiveUniforms-1+excess);
		// 		invalidUniformIndices.push_back(1);
		//
		// 		std::vector</** @type{number} */ var> dummyParamsDst(invalidUniformIndices.size());
		// 		glGetActiveUniformsiv(program.getProgram(), (GLsizei)invalidUniformIndices.size(), &invalidUniformIndices[0], gl.UNIFORM_TYPE, &dummyParamsDst[0]);
		// 		this.expectError(excess == 0 ? gl.NO_ERROR : gl.INVALID_VALUE);
		// 	}
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted token.');
		// 	glGetActiveUniformsiv(program.getProgram(), 1, &dummyUniformIndex, -1, &dummyParamDst);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	glUseProgram(0);
		// 	glDeleteShader(shader);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_active_uniform_blockiv', 'Invalid glGetActiveUniformBlockiv() usage', gl, function()
		// {
		// 	glu::ShaderProgram	program			(m_context.getRenderContext(), glu::makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
		// 	/** @type{number} */ var				params			= -1;
		// 	/** @type{number} */ var				numActiveBlocks	= -1;
		//
		// 	glGetProgramiv	(program.getProgram(), gl.ACTIVE_UNIFORM_BLOCKS,	&numActiveBlocks);
		// 	bufferedLogToConsole('// gl.ACTIVE_UNIFORM_BLOCKS = ' + numActiveBlocks + ' (expected 1).');
		// 	this.expectError		(gl.NO_ERROR);
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if uniformBlockIndex is greater than or equal to the value of gl.ACTIVE_UNIFORM_BLOCKS or is not the index of an active uniform block in program.');
		// 	glUseProgram(program.getProgram());
		// 	this.expectError(gl.NO_ERROR);
		// 	glGetActiveUniformBlockiv(program.getProgram(), numActiveBlocks, gl.UNIFORM_BLOCK_BINDING, params);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not one of the accepted tokens.');
		// 	glGetActiveUniformBlockiv(program.getProgram(), 0, -1, params);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	glUseProgram(0);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_active_uniform_block_name', 'Invalid glGetActiveUniformBlockName() usage', gl, function()
		// {
		// 	glu::ShaderProgram	program			(m_context.getRenderContext(), glu::makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
		// 	GLsizei				length			= -1;
		// 	/** @type{number} */ var				numActiveBlocks	= -1;
		// 	GLchar				uniformBlockName[128];
		//
		// 	deMemset(&uniformBlockName[0], 0, sizeof(uniformBlockName));
		//
		// 	glGetProgramiv	(program.getProgram(), gl.ACTIVE_UNIFORM_BLOCKS,	&numActiveBlocks);
		// 	bufferedLogToConsole('// gl.ACTIVE_UNIFORM_BLOCKS = ' + numActiveBlocks + ' (expected 1).');
		// 	this.expectError		(gl.NO_ERROR);
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if uniformBlockIndex is greater than or equal to the value of gl.ACTIVE_UNIFORM_BLOCKS or is not the index of an active uniform block in program.');
		// 	glUseProgram(program.getProgram());
		// 	this.expectError(gl.NO_ERROR);
		// 	glGetActiveUniformBlockName(program.getProgram(), numActiveBlocks, (int)sizeof(uniformBlockName), &length, &uniformBlockName[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	glUseProgram(0);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_active_attrib', 'Invalid glGetActiveAttrib() usage', gl, function()
		// {
		// 	GLuint				shader				= glCreateShader(gl.VERTEX_SHADER);
		// 	glu::ShaderProgram	program				(m_context.getRenderContext(), glu::makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
		// 	/** @type{number} */ var				numActiveAttributes	= -1;
		//
		// 	GLsizei				length				= -1;
		// 	/** @type{number} */ var				size				= -1;
		// 	GLenum				type				= -1;
		// 	GLchar				name[32];
		//
		// 	deMemset(&name[0], 0, sizeof(name));
		//
		// 	glGetProgramiv	(program.getProgram(), gl.ACTIVE_ATTRIBUTES,	&numActiveAttributes);
		// 	bufferedLogToConsole('// gl.ACTIVE_ATTRIBUTES = ' + numActiveAttributes + ' (expected 1).');
		//
		// 	glUseProgram(program.getProgram());
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not a value generated by OpenGL.');
		// 	glGetActiveAttrib(-1, 0, 32, &length, &size, &type, &name[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program is not a program object.');
		// 	glGetActiveAttrib(shader, 0, 32, &length, &size, &type, &name[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if index is greater than or equal to gl.ACTIVE_ATTRIBUTES.');
		// 	glGetActiveAttrib(program.getProgram(), numActiveAttributes, (int)sizeof(name), &length, &size, &type, &name[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if bufSize is less than 0.');
		// 	glGetActiveAttrib(program.getProgram(), 0, -1, &length, &size, &type, &name[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	glUseProgram(0);
		// 	glDeleteShader(shader);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_uniform_indices', 'Invalid glGetUniformIndices() usage', gl, function()
		// {
		// 	GLuint shader			= glCreateShader(gl.VERTEX_SHADER);
		// 	glu::ShaderProgram program(m_context.getRenderContext(), glu::makeVtxFragSources(uniformTestVertSource, uniformTestFragSource));
		// 	/** @type{number} */ var numActiveBlocks = -1;
		// 	const GLchar* uniformName =  'Block.blockVar';
		// 	GLuint uniformIndices = -1;
		//
		// 	glGetProgramiv	(program.getProgram(), gl.ACTIVE_UNIFORM_BLOCKS,	&numActiveBlocks);
		// 	bufferedLogToConsole('// gl.ACTIVE_UNIFORM_BLOCKS = '		+ numActiveBlocks			+ TestLog::EndMessage;
		// 	this.expectError		(gl.NO_ERROR);
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program is a name of shader object.');
		// 	glGetUniformIndices(shader, 1, &uniformName, &uniformIndices);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if program is not name of program or shader object.');
		// 	GLuint invalid = -1;
		// 	glGetUniformIndices(invalid, 1, &uniformName, &uniformIndices);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		//
		// 	glUseProgram(0);
		// 	glDeleteShader(shader);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_vertex_attribfv', 'Invalid glGetVertexAttribfv() usage', gl, function()
		// {
		// 	/** @type{number} */ var params = 0.0;
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
		// 	glGetVertexAttribfv(0, -1, params);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if index is greater than or equal to gl.MAX_VERTEX_ATTRIBS.');
		// 	/** @type{number} */ var maxVertexAttribs;
		// 	gl.getParameter(gl.MAX_VERTEX_ATTRIBS, &maxVertexAttribs);
		// 	glGetVertexAttribfv(maxVertexAttribs, gl.VERTEX_ATTRIB_ARRAY_ENABLED, params);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_vertex_attribiv', 'Invalid glGetVertexAttribiv() usage', gl, function()
		// {
		// 	/** @type{number} */ var params = -1;
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
		// 	glGetVertexAttribiv(0, -1, params);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if index is greater than or equal to gl.MAX_VERTEX_ATTRIBS.');
		// 	/** @type{number} */ var maxVertexAttribs;
		// 	gl.getParameter(gl.MAX_VERTEX_ATTRIBS, &maxVertexAttribs);
		// 	glGetVertexAttribiv(maxVertexAttribs, gl.VERTEX_ATTRIB_ARRAY_ENABLED, params);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_vertex_attribi_iv', 'Invalid glGetVertexAttribIiv() usage', gl, function()
		// {
		// 	/** @type{number} */ var params = -1;
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
		// 	glGetVertexAttribIiv(0, -1, params);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if index is greater than or equal to gl.MAX_VERTEX_ATTRIBS.');
		// 	/** @type{number} */ var maxVertexAttribs;
		// 	gl.getParameter(gl.MAX_VERTEX_ATTRIBS, &maxVertexAttribs);
		// 	glGetVertexAttribIiv(maxVertexAttribs, gl.VERTEX_ATTRIB_ARRAY_ENABLED, params);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_vertex_attribi_uiv', 'Invalid glGetVertexAttribIuiv() usage', gl, function()
		// {
		// 	GLuint params = (GLuint)-1;
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
		// 	glGetVertexAttribIuiv(0, -1, params);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if index is greater than or equal to gl.MAX_VERTEX_ATTRIBS.');
		// 	/** @type{number} */ var maxVertexAttribs;
		// 	gl.getParameter(gl.MAX_VERTEX_ATTRIBS, &maxVertexAttribs);
		// 	glGetVertexAttribIuiv(maxVertexAttribs, gl.VERTEX_ATTRIB_ARRAY_ENABLED, params);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_vertex_attrib_pointerv', 'Invalid glGetVertexAttribPointerv() usage', gl, function()
		// {
		// 	GLvoid* ptr[1] = { DE_NULL };
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
		// 	glGetVertexAttribPointerv(0, -1, &ptr[0]);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if index is greater than or equal to gl.MAX_VERTEX_ATTRIBS.');
		// 	/** @type{number} */ var maxVertexAttribs;
		// 	gl.getParameter(gl.MAX_VERTEX_ATTRIBS, &maxVertexAttribs);
		// 	glGetVertexAttribPointerv(maxVertexAttribs, gl.VERTEX_ATTRIB_ARRAY_POINTER, &ptr[0]);
		// 	this.expectError(gl.INVALID_VALUE);
		//
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_frag_data_location', 'Invalid glGetFragDataLocation() usage', gl, function()
		// {
		// 	GLuint shader	= glCreateShader(gl.VERTEX_SHADER);
		// 	GLuint program	= glCreateProgram();
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program is the name of a shader object.');
		// 	glGetFragDataLocation(shader, 'gl_FragColor');
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if program has not been linked.');
		// 	glGetFragDataLocation(program, 'gl_FragColor');
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	glDeleteProgram(program);
		// 	glDeleteShader(shader);
		// }));
		//
		// // Enumerated state queries: Buffers
		//
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_buffer_parameteriv', 'Invalid glGetBufferParameteriv() usage', gl, function()
		// {
		// 	/** @type{number} */ var params = -1;
		// 	GLuint buf;
		// 	glGenBuffers(1, &buf);
		// 	glBindBuffer(gl.ARRAY_BUFFER, buf);
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if target or value is not an accepted value.');
		// 	glGetBufferParameteriv(-1, gl.BUFFER_SIZE, params);
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glGetBufferParameteriv(gl.ARRAY_BUFFER, -1, params);
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glGetBufferParameteriv(-1, -1, params);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if the reserved buffer object name 0 is bound to target.');
		// 	glBindBuffer(gl.ARRAY_BUFFER, 0);
		// 	glGetBufferParameteriv(gl.ARRAY_BUFFER, gl.BUFFER_SIZE, params);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	glDeleteBuffers(1, &buf);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_buffer_parameteri64v', 'Invalid glGetBufferParameteri64v() usage', gl, function()
		// {
		// 	/** @type{number} */ var params = -1;
		// 	GLuint buf;
		// 	glGenBuffers(1, &buf);
		// 	glBindBuffer(gl.ARRAY_BUFFER, buf);
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if target or value is not an accepted value.');
		// 	glGetBufferParameteri64v(-1, gl.BUFFER_SIZE, params);
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glGetBufferParameteri64v(gl.ARRAY_BUFFER , -1, params);
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glGetBufferParameteri64v(-1, -1, params);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if the reserved buffer object name 0 is bound to target.');
		// 	glBindBuffer(gl.ARRAY_BUFFER, 0);
		// 	glGetBufferParameteri64v(gl.ARRAY_BUFFER, gl.BUFFER_SIZE, params);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	glDeleteBuffers(1, &buf);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_buffer_pointerv', 'Invalid glGetBufferPointerv() usage', gl, function()
		// {
		// 	GLvoid* params = DE_NULL;
		// 	GLuint buf;
		// 	glGenBuffers(1, &buf);
		// 	glBindBuffer(gl.ARRAY_BUFFER, buf);
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if target or pname is not an accepted value.');
		// 	glGetBufferPointerv(gl.ARRAY_BUFFER, -1, params);
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glGetBufferPointerv(-1, gl.BUFFER_MAP_POINTER, params);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if the reserved buffer object name 0 is bound to target.');
		// 	glBindBuffer(gl.ARRAY_BUFFER, 0);
		// 	glGetBufferPointerv(gl.ARRAY_BUFFER, gl.BUFFER_MAP_POINTER, params);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	glDeleteBuffers(1, &buf);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_framebuffer_attachment_parameteriv', 'Invalid glGetFramebufferAttachmentParameteriv() usage', gl, function()
		// {
		// 	/** @type{number} */ var params[1] = { -1 };
		// 	GLuint fbo;
		// 	GLuint rbo[2];
		//
		// 	glGenFramebuffers			(1, &fbo);
		// 	glGenRenderbuffers			(2, rbo);
		//
		// 	glBindFramebuffer			(gl.FRAMEBUFFER,	fbo);
		// 	glBindRenderbuffer			(gl.RENDERBUFFER,	rbo[0]);
		// 	glRenderbufferStorage		(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 16, 16);
		// 	glFramebufferRenderbuffer	(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo[0]);
		// 	glBindRenderbuffer			(gl.RENDERBUFFER,	rbo[1]);
		// 	glRenderbufferStorage		(gl.RENDERBUFFER, gl.STENCIL_INDEX8, 16, 16);
		// 	glFramebufferRenderbuffer	(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, rbo[1]);
		// 	glCheckFramebufferStatus	(gl.FRAMEBUFFER);
		// 	this.expectError					(gl.NO_ERROR);
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if target is not one of the accepted tokens.');
		// 	glGetFramebufferAttachmentParameteriv(-1, gl.DEPTH_ATTACHMENT, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE, params[0]);					// TYPE is gl.RENDERBUFFER
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not valid for the value of gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE.');
		// 	glGetFramebufferAttachmentParameteriv(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL, params[0]);	// TYPE is gl.RENDERBUFFER
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glBindFramebuffer(gl.FRAMEBUFFER, 0);
		// 	glGetFramebufferAttachmentParameteriv(gl.FRAMEBUFFER, gl.BACK, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME, params[0]);					// TYPE is gl.FRAMEBUFFER_DEFAULT
		// 	this.expectError(gl.INVALID_ENUM);
		// 	glBindFramebuffer(gl.FRAMEBUFFER, fbo);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if attachment is gl.DEPTH_STENCIL_ATTACHMENT and different objects are bound to the depth and stencil attachment points of target.');
		// 	glGetFramebufferAttachmentParameteriv(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME, params[0]);
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if the value of gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE is gl.NONE and pname is not gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME.');
		// 	glGetFramebufferAttachmentParameteriv(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME, params[0]);		// TYPE is gl.NONE
		// 	this.expectError(gl.NO_ERROR);
		// 	glGetFramebufferAttachmentParameteriv(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE, params[0]);	// TYPE is gl.NONE
		// 	this.expectError(gl.INVALID_OPERATION);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION or gl.INVALID_ENUM is generated if attachment is not one of the accepted values for the current binding of target.');
		// 	glGetFramebufferAttachmentParameteriv(gl.FRAMEBUFFER, gl.BACK, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME, params[0]);					// A FBO is bound so gl.BACK is invalid
		// 	this.expectError(gl.INVALID_OPERATION, gl.INVALID_ENUM);
		// 	glBindFramebuffer(gl.FRAMEBUFFER, 0);
		// 	glGetFramebufferAttachmentParameteriv(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME, params[0]);		// Default framebuffer is bound so gl.COLOR_ATTACHMENT0 is invalid
		// 	this.expectError(gl.INVALID_OPERATION, gl.INVALID_ENUM);
		//
		//
		// 	glDeleteFramebuffers(1, &fbo);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_renderbuffer_parameteriv', 'Invalid glGetRenderbufferParameteriv() usage', gl, function()
		// {
		// 	/** @type{number} */ var params[1] = { -1 };
		// 	GLuint rbo;
		// 	glGenRenderbuffers(1, &rbo);
		// 	glBindRenderbuffer(gl.RENDERBUFFER, rbo);
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if target is not gl.RENDERBUFFER.');
		// 	glGetRenderbufferParameteriv(-1, gl.RENDERBUFFER_WIDTH, params[0]);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not one of the accepted tokens.');
		// 	glGetRenderbufferParameteriv(gl.RENDERBUFFER, -1, params[0]);
		// 	this.expectError(gl.INVALID_ENUM);
		//
		//
		// 	glDeleteRenderbuffers(1, &rbo);
		// 	glBindRenderbuffer(gl.RENDERBUFFER, 0);
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_internalformativ', 'Invalid glGetInternalformativ() usage', gl, function()
		// {
		// 	/** @type{number} */ var params[16];
		//
		// 	deMemset(params[0], 0xcd, sizeof(params));
		//
		// 	bufferedLogToConsole('gl.INVALID_VALUE is generated if bufSize is negative.');
		// 	glGetInternalformativ	(gl.RENDERBUFFER, gl.RGBA8, gl.NUM_SAMPLE_COUNTS, -1, params[0]);
		// 	this.expectError				(gl.INVALID_VALUE);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not gl.SAMPLES or gl.NUM_SAMPLE_COUNTS.');
		// 	glGetInternalformativ	(gl.RENDERBUFFER, gl.RGBA8, -1, 16, params[0]);
		// 	this.expectError				(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if internalformat is not color-, depth-, or stencil-renderable.');
		// 	glGetInternalformativ	(gl.RENDERBUFFER, gl.RG8_SNORM, gl.NUM_SAMPLE_COUNTS, 16, params[0]);
		// 	this.expectError				(gl.INVALID_ENUM);
		// 	glGetInternalformativ	(gl.RENDERBUFFER, gl.COMPRESSED_RGB8_ETC2, gl.NUM_SAMPLE_COUNTS, 16, params[0]);
		// 	this.expectError				(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if target is not gl.RENDERBUFFER.');
		// 	glGetInternalformativ	(-1, gl.RGBA8, gl.NUM_SAMPLE_COUNTS, 16, params[0]);
		// 	this.expectError				(gl.INVALID_ENUM);
		// 	glGetInternalformativ	(gl.FRAMEBUFFER, gl.RGBA8, gl.NUM_SAMPLE_COUNTS, 16, params[0]);
		// 	this.expectError				(gl.INVALID_ENUM);
		// 	glGetInternalformativ	(gl.TEXTURE_2D, gl.RGBA8, gl.NUM_SAMPLE_COUNTS, 16, params[0]);
		// 	this.expectError				(gl.INVALID_ENUM);
		//
		// }));
		//
		// // Query object queries
		//
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_queryiv', 'Invalid glGetQueryiv() usage', gl, function()
		// {
		// 	/** @type{number} */ var params = -1;
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if target or pname is not an accepted value.');
		// 	glGetQueryiv	(gl.ANY_SAMPLES_PASSED, -1, params);
		// 	this.expectError		(gl.INVALID_ENUM);
		// 	glGetQueryiv	(-1, gl.CURRENT_QUERY, params);
		// 	this.expectError		(gl.INVALID_ENUM);
		// 	glGetQueryiv	(-1, -1, params);
		// 	this.expectError		(gl.INVALID_ENUM);
		//
		// }));
		// testGroup.addChild(new es3fApiCase.ApiCaseCallback('get_query_objectuiv', 'Invalid glGetQueryObjectuiv() usage', gl, function()
		// {
		// 	GLuint params	= -1;
		// 	GLuint id;
		// 	glGenQueries		(1, &id);
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if id is not the name of a query object.');
		// 	glGetQueryObjectuiv	(-1, gl.QUERY_RESULT_AVAILABLE, params);
		// 	this.expectError			(gl.INVALID_OPERATION);
		// 	bufferedLogToConsole('// Note: ' + id + ' is not a query object yet, since it hasn\'t been used by glBeginQuery');
		// 	glGetQueryObjectuiv	(id, gl.QUERY_RESULT_AVAILABLE, params);
		// 	this.expectError			(gl.INVALID_OPERATION);
		//
		//
		// 	glBeginQuery		(gl.ANY_SAMPLES_PASSED, id);
		// 	glEndQuery			(gl.ANY_SAMPLES_PASSED);
		//
		// 	bufferedLogToConsole('gl.INVALID_ENUM is generated if pname is not an accepted value.');
		// 	glGetQueryObjectuiv	(id, -1, params);
		// 	this.expectError			(gl.INVALID_ENUM);
		//
		//
		// 	bufferedLogToConsole('gl.INVALID_OPERATION is generated if id is the name of a currently active query object.');
		// 	glBeginQuery		(gl.ANY_SAMPLES_PASSED, id);
		// 	this.expectError			(gl.NO_ERROR);
		// 	glGetQueryObjectuiv	(id, gl.QUERY_RESULT_AVAILABLE, params);
		// 	this.expectError			(gl.INVALID_OPERATION);
		// 	glEndQuery			(gl.ANY_SAMPLES_PASSED);
		// 	this.expectError			(gl.NO_ERROR);
		//
		//
		// 	glDeleteQueries		(1, &id);
		// }));
		//
		// // Sync object queries
		//
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
		// 	bufferedLogToConsole('A name returned by glGenFramebuffers, but not yet bound through a call to glBindFramebuffer is not the name of a framebuffer object.');
		// 	isFbo				= glIsFramebuffer(fbo);
		// 	checkBooleans		(isFbo, false);
		//
		// 	glGenFramebuffers	(1, &fbo);
		// 	isFbo				= glIsFramebuffer(fbo);
		// 	checkBooleans		(isFbo, false);
		//
		// 	glBindFramebuffer	(gl.FRAMEBUFFER, fbo);
		// 	isFbo				= glIsFramebuffer(fbo);
		// 	checkBooleans		(isFbo, gl.TRUE);
		//
		// 	glBindFramebuffer	(gl.FRAMEBUFFER, 0);
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
		// 	bufferedLogToConsole('A name created with glCreateProgram, and not yet deleted with glDeleteProgram is a name of a program object.');
		// 	isProgram			= glIsProgram(program);
		// 	checkBooleans		(isProgram, false);
		//
		// 	program				= glCreateProgram();
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
		// 	bufferedLogToConsole('A name returned by glGenRenderbuffers, but not yet bound through a call to glBindRenderbuffer or glFramebufferRenderbuffer is not the name of a renderbuffer object.');
		// 	isRbo					= glIsRenderbuffer(rbo);
		// 	checkBooleans			(isRbo, false);
		//
		// 	glGenRenderbuffers		(1, &rbo);
		// 	isRbo					= glIsRenderbuffer(rbo);
		// 	checkBooleans			(isRbo, false);
		//
		// 	glBindRenderbuffer		(gl.RENDERBUFFER, rbo);
		// 	isRbo					= glIsRenderbuffer(rbo);
		// 	checkBooleans			(isRbo, gl.TRUE);
		//
		// 	glBindRenderbuffer		(gl.RENDERBUFFER, 0);
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
		// 	shader				= glCreateShader(gl.VERTEX_SHADER);
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
		// 	bufferedLogToConsole('A name returned by glGenQueries, but not yet associated with a query object by calling glBeginQuery, is not the name of a query object.');
		// 	isQuery				= glIsQuery(query);
		// 	checkBooleans		(isQuery, false);
		//
		// 	glGenQueries		(1, &query);
		// 	isQuery				= glIsQuery(query);
		// 	checkBooleans		(isQuery, false);
		//
		// 	glBeginQuery		(gl.ANY_SAMPLES_PASSED, query);
		// 	isQuery				= glIsQuery(query);
		// 	checkBooleans		(isQuery, gl.TRUE);
		//
		// 	glEndQuery			(gl.ANY_SAMPLES_PASSED);
		// 	glDeleteQueries		(1, &query);
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
