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

define(['framework/common/tcuTexture', 'framework/common/tcuTextureUtil'],
     function(tcuTexture, tcuTextureUtil) {
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
     * Texture2DShader inherits from sglrShaderProgram
     * @constructor
     * @param {Array<gluShaderUtilDataType>} samplerTypes
     * @param {gluShaderUtil.DataType} outputType
     * @const @param {Array<number>} outScale - default [1.0, 1.0, 1.0, 1.0]
     * @const @param {Array<number>} outBias - default [0.0, 0.0, 0.0, 0.0]
     */
    var Texture2DShader = function(samplerTypes, outputType, outScale, outBias) {
        if (outScale === undefined) outScale = [1.0, 1.0, 1.0, 1.0];
        if (outBias === undefined) outBias = [0.0, 0.0, 0.0, 0.0];
        // TODO: implement
    };

    Texture2DShader.prototype.setUnit = function() {
        // TODO: implement
    };

    Texture2DShader.prototype.setTexScaleBias = function() {
        // TODO: implement
    };

    Texture2DShader.prototype.setOutScaleBias = function() {
        // TODO: implement
    };

    Texture2DShader.prototype.setUniforms = function() {
        // TODO: implement
    };

    Texture2DShader.prototype.shadeVertices = function() {
        // TODO: implement
    };

    Texture2DShader.prototype.shadeFragments = function() {
        // TODO: implement
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
        switch (tcuTextureUtil.getTextureChannelClass(format.type))
        {
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
                // DE_ASSERT(!"Unknown format");
            throw new Error('Unknown format in getFramebufferReadFormat()');
                return new tcuTexture.TextureFormat();
        }
    };

    return {
        getFormatName: getFormatName,
        getFramebufferReadFormat: getFramebufferReadFormat,
        FlatColorShader : FlatColorShader,
        GradientShader : GradientShader,
        Texture2DShader : Texture2DShader,
        TextureCubeShader : TextureCubeShader,
        Texture2DArrayShader : Texture2DArrayShader,
        Texture3DShader : Texture3DShader,
        DepthGradientShader : DepthGradientShader
    };

});
