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
goog.provide('functional.gles3.es3fShaderCommonFunctionTests');
goog.require('framework.common.tcuTestCase');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.opengl.gluShaderUtil');
goog.scope(function() {
	var es3fShaderCommonFunctionTests = functional.gles3.es3fShaderCommonFunctionTests;
	var tcuTestCase = framework.common.tcuTestCase;
	var gluShaderProgram = framework.opengl.gluShaderProgram;
	var gluShaderUtil = framework.opengl.gluShaderUtil;

	/** @typedef {*} */ es3fShaderCommonFunctionTests.TestClass;

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
	 */
	es3fShaderCommonFunctionTests.ShaderCommonFunctionTests = function() {
		tcuTestCase.DeqpTest.call(this, 'common', 'Common function tests');
	};

	es3fShaderCommonFunctionTests.ShaderCommonFunctionTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
	es3fShaderCommonFunctionTests.ShaderCommonFunctionTests.prototype.constructor = es3fShaderCommonFunctionTests.ShaderCommonFunctionTests;

	/**
	 * @param {tcuTestCase.DeqpTest} parent
	 * @param {es3fShaderCommonFunctionTests.TestClass} testClass
	 * @param {string} functionName
	 * @param {boolean} floatTypes
	 * @param {boolean} intTypes
	 * @param {boolean} uintTypes
	 */
	es3fShaderCommonFunctionTests.addFunctionCases = function(parent, testClass, functionName, floatTypes, intTypes, uintTypes) {
		/** @type {tcuTestCase.DeqpTest} */ var group = tcuTestCase.newTest(functionName, functionName);
		parent.addChild(group);

		/** @type {Array<gluShaderUtil.DataType>} */ var scalarTypes = [
			gluShaderUtil.DataType.FLOAT,
			gluShaderUtil.DataType.INT,
			gluShaderUtil.DataType.UINT
		];

		for (var scalarTypeNdx = 0; scalarTypeNdx < scalarTypes.length; scalarTypeNdx++) {
			/** @type {gluShaderUtil.DataType} */ var scalarType = scalarTypes[scalarTypeNdx];

			if ((!floatTypes && scalarType == gluShaderUtil.DataType.FLOAT)	||
				(!intTypes && scalarType == gluShaderUtil.DataType.INT)		||
				(!uintTypes && scalarType == gluShaderUtil.DataType.UINT))
				continue;

			for (var vecSize = 1; vecSize <= 4; vecSize++)
			for (var prec = gluShaderUtil.precision.PRECISION_LOWP; prec <= gluShaderUtil.precision.PRECISION_HIGHP; prec++)
			for (var shaderType = gluShaderProgram.shaderType.VERTEX; shaderType <= gluShaderProgram.shaderType.FRAGMENT; shaderType++)
				group.addChild(new testClass(gluShaderUtil.DataType[scalarType + vecSize - 1], gluShaderUtil.precision[prec], gluShaderProgram.shaderType[shaderType]));
		}
	};

	es3fShaderCommonFunctionTests.ShaderCommonFunctionTests.prototype.init = function()	{
		var testGroup = tcuTestCase.runner.testCases;

		// es3fShaderCommonFunctionTests.addFunctionCases(testGroup, es3fShaderCommonFunctionTests.AbsCase, 'abs', true, true, false);
		// es3fShaderCommonFunctionTests.addFunctionCases(testGroup, es3fShaderCommonFunctionTests.SignCase, 'sign', true, true, false);
		// es3fShaderCommonFunctionTests.addFunctionCases(testGroup, es3fShaderCommonFunctionTests.FloorCase, 'floor', true, false, false);
		// es3fShaderCommonFunctionTests.addFunctionCases(testGroup, es3fShaderCommonFunctionTests.TruncCase, 'trunc', true, false, false);
		// es3fShaderCommonFunctionTests.addFunctionCases(testGroup, es3fShaderCommonFunctionTests.RoundCase, 'round', true, false, false);
		// es3fShaderCommonFunctionTests.addFunctionCases(testGroup, es3fShaderCommonFunctionTests.RoundEvenCase, 'roundeven', true, false, false);
		// es3fShaderCommonFunctionTests.addFunctionCases(testGroup, es3fShaderCommonFunctionTests.CeilCase, 'ceil', true, false, false);
		// es3fShaderCommonFunctionTests.addFunctionCases(testGroup, es3fShaderCommonFunctionTests.FractCase, 'fract', true, false, false);
		// // mod
		// es3fShaderCommonFunctionTests.addFunctionCases(testGroup, es3fShaderCommonFunctionTests.ModfCase, 'modf', true, false, false);
		// // min, max, clamp, mix, step, smoothstep
		// es3fShaderCommonFunctionTests.addFunctionCases(testGroup, es3fShaderCommonFunctionTests.IsnanCase, 'isnan', true, false, false);
		// es3fShaderCommonFunctionTests.addFunctionCases(testGroup, es3fShaderCommonFunctionTests.IsinfCase, 'isinf', true, false, false);
		// es3fShaderCommonFunctionTests.addFunctionCases(testGroup, es3fShaderCommonFunctionTests.FloatBitsToIntCase, 'floatbitstoint', true, false, false);
		// es3fShaderCommonFunctionTests.addFunctionCases(testGroup, es3fShaderCommonFunctionTests.FloatBitsToUintCase, 'floatbitstouint', true, false, false);

		// (u)intBitsToFloat()
		/** @type {tcuTestCase.DeqpTest} */ var intGroup = tcuTestCase.newTest('intbitstofloat', 'intBitsToFloat() Tests');
		/** @type {tcuTestCase.DeqpTest} */ var uintGroup = tcuTestCase.newTest('uintbitstofloat', 'uintBitsToFloat() Tests');

		testGroup.addChild(intGroup);
		testGroup.addChild(uintGroup);

		for (var vecSize = 1; vecSize < 4; vecSize++) {
			/** @type {gluShaderUtil.DataType} */ var intType = vecSize > 1 ?
				gluShaderUtil.getDataTypeVector(gluShaderUtil.DataType.INT, vecSize) :
				gluShaderUtil.DataType.INT;

			/** @type {gluShaderUtil.DataType} */ var uintType = vecSize > 1 ?
				gluShaderUtil.getDataTypeVector(gluShaderUtil.DataType.UINT, vecSize) :
				gluShaderUtil.DataType.UINT;

			for (var shaderType = gluShaderProgram.shaderType.VERTEX; shaderType <= gluShaderProgram.shaderType.FRAGMENT; shaderType++) {
				// intGroup.addChild(new BitsToFloatCase(intType, gluShaderProgram.shaderType[shaderType]));
				// uintGroup.addChild(new BitsToFloatCase(uintType, gluShaderProgram.shaderType[shaderType]));
			}
		}
	};


    /**
    * Run test
    * @param {WebGL2RenderingContext} context
    */
    es3fShaderCommonFunctionTests.run = function(context) {
    	gl = context;
    	//Set up Test Root parameters
    	var state = tcuTestCase.runner;
    	state.setRoot(new es3fShaderCommonFunctionTests.ShaderCommonFunctionTests());

    	//Set up name and description of this test series.
    	setCurrentTestName(state.testCases.fullName());
    	description(state.testCases.getDescription());

    	try {
    		//Run test cases
    		tcuTestCase.runTestCases();
    	}
    	catch (err) {
    		testFailedOptions('Failed to es3fShaderCommonFunctionTests.run tests', false);
    		tcuTestCase.runner.terminate();
    	}
    };

});
