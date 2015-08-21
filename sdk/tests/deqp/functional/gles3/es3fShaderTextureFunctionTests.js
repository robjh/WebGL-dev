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
goog.provide('functional.gles3.es3fShaderTextureFunctionTests');
goog.require('framework.common.tcuTestCase');

goog.scope(function() {
	var es3fShaderTextureFunctionTests = functional.gles3.es3fShaderTextureFunctionTests;
    var tcuTestCase = framework.common.tcuTestCase;


	/**
	 * @enum {number}
	 */
	es3fShaderTextureFunctionTests.CaseFlags = {
		VERTEX: 1,
		FRAGMENT: 2,
		BOTH: 3
	};

	/**
	 * @struct
	 * @constructor
	 * @param {string} name
	 * @param {es3fShaderTextureFunctionTests.TextureLookupSpec} lookupSpec
	 * @param {es3fShaderTextureFunctionTests.TextureSpec} texSpec
	 * @param {es3fShaderTextureFunctionTests.TexEvalFunc} evalFunc
	 * @param {number} flags
	 */
	es3fShaderTextureFunctionTests.TexFuncCaseSpec = function(name, lookupSpec, texSpec, evalFunc, flags) {
		/** @type {string} */ this.name = name;
		/** @type {es3fShaderTextureFunctionTests.TextureLookupSpec} */ this.lookupSpec = lookupSpec;
		/** @type {es3fShaderTextureFunctionTests.TextureSpec} */ this.texSpec = texSpec;
		/** @type {es3fShaderTextureFunctionTests.TexEvalFunc} */ this.evalFunc = evalFunc;
		/** @type {number} */ this.flags = flags;
	};


	/**
	 * @struct
	 * @constructor
	 * @param {es3fShaderTextureFunctionTests.Function} func
	 * @param {Array<number>} minCoord
	 * @param {Array<number>} maxCoord
	 * @param {boolean} useBias
	 * @param {number} minLodBias
	 * @param {number} maxLodBias
	 * @param {Array<number>} minDX For *Grad* functions
	 * @param {Array<number>} maxDX For *Grad* functions
	 * @param {Array<number>} minDY For *Grad* functions
	 * @param {Array<number>} maxDY For *Grad* functions
	 * @param {boolean} useOffset
	 * @param {Array<number>} offset
	 */
	es3fShaderTextureFunctionTests.TextureLookupSpec = function() {
			// TODO
	};

	/** @typedef {Array<string, es3fShaderTextureFunctionTests.TextureLookupSpec, es3fShaderTextureFunctionTests.TextureSpec, es3fShaderTextureFunctionTests.EvalFunc, es3fShaderTextureFunctionTests.CaseFlags>} */ es3fShaderTextureFunctionTests.TestSpec;

	/**
	 * @param {string} name
	 * @param {es3fShaderTextureFunctionTests.Function} func
	 * @param {Array<number>} minCoord
	 * @param {Array<number>} maxCoord
	 * @param {boolean} useBias
	 * @param {number} minLodBias
	 * @param {number} maxLodBias
	 * @param {boolean} useOffset
	 * @param {Array<number>} offset
	 * @param {es3fShaderTextureFunctionTests.TextureSpec} texSpec
	 * @param {es3fShaderTextureFunctionTests.EvalFunc} evalFunc
	 * @param {es3fShaderTextureFunctionTests.CaseFlags} flags
	 * @return {es3fShaderTextureFunctionTests.TestSpec}
	 */
	es3fShaderTextureFunctionTests.getCaseSpec = function(name, func, minCoord, maxCoord, useBias, minLodBias, maxLodBias, useOffset, offset, texSpec, evalFunc, flags) {
		return [name,
			es3fShaderTextureFunctionTests.TextureLookupSpec(func, minCoord, maxCoord, useBias, minLodBias, maxLodBias, [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], useOffset, offset),
			texSpec,
			evalFunc,
			flags];
	};

    /**
    * @constructor
    * @extends {tcuTestCase.DeqpTest}
    */
    es3fShaderTextureFunctionTests.ShaderTextureFunctionTests = function() {
        tcuTestCase.DeqpTest.call(this, 'texture_functions', 'Texture Access Function Tests');
    };

    es3fShaderTextureFunctionTests.ShaderTextureFunctionTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fShaderTextureFunctionTests.ShaderTextureFunctionTests.prototype.constructor = es3fShaderTextureFunctionTests.ShaderTextureFunctionTests;

    es3fShaderTextureFunctionTests.ShaderTextureFunctionTests.prototype.init = function() {

    };

    /**
    * Run test
    * @param {WebGL2RenderingContext} context
    */
    es3fShaderTextureFunctionTests.run = function(context) {
    	gl = context;
    	//Set up Test Root parameters
    	var state = tcuTestCase.runner;
    	state.setRoot(new es3fShaderTextureFunctionTests.ShaderTextureFunctionTests());

    	//Set up name and description of this test series.
    	setCurrentTestName(state.testCases.fullName());
    	description(state.testCases.getDescription());

    	try {
    		//Run test cases
    		tcuTestCase.runTestCases();
    	}
    	catch (err) {
    		testFailedOptions('Failed to es3fShaderTextureFunctionTests.run tests', false);
    		tcuTestCase.runner.terminate();
    	}
    };

});
