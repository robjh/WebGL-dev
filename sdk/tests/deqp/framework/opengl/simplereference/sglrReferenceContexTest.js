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
goog.require('framework.common.tcuSurface');
goog.require('framework.opengl.gluDrawUtil');
goog.require('framework.common.tcuImageCompare');

goog.scope(function () {
    var sglrReferenceContextTest = framework.opengl.simplereference.sglrReferenceContextTest;
    var sglrReferenceContext = framework.opengl.simplereference.sglrReferenceContext;
    var tcuTestCase = framework.common.tcuTestCase;
    var tcuPixelFormat = framework.common.tcuPixelFormat;
    var gluDrawUtil = framework.opengl.gluDrawUtil;
    var tcuSurface = framework.common.tcuSurface;
    var tcuImageCompare = framework.common.tcuImageCompare;
    
    /**
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} description
     */
    sglrReferenceContextTest.ClearContext = function (name, description) {
        tcuTestCase.DeqpTest.call(this, name, description);
    };
    
    sglrReferenceContextTest.ClearContext.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    sglrReferenceContextTest.ClearContext.prototype.constructor = sglrReferenceContextTest.ClearContext;
    
    sglrReferenceContextTest.ClearContext.prototype.init = function () {};
    
    sglrReferenceContextTest.ClearContext.prototype.iterate = function () {
        
        var width = 200;
        var height = 188;
        var samples = 1;
        var limits = new sglrReferenceContext.ReferenceContextLimits(gl);
        var format = new tcuPixelFormat.PixelFormat(8,8,8,8);
        var buffers = new sglrReferenceContext.ReferenceContextBuffers(format, 24, 8, width, height, samples);
        var ctx = new sglrReferenceContext.ReferenceContext(limits, buffers.getColorbuffer(), buffers.getDepthbuffer(), buffers.getStencilbuffer());
        ctx.clearColor(1, 0, 0, 1);
        ctx.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);
        var pixels = new tcuSurface.Surface(width, height);
        ctx.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels.getAccess().getBuffer());
		
		var numFailedPixels = 0;
		var redPixel = new gluDrawUtil.Pixel([255, 0, 0, 255]);
		for (var x = 0; x < width; x++)
			for (var y = 0; y < height; y++)
            {
                var pixel = new gluDrawUtil.Pixel(pixels.getPixel(x, y));
				if (!pixel.equals(redPixel))
					numFailedPixels += 1;
            }
		
        var access = pixels.getAccess();
        
        tcuImageCompare.displayImages(access, null, null);
        
		if (numFailedPixels > 0)
            throw new Error('Image comparison failed, got ' + numFailedPixels + ' non-equal pixels.');
		
		
		ctx.scissor(width/4, height/4, width/2, height/2);
		ctx.enable(gl.SCISSOR_TEST);
		ctx.clearColor(0, 1, 1, 1);
		ctx.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);
		ctx.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels.getAccess().getBuffer());
		
		numFailedPixels = 0;
		var greenBluePixel = new gluDrawUtil.Pixel([0, 255, 255, 255]);
		for (var x = 0; x < width; x++)
			for (var y = 0; y < height; y++)
            {
                var pixel = new gluDrawUtil.Pixel(pixels.getPixel(x, y));
				if ((x >= width/4 && x < width - width/4)  && (y >= height/4 && y < height - height/4))
                {
					if (!pixel.equals(greenBluePixel))
						numFailedPixels += 1;
                }
                else
                    if (!pixel.equals(redPixel))
						numFailedPixels += 1;
            }
        
        access = pixels.getAccess();
        
        tcuImageCompare.displayImages(access, null, null);
		
		if (numFailedPixels > 0) 
			throw new Error('Image comparison failed, got ' + numFailedPixels + ' non-equal pixels.');
		
		
		
		return tcuTestCase.IterateResult.STOP;
    };
    
    
    //TODO
    sglrReferenceContextTest.init = function() {
        var state = tcuTestCase.runner;
        /** @type {tcuTestCase.DeqpTest} */ var testGroup = state.testCases;

        /** @type {tcuTestCase.DeqpTest} */ var referenceContextGroup = tcuTestCase.newTest('reference_context', 'Test reference context');
        referenceContextGroup.addChild(new sglrReferenceContextTest.ClearContext('clear_context', 'Clear Context Test'));
        
        testGroup.addChild(referenceContextGroup);
    
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