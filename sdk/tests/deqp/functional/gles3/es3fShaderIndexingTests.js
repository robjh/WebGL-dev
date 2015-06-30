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
 *	  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

'use strict';
goog.provide('functional.gles3.es3fShaderIndexingTests');
goog.require('framework.common.tcuImageCompare');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.opengl.gluShaderUtil');
goog.require('modules.shared.glsShaderRenderCase');

goog.scope(function() {

	var es3fShaderIndexingTests = functional.gles3.es3fShaderIndexingTests;
	var deMath = framework.delibs.debase.deMath;
        var glsShaderRenderCase = modules.shared.glsShaderRenderCase;
        var gluShaderUtil = framework.opengl.gluShaderUtil;
	/**
	 * @enum {number}
	 */
	es3fShaderIndexingTests.IndexAccessType = {
		STATIC: 0,
		DYNAMIC: 1,
		STATIC_LOOP: 2,
		DYNAMIC_LOOP: 3
	};

	/**
	 * @param {es3fShaderIndexingTests.IndexAccessType} accessType
	 * @return {string}
	 */
	es3fShaderIndexingTests.getIndexAccessTypeName = function(accessType) {
		/** @type {Array<string>} */ var s_names = [
			"static",
			"dynamic",
			"static_loop",
			"dynamic_loop"
		];
		return s_names[accessType];
	};

	/**
	 * @enum {number}
	 */
	es3fShaderIndexingTests.VectorAccessType = {
		DIRECT: 0,
		COMPONENT: 1,
		SUBSCRIPT_STATIC: 2,
		SUBSCRIPT_DYNAMIC: 3,
		SUBSCRIPT_STATIC_LOOP: 4,
		SUBSCRIPT_DYNAMIC_LOOP: 5,
	};

	/**
	 * @param {es3fShaderIndexingTests.VectorAccessType} accessType
	 * @return {string}
	 */
	es3fShaderIndexingTests.getVectorAccessTypeName = function(accessType) {
		/** @type {Array<string>} */ var s_names = [
			"direct",
			"component",
			"static_subscript",
			"dynamic_subscript",
			"static_loop_subscript",
			"dynamic_loop_subscript"
		];
		assertMsgOptions(deMath.deInBounds32(accessType, 0, s_names.length), "Index out of bounds", false, true);
		return s_names[accessType];
	};

	/** @param {glsShaderRenderCase.ShaderEvalContext} c */
	es3fShaderIndexingTests.evalArrayCoordsFloat = function(c) {
		c.color[0] = 1.875 * c.coords[0];
	};

	/** @param {glsShaderRenderCase.ShaderEvalContext} c */
	es3fShaderIndexingTests.evalArrayCoordsVec2 = function(c) {
		var swizzled = deMath.swizzle(c.coords, [0, 1]);
		c.color[0] = 1.875 * swizzled[0];
		c.color[1] = 1.875 * swizzled[1];
	};

	/** @param {glsShaderRenderCase.ShaderEvalContext} c */
	es3fShaderIndexingTests.evalArrayCoordsVec3 = function(c) {
		var swizzled = deMath.swizzle(c.coords, [0, 1, 2]);
		c.color[0] = 1.875 * swizzled[0];
		c.color[1] = 1.875 * swizzled[1];
		c.color[2] = 1.875 * swizzled[2];
	};

	/** @param {glsShaderRenderCase.ShaderEvalContext} c */
	es3fShaderIndexingTests.evalArrayCoordsVec4 = function(c) {
		c.color = deMath.scale(c.coords, 1.875);
	};

    /**
     * @param {gluShaderUtil.DataType} dataType
     * @return {function(glsShaderRenderCase.ShaderEvalContext)}
     */
	es3fShaderIndexingTests.getArrayCoordsEvalFunc = function(dataType) {
		if (dataType === gluShaderUtil.DataType.FLOAT) return evalArrayCoordsFloat;
		else if (dataType === gluShaderUtil.DataType.FLOAT_VEC2) return evalArrayCoordsVec2;
		else if (dataType === gluShaderUtil.DataType.FLOAT_VEC3) return evalArrayCoordsVec3;
		else if (dataType === gluShaderUtil.DataType.FLOAT_VEC4) return evalArrayCoordsVec4;
        else throw new Error('Invalid data type.');
	};


	/** @param {glsShaderRenderCase.ShaderEvalContext} c */
	es3fShaderIndexingTests.evalArrayUniformFloat = function(c) {
        c.color[0] = 1.875 * c.constCoords[0];
    };

	/** @param {glsShaderRenderCase.ShaderEvalContext} c */
	es3fShaderIndexingTests.evalArrayUniformVec2 = function(c) {
        var swizzled = deMath.swizzle(c.constCoords, [0, 1]);
        c.color[0] = 1.875 * swizzled[0];
        c.color[1] = 1.875 * swizzled[1];
    };

	/** @param {glsShaderRenderCase.ShaderEvalContext} c */
	es3fShaderIndexingTests.evalArrayUniformVec3 = function(c) {
        var swizzled = deMath.swizzle(c.constCoords, [0, 1, 2]);
        c.color[0] = 1.875 * swizzled[0];
        c.color[1] = 1.875 * swizzled[1];
        c.color[2] = 1.875 * swizzled[2];
    };

	/** @param {glsShaderRenderCase.ShaderEvalContext} c */
	es3fShaderIndexingTests.evalArrayUniformVec4 = function(c) {
        c.color = deMath.scale(c.constCoords, 1.875);
    };

    /**
     * @param {gluShaderUtil.DataType} dataType
     * @return {function(glsShaderRenderCase.ShaderEvalContext)}
     */
	es3fShaderIndexingTests.getArrayUniformEvalFunc = function(dataType) {
    	if (dataType === gluShaderUtil.DataType.FLOAT) return evalArrayUniformFloat;
    	else if (dataType === gluShaderUtil.DataType.FLOAT_VEC2) return evalArrayUniformVec2;
    	else if (dataType === gluShaderUtil.DataType.FLOAT_VEC3) return evalArrayUniformVec3;
    	else if (dataType === gluShaderUtil.DataType.FLOAT_VEC4) return evalArrayUniformVec4;
        else throw new Error('Invalid data type.');
    };

    /**
     * @constructor
     * @extends {ShaderRenderCase}
     * @param {string} name
     * @param {string} description
     * @param {boolean} isVertexCase
     * @param {gluShaderUtil.DataType} varType
     * @param {ShaderEvalFunc} evalFunc
     * @param {string} vertShaderSource
     * @param {string} fragShaderSource
     */
    es3fShaderIndexingTests.ShaderIndexingCase = function(name, description, isVertexCase, varType, evalFunc, vertShaderSource, fragShaderSource) {
        ShaderRenderCase.call(this, name, description);
        /** @type {gluShaderUtil.DataType} */ this.m_varType = varType;
        /** @type {string} */ this.m_vertShaderSource	= vertShaderSource;
        /** @type {string} */ this.m_fragShaderSource	= fragShaderSource;
    };

    es3fShaderIndexingTests.ShaderIndexingCase.prototype = Object.create(ShaderRenderCase.prototype);
    es3fShaderIndexingTests.ShaderIndexingCase.prototype.constructor = es3fShaderIndexingTests.ShaderIndexingCase;

    /**
     * @param {number} programID
     * @param {Array<number>} constCoords
     */
    es3fShaderIndexingTests.ShaderIndexingCase.prototype.setupUniforms = function(programID, constCoords) {

    	DE_UNREF(constCoords);

    	/** @type {number} */ var arrLoc = gl.getUniformLocation(programID, "u_arr");
    	if (arrLoc != -1) {
    		if (this.m_varType == TYPE_FLOAT) {
    			/** @type {Array<number>} */ var arr;
    			arr[0] = constCoords[0];
    			arr[1] = constCoords[0] * 0.5;
    			arr[2] = constCoords[0] * 0.25;
    			arr[3] = constCoords[0] * 0.125;
    			gl.uniform1fv(arrLoc, 4, new Float32Array(arr));
    		}
    		else if (this.m_varType == TYPE_FLOAT_VEC2) {
    			/** @type {Array<Array<number>>} */ var arr;
    			arr[0] = deMath.swizzle(constCoords, [0, 1]]);
    			arr[1] = deMath.scale(deMath.swizzle(constCoords, [0, 1]]), 0.5);
    			arr[2] = deMath.scale(deMath.swizzle(constCoords, [0, 1]]), 0.25);
    			arr[3] = deMath.scale(deMath.swizzle(constCoords, [0, 1]]), 0.125);
                /** @type {Array<number>} */ var array1d = [];
                for (var i = 0; i < arr.length; i++)
                    array1d = array1d.concat(arr[i]);
    			gl.uniform2fv(arrLoc, 4, new Float32Array(array1d));
    		}
    		else if (this.m_varType == TYPE_FLOAT_VEC3) {
    			Vec3 arr[4];
    			arr[0] = deMath.swizzle(constCoords, [0, 1, 2]);
    			arr[1] = deMath.scale(deMath.swizzle(constCoords, [0, 1, 2]), 0.5);
    			arr[2] = deMath.scale(deMath.swizzle(constCoords, [0, 1, 2]), 0.25);
    			arr[3] = deMath.scale(deMath.swizzle(constCoords, [0, 1, 2]), 0.125);
                /** @type {Array<number>} */ var array1d = [];
                for (var i = 0; i < arr.length; i++)
                    array1d = array1d.concat(arr[i]);
    			gl.uniform3fv(arrLoc, 4, new Float32Array(array1d));
    		}
    		else if (this.m_varType == TYPE_FLOAT_VEC4) {
    			Vec4 arr[4];
    			arr[0] = deMath.swizzle(constCoords, [0,1,2,3]);
    			arr[1] = deMath.scale(deMath.swizzle(constCoords, [0, 1, 2, 3]), 0.5);
    			arr[2] = deMath.scale(deMath.swizzle(constCoords, [0, 1, 2, 3]), 0.25);
    			arr[3] = deMath.scale(deMath.swizzle(constCoords, [0, 1, 2, 3]), 0.125);
                /** @type {Array<number>} */ var array1d = [];
                for (var i = 0; i < arr.length; i++)
                    array1d = array1d.concat(arr[i]);
    			gl.uniform4fv(arrLoc, 4, new Float32Array(array1d));
    		}
    		else
    			throw new Error('u_arr should not have location assigned in this test case');
    	}
    };

    /**
     * @param  {string} caseName
     * @param  {string} description
     * @param  {gluShaderUtil.DataType} varType
     * @param  {IndexAccessType} vertAccess
     * @param  {IndexAccessType} fragAccess
     * @return {ShaderIndexingCase}
     */
    es3fShaderIndexingTests.createVaryingArrayCase = function(caseName, description, varType, vertAccess, fragAccess) {
        /** @type {string} */ var vtx = '';
    	vtx += '#version 300 es\n';
    	vtx += 'in highp vec4 a_position;\n';
    	vtx += 'in highp vec4 a_coords;\n';
    	if (vertAccess == es3fShaderIndexingTests.IndexAccessType.DYNAMIC)
    		vtx += 'uniform mediump int ui_zero, ui_one, ui_two, ui_three;\n';
    	else if (vertAccess == es3fShaderIndexingTests.IndexAccessType.DYNAMIC_LOOP)
    		vtx += 'uniform mediump int ui_four;\n';
    	vtx += 'out ${PRECISION} ${VAR_TYPE} var[${ARRAY_LEN}];\n';
    	vtx += '\n';
    	vtx += 'void main()\n';
    	vtx += '{\n';
    	vtx += '	gl_Position = a_position;\n';
    	if (vertAccess == es3fShaderIndexingTests.IndexAccessType.STATIC) {
    		vtx += '	var[0] = ${VAR_TYPE}(a_coords);\n';
    		vtx += '	var[1] = ${VAR_TYPE}(a_coords) * 0.5;\n';
    		vtx += '	var[2] = ${VAR_TYPE}(a_coords) * 0.25;\n';
    		vtx += '	var[3] = ${VAR_TYPE}(a_coords) * 0.125;\n';
    	}
    	else if (vertAccess == es3fShaderIndexingTests.IndexAccessType.DYNAMIC) {
    		vtx += '	var[ui_zero]  = ${VAR_TYPE}(a_coords);\n';
    		vtx += '	var[ui_one]   = ${VAR_TYPE}(a_coords) * 0.5;\n';
    		vtx += '	var[ui_two]   = ${VAR_TYPE}(a_coords) * 0.25;\n';
    		vtx += '	var[ui_three] = ${VAR_TYPE}(a_coords) * 0.125;\n';
    	}
    	else if (vertAccess == es3fShaderIndexingTests.IndexAccessType.STATIC_LOOP) {
    		vtx += '	${PRECISION} ${VAR_TYPE} coords = ${VAR_TYPE}(a_coords);\n';
    		vtx += '	for (int i = 0; i < 4; i++)\n';
    		vtx += '	{\n';
    		vtx += '		var[i] = ${VAR_TYPE}(coords);\n';
    		vtx += '		coords = coords * 0.5;\n';
    		vtx += '	}\n';
    	}
    	else {
    		assertMsgOptions(vertAccess == es3fShaderIndexingTests.IndexAccessType.DYNAMIC_LOOP, 'Not Dynamic_Loop', false, true);
    		vtx += '	${PRECISION} ${VAR_TYPE} coords = ${VAR_TYPE}(a_coords);\n';
    		vtx += '	for (int i = 0; i < ui_four; i++)\n';
    		vtx += '	{\n';
    		vtx += '		var[i] = ${VAR_TYPE}(coords);\n';
    		vtx += '		coords = coords * 0.5;\n';
    		vtx += '	}\n';
    	}
    	vtx += '}\n';

    	/** @type {string} */ var frag = '';
    	frag += '#version 300 es\n';
    	frag += 'precision mediump int;\n';
    	frag += 'layout(location = 0) out mediump vec4 o_color;\n';
    	if (fragAccess == es3fShaderIndexingTests.IndexAccessType.DYNAMIC)
    		frag += 'uniform mediump int ui_zero, ui_one, ui_two, ui_three;\n';
    	else if (fragAccess == es3fShaderIndexingTests.IndexAccessType.DYNAMIC_LOOP)
    		frag += 'uniform int ui_four;\n';
    	frag += 'in ${PRECISION} ${VAR_TYPE} var[${ARRAY_LEN}];\n';
    	frag += '\n';
    	frag += 'void main()\n';
    	frag += '{\n';
    	frag += '	${PRECISION} ${VAR_TYPE} res = ${VAR_TYPE}(0.0);\n';
    	if (fragAccess == es3fShaderIndexingTests.IndexAccessType.STATIC) {
    		frag += '	res += var[0];\n';
    		frag += '	res += var[1];\n';
    		frag += '	res += var[2];\n';
    		frag += '	res += var[3];\n';
    	}
    	else if (fragAccess == es3fShaderIndexingTests.IndexAccessType.DYNAMIC) {
    		frag += '	res += var[ui_zero];\n';
    		frag += '	res += var[ui_one];\n';
    		frag += '	res += var[ui_two];\n';
    		frag += '	res += var[ui_three];\n';
    	}
    	else if (fragAccess == es3fShaderIndexingTests.IndexAccessType.STATIC_LOOP) {
    		frag += '	for (int i = 0; i < 4; i++)\n';
    		frag += '		res += var[i];\n';
    	}
    	else {
    		assertMsgOptions(fragAccess == es3fShaderIndexingTests.IndexAccessType.DYNAMIC_LOOP, 'Not Dynamic_Loop', false, true);
    		frag += '	for (int i = 0; i < ui_four; i++)\n';
    		frag += '		res += var[i];\n';
    	}
    	frag += '	o_color = vec4(res${PADDING});\n';
    	frag += '}\n';

    	// Fill in shader templates.
    	vtx = vtx.replace("${VAR_TYPE}", gluShaderUtil.getDataTypeName(varType)))
                 .replace("${ARRAY_LEN}", "4"))
                 .replace("${PRECISION}", "mediump"));

    	frag = frag.replace("${VAR_TYPE}", gluShaderUtil.getDataTypeName(varType)))
    	           .replace("${ARRAY_LEN}", "4"))
    	           .replace("${PRECISION}", "mediump"));

    	if (varType == TYPE_FLOAT)
    		frag = frag.replace("${PADDING}", ", 0.0, 0.0, 1.0"));
    	else if (varType == TYPE_FLOAT_VEC2)
    		frag = frag.replace("${PADDING}", ", 0.0, 1.0"));
    	else if (varType == TYPE_FLOAT_VEC3)
    		frag = frag.replace("${PADDING}", ", 1.0"));
    	else
    		frag = frag.replace("${PADDING}", ""));

    	/** @type {ShaderEvalFunc} */ var evalFunc = es3fShaderIndexingTests.getArrayCoordsEvalFunc(varType);
    	return new ShaderIndexingCase(context, caseName, description, true, varType, evalFunc, vtx, frag);

    };
});
