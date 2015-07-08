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
goog.provide('functional.gles3.es3fShaderLoopTests');
// goog.require('framework.common.tcuImageCompare');
// goog.require('framework.common.tcuTestCase');
// goog.require('framework.delibs.debase.deMath');
// goog.require('framework.opengl.gluShaderUtil');
// goog.require('framework.opengl.gluTexture');
// goog.require('modules.shared.glsShaderRenderCase');

goog.scope(function() {
	var es3fShaderLoopTests = functional.gles3.es3fShaderLoopTests;

// Repeated with for, while, do-while. Examples given as 'for' loops.
// Repeated for const, uniform, dynamic loops.

/**
 * @enum {number}
 */
es3fShaderLoopTests.LoopCase = {
	LOOPCASE_EMPTY_BODY: 0,								// for (...) { }
	LOOPCASE_INFINITE_WITH_UNCONDITIONAL_BREAK_FIRST: 1,		// for (...) { break; <body>; }
	LOOPCASE_INFINITE_WITH_UNCONDITIONAL_BREAK_LAST: 2,		// for (...) { <body>; break; }
	LOOPCASE_INFINITE_WITH_CONDITIONAL_BREAK: 3,				// for (...) { <body>; if (cond) break; }
	LOOPCASE_SINGLE_STATEMENT: 4,								// for (...) statement;
	LOOPCASE_COMPOUND_STATEMENT: 5,							// for (...) { statement; statement; }
	LOOPCASE_SEQUENCE_STATEMENT: 6,							// for (...) statement, statement;
	LOOPCASE_NO_ITERATIONS: 7,									// for (i=0; i<0; i++) ...
	LOOPCASE_SINGLE_ITERATION: 8,								// for (i=0; i<1; i++) ...
	LOOPCASE_SELECT_ITERATION_COUNT: 9,						// for (i=0; i<a?b:c; i++) ...
	LOOPCASE_CONDITIONAL_CONTINUE: 10,							// for (...) { if (cond) continue; }
	LOOPCASE_UNCONDITIONAL_CONTINUE: 11,						// for (...) { <body>; continue; }
	LOOPCASE_ONLY_CONTINUE: 12,									// for (...) { continue; }
	LOOPCASE_DOUBLE_CONTINUE: 13,								// for (...) { if (cond) continue; <body>; continue; }
	LOOPCASE_CONDITIONAL_BREAK: 14,								// for (...) { if (cond) break; }
	LOOPCASE_UNCONDITIONAL_BREAK: 15,							// for (...) { <body>; break; }
	LOOPCASE_PRE_INCREMENT: 16,									// for (...; ++i) { <body>; }
	LOOPCASE_POST_INCREMENT: 17,								// for (...; i++) { <body>; }
	LOOPCASE_MIXED_BREAK_CONTINUE: 18,
	LOOPCASE_VECTOR_COUNTER: 19,								// for (ivec3 ndx = ...; ndx.x < ndx.y; ndx.x += ndx.z) { ... }
	LOOPCASE_101_ITERATIONS: 20,								// loop for 101 iterations
	LOOPCASE_SEQUENCE: 21,										// two loops in sequence
	LOOPCASE_NESTED: 22,										// two nested loops
	LOOPCASE_NESTED_SEQUENCE: 23,								// two loops in sequence nested inside a third
	LOOPCASE_NESTED_TRICKY_DATAFLOW_1: 24,						// nested loops with tricky data flow
	LOOPCASE_NESTED_TRICKY_DATAFLOW_2: 25						// nested loops with tricky data flow
};

/**
 * @param {es3fShaderLoopTests.LoopCase} loopCase
 * @return {string}
 */
es3fShaderLoopTests.getLoopCaseName = function(loopCase) {
	/** @typr {Array<string>} */ var s_names = [
		'empty_body',
		'infinite_with_unconditional_break_first',
		'infinite_with_unconditional_break_last',
		'infinite_with_conditional_break',
		'single_statement',
		'compound_statement',
		'sequence_statement',
		'no_iterations',
		'single_iteration',
		'select_iteration_count',
		'conditional_continue',
		'unconditional_continue',
		'only_continue',
		'double_continue',
		'conditional_break',
		'unconditional_break',
		'pre_increment',
		'post_increment',
		'mixed_break_continue',
		'vector_counter',
		'101_iterations',
		'sequence',
		'nested',
		'nested_sequence',
		'nested_tricky_dataflow_1',
		'nested_tricky_dataflow_2'
	];
	// DE_STATIC_ASSERT(DE_LENGTH_OF_ARRAY(s_names) == es3fShaderLoopTests.LoopCase.LOOPCASE_LAST);
	// DE_ASSERT(deInBounds32((int)loopCase, 0, LOOPCASE_LAST));
	return s_names[loopCase];
};

// Complex loop cases.

/*enum LoopBody
{
	LOOPBODY_READ_UNIFORM = 0,
	LOOPBODY_READ_UNIFORM_ARRAY,
	LOOPBODY_READ_
};*/

/**
 * @enum {number}
 */
es3fShaderLoopTests.LoopType = {
	LOOPTYPE_FOR: 0,
	LOOPTYPE_WHILE: 1,
	LOOPTYPE_DO_WHILE: 2
};

/**
 * @param {es3fShaderLoopTests.LoopType} loopType
 * @return {string}
 */
es3fShaderLoopTests.getLoopTypeName = function(loopType) {
	/** @typr {Array<string>} */ var s_names = [
		'for',
		'while',
		'do_while'
	];

	// DE_STATIC_ASSERT(DE_LENGTH_OF_ARRAY(s_names) == LOOPTYPE_LAST);
	// DE_ASSERT(deInBounds32((int)loopType, 0, LOOPTYPE_LAST));
	return s_names[loopType];
};

/**
 * @enum {number}
 */
es3fShaderLoopTests.LoopCountType = {
	LOOPCOUNT_CONSTANT: 0,
	LOOPCOUNT_UNIFORM: 1,
	LOOPCOUNT_DYNAMIC: 2
};

/**
 * @param {es3fShaderLoopTests.LoopCountType} countType
 * @return {string}
 */
es3fShaderLoopTests.getLoopCountTypeName = function(countType) {
	/** @typr {Array<string>} */ var s_names =	{
		'constant',
		'uniform',
		'dynamic'
	};

	// DE_STATIC_ASSERT(DE_LENGTH_OF_ARRAY(s_names) == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_LAST);
	// DE_ASSERT(deInBounds32((int)countType, 0, es3fShaderLoopTests.LoopCountType.LOOPCOUNT_LAST));
	return s_names[countType];
};

/**
 * @param {glsShaderRenderCase.ShaderEvalContext} c
 */
es3fShaderLoopTests.evalLoop0Iters = function(c) {
	var swizzled = deMath.swizzle(c.coords, [0, 1, 2]);
	c.color[0] = swizzled[0];
	c.color[1] = swizzled[1];
	c.color[2] = swizzled[2];
};

/**
 * @param {glsShaderRenderCase.ShaderEvalContext} c
 */
es3fShaderLoopTests.evalLoop1Iters = function(c) {
	var swizzled = deMath.swizzle(c.coords, [1, 2, 3]);
	c.color[0] = swizzled[0];
	c.color[1] = swizzled[1];
	c.color[2] = swizzled[2];
};

/**
 * @param {glsShaderRenderCase.ShaderEvalContext} c
 */
es3fShaderLoopTests.evalLoop2Iters = function(c) {
	var swizzled = deMath.swizzle(c.coords, [2, 3, 0]);
	c.color[0] = swizzled[0];
	c.color[1] = swizzled[1];
	c.color[2] = swizzled[2];
};

/**
 * @param {glsShaderRenderCase.ShaderEvalContext} c
 */
es3fShaderLoopTests.evalLoop3Iters = function(c) {
	var swizzled = deMath.swizzle(c.coords, [3, 0, 1]);
	c.color[0] = swizzled[0];
	c.color[1] = swizzled[1];
	c.color[2] = swizzled[2];
};

/**
 * @param {number} numIters
 * @return {glsShaderRenderCase.ShaderEvalFunc}
 */
es3fShaderLoopTests.getLoopEvalFunc = function(numIters) = {
	switch (numIters % 4) {
		case 0: return es3fShaderLoopTests.evalLoop0Iters;
		case 1:	return es3fShaderLoopTests.evalLoop1Iters;
		case 2:	return es3fShaderLoopTests.evalLoop2Iters;
		case 3:	return es3fShaderLoopTests.evalLoop3Iters;
	}

	throw new Error('Invalid loop iteration count.');
};

// ShaderLoopCase

/**
 * @constructor
 * @extends {glsShaderRenderCase.ShaderRenderCase}
 * @param {string} name
 * @param {string} description
 * @param {boolean} isVertexCase
 * @param {glsShaderRenderCase.ShaderEvalFunc} evalFunc
 * @param {string} vertShaderSource
 * @param {string} fragShaderSource
 */
es3fShaderLoopTests.ShaderLoopCase = function(name, description, isVertexCase, evalFunc, vertShaderSource, fragShaderSource) {
	glsShaderRenderCase.ShaderRenderCase.call(name, description, isVertexCase, evalFunc);
	/** @type {string} */ this.m_vertShaderSource = vertShaderSource;
	/** @type {string} */ this.m_fragShaderSource = fragShaderSource;
};

es3fShaderLoopTests.ShaderLoopCase.prototype = Object.create(glsShaderRenderCase.ShaderRenderCase.prototype);
es3fShaderLoopTests.ShaderLoopCase.prototype.constructor = es3fShaderLoopTests.ShaderLoopCase;

// Test case creation.

/**
 * @param {string} caseName
 * @param {string} description
 * @param {boolean} isVertexCase
 * @param {LoopType} loopType
 * @param {LoopCountType} loopCountType
 * @param {Precision} loopCountPrecision
 * @param {DataType} loopCountDataType
 * @return {es3fShaderLoopTests.ShaderLoopCase}
 */
es3fShaderLoopTests.createGenericLoopCase = function(caseName, description, bool isVertexCase, loopType, loopCountType, loopCountPrecision, loopCountDataType) {
	/** @type {string} */ var vtx = '';
	/** @type {string} */ var frag = '';
	/** @type {string} */ var op = ''; // isVertexCase ? vtx : frag;

	vtx += '#version 300 es\n';
	frag += '#version 300 es\n';

	vtx += 'in highp vec4 a_position;\n';
	vtx += 'in highp vec4 a_coords;\n';
	frag += 'layout(location = 0) out mediump vec4 o_color;\n';

	if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC)
		vtx += 'in mediump float a_one;\n';

	if (isVertexCase) {
		vtx += 'out mediump vec3 v_color;\n';
		frag += 'in mediump vec3 v_color;\n';
	}
	else {
		vtx += 'out mediump vec4 v_coords;\n';
		frag += 'in mediump vec4 v_coords;\n';

		if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC) {
			vtx += 'out mediump float v_one;\n';
			frag += 'in mediump float v_one;\n';
		}
	}

	// \todo [petri] Pass numLoopIters from outside?
	/** @type {number} */ var numLoopIters = 3;
	/** @type {boolean} */ var isIntCounter = gluShaderUtil.isDataTypeIntOrIVec(loopCountDataType);

	if (isIntCounter) {
		if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_UNIFORM || loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC)
			op += 'uniform ' + gluShaderUtil.getPrecisionName(loopCountPrecision) + ' int ' + getIntUniformName(numLoopIters) + ';\n';
	}
	else {
		if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_UNIFORM || loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC)
			op += 'uniform ' + gluShaderUtil.getPrecisionName(loopCountPrecision) + ' float ' + getFloatFractionUniformName(numLoopIters) + ';\n';

		if (numLoopIters != 1)
			op += 'uniform ' + gluShaderUtil.getPrecisionName(loopCountPrecision) + ' float uf_one;\n';
	}

	vtx += isVertexCase ? op : '';
	frag += isVertexCase ? '' : op;
	op = '';

	vtx += '\n';
	vtx += 'void main()\n';
	vtx += '{\n';
	vtx += '	gl_Position = a_position;\n';

	frag += '\n';
	frag += 'void main()\n';
	frag += '{\n';

	if (isVertexCase)
		vtx += '	mediump vec4 coords = a_coords;\n';
	else
		frag += '	mediump vec4 coords = v_coords;\n';

	if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC) {
		if (isIntCounter) {
			if (isVertexCase)
				vtx += '	' + gluShaderUtil.getPrecisionName(loopCountPrecision) + ' int one = int(a_one + 0.5);\n';
			else
				frag += '	' + gluShaderUtil.getPrecisionName(loopCountPrecision) + ' int one = int(v_one + 0.5);\n';
		}
		else {
			if (isVertexCase)
				vtx += '	' + gluShaderUtil.getPrecisionName(loopCountPrecision) + ' float one = a_one;\n';
			else
				frag += '	' + gluShaderUtil.getPrecisionName(loopCountPrecision) + ' float one = v_one;\n';
		}
	}

	// Read array.
	op += '	mediump vec4 res = coords;\n';

	// Loop iteration count.
	/** @type {string} */ var iterMaxStr;

	if (isIntCounter) {
		if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_CONSTANT)
			iterMaxStr = /** @type {string} */ (numLoopIters);
		else if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_UNIFORM)
			iterMaxStr = getIntUniformName(numLoopIters);
		else if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC)
			iterMaxStr = getIntUniformName(numLoopIters) + '*one';
		else
			throw new Error('Unhandled case.');
	}
	else {
		if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_CONSTANT)
			iterMaxStr = '1.0';
		else if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_UNIFORM)
			iterMaxStr = 'uf_one';
		else if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC)
			iterMaxStr = 'uf_one*one';
		else
			throw new Error('Unhandled case.');
	}

	// Loop operations.
	/** @type {string} */ var initValue = isIntCounter ? '0' : '0.05';
	/** @type {string} */ var loopCountDeclStr = '' + gluShaderUtil.getPrecisionName(loopCountPrecision) + ' ' + gluShaderUtil.getDataTypeName(loopCountDataType) + ' ndx = ' + initValue;
	/** @type {string} */ var loopCmpStr = 'ndx < ' + iterMaxStr;
	/** @type {string} */ var incrementStr;
	if (isIntCounter)
		incrementStr = 'ndx++';
	else {
		if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_CONSTANT)
			incrementStr = 'ndx += ' + Math.floor(1.0 / numLoopIters);
		else if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_UNIFORM)
			incrementStr = 'ndx += ' + getFloatFractionUniformName(numLoopIters);
		else if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC)
			incrementStr = 'ndx += ' + getFloatFractionUniformName(numLoopIters) + '*one';
		else
			throw new Error('Unhandled case.');
	}

	// Loop body.
	/** @type {string} */ var loopBody;

	loopBody = '		res = res.yzwx;\n';

	if (loopType == es3fShaderLoopTests.LoopType.LOOPTYPE_FOR) {
		op += '	for (' + loopCountDeclStr + '; ' + loopCmpStr + '; ' + incrementStr + ')\n';
		op += '	{\n';
		op += loopBody;
		op += '	}\n';
	}
	else if (loopType == es3fShaderLoopTests.LoopType.LOOPTYPE_WHILE) {
		op += '\t' + loopCountDeclStr + ';\n';
		op += '	while (' + loopCmpStr + ')\n';
		op += '	{\n';
		op += loopBody;
		op += '\t\t' + incrementStr + ';\n';
		op += '	}\n';
	}
	else if (loopType == es3fShaderLoopTests.LoopType.LOOPTYPE_DO_WHILE) {
		op += '\t' + loopCountDeclStr + ';\n';
		op += '	do\n';
		op += '	{\n';
		op += loopBody;
		op += '\t\t' + incrementStr + ';\n';
		op += '	} while (' + loopCmpStr + ');\n';
	}
	else
		throw new Error('Unhandled case.');

	vtx += isVertexCase ? op : '';
	frag += isVertexCase ? '' : op;
	op = '';

	if (isVertexCase) {
		vtx += '	v_color = res.rgb;\n';
		frag += '	o_color = vec4(v_color.rgb, 1.0);\n';
	}
	else {
		vtx += '	v_coords = a_coords;\n';
		frag += '	o_color = vec4(res.rgb, 1.0);\n';

		if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC)
			vtx += '	v_one = a_one;\n';
	}

	vtx += '}\n';
	frag += '}\n';

	// Create the case.
	/** @type {glsShaderRenderCase.ShaderEvalFunc} */
	var evalFunc = es3fShaderLoopTests.getLoopEvalFunc(numLoopIters);
	return new es3fShaderLoopTests.ShaderLoopCase(caseName, description, isVertexCase, evalFunc, vertexShaderSource, fragmentShaderSource);
};

// \todo [petri] Generalize to float as well?

/**
 * @param {string} caseName
 * @param {string} description
 * @param {boolean} isVertexCase
 * @param {LoopCase} loopCase
 * @param {LoopType} loopType
 * @param {LoopCountType} loopCountType
 * @return {es3fShaderLoopTests.ShaderLoopCase}
 */
es3fShaderLoopTests.createSpecialLoopCase = function(caseName, description, isVertexCase, loopCase, loopType, loopCountType) {
	/** @type {string} */ vtx = '';
	/** @type {string} */ frag = '';
	/** @type {string} */ op = ''; // isVertexCase ? vtx : frag;

	vtx += '#version 300 es\n';
	frag += '#version 300 es\n';

	vtx += 'in highp vec4 a_position;\n';
	vtx += 'in highp vec4 a_coords;\n';
	frag += 'layout(location = 0) out mediump vec4 o_color;\n';

	if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC)
		vtx += 'in mediump float a_one;\n';

	// Attribute and varyings.
	if (isVertexCase) {
		vtx += 'out mediump vec3 v_color;\n';
		frag += 'in mediump vec3 v_color;\n';
	}
	else {
		vtx += 'out mediump vec4 v_coords;\n';
		frag += 'in mediump vec4 v_coords;\n';

		if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMI {
			vtx += 'out mediump float v_one;\n';
			frag += 'in mediump float v_one;\n';
		}
	}

	if (loopCase == es3fShaderLoopTests.LoopCase.LOOPCASE_SELECT_ITERATION_COUNT)
		op += 'uniform bool ub_true;\n';

	op += 'uniform ${COUNTER_PRECISION} int ui_zero, ui_one, ui_two, ui_three, ui_four, ui_five, ui_six;\n';
	if (loopCase == es3fShaderLoopTests.LoopCase.LOOPCASE_101_ITERATIONS)
		op += 'uniform ${COUNTER_PRECISION} int ui_oneHundredOne;\n';

	vtx += isVertexCase ? op : '';
	frag += isVertexCase ? '' : op;
	op = '';

	/** @type {number} */ var iterCount = 3;	// value to use in loop
	/** @type {number} */ var numIters = 3;	// actual number of iterations

	vtx += '\n';
	vtx += 'void main()\n';
	vtx += '{\n';
	vtx += '	gl_Position = a_position;\n';

	frag += '\n';
	frag += 'void main()\n';
	frag += '{\n';

	if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC) {
		if (isVertexCase)
			vtx += '	${COUNTER_PRECISION} int one = int(a_one + 0.5);\n';
		else
			frag += '	${COUNTER_PRECISION} int one = int(v_one + 0.5);\n';
	}

	if (isVertexCase)
		vtx += '	mediump vec4 coords = a_coords;\n';
	else
		frag += '	mediump vec4 coords = v_coords;\n';

	// Read array.
	op += '	mediump vec4 res = coords;\n';

	// Handle all loop types.
	/** @type {string} */ var counterPrecisionStr = 'mediump';
	/** @type {string} */ var forLoopStr = '';
	/** @type {string} */ var whileLoopStr = '';
	/** @type {string} */ var doWhileLoopPreStr = '';
	/** @type {string} */ var doWhileLoopPostStr = '';

	if (loopType == LOOPTYPE_FOR) {
		switch (loopCase)
		{
			case es3fShaderLoopTests.LoopCase.LOOPCASE_EMPTY_BODY:
				numIters = 0;
				op += '	${FOR_LOOP} {}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_INFINITE_WITH_UNCONDITIONAL_BREAK_FIRST:
				numIters = 0;
				op += '	for (;;) { break; res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_INFINITE_WITH_UNCONDITIONAL_BREAK_LAST:
				numIters = 1;
				op += '	for (;;) { res = res.yzwx; break; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_INFINITE_WITH_CONDITIONAL_BREAK:
				numIters = 2;
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	for (;;) { res = res.yzwx; if (i == ${ONE}) break; i++; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SINGLE_STATEMENT:
				op += '	${FOR_LOOP} res = res.yzwx;\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_COMPOUND_STATEMENT:
				iterCount	= 2;
				numIters	= 2 * iterCount;
				op += '	${FOR_LOOP} { res = res.yzwx; res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SEQUENCE_STATEMENT:
				iterCount	= 2;
				numIters	= 2 * iterCount;
				op += '	${FOR_LOOP} res = res.yzwx, res = res.yzwx;\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NO_ITERATIONS:
				iterCount	= 0;
				numIters	= 0;
				op += '	${FOR_LOOP} res = res.yzwx;\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SINGLE_ITERATION:
				iterCount	= 1;
				numIters	= 1;
				op += '	${FOR_LOOP} res = res.yzwx;\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SELECT_ITERATION_COUNT:
				op += '	for (int i = 0; i < (ub_true ? ${ITER_COUNT} : 0); i++) res = res.yzwx;\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_CONDITIONAL_CONTINUE:
				numIters = iterCount - 1;
				op += '	${FOR_LOOP} { if (i == ${TWO}) continue; res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_UNCONDITIONAL_CONTINUE:
				op += '	${FOR_LOOP} { res = res.yzwx; continue; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_ONLY_CONTINUE:
				numIters = 0;
				op += '	${FOR_LOOP} { continue; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_DOUBLE_CONTINUE:
				numIters = iterCount - 1;
				op += '	${FOR_LOOP} { if (i == ${TWO}) continue; res = res.yzwx; continue; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_CONDITIONAL_BREAK:
				numIters = 2;
				op += '	${FOR_LOOP} { if (i == ${TWO}) break; res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_UNCONDITIONAL_BREAK:
				numIters = 1;
				op += '	${FOR_LOOP} { res = res.yzwx; break; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_PRE_INCREMENT:
				op += '	for (int i = 0; i < ${ITER_COUNT}; ++i) { res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_POST_INCREMENT:
				op += '	${FOR_LOOP} { res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_MIXED_BREAK_CONTINUE:
				numIters	= 2;
				iterCount	= 5;
				op += '	${FOR_LOOP} { if (i == 0) continue; else if (i == 3) break; res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_VECTOR_COUNTER:
				op += '	for (${COUNTER_PRECISION} ivec4 i = ivec4(0, 1, ${ITER_COUNT}, 0); i.x < i.z; i.x += i.y) { res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_101_ITERATIONS:
				numIters = iterCount = 101;
				op += '	${FOR_LOOP} res = res.yzwx;\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SEQUENCE:
				iterCount	= 5;
				numIters	= 5;
				op += '	${COUNTER_PRECISION} int i;\n';
				op += '	for (i = 0; i < ${TWO}; i++) { res = res.yzwx; }\n';
				op += '	for (; i < ${ITER_COUNT}; i++) { res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NESTED:
				numIters = 2 * iterCount;
				op += '	for (${COUNTER_PRECISION} int i = 0; i < ${TWO}; i++)\n';
				op += '	{\n';
				op += '		for (${COUNTER_PRECISION} int j = 0; j < ${ITER_COUNT}; j++)\n';
				op += '			res = res.yzwx;\n';
				op += '	}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NESTED_SEQUENCE:
				numIters = 3 * iterCount;
				op += '	for (${COUNTER_PRECISION} int i = 0; i < ${ITER_COUNT}; i++)\n';
				op += '	{\n';
				op += '		for (${COUNTER_PRECISION} int j = 0; j < ${TWO}; j++)\n';
				op += '			res = res.yzwx;\n';
				op += '		for (${COUNTER_PRECISION} int j = 0; j < ${ONE}; j++)\n';
				op += '			res = res.yzwx;\n';
				op += '	}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NESTED_TRICKY_DATAFLOW_1:
				numIters = 2;
				op += '	${FOR_LOOP}\n';
				op += '	{\n';
				op += '		res = coords; // ignore outer loop effect \n';
				op += '		for (${COUNTER_PRECISION} int j = 0; j < ${TWO}; j++)\n';
				op += '			res = res.yzwx;\n';
				op += '	}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NESTED_TRICKY_DATAFLOW_2:
				numIters = iterCount;
				op += '	${FOR_LOOP}\n';
				op += '	{\n';
				op += '		res = coords.wxyz;\n';
				op += '		for (${COUNTER_PRECISION} int j = 0; j < ${TWO}; j++)\n';
				op += '			res = res.yzwx;\n';
				op += '		coords = res;\n';
				op += '	}\n';
				break;

			default:
				DE_ASSERT(false);
		}

		if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_CONSTANT)
			forLoopStr = string('for (') + counterPrecisionStr + ' int i = 0; i < ' + de::toString(iterCount) + '; i++)';
		else if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_UNIFORM)
			forLoopStr = string('for (') + counterPrecisionStr + ' int i = 0; i < ' + getIntUniformName(iterCount) + '; i++)';
		else if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC)
			forLoopStr = string('for (') + counterPrecisionStr + ' int i = 0; i < one*' + getIntUniformName(iterCount) + '; i++)';
		else
			DE_ASSERT(false);
	}
	else if (loopType == LOOPTYPE_WHILE)
	{
		switch (loopCase)
		{
			case es3fShaderLoopTests.LoopCase.LOOPCASE_EMPTY_BODY:
				numIters = 0;
				op += '	${WHILE_LOOP} {}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_INFINITE_WITH_UNCONDITIONAL_BREAK_FIRST:
				numIters = 0;
				op += '	while (true) { break; res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_INFINITE_WITH_UNCONDITIONAL_BREAK_LAST:
				numIters = 1;
				op += '	while (true) { res = res.yzwx; break; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_INFINITE_WITH_CONDITIONAL_BREAK:
				numIters = 2;
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	while (true) { res = res.yzwx; if (i == ${ONE}) break; i++; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SINGLE_STATEMENT:
				op += '	${WHILE_LOOP} res = res.yzwx;\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_COMPOUND_STATEMENT:
				iterCount	= 2;
				numIters	= 2 * iterCount;
				op += '	${WHILE_LOOP} { res = res.yzwx; res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SEQUENCE_STATEMENT:
				iterCount	= 2;
				numIters	= 2 * iterCount;
				op += '	${WHILE_LOOP} res = res.yzwx, res = res.yzwx;\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NO_ITERATIONS:
				iterCount	= 0;
				numIters	= 0;
				op += '	${WHILE_LOOP} res = res.yzwx;\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SINGLE_ITERATION:
				iterCount	= 1;
				numIters	= 1;
				op += '	${WHILE_LOOP} res = res.yzwx;\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SELECT_ITERATION_COUNT:
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	while (i < (ub_true ? ${ITER_COUNT} : 0)) { res = res.yzwx; i++; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_CONDITIONAL_CONTINUE:
				numIters = iterCount - 1;
				op += '	${WHILE_LOOP} { if (i == ${TWO}) continue; res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_UNCONDITIONAL_CONTINUE:
				op += '	${WHILE_LOOP} { res = res.yzwx; continue; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_ONLY_CONTINUE:
				numIters = 0;
				op += '	${WHILE_LOOP} { continue; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_DOUBLE_CONTINUE:
				numIters = iterCount - 1;
				op += '	${WHILE_LOOP} { if (i == ${ONE}) continue; res = res.yzwx; continue; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_CONDITIONAL_BREAK:
				numIters = 2;
				op += '	${WHILE_LOOP} { if (i == ${THREE}) break; res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_UNCONDITIONAL_BREAK:
				numIters = 1;
				op += '	${WHILE_LOOP} { res = res.yzwx; break; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_PRE_INCREMENT:
				numIters = iterCount - 1;
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	while (++i < ${ITER_COUNT}) { res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_POST_INCREMENT:
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	while (i++ < ${ITER_COUNT}) { res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_MIXED_BREAK_CONTINUE:
				numIters	= 2;
				iterCount	= 5;
				op += '	${WHILE_LOOP} { if (i == 0) continue; else if (i == 3) break; res = res.yzwx; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_VECTOR_COUNTER:
				op += '	${COUNTER_PRECISION} ivec4 i = ivec4(0, 1, ${ITER_COUNT}, 0);\n';
				op += '	while (i.x < i.z) { res = res.yzwx; i.x += i.y; }\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_101_ITERATIONS:
				numIters = iterCount = 101;
				op += '	${WHILE_LOOP} res = res.yzwx;\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SEQUENCE:
				iterCount	= 6;
				numIters	= iterCount - 1;
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	while (i++ < ${TWO}) { res = res.yzwx; }\n';
				op += '	while (i++ < ${ITER_COUNT}) { res = res.yzwx; }\n'; // \note skips one iteration
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NESTED:
				numIters = 2 * iterCount;
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	while (i++ < ${TWO})\n';
				op += '	{\n';
				op += '		${COUNTER_PRECISION} int j = 0;\n';
				op += '		while (j++ < ${ITER_COUNT})\n';
				op += '			res = res.yzwx;\n';
				op += '	}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NESTED_SEQUENCE:
				numIters = 2 * iterCount;
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	while (i++ < ${ITER_COUNT})\n';
				op += '	{\n';
				op += '		${COUNTER_PRECISION} int j = 0;\n';
				op += '		while (j++ < ${ONE})\n';
				op += '			res = res.yzwx;\n';
				op += '		while (j++ < ${THREE})\n'; // \note skips one iteration
				op += '			res = res.yzwx;\n';
				op += '	}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NESTED_TRICKY_DATAFLOW_1:
				numIters = 2;
				op += '	${WHILE_LOOP}\n';
				op += '	{\n';
				op += '		res = coords; // ignore outer loop effect \n';
				op += '		${COUNTER_PRECISION} int j = 0;\n';
				op += '		while (j++ < ${TWO})\n';
				op += '			res = res.yzwx;\n';
				op += '	}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NESTED_TRICKY_DATAFLOW_2:
				numIters = iterCount;
				op += '	${WHILE_LOOP}\n';
				op += '	{\n';
				op += '		res = coords.wxyz;\n';
				op += '		${COUNTER_PRECISION} int j = 0;\n';
				op += '		while (j++ < ${TWO})\n';
				op += '			res = res.yzwx;\n';
				op += '		coords = res;\n';
				op += '	}\n';
				break;

			default:
				DE_ASSERT(false);
		}

		if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_CONSTANT)
			whileLoopStr = string('\t') + counterPrecisionStr + ' int i = 0;\n' + '	while(i++ < ' + de::toString(iterCount) + ')';
		else if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_UNIFORM)
			whileLoopStr = string('\t') + counterPrecisionStr + ' int i = 0;\n' + '	while(i++ < ' + getIntUniformName(iterCount) + ')';
		else if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC)
			whileLoopStr = string('\t') + counterPrecisionStr + ' int i = 0;\n' + '	while(i++ < one*' + getIntUniformName(iterCount) + ')';
		else
			DE_ASSERT(false);
	}
	else
	{
		DE_ASSERT(loopType == LOOPTYPE_DO_WHILE);

		switch (loopCase) {
			case es3fShaderLoopTests.LoopCase.LOOPCASE_EMPTY_BODY:
				numIters = 0;
				op += '	${DO_WHILE_PRE} {} ${DO_WHILE_POST}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_INFINITE_WITH_UNCONDITIONAL_BREAK_FIRST:
				numIters = 0;
				op += '	do { break; res = res.yzwx; } while (true);\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_INFINITE_WITH_UNCONDITIONAL_BREAK_LAST:
				numIters = 1;
				op += '	do { res = res.yzwx; break; } while (true);\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_INFINITE_WITH_CONDITIONAL_BREAK:
				numIters = 2;
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	do { res = res.yzwx; if (i == ${ONE}) break; i++; } while (true);\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SINGLE_STATEMENT:
				op += '	${DO_WHILE_PRE} res = res.yzwx; ${DO_WHILE_POST}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_COMPOUND_STATEMENT:
				iterCount	= 2;
				numIters	= 2 * iterCount;
				op += '	${DO_WHILE_PRE} { res = res.yzwx; res = res.yzwx; } ${DO_WHILE_POST}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SEQUENCE_STATEMENT:
				iterCount	= 2;
				numIters	= 2 * iterCount;
				op += '	${DO_WHILE_PRE} res = res.yzwx, res = res.yzwx; ${DO_WHILE_POST}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NO_ITERATIONS:
				throw new Error('LOOPCASE_NO_ITERATIONS not handled.');
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SINGLE_ITERATION:
				iterCount	= 1;
				numIters	= 1;
				op += '	${DO_WHILE_PRE} res = res.yzwx; ${DO_WHILE_POST}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SELECT_ITERATION_COUNT:
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	do { res = res.yzwx; } while (++i < (ub_true ? ${ITER_COUNT} : 0));\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_CONDITIONAL_CONTINUE:
				numIters = iterCount - 1;
				op += '	${DO_WHILE_PRE} { if (i == ${TWO}) continue; res = res.yzwx; } ${DO_WHILE_POST}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_UNCONDITIONAL_CONTINUE:
				op += '	${DO_WHILE_PRE} { res = res.yzwx; continue; } ${DO_WHILE_POST}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_ONLY_CONTINUE:
				numIters = 0;
				op += '	${DO_WHILE_PRE} { continue; } ${DO_WHILE_POST}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_DOUBLE_CONTINUE:
				numIters = iterCount - 1;
				op += '	${DO_WHILE_PRE} { if (i == ${TWO}) continue; res = res.yzwx; continue; } ${DO_WHILE_POST}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_CONDITIONAL_BREAK:
				numIters = 2;
				op += '	${DO_WHILE_PRE} { res = res.yzwx; if (i == ${ONE}) break; } ${DO_WHILE_POST}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_UNCONDITIONAL_BREAK:
				numIters = 1;
				op += '	${DO_WHILE_PRE} { res = res.yzwx; break; } ${DO_WHILE_POST}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_PRE_INCREMENT:
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	do { res = res.yzwx; } while (++i < ${ITER_COUNT});\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_POST_INCREMENT:
				numIters = iterCount + 1;
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	do { res = res.yzwx; } while (i++ < ${ITER_COUNT});\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_MIXED_BREAK_CONTINUE:
				numIters	= 2;
				iterCount	= 5;
				op += '	${DO_WHILE_PRE} { if (i == 0) continue; else if (i == 3) break; res = res.yzwx; } ${DO_WHILE_POST}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_VECTOR_COUNTER:
				op += '	${COUNTER_PRECISION} ivec4 i = ivec4(0, 1, ${ITER_COUNT}, 0);\n';
				op += '	do { res = res.yzwx; } while ((i.x += i.y) < i.z);\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_101_ITERATIONS:
				numIters = iterCount = 101;
				op += '	${DO_WHILE_PRE} res = res.yzwx; ${DO_WHILE_POST}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_SEQUENCE:
				iterCount	= 5;
				numIters	= 5;
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	do { res = res.yzwx; } while (++i < ${TWO});\n';
				op += '	do { res = res.yzwx; } while (++i < ${ITER_COUNT});\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NESTED:
				numIters = 2 * iterCount;
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	do\n';
				op += '	{\n';
				op += '		${COUNTER_PRECISION} int j = 0;\n';
				op += '		do\n';
				op += '			res = res.yzwx;\n';
				op += '		while (++j < ${ITER_COUNT});\n';
				op += '	} while (++i < ${TWO});\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NESTED_SEQUENCE:
				numIters = 3 * iterCount;
				op += '	${COUNTER_PRECISION} int i = 0;\n';
				op += '	do\n';
				op += '	{\n';
				op += '		${COUNTER_PRECISION} int j = 0;\n';
				op += '		do\n';
				op += '			res = res.yzwx;\n';
				op += '		while (++j < ${TWO});\n';
				op += '		do\n';
				op += '			res = res.yzwx;\n';
				op += '		while (++j < ${THREE});\n';
				op += '	} while (++i < ${ITER_COUNT});\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NESTED_TRICKY_DATAFLOW_1:
				numIters = 2;
				op += '	${DO_WHILE_PRE}\n';
				op += '	{\n';
				op += '		res = coords; // ignore outer loop effect \n';
				op += '		${COUNTER_PRECISION} int j = 0;\n';
				op += '		do\n';
				op += '			res = res.yzwx;\n';
				op += '		while (++j < ${TWO});\n';
				op += '	} ${DO_WHILE_POST}\n';
				break;

			case es3fShaderLoopTests.LoopCase.LOOPCASE_NESTED_TRICKY_DATAFLOW_2:
				numIters = iterCount;
				op += '	${DO_WHILE_PRE}\n';
				op += '	{\n';
				op += '		res = coords.wxyz;\n';
				op += '		${COUNTER_PRECISION} int j = 0;\n';
				op += '		while (j++ < ${TWO})\n';
				op += '			res = res.yzwx;\n';
				op += '		coords = res;\n';
				op += '	} ${DO_WHILE_POST}\n';
				break;

			default:
				throw new Error('LOOPCASE not handled.');
		}

		doWhileLoopPreStr = string('\t') + counterPrecisionStr + ' int i = 0;\n' + '\tdo ';
		if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_CONSTANT)
			doWhileLoopPostStr = string(' while (++i < ') + de::toString(iterCount) + ');\n';
		else if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_UNIFORM)
			doWhileLoopPostStr = string(' while (++i < ') + getIntUniformName(iterCount) + ');\n';
		else if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC)
			doWhileLoopPostStr = string(' while (++i < one*') + getIntUniformName(iterCount) + ');\n';
		else
			DE_ASSERT(false);
	}

	vtx += isVertexCase ? op : '';
	frag += isVertexCase ? '' : op;
	op = '';

	// Shader footers.
	if (isVertexCase) {
		vtx += '	v_color = res.rgb;\n';
		frag += '	o_color = vec4(v_color.rgb, 1.0);\n';
	}
	else {
		vtx += '	v_coords = a_coords;\n';
		frag += '	o_color = vec4(res.rgb, 1.0);\n';

		if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC)
			vtx += '	v_one = a_one;\n';
	}

	vtx += '}\n';
	frag += '}\n';

	// Constants.
	/** @type {string} */ var oneStr = '';
	/** @type {string} */ var twoStr = '';
	/** @type {string} */ var threeStr = '';
	/** @type {string} */ var iterCountStr = '';

	if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_CONSTANT) {
		oneStr			= '1';
		twoStr			= '2';
		threeStr		= '3';
		iterCountStr	= de::toString(iterCount);
	}
	else if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_UNIFORM) {
		oneStr			= 'ui_one';
		twoStr			= 'ui_two';
		threeStr		= 'ui_three';
		iterCountStr	= getIntUniformName(iterCount);
	}
	else if (loopCountType == es3fShaderLoopTests.LoopCountType.LOOPCOUNT_DYNAMIC) {
		oneStr			= 'one*ui_one';
		twoStr			= 'one*ui_two';
		threeStr		= 'one*ui_three';
		iterCountStr	= string('one*') + getIntUniformName(iterCount);
	}
	else
		throw new Error('Unhandled error.');

	// Fill in shader templates.
	map<string, string> params;
	params.insert(pair<string, string>('ITER_COUNT', iterCountStr));
	params.insert(pair<string, string>('COUNTER_PRECISION', counterPrecisionStr));
	params.insert(pair<string, string>('FOR_LOOP', forLoopStr));
	params.insert(pair<string, string>('WHILE_LOOP', whileLoopStr));
	params.insert(pair<string, string>('DO_WHILE_PRE', doWhileLoopPreStr));
	params.insert(pair<string, string>('DO_WHILE_POST', doWhileLoopPostStr));
	params.insert(pair<string, string>('ONE', oneStr));
	params.insert(pair<string, string>('TWO', twoStr));
	params.insert(pair<string, string>('THREE', threeStr));

	StringTemplate vertTemplate(vtx.str().c_str());
	StringTemplate fragTemplate(frag.str().c_str());
	string vertexShaderSource = vertTemplate.specialize(params);
	string fragmentShaderSource = fragTemplate.specialize(params);

	// Create the case.
	ShaderEvalFunc evalFunc = getLoopEvalFunc(numIters);
	return new ShaderLoopCase(context, caseName, description, isVertexCase, evalFunc, vertexShaderSource.c_str(), fragmentShaderSource.c_str());
};

// ShaderLoopTests.

ShaderLoopTests::ShaderLoopTests(Context& context)
	: TestCaseGroup(context, 'loops', 'Loop Tests')
{
}

ShaderLoopTests::~ShaderLoopTests (void)
{
}

void ShaderLoopTests::init (void)
{
	// Loop cases.

	static const ShaderType s_shaderTypes[] =
	{
		SHADERTYPE_VERTEX,
		SHADERTYPE_FRAGMENT
	};

	static const DataType s_countDataType[] =
	{
		TYPE_INT,
		TYPE_FLOAT
	};

	for (int loopType = 0; loopType < LOOPTYPE_LAST; loopType++)
	{
		const char* loopTypeName = getLoopTypeName((LoopType)loopType);

		for (int loopCountType = 0; loopCountType < es3fShaderLoopTests.LoopCountType.LOOPCOUNT_LAST; loopCountType++)
		{
			const char* loopCountName = getLoopCountTypeName((LoopCountType)loopCountType);

			string groupName = string(loopTypeName) + '_' + string(loopCountName) + '_iterations';
			string groupDesc = string('Loop tests with ') + loopCountName + ' loop counter.';
			TestCaseGroup* group = new TestCaseGroup(m_context, groupName.c_str(), groupDesc.c_str());
			addChild(group);

			// Generic cases.

			for (int precision = 0; precision < PRECISION_LAST; precision++)
			{
				const char* precisionName = getPrecisionName((Precision)precision);

				for (int dataTypeNdx = 0; dataTypeNdx < DE_LENGTH_OF_ARRAY(s_countDataType); dataTypeNdx++)
				{
					DataType loopDataType = s_countDataType[dataTypeNdx];
					const char* dataTypeName = getDataTypeName(loopDataType);

					for (int shaderTypeNdx = 0; shaderTypeNdx < DE_LENGTH_OF_ARRAY(s_shaderTypes); shaderTypeNdx++)
					{
						ShaderType	shaderType		= s_shaderTypes[shaderTypeNdx];
						const char*	shaderTypeName	= getShaderTypeName(shaderType);
						bool		isVertexCase	= (shaderType == SHADERTYPE_VERTEX);

						string name = string('basic_') + precisionName + '_' + dataTypeName + '_' + shaderTypeName;
						string desc = string(loopTypeName) + ' loop with ' + precisionName + dataTypeName + ' ' + loopCountName + ' iteration count in ' + shaderTypeName + ' shader.';
						group->addChild(createGenericLoopCase(m_context, name.c_str(), desc.c_str(), isVertexCase, (LoopType)loopType, (LoopCountType)loopCountType, (Precision)precision, loopDataType));
					}
				}
			}

			// Special cases.

			for (int loopCase = 0; loopCase < LOOPCASE_LAST; loopCase++)
			{
				const char* loopCaseName = getLoopCaseName((LoopCase)loopCase);

				// no-iterations not possible with do-while.
				if ((loopCase == es3fShaderLoopTests.LoopCase.LOOPCASE_NO_ITERATIONS) && (loopType == LOOPTYPE_DO_WHILE))
					continue;

				for (int shaderTypeNdx = 0; shaderTypeNdx < DE_LENGTH_OF_ARRAY(s_shaderTypes); shaderTypeNdx++)
				{
					ShaderType	shaderType		= s_shaderTypes[shaderTypeNdx];
					const char*	shaderTypeName	= getShaderTypeName(shaderType);
					bool		isVertexCase	= (shaderType == SHADERTYPE_VERTEX);

					string name = string(loopCaseName) + '_' + shaderTypeName;
					string desc = string(loopCaseName) + ' loop with ' + loopTypeName + ' iteration count in ' + shaderTypeName + ' shader.';
					group->addChild(createSpecialLoopCase(m_context, name.c_str(), desc.c_str(), isVertexCase, (LoopCase)loopCase, (LoopType)loopType, (LoopCountType)loopCountType));
				}
			}
		}
	}
}

} // Functional
} // gles3
} // deqp
