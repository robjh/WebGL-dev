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

	/** @const {number} */ es3fShaderDerivateTests.VIEWPORT_WIDTH = 167,
	/** @const {number} */ es3fShaderDerivateTests.VIEWPORT_HEIGHT = 103,
	/** @const {number} */ es3fShaderDerivateTests.FBO_WIDTH = 99,
	/** @const {number} */ es3fShaderDerivateTests.FBO_HEIGHT = 133,
	/** @const {number} */ es3fShaderDerivateTests.MAX_FAILED_MESSAGES = 10

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
	 * @constructor
	 * @param {WebGL2RenderingContext} gl_
	 */
	es3fShaderDerivateTests.AutoFbo = function(gl_) {
		/** @type {WebGL2RenderingContext} */ this.m_gl = gl_;
		/** @type {WebGLFramebuffer} */ this.m_fbo = null;
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
	 * @constructor
	 * @param {WebGL2RenderingContext} gl_
	 */
	es3fShaderDerivateTests.AutoRbo = function(gl_) {
		/** @type {WebGL2RenderingContext} */ this.m_gl = gl_;
		/** @type {WebGLFramebuffer} */ this.m_rbo = null;
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

		/** @type {tcuFloat.deFloat} */ var f1 = new tcuFloat.deFloat();
        /** @type {tcuFloat.deFloat} */ var f2 = new tcuFloat.deFloat();
		return f1.construct(1, exp, (1 << 23) | mask).getValue() - f2.construct(1, exp, 1 << 23).getValue();
	};

	//TODO IMPLEMENT
	// static int getNumMantissaBits (const glu::Precision precision) {
	// 	switch (precision)
	// 	{
	// 		case glu::PRECISION_HIGHP:		return 23;
	// 		case glu::PRECISION_MEDIUMP:	return 10;
	// 		case glu::PRECISION_LOWP:		return 6;
	// 		default:
	// 			DE_ASSERT(false);
	// 			return 0;
	// 	}
	// }

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
