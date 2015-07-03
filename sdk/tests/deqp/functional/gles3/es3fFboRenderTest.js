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
goog.provide('functional.gles3.es3fFboRenderTest');
goog.require('framework.common.tcuLogImage');
goog.require('framework.common.tcuRGBA');
goog.require('framework.common.tcuSurface');
goog.require('framework.common.tcuTestCase');
goog.require('framework.common.tcuTexture');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.delibs.debase.deRandom');
goog.require('framework.delibs.debase.deString');
goog.require('framework.delibs.debase.deUtil');
goog.require('framework.opengl.gluDrawUtil');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.opengl.gluTexture');
goog.require('framework.opengl.gluVarType');
goog.require('framework.opengl.simplereference.sglrGLContext');
goog.require('framework.opengl.simplereference.sglrReferenceContext');
goog.require('framework.opengl.simplereference.sglrShaderProgram');
goog.require('framework.referencerenderer.rrFragmentOperations');
goog.require('framework.referencerenderer.rrGenericVector');
goog.require('framework.referencerenderer.rrShadingContext');
goog.require('framework.referencerenderer.rrVertexAttrib');
goog.require('framework.referencerenderer.rrVertexPacket');
goog.require('modules.shared.glsDrawTests');

goog.scope(function() {

    var es3fFboRenderTest = functional.gles3.es3fFboRenderTest;
    var gluDrawUtil = framework.opengl.gluDrawUtil;
    var gluShaderUtil = framework.opengl.gluShaderUtil;
    var gluShaderProgram = framework.opengl.gluShaderProgram;
    var gluTexture = framework.opengl.gluTexture;
    var gluVarType = framework.opengl.gluVarType;
    var tcuLogImage = framework.common.tcuLogImage;
    var tcuRGBA = framework.common.tcuRGBA;
    var tcuTestCase = framework.common.tcuTestCase;
    var tcuSurface = framework.common.tcuSurface;
    var tcuTexture = framework.common.tcuTexture;
    var deMath = framework.delibs.debase.deMath;
    var deString = framework.delibs.debase.deString;
    var deRandom = framework.delibs.debase.deRandom;
    var deUtil = framework.delibs.debase.deUtil;
    var glsDrawTests = modules.shared.glsDrawTests;
    var sglrShaderProgram = framework.opengl.simplereference.sglrShaderProgram;
    var sglrGLContext = framework.opengl.simplereference.sglrGLContext;
    var sglrReferenceContext = framework.opengl.simplereference.sglrReferenceContext;
    var rrFragmentOperations = framework.referencerenderer.rrFragmentOperations;
    var rrGenericVector = framework.referencerenderer.rrGenericVector;
    var rrShadingContext = framework.referencerenderer.rrShadingContext;
    var rrVertexAttrib = framework.referencerenderer.rrVertexAttrib;
    var rrVertexPacket = framework.referencerenderer.rrVertexPacket;

    /**
     * @constructor
     */
    es3fFboRenderTest.FboConfig = function ()
    {
        this.buffers = 0; //!< Buffer bit mask (gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|...)
        this.colorType = gl.NONE; //!< gl.TEXTURE_2D, gl.TEXTURE_CUBE_MAP, gl.RENDERBUFFER
        this.colorFormat = gl.NONE; //!< Internal format for color buffer texture or renderbuffer
        this.depthStencilType = gl.NONE;
        this.depthStencilFormat = gl.NONE;
        this.width = 0;
        this.height = 0;
        this.samples = 0;
    };

    /**
     * @param {number} buffers_
     * @param {number} colorType_
     * @param {number} colorFormat_
     * @param {number} depthStencilType_
     * @param {number} depthStencilFormat_
     * @param {number=} width_
     * @param {number=} height_
     * @param {number=} samples_
     * @return {es3fFboRenderTest.FboConfig}
     */
    es3fFboRenderTest.newFboConfigDetailed = function (buffers_, colorType_, colorFormat_, depthStencilType_, depthStencilFormat_, width_, height_, samples_)
    {
        var fboConfig = new es3fFboRenderTest.FboConfig();
        fboConfig.buffers = buffers_;
        fboConfig.colorType = colorType_;
        fboConfig.colorFormat = colorFormat_;
        fboConfig.depthStencilType = depthStencilType_;
        fboConfig.depthStencilFormat = depthStencilFormat_;
        fboConfig.width = width_;
        fboConfig.height = height_;
        fboConfig.samples = samples_;

        return fboConfig;
    };

    /**
     * @param {number} type
     * @return {string}
     */
     es3fFboRenderTest.getTypeName = function (type)
    {
        switch (type)
        {
            case gl.TEXTURE_2D:       return "tex2d";
            case gl.RENDERBUFFER:    return "rbo";
            default:
                testFailed("Unknown type");
        }
    };

    /**
     * @return {string}
     */
    es3fFboRenderTest.FboConfig.prototype.getName = function ()
    {
        var name = '';

        assertMsgOptions(this.buffers & gl.COLOR_BUFFER_BIT, 'Color buffer is not specified', false, true);
        name += es3fFboRenderTest.getTypeName(this.colorType) + "_" + es3fFboRenderTest.getFormatName(colorFormat);

        if (this.buffers & gl.DEPTH_BUFFER_BIT)
            name += "_depth";
        if (this.buffers & gl.STENCIL_BUFFER_BIT)
            name += "_stencil";

        if (this.buffers & (gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT))
            name += "_" + es3fFboRenderTest.getTypeName(this.depthStencilType) + "_" + es3fFboRenderTest.getFormatName(this.depthStencilFormat);

        return name;
    };

    class Framebuffer
    {
    public:
                            Framebuffer                (sglr::Context& context, const FboConfig& config, int width, int height, deUint32 fbo = 0, deUint32 colorBuffer = 0, deUint32 depthStencilBuffer = 0);
                            ~Framebuffer            (void);

        const FboConfig&    getConfig                (void) const { return this.m_config;                }
        deUint32            getFramebuffer            (void) const { return this.m_framebuffer;        }
        deUint32            getColorBuffer            (void) const { return this.m_colorBuffer;        }
        deUint32            getDepthStencilBuffer    (void) const { return this.m_depthStencilBuffer;    }

        void                checkCompleteness        (void);

    private:
        deUint32            createTex2D                (deUint32 name, GLenum format, int width, int height);
        deUint32            createRbo                (deUint32 name, GLenum format, int width, int height);
        void                destroyBuffer            (deUint32 name, GLenum type);

        FboConfig            this.m_config;
        sglr::Context&        this.m_context;
        deUint32            this.m_framebuffer;
        deUint32            this.m_colorBuffer;
        deUint32            this.m_depthStencilBuffer;
    };

    /**
     * @param {number} format
     * @return {Array<string>}
     */
    es3fFboRenderTest.getEnablingExtensions = function (format)
    {
        /** @type {Array<string>} */ var out = [];

        switch (format)
        {
            case gl.RGB16F:
                out.push("gl.EXT_color_buffer_half_float");
                break;

            case gl.RGBA16F:
            case gl.RG16F:
            case gl.R16F:
                out.push("gl.EXT_color_buffer_half_float");

            case gl.RGBA32F:
            case gl.RGB32F:
            case gl.R11F_G11F_B10F:
            case gl.RG32F:
            case gl.R32F:
                out.push("gl.EXT_color_buffer_float");

            default:
                break;
        }

        return out;
    };

    /**
     * @param {?sglrGLContext|sglrReferenceContext} context
     * @param {string} name
     * @return {boolean}
     */
    es3fFboRenderTest.isExtensionSupported = function (context, name)
    {
        var extensions = context.getString(gl.EXTENSIONS); //TODO: check this function in sglrReferenceContext
        var extension = '';

        var lines = extensions.split('\n');
        var line_number = 0;
        while (line_number < lines.length)
        {
            extension = lines[line_number];
            if (extension == name)
                return true;
        }

        return false;
    };

    /**
     * @param {?sglrGLContext|sglrReferenceContext} context
     * @param {Array<string>} requiredExts
     * @return {boolean}
     */
    es3fFboRenderTest.isAnyExtensionSupported = function (context, requiredExts)
    {
        if (!requiredExts || requiredExts.length == 0)
            return true;

        for (var extNdx= 0; extNdx < requiredExts.length; extNdx++)
        {
            extension = requiredExts[extNdx];

            if (es3fFboRenderTest.isExtensionSupported(context, extension))
                return true;
        }

        return false;
    };

    /**
     * @param {Array} list
     * @param {string} sep
     * @return {string}
     */
    es3fFboRenderTest.join = function (list, sep)
    {
        var out = '';

        for (var elemNdx = 0; elemNdx < list.length; elemNdx++)
        {
            if (elemNdx != 0)
                out += sep;
            out += list[elemNdx];
        }

        return out;
    };

    /**
     * @param {?sglrGLContext|sglrReferenceContext} context
     * @param {number} sizedFormat
     */
    es3fFboRenderTest.checkColorFormatSupport = function (context, sizedFormat)
    {
        /** @type {Array<string>} */ var requiredExts = es3fFboRenderTest.getEnablingExtensions(sizedFormat);

        if (!es3fFboRenderTest.isAnyExtensionSupported(context, requiredExts))
        {
            var errMsg    = "Format not supported, requires " +
                            ((requiredExts.length == 1) ? requiredExts[0] : " one of the following: " + es3fFboRenderTest.join(requiredExts, ", "));

            throw new Error(errMsg);
        }
    };

    /**
     * @constructor
     * @param {?sglrGLContext|sglrReferenceContext} context
     * @param {es3fFboRenderTest.FboConfig} config
     * @param {number} width
     * @param {number} height
     * @param {WebGLBuffer} fbo
     * @param {WebGLBuffer} colorBufferName
     * @param {WebGLBuffer} depthStencilBufferName
     */
    es3fFboRenderTest.Framebuffer = function (context, config, width, height, fbo, colorBufferName, depthStencilBufferName)
    {
        this.m_config = config;
        this.m_context = context;
        this.m_framebuffer = fbo;
        this.m_colorBuffer = 0;
        this.m_depthStencilBuffer = 0;
        // Verify that color format is supported
        es3fFboRenderTest.checkColorFormatSupport(context, config.colorFormat);

        if (this.m_framebuffer == 0)
            this.m_framebuffer = context.createFramebuffer();
        context.bindFramebuffer(gl.FRAMEBUFFER, this.m_framebuffer);

        if (this.m_config.buffers & (gl.COLOR_BUFFER_BIT))
        {
            switch (this.m_config.colorType)
            {
                case gl.TEXTURE_2D:
                    this.m_colorBuffer = this.createTex2D(colorBufferName, this.m_config.colorFormat, width, height);
                    context.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.m_colorBuffer, 0);
                    break;

                case gl.RENDERBUFFER:
                    this.m_colorBuffer = this.createRbo(colorBufferName, this.m_config.colorFormat, width, height);
                    context.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.m_colorBuffer);
                    break;

                default:
                    testFailed("Unsupported type");
            }
        }

        if (this.m_config.buffers & (gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT))
        {
            switch (this.m_config.depthStencilType)
            {
                case gl.TEXTURE_2D:        this.m_depthStencilBuffer = this.createTex2D(depthStencilBufferName, this.m_config.depthStencilFormat, width, height);        break;
                case gl.RENDERBUFFER:    this.m_depthStencilBuffer = this.createRbo(depthStencilBufferName, this.m_config.depthStencilFormat, width, height);        break;
                default:
                    testFailed("Unsupported type");
            }
        }

        for (var ndx = 0; ndx < 2; ndx++)
        {
            var bit        = ndx ? gl.STENCIL_BUFFER_BIT : gl.DEPTH_BUFFER_BIT;
            var point    = ndx ? gl.STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;

            if ((this.m_config.buffers & bit) == 0)
                continue; /* Not used. */

            switch (this.m_config.depthStencilType)
            {
                case gl.TEXTURE_2D:        context.framebufferTexture2D(gl.FRAMEBUFFER, point, gl.TEXTURE_2D, this.m_depthStencilBuffer, 0);    break;
                case gl.RENDERBUFFER:    context.framebufferRenderbuffer(gl.FRAMEBUFFER, point, gl.RENDERBUFFER, this.m_depthStencilBuffer);    break;
                default:
                    throw new Error('Invalid depth stencil type');
            }
        }

        context.bindFramebuffer(gl.FRAMEBUFFER, 0);
    };

    /**
     * dinit
     */
    es3fFboRenderTest.Framebuffer.prototype.deinit = function ()
    {
        this.m_context.deleteFramebuffer(this.m_framebuffer);
        this.destroyBuffer(this.m_colorBuffer, this.m_config.colorType);
        this.destroyBuffer(this.m_depthStencilBuffer, this.m_config.depthStencilType);
    };

    /**
     * checkCompleteness
     */
    es3fFboRenderTest.Framebuffer.prototype.checkCompleteness = function ()
    {
        this.m_context.bindFramebuffer(gl.FRAMEBUFFER, this.m_framebuffer);
        var status = this.m_context.checkFramebufferStatus(gl.FRAMEBUFFER);
        this.m_context.bindFramebuffer(gl.FRAMEBUFFER, null);
        if (status != gl.FRAMEBUFFER_COMPLETE)
            throw FboIncompleteException(status, __FILE__, __LINE__);
    };

    deUint32 Framebuffer::createTex2D (deUint32 name, GLenum format, int width, int height)
    {
        if (name == 0)
            this.m_context.genTextures(1, &name);

        this.m_context.bindTexture(gl.TEXTURE_2D, name);
        this.m_context.texImage2D(gl.TEXTURE_2D, 0, format, width, height);

        if (!deIsPowerOfTwo32(width) || !deIsPowerOfTwo32(height))
        {
            // Set wrap mode to clamp for NPOT FBOs
            this.m_context.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            this.m_context.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }

        this.m_context.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        this.m_context.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        return name;
    }

    deUint32 Framebuffer::createRbo (deUint32 name, GLenum format, int width, int height)
    {
        if (name == 0)
            this.m_context.genRenderbuffers(1, &name);

        this.m_context.bindRenderbuffer(gl.RENDERBUFFER, name);
        this.m_context.renderbufferStorage(gl.RENDERBUFFER, format, width, height);

        return name;
    }

    void Framebuffer::destroyBuffer (deUint32 name, GLenum type)
    {
        if (type == gl.TEXTURE_2D || type == gl.TEXTURE_CUBE_MAP)
            this.m_context.deleteTextures(1, &name);
        else if (type == gl.RENDERBUFFER)
            this.m_context.deleteRenderbuffers(1, &name);
        else
            DE_ASSERT(type == gl.NONE);
    }

    static void createMetaballsTex2D (sglr::Context& context, deUint32 name, GLenum format, GLenum dataType, int width, int height)
    {
        tcu::TextureFormat    texFormat    = glu::mapGLTransferFormat(format, dataType);
        tcu::TextureLevel    level        (texFormat, width, height);

        tcu::fillWithMetaballs(level.getAccess(), 5, name ^ width ^ height);

        context.bindTexture(gl.TEXTURE_2D, name);
        context.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, dataType, level.getAccess().getDataPtr());
        context.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    static void createQuadsTex2D (sglr::Context& context, deUint32 name, GLenum format, GLenum dataType, int width, int height)
    {
        tcu::TextureFormat    texFormat    = glu::mapGLTransferFormat(format, dataType);
        tcu::TextureLevel    level        (texFormat, width, height);

        tcu::fillWithRGBAQuads(level.getAccess());

        context.bindTexture(gl.TEXTURE_2D, name);
        context.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, dataType, level.getAccess().getDataPtr());
        context.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    class FboRenderCase : public TestCase
    {
    public:
                                    FboRenderCase            (Context& context, const char* name, const char* description, const FboConfig& config);
        virtual                        ~FboRenderCase            (void) {}

        virtual IterateResult        iterate                    (void);
        virtual void                render                    (sglr::Context& fboContext, Surface& dst) = DE_NULL;

        bool                        compare                    (const tcu::Surface& reference, const tcu::Surface& result);

    protected:
        const FboConfig                this.m_config;
    };

    FboRenderCase::FboRenderCase (Context& context, const char* name, const char* description, const FboConfig& config)
        : TestCase    (context, name, description)
        , this.m_config    (config)
    {
    }

    TestCase::IterateResult FboRenderCase::iterate (void)
    {
        tcu::Vec4                    clearColor                = tcu::Vec4(0.125f, 0.25f, 0.5f, 1.0f);
        glu::RenderContext&            renderCtx                = this.m_context.getRenderContext();
        const tcu::RenderTarget&    renderTarget            = renderCtx.getRenderTarget();
        tcu::TestLog&                log                        = this.m_testCtx.getLog();
        const char*                    failReason                = DE_NULL;

        // Position & size for context
        deRandom rnd;
        deRandothis.m_init(&rnd, deStringHash(getName()));

        int        width    = deMin32(renderTarget.getWidth(), 128);
        int        height    = deMin32(renderTarget.getHeight(), 128);
        int        xMax    = renderTarget.getWidth()-width+1;
        int        yMax    = renderTarget.getHeight()-height+1;
        int        x        = deRandothis.m_getUint32(&rnd) % xMax;
        int        y        = deRandothis.m_getUint32(&rnd) % yMax;

        tcu::Surface    gles3Frame    (width, height);
        tcu::Surface    refFrame    (width, height);
        GLenum            gles3Error;
        GLenum            refError;

        // Render using GLES3
        try
        {
            sglr::GLContext context(renderCtx, log, sglr::GLCONTEXT_LOG_CALLS, tcu::IVec4(x, y, width, height));

            context.clearColor(clearColor.x(), clearColor.y(), clearColor.z(), clearColor.w());
            context.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);

            render(context, gles3Frame); // Call actual render func
            gles3Error = context.getError();
        }
        catch (const FboIncompleteException& e)
        {
            if (e.getReason() == gl.FRAMEBUFFER_UNSUPPORTED)
            {
                // Mark test case as unsupported
                log << e;
                this.m_testCtx.setTestResult(QP_TEST_RESULT_NOT_SUPPORTED, "Not supported");
                return STOP;
            }
            else
                throw; // Propagate error
        }

        // Render reference image
        {
            sglr::ReferenceContextBuffers    buffers    (tcu::PixelFormat(8,8,8,renderTarget.getPixelFormat().alphaBits?8:0), renderTarget.getDepthBits(), renderTarget.getStencilBits(), width, height);
            sglr::ReferenceContext            context    (sglr::ReferenceContextLimits(renderCtx), buffers.getColorbuffer(), buffers.getDepthbuffer(), buffers.getStencilbuffer());

            context.clearColor(clearColor.x(), clearColor.y(), clearColor.z(), clearColor.w());
            context.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);

            render(context, refFrame);
            refError = context.getError();
        }

        // Compare error codes
        bool errorCodesOk = (gles3Error == refError);

        if (!errorCodesOk)
        {
            log << tcu::TestLog::Message << "Error code mismatch: got " << glu::getErrorStr(gles3Error) << ", expected " << glu::getErrorStr(refError) << tcu::TestLog::EndMessage;
            failReason = "Got unexpected error";
        }

        // Compare images
        bool imagesOk = compare(refFrame, gles3Frame);

        if (!imagesOk && !failReason)
            failReason = "Image comparison failed";

        // Store test result
        bool isOk = errorCodesOk && imagesOk;
        this.m_testCtx.setTestResult(isOk ? QP_TEST_RESULT_PASS    : QP_TEST_RESULT_FAIL,
                                isOk ? "Pass"                : failReason);

        return STOP;
    }

    bool FboRenderCase::compare (const tcu::Surface& reference, const tcu::Surface& result)
    {
        const tcu::RGBA threshold (tcu::max(getFormatThreshold(this.m_config.colorFormat), tcu::RGBA(12, 12, 12, 12)));

        return tcu::bilinearCompare(this.m_testCtx.getLog(), "ComparisonResult", "Image comparison result", reference.getAccess(), result.getAccess(), threshold, tcu::COMPARE_LOG_RESULT);
    }

    namespace FboCases
    {

    class StencilClearsTest : public FboRenderCase
    {
    public:
                            StencilClearsTest        (Context& context, const FboConfig& config);
        virtual                ~StencilClearsTest        (void) {};

        void                render                    (sglr::Context& context, Surface& dst);
    };

    StencilClearsTest::StencilClearsTest (Context& context, const FboConfig& config)
        : FboRenderCase    (context, config.getName().c_str(), "Stencil clears", config)
    {
    }

    void StencilClearsTest::render (sglr::Context& context, Surface& dst)
    {
        tcu::TextureFormat        colorFormat            = glu::mapGLInternalFormat(this.m_config.colorFormat);
        glu::DataType            fboSamplerType        = glu::getSampler2DType(colorFormat);
        glu::DataType            fboOutputType        = getFragmentOutputType(colorFormat);
        tcu::TextureFormatInfo    fboRangeInfo        = tcu::getTextureFormatInfo(colorFormat);
        Vec4                    fboOutScale            = fboRangeInfo.valueMax - fboRangeInfo.valueMin;
        Vec4                    fboOutBias            = fboRangeInfo.valueMin;

        Texture2DShader            texToFboShader        (DataTypes() << glu::TYPE_SAMPLER_2D, fboOutputType);
        Texture2DShader            texFromFboShader    (DataTypes() << fboSamplerType, glu::TYPE_FLOAT_VEC4);

        deUint32                texToFboShaderID    = context.createProgram(&texToFboShader);
        deUint32                texFromFboShaderID    = context.createProgram(&texFromFboShader);

        deUint32                metaballsTex        = 1;
        deUint32                quadsTex            = 2;
        int                        width                = 128;
        int                        height                = 128;

        texToFboShader.setOutScaleBias(fboOutScale, fboOutBias);
        texFromFboShader.setTexScaleBias(0, fboRangeInfo.lookupScale, fboRangeInfo.lookupBias);

        createQuadsTex2D(context, quadsTex, gl.RGBA, gl.UNSIGNED_BYTE, width, height);
        createMetaballsTex2D(context, metaballsTex, gl.RGBA, gl.UNSIGNED_BYTE, width, height);

        Framebuffer fbo(context, this.m_config, width, height);
        fbo.checkCompleteness();

        // Bind framebuffer and clear
        context.bindFramebuffer(gl.FRAMEBUFFER, fbo.getFramebuffer());
        context.viewport(0, 0, width, height);
        context.clearColor(0.0f, 0.0f, 0.0f, 1.0f);
        context.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);

        // Do stencil clears
        context.enable(gl.SCISSOR_TEST);
        context.scissor(10, 16, 32, 120);
        context.clearStencil(1);
        context.clear(gl.STENCIL_BUFFER_BIT);
        context.scissor(16, 32, 100, 64);
        context.clearStencil(2);
        context.clear(gl.STENCIL_BUFFER_BIT);
        context.disable(gl.SCISSOR_TEST);

        // Draw 2 textures with stecil tests
        context.enable(gl.STENCIL_TEST);

        context.bindTexture(gl.TEXTURE_2D, quadsTex);
        context.stencilFunc(gl.EQUAL, 1, 0xffu);

        texToFboShader.setUniforms(context, texToFboShaderID);
        sglr::drawQuad(context, texToFboShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(+1.0f, +1.0f, 0.0f));

        context.bindTexture(gl.TEXTURE_2D, metaballsTex);
        context.stencilFunc(gl.EQUAL, 2, 0xffu);

        texToFboShader.setUniforms(context, texToFboShaderID);
        sglr::drawQuad(context, texToFboShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(+1.0f, +1.0f, 0.0f));

        context.disable(gl.STENCIL_TEST);

        if (fbo.getConfig().colorType == gl.TEXTURE_2D)
        {
            context.bindFramebuffer(gl.FRAMEBUFFER, 0);
            context.bindTexture(gl.TEXTURE_2D, fbo.getColorBuffer());
            context.viewport(0, 0, context.getWidth(), context.getHeight());

            texFromFboShader.setUniforms(context, texFromFboShaderID);
            sglr::drawQuad(context, texFromFboShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));

            context.readPixels(dst, 0, 0, context.getWidth(), context.getHeight());
        }
        else
            readPixels(context, dst, 0, 0, width, height, colorFormat, fboRangeInfo.lookupScale, fboRangeInfo.lookupBias);
    }

    class SharedColorbufferTest : public FboRenderCase
    {
    public:
                            SharedColorbufferTest            (Context& context, const FboConfig& config);
        virtual                ~SharedColorbufferTest            (void) {};

        void                render                            (sglr::Context& context, Surface& dst);
    };

    SharedColorbufferTest::SharedColorbufferTest (Context& context, const FboConfig& config)
        : FboRenderCase    (context, config.getName().c_str(), "Shared colorbuffer", config)
    {
    }

    void SharedColorbufferTest::render (sglr::Context& context, Surface& dst)
    {
        Texture2DShader            texShader        (DataTypes() << glu::TYPE_SAMPLER_2D, glu::TYPE_FLOAT_VEC4);
        FlatColorShader            flatShader        (glu::TYPE_FLOAT_VEC4);
        deUint32                texShaderID        = context.createProgram(&texShader);
        deUint32                flatShaderID    = context.createProgram(&flatShader);

        int                        width            = 128;
        int                        height            = 128;
        deUint32                quadsTex        = 1;
        deUint32                metaballsTex    = 2;
        bool                    stencil            = (this.m_config.buffers & gl.STENCIL_BUFFER_BIT) != 0;

        context.disable(gl.DITHER);

        // Textures
        createQuadsTex2D(context, quadsTex, gl.RGB, gl.UNSIGNED_BYTE, 64, 64);
        createMetaballsTex2D(context, metaballsTex, gl.RGBA, gl.UNSIGNED_BYTE, 64, 64);

        context.viewport(0, 0, width, height);

        // Fbo A
        Framebuffer fboA(context, this.m_config, width, height);
        fboA.checkCompleteness();

        // Fbo B - don't create colorbuffer
        FboConfig cfg = this.m_config;
        cfg.buffers        &= ~gl.COLOR_BUFFER_BIT;
        cfg.colorType     = gl.NONE;
        cfg.colorFormat     = gl.NONE;
        Framebuffer fboB(context, cfg, width, height);

        // Attach color buffer from fbo A
        context.bindFramebuffer(gl.FRAMEBUFFER, fboB.getFramebuffer());
        switch (this.m_config.colorType)
        {
            case gl.TEXTURE_2D:
                context.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboA.getColorBuffer(), 0);
                break;

            case gl.RENDERBUFFER:
                context.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, fboA.getColorBuffer());
                break;

            default:
                DE_ASSERT(DE_FALSE);
        }

        // Clear depth and stencil in fbo B
        context.clear(gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);

        // Render quads to fbo 1, with depth 0.0
        context.bindFramebuffer(gl.FRAMEBUFFER, fboA.getFramebuffer());
        context.bindTexture(gl.TEXTURE_2D, quadsTex);
        context.clearColor(0.0f, 0.0f, 0.0f, 1.0f);
        context.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);

        if (stencil)
        {
            // Stencil to 1 in fbo A
            context.clearStencil(1);
            context.clear(gl.STENCIL_BUFFER_BIT);
        }

        texShader.setUniforms(context, texShaderID);

        context.enable(gl.DEPTH_TEST);
        sglr::drawQuad(context, texShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));
        context.disable(gl.DEPTH_TEST);

        // Blend metaballs to fbo 2
        context.bindFramebuffer(gl.FRAMEBUFFER, fboB.getFramebuffer());
        context.bindTexture(gl.TEXTURE_2D, metaballsTex);
        context.enable(gl.BLEND);
        context.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
        sglr::drawQuad(context, texShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));

        // Render small quad that is only visible if depth buffer is not shared with fbo A - or there is no depth bits
        context.bindTexture(gl.TEXTURE_2D, quadsTex);
        context.enable(gl.DEPTH_TEST);
        sglr::drawQuad(context, texShaderID, Vec3(0.5f, 0.5f, 0.5f), Vec3(1.0f, 1.0f, 0.5f));
        context.disable(gl.DEPTH_TEST);

        if (stencil)
        {
            flatShader.setColor(context, flatShaderID, Vec4(0.0f, 1.0f, 0.0f, 1.0f));

            // Clear subset of stencil buffer to 1
            context.enable(gl.SCISSOR_TEST);
            context.scissor(10, 10, 12, 25);
            context.clearStencil(1);
            context.clear(gl.STENCIL_BUFFER_BIT);
            context.disable(gl.SCISSOR_TEST);

            // Render quad with stencil mask == 1
            context.enable(gl.STENCIL_TEST);
            context.stencilFunc(gl.EQUAL, 1, 0xffu);
            sglr::drawQuad(context, flatShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));
            context.disable(gl.STENCIL_TEST);
        }

        // Get results
        if (fboA.getConfig().colorType == gl.TEXTURE_2D)
        {
            texShader.setUniforms(context, texShaderID);

            context.bindFramebuffer(gl.FRAMEBUFFER, 0);
            context.bindTexture(gl.TEXTURE_2D, fboA.getColorBuffer());
            context.viewport(0, 0, context.getWidth(), context.getHeight());
            sglr::drawQuad(context, texShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));
            context.readPixels(dst, 0, 0, context.getWidth(), context.getHeight());
        }
        else
            readPixels(context, dst, 0, 0, width, height, glu::mapGLInternalFormat(fboA.getConfig().colorFormat), Vec4(1.0f), Vec4(0.0f));
    }

    class SharedColorbufferClearsTest : public FboRenderCase
    {
    public:
                        SharedColorbufferClearsTest        (Context& context, const FboConfig& config);
        virtual            ~SharedColorbufferClearsTest    (void) {}

        void            render                            (sglr::Context& context, Surface& dst);
    };

    SharedColorbufferClearsTest::SharedColorbufferClearsTest (Context& context, const FboConfig& config)
        : FboRenderCase    (context, config.getName().c_str(), "Shared colorbuffer clears", config)
    {
    }

    void SharedColorbufferClearsTest::render (sglr::Context& context, Surface& dst)
    {
        tcu::TextureFormat        colorFormat        = glu::mapGLInternalFormat(this.m_config.colorFormat);
        glu::DataType            fboSamplerType    = glu::getSampler2DType(colorFormat);
        int                        width            = 128;
        int                        height            = 128;
        deUint32                colorbuffer        = 1;

        // Check for format support.
        checkColorFormatSupport(context, this.m_config.colorFormat);

        // Single colorbuffer
        if (this.m_config.colorType == gl.TEXTURE_2D)
        {
            context.bindTexture(gl.TEXTURE_2D, colorbuffer);
            context.texImage2D(gl.TEXTURE_2D, 0, this.m_config.colorFormat, width, height);
            context.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            context.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
        else
        {
            DE_ASSERT(this.m_config.colorType == gl.RENDERBUFFER);
            context.bindRenderbuffer(gl.RENDERBUFFER, colorbuffer);
            context.renderbufferStorage(gl.RENDERBUFFER, this.m_config.colorFormat, width, height);
        }

        // Multiple framebuffers sharing the colorbuffer
        for (int fbo = 1; fbo <= 3; fbo++)
        {
            context.bindFramebuffer(gl.FRAMEBUFFER, fbo);

            if (this.m_config.colorType == gl.TEXTURE_2D)
                context.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorbuffer, 0);
            else
                context.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colorbuffer);
        }

        context.bindFramebuffer(gl.FRAMEBUFFER, 1);

        // Check completeness
        {
            GLenum status = context.checkFramebufferStatus(gl.FRAMEBUFFER);
            if (status != gl.FRAMEBUFFER_COMPLETE)
                throw FboIncompleteException(status, __FILE__, __LINE__);
        }

        // Render to them
        context.viewport(0, 0, width, height);
        context.clearColor(0.0f, 0.0f, 1.0f, 1.0f);
        context.clear(gl.COLOR_BUFFER_BIT);

        context.enable(gl.SCISSOR_TEST);

        context.bindFramebuffer(gl.FRAMEBUFFER, 2);
        context.clearColor(0.6f, 0.0f, 0.0f, 1.0f);
        context.scissor(10, 10, 64, 64);
        context.clear(gl.COLOR_BUFFER_BIT);
        context.clearColor(0.0f, 0.6f, 0.0f, 1.0f);
        context.scissor(60, 60, 40, 20);
        context.clear(gl.COLOR_BUFFER_BIT);

        context.bindFramebuffer(gl.FRAMEBUFFER, 3);
        context.clearColor(0.0f, 0.0f, 0.6f, 1.0f);
        context.scissor(20, 20, 100, 10);
        context.clear(gl.COLOR_BUFFER_BIT);

        context.bindFramebuffer(gl.FRAMEBUFFER, 1);
        context.clearColor(0.6f, 0.0f, 0.6f, 1.0f);
        context.scissor(20, 20, 5, 100);
        context.clear(gl.COLOR_BUFFER_BIT);

        context.disable(gl.SCISSOR_TEST);

        if (this.m_config.colorType == gl.TEXTURE_2D)
        {
            Texture2DShader shader(DataTypes() << fboSamplerType, glu::TYPE_FLOAT_VEC4);
            deUint32 shaderID = context.createProgram(&shader);

            shader.setUniforms(context, shaderID);

            context.bindFramebuffer(gl.FRAMEBUFFER, 0);
            context.viewport(0, 0, context.getWidth(), context.getHeight());
            sglr::drawQuad(context, shaderID, Vec3(-0.9f, -0.9f, 0.0f), Vec3(0.9f, 0.9f, 0.0f));
            context.readPixels(dst, 0, 0, context.getWidth(), context.getHeight());
        }
        else
            readPixels(context, dst, 0, 0, width, height, colorFormat, Vec4(1.0f), Vec4(0.0f));
    }

    class SharedDepthStencilTest : public FboRenderCase
    {
    public:
                        SharedDepthStencilTest        (Context& context, const FboConfig& config);
        virtual            ~SharedDepthStencilTest        (void) {};

        static bool        isConfigSupported            (const FboConfig& config);
        void            render                        (sglr::Context& context, Surface& dst);
    };

    SharedDepthStencilTest::SharedDepthStencilTest (Context& context, const FboConfig& config)
        : FboRenderCase    (context, config.getName().c_str(), "Shared depth/stencilbuffer", config)
    {
    }

    bool SharedDepthStencilTest::isConfigSupported (const FboConfig& config)
    {
        return (config.buffers & (gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT)) != 0;
    }

    void SharedDepthStencilTest::render (sglr::Context& context, Surface& dst)
    {
        Texture2DShader    texShader        (DataTypes() << glu::TYPE_SAMPLER_2D, glu::TYPE_FLOAT_VEC4);
        FlatColorShader    flatShader        (glu::TYPE_FLOAT_VEC4);
        deUint32        texShaderID        = context.createProgram(&texShader);
        deUint32        flatShaderID    = context.createProgram(&flatShader);
        int                width            = 128;
        int                height            = 128;
    //    bool            depth            = (this.m_config.buffers & gl.DEPTH_BUFFER_BIT) != 0;
        bool            stencil            = (this.m_config.buffers & gl.STENCIL_BUFFER_BIT) != 0;

        // Textures
        deUint32 metaballsTex    = 5;
        deUint32 quadsTex        = 6;
        createMetaballsTex2D(context, metaballsTex, gl.RGB, gl.UNSIGNED_BYTE, 64, 64);
        createQuadsTex2D(context, quadsTex, gl.RGB, gl.UNSIGNED_BYTE, 64, 64);

        context.viewport(0, 0, width, height);

        // Fbo A
        Framebuffer fboA(context, this.m_config, width, height);
        fboA.checkCompleteness();

        // Fbo B
        FboConfig cfg = this.m_config;
        cfg.buffers                &= ~(gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);
        cfg.depthStencilType     = gl.NONE;
        cfg.depthStencilFormat     = gl.NONE;
        Framebuffer fboB(context, cfg, width, height);

        // Bind depth/stencil buffers from fbo A to fbo B
        context.bindFramebuffer(gl.FRAMEBUFFER, fboB.getFramebuffer());
        for (int ndx = 0; ndx < 2; ndx++)
        {
            deUint32    bit        = ndx ? gl.STENCIL_BUFFER_BIT : gl.DEPTH_BUFFER_BIT;
            deUint32    point    = ndx ? gl.STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;

            if ((this.m_config.buffers & bit) == 0)
                continue;

            switch (this.m_config.depthStencilType)
            {
                case gl.TEXTURE_2D:        context.framebufferTexture2D(gl.FRAMEBUFFER, point, gl.TEXTURE_2D, fboA.getDepthStencilBuffer(), 0);    break;
                case gl.RENDERBUFFER:    context.framebufferRenderbuffer(gl.FRAMEBUFFER, point, gl.RENDERBUFFER, fboA.getDepthStencilBuffer());    break;
                default:
                    TCU_FAIL("Not implemented");
            }
        }

        // Setup uniforms
        texShader.setUniforms(context, texShaderID);

        // Clear color to red and stencil to 1 in fbo B.
        context.clearColor(1.0f, 0.0f, 0.0f, 1.0f);
        context.clearStencil(1);
        context.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);

        context.enable(gl.DEPTH_TEST);

        // Render quad to fbo A
        context.bindFramebuffer(gl.FRAMEBUFFER, fboA.getFramebuffer());
        context.bindTexture(gl.TEXTURE_2D, quadsTex);
        sglr::drawQuad(context, texShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));

        if (stencil)
        {
            // Clear subset of stencil buffer to 0 in fbo A
            context.enable(gl.SCISSOR_TEST);
            context.scissor(10, 10, 12, 25);
            context.clearStencil(0);
            context.clear(gl.STENCIL_BUFFER_BIT);
            context.disable(gl.SCISSOR_TEST);
        }

        // Render metaballs to fbo B
        context.bindFramebuffer(gl.FRAMEBUFFER, fboB.getFramebuffer());
        context.bindTexture(gl.TEXTURE_2D, metaballsTex);
        sglr::drawQuad(context, texShaderID, Vec3(-1.0f, -1.0f, -1.0f), Vec3(1.0f, 1.0f, 1.0f));

        context.disable(gl.DEPTH_TEST);

        if (stencil)
        {
            // Render quad with stencil mask == 0
            context.enable(gl.STENCIL_TEST);
            context.stencilFunc(gl.EQUAL, 0, 0xffu);
            context.useProgram(flatShaderID);
            flatShader.setColor(context, flatShaderID, Vec4(0.0f, 1.0f, 0.0f, 1.0f));
            sglr::drawQuad(context, flatShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(+1.0f, +1.0f, 0.0f));
            context.disable(gl.STENCIL_TEST);
        }

        if (this.m_config.colorType == gl.TEXTURE_2D)
        {
            // Render both to screen
            context.bindFramebuffer(gl.FRAMEBUFFER, 0);
            context.viewport(0, 0, context.getWidth(), context.getHeight());
            context.bindTexture(gl.TEXTURE_2D, fboA.getColorBuffer());
            sglr::drawQuad(context, texShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(0.0f, 1.0f, 0.0f));
            context.bindTexture(gl.TEXTURE_2D, fboB.getColorBuffer());
            sglr::drawQuad(context, texShaderID, Vec3(0.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));

            context.readPixels(dst, 0, 0, context.getWidth(), context.getHeight());
        }
        else
        {
            // Read results from fbo B
            readPixels(context, dst, 0, 0, width, height, glu::mapGLInternalFormat(this.m_config.colorFormat), Vec4(1.0f), Vec4(0.0f));
        }
    }

    #if 0
    class TexSubImageAfterRenderTest : public FboRenderCase
    {
    public:
                        TexSubImageAfterRenderTest        (Context& context, const FboConfig& config);
        virtual            ~TexSubImageAfterRenderTest        (void) {}

        void            render                            (sglr::Context& context, Surface& dst);
    };

    TexSubImageAfterRenderTest::TexSubImageAfterRenderTest (Context& context, const FboConfig& config)
        : FboRenderCase(context, (string("after_render_") + config.getName()).c_str(), "TexSubImage after rendering to texture", config)
    {
    }

    void TexSubImageAfterRenderTest::render (sglr::Context& context, Surface& dst)
    {
        using sglr::TexturedQuadOp;

        bool isRGBA = true;

        Surface fourQuads(Surface::PIXELFORMAT_RGB, 64, 64);
        tcu::SurfaceUtil::fillWithFourQuads(fourQuads);

        Surface metaballs(isRGBA ? Surface::PIXELFORMAT_RGBA : Surface::PIXELFORMAT_RGB, 64, 64);
        tcu::SurfaceUtil::fillWithMetaballs(metaballs, 5, 3);

        deUint32 fourQuadsTex = 1;
        context.bindTexture(gl.TEXTURE_2D, fourQuadsTex);
        context.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        context.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, fourQuads);

        context.bindFramebuffer(gl.FRAMEBUFFER, 1);

        deUint32 fboTex = 2;
        context.bindTexture(gl.TEXTURE_2D, fboTex);
        context.texImage2D(gl.TEXTURE_2D, 0, isRGBA ? gl.RGBA : gl.RGB, 128, 128);
        context.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        context.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0);

        // Render to fbo
        context.viewport(0, 0, 128, 128);
        context.bindTexture(gl.TEXTURE_2D, fourQuadsTex);
        context.draw(TexturedQuadOp(-1.0f, -1.0f, 1.0f, 1.0f, 0));

        // Update texture using TexSubImage2D
        context.bindTexture(gl.TEXTURE_2D, fboTex);
        context.texSubImage2D(gl.TEXTURE_2D, 0, 32, 32, metaballs);

        // Draw to screen
        context.bindFramebuffer(gl.FRAMEBUFFER, 0);
        context.viewport(0, 0, context.getWidth(), context.getHeight());
        context.draw(TexturedQuadOp(-1.0f, -1.0f, 1.0f, 1.0f, 0));
        context.readPixels(dst, 0, 0, context.getWidth(), context.getHeight());
    }

    class TexSubImageBetweenRenderTest : public FboRenderCase
    {
    public:
                        TexSubImageBetweenRenderTest        (Context& context, const FboConfig& config);
        virtual            ~TexSubImageBetweenRenderTest        (void) {}

        void            render                                (sglr::Context& context, Surface& dst);
    };

    TexSubImageBetweenRenderTest::TexSubImageBetweenRenderTest (Context& context, const FboConfig& config)
        : FboRenderCase(context, (string("between_render_") + config.getName()).c_str(), "TexSubImage between rendering calls", config)
    {
    }

    void TexSubImageBetweenRenderTest::render (sglr::Context& context, Surface& dst)
    {
        using sglr::TexturedQuadOp;
        using sglr::BlendTextureOp;

        bool isRGBA = true;

        Surface fourQuads(Surface::PIXELFORMAT_RGB, 64, 64);
        tcu::SurfaceUtil::fillWithFourQuads(fourQuads);

        Surface metaballs(isRGBA ? Surface::PIXELFORMAT_RGBA : Surface::PIXELFORMAT_RGB, 64, 64);
        tcu::SurfaceUtil::fillWithMetaballs(metaballs, 5, 3);

        Surface metaballs2(Surface::PIXELFORMAT_RGBA, 64, 64);
        tcu::SurfaceUtil::fillWithMetaballs(metaballs2, 5, 4);

        deUint32 metaballsTex = 3;
        context.bindTexture(gl.TEXTURE_2D, metaballsTex);
        context.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        context.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, metaballs2);

        deUint32 fourQuadsTex = 1;
        context.bindTexture(gl.TEXTURE_2D, fourQuadsTex);
        context.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        context.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, fourQuads);

        context.bindFramebuffer(gl.FRAMEBUFFER, 1);

        deUint32 fboTex = 2;
        context.bindTexture(gl.TEXTURE_2D, fboTex);
        context.texImage2D(gl.TEXTURE_2D, 0, isRGBA ? gl.RGBA : gl.RGB, 128, 128);
        context.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        context.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0);

        // Render to fbo
        context.viewport(0, 0, 128, 128);
        context.bindTexture(gl.TEXTURE_2D, fourQuadsTex);
        context.draw(TexturedQuadOp(-1.0f, -1.0f, 1.0f, 1.0f, 0));

        // Update texture using TexSubImage2D
        context.bindTexture(gl.TEXTURE_2D, fboTex);
        context.texSubImage2D(gl.TEXTURE_2D, 0, 32, 32, metaballs);

        // Render again to fbo
        context.bindTexture(gl.TEXTURE_2D, metaballsTex);
        context.draw(BlendTextureOp(0));

        // Draw to screen
        context.bindFramebuffer(gl.FRAMEBUFFER, 0);
        context.viewport(0, 0, context.getWidth(), context.getHeight());
        context.bindTexture(gl.TEXTURE_2D, fboTex);
        context.draw(TexturedQuadOp(-1.0f, -1.0f, 1.0f, 1.0f, 0));

        context.readPixels(dst, 0, 0, context.getWidth(), context.getHeight());
    }
    #endif

    class ResizeTest : public FboRenderCase
    {
    public:
                        ResizeTest                (Context& context, const FboConfig& config);
        virtual            ~ResizeTest                (void) {}

        void            render                    (sglr::Context& context, Surface& dst);
    };

    ResizeTest::ResizeTest (Context& context, const FboConfig& config)
        : FboRenderCase    (context, config.getName().c_str(), "Resize framebuffer", config)
    {
    }

    void ResizeTest::render (sglr::Context& context, Surface& dst)
    {
        tcu::TextureFormat        colorFormat            = glu::mapGLInternalFormat(this.m_config.colorFormat);
        glu::DataType            fboSamplerType        = glu::getSampler2DType(colorFormat);
        glu::DataType            fboOutputType        = getFragmentOutputType(colorFormat);
        tcu::TextureFormatInfo    fboRangeInfo        = tcu::getTextureFormatInfo(colorFormat);
        Vec4                    fboOutScale            = fboRangeInfo.valueMax - fboRangeInfo.valueMin;
        Vec4                    fboOutBias            = fboRangeInfo.valueMin;

        Texture2DShader            texToFboShader        (DataTypes() << glu::TYPE_SAMPLER_2D, fboOutputType);
        Texture2DShader            texFromFboShader    (DataTypes() << fboSamplerType, glu::TYPE_FLOAT_VEC4);
        FlatColorShader            flatShader            (fboOutputType);
        deUint32                texToFboShaderID    = context.createProgram(&texToFboShader);
        deUint32                texFromFboShaderID    = context.createProgram(&texFromFboShader);
        deUint32                flatShaderID        = context.createProgram(&flatShader);

        deUint32                quadsTex            = 1;
        deUint32                metaballsTex        = 2;
        bool                    depth                = (this.m_config.buffers & gl.DEPTH_BUFFER_BIT)        != 0;
        bool                    stencil                = (this.m_config.buffers & gl.STENCIL_BUFFER_BIT)    != 0;
        int                        initialWidth        = 128;
        int                        initialHeight        = 128;
        int                        newWidth            = 64;
        int                        newHeight            = 32;

        texToFboShader.setOutScaleBias(fboOutScale, fboOutBias);
        texFromFboShader.setTexScaleBias(0, fboRangeInfo.lookupScale, fboRangeInfo.lookupBias);

        createQuadsTex2D(context, quadsTex, gl.RGB, gl.UNSIGNED_BYTE, 64, 64);
        createMetaballsTex2D(context, metaballsTex, gl.RGB, gl.UNSIGNED_BYTE, 32, 32);

        Framebuffer fbo(context, this.m_config, initialWidth, initialHeight);
        fbo.checkCompleteness();

        // Setup shaders
        texToFboShader.setUniforms    (context, texToFboShaderID);
        texFromFboShader.setUniforms(context, texFromFboShaderID);
        flatShader.setColor            (context, flatShaderID, Vec4(0.0f, 1.0f, 0.0f, 1.0f) * fboOutScale + fboOutBias);

        // Render quads
        context.bindFramebuffer(gl.FRAMEBUFFER, fbo.getFramebuffer());
        context.viewport(0, 0, initialWidth, initialHeight);
        clearColorBuffer(context, colorFormat, tcu::Vec4(0.0f, 0.0f, 0.0f, 1.0f));
        context.clear(gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);
        context.bindTexture(gl.TEXTURE_2D, quadsTex);
        sglr::drawQuad(context, texToFboShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));

        if (fbo.getConfig().colorType == gl.TEXTURE_2D)
        {
            // Render fbo to screen
            context.bindFramebuffer(gl.FRAMEBUFFER, 0);
            context.viewport(0, 0, context.getWidth(), context.getHeight());
            context.bindTexture(gl.TEXTURE_2D, fbo.getColorBuffer());
            sglr::drawQuad(context, texFromFboShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));

            // Restore binding
            context.bindFramebuffer(gl.FRAMEBUFFER, fbo.getFramebuffer());
        }

        // Resize buffers
        switch (fbo.getConfig().colorType)
        {
            case gl.TEXTURE_2D:
                context.bindTexture(gl.TEXTURE_2D, fbo.getColorBuffer());
                context.texImage2D(gl.TEXTURE_2D, 0, fbo.getConfig().colorFormat, newWidth, newHeight);
                break;

            case gl.RENDERBUFFER:
                context.bindRenderbuffer(gl.RENDERBUFFER, fbo.getColorBuffer());
                context.renderbufferStorage(gl.RENDERBUFFER, fbo.getConfig().colorFormat, newWidth, newHeight);
                break;

            default:
                DE_ASSERT(DE_FALSE);
        }

        if (depth || stencil)
        {
            switch (fbo.getConfig().depthStencilType)
            {
                case gl.TEXTURE_2D:
                    context.bindTexture(gl.TEXTURE_2D, fbo.getDepthStencilBuffer());
                    context.texImage2D(gl.TEXTURE_2D, 0, fbo.getConfig().depthStencilFormat, newWidth, newHeight);
                    break;

                case gl.RENDERBUFFER:
                    context.bindRenderbuffer(gl.RENDERBUFFER, fbo.getDepthStencilBuffer());
                    context.renderbufferStorage(gl.RENDERBUFFER, fbo.getConfig().depthStencilFormat, newWidth, newHeight);
                    break;

                default:
                    DE_ASSERT(false);
            }
        }

        // Render to resized fbo
        context.viewport(0, 0, newWidth, newHeight);
        clearColorBuffer(context, colorFormat, tcu::Vec4(1.0f, 0.0f, 0.0f, 1.0f));
        context.clear(gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);

        context.enable(gl.DEPTH_TEST);

        context.bindTexture(gl.TEXTURE_2D, metaballsTex);
        sglr::drawQuad(context, texToFboShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(+1.0f, +1.0f, 0.0f));

        context.bindTexture(gl.TEXTURE_2D, quadsTex);
        sglr::drawQuad(context, texToFboShaderID, Vec3(0.0f, 0.0f, -1.0f), Vec3(+1.0f, +1.0f, 1.0f));

        context.disable(gl.DEPTH_TEST);

        if (stencil)
        {
            context.enable(gl.SCISSOR_TEST);
            context.clearStencil(1);
            context.scissor(10, 10, 5, 15);
            context.clear(gl.STENCIL_BUFFER_BIT);
            context.disable(gl.SCISSOR_TEST);

            context.enable(gl.STENCIL_TEST);
            context.stencilFunc(gl.EQUAL, 1, 0xffu);
            sglr::drawQuad(context, flatShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(+1.0f, +1.0f, 0.0f));
            context.disable(gl.STENCIL_TEST);
        }

        if (this.m_config.colorType == gl.TEXTURE_2D)
        {
            context.bindFramebuffer(gl.FRAMEBUFFER, 0);
            context.viewport(0, 0, context.getWidth(), context.getHeight());
            context.bindTexture(gl.TEXTURE_2D, fbo.getColorBuffer());
            sglr::drawQuad(context, texFromFboShaderID, Vec3(-0.5f, -0.5f, 0.0f), Vec3(0.5f, 0.5f, 0.0f));
            context.readPixels(dst, 0, 0, context.getWidth(), context.getHeight());
        }
        else
            readPixels(context, dst, 0, 0, newWidth, newHeight, colorFormat, fboRangeInfo.lookupScale, fboRangeInfo.lookupBias);
    }

    class RecreateBuffersTest : public FboRenderCase
    {
    public:
                        RecreateBuffersTest            (Context& context, const FboConfig& config, deUint32 buffers, bool rebind);
        virtual            ~RecreateBuffersTest        (void) {}

        void            render                        (sglr::Context& context, Surface& dst);

    private:
        deUint32        this.m_buffers;
        bool            this.m_rebind;
    };

    RecreateBuffersTest::RecreateBuffersTest (Context& context, const FboConfig& config, deUint32 buffers, bool rebind)
        : FboRenderCase        (context, (string(config.getName()) + (rebind ? "" : "_no_rebind")).c_str(), "Recreate buffers", config)
        , this.m_buffers            (buffers)
        , this.m_rebind            (rebind)
    {
    }

    void RecreateBuffersTest::render (sglr::Context& ctx, Surface& dst)
    {
        tcu::TextureFormat        colorFormat            = glu::mapGLInternalFormat(this.m_config.colorFormat);
        glu::DataType            fboSamplerType        = glu::getSampler2DType(colorFormat);
        glu::DataType            fboOutputType        = getFragmentOutputType(colorFormat);
        tcu::TextureFormatInfo    fboRangeInfo        = tcu::getTextureFormatInfo(colorFormat);
        Vec4                    fboOutScale            = fboRangeInfo.valueMax - fboRangeInfo.valueMin;
        Vec4                    fboOutBias            = fboRangeInfo.valueMin;

        Texture2DShader            texToFboShader        (DataTypes() << glu::TYPE_SAMPLER_2D, fboOutputType);
        Texture2DShader            texFromFboShader    (DataTypes() << fboSamplerType, glu::TYPE_FLOAT_VEC4);
        FlatColorShader            flatShader            (fboOutputType);
        deUint32                texToFboShaderID    = ctx.createProgram(&texToFboShader);
        deUint32                texFromFboShaderID    = ctx.createProgram(&texFromFboShader);
        deUint32                flatShaderID        = ctx.createProgram(&flatShader);

        int                        width                = 128;
        int                        height                = 128;
        deUint32                metaballsTex        = 1;
        deUint32                quadsTex            = 2;
        bool                    stencil                = (this.m_config.buffers & gl.STENCIL_BUFFER_BIT) != 0;

        createQuadsTex2D(ctx, quadsTex, gl.RGB, gl.UNSIGNED_BYTE, 64, 64);
        createMetaballsTex2D(ctx, metaballsTex, gl.RGB, gl.UNSIGNED_BYTE, 64, 64);

        Framebuffer fbo(ctx, this.m_config, width, height);
        fbo.checkCompleteness();

        // Setup shaders
        texToFboShader.setOutScaleBias(fboOutScale, fboOutBias);
        texFromFboShader.setTexScaleBias(0, fboRangeInfo.lookupScale, fboRangeInfo.lookupBias);
        texToFboShader.setUniforms    (ctx, texToFboShaderID);
        texFromFboShader.setUniforms(ctx, texFromFboShaderID);
        flatShader.setColor            (ctx, flatShaderID, Vec4(0.0f, 0.0f, 1.0f, 1.0f) * fboOutScale + fboOutBias);

        // Draw scene
        ctx.bindFramebuffer(gl.FRAMEBUFFER, fbo.getFramebuffer());
        ctx.viewport(0, 0, width, height);
        clearColorBuffer(ctx, colorFormat, tcu::Vec4(1.0f, 0.0f, 0.0f, 1.0f));
        ctx.clear(gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);

        ctx.enable(gl.DEPTH_TEST);

        ctx.bindTexture(gl.TEXTURE_2D, quadsTex);
        sglr::drawQuad(ctx, texToFboShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));

        ctx.disable(gl.DEPTH_TEST);

        if (stencil)
        {
            ctx.enable(gl.SCISSOR_TEST);
            ctx.scissor(width/4, height/4, width/2, height/2);
            ctx.clearStencil(1);
            ctx.clear(gl.STENCIL_BUFFER_BIT);
            ctx.disable(gl.SCISSOR_TEST);
        }

        // Recreate buffers
        if (!this.m_rebind)
            ctx.bindFramebuffer(gl.FRAMEBUFFER, 0);

        DE_ASSERT((this.m_buffers & (gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT)) == 0 ||
                  (this.m_buffers & (gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT)) == (this.m_config.buffers & (gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT)));

        // Recreate.
        for (int ndx = 0; ndx < 2; ndx++)
        {
            deUint32    bit        = ndx == 0 ? gl.COLOR_BUFFER_BIT
                                           : (gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);
            deUint32    type    = ndx == 0 ? fbo.getConfig().colorType
                                           : fbo.getConfig().depthStencilType;
            deUint32    format    = ndx == 0 ? fbo.getConfig().colorFormat
                                           : fbo.getConfig().depthStencilFormat;
            deUint32    buf        = ndx == 0 ? fbo.getColorBuffer()
                                           : fbo.getDepthStencilBuffer();

            if ((this.m_buffers & bit) == 0)
                continue;

            switch (type)
            {
                case gl.TEXTURE_2D:
                    ctx.deleteTextures(1, &buf);
                    ctx.bindTexture(gl.TEXTURE_2D, buf);
                    ctx.texImage2D(gl.TEXTURE_2D, 0, format, width, height);
                    ctx.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    ctx.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    break;

                case gl.RENDERBUFFER:
                    ctx.deleteRenderbuffers(1, &buf);
                    ctx.bindRenderbuffer(gl.RENDERBUFFER, buf);
                    ctx.renderbufferStorage(gl.RENDERBUFFER, format, width, height);
                    break;

                default:
                    DE_ASSERT(false);
            }
        }

        // Rebind.
        if (this.m_rebind)
        {
            for (int ndx = 0; ndx < 3; ndx++)
            {
                deUint32    bit        = ndx == 0 ? gl.COLOR_BUFFER_BIT    :
                                      ndx == 1 ? gl.DEPTH_BUFFER_BIT    :
                                      ndx == 2 ? gl.STENCIL_BUFFER_BIT    : 0;
                deUint32    point    = ndx == 0 ? gl.COLOR_ATTACHMENT0    :
                                      ndx == 1 ? gl.DEPTH_ATTACHMENT    :
                                      ndx == 2 ? gl.STENCIL_ATTACHMENT    : 0;
                deUint32    type    = ndx == 0 ? fbo.getConfig().colorType
                                               : fbo.getConfig().depthStencilType;
                deUint32    buf        = ndx == 0 ? fbo.getColorBuffer()
                                               : fbo.getDepthStencilBuffer();

                if ((this.m_buffers & bit) == 0)
                    continue;

                switch (type)
                {
                    case gl.TEXTURE_2D:
                        ctx.framebufferTexture2D(gl.FRAMEBUFFER, point, gl.TEXTURE_2D, buf, 0);
                        break;

                    case gl.RENDERBUFFER:
                        ctx.framebufferRenderbuffer(gl.FRAMEBUFFER, point, gl.RENDERBUFFER, buf);
                        break;

                    default:
                        DE_ASSERT(false);
                }
            }
        }

        if (!this.m_rebind)
            ctx.bindFramebuffer(gl.FRAMEBUFFER, fbo.getFramebuffer());

        ctx.clearStencil(0);
        ctx.clear(this.m_buffers & (gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT)); // \note Clear only buffers that were re-created
        if (this.m_buffers & gl.COLOR_BUFFER_BIT)
        {
            // Clearing of integer buffers is undefined so do clearing by rendering flat color.
            sglr::drawQuad(ctx, flatShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));
        }

        ctx.enable(gl.DEPTH_TEST);

        if (stencil)
        {
            // \note Stencil test enabled only if we have stencil buffer
            ctx.enable(gl.STENCIL_TEST);
            ctx.stencilFunc(gl.EQUAL, 0, 0xffu);
        }
        ctx.bindTexture(gl.TEXTURE_2D, metaballsTex);
        sglr::drawQuad(ctx, texToFboShaderID, Vec3(-1.0f, -1.0f, 1.0f), Vec3(1.0f, 1.0f, -1.0f));
        if (stencil)
            ctx.disable(gl.STENCIL_TEST);

        ctx.disable(gl.DEPTH_TEST);

        if (fbo.getConfig().colorType == gl.TEXTURE_2D)
        {
            // Unbind fbo
            ctx.bindFramebuffer(gl.FRAMEBUFFER, 0);

            // Draw to screen
            ctx.bindTexture(gl.TEXTURE_2D, fbo.getColorBuffer());
            ctx.viewport(0, 0, ctx.getWidth(), ctx.getHeight());
            sglr::drawQuad(ctx, texFromFboShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));

            // Read from screen
            ctx.readPixels(dst, 0, 0, ctx.getWidth(), ctx.getHeight());
        }
        else
        {
            // Read from fbo
            readPixels(ctx, dst, 0, 0, width, height, colorFormat, fboRangeInfo.lookupScale, fboRangeInfo.lookupBias);
        }
    }

    } // FboCases

    FboRenderTestGroup::FboRenderTestGroup (Context& context)
        : TestCaseGroup(context, "render", "Rendering Tests")
    {
    }

    FboRenderTestGroup::~FboRenderTestGroup (void)
    {
    }

    void FboRenderTestGroup::init (void)
    {
        static const deUint32 objectTypes[] =
        {
            gl.TEXTURE_2D,
            gl.RENDERBUFFER
        };

        enum FormatType
        {
            FORMATTYPE_FLOAT = 0,
            FORMATTYPE_FIXED,
            FORMATTYPE_INT,
            FORMATTYPE_UINT,

            FORMATTYPE_LAST
        };

        // Required by specification.
        static const struct
        {
            deUint32    format;
            FormatType    type;
        } colorFormats[] =
        {
            { gl.RGBA32F,            FORMATTYPE_FLOAT    },
            { gl.RGBA32I,            FORMATTYPE_INT        },
            { gl.RGBA32UI,            FORMATTYPE_UINT        },
            { gl.RGBA16F,            FORMATTYPE_FLOAT    },
            { gl.RGBA16I,            FORMATTYPE_INT        },
            { gl.RGBA16UI,            FORMATTYPE_UINT        },
            { gl.RGB16F,            FORMATTYPE_FLOAT    },
            { gl.RGBA8,                FORMATTYPE_FIXED    },
            { gl.RGBA8I,            FORMATTYPE_INT        },
            { gl.RGBA8UI,            FORMATTYPE_UINT        },
            { gl.SRGB8_ALPHA8,        FORMATTYPE_FIXED    },
            { gl.RGB10_A2,            FORMATTYPE_FIXED    },
            { gl.RGB10_A2UI,        FORMATTYPE_UINT        },
            { gl.RGBA4,                FORMATTYPE_FIXED    },
            { gl.RGB5_A1,            FORMATTYPE_FIXED    },
            { gl.RGB8,                FORMATTYPE_FIXED    },
            { gl.RGB565,            FORMATTYPE_FIXED    },
            { gl.R11F_G11F_B10F,    FORMATTYPE_FLOAT    },
            { gl.RG32F,                FORMATTYPE_FLOAT    },
            { gl.RG32I,                FORMATTYPE_INT        },
            { gl.RG32UI,            FORMATTYPE_UINT        },
            { gl.RG16F,                FORMATTYPE_FLOAT    },
            { gl.RG16I,                FORMATTYPE_INT        },
            { gl.RG16UI,            FORMATTYPE_UINT        },
            { gl.RG8,                FORMATTYPE_FLOAT    },
            { gl.RG8I,                FORMATTYPE_INT        },
            { gl.RG8UI,                FORMATTYPE_UINT        },
            { gl.R32F,                FORMATTYPE_FLOAT    },
            { gl.R32I,                FORMATTYPE_INT        },
            { gl.R32UI,                FORMATTYPE_UINT        },
            { gl.R16F,                FORMATTYPE_FLOAT    },
            { gl.R16I,                FORMATTYPE_INT        },
            { gl.R16UI,                FORMATTYPE_UINT        },
            { gl.R8,                FORMATTYPE_FLOAT    },
            { gl.R8I,                FORMATTYPE_INT        },
            { gl.R8UI,                FORMATTYPE_UINT        }
        };

        static const struct
        {
            deUint32    format;
            bool        depth;
            bool        stencil;
        } depthStencilFormats[] =
        {
            { gl.DEPTH_COMPONENT32F,    true,    false    },
            { gl.DEPTH_COMPONENT24,        true,    false    },
            { gl.DEPTH_COMPONENT16,        true,    false    },
            { gl.DEPTH32F_STENCIL8,        true,    true    },
            { gl.DEPTH24_STENCIL8,        true,    true    },
            { gl.STENCIL_INDEX8,        false,    true    }
        };

        using namespace FboCases;

        // .stencil_clear
        tcu::TestCaseGroup* stencilClearGroup = new tcu::TestCaseGroup(this.m_testCtx, "stencil_clear", "Stencil buffer clears");
        addChild(stencilClearGroup);
        for (int fmtNdx = 0; fmtNdx < DE_LENGTH_OF_ARRAY(depthStencilFormats); fmtNdx++)
        {
            deUint32    colorType    = gl.TEXTURE_2D;
            deUint32    stencilType    = gl.RENDERBUFFER;
            deUint32    colorFmt    = gl.RGBA8;

            if (!depthStencilFormats[fmtNdx].stencil)
                continue;

            FboConfig config(gl.COLOR_BUFFER_BIT|gl.STENCIL_BUFFER_BIT, colorType, colorFmt, stencilType, depthStencilFormats[fmtNdx].format);
            stencilClearGroup->addChild(new StencilClearsTest(this.m_context, config));
        }

        // .shared_colorbuffer_clear
        tcu::TestCaseGroup* sharedColorbufferClearGroup = new tcu::TestCaseGroup(this.m_testCtx, "shared_colorbuffer_clear", "Shader colorbuffer clears");
        addChild(sharedColorbufferClearGroup);
        for (int colorFmtNdx = 0; colorFmtNdx < DE_LENGTH_OF_ARRAY(colorFormats); colorFmtNdx++)
        {
            // Clearing of integer buffers is undefined.
            if (colorFormats[colorFmtNdx].type == FORMATTYPE_INT || colorFormats[colorFmtNdx].type == FORMATTYPE_UINT)
                continue;

            for (int typeNdx = 0; typeNdx < DE_LENGTH_OF_ARRAY(objectTypes); typeNdx++)
            {
                FboConfig config(gl.COLOR_BUFFER_BIT, objectTypes[typeNdx], colorFormats[colorFmtNdx].format, gl.NONE, gl.NONE);
                sharedColorbufferClearGroup->addChild(new SharedColorbufferClearsTest(this.m_context, config));
            }
        }

        // .shared_colorbuffer
        tcu::TestCaseGroup* sharedColorbufferGroup = new tcu::TestCaseGroup(this.m_testCtx, "shared_colorbuffer", "Shared colorbuffer tests");
        addChild(sharedColorbufferGroup);
        for (int colorFmtNdx = 0; colorFmtNdx < DE_LENGTH_OF_ARRAY(colorFormats); colorFmtNdx++)
        {
            deUint32    depthStencilType    = gl.RENDERBUFFER;
            deUint32    depthStencilFormat    = gl.DEPTH24_STENCIL8;

            // Blending with integer buffers and fp32 targets is not supported.
            if (colorFormats[colorFmtNdx].type == FORMATTYPE_INT    ||
                colorFormats[colorFmtNdx].type == FORMATTYPE_UINT    ||
                colorFormats[colorFmtNdx].format == gl.RGBA32F        ||
                colorFormats[colorFmtNdx].format == gl.RGB32F        ||
                colorFormats[colorFmtNdx].format == gl.RG32F        ||
                colorFormats[colorFmtNdx].format == gl.R32F)
                continue;

            for (int typeNdx = 0; typeNdx < DE_LENGTH_OF_ARRAY(objectTypes); typeNdx++)
            {
                FboConfig colorOnlyConfig            (gl.COLOR_BUFFER_BIT,                                            objectTypes[typeNdx], colorFormats[colorFmtNdx].format, gl.NONE, gl.NONE);
                FboConfig colorDepthConfig            (gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT,                        objectTypes[typeNdx], colorFormats[colorFmtNdx].format, depthStencilType, depthStencilFormat);
                FboConfig colorDepthStencilConfig    (gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT,    objectTypes[typeNdx], colorFormats[colorFmtNdx].format, depthStencilType, depthStencilFormat);

                sharedColorbufferGroup->addChild(new SharedColorbufferTest(this.m_context, colorOnlyConfig));
                sharedColorbufferGroup->addChild(new SharedColorbufferTest(this.m_context, colorDepthConfig));
                sharedColorbufferGroup->addChild(new SharedColorbufferTest(this.m_context, colorDepthStencilConfig));
            }
        }

        // .shared_depth_stencil
        tcu::TestCaseGroup* sharedDepthStencilGroup = new tcu::TestCaseGroup(this.m_testCtx, "shared_depth_stencil", "Shared depth and stencil buffers");
        addChild(sharedDepthStencilGroup);
        for (int fmtNdx = 0; fmtNdx < DE_LENGTH_OF_ARRAY(depthStencilFormats); fmtNdx++)
        {
            deUint32    colorType        = gl.TEXTURE_2D;
            deUint32    colorFmt        = gl.RGBA8;
            bool        depth            = depthStencilFormats[fmtNdx].depth;
            bool        stencil            = depthStencilFormats[fmtNdx].stencil;

            if (!depth)
                continue; // Not verified.

            // Depth and stencil: both rbo and textures
            for (int typeNdx = 0; typeNdx < DE_LENGTH_OF_ARRAY(objectTypes); typeNdx++)
            {
                FboConfig config(gl.COLOR_BUFFER_BIT|(depth ? gl.DEPTH_BUFFER_BIT : 0)|(stencil ? gl.STENCIL_BUFFER_BIT : 0), colorType, colorFmt, objectTypes[typeNdx], depthStencilFormats[fmtNdx].format);
                sharedDepthStencilGroup->addChild(new SharedDepthStencilTest(this.m_context, config));
            }
        }

        // .resize
        tcu::TestCaseGroup* resizeGroup = new tcu::TestCaseGroup(this.m_testCtx, "resize", "FBO resize tests");
        addChild(resizeGroup);
        for (int colorFmtNdx = 0; colorFmtNdx < DE_LENGTH_OF_ARRAY(colorFormats); colorFmtNdx++)
        {
            deUint32 colorFormat = colorFormats[colorFmtNdx].format;

            // Color-only.
            for (int typeNdx = 0; typeNdx < DE_LENGTH_OF_ARRAY(objectTypes); typeNdx++)
            {
                FboConfig config(gl.COLOR_BUFFER_BIT, objectTypes[typeNdx], colorFormat, gl.NONE, gl.NONE);
                resizeGroup->addChild(new ResizeTest(this.m_context, config));
            }

            // For selected color formats tests depth & stencil variants.
            if (colorFormat == gl.RGBA8 || colorFormat == gl.RGBA16F)
            {
                for (int depthStencilFmtNdx = 0; depthStencilFmtNdx < DE_LENGTH_OF_ARRAY(depthStencilFormats); depthStencilFmtNdx++)
                {
                    deUint32    colorType        = gl.TEXTURE_2D;
                    bool        depth            = depthStencilFormats[depthStencilFmtNdx].depth;
                    bool        stencil            = depthStencilFormats[depthStencilFmtNdx].stencil;

                    // Depth and stencil: both rbo and textures
                    for (int typeNdx = 0; typeNdx < DE_LENGTH_OF_ARRAY(objectTypes); typeNdx++)
                    {
                        if (!depth && objectTypes[typeNdx] != gl.RENDERBUFFER)
                            continue; // Not supported.

                        FboConfig config(gl.COLOR_BUFFER_BIT|(depth ? gl.DEPTH_BUFFER_BIT : 0)|(stencil ? gl.STENCIL_BUFFER_BIT : 0),
                                         colorType, colorFormat,
                                         objectTypes[typeNdx], depthStencilFormats[depthStencilFmtNdx].format);
                        resizeGroup->addChild(new ResizeTest(this.m_context, config));
                    }
                }
            }
        }

        // .recreate_color
        tcu::TestCaseGroup* recreateColorGroup = new tcu::TestCaseGroup(this.m_testCtx, "recreate_color", "Recreate colorbuffer tests");
        addChild(recreateColorGroup);
        for (int colorFmtNdx = 0; colorFmtNdx < DE_LENGTH_OF_ARRAY(colorFormats); colorFmtNdx++)
        {
            deUint32    colorFormat            = colorFormats[colorFmtNdx].format;
            deUint32    depthStencilFormat    = gl.DEPTH24_STENCIL8;
            deUint32    depthStencilType    = gl.RENDERBUFFER;

            // Color-only.
            for (int typeNdx = 0; typeNdx < DE_LENGTH_OF_ARRAY(objectTypes); typeNdx++)
            {
                FboConfig config(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT, objectTypes[typeNdx], colorFormat, depthStencilType, depthStencilFormat);
                recreateColorGroup->addChild(new RecreateBuffersTest(this.m_context, config, gl.COLOR_BUFFER_BIT, true /* rebind */));
            }
        }

        // .recreate_depth_stencil
        tcu::TestCaseGroup* recreateDepthStencilGroup = new tcu::TestCaseGroup(this.m_testCtx, "recreate_depth_stencil", "Recreate depth and stencil buffers");
        addChild(recreateDepthStencilGroup);
        for (int fmtNdx = 0; fmtNdx < DE_LENGTH_OF_ARRAY(depthStencilFormats); fmtNdx++)
        {
            deUint32    colorType        = gl.TEXTURE_2D;
            deUint32    colorFmt        = gl.RGBA8;
            bool        depth            = depthStencilFormats[fmtNdx].depth;
            bool        stencil            = depthStencilFormats[fmtNdx].stencil;

            // Depth and stencil: both rbo and textures
            for (int typeNdx = 0; typeNdx < DE_LENGTH_OF_ARRAY(objectTypes); typeNdx++)
            {
                if (!depth && objectTypes[typeNdx] != gl.RENDERBUFFER)
                    continue;

                FboConfig config(gl.COLOR_BUFFER_BIT|(depth ? gl.DEPTH_BUFFER_BIT : 0)|(stencil ? gl.STENCIL_BUFFER_BIT : 0), colorType, colorFmt, objectTypes[typeNdx], depthStencilFormats[fmtNdx].format);
                recreateDepthStencilGroup->addChild(new RecreateBuffersTest(this.m_context, config, (depth ? gl.DEPTH_BUFFER_BIT : 0)|(stencil ? gl.STENCIL_BUFFER_BIT : 0), true /* rebind */));
            }
        }
    }
};
