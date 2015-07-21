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
       		{ name: "nearest",	mode: gl.NEAREST },
       		{ name: "linear",		mode: gl.LINEAR }
       	];

        /** @typedef {{width: number, height: number}} */
        var Sizes2D = {};

        /** @type {Array<Sizes2D>} */
       	var sizes2D = [
       		{ width:  4, height:	  8 },
       		{ width: 32, height:	 64 },
       		{ width:128, height:	128	},
       		{ width:  3, height:	  7 },
       		{ width: 31, height:	 55 },
       		{ width:127, height:	 99 }
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
       		{ name: "rgba16f", format:		gl.RGBA16F			},
       		{ name: "r11f_g11f_b10f", format:	gl.R11F_G11F_B10F	},
       		{ name: "rgb9_e5", format:		gl.RGB9_E5			},
       		{ name: "rgba8", format:			gl.RGBA8			},
       		{ name: "rgba8_snorm", format:	gl.RGBA8_SNORM		},
       		{ name: "rgb565", format:			gl.RGB565			},
       		{ name: "rgba4", format:			gl.RGBA4			},
       		{ name: "rgb5_a1", format:		gl.RGB5_A1			},
       		{ name: "srgb8_alpha8", format:	gl.SRGB8_ALPHA8		},
       		{ name: "rgb10_a2", format:		gl.RGB10_A2			}
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
                var minFilter	= minFilterModes[filterNdx].mode;
 				/** @type {string} */
                var filterName = minFilterModes[filterNdx].name;
 				/** @type {number} */
                var	format		= filterableFormatsByType[fmtNdx].format;
 				/** @type {string} */
                var formatName = filterableFormatsByType[fmtNdx].name;
 				var isMipmap = minFilter != gl.NEAREST &&
                    minFilter != gl.LINEAR;
 				/** @type {number} */
                var	magFilter = isMipmap ? gl.LINEAR : minFilter;
 				/** @type {string} */
                var	name = formatName + "_" + filterName;
 				/** @type {number} */
                var	wrapS = gl.REPEAT;
 				/** @type {number} */
                var wrapT = gl.REPEAT;
 				/** @type {number} */ var width		= 64;
 				/** @type {number} */ var height		= 64;

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
            var minFilter	= minFilterModes[filterNdx].mode;
			/** @type {string} */
            var filterName	= minFilterModes[filterNdx].name;
			var	isMipmap	= minFilter != gl.NEAREST && minFilter != gl.LINEAR;
			/** @type {number} */
            var magFilter	= isMipmap ? gl.LINEAR : minFilter;
			/** @type {string} */
            var name		= "etc1_rgb8_" + filterName;
			/** @type {number} */
            var wrapS		= gl.REPEAT;
			/** @type {number} */
            var wrapT		= gl.REPEAT;

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
                var	minFilter	= minFilterModes[filterNdx].mode;
 				/** @type {string} */
                var filterName	= minFilterModes[filterNdx].name;
 				/** @type {number} */
                var	format		= gl.RGBA8;
                /** @type {boolean} */
 				var isMipmap	= minFilter != gl.NEAREST && minFilter != gl.LINEAR;
 				/** @type {number} */
                var	magFilter	= isMipmap ? gl.LINEAR : minFilter;
 				/** @type {number} */
                var	wrapS		= gl.REPEAT;
 				/** @type {number} */
                var	wrapT		= gl.REPEAT;
 				/** @type {number} */
                var	width		= sizes2D[sizeNdx].width;
 				/** @type {number} */
                var	height		= sizes2D[sizeNdx].height;
 				/** @type {string} */
                var	name		= '' + width + "x" + height + "_" + filterName;

 				sizesGroup.addChild(
                    new es3fTextureFilteringTests.Texture2DFilteringCase(
                        name, "", minFilter, magFilter, wrapS, wrapT,
                        format, width, height
                    )
                );
 			}
 		}

 		// Wrap modes.
 		tcu::TestCaseGroup* combinationsGroup = new tcu::TestCaseGroup(m_testCtx, "combinations", "Filter and wrap mode combinations");
 		group2D->addChild(combinationsGroup);
 		for (int minFilterNdx = 0; minFilterNdx < DE_LENGTH_OF_ARRAY(minFilterModes); minFilterNdx++)
 		{
 			for (int magFilterNdx = 0; magFilterNdx < DE_LENGTH_OF_ARRAY(magFilterModes); magFilterNdx++)
 			{
 				for (int wrapSNdx = 0; wrapSNdx < DE_LENGTH_OF_ARRAY(wrapModes); wrapSNdx++)
 				{
 					for (int wrapTNdx = 0; wrapTNdx < DE_LENGTH_OF_ARRAY(wrapModes); wrapTNdx++)
 					{
 						deUint32		minFilter	= minFilterModes[minFilterNdx].mode;
 						deUint32		magFilter	= magFilterModes[magFilterNdx].mode;
 						deUint32		format		= gl.RGBA8;
 						deUint32		wrapS		= wrapModes[wrapSNdx].mode;
 						deUint32		wrapT		= wrapModes[wrapTNdx].mode;
 						int				width		= 63;
 						int				height		= 57;
 						string			name		= string(minFilterModes[minFilterNdx].name) + "_" + magFilterModes[magFilterNdx].name + "_" + wrapModes[wrapSNdx].name + "_" + wrapModes[wrapTNdx].name;

 						combinationsGroup->addChild(new Texture2DFilteringCase(m_testCtx, m_context.getRenderContext(), m_context.getContextInfo(),
 																			   name.c_str(), "",
 																			   minFilter, magFilter,
 																			   wrapS, wrapT,
 																			   format,
 																			   width, height));
 					}
 				}
 			}
 		}

       	// Cube map texture filtering.

 		tcu::TestCaseGroup* groupCube = new tcu::TestCaseGroup(m_testCtx, "cube", "Cube Map Texture Filtering");
 		addChild(groupCube);

 		// Formats.
 		tcu::TestCaseGroup* formatsGroup = new tcu::TestCaseGroup(m_testCtx, "formats", "2D Texture Formats");
 		groupCube->addChild(formatsGroup);
 		for (int fmtNdx = 0; fmtNdx < DE_LENGTH_OF_ARRAY(filterableFormatsByType); fmtNdx++)
 		{
 			for (int filterNdx = 0; filterNdx < DE_LENGTH_OF_ARRAY(minFilterModes); filterNdx++)
 			{
 				deUint32		minFilter	= minFilterModes[filterNdx].mode;
 				const char*		filterName	= minFilterModes[filterNdx].name;
 				deUint32		format		= filterableFormatsByType[fmtNdx].format;
 				const char*		formatName	= filterableFormatsByType[fmtNdx].name;
 				bool			isMipmap	= minFilter != gl.NEAREST && minFilter != gl.LINEAR;
 				deUint32		magFilter	= isMipmap ? gl.LINEAR : minFilter;
 				string			name		= string(formatName) + "_" + filterName;
 				deUint32		wrapS		= gl.REPEAT;
 				deUint32		wrapT		= gl.REPEAT;
 				int				width		= 64;
 				int				height		= 64;

 				formatsGroup->addChild(new TextureCubeFilteringCase(m_testCtx, m_context.getRenderContext(), m_context.getContextInfo(),
 																	name.c_str(), "",
 																	minFilter, magFilter,
 																	wrapS, wrapT,
 																	false /* always sample exterior as well */,
 																	format,
 																	width, height));
 			}
 		}

 		// ETC1 format.

		static const char* faceExt[] = { "neg_x", "pos_x", "neg_y", "pos_y", "neg_z", "pos_z" };

		const int		numLevels	= 7;
		vector<string>	filenames;
		for (int level = 0; level < numLevels; level++)
			for (int face = 0; face < tcu::CUBEFACE_LAST; face++)
				filenames.push_back(string("data/etc1/skybox_") + faceExt[face] + "_mip_" + de::toString(level) + ".pkm");

		for (int filterNdx = 0; filterNdx < DE_LENGTH_OF_ARRAY(minFilterModes); filterNdx++)
		{
			deUint32		minFilter	= minFilterModes[filterNdx].mode;
			const char*		filterName	= minFilterModes[filterNdx].name;
			bool			isMipmap	= minFilter != gl.NEAREST && minFilter != gl.LINEAR;
			deUint32		magFilter	= isMipmap ? gl.LINEAR : minFilter;
			string			name		= string("etc1_rgb8_") + filterName;
			deUint32		wrapS		= gl.REPEAT;
			deUint32		wrapT		= gl.REPEAT;

			formatsGroup->addChild(new TextureCubeFilteringCase(m_testCtx, m_context.getRenderContext(), m_context.getContextInfo(),
																name.c_str(), "",
																minFilter, magFilter,
																wrapS, wrapT,
																false /* always sample exterior as well */,
																filenames));
		}

 		// Sizes.
 		tcu::TestCaseGroup* sizesGroup = new tcu::TestCaseGroup(m_testCtx, "sizes", "Texture Sizes");
 		groupCube->addChild(sizesGroup);
 		for (int sizeNdx = 0; sizeNdx < DE_LENGTH_OF_ARRAY(sizesCube); sizeNdx++)
 		{
 			for (int filterNdx = 0; filterNdx < DE_LENGTH_OF_ARRAY(minFilterModes); filterNdx++)
 			{
 				deUint32		minFilter	= minFilterModes[filterNdx].mode;
 				const char*		filterName	= minFilterModes[filterNdx].name;
 				deUint32		format		= gl.RGBA8;
 				bool			isMipmap	= minFilter != gl.NEAREST && minFilter != gl.LINEAR;
 				deUint32		magFilter	= isMipmap ? gl.LINEAR : minFilter;
 				deUint32		wrapS		= gl.REPEAT;
 				deUint32		wrapT		= gl.REPEAT;
 				int				width		= sizesCube[sizeNdx].width;
 				int				height		= sizesCube[sizeNdx].height;
 				string			name		= de::toString(width) + "x" + de::toString(height) + "_" + filterName;

 				sizesGroup->addChild(new TextureCubeFilteringCase(m_testCtx, m_context.getRenderContext(), m_context.getContextInfo(),
 																  name.c_str(), "",
 																  minFilter, magFilter,
 																  wrapS, wrapT,
 																  false,
 																  format,
 																  width, height));
 			}
 		}

 		// Filter/wrap mode combinations.
 		tcu::TestCaseGroup* combinationsGroup = new tcu::TestCaseGroup(m_testCtx, "combinations", "Filter and wrap mode combinations");
 		groupCube->addChild(combinationsGroup);
 		for (int minFilterNdx = 0; minFilterNdx < DE_LENGTH_OF_ARRAY(minFilterModes); minFilterNdx++)
 		{
 			for (int magFilterNdx = 0; magFilterNdx < DE_LENGTH_OF_ARRAY(magFilterModes); magFilterNdx++)
 			{
 				for (int wrapSNdx = 0; wrapSNdx < DE_LENGTH_OF_ARRAY(wrapModes); wrapSNdx++)
 				{
 					for (int wrapTNdx = 0; wrapTNdx < DE_LENGTH_OF_ARRAY(wrapModes); wrapTNdx++)
 					{
 						deUint32		minFilter	= minFilterModes[minFilterNdx].mode;
 						deUint32		magFilter	= magFilterModes[magFilterNdx].mode;
 						deUint32		format		= gl.RGBA8;
 						deUint32		wrapS		= wrapModes[wrapSNdx].mode;
 						deUint32		wrapT		= wrapModes[wrapTNdx].mode;
 						int				width		= 63;
 						int				height		= 63;
 						string			name		= string(minFilterModes[minFilterNdx].name) + "_" + magFilterModes[magFilterNdx].name + "_" + wrapModes[wrapSNdx].name + "_" + wrapModes[wrapTNdx].name;

 						combinationsGroup->addChild(new TextureCubeFilteringCase(m_testCtx, m_context.getRenderContext(), m_context.getContextInfo(),
 																				 name.c_str(), "",
 																				 minFilter, magFilter,
 																				 wrapS, wrapT,
 																				 false,
 																				 format,
 																				 width, height));
 					}
 				}
 			}
 		}

 		// Cases with no visible cube edges.
 		tcu::TestCaseGroup* onlyFaceInteriorGroup = new tcu::TestCaseGroup(m_testCtx, "no_edges_visible", "Don't sample anywhere near a face's edges");
 		groupCube->addChild(onlyFaceInteriorGroup);

 		for (int isLinearI = 0; isLinearI <= 1; isLinearI++)
 		{
 			bool		isLinear	= isLinearI != 0;
 			deUint32	filter		= isLinear ? gl.LINEAR : gl.NEAREST;

 			onlyFaceInteriorGroup->addChild(new TextureCubeFilteringCase(m_testCtx, m_context.getRenderContext(), m_context.getContextInfo(),
 																		 isLinear ? "linear" : "nearest", "",
 																		 filter, filter,
 																		 gl.REPEAT, gl.REPEAT,
 																		 true,
 																		 gl.RGBA8,
 																		 63, 63));
 		}

     	// 2D array texture filtering.

 		tcu::TestCaseGroup* const group2DArray = new tcu::TestCaseGroup(m_testCtx, "2d_array", "2D Array Texture Filtering");
 		addChild(group2DArray);

 		// Formats.
 		tcu::TestCaseGroup* const formatsGroup = new tcu::TestCaseGroup(m_testCtx, "formats", "2D Array Texture Formats");
 		group2DArray->addChild(formatsGroup);
 		for (int fmtNdx = 0; fmtNdx < DE_LENGTH_OF_ARRAY(filterableFormatsByType); fmtNdx++)
 		{
 			for (int filterNdx = 0; filterNdx < DE_LENGTH_OF_ARRAY(minFilterModes); filterNdx++)
 			{
 				deUint32		minFilter	= minFilterModes[filterNdx].mode;
 				const char*		filterName	= minFilterModes[filterNdx].name;
 				deUint32		format		= filterableFormatsByType[fmtNdx].format;
 				const char*		formatName	= filterableFormatsByType[fmtNdx].name;
 				bool			isMipmap	= minFilter != gl.NEAREST && minFilter != gl.LINEAR;
 				deUint32		magFilter	= isMipmap ? gl.LINEAR : minFilter;
 				string			name		= string(formatName) + "_" + filterName;
 				deUint32		wrapS		= gl.REPEAT;
 				deUint32		wrapT		= gl.REPEAT;
 				int				width		= 128;
 				int				height		= 128;
 				int				numLayers	= 8;

 				formatsGroup->addChild(new Texture2DArrayFilteringCase(m_context,
 																	   name.c_str(), "",
 																	   minFilter, magFilter,
 																	   wrapS, wrapT,
 																	   format,
 																	   width, height, numLayers));
 			}
 		}

 		// Sizes.
 		tcu::TestCaseGroup* sizesGroup = new tcu::TestCaseGroup(m_testCtx, "sizes", "Texture Sizes");
 		group2DArray->addChild(sizesGroup);
 		for (int sizeNdx = 0; sizeNdx < DE_LENGTH_OF_ARRAY(sizes2DArray); sizeNdx++)
 		{
 			for (int filterNdx = 0; filterNdx < DE_LENGTH_OF_ARRAY(minFilterModes); filterNdx++)
 			{
 				deUint32		minFilter	= minFilterModes[filterNdx].mode;
 				const char*		filterName	= minFilterModes[filterNdx].name;
 				deUint32		format		= gl.RGBA8;
 				bool			isMipmap	= minFilter != gl.NEAREST && minFilter != gl.LINEAR;
 				deUint32		magFilter	= isMipmap ? gl.LINEAR : minFilter;
 				deUint32		wrapS		= gl.REPEAT;
 				deUint32		wrapT		= gl.REPEAT;
 				int				width		= sizes2DArray[sizeNdx].width;
 				int				height		= sizes2DArray[sizeNdx].height;
 				int				numLayers	= sizes2DArray[sizeNdx].numLayers;
 				string			name		= de::toString(width) + "x" + de::toString(height) + "x" + de::toString(numLayers) + "_" + filterName;

 				sizesGroup->addChild(new Texture2DArrayFilteringCase(m_context,
 																	 name.c_str(), "",
 																	 minFilter, magFilter,
 																	 wrapS, wrapT,
 																	 format,
 																	 width, height, numLayers));
 			}
 		}

 		// Wrap modes.
 		tcu::TestCaseGroup* const combinationsGroup = new tcu::TestCaseGroup(m_testCtx, "combinations", "Filter and wrap mode combinations");
 		group2DArray->addChild(combinationsGroup);
 		for (int minFilterNdx = 0; minFilterNdx < DE_LENGTH_OF_ARRAY(minFilterModes); minFilterNdx++)
 		{
 			for (int magFilterNdx = 0; magFilterNdx < DE_LENGTH_OF_ARRAY(magFilterModes); magFilterNdx++)
 			{
 				for (int wrapSNdx = 0; wrapSNdx < DE_LENGTH_OF_ARRAY(wrapModes); wrapSNdx++)
 				{
 					for (int wrapTNdx = 0; wrapTNdx < DE_LENGTH_OF_ARRAY(wrapModes); wrapTNdx++)
 					{
 						deUint32		minFilter	= minFilterModes[minFilterNdx].mode;
 						deUint32		magFilter	= magFilterModes[magFilterNdx].mode;
 						deUint32		format		= gl.RGBA8;
 						deUint32		wrapS		= wrapModes[wrapSNdx].mode;
 						deUint32		wrapT		= wrapModes[wrapTNdx].mode;
 						int				width		= 123;
 						int				height		= 107;
 						int				numLayers	= 7;
 						string			name		= string(minFilterModes[minFilterNdx].name) + "_" + magFilterModes[magFilterNdx].name + "_" + wrapModes[wrapSNdx].name + "_" + wrapModes[wrapTNdx].name;

 						combinationsGroup->addChild(new Texture2DArrayFilteringCase(m_context,
 																					name.c_str(), "",
 																					minFilter, magFilter,
 																					wrapS, wrapT,
 																					format,
 																					width, height, numLayers));
 					}
 				}
 			}
 		}

       	// 3D texture filtering.

 		tcu::TestCaseGroup* group3D = new tcu::TestCaseGroup(m_testCtx, "3d", "3D Texture Filtering");
 		addChild(group3D);

 		// Formats.
 		tcu::TestCaseGroup* formatsGroup = new tcu::TestCaseGroup(m_testCtx, "formats", "3D Texture Formats");
 		group3D->addChild(formatsGroup);
 		for (int fmtNdx = 0; fmtNdx < DE_LENGTH_OF_ARRAY(filterableFormatsByType); fmtNdx++)
 		{
 			for (int filterNdx = 0; filterNdx < DE_LENGTH_OF_ARRAY(minFilterModes); filterNdx++)
 			{
 				deUint32		minFilter	= minFilterModes[filterNdx].mode;
 				const char*		filterName	= minFilterModes[filterNdx].name;
 				deUint32		format		= filterableFormatsByType[fmtNdx].format;
 				const char*		formatName	= filterableFormatsByType[fmtNdx].name;
 				bool			isMipmap	= minFilter != gl.NEAREST && minFilter != gl.LINEAR;
 				deUint32		magFilter	= isMipmap ? gl.LINEAR : minFilter;
 				string			name		= string(formatName) + "_" + filterName;
 				deUint32		wrapS		= gl.REPEAT;
 				deUint32		wrapT		= gl.REPEAT;
 				deUint32		wrapR		= gl.REPEAT;
 				int				width		= 64;
 				int				height		= 64;
 				int				depth		= 64;

 				formatsGroup->addChild(new Texture3DFilteringCase(m_context,
 																  name.c_str(), "",
 																  minFilter, magFilter,
 																  wrapS, wrapT, wrapR,
 																  format,
 																  width, height, depth));
 			}
 		}

 		// Sizes.
 		tcu::TestCaseGroup* sizesGroup = new tcu::TestCaseGroup(m_testCtx, "sizes", "Texture Sizes");
 		group3D->addChild(sizesGroup);
 		for (int sizeNdx = 0; sizeNdx < DE_LENGTH_OF_ARRAY(sizes3D); sizeNdx++)
 		{
 			for (int filterNdx = 0; filterNdx < DE_LENGTH_OF_ARRAY(minFilterModes); filterNdx++)
 			{
 				deUint32		minFilter	= minFilterModes[filterNdx].mode;
 				const char*		filterName	= minFilterModes[filterNdx].name;
 				deUint32		format		= gl.RGBA8;
 				bool			isMipmap	= minFilter != gl.NEAREST && minFilter != gl.LINEAR;
 				deUint32		magFilter	= isMipmap ? gl.LINEAR : minFilter;
 				deUint32		wrapS		= gl.REPEAT;
 				deUint32		wrapT		= gl.REPEAT;
 				deUint32		wrapR		= gl.REPEAT;
 				int				width		= sizes3D[sizeNdx].width;
 				int				height		= sizes3D[sizeNdx].height;
 				int				depth		= sizes3D[sizeNdx].depth;
 				string			name		= de::toString(width) + "x" + de::toString(height) + "x" + de::toString(depth) + "_" + filterName;

 				sizesGroup->addChild(new Texture3DFilteringCase(m_context,
 																name.c_str(), "",
 																minFilter, magFilter,
 																wrapS, wrapT, wrapR,
 																format,
 																width, height, depth));
 			}
 		}

 		// Wrap modes.
 		tcu::TestCaseGroup* combinationsGroup = new tcu::TestCaseGroup(m_testCtx, "combinations", "Filter and wrap mode combinations");
 		group3D->addChild(combinationsGroup);
 		for (int minFilterNdx = 0; minFilterNdx < DE_LENGTH_OF_ARRAY(minFilterModes); minFilterNdx++)
 		{
 			for (int magFilterNdx = 0; magFilterNdx < DE_LENGTH_OF_ARRAY(magFilterModes); magFilterNdx++)
 			{
 				for (int wrapSNdx = 0; wrapSNdx < DE_LENGTH_OF_ARRAY(wrapModes); wrapSNdx++)
 				{
 					for (int wrapTNdx = 0; wrapTNdx < DE_LENGTH_OF_ARRAY(wrapModes); wrapTNdx++)
 					{
 						for (int wrapRNdx = 0; wrapRNdx < DE_LENGTH_OF_ARRAY(wrapModes); wrapRNdx++)
 						{
 							deUint32		minFilter	= minFilterModes[minFilterNdx].mode;
 							deUint32		magFilter	= magFilterModes[magFilterNdx].mode;
 							deUint32		format		= gl.RGBA8;
 							deUint32		wrapS		= wrapModes[wrapSNdx].mode;
 							deUint32		wrapT		= wrapModes[wrapTNdx].mode;
 							deUint32		wrapR		= wrapModes[wrapRNdx].mode;
 							int				width		= 63;
 							int				height		= 57;
 							int				depth		= 67;
 							string			name		= string(minFilterModes[minFilterNdx].name) + "_" + magFilterModes[magFilterNdx].name + "_" + wrapModes[wrapSNdx].name + "_" + wrapModes[wrapTNdx].name + "_" + wrapModes[wrapRNdx].name;

 							combinationsGroup->addChild(new Texture3DFilteringCase(m_context,
 																				   name.c_str(), "",
 																				   minFilter, magFilter,
 																				   wrapS, wrapT, wrapR,
 																				   format,
 																				   width, height, depth));
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
