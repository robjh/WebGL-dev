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

var uniformBlockCase = (function() {
    'use strict';

    /** @const */ var VIEWPORT_WIDTH = 128;
    /** @const */ var VIEWPORT_HEIGHT = 128;

    var program;
    var gl;
    var canvas;

var showResult = function() {
    this.beforeDrawCall = function(){
        debug('Before draw call');
    };

    this.afterDrawCall = function(){
        debug('After draw call');
    };
};

var render = function(program) {
    // Compute viewport.
    /* TODO: original code used random number generator to compute viewport, we use whole canvas */
    /** @const */ var viewportW = Math.min(canvas.width, VIEWPORT_WIDTH);
    /** @const */ var viewportH = Math.min(canvas.height, VIEWPORT_HEIGHT);
    /** @const */ var viewportX = 0;
    /** @const */ var viewportY = 0;

    gl.clearColor(0.125, 0.25, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);

    //Draw
    var position = [
        -1.0, -1.0, 0.0, 1.0,
        -1.0, 1.0, 0.0, 1.0,
        1.0, -1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0
	];
    var indices = [ 0, 1, 2, 2 ,1 ,3 ];

    gl.viewport(viewportX, viewportY, viewportW, viewportH);

    var posArray = [ new deqpDraw.VertexArrayBinding(gl.FLOAT, "a_position", 4, 4, position) ];
    deqpDraw.drawFromBuffers(gl, program, posArray, deqpDraw.triangles(indices));
    assertMsgOptions(gl.getError() === gl.NO_ERROR, "Drawing");

    // Verify that all pixels are white.
    {
        var pixels = new deqpDraw.Surface();
        var numFailedPixels = 0;

        var buffer = pixels.readSurface(gl, viewportX, viewportY, viewportW, viewportH);
        assertMsgOptions(gl.getError() === gl.NO_ERROR, "Reading pixels");

        var whitePixel = new deqpDraw.Pixel( [255.0, 255.0, 255.0, 255.0] );
        for (var y = 0; y < viewportH; y++)
        {
            for (var x = 0; x < viewportW; x++)
            {
                if (!pixels.getPixel(x, y).equals(whitePixel))
                    numFailedPixels += 1;
            }
        }

        if (numFailedPixels > 0)
        {
            _logToConsole("Image comparison failed, got " + numFailedPixels + " non-white pixels.");
        }

        return numFailedPixels == 0;
    }
};


//
// getShaderSource
//
// Reads a shader program's source by scouring the current document,
// looking for a script with the specified ID.
//
var getShaderSource = function(id) {
  var shaderScript = document.getElementById(id);
  
  // Didn't find an element with the specified ID; abort.
  
  if (!shaderScript) {
    return null;
  }
  
  // Walk through the source element's children, building the
  // shader source string.
  
  var theSource = "";
  var currentChild = shaderScript.firstChild;
  
  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }
    
    currentChild = currentChild.nextSibling;
  }
  
  return theSource;
};

/**
 * Initialize a test case
 */
var init = function() {
    // Init context
    var wtu = WebGLTestUtils;
    gl = wtu.create3DContext('canvas', {preserveDrawingBuffer: true});
	canvas = document.getElementById('canvas');

    if (!gl)
    {
        alert("Not able to create context");
        testFailed("Not able to create context", true);
    }
    // Create shaders
    var vsource = deqpProgram.genVertexSource(getShaderSource('shader-vs'));
    var fsource = deqpProgram.genFragmentSource(getShaderSource('shader-fs'));

    var programSources = { sources : [ vsource, fsource ] };

    program = new deqpProgram.ShaderProgram(gl, programSources);
    gl.useProgram(program.getProgram());
};

/**
 * Execute a test case
 * @return {bool} True if test case passed
 */
var execute = function()
{
    assertMsgOptions(render(program),"Verify pixels", true, true);
}

var runTestCases = function() {
    try {
        init();
        execute();
    } catch (err) {
        _logToConsole(err);
    }
    deqpTests.runner.terminate();
};

var genValueBlock = function() {
    return {
        values: [],
        arrayLength: 0
    };
};

return {
    runTestCases: runTestCases
};

}());


