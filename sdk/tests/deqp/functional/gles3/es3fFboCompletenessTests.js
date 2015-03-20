
// FboCompletenessTests
define([
    'modules/shared/glsFboUtil.js'
], function(glsFBOU) {
    'use strict';
    
    var s_es3ColorRenderables = [
        // GLES3, 4.4.4: "An internal format is color-renderable if it is one of
	    // the formats from table 3.12 noted as color-renderable..."
        gl.R8,     gl.RG8,     gl.RGB8,   gl.RGB565,   gl.RGBA4,   gl.RGB5_A1, gl.RGBA8,
        gl.RGB10_A2, gl.RGB10_A2UI, gl.SRGB8_ALPHA8,
        gl.R8I,    gl.R8UI,    gl.R16I,   gl.R16UI,    gl.R32I,    gl.R32UI,
        gl.RG8I,   gl.RG8UI,   gl.RG16I,  gl.RG16UI,   gl.RG32I,   gl.RG32UI,
        gl.RGBA81, gl.RGBA8UI, gl.RGB16I, gl.RGBA16UI, gl.RGBA32I, gl.RGBA32UI
    ];
    
    var s_es3UnsizedColorRenderables = [
        // "...or if it is unsized format RGBA or RGB."
        // See Table 3.3 in GLES3.
        glsFBOU.GLS_UNSIZED_FORMATKEY(gl.RGBA,  gl.UNSIGNED_BYTE),
        glsFBOU.GLS_UNSIZED_FORMATKEY(gl.RGBA,  gl.UNSIGNED_SHORT_4_4_4_4),
        glsFBOU.GLS_UNSIZED_FORMATKEY(gl.RGBA,  gl.UNSIGNED_SHORT_5_5_5_1),
        glsFBOU.GLS_UNSIZED_FORMATKEY(gl.RGB,   gl.UNSIGNED_BYTE),
        glsFBOU.GLS_UNSIZED_FORMATKEY(gl.RGB,   gl.UNSIGNED_SHORT_5_6_5),
    ];

    
    var s_es3DepthRenderables = [
	    // GLES3, 4.4.4: "An internal format is depth-renderable if it is one of
	    // the formats from table 3.13."
	    gl.DEPTH_COMPONENT16, gl.DEPTH_COMPONENT24, gl.DEPTH_COMPONENT32F,
	    gl.DEPTH24_STENCIL8, gl.DEPTH32F_STENCIL8
    };
    
    var s_es3StencilRboRenderables = [
    	// GLES3, 4.4.4: "An internal format is stencil-renderable if it is
	    // STENCIL_INDEX8..."
	    gl.STENCIL_INDEX8
    ];
    
    var s_es3StencilRenderables = [
	    // "...or one of the formats from table 3.13 whose base internal format is
	    // DEPTH_STENCIL."
	    gl.DEPTH24_STENCIL8, gl.DEPTH32F_STENCIL8,
    ];
    
    var s_es3TextureFloatFormats = [
	    gl.RGBA32F, gl.RGBA16F, gl.R11F_G11F_B10F,
	    gl.RG32F,   gl.RG16F,   gl.R32F,  gl.R16F,
	    gl.RGBA16F, gl.RGB16F,  gl.RG16F, gl.R16F,
    ];
    
    var s_es3Formats = [
        [
            (
                glsFBOU.FormatFlags.REQUIRED_RENDERABLE |
                glsFBOU.FormatFlags.COLOR_RENDERABLE    |
                glsFBOU.FormatFlags.TEXTURE_VALID
            ),
            s_es3UnsizedColorRenderables
        ], [
            (
                glsFBOU.FormatFlags.REQUIRED_RENDERABLE |
                glsFBOU.FormatFlags.COLOR_RENDERABLE    |
                glsFBOU.FormatFlags.RENDERBUFFER_VALID  |
                glsFBOU.FormatFlags.TEXTURE_VALID
            ),
            s_es3ColorRenderables
        ], [
            (
                glsFBOU.FormatFlags.REQUIRED_RENDERABLE |
                glsFBOU.FormatFlags.DEPTH_RENDERABLE    |
                glsFBOU.FormatFlags.RENDERBUFFER_VALID  |
                glsFBOU.FormatFlags.TEXTURE_VALID
            ),
            s_es3DepthRenderables
        ], [
            (
                glsFBOU.FormatFlags.REQUIRED_RENDERABLE |
                glsFBOU.FormatFlags.STENCIL_RENDERABLE  |
                glsFBOU.FormatFlags.RENDERBUFFER_VALID
            ),
            s_es3StencilRboRenderables
        ], [
            (
                glsFBOU.FormatFlags.REQUIRED_RENDERABLE |
                glsFBOU.FormatFlags.STENCIL_RENDERABLE  |
                glsFBOU.FormatFlags.RENDERBUFFER_VALID  |
                glsFBOU.FormatFlags.TEXTURE_VALID
            ),
            s_es3StencilRenderables
        ],
        
        // These are not color-renderable in vanilla ES3, but we need to mark them
	    // as valid for textures, since EXT_color_buffer_(half_)float brings in
	    // color-renderability and only renderbuffer-validity.
	    [
	        glsFBOU.FormatFlags.TEXTURE_VALID,
	        s_es3TextureFloatFormats
	    ]
	];
    
    
    // GL_EXT_color_buffer_float
    var s_extColorBufferFloatFormats = [
    	gl.RGBA32F, gl.RGBA16F, gl.R11F_G11F_B10F, gl.RG32F, gl.RG16F, gl.R32F, gl.R16F,
    ];

    // GL_OES_texture_stencil8
    var s_extOESTextureStencil8 = [
    	gl.STENCIL_INDEX8,
    ];
    
    var s_es3ExtFormats = [
        {
            extensions: 'GL_EXT_color_buffer_float',
            flags:      glsFBOU.FormatFlags.REQUIRED_RENDERABLE |
                        glsFBOU.FormatFlags.COLOR_RENDERABLE    |
                        glsFBOU.FormatFlags.RENDERBUFFER_VALID,
            formats:    glsFBOU.range({ array: s_extColorBufferFloatFormats })
        }, {
            extensions: 'GL_OES_texture_stencil8',
            flags:      glsFBOU.FormatFlags.REQUIRED_RENDERABLE |
                        glsFBOU.FormatFlags.STENCIL_RENDERABLE  |
                        glsFBOU.FormatFlags.TEXTURE_VALID,
            formats:    glsFBOU.range({ array: s_extOESTextureStencil8 })
        }
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
