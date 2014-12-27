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

/**
 * The Type constants
 * @enum {number}
 */
var DataType = {
	TYPE_INVALID:                   0,
	
	TYPE_FLOAT:                     1,
	TYPE_FLOAT_VEC2:                2,
	TYPE_FLOAT_VEC3:                3,
	TYPE_FLOAT_VEC4:                4,
	TYPE_FLOAT_MAT2:                5,
	TYPE_FLOAT_MAT2X3:              6,
	TYPE_FLOAT_MAT2X4:              7,
	TYPE_FLOAT_MAT3X2:              8,
	TYPE_FLOAT_MAT3:                9,
	TYPE_FLOAT_MAT3X4:             10,
	TYPE_FLOAT_MAT4X2:             11,
	TYPE_FLOAT_MAT4X3:             12,
	TYPE_FLOAT_MAT4:               13,

	TYPE_INT:                      14,
	TYPE_INT_VEC2:                 15,
	TYPE_INT_VEC3:                 16,
	TYPE_INT_VEC4:                 17,

	TYPE_UINT:                     18,
	TYPE_UINT_VEC2:                19,
	TYPE_UINT_VEC3:                20,
	TYPE_UINT_VEC4:                21,

	TYPE_BOOL:                     22,
	TYPE_BOOL_VEC2:                23,
	TYPE_BOOL_VEC3:                24,
	TYPE_BOOL_VEC4:                25,

	TYPE_SAMPLER_2D:               26,
	TYPE_SAMPLER_CUBE:             27,
	TYPE_SAMPLER_2D_ARRAY:         28,
	TYPE_SAMPLER_3D:               29,

	TYPE_SAMPLER_2D_SHADOW:        30,
	TYPE_SAMPLER_CUBE_SHADOW:      31,
	TYPE_SAMPLER_2D_ARRAY_SHADOW:  32,

	TYPE_INT_SAMPLER_2D:           33,
	TYPE_INT_SAMPLER_CUBE:         34,
	TYPE_INT_SAMPLER_2D_ARRAY:     35,
	TYPE_INT_SAMPLER_3D:           36,

	TYPE_UINT_SAMPLER_2D:          37,
	TYPE_UINT_SAMPLER_CUBE:        38,
	TYPE_UINT_SAMPLER_2D_ARRAY:    39,
	TYPE_UINT_SAMPLER_3D:          40,
};

/**
 *
 * @param {DataType} dataType
 */
var getDataTypeFloatScalars = function(dataType) {
	
	switch (dataType) {
		case DataType.TYPE_FLOAT: return "float";
		case DataType.TYPE_VEC2 : return "vec2";
		case DataType.TYPE_VEC3 : return "vec3";
		case DataType.TYPE_VEC4 : return "vec4";
		case DataType.TYPE_MAT2 : return "mat2";
		case DataType.TYPE_MAT2X3: return "mat2x3";
		case DataType.TYPE_MAT2X4: return "mat2x4";
		case DataType.TYPE_MAT3X2: return "mat3x2";
		case DataType.TYPE_MAT3 : return "mat3";
		case DataType.TYPE_MAT3X4: return "mat3x4";
		case DataType.TYPE_MAT4X2: return "mat4x2";
		case DataType.TYPE_MAT4X3: return "mat4x3";
		case DataType.TYPE_MAT4 : return "mat4";
		case DataType.TYPE_INT: return "float";
		case DataType.TYPE_IVEC2: return "vec2";
		case DataType.TYPE_IVEC3: return "vec3";
		case DataType.TYPE_IVEC4: return "vec4";
		case DataType.TYPE_UINT: return "float";
		case DataType.TYPE_UVEC2: return "vec2";
		case DataType.TYPE_UVEC3: return "vec3";
		case DataType.TYPE_UVEC4: return "vec4";
		case DataType.TYPE_BOOL: return "float";
		case DataType.TYPE_BVEC2: return "vec2";
		case DataType.TYPE_BVEC3: return "vec3";
		case DataType.TYPE_BVEC4: return "vec4";
	};
	testFailed("Unrecognized dataType " + dataType);
};

/**
 *
 * @param {DataType} dataType
 */
var getDataTypeScalarType = function(dataType) {
	switch (dataType) {
		case DataType.TYPE_FLOAT: return "float";
		case DataType.TYPE_VEC2 : return "float";
		case DataType.TYPE_VEC3 : return "float";
		case DataType.TYPE_VEC4 : return "float";
		case DataType.TYPE_MAT2 : return "float";
		case DataType.TYPE_MAT2X3: return "float";
		case DataType.TYPE_MAT2X4: return "float";
		case DataType.TYPE_MAT3X2: return "float";
		case DataType.TYPE_MAT3 : return "float";
		case DataType.TYPE_MAT3X4: return "float";
		case DataType.TYPE_MAT4X2: return "float";
		case DataType.TYPE_MAT4X3: return "float";
		case DataType.TYPE_MAT4 : return "float";
		case DataType.TYPE_INT: return "int";
		case DataType.TYPE_IVEC2: return "int";
		case DataType.TYPE_IVEC3: return "int";
		case DataType.TYPE_IVEC4: return "int";
		case DataType.TYPE_UINT: return "uint";
		case DataType.TYPE_UVEC2: return "uint";
		case DataType.TYPE_UVEC3: return "uint";
		case DataType.TYPE_UVEC4: return "uint";
		case DataType.TYPE_BOOL: return "bool";
		case DataType.TYPE_BVEC2: return "bool";
		case DataType.TYPE_BVEC3: return "bool";
		case DataType.TYPE_BVEC4: return "bool";
		case DataType.TYPE_SAMPLER_2D: return "sampler2D";
		case DataType.TYPE_SAMPLER_CUBE: return "samplerCube";
		case DataType.TYPE_SAMPLER_2D_ARRAY: return "sampler2DArray";
		case DataType.TYPE_SAMPLER_3D: return "sampler3D";
		case DataType.TYPE_SAMPLER_2D_SHADOW: return "sampler2DShadow";
		case DataType.TYPE_SAMPLER_CUBE_SHADOW: return "samplerCubeShadow";
		case DataType.TYPE_SAMPLER_2D_ARRAY_SHADOW: return "sampler2DArrayShadow";
		case DataType.TYPE_INT_SAMPLER_2D: return "isampler2D";
		case DataType.TYPE_INT_SAMPLER_CUBE: return "isamplerCube";
		case DataType.TYPE_INT_SAMPLER_2D_ARRAY: return "isampler2DArray";
		case DataType.TYPE_INT_SAMPLER_3D: return "isampler3D";
		case DataType.TYPE_UINT_SAMPLER_2D: return "usampler2D";
		case DataType.TYPE_UINT_SAMPLER_CUBE: return "usamplerCube";
		case DataType.TYPE_UINT_SAMPLER_2D_ARRAY: "usampler2DArray";
		case DataType.TYPE_UINT_SAMPLER_3D: return "usampler3D";
	};
	testFailed("Unrecognized dataType " + dataType);
}
/**
 * @param {string} Shader datatype 
 * @return {bool} Is dataType integer or integer vector
 */
var isDataTypeIntOrIVec = function(dataType) {
	/** @bool */ var retVal = false;
	switch (dataType) {
	case DataType.TYPE_INT:
	case DataType.TYPE_IVEC2:
	case DataType.TYPE_IVEC3:
	case DataType.TYPE_IVEC4:
		retVal = true;
	};

	return retVal;
}

var getDataTypeScalarSize = function(dataType) {
	switch (dataType) {
		case DataType.TYPE_FLOAT: return 1;
		case DataType.TYPE_VEC2 : return 2;
		case DataType.TYPE_VEC3 : return 3;
		case DataType.TYPE_VEC4 : return 4;
		case DataType.TYPE_MAT2 : return 4;
		case DataType.TYPE_MAT2X3: return 6;
		case DataType.TYPE_MAT2X4: return 8;
		case DataType.TYPE_MAT3X2: return 6;
		case DataType.TYPE_MAT3 : return 9;
		case DataType.TYPE_MAT3X4: return 12;
		case DataType.TYPE_MAT4X2: return 8;
		case DataType.TYPE_MAT4X3: return 12;
		case DataType.TYPE_MAT4 : return 16;
		case DataType.TYPE_INT: return 1;
		case DataType.TYPE_IVEC2: return 2;
		case DataType.TYPE_IVEC3: return 3;
		case DataType.TYPE_IVEC4: return 4;
		case DataType.TYPE_UINT: return 1;
		case DataType.TYPE_UVEC2: return 2;
		case DataType.TYPE_UVEC3: return 3;
		case DataType.TYPE_UVEC4: return 4;
		case DataType.TYPE_BOOL: return 1;
		case DataType.TYPE_BVEC2: return 2;
		case DataType.TYPE_BVEC3: return 3;
		case DataType.TYPE_BVEC4: return 4;
		case DataType.TYPE_SAMPLER_2D: return 1;
		case DataType.TYPE_SAMPLER_CUBE: return 1;
		case DataType.TYPE_SAMPLER_2D_ARRAY: return 1;
		case DataType.TYPE_SAMPLER_3D: return 1;
		case DataType.TYPE_SAMPLER_2D_SHADOW: return 1;
		case DataType.TYPE_SAMPLER_CUBE_SHADOW: return 1;
		case DataType.TYPE_SAMPLER_2D_ARRAY_SHADOW: return 1;
		case DataType.TYPE_INT_SAMPLER_2D: return 1;
		case DataType.TYPE_INT_SAMPLER_CUBE: return 1;
		case DataType.TYPE_INT_SAMPLER_2D_ARRAY: return 1;
		case DataType.TYPE_INT_SAMPLER_3D: return 1;
		case DataType.TYPE_UINT_SAMPLER_2D: return 1;
		case DataType.TYPE_UINT_SAMPLER_CUBE: return 1;
		case DataType.TYPE_UINT_SAMPLER_2D_ARRAY: return  1;
		case DataType.TYPE_UINT_SAMPLER_3D: return 1;
	};
	testFailed("Unrecognized dataType " + dataType);
};

var isDataTypeMatrix = function(dataType) {
	switch(dataType) {
	case DataType.TYPE_MAT2 : 
	case DataType.TYPE_MAT2X3:
	case DataType.TYPE_MAT2X4:
	case DataType.TYPE_MAT3X2:
	case DataType.TYPE_MAT3 :
	case DataType.TYPE_MAT3X4:
	case DataType.TYPE_MAT4X2:
	case DataType.TYPE_MAT4X3:
	case DataType.TYPE_MAT3 :
		return true;
	}
	return false;
};

var getDataTypeMatrixNumColumns = function(dataType) {
	switch(dataType) {
	case DataType.TYPE_MAT2 : return 2;
	case DataType.TYPE_MAT2X3: return 3;
	case DataType.TYPE_MAT2X4: return 4;
	case DataType.TYPE_MAT3X2: return 2;
	case DataType.TYPE_MAT3 : return 3;
	case DataType.TYPE_MAT3X4: return 4;
	case DataType.TYPE_MAT4X2: return 2;
	case DataType.TYPE_MAT4X3: return 3;
	case DataType.TYPE_MAT3 : return 4;
	}
	testFailed("Unrecognized dataType " + dataType);
};

var getDataTypeMatrixNumRows = function(dataType) {
	switch(dataType) {
	case DataType.TYPE_MAT2 : return 2;
	case DataType.TYPE_MAT2X3: return 2;
	case DataType.TYPE_MAT2X4: return 2;
	case DataType.TYPE_MAT3X2: return 3;
	case DataType.TYPE_MAT3 : return 3;
	case DataType.TYPE_MAT3X4: return 3;
	case DataType.TYPE_MAT4X2: return 4;
	case DataType.TYPE_MAT4X3: return 4;
	case DataType.TYPE_MAT3 : return 4;
	}
	testFailed("Unrecognized dataType " + dataType);
};

var getDataTypeName = function(dataType)  {
	switch(dataType) {
	case DataType.TYPE_INVALID: return "invalid";
	
	case DataType.TYPE_FLOAT: return "float";
	case DataType.TYPE_FLOAT_VEC2: return "vec2";
	case DataType.TYPE_FLOAT_VEC3: return "vec3";
	case DataType.TYPE_FLOAT_VEC4: return "vec4";
	case DataType.TYPE_FLOAT_MAT2: return "mat2";
	case DataType.TYPE_FLOAT_MAT2X3: return "mat2x3";
	case DataType.TYPE_FLOAT_MAT2X4: return "mat2x4";
	case DataType.TYPE_FLOAT_MAT3X2: return "mat3x2";
	case DataType.TYPE_FLOAT_MAT3: return "mat3";
	case DataType.TYPE_FLOAT_MAT3X4: return "mat3x4";
	case DataType.TYPE_FLOAT_MAT4X2: return "mat4x2";
	case DataType.TYPE_FLOAT_MAT4X3: return "mat4x3";
	case DataType.TYPE_FLOAT_MAT4: return "mat4";

	case DataType.TYPE_INT: return "int";
	case DataType.TYPE_INT_VEC2: return "ivec2";
	case DataType.TYPE_INT_VEC3: return "ivec3";
	case DataType.TYPE_INT_VEC4: return "ivec4";

	case DataType.TYPE_UINT: return "uint";
	case DataType.TYPE_UINT_VEC2: return "uvec2";
	case DataType.TYPE_UINT_VEC3: return "uvec3";
	case DataType.TYPE_UINT_VEC4: return "uvec4";

	case DataType.TYPE_BOOL: return "bool";
	case DataType.TYPE_BOOL_VEC2: return "bvec2";
	case DataType.TYPE_BOOL_VEC3: return "bvec3";
	case DataType.TYPE_BOOL_VEC4: return "bvec4";

	case DataType.TYPE_SAMPLER_2D: return "sampler2D";
	case DataType.TYPE_SAMPLER_CUBE: return "samplerCube";
	case DataType.TYPE_SAMPLER_2D_ARRAY: return "sampler2DArray";
	case DataType.TYPE_SAMPLER_3D: return "sampler3D";

	case DataType.TYPE_SAMPLER_2D_SHADOW: return "sampler2DShadow";
	case DataType.TYPE_SAMPLER_CUBE_SHADOW: return "samplerCubeShadow";
	case DataType.TYPE_SAMPLER_2D_ARRAY_SHADOW: return "sampler2DArrayShadow";

	case DataType.TYPE_INT_SAMPLER_2D: return "isampler2D";
	case DataType.TYPE_INT_SAMPLER_CUBE: return "isamplerCube";
	case DataType.TYPE_INT_SAMPLER_2D_ARRAY: return "isampler2DArray";
	case DataType.TYPE_INT_SAMPLER_3D: return "isampler3D";

	case DataType.TYPE_UINT_SAMPLER_2D: return "usampler2D";
	case DataType.TYPE_UINT_SAMPLER_CUBE: return "usamplerCube";
	case DataType.TYPE_UINT_SAMPLER_2D_ARRAY: return "usampler2DArray";
	case DataType.TYPE_UINT_SAMPLER_3D: return "usampler3D";
	}
	testFailed("Unrecognized dataType " + dataType);
};

return {
	DataType: DataType,
	getDataTypeFloatScalars: getDataTypeFloatScalars,
	getDataTypeScalarType: getDataTypeScalarType,
	isDataTypeIntOrIVec: isDataTypeIntOrIVec,
	getDataTypeScalarSize: getDataTypeScalarSize,
	isDataTypeMatrix: isDataTypeMatrix,
	getDataTypeMatrixNumColumns: getDataTypeMatrixNumColumns,
	getDataTypeMatrixNumRows: getDataTypeMatrixNumRows,
	getDataTypeName: getDataTypeName
};

} ());
