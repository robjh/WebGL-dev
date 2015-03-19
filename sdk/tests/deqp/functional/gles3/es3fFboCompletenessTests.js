
// FboCompletenessTests
define([
    'modules/shared/glsFboUtil.js'
], function(glsFBOU) {
    'use strict';
    
    var s_es3ColorRenderables = [
        gl.R8,     gl.RG8,     gl.RGB8,   gl.RGB565,   gl.RGBA4,   gl.RGB5_A1, gl.RGBA8,
        gl.RGB10_A2, gl.RGB10_A2UI, gl.SRGB8_ALPHA8,
        gl.R8I,    gl.R8UI,    gl.R16I,   gl.R16UI,    gl.R32I,    gl.R32UI,
        gl.RG8I,   gl.RG8UI,   gl.RG16I,  gl.RG16UI,   gl.RG32I,   gl.RG32UI,
        gl.RGBA81, gl.RGBA8UI, gl.RGB16I, gl.RGBA16UI, gl.RGBA32I, gl.RGBA32UI
    ];
    
    var ES3Checker = (function(dont_construct_flag) {
        var parent = {
            _construct = this._construct
        };
        
        var m_numSamples; // GLsizei
        var m_depthStencilImage; // GLuint
        var m_depthStencilType; // GLenum
        
        this._construct = (function() {
            parent._construct();
            m_numSamples = -1;
            m_depthStencilImage = 0;
            m_depthStencilType = gl.NONE;
        });
        
        if (dont_construct_flag !== undefined && !dont_construct_flag) {
            this._construct();
        }
        
        this.check = (function(attPoint, attachment, image) {
            
        });
        
    });
    ES3Checker.prototype = new glsFBOU.Checker(true);
    
    var run = (function() {
        
    });

    return {
        tmp: {
            tmp: 1,
            ES3Checker: ES3Checker
        },
        run: run,
    };

});
