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
goog.provide('functional.gles3.es3fTextureFilteringTests');
goog.require('framework.common.tcuImageCompare');
goog.require('framework.common.tcuLogImage');
goog.require('framework.common.tcuPixelFormat');
goog.require('framework.common.tcuRGBA');
goog.require('framework.common.tcuSurface');
goog.require('framework.common.tcuTestCase');
goog.require('framework.common.tcuTexture');
goog.require('framework.common.tcuTextureUtil');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.delibs.debase.deRandom');
goog.require('framework.delibs.debase.deString');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.opengl.gluTextureUtil');
goog.require('functional.gles3.es3fFboTestUtil');

goog.scope(function() {

    var es3fTextureFilteringTests = functional.gles3.es3fTextureFilteringTests;
    var es3fFboTestUtil = functional.gles3.es3fFboTestUtil;
    var gluShaderUtil = framework.opengl.gluShaderUtil;
    var gluTextureUtil = framework.opengl.gluTextureUtil;
    var tcuImageCompare = framework.common.tcuImageCompare;
    var tcuLogImage = framework.common.tcuLogImage;
    var tcuPixelFormat = framework.common.tcuPixelFormat;
    var tcuRGBA = framework.common.tcuRGBA;
    var tcuTestCase = framework.common.tcuTestCase;
    var tcuSurface = framework.common.tcuSurface;
    var tcuTexture = framework.common.tcuTexture;
    var tcuTextureUtil = framework.common.tcuTextureUtil;
    var deMath = framework.delibs.debase.deMath;
    var deString = framework.delibs.debase.deString;
    var deRandom = framework.delibs.debase.deRandom;

    /** @type {WebGL2RenderingContext} */ var gl;

    /**
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     */
    es3fTextureFilteringTests.TextureFilteringTests = function () {
        tcuTestCase.DeqpTest.call(this, 'filtering', 'Texture Filtering Tests');
    };

    es3fTextureFilteringTests.TextureFilteringTests.prototype =
        Object.create(tcuTestCase.DeqpTest.prototype);

    es3fTextureFilteringTests.TextureFilteringTests.prototype.constructor =
        es3fTextureFilteringTests.TextureFilteringTests;

    /**
     * init
     */
    es3fTextureFilteringTests.TextureFilteringTests.prototype.init =
    function () {
        /**
         * @typedef {{name: string, mode: number}}
         */
        var WrapMode = {};

        /** @type {Array<WrapMode>} */
        var wrapModes = [
            { name: "clamp",        mode: gl.CLAMP_TO_EDGE },
            { name: "repeat",        mode: gl.REPEAT },
            { name: "mirror",        mode: gl.MIRRORED_REPEAT }
        ];

        /**
         * @typedef {{name: string, mode: number}}
         */
        var MinFilterMode = {};

        /** @type {Array<MinFilterMode>} */
        var minFilterModes = [
            { name: "nearest",                mode: gl.NEAREST                    },
            { name: "linear",                    mode: gl.LINEAR                    },
            { name: "nearest_mipmap_nearest",    mode: gl.NEAREST_MIPMAP_NEAREST    },
            { name: "linear_mipmap_nearest",    mode: gl.LINEAR_MIPMAP_NEAREST    },
            { name: "nearest_mipmap_linear",    mode: gl.NEAREST_MIPMAP_LINEAR    },
            { name: "linear_mipmap_linear",    mode: gl.LINEAR_MIPMAP_LINEAR        }
        ];

        /**
         * @typedef {{name: string, mode: number}}
         */
        var MagFilterModes = {};

        /** @type {Array<MagFilterModes>} */
        var magFilterModes = [
               { name: "nearest",    mode: gl.NEAREST },
               { name: "linear",        mode: gl.LINEAR }
        ];

        /** @typedef {{width: number, height: number}} */
        var Sizes2D = {};

        /** @type {Array<Sizes2D>} */
           var sizes2D = [
               { width:  4, height:      8 },
               { width: 32, height:     64 },
               { width:128, height:    128    },
               { width:  3, height:      7 },
               { width: 31, height:     55 },
               { width:127, height:     99 }
        ];

        /** @typedef {{width: number, height: number}} */
        var SizesCube = {};

        /** @type {Array<SizesCube>} */
           var sizesCube = [
               { width:  8, height:   8 },
               { width: 64, height:  64 },
               { width:128, height: 128 },
               { width:  7, height:   7 },
               { width: 63, height:  63 }
        ];

           /** @typedef {{width: number, height: number, numLayers: number}} */
        var Sizes2DArray = {};

        /** @type {Array<sizes2DArray>} */
           var sizes2DArray = [
               { width:   4, height:   8, numLayers:   8 },
               { width:  32, height:  64, numLayers:  16 },
               { width: 128, height:  32, numLayers:  64 },
               { width:   3, height:   7, numLayers:   5 },
               { width:  63, height:  63, numLayers:  63 }
        ];

        /** @typedef {{width: number, height: number, depth: number}} */
           var Sizes3D = {};

        /** @type {Array<Sizes3D>} */
        var sizes3D = [
               { width:   4, height:   8, depth:   8 },
               { width:  32, height:  64, depth:  16 },
               { width: 128, height:  32, depth:  64 },
               { width:   3, height:   7, depth:   5 },
               { width:  63, height:  63, depth:  63 }
        ];

        /** @typedef {{name: string, format: number}} */
        var FilterableFormatsByType = {};

        /** @type {Array<FilterableFormatsByType>} */
        var filterableFormatsByType = [
               { name: "rgba16f", format:        gl.RGBA16F            },
               { name: "r11f_g11f_b10f", format:    gl.R11F_G11F_B10F    },
               { name: "rgb9_e5", format:        gl.RGB9_E5            },
               { name: "rgba8", format:            gl.RGBA8            },
               { name: "rgba8_snorm", format:    gl.RGBA8_SNORM        },
               { name: "rgb565", format:            gl.RGB565            },
               { name: "rgba4", format:            gl.RGBA4            },
               { name: "rgb5_a1", format:        gl.RGB5_A1            },
               { name: "srgb8_alpha8", format:    gl.SRGB8_ALPHA8        },
               { name: "rgb10_a2", format:        gl.RGB10_A2            }
        ];

           // 2D texture filtering.

         /** @type {tcuTestCase.DeqpTest} */
        var group2D = new tcuTestCase.DeqpTest("2d", "2D Texture Filtering");
         this.addChild(group2D);

         // Formats.
         /** @type {tcuTestCase.DeqpTest} */
        var formatsGroup = new tcuTestCase.DeqpTest(
            "formats", "2D Texture Formats");

        group2D.addChild(formatsGroup);

        for (var fmtNdx = 0; fmtNdx < filterableFormatsByType.length; fmtNdx++)
         {
             for (var filterNdx = 0;
                filterNdx < minFilterModes.length;
                filterNdx++)
             {
                 /** @type {number} */
                var minFilter    = minFilterModes[filterNdx].mode;
                 /** @type {string} */
                var filterName = minFilterModes[filterNdx].name;
                 /** @type {number} */
                var    format        = filterableFormatsByType[fmtNdx].format;
                 /** @type {string} */
                var formatName = filterableFormatsByType[fmtNdx].name;
                 var isMipmap = minFilter != gl.NEAREST &&
                    minFilter != gl.LINEAR;
                 /** @type {number} */
                var    magFilter = isMipmap ? gl.LINEAR : minFilter;
                 /** @type {string} */
                var    name = formatName + "_" + filterName;
                 /** @type {number} */
                var    wrapS = gl.REPEAT;
                 /** @type {number} */
                var wrapT = gl.REPEAT;
                 /** @type {number} */ var width        = 64;
                 /** @type {number} */ var height        = 64;

                 formatsGroup.addChild(
                    new es3fTextureFilteringTests.Texture2DFilteringCase(
                        name, "", minFilter, magFilter, wrapS, wrapT,
                         format, width, height
                    )
                );
             }
         }

         // ETC1 format.
        /** @type {Array<string>} */ var filenames;
        for (var i = 0; i <= 7; i++)
            filenames.push("data/etc1/photo_helsinki_mip_" + i + ".pkm");

        for (var filterNdx = 0; filterNdx < minFilterModes.length; filterNdx++)
        {
            /** @type {number} */
            var minFilter    = minFilterModes[filterNdx].mode;
            /** @type {string} */
            var filterName    = minFilterModes[filterNdx].name;
            var isMipmap    = minFilter != gl.NEAREST &&
                minFilter != gl.LINEAR;
            /** @type {number} */
            var magFilter    = isMipmap ? gl.LINEAR : minFilter;
            /** @type {string} */
            var name        = "etc1_rgb8_" + filterName;
            /** @type {number} */
            var wrapS        = gl.REPEAT;
            /** @type {number} */
            var wrapT        = gl.REPEAT;

            formatsGroup.addChild(
                new es3fTextureFilteringTests.Texture2DFilteringCase(
                    name, "", minFilter, magFilter, wrapS, wrapT, filenames
                )
            );
        }

        // Sizes.
        /** @type {tcuTestCase.DeqpTest} */
        var sizesGroup = new tcuTestCase.DeqpTest("sizes", "Texture Sizes");
        group2D.addChild(sizesGroup);
        for (var sizeNdx = 0; sizeNdx < sizes2D.length; sizeNdx++)
        {
            for (var filterNdx = 0; filterNdx < minFilterModes.length; filterNdx++)
            {
                /** @type {number} */
                var    minFilter    = minFilterModes[filterNdx].mode;
                /** @type {string} */
                var filterName    = minFilterModes[filterNdx].name;
                /** @type {number} */
                var    format        = gl.RGBA8;
                /** @type {boolean} */
                var isMipmap    = minFilter != gl.NEAREST && minFilter != gl.LINEAR;
                /** @type {number} */
                var    magFilter    = isMipmap ? gl.LINEAR : minFilter;
                /** @type {number} */
                var    wrapS        = gl.REPEAT;
                /** @type {number} */
                var    wrapT        = gl.REPEAT;
                /** @type {number} */
                var    width        = sizes2D[sizeNdx].width;
                /** @type {number} */
                var    height        = sizes2D[sizeNdx].height;
                /** @type {string} */
                var    name        = '' + width + "x" + height + "_" + filterName;

                sizesGroup.addChild(
                    new es3fTextureFilteringTests.Texture2DFilteringCase(
                        name, "", minFilter, magFilter, wrapS, wrapT,
                        format, width, height
                    )
                );
            }
        }

        // Wrap modes.
        /** @type {tcuTestCase.DeqpTest} */
        var combinationsGroup = new tcuTestCase.DeqpTest(
            "combinations", "Filter and wrap mode combinations"
        );
        group2D.addChild(combinationsGroup);

        for (var minFilterNdx = 0;
            minFilterNdx < minFilterModes.length;
            minFilterNdx++)
        {
            for (var magFilterNdx = 0;
                magFilterNdx < magFilterModes.length;
                magFilterNdx++)
            {
                for (var wrapSNdx = 0; wrapSNdx < wrapModes.length; wrapSNdx++)
                {
                    for (var wrapTNdx = 0;
                        wrapTNdx < wrapModes.length;
                        wrapTNdx++)
                    {
                        /** @type {number} */
                        var minFilter = minFilterModes[minFilterNdx].mode;
                        /** @type {number} */
                        var magFilter = magFilterModes[magFilterNdx].mode;
                        /** @type {number} */
                        var format = gl.RGBA8;
                        /** @type {number} */
                        var wrapS = wrapModes[wrapSNdx].mode;
                        /** @type {number} */
                        var wrapT = wrapModes[wrapTNdx].mode;
                        /** @type {number} */
                        var width = 63;
                        /** @type {number} */
                        var height = 57;
                        /** @type {string} */
                        var name = minFilterModes[minFilterNdx].name + "_" +
                            magFilterModes[magFilterNdx].name + "_" +
                            wrapModes[wrapSNdx].name + "_" +
                            wrapModes[wrapTNdx].name;

                        combinationsGroup.addChild(
                            new
                            es3fTextureFilteringTests.Texture2DFilteringCase(
                                name, "", minFilter, magFilter, wrapS, wrapT,
                                format, width, height
                            )
                        );
                    }
                }
            }
        }

        // Cube map texture filtering.

        /** @type {tcuTestCase.DeqpTest} */
        var groupCube = new tcuTestCase.DeqpTest(
            "cube", "Cube Map Texture Filtering"
        );
        this.addChild(groupCube);

        // Formats.
        /** @type {tcuTestCase.DeqpTest} */
        formatsGroup = new tcuTestCase.DeqpTest(
            "formats", "2D Texture Formats"
        );
        groupCube.addChild(formatsGroup);
        for (var fmtNdx = 0; fmtNdx < filterableFormatsByType.length; fmtNdx++)
        {
            for (var filterNdx = 0;
                filterNdx < minFilterModes.length;
                filterNdx++)
            {
                /** @type {number} */
                var minFilter = minFilterModes[filterNdx].mode;
                var filterName = minFilterModes[filterNdx].name;
                /** @type {number} */
                var format = filterableFormatsByType[fmtNdx].format;
                var formatName = filterableFormatsByType[fmtNdx].name;
                var isMipmap = minFilter != gl.NEAREST &&
                    minFilter != gl.LINEAR;
                /** @type {number} */
                var magFilter = isMipmap ? gl.LINEAR : minFilter;
                var name = formatName + "_" + filterName;
                /** @type {number} */
                var wrapS = gl.REPEAT;
                /** @type {number} */
                var wrapT = gl.REPEAT;
                /** @type {number} */ var width = 64;
                /** @type {number} */ var height = 64;

                formatsGroup.addChild(
                    new es3fTextureFilteringTests.TextureCubeFilteringCase(
                        name, "", minFilter, magFilter, wrapS, wrapT,
                        false /* always sample exterior as well */,
                        format, width, height
                    )
                );
            }
        }

        // ETC1 format.

        var faceExt = [
            "neg_x", "pos_x", "neg_y", "pos_y", "neg_z", "pos_z"
        ];

        var numLevels = 7;
        var filenames;
        for (var level = 0; level < numLevels; level++)
            for (var face = 0;
                face < Object.keys(tcuTexture.CubeFace).length;
                face++)
                filenames.push(
                    "data/etc1/skybox_" + faceExt[face] +
                    "_mip_" + level + ".pkm"
                );

        for (var filterNdx = 0; filterNdx < minFilterModes.length; filterNdx++)
        {
            /** @type {number} */
            var minFilter = minFilterModes[filterNdx].mode;
            var filterName = minFilterModes[filterNdx].name;
            var isMipmap = minFilter != gl.NEAREST && minFilter != gl.LINEAR;
            /** @type {number} */
            var magFilter = isMipmap ? gl.LINEAR : minFilter;
            var name = "etc1_rgb8_" + filterName;
            /** @type {number} */
            var wrapS = gl.REPEAT;
            /** @type {number} */
            var wrapT = gl.REPEAT;

            formatsGroup.addChild(
                new es3fTextureFilteringTests.TextureCubeFilteringCase(
                    name, "", minFilter, magFilter,
                    wrapS, wrapT, false /* always sample exterior as well */,
                    filenames
                )
            );
        }

        // Sizes.
        /** @type {tcuTestCase.DeqpTest} */
        sizesGroup = new tcuTestCase.DeqpTest(
            "sizes", "Texture Sizes"
        );
        groupCube.addChild(sizesGroup);
        for (var sizeNdx = 0; sizeNdx < sizesCube.length; sizeNdx++)
        {
            for (var filterNdx = 0;
                filterNdx < minFilterModes.length;
                filterNdx++)
            {
                /** @type {number} */
                var minFilter = minFilterModes[filterNdx].mode;
                var filterName = minFilterModes[filterNdx].name;
                /** @type {number} */ var format = gl.RGBA8;
                var isMipmap = minFilter != gl.NEAREST &&
                    minFilter != gl.LINEAR;
                /** @type {number} */
                var magFilter = isMipmap ? gl.LINEAR : minFilter;
                /** @type {number} */ var wrapS = gl.REPEAT;
                /** @type {number} */ var wrapT = gl.REPEAT;
                /** @type {number} */ var width = sizesCube[sizeNdx].width;
                /** @type {number} */ var height = sizesCube[sizeNdx].height;
                var name = '' + width + "x" + height + "_" + filterName;

                sizesGroup.addChild(
                    new es3fTextureFilteringTests.TextureCubeFilteringCase(
                        name, "", minFilter, magFilter, wrapS, wrapT,
                        false, format, width, height
                    )
                );
            }
        }

        // Filter/wrap mode combinations.
        /** @type {tcuTestCase.DeqpTest} */
        combinationsGroup = new tcuTestCase.DeqpTest(
            "combinations", "Filter and wrap mode combinations"
        );
        groupCube.addChild(combinationsGroup);
        for (var minFilterNdx = 0;
            minFilterNdx < minFilterModes.length;
            minFilterNdx++)
        {
            for (var magFilterNdx = 0;
                magFilterNdx < magFilterModes.length;
                magFilterNdx++)
            {
                for (var wrapSNdx = 0; wrapSNdx < wrapModes.length; wrapSNdx++)
                {
                    for (var wrapTNdx = 0;
                        wrapTNdx < wrapModes.length;
                        wrapTNdx++)
                    {
                        /** @type {number} */
                        var minFilter = minFilterModes[minFilterNdx].mode;
                        /** @type {number} */
                        var magFilter = magFilterModes[magFilterNdx].mode;
                        /** @type {number} */ var format = gl.RGBA8;
                        /** @type {number} */
                        var wrapS = wrapModes[wrapSNdx].mode;
                        /** @type {number} */
                        var wrapT = wrapModes[wrapTNdx].mode;
                        /** @type {number} */ var width = 63;
                        /** @type {number} */ varheight = 63;
                        var name = minFilterModes[minFilterNdx].name + "_" +
                            magFilterModes[magFilterNdx].name + "_" +
                            wrapModes[wrapSNdx].name + "_" +
                            wrapModes[wrapTNdx].name;

                        combinationsGroup.addChild(
                            new es3fTextureFilteringTests.
                            TextureCubeFilteringCase(
                                name, "", minFilter, magFilter, wrapS, wrapT,
                                false, format, width, height
                            )
                        );
                    }
                }
            }
        }

        // Cases with no visible cube edges.
        /** @type {tcuTestCase.DeqpTest} */
        var onlyFaceInteriorGroup = new tcuTestCase.DeqpTest(
            "no_edges_visible", "Don't sample anywhere near a face's edges"
        );
        groupCube.addChild(onlyFaceInteriorGroup);

        for (int isLinearI = 0; isLinearI <= 1; isLinearI++)
        {
            var isLinear = isLinearI != 0;
            var filter = isLinear ? gl.LINEAR : gl.NEAREST;

            onlyFaceInteriorGroup.addChild(
                new es3fTextureFilteringTests.TextureCubeFilteringCase(
                    isLinear ? "linear" : "nearest", "",
                    filter, filter, gl.REPEAT, gl.REPEAT,
                    true, gl.RGBA8, 63, 63
                )
            );
        }

        // 2D array texture filtering.

        /** @type {tcuTestCase.DeqpTest} */
        group2DArray = new tcuTestCase.DeqpTest(
            "2d_array", "2D Array Texture Filtering"
        );
        this.addChild(group2DArray);

        // Formats.
        /** @type {tcuTestCase.DeqpTest} */
        formatsGroup = new tcuTestCase.DeqpTest(
            "formats", "2D Array Texture Formats"
        );
        group2DArray.addChild(formatsGroup);
        for (var fmtNdx = 0; fmtNdx < filterableFormatsByType.length; fmtNdx++)
        {
            for (var filterNdx = 0;
                filterNdx < minFilterModes.length;
                filterNdx++)
            {
                /** @type {number} */
                var minFilter = minFilterModes[filterNdx].mode;
                var filterName = minFilterModes[filterNdx].name;
                /** @type {number} */
                var format = filterableFormatsByType[fmtNdx].format;
                var formatName = filterableFormatsByType[fmtNdx].name;
                var isMipmap = minFilter != gl.NEAREST &&
                    minFilter != gl.LINEAR;
                /** @type {number} */
                var magFilter = isMipmap ? gl.LINEAR : minFilter;
                var name = string(formatName) + "_" + filterName;
                /** @type {number} */ var wrapS = gl.REPEAT;
                /** @type {number} */ var wrapT = gl.REPEAT;
                /** @type {number} */ var width = 128;
                /** @type {number} */ var height = 128;
                /** @type {number} */ var numLayers = 8;

                formatsGroup.addChild(
                    new es3fTextureFilteringTests.Texture2DArrayFilteringCase(
                        name, "", minFilter, magFilter, wrapS, wrapT,
                        format, width, height, numLayers
                    )
                );
            }
        }

        // Sizes.
        /** @type {tcuTestCase.DeqpTest} */
        sizesGroup = new tcuTestCase.DeqpTest("sizes", "Texture Sizes");
        group2DArray.addChild(sizesGroup);
        for (var sizeNdx = 0; sizeNdx < sizes2DArray.length; sizeNdx++)
        {
            for (var filterNdx = 0;
                filterNdx < minFilterModes.length;
                filterNdx++)
            {
                /** @type {number} */
                var minFilter = minFilterModes[filterNdx].mode;
                var filterName = minFilterModes[filterNdx].name;
                /** @type {number} */ var format = gl.RGBA8;
                var isMipmap = minFilter != gl.NEAREST &&
                    minFilter != gl.LINEAR;
                /** @type {number} */
                var magFilter = isMipmap ? gl.LINEAR : minFilter;
                /** @type {number} */ var wrapS = gl.REPEAT;
                /** @type {number} */ var wrapT = gl.REPEAT;
                /** @type {number} */ var width = sizes2DArray[sizeNdx].width;
                /** @type {number} */ var height = sizes2DArray[sizeNdx].height;
                /** @type {number} */
                var numLayers = sizes2DArray[sizeNdx].numLayers;
                var name = '' + width + "x" + height + "x" +
                    numLayers + "_" + filterName;

                sizesGroup.addChild(
                    new es3fTextureFilteringTests.Texture2DArrayFilteringCase(
                        name, "", minFilter, magFilter, wrapS, wrapT,
                        format, width, height, numLayers
                    )
                );
            }
        }

        // Wrap modes.
        /** @type {tcuTestCase.DeqpTest} */
        combinationsGroup = new tcuTestCase.DeqpTest(
            "combinations", "Filter and wrap mode combinations"
        );
        group2DArray.addChild(combinationsGroup);
        for (var minFilterNdx = 0;
            minFilterNdx < minFilterModes.length;
            minFilterNdx++)
        {
            for (var magFilterNdx = 0;
                magFilterNdx < magFilterModes.length;
                magFilterNdx++)
            {
                for (var wrapSNdx = 0;
                    wrapSNdx < wrapModes.length;
                    wrapSNdx++)
                {
                    for (var wrapTNdx = 0;
                        wrapTNdx < wrapModes.length;
                        wrapTNdx++)
                    {
                        /** @type {number} */
                        var minFilter = minFilterModes[minFilterNdx].mode;
                        /** @type {number} */
                        var magFilter = magFilterModes[magFilterNdx].mode;
                        /** @type {number} */ var format = gl.RGBA8;
                        /** @type {number} */
                        var wrapS = wrapModes[wrapSNdx].mode;
                        /** @type {number} */
                        var wrapT = wrapModes[wrapTNdx].mode;
                        /** @type {number} */ var width = 123;
                        /** @type {number} */ var height = 107;
                        /** @type {number} */ var numLayers = 7;
                        var name = minFilterModes[minFilterNdx].name + "_" +
                            magFilterModes[magFilterNdx].name + "_" +
                            wrapModes[wrapSNdx].name + "_" +
                            wrapModes[wrapTNdx].name;

                        combinationsGroup.addChild(
                            new es3fTextureFilteringTests.
                            Texture2DArrayFilteringCase(
                                name, "", minFilter, magFilter,
                                wrapS, wrapT, format,
                                width, height, numLayers
                            )
                        );
                    }
                }
            }
        }

        // 3D texture filtering.

        /** @type {tcuTestCase.DeqpTest} */
        var group3D = new tcuTestCase.DeqpTest(
            "3d", "3D Texture Filtering"
        );
        this.addChild(group3D);

        // Formats.
        /** @type {tcuTestCase.DeqpTest} */
        formatsGroup = new tcuTestCase.DeqpTest(
            "formats", "3D Texture Formats"
        );
        group3D.addChild(formatsGroup);
        for (var fmtNdx = 0; fmtNdx < filterableFormatsByType.length; fmtNdx++)
        {
            for (var filterNdx = 0;
                filterNdx < minFilterModes.length;
                filterNdx++)
            {
                /** @type {number} */
                var minFilter = minFilterModes[filterNdx].mode;
                var filterName = minFilterModes[filterNdx].name;
                /** @type {number} */
                var format = filterableFormatsByType[fmtNdx].format;
                var formatName = filterableFormatsByType[fmtNdx].name;
                var isMipmap = minFilter != gl.NEAREST &&
                    minFilter != gl.LINEAR;
                /** @type {number} */
                var magFilter = isMipmap ? gl.LINEAR : minFilter;
                var name = formatName + "_" + filterName;
                /** @type {number} */ var wrapS = gl.REPEAT;
                /** @type {number} */ var wrapT = gl.REPEAT;
                /** @type {number} */ var wrapR = gl.REPEAT;
                /** @type {number} */ var width = 64;
                /** @type {number} */ var height = 64;
                /** @type {number} */ var depth = 64;

                formatsGroup.addChild(
                    new es3fTextureFilteringTests.Texture3DFilteringCase(
                        name, "", minFilter, magFilter,
                        wrapS, wrapT, wrapR, format,
                        width, height, depth
                    )
                );
            }
        }

        // Sizes.
        /** @type {tcuTestCase.DeqpTest} */
        sizesGroup = new tcuTestCase.DeqpTest(
            "sizes", "Texture Sizes"
        );
        group3D.addChild(sizesGroup);
        for (var sizeNdx = 0; sizeNdx < sizes3D.length; sizeNdx++)
        {
            for (var filterNdx = 0; filterNdx < minFilterModes.length; filterNdx++)
            {
                /** @type {number} */
                var minFilter = minFilterModes[filterNdx].mode;
                var filterName = minFilterModes[filterNdx].name;
                /** @type {number} */ var format = gl.RGBA8;
                var isMipmap =
                    minFilter != gl.NEAREST && minFilter != gl.LINEAR;
                /** @type {number} */ var magFilter =
                    isMipmap ? gl.LINEAR : minFilter;
                /** @type {number} */ var wrapS = gl.REPEAT;
                /** @type {number} */ var wrapT = gl.REPEAT;
                /** @type {number} */ var wrapR = gl.REPEAT;
                /** @type {number} */ var width = sizes3D[sizeNdx].width;
                /** @type {number} */ var height = sizes3D[sizeNdx].height;
                /** @type {number} */ var depth = sizes3D[sizeNdx].depth;
                var name = '' + width + "x" + height + "x" + depth +
                    "_" + filterName;

                sizesGroup.addChild(
                    new es3fTextureFilteringTests.Texture3DFilteringCase(
                        name, "", minFilter, magFilter,
                        wrapS, wrapT, wrapR, format,
                        width, height, depth
                    )
                );
            }
        }

        // Wrap modes.
        /** @type {tcuTestCase.DeqpTest} */
        combinationsGroup = new tcuTestCase.DeqpTest(
            "combinations", "Filter and wrap mode combinations"
        );
        group3D.addChild(combinationsGroup);
        for (var minFilterNdx = 0;
            minFilterNdx < minFilterModes.length;
            minFilterNdx++)
        {
            for (var magFilterNdx = 0;
                magFilterNdx < magFilterModes.length;
                magFilterNdx++)
            {
                for (var wrapSNdx = 0;
                    wrapSNdx < wrapModes.length;
                    wrapSNdx++)
                {
                    for (var wrapTNdx = 0;
                        wrapTNdx < wrapModes.length;
                        wrapTNdx++)
                    {
                        for (var wrapRNdx = 0;
                            wrapRNdx < wrapModes.length;
                            wrapRNdx++)
                        {
                            /** @type {number} */
                            var minFilter = minFilterModes[minFilterNdx].mode;
                            /** @type {number} */
                            var magFilter = magFilterModes[magFilterNdx].mode;
                            /** @type {number} */
                            var format = gl.RGBA8;
                            /** @type {number} */
                            var wrapS = wrapModes[wrapSNdx].mode;
                            /** @type {number} */
                            var wrapT = wrapModes[wrapTNdx].mode;
                            /** @type {number} */
                            var wrapR = wrapModes[wrapRNdx].mode;
                            /** @type {number} */ var width = 63;
                            /** @type {number} */ var height = 57;
                            /** @type {number} */ var depth = 67;
                            var name = minFilterModes[minFilterNdx].name + "_" +
                                magFilterModes[magFilterNdx].name + "_" +
                                wrapModes[wrapSNdx].name + "_" +
                                wrapModes[wrapTNdx].name + "_" +
                                wrapModes[wrapRNdx].name;

                            combinationsGroup.addChild(
                                new
                                es3fTextureFilteringTests.
                                Texture3DFilteringCase(
                                    name, "", minFilter, magFilter,
                                    wrapS, wrapT, wrapR, format,
                                    width, height, depth
                                )
                            );
                        }
                    }
                }
            }
        }
    };

    /**
     * Create and execute the test cases
     * @param {WebGL2RenderingContext} context
     */
    es3fTextureFilteringTests.run = function(context) {
        gl = context;
        //Set up Test Root parameters
        var state = tcuTestCase.runner;

        state.setRoot(new es3fTextureFilteringTests.TextureFilteringTests());

        //Set up name and description of this test series.
        setCurrentTestName(state.testCases.fullName());
        description(state.testCases.getDescription());

        try {
            //Run test cases
            tcuTestCase.runTestCases();
        }
        catch (err) {
            testFailedOptions('Failed to run tests', false);
            tcuTestCase.runner.terminate();
        }
    };
});
