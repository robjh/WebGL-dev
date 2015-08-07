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
goog.provide('functional.gles3.es3fShaderPackingFunctionTests');
goog.require('framework.common.tcuFloat');
goog.require('framework.common.tcuTestCase');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.delibs.debase.deRandom');
goog.require('framework.delibs.debase.deString');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.opengl.gluVarType');
goog.require('modules.shared.glsShaderExecUtil');



goog.scope(function() {
	var es3fShaderPackingFunctionTests = functional.gles3.es3fShaderPackingFunctionTests;
	var tcuFloat = framework.common.tcuFloat;
	var tcuTestCase = framework.common.tcuTestCase;
	var deMath = framework.delibs.debase.deMath;
	var deRandom = framework.delibs.debase.deRandom;
	var deString = framework.delibs.debase.deString;
	var gluShaderProgram = framework.opengl.gluShaderProgram;
	var gluShaderUtil = framework.opengl.gluShaderUtil;
	var gluVarType = framework.opengl.gluVarType;
	var glsShaderExecUtil = modules.shared.glsShaderExecUtil;
	/**
	 * @param {number} a
	 * @param {number} b
	 * @return {number}
	 */
	es3fShaderPackingFunctionTests.getUlpDiff = function(a, b) {
		/** @type {number} */ var aBits	= tcuFloat.newFloat32(a).bits();
		/** @type {number} */ var bBits	= tcuFloat.newFloat32(b).bits();
		return aBits > bBits ? aBits - bBits : bBits - aBits;
	};

	/**
	 * @struct
	 * @constructor
	 * @param {number} value_
	 */
	es3fShaderPackingFunctionTests.HexFloat = function(value_) {
		this.value = value_;
	};

	// TODO: implement
	// std::ostream& operator<< (std::ostream& str, const HexFloat& v)
	// {
	// 	return str << v.value << " / " << tcu::toHex(tcu::Float32(v.value).bitss());
	// }

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
	 * @param {string} name
	 * @param {string} description
	 * @param {gluShaderProgram.shaderType} shaderType
	 */
	es3fShaderPackingFunctionTests.ShaderPackingFunctionCase = function(name, description, shaderType) {
		tcuTestCase.DeqpTest.call(this, name, description);
		/** @type {gluShaderProgram.shaderType} */ this.m_shaderType = shaderType;
		/** @type {?glsShaderExecUtil.ShaderSpec} */ this.m_spec = new glsShaderExecUtil.ShaderSpec();
		/** @type {?glsShaderExecUtil.ShaderExecutor} */ this.m_executor = null;
	};

	es3fShaderPackingFunctionTests.ShaderPackingFunctionCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
	es3fShaderPackingFunctionTests.ShaderPackingFunctionCase.prototype.constructor = es3fShaderPackingFunctionTests.ShaderPackingFunctionCase;

	es3fShaderPackingFunctionTests.ShaderPackingFunctionCase.prototype.init = function() {
		assertMsgOptions(!this.m_executor, 'Error: Executor is not null.', false, true);
		this.m_executor = glsShaderExecUtil.createExecutor(this.m_shaderType, this.m_spec);
		if (!this.m_executor.isOk())
			throw new Error("Compile failed");
	};

	es3fShaderPackingFunctionTests.ShaderPackingFunctionCase.prototype.deinit = function() {
		this.m_executor = null;
	};

	/**
	 *	@param {gluShaderUtil.precision} precision
	 * @return {string}
	 */
	es3fShaderPackingFunctionTests.getPrecisionPostfix = function(precision) {
		/** @type {Array<string>} */ var s_postfix = [
			"_lowp",
			"_mediump",
			"_highp"
		];
		assertMsgOptions(0 <= precision && precision < s_postfix.length, 'Error: Out of range', false, true);
		return s_postfix[precision];
	};

	/**
	 *	@param {gluShaderProgram.shaderType} shaderType
	 * @return {string}
	 */
	es3fShaderPackingFunctionTests.getShaderTypePostfix = function(shaderType) {
		/** @type {Array<string>} */ var s_postfix = [
			"_vertex",
			"_fragment"
		];
		assertMsgOptions(0 <= shaderType && shaderType < s_postfix.length, 'Error Out of range', false, true);
		return s_postfix[shaderType];
	};

	/**
	 * @constructor
	 * @extends {es3fShaderPackingFunctionTests.ShaderPackingFunctionCase}
	 */
	es3fShaderPackingFunctionTests.PackSnorm2x16Case = function(shaderType, precision) {
		/** @const {string} */ var name = "packsnorm2x16" +
			es3fShaderPackingFunctionTests.getPrecisionPostfix(precision) +
			es3fShaderPackingFunctionTests.getShaderTypePostfix(shaderType);
		es3fShaderPackingFunctionTests.ShaderPackingFunctionCase.call(this, name, "packSnorm2x16", shaderType);
		this.m_precision = precision;

		this.m_spec.inputs.push(new glsShaderExecUtil.Symbol('in0', gluVarType.newTypeBasic(gluShaderUtil.DataType.FLOAT_VEC2, precision)));
		this.m_spec.outputs.push(new glsShaderExecUtil.Symbol('out0', gluVarType.newTypeBasic(gluShaderUtil.DataType.UINT, gluShaderUtil.precision.PRECISION_HIGHP)));
		this.m_spec.source = "out0 = packSnorm2x16(in0);";
	};

	es3fShaderPackingFunctionTests.PackSnorm2x16Case.prototype = Object.create(es3fShaderPackingFunctionTests.ShaderPackingFunctionCase.prototype);
	es3fShaderPackingFunctionTests.PackSnorm2x16Case.prototype.constructor = es3fShaderPackingFunctionTests.PackSnorm2x16Case;

	/**
	 * @return {tcuTestCase.IterateResult}
	 */
	es3fShaderPackingFunctionTests.PackSnorm2x16Case.prototype.iterate = function() {
		/** @type {deRandom.Random} */ var rnd = new deRandom.Random(deString.deStringHash(this.name) ^ 0x776002);
		/** @type {Array<Array<number>>} */ var inputs = [];
		/** @type {Array<number>} */ var outputs = [];
		/** @type {number} */ var maxDiff = this.m_precision == gluShaderUtil.precision.PRECISION_HIGHP ? 1 : // Rounding only.
											this.m_precision == gluShaderUtil.precision.PRECISION_MEDIUMP ? 33 : // (2^-10) * (2^15) + 1
											this.m_precision == gluShaderUtil.precision.PRECISION_LOWP ? 129 : 0; // (2^-8) * (2^15) + 1
		/** @type {number} */ var x;
		/** @type {number} */ var y;
		// Special values to check.
		inputs.push([0.0, 0.0]);
		inputs.push([-1.0, 1.0]);
		inputs.push([0.5, -0.5]);
		inputs.push([-1.5, 1.5]);
		inputs.push([0.25, -0.75]);

		// Random values, mostly in range.
		for (var ndx = 0; ndx < 15; ndx++) {
			x = rnd.getFloat() * 2.5 - 1.25;
			y = rnd.getFloat() * 2.5 - 1.25;
			inputs.push([x, y]);
		}

		// Large random values.
		for (var ndx = 0; ndx < 80; ndx++) {
			x = rnd.getFloat() * 1e6 - 0.5e6;
			y = rnd.getFloat() * 1e6 - 0.5e6;
			inputs.push([x, y]);
		}

		outputs.length = inputs.length;

		bufferedLogToConsole("Executing shader for " + inputs.length + " input values");

		this.m_executor.useProgram();
		outputs = this.m_executor.execute(inputs.length, inputs)[0];

		// Verify
		/** @type {number} */ var numValues = inputs.length;
		/** @type {number} */ var maxPrints = 10;
		/** @type {number} */ var numFailed = 0;

		for (var valNdx = 0; valNdx < numValues; valNdx++) {
			/** @type {number} */ var ref0 = deMath.clamp(Math.floor(deMath.clamp(inputs[valNdx][0], -1.0, 1.0) * 32767.0), -(1 << 15), (1 << 15) - 1);
			/** @type {number} */ var ref1 = deMath.clamp(Math.floor(deMath.clamp(inputs[valNdx][1], -1.0, 1.0) * 32767.0), -(1 << 15), (1 << 15) - 1);
			/** @type {number} */ var ref = (ref1 << 16) | ref0;
			/** @type {number} */ var res = outputs[valNdx];
			/** @type {number} */ var res0 = (res & 0xffff);
			/** @type {number} */ var res1 = (res >> 16);
			/** @type {number} */ var diff0 = Math.abs(ref0 - res0);
			/** @type {number} */ var diff1 = Math.abs(ref1 - res1);

			if (diff0 > maxDiff || diff1 > maxDiff) {
				if (numFailed < maxPrints) {
					bufferedLogToConsole(
						"ERROR: Mismatch in value " + valNdx +
						", expected packSnorm2x16(" + inputs[valNdx] + ") = " + ref + //tcu::toHex(ref)
						", got " + res + // tcu::toHex(res)
						"\n  diffs = (" + diff0 + ", " + diff1 + "), max diff = " + maxDiff);
				}
				else if (numFailed == maxPrints)
					bufferedLogToConsole("...");

				numFailed += 1;
			}
		}

		bufferedLogToConsole((numValues - numFailed) + " / " + numValues + " values passed");

		/** @type {boolean} */ var isOk = numFailed === 0;
		if (!isOk)
			testFailedOptions('Result comparison failed', false);
        else
            testPassedOptions('Pass', true);

		return tcuTestCase.IterateResult.STOP;
	};


	/**
	 * @constructor
	 * @extends {es3fShaderPackingFunctionTests.ShaderPackingFunctionCase}
	 */
	es3fShaderPackingFunctionTests.UnpackSnorm2x16Case = function(shaderType, precision) {
		/** @const {string} */ var name = "unpacksnorm2x16" + es3fShaderPackingFunctionTests.getShaderTypePostfix(shaderType);
		es3fShaderPackingFunctionTests.ShaderPackingFunctionCase.call(this, name, "unpackSnorm2x16", shaderType);
		this.m_precision = precision;

		this.m_spec.inputs.push(new glsShaderExecUtil.Symbol('in0', gluVarType.newTypeBasic(gluShaderUtil.DataType.UINT, gluShaderUtil.precision.PRECISION_HIGHP)));
		this.m_spec.outputs.push(new glsShaderExecUtil.Symbol('out0', gluVarType.newTypeBasic(gluShaderUtil.DataType.FLOAT_VEC2, gluShaderUtil.precision.PRECISION_HIGHP)));
		this.m_spec.source = "out0 = unpackSnorm2x16(in0);";
	};

	es3fShaderPackingFunctionTests.UnpackSnorm2x16Case.prototype = Object.create(es3fShaderPackingFunctionTests.ShaderPackingFunctionCase.prototype);
	es3fShaderPackingFunctionTests.UnpackSnorm2x16Case.prototype.constructor = es3fShaderPackingFunctionTests.UnpackSnorm2x16Case;

	/**
	 * @return {tcuTestCase.IterateResult}
	 */
	es3fShaderPackingFunctionTests.UnpackSnorm2x16Case.prototype.iterate = function() {
		/** @type {number} */ var maxDiff = 1; // Rounding error.
		/** @type {deRandom.Random} */ var rnd = new deRandom.Random(deString.deStringHash(this.name) ^ 0x776002);
		/** @type {Array<number>} */ var inputs = [];
		/** @type {Array<Array<number>>} */ var outputs = [];

		inputs.push(0x00000000);
		inputs.push(0x7fff8000);
		inputs.push(0x80007fff);
		inputs.push(0xffffffff);
		inputs.push(0x0001fffe);

		// Random values.
		for (var ndx = 0; ndx < 95; ndx++)
			inputs.push(rnd.getInt());

		outputs.length = inputs.length;

		bufferedLogToConsole("Executing shader for " + inputs.length + " input values");

		this.m_executor.useProgram();
		outputs = this.m_executor.execute(inputs.length, inputs)[0];

		// Verify
		/** @type {number} */ var numValues = inputs.length;
		/** @type {number} */ var maxPrints = 10;
		/** @type {number} */ var numFailed = 0;

		for (var valNdx = 0; valNdx < inputs.length; valNdx++) {
			/** @type {number} */ var in0 = Math.floor(inputs[valNdx] & 0xffff);
			/** @type {number} */ var in1 = Math.floor(inputs[valNdx] >> 16);
			/** @type {number} */ var ref0 = deMath.clamp(in0 / 32767., -1.0, 1.0);
			/** @type {number} */ var ref1 = deMath.clamp(in1 / 32767., -1.0, 1.0);
			/** @type {number} */ var res0 = outputs[valNdx][0];
			/** @type {number} */ var res1 = outputs[valNdx][1];

			/** @type {number} */ var diff0 = es3fShaderPackingFunctionTests.getUlpDiff(ref0, res0);
			/** @type {number} */ var diff1 = es3fShaderPackingFunctionTests.getUlpDiff(ref1, res1);

			if (diff0 > maxDiff || diff1 > maxDiff) {
				if (numFailed < maxPrints)
					bufferedLogToConsole("ERROR: Mismatch in value " + valNdx + ",\n" +
				    	"  expected unpackSnorm2x16(" + inputs[valNdx] /*tcu::toHex(inputs[valNdx])*/ + ") = " +
				    	"vec2(" + ref0 /*HexFloat(ref0)*/ + ", " + ref1 /*HexFloat(ref1)*/ + ")" +
				    	", got vec2(" + res0 /*HexFloat(res0)*/ + ", " + res1 /*HexFloat(res1)*/ + ")" +
				    	"\n  ULP diffs = (" + diff0 + ", " + diff1 + "), max diff = " + maxDiff);
				else if (numFailed == maxPrints)
					bufferedLogToConsole("...");

				numFailed += 1;
			}
		}

		bufferedLogToConsole((numValues - numFailed) + " / " + numValues + " values passed");

		/** @type {boolean} */ var isOk = numFailed === 0;
		if (!isOk)
			testFailedOptions('Result comparison failed', false);
		else
			testPassedOptions('Pass', true);

		return tcuTestCase.IterateResult.STOP;
	};

	/**
	 * @constructor
	 * @extends {es3fShaderPackingFunctionTests.ShaderPackingFunctionCase}
	 */
	es3fShaderPackingFunctionTests.PackUnorm2x16Case = function(shaderType, precision) {
		/** @const {string} */ var name = "packunorm2x16" +
		 	es3fShaderPackingFunctionTests.getPrecisionPostfix(precision) +
			es3fShaderPackingFunctionTests.getShaderTypePostfix(shaderType);
		es3fShaderPackingFunctionTests.ShaderPackingFunctionCase.call(this, name, "packUnorm2x16", shaderType);
		this.m_precision = precision;

		this.m_spec.inputs.push(new glsShaderExecUtil.Symbol('in0', gluVarType.newTypeBasic(gluShaderUtil.DataType.FLOAT_VEC2, precision)));
		this.m_spec.outputs.push(new glsShaderExecUtil.Symbol('out0', gluVarType.newTypeBasic(gluShaderUtil.DataType.UINT, gluShaderUtil.precision.PRECISION_HIGHP)));
		this.m_spec.source = "out0 = packUnorm2x16(in0);";
	};

	es3fShaderPackingFunctionTests.PackUnorm2x16Case.prototype = Object.create(es3fShaderPackingFunctionTests.ShaderPackingFunctionCase.prototype);
	es3fShaderPackingFunctionTests.PackUnorm2x16Case.prototype.constructor = es3fShaderPackingFunctionTests.PackUnorm2x16Case;

	/**
	 * @return {tcuTestCase.IterateResult}
	 */
	es3fShaderPackingFunctionTests.PackUnorm2x16Case.prototype.iterate = function() {
		/** @type {deRandom.Random} */ var rnd = new deRandom.Random(deString.deStringHash(this.name) ^ 0x776002);
		/** @type {Array<Array<number>>} */ var inputs;
		/** @type {Array<number>} */ var outputs;
		/** @type {number} */ var maxDiff = this.m_precision == gluShaderUtil.precision.PRECISION_HIGHP ? 1 : // Rounding only.
											this.m_precision == gluShaderUtil.precision.PRECISION_MEDIUMP ? 65 : // (2^-10) * (2^16) + 1
											this.m_precision == gluShaderUtil.precision.PRECISION_LOWP ? 257 : 0; // (2^-8) * (2^16) + 1
		/** @type {number} */ var x;
		/** @type {number} */ var y;
		// Special values to check.
		inputs.push([0.0, 0.0]);
		inputs.push([0.5, 1.0]);
		inputs.push([1.0, 0.5]);
		inputs.push([-0.5, 1.5]);
		inputs.push([0.25, 0.75]);

		// Random values, mostly in range.
		for (var ndx = 0; ndx < 15; ndx++) {
			x = rnd.getFloat() * 1.25;
			y = rnd.getFloat() * 1.25;
			inputs.push([x, y]);
		}

		// Large random values.
		for (var ndx = 0; ndx < 80; ndx++) {
			x = rnd.getFloat() * 1e6 - 1e5;
			y = rnd.getFloat() * 1e6 - 1e5;
			inputs.push([x, y]);
		}

		outputs.length = inputs.length;

		bufferedLogToConsole("Executing shader for " + inputs.length + " input values");

		this.m_executor.useProgram();
		outputs = this.m_executor.execute(inputs.length, inputs);

		// Verify
		/** @type {number} */ var numValues = inputs.length;
		/** @type {number} */ var maxPrints = 10;
		/** @type {number} */ var numFailed = 0;

		for (var valNdx = 0; valNdx < inputs.length; valNdx++) {
			/** @type {number} */ var ref0 = deMath.clamp(Math.floor(deMath.clamp(inputs[valNdx][0], 0.0, 1.0) * 65535.0), 0, (1 << 16) - 1);
			/** @type {number} */ var ref1 = deMath.clamp(Math.floor(deMath.clamp(inputs[valNdx][1], 0.0, 1.0) * 65535.0), 0, (1 << 16) - 1);
			/** @type {number} */ var ref = (ref1 << 16) | ref0;
			/** @type {number} */ var res = outputs[valNdx];
			/** @type {number} */ var res0 = (res & 0xffff);
			/** @type {number} */ var res1 = (res >> 16);
			/** @type {number} */ var diff0 = Math.abs(ref0 - res0);
			/** @type {number} */ var diff1 = Math.abs(ref1 - res1);

			if (diff0 > maxDiff || diff1 > maxDiff) {
				if (numFailed < maxPrints)
					bufferedLogToConsole("ERROR: Mismatch in value " + valNdx +
										 ", expected packUnorm2x16(" + inputs[valNdx] + ") = " + ref /*tcu::toHex(ref)*/ +
										 ", got " + res /*tcu::toHex(res)*/ +
										 "\n  diffs = (" + diff0 + ", " + diff1 + "), max diff = " + maxDiff);
				else if (numFailed === maxPrints)
					bufferedLogToConsole("...");

				numFailed += 1;
			}
		}

		bufferedLogToConsole((numValues - numFailed) + " / " + numValues + " values passed");

		/** @type {boolean} */ var isOk = numFailed === 0;
		if (!isOk)
			testFailedOptions('Result comparison failed', false);
		else
			testPassedOptions('Pass', true);

		return tcuTestCase.IterateResult.STOP;
	};
// continue 439

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
	 */
	es3fShaderPackingFunctionTests.ShaderPackingFunctionTests = function() {
		tcuTestCase.DeqpTest.call(this, "pack_unpack", "Floating-point pack and unpack function tests");
	};

	es3fShaderPackingFunctionTests.ShaderPackingFunctionTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
	es3fShaderPackingFunctionTests.ShaderPackingFunctionTests.prototype.constructor = es3fShaderPackingFunctionTests.ShaderPackingFunctionTests;

	es3fShaderPackingFunctionTests.ShaderPackingFunctionTests.prototype.init = function() {
		var testGroup = tcuTestCase.runner.testCases;
		testGroup.addChild(new es3fShaderPackingFunctionTests.PackSnorm2x16Case(gluShaderProgram.shaderType.VERTEX, gluShaderUtil.precision.PRECISION_LOWP));
		testGroup.addChild(new es3fShaderPackingFunctionTests.PackSnorm2x16Case(gluShaderProgram.shaderType.FRAGMENT, gluShaderUtil.precision.PRECISION_LOWP));
		testGroup.addChild(new es3fShaderPackingFunctionTests.PackSnorm2x16Case(gluShaderProgram.shaderType.VERTEX, gluShaderUtil.precision.PRECISION_MEDIUMP));
		testGroup.addChild(new es3fShaderPackingFunctionTests.PackSnorm2x16Case(gluShaderProgram.shaderType.FRAGMENT, gluShaderUtil.precision.PRECISION_MEDIUMP));
		testGroup.addChild(new es3fShaderPackingFunctionTests.PackSnorm2x16Case(gluShaderProgram.shaderType.VERTEX, gluShaderUtil.precision.PRECISION_HIGHP));
		testGroup.addChild(new es3fShaderPackingFunctionTests.PackSnorm2x16Case(gluShaderProgram.shaderType.FRAGMENT, gluShaderUtil.precision.PRECISION_HIGHP));

		testGroup.addChild(new es3fShaderPackingFunctionTests.UnpackSnorm2x16Case(gluShaderProgram.shaderType.VERTEX));
		testGroup.addChild(new es3fShaderPackingFunctionTests.UnpackSnorm2x16Case(gluShaderProgram.shaderType.FRAGMENT));

		testGroup.addChild(new es3fShaderPackingFunctionTests.PackUnorm2x16Case(gluShaderProgram.shaderType.VERTEX, gluShaderUtil.precision.PRECISION_LOWP));
		testGroup.addChild(new es3fShaderPackingFunctionTests.PackUnorm2x16Case(gluShaderProgram.shaderType.FRAGMENT, gluShaderUtil.precision.PRECISION_LOWP));
		testGroup.addChild(new es3fShaderPackingFunctionTests.PackUnorm2x16Case(gluShaderProgram.shaderType.VERTEX, gluShaderUtil.precision.PRECISION_MEDIUMP));
		testGroup.addChild(new es3fShaderPackingFunctionTests.PackUnorm2x16Case(gluShaderProgram.shaderType.FRAGMENT, gluShaderUtil.precision.PRECISION_MEDIUMP));
		testGroup.addChild(new es3fShaderPackingFunctionTests.PackUnorm2x16Case(gluShaderProgram.shaderType.VERTEX, gluShaderUtil.precision.PRECISION_HIGHP));
		testGroup.addChild(new es3fShaderPackingFunctionTests.PackUnorm2x16Case(gluShaderProgram.shaderType.FRAGMENT, gluShaderUtil.precision.PRECISION_HIGHP));
		//
		// testGroup.addChild(new es3fShaderPackingFunctionTests.UnpackUnorm2x16Case(gluShaderProgram.shaderType.VERTEX));
		// testGroup.addChild(new es3fShaderPackingFunctionTests.UnpackUnorm2x16Case(gluShaderProgram.shaderType.FRAGMENT));
		//
		// testGroup.addChild(new es3fShaderPackingFunctionTests.PackHalf2x16Case(gluShaderProgram.shaderType.VERTEX));
		// testGroup.addChild(new es3fShaderPackingFunctionTests.PackHalf2x16Case(gluShaderProgram.shaderType.FRAGMENT));
		//
		// testGroup.addChild(new es3fShaderPackingFunctionTests.UnpackHalf2x16Case(gluShaderProgram.shaderType.VERTEX));
		// testGroup.addChild(new es3fShaderPackingFunctionTests.UnpackHalf2x16Case(gluShaderProgram.shaderType.FRAGMENT));
	};

    /**
    * Run test
    * @param {WebGL2RenderingContext} context
    */
    es3fShaderPackingFunctionTests.run = function(context) {
    	gl = context;
    	//Set up Test Root parameters
    	var state = tcuTestCase.runner;
    	state.setRoot(new es3fShaderPackingFunctionTests.ShaderPackingFunctionTests());

    	//Set up name and description of this test series.
    	setCurrentTestName(state.testCases.fullName());
    	description(state.testCases.getDescription());

    	try {
    		//Run test cases
    		tcuTestCase.runTestCases();
    	}
    	catch (err) {
    		testFailedOptions('Failed to es3fShaderPackingFunctionTests.run tests', false);
    		tcuTestCase.runner.terminate();
    	}
    };

});
