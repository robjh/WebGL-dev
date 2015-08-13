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
goog.require('framework.delibs.debase.deMath');
goog.require('framework.delibs.debase.deRandom');
goog.require('framework.delibs.debase.deString');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.opengl.gluVarType');
goog.require('modules.shared.glsShaderExecUtil');
goog.scope(function() {
    var es3fShaderCommonFunctionTests = functional.gles3.es3fShaderCommonFunctionTests;
    var tcuFloat = framework.common.tcuFloat;
    var tcuTestCase = framework.common.tcuTestCase;
    var gluShaderProgram = framework.opengl.gluShaderProgram;
    var gluShaderUtil = framework.opengl.gluShaderUtil;
    var gluVarType = framework.opengl.gluVarType;
	var deRandom = framework.delibs.debase.deRandom;
	var deMath = framework.delibs.debase.deMath;
	var deString = framework.delibs.debase.deString;
	var glsShaderExecUtil = modules.shared.glsShaderExecUtil;

    /** @typedef {(es3fShaderCommonFunctionTests.AbsCase)} */ es3fShaderCommonFunctionTests.TestClass;

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
		/** @type {Array<number>} */ var access = [];
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
	 * @param {string} name
	 * @param {string} description
	 * @param {gluShaderProgram.shaderType} shaderType
	 */
	es3fShaderCommonFunctionTests.CommonFunctionCase = function(name, description, shaderType) {
		tcuTestCase.DeqpTest.call(this, name, description);
		/** @type {gluShaderProgram.shaderType} */ this.m_shaderType = shaderType;
		/** @type {number} */ this.m_numValues = 100;
		/** @type {glsShaderExecUtil.ShaderExecutor} */ this.m_executor = null;
		/** @type {glsShaderExecUtil.ShaderSpec} */ this.m_spec = new glsShaderExecUtil.ShaderSpec();
		this.m_spec.version = gluShaderUtil.GLSLVersion.V300_ES;
		/** @type {string} */ this.m_failMsg; //!< Comparison failure help message.
	};

	es3fShaderCommonFunctionTests.CommonFunctionCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
	es3fShaderCommonFunctionTests.CommonFunctionCase.prototype.constructor = es3fShaderCommonFunctionTests.CommonFunctionCase;

	es3fShaderCommonFunctionTests.CommonFunctionCase.prototype.init = function() {
		assertMsgOptions(!this.m_executor, "Shader executor should be null at this point", false, true);
		this.m_executor = glsShaderExecUtil.createExecutor(this.m_shaderType, this.m_spec);
		if (!this.m_executor.isOk())
			throw new Error("Compile failed");
	};

	es3fShaderCommonFunctionTests.CommonFunctionCase.prototype.deinit = function() {
		this.m_executor = null;
	};

	/**
	 * @param {Array<glsShaderExecUtil.Symbol>} symbols
	 * @return {Array<number>}
	 */
	es3fShaderCommonFunctionTests.getScalarSizes = function(symbols) {
		/** @type {Array<number>} */ var sizes = [];
		for (var ndx = 0; ndx < symbols.length; ++ndx)
			sizes.push(symbols[ndx].varType.getScalarSize());
		return sizes;
	};

	/**
	 * @param {Array<glsShaderExecUtil.Symbol>} symbols
	 * @return {number}
	 */
	es3fShaderCommonFunctionTests.computeTotalScalarSize = function(symbols) {
		/** @type {number} */ var totalSize = 0;
		for (var sym in symbols)
			totalSize += symbols[sym].varType.getScalarSize();
		return totalSize;
	};

	/**
	 * @param {Array<glsShaderExecUtil.Symbol>} symbols
	 * @param {ArrayBuffer} data
	 * @param {number} numValues
	 * @return {Array<*>}
	 */
	es3fShaderCommonFunctionTests.getInputOutputPointers = function(symbols, data, numValues) {
		/** @type {Array<goog.TypedArray>} */ var pointers = [];
		/** @type {number} */ var curScalarOffset	= 0;

		for (var varNdx = 0; varNdx < symbols.length; ++varNdx) {
			/** @type {glsShaderExecUtil.Symbol} */ var var_ = symbols[varNdx];
			/** @type {number} */ var scalarSize = var_.varType.getScalarSize();

			// Uses planar layout as input/output specs do not support strides.
			pointers[varNdx] = new ArrayBuffer(data, curScalarOffset);
			curScalarOffset += scalarSize * numValues;
		}

		assertMsgOptions(curScalarOffset === data.length, 'Size mismatch.', false, true);

		return pointers;
	};

	// HexFloat
	// HexBool
	// VarValue

	/**
	 * @return {tcuTestCase.IterateResult}
	 */
	es3fShaderCommonFunctionTests.CommonFunctionCase.prototype.iterate = function() {
		/** @type {number} */ var numInputScalars = es3fShaderCommonFunctionTests.computeTotalScalarSize(this.m_spec.inputs);
		/** @type {number} */ var numOutputScalars = es3fShaderCommonFunctionTests.computeTotalScalarSize(this.m_spec.outputs);
		/** @type {*} */ var inputData; // = new Uint32Array(numInputScalars * this.m_numValues);
		/** @type {*} */ var outputData; // = new Uint32Array(numInputScalars * this.m_numValues);

		// TODO: will attempt to implement this without input/output pointers. Commenting related code with tag [ptr]
		// /** @type {Array<*>} */ var inputPointers = es3fShaderCommonFunctionTests.getInputOutputPointers(this.m_spec.inputs, inputData, this.m_numValues); // TODO !!!!
		// /** @type {Array<*>} */ var outputPointers = es3fShaderCommonFunctionTests.getInputOutputPointers(this.m_spec.outputs, outputData, this.m_numValues); // TODO !!!!
debugger;
		// Initialize input data.
		// [ptr] this.getInputValues(this.m_numValues, inputPointers); // TODO !!!
		//          new Uint32Array(new Float32Array(this.getInputValues(this.m_numValues)).buffer); // this was yielding values more similar to the dEQP code
		inputData = new Uint32Array(this.getInputValues(this.m_numValues)); // TODO !!!

		// Execute shader.
		this.m_executor.useProgram();
		// [ptr] outputPointers = this.m_executor.execute(this.m_numValues, inputPointers);
		outputData = this.m_executor.execute(this.m_numValues, [inputData])[0];

		// Compare results.
		/** @type {Array<number>} */ var inScalarSizes = es3fShaderCommonFunctionTests.getScalarSizes(this.m_spec.inputs);
		/** @type {Array<number>} */ var outScalarSizes = es3fShaderCommonFunctionTests.getScalarSizes(this.m_spec.outputs);
		/** @type {Array<*>} */ var curInputPtr = [];
		/** @type {Array<*>} */ var curOutputPtr = [];
		/** @type {number} */ var numFailed = 0;

		for (var valNdx = 0; valNdx < this.m_numValues; valNdx++) {
			// Set up pointers for comparison.
			// [ptr]
			// for (var inNdx = 0; inNdx < curInputPtr.length; ++inNdx)
			// 	curInputPtr[inNdx] = (deUint32*)inputPointers[inNdx] + inScalarSizes[inNdx] * valNdx;
			//
			// for (int outNdx = 0; outNdx < curOutputPtr.length; ++outNdx)
			// 	curOutputPtr[outNdx] = (deUint32*)outputPointers[outNdx] + outScalarSizes[outNdx] * valNdx;
			for (var inNdx = 0; inNdx < this.m_spec.inputs.length; ++inNdx)
				curInputPtr[inNdx] = inputData[inNdx] + inScalarSizes[0] * valNdx;

			for (var outNdx = 0; outNdx < this.m_spec.outputs.length; ++outNdx)
				curOutputPtr[outNdx] = outputData[outNdx] + outScalarSizes[0] * valNdx;
debugger;
			// [ptr] if (!this.compare(&curInputPtr[0], &curOutputPtr[0])) {
			if (!this.compare([curInputPtr], [curOutputPtr])) {
				// \todo [2013-08-08 pyry] We probably want to log reference value as well?

				bufferedLogToConsole("ERROR: comparison failed for value " + valNdx + ":\n  " + this.m_failMsg);

				// [ptr]
				// bufferedLogToConsole("  inputs:");
				// for (var inNdx = 0; inNdx < curInputPtr.length; inNdx++)
				// 	bufferedLogToConsole("    " + this.m_spec.inputs[inNdx].name + " = " + this.m_spec.inputs[inNdx].varType + "  " + curInputPtr[inNdx]);
				// 	//<< VarValue(m_spec.inputs[inNdx].varType, curInputPtr[inNdx])
				//
				// bufferedLogToConsole("  outputs:");
				//
				// for (var outNdx = 0; outNdx < curOutputPtr.length; outNdx++)
				// 	bufferedLogToConsole("    " + this.m_spec.outputs[outNdx].name + " = " + this.m_spec.outputs[outNdx].varType + " " + curOutputPtr[outNdx]);
				// 	//<< VarValue(m_spec.outputs[outNdx].varType, curOutputPtr[outNdx])

				this.m_failMsg = ""
				numFailed += 1;
			}
		}

		bufferedLogToConsole((this.m_numValues - numFailed) + " / " + this.m_numValues + " values passed");

		/** @type {boolean} */ var isOk = numFailed === 0;

		if (!isOk)
			testFailedOptions('Result comparison failed', false);
		else
			testPassedOptions('Pass', true);

		return tcuTestCase.IterateResult.STOP;
	};

	/**
	 * @param {gluShaderUtil.precision} precision
	 * @return {string}
	 */
	es3fShaderCommonFunctionTests.getPrecisionPostfix = function(precision) {
		/** @type {Array<string>} */ var s_postfix = [
			'_lowp',
			'_mediump',
			'_highp'
		];
		assertMsgOptions(0 <= precision && precision < s_postfix.length, 'Error: Out of range', false, true);
		return s_postfix[precision];
	};

	/**
	 * @param {gluShaderProgram.shaderType} shaderType
	 * @return {string}
	 */
	es3fShaderCommonFunctionTests.getShaderTypePostfix = function(shaderType) {
		/** @type {Array<string>} */ var s_postfix = [
			'_vertex',
			'_fragment'
		];
		assertMsgOptions(0 <= shaderType && shaderType < s_postfix.length, 'Error Out of range', false, true);
		return s_postfix[shaderType];
	};

	/**
	 * @param {gluShaderUtil.DataType} baseType
	 * @param {gluShaderUtil.precision} precision
	 * @param {gluShaderProgram.shaderType} shaderType
	 * @return {string}
	 */
	es3fShaderCommonFunctionTests.getCommonFuncCaseName = function(baseType, precision, shaderType) {
		return gluShaderUtil.getDataTypeName(baseType) +
			es3fShaderCommonFunctionTests.getPrecisionPostfix(precision) +
			es3fShaderCommonFunctionTests.getShaderTypePostfix(shaderType);
	};

	/**
	 * @constructor
	 * @extends {es3fShaderCommonFunctionTests.CommonFunctionCase}
	 * @param {gluShaderUtil.DataType} baseType
	 * @param {gluShaderUtil.precision} precision
	 * @param {gluShaderProgram.shaderType} shaderType
	 */
	es3fShaderCommonFunctionTests.AbsCase = function(baseType, precision, shaderType) {
		es3fShaderCommonFunctionTests.CommonFunctionCase.call(this,
			es3fShaderCommonFunctionTests.getCommonFuncCaseName(baseType, precision, shaderType),
			'abs', shaderType);
		this.m_spec.inputs.push(new glsShaderExecUtil.Symbol('in0', gluVarType.newTypeBasic(baseType, precision)));
		this.m_spec.outputs.push(new glsShaderExecUtil.Symbol('out0', gluVarType.newTypeBasic(baseType, precision)));
		this.m_spec.source = 'out0 = abs(in0);';
	};

	es3fShaderCommonFunctionTests.AbsCase.prototype = Object.create(es3fShaderCommonFunctionTests.CommonFunctionCase.prototype);
	es3fShaderCommonFunctionTests.AbsCase.prototype.constructor = es3fShaderCommonFunctionTests.AbsCase;

	/**
	 * @param {number} numValues
	 * @return {*}
	 */
	es3fShaderCommonFunctionTests.AbsCase.prototype.getInputValues = function(numValues) {
		/** @type {Array<Array<number>>} */ var floatRanges = [
			[-2.0, 2.0], // lowp
			[-1e3, 1e3], // mediump
			[-1e7, 1e7] // highp
		];

		/** @type {Array<Array<number>>} */ var intRanges = [
			[-(1 << 7) + 1, (1 << 7) - 1],
			[-(1 << 15) + 1, (1 << 15) - 1],
			[0x80000001, 0x7fffffff]
		];

		/** @type {deRandom.Random} */ var rnd = new deRandom.Random(deString.deStringHash(this.name) ^ 0x235fac);

		/** @type {gluShaderUtil.DataType} */ var type = this.m_spec.inputs[0].varType.getBasicType();
		/** @type {gluShaderUtil.precision} */ var precision = this.m_spec.inputs[0].varType.getPrecision();
		/** @type {number} */ var scalarSize = gluShaderUtil.getDataTypeScalarSize(type);

		if (gluShaderUtil.isDataTypeFloatOrVec(type))
			return es3fShaderCommonFunctionTests.fillRandomScalars(es3fShaderCommonFunctionTests.Types.FLOAT, rnd, floatRanges[precision][0], floatRanges[precision][1], numValues * scalarSize);
		else
			return es3fShaderCommonFunctionTests.fillRandomScalars(es3fShaderCommonFunctionTests.Types.INT, rnd, intRanges[precision][0], intRanges[precision][1], numValues * scalarSize);
	};

	/**
	 * @param {*} inputs
	 * @param {*} outputs
	 * @return {boolean}
	 */
	es3fShaderCommonFunctionTests.AbsCase.prototype.compare = function(inputs, outputs) {
		/** @type {gluShaderUtil.DataType} */ var type = this.m_spec.inputs[0].varType.getBasicType();
		/** @type {gluShaderUtil.precision} */ var precision = this.m_spec.inputs[0].varType.getPrecision();
		/** @type {number} */ var scalarSize = gluShaderUtil.getDataTypeScalarSize(type);

		/** @type {number} */ var in0;
		/** @type {number} */ var out0;
		/** @type {number} */ var ref0;

		if (gluShaderUtil.isDataTypeFloatOrVec(type)) {
			/** @type {number} */ var mantissaBits = es3fShaderCommonFunctionTests.getMinMantissaBits(precision);
			/** @type {number} */ var maxUlpDiff = (1 << (23 - mantissaBits)) - 1;

			for (var compNdx = 0; compNdx < scalarSize; compNdx++) {
				in0 = inputs[0][compNdx];
				out0 = outputs[0][compNdx];
				ref0 = Math.abs(in0);
				/** @type {number} */ var ulpDiff0 = es3fShaderCommonFunctionTests.getUlpDiff(out0, ref0);

				if (ulpDiff0 > maxUlpDiff) {
					this.m_failMsg += "Expected [" + compNdx + "] = " + ref0 /*HexFloat(ref0)*/ + " with ULP threshold " + maxUlpDiff + ", got ULP diff " + ulpDiff0;
					return false;
				}
			}
		}
		else
			for (var compNdx = 0; compNdx < scalarSize; compNdx++) {
				in0 = inputs[0][compNdx];
				out0 = outputs[0][compNdx];
				ref0 = Math.abs(in0);

				if (out0 != ref0) {
					this.m_failMsg += "Expected [" + compNdx + "] = " + ref0;
					return false;
				}
			}

		return true;
	};

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
                group.addChild(new testClass(scalarType + vecSize - 1, prec, shaderType));
                // group.addChild(new testClass(gluShaderUtil.DataType[scalarType + vecSize - 1], gluShaderUtil.precision[prec], gluShaderProgram.shaderType[shaderType]));
        }
    };

    es3fShaderCommonFunctionTests.ShaderCommonFunctionTests.prototype.init = function() {
        var testGroup = tcuTestCase.runner.testCases;

        es3fShaderCommonFunctionTests.addFunctionCases(testGroup, es3fShaderCommonFunctionTests.AbsCase, 'abs', true, true, false);
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
        // /** @type {tcuTestCase.DeqpTest} */ var intGroup = tcuTestCase.newTest('intbitstofloat', 'intBitsToFloat() Tests');
        // /** @type {tcuTestCase.DeqpTest} */ var uintGroup = tcuTestCase.newTest('uintbitstofloat', 'uintBitsToFloat() Tests');
		//
        // testGroup.addChild(intGroup);
        // testGroup.addChild(uintGroup);
		//
        // for (var vecSize = 1; vecSize < 4; vecSize++) {
        //     /** @type {gluShaderUtil.DataType} */ var intType = vecSize > 1 ?
        //         gluShaderUtil.getDataTypeVector(gluShaderUtil.DataType.INT, vecSize) :
        //         gluShaderUtil.DataType.INT;
		//
        //     /** @type {gluShaderUtil.DataType} */ var uintType = vecSize > 1 ?
        //         gluShaderUtil.getDataTypeVector(gluShaderUtil.DataType.UINT, vecSize) :
        //         gluShaderUtil.DataType.UINT;
		//
        //     for (var shaderType = gluShaderProgram.shaderType.VERTEX; shaderType <= gluShaderProgram.shaderType.FRAGMENT; shaderType++) {
        //         // intGroup.addChild(new BitsToFloatCase(intType, gluShaderProgram.shaderType[shaderType]));
        //         // uintGroup.addChild(new BitsToFloatCase(uintType, gluShaderProgram.shaderType[shaderType]));
        //     }
        // }
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
