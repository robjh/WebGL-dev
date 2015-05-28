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
            'buffer_data', 'Invalid gl.bufferData() usage', gl,
            function() {
                var buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                
                bufferedLogToConsole('gl.INVALID_ENUM is generated if target is not gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER.');
                gl.bufferData(-1, 0, gl.STREAM_DRAW);
                this.expectError(gl.INVALID_ENUM);
                
                bufferedLogToConsole('gl.INVALID_ENUM is generated if usage is not gl.STREAM_DRAW, gl.STATIC_DRAW, or gl.DYNAMIC_DRAW.');
                gl.bufferData(gl.ARRAY_BUFFER, 0, -1);
                this.expectError(gl.INVALID_ENUM);
                
                bufferedLogToConsole('gl.INVALID_VALUE is generated if size is negative.');
                gl.bufferData(gl.ARRAY_BUFFER, -1, gl.STREAM_DRAW);
                this.expectError(gl.INVALID_VALUE);
                
                bufferedLogToConsole('gl.INVALID_OPERATION is generated if the reserved buffer object name 0 is bound to target.');
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                gl.bufferData(gl.ARRAY_BUFFER, 0, gl.STREAM_DRAW);
                this.expectError(gl.INVALID_OPERATION);
                
                gl.deleteBuffer(buffer);
            }
        ));
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'buffer_sub_data', 'Invalid gl.bufferSubData() usage', gl,
            function() {
                var buffer = gl.createBuffer();
                var data = new ArrayBuffer(5);
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, 10, gl.STREAM_DRAW);
                
                bufferedLogToConsole('gl.INVALID_ENUM is generated if target is not gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER.');
                gl.bufferSubData(-1, 1, data);
                this.expectError(gl.INVALID_ENUM);
                
                bufferedLogToConsole('gl.INVALID_OPERATION is generated if the reserved buffer object name 0 is bound to target.');
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
                this.expectError(gl.INVALID_OPERATION);
                
                gl.deleteBuffer(buffer);
            }
        ));
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'buffer_sub_data_size_offset', 'Invalid gl.bufferSubData() usage', gl,
            function() {
                var buffer = gl.createBuffer();
                var data = new ArrayBuffer(5);
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, 10, gl.STREAM_DRAW);

                bufferedLogToConsole('gl.INVALID_VALUE is generated if offset is negative');
                gl.bufferSubData(gl.ARRAY_BUFFER, -1, data);
                this.expectError(gl.INVALID_VALUE);

                bufferedLogToConsole('gl.INVALID_VALUE is generated if the data would be written past the end of the buffer.');
                gl.bufferSubData(gl.ARRAY_BUFFER, 7, data);
                this.expectError(gl.INVALID_VALUE);
                gl.bufferSubData(gl.ARRAY_BUFFER, 15, data);
                this.expectError(gl.INVALID_VALUE);
                
                bufferedLogToConsole('gl.INVALID_VALUE is generated if data is null.');
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, null);
                this.expectError(gl.INVALID_VALUE);

                gl.deleteBuffer(buffer);
            }
        ));
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'clear', 'Invalid gl.clear() usage', gl,
            function() {
                bufferedLogToConsole('gl.INVALID_VALUE is generated if any bit other than the three defined bits is set in mask.');
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
                this.expectError(gl.NO_ERROR);
                gl.clear(0x0200);
                this.expectError(gl.INVALID_VALUE);
                gl.clear(0x1000);
                this.expectError(gl.INVALID_VALUE);
                gl.clear(0x0010);
                this.expectError(gl.INVALID_VALUE);
            }
        ));
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'read_pixels', 'Invalid gl.readPixels() usage', gl,
            function() {
                var buffer = new ArrayBuffer(8);
                var ubyteData = new Uint8Array(buffer);
                var ushortData = new Uint16Array(buffer);
                
                bufferedLogToConsole('gl.INVALID_OPERATION is generated if the combination of format and type is unsupported.');
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4, ushortData);
                this.expectError(gl.INVALID_OPERATION);
                
                bufferedLogToConsole('gl.INVALID_OPERATION is generated if the ArrayBuffer type does not match the type parameter.');
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, ushortData);
                this.expectError(gl.INVALID_OPERATION);
                
                bufferedLogToConsole('gl.INVALID_VALUE is generated if either width or height is negative.');
                gl.readPixels(0, 0, -1, 1, gl.RGBA, gl.UNSIGNED_BYTE, ubyteData);
                this.expectError(gl.INVALID_VALUE);
                gl.readPixels(0, 0, 1, -1, gl.RGBA, gl.UNSIGNED_BYTE, ubyteData);
                this.expectError(gl.INVALID_VALUE);
                gl.readPixels(0, 0, -1, -1, gl.RGBA, gl.UNSIGNED_BYTE, ubyteData);
                this.expectError(gl.INVALID_VALUE);
                
                bufferedLogToConsole('gl.INVALID_FRAMEBUFFER_OPERATION is generated if the currently bound framebuffer is not framebuffer complete.');
                var fbo = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, ubyteData);
                this.expectError(gl.INVALID_FRAMEBUFFER_OPERATION);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.deleteFramebuffer(fbo);
            }
        ));
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'read_pixels_format_mismatch', 'Invalid glReadPixels() usage', gl,
            function() {
                var buffer = new ArrayBuffer(8);
                var ubyteData = new Uint8Array(buffer);
                var ushortData = new Uint16Array(buffer);
                
                bufferedLogToConsole('Unsupported combinations of format and type will generate a gl.INVALID_OPERATION error.');
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_SHORT_5_6_5, ushortData);
                this.expectError(gl.INVALID_OPERATION);
                gl.readPixels(0, 0, 1, 1, gl.ALPHA, gl.UNSIGNED_SHORT_5_6_5, ushortData);
                this.expectError(gl.INVALID_OPERATION);
                gl.readPixels(0, 0, 1, 1, gl.RGB, gl.UNSIGNED_SHORT_4_4_4_4, ushortData);
                this.expectError(gl.INVALID_OPERATION);
                gl.readPixels(0, 0, 1, 1, gl.ALPHA, gl.UNSIGNED_SHORT_4_4_4_4, ushortData);
                this.expectError(gl.INVALID_OPERATION);
                gl.readPixels(0, 0, 1, 1, gl.RGB, gl.UNSIGNED_SHORT_5_5_5_1, ushortData);
                this.expectError(gl.INVALID_OPERATION);
                gl.readPixels(0, 0, 1, 1, gl.ALPHA, gl.UNSIGNED_SHORT_5_5_5_1, ushortData);
                this.expectError(gl.INVALID_OPERATION);
                
                bufferedLogToConsole('gl.RGBA/gl.UNSIGNED_BYTE is always accepted and the other acceptable pair can be discovered by querying gl.IMPLEMENTATION_COLOR_READ_FORMAT and gl.IMPLEMENTATION_COLOR_READ_TYPE.');
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, ubyteData);
                this.expectError(gl.NO_ERROR);
                var readFormat = gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_FORMAT);
                var readType = gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_TYPE);
                gl.readPixels(0, 0, 1, 1, readFormat, readType, ubyteData);
                this.expectError(gl.NO_ERROR);
            }
        ));
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'read_pixels_fbo_format_mismatch', 'Invalid gl.readPixels() usage', gl,
            function() {
                var ubyteData = new Uint8Array(4);
                var floatData = new Float32Array(4);
                
                var texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                
                var fbo = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                this.expectError(gl.NO_ERROR);
                
                bufferedLogToConsole('gl.INVALID_OPERATION is generated if currently bound framebuffer format is incompatible with format and type.');
                
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                this.expectError(gl.NO_ERROR);
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, floatData);
                this.expectError(gl.INVALID_OPERATION);
                
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32I, 32, 32, 0, gl.RGBA_INTEGER, gl.INT, null);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                this.expectError(gl.NO_ERROR);
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, floatData);
                this.expectError(gl.INVALID_OPERATION);

                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, 32, 32, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, null);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                this.expectError(gl.NO_ERROR);
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, floatData);
                this.expectError(gl.INVALID_OPERATION);
                
                bufferedLogToConsole('gl.INVALID_OPERATION is generated if gl.READ_FRAMEBUFFER_BINDING is non-zero, the read framebuffer is complete, and the value of gl.SAMPLE_BUFFERS for the read framebuffer is greater than zero.');
                
                var rbo = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
                gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl.RGBA8, 32, 32);
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbo);
                
                var binding = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING);
                bufferedLogToConsole('gl.READ_FRAMEBUFFER_BINDING: ' + binding);
                gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                var sampleBuffers = gl.getParameter(gl.SAMPLE_BUFFERS);
                bufferedLogToConsole('gl.SAMPLE_BUFFERS: ' + sampleBuffers);
                this.expectError(gl.NO_ERROR);
                
                if (binding == 0 || sampleBuffers <= 0) {
                    this.testFailed('expected gl.READ_FRAMEBUFFER_BINDING to be non-zero and gl.SAMPLE_BUFFERS to be greater than zero');
                } else {
                    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, ubyteData);
                    this.expectError(GL_INVALID_OPERATION);
                }
                
                gl.bindRenderbuffer(gl.RENDERBUFFER, null);
                gl.deleteRenderbuffer(rbo);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.deleteFramebuffer(fbo);
                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.deleteTexture(texture);
            }
        ));
        
        /*
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'read_pixels', 'Invalid gl.readPixels() usage', gl,
            function() {
            }
        ));
        //*/
    };
    
    /**
    * @param {WebGLRenderingContextBase} gl
    */
    es3fNegativeBufferApiTests.run = function(gl) {
        var testName = 'negativeBufferApi';
        var testDescription = 'Negative Buffer API tests';
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
