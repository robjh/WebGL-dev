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
    	switch(op) {
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
                //TODO: Change this
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
    es3fShaderMatrixTest.isOperationMatrixScalar = function (op) {
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

        return gluShaderUtil.getDataTypeMatrix
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
    	/** @type {tcuMatrix.Matrix} */ var	blockB = tcuMatrix.multiply(tcuMatrix.multiplyMatScal(tcuMatrix.subtract(zeroMat - invA), matB), schurComplement);
    	/** @type {tcuMatrix.Matrix} */ var	blockC = tcuMatrix.multiply(matC, tcuMatrix.multiplyMatScal(invA, - schurComplement));
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

    	/** @type {tcuMatrix.Matrix} */ var	blockA = tcuMatrix.add(invA, tcuMatrix.multiply(invA, deMath.multiply(tcuMatrix.multiplyMatScal(matB, schurComplement), matC), invA));
    	/** @type {tcuMatrix.Matrix} */ var	blockB = tcuMatrix.multiplyMatScal(tcuMatrix.multiply(tcuMatrix.subtract(zeroMat - invA), matB), schurComplement);
    	/** @type {tcuMatrix.Matrix} */ var	blockC = tcuMatrix.multiply(tcuMatrix.multiply(tcuMatrix.subtractMatScal(zeroMat, schurComplement),matC), invA);
    	/** @type {tcuMatrix.Matrix} */ var	blockD = schurComplement;

    	/** @type {Array<number>} */ var result = [
    		blockA.get(0, 0),	blockA.get(0, 1),	blockB.get(0, 0),	blockB.get(0, 1),
    		blockA.get(1, 0),	blockA.get(1, 1),	blockB.get(1, 0),	blockB.get(1, 1),
    		blockC.get(0, 0),	blockC.get(0, 1),	blockD.get(0, 0),	blockD.get(0, 1),
    		blockC.get(1, 0),	blockC.get(1, 1),	blockD.get(1, 0),	blockD.get(1, 1),
    	];

    	return tcuMatrix.matrixFromVector(4, 4, result);
    };

    /**
     * @param {tcuMatrix.Matrix} mat
     * @return {tcuMatrix.Matrix}
     */
    es3fShaderMatrixTest.inverse = function (mat) {
        if (mat[0].length == 2) {
            return es3fShaderMatrixTest.inverseMat2(mat)
        } else if (mat[0].length == 3) {
            return es3fShaderMatrixTest.inverseMat3(mat)
        } else {
            return es3fShaderMatrixTest.inverseMat4(mat)
        }
    };

    /**
     * @param {tcuMatrix.Matrix} mat
     * @return {tcuMatrix.Matrix}
     */
    es3fShaderMatrixTest.negate = function (mat) {
        /** @type {tcuMatrix.Matrix} */ var retVal = new tcuMatrix.Matrix(b.length, a.length);

    	for (var r = 0; r < mat.rows; ++r)
    		for (var c = 0; c < mat.cols; ++c)
    			retVal.set(r,c) = -mat.get(r, c);

    	return retVal;
    };

    /**
     * @param {tcuMatrix.Matrix} mat
     * @return {tcuMatrix.Matrix}
     */
    es3fShaderMatrixTest.increment = function (mat) {
        /** @type {tcuMatrix.Matrix} */ var retVal = new tcuMatrix.Matrix(b.length, a.length);

    	for (var r = 0; r < mat.rows; ++r)
    		for (var c = 0; c < mat.cols; ++c)
    			retVal.set(r,c) = mat.get(r, c) + 1.0;

    	return retVal;
    };

    /**
     * @param {tcuMatrix.Matrix} mat
     * @return {tcuMatrix.Matrix}
     */
    es3fShaderMatrixTest.decrement = function (mat) {
        /** @type {tcuMatrix.Matrix} */ var retVal = new tcuMatrix.Matrix(b.length, a.length);

    	for (var r = 0; r < mat.rows; ++r)
    		for (var c = 0; c < mat.cols; ++c)
    			retVal.set(r,c) = mat.get(r, c) - 1.0;

    	return retVal;
    };

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
            case es3fShaderMatrixTest.MatrixOp.OP_ADD:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceVecToVec3(deMath.add(in0, in1))
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_SUB:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceVecToVec3(deMath.subtract(in0, in1))
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_MUL:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceVecToVec3(deMath.multiply(in0, in1))
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_DIV:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceVecToVec3(deMath.divide(in0, in1))
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_COMP_MUL:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.matrixCompMult(in0, in1));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_OUTER_PRODUCT:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.matrixCompMult(in0, in1));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_TRANSPOSE:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);

                    return es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.transpose(in0));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_INVERSE:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);

                    return es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.inverse(in0));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_DETERMINANT:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);

                    return es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.determinant(in0));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_UNARY_PLUS:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);

                    return es3fShaderMatrixTest.reduceMatToVec3(in0);
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_NEGATION:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);

                    return es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.negate(in0));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_PRE_INCREMENT:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);

                    return deMath.add(es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.increment(in0)), es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.increment(in0)));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_PRE_DECREMENT:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);

                    return deMath.add(es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.decrement(in0)), es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.decrement(in0)));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_POST_INCREMENT:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);

                    return deMath.add(es3fShaderMatrixTest.reduceMatToVec3(in0), es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.increment(in0)));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_POST_DECREMENT:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);

                    return deMath.add(es3fShaderMatrixTest.reduceMatToVec3(in0), es3fShaderMatrixTest.reduceMatToVec3(es3fShaderMatrixTest.decrement(in0)));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_ADD_INTO:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceMatToVec3(deMath.add(in0, in1));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_SUBTRACT_FROM:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceMatToVec3(deMath.subtract(in0, in1));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_MULTIPLY_INTO:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceMatToVec3(deMath.multiply(in0, in1));
                };
        	case es3fShaderMatrixTest.MatrixOp.OP_DIVIDE_INTO:
                return function (in0, in1) {
                    in0 = in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in0.inputType, in0.dataType, evalCtx, 0)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in0.dataType, evalCtx, 0);
                    in1 = in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ?
                        es3fShaderMatrixTest.getInputValue(in1.inputType, in0.dataType, evalCtx, 1)
                        : es3fShaderMatrixTest.getInputValue(es3fShaderMatrixTest.InputType.INPUTTYPE_CONST, in1.dataType, evalCtx, 1);

                    return es3fShaderMatrixTest.reduceMatToVec3(deMath.divide(in0, in1));
                };
        }
	};

    /**
     * @param {string} str
     * @param {Array<number>} v
     * @param {number} size
     */
    es3fShaderMatrixTest.writeVectorConstructor = function (str, v, size) {
    	str += 'vec' + size + '';
    	for (var ndx = 0; ndx < size; ndx++) {
    		if (ndx != 0)
    			str += ', ';
    		str += v[ndx].toString;
    	}
    	str += ')';
    }

    /**
     * @param {string} str
     * @param {tcuMatrix.Matrix} m
     */
    es3fShaderMatrixTest.writeMatrixConstructor = function (str, m) {
        if (m.rows == m.cols)
    		str += 'mat' + m.cols;
    	else
    		str += 'mat' + m.cols + 'x' + m.rows;

    	str += '(';
    	for (var colNdx = 0; colNdx < m.cols; colNdx++) {
    		for (var rowNdx = 0; rowNdx < m.rows; rowNdx++) {
    			if (rowNdx > 0 || colNdx > 0)
    				str += ', ';
    			str += m.get(rowNdx, colNdx).toString();
    		}
    	}
    	str += ')';
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
        this.m_matEvaluator = es3fShaderMatrixTest.getEvalFunc(in0, in1, op);
    };

    es3fShaderMatrixTest.ShaderMatrixCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fShaderMatrixTest.ShaderMatrixCase.prototype.constructor = es3fShaderMatrixTest.ShaderMatrixCase;


    es3fShaderMatrixTest.ShaderMatrixCase.prototype.init = function () {
        /** @type {string} */ var vtx = '';
    	/** @type {string} */ var frag = '';
    	/** @type {string} */ var op = this.m_isVertexCase ? vtx : frag;

        /** @type {boolean} */ var isInDynMat0 = gluShaderUtil.isDataTypeMatrix(this.m_in0.dataType) && this.m_in0.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC;
    	/** @type {boolean} */ var isInDynMat1 = gluShaderUtil.isDataTypeMatrix(this.m_in1.dataType) && this.m_in1.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC;
    	/** @type {string} */ var inValue0 = '';
    	/** @type {string} */ var inValue1 = '';
    	/** @type {gluShaderUtil.DataType} */ var resultType = Object.keys(gluShaderUtil.DataType).length;
    	/** @type {gluShaderUtil.precision} */ var resultPrec = this.m_in0.precision;
    	/** @type {Array<string>} */ var passVars = [];
    	/** @type {number} */ var numInputs = (isOperationBinary(this.m_op)) ? (2) : (1);

    	/** @type {string} */ var operationValue0 = '';
    	/** @type {string} */ var operationValue1 = '';

        if (!isInDynMat0 || !isInDynMat1) {
            throw new Error ('Only single dynamic matrix input is allowed.');
        }

        if (this.m_op == es3fShaderMatrixTest.MatrixOp.OP_MUL && gluShaderUtil.isDataTypeMatrix(this.m_in0.dataType) && gluShaderUtil.isDataTypeMatrix(this.m_in1.dataType)) {
    		resultType = gluShaderUtil.getDataTypeMatrix(gluShaderUtil.getDataTypeMatrixNumColumns(this.m_in1.dataType), gluShaderUtil.getDataTypeMatrixNumRows(this.m_in0.dataType));
    	} else if (this.m_op == es3fShaderMatrixTest.MatrixOp.OP_OUTER_PRODUCT) {
    		resultType = gluShaderUtil.getDataTypeMatrix(getDataTypeScalarSize(this.m_in1.dataType), getDataTypeScalarSize(this.m_in0.dataType));
    	} else if (this.m_op == es3fShaderMatrixTest.MatrixOp.OP_TRANSPOSE) {
    		resultType = gluShaderUtil.getDataTypeMatrix(gluShaderUtil.getDataTypeMatrixNumRows(this.m_in0.dataType), gluShaderUtil.getDataTypeMatrixNumColumns(this.m_in0.dataType));
    	} else if (this.m_op == es3fShaderMatrixTest.MatrixOp.OP_INVERSE) {
    		resultType = this.m_in0.dataType;
    	} else if (this.m_op == es3fShaderMatrixTest.MatrixOp.OP_DETERMINANT) {
    		resultType = gluShaderUtil.DataType.TYPE_FLOAT;
    	} else if (es3fShaderMatrixTest.getOperationType(this.m_op) == es3fShaderMatrixTest.OperationType.OPERATIONTYPE_UNARY_PREFIX_OPERATOR ||
    			 es3fShaderMatrixTest.getOperationType(this.m_op) == es3fShaderMatrixTest.OperationType.OPERATIONTYPE_UNARY_POSTFIX_OPERATOR) {
    		resultType = this.m_in0.dataType;
    	} else if (gluShaderUtil.isDataTypeMatrix(this.m_in0.dataType) && gluShaderUtil.isDataTypeMatrix(this.m_in1.dataType)) {
    		if (this.m_in0.dataType == this.m_in1.dataType) {
                throw new Error ('Incompatible data types');
            }
    		resultType = this.m_in0.dataType;
    	} else if (gluShaderUtil.isDataTypeMatrix(this.m_in0.dataType) || gluShaderUtil.isDataTypeMatrix(this.m_in1.dataType)) {
    		/** @type {number} */ var matNdx = gluShaderUtil.isDataTypeMatrix(this.m_in0.dataType) ? 0 : 1;
    		/** @type {gluShaderUtil.DataType} */ var matrixType = matNdx == 0 ? this.m_in0.dataType : this.m_in1.dataType;
    		/** @type {gluShaderUtil.DataType} */ var otherType = matNdx == 0 ? this.m_in1.dataType : this.m_in0.dataType;

    		if (otherType == gluShaderUtil.DataType.TYPE_FLOAT)
    			resultType = matrixType;
    		else  {
    			if (gluShaderUtil.isDataTypeVector(otherType)) {
                    throw new Error ('Is not data type vector');
                }
    			resultType = getDataTypeFloatVec(matNdx == 0 ? gluShaderUtil.getDataTypeMatrixNumRows(matrixType) : gluShaderUtil.getDataTypeMatrixNumColumns(matrixType));
    		}
    	} else {
    		throw new Error ('Error');
    	}

        /** @type {string} */ var vtx = '#version 300 es\n';
    	/** @type {string} */ var frag = '#version 300 es\n';

    	vtx += 'in highp vec4 a_position;\n';
    	frag += 'layout(location = 0) out mediump vec4 dEQP_FragColor;\n';
    	if (this.m_isVertexCase) {
    		vtx += 'out mediump vec4 v_color;\n';
    		frag += 'in mediump vec4 v_color;\n';
    	}

        // Input declarations.
    	for (var inNdx = 0; inNdx < numInputs; inNdx++) {
    		/** @type {es3fShaderMatrixTest.ShaderInput} */ var in = inNdx > 0 ? m_in1 : m_in0;
    		/** @type {string} */ var precName = gluShaderUtil.getPrecisionName(in.precision);
    		/** @type {string} */ var typeName = gluShaderUtil.getDataTypeName(in.dataType);
    		/** @type {string} */ var inValue = inNdx > 0 ? inValue1 : inValue0;

    		if (in.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC) {
    			vtx += 'in ' + precName + ' ' + typeName + ' a_';

    			if (gluShaderUtil.isDataTypeMatrix(in.dataType)) {
    				// a_matN, v_matN
    				vtx += typeName + ';\n';
    				if (!this.m_isVertexCase) {
    					vtx += 'out ' + precName + ' ' + typeName + ' v_' + typeName + ';\n';
    					frag += 'in ' + precName + ' ' + typeName + ' v_' + typeName + ';\n';
    					passVars.push(typeName);
    				}

    				inValue = this.m_isVertexCase ? 'a_' : 'v_' + gluShaderUtil.getDataTypeName(in.dataType);
    			} else {
    				// a_coords, v_coords
    				vtx += 'coords;\n';
    				if (!this.m_isVertexCase) {
    					vtx += 'out ' + precName + ' ' + typeName + ' v_coords;\n';
    					frag += 'in ' + precName + ' ' + typeName + ' v_coords;\n';
    					passVars.push('coords');
    				}

    				inValue = m_isVertexCase ? 'a_coords' : 'v_coords';
    			}
    		}  else if (in.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_UNIFORM) {
    			op += 'uniform ' + precName + ' ' + typeName + ' u_in' + inNdx + ';\n';
    			inValue = string('u_in') + inNdx.toString();
    		} else if (in.inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_CONST) {
    			op += 'const ' + precName + ' ' + typeName + ' in' + inNdx + ' = ';

    			// Generate declaration.
    			switch (in.dataType) {
    				case gluShaderUtil.DataType.TYPE_FLOAT:
                        op += s_constInFloat[inNdx].toString();
                        break;
    				case gluShaderUtil.DataType.TYPE_FLOAT_VEC2:
                        es3fShaderMatrixTest.writeVectorConstructor(op, s_constInVec2[inNdx], 2);
                        break;
    				case gluShaderUtil.DataType.TYPE_FLOAT_VEC3:
                        es3fShaderMatrixTest.writeVectorConstructor(op, s_constInVec3[inNdx], 3);
                        break;
    				case gluShaderUtil.DataType.TYPE_FLOAT_VEC4:
                        es3fShaderMatrixTest.writeVectorConstructor(op, s_constInVec4[inNdx], 4);
                        break;
    				case gluShaderUtil.DataType.TYPE_FLOAT_MAT2:
                        es3fShaderMatrixTest.writeMatrixConstructor(op, tcuMatrix.matrixFromVector(2, 2, s_constInMat2x2[inNdx]));
                        break;
    				case gluShaderUtil.DataType.TYPE_FLOAT_MAT2X3:
                        es3fShaderMatrixTest.writeMatrixConstructor(op, tcuMatrix.matrixFromVector(2, 3, s_constInMat2x3[inNdx]));
                        break;
    				case gluShaderUtil.DataType.TYPE_FLOAT_MAT2X4:
                        es3fShaderMatrixTest.writeMatrixConstructor(op, tcuMatrix.matrixFromVector(2, 4, s_constInMat2x4[inNdx]));
                        break;
    				case gluShaderUtil.DataType.TYPE_FLOAT_MAT3X2:
                        es3fShaderMatrixTest.writeMatrixConstructor(op, tcuMatrix.matrixFromVector(3, 2, s_constInMat3x2[inNdx]));
                        break;
    				case gluShaderUtil.DataType.TYPE_FLOAT_MAT3:
                        es3fShaderMatrixTest.writeMatrixConstructor(op, tcuMatrix.matrixFromVector(3, 3, s_constInMat3x3[inNdx]));
                        break;
    				case gluShaderUtil.DataType.TYPE_FLOAT_MAT3X4:
                        es3fShaderMatrixTest.writeMatrixConstructor(op, tcuMatrix.matrixFromVector(3, 4, s_constInMat3x4[inNdx]));
                        break;
    				case gluShaderUtil.DataType.TYPE_FLOAT_MAT4X2:
                        es3fShaderMatrixTest.writeMatrixConstructor(op, tcuMatrix.matrixFromVector(4, 2, s_constInMat4x2[inNdx]));
                        break;
    				case gluShaderUtil.DataType.TYPE_FLOAT_MAT4X3:
                        es3fShaderMatrixTest.writeMatrixConstructor(op, tcuMatrix.matrixFromVector(4, 3, s_constInMat4x3[inNdx]));
                        break;
    				case gluShaderUtil.DataType.TYPE_FLOAT_MAT4:
                        es3fShaderMatrixTest.writeMatrixConstructor(op, tcuMatrix.matrixFromVector(4, 4, s_constInMat4x4[inNdx]));
                        break;

    				default:
    					throw new Error('Data type error');
    			}

    			op += ';\n';

    			inValue = 'in' + inNdx.toString();
    		}
        }

        vtx += '\n'
		+ 'void main (void)\n'
		+ '{\n'
		+ '	gl_Position = a_position;\n';
        frag += '\n'
        + 'void main (void)\n'
        + '{\n';

    	if (m_isVertexCase)
    		frag += '	dEQP_FragColor = v_color;\n';
    	else {
    		for (var copyIter = 0; copyIter != passVars.length; copyIter++)
    			vtx += '	v_' + *copyIter + ' = ' + 'a_' + *copyIter + ';\n';
    	}

    	// Operation.

    	switch (es3fShaderMatrixTest.getOperationNature(this.m_op)) {
    		case es3fShaderMatrixTest.OperationNature.OPERATIONNATURE_PURE:
    			if (es3fShaderMatrixTest.getOperationType(this.m_op) != es3fShaderMatrixTest.OperationType.OPERATIONTYPE_ASSIGNMENT)
                    throw new Error('Wrong operation type');

    			operationValue0 = inValue0;
    			operationValue1 = inValue1;
    			break;

    		case es3fShaderMatrixTest.OperationNature.OPERATIONNATURE_MUTATING:
    			if (es3fShaderMatrixTest.getOperationType(this.m_op) != es3fShaderMatrixTest.OperationType.OPERATIONTYPE_ASSIGNMENT)
                    throw new Error('Wrong operation type');

    			op += '	' + gluShaderUtil.getPrecisionName(resultPrec) + ' ' + gluShaderUtil.getDataTypeName(resultType) + ' tmpValue = ' + inValue0 + ';\n';

    			operationValue0 = 'tmpValue';
    			operationValue1 = inValue1;
    			break;

    		case es3fShaderMatrixTest.OperationNature.OPERATIONNATURE_ASSIGNMENT:
    			if (es3fShaderMatrixTest.getOperationType(this.m_op) == es3fShaderMatrixTest.OperationType.OPERATIONTYPE_ASSIGNMENT)
                    throw new Error('Wrong operation type');

    			operationValue0 = inValue0;
    			operationValue1 = inValue1;
    			break;

    		default:
    		    throw new Error('Wrong operation nature');
    	}

        switch (es3fShaderMatrixTest.getOperationType(this.m_op)) {
    		case OPERATIONTYPE_BINARY_OPERATOR:
    			op += '	' + gluShaderUtil.getPrecisionName(resultPrec) + ' '
                + gluShaderUtil.getDataTypeName(resultType)
                + ' res = ' + operationValue0 + ' '
                + es3fShaderMatrixTest.getOperationName(this.m_op) + ' '
                + operationValue1 + ';\n';
    			break;
    		case OPERATIONTYPE_UNARY_PREFIX_OPERATOR:
    			op += '	' + gluShaderUtil.getPrecisionName(resultPrec) + ' '
                + gluShaderUtil.getDataTypeName(resultType)
                + ' res = ' + es3fShaderMatrixTest.getOperationName(this.m_op)
                + operationValue0 + ';\n';
    			break;
    		case OPERATIONTYPE_UNARY_POSTFIX_OPERATOR:
    			op += '	' + gluShaderUtil.getPrecisionName(resultPrec) + ' '
                + gluShaderUtil.getDataTypeName(resultType)
                + ' res = ' + operationValue0
                + es3fShaderMatrixTest.getOperationName(this.m_op) + ';\n';
    			break;
    		case OPERATIONTYPE_BINARY_FUNCTION:
    			op += '	' + gluShaderUtil.getPrecisionName(resultPrec)
                + ' ' + gluShaderUtil.getDataTypeName(resultType)
                + ' res = ' + es3fShaderMatrixTest.getOperationName(this.m_op)
                + '(' + operationValue0
                + ', ' + operationValue1 + ');\n';
    			break;
    		case OPERATIONTYPE_UNARY_FUNCTION:
    			op += '	' + gluShaderUtil.getPrecisionName(resultPrec)
                + ' ' + gluShaderUtil.getDataTypeName(resultType)
                + ' res = ' + es3fShaderMatrixTest.getOperationName(this.m_op)
                + '(' + operationValue0 + ');\n';
    			break;
    		case OPERATIONTYPE_ASSIGNMENT:
    			op += '	' + gluShaderUtil.getPrecisionName(resultPrec)
                + ' ' + gluShaderUtil.getDataTypeName(resultType)
                + ' res = ' + operationValue0 + ';\n';
    			op += '	res ' + es3fShaderMatrixTest.getOperationName(this.m_op)
                + ' ' + operationValue1 + ';\n';
    			break;
    		default:
    			throw new Error('Wrong operation type');
    	}

        // Reduction to vec3 (rgb). Check the used value too if it was modified
    	op += '	' + (m_isVertexCase ? 'v_color' : 'dEQP_FragColor') + ' = ';

    	if (es3fShaderMatrixTest.isOperationValueModifying(this.m_op))
    		op += 'vec4(' + es3fShaderMatrixTest.ShaderMatrixCase.genGLSLMatToVec3Reduction(resultType, 'res')
            + ', 1.0) + vec4(' + es3fShaderMatrixTest.ShaderMatrixCase.genGLSLMatToVec3Reduction(resultType, 'tmpValue')
            + ', 0.0);\n';
    	else
    		op += 'vec4(' + es3fShaderMatrixTest.ShaderMatrixCase.genGLSLMatToVec3Reduction(resultType, 'res')
            + ', 1.0);\n';

    	vtx += '}\n';
    	frag += '}\n';

    	this.m_vertShaderSource	= vtx;
    	this.m_fragShaderSource	= frag;

        // \todo [2012-02-14 pyry] Compute better values for matrix tests.
    	for (var attribNdx = 0; attribNdx < 4; attribNdx++) {
    		this.m_userAttribTransforms[attribNdx] = tcuMatrix.Mat4();
    		this.m_userAttribTransforms[attribNdx].set(0, 3) = 0.2;// !< prevent matrix*vec from going into zero (assuming vec.w != 0)
    		this.m_userAttribTransforms[attribNdx].set(1, 3) = 0.1;// !<
    		this.m_userAttribTransforms[attribNdx].set(2, 3) = 0.4 + 0.15 * attribNdx;// !<
    		this.m_userAttribTransforms[attribNdx].set(3, 3) = 0.7;// !<
    		this.m_userAttribTransforms[attribNdx].set((0 + attribNdx) % 4, 0) = 1.0;
    		this.m_userAttribTransforms[attribNdx].set((1 + attribNdx) % 4, 1) = 1.0;
    		this.m_userAttribTransforms[attribNdx].set((2 + attribNdx) % 4, 2) = 1.0;
    		this.m_userAttribTransforms[attribNdx].set((3 + attribNdx) % 4, 3) = 1.0;
    	}

    	// prevent bad reference cases such as black result images by fine-tuning used matrices
    	if (es3fShaderMatrixTest.getOperationTestMatrixType(this.m_op) != es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DEFAULT) {
    		for (var attribNdx = 0; attribNdx < 4; attribNdx++) {
    			for (var row = 0; row < 4; row++)
        			for (var col = 0; col < 4; col++) {
        				switch (es3fShaderMatrixTest.getOperationTestMatrixType(this.m_op)) {
        					case es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_NEGATED:
        						this.m_userAttribTransforms[attribNdx].set(row, col) = -this.m_userAttribTransforms[attribNdx].get(row, col);
        						break;
        					case es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_INCREMENTED:
        						this.m_userAttribTransforms[attribNdx].set(row, col) += 0.3;
        						break;
        					case es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_DECREMENTED:
        						this.m_userAttribTransforms[attribNdx].set(row, col) -= 0.3;
        						break;
        					case es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_NEGATED_INCREMENTED:
        						this.m_userAttribTransforms[attribNdx].set(row, col) = -this.m_userAttribTransforms[attribNdx](row, col) + 0.3;
        						break;
        					case es3fShaderMatrixTest.MatrixType.TESTMATRIXTYPE_INCREMENTED_LESS:
        						this.m_userAttribTransforms[attribNdx].set(row, col) -= 0.1;
        						break;
        					default:
        						throw new Error('Wrong Matrix type');
        				}
        			}
    		}
    	}

        glsShaderRenderCase.ShaderMatrixCase.init.call();
    };



    /**
     * @param {gluShaderUtil.DataType} matType
     * @param {string} varName
     * @return {string}
     */
    es3fShaderMatrixTest.ShaderMatrixCase.prototype.genGLSLMatToVec3Reduction = function (matType, varName) {
    	/** @type {string} */ op = '';

    	switch (matType) {
    		case TYPE_FLOAT:
                op += varName + ', '
                + varName + ', '
                + varName + '';
                break;
    		case TYPE_FLOAT_VEC2:
                op += varName + '.x, '
                + varName + '.y, '
                + varName + '.x';
                break;
    		case TYPE_FLOAT_VEC3:
                op += varName + '';
                break;
    		case TYPE_FLOAT_VEC4:
                op += varName + '.x, '
                + varName + '.y, '
                + varName + '.z+'
                + varName + '.w';
                break;
    		case TYPE_FLOAT_MAT2:
                op += varName + '[0][0], '
                + varName + '[1][0], '
                + varName + '[0][1]+'
                + varName + '[1][1]';
                break;
    		case TYPE_FLOAT_MAT2X3:
                op += varName + '[0] + '
                + varName + '[1]';
                break;
    		case TYPE_FLOAT_MAT2X4:
                op += varName + '[0].xyz + '
                + varName + '[1].yzw';
                break;
    		case TYPE_FLOAT_MAT3X2:
                op += varName + '[0][0]+'
                + varName + '[0][1], '
                + varName + '[1][0]+'
                + varName + '[1][1], '
                + varName + '[2][0]+'
                + varName + '[2][1]';
                break;
    		case TYPE_FLOAT_MAT3:
                op += varName + '[0] + '
                + varName + '[1] + '
                + varName + '[2]';
                break;
    		case TYPE_FLOAT_MAT3X4:
                op += varName + '[0].xyz + '
                + varName + '[1].yzw + '
                + varName + '[2].zwx';
                break;
    		case TYPE_FLOAT_MAT4X2:
                op += varName + '[0][0]+'
                + varName + '[0][1]+'
                + varName + '[3][0], '
                + varName + '[1][0]+'
                + varName + '[1][1]+'
                + varName + '[3][1], '
                + varName + '[2][0]+'
                + varName + '[2][1]';
                break;
    		case TYPE_FLOAT_MAT4X3:
                op += varName + '[0] + '
                + varName + '[1] + '
                + varName + '[2] + '
                + varName + '[3]';
                break;
    		case TYPE_FLOAT_MAT4:
                op += varName + '[0].xyz+'
                + varName + '[1].yzw+'
                + varName + '[2].zwx+'
                + varName + '[3].wxy';
                break;

    		default:
    			throw new Error('Wrong data type');
    	}

    	return op;
    }

    /**
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @param {bolean} extendedInputTypeCases
     * @param {bolean} createInputTypeGroup
     */
    es3fShaderMatrixTest.ops = function (name, desc, op, extendedInputTypeCases, createInputTypeGroup) {
        this.name = name;
        this.desc = desc;
        this.op = op;
        this.extendedInputTypeCases = extendedInputTypeCases;
        this.createInputTypeGroup = createInputTypeGroup;
    };

    /**
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {es3fShaderMatrixTest.InputType} createInputTypeGroup
     */
	es3fShaderMatrixTest.InputTypeSpec = function (name, desc, type) {
		this.name = name;
		this.desc = desc;
		this.type = type;
	};

    es3fShaderMatrixTest.init = function () {
        var ops = [
    		new es3fShaderMatrixTest.ops('add', 'Matrix addition tests', es3fShaderMatrixTest.MatrixOp.OP_ADD, true, true),
    		new es3fShaderMatrixTest.ops('sub', 'Matrix subtraction tests', es3fShaderMatrixTest.MatrixOp.OP_SUB, true, true),
    		new es3fShaderMatrixTest.ops('mul', 'Matrix multiplication tests', es3fShaderMatrixTest.MatrixOp.OP_MUL, true,	true),
    		new es3fShaderMatrixTest.ops('div', 'Matrix division tests', es3fShaderMatrixTest.MatrixOp.OP_DIV, true, true),
    		new es3fShaderMatrixTest.ops('matrixcompmult', 'Matrix component-wise multiplication tests', es3fShaderMatrixTest.MatrixOp.OP_COMP_MUL, false, true),
    		new es3fShaderMatrixTest.ops('outerproduct', 'Matrix outerProduct() tests', es3fShaderMatrixTest.MatrixOp.OP_OUTER_PRODUCT, false, true),
    		new es3fShaderMatrixTest.ops('transpose', 'Matrix transpose() tests', es3fShaderMatrixTest.MatrixOp.OP_TRANSPOSE, false, true),
    		new es3fShaderMatrixTest.ops('determinant', 'Matrix determinant() tests', es3fShaderMatrixTest.MatrixOp.OP_DETERMINANT, false, true),
    		new es3fShaderMatrixTest.ops('inverse', 'Matrix inverse() tests', es3fShaderMatrixTest.MatrixOp.OP_INVERSE, false, true),
    		new es3fShaderMatrixTest.ops('unary_addition', 'Matrix unary addition tests', es3fShaderMatrixTest.MatrixOp.OP_UNARY_PLUS, false, false),
    		new es3fShaderMatrixTest.ops('negation', 'Matrix negation tests', es3fShaderMatrixTest.MatrixOp.OP_NEGATION, false, false),
    		new es3fShaderMatrixTest.ops('pre_increment', 'Matrix prefix increment tests', es3fShaderMatrixTest.MatrixOp.OP_PRE_INCREMENT, false, false),
    		new es3fShaderMatrixTest.ops('pre_decrement', 'Matrix prefix decrement tests', es3fShaderMatrixTest.MatrixOp.OP_PRE_DECREMENT, false, false),
    		new es3fShaderMatrixTest.ops('post_increment', 'Matrix postfix increment tests', es3fShaderMatrixTest.MatrixOp.OP_POST_INCREMENT, false, false),
    		new es3fShaderMatrixTest.ops('post_decrement', 'Matrix postfix decrement tests', es3fShaderMatrixTest.MatrixOp.OP_POST_DECREMENT, false, false),
    		new es3fShaderMatrixTest.ops('add_assign', 'Matrix add into tests', es3fShaderMatrixTest.MatrixOp.OP_ADD_INTO, false, false),
    		new es3fShaderMatrixTest.ops('sub_assign', 'Matrix subtract from tests', es3fShaderMatrixTest.MatrixOp.OP_SUBTRACT_FROM,false, false),
    		new es3fShaderMatrixTest.ops('mul_assign', 'Matrix multiply into tests', es3fShaderMatrixTest.MatrixOp.OP_MULTIPLY_INTO,false, false),
    		new es3fShaderMatrixTest.ops('div_assign', 'Matrix divide into tests', es3fShaderMatrixTest.MatrixOp.OP_DIVIDE_INTO,false, false)
    	];

    	var extendedInputTypes = [
    		new es3fShaderMatrixTest.InputTypeSpec('const', 'Constant matrix input', es3fShaderMatrixTest.InputType.INPUTTYPE_CONST),
    		new es3fShaderMatrixTest.InputTypeSpec('uniform', 'Uniform matrix input', es3fShaderMatrixTest.InputType.INPUTTYPE_UNIFORM),
    		new es3fShaderMatrixTest.InputTypeSpec('dynamic', 'Dynamic matrix input', es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC)
    	];

    	var reducedInputTypes = [
    		new es3fShaderMatrixTest.InputTypeSpec('dynamic', 'Dynamic matrix input', es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC)
    	];

    	/** @type {Array<gluShaderUtil.DataType>} */ var matrixTypes = [
    		gluShaderUtil.DataType.TYPE_FLOAT_MAT2,
    		gluShaderUtil.DataType.TYPE_FLOAT_MAT2X3,
    		gluShaderUtil.DataType.TYPE_FLOAT_MAT2X4,
    		gluShaderUtil.DataType.TYPE_FLOAT_MAT3X2,
    		gluShaderUtil.DataType.TYPE_FLOAT_MAT3,
    		gluShaderUtil.DataType.TYPE_FLOAT_MAT3X4,
    		gluShaderUtil.DataType.TYPE_FLOAT_MAT4X2,
    		gluShaderUtil.DataType.TYPE_FLOAT_MAT4X3,
    		gluShaderUtil.DataType.TYPE_FLOAT_MAT4
    	];

    	/** @type {Array<gluShaderUtil.precision>} */ var precisions = [
    		gluShaderUtil.precision.PRECISION_LOWP,
    		gluShaderUtil.precision.PRECISION_MEDIUMP,
    		gluShaderUtil.precision.PRECISION_HIGHP
    	];

    	for (var opNdx = 0; opNdx < ops.length; opNdx++) {
    		var inTypeList = ops[opNdx].extendedInputTypeCases ? extendedInputTypes : reducedInputTypes;
    		var inTypeListSize = ops[opNdx].extendedInputTypeCases ? extendedInputTypes.length : reducedInputTypes.length;
    		var op = ops[opNdx].op;
    		var opGroup = new tcuTestCase.newTest(ops[opNdx].name, ops[opNdx].desc);

    		addChild(opGroup);

    		for (var inTypeNdx = 0; inTypeNdx < inTypeListSize; inTypeNdx++) {
    			var inputType	= inTypeList[inTypeNdx].type;
    			var inGroup;

    			if (ops[opNdx].createInputTypeGroup) {
    				inGroup = new tcuTestCase.newTest(inTypeList[inTypeNdx].name, inTypeList[inTypeNdx].desc);
    				opGroup.addChild(inGroup);
    			} else
    				inGroup = opGroup;

    			for (var matTypeNdx = 0; matTypeNdx < matrixTypes.length; matTypeNdx++) {
    				var matType = matrixTypes[matTypeNdx];
    				var numCols = gluShaderUtil.getDataTypeMatrixNumColumns(matType);
    				var numRows = gluShaderUtil.getDataTypeMatrixNumRows(matType);
    				var matTypeName	= gluShaderUtil.getDataTypeName(matType);

    				for (var precNdx = 0; precNdx < precisions.length; precNdx++) {
    					var precision = precisions[precNdx];
    					var precName = gluShaderUtil.getPrecisionName(precision);
    					var baseName = precName + '_' + matTypeName + '_';
    					var matIn = new es3fShaderMatrixTest.ShaderInput(inputType, matType, precision);

    					if (es3fShaderMatrixTest.isOperationMatrixScalar(op)) {
    						// Matrix-scalar \note For div cases we use uniform input.
    						var scalarIn = new es3fShaderMatrixTest.ShaderInput(op == es3fShaderMatrixTest.MatrixOp.OP_DIV ? es3fShaderMatrixTest.InputType.INPUTTYPE_UNIFORM : es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC, gluShaderUtil.DataType.TYPE_FLOAT, precision);
    						inGroup.addChild(new ShaderMatrixCase(baseName + 'float_vertex', 'Matrix-scalar case', matIn, scalarIn, op, true);
    						inGroup.addChild(new ShaderMatrixCase(baseName + 'float_fragment',	'Matrix-scalar case', matIn, scalarIn, op, false);
    					}

    					if (es3fShaderMatrixTest.isOperationMatrixVector(op)) {
    						// Matrix-vector.
    						var colVecType	= gluShaderUtil.getDataTypeFloatVec(numCols);
    						var colVecIn = new es3fShaderMatrixTest.ShaderInput(op == es3fShaderMatrixTest.MatrixOp.OP_DIV ? es3fShaderMatrixTest.InputType.INPUTTYPE_UNIFORM : es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC, colVecType, precision);

    						inGroup.addChild(new ShaderMatrixCase(baseName + gluShaderUtil.getDataTypeName(colVecType) + '_vertex', 'Matrix-vector case', matIn, colVecIn, op, true));
    						inGroup.addChild(new ShaderMatrixCase(baseName + gluShaderUtil.getDataTypeName(colVecType) + '_fragment', 'Matrix-vector case', matIn, colVecIn, op, false));

    						// Vector-matrix.
    						var rowVecType	= gluShaderUtil.getDataTypeFloatVec(numRows);
    						var	rowVecIn = new es3fShaderMatrixTest.ShaderInput(op == es3fShaderMatrixTest.MatrixOp.OP_DIV ? es3fShaderMatrixTest.InputType.INPUTTYPE_UNIFORM : es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC, rowVecType, precision);
    						var vecMatName = precName + '_' + gluShaderUtil.getDataTypeName(rowVecType) + '_' + matTypeName;

    						inGroup.addChild(new ShaderMatrixCase(vecMatName + '_vertex', 'Vector-matrix case', rowVecIn, matIn, op, true));
    						inGroup.addChild(new ShaderMatrixCase(vecMatName + '_fragment', 'Vector-matrix case', rowVecIn, matIn, op, false));
    					}

    					if (es3fShaderMatrixTest.isOperationArithmeticMatrixMatrix(op)) {
    						// Arithmetic matrix-matrix multiplication.
    						for (var otherCols = 2; otherCols <= 4; otherCols++) {
    							var otherMatIn = new es3fShaderMatrixTest.ShaderInput(inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ? es3fShaderMatrixTest.InputType.INPUTTYPE_UNIFORM : inputType, gluShaderUtil.getDataTypeMatrix(otherCols, numCols), precision);
    							inGroup.addChild(new ShaderMatrixCase(m_context, (baseName + gluShaderUtil.getDataTypeName(otherMatIn.dataType) + '_vertex').c_str(),	'Matrix-matrix case', matIn, otherMatIn, op, true));
    							inGroup.addChild(new ShaderMatrixCase(m_context, (baseName + gluShaderUtil.getDataTypeName(otherMatIn.dataType) + '_fragment').c_str(),	'Matrix-matrix case', matIn, otherMatIn, op, false));
    						}
    					} else if (es3fShaderMatrixTest.isOperationComponentwiseMatrixMatrix(op)) {
    						// Component-wise.
    						var otherMatIn = new es3fShaderMatrixTest.ShaderInput(inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ? es3fShaderMatrixTest.InputType.INPUTTYPE_UNIFORM : inputType, matType, precision);
    						inGroup.addChild(new ShaderMatrixCase(baseName + matTypeName + '_vertex', 'Matrix-matrix case', matIn, otherMatIn, op, true));
    						inGroup.addChild(new ShaderMatrixCase(baseName + matTypeName + '_fragment', 'Matrix-matrix case', matIn, otherMatIn, op, false));
    					}

    					if (es3fShaderMatrixTest.isOperationVectorVector(op)) {
    						var vec1In = new es3fShaderMatrixTest.ShaderInput(inputType, gluShaderUtil.getDataTypeFloatVec(numRows), precision);
    						var vec2In = new es3fShaderMatrixTest.ShaderInput((inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC) ? es3fShaderMatrixTest.InputType.INPUTTYPE_UNIFORM : inputType, gluShaderUtil.getDataTypeFloatVec(numCols), precision);

    						inGroup.addChild(new ShaderMatrixCase(baseName + 'float_vertex', 'Vector-vector case', vec1In, vec2In, op, true));
    						inGroup.addChild(new ShaderMatrixCase(baseName + 'float_fragment', 'Vector-vector case', vec1In, vec2In, op, false));
    					}

    					if (es3fShaderMatrixTest.isOperationUnaryAnyMatrix(op) || (es3fShaderMatrixTest.isOperationUnarySymmetricMatrix(op) && numCols == numRows)) {
    						ShaderInput voidInput(Object.keys(es3fShaderMatrixTest.InputType).length, Object.keys(gluShaderUtil.DataType).length, Object.keys(gluShaderUtil.precision).length);
    						inGroup.addChild(new ShaderMatrixCase(baseName + 'float_vertex', 'Matrix case', matIn, voidInput, op, true));
    						inGroup.addChild(new ShaderMatrixCase(baseName + 'float_fragment', 'Matrix case', matIn, voidInput, op, false));
    					}

    					if (es3fShaderMatrixTest.isOperationAssignmentAnyMatrix(op) || (isOperationAssignmentSymmetricMatrix(op) && numCols == numRows)) {
    						var otherMatIn = new es3fShaderMatrixTest.ShaderInput(inputType == es3fShaderMatrixTest.InputType.INPUTTYPE_DYNAMIC ? es3fShaderMatrixTest.InputType.INPUTTYPE_UNIFORM : inputType, matType, precision);
    						inGroup.addChild(new ShaderMatrixCase(baseName + 'float_vertex', 'Matrix assignment case', matIn, otherMatIn, op, true));
    						inGroup.addChild(new ShaderMatrixCase(baseName + 'float_fragment', 'Matrix assignment case', matIn, otherMatIn, op, false));
    					}
    				}
    			}
    		}
    	}
    }

    es3fShaderMatrixTest.run = function(context) {
        gl = context;
        //Set up Test Root parameters
        var testName = 'Shader_matrix';
        var testDescription = 'Shader Matrix Test';
        var state = tcuTestCase.runner;

        state.testName = testName;
        state.testCases = tcuTestCase.newTest(testName, testDescription, null);

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        try {
            //Create test cases
            es3fShaderMatrixTest.init();
            //Run test cases
            tcuTestCase.runTestCases();
        }
        catch (err) {
            bufferedLogToConsole(err);
            tcuTestCase.runner.terminate();
        }
    };
});
