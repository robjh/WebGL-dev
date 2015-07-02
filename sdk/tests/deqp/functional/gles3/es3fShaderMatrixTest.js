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

goog.scope(function() {

    var es3fShaderMatrixTest= functional.gles3.es3fShaderMatrixTest;
    var gluShaderUtil = framework.opengl.gluShaderUtil;

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
     * @param {string} name
     * @param {string} desc
     * @param {es3fShaderMatrixTest.ShaderInput} in0
     * @param {es3fShaderMatrixTest.ShaderInput} in1
     * @param {es3fShaderMatrixTest.MatrixOp} op
     * @param {boolean} isVertexCase
     * @extends {tcuTestCase.DeqpTest}
     */
    es3fShaderMatrixTest.ShaderMatrixCase = function(name, desc, in0, in1, op, isVertexCase) {
        glsShaderRenderCase.DeqpTest.call(this, name, desc);
    };
    ShaderMatrixCase::ShaderMatrixCase (MatrixOp op, bool isVertexCase)
    	: ShaderRenderCase	(context.getTestContext(), context.getRenderContext(), context.getContextInfo(), name, desc, isVertexCase, m_matEvaluator)
    	, m_in0				(in0)
    	, m_in1				(in1)
    	, m_op				(op)
    	, m_matEvaluator	(getEvalFunc(in0, in1, op), in0.inputType, in1.inputType)
    {
    }

});
