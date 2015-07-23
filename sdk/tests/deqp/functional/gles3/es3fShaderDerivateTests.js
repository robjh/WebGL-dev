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
goog.provide('functional.gles3.es3fShaderDerivateTests');

goog.scope(function() {
	var es3fShaderDerivateTests = functional.gles3.es3fShaderDerivateTests;
	var tcuTexture.ConstPixelBufferAccess;
	var gluShaderUtil;
	var deMath;
	var tcuRGBA;
	var tcuMatrix;
	var tcuStringTemplate;
	var gluShaderProgram
	var deRandom;
	var tcuPixelFormat;

	/** @const {number} */ es3fShaderDerivateTests.VIEWPORT_WIDTH = 167,
	/** @const {number} */ es3fShaderDerivateTests.VIEWPORT_HEIGHT = 103,
	/** @const {number} */ es3fShaderDerivateTests.FBO_WIDTH = 99,
	/** @const {number} */ es3fShaderDerivateTests.FBO_HEIGHT = 133,
	/** @const {number} */ es3fShaderDerivateTests.MAX_FAILED_MESSAGES = 10
	/** @const {number} */ es3fShaderDerivateTests.INTERPOLATION_LOST_BITS = 3, // number mantissa of bits allowed to be lost in varying interpolation
	/**
	 * @enum {number}
	 */
	es3fShaderDerivateTests.DerivateFunc = {
		DFDX: 0,
		DFDY: 1,
		FWIDTH: 2
	};

	/**
	 * @enum {number}
	 */
	es3fShaderDerivateTests.SurfaceType = {
		DEFAULT_FRAMEBUFFER: 0,
		UNORM_FBO: 1,
		FLOAT_FBO: 2  // \note Uses RGBA32UI fbo actually, since FP rendertargets are not in core spec.
	};

	/**
	 * @enum {number}
	 */
	es3fShaderDerivateTests.VerificationLogging = {
		LOG_ALL: 0,
		LOG_NOTHING: 1
	};

	/**
	 * @constructor
	 * @param {WebGL2RenderingContext} gl_
	 */
	es3fShaderDerivateTests.AutoFbo = function(gl_) {
		/** @type {WebGL2RenderingContext} */ this.m_gl = gl_;
		/** @type {?WebGLFramebuffer} */ this.m_fbo = null;
	};

	es3fShaderDerivateTests.AutoFbo.prototype.deinit = function() {
		if (this.m_fbo) {
			this.m_gl.deleteFramebuffer(this.m_fbo);
			this.m_fbo = null;
		}
	};

	es3fShaderDerivateTests.AutoFbo.prototype.gen = function() {
		if (!this.m_fbo)
			this.m_fbo = this.m_gl.createFramebuffer();
	};

	/**
	 * @return {?WebGLFramebuffer}
	 */
	es3fShaderDerivateTests.AutoFbo.prototype.get = function() {
		return this.m_fbo;
	};

	/**
	 * @constructor
	 * @param {WebGL2RenderingContext} gl_
	 */
	es3fShaderDerivateTests.AutoRbo = function(gl_) {
		/** @type {WebGL2RenderingContext} */ this.m_gl = gl_;
		/** @type {?WebGLFramebuffer} */ this.m_rbo = null;
	};

	es3fShaderDerivateTests.AutoRbo.prototype.deinit = function() {
		if (this.m_rbo) {
			this.m_gl.deleteRenderbuffer(this.m_rbo);
			this.m_rbo = null;
		}
	};

	es3fShaderDerivateTests.AutoRbo.prototype.gen = function() {
		if (!this.m_rbo)
			this.m_rbo = this.m_gl.createRenderbuffer();
	};

	/**
	 * @return {?WebGLFramebuffer}
	 */
	es3fShaderDerivateTests.AutoRbo.prototype.get = function() {
		return this.m_rbo;
	};

	/**
	 * @param  {es3fShaderDerivateTests.DerivateFunc} function
	 * @return {string}
	 */
	es3fShaderDerivateTests.getDerivateFuncName = function(func) {
		switch (func) {
			case es3fShaderDerivateTests.DerivateFunc.DFDX: return "dFdx";
			case es3fShaderDerivateTests.DerivateFunc.DFDY: return "dFdy";
			case es3fShaderDerivateTests.DerivateFunc.FWIDTH: return "fwidth";
			default: throw new Error("Derivate Func not supported.");
		}
	};

	/**
	 * @param  {es3fShaderDerivateTests.DerivateFunc} function
	 * @return {string}
	 */
	es3fShaderDerivateTests.getDerivateFuncCaseName = function(func) {
		switch (func) {
			case es3fShaderDerivateTests.DerivateFunc.DFDX: return "dfdx";
			case es3fShaderDerivateTests.DerivateFunc.DFDY: return "dfdy";
			case es3fShaderDerivateTests.DerivateFunc.FWIDTH: return "fwidth";
			default: throw new Error("Derivate Func not supported.");
		}
	};

	/**
	 * @param  {gluShaderUtil.DataType} type
	 * @return {Array<boolean>}
	 */
	es3fShaderDerivateTests.getDerivateMask = function(type) {
		switch (type) {
			case gluShaderUtil.DataType.FLOAT: return [true, false, false, false];
			case gluShaderUtil.DataType.FLOAT_VEC2: return [true, true, false, false];
			case gluShaderUtil.DataType.FLOAT_VEC3: return [true, true, true, false];
			case gluShaderUtil.DataType.FLOAT_VEC4: return [true, true, true, true];
			default: throw new Error("Data Type not supported.");
		}
	};

	/**
	 * @param  {tcuTexture.ConstPixelBufferAccess} surface
	 * @param  {Array<number>} derivScale
	 * @param  {Array<number>} derivBias
	 * @param  {number} x
	 * @param  {number} y
	 * @return {Array<number>}
	 */
	es3fShaderDerivateTests.readDerivate = function(surface, derivScale, derivBias, x, y)	{
		return deMath.divide(deMath.subtract(surface.getPixel(x, y), derivBias), derivScale);
	};

	/**
	 * @param  {Array<number>} v
	 * @return {Array<number>}
	 */
    es3fShaderDerivateTests.getCompExpBits = function(v) {
		return [tcuFloat.newFloat32(v[0]).exponentBits(),
			tcuFloat.newFloat32(v[1]).exponentBits(),
			tcuFloat.newFloat32(v[2]).exponentBits(),
			tcuFloat.newFloat32(v[3]).exponentBits()];
	};

	/**
	 * @param  {number} value
	 * @param  {number} numAccurateBits
	 * @return {number}
	 */
	es3fShaderDerivateTests.computeFloatingPointError = function(value, numAccurateBits) 	{
		/** @type {number} */ var numGarbageBits = 23 - numAccurateBits;
		/** @type {number} */ var mask = (1 << numGarbageBits) - 1 ;
		/** @type {number} */ var exp = tcuFloat.newFloat32(value).exponent();

		return (new tcuFloat.deFloat()).construct(1, exp, (1 << 23) | mask).getValue() - (new tcuFloat.deFloat()).construct(1, exp, 1 << 23).getValue();
	};

	/**
  	 * @param  {gluShaderUtil.precision} precision
	 * @return {number}
	 */
	es3fShaderDerivateTests.getNumMantissaBits = function(precision) {
		switch (precision) {
			case gluShaderUtil.precision.PRECISION_HIGHP: return 23;
			case gluShaderUtil.precision.PRECISION_MEDIUMP: return 10;
			case gluShaderUtil.precision.PRECISION_LOWP: return 6;
			default:
				throw new Error('Precision not supported: ' + precision);
		}
	};

	/**
	 * @param  {gluShaderUtil.precision} precision
	 * @return {number}
	 */
	es3fShaderDerivateTests.getMinExponent = function(precision) {
		switch (precision) {
			case gluShaderUtil.precision.PRECISION_HIGHP: return -126;
			case gluShaderUtil.precision.PRECISION_MEDIUMP: return -14;
			case gluShaderUtil.precision.PRECISION_LOWP: return -8;
			default:
				throw new Error('Precision not supported: ' + precision);
		}
	};

	/**
	 * @param  {number} exp
	 * @param  {number} numMantissaBits
	 * @return {number}
	 */
	es3fShaderDerivateTests.getSingleULPForExponent = function(exp, numMantissaBits) {
		if (numMantissaBits > 0) {
			assertMsgOptions(numMantissaBits <= 23, 'numMantissaBits must be less or equal than 23.', false, true);

			/** @type {number} */ var ulpBitNdx = 23 - numMantissaBits;

			return (new tcuFloat.deFloat()).construct(1, exp, (1 << 23) | (1 << ulpBitNdx)).getValue() - (new tcuFloat.deFloat()).construct(1, exp, 1 << 23).getValue();
		}
		else {
			assertMsgOptions((numMantissaBits == 0, 'numMantissaBits must equal to 0.', false, true);
			return (new tcuFloat.deFloat()).construct(1, exp, (1 << 23)).getValue()
		}
	};

	/**
	 * @param  {number} value
	 * @param  {number} numMantissaBits
	 * @return {number}
	 */
	es3fShaderDerivateTests.getSingleULPForValue = function(value, numMantissaBits) {
		/** @type {number} */ var exp = (new tcuFloat.deFloat(value)).exponent();
		return es3fShaderDerivateTests.getSingleULPForExponent(exp, numMantissaBits);
	};

	/**
	 * @param  {number} value
	 * @param  {number} minExponent
	 * @param  {number} numAccurateBits
	 * @return {number}
	 */
	es3fShaderDerivateTests.convertFloorFlushToZero = function(value, minExponent, numAccurateBits) {
		if (value == 0.0) {
			return 0.0;
		}
		else {
			/** @type {tcuFloat.deFloat} */ var inputFloat = new tcuFloat.deFloat(value);
			/** @type {number} */ var numTruncatedBits = 23 - numAccurateBits;
			/** @type {number} */ var truncMask = (1 << numTruncatedBits) - 1;

			if (value > 0.0) {
				if (value > 0.0 && (new tcuFloat.deFloat(value)).exponent() < minExponent) {
					// flush to zero if possible
					return 0.0;
				}
				else {
					// just mask away non-representable bits
					return (new tcuFloat.deFloat).construct(1, inputFloat.exponent(), inputFloat.mantissa() & ~truncMask).getValue();
				}
			}
			else {
				if (inputFloat.mantissa() & truncMask) {
					// decrement one ulp if truncated bits are non-zero (i.e. if value is not representable)
					return (new tcuFloat.deFloat).construct(-1, inputFloat.exponent(), inputFloat.mantissa() & ~truncMask).getValue() - es3fShaderDerivateTests.getSingleULPForExponent(inputFloat.exponent(), numAccurateBits);
				}
				else {
					// value is representable, no need to do anything
					return value;
				}
			}
		}
	};

	/**
	 * @param  {number} value
	 * @param  {number} minExponent
	 * @param  {number} numAccurateBits
	 * @return {number}
	 */
	es3fShaderDerivateTests.convertCeilFlushToZero = function(value, minExponent, numAccurateBits) {
		return -es3fShaderDerivateTests.convertFloorFlushToZero(-value, minExponent, numAccurateBits);
	};

	/**
	 * @param  {number} value
	 * @param  {number} numUlps
	 * @param  {number} numMantissaBits
	 * @return {number}
	 */
	es3fShaderDerivateTests.addErrorUlp = function(value, numUlps, numMantissaBits) {
		return value + numUlps * es3fShaderDerivateTests.getSingleULPForValue(value, numMantissaBits);
	};

	/**
	 * @param  {gluShaderUtil.precision} precision
	 * @param  {Array<number>} valueMin
	 * @param  {Array<number>} valueMax
	 * @param  {Array<number>} expectedDerivate
	 * @return {Array<number>}
	 */
	es3fShaderDerivateTests.getDerivateThreshold = function(precision, valueMin, valueMax, expectedDerivate) {
		/** @type {number} */ var baseBits = es3fShaderDerivateTests.getNumMantissaBits(precision);
		/** @type {Aray<number>} */ var derivExp = es3fShaderDerivateTests.getCompExpBits(expectedDerivate);
		/** @type {Aray<number>} */ var maxValueExp = deMath.max(es3fShaderDerivateTests.getCompExpBits(valueMin), es3fShaderDerivateTests.getCompExpBits(valueMax));
		/** @type {Aray<number>} */ var numBitsLost = deMath.subtract(maxValueExp, deMath.min(maxValueExp, derivExp));
		/** @type {Aray<number>} */
		var numAccurateBits = deMath.max(
			deMath.addScalar(
				deMath.subtract(
					[baseBits, baseBits, baseBits, baseBits],
					numBitsLost.asInt()),
				-es3fShaderDerivateTests.INTERPOLATION_LOST_BITS),
			[0, 0, 0, 0]);

		return [es3fShaderDerivateTests.computeFloatingPointError(expectedDerivate[0], numAccurateBits[0]),
				es3fShaderDerivateTests.computeFloatingPointError(expectedDerivate[1], numAccurateBits[1]),
				es3fShaderDerivateTests.computeFloatingPointError(expectedDerivate[2], numAccurateBits[2]),
				es3fShaderDerivateTests.computeFloatingPointError(expectedDerivate[3], numAccurateBits[3])];
	};

	// /begin Might be able to get rid of this iff all appearances of LogVecComps()
	// are replaced by whatever the first argument is.
	/**
	 * @struct
	 * @param  {Array<number>} v_
	 * @param  {number} numComps_
	 */
	es3fShaderDerivateTests.LogVecComps = function(v_, numComps_) {
		/** @type {Array<number>} */ this.v = v_;
		/** @type {number} */ this.numComps = numComps_;
	};

	es3fShaderDerivateTests.LogVecComps.prototype.toString = function() {
		return this.v.toString();
	};
	// /end
    /**
	 * @param  {tcuTexture.ConstPixelBufferAccess} result
	 * @param  {tcuTexture.PixelBufferAccess} errorMask
	 * @param  {gluShaderUtil.DataType} dataType
	 * @param  {Array<number>} reference
	 * @param  {Array<number>} threshold
	 * @param  {Array<number>} scale
	 * @param  {Array<number>} bias
	 * @param  {es3fShaderDerivateTests.VerificationLogging=} logPolicy
	 * @return {boolean}
	 */
	es3fShaderDerivateTests.verifyConstantDerivate = function(result, errorMask, dataType, reference, threshold, scale, bias, logPolicy) {
		logPolicy = logPolicy === undefined ? es3fShaderDerivateTests.VerificationLogging.LOG_ALL : logPolicy;
		/** @type {number} */ var numComps = gluShaderUtil.getDataTypeFloatScalars(dataType);
		/** @type {Array<boolean>} */ var mask = deMath.logicalNotBool(es3fShaderDerivateTests.getDerivateMask(dataType));
		/** @type {number} */ var numFailedPixels = 0;

		if (logPolicy === es3fShaderDerivateTests.VerificationLogging.LOG_ALL)
			bufferedLogToConsole("Expecting " + reference + " with threshold " + threshold);

		for (var y = 0; y < result.getHeight(); y++) {
			for (var x = 0; x < result.getWidth(); x++) {
				/** @type {Array<number>} */ var resDerivate = es3fShaderDerivateTests.readDerivate(result, scale, bias, x, y);
				/** @type {boolean} */
				var isOk = deMath.boolAll(
					deMath.logicalOrBool(
						deMath.lessThanEqual(
							deMath.abs(reference - resDerivate),
							threshold),
						mask));

				if (!isOk) {
					if (numFailedPixels < es3fShaderDerivateTests.MAX_FAILED_MESSAGES && logPolicy === es3fShaderDerivateTests.VerificationLogging.LOG_ALL)
						bufferedLogToConsole("FAIL: got " + resDerivate + ", diff = " + deMath.abs(reference - resDerivate) + ", at x = " + x + ", y = " + y);
					numFailedPixels += 1;
					errorMask.setPixel(tcuRGBA.RGBA.red.toVec(), x, y);
				}
			}
		}

		if (numFailedPixels >= es3fShaderDerivateTests.MAX_FAILED_MESSAGES && logPolicy === es3fShaderDerivateTests.VerificationLogging.LOG_ALL)
			bufferedLogToConsole("...");

		if (numFailedPixels > 0 && logPolicy === es3fShaderDerivateTests.VerificationLogging.LOG_ALL)
			bufferedLogToConsole("FAIL: found " + numFailedPixels + " failed pixels");

		return numFailedPixels === 0;
	};

	/**
	 *      .-----.
	 *      | s_x |
	 *  M x | s_y |
	 *      | 1.0 |
	 *      '-----'
	 * @struct
	 */
	es3fShaderDerivateTests.Linear2DFunctionEvaluator = function() {
		/** @type {tcuMatrix.Matrix} */ this.matrix;
	};

	es3fShaderDerivateTests.Linear2DFunctionEvaluator.prototype.evaluateAt = function(screenX, screenY) {
		/** @type {Array<number>} */ var position = [screenX, screenY, 1.0];
		return tcuMatrix.multiplyMatVec(matrix, position);
	};

	/**
	 * @type {tcuTexture.ConstPixelBufferAccess} result
	 * @type {tcuTexture.PixelBufferAccess} errorMask
	 * @type {gluShaderUtil.DataType} dataType
	 * @type {gluShaderUtil.precision} precision
	 * @type {Array<number>} derivScale
	 * @type {Array<number>} derivBias
	 * @type {Array<number>} surfaceThreshold
	 * @type {es3fShaderDerivateTests.DerivateFunc} derivateFunc
	 * @type {es3fShaderDerivateTests.Linear2DFunctionEvaluator} func
	 * @return {boolean}
	 */
	es3fShaderDerivateTests.reverifyConstantDerivateWithFlushRelaxations = function(result, errorMask, dataType, precision, derivScale, derivBias, surfaceThreshold, derivateFunc, func) {
		DE_ASSERT(result.getWidth() == errorMask.getWidth());
		DE_ASSERT(result.getHeight() == errorMask.getHeight());
		DE_ASSERT(derivateFunc == es3fShaderDerivateTests.DerivateFunc.DFDX || derivateFunc == es3fShaderDerivateTests.DerivateFunc.DFDY);

		/** @type {Array<number>} */ var red = [255, 0, 0, 255];
		/** @type {Array<number>} */ var green = [0, 255, 0, 255];
		/** @type {number} */ var divisionErrorUlps = 2.5;

		/** @type {number} */ var numComponents = gluShaderUtil.getDataTypeFloatScalars(dataType);
		/** @type {number} */ var numBits = es3fShaderDerivateTests.getNumMantissaBits(precision);
		/** @type {number} */ var minExponent = es3fShaderDerivateTests.getMinExponent(precision);

		/** @type {number} */ var numVaryingSampleBits = numBits - es3fShaderDerivateTests.INTERPOLATION_LOST_BITS;
		/** @type {number} */ var numFailedPixels = 0;

		errorMask.clear(green);

		// search for failed pixels
		for (var y = 0; y < result.getHeight(); ++y)
		for (var x = 0; x < result.getWidth(); ++x) {
			//                 flushToZero?(f2z?(functionValueCurrent) - f2z?(functionValueBefore))
			// flushToZero? ( ------------------------------------------------------------------------ +- 2.5 ULP )
			//                                                  dx

			/** @type {Array<number>} */ var resultDerivative = readDerivate(result, derivScale, derivBias, x, y);

			// sample at the front of the back pixel and the back of the front pixel to cover the whole area of
			// legal sample positions. In general case this is NOT OK, but we know that the target funtion is
			// (mostly*) linear which allows us to take the sample points at arbitrary points. This gets us the
			// maximum difference possible in exponents which are used in error bound calculations.
			// * non-linearity may happen around zero or with very high function values due to subnorms not
			//   behaving well.
			/** @type {Array<number>} */ var functionValueForward = (derivateFunc == es3fShaderDerivateTests.DerivateFunc.DFDX) ?
														(func.evaluateAt(x + 2.0, y + 0.5)) :
														(func.evaluateAt(x + 0.5, y + 2.0));
			/** @type {Array<number>} */ var functionValueBackward = (derivateFunc == es3fShaderDerivateTests.DerivateFunc.DFDX) ?
														(func.evaluateAt(x - 1.0, y + 0.5)) :
														(func.evaluateAt(x + 0.5, y - 1.0));

			/** @type {boolean} */ var anyComponentFailed = false;

			// check components separately
			for (var c = 0; c < numComponents; ++c) {
				// interpolation value range
				// TODO: tcuInterval is WIP; the following line needs to be uncommented once it is finished
				// /** @type {tcuInterval.Interval} */ var forwardComponent = new tcuInteral.Interval(es3fShaderDerivateTests.convertFloorFlushToZero(functionValueForward[c], minExponent, numVaryingSampleBits),
				// 											 es3fShaderDerivateTests.convertCeilFlushToZero(functionValueForward[c], minExponent, numVaryingSampleBits));
				//
				// /** @type {tcuInterval.Interval} */ var backwardComponent = new tcuInteral.Interval(es3fShaderDerivateTests.convertFloorFlushToZero(functionValueBackward[c], minExponent, numVaryingSampleBits),
				// 											 es3fShaderDerivateTests.convertCeilFlushToZero(functionValueBackward[c], minExponent, numVaryingSampleBits));

				// /** @type {number} */
				// var maxValueExp = Math.max(
				// 		(new tcuFloat.deFloat(forwardComponent.lo())).exponent(),
				// 		(new tcuFloat.deFloat(forwardComponent.hi())).exponent(),
				// 		(new tcuFloat.deFloat(backwardComponent.lo())).exponent(),
				// 		(new tcuFloat.deFloat(backwardComponent.hi())).exponent());

				// subtraction in nominator will likely cause a cancellation of the most
				// significant bits. Apply error bounds.
				// TODO: tcuInterval is WIP; the following line needs to be uncommented once it is finished
				// /** @type {tcuInterval.Interval} */ var nominator = (forwardComponent - backwardComponent);
				/** @type {number} */ var nominatorLoExp = (new tcuFloat.deFloat(nominator.lo())).exponent();
				/** @type {number} */ var nominatorHiExp = (new tcuFloat.deFloat(nominator.hi())).exponent();
				/** @type {number} */ var nominatorLoBitsLost = maxValueExp - nominatorLoExp;
				/** @type {number} */ var nominatorHiBitsLost = maxValueExp - nominatorHiExp;
				/** @type {number} */ var nominatorLoBits = Math.max(0, numBits - nominatorLoBitsLost);
				/** @type {number} */ var nominatorHiBits = Math.max(0, numBits - nominatorHiBitsLost);

				// TODO: tcuInterval is WIP; the following lines needs to be uncommented once it is finished
				// /** @type {tcuInterval.Interval} */ var nominatorRange (convertFloorFlushToZero(nominator.lo(), minExponent, nominatorLoBits),
				// 											 convertCeilFlushToZero(nominator.hi(), minExponent, nominatorHiBits));
				//
				// /** @type {tcuInterval.Interval} */ var divisionRange = nominatorRange / 3.0f; // legal sample area is anywhere within this and neighboring pixels (i.e. size = 3)
				// /** @type {tcuInterval.Interval} */ var divisionResultRange (convertFloorFlushToZero(addErrorUlp(divisionRange.lo(), -divisionErrorUlps, numBits), minExponent, numBits),
				// 											 convertCeilFlushToZero(addErrorUlp(divisionRange.hi(), +divisionErrorUlps, numBits), minExponent, numBits));
				// /** @type {tcuInterval.Interval} */ var finalResultRange (divisionResultRange.lo() - surfaceThreshold[c], divisionResultRange.hi() + surfaceThreshold[c]);

				if (resultDerivative[c] >= finalResultRange.lo() && resultDerivative[c] <= finalResultRange.hi()) {
					// value ok
				}
				else {
					if (numFailedPixels < es3fShaderDerivateTests.MAX_FAILED_MESSAGES)
						bufferedLogToConsole("Error in pixel at " + x + ", " + y + " with component " + c + " (channel " + ("rgba"[c]) + ")\n" +
							"\tGot pixel value " + result.getPixelInt(x, y) + "\n" +
							"\t\tdFd" + ((derivateFunc == es3fShaderDerivateTests.DerivateFunc.DFDX) ? ('x') : ('y')) + " ~= " + resultDerivative[c] + "\n" +
							"\t\tdifference to a valid range: " +
							((resultDerivative[c] < finalResultRange.lo()) ? ("-") : ("+")) +
							((resultDerivative[c] < finalResultRange.lo()) ? (finalResultRange.lo() - resultDerivative[c]) : (resultDerivative[c] - finalResultRange.hi())) +
							"\n" +
							"\tDerivative value range:\n" +
							"\t\tMin: " + finalResultRange.lo() + "\n" +
							"\t\tMax: " + finalResultRange.hi() + "\n")

					++numFailedPixels;
					anyComponentFailed = true;
				}
			}

			if (anyComponentFailed)
				errorMask.setPixel(red, x, y);
		}

		if (numFailedPixels >= es3fShaderDerivateTests.MAX_FAILED_MESSAGES)
			bufferedLogToConsole("...");

		if (numFailedPixels > 0)
			bufferedLogToConsole("FAIL: found " + numFailedPixels + " failed pixels");

		return numFailedPixels === 0;
	};

	/**
	 * @constructor
	 * @extends {tes3TestCase} // TODO: tes3TestCase?
	 * @param {string} name
	 * @param {string} description
	 */
	es3fShaderDerivateTests.TriangleDerivateCase = function(name, description) {
		// TODO:
		// tes3TestCase.TestCase.call(this, name, description);
		/** @type {gluShaderUtil.DataType} */ this.m_dataType = null;
		/** @type {gluShaderUtil.precision} */ this.m_precision = null;

		/** @type {gluShaderUtil.DataType} */ this.m_coordDataType = null;
		/** @type {gluShaderUtil.precision} */ this.m_coordPrecision = null;

		/** @type {string} */ this.m_fragmentSrc;

		/** @type {Array<number>} */ this.m_coordMin = [];
		/** @type {Array<number>} */ this.m_coordMax = [];
		/** @type {Array<number>} */ this.m_derivScale = [];
		/** @type {Array<number>} */ this.m_derivBias = [];

		/** @type {es3fShaderDerivateTests.SurfaceType} */ this.m_surfaceType = es3fShaderDerivateTests.SurfaceType.DEFAULT_FRAMEBUFFER;
		/** @type {number} */ this.m_numSamples = 0;
		/** @type {number} */ this.m_hint = gl.DONT_CARE;

		assertMsgOptions(this.m_surfaceType !== es3fShaderDerivateTests.SurfaceType.DEFAULT_FRAMEBUFFER || this.m_numSamples == 0, '');
	};

	es3fShaderDerivateTests.TriangleDerivateCase.prototype.deinit = function() {};

	/**
	 * @param {gluShaderUtil.DataType} coordType
	 * @param {gluShaderUtil.precision} precision
	 * @return {string}
	 */
	es3fShaderDerivateTests.genVertexSource = function(coordType, precision) {
		assertMsgOptions(gluShaderUtil.isDataTypeFloatOrVec(coordType), 'Coord Type not supported', false, true);

		/** @type {string} */ vertexTmpl = '' +
			'#version 300 es\n' +
			'in highp vec4 a_position;\n' +
			'in ${PRECISION} ${DATATYPE} a_coord;\n' +
			'out ${PRECISION} ${DATATYPE} v_coord;\n' +
			'void main (void)\n' +
			'{\n' +
			'	gl_Position = a_position;\n' +
			'	v_coord = a_coord;\n' +
			'}\n';

		/** @type {Object} */ vertexParams = {};

		vertexParams["PRECISION"] = gluShaderUtil.getPrecisionName(precision);
		vertexParams["DATATYPE"] = gluShaderUtil.getDataTypeName(coordType);

		return tcuStringTemplate.specialize(vertexTmpl, vertexParams);
	};

	/**
	 * @return {Array<number>}
	 */
	es3fShaderDerivateTests.TriangleDerivateCase.prototype.getViewportSize = function() {
		if (this.m_surfaceType === es3fShaderDerivateTests.SurfaceType.DEFAULT_FRAMEBUFFER) {
			/** @type {number} */ var width = Math.min(gl.drawingBufferWidth, es3fShaderDerivateTests.VIEWPORT_WIDTH);
			/** @type {number} */ var height = Math.min(gl.drawingBufferHeight, es3fShaderDerivateTests.VIEWPORT_HEIGHT);
			return [width, height];
		}
		else
			return [es3fShaderDerivateTests.FBO_WIDTH, es3fShaderDerivateTests.FBO_HEIGHT];
	};

	/**
	 * @return {tcuTestCase.IterateResult}
	 */
	es3fShaderDerivateTests.TriangleDerivateCase.prototype.iterate = function() {
		/** @type {gluShaderProgram.ShaderProgram} */ var program = new gluShaderProgram.ShaderProgram(gl, gluShaderProgram.makeVtxFragSources(es3fShaderDerivateTests.genVertexSource(this.m_coordDataType, this.m_coordPrecision), this.m_fragmentSrc));
		/** @type {deRandom.Random} */ var rnd = new deRandom.Random(deString.deStringHash(this.name) ^ 0xbbc24);
		/** @type {boolean} */ var useFbo = this.m_surfaceType != es3fShaderDerivateTests.SurfaceType.DEFAULT_FRAMEBUFFER;
		/** @type {number} */ var fboFormat = this.m_surfaceType == es3fShaderDerivateTests.SurfaceType.FLOAT_FBO ? gl.RGBA32UI : gl.RGBA8;
		/** @type {Array<number>} */ var viewportSize = es3fShaderDerivateTests.getViewportSize();
		/** @type {number} */ var viewportX = useFbo ? 0 : rnd.getInt(0, gl.drawingBufferWidth - viewportSize[0]);
		/** @type {number} */ var viewportY = useFbo ? 0 : rnd.getInt(0, gl.drawingBufferHeight - viewportSize[1]);
		/** @type {es3fShaderDerivateTests.AutoFbo} */ var fbo = new es3fShaderDerivateTests.AutoFbo(gl);
		/** @type {es3fShaderDerivateTests.AutoRbo} */ var rbo = new es3fShaderDerivateTests.AutoRbo(gl);
		/** @type {tcuTexture.TextureLevel} */ var result;

		bufferedLogToConsole(program);

		if (!program.isOk())
			assertMsgOptions(false, 'Compile failed', false, true);

		if (useFbo) {
			bufferedLogToConsole("Rendering to FBO, format = " + /*glu::getPixelFormatStr(*/fboFormat/*)*/ + ", samples = " + this.m_numSamples);

			fbo.gen();
			rbo.gen();

			gl.bindRenderbuffer(gl.RENDERBUFFER, rbo.get());
			gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this.m_numSamples, fboFormat, viewportSize[0], viewportSize[1]);
			gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.get());
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbo.get());
			// TODO: line below this
			//TCU_CHECK(gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE);
		}
		else
		{
			/** @type {tcuPixelFormat.PixelFormat} */ var pixelFormat = tcuPixelFormat.PixelFormatFromContext(gl);

			m_testCtx.getLog()
				<< TestLog::Message
				<< "Rendering to default framebuffer\n"
				<< "\tColor depth: R=" << pixelFormat.redBits << ", G=" << pixelFormat.greenBits << ", B=" << pixelFormat.blueBits << ", A=" << pixelFormat.alphaBits
				<< TestLog::EndMessage;
		}

		m_testCtx.getLog() << TestLog::Message << "in: " << m_coordMin << " -> " << m_coordMax << "\n"
											   << "v_coord.x = in.x * x\n"
											   << "v_coord.y = in.y * y\n"
											   << "v_coord.z = in.z * (x+y)/2\n"
											   << "v_coord.w = in.w * (1 - (x+y)/2)\n"
						   << TestLog::EndMessage
						   << TestLog::Message << "u_scale: " << m_derivScale << ", u_bias: " << m_derivBias << " (displayed values have scale/bias removed)" << TestLog::EndMessage
						   << TestLog::Message << "Viewport: " << viewportSize.x() << "x" << viewportSize.y() << TestLog::EndMessage
						   << TestLog::Message << "GL_FRAGMENT_SHADER_DERIVATE_HINT: " << glu::getHintModeStr(m_hint) << TestLog::EndMessage;

		// Draw
		{
			const float positions[] =
			{
				-1.0f, -1.0f, 0.0f, 1.0f,
				-1.0f,  1.0f, 0.0f, 1.0f,
				 1.0f, -1.0f, 0.0f, 1.0f,
				 1.0f,  1.0f, 0.0f, 1.0f
			};
			const float coords[] =
			{
				m_coordMin.x(), m_coordMin.y(), m_coordMin.z(),							m_coordMax.w(),
				m_coordMin.x(), m_coordMax.y(), (m_coordMin.z()+m_coordMax.z())*0.5f,	(m_coordMin.w()+m_coordMax.w())*0.5f,
				m_coordMax.x(), m_coordMin.y(), (m_coordMin.z()+m_coordMax.z())*0.5f,	(m_coordMin.w()+m_coordMax.w())*0.5f,
				m_coordMax.x(), m_coordMax.y(), m_coordMax.z(),							m_coordMin.w()
			};
			const glu::VertexArrayBinding vertexArrays[] =
			{
				glu::va::Float("a_position",	4, 4, 0, &positions[0]),
				glu::va::Float("a_coord",		4, 4, 0, &coords[0])
			};
			const deUint16 indices[] = { 0, 2, 1, 2, 3, 1 };

			gl.clearColor(0.125f, 0.25f, 0.5f, 1.0f);
			gl.clear(GL_COLOR_BUFFER_BIT|GL_DEPTH_BUFFER_BIT|GL_STENCIL_BUFFER_BIT);
			gl.disable(GL_DITHER);

			gl.useProgram(program.getProgram());

			{
				const int	scaleLoc	= gl.getUniformLocation(program.getProgram(), "u_scale");
				const int	biasLoc		= gl.getUniformLocation(program.getProgram(), "u_bias");

				switch (m_dataType)
				{
					case glu::TYPE_FLOAT:
						gl.uniform1f(scaleLoc, m_derivScale.x());
						gl.uniform1f(biasLoc, m_derivBias.x());
						break;

					case glu::TYPE_FLOAT_VEC2:
						gl.uniform2fv(scaleLoc, 1, m_derivScale.getPtr());
						gl.uniform2fv(biasLoc, 1, m_derivBias.getPtr());
						break;

					case glu::TYPE_FLOAT_VEC3:
						gl.uniform3fv(scaleLoc, 1, m_derivScale.getPtr());
						gl.uniform3fv(biasLoc, 1, m_derivBias.getPtr());
						break;

					case glu::TYPE_FLOAT_VEC4:
						gl.uniform4fv(scaleLoc, 1, m_derivScale.getPtr());
						gl.uniform4fv(biasLoc, 1, m_derivBias.getPtr());
						break;

					default:
						DE_ASSERT(false);
				}
			}

			gls::setupDefaultUniforms(m_context.getRenderContext(), program.getProgram());
			setupRenderState(program.getProgram());

			gl.hint(GL_FRAGMENT_SHADER_DERIVATIVE_HINT, m_hint);
			GLU_EXPECT_NO_ERROR(gl.getError(), "Setup program state");

			gl.viewport(viewportX, viewportY, viewportSize.x(), viewportSize.y());
			glu::draw(m_context.getRenderContext(), program.getProgram(), DE_LENGTH_OF_ARRAY(vertexArrays), &vertexArrays[0],
					  glu::pr::Triangles(DE_LENGTH_OF_ARRAY(indices), &indices[0]));
			GLU_EXPECT_NO_ERROR(gl.getError(), "Draw");
		}

		// Read back results
		{
			const bool		isMSAA		= useFbo && m_numSamples > 0;
			AutoFbo			resFbo		(gl);
			AutoRbo			resRbo		(gl);

			// Resolve if necessary
			if (isMSAA)
			{
				resFbo.gen();
				resRbo.gen();

				gl.bindRenderbuffer(GL_RENDERBUFFER, *resRbo);
				gl.renderbufferStorageMultisample(GL_RENDERBUFFER, 0, fboFormat, viewportSize.x(), viewportSize.y());
				gl.bindFramebuffer(GL_DRAW_FRAMEBUFFER, *resFbo);
				gl.framebufferRenderbuffer(GL_DRAW_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_RENDERBUFFER, *resRbo);
				TCU_CHECK(gl.checkFramebufferStatus(GL_FRAMEBUFFER) == GL_FRAMEBUFFER_COMPLETE);

				gl.blitFramebuffer(0, 0, viewportSize.x(), viewportSize.y(), 0, 0, viewportSize.x(), viewportSize.y(), GL_COLOR_BUFFER_BIT, GL_NEAREST);
				GLU_EXPECT_NO_ERROR(gl.getError(), "Resolve blit");

				gl.bindFramebuffer(GL_READ_FRAMEBUFFER, *resFbo);
			}

			switch (m_surfaceType)
			{
				case SURFACETYPE_DEFAULT_FRAMEBUFFER:
				case SURFACETYPE_UNORM_FBO:
					result.setStorage(tcu::TextureFormat(tcu::TextureFormat::RGBA, tcu::TextureFormat::UNORM_INT8), viewportSize.x(), viewportSize.y());
					glu::readPixels(m_context.getRenderContext(), viewportX, viewportY, result);
					break;

				case SURFACETYPE_FLOAT_FBO:
				{
					const tcu::TextureFormat	dataFormat		(tcu::TextureFormat::RGBA, tcu::TextureFormat::FLOAT);
					const tcu::TextureFormat	transferFormat	(tcu::TextureFormat::RGBA, tcu::TextureFormat::UNSIGNED_INT32);

					result.setStorage(dataFormat, viewportSize.x(), viewportSize.y());
					glu::readPixels(m_context.getRenderContext(), viewportX, viewportY,
									tcu::PixelBufferAccess(transferFormat, result.getWidth(), result.getHeight(), result.getDepth(), result.getAccess().getDataPtr()));
					break;
				}

				default:
					DE_ASSERT(false);
			}

			GLU_EXPECT_NO_ERROR(gl.getError(), "Read pixels");
		}

		// Verify
		{
			tcu::Surface errorMask(result.getWidth(), result.getHeight());
			tcu::clear(errorMask.getAccess(), tcu::RGBA::green.toVec());

			const bool isOk = verify(result.getAccess(), errorMask.getAccess());

			m_testCtx.getLog() << TestLog::ImageSet("Result", "Result images")
							   << TestLog::Image("Rendered", "Rendered image", result);

			if (!isOk)
				m_testCtx.getLog() << TestLog::Image("ErrorMask", "Error mask", errorMask);

			m_testCtx.getLog() << TestLog::EndImageSet;

			m_testCtx.setTestResult(isOk ? QP_TEST_RESULT_PASS	: QP_TEST_RESULT_FAIL,
									isOk ? "Pass"				: "Image comparison failed");
		}

		return STOP;
	}

	/**
     * Run test
     * @param {WebGL2RenderingContext} context
     */
    es3fShaderDerivateTests.run = function(context) {
    	gl = context;
    	//Set up Test Root parameters
    	var state = tcuTestCase.runner;
    	state.setRoot(new es3fShaderDerivateTests.ShaderDerivateTests());

    	//Set up name and description of this test series.
    	setCurrentTestName(state.testCases.fullName());
    	description(state.testCases.getDescription());

    	try {
    		//Run test cases
    		tcuTestCase.runTestCases();
    	}
    	catch (err) {
    		testFailedOptions('Failed to es3fShaderDerivateTests.run tests', false);
    		tcuTestCase.runner.terminate();
    	}
    };

});
