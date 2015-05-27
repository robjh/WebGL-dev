'use strict';
goog.provide('functional.gles3.es3fNegativeBufferApiTests');
goog.require('functional.gles3.es3fApiCase');
goog.require('framework.opengl.gluStrUtil');
goog.require('framework.common.tcuTestCase');

goog.scope(function() {
    
    var es3fNegativeBufferApiTests = functional.gles3.es3fNegativeBufferApiTests;
    var es3fApiCase = functional.gles3.es3fApiCase;
    var gluStrUtil = framework.opengl.gluStrUtil;
    var tcuTestCase = framework.common.tcuTestCase;
    
    /**
    * @param {WebGLRenderingContextBase} gl
    */
    es3fNegativeBufferApiTests.init = function(gl) {
    
        // not implemented, on account of these functions not generating errors in webgl;
        // gl.deleteBuffers(), gl.createBuffer()
    
        var testGroup = tcuTestCase.runner.testCases;
    
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'bind_buffer', 'Invalid gl.bindBuffer() usage', gl,
            function() {
                bufferedLogToConsole('gl.INVALID_ENUM is generated if target is not one of the allowable values.');
                gl.bindBuffer(-1, null);
                this.expectError(gl.INVALID_ENUM);
            }
        ));
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'buffer_data', 'Invalid glBufferData() usage', gl,
            function() {
                var buffer = gl.createBuffer();
                
                bufferedLogToConsole('gl.INVALID_ENUM is generated if target is not one of the allowable values.');
              //  gl.bindBuffer(-1, null);
                
                gl.deleteBuffer(buffer);
            }
        ));
    }
    
    /**
    * @param {WebGLRenderingContextBase} gl
    */
    es3fNegativeBufferApiTests.run = function(gl) {
        var testName = 'multisample';
        var testDescription = 'Multisample tests';
        var state = tcuTestCase.runner;

        state.testName = testName;
        state.testCases = tcuTestCase.newTest(testName, testDescription, null);

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);
        try {
            es3fNegativeBufferApiTests.init(gl);
            tcuTestCase.runner.runCallback(tcuTestCase.runTestCases);
        } catch (err) {
            console.log(err);
            bufferedLogToConsole(err);
            tcuTestCase.runner.terminate();
        }
    };
    
});
