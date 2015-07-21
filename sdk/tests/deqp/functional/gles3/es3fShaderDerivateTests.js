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
	 * [function description]
	 * @param  {es3fShaderDerivateTests.DerivateFunc} function
	 * @return {string}
	 */
	es3fShaderDerivateTests.getDerivateFuncName = function(func) {
		switch (func) {
			case es3fShaderDerivateTests.DerivateFunc.DFDX: return "dFdx";
			case es3fShaderDerivateTests.DerivateFunc.DFDY: return "dFdy";
			case es3fShaderDerivateTests.DerivateFunc.FWIDTH: return "fwidth";
			default: throw new Error("Derivate Fuctnon not supported.");
		}
	};

	/**
	 * [function description]
	 * @param  {es3fShaderDerivateTests.DerivateFunc} function
	 * @return {string}
	 */
	es3fShaderDerivateTests.getDerivateFuncName = function(func) {
		switch (func) {
			case es3fShaderDerivateTests.DerivateFunc.DFDX: return "dfdx";
			case es3fShaderDerivateTests.DerivateFunc.DFDY: return "dfdy";
			case es3fShaderDerivateTests.DerivateFunc.FWIDTH: return "fwidth";
			default: throw new Error("Derivate Fuctnon not supported.");
		}
	};

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
