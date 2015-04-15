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

define(['framework/common/tcuTexture', 'framework/common/tcuTextureUtil', 'framework/common/tcuRGBA', 'framework/opengl/gluTextureUtil', 'framework/delibs/debase/deMath', 'framework/referencerenderer/rrShadingContext', 'framework/referencerenderer/rrFragmentPacket', 'framework/referencerenderer/rrVertexPacket', 'framework/referencerenderer/rrVertexAttrib', 'framework/opengl/gluShaderUtil', 'framework/opengl/simplereference/sglrReferenceContext'],
    function(tcuTexture, tcuTextureUtil, tcuRGBA, gluTextureUtil, deMath, rrShadingContext,  rrFragmentPacket,  rrVertexPacket,  rrVertexAttrib,  gluShaderUtil, sglrReferenceContext) {
    'use strict';

    /**
     * FlatColorShader inherits from sglrShaderProgram
     * @constructor
     * @param {gluShaderUtil.DataType} outputType
     */
    var FlatColorShader = function(outputType) {
        // TODO: implement
    };

    FlatColorShader.prototype.setColor = function() {
        // TODO: implement
    };

    FlatColorShader.prototype.shadeVertices = function() {
        // TODO: implement
    };

    FlatColorShader.prototype.shadeFragments = function() {
        // TODO: implement
    };

    /**
     * GradientShader inherits from sglrShaderProgram
     * @constructor
     * @param {gluShaderUtil.DataType} outputType
     */
    var GradientShader = function(outputType) {
        // TODO: implement
    };

    GradientShader.prototype.setGradient = function() {
        // TODO: implement
    };

    GradientShader.prototype.shadeVertices = function() {
        // TODO: implement
    };

    GradientShader.prototype.shadeFragments = function() {
        // TODO: implement
    };

    /**
     * For use in Texture2DShader
     * @constructor
     */
    var Input = function() {
        /** @type {number} */ this.unitNdx;
        /** @type {Array<number>} */ this.scale;
        /** @type {Array<number>} */ this.bias;
    };

    /**
     * Texture2DShader inherits from sglrShaderProgram
     * @constructor
     * @param {Array<gluShaderUtilDataType>} samplerTypes
     * @param {gluShaderUtil.DataType} outputType
     * @param {Array<number>} outScale - default [1.0, 1.0, 1.0, 1.0]
     * @param {Array<number>} outBias - default [0.0, 0.0, 0.0, 0.0]
     */
    var Texture2DShader = function(samplerTypes, outputType, outScale, outBias) {
        if (outScale === undefined) outScale = [1.0, 1.0, 1.0, 1.0];
        if (outBias === undefined) outBias = [0.0, 0.0, 0.0, 0.0];
        sglrShaderProgram.ShaderProgram.call(genTexture2DShaderDecl(samplerTypes, outputType)); // TODO: implement genTexture2DShaderDecl()
        /** @type {Array<Input>} */ this.m_inputs = [];
        /** @type {Array<number>} */ this.m_outScale = outScale;
        /** @type {Array<number>} */ this.m_outBias = outBias;
        /** @const {gluShaderUtil.DataType} */ this.m_outputType = outputType;
        for (var ndx = 0; ndx < samplerTypes.length; ndx++) {
            var input = new Input();
            input.unitNdx = ndx;
            input.scale = [1.0, 1.0, 1.0, 1.0];
            input.bias = [0.0, 0.0, 0.0, 0.0];
            this.m_inputs[ndx] = input;
        }
    };

    Texture2DShader.prototype = Object.create(sglrShaderProgram.ShaderProgram.prototype);
    Texture2DShader.prototype.constructor = Texture2DShader;

    /**
     * @param {number} inputNdx
     * @param {number} unitNdx
     */
    Texture2DShader.prototype.setUnit = function(inputNdx, unitNdx) {
        this.m_inputs[inputNdx].unitNdx = unitNdx;
    };

    /**
     * @param {number} inputNdx
     * @param {Array<number>} scale
     * @param {Array<number>} bias
     */
    Texture2DShader.prototype.setTexScaleBias = function(inputNdx, scale, bias) {
        this.m_inputs[inputNdx].scale = scale;
        this.m_inputs[inputNdx].bias = bias;
    };

    /**
     * @param {Array<number>} scale
     * @param {Array<number>} bias
     */
    Texture2DShader.prototype.setOutScaleBias = function(scale, bias) {
        this.m_outScale = scale;
        this.m_outBias = bias;
    };

    /**
     * @param {number} program
     */
    Texture2DShader.prototype.setUniforms = function(program) {
        gl.useProgram(program);

        for (var texNdx = 0; texNdx < this.m_inputs.length; texNdx++) {
            /** @type {string} */ var samplerName = 'u_sampler' + texNdx;
            /** @type {string} */ var scaleName = 'u_texScale' + texNdx;
            /** @type {string} */ var biasName = 'u_texBias' + texNdx;

            gl.uniform1i(gl.getUniformLocation(program, samplerName), this.m_inputs[texNdx].unitNdx);
            gl.uniform4fv(gl.getUniformLocation(program, scaleName), 1, this.m_inputs[texNdx].scale);
            gl.uniform4fv(gl.getUniformLocation(program, biasName), 1, this.m_inputs[texNdx].bias);
        }

        gl.uniform4fv(gl.getUniformLocation(program, 'u_outScale0'), 1, this.m_outScale);
        gl.uniform4fv(gl.getUniformLocation(program, 'u_outBias0'), 1, this.m_outBias);
    };

    /**
     * @param {rrVertexAttrib.VertexAttrib} inputs
     * @param {rrVertexPacket.VertexPacket} packets
     * @param {number} numPackets
     */
    Texture2DShader.prototype.shadeVertices = function(inputs, packets, numPackets) {
        // TODO: implement rrVertexAttrib.readVertexAttribFloat
        for (var packetNdx = 0; packetNdx < numPackets; ++packetNdx) {
            /** @type {rrVertexPacket.VertexPacket} */ var packet = packets[packetNdx];
            packet.position = rrVertexAttrib.readVertexAttribFloat(inputs[0], packet.instanceNdx, packet.vertexNdx);
            packet.outputs[0] = rrVertexAttrib.readVertexAttribFloat(inputs[1], packet.instanceNdx, packet.vertexNdx);
        }
    };

    /**
     * @param {rrFragmentPacket.FragmentPacket} packets
     * @param {number} numPackets
     * @param {rrShadingContext.FragmentShadingContext} context
     */
    Texture2DShader.prototype.shadeFragments = function(packets, numPackets, context) {
        /** @type {number} */ var sval = this.m_uniforms[0].value;
        /** @type {number} */ var bval = this.m_uniforms[1].value;
        /** @type {Array<number>} */ var outScale = [sval, sval, sval, sval];
        /** @type {Array<number>} */ var outBias = [bval, bval, bval, bval];

        /** @type {Array<number>} */ var texCoords = [];
        /** @type {Array<number>} */ var colors = [];

        for (var packetNdx = 0; packetNdx < numPackets; ++packetNdx) {
            // setup tex coords
            for (var fragNdx = 0; fragNdx < 4; ++fragNdx) {
                /** @const {Array<number>} */ var coord = rrShadingContext.readTriangleVarying(packets[packetNdx], context, 0, fragNdx);
                texCoords[fragNdx] = [coord[0], coord[1]];
            }

            // clear result
            for (var fragNdx = 0; fragNdx < 4; ++fragNdx)
                colors[fragNdx] = [0.0, 0.0, 0.0, 0.0];

            // sample each texture
            for (var ndx = 0; ndx < this.m_inputs.length; ndx++) {
                /** @const {sglrReferenceContext.Texture2D} */ var tex = this.m_uniforms[2 + ndx * 3].sampler.tex2D;

                sval = this.m_uniforms[2 + ndx * 3 + 1].value;
                bval = this.m_uniforms[2 + ndx * 3 + 2].value;
                /** @const {Array<number>} */ var scale = [sval, sval, sval, sval];
                /** @const {Array<number>} */ var bias = [bval, bval, bval, bval];
                /** @const {Array<number>} */ var tmpColors = [];

                tex.sample4(tmpColors, texCoords);

                for (var fragNdx = 0; fragNdx < 4; ++fragNdx)
                    colors[fragNdx] += tmpColors[fragNdx] * scale + bias;
            }

            // write out
            for (var fragNdx = 0; fragNdx < 4; ++fragNdx) {
                /** @const {Array<number>} */ var color = colors[fragNdx] * outScale + outBias;
                /** @const {Array<number>} */ var icolor = castVectorSaturate(color); // TODO: castVectorSaturate()
                /** @const {Array<number>} */ var uicolor = castVectorSaturate(color);

                if (this.m_outputType == glu.TYPE_FLOAT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, color);
                else if (this.m_outputType == glu.TYPE_INT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, icolor);
                else if (this.m_outputType == glu.TYPE_UINT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, uicolor);
                else
                    DE_ASSERT(false);
            }
        }
    };

    /**
     * TextureCubeShader inherits from sglrShaderProgram
     * @constructor
     * @param {gluShaderUtil.DataType} samplerType
     * @param {glu.DataType} outputType
     */
    var TextureCubeShader = function(samplerType, outputType) {
        // TODO: implement
    };

    TextureCubeShader.prototype.setFace = function() {
        // TODO: implement
    };

    TextureCubeShader.prototype.setTexScaleBias = function() {
        // TODO: implement
    };

    TextureCubeShader.prototype.setUniforms = function() {
        // TODO: implement
    };

    TextureCubeShader.prototype.shadeVertices = function() {
        // TODO: implement
    };

    TextureCubeShader.prototype.shadeFragments = function() {
        // TODO: implement
    };

    /**
     * Texture2DArrayShader inherits from sglrShaderProgram
     * @constructor
     * @param {gluShaderUtil.DataType} samplerType
     * @param {glu.DataType} outputType
     */
    var Texture2DArrayShader = function(samplerType, outputType) {
        // TODO: implement
    };

    Texture2DArrayShader.prototype.setLayer = function() {
        // TODO: implement
    };

    Texture2DArrayShader.prototype.setTexScaleBias = function() {
        // TODO: implement
    };

    Texture2DArrayShader.prototype.setUniforms = function() {
        // TODO: implement
    };

    Texture2DArrayShader.prototype.shadeVertices = function() {
        // TODO: implement
    };

    Texture2DArrayShader.prototype.shadeFragments = function() {
        // TODO: implement
    };

    /**
     * Texture3DShader inherits from sglrShaderProgram
     * @constructor
     * @param {gluShaderUtil.DataType} samplerType
     * @param {glu.DataType} outputType
     */
    var Texture3DShader = function(samplerType, outputType) {
        // TODO: implement
    };

    Texture3DShader.prototype.setDepth = function() {
        // TODO: implement
    };

    Texture3DShader.prototype.setTexScaleBias = function() {
        // TODO: implement
    };

    Texture3DShader.prototype.setUniforms = function() {
        // TODO: implement
    };

    Texture3DShader.prototype.shadeVertices = function() {
        // TODO: implement
    };

    Texture3DShader.prototype.shadeFragments = function() {
        // TODO: implement
    };

    /**
     * DepthGradientShader inherits from sglrShaderProgram
     * @constructor
     * @param {gluShaderUtil.DataType} samplerType
     */
    var DepthGradientShader = function(samplerType) {
        // TODO: implement
    };

    DepthGradientShader.prototype.setUniforms = function() {
        // TODO: implement
    };

    DepthGradientShader.prototype.shadeVertices = function() {
        // TODO: implement
    };

    DepthGradientShader.prototype.shadeFragments = function() {
        // TODO: implement
    };


    var getFormatName = function(format) {
        switch (format) {
            case gl.RGB565: return 'rgb565';
            case gl.RGB5_A1: return 'rgb5_a1';
            case gl.RGBA4: return 'rgba4';
            case gl.DEPTH_COMPONENT16: return 'depth_component16';
            case gl.STENCIL_INDEX8: return 'stencil_index8';
            case gl.RGBA32F: return 'rgba32f';
            case gl.RGBA32I: return 'rgba32i';
            case gl.RGBA32UI: return 'rgba32ui';
            case gl.RGBA16F: return 'rgba16f';
            case gl.RGBA16I: return 'rgba16i';
            case gl.RGBA16UI: return 'rgba16ui';
            case gl.RGBA8: return 'rgba8';
            case gl.RGBA8I: return 'rgba8i';
            case gl.RGBA8UI: return 'rgba8ui';
            case gl.SRGB8_ALPHA8: return 'srgb8_alpha8';
            case gl.RGB10_A2: return 'rgb10_a2';
            case gl.RGB10_A2UI: return 'rgb10_a2ui';
            case gl.RGBA8_SNORM: return 'rgba8_snorm';
            case gl.RGB8: return 'rgb8';
            case gl.R11F_G11F_B10F: return 'r11f_g11f_b10f';
            case gl.RGB32F: return 'rgb32f';
            case gl.RGB32I: return 'rgb32i';
            case gl.RGB32UI: return 'rgb32ui';
            case gl.RGB16F: return 'rgb16f';
            case gl.RGB16I: return 'rgb16i';
            case gl.RGB16UI: return 'rgb16ui';
            case gl.RGB8_SNORM: return 'rgb8_snorm';
            case gl.RGB8I: return 'rgb8i';
            case gl.RGB8UI: return 'rgb8ui';
            case gl.SRGB8: return 'srgb8';
            case gl.RGB9_E5: return 'rgb9_e5';
            case gl.RG32F: return 'rg32f';
            case gl.RG32I: return 'rg32i';
            case gl.RG32UI: return 'rg32ui';
            case gl.RG16F: return 'rg16f';
            case gl.RG16I: return 'rg16i';
            case gl.RG16UI: return 'rg16ui';
            case gl.RG8: return 'rg8';
            case gl.RG8I: return 'rg8i';
            case gl.RG8UI: return 'rg8ui';
            case gl.RG8_SNORM: return 'rg8_snorm';
            case gl.R32F: return 'r32f';
            case gl.R32I: return 'r32i';
            case gl.R32UI: return 'r32ui';
            case gl.R16F: return 'r16f';
            case gl.R16I: return 'r16i';
            case gl.R16UI: return 'r16ui';
            case gl.R8: return 'r8';
            case gl.R8I: return 'r8i';
            case gl.R8UI: return 'r8ui';
            case gl.R8_SNORM: return 'r8_snorm';
            case gl.DEPTH_COMPONENT32F: return 'depth_component32f';
            case gl.DEPTH_COMPONENT24: return 'depth_component24';
            case gl.DEPTH32F_STENCIL8: return 'depth32f_stencil8';
            case gl.DEPTH24_STENCIL8: return 'depth24_stencil8';

            default:
                throw new Error('Unknown format in getFromatName()');
        }
    };

    var getFramebufferReadFormat = function(format) {
        switch (tcuTextureUtil.getTextureChannelClass(format.type)) {
            case tcuTextureUtil.TextureChannelClass.FLOATING_POINT:
                return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA, tcuTexture.ChannelType.FLOAT);

            case tcuTextureUtil.TextureChannelClass.SIGNED_FIXED_POINT:
            case tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT:
                return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA, tcuTexture.ChannelType.UNORM_INT8);

            case tcuTextureUtil.TextureChannelClass.UNSIGNED_INTEGER:
                return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA, tcuTexture.ChannelType.UNSIGNED_INT32);

            case tcuTextureUtil.TextureChannelClass.SIGNED_INTEGER:
                return new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA, tcuTexture.ChannelType.SIGNED_INT32);

            default:
                throw new Error('Unknown format in getFramebufferReadFormat()');
        }
    };

    /**
     * @param {sglr::Context} ctx
     * @param {TextureFormat} format
     * @param {Array<number>} value
     */
    var clearColorBuffer = function(ctx, format, value) {
        // TODO: implement (ctx)
        /** @const @type {tcuTextureUtil.TextureChannelClass} */
        var fmtClass = tcuTextureUtil.getTextureChannelClass(format.type);

        switch (fmtClass) {
            case tcuTextureUtil.TextureChannelClass.FLOATING_POINT:
            case tcuTextureUtil.TextureChannelClass.SIGNED_FIXED_POINT:
            case tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT:
                ctx.clearBufferfv(gl.COLOR, 0, value.getPtr());
                break;

            case tcuTextureUtil.TextureChannelClass.UNSIGNED_INTEGER:
                ctx.clearBufferuiv(gl.COLOR, 0, value.asUint().getPtr());
                break;

            case tcuTextureUtil.TextureChannelClass.SIGNED_INTEGER:
                ctx.clearBufferiv(gl.COLOR, 0, value.asInt().getPtr());
                break;

            default:
                DE_ASSERT(false);
        }
    };
    /**
     * @param {tcuTexture.TextureFormat} format
     * @return {tcuRGBA.RGBA}
     */
    var getThresholdFromTextureFormat = function(format) {
        /** @const @type {Array<number>} */ var bits = tcuTextureUtil.getTextureFormatMantissaBitDepth(format);
        return tcuRGBA.newRGBAComponents(
            calculateU8ConversionError(bits[0]),
            calculateU8ConversionError(bits[1]),
            calculateU8ConversionError(bits[2]),
            calculateU8ConversionError(bits[3])
        );
    };

    /**
     * @param {number} glFormat
     * @return {tcuRGBA}
     */
    var getFormatThreshold = function(glFormat) {
        /** @const @type {tcuTexture.TextureFormat} */ var format = gluTextureUtil.mapGLInternalFormat(glFormat);
        return getThresholdFromTextureFormat(format);
    };

    /**
     * @param {number} srcBits
     * @return {number}
     */
    var getToSRGB8ConversionError = function(srcBits) {
        // \note These are pre-computed based on simulation results.
        /* @const @type {Array<number>} */ var errors = [
            1,        // 0 bits - rounding
            255,    // 1 bits
            157,    // 2 bits
            106,    // 3 bits
            74,        // 4 bits
            51,        // 5 bits
            34,        // 6 bits
            22,        // 7 bits
            13,        // 8 bits
            7,        // 9 bits
            4,        // 10 bits
            3,        // 11 bits
            2        // 12 bits
            // 1 from this on
        ];

        DE_ASSERT(srcBits >= 0);
        if (srcBits < errors.length)
            return errors[srcBits];
        else
            return 1;
    };

    /**
     * @param {tcuTexture.TextureFormat} src
     * @param {tcuTexture.TextureFormat} dst
     * @return {tcuRGBA.RGBA}
     */
    var getToSRGBConversionThreshold = function(src, dst) {
        // Only SRGB8 and SRGB8_ALPHA8 formats are supported.
        DE_ASSERT(dst.type == tcuTexture.ChannelType.UNORM_INT8);
        DE_ASSERT(dst.order == tcuTexture.ChannelOrder.sRGB || dst.order == tcuTexture.ChannelOrder.sRGBA);

        /** @const @type {Array<number>} */ var bits = tcuTextureUtil.getTextureFormatMantissaBitDepth(src);
        /** @const @type {boolean} */ var dstHasAlpha = dst.order == tcuTexture.ChannelOrder.sRGBA;

        return tcuRGBA.newRGBAComponents(
            getToSRGB8ConversionError(bits[0]),
            getToSRGB8ConversionError(bits[1]),
            getToSRGB8ConversionError(bits[2]),
            dstHasAlpha ? calculateU8ConversionError(bits[3]) : 0);
    };

    /**
     * @param {number} srcBits
     * @return {number}
     */
    var calculateU8ConversionError = function(srcBits) {
        if (srcBits > 0) {
            /** @const @type {number} */ var clampedBits = deMath.clamp(srcBits, 0, 8);
            /** @const @type {number} */ var srcMaxValue = Math.max((1 << clampedBits) - 1, 1);
            /** @const @type {number} */ var error = Math.floor(Math.ceil(255.0 * 2.0 / srcMaxValue));

            return deMath.clamp(error, 0, 255);
        }
        else
            return 1;
    };

    return {
        getFormatName: getFormatName,
        getFramebufferReadFormat: getFramebufferReadFormat,
        FlatColorShader: FlatColorShader,
        GradientShader: GradientShader,
        Texture2DShader: Texture2DShader,
        TextureCubeShader: TextureCubeShader,
        Texture2DArrayShader: Texture2DArrayShader,
        Texture3DShader: Texture3DShader,
        DepthGradientShader: DepthGradientShader,
        getFormatThreshold: getFormatThreshold,
        getToSRGBConversionThreshold: getToSRGBConversionThreshold
    };

});
