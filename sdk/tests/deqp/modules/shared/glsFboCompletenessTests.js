'use strict';
goog.provide('modules.shared.glsFboCompletenessTests');
goog.require('modules.shared.glsFboUtil');
goog.require('framework.common.tcuTestCase');


goog.scope(function() {

    var glsFboCompletenessTests = modules.shared.glsFboCompletenessTests;
    var glsFboUtil = modules.shared.glsFboUtil;
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
													 
	void					addFormats				(FormatEntries fmtRange);
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
    
    
    
    
    glsFboCompletenessTests.TestBase = function() {
        tcuTestCase.DeqpTest.call(this);
        this.params = null;

        this.getContext = this.getState;

        console.log("glsFboCompletenessTests.TestBase Constructor");
        
    };
    glsFboCompletenessTests.TestBase.prototype = Object.create(tcuTestCase.DeqpTest);
    glsFboCompletenessTests.TestBase.prototype.constructor = glsFboCompletenessTests.TestBase;
    
    // GLenum attPoint, GLenum bufType
    glsFboCompletenessTests.TestBase.getDefaultFormat = function(attPoint, bufType, gl_ctx) {
        gl_ctx = gl_ctx || gl;
        
        if (bufType == gl_ctx.NONE) {
            return glsFboUtil.ImageFormat.none();
        }
        
    };
    
    /*
    return {
        glsFboCompletenessTests.Context:  glsFboCompletenessTests.Context,
        glsFboCompletenessTests.TestBase: glsFboCompletenessTests.TestBase,
    }
    //*/
    
});
