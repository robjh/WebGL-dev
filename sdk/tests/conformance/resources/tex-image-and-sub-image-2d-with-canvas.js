/*
** Copyright (c) 2012 The Khronos Group Inc.
**
** Permission is hereby granted, free of charge, to any person obtaining a
** copy of this software and/or associated documentation files (the
** "Materials"), to deal in the Materials without restriction, including
** without limitation the rights to use, copy, modify, merge, publish,
** distribute, sublicense, and/or sell copies of the Materials, and to
** permit persons to whom the Materials are furnished to do so, subject to
** the following conditions:
**
** The above copyright notice and this permission notice shall be included
** in all copies or substantial portions of the Materials.
**
** THE MATERIALS ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
** EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
** MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
** IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
** CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
** TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
** MATERIALS OR THE USE OR OTHER DEALINGS IN THE MATERIALS.
*/

function generateTest(pixelFormat, pixelType, prologue) {
    var wtu = WebGLTestUtils;
    var gl = null;
    var successfullyParsed = false;

    var init = function()
    {
        description('Verify texImage2D and texSubImage2D code paths taking canvas elements (' + pixelFormat + '/' + pixelType + ')');

        gl = wtu.create3DContext("example");

        if (!prologue(gl)) {
            finishTest();
            return;
        }

        gl.clearColor(0,0,0,1);
        gl.clearDepth(1);

        var testCanvas = document.createElement('canvas');
        runTest(testCanvas);
        //document.body.appendChild(testCanvas);
    }

    function setCanvasToRedGreen(ctx) {
      var width = ctx.canvas.width;
      var height = ctx.canvas.height;
      var halfHeight = Math.floor(height / 2);
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(0, 0, width, halfHeight);
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(0, halfHeight, width, height - halfHeight);
    }

    function drawTextInCanvas(ctx, bindingTarget) {
      var width = ctx.canvas.width;
      var height = ctx.canvas.height;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.font = '20pt Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("1234567890", width / 2, height / 4);
    }

    function setCanvasTo257x257(ctx, bindingTarget) {
      ctx.canvas.width = 257;
      ctx.canvas.height = 257;
      setCanvasToRedGreen(ctx);
    }

    function setCanvasToMin(ctx, bindingTarget) {
      if (bindingTarget == gl.TEXTURE_CUBE_MAP) {
        // cube map texture must be square.
        ctx.canvas.width = 2;
      } else {
        ctx.canvas.width = 1;
      }
      ctx.canvas.height = 2;
      setCanvasToRedGreen(ctx);
    }

    function runOneIteration(canvas, useTexSubImage2D, flipY, program, bindingTarget, opt_texture, opt_fontTest)
    {
        debug('Testing ' + (useTexSubImage2D ? 'texSubImage2D' : 'texImage2D') +
              ' with flipY=' + flipY + ' bindingTarget=' + (bindingTarget == gl.TEXTURE_2D ? 'TEXTURE_2D' : 'TEXTURE_CUBE_MAP') +
              ' canvas size: ' + canvas.width + 'x' + canvas.height +
              (opt_fontTest ? " with fonts" : " with red-green"));
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if (!opt_texture) {
            var texture = gl.createTexture();
            // Bind the texture to texture unit 0
            gl.bindTexture(bindingTarget, texture);
            // Set up texture parameters
            gl.texParameteri(bindingTarget, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(bindingTarget, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(bindingTarget, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(bindingTarget, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        } else {
            var texture = opt_texture;
        }
        // Set up pixel store parameters
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        wtu.failIfGLError(gl, 'gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);');
        var targets = [gl.TEXTURE_2D];
        if (bindingTarget == gl.TEXTURE_CUBE_MAP) {
            targets = [gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                       gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                       gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                       gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                       gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                       gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];
        }
        // Upload the image into the texture
        for (var tt = 0; tt < targets.length; ++tt) {
            // Initialize the texture to black first
            if (useTexSubImage2D) {
                gl.texImage2D(targets[tt], 0, gl[pixelFormat], canvas.width, canvas.height, 0,
                              gl[pixelFormat], gl[pixelType], null);
                gl.texSubImage2D(targets[tt], 0, 0, 0, gl[pixelFormat], gl[pixelType], canvas);
            } else {
                gl.texImage2D(targets[tt], 0, gl[pixelFormat], gl[pixelFormat], gl[pixelType], canvas);
            }
        }

        var width = gl.canvas.width;
        var height = gl.canvas.height;
        var halfHeight = Math.floor(height / 2);
        var top = flipY ? 0 : (height - halfHeight);
        var bottom = flipY ? (height - halfHeight) : 0;

        var loc;
        if (bindingTarget == gl.TEXTURE_CUBE_MAP) {
            loc = gl.getUniformLocation(program, "face");
        }

        for (var tt = 0; tt < targets.length; ++tt) {
            if (bindingTarget == gl.TEXTURE_CUBE_MAP) {
                gl.uniform1i(loc, targets[tt]);
            }
            // Draw the triangles
            wtu.clearAndDrawUnitQuad(gl, [0, 255, 0, 255]);

            if (opt_fontTest) {
                // check half is a solid color.
                wtu.checkCanvasRect(
                      gl, 0, top, width, halfHeight,
                      [255, 255, 255, 255],
                      "should be white");
                // check other half is not a solid color.
                wtu.checkCanvasRectColor(
                      gl, 0, bottom, width, halfHeight,
                      [255, 255, 255, 255], 0,
                      function() {
                        testFailed("font missing");
                      },
                      function() {
                        testPassed("font renderered");
                      },
                      debug);
            } else {
                // Check the top and bottom halves and make sure they have the right color.
                var red = [255, 0, 0];
                var green = [0, 255, 0];
                debug("Checking " + (flipY ? "top" : "bottom"));
                wtu.checkCanvasRect(gl, 0, bottom, width, halfHeight, red,
                                    "shouldBe " + red);
                debug("Checking " + (flipY ? "bottom" : "top"));
                wtu.checkCanvasRect(gl, 0, top, width, halfHeight, green,
                                    "shouldBe " + green);
            }

            if (!useTexSubImage2D && pixelFormat == "RGBA") {
                if (pixelType == "FLOAT") {
                    // Attempt to set a pixel in the texture to ensure the texture was
                    // actually created with floats. Regression test for http://crbug.com/484968
                    var pixels = new Float32Array([1000.0, 1000.0, 1000.0, 1000.0]);
                    gl.texSubImage2D(targets[tt], 0, 0, 0, 1, 1, gl[pixelFormat], gl[pixelType], pixels);
                    wtu.glErrorShouldBe(gl, gl.NO_ERROR, "Texture should be backed by floats");
                } else if (pixelType == "HALF_FLOAT_OES") {
                    // Attempt to set a pixel in the texture to ensure the texture was
                    // actually created with half-floats. Regression test for http://crbug.com/484968
                    var halfFloatTenK = 0x70E2; // Half float 10000
                    var pixels = new Uint16Array([halfFloatTenK, halfFloatTenK, halfFloatTenK, halfFloatTenK]);
                    gl.texSubImage2D(targets[tt], 0, 0, 0, 1, 1, gl[pixelFormat], gl[pixelType], pixels);
                    wtu.glErrorShouldBe(gl, gl.NO_ERROR, "Texture should be backed by half-floats");
                }
            }
        }

        if (false) {
          var m = wtu.makeImageFromCanvas(gl.canvas);
          document.getElementById("console").appendChild(m);
          document.getElementById("console").appendChild(document.createElement("hr"));
        }

        return texture;
    }

    function runTest(canvas)
    {
        var ctx = canvas.getContext("2d");

        var cases = [
            { sub: false, flipY: true,  font: false, init: setCanvasToMin },
            { sub: false, flipY: false, font: false },
            { sub: true,  flipY: true,  font: false },
            { sub: true,  flipY: false, font: false },
            { sub: false, flipY: true,  font: false, init: setCanvasTo257x257 },
            { sub: false, flipY: false, font: false },
            { sub: true,  flipY: true,  font: false },
            { sub: true,  flipY: false, font: false },
            { sub: false, flipY: true,  font: true, init: drawTextInCanvas },
            { sub: false, flipY: false, font: true },
            { sub: true,  flipY: true,  font: true },
            { sub: true,  flipY: false, font: true },
        ];

        function runTexImageTest(bindingTarget) {
            var program;
            if (bindingTarget == gl.TEXTURE_2D) {
                program = wtu.setupTexturedQuad(gl);
            } else {
                program = wtu.setupTexturedQuadWithCubeMap(gl);
            }

            return new Promise(function(resolve, reject) {
                var count = 4;
                var caseNdx = 0;
                var texture = undefined;
                function runNextTest() {
                    var c = cases[caseNdx];
                    if (c.init) {
                      c.init(ctx, bindingTarget);
                    }
                    texture = runOneIteration(canvas, c.sub, c.flipY, program, bindingTarget, texture, c.font);
                    // for the first 2 iterations always make a new texture.
                    if (count > 2) {
                      texture = undefined;
                    }
                    ++caseNdx;
                    if (caseNdx == cases.length) {
                        caseNdx = 0;
                        --count;
                        if (!count) {
                            resolve("SUCCESS");
                            return;
                        }
                    }
                    wtu.waitForComposite(runNextTest);
                }
                runNextTest();
            });
        }

        runTexImageTest(gl.TEXTURE_2D).then(function(val) {
            runTexImageTest(gl.TEXTURE_CUBE_MAP).then(function(val) {
                wtu.glErrorShouldBe(gl, gl.NO_ERROR, "should be no errors");
                finishTest();
            });
        })
    }

    return init;
}
