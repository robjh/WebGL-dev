
// FboCompletenessTests
define([
    'modules/shared/glsFboUtil',
    'framework/common/tcuTestCase'
], function(glsFboUtil, deqpTests) {
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
        glsFboUtil.GLS_UNSIZED_FORMATKEY(gl.RGBA,  gl.UNSIGNED_BYTE),
        glsFboUtil.GLS_UNSIZED_FORMATKEY(gl.RGBA,  gl.UNSIGNED_SHORT_4_4_4_4),
        glsFboUtil.GLS_UNSIZED_FORMATKEY(gl.RGBA,  gl.UNSIGNED_SHORT_5_5_5_1),
        glsFboUtil.GLS_UNSIZED_FORMATKEY(gl.RGB,   gl.UNSIGNED_BYTE),
        glsFboUtil.GLS_UNSIZED_FORMATKEY(gl.RGB,   gl.UNSIGNED_SHORT_5_6_5),
    ];


    var s_es3DepthRenderables = [
	    // GLES3, 4.4.4: "An internal format is depth-renderable if it is one of
	    // the formats from table 3.13."
	    gl.DEPTH_COMPONENT16, gl.DEPTH_COMPONENT24, gl.DEPTH_COMPONENT32F,
	    gl.DEPTH24_STENCIL8, gl.DEPTH32F_STENCIL8
    ];

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
                glsFboUtil.FormatFlags.REQUIRED_RENDERABLE |
                glsFboUtil.FormatFlags.COLOR_RENDERABLE    |
                glsFboUtil.FormatFlags.TEXTURE_VALID
            ),
            s_es3UnsizedColorRenderables
        ], [
            (
                glsFboUtil.FormatFlags.REQUIRED_RENDERABLE |
                glsFboUtil.FormatFlags.COLOR_RENDERABLE    |
                glsFboUtil.FormatFlags.RENDERBUFFER_VALID  |
                glsFboUtil.FormatFlags.TEXTURE_VALID
            ),
            s_es3ColorRenderables
        ], [
            (
                glsFboUtil.FormatFlags.REQUIRED_RENDERABLE |
                glsFboUtil.FormatFlags.DEPTH_RENDERABLE    |
                glsFboUtil.FormatFlags.RENDERBUFFER_VALID  |
                glsFboUtil.FormatFlags.TEXTURE_VALID
            ),
            s_es3DepthRenderables
        ], [
            (
                glsFboUtil.FormatFlags.REQUIRED_RENDERABLE |
                glsFboUtil.FormatFlags.STENCIL_RENDERABLE  |
                glsFboUtil.FormatFlags.RENDERBUFFER_VALID
            ),
            s_es3StencilRboRenderables
        ], [
            (
                glsFboUtil.FormatFlags.REQUIRED_RENDERABLE |
                glsFboUtil.FormatFlags.STENCIL_RENDERABLE  |
                glsFboUtil.FormatFlags.RENDERBUFFER_VALID  |
                glsFboUtil.FormatFlags.TEXTURE_VALID
            ),
            s_es3StencilRenderables
        ],

        // These are not color-renderable in vanilla ES3, but we need to mark them
	    // as valid for textures, since EXT_color_buffer_(half_)float brings in
	    // color-renderability and only renderbuffer-validity.
	    [
	        glsFboUtil.FormatFlags.TEXTURE_VALID,
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
            flags:      glsFboUtil.FormatFlags.REQUIRED_RENDERABLE |
                        glsFboUtil.FormatFlags.COLOR_RENDERABLE    |
                        glsFboUtil.FormatFlags.RENDERBUFFER_VALID,
            formats:    glsFboUtil.range({ array: s_extColorBufferFloatFormats })
        }, {
            extensions: 'GL_OES_texture_stencil8',
            flags:      glsFboUtil.FormatFlags.REQUIRED_RENDERABLE |
                        glsFboUtil.FormatFlags.STENCIL_RENDERABLE  |
                        glsFboUtil.FormatFlags.TEXTURE_VALID,
            formats:    glsFboUtil.range({ array: s_extOESTextureStencil8 })
        }
    ];


    var ES3Checker = (function(dont_construct_flag) {
        var parent = {
            _construct: this._construct
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
            // TODO
        });

    });
    ES3Checker.prototype = new glsFboUtil.Checker(true);

    var numLayersParams = (function(textureKind, numLayers, attachmentLayer) {
        if (typeof(attachmentLayer) == 'undefined') {
            textureKind     = null;
            numLayers       = null;
            attachmentLayer = null;
        }
        return {
            textureKind:     textureKind,     //< GL_TEXTURE_3D or GL_TEXTURE_2D_ARRAY
            numLayers:       numLayers,       //< Number of layers in texture
            attachmentLayer: attachmentLayer  //< Layer referenced by attachment
        };
    });
    // returns a string.
    // takes const NumLayersParams&
    numLayersParams.getName = (function(params) {
        return (
            (params.textureKind == gl.TEXTURE_3D ? '3d' : '2darr') + '_' +
            params.numLayers + '_' +
            params.attachmentLayer
        );
    });
    // returns a string.
    // takes const NumLayersParams&
    numLayersParams.getDescription = (function(params) {
        return (
            (params.textureKind == gl.TEXTURE_3D ? '3D Texture' : '2D Array Texture') + ', ' +
            params.numLayers + ' layers, ' +
            'attached layer ' + params.attachmentLayer + '.'
        );
    });
















    var TestBase = (function(opt) {

        this.params = null;

        this.getContext = this.getState;

        this._construct = (function(opt) {

        });



        if (opt.dont_construct !== true) this._construct(opt);

    });
    TestBase.prototype = new deqpTests.DeqpTest();








    var run = (function() {
    });

    return {
        tmp: {
            tmp: 1,
            ES3Checker: ES3Checker,
            numLayersParams: numLayersParams,
        },
        run: run,
    };

});
