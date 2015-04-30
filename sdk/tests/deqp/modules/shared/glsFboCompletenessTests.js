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
    
    // TestContext& testCtx, RenderContext& renderCtx, CheckerFactory& factory
    glsFboCompletenessTests.Context = function(testCtx, renderCtx, factory) {

        this.m_testCtx    = testCtx;
        this.m_renderCtx  = renderCtx;
        this.m_minFormats = null;
        this.m_ctxFormats = null;
        this.m_maxFormats = null;
        this.m_verifier   = null;
        this.m_haveMultiColorAtts = false;
           
        // FormatExtEntries 
        var extRange = glsFboUtil.rangeArray(s_esExtFormats);
        addExtFormats(extRange);
        
        
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
    glsFboCompletenessTests.Context.getRenderContext = function() {
        return this.m_renderCtx;
    };
        
    // TestContext&
    glsFboCompletenessTests.Context.getTestContext   = function() {
        return this.m_testCtx;
    };
        
    // const FboVerifier&
    glsFboCompletenessTests.Context.getVerifier      = function() {
        return this.m_verifier;
    };
        
    // const FormatDB&
    glsFboCompletenessTests.Context.getMinFormats    = function() {
        return this.m_minFormats;
    };
        
    // const FormatDB&
    glsFboCompletenessTests.Context.getCtxFormats    = function() {
        return this.m_ctxFormats;
    };
        
    // bool
    glsFboCompletenessTests.Context.haveMultiColorAtts = function() {
        return this.m_haveMultiColorAtts;
    };
    
    glsFboCompletenessTests.Context.setHaveMulticolorAtts = function(have) {
        this.m_haveMultiColorAtts = (have == true);
    }
        
    glsFboCompletenessTests.Context.addFormats = function(fmtRange) {
        glsFboUtil.addFormats(this.m_minFormats, fmtRange);
        glsFboUtil.addFormats(this.m_ctxFormats, fmtRange);
        glsFboUtil.addFormats(this.m_maxFormats, fmtRange);
    };
    glsFboCompletenessTests.Context.addExtFormats = function(extRange) {
        glsFboUtil.addExtFormats(this.m_ctxFormats, extRange, this.m_renderCtx);
        glsFboUtil.addExtFormats(this.m_maxFormats, extRange, this.m_renderCtx);
    }
    
    
    
    
    glsFboCompletenessTests.TestBase = function() {
        tcuTestCase.DeqpTest.call(this);
        this.params = null;

        this.getContext = this.getState;

        console.log("glsFboCompletenessTests.TestBase Constructor");
        
    };
    glsFboCompletenessTests.TestBase.prototype = Object.create(tcuTestCase.DeqpTest);
    glsFboCompletenessTests.TestBase.prototype.constructor = glsFboCompletenessTests.TestBase;
    
    // GLenum attPoint, GLenum bufType
    glsFboCompletenessTests.TestBase.getDefaultFormat = function(attPoint, bufType, gl) {
        gl = gl || window.gl;
        
        if (bufType == gl.NONE) {
            return glsFboUtil.ImageFormat.none();
        }
        
    };
  
    // a quick note to work around the absense of these functions:
//    glsFboCompletenessTests.TestBase.pass
//    glsFboCompletenessTests.TestBase.warning
//    glsFboCompletenessTests.TestBase.fail
    
    glsFboCompletenessTests.TestBase.prototype.iterate = function() {
        var gl = window.gl;
        
        var fbo = new gluObjectWrapper.Framebuffer(gl);
        var builder = new glsFboUtil.FboBuilder(gbo.get(), gl.FRAMEBUFFER, gl);
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
        msg += glsFboCompletenessTests.statusName(err) + '.';
        bufferedLogToConsole(msg);
        
        bufferedLogToConsole(
            'Received ' + glsFboCompletenessTests.statusName(glStatus) + '.'
        );
        
        if (!glsFboUtil.contains(statuses, glStatus)) {
            // the returned status value was not acceptable.
            if (glStatus == gl.FRAMEBUFFER_COMPLETE) {
                throw new Error('Framebuffer checked as complete, expected incomplete');
            } else if (statuses.length == 1 && glsFboUtil.contains(statuses, gl.FRAMEBUFFER_COMPLETE)) {
                throw new Error('Framebuffer checked as incomplete, expected complete');
            } else {
                // An incomplete status is allowed, but not _this_ incomplete status.
                throw new Error('Framebuffer checked as incomplete, but with wrong status');
            }
        } else if (
            glStatus != gl.FRAMEBUFFER_COMPLETE &&
            glsFboUtil.contins(statuses, gl.FRAMEBUFFER_COMPLETE)
        ) {
            // TODO: handle this properly, it should result in the test issuing a warning
            bufferedLogToConsole('Framebuffer object could have checked as complete but did not.');
        } else {
            // pass
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
