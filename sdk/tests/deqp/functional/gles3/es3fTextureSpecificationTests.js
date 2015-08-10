/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL ES Utilities
 * ------------------------------------------------
 *
 * Copyright 2014 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

'use strict';
goog.provide('functional.gles3.es3fTextureSpecificationTests');

goog.scope(function() {
    var es3fTextureSpecificationTests =
        functional.gles3.es3fTextureSpecificationTests;

    /**
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     * @param {WebGL2RenderingContext} context
     */
    es3fTextureSpecificationTests.TextureSpecificationTests = function (context)
    {
        tcuTestCase.DeqpTest.call(
            this, "specification", "Texture Specification Tests"
        );
    };

    es3fTextureSpecificationTests.TextureSpecificationTests.prototype =
        Object.create(tcuTestCase.DeqpTest.prototype);
    es3fTextureSpecificationTests.TextureSpecificationTests.prototype.constructor =
        es3fTextureSpecificationTests.TextureSpecificationTests;

    es3fTextureSpecificationTests.TextureSpecificationTests.init = function () {
        /** @type {Array<{name: string, format: number, dataType: number}>} */
        var unsizedFormats [
            {
                name: "alpha_unsigned_byte",
                format: gl.ALPHA,
                dataType: gl.UNSIGNED_BYTE
            }, {
                name: "luminance_unsigned_byte",
                format: gl.LUMINANCE,
                dataType: gl.UNSIGNED_BYTE
            }, {
                name: "luminance_alpha_unsigned_byte",
                format: gl.LUMINANCE_ALPHA,
                dataType: gl.UNSIGNED_BYTE
            }, {
                name: "rgb_unsigned_short_5_6_5",
                format: gl.RGB,
                dataType: gl.UNSIGNED_SHORT_5_6_5
            }, {
                name: "rgb_unsigned_byte",
                format: gl.RGB,
                dataType: gl.UNSIGNED_BYTE
            }, {
                name: "rgba_unsigned_short_4_4_4_4",
                format: gl.RGBA,
                dataType: gl.UNSIGNED_SHORT_4_4_4_4
            }, {
                name: "rgba_unsigned_short_5_5_5_1",
                format: gl.RGBA,
                dataType: gl.UNSIGNED_SHORT_5_5_5_1
            }, {
                name: "rgba_unsigned_byte",
                format: gl.RGBA,
                dataType: gl.UNSIGNED_BYTE
            }
        ];

        /** @type {Array<{name: string, internalFormat: number}>} */
        var colorFormats = [
            {
                name: "rgba32f", internalFormat: gl.RGBA32F
            }, {
                name: "rgba32i", internalFormat: gl.RGBA32I
            }, {
                name: "rgba32ui", internalFormat: gl.RGBA32UI
            }, {
                name: "rgba16f", internalFormat: gl.RGBA16F
            }, {
                name: "rgba16i", internalFormat: gl.RGBA16I
            }, {
                name: "rgba16ui", internalFormat: gl.RGBA16UI
            }, {
                name: "rgba8", internalFormat: gl.RGBA8
            }, {
                name: "rgba8i", internalFormat: gl.RGBA8I
            }, {
                name: "rgba8ui", internalFormat: gl.RGBA8UI
            }, {
                name: "srgb8_alpha8", internalFormat: gl.SRGB8_ALPHA8
            }, {
                name: "rgb10_a2", internalFormat: gl.RGB10_A2
            }, {
                name: "rgb10_a2ui", internalFormat: gl.RGB10_A2UI
            }, {
                name: "rgba4", internalFormat: gl.RGBA4
            }, {
                name: "rgb5_a1", internalFormat: gl.RGB5_A1
            }, {
                name: "rgba8_snorm", internalFormat: gl.RGBA8_SNORM
            }, {
                name: "rgb8", internalFormat: gl.RGB8
            }, {
                name: "rgb565", internalFormat: gl.RGB565
            }, {
                name: "r11f_g11f_b10f", internalFormat: gl.R11F_G11F_B10F
            }, {
                name: "rgb32f", internalFormat: gl.RGB32F
            }, {
                name: "rgb32i", internalFormat: gl.RGB32I
            }, {
                name: "rgb32ui", internalFormat: gl.RGB32UI
            }, {
                name: "rgb16f", internalFormat: gl.RGB16F
            }, {
                name: "rgb16i", internalFormat: gl.RGB16I
            }, {
                name: "rgb16ui", internalFormat: gl.RGB16UI
            }, {
                name: "rgb8_snorm", internalFormat: gl.RGB8_SNORM
            }, {
                name: "rgb8i", internalFormat: gl.RGB8I
            }, {
                name: "rgb8ui", internalFormat: gl.RGB8UI
            }, {
                name: "srgb8", internalFormat: gl.SRGB8
            }, {
                name: "rgb9_e5", internalFormat: gl.RGB9_E5
            }, {
                name: "rg32f", internalFormat: gl.RG32F
            }, {
                name: "rg32i", internalFormat: gl.RG32I
            }, {
                name: "rg32ui", internalFormat: gl.RG32UI
            }, {
                name: "rg16f", internalFormat: gl.RG16F
            }, {
                name: "rg16i", internalFormat: gl.RG16I
            }, {
                name: "rg16ui", internalFormat: gl.RG16UI
            }, {
                name: "rg8", internalFormat: gl.RG8
            }, {
                name: "rg8i", internalFormat: gl.RG8I
            }, {
                name: "rg8ui", internalFormat: gl.RG8UI
            }, {
                name: "rg8_snorm", internalFormat: gl.RG8_SNORM
            }, {
                name: "r32f", internalFormat: gl.R32F
            }, {
                name: "r32i", internalFormat: gl.R32I
            }, {
                name: "r32ui", internalFormat: gl.R32UI
            }, {
                name: "r16f", internalFormat: gl.R16F
            }, {
                name: "r16i", internalFormat: gl.R16I
            }, {
                name: "r16ui", internalFormat: gl.R16UI
            }, {
                name: "r8", internalFormat: gl.R8
            }, {
                name: "r8i", internalFormat: gl.R8I
            }, {
                name: "r8ui", internalFormat: gl.R8UI
            }, {
                name: "r8_snorm", internalFormat: gl.R8_SNORM
            }
        ];

        // Depth and stencil formats
        /** @type {Array<{name: string, internalFormat: number}>} */
        var depthStencilFormats = [{
                name: "depth_component32f",
                internalFormat: gl.DEPTH_COMPONENT32F
            }, {
                name: "depth_component24",
                internalFormat: gl.DEPTH_COMPONENT24
            }, {
                name: "depth_component16",
                internalFormat: gl.DEPTH_COMPONENT16
            }, {
                name: "depth32f_stencil8",
                internalFormat: gl.DEPTH32F_STENCIL8
            }, {
                name: "depth24_stencil8",
                internalFormat: gl.DEPTH24_STENCIL8
            }
        ];

        // Basic TexImage2D usage.

        /** @type {tcuTestCase.DeqpTest} */
        var basicTexImageGroup = new tcuTestCase.DeqpTest(
            "basic_teximage2d", "Basic glTexImage2D() usage"
        );
        this.addChild(basicTexImageGroup);
        for (var formatNdx = 0; formatNdx < colorFormats.length; formatNdx++) {
            /** @type {string} */
            var fmtName = colorFormats[formatNdx].name;
            /** @type {number} */
            var format = colorFormats[formatNdx].internalFormat;
            /** @type {number} */
            var tex2DWidth = 64;
            /** @type {number} */
            var tex2DHeight = 128;
            /** @type {number} */
            var texCubeSize = 64;

            basicTexImageGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexImage2DCase(
                    fmtName + "_2d", "", format, tex2DWidth, tex2DHeight
                )
            );
            basicTexImageGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexImageCubeCase(
                    fmtName + "_cube",    "",    format, texCubeSize
                )
            );
        }

        // Randomized TexImage2D order.
        /** @type {tcuTestCase.DeqpTest} */
        var randomTexImageGroup = new tcuTestCase.DeqpTest(
            "randothis.m_teximage2d", "Randomized glTexImage2D() usage"
        );
        this.addChild(randomTexImageGroup);
        var rnd = new deRandom.Random(9);

        // 2D cases.
        for (var ndx = 0; var < 10; ndx++)
        {
            var formatNdx = rnd.getInt(0, colorFormats.length-1);
            var width        = 1 << rnd.getInt(2, 8);
            var height        = 1 << rnd.getInt(2, 8);

            randomTexImageGroup.addChild(
                new es3fTextureSpecificationTests.RandomOrderTexImage2DCase(
                    "2d_" + ndx, "", colorFormats[formatNdx].internalFormat,
                    width, height
                )
            );
        }

        // Cubemap cases.
        for (var ndx = 0; ndx < 10; ndx++)
        {
            formatNdx = rnd.getInt(0, colorFormats.length-1);
            /** @type {number} */ var size = 1 << rnd.getInt(2, 8);

            randomTexImageGroup.addChild(
                new es3fTextureSpecificationTests.RandomOrderTexImageCubeCase(
                    "cube_" + ndx, "",
                    colorFormats[formatNdx].internalFormat, size
                )
            );
        }

        // TexImage2D unpack alignment.
        /** @type {tcuTestCase.DeqpTest} */
        var alignGroup = new tcuTestCase.DeqpTest(
            "teximage2d_align", "glTexImage2D() unpack alignment tests"
        );
        this.addChild(alignGroup);

        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_r8_4_8", "", gl.R8, 4, 8, 4, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_r8_63_1", "", gl.R8, 63, 30, 1, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_r8_63_2", "", gl.R8, 63, 30, 1, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_r8_63_4", "", gl.R8, 63, 30, 1, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_r8_63_8", "", gl.R8, 63, 30, 1, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_rgba4_51_1", "", gl.RGBA4, 51, 30, 1, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_rgba4_51_2", "", gl.RGBA4, 51, 30, 1, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_rgba4_51_4", "", gl.RGBA4, 51, 30, 1, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_rgba4_51_8", "", gl.RGBA4, 51, 30, 1, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_rgb8_39_1", "", gl.RGB8, 39, 43, 1, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_rgb8_39_2", "", gl.RGB8, 39, 43, 1, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_rgb8_39_4", "", gl.RGB8, 39, 43, 1, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_rgb8_39_8", "", gl.RGB8, 39, 43, 1, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_rgba8_47_1", "", gl.RGBA8, 47, 27, 1, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_rgba8_47_2", "", gl.RGBA8, 47, 27, 1, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_rgba8_47_4", "", gl.RGBA8, 47, 27, 1, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImage2DAlignCase(
                "2d_rgba8_47_8", "", gl.RGBA8, 47, 27, 1, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_r8_4_8", "", gl.R8, 4, 3, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_r8_63_1", "", gl.R8, 63, 1, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_r8_63_2", "", gl.R8, 63, 1, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_r8_63_4", "", gl.R8, 63, 1, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_r8_63_8", "", gl.R8, 63, 1, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_rgba4_51_1", "", gl.RGBA4, 51, 1, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_rgba4_51_2", "", gl.RGBA4, 51, 1, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_rgba4_51_4", "", gl.RGBA4, 51, 1, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_rgba4_51_8", "", gl.RGBA4, 51, 1, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_rgb8_39_1", "", gl.RGB8, 39, 1, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_rgb8_39_2", "", gl.RGB8, 39, 1, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_rgb8_39_4", "", gl.RGB8, 39, 1, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_rgb8_39_8", "", gl.RGB8, 39, 1, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_rgba8_47_1", "", gl.RGBA8, 47, 1, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_rgba8_47_2", "", gl.RGBA8, 47, 1, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_rgba8_47_4", "", gl.RGBA8, 47, 1, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexImageCubeAlignCase(
                "cube_rgba8_47_8", "", gl.RGBA8, 47, 1, 8
            )
        );

        // glTexImage2D() unpack parameter cases.
        /** @type {tcuTestCase.DeqpTest} */
        var paramGroup = new tcuTestCase.TestCaseGroup(
            "teximage2d_unpack_params",
            "glTexImage2D() pixel transfer mode cases"
        );
        this.addChild(paramGroup);

        /**
         * @type {Array<{name: string, format: number, width: number,
         * height: number, rowLength: number, skipRows: number,
         * skipPixels: number, alignment: number}>}
         */
        var cases = [ {
                name: "rgb8_alignment", format: gl.RGB8, width: 31,
                height: 30, rowLength: 0, skipRows: 0, skipPixels: 0,
                alignment: 2
            }, {
                name: "rgb8_row_length", format: gl.RGB8, width: 31,
                height: 30, rowLength: 50, skipRows: 0, skipPixels: 0,
                alignment: 4
            }, {
                name: "rgb8_skip_rows", format: gl.RGB8, width: 31,
                height: 30, rowLength: 0, skipRows: 3, skipPixels: 0,
                alignment: 4
            }, {
                name: "rgb8_skip_pixels", format: gl.RGB8, width: 31,
                height: 30, rowLength: 36, skipRows: 0, skipPixels: 5,
                alignment: 4
            }, {
                name: "r8_complex1", format: gl.R8, width: 31,
                height: 30, rowLength: 64, skipRows: 1, skipPixels: 3,
                alignment: 1
            }, {
                name: "r8_complex2", format: gl.R8, width: 31,
                height: 30, rowLength: 64, skipRows: 1, skipPixels: 3,
                alignment: 2
            }, {
                name: "r8_complex3", format: gl.R8, width: 31,
                height: 30, rowLength: 64, skipRows: 1, skipPixels: 3,
                alignment: 4
            }, {
                name: "r8_complex4", format: gl.R8, width: 31,
                height: 30, rowLength: 64, skipRows: 1, skipPixels: 3,
                alignment: 8
            }, {
                name: "rgba8_complex1", format: gl.RGBA8, width: 56,
                height: 61, rowLength: 69, skipRows: 0, skipPixels: 0,
                alignment: 8
            }, {
                name: "rgba8_complex2", format: gl.RGBA8, width: 56,
                height: 61, rowLength: 69, skipRows: 0, skipPixels: 7,
                alignment: 8
            }, {
                name: "rgba8_complex3", format: gl.RGBA8, width: 56,
                height: 61, rowLength: 69, skipRows: 3, skipPixels: 0,
                alignment: 8
            }, {
                name: "rgba8_complex4", format: gl.RGBA8, width: 56,
                height: 61, rowLength: 69, skipRows: 3, skipPixels: 7,
                alignment: 8
            }, {
                name: "rgba32f_complex", format: gl.RGBA32F, width: 19,
                height: 10, rowLength: 27, skipRows: 1, skipPixels: 7,
                alignment: 8
            }
        ];

        for (var ndx = 0; ndx < cases.length; ndx++)
            paramGroup.addChild(
                new es3fTextureSpecificationTests.TexImage2DParamsCase(
                    cases[ndx].name, "", cases[ndx].format, cases[ndx].width,
                    cases[ndx].height, cases[ndx].rowLength,
                    cases[ndx].skipRows, cases[ndx].skipPixels,
                    cases[ndx].alignment
                )
            );

        // glTexImage2D() pbo cases.
        /** @type {tcuTestCase.DeqpTest} */
        var pboGroup = new tcuTestCase.DeqpTest(
            "teximage2d_pbo", "glTexImage2D() from PBO"
        );
        this.addChild(pboGroup);

        // Parameter cases
        /**
         * @type {Array<{name: string, format: number, width: number,
         * height: number, rowLength: number, skipRows: number,
         * skipPixels: number, alignment: number, offset: number}>}
         */
        var parameterCases = [ {
                name: "rgb8_offset", format: gl.RGB8, width: 31,
                height: 30, rowLength: 0, skipRows: 0, skipPixels: 0,
                alignment: 4, offset: 67
            }, {
                name: "rgb8_alignment", format: gl.RGB8, width: 31,
                height: 30, rowLength: 0, skipRows: 0, skipPixels: 0,
                alignment: 2, offset: 0
            }, {
                name: "rgb8_row_length", format: gl.RGB8, width: 31,
                height: 30, rowLength: 50, skipRows: 0, skipPixels: 0,
                alignment: 4, offset: 0
            }, {
                name: "rgb8_skip_rows", format: gl.RGB8, width: 31,
                height: 30, rowLength: 0, skipRows: 3, skipPixels: 0,
                alignment: 4, offset: 0
            }, {
                name: "rgb8_skip_pixels", format: gl.RGB8, width: 31,
                height: 30, rowLength: 36, skipRows: 0, skipPixels: 5,
                alignment: 4, offset: 0
            }
        ];

        for (var formatNdx = 0; formatNdx < colorFormats.length; formatNdx++)
        {
            fmtName        = colorFormats[formatNdx].name;
            format        = colorFormats[formatNdx].internalFormat;
            tex2DWidth    = 65;
            tex2DHeight    = 37;
            texCubeSize    = 64;

            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexImage2DBufferCase(
                    fmtName + "_2d",     "", format,
                    tex2DWidth, tex2DHeight, 0, 0, 0, 4, 0
                )
            );
            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexImageCubeBufferCase(
                    fmtName + "_cube", "", format,
                    texCubeSize, 0, 0, 0, 4, 0
                )
            );
        }

        for (var ndx = 0; ndx < parameterCases.length; ndx++)
        {
            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexImage2DBufferCase(
                    parameterCases[ndx].name + "_2d", "",
                    parameterCases[ndx].format, parameterCases[ndx].width,
                    parameterCases[ndx].height, parameterCases[ndx].rowLength,
                    parameterCases[ndx].skipRows,
                    parameterCases[ndx].skipPixels,
                    parameterCases[ndx].alignment,
                    parameterCases[ndx].offset
                )
            );
            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexImageCubeBufferCase(
                    parameterCases[ndx].name + "_cube", "",
                    parameterCases[ndx].format, parameterCases[ndx].width,
                    parameterCases[ndx].rowLength, parameterCases[ndx].skipRows,
                    parameterCases[ndx].skipPixels,
                    parameterCases[ndx].alignment, parameterCases[ndx].offset
                )
            );
        }

        // glTexImage2D() depth cases.
        /** @type {tcuTestCase.DeqpTest} */
        var shadow2dGroup = new tcuTestCase.DeqpTest(
            "teximage2d_depth",
            "glTexImage2D() with depth or depth/stencil format"
        );
        this.addChild(shadow2dGroup);

        for (var ndx = 0; ndx < depthStencilFormats.length; ndx++)
        {
            var tex2DWidth    = 64;
            var tex2DHeight    = 128;

            shadow2dGroup.addChild(
                new es3fTextureSpecificationTests.TexImage2DDepthCase(
                    depthStencilFormats[ndx].name, "",
                    depthStencilFormats[ndx].internalFormat,
                    tex2DWidth, tex2DHeight
                )
            );
        }

        // glTexImage2D() depth cases with pbo.
        shadow2dGroup = new tcuTestCase.DeqpTest(
            "teximage2d_depth_pbo",
            "glTexImage2D() with depth or depth/stencil format with pbo"
        );
        this.addChild(shadow2dGroup);

        for (var ndx = 0; ndx < depthStencilFormats.length; ndx++)
        {
            tex2DWidth    = 64;
            tex2DHeight    = 128;

            shadow2dGroup.addChild(
                new es3fTextureSpecificationTests.TexImage2DDepthBufferCase(
                    depthStencilFormats[ndx].name, "",
                    depthStencilFormats[ndx].internalFormat,
                    tex2DWidth, tex2DHeight
                )
            );
        }

        // Basic TexSubImage2D usage.
        /** @type {tcuTestCase.DeqpTest} */
        var basicTexSubImageGroup = new tcuTestCase.DeqpTest(
            "basic_texsubimage2d", "Basic glTexSubImage2D() usage"
        );
        this.addChild(basicTexSubImageGroup);
        for (var formatNdx = 0; formatNdx < colorFormats.length; formatNdx++)
        {
            fmtName        = colorFormats[formatNdx].name;
            format        = colorFormats[formatNdx].internalFormat;
            tex2DWidth    = 64;
            tex2DHeight    = 128;
            texCubeSize    = 64;

            basicTexSubImageGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexSubImage2DCase(
                    fmtName + "_2d", "", format, tex2DWidth, tex2DHeight
                )
            );
            basicTexSubImageGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexSubImageCubeCase(
                    fmtName + "_cube", "", format, texCubeSize
                )
            );
        }

        // TexSubImage2D to empty texture.
        /** @type {tcuTestCase.DeqpTest} */
        var texSubImageEmptyTexGroup = new tcuTestCase.DeqpTest(
            "texsubimage2d_empty_tex",
            "glTexSubImage2D() to texture that has storage but no data"
        );
        this.addChild(texSubImageEmptyTexGroup);
        for (var formatNdx = 0; formatNdx < unsizedFormats.length; formatNdx++)
        {
            fmtName        = unsizedFormats[formatNdx].name;
            format        = unsizedFormats[formatNdx].format;
            /** @type {number} */
            var dataType = unsizedFormats[formatNdx].dataType;
            tex2DWidth    = 64;
            tex2DHeight    = 32;
            texCubeSize    = 32;

            texSubImageEmptyTexGroup.addChild(
                new es3fTextureSpecificationTests.TexSubImage2DEmptyTexCase(
                    fmtName + "_2d", "", format, dataType, tex2DWidth, tex2DHeight
                )
            );
            texSubImageEmptyTexGroup.addChild(
                new es3fTextureSpecificationTests.TexSubImageCubeEmptyTexCase(
                    fmtName + "_cube", "", format, dataType, texCubeSize
                )
            );
        }

        // TexSubImage2D alignment cases.
        /** @type {tcuTestCase.DeqpTest} */
        var alignGroup = new tcuTestCase.DeqpTest(
            "texsubimage2d_align", "glTexSubImage2D() unpack alignment tests"
        );
        this.addChild(alignGroup);

        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_r8_1_1", "",    gl.R8, 64, 64, 13, 17,  1,  6, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_r8_1_2", "",    gl.R8, 64, 64, 13, 17,  1,  6, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_r8_1_4", "",    gl.R8, 64, 64, 13, 17,  1,  6, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_r8_1_8", "",    gl.R8, 64, 64, 13, 17,  1,  6, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_r8_63_1", "",    gl.R8, 64, 64,  1,  9, 63, 30, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_r8_63_2", "",    gl.R8, 64, 64,  1,  9, 63, 30, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_r8_63_4", "",    gl.R8, 64, 64,  1,  9, 63, 30, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_r8_63_8", "",    gl.R8, 64, 64,  1,  9, 63, 30, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_rgba4_51_1", "",    gl.RGBA4, 64, 64,  7, 29, 51, 30, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_rgba4_51_2", "",    gl.RGBA4, 64, 64,  7, 29, 51, 30, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_rgba4_51_4", "",    gl.RGBA4, 64, 64,  7, 29, 51, 30, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_rgba4_51_8", "",    gl.RGBA4, 64, 64,  7, 29, 51, 30, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_rgb8_39_1", "",    gl.RGB8, 64, 64, 11,  8, 39, 43, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_rgb8_39_2", "",    gl.RGB8, 64, 64, 11,  8, 39, 43, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_rgb8_39_4", "",    gl.RGB8, 64, 64, 11,  8, 39, 43, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_rgb8_39_8", "",    gl.RGB8, 64, 64, 11,  8, 39, 43, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_rgba8_47_1", "",    gl.RGBA8, 64, 64, 10,  1, 47, 27, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_rgba8_47_2", "",    gl.RGBA8, 64, 64, 10,  1, 47, 27, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_rgba8_47_4", "",    gl.RGBA8, 64, 64, 10,  1, 47, 27, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImage2DAlignCase(
                "2d_rgba8_47_8", "",    gl.RGBA8, 64, 64, 10,  1, 47, 27, 8
            )
        );

        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_r8_1_1", "",    gl.R8, 64, 13, 17,  1,  6, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_r8_1_2", "",    gl.R8, 64, 13, 17,  1,  6, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_r8_1_4", "",    gl.R8, 64, 13, 17,  1,  6, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_r8_1_8", "",    gl.R8, 64, 13, 17,  1,  6, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_r8_63_1", "",    gl.R8, 64,  1,  9, 63, 30, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_r8_63_2", "",    gl.R8, 64,  1,  9, 63, 30, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_r8_63_4", "",    gl.R8, 64,  1,  9, 63, 30, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_r8_63_8", "",    gl.R8, 64,  1,  9, 63, 30, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_rgba4_51_1", "",    gl.RGBA4, 64,  7, 29, 51, 30, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_rgba4_51_2", "",    gl.RGBA4, 64,  7, 29, 51, 30, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_rgba4_51_4", "",    gl.RGBA4, 64,  7, 29, 51, 30, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_rgba4_51_8", "",    gl.RGBA4, 64,  7, 29, 51, 30, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_rgb8_39_1", "",    gl.RGB8, 64, 11,  8, 39, 43, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_rgb8_39_2", "",    gl.RGB8, 64, 11,  8, 39, 43, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_rgb8_39_4", "",    gl.RGB8, 64, 11,  8, 39, 43, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_rgb8_39_8", "",    gl.RGB8, 64, 11,  8, 39, 43, 8
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_rgba8_47_1", "",    gl.RGBA8, 64, 10,  1, 47, 27, 1
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_rgba8_47_2", "",    gl.RGBA8, 64, 10,  1, 47, 27, 2
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_rgba8_47_4", "",    gl.RGBA8, 64, 10,  1, 47, 27, 4
            )
        );
        alignGroup.addChild(
            new es3fTextureSpecificationTests.TexSubImageCubeAlignCase(
                "cube_rgba8_47_8", "",    gl.RGBA8, 64, 10,  1, 47, 27, 8
            )
        );

        // glTexSubImage2D() pixel transfer mode cases.
        /** @type {tcuTestCase.DeqpTest} */
        var paramGroup = new tcuTestCase.DeqpTest(
            "texsubimage2d_unpack_params",
            "glTexSubImage2D() pixel transfer mode cases"
        );
        this.addChild(paramGroup);

        /**
         * @type {Array<{name: string, format: number, width: number,
         * height: number, subX: number, subY: number, subW: number,
         * subH: number, rowLength: number, skipRows: number,
         * skipPixels: number, alignment: number}>}
         */
        cases = [ {
                name: "rgb8_alignment", format: gl.RGB8, width: 54,
                height: 60, subX: 11, subY: 7, subW: 31, subH: 30,
                rowLength: 0, skipRows: 0, skipPixels: 0, alignment: 2
            }, {
                name: "rgb8_row_length", format: gl.RGB8, width: 54,
                height: 60, subX: 11, subY: 7, subW: 31, subH: 30,
                rowLength: 50, skipRows: 0, skipPixels: 0, alignment: 4
            }, {
                name: "rgb8_skip_rows", format: gl.RGB8, width: 54,
                height: 60, subX: 11, subY: 7, subW: 31, subH: 30,
                rowLength: 0, skipRows: 3, skipPixels: 0, alignment: 4
            }, {
                name: "rgb8_skip_pixels", format: gl.RGB8, width: 54,
                height: 60, subX: 11, subY: 7, subW: 31, subH: 30,
                rowLength: 36, skipRows: 0, skipPixels: 5, alignment: 4
            }, {
                name: "r8_complex1", format: gl.R8, width: 54,
                height: 60, subX: 11, subY: 7, subW: 31, subH: 30,
                rowLength: 64, skipRows: 1, skipPixels: 3, alignment: 1
            }, {
                name: "r8_complex2", format: gl.R8, width: 54,
                height: 60, subX: 11, subY: 7, subW: 31, subH: 30,
                rowLength: 64, skipRows: 1, skipPixels: 3, alignment: 2
            }, {
                name: "r8_complex3", format: gl.R8, width: 54,
                height: 60, subX: 11, subY: 7, subW: 31, subH: 30,
                rowLength: 64, skipRows: 1, skipPixels: 3, alignment: 4
            }, {
                name: "r8_complex4", format: gl.R8, width: 54,
                height: 60, subX: 11, subY: 7, subW: 31, subH: 30,
                rowLength: 64, skipRows: 1, skipPixels: 3, alignment: 8
            }, {
                name: "rgba8_complex1", format: gl.RGBA8, width: 92,
                height: 84, subX: 13, subY: 19, subW: 56, subH: 61,
                rowLength: 69, skipRows: 0, skipPixels: 0, alignment: 8
            }, {
                name: "rgba8_complex2", format: gl.RGBA8, width: 92,
                height: 84, subX: 13, subY: 19, subW: 56, subH: 61,
                rowLength: 69, skipRows: 0, skipPixels: 7, alignment: 8
            }, {
                name: "rgba8_complex3", format: gl.RGBA8, width: 92,
                height: 84, subX: 13, subY: 19, subW: 56, subH: 61,
                rowLength: 69, skipRows: 3, skipPixels: 0, alignment: 8
            }, {
                name: "rgba8_complex4", format: gl.RGBA8, width: 92,
                height: 84, subX: 13, subY: 19, subW: 56, subH: 61,
                rowLength: 69, skipRows: 3, skipPixels: 7, alignment: 8
            }, {
                name: "rgba32f_complex", format: gl.RGBA32F, width: 92,
                height: 84, subX: 13, subY: 19, subW: 56, subH: 61,
                rowLength: 69, skipRows: 3, skipPixels: 7, alignment: 8
            }
        ];

        for (var ndx = 0; ndx < cases.length; ndx++)
            paramGroup.addChild(
                new es3fTextureSpecificationTests.TexSubImage2DParamsCase(
                    cases[ndx].name, "", cases[ndx].format, cases[ndx].width,
                    cases[ndx].height, cases[ndx].subX, cases[ndx].subY,
                    cases[ndx].subW, cases[ndx].subH, cases[ndx].rowLength,
                    cases[ndx].skipRows, cases[ndx].skipPixels,
                    cases[ndx].alignment
                )
            );

        // glTexSubImage2D() PBO cases.
        /** @type {tcuTestCase.DeqpTest} */
        var pboGroup = new tcuTestCase.DeqpTest(
            "texsubimage2d_pbo",
            "glTexSubImage2D() pixel buffer object tests"
        );
        this.addChild(pboGroup);

        /** @type{Array<{name: string, format: number, width: number,
         * height: number, subX: number, subY: number,
         * subW: number, subH: number, rowLength: number, skipRows: number,
         * skipPixels: number, alignment: number, offset: number}>}
         */
        var paramCases = [
            {
                name: "rgb8_offset", format: gl.RGB8, width: 54,
                height: 60, subX: 11, subY: 7, subW: 31, subH: 30,
                rowLength: 0, skipRows: 0, skipPixels: 0,
                alignment: 4, offset: 67
            }, {
                name: "rgb8_alignment", format: gl.RGB8, width: 54,
                height: 60, subX: 11, subY: 7, subW: 31, subH: 30,
                rowLength: 0, skipRows: 0, skipPixels: 0,
                alignment: 2, offset: 0
            }, {
                name: "rgb8_row_length", format: gl.RGB8, width: 54,
                height: 60, subX: 11, subY: 7, subW: 31, subH: 30,
                rowLength: 50, skipRows: 0, skipPixels: 0,
                alignment: 4, offset: 0
            }, {
                name: "rgb8_skip_rows", format: gl.RGB8, width: 54,
                height: 60, subX: 11, subY: 7, subW: 31, subH: 30,
                rowLength: 0, skipRows: 3, skipPixels: 0,
                alignment: 4, offset: 0
            }, {
                name: "rgb8_skip_pixels", format: gl.RGB8, width: 54,
                height: 60, subX: 11, subY: 7, subW: 31, subH: 30,
                rowLength: 36, skipRows: 0, skipPixels: 5,
                alignment: 4, offset: 0
            }
        ];

        for (var ndx = 0; ndx < colorFormats.length; ndx++)
        {
            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexSubImage2DBufferCase(
                    colorFormats[ndx].name + "_2d", "",
                    colorFormats[ndx].internalFormat,
                    54,    // Width
                    60,    // Height
                    11,    // Sub X
                    7,    // Sub Y
                    31,    // Sub W
                    30,    // Sub H
                    0,    // Row len
                    0,    // Skip rows
                    0,    // Skip pixels
                    4,    // Alignment
                    0    /* offset */
                )
            );
            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexSubImageCubeBufferCase(
                    colorFormats[ndx].name + "_cube", "",
                    colorFormats[ndx].internalFormat,
                    64,    // Size
                    11,    // Sub X
                    7,    // Sub Y
                    31,    // Sub W
                    30,    // Sub H
                    0,    // Row len
                    0,    // Skip rows
                    0,    // Skip pixels
                    4,    // Alignment
                    0    /* offset */
                )
            );
        }

        for (var ndx = 0; ndx < paramCases.length; ndx++)
        {
            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexSubImage2DBufferCase(
                    paramCases[ndx].name + "_2d", "",
                    paramCases[ndx].format,
                    paramCases[ndx].width,
                    paramCases[ndx].height,
                    paramCases[ndx].subX,
                    paramCases[ndx].subY,
                    paramCases[ndx].subW,
                    paramCases[ndx].subH,
                    paramCases[ndx].rowLength,
                    paramCases[ndx].skipRows,
                    paramCases[ndx].skipPixels,
                    paramCases[ndx].alignment,
                    paramCases[ndx].offset));
            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexSubImageCubeBufferCase(
                    paramCases[ndx].name + "_cube", "",
                    paramCases[ndx].format,
                    paramCases[ndx].width,
                    paramCases[ndx].subX,
                    paramCases[ndx].subY,
                    paramCases[ndx].subW,
                    paramCases[ndx].subH,
                    paramCases[ndx].rowLength,
                    paramCases[ndx].skipRows,
                    paramCases[ndx].skipPixels,
                    paramCases[ndx].alignment,
                    paramCases[ndx].offset
                )
            );
        }

        // glTexSubImage2D() depth cases.
        /** @type {tcuTestCase.DeqpTest} */
        var shadow2dGroup = new tcuTestCase.DeqpTest(
            "texsubimage2d_depth",
            "glTexSubImage2D() with depth or depth/stencil format"
        );
        this.addChild(shadow2dGroup);

        for (var ndx = 0; ndx < depthStencilFormats.length; ndx++)
        {
            tex2DWidth    = 64;
            tex2DHeight    = 32;

            shadow2dGroup.addChild(
                new es3fTextureSpecificationTests.TexSubImage2DDepthCase(
                    depthStencilFormats[ndx].name, "",
                    depthStencilFormats[ndx].internalFormat,
                    tex2DWidth, tex2DHeight
                )
            );
        }

        // Basic glCopyTexImage2D() cases
        /** @type {tcuTestCase.DeqpTest} */
        var copyTexImageGroup = new tcuTestCase.DeqpTest(
            "basic_copyteximage2d", "Basic glCopyTexImage2D() usage"
        );
        this.addChild(copyTexImageGroup);

        copyTexImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexImage2DCase(
                "2d_alpha", "",    gl.ALPHA,            128, 64
            )
        );
        copyTexImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexImage2DCase(
                "2d_luminance", "",    gl.LUMINANCE,        128, 64
            )
        );
        copyTexImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexImage2DCase(
                "2d_luminance_alpha", "",    gl.LUMINANCE_ALPHA,    128, 64
            )
        );
        copyTexImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexImage2DCase(
                "2d_rgb", "",    gl.RGB,                128, 64
            )
        );
        copyTexImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexImage2DCase(
                "2d_rgba", "",    gl.RGBA,            128, 64
            )
        );

        copyTexImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexImageCubeCase(
                "cube_alpha", "",    gl.ALPHA,            64
            )
        );
        copyTexImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexImageCubeCase(
                "cube_luminance", "",    gl.LUMINANCE,        64
            )
        );
        copyTexImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexImageCubeCase(
                "cube_luminance_alpha", "",    gl.LUMINANCE_ALPHA,    64
            )
        );
        copyTexImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexImageCubeCase(
                "cube_rgb", "",    gl.RGB,                64
            )
        );
        copyTexImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexImageCubeCase(
                "cube_rgba", "",    gl.RGBA,            64
            )
        );

        // Basic glCopyTexSubImage2D() cases
        /** @type {tcuTestCase.DeqpTest} */
        var copyTexSubImageGroup = new tcuTestCase.DeqpTest(
            "basic_copytexsubimage2d", "Basic glCopyTexSubImage2D() usage"
        );
        this.addChild(copyTexSubImageGroup);

        copyTexSubImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexSubImage2DCase(
                "2d_alpha", "",    gl.ALPHA,            gl.UNSIGNED_BYTE, 128, 64
            )
        );
        copyTexSubImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexSubImage2DCase(
                "2d_luminance", "",    gl.LUMINANCE,        gl.UNSIGNED_BYTE, 128, 64
            )
        );
        copyTexSubImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexSubImage2DCase(
                "2d_luminance_alpha", "",    gl.LUMINANCE_ALPHA,    gl.UNSIGNED_BYTE, 128, 64
            )
        );
        copyTexSubImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexSubImage2DCase(
                "2d_rgb", "",    gl.RGB,                gl.UNSIGNED_BYTE, 128, 64
            )
        );
        copyTexSubImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexSubImage2DCase(
                "2d_rgba", "",    gl.RGBA,            gl.UNSIGNED_BYTE, 128, 64
            )
        );

        copyTexSubImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexSubImageCubeCase(
                "cube_alpha", "",    gl.ALPHA,            gl.UNSIGNED_BYTE, 64
            )
        );
        copyTexSubImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexSubImageCubeCase(
                "cube_luminance", "",    gl.LUMINANCE,        gl.UNSIGNED_BYTE, 64
            )
        );
        copyTexSubImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexSubImageCubeCase(
                "cube_luminance_alpha", "",    gl.LUMINANCE_ALPHA,    gl.UNSIGNED_BYTE, 64
            )
        );
        copyTexSubImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexSubImageCubeCase(
                "cube_rgb", "",    gl.RGB,                gl.UNSIGNED_BYTE, 64
            )
        );
        copyTexSubImageGroup.addChild(
            new es3fTextureSpecificationTests.BasicCopyTexSubImageCubeCase(
                "cube_rgba", "",    gl.RGBA,            gl.UNSIGNED_BYTE, 64
            )
        );

        // Basic TexImage3D usage.
        /** @type {tcuTestCase.DeqpTest} */
        var basicTexImageGroup = new tcuTestCase.DeqpTest(
            "basic_teximage3d", "Basic glTexImage3D() usage"
        );
        this.addChild(basicTexImageGroup);
        for (var formatNdx = 0; formatNdx < colorFormats.length; formatNdx++)
        {
            fmtName                = colorFormats[formatNdx].name;
            format                = colorFormats[formatNdx].internalFormat;
            /** @type {number} */ var tex2DArrayWidth        = 57;
            /** @type {number} */ var tex2DArrayHeight    = 44;
            /** @type {number} */ var tex2DArrayLevels    = 5;
            /** @type {number} */ var tex3DWidth            = 63;
            /** @type {number} */ var tex3DHeight            = 29;
            /** @type {number} */ var tex3DDepth            = 11;

            basicTexImageGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexImage2DArrayCase(
                    fmtName + "_2d_array", "", format,
                    tex2DArrayWidth, tex2DArrayHeight, tex2DArrayLevels
                )
            );
            basicTexImageGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexImage3DCase(
                    fmtName + "_3d", "", format,
                    tex3DWidth, tex3DHeight, tex3DDepth
                )
            );
        }

        // glTexImage3D() unpack params cases.
        /** @type {tcuTestCase.DeqpTest} */
        var paramGroup = new tcuTestCase.DeqpTest(
            "teximage3d_unpack_params", "glTexImage3D() unpack parameters"
        );
        this.addChild(paramGroup);

        /** @type {Array<{
         * name: string, format: number, width: number, height: number,
         * depth: number, imageHeight: number, rowLength:number,
         * skipImages:number, skipRows:number, skipPixels: number,
         * alignment:number}>}
         */
        var cases = [
            {
                name: "rgb8_image_height", format: gl.RGB8, width: 23,
                height: 19, depth: 8, imageHeight: 26, rowLength: 0,
                skipImages: 0, skipRows: 0, skipPixels: 0, alignment: 4
            }, {
                name: "rgb8_row_length", format: gl.RGB8, width: 23,
                height: 19, depth: 8, imageHeight: 0, rowLength: 27,
                skipImages: 0, skipRows: 0, skipPixels: 0, alignment: 4
            }, {
                name: "rgb8_skip_images", format: gl.RGB8, width: 23,
                height: 19, depth: 8, imageHeight: 0, rowLength: 0,
                skipImages: 3, skipRows: 0, skipPixels: 0, alignment: 4
            }, {
                name: "rgb8_skip_rows", format: gl.RGB8, width: 23,
                height: 19, depth: 8, imageHeight: 22, rowLength: 0,
                skipImages: 0, skipRows: 3, skipPixels: 0, alignment: 4
            }, {
                name: "rgb8_skip_pixels", format: gl.RGB8, width: 23,
                height: 19, depth: 8, imageHeight: 0, rowLength: 25,
                skipImages: 0, skipRows: 0, skipPixels: 2, alignment: 4
            }, {
                name: "r8_complex1", format: gl.R8, width: 13,
                height: 17, depth: 11, imageHeight: 23, rowLength: 15,
                skipImages: 2, skipRows: 3, skipPixels: 1, alignment: 1
            }, {
                name: "r8_complex2", format: gl.R8, width: 13,
                height: 17, depth: 11, imageHeight: 23, rowLength: 15,
                skipImages: 2, skipRows: 3, skipPixels: 1, alignment: 2
            }, {
                name: "r8_complex3", format: gl.R8, width: 13,
                height: 17, depth: 11, imageHeight: 23, rowLength: 15,
                skipImages: 2, skipRows: 3, skipPixels: 1, alignment: 4
            }, {
                name: "r8_complex4", format: gl.R8, width: 13,
                height: 17, depth: 11, imageHeight: 23, rowLength: 15,
                skipImages: 2, skipRows: 3, skipPixels: 1, alignment: 8
            }, {
                name: "rgba8_complex1", format: gl.RGBA8, width: 11,
                height: 20, depth: 8, imageHeight: 25, rowLength: 14,
                skipImages: 0, skipRows: 0, skipPixels: 0, alignment: 8
            }, {
                name: "rgba8_complex2", format: gl.RGBA8, width: 11,
                height: 20, depth: 8, imageHeight: 25, rowLength: 14,
                skipImages: 0, skipRows: 2, skipPixels: 0, alignment: 8
            }, {
                name: "rgba8_complex3", format: gl.RGBA8, width: 11,
                height: 20, depth: 8, imageHeight: 25, rowLength: 14,
                skipImages: 0, skipRows: 0, skipPixels: 3, alignment: 8
            }, {
                name: "rgba8_complex4", format: gl.RGBA8, width: 11,
                height: 20, depth: 8, imageHeight: 25, rowLength: 14,
                skipImages: 0, skipRows: 2, skipPixels: 3, alignment: 8
            }, {
                name: "rgba32f_complex", format: gl.RGBA32F, width: 11,
                height: 20, depth: 8, imageHeight: 25, rowLength: 14,
                skipImages: 0, skipRows: 2, skipPixels: 3, alignment: 8
             }
        ];

        for (var ndx = 0; ndx < cases.length; ndx++)
            paramGroup.addChild(
                new es3fTextureSpecificationTests.TexImage3DParamsCase(
                    cases[ndx].name, "", cases[ndx].format, cases[ndx].width,
                    cases[ndx].height, cases[ndx].depth, cases[ndx].imageHeight,
                    cases[ndx].rowLength, cases[ndx].skipImages,
                    cases[ndx].skipRows, cases[ndx].skipPixels,
                    cases[ndx].alignment
                )
            );

        // glTexImage3D() pbo cases.
        /** @type {tcuTestCase.DeqpTest} */
        var pboGroup = new tcuTestCase.DeqpTest(
            "teximage3d_pbo", "glTexImage3D() from PBO"
        );
        this.addChild(pboGroup);

        // Parameter cases
        /** @type {Array<{name: string, format: number, width: number,
         * height: number, depth: number, imageHeight: number,
         * rowLength: number, skipImages: number, skipRows: number,
         * skipPixels: number, alignment: number, offset: number}>}
         */
        var parameterCases = [
            {
                name: "rgb8_offset", format: gl.RGB8, width: 23,
                height: 19, depth: 8, imageHeight: 0, rowLength: 0,
                skipImages: 0, skipRows: 0, skipPixels: 0, alignment: 1,
                offset: 67
            }, {
                name: "rgb8_alignment", format: gl.RGB8, width: 23,
                height: 19, depth: 8, imageHeight: 0, rowLength: 0,
                skipImages: 0, skipRows: 0, skipPixels: 0, alignment: 2,
                offset: 0
            }, {
                name: "rgb8_image_height", format: gl.RGB8, width: 23,
                height: 19, depth: 8, imageHeight: 26, rowLength: 0,
                skipImages: 0, skipRows: 0, skipPixels: 0, alignment: 4,
                offset: 0
            }, {
                name: "rgb8_row_length", format: gl.RGB8, width: 23,
                height: 19, depth: 8, imageHeight: 0, rowLength: 27,
                skipImages: 0, skipRows: 0, skipPixels: 0, alignment: 4,
                offset: 0
            }, {
                name: "rgb8_skip_images", format: gl.RGB8, width: 23,
                height: 19, depth: 8, imageHeight: 0, rowLength: 0,
                skipImages: 3, skipRows: 0, skipPixels: 0, alignment: 4,
                offset: 0
            }, {
                name: "rgb8_skip_rows", format: gl.RGB8, width: 23,
                height: 19, depth: 8, imageHeight: 22, rowLength: 0,
                skipImages: 0, skipRows: 3, skipPixels: 0, alignment: 4,
                offset: 0
            }, {
                name: "rgb8_skip_pixels", format: gl.RGB8, width: 23,
                height: 19, depth: 8, imageHeight: 0, rowLength: 25,
                skipImages: 0, skipRows: 0, skipPixels: 2, alignment: 4,
                offset: 0
            }
        ];

        for (var formatNdx = 0; formatNdx < colorFormats.length; formatNdx++)
        {
            fmtName = colorFormats[formatNdx].name;
            format = colorFormats[formatNdx].internalFormat;
            tex3DWidth = 11;
            tex3DHeight = 20;
            tex3DDepth = 8;

            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexImage2DArrayBufferCase(
                    fmtName + "_2d_array", "", format, tex3DWidth, tex3DHeight,
                    tex3DDepth, 0, 0, 0, 0, 0, 4, 0
                )
            );
            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexImage3DBufferCase(
                    fmtName + "_3d", "", format, tex3DWidth, tex3DHeight,
                    tex3DDepth, 0, 0, 0, 0, 0, 4, 0
                )
            );
        }

        for (var ndx = 0; ndx < parameterCases.lenght; ndx++)
        {
            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexImage2DArrayBufferCase(
                    parameterCases[ndx].name + "_2d_array", "",
                    parameterCases[ndx].format, parameterCases[ndx].width,
                    parameterCases[ndx].depth, parameterCases[ndx].height,
                    parameterCases[ndx].imageHeight,
                    parameterCases[ndx].rowLength,
                    parameterCases[ndx].skipImages,
                    parameterCases[ndx].skipRows,
                    parameterCases[ndx].skipPixels,
                    parameterCases[ndx].alignment, parameterCases[ndx].offset
                )
            );
            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexImage3DBufferCase(
                    parameterCases[ndx].name + "_3d", "",
                    parameterCases[ndx].format, parameterCases[ndx].width,
                    parameterCases[ndx].depth, parameterCases[ndx].height,
                    parameterCases[ndx].imageHeight,
                    parameterCases[ndx].rowLength,
                    parameterCases[ndx].skipImages,
                    parameterCases[ndx].skipRows,
                    parameterCases[ndx].skipPixels,
                    parameterCases[ndx].alignment, parameterCases[ndx].offset
                )
            );
        }

        // glTexImage3D() depth cases.
        /** @type {tcuTestCase.DeqpTest} */
        var shadow3dGroup = new tcuTestCase.DeqpTest(
            "teximage3d_depth",
            "glTexImage3D() with depth or depth/stencil format"
        );
        this.addChild(shadow3dGroup);

        for (var ndx = 0; ndx < depthStencilFormats.length; ndx++)
        {
            tex3DWidth = 32;
            tex3DHeight = 64;
            tex3DDepth = 8;

            shadow3dGroup.addChild(
                new es3fTextureSpecificationTests.TexImage2DArrayDepthCase(
                    depthStencilFormats[ndx].name + "_2d_array", "",
                    depthStencilFormats[ndx].internalFormat,
                    tex3DWidth, tex3DHeight, tex3DDepth
                )
            );
        }

        // glTexImage3D() depth cases with pbo.
        /** @type {tcuTestCase.DeqpTest} */
        shadow3dGroup = new tcuTestCase.DeqpTest(
            "teximage3d_depth_pbo",
            "glTexImage3D() with depth or depth/stencil format with pbo"
        );
        this.addChild(shadow3dGroup);

        for (var ndx = 0; ndx < depthStencilFormats.length; ndx++)
        {
            tex3DWidth    = 32;
            tex3DHeight    = 64;
            tex3DDepth    = 8;

            shadow3dGroup.addChild(
                new es3fTextureSpecificationTests.TexImage2DArrayDepthBufferCase(
                    depthStencilFormats[ndx].name + "_2d_array", "",
                    depthStencilFormats[ndx].internalFormat,
                    tex3DWidth, tex3DHeight, tex3DDepth
                )
            );
        }

        // Basic TexSubImage3D usage.
        /** @type {tcuTestCase.DeqpTest} */
        basicTexSubImageGroup = new tcuTestCase.DeqpTest(
            "basic_texsubimage3d", "Basic glTexSubImage3D() usage"
        );
        this.addChild(basicTexSubImageGroup);
        for (var formatNdx = 0; formatNdx < colorFormats.length; formatNdx++)
        {
            fmtName        = colorFormats[formatNdx].name;
            format        = colorFormats[formatNdx].internalFormat;
            tex3DWidth    = 32;
            tex3DHeight    = 64;
            tex3DDepth    = 8;

            basicTexSubImageGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexSubImage3DCase(
                    fmtName + "_3d", "", format,
                    tex3DWidth, tex3DHeight, tex3DDepth
                )
            );
        }

        // glTexSubImage3D() unpack params cases.
        /** @type {tcuTestCase.DeqpTest} */
        paramGroup = new tcuTestCase.DeqpTest(
            "texsubimage3d_unpack_params", "glTexSubImage3D() unpack parameters"
        );
        this.addChild(paramGroup);

        /** @type {Array<{name: string, format: number, width: number,
         * height: number, depth: number, subX: number, subY: number,
         * subZ: number, subW: number, subH: number, subD: number,
         * imageHeight: number, rowLength: number, skipImages: number,
         * skipRows: number, skipPixels: number, alignment: number}>}
         */
        cases = [
            {
                name: "rgb8_image_height", format: gl.RGB8, width: 26,
                height: 25, depth: 10, subX: 1, subY: 2, subZ: 1, subW: 23,
                subH: 19, subD: 8, imageHeight: 26, rowLength: 0,
                skipImages: 0, skipRows: 0, skipPixels: 0, alignment: 4
            }, {
                name: "rgb8_row_length", format: gl.RGB8, width: 26,
                height: 25, depth: 10, subX: 1, subY: 2, subZ: 1, subW: 23,
                subH: 19, subD: 8, imageHeight: 0, rowLength: 27,
                skipImages: 0, skipRows: 0, skipPixels: 0, alignment: 4
            }, {
                name: "rgb8_skip_images", format: gl.RGB8, width: 26,
                height: 25, depth: 10, subX: 1, subY: 2, subZ: 1, subW: 23,
                subH: 19, subD: 8, imageHeight: 0, rowLength: 0,
                skipImages: 3, skipRows: 0, skipPixels: 0, alignment: 4
            }, {
                name: "rgb8_skip_rows", format: gl.RGB8, width: 26,
                height: 25, depth: 10, subX: 1, subY: 2, subZ: 1, subW: 23,
                subH: 19, subD: 8, imageHeight: 22, rowLength: 0,
                skipImages: 0, skipRows: 3, skipPixels: 0, alignment: 4
            }, {
                name: "rgb8_skip_pixels", format: gl.RGB8, width: 26,
                height: 25, depth: 10, subX: 1, subY: 2, subZ: 1, subW: 23,
                subH: 19, subD: 8, imageHeight: 0, rowLength: 25,
                skipImages: 0, skipRows: 0, skipPixels: 2, alignment: 4
            }, {
                name: "r8_complex1", format: gl.R8, width: 15,
                height: 20, depth: 11, subX: 1, subY: 1, subZ: 0, subW: 13,
                subH: 17, subD: 11, imageHeight: 23, rowLength: 15,
                skipImages: 2, skipRows: 3, skipPixels: 1, alignment: 1
            }, {
                name: "r8_complex2", format: gl.R8, width: 15,
                height: 20, depth: 11, subX: 1, subY: 1, subZ: 0, subW: 13,
                subH: 17, subD: 11, imageHeight: 23, rowLength: 15,
                skipImages: 2, skipRows: 3, skipPixels: 1, alignment: 2
            }, {
                name: "r8_complex3", format: gl.R8, width: 15,
                height: 20, depth: 11, subX: 1, subY: 1, subZ: 0, subW: 13,
                subH: 17, subD: 11, imageHeight: 23, rowLength: 15,
                skipImages: 2, skipRows: 3, skipPixels: 1, alignment: 4
            }, {
                name: "r8_complex4", format: gl.R8, width: 15,
                height: 20, depth: 11, subX: 1, subY: 1, subZ: 0, subW: 13,
                subH: 17, subD: 11, imageHeight: 23, rowLength: 15,
                skipImages: 2, skipRows: 3, skipPixels: 1, alignment: 8
            }, {
                name: "rgba8_complex1", format: gl.RGBA8, width: 15,
                height: 25, depth: 10, subX: 0, subY: 5, subZ: 1, subW: 11,
                subH: 20, subD: 8, imageHeight: 25, rowLength: 14,
                skipImages: 0, skipRows: 0, skipPixels: 0, alignment: 8
            }, {
                name: "rgba8_complex2", format: gl.RGBA8, width: 15,
                height: 25, depth: 10, subX: 0, subY: 5, subZ: 1, subW: 11,
                subH: 20, subD: 8, imageHeight: 25, rowLength: 14,
                skipImages: 0, skipRows: 2, skipPixels: 0, alignment: 8
            }, {
                name: "rgba8_complex3", format: gl.RGBA8, width: 15,
                height: 25, depth: 10, subX: 0, subY: 5, subZ: 1, subW: 11,
                subH: 20, subD: 8, imageHeight: 25, rowLength: 14,
                skipImages: 0, skipRows: 0, skipPixels: 3, alignment: 8
            }, {
                name: "rgba8_complex4", format: gl.RGBA8, width: 15,
                height: 25, depth: 10, subX: 0, subY: 5, subZ: 1, subW: 11,
                subH: 20, subD: 8, imageHeight: 25, rowLength: 14,
                skipImages: 0, skipRows: 2, skipPixels: 3, alignment: 8
            }, {
                name: "rgba32f_complex", format: gl.RGBA32F, width: 15,
                height: 25, depth: 10, subX: 0, subY: 5, subZ: 1, subW: 11,
                subH: 20, subD: 8, imageHeight: 25, rowLength: 14,
                skipImages: 0, skipRows: 2, skipPixels: 3, alignment: 8
            }
        ];

        for (var ndx = 0; ndx < cases.length; ndx++)
            paramGroup.addChild(
                new es3fTextureSpecificationTests.TexSubImage3DParamsCase(
                    cases[ndx].name, "", cases[ndx].format,
                    cases[ndx].width, cases[ndx].height, cases[ndx].depth,
                    cases[ndx].subX, cases[ndx].subY, cases[ndx].subZ,
                    cases[ndx].subW, cases[ndx].subH, cases[ndx].subD,
                    cases[ndx].imageHeight, cases[ndx].rowLength,
                    cases[ndx].skipImages, cases[ndx].skipRows,
                    cases[ndx].skipPixels, cases[ndx].alignment
                )
            );

        // glTexSubImage3D() PBO cases.
        /** @type {tcuTestCase.DeqpTest} */
        pboGroup = new tcuTestCase.DeqpTest(
            "texsubimage3d_pbo", "glTexSubImage3D() pixel buffer object tests"
        );
        this.addChild(pboGroup);

        /** @type {Array<{name: string, format: number, width: number,
         * height: number, depth: number, subX: number, subY: number,
         * subZ: number, subW: number, subH: number, subD: number,
         * imageHeight: number, rowLength: number, skipImages: number,
         * skipRows: number, skipPixels: number, alignment: number,
         * offset: number}>}
         */
        paramCases = [ {
                name: "rgb8_offset", format: gl.RGB8, width: 26,
                height: 25, depth: 10, subX: 1, subY: 2, subZ: 1, subW: 23,
                subH: 19, subD: 8, imageHeight: 0, rowLength: 0, skipImages: 0,
                skipRows: 0, skipPixels: 0, alignment: 4, offset: 67
            }, {
                name: "rgb8_image_height", format: gl.RGB8, width: 26,
                height: 25, depth: 10, subX: 1, subY: 2, subZ: 1, subW: 23,
                subH: 19, subD: 8, imageHeight: 26, rowLength: 0, skipImages: 0,
                skipRows: 0, skipPixels: 0, alignment: 4, offset: 0
            }, {
                name: "rgb8_row_length", format: gl.RGB8, width: 26,
                height: 25, depth: 10, subX: 1, subY: 2, subZ: 1, subW: 23,
                subH: 19, subD: 8, imageHeight: 0, rowLength: 27, skipImages: 0,
                skipRows: 0, skipPixels: 0, alignment: 4, offset: 0
            }, {
                name: "rgb8_skip_images", format: gl.RGB8, width: 26,
                height: 25, depth: 10, subX: 1, subY: 2, subZ: 1, subW: 23,
                subH: 19, subD: 8, imageHeight: 0, rowLength: 0, skipImages: 3,
                skipRows: 0, skipPixels: 0, alignment: 4, offset: 0
            }, {
                name: "rgb8_skip_rows", format: gl.RGB8, width: 26,
                height: 25, depth: 10, subX: 1, subY: 2, subZ: 1, subW: 23,
                subH: 19, subD: 8, imageHeight: 22, rowLength: 0, skipImages: 0,
                skipRows: 3, skipPixels: 0, alignment: 4, offset: 0
            }, {
                name: "rgb8_skip_pixels", format: gl.RGB8, width: 26,
                height: 25, depth: 10, subX: 1, subY: 2, subZ: 1, subW: 23,
                subH: 19, subD: 8, imageHeight: 0, rowLength: 25, skipImages: 0,
                skipRows: 0, skipPixels: 2, alignment: 4, offset: 0
            }
        ];

        for (var ndx = 0; ndx < colorFormats.length; ndx++)
        {
            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexSubImage2DArrayBufferCase(
                    colorFormats[ndx].name + "_2d_array", "",
                    colorFormats[ndx].internalFormat,
                    26,    // Width
                    25,    // Height
                    10,    // Depth
                    1,    // Sub X
                    2,    // Sub Y
                    0,    // Sub Z
                    23,    // Sub W
                    19,    // Sub H
                    8,    // Sub D
                    0,    // Image height
                    0,    // Row length
                    0,    // Skip images
                    0,    // Skip rows
                    0,    // Skip pixels
                    4,    // Alignment
                    0    /* offset */
                )
            );
            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexSubImage3DBufferCase(
                    colorFormats[ndx].name + "_3d", "",
                    colorFormats[ndx].internalFormat,
                    26,    // Width
                    25,    // Height
                    10,    // Depth
                    1,    // Sub X
                    2,    // Sub Y
                    0,    // Sub Z
                    23,    // Sub W
                    19,    // Sub H
                    8,    // Sub D
                    0,    // Image height
                    0,    // Row length
                    0,    // Skip images
                    0,    // Skip rows
                    0,    // Skip pixels
                    4,    // Alignment
                    0    /* offset */
                )
            );
        }

        for (var ndx = 0; ndx < paramCases.length; ndx++)
        {
            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexSubImage2DArrayBufferCase(
                    paramCases[ndx].name + "_2d_array", "",
                    paramCases[ndx].format, paramCases[ndx].width,
                    paramCases[ndx].height, paramCases[ndx].depth,
                    paramCases[ndx].subX, paramCases[ndx].subY,
                    paramCases[ndx].subZ, paramCases[ndx].subW,
                    paramCases[ndx].subH, paramCases[ndx].subD,
                    paramCases[ndx].imageHeight, paramCases[ndx].rowLength,
                    paramCases[ndx].skipImages, paramCases[ndx].skipRows,
                    paramCases[ndx].skipPixels, paramCases[ndx].alignment,
                    paramCases[ndx].offset
                )
            );
            pboGroup.addChild(
                new es3fTextureSpecificationTests.TexSubImage3DBufferCase(
                    paramCases[ndx].name + "_3d", "",
                    paramCases[ndx].format, paramCases[ndx].width,
                    paramCases[ndx].height, paramCases[ndx].depth,
                    paramCases[ndx].subX, paramCases[ndx].subY,
                    paramCases[ndx].subZ, paramCases[ndx].subW,
                    paramCases[ndx].subH, paramCases[ndx].subD,
                    paramCases[ndx].imageHeight, paramCases[ndx].rowLength,
                    paramCases[ndx].skipImages, paramCases[ndx].skipRows,
                    paramCases[ndx].skipPixels, paramCases[ndx].alignment,
                    paramCases[ndx].offset
                )
            );
        }

        // glTexSubImage3D() depth cases.
        /** @type {tcuTestCase.DeqpTest} */
        shadow3dGroup = new tcuTestCase.DeqpTest(
            "texsubimage3d_depth",
            "glTexSubImage3D() with depth or depth/stencil format"
        );
        this.addChild(shadow3dGroup);

        for (var ndx = 0; ndx < depthStencilFormats.length; ndx++)
        {
            tex2DArrayWidth        = 57;
            tex2DArrayHeight    = 44;
            tex2DArrayLevels    = 5;

            shadow3dGroup.addChild(
                new es3fTextureSpecificationTests.TexSubImage2DArrayDepthCase(
                    depthStencilFormats[ndx].name + "_2d_array", "",
                    depthStencilFormats[ndx].internalFormat, tex2DArrayWidth,
                    tex2DArrayHeight, tex2DArrayLevels
                )
            );
        }

        // glTexStorage2D() cases.
        /** @type {tcuTestCase.DeqpTest} */
        texStorageGroup = new tcuTestCase.DeqpTest(
            "texstorage2d", "Basic glTexStorage2D() usage"
        );
        this.addChild(texStorageGroup);

        // All formats.
        /** @type {tcuTestCase.DeqpTest} */
        formatGroup = new tcuTestCase.DeqpTest(
            "format", "glTexStorage2D() with all formats"
        );
        texStorageGroup.addChild(formatGroup);

        // Color formats.
        for (var formatNdx = 0; formatNdx < colorFormats.length; formatNdx++)
        {
            fmtName            = colorFormats[formatNdx].name;
            /** @type {number} */ var internalFormat    = colorFormats[formatNdx].internalFormat;
            tex2DWidth        = 117;
            tex2DHeight        = 97;
            tex2DLevels        = maxLevelCount(tex2DWidth, tex2DHeight);
            /** @type {number} */ var cubeSize        = 57;
            /** @type {number} */
            var cubeLevels = es3fTextureSpecificationTests.maxLevelCount(
                cubeSize, cubeSize
            );

            formatGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexStorage2DCase(
                    fmtName + "_2d", "", internalFormat,
                    tex2DWidth, tex2DHeight, tex2DLevels
                )
            );
            formatGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexStorageCubeCase(
                    fmtName + "_cube", "", internalFormat, cubeSize, cubeLevels
                )
            );
        }

        // Depth / stencil formats.
        for (var formatNdx = 0; formatNdx < depthStencilFormats.length; formatNdx++)
        {
            fmtName = depthStencilFormats[formatNdx].name;
            internalFormat    = depthStencilFormats[formatNdx].internalFormat;
            tex2DWidth        = 117;
            tex2DHeight        = 97;
            tex2DLevels        = es3fTextureSpecificationTests.maxLevelCount(
                tex2DWidth, tex2DHeight
            );
            cubeSize        = 57;
            cubeLevels        = es3fTextureSpecificationTests.maxLevelCount(
                cubeSize, cubeSize
            );

            formatGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexStorage2DCase(
                    fmtName + "_2d", "", internalFormat,
                    tex2DWidth, tex2DHeight, tex2DLevels
                )
            );
            formatGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexStorageCubeCase(
                    fmtName + "_cube", "", internalFormat, cubeSize, cubeLevels
                )
            );
        }

        // Sizes. //    W    H    L
        /** @type {Array<{width: number, height: number, levels: number}>} */
        var tex2DSizes = [ {
                width: 1, height: 1, levels: 1
            }, {
                width: 2, height: 2, levels: 2
            }, {
                width: 64, height: 32, levels: 7
            }, {
                width: 32, height: 64, levels: 4
            }, {
                width: 57, height: 63, levels: 1
            }, {
                width: 57, height: 63, levels: 2
            }, {
                width: 57, height: 63, levels: 6
            }
        ];

        //    S    L
        /** @type {Array<{sizes: number, levels: number}>} */
        var cubeSizes = [ {
                sizes: 1, levels: 1
            }, {
                sizes: 2, levels: 2
            }, {
                sizes: 57, levels: 1
            }, {
                sizes: 57, levels: 2
            }, {
                sizes: 57, levels: 6
            }, {
                sizes: 64, levels: 4
            }, {
                sizes: 64, levels: 7
            },
        ];

        /** @type {tcuTestCase.DeqpTest} */
        sizeGroup = new tcuTestCase.DeqpTest(
            "size", "glTexStorage2D() with various sizes"
        );
        texStorageGroup.addChild(sizeGroup);

        for (var ndx = 0; ndx < tex2DSizes.length; ndx++)
        {
            format        = gl.RGBA8;
            /** @type {number} */ var width = tex2DSizes[ndx].width;
            /** @type {number} */ var height = tex2DSizes[ndx].height;
            /** @type {number} */ var levels = tex2DSizes[ndx].levels;
            /** @type {string} */
            var name = "2d_" + width + "x" + height + "_" + levels + "_levels";

            sizeGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexStorage2DCase(
                    name, "", format, width, height, levels
                )
            );
        }

        for (var ndx = 0; ndx < cubeSizes.length; ndx++)
        {
            format = gl.RGBA8;
            /** @type {number} */ var size = cubeSizes[ndx].size;
            levels = cubeSizes[ndx].levels;
            name = "cube_" + size + "x" + size + "_" + levels + "_levels";

            sizeGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexStorageCubeCase(
                    name, "", format, size, levels
                )
            );
        }

        // glTexStorage3D() cases.
        /** @type {tcuTestCase.DeqpTest} */
        texStorageGroup = new tcuTestCase.DeqpTest(
            "texstorage3d", "Basic glTexStorage3D() usage"
        );
        this.addChild(texStorageGroup);

        // All formats.
        /** @type {tcuTestCase.DeqpTest} */
        formatGroup = new tcuTestCase.DeqpTest(
            "format", "glTexStorage3D() with all formats"
        );
        texStorageGroup.addChild(formatGroup);

        // Color formats.
        for (var formatNdx = 0; formatNdx < colorFormats.length; formatNdx++)
        {
            fmtName = colorFormats[formatNdx].name;
            internalFormat = colorFormats[formatNdx].internalFormat;
            tex2DArrayWidth = 57;
            tex2DArrayHeight = 13;
            tex2DArrayLayers = 7;
            tex2DArrayLevels = es3fTextureSpecificationTests.maxLevelCount(
                tex2DArrayWidth, tex2DArrayHeight
            );
            tex3DWidth = 59;
            tex3DHeight = 37;
            tex3DDepth = 11;
            tex3DLevels = es3fTextureSpecificationTests.maxLevelCount(
                tex3DWidth, tex3DHeight, tex3DDepth
            );

            formatGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexStorage2DArrayCase(
                    fmtName + "_2d_array", "", internalFormat, tex2DArrayWidth,
                    tex2DArrayHeight, tex2DArrayLayers, tex2DArrayLevels
                )
            );
            formatGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexStorage3DCase(
                    fmtName + "_3d", "", internalFormat, tex3DWidth,
                    tex3DHeight, tex3DDepth, tex3DLevels
                )
            );
        }

        // Depth/stencil formats (only 2D texture array is supported).
        for (var formatNdx = 0;
            formatNdx < depthStencilFormats.length;
            formatNdx++)
        {
            fmtName = depthStencilFormats[formatNdx].name;
            internalFormat = depthStencilFormats[formatNdx].internalFormat;
            tex2DArrayWidth = 57;
            tex2DArrayHeight = 13;
            tex2DArrayLayers = 7;
            tex2DArrayLevels = es3fTextureSpecificationTests.maxLevelCount(
                tex2DArrayWidth, tex2DArrayHeight
            );

            formatGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexStorage2DArrayCase(
                    fmtName + "_2d_array", "", internalFormat, tex2DArrayWidth,
                    tex2DArrayHeight, tex2DArrayLayers, tex2DArrayLevels
                )
            );
        }

        // Sizes. //    W    H    La    Le
        /**
         * @type {Array<{width: number, height: number,
         * layers: number, levels: number}>}
         */
        var tex2DArraySizes = [ {
                width: 1, height: 1, layers: 1, levels: 1
            }, {
                width: 2, height: 2, layers: 2, levels: 2
            }, {
                width: 64, height: 32, layers: 3, levels: 7
            }, {
                width: 32, height: 64, layers: 3, levels: 4
            }, {
                width: 57, height: 63, layers: 5, levels: 1
            }, {
                width: 57, height: 63, layers: 5, levels: 2
            }, {
                width: 57, height: 63, layers: 5, levels: 6
            }
        ];

        //    W    H    D    L
        /**
         * @type {Array<{width: number, height: number,
         * depth: number, levels: number}>}
         */
        var tex3DSizes = [ {
                width: 1, height: 1, depth: 1, levels: 1
            }, {
                width: 2, height: 2, depth: 2, levels: 2
            }, {
                width: 64, height: 32, depth: 16, levels: 7
            }, {
                width: 32, height: 64, depth: 16, levels: 4
            }, {
                width: 32, height: 16, depth: 64, levels: 4
            }, {
                width: 57, height: 63, depth: 11, levels: 1
            }, {
                width: 57, height: 63, depth: 11, levels: 2
            }, {
                width: 57, height: 63, depth: 11, levels: 6
            }
        ];

        /** @type {tcuTestCase.DeqpTest} */
        sizeGroup = new tcuTestCase.DeqpTest(
            "size", "glTexStorage2D() with various sizes"
        );
        texStorageGroup.addChild(sizeGroup);

        for (var ndx = 0; ndx < tex2DArraySizes.length; ndx++)
        {
            format = gl.RGBA8;
            width = tex2DArraySizes[ndx].width;
            height = tex2DArraySizes[ndx].height;
            /** @type {number} */ var layers = tex2DArraySizes[ndx].layers;
            levels = tex2DArraySizes[ndx].levels;
            name = "2d_array_" + width + "x" + height + "x" +
                layers + "_" + levels + "_levels";

            sizeGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexStorage2DArrayCase(
                    name, "", format, width, height, layers, levels
                )
            );
        }

        for (var ndx = 0; ndx < tex3DSizes.length; ndx++)
        {
            format        = gl.RGBA8;
            width        = tex3DSizes[ndx].width;
            height        = tex3DSizes[ndx].height;
            depth        = tex3DSizes[ndx].depth;
            levels        = tex3DSizes[ndx].levels;
            name = "3d_" + width + "x" + height + "x" +
                depth + "_" + levels + "_levels";

            sizeGroup.addChild(
                new es3fTextureSpecificationTests.BasicTexStorage3DCase(
                    name, "", format, width, height, depth, levels
                )
            );
        }
    };

    /**
    * Run test
    * @param {WebGL2RenderingContext} context
    */
    es3fTextureSpecificationTests.run = function(context) {
        gl = context;
        //Set up Test Root parameters
        var state = tcuTestCase.runner;
        state.setRoot(new es3fTextureSpecificationTests.TextureSpecificationTests());

        //Set up name and description of this test series.
        setCurrentTestName(state.testCases.fullName());
        description(state.testCases.getDescription());

        try {
            //Run test cases
            tcuTestCase.runTestCases();
        }
        catch (err) {
            testFailedOptions('Failed to es3fTextureSpecificationTests.run tests', false);
            tcuTestCase.runner.terminate();
        }
    };

});
