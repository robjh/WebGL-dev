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
goog.require('framework.common.tcuFloat');
goog.require('framework.common.tcuTestCase');
goog.require('framework.delibs.debase.deRandom');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.opengl.gluShaderUtil');
goog.scope(function() {
    var es3fShaderCommonFunctionTests = functional.gles3.es3fShaderCommonFunctionTests;
    var tcuFloat = framework.common.tcuFloat;
    var tcuTestCase = framework.common.tcuTestCase;
    var gluShaderProgram = framework.opengl.gluShaderProgram;
    var gluShaderUtil = framework.opengl.gluShaderUtil;
	var deRandom = framework.delibs.debase.deRandom;
	var deMath = framework.delibs.debase.deMath;

    /** @typedef {*} */ es3fShaderCommonFunctionTests.TestClass;

	// VecArrayAccess
	// Won't need this, but just in case.

	/**
	 * @enum
	 */
	es3fShaderCommonFunctionTests.Types = {
		FLOAT: 0,
		INT: 1,
		UINT: 2
	};

	/**
	 * @param {es3fShaderCommonFunctionTests.Types} type
	 * @param {deRandom.Random} rnd
	 * @param {number} minValue
	 * @param {number} maxValue
	 * @return {number}
	 */
	es3fShaderCommonFunctionTests.randomScalar = function(type, rnd, minValue, maxValue) {
		switch(type) {
			case es3fShaderCommonFunctionTests.Types.FLOAT: return rnd.getFloat(minValue, maxValue);
			case es3fShaderCommonFunctionTests.Types.INT: return rnd.getInt(minValue, maxValue);
			case es3fShaderCommonFunctionTests.Types.UINT: return Math.abs(rnd.getInt(minValue, maxValue));
			default: throw new Error("Only FLOAT, INT, and UINT are supported.");
		}
	};

	/**
	 * @param {es3fShaderCommonFunctionTests.Types} type
	 * @param {Array<number>} size
	 * @param {deRandom.Random} rnd
	 * @param {Array<number>} minValue
	 * @param {Array<number>} maxValue
	 * @return {Array<number>}
	 */
	es3fShaderCommonFunctionTests.randomVector = function(type, size, rnd, minValue, maxValue) {
		/** @type {Array<number>} */ var res = [];
		for (var ndx = 0; ndx < size; ndx++)
			res.push(es3fShaderCommonFunctionTests.randomScalar(type, rnd, minValue[ndx], maxValue[ndx]));
		return res;
	};

	/**
	 * @param {es3fShaderCommonFunctionTests.Types} type
	 * @param {Array<number>} size
	 * @param {deRandom.Random} rnd
	 * @param {Array<number>} minValue
	 * @param {Array<number>} maxValue
	 * @param {number} numValues
	 * @param {number=} offset
	 * @return {Array<Array<number>>}
	 */
	es3fShaderCommonFunctionTests.fillRandomVectors = function(type, size, rnd, minValue, maxValue, numValues, offset) {
		offset = offset === undefined ? 0 : offset;
		/** @type {Array<Array<number>>} */ var access;
		for (var ndx = 0; ndx < numValues; ndx++)
			access[offset + ndx] = es3fShaderCommonFunctionTests.randomVector(type, size, rnd, minValue, maxValue);
		return access;
	};


	/**
	 * @param {es3fShaderCommonFunctionTests.Types} type
	 * @param {deRandom.Random} rnd
	 * @param {number} minValue
	 * @param {number} maxValue
	 * @param {number} numValues
	 * @param {number=} offset
	 * @return {Array<number>}
	 */
	es3fShaderCommonFunctionTests.fillRandomScalars = function(type, rnd, minValue, maxValue, numValues, offset) {
		offset = offset === undefined ? 0 : offset;
		/** @type {Array<number>} */ var access;
		for (var ndx = 0; ndx < numValues; ndx++)
			access[offset + ndx] = es3fShaderCommonFunctionTests.randomScalar(type, rnd, minValue, maxValue);
		return access;
	};

	/**
	 * @param {number} input
	 * @param {number} output
	 * @return {number}
	 */
	es3fShaderCommonFunctionTests.numBitsLostInOp = function(input, output) {
		/** @type {number} */ var inExp = tcuFloat.newFloat32(input).exponent();
		/** @type {number} */ var outExp = tcuFloat.newFloat32(output).exponent();
		return Math.max(0, inExp - outExp); // Lost due to mantissa shift.
	};

	/**
	 * @param {number} a
	 * @param {number} b
	 * @return {number}
	 */
	es3fShaderCommonFunctionTests.getUlpDiff = function(a, b) {
		/** @type {number} */ var aBits	= tcuFloat.newFloat32(a).bits();
		/** @type {number} */ var bBits	= tcuFloat.newFloat32(b).bits();
		return aBits > bBits ? aBits - bBits : bBits - aBits;
	};

	/**
	 * @param {number} a
	 * @param {number} b
	 * @return {number}
	 */
	es3fShaderCommonFunctionTests.getUlpDiffIgnoreZeroSign = function(a, b) {
		if (tcuFloat.newFloat32(a).isZero())
			return es3fShaderCommonFunctionTests.getUlpDiff(new tcuFloat.deFloat().construct(tcuFloat.newFloat32(b).sign(), 0, 0).getValue(), b);
		else if (tcuFloat.newFloat32(b).isZero())
			return es3fShaderCommonFunctionTests.getUlpDiff(a, new tcuFloat.deFloat().construct(tcuFloat.newFloat32(a).sign(), 0, 0).getValue());
		else
			return es3fShaderCommonFunctionTests.getUlpDiff(a, b);
	};

	/**
	 * @param {gluShaderUtil.precision} precision
	 * @return {boolean}
	 */
	es3fShaderCommonFunctionTests.supportsSignedZero = function(precision) {
		// \note GLSL ES 3.0 doesn't really require support for -0, but we require it for highp
		//		 as it is very widely supported.
		return precision == gluShaderUtil.precision.PRECISION_HIGHP;
	};

	/**
	 * @param {number} value
	 * @param {number} ulpDiff
	 * @return {number}
	 */
	es3fShaderCommonFunctionTests.getEpsFromMaxUlpDiff = function(value, ulpDiff) {
		/** @type {number} */ var exp = tcuFloat.newFloat32(value).exponent();
		return new tcuFloat.deFloat().construct(+1, exp, (1 << 23) | ulpDiff).getValue() - new tcuFloat.deFloat().construct(+1, exp, 1 << 23).getValue();
	};

	/**
	 * @param {number} numAccurateBits
	 * @return {number}
	 */
	es3fShaderCommonFunctionTests.getMaxUlpDiffFromBits = function(numAccurateBits) {
		/** @type {number} */ var numGarbageBits = 23 - numAccurateBits;
		/** @type {number} */ var mask = (1 << numGarbageBits) - 1;

		return mask;
	};

	/**
	 * @param {number} value
	 * @param {number} numAccurateBits
	 * @return {number}
	 */
	es3fShaderCommonFunctionTests.getEpsFromBits = function(value, numAccurateBits) {
		return es3fShaderCommonFunctionTests.getEpsFromMaxUlpDiff(value, es3fShaderCommonFunctionTests.getMaxUlpDiffFromBits(numAccurateBits));
	};

	/**
	 * @param {gluShaderUtil.precision} precision
	 * @return {number}
	 */
	es3fShaderCommonFunctionTests.getMinMantissaBits = function(precision) {
		/** @type {Array<number>} */ var bits = [
			7,		// lowp
			10,		// mediump
			23		// highp
		];

		assertMsgOptions(deMath.deInBounds32(precision, 0, bits.length), 'Unexpected precision option.', false, true);
		return bits[precision];
	}

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

            if ((!floatTypes && scalarType == gluShaderUtil.DataType.FLOAT) ||
                (!intTypes && scalarType == gluShaderUtil.DataType.INT) ||
                (!uintTypes && scalarType == gluShaderUtil.DataType.UINT))
                continue;

            for (var vecSize = 1; vecSize <= 4; vecSize++)
            for (var prec = gluShaderUtil.precision.PRECISION_LOWP; prec <= gluShaderUtil.precision.PRECISION_HIGHP; prec++)
            for (var shaderType = gluShaderProgram.shaderType.VERTEX; shaderType <= gluShaderProgram.shaderType.FRAGMENT; shaderType++)
                group.addChild(new testClass(gluShaderUtil.DataType[scalarType + vecSize - 1], gluShaderUtil.precision[prec], gluShaderProgram.shaderType[shaderType]));
        }
    };

    es3fShaderCommonFunctionTests.ShaderCommonFunctionTests.prototype.init = function() {
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
