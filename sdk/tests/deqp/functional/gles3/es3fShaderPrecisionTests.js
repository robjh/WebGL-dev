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
goog.provide('functional.gles3.es3fShaderPrecisionTests');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.common.tcuFloat');
goog.require('framework.common.tcuTestCase');

goog.scope(function() {
    var es3fShaderPrecisionTests = functional.gles3.es3fShaderPrecisionTests;
	var gluShaderUtil = framework.opengl.gluShaderUtil;
    var tcuFloat = framework.common.tcuFloat;
    var tcuTestCase = framework.common.tcuTestCase;

    /**
    * @constructor
    * @extends {tcuTestCase.DeqpTest}
    */
    es3fShaderPrecisionTests.ShaderPrecisionTests = function() {
        tcuTestCase.DeqpTest.call(this, 'precision', 'Shader precision requirements validation tests');
    };

    es3fShaderPrecisionTests.ShaderPrecisionTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fShaderPrecisionTests.ShaderPrecisionTests.prototype.constructor = es3fShaderPrecisionTests.ShaderPrecisionTests;

    es3fShaderPrecisionTests.ShaderPrecisionTests.prototype.init = function() {
        // Exp = Emax-2, Mantissa = 0
        /** @type {number} */ var minF32 = tcuFloat.newFloat32((1 << 31) | (0xfd << 23) | 0x0).getValue);
        /** @type {number} */ var maxF32 = tcuFloat.newFloat32((0 << 31) | (0xfd << 23) | 0x0).getValue);
        /** @type {number} */ var minF16 = tcuFloat.newFloat16((deUint16)((1<<15) | (0x1d<<10) | 0x0)).getValue();
        /** @type {number} */ var maxF16 = tcuFloat.newFloat16((deUint16)((0<<15) | (0x1d<<10) | 0x0)).getValue();
        /** @type {Array<number>} */ var fullRange32F = [minF32, maxF32];
        /** @type {Array<number>} */ var fullRange16F = [minF16, maxF16];
        /** @type {Array<number>} */ var fullRange32I = [0x80000000, 0x7fffffff];
        /** @type {Array<number>} */ var fullRange16I = [-(1 << 15), (1 << 15) - 1];
        /** @type {Array<number>} */ var fullRange8I = [-(1 << 7), (1 << 7) - 1];
        /** @type {Array<number>} */ var fullRange32U = [0, 0xffffffff];
        /** @type {Array<number>} */ var fullRange16U = [0, 0xffff];
        /** @type {Array<number>} */ var fullRange8U = [0, 0xff];

        // \note Right now it is not programmatically verified that the results shouldn't end up being inf/nan but
        // actual values used are ok.

		/**
		 * @constructor
		 * @struct
		 * @param {string} name
		 * @param {string} op
		 * @param {es3fShaderPrecisionTests.ShaderFloatPrecisionCase.EvalFunc} evalFunc
		 * @param {gluShaderUtil.precision} precision
		 * @param {Array<number>} rangeA
		 * @param {Array<number>} rangeB
		 */
		var FloatCase = function(name, op, evalFunc, precision, rangeA, rangeB) {
			/** @type {string} */ this.name = name;
   			/** @type {string} */ this.op = op;
   			/** @type {es3fShaderPrecisionTests.ShaderFloatPrecisionCase.EvalFunc} */ this.evalFunc = evalFunc;
   			/** @type {gluShaderUtil.precision} */ this.precision = precision;
   			/** @type {Array<number>} */ this.rangeA = rangeA;
   			/** @type {Array<number>} */ this.rangeB = rangeB;
		};

		/** @type {Array<FloatCase>} */ var floatCases = [
			new FloatCase('highp_add', 'in0 + in1', es3fShaderPrecisionTests.ShaderFloatPrecisionCase.add, gluShaderUtil.precision.PRECISION_HIGHP, fullRange32F, fullRange32F),
			new FloatCase('highp_sub', 'in0 - in1', es3fShaderPrecisionTests.ShaderFloatPrecisionCase.sub, gluShaderUtil.precision.PRECISION_HIGHP, fullRange32F, fullRange32F),
			new FloatCase('highp_mul', 'in0 * in1', es3fShaderPrecisionTests.ShaderFloatPrecisionCase.mul, gluShaderUtil.precision.PRECISION_HIGHP, [-1e5, 1e5], [-1e5, 1e5]),
			new FloatCase('highp_div', 'in0 / in1', es3fShaderPrecisionTests.ShaderFloatPrecisionCase.div, gluShaderUtil.precision.PRECISION_HIGHP, [-1e5, 1e5], [-1e5, 1e5]),
			new FloatCase('mediump_add', 'in0 + in1', es3fShaderPrecisionTests.ShaderFloatPrecisionCase.add, gluShaderUtil.precision.PRECISION_MEDIUMP, fullRange16F, fullRange16F),
			new FloatCase('mediump_sub', 'in0 - in1', es3fShaderPrecisionTests.ShaderFloatPrecisionCase.sub, gluShaderUtil.precision.PRECISION_MEDIUMP, fullRange16F, fullRange16F),
			new FloatCase('mediump_mul', 'in0 * in1', es3fShaderPrecisionTests.ShaderFloatPrecisionCase.mul, gluShaderUtil.precision.PRECISION_MEDIUMP, [-1e2, 1e2], [-1e2, 1e2]),
			new FloatCase('mediump_div', 'in0 / in1', es3fShaderPrecisionTests.ShaderFloatPrecisionCase.div, gluShaderUtil.precision.PRECISION_MEDIUMP, [-1e2, 1e2], [-1e2, 1e2]),
		];
    };

    /**
    * Run test
    * @param {WebGL2RenderingContext} context
    */
    es3fShaderPrecisionTests.run = function(context) {
        gl = context;
        //Set up Test Root parameters
        var state = tcuTestCase.runner;
        state.setRoot(new es3fShaderPrecisionTests.ShaderPrecisionTests());

        //Set up name and description of this test series.
        setCurrentTestName(state.testCases.fullName());
        description(state.testCases.getDescription());

        try {
            //Run test cases
            tcuTestCase.runTestCases();
        }
        catch (err) {
            testFailedOptions('Failed to es3fShaderPrecisionTests.run tests', false);
            tcuTestCase.runner.terminate();
        }
    };

});
