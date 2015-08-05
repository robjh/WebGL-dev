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
'use strict';
goog.provide('functional.gles3.es3fShaderMatrixTest');
goog.require('framework.opengl.gluShaderUtil');
goog.require('modules.shared.glsShaderRenderCase');

goog.scope(function() {

    var es3fShaderMatrixTest= functional.gles3.es3fShaderMatrixTest;
    var gluShaderUtil = framework.opengl.gluShaderUtil;
    var glsShaderRenderCase = modules.shared.glsShaderRenderCase;

    es3fShaderMatrixTest.DE_STATIC_ASSERT = function(expression) {
        if (!expression) throw new Error('Assert failed');
    };

    /** @const {Array<number>}*/ var s_constInFloat = [0.5, -0.2];
    /** @const {Array<Array<number>>}*/ var s_constInVec2 = [[1.2, 0.5], [0.5, 1.0]];
    /** @const {Array<Array<number>>}*/ var s_constInVec3 = [[1.1, 0.1, 0.5], [-0.2, 0.5, 0.8]];
    /** @const {Array<Array<number>>}*/ var s_constInVec4 = [[1.4, 0.2, -0.5, 0.7], [0.2, -1.0, 0.5, 0.8]];

    /** @const {Array<Array<number>>}*/ var s_constInMat2x2 = [
        [-0.1, 1.0, -0.2, 0.0],
        [0.8, 0.1, 0.5, -0.9]
    ];
    /** @const {Array<Array<number>>}*/ var s_constInMat3x2 = [
        [0.8, -0.3, 0.3, 1.0,  1.2, -1.2],
	    [1.2, -1.0, 0.5, -0.8, 1.1, 0.3]
    ];

    /** @const {Array<Array<number>>}*/ var s_constInMat4x2 = [
		[-0.2,  0.5, 0.0, -1.0, 1.2, -0.5, 0.3, -0.9],
        [1.0,  0.1, -1.1,  0.6, 0.8, -1.2, -1.1,  0.7]
    ];

    /** @const {Array<Array<number>>}*/ var s_constInMat2x3 = [
        [-0.6, -0.1, -0.7, -1.2, -0.2, 0.0],
        [1.1, 0.6, 0.8, 1.0, 0.7, 0.1]
    ];

    /** @const {Array<Array<number>>}*/ var s_constInMat3x3 = [
        [-0.2,  1.1, 1.2, -1.0, 1.2, 0.5, 0.7, -0.2, 1.0],
        [-0.1, -0.1, 0.1, -0.1, -0.2, 1.0, -0.5, 0.1, -0.4]
    ];

    /** @const {Array<Array<number>>}*/ var s_constInMat4x3 = [
		[-0.9, 0.0, 0.6, 0.2, 0.9, -0.1, -0.3, -0.7, -0.1, 0.1, 1.0, 0.0],
        [0.5, 0.7, 0.7, 1.2, 1.1, 0.1, 1.0, -1.0, -0.2, -0.2, -0.3, -0.5]
	];

    /** @const {Array<Array<number>>}*/ var s_constInMat2x4 = [
		[-0.6, -1.1, -0.6, -0.6, -0.2, -0.6, -0.1, -0.1],
        [-1.2, -1.0, 0.7, -1.0, 0.7, 0.7, -0.4, -0.3]
	];

    /** @const {Array<Array<number>>}*/ var s_constInMat3x4 = [
        [0.6, -0.4, 1.2, 0.9, 0.8, 0.4, 1.1, 0.3, 0.5, -0.2, 0.0,  1.1],
		[-0.8, 1.2, -0.2, -1.1, -0.9, -0.5, -1.2, 1.0, 1.2, 0.1, -0.7, -0.5]
	];

    /** @const {Array<Array<number>>}*/ var s_constInMat4x4 = [
        [0.3, 0.9, -0.2, 1.0, -0.4, -0.6, 0.6, -1.0, -0.9, -0.1, 0.3, -0.2, -0.3, -0.9, 1.0, 0.1],
		[0.4, -0.7, -0.8, 0.7, -0.4, -0.8, 0.6, -0.3, 0.7, -1.0, 0.1, -0.3, 0.2, 0.6, 0.4, -1.0]
    ];

    // Operation info

    /**
     * @enum
     */
    es3fShaderMatrixTest.OperationType = {
    	OPERATIONTYPE_BINARY_OPERATOR: 0,
    	OPERATIONTYPE_BINARY_FUNCTION: 1,
    	OPERATIONTYPE_UNARY_PREFIX_OPERATOR: 2,
    	OPERATIONTYPE_UNARY_POSTFIX_OPERATOR: 3,
    	OPERATIONTYPE_UNARY_FUNCTION: 4,
    	OPERATIONTYPE_ASSIGNMENT: 5,
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {string}
     */
    es3fShaderMatrixTest.getOperationName = function(op) {
    	switch (op) {
    		case es3fShaderMatrixTest.MatrixOp.OP_ADD: return '+';
    		case es3fShaderMatrixTest.MatrixOp.OP_SUB: return '-';
    		case es3fShaderMatrixTest.MatrixOp.OP_MUL: return '*';
    		case es3fShaderMatrixTest.MatrixOp.OP_DIV: return '/';
    		case es3fShaderMatrixTest.MatrixOp.OP_COMP_MUL: return 'matrixCompMult';
    		case es3fShaderMatrixTest.MatrixOp.OP_OUTER_PRODUCT: return 'outerProduct';
    		case es3fShaderMatrixTest.MatrixOp.OP_TRANSPOSE: return 'transpose';
    		case es3fShaderMatrixTest.MatrixOp.OP_INVERSE: return 'inverse';
    		case es3fShaderMatrixTest.MatrixOp.OP_DETERMINANT: return 'determinant';
    		case es3fShaderMatrixTest.MatrixOp.OP_UNARY_PLUS: return '+';
    		case es3fShaderMatrixTest.MatrixOp.OP_NEGATION: return '-';
    		case es3fShaderMatrixTest.MatrixOp.OP_PRE_INCREMENT: return '++';
    		case es3fShaderMatrixTest.MatrixOp.OP_PRE_DECREMENT: return '--';
    		case es3fShaderMatrixTest.MatrixOp.OP_POST_INCREMENT: return '++';
    		case es3fShaderMatrixTest.MatrixOp.OP_POST_DECREMENT: return '--';
    		case es3fShaderMatrixTest.MatrixOp.OP_ADD_INTO: return '+=';
    		case es3fShaderMatrixTest.MatrixOp.OP_SUBTRACT_FROM: return '-=';
    		case es3fShaderMatrixTest.MatrixOp.OP_MULTIPLY_INTO: return '*=';
    		case es3fShaderMatrixTest.MatrixOp.OP_DIVIDE_INTO: return '/=';
    		default:
    			DE_ASSERT(DE_FALSE);
    			return '';
    	}
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {es3fShaderMatrixTest.OperationType}
     */
    es3fShaderMatrixTest.getOperationType = function (op) {
    	switch (op)
    	{
    		case es3fShaderMatrixTest.MatrixOp.OP_ADD: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_BINARY_OPERATOR;
    		case es3fShaderMatrixTest.MatrixOp.OP_SUB: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_BINARY_OPERATOR;
    		case es3fShaderMatrixTest.MatrixOp.OP_MUL: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_BINARY_OPERATOR;
    		case es3fShaderMatrixTest.MatrixOp.OP_DIV: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_BINARY_OPERATOR;
    		case es3fShaderMatrixTest.MatrixOp.OP_COMP_MUL: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_BINARY_FUNCTION;
    		case es3fShaderMatrixTest.MatrixOp.OP_OUTER_PRODUCT: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_BINARY_FUNCTION;
    		case es3fShaderMatrixTest.MatrixOp.OP_TRANSPOSE: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_UNARY_FUNCTION;
    		case es3fShaderMatrixTest.MatrixOp.OP_INVERSE: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_UNARY_FUNCTION;
    		case es3fShaderMatrixTest.MatrixOp.OP_DETERMINANT:	return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_UNARY_FUNCTION;
    		case es3fShaderMatrixTest.MatrixOp.OP_UNARY_PLUS: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_UNARY_PREFIX_OPERATOR;
    		case es3fShaderMatrixTest.MatrixOp.OP_NEGATION: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_UNARY_PREFIX_OPERATOR;
    		case es3fShaderMatrixTest.MatrixOp.OP_PRE_INCREMENT: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_UNARY_PREFIX_OPERATOR;
    		case es3fShaderMatrixTest.MatrixOp.OP_PRE_DECREMENT: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_UNARY_PREFIX_OPERATOR;
    		case es3fShaderMatrixTest.MatrixOp.OP_POST_INCREMENT: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_UNARY_POSTFIX_OPERATOR;
    		case es3fShaderMatrixTest.MatrixOp.OP_POST_DECREMENT: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_UNARY_POSTFIX_OPERATOR;
    		case es3fShaderMatrixTest.MatrixOp.OP_ADD_INTO: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_ASSIGNMENT;
    		case es3fShaderMatrixTest.MatrixOp.OP_SUBTRACT_FROM: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_ASSIGNMENT;
    		case es3fShaderMatrixTest.MatrixOp.OP_MULTIPLY_INTO: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_ASSIGNMENT;
    		case es3fShaderMatrixTest.MatrixOp.OP_DIVIDE_INTO: return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_ASSIGNMENT;
    		default:
    			DE_ASSERT(DE_FALSE);
    			return es3fShaderMatrixTest.OperationType.OPERATIONTYPE_LAST;
    	}
    };

    es3fShaderMatrixTest.MatrixType = {
    	TESTMATRIXTYPE_DEFAULT: 0,
    	TESTMATRIXTYPE_NEGATED: 1,
    	TESTMATRIXTYPE_INCREMENTED: 2,
    	TESTMATRIXTYPE_DECREMENTED: 3,
    	TESTMATRIXTYPE_NEGATED_INCREMENTED: 4,
    	TESTMATRIXTYPE_INCREMENTED_LESS: 5
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {es3fShaderMatrixTest.OperationType}
     */
    es3fShaderMatrixTest.getOperationTestMatrixType = function (op) {
    	switch(op)
    	{
    		case es3fShaderMatrixTest.MatrixOp.OP_ADD: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DEFAULT;
    		case es3fShaderMatrixTest.MatrixOp.OP_SUB: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DEFAULT;
    		case es3fShaderMatrixTest.MatrixOp.OP_MUL: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DEFAULT;
    		case es3fShaderMatrixTest.MatrixOp.OP_DIV: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DEFAULT;
    		case es3fShaderMatrixTest.MatrixOp.OP_COMP_MUL: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DEFAULT;
    		case es3fShaderMatrixTest.MatrixOp.OP_OUTER_PRODUCT: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DEFAULT;
    		case es3fShaderMatrixTest.MatrixOp.OP_TRANSPOSE: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DEFAULT;
    		case es3fShaderMatrixTest.MatrixOp.OP_INVERSE: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DEFAULT;
    		case es3fShaderMatrixTest.MatrixOp.OP_DETERMINANT: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DEFAULT;
    		case es3fShaderMatrixTest.MatrixOp.OP_UNARY_PLUS: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DECREMENTED;
    		case es3fShaderMatrixTest.MatrixOp.OP_NEGATION: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_NEGATED_INCREMENTED;
    		case es3fShaderMatrixTest.MatrixOp.OP_PRE_INCREMENT: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_NEGATED;
    		case es3fShaderMatrixTest.MatrixOp.OP_PRE_DECREMENT: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_INCREMENTED;
    		case es3fShaderMatrixTest.MatrixOp.OP_POST_INCREMENT: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_NEGATED;
    		case es3fShaderMatrixTest.MatrixOp.OP_POST_DECREMENT: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DEFAULT;
    		case es3fShaderMatrixTest.MatrixOp.OP_ADD_INTO: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DEFAULT;
    		case es3fShaderMatrixTest.MatrixOp.OP_SUBTRACT_FROM: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_INCREMENTED_LESS;
    		case es3fShaderMatrixTest.MatrixOp.OP_MULTIPLY_INTO: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_NEGATED;
    		case es3fShaderMatrixTest.MatrixOp.OP_DIVIDE_INTO: return es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DECREMENTED;

    		default:
    			DE_ASSERT(DE_FALSE);
    			return TESTMATRIXTYPE_LAST;
    	}
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {bolean}
     */
    es3fShaderMatrixTest.isOperationBinary = function (op) {
    	return es3fShaderMatrixTest.getOperationType(op) == es3fShaderMatrixTest.OperationType.OPERATIONTYPE_BINARY_OPERATOR ||
    	       es3fShaderMatrixTest.getOperationType(op) == es3fShaderMatrixTest.OperationType.OPERATIONTYPE_BINARY_FUNCTION ||
    	       es3fShaderMatrixTest.getOperationType(op) == es3fShaderMatrixTest.OperationType.OPERATIONTYPE_ASSIGNMENT;
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {bolean}
     */
    es3fShaderMatrixTest.isOperationMatrixScalar = funciton (op) {
    	return op == es3fShaderMatrixTest.MatrixOp.OP_ADD ||
            op == es3fShaderMatrixTest.MatrixOp.OP_SUB ||
            op == es3fShaderMatrixTest.MatrixOp.OP_MUL ||
            op == es3fShaderMatrixTest.MatrixOp.OP_DIV;
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {bolean}
     */
    es3fShaderMatrixTest.isOperationMatrixVector = function (op) {
        return op == es3fShaderMatrixTest.MatrixOp.OP_MUL;
    };


    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {bolean}
     */
    es3fShaderMatrixTest.isOperationArithmeticMatrixMatrix = function (op) {
        return op == es3fShaderMatrixTest.MatrixOp.OP_MUL;
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {bolean}
     */
    es3fShaderMatrixTest.isOperationComponentwiseMatrixMatrix = function (op) {
        return op == es3fShaderMatrixTest.MatrixOp.OP_ADD ||
            op == es3fShaderMatrixTest.MatrixOp.OP_SUB ||
            op == es3fShaderMatrixTest.MatrixOp.OP_MUL ||
            op == es3fShaderMatrixTest.MatrixOp.OP_DIV ||
            op == es3fShaderMatrixTest.MatrixOp.OP_COMP_MUL;
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {bolean}
     */
    es3fShaderMatrixTest.isOperationVectorVector = function (op) {
    	return op == es3fShaderMatrixTest.MatrixOp.OP_OUTER_PRODUCT;
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {bolean}
     */
    es3fShaderMatrixTest.isOperationUnaryAnyMatrix = function (op) {
    	return  op == es3fShaderMatrixTest.MatrixOp.OP_TRANSPOSE ||
            op == es3fShaderMatrixTest.MatrixOp.OP_UNARY_PLUS ||
    		op == es3fShaderMatrixTest.MatrixOp.OP_NEGATION ||
    		op == es3fShaderMatrixTest.MatrixOp.OP_PRE_INCREMENT ||
    		op == es3fShaderMatrixTest.MatrixOp.OP_PRE_DECREMENT ||
    		op == es3fShaderMatrixTest.MatrixOp.OP_POST_INCREMENT ||
    		op == es3fShaderMatrixTest.MatrixOp.OP_POST_DECREMENT;
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {bolean}
     */
    es3fShaderMatrixTest.isOperationUnarySymmetricMatrix = function (op) {
    	return op == es3fShaderMatrixTest.MatrixOp.OP_INVERSE ||
            op == es3fShaderMatrixTest.MatrixOp.OP_DETERMINANT;
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {bolean}
     */
    es3fShaderMatrixTest.isOperationValueModifying = function (op) {
    	return  op == es3fShaderMatrixTest.MatrixOp.OP_PRE_INCREMENT ||
    			op == es3fShaderMatrixTest.MatrixOp.OP_PRE_DECREMENT ||
    			op == es3fShaderMatrixTest.MatrixOp.OP_POST_INCREMENT ||
    			op == es3fShaderMatrixTest.MatrixOp.OP_POST_DECREMENT;
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {bolean}
     */
    es3fShaderMatrixTest.isOperationAssignment = function(op)
    	return  op == es3fShaderMatrixTest.MatrixOp.OP_ADD_INTO ||
    			op == es3fShaderMatrixTest.MatrixOp.OP_SUBTRACT_FROM ||
    			op == es3fShaderMatrixTest.MatrixOp.OP_MULTIPLY_INTO ||
    			op == es3fShaderMatrixTest.MatrixOp.OP_DIVIDE_INTO;
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {bolean}
     */
    es3fShaderMatrixTest.isOperationAssignmentAnyMatrix = function(op)
    	return  op == es3fShaderMatrixTest.MatrixOp.OP_ADD_INTO ||
    			op == es3fShaderMatrixTest.MatrixOp.OP_SUBTRACT_FROM ||
    			op == es3fShaderMatrixTest.MatrixOp.OP_DIVIDE_INTO;
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {bolean}
     */
    es3fShaderMatrixTest.isOperationAssignmentSymmetricMatrix = function(op) {
    	return op == es3fShaderMatrixTest.MatrixOp.OP_MULTIPLY_INTO;
    };

    // Operation nature

    /**
     * @enum
     */
    es3fShaderMatrixTest.OperationNature = {
    	OPERATIONNATURE_PURE: 0,
    	OPERATIONNATURE_MUTATING: 1,
    	OPERATIONNATURE_ASSIGNMENT: 2,
    };

    /**
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @return {es3fShaderMatrixTest.OperationNature}
     */
    es3fShaderMatrixTest.getOperationNature = function (op) {
    	if (es3fShaderMatrixTest.isOperationAssignment(op))
    		return es3fShaderMatrixTest.OperationNature.OPERATIONNATURE_ASSIGNMENT;
    	if (es3fShaderMatrixTest.isOperationValueModifying(op))
    		return es3fShaderMatrixTest.OperationNature.OPERATIONNATURE_MUTATING;
    	return es3fShaderMatrixTest.OperationNature.OPERATIONNATURE_PURE;
    };

    // Input value loader.
    /**
     * @param {gluShaderUtil.ShaderEvalContext} evalCtx
     * @param {number} inputNdx
     * @return {Array<number>|Array<Array<number>>}
     */
    es3fShaderMatrixTest.getInputValue = function (inputType, typeFormat, evalCtx, inputNdx) {
        if (inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_CONST) {
            switch (typeFormat) {
                case gluShaderUtil.DataType.FLOAT:
                    return s_constInFloat[inputNdx];
                case gluShaderUtil.DataType.FLOAT_VEC2:
                    return s_constInVec2[inputNdx];
                case gluShaderUtil.DataType.FLOAT_VEC3:
                    return s_constInVec3[inputNdx];
                case gluShaderUtil.DataType.FLOAT_VEC4:
                    return s_constInVec4[inputNdx];
                case gluShaderUtil.DataType.FLOAT_MAT2:
                    return tcuMatrix.matrixFromVector(s_constInMat2x2[inputNdx]);
                case gluShaderUtil.DataType.FLOAT_MAT2X3:
                    return tcuMatrix.matrixFromVector(s_constInMat2x3[inputNdx]);
                case gluShaderUtil.DataType.FLOAT_MAT2X4:
                    return tcuMatrix.matrixFromVector(s_constInMat2x4[inputNdx]);
                case gluShaderUtil.DataType.FLOAT_MAT3X2:
                    return tcuMatrix.matrixFromVector(s_constInMat3x2[inputNdx]);
                case gluShaderUtil.DataType.FLOAT_MAT3:
                    return tcuMatrix.matrixFromVector(s_constInMat3x3[inputNdx]);
                case gluShaderUtil.DataType.FLOAT_MAT3X4:
                    return tcuMatrix.matrixFromVector(s_constInMat3x4[inputNdx]);
                case gluShaderUtil.DataType.FLOAT_MAT4X2:
                    return tcuMatrix.matrixFromVector(s_constInMat4x2[inputNdx]);
                case gluShaderUtil.DataType.FLOAT_MAT4X3:
                    return tcuMatrix.matrixFromVector(s_constInMat4x3[inputNdx]);
                case gluShaderUtil.DataType.FLOAT_MAT4:
                    return tcuMatrix.matrixFromVector(s_constInMat4x4[inputNdx]);
            }
        } else if (inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC) {
            switch (typeFormat) {
                case gluShaderUtil.DataType.FLOAT:
                    return evalCtx.coords[0];
                case gluShaderUtil.DataType.FLOAT_VEC2:
                    return deMath.swizzle(evalCtx.coords, [0, 1]);
                case gluShaderUtil.DataType.FLOAT_VEC3:
                    return deMath.swizzle(evalCtx.coords, [0, 1, 2]);
                case gluShaderUtil.DataType.FLOAT_VEC4:
                    return deMath.swizzle(evalCtx.coords, [0, 1, 2, 3]);
                case gluShaderUtil.DataType.FLOAT_MAT2:
                    var m = tcuMatrix.Matrix(2, 2);
                    m.setColumn(0, deMath.swizzle(evalCtx.in[0], [0, 1]));
                    m.setColumn(1, deMath.swizzle(evalCtx.in[1], [0, 1]));
                    return m;
                case gluShaderUtil.DataType.FLOAT_MAT2X3:
                    var m = tcuMatrix.Matrix(2, 3);
                    m.setColumn(0, evalCtx.in[0]);
                    m.setColumn(1, evalCtx.in[1]);
                    return m;
                case gluShaderUtil.DataType.FLOAT_MAT2X4:
                    var m = tcuMatrix.Matrix(2, 4);
                    m.setColumn(0, deMath.swizzle(evalCtx.in[0], [0, 1, 2]));
                    m.setColumn(1, deMath.swizzle(evalCtx.in[1], [0, 1, 2]));
                    return m;
                case gluShaderUtil.DataType.FLOAT_MAT3X2:
                    var m = tcuMatrix.Matrix(3, 2);
                    m.setColumn(0, deMath.swizzle(evalCtx.in[0], [0, 1]));
                    m.setColumn(1, deMath.swizzle(evalCtx.in[1], [0, 1]));
                    m.setColumn(2, deMath.swizzle(evalCtx.in[2], [0, 1]));
                    return m;
                case gluShaderUtil.DataType.FLOAT_MAT3:
                    var m = tcuMatrix.Matrix(3, 3);
                    m.setColumn(0, deMath.swizzle(evalCtx.in[0], [0, 1, 2]));
                    m.setColumn(1, deMath.swizzle(evalCtx.in[1], [0, 1, 2]));
                    m.setColumn(2, deMath.swizzle(evalCtx.in[2], [0, 1, 2]));
                    return m;
                case gluShaderUtil.DataType.FLOAT_MAT3X4:
                    var m = tcuMatrix.Matrix(3, 4);
                    m.setColumn(0, evalCtx.in[0]);
                    m.setColumn(1, evalCtx.in[1]);
                    m.setColumn(2, evalCtx.in[2]);
                    return m;
                case gluShaderUtil.DataType.FLOAT_MAT4X2:
                    var m = tcuMatrix.Matrix(4, 2);
                    m.setColumn(0, deMath.swizzle(evalCtx.in[0], [0, 1]));
                    m.setColumn(1, deMath.swizzle(evalCtx.in[1], [0, 1]));
                    m.setColumn(2, deMath.swizzle(evalCtx.in[2], [0, 1]));
                    m.setColumn(3, deMath.swizzle(evalCtx.in[3], [0, 1]));
                    return m;
                case gluShaderUtil.DataType.FLOAT_MAT4X3:
                    var m = tcuMatrix.Matrix(4, 3);
                    m.setColumn(0, deMath.swizzle(evalCtx.in[0], [0, 1, 2]));
                    m.setColumn(1, deMath.swizzle(evalCtx.in[1], [0, 1, 2]));
                    m.setColumn(2, deMath.swizzle(evalCtx.in[2], [0, 1, 2]));
                    m.setColumn(3, deMath.swizzle(evalCtx.in[3], [0, 1, 2]));
                    return m;
                case gluShaderUtil.DataType.FLOAT_MAT4:
                    var m = tcuMatrix.Matrix(4, 4);
                    m.setColumn(0, evalCtx.in[0]);
                    m.setColumn(1, evalCtx.in[1]);
                    m.setColumn(2, evalCtx.in[2]);
                    m.setColumn(3, evalCtx.in[3]);
                    return m;
            }
        }
    };

    /**
     * @param {Array<number>} value
     * @return {Array<number>}
     */
    es3fShaderMatrixTest.reduceVecToVec3 = function (value) {
        if (value.length == 3) {
            return value;
        } else if (value.length == 2) {
            return deMath.swizzle(value, [0, 1, 0])
        } else {
            return [value[0], value[1], value[2] + value[3]];
        }
    };

    /**
     * @param {tcuMatrix.Matrix} value
     * @return {Array<number>}
     */
    es3fShaderMatrixTest.reduceMatToVec3 = function (value) {
        if (value.length == 2) {
            if (value[0].length == 2) {
                return [value[0][0], value[0][1], value[1][0] + value[1][1]];
            } else if (value[0].length == 3){
                return deMath.add(value[0], value[1]);
            } else {
                return deMath.add(deMath.swizzle(value[0], [0, 1, 2]), deMath.swizzle(value[1], [1, 2, 3]));
            }
        } else if (if value.length == 3) {
            if (value[0].length == 2) {
                return [value[0][0] + value[1][0], value[0][1] + value[1][1], value[0][2] + value[1][2]];
            } else if (value[0].length == 3) {
                return deMath.add(deMath.add(value[0], value[1]), value[2]);
            } else {
                return deMath.add(deMath.add(deMath.swizzle(value[0], [0, 1, 2], deMath.swizzle(value[1], [1, 2, 3]))), deMath.swizzle(value[2], [2, 3, 0]));
            }
        } else {
            if (value[0].length == 2) {
                return [value[0][0] + value[1][0] + value[0][3], value[0][1] + value[1][1] + value[1][3], value[0][2] + value[1][2]];
            } else if (value[0].length == 3) {
                return deMath.add(deMath.add(deMath.add(value[0], value[1]), value[2]), value[3]);
            } else {
                return deMath.add(deMath.add(deMath.add(deMath.swizzle(value[0], [0, 1, 2], deMath.swizzle(value[1], [1, 2, 3]))), deMath.swizzle(value[2], [2, 3, 0])), deMath.swizzle(value[3], [3, 0, 1]));
            }
        }
    };

    /**
     * @param {tcuMatrix.Matrix} a
     * @param {tcuMatrix.Matrix} b
     * @return {tcuMatrix.Matrix}
     */
    es3fShaderMatrixTest.matrixCompMult = function (a, b) {
        /** @type {tcuMatrix.Matrix} */ var retVal = new tcuMatrix.Matrix(a.rows, a.cols);

        for (var r = 0; r < a.rows; ++r) {
            for (var c = 0; c < a.cols; ++c) {
                retVal.set(r, c, a.get(r, c) * b.get(r, c));
            }
        }
        return retVal;
    };

    /**
     * @param {tcuMatrix.Matrix} mat
     * @return {tcuMatrix.Matrix}
     */
    es3fShaderMatrixTest.transpose = function (mat) {
        /** @type {tcuMatrix.Matrix} */ var retVal = new tcuMatrix.Matrix(mat.rows, mat.cols);

        for (var r = 0; r < mat.rows; ++r) {
            for (var c = 0; c < mat.cols; ++c) {
                retVal.set(c, r, mat.get(r, c));
            }
        }

        return retVal;
    };

    /**
     * @param {tcuMatrix.Matrix} mat
     * @return {number}
     */
    es3fShaderMatrixTest.determinantMat2 = function (mat) {
        return mat.get(0, 0) * mat.get(1, 1) - mat.get(1, 0) * mat.get(0,1);
    };

    /**
     * @param {tcuMatrix.Matrix} mat
     * @return {number}
     */
    es3fShaderMatrixTest.determinantMat3 = function (mat) {
        return	+ mat.get(0, 0) * mat.get(1, 1) * mat.get(2, 2)
			+ mat.get(0, 1) * mat.get(1, 2) * mat.get(2, 0)
			+ mat.get(0, 2) * mat.get(1, 0) * mat.get(2, 1)
			- mat.get(0, 0) * mat.get(1, 2) * mat.get(2, 1)
			- mat.get(0, 1) * mat.get(1, 0) * mat.get(2, 2)
			- mat.get(0, 2) * mat.get(1, 1) * mat.get(2, 0);
    };

    /**
     * @param {tcuMatrix.Matrix} mat
     * @return {number}
     */
    es3fShaderMatrixTest.determinantMat4 = function (mat) {
        /** @type {Array<Array<number>} */ var minorMatrices = [
            [
    			mat.get(1, 1),	mat.get(2, 1),	mat.get(3, 1),
    			mat.get(1, 2),	mat.get(2, 2),	mat.get(3, 2),
    			mat.get(1, 3),	mat.get(2, 3),	mat.get(3, 3),
    		],
    		[
    			mat.get(1, 0),	mat.get(2, 0),	mat.get(3, 0),
    			mat.get(1, 2),	mat.get(2, 2),	mat.get(3, 2),
    			mat.get(1, 3),	mat.get(2, 3),	mat.get(3, 3),
    		],
    		[
    			mat.get(1, 0),	mat.get(2, 0),	mat.get(3, 0),
    			mat.get(1, 1),	mat.get(2, 1),	mat.get(3, 1),
    			mat.get(1, 3),	mat.get(2, 3),	mat.get(3, 3),
    		],
    		[
    			mat.get(1, 0),	mat.get(2, 0),	mat.get(3, 0),
    			mat.get(1, 1),	mat.get(2, 1),	mat.get(3, 1),
    			mat.get(1, 2),	mat.get(2, 2),	mat.get(3, 2),
    		]
        ];

    	return	+ mat.get(0, 0) * es3fShaderMatrixTest.determinant(tcuMatrix.matrixFromDataArray(3, 3, minorMatrices[0]))
    			- mat.get(0, 1) * es3fShaderMatrixTest.determinant(tcuMatrix.matrixFromDataArray(3, 3, minorMatrices[1]))
    			+ mat.get(0, 2) * es3fShaderMatrixTest.determinant(tcuMatrix.matrixFromDataArray(3, 3, minorMatrices[2]))
    			- mat.get(0, 3) * es3fShaderMatrixTest.determinant(tcuMatrix.matrixFromDataArray(3, 3, minorMatrices[3]));
    };

    /**
     * @param {tcuMatrix.Matrix} mat
     * @return {number}
     */
    es3fShaderMatrixTest.determinant = function (mat) {
        if (mat[0].length == 2) {
            return es3fShaderMatrixTest.determinantMat2(mat);
        } else if (mat[0].length == 3) {
            return es3fShaderMatrixTest.determinantMat3(mat);
        } else {
            return es3fShaderMatrixTest.determinantMat4(mat);
        }
    };

    /**
     * @param {tcuMatrix.Matrix} mat
     * @return {tcuMatrix.Matrix}
     */
    es3fShaderMatrixTest.inverseMat2 = function (mat) {
        /** @type {number} */ var det = es3fShaderMatrixTest.determinant(mat);
        /** @type {tcuMatrix.Matrix} */ var retVal;

        if (det != 0.0) {
            throw new Error('Wrong determinant')
        }

        retVal.set(0, 0, mat.get(1, 1) / det);
        retVal.set(0, 1, -mat.get(0, 1) / det);
        retVal.set(1, 0, -mat.get(1, 0) / det);
        retVal.set(1, 1, mat.get(0, 0) / det);

        return retVal;
    };

    /**
     * @param {tcuMatrix.Matrix} mat
     * @return {tcuMatrix.Matrix}
     */
    es3fShaderMatrixTest.inverseMat3 = function (mat) {
        if (es3fShaderMatrixTest.determinant(mat) != 0.0) {
            throw new Error('Wrong determinant')
        }

    	/** @type {Array<number>} */ var areaA = [mat.get(0, 0), mat.get(0, 1), mat.get(1, 0), mat.get(1,1)];
        /** @type {Array<number>} */ var areaB = [mat.get(0, 2), mat.get(1, 2)];
        /** @type {Array<number>} */ var areaC = [mat.get(2, 0), mat.get(2, 1)];
        /** @type {Array<number>} */ var areaD = [mat.get(2,2)];
    	/** @type {number} */ var nullField = [0.0];

    	/** @type {tcuMatrix.Matrix} */ var	invA = es3fShaderMatrixTest.inverse(tcuMatrix.matrixFromVector(2, 2, areaA));
    	/** @type {tcuMatrix.Matrix} */ var	matB = tcuMatrix.matrixFromVector(2, 1, areaB);
    	/** @type {tcuMatrix.Matrix} */ var	matC = tcuMatrix.matrixFromVector(1, 2, areaC);
    	/** @type {tcuMatrix.Matrix} */ var	matD = tcuMatrix.matrixFromVector(1, 1, areaD);

    	/** @type {number} */ var schurComplement = 1.0 / (tcuMatrix.subtract(matD, tcuMatrix.multiply(matC, tcuMatrix.multiply(invA, matB)));
    	/** @type {tcuMatrix.Matrix} */ var	zeroMat = tcuMatrix.matrixFromVector(2, 2, nullField);

    	/** @type {tcuMatrix.Matrix} */ var	blockA = tcuMatrix.add(invA, tcuMatrix.multiply(invA, deMath.multiply(tcuMatrix.multiplyMatScal(matB, schurComplement), matC), invA));
    	/** @type {tcuMatrix.Matrix} */ var	blockB = tcuMatrix.multiply(tcuMatrix.multiply(tcuMatrix.subtract(zeroMat - invA), matB), schurComplement);
    	/** @type {tcuMatrix.Matrix} */ var	blockC = tcuMatrix.multiply(matC, tcuMatrix.multiply(invA, -schurComplement));
    	/** @type {number} */ var blockD = schurComplement;

    	/** @type {Array<number>} */ var result = [
    		blockA.get(0, 0), blockA.get(0, 1), blockB.get(0, 0),
            blockA.get(1, 0), blockA.get(1, 1), blockB.get(1, 0),
            blockC.get(0, 0), blockC.get(0, 1),	blockD,
    	];

    	return tcuMatrix.matrixFromVector(3, 3, result);
    }

    /**
     * @param {tcuMatrix.Matrix} mat
     * @return {tcuMatrix.Matrix}
     */
    es3fShaderMatrixTest.inverseMat4 = function (mat) {
        // Blockwise inversion
        if (es3fShaderMatrixTest.determinant(mat) != 0.0) {
            throw new Error('Wrong determinant')
        }

    	/** @type {Array<number>} */ var areaA = [
    		mat.get(0, 0),	mat.get(0, 1),
    		mat.get(1, 0),	mat.get(1, 1)
    	];
    	/** @type {Array<number>} */ var areaB = [
    		mat.get(0, 2),	mat.get(0, 3),
    		mat.get(1, 2),	mat.get(1, 3)
    	];
    	/** @type {Array<number>} */ var areaC = [
    		mat.get(2, 0),	mat.get(2, 1),
    		mat.get(3, 0),	mat.get(3, 1)
    	];
    	/** @type {Array<number>} */ var areaD = [
    		mat.get(2, 2),	mat.get(2, 3),
    		mat.get(3, 2),	mat.get(3, 3)
    	];
    	/** @type {Array<number>} */ var nullField = [0.0];

    	/** @type {tcuMatrix.Matrix} */ var	invA = es3fShaderMatrixTest.inverse(tcuMatrix.matrixFromVector(2, 2, areaA));
    	/** @type {tcuMatrix.Matrix} */ var	matB = tcuMatrix.matrixFromVector(2, 2, areaB);
    	/** @type {tcuMatrix.Matrix} */ var	matC = tcuMatrix.matrixFromVector(2, 2, areaC);
    	/** @type {tcuMatrix.Matrix} */ var	matD = tcuMatrix.matrixFromVector(2, 2, areaD);

    	/** @type {tcuMatrix.Matrix} */ var	schurComplement = es3fShaderMatrixTest.inverse(tcuMatrix.subtract(matD, (tcuMatrix.multiply(matC, tcuMatrix.multiply(invA, matB)));
    	/** @type {tcuMatrix.Matrix} */ var	zeroMat = tcuMatrix.matrixFromVector(2, 2, nullField);

    	/** @type {tcuMatrix.Matrix} */ var	blockA = tcuMatrix.add(invA, tcuMatrix.multiply(invA, tcuMatrix.multiply(matB, tcuMatrix.multiply(schurComplement, matC *invA;
    	/** @type {tcuMatrix.Matrix} */ var	blockB = (zeroMat-invA)*matB*schurComplement;
    	/** @type {tcuMatrix.Matrix} */ var	blockC = (zeroMat-schurComplement)*matC*invA;
    	/** @type {tcuMatrix.Matrix} */ var	blockD = schurComplement;

    	const float result[4*4] =
    	{
    		blockA(0,0),	blockA(0,1),	blockB(0,0),	blockB(0,1),
    		blockA(1,0),	blockA(1,1),	blockB(1,0),	blockB(1,1),
    		blockC(0,0),	blockC(0,1),	blockD(0,0),	blockD(0,1),
    		blockC(1,0),	blockC(1,1),	blockD(1,0),	blockD(1,1),
    	};

    	return Mat4(result);
    };

    /**
     * @param {tcuMatrix.Matrix} mat
     * @return {tcuMatrix.Matrix}
     */
    es3fShaderMatrixTest.inverse = function (mat) {
        if (mat[0].length == 2) {
            return es3fShaderMatrixTest.inverseMat2(mat)
        } else if (mat[0].length == 3) {

        } else {

        }
    }

    /**
     * @param {Array<number>} a
     * @param {Array<number>} b
     * @return {tcuMatrix.Matrix}
     */
    es3fShaderMatrixTest.outerProduct = function (a, b) {
        /** @type {tcuMatrix.Matrix} */ var retVal = new tcuMatrix.Matrix(b.length, a.length);

        for (var r = 0; r < b.length; ++r) {
            for (var c = 0; c < a.length; ++c) {
                retVal.set(r, c, a[c] * b[r]);
            }
        }

        return es3fShaderMatrixTest.transpose(retVal);
    };


    /**
     * @enum
     */
    es3fShaderMatrixTest.InputType = {
    	INPUTTYPE_CONST: 0,
    	INPUTTYPE_UNIFORM: 1,
    	INPUTTYPE_DYNAMIC: 2,
    };

    /**
     * @enum
     */
    es3fShaderMatrixTest.MatrixOp = {
    	OP_ADD: 0,
    	OP_SUB: 1,
    	OP_MUL: 2,
    	OP_DIV: 3,
    	OP_COMP_MUL: 4,
    	OP_OUTER_PRODUCT: 5,
    	OP_TRANSPOSE: 6,
    	OP_INVERSE: 7,
    	OP_DETERMINANT: 8,
    	OP_UNARY_PLUS: 9,
    	OP_NEGATION: 10,
    	OP_PRE_INCREMENT: 11,
    	OP_PRE_DECREMENT: 12,
    	OP_POST_INCREMENT: 13,
    	OP_POST_DECREMENT: 14,
    	OP_ADD_INTO: 15,
    	OP_SUBTRACT_FROM: 16,
    	OP_MULTIPLY_INTO: 17,
    	OP_DIVIDE_INTO: 18,
    	OP_LAST: 19
    };

    /**
     * @constructor
     * @param {es3fShaderMatrixTest.InputType} inputType_
     * @param {gluShaderUtil.DataType} dataType_
     * @param {gluShaderUtil.precision} precision_
     * @struct
     */
    es3fShaderMatrixTest.ShaderInput = function (inputType_, dataType_, precision_){
        this.inputType = inputType_;
        this.dataType = dataType_;
        this.precision = precision_;
    };

    /**
     * @constructor
     * @param {gluShaderUtil.ShaderEvalContext} evalCtx
     * @param {es3fShaderMatrixTest.InputType} in0Type
     * @param {es3fShaderMatrixTest.InputType} in1Type
     */
    es3fShaderMatrixTest.MatrixShaderEvalFunc = function(evalCtx, in0Type, in1Type) {};

    es3fShaderMatrixTest.MatrixShaderEvalFunc.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fShaderMatrixTest.MatrixShaderEvalFunc.prototype.constructor = es3fShaderMatrixTest.MatrixShaderEvalFunc;

    /**
     * @param {es3fShaderMatrixTest.ShaderInput} in0
     * @param {es3fShaderMatrixTest.ShaderInput} in1
     * @param {es3fShaderMatrixTest.MatrixOp} op
     */
    es3fShaderMatrixTest.MatrixShaderEvalFunc.prototype.getEvalFunc = function (in0, in0, op) {
        switch(op){
            case es3fShaderMatrixTest.MatrixOp.OP_ADD: return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceVecToVec3(deMath.add(in0, in1))
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_SUB: return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceVecToVec3(deMath.subtract(in0, in1))
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_MUL: return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceVecToVec3(deMath.multiply(in0, in1))
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_DIV: return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceVecToVec3(deMath.divide(in0, in1))
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_COMP_MUL: return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.matrixCompMult(in0, in1));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_OUTER_PRODUCT: return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.matrixCompMult(in0, in1));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_TRANSPOSE: return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);

                    return es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.transpose(in0));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_INVERSE: return function () {

        	case es3fShaderMatrixTest.MatrixOp.OP_DETERMINANT: return function ()
        	case es3fShaderMatrixTest.MatrixOp.OP_UNARY_PLUS: return function ()
        	case es3fShaderMatrixTest.MatrixOp.OP_NEGATION: return function ()
        	case es3fShaderMatrixTest.MatrixOp.OP_PRE_INCREMENT: return function ()
        	case es3fShaderMatrixTest.MatrixOp.OP_PRE_DECREMENT: return function ()
        	case es3fShaderMatrixTest.MatrixOp.OP_POST_INCREMENT: return function ()
        	case es3fShaderMatrixTest.MatrixOp.OP_POST_DECREMENT: return function ()
        	case es3fShaderMatrixTest.MatrixOp.OP_ADD_INTO: return function ()
        	case es3fShaderMatrixTest.MatrixOp.OP_SUBTRACT_FROM: return function ()
        	case es3fShaderMatrixTest.MatrixOp.OP_MULTIPLY_INTO: return function ()
        	case es3fShaderMatrixTest.MatrixOp.OP_DIVIDE_INTO: return function ()
        }
	};

    /**
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {es3fShaderMatrixTest.ShaderInput} in0
     * @param {es3fShaderMatrixTest.ShaderInput} in1
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @param {boolean} isVertexCase
     * @extends {tcuTestCase.DeqpTest}
     */
    es3fShaderMatrixTest.ShaderMatrixCase = function(name, desc, in0, in1, op, isVertexCase) {
        glsShaderRenderCase.ShaderMatrixCase.call(this, name, desc, isVertexCase, this.m_matEvaluator);
        this.m_in0 = in0;
        this.m_in1 = in1;
        this.m_op = op;
        this.m_matEvaluator = (getEvalFunc(in0, in1, op), in0.inputType, in1.inputType)
    };

    es3fShaderMatrixTest.ShaderMatrixCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fShaderMatrixTest.ShaderMatrixCase.prototype.constructor = es3fShaderMatrixTest.ShaderMatrixCase

});
