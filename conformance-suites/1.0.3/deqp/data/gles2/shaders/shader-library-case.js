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
 
/**
 * Shader compilation expected result enum
 * @enum {number}
 */
var expectResult = {
	EXPECT_PASS: 0,
	EXPECT_COMPILE_FAIL: 1,
	EXPECT_LINK_FAIL: 2,
	EXPECT_COMPILE_LINK_FAIL: 3,
	EXPECT_VALIDATION_FAIL: 4
}

/**
 * Test case type
 * @enum {number}
 */
var caseType = {
	CASETYPE_COMPLETE: 0,		//!< Has all shaders specified separately.
	CASETYPE_VERTEX_ONLY: 1,		//!< "Both" case, vertex shader sub case.
	CASETYPE_FRAGMENT_ONLY: 2		//!< "Both" case, fragment shader sub case.
};


/**
 * Shader type enum
 * @enum {number}
 */
var shaderType = {
	VERTEX: 0,
	FRAGMENT: 1
};

/**
 * Get GL shader type from shaderType
 * @param gl WebGL context
 * @param {shaderType} type Shader Type
 * @return GL shader type
 */
var getGLShaderType = function(gl, type) {
	var _glShaderType;
	switch (type) {
	case shaderType.VERTEX: _glShaderType = gl.VERTEX_SHADER; break;
	case shaderType.FRAGMENT: _glShaderType = gl.FRAGMENT_SHADER; break;
	default:
		testFailed("Unknown shader type " + type);
	}
	
	return _glShaderType;
}

var ShaderInfo = function() {
	this.type;			/** Shader type. */
	this.source;			/** Shader source. */
	this.infoLog;		/** Compile info log. */
	this.compileOk = false;		/** Did compilation succeed? */
	this.compileTimeUs = 0;	/** Compile time in microseconds (us). */
};

var Shader = function(gl, type) {
	this.gl = gl;
	this.info = new ShaderInfo();		/** Client-side clone of state for debug / perf reasons. */
	this.info.type = type;
	this.shader	= gl.createShader(getGLShaderType(gl, type));
	assertMsg(gl.getError() == gl.NO_ERROR, "glCreateShader()");

	this.setSources = function(source) {
		gl.shaderSource(this.shader, source);
		assertMsg(gl.getError() == gl.NO_ERROR, "glshaderSource()");
		this.info.source = source;
	};
	
	this.getCompileStatus = function() {
		return this.info.compileOk;
	};
	
	this.compile = function() {
		this.info.compileOk		= false;
		this.info.compileTimeUs	= 0;
		this.info.infoLog = "";

		
		var compileStart = new Date();
		gl.compileShader(this.shader);
		var compileEnd = new Date();
		this.info.compileTimeUs = 1000 * (compileEnd.getTime() - compileStart.getTime());

		assertMsg(gl.getError() == gl.NO_ERROR, "glCompileShader()");

		var compileStatus = gl.getShaderParameter(this.shader, gl.COMPILE_STATUS);
		assertMsg(gl.getError() == gl.NO_ERROR, "glGetShaderParameter()");

		this.info.compileOk = (compileStatus != gl.FALSE);
		this.info.infoLog = gl.getShaderInfoLog(this.shader);
	};
	
	this.getShader = function() {
		return this.shader;
	};
	
};

var ProgramInfo = function() {
	/** @type {string} */ var				infoLog;
	/** @type {bool} */ var		linkOk = false;
	/** @type {number} */ var	linkTimeUs = 0;	
};

var Program = function(gl, programID) {
	this.gl = gl;
	this.program = programID;
	this.info = new ProgramInfo();
	
	if (programID == null) {
		this.program = gl.createProgram();
		assertMsg(gl.getError() == gl.NO_ERROR, "glCreateProgram()");
	}
	
	this.attachShader = function(shader) {
		gl.attachShader(this.program, shader);
		assertMsg(gl.getError() == gl.NO_ERROR, "gl.attachShader()");
	};

	this.bindAttribLocation = function(location, name) {
		gl.bindAttribLocation(this.program, location, name);
		assertMsg(gl.getError() == gl.NO_ERROR, "gl.bindAttribLocation()");
	};
	
	this.link = function() {
		this.info.linkOk		= false;
		this.info.linkTimeUs	= 0;
		this.info.infoLog = "";

		var linkStart = new Date();
		gl.linkProgram(this.program);
		var linkEnd = new Date();
		this.info.linkTimeUs = 1000 *(linkEnd.getTime() - linkStart.getTime());
		
		assertMsg(gl.getError() == gl.NO_ERROR, "glLinkProgram()");

		var linkStatus = gl.getProgramParameter(this.program, gl.LINK_STATUS);
		assertMsg(gl.getError() == gl.NO_ERROR, "gl.getProgramParameter()");
		this.info.linkOk	= (linkStatus != gl.FALSE);
		this.info.infoLog	= gl.getProgramInfoLog(this.program);
	};
};

var ShaderProgram = function(gl, programSources) {
	this.gl = gl;
	this.programSources = programSources;
	this.shaders = []
	this.program = new Program(gl);

	this.getProgram = function() {
		return this.program.program;
		};
	
	this.getProgramInfo = function() {
		return this.program.info;
	};

	/** @type {bool} */ var shadersOK = true;

		for (var i = 0; i < programSources.sources.length; i++) {
			var shader = new Shader(gl, programSources.sources[i].type);
			shader.setSources(programSources.sources[i].source);
			shader.compile();
			this.shaders.push(shader);
			shadersOK = shadersOK && shader.getCompileStatus();
		}
		
		if (shadersOK) {
			for (var i = 0; i < this.shaders.length; i++)
				this.program.attachShader(this.shaders[i].getShader());
			
			for (var attrib in programSources.attribLocationBindings)
				this.program.bindAttribLocation(programSources.attribLocationBindings[attrib], attrib);

			/* TODO: Port */
			/*
			DE_ASSERT((sources.transformFeedbackBufferMode == GL_NONE) == sources.transformFeedbackVaryings.empty());
			if (sources.transformFeedbackBufferMode != GL_NONE)
			{
				std::vector<const char*> tfVaryings(sources.transformFeedbackVaryings.size());
				for (int ndx = 0; ndx < (int)tfVaryings.size(); ndx++)
					tfVaryings[ndx] = sources.transformFeedbackVaryings[ndx].c_str();

				m_program.transformFeedbackVaryings((int)tfVaryings.size(), &tfVaryings[0], sources.transformFeedbackBufferMode);
			}

			if (sources.separable)
				m_program.setSeparable(true);
			*/

			this.program.link();
			
		}

};

var BeforeDrawValidator = function() {
	/* TODO : implement */
};

/**
 * BeforeDrawValidator target type enum
 * @enum
 */
 
var targetType = {
	PROGRAM: 0,
	PIPELINE: 1
};


var shaderCase = {
	value : {
		STORAGE_INPUT: 0,
		STORAGE_OUTPUT: 1,
		STORAGE_UNIFORM: 2
	}
};

var shaderLibraryCase = (function() {
	'use strict';
	
	/** @const */ var VIEWPORT_WIDTH		= 128;
	/** @const */ var VIEWPORT_HEIGHT		= 128;

var usesShaderInoutQualifiers = function(version) {
	switch (version) {
		case "100 es":
		case "130":
		case "140":
		case "150":
			return false;

		default:
			return true;
	}
};
var supportsFragmentHighp = function(version) {
	return version !== "100 es";
}

// This functions builds a matching vertex shader for a 'both' case, when
// the fragment shader is being tested.
// We need to build attributes and varyings for each 'input'.
var genVertexShader = function(valueBlock) {
	var res = "";
	var state = stateMachine.getState();
	var		usesInout	= usesShaderInoutQualifiers(state.targetVersion);
	var		vtxIn		= usesInout ? "in"	: "attribute";
	var		vtxOut		= usesInout ? "out"	: "varying";

	res += "#version " + state.targetVersion + ";\n";
	res += "precision highp float;\n";
	res += "precision highp int;\n";
	res += "\n";
	res += vtxIn + " highp vec4 dEQP_Position;\n";
	
	for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
		var val = valueBlock.values[ndx];
		if (val.storageType === shaderCase.value.STORAGE_INPUT) {
			var	floatType	= shaderUtils.getDataTypeFloatScalars(val.dataType);
			res += vtxIn + " " + floatType + " a_" + val.valueName + ";\n";

			if (shaderUtils.getDataTypeScalarType(val.dataType) === "float")
				res += vtxOut + " " + floatType + " " + val.valueName + ";\n";
			else
				res += vtxOut + " " + floatType + " v_" + val.valueName + ";\n";
		}
	}
	res += "\n";

	// Main function.
	// - gl_Position = dEQP_Position;
	// - for each input: write attribute directly to varying
	res += "void main()\n";
	res += "{\n";
	res += "	gl_Position = dEQP_Position;\n";
	for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
		var val = valueBlock.values[ndx];
		if (val.storageType === shaderCase.value.STORAGE_INPUT) {
			var name = val.valueName;
			if (shaderUtils.getDataTypeScalarType(val.dataType) === "float")
				res += "	" + name + " = a_" + name + ";\n";
			else
				res += "	v_" + name + " = a_" + name + ";\n";
		}
	}

	res += "}\n";
	return res;
};

var	genCompareFunctions = function(valueBlock, useFloatTypes) {
	var cmpTypeFound = {};
	var stream = "";

	for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
		var val = valueBlock.values[ndx];
		if (val.storageType === shaderCase.value.STORAGE_OUTPUT)
			cmpTypeFound[val.dataType] = true;
			
	}
	if (useFloatTypes)
	{
		if (cmpTypeFound["bool"])		stream += "bool isOk (float a, bool b) { return ((a > 0.5) == b); }\n";
		if (cmpTypeFound["bvec2"])	stream += "bool isOk (vec2 a, bvec2 b) { return (greaterThan(a, vec2(0.5)) == b); }\n";
		if (cmpTypeFound["bvec3"])	stream += "bool isOk (vec3 a, bvec3 b) { return (greaterThan(a, vec3(0.5)) == b); }\n";
		if (cmpTypeFound["bvec4"])	stream += "bool isOk (vec4 a, bvec4 b) { return (greaterThan(a, vec4(0.5)) == b); }\n";
		if (cmpTypeFound["int"])			stream += "bool isOk (float a, int b)  { float atemp = a+0.5; return (float(b) <= atemp && atemp <= float(b+1)); }\n";
		if (cmpTypeFound["ivec2"])	stream += "bool isOk (vec2 a, ivec2 b) { return (ivec2(floor(a + 0.5)) == b); }\n";
		if (cmpTypeFound["ivec3"])	stream += "bool isOk (vec3 a, ivec3 b) { return (ivec3(floor(a + 0.5)) == b); }\n";
		if (cmpTypeFound["ivec4"])	stream += "bool isOk (vec4 a, ivec4 b) { return (ivec4(floor(a + 0.5)) == b); }\n";
		if (cmpTypeFound["uint"])		stream += "bool isOk (float a, uint b) { float atemp = a+0.5; return (float(b) <= atemp && atemp <= float(b+1u)); }\n";
		if (cmpTypeFound["uvec2"])	stream += "bool isOk (vec2 a, uvec2 b) { return (uvec2(floor(a + 0.5)) == b); }\n";
		if (cmpTypeFound["uvec3"])	stream += "bool isOk (vec3 a, uvec3 b) { return (uvec3(floor(a + 0.5)) == b); }\n";
		if (cmpTypeFound["uvec4"])	stream += "bool isOk (vec4 a, uvec4 b) { return (uvec4(floor(a + 0.5)) == b); }\n";
	}
	else
	{
		if (cmpTypeFound["bool"])		stream += "bool isOk (bool a, bool b)   { return (a == b); }\n";
		if (cmpTypeFound["bvec2"])	stream += "bool isOk (bvec2 a, bvec2 b) { return (a == b); }\n";
		if (cmpTypeFound["bvec3"])	stream += "bool isOk (bvec3 a, bvec3 b) { return (a == b); }\n";
		if (cmpTypeFound["bvec4"])	stream += "bool isOk (bvec4 a, bvec4 b) { return (a == b); }\n";
		if (cmpTypeFound["int"])			stream += "bool isOk (int a, int b)     { return (a == b); }\n";
		if (cmpTypeFound["ivec2"])	stream += "bool isOk (ivec2 a, ivec2 b) { return (a == b); }\n";
		if (cmpTypeFound["ivec3"])	stream += "bool isOk (ivec3 a, ivec3 b) { return (a == b); }\n";
		if (cmpTypeFound["ivec4"])	stream += "bool isOk (ivec4 a, ivec4 b) { return (a == b); }\n";
		if (cmpTypeFound["uint"])		stream += "bool isOk (uint a, uint b)   { return (a == b); }\n";
		if (cmpTypeFound["uvec2"])	stream += "bool isOk (uvec2 a, uvec2 b) { return (a == b); }\n";
		if (cmpTypeFound["uvec3"])	stream += "bool isOk (uvec3 a, uvec3 b) { return (a == b); }\n";
		if (cmpTypeFound["uvec4"])	stream += "bool isOk (uvec4 a, uvec4 b) { return (a == b); }\n";
	}

	if (cmpTypeFound["float"])		stream += "bool isOk (float a, float b, float eps) { return (abs(a-b) <= (eps*abs(b) + eps)); }\n";
	if (cmpTypeFound["vec2"])	stream += "bool isOk (vec2 a, vec2 b, float eps) { return all(lessThanEqual(abs(a-b), (eps*abs(b) + eps))); }\n";
	if (cmpTypeFound["vec3"])	stream += "bool isOk (vec3 a, vec3 b, float eps) { return all(lessThanEqual(abs(a-b), (eps*abs(b) + eps))); }\n";
	if (cmpTypeFound["vec4"])	stream += "bool isOk (vec4 a, vec4 b, float eps) { return all(lessThanEqual(abs(a-b), (eps*abs(b) + eps))); }\n";

	if (cmpTypeFound["mat2"])		stream += "bool isOk (mat2 a, mat2 b, float eps) { vec2 diff = max(abs(a[0]-b[0]), abs(a[1]-b[1])); return all(lessThanEqual(diff, vec2(eps))); }\n";
	if (cmpTypeFound["mat2x3"])	stream += "bool isOk (mat2x3 a, mat2x3 b, float eps) { vec3 diff = max(abs(a[0]-b[0]), abs(a[1]-b[1])); return all(lessThanEqual(diff, vec3(eps))); }\n";
	if (cmpTypeFound["mat2x4"])	stream += "bool isOk (mat2x4 a, mat2x4 b, float eps) { vec4 diff = max(abs(a[0]-b[0]), abs(a[1]-b[1])); return all(lessThanEqual(diff, vec4(eps))); }\n";
	if (cmpTypeFound["mat3x2"])	stream += "bool isOk (mat3x2 a, mat3x2 b, float eps) { vec2 diff = max(max(abs(a[0]-b[0]), abs(a[1]-b[1])), abs(a[2]-b[2])); return all(lessThanEqual(diff, vec2(eps))); }\n";
	if (cmpTypeFound["mat3"])		stream += "bool isOk (mat3 a, mat3 b, float eps) { vec3 diff = max(max(abs(a[0]-b[0]), abs(a[1]-b[1])), abs(a[2]-b[2])); return all(lessThanEqual(diff, vec3(eps))); }\n";
	if (cmpTypeFound["mat3x4"])	stream += "bool isOk (mat3x4 a, mat3x4 b, float eps) { vec4 diff = max(max(abs(a[0]-b[0]), abs(a[1]-b[1])), abs(a[2]-b[2])); return all(lessThanEqual(diff, vec4(eps))); }\n";
	if (cmpTypeFound["mat4x2"])	stream += "bool isOk (mat4x2 a, mat4x2 b, float eps) { vec2 diff = max(max(abs(a[0]-b[0]), abs(a[1]-b[1])), max(abs(a[2]-b[2]), abs(a[3]-b[3]))); return all(lessThanEqual(diff, vec2(eps))); }\n";
	if (cmpTypeFound["mat4x3"])	stream += "bool isOk (mat4x3 a, mat4x3 b, float eps) { vec3 diff = max(max(abs(a[0]-b[0]), abs(a[1]-b[1])), max(abs(a[2]-b[2]), abs(a[3]-b[3]))); return all(lessThanEqual(diff, vec3(eps))); }\n";
	if (cmpTypeFound["mat4"])		stream += "bool isOk (mat4 a, mat4 b, float eps) { vec4 diff = max(max(abs(a[0]-b[0]), abs(a[1]-b[1])), max(abs(a[2]-b[2]), abs(a[3]-b[3]))); return all(lessThanEqual(diff, vec4(eps))); }\n";	
	
	return stream;
};

var	genCompareOp = function(dstVec4Var, valueBlock, nonFloatNamePrefix, checkVarName) {
	var isFirstOutput = true;
	var output = "";

	for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
		var val = valueBlock.values[ndx];
		var valueName	= val.valueName;

		if (val.storageType === shaderCase.value.STORAGE_OUTPUT) {
			// Check if we're only interested in one variable (then skip if not the right one).
			if (checkVarName && (valueName !== checkVarName))
				continue;

			// Prefix.
			if (isFirstOutput)
			{
				output += "bool RES = ";
				isFirstOutput = false;
			}
			else
				output += "RES = RES && ";

			// Generate actual comparison.
			if (shaderUtils.getDataTypeScalarType(val.dataType) === "float")
				output += "isOk(" + valueName + ", ref_" + valueName + ", 0.05);\n";
			else
				output += "isOk(" + nonFloatNamePrefix + valueName + ", ref_" + valueName + ");\n";
		}
		// \note Uniforms are already declared in shader.
	}

	if (isFirstOutput)
		output += dstVec4Var + " = vec4(1.0);\n";	// \todo [petri] Should we give warning if not expect-failure case?
	else
		output += dstVec4Var + " = vec4(RES, RES, RES, 1.0);\n";
	
	return output;
};

var genFragmentShader = function(valueBlock) {
	var shader = "";
	var state = stateMachine.getState();
	var		usesInout	= usesShaderInoutQualifiers(state.targetVersion);
	var		vtxIn		= usesInout ? "in"	: "attribute";
	var		vtxOut		= usesInout ? "out"	: "varying";
	var		customColorOut	= usesInout;
	var		fragIn			= usesInout ? "in" : "varying";
	var		prec			= supportsFragmentHighp(state.targetVersion) ? "highp" : "mediump";

	shader += "#version " + state.targetVersion + ";\n";


	shader += "precision " + prec + " float;\n";
	shader += "precision " + prec + " int;\n";
	shader += "\n";
	
	if (customColorOut)
	{
		shader += "layout(location = 0) out mediump vec4 dEQP_FragColor;\n";
		shader += "\n";
	}

	shader += genCompareFunctions(valueBlock, true);
	shader += "\n";

	// Declarations (varying, reference for each output).
	for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
		var val = valueBlock.values[ndx];
		var	floatType		= shaderUtils.getDataTypeFloatScalars(val.dataType);

		if (val.storageType == shaderCase.value.STORAGE_OUTPUT)
		{
			if (shaderUtils.getDataTypeScalarType(val.dataType) === "float")
				shader += fragIn + " " + floatType + " " + val.valueName + ";\n";
			else
				shader += fragIn + " " + floatType + " v_" + val.valueName + ";\n";

			shader += "uniform " + val.dataType + " ref_" + val.valueName + ";\n";
		}
	}

	shader += "\n";
	shader += "void main()\n";
	shader += "{\n";

	shader += "	";
	shader += genCompareOp(customColorOut ? "dEQP_FragColor" : "gl_FragColor", valueBlock, "v_", null);

	shader += "}\n";
	return shader;
};

var injectExtensionRequirements = function(baseCode, shaderType, requirements) {
	/* TODO: implement */
	return baseCode;
}

// Specialize a shader for the vertex shader test case.
var specializeVertexShader = function(src, valueBlock) {
	var	decl = "";
	var	setup = "";
	var	output = "";
	var state = stateMachine.getState();
	var		usesInout	= usesShaderInoutQualifiers(state.targetVersion);
	var		vtxIn		= usesInout ? "in"	: "attribute";
	var		vtxOut		= usesInout ? "out"	: "varying";

	// Output (write out position).
	output += "gl_Position = dEQP_Position;\n";

	// Declarations (position + attribute for each input, varying for each output).
	decl += vtxIn + " highp vec4 dEQP_Position;\n";
	for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
		var val = valueBlock.values[ndx];
		var	valueName		= val.valueName;
		var	floatType		= shaderUtils.getDataTypeFloatScalars(val.dataType);

		if (val.storageType === shaderCase.value.STORAGE_INPUT)
		{
			if (shaderUtils.getDataTypeScalarType(val.dataType) === "float")
			{
				decl += vtxIn + " " + floatType + " " + valueName + ";\n";
			}
			else
			{
				decl += vtxIn + " " + floatType + " a_" + valueName + ";\n";
				setup += val.dataType + " " + valueName + " = " + val.dataType + "(a_" + valueName + ");\n";
			}
		}
		else if (val.storageType === shaderCase.value.STORAGE_OUTPUT)
		{
			if (shaderUtils.getDataTypeScalarType(val.dataType) === "float")
				decl += vtxOut + " " + floatType + " " + valueName + ";\n";
			else
			{
				decl += vtxOut + " " + floatType + " v_" + valueName + ";\n";
				decl += val.dataType + " " + valueName + ";\n";

				output += "v_" + valueName + " = " + floatType + "(" + valueName + ");\n";
			}
		}
	}

	var baseSrc = src
					.replace("${DECLARATIONS}", decl)
					.replace("${SETUP}", setup)
					.replace("${OUTPUT}", output)
					.replace("${POSITION_FRAG_COLOR}", "gl_Position");

	var	withExt	= injectExtensionRequirements(baseSrc, shaderType.VERTEX, state.programs[0].spec.requirements);

	return withExt;
}

var specializeFragmentShader = function(src, valueBlock) {
	var	decl = "";
	var	setup = "";
	var	output = "";

	var state = stateMachine.getState();

	var		usesInout		= usesShaderInoutQualifiers(state.targetVersion);
	var		customColorOut	= usesInout;
	var		fragIn			= usesInout			? "in"				: "varying";
	var		fragColor		= customColorOut	? "dEQP_FragColor"	: "gl_FragColor";

	decl += genCompareFunctions(valueBlock, false);
	output += genCompareOp(fragColor, valueBlock, "", null);

	if (customColorOut)
		decl += "layout(location = 0) out mediump vec4 dEQP_FragColor;\n";

	for (var ndx = 0; ndx < valueBlock.values.length; ndx++) {
		var val = valueBlock.values[ndx];
		var					valueName		= val.valueName;
		var					floatType		= shaderUtils.getDataTypeFloatScalars(val.dataType);

		if (val.storageType === shaderCase.value.STORAGE_INPUT)
		{
			if (shaderUtils.getDataTypeScalarType(val.dataType) === "float")
				decl += fragIn + " " + floatType + " " + valueName + ";\n";
			else
			{
				decl += fragIn + " " + floatType + " v_" + valueName + ";\n";
				var offset = shaderUtils.isDataTypeIntOrIVec(val.dataType) ? " * 1.0025" : ""; // \todo [petri] bit of a hack to avoid errors in chop() due to varying interpolation
				setup += val.dataType + " " + valueName + " = " + val.dataType + "(v_" + valueName + offset + ");\n";
			}
		}
		else if (val.storageType === shaderCase.value.STORAGE_OUTPUT)
		{
			decl += "uniform " + val.dataType + " ref_" + valueName + ";\n";
			decl += val.dataType + " " + valueName + ";\n";
		}
	}

	/* \todo [2010-04-01 petri] Check all outputs. */

	var baseSrc = src
					.replace("${DECLARATIONS}", decl)
					.replace("${SETUP}", setup)
					.replace("${OUTPUT}", output)
					.replace("${POSITION_FRAG_COLOR}", fragColor);

	var withExt	= injectExtensionRequirements(baseSrc, shaderType.FRAGMENT, state.programs[0].spec.requirements);

	return withExt;
}

var draw = function() {
	var wtu = WebGLTestUtils;
	var gl = wtu.create3DContext("canvas");
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.viewport(canvas.width/4, canvas.height/4, canvas.width/2, canvas.height/2);
		
	wtu.setupSimpleColorProgram(gl);
	wtu.setupUnitQuad(gl);
	wtu.setFloatDrawColor(gl,[ 0, 1, 0, 1]);
	wtu.drawUnitQuad(gl);
	
};

/**
 * Is tessellation present
 *
 * @return {bool} True if tessellation is present
 */
var isTessellationPresent = function() {
	/* TODO: implement */
	return false;
};

var setUniformValue = function(gl, pipelinePrograms, name, val, arrayNdx) {
	/** @type {bool} */ var foundAnyMatch = false;

	for (var programNdx = 0; programNdx < pipelinePrograms.length; ++programNdx)
	{
		/** @const @type {WebGLUniformLocation} */ var loc			= gl.getUniformLocation(pipelinePrograms[programNdx], name);
		/** @const */ var scalarSize	= shaderUtils.getDataTypeScalarSize(val.dataType);
		/** @const */ var elemNdx		= (val.arrayLength === 1) ? (0) : (arrayNdx * scalarSize);

		if (!loc)
			continue;

		foundAnyMatch = true;

		gl.useProgram(pipelinePrograms[programNdx]);

		var element = val.elements.slice(arrayNdx, arrayNdx + scalarSize);
		switch (val.dataType)
		{
			case "float":		gl.uniform1fv(loc, new Float32Array(element));						break;
			case "vec2":		gl.uniform2fv(loc, new Float32Array(element));						break;
			case "vec3":		gl.uniform3fv(loc, new Float32Array(element));						break;
			case "vec4":		gl.uniform4fv(loc, new Float32Array(element));						break;
			/* TODO: Implement remaining types */
			/*
			case TYPE_FLOAT_VEC2:	gl.uniform2fv(loc, 1, &val.elements[elemNdx].float32);						break;
			case TYPE_FLOAT_VEC3:	gl.uniform3fv(loc, 1, &val.elements[elemNdx].float32);						break;
			case TYPE_FLOAT_VEC4:	gl.uniform4fv(loc, 1, &val.elements[elemNdx].float32);						break;
			case TYPE_FLOAT_MAT2:	gl.uniformMatrix2fv(loc, 1, GL_FALSE, &val.elements[elemNdx].float32);		break;
			case TYPE_FLOAT_MAT3:	gl.uniformMatrix3fv(loc, 1, GL_FALSE, &val.elements[elemNdx].float32);		break;
			case TYPE_FLOAT_MAT4:	gl.uniformMatrix4fv(loc, 1, GL_FALSE, &val.elements[elemNdx].float32);		break;
			case TYPE_INT:			gl.uniform1iv(loc, 1, &val.elements[elemNdx].int32);						break;
			case TYPE_INT_VEC2:		gl.uniform2iv(loc, 1, &val.elements[elemNdx].int32);						break;
			case TYPE_INT_VEC3:		gl.uniform3iv(loc, 1, &val.elements[elemNdx].int32);						break;
			case TYPE_INT_VEC4:		gl.uniform4iv(loc, 1, &val.elements[elemNdx].int32);						break;
			case TYPE_BOOL:			gl.uniform1iv(loc, 1, &val.elements[elemNdx].int32);						break;
			case TYPE_BOOL_VEC2:	gl.uniform2iv(loc, 1, &val.elements[elemNdx].int32);						break;
			case TYPE_BOOL_VEC3:	gl.uniform3iv(loc, 1, &val.elements[elemNdx].int32);						break;
			case TYPE_BOOL_VEC4:	gl.uniform4iv(loc, 1, &val.elements[elemNdx].int32);						break;
			case TYPE_UINT:			gl.uniform1uiv(loc, 1, (const deUint32*)&val.elements[elemNdx].int32);		break;
			case TYPE_UINT_VEC2:	gl.uniform2uiv(loc, 1, (const deUint32*)&val.elements[elemNdx].int32);		break;
			case TYPE_UINT_VEC3:	gl.uniform3uiv(loc, 1, (const deUint32*)&val.elements[elemNdx].int32);		break;
			case TYPE_UINT_VEC4:	gl.uniform4uiv(loc, 1, (const deUint32*)&val.elements[elemNdx].int32);		break;
			case TYPE_FLOAT_MAT2X3:	gl.uniformMatrix2x3fv(loc, 1, GL_FALSE, &val.elements[elemNdx].float32);	break;
			case TYPE_FLOAT_MAT2X4:	gl.uniformMatrix2x4fv(loc, 1, GL_FALSE, &val.elements[elemNdx].float32);	break;
			case TYPE_FLOAT_MAT3X2:	gl.uniformMatrix3x2fv(loc, 1, GL_FALSE, &val.elements[elemNdx].float32);	break;
			case TYPE_FLOAT_MAT3X4:	gl.uniformMatrix3x4fv(loc, 1, GL_FALSE, &val.elements[elemNdx].float32);	break;
			case TYPE_FLOAT_MAT4X2:	gl.uniformMatrix4x2fv(loc, 1, GL_FALSE, &val.elements[elemNdx].float32);	break;
			case TYPE_FLOAT_MAT4X3:	gl.uniformMatrix4x3fv(loc, 1, GL_FALSE, &val.elements[elemNdx].float32);	break;
			*/
			
			case gl.SAMPLER_2D:
			case gl.SAMPLER_CUBE:
				testFailed("implement!");
				break;

			default:
				testFailed("Unknown data type " + val.dataType);
		}
	}

	if (!foundAnyMatch)
		_logToConsole("WARNING // Uniform \"" + name + "\" location is not valid, location = -1. Cannot set value to the uniform.");
};

var checkPixels = function(surface, minX, maxX, minY, maxY) {
	/** type {bool} */ var		allWhite		= true;
	/** type {bool} */ var		allBlack		= true;
	/** type {bool} */ var		anyUnexpected	= false;

	assertMsg((maxX > minX) && (maxY > minY), "checkPixels sanity check");

	for (var y = minY; y <= maxY; y++) {
		for (var x = minX; x <= maxX; x++) {
			/** type {Pixel} */ var		pixel		 = surface.getPixel(x, y);
			// Note: we really do not want to involve alpha in the check comparison
			// \todo [2010-09-22 kalle] Do we know that alpha would be one? If yes, could use color constants white and black.
			/** type {bool} */ var		isWhite		 = (pixel.getRed() == 255) && (pixel.getGreen() == 255) && (pixel.getBlue() == 255);
			/** type {bool} */ var		isBlack		 = (pixel.getRed() == 0) && (pixel.getGreen() == 0) && (pixel.getBlue() == 0);

			allWhite		= allWhite && isWhite;
			allBlack		= allBlack && isBlack;
			anyUnexpected	= anyUnexpected || (!isWhite && !isBlack);
		}
	}

	if (!allWhite) {
		if (anyUnexpected)
			testFailed("WARNING: expecting all rendered pixels to be white or black, but got other colors as well!");
		else if (!allBlack)
			testFailed("WARNING: got inconsistent results over the image, when all pixels should be the same color!");

		return false;
	}
	return true;
};


/**
 * Execute a test case
 * @return {bool} True if test case passed
 */
var execute = function()
{
	/** @const @type {number} */	var	quadSize			= 1.0;
	/** @const @type {number} */
	var								s_positions = [
		-quadSize, -quadSize, 0.0, 1.0,
		-quadSize, +quadSize, 0.0, 1.0,
		+quadSize, -quadSize, 0.0, 1.0,
		+quadSize, +quadSize, 0.0, 1.0
	];

	/** @const @type {number} */
	var						s_indices = [
		0, 1, 2,
		1, 3, 2
	];

	var wtu = WebGLTestUtils;
	var gl = wtu.create3DContext("canvas");
	var state = stateMachine.getState();

	// Compute viewport.
	/* TODO: original code used random number generator to compute viewport, we use full whole canvas */
	/** @const */ var								width				= Math.min(canvas.width,	VIEWPORT_WIDTH);
	/** @const */ var								height				= Math.min(canvas.height,	VIEWPORT_HEIGHT);
	/** @const */ var								viewportX			= 0;
	/** @const */ var								viewportY			= 0;
	/** @const */ var								numVerticesPerDraw	= 4;
	/** @const */ var								tessellationPresent	= isTessellationPresent();

	/** @type {bool} */ var							allCompilesOk		= true;
	/** @type {bool} */	var							allLinksOk			= true;
	/** @type {string} */ var				failReason			= null;

	/** @type {number} */ var										vertexProgramID		= -1;
	var							pipelineProgramIDs = [];
	var	programs = [];
	var				programPipeline;

	assertMsg(gl.getError() === gl.NO_ERROR, "ShaderCase::execute(): start");

	if (!state.separatePrograms)
	{
		var	program	= 	new ShaderProgram(gl, state.programs[0].programSources);

		vertexProgramID = program.getProgram();
		pipelineProgramIDs.push(program.getProgram());
		programs.push(program);

		// Check that compile/link results are what we expect.


		for (var i = 0; i < program.shaders.length; i++) {
			_logToConsole(program.shaders[i].info);
			if (!program.shaders[i].info.compileOk)
				allCompilesOk = false;
		}
		
		if (!program.getProgramInfo().linkOk)
			allLinksOk = false;
		
		_logToConsole(program);
		
	}
	else
	{
		/* TODO: Port the code below */
		/*
		// Separate programs
		for (int programNdx = 0; programNdx < (int)m_programs.size(); ++programNdx)
		{
			de::SharedPtr<glu::ShaderProgram> program(new glu::ShaderProgram(m_renderCtx, m_programs[programNdx].programSources));

			if (m_programs[programNdx].spec.activeStageBits & (1 << glu::SHADERTYPE_VERTEX))
				vertexProgramID = program->getProgram();

			pipelineProgramIDs.push_back(program->getProgram());
			programs.push_back(program);

			// Check that compile/link results are what we expect.

			DE_STATIC_ASSERT(glu::SHADERTYPE_VERTEX == 0);
			for (int stage = glu::SHADERTYPE_VERTEX; stage < glu::SHADERTYPE_LAST; ++stage)
				if (program->hasShader((glu::ShaderType)stage) && !program->getShaderInfo((glu::ShaderType)stage).compileOk)
					allCompilesOk = false;

			if (!program->getProgramInfo().linkOk)
				allLinksOk = false;

			// Log program and active stages
			{
				const tcu::ScopedLogSection	section		(log, "Program", "Program " + de::toString(programNdx+1));
				tcu::MessageBuilder			builder		(&log);
				bool						firstStage	= true;

				builder << "Pipeline uses stages: ";
				for (int stage = glu::SHADERTYPE_VERTEX; stage < glu::SHADERTYPE_LAST; ++stage)
				{
					if (m_programs[programNdx].spec.activeStageBits & (1 << stage))
					{
						if (!firstStage)
							builder << ", ";
						builder << glu::getShaderTypeName((glu::ShaderType)stage);
						firstStage = true;
					}
				}
				builder << tcu::TestLog::EndMessage;

				log << *program;
			}
		}
		*/
	}

	switch (state.expectResult)
	{
		case expectResult.EXPECT_PASS:
		case expectResult.EXPECT_VALIDATION_FAIL:
			if (!allCompilesOk)
				failReason = "expected shaders to compile and link properly, but failed to compile.";
			else if (!allLinksOk)
				failReason = "expected shaders to compile and link properly, but failed to link.";
			break;

		case expectResult.EXPECT_COMPILE_FAIL:
			if (allCompilesOk && !allLinksOk)
				failReason = "expected compilation to fail, but shaders compiled and link failed.";
			else if (allCompilesOk)
				failReason = "expected compilation to fail, but shaders compiled correctly.";
			break;

		case expectResult.EXPECT_LINK_FAIL:
			if (!allCompilesOk)
				failReason = "expected linking to fail, but unable to compile.";
			else if (allLinksOk)
				failReason = "expected linking to fail, but passed.";
			break;

		case expectResult.EXPECT_COMPILE_LINK_FAIL:
			if (allCompilesOk && allLinksOk)
				failReason = "expected compile or link to fail, but passed.";
			break;

		default:
			testFailed("Unknown expected result");
			return false;
	}

	if (failReason != null)
	{
		// \todo [2010-06-07 petri] These should be handled in the test case?
		_logToConsole("ERROR: " + failReason);

		// If implementation parses shader at link time, report it as quality warning.
		if (state.expectResult === expectResult.EXPECT_COMPILE_FAIL && allCompilesOk && !allLinksOk)
			_logToConsole("Quality warning: implementation parses shader at link time");

		testFailed(failReason);
		return false;
	}

	// Return if compile/link expected to fail.
	if (state.expectResult === expectResult.EXPECT_COMPILE_FAIL		||
		state.expectResult === expectResult.EXPECT_COMPILE_LINK_FAIL	||
		state.expectResult === expectResult.EXPECT_LINK_FAIL)
		return (failReason === null);
	
	// Setup viewport.
	gl.viewport(viewportX, viewportY, width, height);

	if (state.separatePrograms)
	{
		/*
		programPipeline = de::SharedPtr<glu::ProgramPipeline>(new glu::ProgramPipeline(m_renderCtx));

		// Setup pipeline
		gl.bindProgramPipeline(programPipeline->getPipeline());
		for (int programNdx = 0; programNdx < (int)m_programs.size(); ++programNdx)
		{
			deUint32 shaderFlags = 0;
			for (int stage = glu::SHADERTYPE_VERTEX; stage < glu::SHADERTYPE_LAST; ++stage)
				if (m_programs[programNdx].spec.activeStageBits & (1 << stage))
					shaderFlags |= glu::getGLShaderTypeBit((glu::ShaderType)stage);

			programPipeline->useProgramStages(shaderFlags, pipelineProgramIDs[programNdx]);
		}

		programPipeline->activeShaderProgram(vertexProgramID);
		GLU_EXPECT_NO_ERROR(gl.getError(), "setup pipeline");
		*/
	}
	else
	{
		// Start using program
		gl.useProgram(vertexProgramID);
		assertMsg(gl.getError() === gl.NO_ERROR, "glUseProgram()");
	}

	// Fetch location for positions positions.
	var positionLoc = gl.getAttribLocation(vertexProgramID, "dEQP_Position");
	if (positionLoc === -1)	{
		testFailed("no location found for attribute 'dEQP_Position'");
		/* TODO" uncomment */
		/* return false; */
	}
	
	// Iterate all value blocks.
	
	for (var blockNdx = 0; blockNdx < state.valueBlocks.length; blockNdx++)
	{
		var	block		= state.valueBlocks[blockNdx];

		// always render at least one pass even if there is no input/output data
		/** @const @type {number} */ var	numRenderPasses	= Math.max(block.arrayLength, 1);

		// Iterate all array sub-cases.
		for (var arrayNdx = 0; arrayNdx < numRenderPasses; arrayNdx++)
		{
			/* @const @type {number} */ var	numValues			= block.values.length;
			var	vertexArrays = [];
			var							attribValueNdx		= 0;
			/** @type {gl.enum} */ var	postDrawError;
			var beforeDrawValidator	= new BeforeDrawValidator(gl,
															 (state.separatePrograms) ? (programPipeline.getPipeline())			: (vertexProgramID),
															 (state.separatePrograms) ? (targetType.PIPELINE)	: (targetType.PROGRAM));

			vertexArrays.push(new VertexArrayBinding(gl.FLOAT, positionLoc, 4, numVerticesPerDraw, s_positions));			

			// Collect VA pointer for inputs
			for (var valNdx = 0; valNdx < numValues; valNdx++) {
				/** @const */ var	val			= block.values[valNdx];
				/** @const */ var	valueName	= val.valueName;
				/** @const */ var	dataType	= val.dataType;
				/** @const */ var	scalarSize	= shaderUtils.getDataTypeScalarSize(val.dataType);
				
				if (val.storageType === shaderCase.value.STORAGE_INPUT)
				{
					// Replicate values four times.
					var scalars = [];
					for (var repNdx = 0; repNdx < numVerticesPerDraw; repNdx++)
						for (var ndx = 0; ndx < scalarSize; ndx++)
							scalars[repNdx*scalarSize + ndx] = val.elements[arrayNdx*scalarSize + ndx];

								// Attribute name prefix.
					var attribPrefix = "";
					// \todo [2010-05-27 petri] Should latter condition only apply for vertex cases (or actually non-fragment cases)?
					if ((state.caseType === caseType.CASETYPE_FRAGMENT_ONLY) || (shaderUtils.getDataTypeScalarType(dataType) !== "float"))
						attribPrefix = "a_";

					// Input always given as attribute.
					var attribName = attribPrefix + valueName;
					var attribLoc = gl.getAttribLocation(vertexProgramID, attribName);
					if (attribLoc === -1)
					{
						_logToConsole("Warning: no location found for attribute '" + attribName + "'");
						continue;
					}

					if (shaderUtils.isDataTypeMatrix(dataType))
					{
						var numCols = shaderUtils.getDataTypeMatrixNumColumns(dataType);
						var numRows = shaderUtils.getDataTypeMatrixNumRows(dataType);
						assertMsg(scalarSize === numCols * numRows, "Matrix size sanity check");

						for (var i = 0; i < numCols; i++) {
							var colData = scalars.slice(i * numRows, i * numRows + scalarSize);
							vertexArrays.push(new VertexArrayBinding(gl.FLOAT, attribLoc + i, numRows, numVerticesPerDraw, colData));			
						}
					}
					else
							vertexArrays.push(new VertexArrayBinding(gl.FLOAT, attribLoc, scalarSize, numVerticesPerDraw, scalars));			

					assertMsg(gl.getError() === gl.NO_ERROR, "set vertex attrib array");
				}
			}

			assertMsg(gl.getError() === gl.NO_ERROR, "before set uniforms");

			// set uniform values for outputs (refs).
			for (var valNdx = 0; valNdx < numValues; valNdx++)
			{
				var	val			= block.values[valNdx];
				var	valueName	= val.valueName;

				if (val.storageType === shaderCase.value.STORAGE_OUTPUT)
				{
					// Set reference value.
					setUniformValue(gl, pipelineProgramIDs, "ref_" + valueName, val, arrayNdx);
					assertMsg(gl.getError() === gl.NO_ERROR, "set reference uniforms");
				}
				else if (val.storageType === shaderCase.value.STORAGE_UNIFORM)
				{
					setUniformValue(gl, pipelineProgramIDs, valueName, val, arrayNdx);
					assertMsg(gl.getError() === gl.NO_ERROR, "set uniforms");
				}
			}
			
			// Clear.
			gl.clearColor(0.125, 0.25, 0.5, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			assertMsg(gl.getError() === gl.NO_ERROR, "clear buffer");

			// Use program or pipeline
			if (state.separatePrograms)
				gl.useProgram(0);
			else
				gl.useProgram(vertexProgramID);

			// Draw.
			if (tessellationPresent)
			{
				gl.patchParameteri(GL_PATCH_VERTICES, 3);
				assertMsg(gl.getError() === gl.NO_ERROR, "set patchParameteri(PATCH_VERTICES, 3)");
			}

			gluDraw.draw(gl,
				 vertexProgramID,
				 vertexArrays,
				 (tessellationPresent) ?
					(gluDraw.patches(s_indices)) :
					(gluDraw.triangles(s_indices)),
				 (state.expectResult === expectResult.EXPECT_VALIDATION_FAIL) ?
					(beforeDrawValidator) :
					(null));
			
			postDrawError = gl.getError();
						
			if (state.expectResult === expectResult.EXPECT_PASS) {
				/** @type {gluDraw.Surface} */	var surface = new gluDraw.Surface();
				/** @const */ var		w				= s_positions[3];
				/** @const */ var		minY			= Math.ceil (((-quadSize / w) * 0.5 + 0.5) * height + 1.0);
				/** @const */ var		maxY			= Math.floor(((+quadSize / w) * 0.5 + 0.5) * height - 0.5);
				/** @const */ var		minX			= Math.ceil (((-quadSize / w) * 0.5 + 0.5) * width + 1.0);
				/** @const */ var		maxX			= Math.floor(((+quadSize / w) * 0.5 + 0.5) * width - 0.5);

				assertMsg(postDrawError === gl.NO_ERROR, "draw");

				surface.readSurface(gl, viewportX, viewportY, width, height);
				assertMsg(gl.getError() === gl.NO_ERROR, "read pixels");

				if (!checkPixels(surface, minX, maxX, minY, maxY)) {
					testFailed("INCORRECT RESULT for (value block " + (blockNdx+1) + " of " +  state.valueBlocks.length
											+ ", sub-case " + (arrayNdx+1) + " of " + block.arrayLength + "):");

					/* TODO: Port */
					/*
					log << TestLog::Message << "Failing shader input/output values:" << TestLog::EndMessage;
					dumpValues(block, arrayNdx);

					// Dump image on failure.
					log << TestLog::Image("Result", "Rendered result image", surface);

					*/
					gl.useProgram(null);

					return false;
				}
			} /* else if (m_expectResult === expectResult.EXPECT_VALIDATION_FAIL) {
				_logToConsole("Draw call generated error: "
					+ glu::getErrorStr(postDrawError) + " "
					+ ((postDrawError === gl.INVALID_OPERATION) ? ("(expected)") : ("(unexpected)")) + "\n"
					+ "Validate status: "
					+ glu::getBooleanStr(beforeDrawValidator.getValidateStatus()) + " "
					+ ((beforeDrawValidator.getValidateStatus() == gl.FALSE) ? ("(expected)") : ("(unexpected)")) + "\n"
					+ "Info log: "
					+ ((beforeDrawValidator.getInfoLog().empty()) ? ("[empty string]") : (beforeDrawValidator.getInfoLog())) + "\n");

				// test result

				if (postDrawError !== gl.NO_ERROR && postDrawError !== gl.INVALID_OPERATION) {
					testFailed("Draw: got unexpected error: " + postDrawError);
					return false;
				}

				if (beforeDrawValidator.getValidateStatus() === gl.TRUE) {
					if (postDrawError === gl.NO_ERROR)
						testFailed("expected validation and rendering to fail but validation and rendering succeeded");
					else if (postDrawError === gl.INVALID_OPERATION)
						testFailed("expected validation and rendering to fail but validation succeeded (rendering failed as expected)");
					return false;
				} else if (beforeDrawValidator.getValidateStatus() === gl.FALSE && postDrawError === gl.NO_ERROR) {
					testFailed("expected validation and rendering to fail but rendering succeeded (validation failed as expected)");
					return false;
				} else if (beforeDrawValidator.getValidateStatus() === gl.FALSE && postDrawError === gl.INVALID_OPERATION) {
					// Validation does not depend on input values, no need to test all values
					return true;
				}
			}
			*/
		}
	}
	gl.useProgram(null);
	if (state.separatePrograms)
		gl.bindProgramPipeline(0);

	assertMsg(gl.getError() === gl.NO_ERROR, "ShaderCase::execute(): end");
	
	return true;
};


var runTestCases = function() {
	var state = stateMachine.getState();
	if (!state.index)
		state.index = 0;
	

	var pre = document.createElement('pre');
	state.targetVersion = "300 es";
	/**
 * A vertex shader for a uniform color.
 * @type {string}
 */
var simpleColorVertexShader = [
  'attribute vec4 dEQP_Position;',
  'attribute float test1;',
  'attribute vec4 test2;',
  'varying float vtest1;',
  'varying vec4 vtest2;',
  'void main() {',
  '    gl_Position = dEQP_Position;',
  '    vtest1 = test1;',
  '    vtest2 = test2;',
  '}'].join('\n');

/**
 * A fragment shader for a uniform color.
 * @type {string}
 */
var simpleColorFragmentShader = [
  'precision mediump float;',
  'uniform vec4 u_color;',
  'varying float vtest1;',
  'varying vec4 vtest2;',
  'void main() {',
  '    gl_FragData[0] = u_color;',
  '    gl_FragData[0].r = vtest1;',
  '    gl_FragData[0].b = vtest2.b;',
  '    gl_FragData[0] = vec4(1,1,1,1);',
 '}'].join('\n');
	
	state.expectResult = expectResult.EXPECT_PASS;
	state.programs = [
		{
			spec: {
				requirements: null
			},
			programSources: {
				sources : [
					{
						type: shaderType.VERTEX,
						source: simpleColorVertexShader
					},
					{
						type: shaderType.FRAGMENT,
						source: simpleColorFragmentShader
					}
				],
				attribLocationBindings : {
					"vPosition" : 0
				}
			}
		}
	];
	/* TODO: could 'elements' be an array of arrays rather than a flat array */
	state.valueBlocks = [
		{
			arrayLength: 1,
			values: [
				{
				storageType: shaderCase.value.STORAGE_UNIFORM,
				dataType: "vec4",
				valueName: "u_color",
				arrayLength: 1,
				elements: [1, 1, 0, 1]
				},
				{
				storageType: shaderCase.value.STORAGE_INPUT,
				dataType: "float",
				valueName: "test1",
				arrayLength: 1,
				elements: [0]
				},
				{
				storageType: shaderCase.value.STORAGE_INPUT,
				dataType: "vec4",
				valueName: "test2",
				arrayLength: 1,
				elements: [0.11, 0.12, 0.13, 0.14]
			}
			]
		}
	];
	
	var valueBlock = {
		values : [
			{
				storageType: shaderCase.value.STORAGE_INPUT,
				dataType: "vec2",
				valueName: "myVector"
			},
			{
				storageType: shaderCase.value.STORAGE_INPUT,
				dataType: "float",
				valueName: "myFloat"
			},
						{
				storageType: shaderCase.value.STORAGE_INPUT,
				dataType: "int",
				valueName: "myInt"
			},
			{
				storageType: shaderCase.value.STORAGE_OUTPUT,
				dataType: "vec2",
				valueName: "myVector"
			},
			{
				storageType: shaderCase.value.STORAGE_OUTPUT,
				dataType: "float",
				valueName: "myFloat"
			},
						{
				storageType: shaderCase.value.STORAGE_OUTPUT,
				dataType: "int",
				valueName: "myInt"
			}
		]
	};
	
	var shaderSrc =
			'precision mediump float;' +
			'${DECLARATIONS}' +
			'void main()' +
			'{' +
			'	out0 = 0.0;' +
			'	if (in0 >= 1.0)' +
			'		out0 = 1.0;' +
			'	${OUTPUT}' +
			'}';
	/*
	pre.textContent = genVertexShader(valueBlock);
	pre.textContent += "\n**********************************************\n";
	pre.textContent += genFragmentShader(valueBlock);
	pre.textContent += "\n**********************************************\n";
	pre.textContent += specializeVertexShader(shaderSrc, valueBlock);
	pre.textContent += "\n**********************************************\n";
	pre.textContent += specializeFragmentShader(shaderSrc, valueBlock);
	
	document.body.appendChild(pre);
	*/
	//draw();
	execute();
	stateMachine.terminate(true);
	return;

		++state.index;
		if (state.index < state.testCases.length)
			stateMachine.runCallback(runTestCases);
		else
			stateMachine.terminate(true);
	};

	return {
		runTestCases: runTestCases
	};

}());


