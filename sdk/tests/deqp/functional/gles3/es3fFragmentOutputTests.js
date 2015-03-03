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

define(['framework/opengl/gluShaderUtil', 'framework/delibs/debase/deRandom', 'framework/common/tcuTestCase', 'framework/common/tcuSurface', 'framework/opengl/gluTexture', 'framework/opengl/gluTextureUtil', 'framework/common/tcuTexture', 'modules/shared/glsTextureTestUtil', 'framework/common/tcuTextureUtil', 'framework/opengl/gluStrUtil', 'framework/delibs/debase/deMath', 'framework/common/tcuCompressedTexture'],
     function(gluShaderUtil, deRandom, deqpTests, tcuSurface, gluTexture, gluTextureUtil, tcuTexture, glsTextureTestUtil, tcuTextureUtil, gluStrUtil, deMath, tcuCompressedTexture) {
    'use strict';

    /** BufferSpec
     * Returns the BufferSpec object, it's originally a struct
     * @param {number} format_
     * @param {number} width_
     * @param {number} height_
     * @param {number} samples_
     * @return {Object} The currently modified object
     */
    var BufferSpec = (function(format_, width_, height_, samples_) {
        var container = {
                format: GL_NONE, // TODO: change initialization
                width: 0,
                height: 0,
                samples: 0
        };

        if (
                typeof(format_) !== 'undefined' &&
                typeof(width_) !== 'undefined' &&
                typeof(height_) !== 'undefined' &&
                typeof(samples_) !== 'undefined'
            ) {
                container.format = format_;
                container.width = width_;
                container.height = height_;
                container.samples = samples_;
            }

            return container;

    });

    /** FragmentOutput
     * Returns the FragmentOutput object, it's originally a struct
     * @param {gluShaderUtil.DataType} type_
     * @param {gluShaderUtil.precision} precision_
     * @param {number} location_
     * @param {number} arrayLength_
     * @return {Object} The currently modified object
     */
    var FragmentOutput = (function(type_, precision_, location_, arrayLength_) {
        var container = {
                type: gluShaderUtil.DataType.INVALID,
                precision: null, // TODO: check initialization, possible INVALID gluShaderUtil.precision?
                location: 0,
                arrayLength: 0
        };

        if (
                typeof(type_) !== 'undefined' &&
                typeof(precision_) !== 'undefined' &&
                typeof(location_) !== 'undefined' &&
                typeof(arrayLength_) !== 'undefined'
            ) {
                container.type = type_;
                container.precision = precision_;
                container.location = location_;
                container.arrayLength = arrayLength_;
            }

            return container;

    });

    /** OutputVec
     * Returns an Array of FragmentOutput objects
     * @param {FragmentOutput} output
     * @return {Array.<FragmentOutput>} outputs
     */
    var OutputVec = function(output) {

        /** @type {Array.<FragmentOutput>} */ var outputs = [];
        outputs.push(output);

        return outputs;
    };

    /** FragmentOutputCase
     * Returns the FragmentOutputCase object
     * @param {string} name
     * @param {string} description
     * @param {Array.<BufferSpec>} fboSpec
     * @param {Array.<FragmentOutput>} outputs
     * @return {Object} The currently modified object
     */
    var FragmentOutputCase = function(name, description, fboSpec, outputs) {
        deqpTests.DeqpTest.call(this, name, description);
        /** @type {Array.<BufferSpec>} */ this.m_fboSpec = fboSpec;
        /** @type {Array.<FragmentOutput>} */ this.m_outputs = outputs;
        /** @type {deqpProgram.ShaderProgram} */ this.m_program = null;
        /** @type {number} */ this.m_framebuffer = 0;
    };

    FragmentOutputCase.prototype = Object.create(deqpTests.DeqpTest.prototype);
    FragmentOutputCase.prototype.constructor = FragmentOutputCase;
    
    /** Creates Program
     */
    var createProgram = function() {
 
        var vtx = '';
        var frag = '';
       
        vtx.str = '#version 300 es\n'
                 + 'in highp vec4 a_position;\n';
        frag.str = '#version 300 es\n';
        /*
     // Input-output declarations.
        for (int outNdx = 0; outNdx < (int)outputs.size(); outNdx++)
        {
            const FragmentOutput&   output      = outputs[outNdx];
            bool                    isArray     = output.arrayLength > 0;
            const char*             typeName    = glu::getDataTypeName(output.type);
            const char*             precName    = glu::getPrecisionName(output.precision);
            bool                    isFloat     = glu::isDataTypeFloatOrVec(output.type);
            const char*             interp      = isFloat ? "smooth" : "flat";

            if (isArray)
            {
                for (int elemNdx = 0; elemNdx < output.arrayLength; elemNdx++)
                {
                    vtx << "in " << precName << " " << typeName << " in" << outNdx << "_" << elemNdx << ";\n"
                        << interp << " out " << precName << " " << typeName << " var" << outNdx << "_" << elemNdx << ";\n";
                    frag << interp << " in " << precName << " " << typeName << " var" << outNdx << "_" << elemNdx << ";\n";
                }
                frag << "layout(location = " << output.location << ") out " << precName << " " << typeName << " out" << outNdx << "[" << output.arrayLength << "];\n";
            }
            else
            {
                vtx << "in " << precName << " " << typeName << " in" << outNdx << ";\n"
                    << interp << " out " << precName << " " << typeName << " var" << outNdx << ";\n";
                frag << interp << " in " << precName << " " << typeName << " var" << outNdx << ";\n"
                     << "layout(location = " << output.location << ") out " << precName << " " << typeName << " out" << outNdx << ";\n";
            }
        }

        vtx << "\nvoid main()\n{\n";
        frag << "\nvoid main()\n{\n";

        vtx << "    gl_Position = a_position;\n";

        // Copy body
        for (int outNdx = 0; outNdx < (int)outputs.size(); outNdx++)
        {
            const FragmentOutput&   output      = outputs[outNdx];
            bool                    isArray     = output.arrayLength > 0;

            if (isArray)
            {
                for (int elemNdx = 0; elemNdx < output.arrayLength; elemNdx++)
                {
                    vtx << "\tvar" << outNdx << "_" << elemNdx << " = in" << outNdx << "_" << elemNdx << ";\n";
                    frag << "\tout" << outNdx << "[" << elemNdx << "] = var" << outNdx << "_" << elemNdx << ";\n";
                }
            }
            else
            {
                vtx << "\tvar" << outNdx << " = in" << outNdx << ";\n";
                frag << "\tout" << outNdx << " = var" << outNdx << ";\n";
            }
        }

        vtx << "}\n";
        frag << "}\n";
        */
        
      //  return /** @type {deqpProgram.ShaderProgram}*/ var program = new deqpProgram.ShaderProgram(gl, deqpProgram.makeVtxFragSources(vtxSrc, fragSrc));
    };

    FragmentOutputCase.prototype.init = function() {
        // TODO: implement
    };

    FragmentOutputCase.prototype.deinit = function() {
        // TODO: implement
    };

    FragmentOutputCase.prototype.iterate = function() {
        // TODO: implement
    };

    var init = function() {

      /** @const @type {deqpTests.DeqpTest} */ var testGroup = deqpTests.runner.getState().testCases;
      //Set up Test Root parameters
        var testName = 'fot';
        var testDescription = 'Fragment Output Tests';
        var state = deqpTests.runner.getState();

        state.testName = testName;
        state.testCases = deqpTests.newTest(testName, testDescription, null);

        /** @type {Array} */
        var requiredFloatFormats = [
            gl.RGBA32F,
            gl.RGBA16F,
            gl.R11F_G11F_B10F,
            gl.RG32F,
            gl.RG16F,
            gl.R32F,
            gl.R16F
        ];

        /** @type {Array} */
        var requiredFixedFormats = [
            gl.RGBA8,
            gl.SRGB8_ALPHA8,
            gl.RGB10_A2,
            gl.RGBA4,
            gl.RGB5_A1,
            gl.RGB8,
            gl.RGB565,
            gl.RG8,
            gl.R8
        ];

        /** @type {Array} */
        var requiredIntFormats = [
            gl.RGBA32I,
            gl.RGBA16I,
            gl.RGBA8I,
            gl.RG32I,
            gl.RG16I,
            gl.RG8I,
            gl.R32I,
            gl.R16I,
            gl.R8I
        ];

        /** @type {Array} */
        var requiredUintFormats = [
            gl.RGBA32UI,
            gl.RGBA16UI,
            gl.RGBA8UI,
            gl.RGB10_A2UI,
            gl.RG32UI,
            gl.RG16UI,
            gl.RG8UI,
            gl.R32UI,
            gl.R16UI,
            gl.R8UI
        ];

        /** @type {Array.<gluShaderUtil.precision>} */
        var precisions = [

            gluShaderUtil.precision.PRECISION_LOWP,
            gluShaderUtil.precision.PRECISION_MEDIUMP,
            gluShaderUtil.precision.PRECISION_HIGHP

        ];

     // .basic.
        {
            /** @type {deqpTests.DeqpTest} */ var basicGroup = deqpTests.newTest('basic', 'Basic fragment output tests');
            testGroup.addChild(basicGroup);

            /** @const @type {number} */ var width = 64;
            /** @const @type {number} */ var height = 64;
            /** @const @type {number} */ var samples = 0;

            // .float
            /** @type {deqpTests.DeqpTest} */ var floatGroup = deqpTests.newTest('float', 'Floating-point output tests');
            basicGroup.addChild(floatGroup);
            for (var fmtNdx = 0; fmtNdx < requiredFloatFormats.length; fmtNdx++)
            {
                /** @type {number} */ var format = requiredFloatFormats[fmtNdx];
                /** @type {string} */ var fmtName = getFormatName(format); // TODO: implement
                /** @type {Array.<BufferSpec>} */ var fboSpec = [];

                fboSpec.push(BufferSpec(format, width, height, samples));

                for (var precNdx = 0; precNdx < precisions.length; precNdx++)
                {
                    /** @type {Array.<gluShaderUtil.precision>} */ var prec = precisions[precNdx];
                    /** @type {string} */ var precName = gluShaderUtil.getPrecisionName(prec);

                    floatGroup.addChild(new FragmentOutputCase(m_context, (fmtName + '_' + precName + '_float'), '', fboSpec, OutputVec(FragmentOutput(deqpUtils.DataType.FLOAT, prec, 0))));
                    floatGroup.addChild(new FragmentOutputCase(m_context, (fmtName + '_' + precName + '_vec2'), '', fboSpec, OutputVec(FragmentOutput(deqpUtils.DataType.FLOAT_VEC2, prec, 0))));
                    floatGroup.addChild(new FragmentOutputCase(m_context, (fmtName + '_' + precName + '_vec3'), '', fboSpec, OutputVec(FragmentOutput(deqpUtils.DataType.FLOAT_VEC3, prec, 0))));
                    floatGroup.addChild(new FragmentOutputCase(m_context, (fmtName + '_' + precName + '_vec4'), '', fboSpec, OutputVec(FragmentOutput(deqpUtils.DataType.FLOAT_VEC4, prec, 0))));
                }
            }
        }
    };

    /**
     * Create and execute the test cases
     */
    var run = function() {
        try {
            init();
            deqpTests.runner.runCallback(deqpTests.runTestCases);
        } catch (err) {
            bufferedLogToConsole(err);
            deqpTests.runner.terminate();
        }

    };

    return {
        run: run
    };

});
