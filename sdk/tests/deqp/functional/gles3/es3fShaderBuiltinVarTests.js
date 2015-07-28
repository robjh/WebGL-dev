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
goog.provide('functional.gles3.es3fShaderBuiltinVarTests');

goog.scope(function() {
	var es3fShaderBuiltinVarTests = functional.gles3.es3fShaderBuiltinVarTests;

	/**
	 * @param  {number} pname
	 * @return {*} getParameter returns values of any kind
	 */
	es3fShaderBuiltinVarTests.getInteger = function(pname) {
		/** @type {*} */ var value = gl.getParameter(pname);
		return value;
	};

	es3fShaderBuiltinVarTests.getVectorsFromComps = function(pname) {
		
	};

    /**
    * Run test
    * @param {WebGL2RenderingContext} context
    */
    es3fShaderBuiltinVarTests.run = function(context) {
    	gl = context;
    	//Set up Test Root parameters
    	var state = tcuTestCase.runner;
    	state.setRoot(new es3fShaderBuiltinVarTests.ShaderBuiltinVarTests());

    	//Set up name and description of this test series.
    	setCurrentTestName(state.testCases.fullName());
    	description(state.testCases.getDescription());

    	try {
    		//Run test cases
    		tcuTestCase.runTestCases();
    	}
    	catch (err) {
    		testFailedOptions('Failed to es3fShaderBuiltinVarTests.run tests', false);
    		tcuTestCase.runner.terminate();
    	}
    };

});
