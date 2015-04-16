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


define(['framework/common/tcuTexture', 'framework/common/tcuTextureUtil', 'framework/common/tcuRGBA', 'framework/opengl/gluTextureUtil', 'framework/delibs/debase/deMath', 'framework/referencerenderer/rrShadingContext', 'framework/referencerenderer/rrFragmentPacket', 'framework/referencerenderer/rrVertexPacket', 'framework/referencerenderer/rrVertexAttrib', 'framework/opengl/gluShaderUtil', 'framework/opengl/simplereference/sglrReferenceContext', 'framework/opengl/simplereference/sglrShaderProgram', 'framework/referencerenderer/rrGenericVector'],
    function(tcuTexture, tcuTextureUtil, tcuRGBA, gluTextureUtil, deMath, rrShadingContext,  rrFragmentPacket,  rrVertexPacket,  rrVertexAttrib,  gluShaderUtil, sglrReferenceContext, sglrShaderProgram, rrGenericVector) {
    'use strict';

    /**
     * @param {gluShaderUtil.DataType} type
     * @return {rrGenericVector.GenericVecType}
     */
    var mapDataTypeToGenericVecType = function(type) {
        switch (type) {
            case gluShaderUtil.DataType.FLOAT_VEC4: return rrGenericVector.GenericVecType.FLOAT;
            case gluShaderUtil.DataType.INT_VEC4: return rrGenericVector.GenericVecType.INT32;
            case gluShaderUtil.DataType.UINT_VEC4: return rrGenericVector.GenericVecType.UINT32;
            default:
                DE_ASSERT(false);
        }
    };

    /**
     * @param {Array<number>} input
     * @param {tcuTexture.deTypes} type
     * @return {Array<number>}
     */
    var castVectorSaturate = function(input, type) {
        return [
            (input[0] + 0.5 >= type.max()) ? (type.max()) : ((input[0] - 0.5 <= type.min()) ? (type.min()) : (T(input[0]))),
            (input[1] + 0.5 >= type.max()) ? (type.max()) : ((input[1] - 0.5 <= type.min()) ? (type.min()) : (T(input[1]))),
            (input[2] + 0.5 >= type.max()) ? (type.max()) : ((input[2] - 0.5 <= type.min()) ? (type.min()) : (T(input[2]))),
            (input[3] + 0.5 >= type.max()) ? (type.max()) : ((input[3] - 0.5 <= type.min()) ? (type.min()) : (T(input[3])))
        ];
    };

    /**
     * FlatColorShader inherits from sglrShaderProgram
     * @constructor
     * @extends {sglrShaderProgram.ShaderProgram}
     * @param {gluShaderUtil.DataType} outputType
     */
    var FlatColorShader = function(outputType) {
        /** @type {sglrShaderProgram.ShaderProgramDeclaration} */
        var decl = new sglrShaderProgram.ShaderProgramDeclaration();
        /** @type {gluShaderUtil.DataType} */ this.m_outputType = outputType;

        decl.pushVertexAttribute('a_position', rrGenericVector.GenericVecType.FLOAT);
        decl.pushVertexToFragmentVarying(rrGenericVector.GenericVecType.FLOAT);
        decl.pushFragmentOutput(mapDataTypeToGenericVecType(outputType));
        decl.pushUniform('u_color', gluShaderUtil.DataType.FLOAT_VEC4);
        decl.pushVertexSource(
                            '#version 300 es\n' +
                            'in highp vec4 a_position;\n' +
                            'void main (void)\n' +
                            '{\n' +
                            '    gl_Position = a_position;\n' +
                            '}\n');
        decl.pushFragmentSource('#version 300 es\n' +
                                'uniform highp vec4 u_color;\n' +
                                'layout(location = 0) out highp ' + gluShaderUtil.getDataTypeName(outputType) + ' o_color;\n' +
                                'void main (void)\n' +
                                '{\n' +
                                '    o_color = ' + gluShaderUtil.getDataTypeName(outputType) + '(u_color);\n' +
                                '}\n');
        sglrShaderProgram.ShaderProgram.call(this, decl);
    };

    FlatColorShader.prototype = Object.create(sglrShaderProgram.ShaderProgram.prototype);
    FlatColorShader.prototype.constructor = FlatColorShader;

    /**
     * @param {Context} context
     * @param {number} program
     * @param {Array<number>} color
     */
    FlatColorShader.prototype.setColor = function(context, program, color) {
        /** @type {number} */ var location = context.getUniformLocation(program, 'u_color');

        context.useProgram(program);
        context.uniform4fv(location, 1, color);
    };

    /**
     * @param {rrVertexAttrib.VertexAttrib} inputs
     * @param {rrVertexPacket.VertexPacket} packets
     * @param {number} numPackets
     */
    FlatColorShader.prototype.shadeVertices = function(inputs, packets, numPackets) {
        for (var packetNdx = 0; packetNdx < numPackets; ++packetNdx) {
            /** @type {rrVertexPacket.VertexPacket} */ var packet = packets[packetNdx];
            packet.position = rrVertexAttrib.readVertexAttribFloat(inputs[0], packet.instanceNdx, packet.vertexNdx);
        }
    };

    /**
     * @param {rrFragmentPacket.FragmentPacket} packets
     * @param {number} numPackets
     * @param {rrShadingContext.FragmentShadingContext} context
     */
    FlatColorShader.prototype.shadeFragments = function(packets, numPackets, context) {
        var cval = this.m_uniforms[0].value;
        /** @const {Array<number>} */ var color = [cval, cval, cval, cval];
        /** @const {Array<number>} */ var icolor = castVectorSaturate(color, tcuTexture.deTypes.deInt32);
        /** @const {Array<number>} */ var uicolor = castVectorSaturate(color, tcuTexture.deTypes.deUint32);

        if (this.m_outputType == gluShaderUtil.DataType.FLOAT_VEC4)
        {
            for (var packetNdx = 0; packetNdx < numPackets; ++packetNdx)
                for (var fragNdx = 0; fragNdx < 4; ++fragNdx)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, color);
        }
        else if (this.m_outputType == gluShaderUtil.DataType.INT_VEC4)
        {
            for (var packetNdx = 0; packetNdx < numPackets; ++packetNdx)
                for (var fragNdx = 0; fragNdx < 4; ++fragNdx)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, icolor);
        }
        else if (this.m_outputType == gluShaderUtil.DataType.UINT_VEC4)
        {
            for (var packetNdx = 0; packetNdx < numPackets; ++packetNdx)
                for (var fragNdx = 0; fragNdx < 4; ++fragNdx)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, uicolor);
        }
        else
            DE_ASSERT(false);
    };

    /**
     * GradientShader inherits from sglrShaderProgram
     * @constructor
     * @extends {sglrShaderProgram.ShaderProgram}
     * @param {gluShaderUtil.DataType} outputType
     */
    var GradientShader = function(outputType) {
        /** @type {sglrShaderProgram.ShaderProgramDeclaration} */
        var decl = new sglrShaderProgram.ShaderProgramDeclaration();
        /** @type {gluShaderUtil.DataType} */ this.m_outputType = outputType;
        decl.pushVertexAttribute('a_position', rrGenericVector.GenericVecType.FLOAT);
        decl.pushVertexAttribute('a_coord', rrGenericVector.GenericVecType.FLOAT);
        decl.pushVertexToFragmentVarying(rrGenericVector.GenericVecType.FLOAT);
        decl.pushFragmentOutput(mapDataTypeToGenericVecType(outputType));
        decl.pushUniform('u_gradientMin', gluShaderUtil.DataType.FLOAT_VEC4);
        decl.pushUniform('u_gradientMax', gluShaderUtil.DataType.FLOAT_VEC4);
        decl.pushVertexSource('#version 300 es\n' +
                              'in highp vec4 a_position;\n' +
                              'in highp vec4 a_coord;\n' +
                              'out highp vec4 v_coord;\n' +
                              'void main (void)\n' +
                              '{\n' +
                              '    gl_Position = a_position;\n' +
                              '    v_coord = a_coord;\n' +
                              '}\n');
        decl.pushFragmentSource('#version 300 es\n' +
                                'in highp vec4 v_coord;\n' +
                                'uniform highp vec4 u_gradientMin;\n' +
                                'uniform highp vec4 u_gradientMax;\n' +
                                'layout(location = 0) out highp ' + gluShaderUtil.getDataTypeName(outputType) + ' o_color;\n' +
                                'void main (void)\n' +
                                '{\n' +
                                '    highp float x = v_coord.x;\n' +
                                '    highp float y = v_coord.y;\n' +
                                '    highp float f0 = (x + y) * 0.5;\n' +
                                '    highp float f1 = 0.5 + (x - y) * 0.5;\n' +
                                '    highp vec4 fv = vec4(f0, f1, 1.0f-f0, 1.0f-f1);\n' +
                                '    o_color = ' + gluShaderUtil.getDataTypeName(outputType) + '(u_gradientMin + (u_gradientMax-u_gradientMin)*fv);\n' +
                                '}\n');
        sglrShaderProgram.ShaderProgram.call(this, decl);
    };

    GradientShader.prototype = Object.create(sglrShaderProgram.ShaderProgram.prototype);
    GradientShader.prototype.constructor = GradientShader;

    /**
     * @param {Context} ctx
     * @param {number} program
     * @param {Array<number>} gradientMin
     * @param {Array<number>} gradientMax
     */
    GradientShader.prototype.setGradient = function(ctx, program, gradientMin, gradientMax) {
        ctx.useProgram(program);
        ctx.uniform4fv(ctx.getUniformLocation(program, 'u_gradientMin'), 1, gradientMin);
        ctx.uniform4fv(ctx.getUniformLocation(program, 'u_gradientMax'), 1, gradientMax);
    };

    /**
     * @param {rrVertexAttrib.VertexAttrib} inputs
     * @param {rrVertexPacket.VertexPacket} packets
     * @param {number} numPackets
     */
    GradientShader.prototype.shadeVertices = function(inputs, packets, numPackets) {
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
    GradientShader.prototype.shadeFragments = function(packets, numPackets, context) {
        var mnval = this.m_uniforms[0].value;
        var mxval = this.m_uniforms[1].value;
        /** @const {Array<number>} */ var gradientMin = [mnval, mnval, mnval, mnval];
        /** @const {Array<number>} */ var gradientMax = [mxval, mxval, mxval, mxval];

        for (var packetNdx = 0; packetNdx < numPackets; ++packetNdx)
        for (var fragNdx = 0; fragNdx < 4; ++fragNdx) {
            /** @const {Array<number>} */ var coord = rrShadingContext.readTriangleVarying(packets[packetNdx], context, 0, fragNdx);
            /** @const {number} */ var x = coord[0];
            /** @const {number} */ var y = coord[1];
            /** @const {number} */ var f0 = (x + y) * 0.5;
            /** @const {number} */ var f1 = 0.5 + (x - y) * 0.5;
            /** @const {Array<number>} */ var fv = [f0, f1, 1.0 - f0, 1.0 - f1];

            /** @const {Array<number>} */ var color = deMath.add(gradientMin, deMath.multiply(deMath.subtract(gradientMax, gradientMin), fv));
            /** @const {Array<number>} */ var icolor = castVectorSaturate(color, tcuTexture.deTypes.deInt32);
            /** @const {Array<number>} */ var uicolor = castVectorSaturate(color, tcuTexture.deTypes.deUint32);

            if (this.m_outputType == gluShaderUtil.DataType.FLOAT_VEC4)
                rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, color);
            else if (this.m_outputType == gluShaderUtil.DataType.INT_VEC4)
                rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, icolor);
            else if (this.m_outputType == gluShaderUtil.DataType.UINT_VEC4)
                rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, uicolor);
            else
                DE_ASSERT(false);
        }
    };

    /**
    * @param {Array<gluShaderUtil.DataType>} samplerTypes
    * @param {gluShaderUtil.DataType} outputType
    * @return {string}
     */
    var genTexFragmentShader = function(samplerTypes, outputType) {
        /** @type {string} */ var precision = 'highp';
        /** @type {string} */ var src = '';

        src = '#version 300 es\n' +
              'layout(location = 0) out highp ' + gluShaderUtil.getDataTypeName(outputType) + ' o_color0;\n' +
              'in highp vec2 v_coord;\n';

        for (var samplerNdx = 0; samplerNdx < samplerTypes.length; samplerNdx++) {
            src += 'uniform ' + precision + ' ' + gluShaderUtil.getDataTypeName(samplerTypes[samplerNdx]) + ' u_sampler' + samplerNdx + ';\n' +
                   'uniform ' + precision + ' vec4 u_texScale' + samplerNdx + ';\n' +
                   'uniform ' + precision + ' vec4 u_texBias' + samplerNdx + ';\n';
        }

        // Output scale & bias
        src += 'uniform ' + precision + ' vec4 u_outScale0;\n' +
               'uniform ' + precision + ' vec4 u_outBias0;\n';

        src += '\n' +
               'void main (void)\n' +
               '{\n' +
               '    ' << precision << ' vec4 out0 = vec4(0.0);\n';

        // Texture input fetch and combine.
        for (var inNdx = 0; inNdx < samplerTypes.length; inNdx++)
            src += '\tout0 += vec4(' +
                   'texture(u_sampler' + inNdx + ', v_coord)) * u_texScale' + inNdx + ' + u_texBias' + inNdx + ';\n';

        // Write output.
        src += '    o_color0 = ' + gluShaderUtil.getDataTypeName(outputType) + '(out0 * u_outScale0 + u_outBias0);\n' +
               '}\n';

        return src;
    };

    /**
     * @param {Array<gluShaderUtil.DataType>} samplerTypes
     * @param {gluShaderUtil.DataType} outputType
     * @return {sglrShaderProgram.ShaderProgramDeclaration}
     */
    var genTexture2DShaderDecl = function(samplerTypes, outputType) {
        /** @type {sglrShaderProgram.ShaderProgramDeclaration} */
        var decl = new sglrShaderProgram.ShaderProgramDeclaration();

        decl.pushVertexAttribute('a_position', rrGenericVector.GenericVecType.FLOAT);
        decl.pushVertexAttribute('a_coord', rrGenericVector.GenericVecType.FLOAT);
        decl.pushVertexToFragmentVarying(rrGenericVector.GenericVecType.FLOAT);
        decl.pushFragmentOutput(mapDataTypeToGenericVecType(outputType));

        decl.pushVertexSource(
            '#version 300 es\n' +
            'in highp vec4 a_position;\n' +
            'in highp vec2 a_coord;\n' +
            'out highp vec2 v_coord;\n' +
            'void main(void)\n' +
            '{\n' +
            '    gl_Position = a_position;\n' +
            '    v_coord = a_coord;\n' +
            '}\n');

        decl.pushFragmentSource(genTexFragmentShader(samplerTypes, outputType));

        decl.pushUniform('u_outScale0', gluShaderUtil.DataType.FLOAT_VEC4);
        decl.pushUniform('u_outBias0', gluShaderUtil.DataType.FLOAT_VEC4);

        for (var ndx = 0; ndx < samplerTypes.length; ++ndx) {
            decl.pushUniform('u_sampler' + ndx, samplerTypes[ndx]);
            decl.pushUniform('u_texScale' + ndx, gluShaderUtil.DataType.VEC4);
            decl.pushUniform('u_texBias' + ndx, gluShaderUtil.DataType.VEC4);
        }

        return decl;
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
     * @extends {sglrShaderProgram.ShaderProgram}
     * @param {Array<gluShaderUtilDataType>} samplerTypes
     * @param {gluShaderUtil.DataType} outputType
     * @param {Array<number>} outScale - default [1.0, 1.0, 1.0, 1.0]
     * @param {Array<number>} outBias - default [0.0, 0.0, 0.0, 0.0]
     */
    var Texture2DShader = function(samplerTypes, outputType, outScale, outBias) {
        if (outScale === undefined) outScale = [1.0, 1.0, 1.0, 1.0];
        if (outBias === undefined) outBias = [0.0, 0.0, 0.0, 0.0];
        sglrShaderProgram.ShaderProgram.call(this, genTexture2DShaderDecl(samplerTypes, outputType));
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
     * @param {Context} context
     * @param {number} program
     */
    Texture2DShader.prototype.setUniforms = function(context, program) {
        context.useProgram(program);

        for (var texNdx = 0; texNdx < this.m_inputs.length; texNdx++) {
            /** @type {string} */ var samplerName = 'u_sampler' + texNdx;
            /** @type {string} */ var scaleName = 'u_texScale' + texNdx;
            /** @type {string} */ var biasName = 'u_texBias' + texNdx;

            context.uniform1i(context.getUniformLocation(program, samplerName), this.m_inputs[texNdx].unitNdx);
            context.uniform4fv(context.getUniformLocation(program, scaleName), 1, this.m_inputs[texNdx].scale);
            context.uniform4fv(context.getUniformLocation(program, biasName), 1, this.m_inputs[texNdx].bias);
        }

        context.uniform4fv(context.getUniformLocation(program, 'u_outScale0'), 1, this.m_outScale);
        context.uniform4fv(context.getUniformLocation(program, 'u_outBias0'), 1, this.m_outBias);
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

        /** @type {Array<Array<number>>} */ var texCoords = [[], [], [], []];
        /** @type {Array<Array<number>>} */ var colors = [[], [], [], []];

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
                /** @const {Array<Array<number>>} */ var tmpColors = [[], [], [], []];

                tex.sample4(tmpColors, texCoords);

                for (var fragNdx = 0; fragNdx < 4; ++fragNdx)
                    colors[fragNdx] = deMath.add(colors[fragNdx], deMath.add(deMath.multiply(tmpColors[fragNdx], scale), bias));
            }

            // write out
            for (var fragNdx = 0; fragNdx < 4; ++fragNdx) {
                /** @const {Array<number>} */ var color = deMath.add(deMath.multiply(colors[fragNdx], outScale), outBias);
                /** @const {Array<number>} */ var icolor = castVectorSaturate(color, tcuTexture.deTypes.deInt32);
                /** @const {Array<number>} */ var uicolor = castVectorSaturate(color, tcuTexture.deTypes.deUint32);

                if (this.m_outputType == gluShaderUtil.DataType.FLOAT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, color);
                else if (this.m_outputType == gluShaderUtil.DataType.INT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, icolor);
                else if (this.m_outputType == gluShaderUtil.DataType.UINT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, uicolor);
                else
                    DE_ASSERT(false);
            }
        }
    };

    /**
     * TextureCubeShader inherits from sglrShaderProgram
     * @constructor
     * @extends {sglrShaderProgram.ShaderProgram}
     * @param {gluShaderUtil.DataType} samplerType
     * @param {gluShaderUtil.DataType} outputType
     */
    var TextureCubeShader = function(samplerType, outputType) {
        /** @type {sglrShaderProgram.ShaderProgramDeclaration} */
        var decl = new sglrShaderProgram.ShaderProgramDeclaration();
        decl.pushVertexAttribute('a_position', rrGenericVector.GenericVecType.FLOAT);
        decl.pushVertexAttribute('a_coord', rrGenericVector.GenericVecType.FLOAT);
        decl.pushVertexToFragmentVarying(rrGenericVector.GenericVecType.FLOAT);
        decl.pushFragmentOutput(mapDataTypeToGenericVecType(outputType));
        decl.pushUniform('u_coordMat', gluShaderUtil.DataType.FLOAT_MAT3);
        decl.pushUniform('u_sampler0', samplerType);
        decl.pushUniform('u_scale', gluShaderUtil.DataType.FLOAT_VEC4);
        decl.pushUniform('u_bias', gluShaderUtil.DataType.FLOAT_VEC4);
        decl.pushVertexSource(
            '#version 300 es\n' +
            'in highp vec4 a_position;\n' +
            'in mediump vec2 a_coord;\n' +
            'uniform mat3 u_coordMat;\n' +
            'out mediump vec3 v_coord;\n' +
            'void main (void)\n' +
            '{\n' +
            '    gl_Position = a_position;\n' +
            '    v_coord = u_coordMat * vec3(a_coord, 1.0);\n' +
            '}\n');
        decl.pushFragmentSource(
            '#version 300 es\n' +
            'uniform highp ' + gluShaderUtil.getDataTypeName(samplerType) + ' u_sampler0;\n' +
            'uniform highp vec4 u_scale;\n' +
            'uniform highp vec4 u_bias;\n' +
            'in mediump vec3 v_coord;\n' +
            'layout(location = 0) out highp ' + gluShaderUtil.getDataTypeName(outputType) + ' o_color;\n' +
            'void main (void)\n' +
            '{\n' +
            '    o_color = ' + gluShaderUtil.getDataTypeName(outputType) + '(vec4(texture(u_sampler0, v_coord)) * u_scale + u_bias);\n' +
            '}\n');
        sglrShaderProgram.ShaderProgram.call(this, decl);
        /** @type {Array<number>} */ this.m_texScale = [1.0, 1.0, 1.0, 1.0];
        /** @type {Array<number>} */ this.m_texBias = [0.0, 0.0, 0.0, 0.0];
        /** @type {tcuMatrix.Mat3} */ this.m_coordMat;
        /** @type {gluShaderUtil.DataType} */ this.m_outputType = outputType;
    };

    TextureCubeShader.prototype = Object.create(sglrShaderProgram.ShaderProgram.prototype);
    TextureCubeShader.prototype.constructor = TextureCubeShader;

    /**
     * @param {tcuTexture.CubeFace} face
     */
    TextureCubeShader.prototype.setFace = function(face) {
        /** @const {Array<Array<number>>} */ var s_cubeTransforms = [
            // Face -X: (x, y, 1) -> (-1, -(2*y-1), +(2*x-1))
            [[0.0, 0.0, -1.0], [0.0, -2.0, 1.0], [2.0, 0.0, -1.0]],
            // Face +X: (x, y, 1) -> (+1, -(2*y-1), -(2*x-1))
            [[0.0, 0.0, 1.0], [0.0, -2.0, 1.0], [-2.0, 0.0, 1.0]],
            // Face -Y: (x, y, 1) -> (+(2*x-1), -1, -(2*y-1))
            [[2.0, 0.0, -1.0], [0.0, 0.0, -1.0], [0.0, -2.0, 1.0]],
            // Face +Y: (x, y, 1) -> (+(2*x-1), +1, +(2*y-1))
            [[2.0, 0.0, -1.0], [0.0, 0.0, 1.0], [0.0, 2.0, -1.0]],
            // Face -Z: (x, y, 1) -> (-(2*x-1), -(2*y-1), -1)
            [[-2.0, 0.0, 1.0], [0.0, -2.0, 1.0], [0.0, 0.0, -1.0]],
            // Face +Z: (x, y, 1) -> (+(2*x-1), -(2*y-1), +1)
            [[2.0, 0.0, -1.0], [0.0, -2.0, 1.0], [0.0, 0.0, 1.0]]];
        DE_ASSERT(deMath.inBounds32(face, 0, Object.keys(tcuTexuture.CubeFace).length));
        this.m_coordMat = new tcuMatrix.Mat3(s_cubeTransforms[face]);
    };

    /**
     * @param {Array<number>} scale
     * @param {Array<number>} bias
     */
    TextureCubeShader.prototype.setTexScaleBias = function(scale, bias) {
        this.m_texScale = scale;
        this.m_texBias = bias;
    };

    /**
     * @param {Context} ctx
     * @param {number} program
     */
    TextureCubeShader.prototype.setUniforms = function(ctx, program) {
        ctx.useProgram(program);

        ctx.uniform1i(ctx.getUniformLocation(program, 'u_sampler0'), 0);
        ctx.uniformMatrix3fv(ctx.getUniformLocation(program, 'u_coordMat'), 1, false, this.m_coordMat.getColumnMajorData());
        ctx.uniform4fv(ctx.getUniformLocation(program, 'u_scale'), 1, this.m_texScale);
        ctx.uniform4fv(ctx.getUniformLocation(program, 'u_bias'), 1, this.m_texBias);
    };

    /**
     * @param {rrVertexAttrib.VertexAttrib} inputs
     * @param {rrVertexPacket.VertexPacket} packets
     * @param {number} numPackets
     */
    TextureCubeShader.prototype.shadeVertices = function(inputs, packets, numPackets) {
        /** @type {tcuMatrix.Mat3} */ var texCoordMat = new tcuMatrix.Mat3(this.m_uniforms[0].value);

        for (var packetNdx = 0; packetNdx < numPackets; ++packetNdx) {
            /** @type {rrVertexPacket.VertexPacket} */ var packetc = packets[packetNdx];
            var x = rrVertexAttrib.readVertexAttribFloat(inputs[1], packet.instanceNdx, packet.vertexNdx)[0];
            var y = rrVertexAttrib.readVertexAttribFloat(inputs[1], packet.instanceNdx, packet.vertexNdx)[1];
            /** @type {Array<number>} */ var a_coord = [x, y];
            /** @type {Array<number>} */ var v_coord = tcuMatrix.multiplyMatVec(texCoordMat, [a_coord[0], a_coord[1], 1.0]); // TODO: multiplyMatVec

            packet.position = rrVertexAttrib.readVertexAttribFloat(inputs[0], packet.instanceNdx, packet.vertexNdx);
            packet.outputs[0] = [v_coord[0], v_coord[1], v_coord[2], 0.0];
        }
    };

    /**
     * @param {rrFragmentPacket.FragmentPacket} packets
     * @param {number} numPackets
     * @param {rrShadingContext.FragmentShadingContext} context
     */
    TextureCubeShader.prototype.shadeFragments = function(packets, numPackets, context) {
        var sval = m_uniforms[2].value;
        var bval = m_uniforms[3].value;
        /** @const {Array<number>} */ var texScale = [sval, sval, sval, sval];
        /** @const {Array<number>} */ var texBias = [bval, bval, bval, bval];

        /** @type {Array<Array<number>>} */ var texCoords = [[], [], [], []];
        /** @type {Array<Array<number>>} */ var colors = [[], [], [], []];

        for (var packetNdx = 0; packetNdx < numPackets; ++packetNdx) {
            /** @const {sglrReferenceContext.TextureCube} */ var tex = m_uniforms[1].sampler.texCube;

            for (var fragNdx = 0; fragNdx < 4; ++fragNdx) {
                /** @type {Array<Array<number>>} */ var coord = rrShadingContext.readTriangleVarying(packets[packetNdx], context, 0, fragNdx);
                texCoords[fragNdx] = [coord[0], coord[1], coord[2]];
            }

            tex.sample4(colors, texCoords);

            for (var fragNdx = 0; fragNdx < 4; ++fragNdx) {
                /** @type {Array<Array<number>>} */ var color = deMath.add(deMath.multiply(colors[fragNdx], texScale), texBias);
                /** @type {Array<Array<number>>} */ var icolor = castVectorSaturate(color, tcuTexture.deTypes.deInt32);
                /** @type {Array<Array<number>>} */ var uicolor = castVectorSaturate(color, tcuTexture.deTypes.deUint32);

                if (this.m_outputType == gluShaderUtil.DataType.FLOAT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, color);
                else if (this.m_outputType == gluShaderUtil.DataType.INT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, icolor);
                else if (this.m_outputType == gluShaderUtil.DataType.UINT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, uicolor);
                else
                    DE_ASSERT(false);
            }
        }
    };

    /**
     * Texture2DArrayShader inherits from sglrShaderProgram
     * @constructor
     * @extends {sglrShaderProgram.ShaderProgram}
     * @param {gluShaderUtil.DataType} samplerType
     * @param {glu.DataType} outputType
     */
    var Texture2DArrayShader = function(samplerType, outputType) {
        /** @type {sglrShaderProgram.ShaderProgramDeclaration} */
        var decl = new sglrShaderProgram.ShaderProgramDeclaration();
        decl.pushVertexAttribute('a_position', rrGenericVector.GenericVecType.FLOAT);
        decl.pushVertexAttribute('a_coord', rrGenericVector.GenericVecType.FLOAT);
        decl.pushVertexToFragmentVarying(rrGenericVector.GenericVecType.FLOAT);
        decl.pushFragmentOutput(mapDataTypeToGenericVecType(outputType));
        decl.pushUniform('u_sampler0', samplerType);
        decl.pushUniform('u_scale', gluShaderUtil.DataType.FLOAT_VEC4);
        decl.pushUniform('u_bias', gluShaderUtil.DataType.FLOAT_VEC4);
        decl.pushUniform('u_layer', gluShaderUtil.DataType.INT);
        decl.pushVertexSource(
                '#version 300 es\n' +
                'in highp vec4 a_position;\n' +
                'in highp vec2 a_coord;\n' +
                'out highp vec2 v_coord;\n' +
                'void main (void)\n' +
                '{\n' +
                '    gl_Position = a_position;\n' +
                '    v_coord = a_coord;\n' +
                '}\n');
        decl.pushFragmentSource(
                '#version 300 es\n' +
                'uniform highp ' + gluShaderUtil.getDataTypeName(samplerType) + ' u_sampler0;\n' +
                'uniform highp vec4 u_scale;\n' +
                'uniform highp vec4 u_bias;\n' +
                'uniform highp int u_layer;\n' +
                'in highp vec2 v_coord;\n' +
                'layout(location = 0) out highp ' + gluShaderUtil.getDataTypeName(outputType) + ' o_color;\n' +
                'void main (void)\n' +
                '{\n' +
                '    o_color = ' + gluShaderUtil.getDataTypeName(outputType) + '(vec4(texture(u_sampler0, vec3(v_coord, u_layer))) * u_scale + u_bias);\n' +
                '}\n');
        sglrShaderProgram.ShaderProgram.call(this, decl);
        /** @type {Array<number>} */ this.m_texScale = [1.0, 1.0, 1.0, 1.0];
        /** @type {Array<number>} */ this.m_texBias = [0.0, 0.0, 0.0, 0.0];
        /** @type {number} */ this.m_layer = 0;
        /** @type {gluShaderUtil.DataType} */ this.m_outputType = outputType;
    };

    Texture2DArrayShader.prototype = Object.create(sglrShaderProgram.ShaderProgram.prototype);
    Texture2DArrayShader.prototype.constructor = Texture2DArrayShader;

    /**
     * @param {number} layer
     */
    Texture2DArrayShader.prototype.setLayer = function(layer) {
        this.m_layer = layer;
    };
    /**
     * @param {Array<number>} scale
     * @param {Array<number>} bias
     */
    Texture2DArrayShader.prototype.setTexScaleBias = function(scale, bias) {
        this.m_texScale = scale;
        this.m_texBias = bias;
    };
    /**
     * @param {Context} ctx
     * @param {number} program
     */
    Texture2DArrayShader.prototype.setUniforms = function(ctx, program) {
        ctx.useProgram(program);

        ctx.uniform1i(ctx.getUniformLocation(program, 'u_sampler0'), 0);
        ctx.uniform1i(ctx.getUniformLocation(program, 'u_layer'), this.m_layer);
        ctx.uniform4fv(ctx.getUniformLocation(program, 'u_scale'), 1, this.m_texScale);
        ctx.uniform4fv(ctx.getUniformLocation(program, 'u_bias'), 1, this.m_texBias);
    };

    /**
     * @param {rrVertexAttrib.VertexAttrib} inputs
     * @param {rrVertexPacket.VertexPacket} packets
     * @param {number} numPackets
     */
    Texture2DArrayShader.prototype.shadeVertices = function(inputs, packets, numPackets) {
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
    Texture2DArrayShader.prototype.shadeFragments = function(packets, numPackets, context) {
        var sval = this.m_uniforms[1].value;
        var bval = this.m_uniforms[2].value;
        /** @const {Array<number>} */ var texScale = [sval, sval, sval, sval];
        /** @const {Array<number>} */ var texBias = [bval, bval, bval, bval];
        /** @const {number} */ var layer = this.m_uniforms[3].value;

        /** @type {Array<number>} */ var texCoords = [[], [], [], []];
        /** @type {Array<number>} */ var colors = [[], [], [], []];

        for (var packetNdx = 0; packetNdx < numPackets; ++packetNdx) {
            /** @const {sglrReferenceContext.Texture2DArray} */ var tex = this.m_uniforms[0].sampler.tex2DArray;

            for (var fragNdx = 0; fragNdx < 4; ++fragNdx) {
                /** @const {Array<number>} */ var coord = rrShadingContext.readTriangleVarying(packets[packetNdx], context, 0, fragNdx);
                texCoords[fragNdx] = [coord[0], coord[1], layer];
            }

            tex.sample4(colors, texCoords);

            for (var fragNdx = 0; fragNdx < 4; ++fragNdx) {
                /** @const {Array<number>} */ var color = deMath.add(deMath.multiply(colors[fragNdx], texScale), texBias);
                /** @const {Array<number>} */ var icolor = castVectorSaturate(color, tcuTexture.deTypes.deInt32);
                /** @const {Array<number>} */ var uicolor = castVectorSaturate(color, tcuTexture.deTypes.deUint32);

                if (m_outputType == gluShaderUtil.DataType.FLOAT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, color);
                else if (m_outputType == gluShaderUtil.DataType.INT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, icolor);
                else if (m_outputType == gluShaderUtil.DataType.UINT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, uicolor);
                else
                    DE_ASSERT(false);
            }
        }
    };

    /**
     * Texture3DShader inherits from sglrShaderProgram
     * @constructor
     * @extends {sglrShaderProgram.ShaderProgram}
     * @param {gluShaderUtil.DataType} samplerType
     * @param {glu.DataType} outputType
     */
    var Texture3DShader = function(samplerType, outputType) {
        /** @type {sglrShaderProgram.ShaderProgramDeclaration} */
        var decl = new sglrShaderProgram.ShaderProgramDeclaration();
        decl.pushVertexAttribute('a_position', rrGenericVector.GenericVecType.FLOAT);
        decl.pushVertexAttribute('a_coord', rrGenericVector.GenericVecType.FLOAT);
        decl.pushVertexToFragmentVarying(rrGenericVector.GenericVecType.FLOAT);
        decl.pushFragmentOutput(mapDataTypeToGenericVecType(outputType));
        decl.pushUniform('u_sampler0', samplerType);
        decl.pushUniform('u_scale', gluShaderUtil.DataType.FLOAT_VEC4);
        decl.pushUniform('u_bias', gluShaderUtil.DataType.FLOAT_VEC4);
        decl.pushUniform('u_depth', gluShaderUtil.DataType.FLOAT);
        decl.pushVertexSource(
            '#version 300 es\n' +
            'in highp vec4 a_position;\n' +
            'in highp vec2 a_coord;\n' +
            'out highp vec2 v_coord;\n' +
            'void main (void)\n' +
            '{\n' +
            '    gl_Position = a_position;\n' +
            '    v_coord = a_coord;\n' +
            '}\n');
        decl.pushFragmentSource(
            '#version 300 es\n' +
            'uniform highp ' + gluShaderUtil.getDataTypeName(samplerType) + ' u_sampler0;\n' +
            'uniform highp vec4 u_scale;\n' +
            'uniform highp vec4 u_bias;\n' +
            'uniform highp float u_depth;\n' +
            'in highp vec2 v_coord;\n' +
            'layout(location = 0) out highp ' + gluShaderUtil.getDataTypeName(outputType) + ' o_color;\n' +
            'void main (void)\n' +
            '{\n' +
            '    o_color = ' + gluShaderUtil.getDataTypeName(outputType) + '(vec4(texture(u_sampler0, vec3(v_coord, u_depth))) * u_scale + u_bias);\n' +
            '}\n');
        sglrShaderProgram.ShaderProgram.call(this, decl);
        /** @type {Array<number>} */ this.m_texScale = [1.0, 1.0, 1.0, 1.0];
        /** @type {Array<number>} */ this.m_texBias = [0.0, 0.0, 0.0, 0.0];
        /** @type {number} */ this.m_depth = 0.0;
        /** @type {gluShaderUtil.DataType} */ this.m_outputType = outputType;
    };

    Texture3DShader.prototype = Object.create(sglrShaderProgram.ShaderProgram.prototype);
    Texture3DShader.prototype.constructor = Texture3DShader;

    /**
     * @param {number} depth
     */
    Texture3DShader.prototype.setDepth = function(depth) {
        thism_depth = depth;
    };

    /**
     * @param {Array<number>} scale
     * @param {Array<number>} bias
     */
    Texture3DShader.prototype.setTexScaleBias = function(scale, bias) {
        this.m_texScale = scale;
        this.m_texBias = bias;
    };

    /**
     * @param {Context} context
     * @param {number} program
     */
    Texture3DShader.prototype.setUniforms = function(context, program) {
        context.useProgram(program);
        context.uniform1i(context.getUniformLocation(program, 'u_sampler0'), 0);
        context.uniform1f(context.getUniformLocation(program, 'u_depth'), this.m_depth);
        context.uniform4fv(context.getUniformLocation(program, 'u_scale'), 1, this.m_texScale);
        context.uniform4fv(context.getUniformLocation(program, 'u_bias'), 1, this.m_texBias);
    };

    /**
     * @param {rrVertexAttrib.VertexAttrib} inputs
     * @param {rrVertexPacket.VertexPacket} packets
     * @param {number} numPackets
     */
    Texture3DShader.prototype.shadeVertices = function(inputs, packets, numPackets) {
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
    Texture3DShader.prototype.shadeFragments = function(packets, numPackets, context) {
        var sval = this.m_uniforms[1].value;
        var bval = this.m_uniforms[2].value;
        /** @const {Array<number>} */ var texScale = [sval, sval, sval, sval];
        /** @const {Array<number>} */ var texBias = [bval, bval, bval, bval];
        /** @const {number} */ var depth = this.m_uniforms[3].value;

        /** @type {Array<Array<number>>} */ var texCoords = [[], [], [], []];
        /** @type {Array<Array<number>>} */ var colors = [[], [], [], []];

        for (var packetNdx = 0; packetNdx < numPackets; ++packetNdx) {
            /** @const {sglrReferenceContext.Texture3D} */ var tex = this.m_uniforms[0].sampler.tex3D;

            for (var fragNdx = 0; fragNdx < 4; ++fragNdx) {
                /** @const {Array<number>} */ var coord = rrShadingContext.readTriangleVarying(packets[packetNdx], context, 0, fragNdx);
                texCoords[fragNdx] = [coord[0], coord[1], depth];
            }

            tex.sample4(colors, texCoords);

            for (var fragNdx = 0; fragNdx < 4; ++fragNdx) {
                /** @const {Array<number>} */ var color = deMath.add(deMath.multiply(colors[fragNdx], texScale), texBias);
                /** @const {Array<number>} */ var icolor = castVectorSaturate(color, tcuTexture.deTypes.deInt32);
                /** @const {Array<number>} */ var uicolor = castVectorSaturate(color, tcuTexture.deTypes.deUint32);

                if (this.m_outputType == gluShaderUtil.DataType.FLOAT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, color);
                else if (this.m_outputType == gluShaderUtil.DataType.INT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, icolor);
                else if (this.m_outputType == gluShaderUtil.DataType.UINT_VEC4)
                    rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, uicolor);
                else
                    DE_ASSERT(false);
            }
        }
    };

    /**
     * DepthGradientShader inherits from sglrShaderProgram
     * @constructor
     * @extends {sglrShaderProgram.ShaderProgram}
     * @param {gluShaderUtil.DataType} samplerType
     */
    var DepthGradientShader = function(samplerType) {
        /** @type {sglrShaderProgram.ShaderProgramDeclaration} */
        var decl = new sglrShaderProgram.ShaderProgramDeclaration();
        decl.pushVertexAttribute('a_position', rrGenericVector.GenericVecType.FLOAT);
        decl.pushVertexAttribute('a_coord', rrGenericVector.GenericVecType.FLOAT);
        decl.pushVertexToFragmentVarying(rrGenericVector.GenericVecType.FLOAT);
        decl.pushFragmentOutput(mapDataTypeToGenericVecType(outputType));
        decl.pushUniform('u_maxGradient', gluShaderUtil.DataType.FLOAT);
        decl.pushUniform('u_minGradient', gluShaderUtil.DataType.FLOAT);
        decl.pushUniform('u_color', gluShaderUtil.DataType.FLOAT_VEC4);
        decl.pushVertexSource(
                '#version 300 es\n' +
                'in highp vec4 a_position;\n' +
                'in highp vec4 a_coord;\n' +
                'out highp vec4 v_coord;\n' +
                'void main (void)\n' +
                '{\n' +
                '    gl_Position = a_position;\n' +
                '    v_coord = a_coord;\n' +
                '}\n');
        decl.pushFragmentSource(
                    '#version 300 es\n' +
                    'in highp vec4 v_coord;\n' +
                    'uniform highp float u_minGradient;\n' +
                    'uniform highp float u_maxGradient;\n' +
                    'uniform highp vec4 u_color;\n' +
                    'layout(location = 0) out highp ' + gluShaderUtil.getDataTypeName(outputType) + ' o_color;\n' +
                    'void main (void)\n' +
                    '{\n' +
                    '    highp float x = v_coord.x;\n' +
                    '    highp float y = v_coord.y;\n' +
                    '    highp float f0 = (x + y) * 0.5;\n' +
                    '    gl_FragDepth = u_minGradient + (u_maxGradient-u_minGradient)*f0;\n' +
                    '    o_color = ' + gluShaderUtil.getDataTypeName(outputType) + '(u_color);\n' +
                    '}\n');
        this.m_outputType = outputType;
        sglrShaderProgram.ShaderProgram.call(this, decl);
        /** @const {sglrShaderProgram.UniformSlot} */ this.u_minGradient = this.getUniformByName('u_minGradient');
        /** @const {sglrShaderProgram.UniformSlot} */ this.u_maxGradient = this.getUniformByName('u_maxGradient');
        /** @const {sglrShaderProgram.UniformSlot} */ this.u_color = this.getUniformByName('u_color');
    };

    DepthGradientShader.prototype = Object.create(sglrShaderProgram.ShaderProgram.prototype);
    DepthGradientShader.prototype.constructor = DepthGradientShader;

    /**
     * @param {Context} ctx
     * @param {number} program
     * @param {numbrer} gradientMin
     * @param {numbrer} gradientMax
     * @param {Array<number>} color
     */
    DepthGradientShader.prototype.setUniforms = function(ctx, program, gradientMin, gradientMax, color) {
        ctx.useProgram(program);
        ctx.uniform1fv(ctx.getUniformLocation(program, 'u_minGradient'), 1, gradientMin);
        ctx.uniform1fv(ctx.getUniformLocation(program, 'u_maxGradient'), 1, gradientMax);
        ctx.uniform4fv(ctx.getUniformLocation(program, 'u_color'), 1, color);
    };

    /**
     * @param {rrVertexAttrib.VertexAttrib} inputs
     * @param {rrVertexPacket.VertexPacket} packets
     * @param {number} numPackets
     */
    DepthGradientShader.prototype.shadeVertices = function(inputs, packets, numPackets) {
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
    DepthGradientShader.prototype.shadeFragments = function(packets, numPackets, context) {
        /** @const {number} */ var gradientMin = u_minGradient.value;
        /** @const {number} */ var gradientMax = u_maxGradient.value;
        var cval = u_color.value;
        var ival = castVectorSaturate(color, tcuTexture.deTypes.deInt32);
        var uval = castVectorSaturate(color, tcuTexture.deTypes.deUint32);

        /** @type {Array<number>} */ var color = [cval, cval, cval, cval];
        /** @type {Array<number>} */ var icolor = [ival, ival, ival, ival];
        /** @type {Array<number>} */ var uicolor = [uval, uval, uval, uval];

        // running this shader without a depth buffer does not make any sense
        DE_ASSERT(context.fragmentDepths);

        for (var packetNdx = 0; packetNdx < numPackets; ++packetNdx)
        for (var fragNdx = 0; fragNdx < 4; ++fragNdx) {
            /** @type {Array<number>} */ var coord = rrShadingContext.readTriangleVarying(packets[packetNdx], context, 0, fragNdx);
            /** @const {number} */ var x = coord[0];
            /** @const {number} */ var y = coord[1];
            /** @const {number} */ var f0 = (x + y) * 0.5;

            rrShadingContext.writeFragmentDepth(context, packetNdx, fragNdx, 0, gradientMin + (gradientMax - gradientMin) * f0);

            if (this.m_outputType == gluShaderUtil.DataType.FLOAT_VEC4)
                rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, color);
            else if (this.m_outputType == gluShaderUtil.DataType.INT_VEC4)
                rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, icolor);
            else if (this.m_outputType == gluShaderUtil.DataType.UINT_VEC4)
                rrShadingContext.writeFragmentOutput(context, packetNdx, fragNdx, 0, uicolor);
            else
                DE_ASSERT(false);
        }
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
     * @param {sglrContext} ctx
     * @param {TextureFormat} format
     * @param {Array<number>} value
     */
    var clearColorBuffer = function(ctx, format, value) {
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
     * readPixels()
     * @param {Context} ctx
     * @param {tcuTexture.Texture} dst
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {tcuTexture.TextureFormat} format
     * @param {Array<number>} scale
     * @param {Array<number>} bias
     */
    var readPixels = function(ctx, dst, x, y, width, height, format, scale, bias) {
        /** @type {tcuTexture.TextureFormat} */ var readFormat = getFramebufferReadFormat(format);
        /** @type {gluTextureUtil.TransferFormat} */ var transferFmt = gluTextureUtil.getTransferFormat(readFormat);
        /** @type {number} */ var alignment = 4; // \note GL_PACK_ALIGNMENT = 4 is assumed.
        /** @type {number} */ var rowSize = deMath.deAlign32(readFormat.getPixelSize() * width, alignment);
        /** @type {Array<number>} */ var data = [];

        ctx.readPixels(x, y, width, height, transferFmt.format, transferFmt.dataType, data);

        // Convert to surface.
        var cpbaDescriptor = {
            format: readFormat,
            width: width,
            height: height,
            depth: 1,
            rowPitch: rowSize,
            slicePitch: 0,
            data: data
        };

        /** @type {tcuTexture.ConstPixelBufferAccess} */
        var src = new tcuTexture.ConstPixelBufferAccess(cpbaDescriptor);

        dst.setSize(width, height);
        /** @type {tcuTexture.PixelBufferAccess} */ var dstAccess = dst.getAccess();

        for (var yo = 0; yo < height; yo++)
        for (var xo = 0; xo < width; xo++)
            dstAccess.setPixel(src.getPixel(xo, yo) * scale + bias, xo, yo);
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
        getToSRGBConversionThreshold: getToSRGBConversionThreshold,
        readPixels: readPixels
    };

});
