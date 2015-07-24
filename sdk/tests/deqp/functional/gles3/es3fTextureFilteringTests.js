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

    var TEX2D_VIEWPORT_WIDTH = 64,
    var TEX2D_VIEWPORT_HEIGHT = 64,
    var TEX2D_MIN_VIEWPORT_WIDTH = 64,
    var TEX2D_MIN_VIEWPORT_HEIGHT = 64,

    var TEX3D_VIEWPORT_WIDTH = 64,
    var TEX3D_VIEWPORT_HEIGHT = 64,
    var TEX3D_MIN_VIEWPORT_WIDTH = 64,
    var TEX3D_MIN_VIEWPORT_HEIGHT = 64

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
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
     * @param {number} minFilter
     * @param {number} magFilter
     * @param {number} wrapS
     * @param {number} wrapT
     * @param {number} internalFormat
     * @param {number} width
     * @param {number} height
     */
    es3fTextureFilteringTests.Texture2DFilteringCase = function (
        name, desc, minFilter, magFilter, wrapS, wrapT,
        internalFormat, width, height) {
        tcuTestCase.DeqpTest.call(this, name, desc);
        this.m_minFilter = minFilter;
        this.m_magFilter = magFilter;
        this.m_wrapS = wrapS;
        this.m_wrapT = wrapT;
        this.m_internalFormat = internalFormat;
        this.m_width = width;
        this.m_height = height;
        this.m_renderer = ; //TODO: check -> renderCtx, testCtx, glu::GLSL_VERSION_300_ES, glu::PRECISION_HIGHP)
        this.m_caseNdx = 0;
        /** @type {Array<gluTexture.Texture2D>} */ this.m_textures = [];
        /** @type {Array<string>} */ this.m_filenames = [];
    };

    /**
     * @param {string} name
     * @param {string} desc
     * @param {number} minFilter
     * @param {number} magFilter
     * @param {number} wrapS
     * @param {number} wrapT
     * @param {Array<string>} filenames
     * @return {es3fTextureFilteringTests.Texture2DFilteringCase}
     */
    es3fTextureFilteringTests.newTexture2DFilteringCaseFromFiles = function(
        name, desc, minFilter, magFilter, wrapS, wrapT, filenames
    ) {
        var t2dcase = new es3fTextureFilteringTests.Texture2DFilteringCase(
            name, desc, minFilter, magFilter, wrapS, wrapT, gl.NONE, 0, 0
        );

        t2dcase.m_filenames = filenames;
    };

    es3fTextureFilteringTests.Texture2DFilteringCase.prototype =
        Object.create(tcuTestCase.DeqpTest.prototype);
    es3fTextureFilteringTests.Texture2DFilteringCase.prototype.constructor =
        es3fTextureFilteringTests.Texture2DFilteringCase;

    /**
     * @constructor
     * @param {gluTexture.Texture2D} tex_
     * @param {Array<number>} minCoord_
     * @param {Array<number>} maxCoord
     */
    es3fTextureFilteringTests.Texture2DFilteringCase.FilterCase = function(
        tex_, minCoord_, maxCoord_
    ) {
        this.texture = tex_;
        this.minCoord = minCoord_;
        this.maxCoord = maxCoord_;
    };

    /**
     * init
     */
    es3fTextureFilteringTests.Texture2DFilteringCase.prototype.init =
    function () {
        try
        {
            if (this.m_filenames.length > 0)
            {
                this.m_textures.push(
                    0
                    /* TODO: gluTexture.Texture2D.create(
                    m_testCtx.getArchive(), (int)m_filenames.size(),
                    m_filenames)*/
                );
            }
            else
            {
                // Create 2 textures.
                for (var ndx = 0; ndx < 2; ndx++)
                    this.m_textures.push(
                        gluTexture.texture2DFromInternalFormat(
                            this.m_internalFormat, this.m_width, this.m_height
                        )
                    );

                var mipmaps = true;
                var numLevels = mipmaps ? deMath.logToFloor(
                    Math.max(this.m_width, this.m_height)
                ) + 1 : 1;

                /** @type {tcuTexture.TextureFormatInfo} */ var fmtInfo =
                    tcuTexture.getTextureFormatInfo(
                        this.m_textures[0].getRefTexture().getFormat()
                    );
                /** @type {Array<number>} */ var cBias = fmtInfo.valueMin;
                /** @type {Array<number>} */
                var cScale = fmtInfo.valueMax - fmtInfo.valueMin;

                // Fill first gradient texture.
                for (int levelNdx = 0; levelNdx < numLevels; levelNdx++)
                {
                    /** @type {Array<number>} */ var gMin = deMath.add(
                        deMath.multiply([0.0, 0.0, 0.0, 1.0], cScale), cBias
                    );
                    /** @type {Array<number>} */ var gMax = deMath.add(
                        deMath.multiply([1.0, 1.0, 1.0, 0.0], cScale), cBias
                    );

                    this.m_textures[0].getRefTexture().allocLevel(levelNdx);
                    tcuTextureUtil.fillWithComponentGradients(
                        this.m_textures[0].getRefTexture().getLevel(levelNdx),
                        gMin, gMax
                    );
                }

                // Fill second with grid texture.
                for (var levelNdx = 0; levelNdx < numLevels; levelNdx++)
                {
                    /** @type {number} */ var step = 0x00ffffff / numLevels;
                    /** @type {number} */ var rgb = step * levelNdx;
                    /** @type {number} */ var colorA = deMath.binaryOp(
                        0xff000000, rgb, deMath.BinaryOp.OR
                    );
                    /** @type {number} */ var colorB = deMath.binaryOp(
                        0xff000000, deMath.binaryNot(rgb), deMath.BinaryOp.OR
                    );

                    this.m_textures[1].getRefTexture().allocLevel(levelNdx);
                    tcuTextureUtil.fillWithGrid(
                        this.m_textures[1].getRefTexture().getLevel(levelNdx),
                        4,
                        deMath.add(deMath.multiply(
                            new tcuRGBA.RGBA(colorA).toVec(), cScale), cBias
                        ),
                        deMath.add(deMath.multiply(
                            new tcuRGBA.RGBA(colorB).toVec(), cScale), cBias
                        );
                    );
                }

                // Upload.
                for (var i = 0; i < this.m_textures.length; i++)
                    this.m_textures[i].upload();
            }

            // Compute cases.
            /** @typedef {{texNdx: number, lodX: number, lodY: number, oX: number, oY: number}} */
            var Cases = {};

            /** @type {Array<Cases>} */
            var cases = [
                {
                    texNdx: 0,  lodX:  1.6,  lodY:  2.9,  oX:  -1.0,  oY:  -2.7
                }, {
                    texNdx: 0,  lodX:  -2.0, lodY:   -1.35, oX:   -0.2, oY:   0.7
                }, {
                    texNdx: 1,  lodX:  0.14,  lodY:  0.275,  oX:  -1.5, oY:   -1.1
                }, {
                    texNdx: 1,  lodX:  -0.92, lodY:   -2.64, oX:   0.4, oY:   -0.1
                }
            ];

            var viewportW = deMath.min(
                TEX2D_VIEWPORT_WIDTH, 0 /** TODO: gl.getRenderTarget().getWidth() */
            );
            var viewportH = deMath.min(
                TEX2D_VIEWPORT_HEIGHT, 0 /** TODO: gl.getRenderTarget().getHeight() */
            );

            for (var caseNdx = 0; caseNdx < cases.length; caseNdx++)
            {
                /** @type {number} */ var texNdx = deMath.clamp(
                    cases[caseNdx].texNdx, 0, this.m_textures.length - 1
                );
                /** @type {number} */ var lodX = cases[caseNdx].lodX;
                /** @type {number} */ var lodY = cases[caseNdx].lodY;
                /** @type {number} */ var oX = cases[caseNdx].oX;
                /** @type {number} */ var oY = cases[caseNdx].oY;
                /** @type {number} */ var sX = Math.exp(lodX) * viewportW /
                    this.m_textures[texNdx].getRefTexture().getWidth();
                /** @type {number} */ var sY = Math.exp(lodY) * viewportH /
                    this.m_textures[texNdx].getRefTexture().getHeight();

                this.m_cases.push(
                    new
                    es3fTextureFilteringTests.Texture2DFilteringCase.FilterCase(
                        this.m_textures[texNdx], [oX, oY], [oX + sX, oY + sY]
                    )
                );
            }

            this.m_caseNdx = 0;
            testPassed("");
        }
        catch (e)
        {
            // Clean up to save memory.
            this.deinit();
            throw e;
        }
    };

    /**
     * deinit TODO:
     */
    es3fTextureFilteringTests.Texture2DFilteringCase.prototype.deinit = function
    (){
        /*for (var i = 0; i < this.m_textures.length; i++)

        this.m_textures.clear();

        this.m_renderer.clear();
        this.m_cases.clear();*/
    };

    /**
     * @return {tcuTestCase.IterateResult}
     */
    es3fTextureFilteringTests.Texture2DFilteringCase.iterate = function ()
    {
        /** @type {glsTextureTestUtil.RandomViewport} */
        var viewport = new glsTextureTestUtil.RandomViewport(
            gl.canvas, TEX2D_VIEWPORT_WIDTH,
            TEX2D_VIEWPORT_HEIGHT, deMath.binaryOp(
                deString.deStringHash(this.getName()),
                deMath.deMathHash(this.m_caseNdx),
                deMAth.BinaryOp.XOR
            );
        );
        /** @type {tcuTexture.TextureFormat} */
        var texFmt = this.m_textures[0].getRefTexture().getFormat();

        /** @type {tcuTexture.TextureFormatInfo} */
        var fmtInfo = tcuTexture.getTextureFormatInfo(texFmt);
        var curCase = this.m_cases[m_caseNdx];
        bufferedLogToConsole("Test " + this.m_caseNdx);
        var refParams = new glsTextureTestUtil.ReferenceParams(
            glsTextureTestUtil.textureType.TEXTURETYPE_2D
        );
        var rendered = tcuSurface.Surface(viewport.width, viewport.height);
        var texCoord = [0, 0];

        if (viewport.width < TEX2D_MIN_VIEWPORT_WIDTH ||
            viewport.height < TEX2D_MIN_VIEWPORT_HEIGHT)
            throw new Error("Too small render target");

        // Setup params for reference.
        refParams.sampler = gluTextureUtil.mapGLSampler(
            this.m_wrapS, m_wrapT, m_minFilter, m_magFilter
        );
        refParams.samplerType = glsTextureTestUtil.getSamplerType(texFmt);
        refParams.lodMode = glsTextureTestUtil.lodMode.EXACT;
        refParams.colorBias = fmtInfo.lookupBias;
        refParams.colorScale = fmtInfo.lookupScale;

        // Compute texture coordinates.
        bufferedLogToConsole(
            "Texture coordinates: " + curCase.minCoord +
            " -> " + curCase.maxCoord
        );
        texCoord = glsTextureTestUtil.computeQuadTexCoord2D(
            curCase.minCoord, curCase.maxCoord
        );

        gl.bindTexture(gl.TEXTURE_2D, curCase.texture.getGLTexture());
        gl.texParameteri(
            gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.m_minFilter
        );
        gl.texParameteri(
            gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.m_magFilter
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.m_wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.m_wrapT);

        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        //TODO: m_renderer.renderQuad(0, &texCoord[0], refParams);
        rendered.readViewport(
            gl, viewport.x, viewport.y, rendered.getAccess()
        );

        /** @type {boolean} */ var isNearestOnly =
            this.m_minFilter == gl.NEAREST && this.m_magFilter == gl.NEAREST;
        /** @type {tcuPixelFormat.PixelFormat} */
        var pixelFormat = tcuPixelFormat.PixelFormatFromContext(gl);

        //(iVec4)
        var colorBits = deMath.max(
            glsTextureTestUtil.getBitsVec(pixelFormat) -
            (isNearestOnly ? 1 : 2),
            [0, 0, 0, 0]
        ); // 1 inaccurate bit if nearest only, 2 otherwise

        /** @type {tcuTexLookupVerifier.LodPrecision} */
        var lodPrecision = new tcuTexLookupVerifier.LodPrecision();
        /** @type {tcuTexLookupVerifier.LookupPrecision} */
        var lookupPrecision = new tcuTexLookupVerifier.LookupPrecision();

        lodPrecision.derivateBits        = 18;
        lodPrecision.lodBits            = 6;
        lookupPrecision.colorThreshold =
            tcuTexLookupVerifier.computeFixedPointThreshold(colorBits) /
            refParams.colorScale;
        lookupPrecision.coordBits = [20, 20, 0];
        lookupPrecision.uvwBits = [7, 7, 0];
        lookupPrecision.colorMask =
            glsTextureTestUtil.getCompareMask(pixelFormat);

        var isHighQuality = glsTextureTestUtil.verifyTexture2DResult(
            rendered.getAccess(), curCase.texture.getRefTexture(),
            texCoord[0], refParams, lookupPrecision, lodPrecision, pixelFormat
        );

        if (!isHighQuality)
        {
            // Evaluate against lower precision requirements.
            lodPrecision.lodBits    = 4;
            lookupPrecision.uvwBits    = [4,4,0];

            bufferedLogToConsole("Warning: Verification against high " +
                'precision requirements failed, trying with lower ' +
                'requirements.'
            );

            var isOk = glsTextureTestUtil.verifyTexture2DResult(
                rendered.getAccess(), curCase.texture.getRefTexture(),
                texCoord[0], refParams, lookupPrecision, lodPrecision,
                pixelFormat
            );

            if (!isOk)
            {
                bufferedLogToConsole(
                    "ERROR: Verification against low ' +
                    'precision requirements failed, failing test case."
                );
                testFailed("Image verification failed");
            }
            else
                checkMessage("Low-quality filtering result");
        }

        this.m_caseNdx += 1;
        return this.m_caseNdx < this.m_cases.length ?
            tcuTestCase.IterateResult.CONTINUE :
            tcuTestCase.IterateResult.STOP;
    };

    /**
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
     * @param {number} minFilter
     * @param {number} magFilter
     * @param {number} wrapS
     * @param {number} wrapT
     * @param {boolean} onlySampleFaceInterior
     * @param {number} internalFormat
     * @param {number} width
     * @param {number} height
     */
    es3fTextureFilteringTests.TextureCubeFilteringCase = function (
        name, desc, minFilter, magFilter, wrapS, wrapT, onlySampleFaceInterior,
        internalFormat, width, height
    ) {
        tcuTestCase.DeqpTest.call(this, name, desc);
        this.m_minFilter = minFilter;
        this.m_magFilter = magFilter;
        this.m_wrapS = wrapS;
        this.m_wrapT = wrapT;
        /** @type {boolean}*/
        this.m_onlySampleFaceInterior = onlySampleFaceInterior;
        this.m_internalFormat = internalFormat;
        this.m_width = width;
        this.m_height = height;
        /** @type {glsTextureTestUtil.TextureRenderer} */
        this.m_renderer = new glsTextureTestUtil.TextureRenderer(
            es3fTextureFilteringTests.version,
            gluShaderUtil.precision.PRECISION_HIGHP
        );
        this.m_caseNdx = 0;
        /** @type {Array<string>} */ this.m_filenames = [];
        /** @type {Array<gluTexture.Texture2D>} */ this.m_textures = [];
        /** @type {Array<es3fTextureFilteringTests.
         *      TextureCubeFilteringCase.FilterCase>}
         */
        this.m_cases = [];
    };

    /**
     * @param {string} name
     * @param {string} desc
     * @param {number} minFilter
     * @param {number} magFilter
     * @param {number} wrapS
     * @param {number} wrapT
     * @param {boolean} onlySampleFaceInterior
     * @param {Array<string>} filenames
     * @return {es3fTextureFilteringTests.TextureCubeFilteringCase}
     */
    es3fTextureFilteringTests.newTextureCubeFilteringCaseFromFile = function (
        name, desc, minFilter, magFilter, wrapS, wrapT, onlySampleFaceInterior,
        filenames
    ) {
        var cubeCase = new es3fTextureFilteringTests.TextureCubeFilteringCase(
            name, desc, minFilter, magFilter, wrapS, wrapT,
            onlySampleFaceInterior, gl.NONE, 0, 0
        );
        cubeCase.m_filenames = filenames;

        return cubeCase;
    };

    es3fTextureFilteringTests.TextureCubeFilteringCase.prototype =
        Object.create(tcuTestCase.DeqpTest.prototype);
    es3fTextureFilteringTests.TextureCubeFilteringCase.prototype.constructor =
        es3fTextureFilteringTests.TextureCubeFilteringCase;

    /**
     * init
     */
    es3fTextureFilteringTests.TextureCubeFilteringCase.prototype.init =
    function () {
        try
        {
            if (!this.m_filenames.empty())
            {
                //TODO:
                /*this.m_textures.push(gluTexture.TextureCube.create(
                    this.m_renderCtx, this.m_renderCtxInfo,
                    this.m_testCtx.getArchive(), this.m_filenames.length / 6,
                    this.m_filenames
                ));*/
            }
            else
            {
                assertMsgOptions(
                    this.m_width == this.m_height, 'Texture has to be squared',
                    false, true
                );
                for (var ndx = 0; ndx < 2; ndx++)
                    this.m_textures.push(new gluTexture.TextureCube(
                        this.m_internalFormat, this.m_width
                    ));

                var numLevels = deMath.logToFloor(
                    Math.max(this.m_width, this.m_height)
                ) + 1;
                /** @type {tcuTexture.TextureFormatInfo} */
                var fmtInfo = tcuTexture.getTextureFormatInfo(
                    this.m_textures[0].getRefTexture().getFormat()
                );
                /** @type {Array<number>} */
                var cBias = fmtInfo.valueMin;
                /** @type {Array<number>} */
                var cScale = fmtInfo.valueMax-fmtInfo.valueMin;

                // Fill first with gradient texture.
                /** @type {Array<Array<number>} (array of 4 component vectors)*/
                var gradients = [
                    [ // negative x
                        [0.0, 0.0, 0.0, 1.0], [1.0, 1.0, 1.0, 0.0]
                    ], [ // positive x
                        [0.5, 0.0, 0.0, 1.0], [1.0, 1.0, 1.0, 0.0]
                    ], [ // negative y
                        [0.0, 0.5, 0.0, 1.0], [1.0, 1.0, 1.0, 0.0]
                    ], [ // positive y
                        [0.0, 0.0, 0.5, 1.0], [1.0, 1.0, 1.0, 0.0]
                    ], [ // negative z
                        [0.0, 0.0, 0.0, 0.5], [1.0, 1.0, 1.0, 1.0]
                    ], [ // positive z
                        [0.5, 0.5, 0.5, 1.0], [1.0, 1.0, 1.0, 0.0]
                    ]
                ];
                for (var face = 0;
                    face < Object.keys(tcuTexture.CubeFace).length;
                    face++
                ) {
                    for (var levelNdx = 0; levelNdx < numLevels; levelNdx++)
                    {
                        this.m_textures[0].getRefTexture().allocLevel(
                            face, levelNdx
                        );
                        tcuTextureUtil.fillWithComponentGradients(
                            this.m_textures[0].getRefTexture().getLevelFace(
                                levelNdx, face, deMath.add(deMath.multiply(
                                    gradients[face][0], cScale), cBias
                                ), deMath.add(deMath.multiply(
                                    gradients[face][1], cScale), cBias
                                )
                            )
                        );
                    }
                }

                // Fill second with grid texture.
                for (var face = 0;
                    face < Object.keys(tcuTexture.CubeFace).length;
                    face++
                ) {
                    for (var levelNdx = 0; levelNdx < numLevels; levelNdx++)
                    {
                        var step = 0x00ffffff / (
                            numLevels * Object.keys(tcuTexture.CubeFace).length
                        );
                        var rgb = step * levelNdx * face;
                        /** @type {number} */ var colorA = deMath.binaryOp(
                            0xff000000, rgb, deMath.BinaryOp.OR
                        );
                        /** @type {number} */ var colorB = deMath.binaryOp(
                            0xff000000, deMath.binaryNot(rgb),
                            deMath.BinaryOp.OR
                        );

                        this.m_textures[1].getRefTexture().allocLevel(
                            face, levelNdx
                        );
                        tcuTextureUtil.fillWithGrid(
                            this.m_textures[1].getRefTexture().getLevelFace(
                                levelNdx, face
                            ), 4, deMath.add(
                                deMath.multiply(
                                new tcuRGBA.RGBA(colorA).toVec(),
                                cScale), cBias
                            ), deMath.add(
                                deMath.multiply(
                                new tcuRGBA.RGBA(colorB).toVec(),
                                cScale), cBias
                            )
                        );
                    }
                }

                // Upload.
                for (var i = 0; i < this.m_textures.length; i++)
                    this.m_textures[i].upload();
            }

            // Compute cases
            /** @type {gluTexture.TextureCube} */
            var tex0 = this.m_textures[0];
            /** @type {gluTexture.TextureCube} */
            var tex1 = this.m_textures.length > 1 ? this.m_textures[1] : tex0;

            if (this.m_onlySampleFaceInterior)
            {
                // minification
                this.m_cases.push(new es3fTextureFilteringTests.
                    TextureCubeFilteringCase.FilterCase(
                    tex0, [-0.8, -0.8], [0.8,  0.8]
                ));
                // magnification
                this.m_cases.push(new es3fTextureFilteringTests.
                    TextureCubeFilteringCase.FilterCase(
                    tex0, [0.5, 0.65], [0.8,  0.8]
                ));
                // minification
                this.m_cases.push(new es3fTextureFilteringTests.
                    TextureCubeFilteringCase.FilterCase(
                    tex1, [-0.8, -0.8], [0.8,  0.8]
                ));
                // magnification
                this.m_cases.push(new es3fTextureFilteringTests.
                    TextureCubeFilteringCase.FilterCase(
                    tex1, [0.2, 0.2], [0.6,  0.5]
                ));
            }
            else
            {
                // minification
                if (gl.getParameter(gl.SAMPLES) == 0)
                    this.m_cases.push(
                        new es3fTextureFilteringTests.TextureCubeFilteringCase.
                        FilterCase(
                            tex0, [-1.25, -1.2], [1.2, 1.25]
                        )
                    );
                // minification - w/ tweak to avoid hitting triangle
                // edges with face switchpoint.
                else
                    this.m_cases.push(
                        new es3fTextureFilteringTests.TextureCubeFilteringCase.
                        FilterCase(
                            tex0, [-1.19, -1.3], [1.1, 1.35]
                        )
                    );

                // magnification
                this.m_cases.push(
                    new es3fTextureFilteringTests.TextureCubeFilteringCase.
                    FilterCase(
                        tex0, [0.8, 0.8], [1.25, 1.20]
                    )
                );
                // minification
                this.m_cases.push(
                    new es3fTextureFilteringTests.TextureCubeFilteringCase.
                    FilterCase(
                        tex1, [-1.19, -1.3], [1.1, 1.35]
                    )
                );
                // magnification
                this.m_cases.push(
                    new es3fTextureFilteringTests.TextureCubeFilteringCase.
                    FilterCase(
                        tex1, [-1.2, -1.1], [-0.8, -0.8]
                    )
                );
            }

            this.m_caseNdx = 0;
            testPassed("");
        }
        catch (e) {
            // Clean up to save memory.
            this.deinit();
            throw e;
        }
    };

    /**
     * TODO:
     * deinit
     */
    es3fTextureFilteringTests.TextureCubeFilteringCase.prototype.deinit =
    function ()
    {
        /*for (var i = 0; i < this.m_textures.length; i++)
            delete *i;
        this.m_textures.clear();

        this.m_renderer.clear();
        this.m_cases.clear();*/
    };

    /**
     * @param {tcuTexture.CubeFace} face
     * @return {string}
     */
    es3fTextureFilteringTests.getFaceDesc = function (face) {
        switch (face) {
            case tcuTexture.CubeFace.CUBEFACE_NEGATIVE_X: return "-X";
            case tcuTexture.CubeFace.CUBEFACE_POSITIVE_X: return "+X";
            case tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Y: return "-Y";
            case tcuTexture.CubeFace.CUBEFACE_POSITIVE_Y: return "+Y";
            case tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Z: return "-Z";
            case tcuTexture.CubeFace.CUBEFACE_POSITIVE_Z: return "+Z";
            default:
                throw new Error('Invalid cube face specified');
        }
    };

    /**
     * @return {tcuTestCase.DeqpTest}
     */
    es3fTextureFilteringTests.TextureCubeFilteringCase.prototype.iterate =
    function () {
        var viewportSize = 28;
        /** @type {glsTextureTestUtil.RandomViewport} */
        var viewport = new glsTextureTestUtil.RandomViewport(
            gl.canvas, viewportSize,
            viewportSize, deMath.binaryOp(
                deString.deStringHash(this.getName()),
                deMath.deMathHash(this.m_caseNdx),
                deMAth.BinaryOp.XOR
            );
        );
        bufferedLogToConsole("Test" + this.m_caseNdx);
        /** @type {es3fTextureFilteringTests.
         *      TextureCubeFilteringCase.FilterCase}
         */
        var curCase = this.m_cases[this.m_caseNdx];

        /** @type {tcuTexture.TextureFormat} */
        var texFmt = this.m_textures[0].getRefTexture().getFormat();
        /** @type {tcuTexture.TextureFormatInfo} */
        var fmtInfo = tcuTexture.getTextureFormatInfo(texFmt);
        var curCase = this.m_cases[m_caseNdx];
        bufferedLogToConsole("Test " + this.m_caseNdx);
        var refParams = new glsTextureTestUtil.ReferenceParams(
            glsTextureTestUtil.textureType.TEXTURETYPE_2D
        );
        /** @type {tcuTexture.TextureFormat} */
        var texFmt = curCase.texture.getRefTexture().getFormat();
        /** @type {tcuTexture.TextureFormatInfo} */
        var fmtInfo = tcuTextureUtil.getTextureFormatInfo(texFmt);
        /** @type {glsTextureTestUtil.ReferenceParams} */
        var sampleParams = new glsTextureTestUtil.ReferenceParams(
            glsTextureTestUtil.textureType.TEXTURETYPE_CUBE
        );

        if (viewport.width < viewportSize || viewport.height < viewportSize)
            throw new Error("Too small render target");

        // Setup texture
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, curCase.texture.getGLTexture());
        gl.texParameteri(
            gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, this.m_minFilter
        );
        gl.texParameteri(
            gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, this.m_magFilter
        );
        gl.texParameteri(
            gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, this.m_wrapS
        );
        gl.texParameteri(
            gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, this.m_wrapT
        );

        // Other state
        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

        // Params for reference computation.
        sampleParams.sampler = gluTextureUtil.mapGLSampler(
            gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE,
            this.m_minFilter, this.m_magFilter
        );
        sampleParams.sampler.seamlessCubeMap = true;
        sampleParams.samplerType = glsTextureTestUtil.getSamplerType(texFmt);
        sampleParams.colorBias = fmtInfo.lookupBias;
        sampleParams.colorScale = fmtInfo.lookupScale;
        sampleParams.lodMode = glsTextureTestUtil.lodMode.EXACT;

        bufferedLogToConsole(
            "Coordinates: " + curCase.bottomLeft + " -> " + curCase.topRight
        );

        for (var faceNdx = 0;
            faceNdx < Object.keys(tcuTexture.CubeFace).length;
            faceNdx++
        ) {
            /** @type {tcuTexture.CubeFace} */
            var face = /** @type {tcuTexture.CubeFace.} */ (faceNdx);
            /** @type {tcuSurface.Surface} */
            var result = new tcuSurface.Surface(
                viewport.width, viewport.height
            );
            /** @type {Array<number>} */ var texCoord;

            glsTextureTestUtil.computeQuadTexCoordCube(
                texCoord, face, curCase.bottomLeft, curCase.topRight
            );

            bufferedLogToConsole(
                "Face " + es3fTextureFilteringTests.getFaceDesc(face)
            );

            // \todo Log texture coordinates.

            //TODO: this.m_renderer.renderQuad(0, &texCoord[0], sampleParams);

            result.readPixels(
                gl, viewport.x, viewport.y, viewport.width, viewport.height
            );

            /** @type {boolean} */
            var isNearestOnly = this.m_minFilter == gl.NEAREST &&
                this.m_magFilter == gl.NEAREST;
            /** @type {tcuPixelFormat.PixelFormat} */
            var pixelFormat = tcuPixelFormat.PixelFormatFromContext(gl);

            //(iVec4)
            var colorBits = deMath.max(
                glsTextureTestUtil.getBitsVec(pixelFormat) -
                (isNearestOnly ? 1 : 2),
                [0, 0, 0, 0]
            ); // 1 inaccurate bit if nearest only, 2 otherwise
            /** @type {tcuTexLookupVerifier.LodPrecision} */
            var lodPrecision = new tcuTexLookupVerifier.LodPrecision();
            /** @type {tcuTexLookupVerifier.LookupPrecision} */
            var lookupPrecision = new tcuTexLookupVerifier.LookupPrecision();

            lodPrecision.derivateBits = 10;
            lodPrecision.lodBits = 5;
            lookupPrecision.colorThreshold =
                tcuTexLookupVerifier.computeFixedPointThreshold(colorBits) /
                sampleParams.colorScale;
            lookupPrecision.coordBits = [10,10,10];
            lookupPrecision.uvwBits = [6,6,0];
            lookupPrecision.colorMask =
                glsTextureTestUtil.getCompareMask(pixelFormat);

            var isHighQuality = glsTextureTestUtil.verifyTexture2DResult(
                result.getAccess(), curCase.texture.getRefTexture(),
                texCoord[0], sampleParams, lookupPrecision, lodPrecision,
                pixelFormat
            );

            if (!isHighQuality)
            {
                // Evaluate against lower precision requirements.
                lodPrecision.lodBits    = 4;
                lookupPrecision.uvwBits    = [4,4,0];

                bufferedLogToConsole('Warning: Verification against high ' +
                 'precision requirements failed, trying with lower ' +
                 'requirements.');

                var isOk = glsTextureTestUtil.verifyTexture2DResult(
                    result.getAccess(), curCase.texture.getRefTexture(),
                    texCoord[0], sampleParams, lookupPrecision, lodPrecision,
                    pixelFormat
                );

                if (!isOk)
                {
                    bufferedLogToConsole('ERROR: Verification against low' +
                        'precision requirements failed, failing test case.');
                    testFailed("Image verification failed");
                }
                else
                    testPassed("Low-quality filtering result");
            }
        }

        this.m_caseNdx += 1;
        return this.m_caseNdx < this.m_cases.length ?
            tcuTestCase.IterateResult.CONTINUE :
            tcuTestCase.IterateResult.STOP;
    };

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
            {
                name: "clamp", mode: gl.CLAMP_TO_EDGE
            }, {
                name: "repeat", mode: gl.REPEAT
            }, {
                name: "mirror", mode: gl.MIRRORED_REPEAT
            }
        ];

        /**
         * @typedef {{name: string, mode: number}}
         */
        var MinFilterMode = {};

        /** @type {Array<MinFilterMode>} */
        var minFilterModes = [
            {
                name: "nearest", mode: gl.NEAREST
            }, {
                name: "linear",                mode: gl.LINEAR
            }, {
                name: "nearest_mipmap_nearest", mode: gl.NEAREST_MIPMAP_NEAREST
            }, {
                name: "linear_mipmap_nearest", mode: gl.LINEAR_MIPMAP_NEAREST
            }, {
                name: "nearest_mipmap_linear",  mode: gl.NEAREST_MIPMAP_LINEAR
            }, {
                name: "linear_mipmap_linear", mode: gl.LINEAR_MIPMAP_LINEAR
            }
        ];

        /**
         * @typedef {{name: string, mode: number}}
         */
        var MagFilterModes = {};

        /** @type {Array<MagFilterModes>} */
        var magFilterModes = [
            {
                   name: "nearest",    mode: gl.NEAREST
            }, {
                   name: "linear",        mode: gl.LINEAR
            }
        ];

        /** @typedef {{width: number, height: number}} */
        var Sizes2D = {};

        /** @type {Array<Sizes2D>} */
        var sizes2D = [
            {
                width:  4, height:      8
            }, {
                width: 32, height:     64
            }, {
                width:128, height:    128
            }, {
                width:  3, height:      7
            }, {
                width: 31, height:     55
            }, {
                width:127, height:     99
            }
        ];

        /** @typedef {{width: number, height: number}} */
        var SizesCube = {};

        /** @type {Array<SizesCube>} */
        var sizesCube = [
            {
                width:  8, height:   8
            }, {
                width: 64, height:  64
            }, {
                width:128, height: 128
            }, {
                width:  7, height:   7
            }, {
                width: 63, height:  63
            }
        ];

           /** @typedef {{width: number, height: number, numLayers: number}} */
        var Sizes2DArray = {};

        /** @type {Array<sizes2DArray>} */
        var sizes2DArray = [
            {
                width:   4, height:   8, numLayers:   8
            }, {
                width:  32, height:  64, numLayers:  16
            }, {
                width: 128, height:  32, numLayers:  64
            }, {
                width:   3, height:   7, numLayers:   5
            }, {
                width:  63, height:  63, numLayers:  63
            }
        ];

        /** @typedef {{width: number, height: number, depth: number}} */
           var Sizes3D = {};

        /** @type {Array<Sizes3D>} */
        var sizes3D = [
            {
                width:   4, height:   8, depth:   8
            }, {
                width:  32, height:  64, depth:  16
            }, {
                width: 128, height:  32, depth:  64
            }, {
                width:   3, height:   7, depth:   5
            }, {
                width:  63, height:  63, depth:  63
            }
        ];

        /** @typedef {{name: string, format: number}} */
        var FilterableFormatsByType = {};

        /** @type {Array<FilterableFormatsByType>} */
        var filterableFormatsByType = [
            {
                name: "rgba16f", format:        gl.RGBA16F
            }, {
                name: "r11f_g11f_b10f", format:    gl.R11F_G11F_B10F
            }, {
                name: "rgb9_e5", format:        gl.RGB9_E5
            }, {
                name: "rgba8", format:            gl.RGBA8
            }, {
                name: "rgba8_snorm", format:    gl.RGBA8_SNORM
            }, {
                name: "rgb565", format:            gl.RGB565
            }, {
                name: "rgba4", format:            gl.RGBA4
            }, {
                name: "rgb5_a1", format:        gl.RGB5_A1
            }, {
                name: "srgb8_alpha8", format:    gl.SRGB8_ALPHA8
            }, {
                name: "rgb10_a2", format:        gl.RGB10_A2
            }
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
            for (var filterNdx = 0;
                filterNdx < minFilterModes.length;
                filterNdx++)
            {
                /** @type {number} */
                var    minFilter    = minFilterModes[filterNdx].mode;
                /** @type {string} */
                var filterName    = minFilterModes[filterNdx].name;
                /** @type {number} */
                var    format        = gl.RGBA8;
                /** @type {boolean} */
                var isMipmap    = minFilter != gl.NEAREST &&
                    minFilter != gl.LINEAR;
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
                var name = '' + width + "x" + height + "_" + filterName;

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
            for (var filterNdx = 0;
                filterNdx < minFilterModes.length;
                filterNdx++)
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
