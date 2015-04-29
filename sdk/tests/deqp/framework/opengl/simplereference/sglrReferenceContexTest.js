/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL ES Utilities
 * ------------------------------------------------
 *
 * Copyright 2014 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
'use strict';
goog.provide('framework.opengl.simplereference.sglrReferenceContextTest');
goog.require('framework.opengl.simplereference.sglrReferenceContext');
goog.require('framework.common.tcuTestCase');
goog.require('framework.common.tcuPixelFormat');

goog.scope(function () {
    var sglrReferenceContextTest = framework.opengl.simplereference.sglrReferenceContextTest;
    var sglrReferenceContext = framework.opengl.simplereference.sglrReferenceContext;
    var tcuTestCase = framework.common.tcuTestCase;
    var tcuPixelFormat = framework.common.tcuPixelFormat;
    
    /**
     * @constructor
     * @struct
     */
    sglrReferenceContextTest.TestSpec = function() {
        /** @type {sglrReferenceContext.ReferenceContextLimits} */ this.limits;
        /** @typy {tcuPixelFormat.PixelFormat} */ this.format;
        /** @type {number} */ this.width;
        /** @type {number} */ this.height;
        /** @type {number} */ this.samples;
        /** @type {sglrReferenceContext.ReferenceContextBuffers} */ this.buffers;
        /** @type {sglrReferenceContext.ReferenceContext} */ this.ctx;
    };
    
    
    /**
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     * @param {String} name
     * @param {String} description
     * @param {sglrReferenceContextTest.TestSpec} spec
     */
    sglrReferenceContextTest.ClearContext = function (name, description, spec) {
        tcuTestCase.DeqpTest.call(this, name, description);
        this.m_spect = spec;
    };
    
    sglrReferenceContextTest.ClearContext.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    sglrReferenceContextTest.ClearContext.prototype.constructor = sglrReferenceContextTest.ClearContext;
    
    sglrReferenceContextTest.ClearContext.prototype.init = function () {};
    
    sglrReferenceContextTest.ClearContext.prototype.iterate = function () {};
    
    
    //TODO
    sglrReferenceContextTest.init = function() {
        var state = tcuTestCase.runner;
        /** @type {tcuTestCase.DeqpTest} */ var testGroup = state.testCases;

        /** @type {tcuTestCase.DeqpTest} */ var clearContextGroup = tcuTestCase.newTest('clear_context', 'Test clear context');
        
        // Create the test spect here
        var testSpect = new sglrReferenceContextTest.TestSpec();
        testSpect.limits = new sglrReferenceContext.ReferenceContextLimits(gl);
        testSpect.format = new tcuPixelFormat.PixelFormat(8,8,8,8);
        testSpect.width = 200;
        testSpect.height = 188;
        testSpect.samples = 1;
        testSpect.buffers = new sglrReferenceContext.ReferenceContextBuffers(format, 24, 8, width, height, samples);
        testSpect.ctx = new sglrReferenceContext.ReferenceContext(limits, buffers.getColorbuffer(), buffers.getDepthbuffer(), buffers.getStencilbuffer());
        
        clearContextGroup.addChild(layoutGroup);
    
    };
    
    sglrReferenceContextTest.run = function(context) {
        gl = context;
        //Set up Test Root parameters
        var testName = 'single_reference_context';
        var testDescription = 'Single Reference Context Tests';
        var state = tcuTestCase.runner;

        state.testName = testName;
        state.testCases = tcuTestCase.newTest(testName, testDescription, null);

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        try {
            //Create test cases
            sglrReferenceContextTest.init();
            //Run test cases
            tcuTestCase.runTestCases();
        }
        catch (err) {
            bufferedLogToConsole(err);
            tcuTestCase.runner.terminate();
        }
    
    };
    
});