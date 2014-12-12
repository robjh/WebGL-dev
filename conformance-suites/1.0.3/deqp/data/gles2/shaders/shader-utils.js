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
 
var shaderUtils = (function() {
	"use strict";
var getDataTypeFloatScalars = function(dataType) {
    var floatTypes =     {
        "float": "float",
        "vec2" : "vec2",
        "vec3" : "vec3",
        "vec4" : "vec4",
        "mat2" : "mat2",
        "mat2x3": "mat2x3",
        "mat2x4": "mat2x4",
        "mat3x2": "mat3x2",
        "mat3" : "mat3",
        "mat3x4": "mat3x4",
        "mat4x2": "mat4x2",
        "mat4x3": "mat4x3",
        "mat4" : "mat4",
        "int": "float",
		"ivec2": "vec2",
		"ivec3": "vec3",
		"ivec4": "vec4",
		"uint": "float",
		"uvec2": "vec2",
		"uvec3": "vec3",
		"uvec4": "vec4",
		"bool": "float",
		"bvec2": "vec2",
		"bvec3": "vec3",
		"bvec4": "vec4",
    };
    return floatTypes[dataType];
};
var getDataTypeScalarType = function(dataType) {
    var scalarTypes = {
        "float": "float",
        "vec2" : "float",
        "vec3" : "float",
        "vec4" : "float",
        "mat2" : "float",
        "mat2x3": "float",
        "mat2x4": "float",
        "mat3x2": "float",
        "mat3" : "float",
        "mat3x4": "float",
        "mat4x2": "float",
        "mat4x3": "float",
        "mat4" : "float",
        "int": "int",
		"ivec2": "int",
		"ivec3": "int",
		"ivec4": "int",
		"uint": "uint",
		"uvec2": "uint",
		"uvec3": "uint",
		"uvec4": "uint",
		"bool": "bool",
		"bvec2": "bool",
		"bvec3": "bool",
		"bvec4": "bool",
		"sampler2D": "sampler2D",
		"samplerCube": "samplerCube",
		"sampler2DArray": "sampler2DArray",
		"sampler3D": "sampler3D",
		"sampler2DShadow": "sampler2DShadow",
		"samplerCubeShadow": "samplerCubeShadow",
		"sampler2DArrayShadow": "sampler2DArrayShadow",
		"isampler2D": "isampler2D",
		"isamplerCube": "isamplerCube",
		"isampler2DArray": "isampler2DArray",
		"isampler3D": "isampler3D",
		"usampler2D": "usampler2D",
		"usamplerCube": "usamplerCube",
		"usampler2DArray": "usampler2DArray",
		"usampler3D": "usampler3D"
    };
    return scalarTypes[dataType];
}
/**
 * @param {string} Shader datatype 
 * @return {bool} Is dataType integer or integer vector
 */
var isDataTypeIntOrIVec = function(dataType) {
	/** @bool */ var retVal = false;
	switch (dataType) {
	case "int":
	case "ivec2":
	case "ivec3":
	case "ivec4":
		retVal = true;
	};

	return retVal;
}

return {
	getDataTypeFloatScalars: getDataTypeFloatScalars,
	getDataTypeScalarType: getDataTypeScalarType,
	isDataTypeIntOrIVec: isDataTypeIntOrIVec
};
} ());
