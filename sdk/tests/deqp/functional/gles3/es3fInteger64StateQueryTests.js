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
goog.provide('functional.gles3.es3fInteger64StateQueryTests');
goog.require('framework.common.tcuTestCase');
goog.require('functional.gles3.es3fApiCase');
goog.require('modules.shared.glsStateQuery');

goog.scope(function() {
	var es3fInteger64StateQueryTests = functional.gles3.es3fInteger64StateQueryTests;
    var tcuTestCase = framework.common.tcuTestCase;
	var es3fApiCase = functional.gles3.es3fApiCase;
	var glsStateQuery = modules.shared.glsStateQuery;

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 * @param {number} targetName
	 * @param {number} minValue
	 */
	es3fInteger64StateQueryTests.ConstantMinimumValue64TestCase = function(name, description, targetName, minValue) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
		/** @type {number} */ this.m_targetName = targetName;
		/** @type {number} */ this.m_minValue = minValue;
	};

	es3fInteger64StateQueryTests.ConstantMinimumValue64TestCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fInteger64StateQueryTests.ConstantMinimumValue64TestCase.prototype.constructor = es3fInteger64StateQueryTests.ConstantMinimumValue64TestCase;

	es3fInteger64StateQueryTests.ConstantMinimumValue64TestCase.prototype.test = function() {
		this.check(glsStateQuery.verifyGreaterOrEqual(this.m_targetName, this.m_minValue), 'Fail');
	};

	/**
	 * @constructor
	 * @extends {es3fApiCase.ApiCase}
	 * @param {string} name
	 * @param {string} description
	 * @param {number} targetName
	 * @param {number} targetMaxUniformBlocksName
	 * @param {number} targetMaxUniformComponentsName
	 */
	es3fInteger64StateQueryTests.MaxCombinedStageUniformComponentsCase = function(name, description, targetName, targetMaxUniformBlocksName, targetMaxUniformComponentsName) {
		es3fApiCase.ApiCase.call(this, name, description, gl);
		/** @type {number} */ this.m_targetName = targetName;
		/** @type {number} */ this.m_targetMaxUniformBlocksName = targetMaxUniformBlocksName;
		/** @type {number} */ this.m_targetMaxUniformComponentsName = targetMaxUniformComponentsName;
	};

	es3fInteger64StateQueryTests.MaxCombinedStageUniformComponentsCase.prototype = Object.create(es3fApiCase.ApiCase.prototype);
	es3fInteger64StateQueryTests.MaxCombinedStageUniformComponentsCase.prototype.constructor = es3fInteger64StateQueryTests.MaxCombinedStageUniformComponentsCase;

	es3fInteger64StateQueryTests.MaxCombinedStageUniformComponentsCase.prototype.test = function() {
		/** @type {number} */ var uniformBlockSize = /** @type {number} */ (gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE));
		/** @type {number} */ var maxUniformBlocks = /** @type {number} */ (gl.getParameter(this.m_targetMaxUniformBlocksName));
		/** @type {number} */ var maxUniformComponents = /** @type {number} */ (gl.getParameter(this.m_targetMaxUniformComponentsName));

		// MAX_stage_UNIFORM_BLOCKS * MAX_UNIFORM_BLOCK_SIZE / 4 + MAX_stage_UNIFORM_COMPONENTS
		/** @type {number} */ var minCombinedUniformComponents = maxUniformBlocks * uniformBlockSize / 4 + maxUniformComponents;

		this.check(glsStateQuery.verifyGreaterOrEqual(this.m_targetName, minCombinedUniformComponents));
	};

    /**
    * @constructor
    * @extends {tcuTestCase.DeqpTest}
    */
    es3fInteger64StateQueryTests.Integer64StateQueryTests = function() {
        tcuTestCase.DeqpTest.call(this, 'integers64', 'Integer (64) Values');
    };

    es3fInteger64StateQueryTests.Integer64StateQueryTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fInteger64StateQueryTests.Integer64StateQueryTests.prototype.constructor = es3fInteger64StateQueryTests.Integer64StateQueryTests;

    es3fInteger64StateQueryTests.Integer64StateQueryTests.prototype.init = function() {
		/**
		 * @struct
		 * @constructor
		 * @param {string} name
		 * @param {string} description
		 * @param {number} targetName
		 * @param {number} minValue
		 */
		var LimitedStateInteger64 = function(name, description, targetName, minValue) {
			/** @type {string} */ this.name = name;
			/** @type {string} */ this.description = description;
			/** @type {number} */ this.targetName = targetName;
			/** @type {number} */ this.minValue = minValue;

		};

		/** @type {Array<LimitedStateInteger64>} */ var implementationLimits = [
			new LimitedStateInteger64("max_element_index", "MAX_ELEMENT_INDEX", gl.MAX_ELEMENT_INDEX, 0x00FFFFFF),
			new LimitedStateInteger64("max_server_wait_timeout", "MAX_SERVER_WAIT_TIMEOUT", gl.MAX_SERVER_WAIT_TIMEOUT, 0),
			new LimitedStateInteger64("max_uniform_block_size", "MAX_UNIFORM_BLOCK_SIZE", gl.MAX_UNIFORM_BLOCK_SIZE, 16384)
		];

		for (var testNdx = 0; testNdx < implementationLimits.length; testNdx++)
			this.addChild(new es3fInteger64StateQueryTests.ConstantMinimumValue64TestCase(implementationLimits[testNdx].name, implementationLimits[testNdx].description, implementationLimits[testNdx].targetName, implementationLimits[testNdx].minValue));

		this.addChild(new es3fInteger64StateQueryTests.MaxCombinedStageUniformComponentsCase("max_combined_vertex_uniform_components", "MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS", gl.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS, gl.MAX_VERTEX_UNIFORM_BLOCKS, gl.MAX_VERTEX_UNIFORM_COMPONENTS));
		this.addChild(new es3fInteger64StateQueryTests.MaxCombinedStageUniformComponentsCase("max_combined_fragment_uniform_components", "MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS", gl.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS, gl.MAX_FRAGMENT_UNIFORM_BLOCKS, gl.MAX_FRAGMENT_UNIFORM_COMPONENTS));

    };

    /**
    * Run test
    * @param {WebGL2RenderingContext} context
    */
    es3fInteger64StateQueryTests.run = function(context) {
    	gl = context;
    	//Set up Test Root parameters
    	var state = tcuTestCase.runner;
    	state.setRoot(new es3fInteger64StateQueryTests.Integer64StateQueryTests());

    	//Set up name and description of this test series.
    	setCurrentTestName(state.testCases.fullName());
    	description(state.testCases.getDescription());

    	try {
    		//Run test cases
    		tcuTestCase.runTestCases();
    	}
    	catch (err) {
    		testFailedOptions('Failed to es3fInteger64StateQueryTests.run tests', false);
    		tcuTestCase.runner.terminate();
    	}
    };

});
