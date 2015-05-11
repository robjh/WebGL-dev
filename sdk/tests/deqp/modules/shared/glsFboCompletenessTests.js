'use strict';
goog.provide('modules.shared.glsFboCompletenessTests');
goog.require('modules.shared.glsFboUtil');
goog.require('framework.opengl.gluObjectWrapper');
goog.require('framework.common.tcuTestCase');


goog.scope(function() {

    var glsFboCompletenessTests = modules.shared.glsFboCompletenessTests;
    var glsFboUtil = modules.shared.glsFboUtil;
    var gluObjectWrapper = framework.opengl.gluObjectWrapper;
    var tcuTestCase = framework.common.tcuTestCase;

    
    glsFboCompletenessTests.initGlDependents = function(gl) {
        if (!(gl = gl || window.gl)) throw new Error('Invalid gl object');
        
        
        // The following extensions are applicable both to ES2 and ES3.
        /**
         * GL_OES_depth_texture
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_oesDepthTextureFormats = [
            glsFboUtil.formatkey(gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT),
            glsFboUtil.formatkey(gl.DEPTH_COMPONENT, gl.UNSIGNED_INT)
        ];
        
        /**
         * GL_OES_packed_depth_stencil
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_oesPackedDepthStencilSizedFormats = [
            gl.DEPTH24_STENCIL8
        ];
        
        /**
         * s_oesPackedDepthStencilTexFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_oesPackedDepthStencilTexFormats = [
            glsFboUtil.formatkey(gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8)
        ];
        
        /**
         * GL_OES_required_internalformat
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_oesRequiredInternalFormatColorFormats = [
            // Same as ES2 RBO formats, plus RGBA8 (even without OES_rgb8_rgba8)
            gl.RGB5_A1, gl.RGBA8, gl.RGBA4, gl.RGB565
        ];

        /**
         * s_oesRequiredInternalFormatDepthFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_oesRequiredInternalFormatDepthFormats = [
            gl.DEPTH_COMPONENT16
        ];
        
        /**
         * GL_EXT_color_buffer_half_float
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_extColorBufferHalfFloatFormats = [
            gl.RGBA16F, gl.RGB16F, gl.RG16F, gl.R16F
        ];
        
        /**
         * s_oesDepth24SizedFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_oesDepth24SizedFormats = [
            gl.DEPTH_COMPONENT24
        ];
        
        /**
         * s_oesDepth32SizedFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_oesDepth32SizedFormats = [
            gl.DEPTH_COMPONENT32
        ];
        
        /**
         * s_oesRgb8Rgba8RboFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_oesRgb8Rgba8RboFormats = [
            gl.RGB8, gl.RGBA8
        ];
        
        /**
         * s_oesRequiredInternalFormatRgb8ColorFormat
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_oesRequiredInternalFormatRgb8ColorFormat = [
            gl.RGB8
        ];
        
        /**
         * s_extTextureType2101010RevFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_extTextureType2101010RevFormats = [
            glsFboUtil.formatkey(gl.RGBA, gl.UNSIGNED_INT_2_10_10_10_REV),
            glsFboUtil.formatkey(gl.RGB,  gl.UNSIGNED_INT_2_10_10_10_REV)
        ];
        
        /**
         * s_oesRequiredInternalFormat10bitColorFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_oesRequiredInternalFormat10bitColorFormats = [
            gl.RGB10_A2, gl.RGB10
        ];
        
        /**
         * s_extTextureRgRboFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_extTextureRgRboFormats = [
            gl.R8, gl.RG8
        ];
        
        /**
         * s_extTextureRgTexFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_extTextureRgTexFormats = [
            glsFboUtil.formatkey(gl.RED, gl.UNSIGNED_BYTE),
            glsFboUtil.formatkey(gl.RG,  gl.UNSIGNED_BYTE)
        ];
        
        /**
         * s_extTextureRgFloatTexFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_extTextureRgFloatTexFormats = [
            glsFboUtil.formatkey(gl.RED, gl.FLOAT),
            glsFboUtil.formatkey(gl.RG,  gl.FLOAT)
        ];
        
        /**
         * s_extTextureRgHalfFloatTexFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_extTextureRgHalfFloatTexFormats = [
            glsFboUtil.formatkey(gl.RED, gl.HALF_FLOAT_OES),
            glsFboUtil.formatkey(gl.RG,  gl.HALF_FLOAT_OES)
        ];
        
        /**
         * s_nvPackedFloatRboFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_nvPackedFloatRboFormats = [
            gl.R11F_G11F_B10F
        ];
        
        /**
         * s_nvPackedFloatTexFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_nvPackedFloatTexFormats = [
            glsFboUtil.formatkey(gl.RGB, gl.UNSIGNED_INT_10F_11F_11F_REV)
        ];
        
        /**
         * s_extSrgbRboFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_extSrgbRboFormats = [
            gl.SRGB8_ALPHA8
        ];
        
        /**
         * s_extSrgbRenderableTexFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_extSrgbRenderableTexFormats = [
            glsFboUtil.formatkey(gl.SRGB_ALPHA, gl.UNSIGNED_BYTE)
        ];
        
        /**
         * s_extSrgbNonRenderableTexFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_extSrgbNonRenderableTexFormats = [
            glsFboUtil.formatkey(gl.SRGB, gl.UNSIGNED_BYTE),
            gl.SRGB8
        ];
        
        /**
         * s_nvSrgbFormatsRboFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_nvSrgbFormatsRboFormats = [
            gl.SRGB8
        ];
        
        /**
         * s_nvSrgbFormatsTextureFormats
         * The extension does not actually require any unsized format
         * to be renderable. However, the renderablility of unsized
         * SRGB,UBYTE internalformat-type pair is implied.
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_nvSrgbFormatsTextureFormats = [
            gl.SRGB8,
            glsFboUtil.formatkey(gl.SRGB, gl.UNSIGNED_BYTE)
        ];
        
        /**
         * s_oesRgb8Rgba8TexFormats
         * @type {Array<number>}
         */
        glsFboCompletenessTests.s_oesRgb8Rgba8TexFormats = [
            glsFboUtil.formatkey(gl.RGB,  gl.UNSIGNED_BYTE),
            glsFboUtil.formatkey(gl.RGBA, gl.UNSIGNED_BYTE)
        ];
        
        var fmt = glsFboUtil.FormatFlags;
        
        /**
         * s_esExtFormats
         * @type {Array<glsFboUtil.FormatExtEntry>}
         */
        glsFboCompletenessTests.s_esExtFormats = [
            new glsFboUtil.FormatExtEntry(
                'GL_OES_depth_texture',
                fmt.REQUIRED_RENDERABLE | fmt.DEPTH_RENDERABLE | fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_oesDepthTextureFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_OES_packed_depth_stencil',
                fmt.REQUIRED_RENDERABLE | fmt.DEPTH_RENDERABLE | fmt.STENCIL_RENDERABLE | fmt.RENDERBUFFER_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_oesPackedDepthStencilSizedFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_OES_packed_depth_stencil GL_OES_required_internalformat',
                fmt.DEPTH_RENDERABLE | fmt.STENCIL_RENDERABLE | fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_oesPackedDepthStencilTexFormats)
            ),
            
            // \todo [2013-12-10 lauri] Find out if OES_texture_half_float is really a
            // requirement on ES3 also. Or is color_buffer_half_float applicatble at
            // all on ES3, since there's also EXT_color_buffer_float?
            new glsFboUtil.FormatExtEntry(
                'GL_OES_texture_half_float GL_EXT_color_buffer_half_float',
                fmt.REQUIRED_RENDERABLE | fmt.COLOR_RENDERABLE | fmt.RENDERBUFFER_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_extColorBufferHalfFloatFormats)
            ),
            
            // OES_required_internalformat doesn't actually specify that these are renderable,
            // since it was written against ES 1.1.
            new glsFboUtil.FormatExtEntry(
                'GL_OES_required_internalformat',
                // Allow but don't require RGBA8 to be color-renderable if
                // OES_rgb8_rgba8 is not present.
                fmt.COLOR_RENDERABLE | fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_oesRequiredInternalFormatColorFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_OES_required_internalformat',
                fmt.DEPTH_RENDERABLE | fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_oesRequiredInternalFormatDepthFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_EXT_texture_rg',
                fmt.REQUIRED_RENDERABLE | fmt.COLOR_RENDERABLE | fmt.RENDERBUFFER_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_extTextureRgRboFormats)
            ),
            
            // These are not specified to be color-renderable, but the wording is
            // exactly as ambiguous as the wording in the ES2 spec.
            new glsFboUtil.FormatExtEntry(
                'GL_EXT_texture_rg',
                fmt.REQUIRED_RENDERABLE | fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_extTextureRgTexFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_EXT_texture_rg GL_OES_texture_float',
                fmt.REQUIRED_RENDERABLE | fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_extTextureRgFloatTexFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_EXT_texture_rg GL_OES_texture_half_float',
                fmt.REQUIRED_RENDERABLE | fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_extTextureRgHalfFloatTexFormats)
            ),
            
            // Some Tegra drivers report GL_EXT_packed_float even for ES. Treat it as
            // a synonym for the NV_ version.
            new glsFboUtil.FormatExtEntry(
                'GL_EXT_packed_float',
                fmt.REQUIRED_RENDERABLE | fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_nvPackedFloatTexFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_EXT_packed_float GL_EXT_color_buffer_half_float',
                fmt.REQUIRED_RENDERABLE | fmt.COLOR_RENDERABLE | fmt.RENDERBUFFER_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_nvPackedFloatRboFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_EXT_sRGB',
                fmt.COLOR_RENDERABLE | fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_extSrgbRenderableTexFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_EXT_sRGB',
                fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_extSrgbNonRenderableTexFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_EXT_sRGB',
                fmt.REQUIRED_RENDERABLE | fmt.COLOR_RENDERABLE | fmt.RENDERBUFFER_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_extSrgbRboFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_NV_sRGB_formats',
                fmt.REQUIRED_RENDERABLE | fmt.COLOR_RENDERABLE | fmt.RENDERBUFFER_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_nvSrgbFormatsRboFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_NV_sRGB_formats',
                fmt.REQUIRED_RENDERABLE | fmt.COLOR_RENDERABLE | fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_nvSrgbFormatsTextureFormats)
            ),

            // In Khronos bug 7333 discussion, the consensus is that these texture
            // formats, at least, should be color-renderable. Still, that cannot be
            // found in any extension specs, so only allow it, not require it.
            new glsFboUtil.FormatExtEntry(
                'GL_OES_rgb8_rgba8',
                fmt.COLOR_RENDERABLE | fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_oesRgb8Rgba8TexFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_OES_rgb8_rgba8',
                fmt.REQUIRED_RENDERABLE | fmt.COLOR_RENDERABLE | fmt.RENDERBUFFER_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_oesRgb8Rgba8RboFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_OES_rgb8_rgba8 GL_OES_required_internalformat',
                fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_oesRequiredInternalFormatRgb8ColorFormat)
            ),
            
            // The depth-renderability of the depth RBO formats is not explicitly
            // spelled out, but all renderbuffer formats are meant to be renderable.
            new glsFboUtil.FormatExtEntry(
                'GL_OES_depth24',
                fmt.REQUIRED_RENDERABLE | fmt.DEPTH_RENDERABLE | fmt.RENDERBUFFER_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_oesDepth24SizedFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_OES_depth24 GL_OES_required_internalformat GL_OES_depth_texture',
                fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_oesDepth24SizedFormats)
            ),
            
            new glsFboUtil.FormatExtEntry(
                'GL_OES_depth32',
                fmt.REQUIRED_RENDERABLE | fmt.DEPTH_RENDERABLE | fmt.RENDERBUFFER_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_oesDepth32SizedFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_OES_depth32 GL_OES_required_internalformat GL_OES_depth_texture',
                fmt.TEXTURE_VALID,
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_oesDepth32SizedFormats)
            ),
            
            new glsFboUtil.FormatExtEntry(
                'GL_EXT_texture_type_2_10_10_10_REV',
                fmt.TEXTURE_VALID, // explicitly unrenderable
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_extTextureType2101010RevFormats)
            ),
            new glsFboUtil.FormatExtEntry(
                'GL_EXT_texture_type_2_10_10_10_REV GL_OES_required_internalformat',
                fmt.TEXTURE_VALID, // explicitly unrenderable
                glsFboUtil.rangeArray(glsFboCompletenessTests.s_oesRequiredInternalFormat10bitColorFormats)
            ),
        ];
        
    }; // initGlDependents ----------------------------------------

    
    // TestContext& testCtx, RenderContext& renderCtx, CheckerFactory& factory
    glsFboCompletenessTests.Context = function(testCtx, renderCtx, factory) {

        this.m_testCtx    = testCtx;
        this.m_renderCtx  = renderCtx;
        this.m_ctxFormats = new glsFboUtil.FormatDB();
        this.m_minFormats = new glsFboUtil.FormatDB();
        this.m_maxFormats = new glsFboUtil.FormatDB();
        this.m_verifier   = new glsFboUtil.FboVerifier(this.m_ctxFormats, factory);
        this.m_haveMultiColorAtts = false;
           
        // FormatExtEntries 
        var extRange = glsFboUtil.rangeArray(glsFboCompletenessTests.s_esExtFormats);
        this.addExtFormats(extRange);
        
        
    /*
    this.addExtFormats = function(extRange) {  };
    this.createRenderableTests = function() {  };
    this.createAttachmentTests = function() {  };
    this.createSizeTests = function() {  };
    //*/
    /*
    						glsFboCompletenessTests.Context					(TestContext& testCtx,
													 RenderContext& renderCtx,
													 CheckerFactory& factory);
													 
	void					addExtFormats			(FormatExtEntries extRange);
	TestCaseGroup*			createRenderableTests	(void);
	TestCaseGroup*			createAttachmentTests	(void);
	TestCaseGroup*			createSizeTests			(void);
        //*/
    };
    
    // RenderContext&
    glsFboCompletenessTests.Context.prototype.getRenderContext = function() {
        return this.m_renderCtx;
    };
        
    // TestContext&
    glsFboCompletenessTests.Context.prototype.getTestContext   = function() {
        return this.m_testCtx;
    };
        
    // const FboVerifier&
    glsFboCompletenessTests.Context.prototype.getVerifier      = function() {
        return this.m_verifier;
    };
        
    // const FormatDB&
    glsFboCompletenessTests.Context.prototype.getMinFormats    = function() {
        return this.m_minFormats;
    };
        
    // const FormatDB&
    glsFboCompletenessTests.Context.prototype.getCtxFormats    = function() {
        return this.m_ctxFormats;
    };
        
    // bool
    glsFboCompletenessTests.Context.prototype.haveMultiColorAtts = function() {
        return this.m_haveMultiColorAtts;
    };
    
    glsFboCompletenessTests.Context.prototype.setHaveMulticolorAtts = function(have) {
        this.m_haveMultiColorAtts = (have == true);
    }
        
    glsFboCompletenessTests.Context.prototype.addFormats = function(fmtRange) {
        glsFboUtil.addFormats(this.m_minFormats, fmtRange);
        glsFboUtil.addFormats(this.m_ctxFormats, fmtRange);
        glsFboUtil.addFormats(this.m_maxFormats, fmtRange);
    };
    glsFboCompletenessTests.Context.prototype.addExtFormats = function(extRange) {
        glsFboUtil.addExtFormats(this.m_ctxFormats, extRange, this.m_renderCtx);
        glsFboUtil.addExtFormats(this.m_maxFormats, extRange, this.m_renderCtx);
    }
    
    
    
    
    glsFboCompletenessTests.TestBase = function(name, desc, params) {
        tcuTestCase.DeqpTest.call(this, name, desc);
        this.m_params = params;

        this.getContext = this.getState;

    //  console.log("glsFboCompletenessTests.TestBase Constructor");
    };
    glsFboCompletenessTests.TestBase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    glsFboCompletenessTests.TestBase.prototype.constructor = glsFboCompletenessTests.TestBase;

    // GLenum attPoint, GLenum bufType
    glsFboCompletenessTests.TestBase.prototype.getDefaultFormat = function(attPoint, bufType, gl) {
        gl = gl || window.gl;
        
        if (bufType == gl.NONE) {
            return glsFboUtil.ImageFormat.none();
        }
        
        // Prefer a standard format, if there is one, but if not, use a format
        // provided by an extension.
        var formats = this.m_ctx.getMinFormats().getFormats(
            glsFboUtil.formatFlag(attPoint, gl) | glsFboUtil.formatFlag(bufType, gl)
        );
        
        if (!formats.length) {
            formats = this.m_ctx.getCtxFormats().getFormats(
                glsFboUtil.formatFlag(attPoint, gl) | glsFboUtil.formatFlag(bufType, gl)
            );
        }
        if (!formats.length) {
            throw new Error('Unsupported attachment kind for attachment point');
        }
        
        return formats;
        
    };
    
    // GLenum bufType, ImageFormat format, GLsizei width, GLsizei height, FboBuilder& builder
    glsFboCompletenessTests.makeImage = function(bufType, format, width, height, builder, gl) {
        var gl = gl || window.gl;
        var image = 0;
        switch (bufType) {
            case gl.NONE:
                return null;
                break;
            case gl.RENDERBUFFER:
                image = builder.makeConfig(glsFboUtil.Renderbuffer);
                break;
            case gl.TEXTURE:
                image = builder.makeConfig(glsFboUtil.Texture2D);
                break;
            default:
                debugger;
                throw new Error("Impossible case");
        }
        image.unternalFormat = format;
        image.width = width;
        image.height = height;
        return image;
    };
    // GLenum bufType, ImageFormat format, GLsizei width, GLsizei height, FboBuilder& builder
    glsFboCompletenessTests.makeAttachment = function(bufType, format, width, height, builder, gl) {
        var gl = gl || window.gl;
        var cfg = glsFboCompletenessTests.makeImage(bufType, format, width, height, builder, gl);
        var att = 0;
        var img = 0;
        
        var mask = glsFboUtil.Config.s_types.RENDERBUFFER | glsFboUtil.Config.s_types.TEXTURE2D;
        
        switch (cfg.type & mask) {
            case glsFboUtil.Config.s_types.RENDERBUFFER:
                img = builder.glCreateRbo(config);
                att = builder.makeConfig(glsFboUtil.RenderbufferAttachment);
                break;
            case glsFboUtil.Config.s_types.TEXTURE2D:
                img = builder.glCreateTexture(config);
                att = builder.makeConfig(glsFboUtil.TextureFlatAttachment);
                att.texTarget = gl.TEXTURE_2D;
            default:
                if (config != null) throw new Error('Unsupported config.');
                return null;
        }
        att.imageName = img;
        return att;
    };
    
    //GLenum target, GLenum bufType, ImageFormat format, GLsizei width, GLsizei height, FboBuilder& builder, webglctx
    glsFboCompletenessTests.TestBase.prototype.attachTargetToNew = function(
        target, bufType, format, width, height, builder, gl
    ) {
        var imgFmt = format;
        if (imgFmt == gl.NONE)
            imgFmt = this.getDefaultFormat(target, bufType, gl);
        var att = glsFboCompletenessTests.makeAttachment(bufType, imgFmt, width, height, builder, gl);
        builder.glAttach(target, att);
    };
    
    
  
    // a quick note to work around the absense of these functions:
//    glsFboCompletenessTests.TestBase.pass
//    glsFboCompletenessTests.TestBase.warning
//    glsFboCompletenessTests.TestBase.fail
    
    glsFboCompletenessTests.TestBase.prototype.iterate = function() {
        var gl = window.gl;
        
        var fbo = new gluObjectWrapper.Framebuffer(gl);
        var builder = new glsFboUtil.FboBuilder(fbo.get(), gl.FRAMEBUFFER, gl);
        var ret = this.build(builder);
        var statuses = this.m_ctx.getVerifier().validStatusCodes(builder);
        
        var glStatus = builder.getError();
        if (glStatus == gl.NO_ERROR)
            glStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        
        var it = 1;
        var err = statuses[0];
    //  glsFboUtil.logFramebufferConfig(builder, this.m_testCtx.getLog());
        
        var msg = '';
    //  msg += this.m_testCtx.getLog();
        msg = 'Expected ';
        if (it < statuses.length) {
            msg += 'one of ';
            while (it < statuses.length) {
                msg += glsFboCompletenessTests.statusName(err);
                err = statuses[it++];
                msg += (it == statuses.length ? ' or ' : ', ');
            }
        }
     //   msg += glsFboCompletenessTests.statusName(err) + '.';
        bufferedLogToConsole(msg);
        
     //   bufferedLogToConsole(
     //       'Received ' + glsFboCompletenessTests.statusName(glStatus) + '.'
     //   );
        
        if (!glsFboUtil.contains(statuses, glStatus)) {
            // the returned status value was not acceptable.
            if (glStatus == gl.FRAMEBUFFER_COMPLETE) {
                throw new TestFailedException('Framebuffer checked as complete, expected incomplete');
            } else if (statuses.length == 1 && glsFboUtil.contains(statuses, gl.FRAMEBUFFER_COMPLETE)) {
                throw new TestFailedException('Framebuffer checked as incomplete, expected complete');
            } else {
                // An incomplete status is allowed, but not _this_ incomplete status.
                throw new TestFailedException('Framebuffer checked as incomplete, but with wrong status');
            }
        } else if (
            glStatus != gl.FRAMEBUFFER_COMPLETE &&
            glsFboUtil.contins(statuses, gl.FRAMEBUFFER_COMPLETE)
        ) {
            // TODO: handle this properly, it should result in the test issuing a warning
            bufferedLogToConsole('Framebuffer object could have checked as complete but did not.');
            
        } else {
            // pass
            return true;
        }
        return ret;
    };
    
    /*
    return {
        glsFboCompletenessTests.Context:  glsFboCompletenessTests.Context,
        glsFboCompletenessTests.TestBase: glsFboCompletenessTests.TestBase,
    }
    //*/
    
});
