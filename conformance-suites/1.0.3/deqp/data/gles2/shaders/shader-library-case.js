/*
** Copyright (c) 2012 The Khronos Group Inc.
**
** Permission is hereby granted, free of charge, to any person obtaining a
** copy of this software and/or associated documentation files (the
** "Materials"), to deal in the Materials without restriction, including
** without limitation the rights to use, copy, modify, merge, publish,
** distribute, sublicense, and/or sell copies of the Materials, and to
** permit persons to whom the Materials are furnished to do so, subject to
** the following conditions:
**
** The above copyright notice and this permission notice shall be included
** in all copies or substantial portions of the Materials.
**
** THE MATERIALS ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
** EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
** MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
** IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
** CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
** TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
** MATERIALS OR THE USE OR OTHER DEALINGS IN THE MATERIALS.
*/

var shaderCase = {
	value: {
		STORAGE_INPUT: "STORAGE_INPUT",
		STORAGE_OUTPUT: "STORAGE_OUTPUT"
	}
};


var shaderLibraryCase = (function() {
	'use strict';

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

var runTestCases = function() {
	var state = stateMachine.getState();
	if (!state.index)
		state.index = 0;
	

	var pre = document.createElement('pre');
	state.targetVersion = "300 es";
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
	pre.textContent = genVertexShader(valueBlock);
	pre.textContent += genFragmentShader(valueBlock);
	document.body.appendChild(pre);
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


