'use strict';
goog.provide('functional.gles3.es3fNegativeBuggerApiTests');
goog.require('functional.gles3.es3fApiCase');
goog.require('framework.common.tcuTestCase');

goog.scope(function() {
    
    var es3fNegativeBuggerApiTests = functional.gles3.es3fNegativeBuggerApiTests;
    var es3fApiCase = functional.gles3.es3fApiCase;
    var tcuTestCase = framework.common.tcuTestCase;
    
    /**
    * @param {WebGLRenderingContextBase} gl
    */
    es3fNegativeBuggerApiTests.init = function(gl) {
        
    }
    
    /**
    * @param {WebGLRenderingContextBase} gl
    */
    es3fNegativeBuggerApiTests.run() = function(gl) {
        var testName = 'multisample';
        var testDescription = 'Multisample tests';
        var state = tcuTestCase.runner;

        state.testName = testName;
        state.testCases = tcuTestCase.newTest(testName, testDescription, null);

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);
        try {
            es3fNegativeBuggerApiTests.init(gl);
            tcuTestCase.runner.runCallback(tcuTestCase.runTestCases);
        } catch (err) {
            console.log(err);
            bufferedLogToConsole(err);
            tcuTestCase.runner.terminate();
        }
    };
    
});
