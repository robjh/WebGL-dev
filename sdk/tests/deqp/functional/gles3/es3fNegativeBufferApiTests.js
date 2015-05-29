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
    /*
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
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'bind_buffer_range', 'Invalid glBindBufferRange() usage', gl,
            function() {
                var bufEmpty = new ArrayBuffer(16);
                
                var bufUniform = gl.createBuffer();
                gl.bindBuffer(gl.UNIFORM_BUFFER, bufUniform);
                gl.bufferData(gl.UNIFORM_BUFFER, bufEmpty, gl.STREAM_DRAW);
                
                var bufTF = gl.createBuffer();
                gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, bufTF);
                gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, bufTF, gl.STREAM_DRAW);
                
                bufferedLogToConsole('gl.INVALID_ENUM is generated if target is not gl.TRANSFORM_FEEDBACK_BUFFER or gl.UNIFORM_BUFFER.');
                gl.bindBufferRange(gl.ARRAY_BUFFER, 0, bufUniform, 0, 4);
                this.expectError(gl.INVALID_ENUM);
                
                bufferedLogToConsole('gl.INVALID_VALUE is generated if target is gl.TRANSFORM_FEEDBACK_BUFFER and index is greater than or equal to gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS.');
                var maxTFSize = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS);
                gl.bindBufferRange(gl.TRANSFORM_FEEDBACK_BUFFER, maxTFSize, bufTF, 0, 4);
                this.expectError(gl.INVALID_VALUE);
                
                bufferedLogToConsole('gl.INVALID_VALUE is generated if target is gl.UNIFORM_BUFFER and index is greater than or equal to gl.MAX_UNIFORM_BUFFER_BINDINGS.');
                var maxUSize = gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS);
                gl.bindBufferRange(gl.UNIFORM_BUFFER, maxUSize, bufUniform, 0, 4);
                this.expectError(gl.INVALID_VALUE);
                
                bufferedLogToConsole('gl.INVALID_VALUE is generated if size is less than or equal to zero.');
                gl.bindBufferRange(gl.UNIFORM_BUFFER, 0, bufUniform, 0, -1);
                this.expectError(gl.INVALID_VALUE);
                gl.bindBufferRange(gl.UNIFORM_BUFFER, 0, bufUniform, 0, 0);
                this.expectError(gl.INVALID_VALUE);
                
                bufferedLogToConsole('gl.INVALID_VALUE is generated if target is gl.TRANSFORM_FEEDBACK_BUFFER and size or offset are not multiples of 4.');
                gl.bindBufferRange(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bufTF, 4, 5);
                this.expectError(gl.INVALID_VALUE);
                gl.bindBufferRange(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bufTF, 5, 4);
                this.expectError(gl.INVALID_VALUE);
                gl.bindBufferRange(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bufTF, 5, 7);
                this.expectError(gl.INVALID_VALUE);
                
                bufferedLogToConsole('gl.INVALID_VALUE is generated if target is gl.UNIFORM_BUFFER and offset is not a multiple of gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT.');
                var alignment = gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT);
                gl.bindBufferRange(gl.UNIFORM_BUFFER, 0, bufUniform, alignment + 1, 4);
                this.expectError(gl.INVALID_VALUE);
                
                gl.deleteBuffer(bufUniform);
                gl.deleteBuffer(bufTF);
            }
        ));
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'bind_buffer_base', 'Invalid glBindBufferBase() usage', gl,
            function() {
                var bufEmpty = new ArrayBuffer(16);
                
                var bufUniform = gl.createBuffer();
                gl.bindBuffer(gl.UNIFORM_BUFFER, bufUniform);
                gl.bufferData(gl.UNIFORM_BUFFER, bufEmpty, gl.STREAM_DRAW);
                
                var bufTF = gl.createBuffer();
                gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, bufTF);
                gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, bufTF, gl.STREAM_DRAW);
                
                bufferedLogToConsole('gl.INVALID_ENUM is generated if target is not gl.TRANSFORM_FEEDBACK_BUFFER or gl.UNIFORM_BUFFER.');
                gl.bindBufferBase(-1, 0, bufUniform);
                this.expectError(gl.INVALID_ENUM);
                gl.bindBufferBase(gl.ARRAY_BUFFER, 0, bufUniform);
                this.expectError(gl.INVALID_ENUM);
                
                bufferedLogToConsole('gl.INVALID_VALUE is generated if target is gl.UNIFORM_BUFFER and index is greater than or equal to gl.MAX_UNIFORM_BUFFER_BINDINGS.');
                var maxUSize = gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS);
                gl.bindBufferBase(gl.UNIFORM_BUFFER, maxUSize, bufUniform);
                this.expectError(gl.INVALID_VALUE);
			
                bufferedLogToConsole('gl.INVALID_VALUE is generated if target is gl.TRANSFORM_FEEDBACK_BUFFER andindex is greater than or equal to gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS.');
                var maxTFSize = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS);
                gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, maxTFSize, bufTF);
                this.expectError(gl.INVALID_VALUE);
                
                gl.deleteBuffer(bufUniform);
                gl.deleteBuffer(bufTF);
            }
        ));
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'clear_bufferiv', 'Invalid gl.clearBufferiv() usage', gl,
            function() {
                var data = new Int32Array(32*32);
                
                var texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32I, 32, 32, 0, gl.RGBA_INTEGER, gl.INT, null);
                
                var fbo = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                this.expectError(gl.NO_ERROR);
                
                bufferedLogToConsole('gl.INVALID_ENUM is generated if buffer is not an accepted value.');
                gl.clearBufferiv(-1, 0, data);
                this.expectError(gl.INVALID_ENUM);
                gl.clearBufferiv(gl.FRAMEBUFFER, 0, data);
                this.expectError(gl.INVALID_ENUM);
                
                bufferedLogToConsole('gl.INVALID_VALUE is generated if buffer is gl.COLOR, gl.FRONT, gl.BACK, gl.LEFT, gl.RIGHT, or gl.FRONT_AND_BACK and drawBuffer is greater than or equal to gl.MAX_DRAW_BUFFERS.');
                var maxDrawBuffers = gl.getParameter(gl.MAX_DRAW_BUFFERS);
                gl.clearBufferiv(gl.COLOR, maxDrawBuffers, data);
                this.expectError(gl.INVALID_VALUE);
			
                bufferedLogToConsole('gl.INVALID_ENUM is generated if buffer is gl.DEPTH or gl.DEPTH_STENCIL.');
                gl.clearBufferiv(gl.DEPTH, 1, data);
                this.expectError(gl.INVALID_ENUM);
                gl.clearBufferiv(gl.DEPTH_STENCIL, 1, data);
                this.expectError(gl.INVALID_ENUM);
			
                bufferedLogToConsole('gl.INVALID_VALUE is generated if buffer is gl.STENCIL and drawBuffer is not zero.');
                gl.clearBufferiv(gl.STENCIL, 1, data);
                this.expectError(gl.INVALID_VALUE);
                
                gl.deleteFramebuffer(fbo);
                gl.deleteTexture(texture);
            }
        ));
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'clear_bufferuiv', 'Invalid gl.clearBufferuiv() usage', gl,
            function() {
                var data = new Uint32Array(32*32);
                
                var texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, 32, 32, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, null);
                
                var fbo = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                this.expectError(gl.NO_ERROR);
                
                bufferedLogToConsole('gl.INVALID_ENUM is generated if buffer is not an accepted value.');
                gl.clearBufferuiv(-1, 0, data);
                this.expectError(gl.INVALID_ENUM);
                gl.clearBufferuiv(gl.FRAMEBUFFER, 0, data);
                this.expectError(gl.INVALID_ENUM);

                bufferedLogToConsole('gl.INVALID_VALUE is generated if buffer is gl.COLOR, gl.FRONT, gl.BACK, gl.LEFT, gl.RIGHT, or gl.FRONT_AND_BACK and drawBuffer is greater than or equal to gl.MAX_DRAW_BUFFERS.');
                var maxDrawBuffers = gl.getParameter(gl.MAX_DRAW_BUFFERS);
                gl.clearBufferuiv(gl.COLOR, maxDrawBuffers, data);
                this.expectError(gl.INVALID_VALUE);

                bufferedLogToConsole('gl.INVALID_ENUM is generated if buffer is gl.DEPTH, gl.STENCIL or gl.DEPTH_STENCIL.');
                gl.clearBufferuiv(gl.DEPTH, 1, data);
                this.expectError(gl.INVALID_ENUM);
                gl.clearBufferuiv(gl.STENCIL, 1, data);
                this.expectError(gl.INVALID_ENUM);
                gl.clearBufferuiv(gl.DEPTH_STENCIL, 1, data);
                this.expectError(gl.INVALID_ENUM);

                gl.deleteFramebuffer(fbo);
                gl.deleteTexture(texture);
            }
        ));
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'clear_bufferfv', 'Invalid gl.clearBufferfv() usage', gl,
            function() {
                var data = new Float32Array(32*32);
                
                var texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 32, 32, 0, gl.RGBA, gl.FLOAT, null);
                
                var fbo = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                this.expectError(gl.NO_ERROR);
                
                bufferedLogToConsole('gl.INVALID_ENUM is generated if buffer is not an accepted value.');
                gl.clearBufferfv(-1, 0, data);
                this.expectError(gl.INVALID_ENUM);
                gl.clearBufferfv(gl.FRAMEBUFFER, 0, data);
                this.expectError(gl.INVALID_ENUM);

                bufferedLogToConsole('gl.INVALID_VALUE is generated if buffer is gl.COLOR, gl.FRONT, gl.BACK, gl.LEFT, gl.RIGHT, or gl.FRONT_AND_BACK and drawBuffer is greater than or equal to gl.MAX_DRAW_BUFFERS.');
                var maxDrawBuffers = gl.getParameter(gl.MAX_DRAW_BUFFERS);
                gl.clearBufferfv(gl.COLOR, maxDrawBuffers, data);
                this.expectError(gl.INVALID_VALUE);

                bufferedLogToConsole('gl.INVALID_ENUM is generated if buffer is gl.STENCIL or gl.DEPTH_STENCIL.');
                gl.clearBufferfv(gl.STENCIL, 1, data);
                this.expectError(gl.INVALID_ENUM);
                gl.clearBufferfv(gl.DEPTH_STENCIL, 1, data);
                this.expectError(gl.INVALID_ENUM);

                bufferedLogToConsole('gl.INVALID_VALUE is generated if buffer is gl.DEPTH and drawBuffer is not zero.');
                gl.clearBufferfv(gl.DEPTH, 1, data);
                this.expectError(gl.INVALID_VALUE);

                gl.deleteFramebuffer(fbo);
                gl.deleteTexture(texture);
            }
        ));
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'clear_bufferfi', 'Invalid gl.clearBufferfi() usage', gl,
            function() {
                bufferedLogToConsole('gl.INVALID_ENUM is generated if buffer is not an accepted value.');
                gl.clearBufferfi(-1, 0, 1.0, 1);
                this.expectError(gl.INVALID_ENUM);
                gl.clearBufferfi(gl.FRAMEBUFFER, 0, 1.0, 1);
                this.expectError(gl.INVALID_ENUM);

                bufferedLogToConsole('gl.INVALID_ENUM is generated if buffer is not gl.DEPTH_STENCIL.');
                gl.clearBufferfi(gl.DEPTH, 0, 1.0, 1);
                this.expectError(gl.INVALID_ENUM);
                gl.clearBufferfi(gl.STENCIL, 0, 1.0, 1);
                this.expectError(gl.INVALID_ENUM);
                gl.clearBufferfi(gl.COLOR, 0, 1.0, 1);
                this.expectError(gl.INVALID_ENUM);

                bufferedLogToConsole('gl.INVALID_VALUE is generated if buffer is gl.DEPTH_STENCIL and drawBuffer is not zero.');
                gl.clearBufferfi(gl.DEPTH_STENCIL, 1, 1.0, 1);
                this.expectError(gl.INVALID_VALUE);

            }
        ));
        //*/
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'copy_buffer_sub_data', 'Invalid gl.copyBufferSubData() usage', gl,
            function() {
                var data = new Float32Array(32*32);
                var buf = {
                    r: gl.createBuffer(),
                    w: gl.createBuffer()
                };
                
                gl.bindBuffer(gl.COPY_READ_BUFFER, buf.r);
                gl.bufferData(gl.COPY_READ_BUFFER, 32, data, gl.DYNAMIC_COPY);
                gl.bindBuffer(gl.COPY_WRITE_BUFFER, buf.w);
                gl.bufferData(gl.COPY_WRITE_BUFFER, 32, data, gl.DYNAMIC_COPY);
                this.expectError(gl.NO_ERROR);
                
                gl.deleteBuffer(buf.w);
                gl.deleteBuffer(buf.r);
            }
        ));
        
        
        /*

	ES3F_ADD_API_CASE(copy_buffer_sub_data, "Invalid glCopyBufferSubData() usage",
		{
			deUint32				buf[2];
			std::vector<float>		data(32*32);

			glGenBuffers			(2, buf);
			glBindBuffer			(GL_COPY_READ_BUFFER, buf[0]);
			glBufferData			(GL_COPY_READ_BUFFER, 32, &data[0], GL_DYNAMIC_COPY);
			glBindBuffer			(GL_COPY_WRITE_BUFFER, buf[1]);
			glBufferData			(GL_COPY_WRITE_BUFFER, 32, &data[0], GL_DYNAMIC_COPY);
			expectError				(GL_NO_ERROR);

			m_log << TestLog::Section("", "GL_INVALID_VALUE is generated if any of readoffset, writeoffset or size is negative.");
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 0, -4);
			expectError				(GL_INVALID_VALUE);
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, -1, 0, 4);
			expectError				(GL_INVALID_VALUE);
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, -1, 4);
			expectError				(GL_INVALID_VALUE);
			m_log << TestLog::EndSection;

			m_log << TestLog::Section("", "GL_INVALID_VALUE is generated if readoffset + size exceeds the size of the buffer object bound to readtarget.");
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 0, 36);
			expectError				(GL_INVALID_VALUE);
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 24, 0, 16);
			expectError				(GL_INVALID_VALUE);
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 36, 0, 4);
			expectError				(GL_INVALID_VALUE);
			m_log << TestLog::EndSection;

			m_log << TestLog::Section("", "GL_INVALID_VALUE is generated if writeoffset + size exceeds the size of the buffer object bound to writetarget.");
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 0, 36);
			expectError				(GL_INVALID_VALUE);
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 24, 16);
			expectError				(GL_INVALID_VALUE);
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 36, 4);
			expectError				(GL_INVALID_VALUE);
			m_log << TestLog::EndSection;

			m_log << TestLog::Section("", "GL_INVALID_VALUE is generated if the same buffer object is bound to both readtarget and writetarget and the ranges [readoffset, readoffset + size) and [writeoffset, writeoffset + size) overlap.");
			glBindBuffer			(GL_COPY_WRITE_BUFFER, buf[0]);
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 16, 4);
			expectError				(GL_NO_ERROR);
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 0, 4);
			expectError				(GL_INVALID_VALUE);
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 16, 18);
			expectError				(GL_INVALID_VALUE);
			glBindBuffer			(GL_COPY_WRITE_BUFFER, buf[1]);
			m_log << TestLog::EndSection;

			m_log << TestLog::Section("", "GL_INVALID_OPERATION is generated if zero is bound to readtarget or writetarget.");
			glBindBuffer			(GL_COPY_READ_BUFFER, 0);
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 0, 16);
			expectError				(GL_INVALID_OPERATION);

			glBindBuffer			(GL_COPY_READ_BUFFER, buf[0]);
			glBindBuffer			(GL_COPY_WRITE_BUFFER, 0);
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 0, 16);
			expectError				(GL_INVALID_OPERATION);

			glBindBuffer			(GL_COPY_WRITE_BUFFER, buf[1]);
			m_log << TestLog::EndSection;

			m_log << TestLog::Section("", "GL_INVALID_OPERATION is generated if the buffer object bound to either readtarget or writetarget is mapped.");
			glMapBufferRange		(GL_COPY_READ_BUFFER, 0, 4, GL_MAP_READ_BIT);
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 0, 16);
			expectError				(GL_INVALID_OPERATION);
			glUnmapBuffer			(GL_COPY_READ_BUFFER);

			glMapBufferRange		(GL_COPY_WRITE_BUFFER, 0, 4, GL_MAP_READ_BIT);
			glCopyBufferSubData		(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 0, 16);
			expectError				(GL_INVALID_OPERATION);
			glUnmapBuffer			(GL_COPY_WRITE_BUFFER);
			m_log << TestLog::EndSection;

			glDeleteBuffers(2, buf);
		});

        //*/
        
        /*
        
        testGroup.addChild(new es3fApiCase.ApiCaseCallback(
            'function', 'description', gl,
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
