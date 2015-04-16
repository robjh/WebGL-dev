
// FboCompletenessTests
'use strict';
goog.provide('functional.gles3.es3fFboCompletenessTests');
goog.require('modules.shared.glsFboUtil');
goog.require('modules.shared.glsFboCompletenessTests');


goog.scope(function() {

var es3fFboCompletenessTests = functional.gles3.es3fFboCompletenessTests;
var glsFboUtil = modules.shared.glsFboUtil;
var glsFboCompletenessTests = modules.shared.glsFboCompletenessTests;
    

    es3fFboCompletenessTests.s_es3ColorRenderables = [
        // GLES3, 4.4.4: "An internal format is color-renderable if it is one of
        // the formats from table 3.12 noted as color-renderable..."
        gl.R8,     gl.RG8,     gl.RGB8,   gl.RGB565,   gl.RGBA4,   gl.RGB5_A1, gl.RGBA8,
        gl.RGB10_A2, gl.RGB10_A2UI, gl.SRGB8_ALPHA8,
        gl.R8I,    gl.R8UI,    gl.R16I,   gl.R16UI,    gl.R32I,    gl.R32UI,
        gl.RG8I,   gl.RG8UI,   gl.RG16I,  gl.RG16UI,   gl.RG32I,   gl.RG32UI,
        gl.RGBA81, gl.RGBA8UI, gl.RGB16I, gl.RGBA16UI, gl.RGBA32I, gl.RGBA32UI
    ];

    es3fFboCompletenessTests.s_es3UnsizedColorRenderables = [
        // "...or if it is unsized format RGBA or RGB."
        // See Table 3.3 in GLES3.
        glsFboUtil.GLS_UNSIZED_FORMATKEY(gl.RGBA,  gl.UNSIGNED_BYTE),
        glsFboUtil.GLS_UNSIZED_FORMATKEY(gl.RGBA,  gl.UNSIGNED_SHORT_4_4_4_4),
        glsFboUtil.GLS_UNSIZED_FORMATKEY(gl.RGBA,  gl.UNSIGNED_SHORT_5_5_5_1),
        glsFboUtil.GLS_UNSIZED_FORMATKEY(gl.RGB,   gl.UNSIGNED_BYTE),
        glsFboUtil.GLS_UNSIZED_FORMATKEY(gl.RGB,   gl.UNSIGNED_SHORT_5_6_5),
    ];


    es3fFboCompletenessTests.s_es3DepthRenderables = [
        // GLES3, 4.4.4: "An internal format is depth-renderable if it is one of
        // the formats from table 3.13."
        gl.DEPTH_COMPONENT16, gl.DEPTH_COMPONENT24, gl.DEPTH_COMPONENT32F,
        gl.DEPTH24_STENCIL8, gl.DEPTH32F_STENCIL8
    ];

    es3fFboCompletenessTests.s_es3StencilRboRenderables = [
        // GLES3, 4.4.4: "An internal format is stencil-renderable if it is
        // STENCIL_INDEX8..."
        gl.STENCIL_INDEX8
    ];

    es3fFboCompletenessTests.s_es3StencilRenderables = [
        // "...or one of the formats from table 3.13 whose base internal format is
        // DEPTH_STENCIL."
        gl.DEPTH24_STENCIL8, gl.DEPTH32F_STENCIL8,
    ];

    es3fFboCompletenessTests.s_es3TextureFloatFormats = [
        gl.RGBA32F, gl.RGBA16F, gl.R11F_G11F_B10F,
        gl.RG32F,   gl.RG16F,   gl.R32F,  gl.R16F,
        gl.RGBA16F, gl.RGB16F,  gl.RG16F, gl.R16F,
    ];

    es3fFboCompletenessTests.s_es3Formats = [
        [
            (
                glsFboUtil.FormatFlags.REQUIRED_RENDERABLE |
                glsFboUtil.FormatFlags.COLOR_RENDERABLE    |
                glsFboUtil.FormatFlags.TEXTURE_VALID
            ),
            es3fFboCompletenessTests.s_es3UnsizedColorRenderables
        ], [
            (
                glsFboUtil.FormatFlags.REQUIRED_RENDERABLE |
                glsFboUtil.FormatFlags.COLOR_RENDERABLE    |
                glsFboUtil.FormatFlags.RENDERBUFFER_VALID  |
                glsFboUtil.FormatFlags.TEXTURE_VALID
            ),
            es3fFboCompletenessTests.s_es3ColorRenderables
        ], [
            (
                glsFboUtil.FormatFlags.REQUIRED_RENDERABLE |
                glsFboUtil.FormatFlags.DEPTH_RENDERABLE    |
                glsFboUtil.FormatFlags.RENDERBUFFER_VALID  |
                glsFboUtil.FormatFlags.TEXTURE_VALID
            ),
            es3fFboCompletenessTests.s_es3DepthRenderables
        ], [
            (
                glsFboUtil.FormatFlags.REQUIRED_RENDERABLE |
                glsFboUtil.FormatFlags.STENCIL_RENDERABLE  |
                glsFboUtil.FormatFlags.RENDERBUFFER_VALID
            ),
            es3fFboCompletenessTests.s_es3StencilRboRenderables
        ], [
            (
                glsFboUtil.FormatFlags.REQUIRED_RENDERABLE |
                glsFboUtil.FormatFlags.STENCIL_RENDERABLE  |
                glsFboUtil.FormatFlags.RENDERBUFFER_VALID  |
                glsFboUtil.FormatFlags.TEXTURE_VALID
            ),
            es3fFboCompletenessTests.s_es3StencilRenderables
        ],

        // These are not color-renderable in vanilla ES3, but we need to mark them
	    // as valid for textures, since EXT_color_buffer_(half_)float brings in
	    // color-renderability and only renderbuffer-validity.
	    [
	        glsFboUtil.FormatFlags.TEXTURE_VALID,
	        es3fFboCompletenessTests.s_es3TextureFloatFormats
	    ]
	];


    // GL_EXT_color_buffer_float
    es3fFboCompletenessTests.s_extColorBufferFloatFormats = [
        gl.RGBA32F, gl.RGBA16F, gl.R11F_G11F_B10F, gl.RG32F, gl.RG16F, gl.R32F, gl.R16F,
    ];

    // GL_OES_texture_stencil8
    es3fFboCompletenessTests.s_extOESTextureStencil8 = [
        gl.STENCIL_INDEX8,
    ];

    es3fFboCompletenessTests.s_es3ExtFormats = [
        {
            extensions: 'GL_EXT_color_buffer_float',
            flags:      glsFboUtil.FormatFlags.REQUIRED_RENDERABLE |
                        glsFboUtil.FormatFlags.COLOR_RENDERABLE    |
                        glsFboUtil.FormatFlags.RENDERBUFFER_VALID,
            formats:    new glsFboUtil.Range({ array: es3fFboCompletenessTests.s_extColorBufferFloatFormats })
        }, {
            extensions: 'GL_OES_texture_stencil8',
            flags:      glsFboUtil.FormatFlags.REQUIRED_RENDERABLE |
                        glsFboUtil.FormatFlags.STENCIL_RENDERABLE  |
                        glsFboUtil.FormatFlags.TEXTURE_VALID,
            formats:    new glsFboUtil.Range({ array: es3fFboCompletenessTests.s_extOESTextureStencil8 })
        }
    ];


    es3fFboCompletenessTests.ES3Checker = (function(argv) {
        argv = argv || {};

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

        if (!argv.dont_construct) {
            this._construct();
        }

        this.check = (function(attPoint, attachment, image) {
            // TODO find imageNumSamples
            var imgSamples = imageNumSamples(image);

            if (m_numSamples == -1) {
                m_numSamples = imgSamples;
            } else {
                // GLES3: "The value of RENDERBUFFER_SAMPLES is the same for all attached
                // renderbuffers and, if the attached images are a mix of renderbuffers
                // and textures, the value of RENDERBUFFER_SAMPLES is zero."
                //
                // On creating a renderbuffer: "If _samples_ is zero, then
                // RENDERBUFFER_SAMPLES is set to zero. Otherwise [...] the resulting
                // value for RENDERBUFFER_SAMPLES is guaranteed to be greater than or
                // equal to _samples_ and no more than the next larger sample count
                // supported by the implementation."

                // Either all attachments are zero-sample renderbuffers and/or
                // textures, or none of them are.
                this.require(
                    (m_numSamples == 0) == (imgSamples == 0),
                    gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE
                );

                // If the attachments requested a different number of samples, the
                // implementation is allowed to report this as incomplete. However, it
                // is also possible that despite the different requests, the
                // implementation allocated the same number of samples to both. Hence
                // reporting the framebuffer as complete is also legal.
                canRequire(
                    m_numSamples == imgSamples,
                    gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE
                );
            }

            // "Depth and stencil attachments, if present, are the same image."
            if (attPoint == gl.DEPTH_ATTACHMENT || attPoint == gl.STENCIL_ATTACHMENT) {
                if (m_depthStencilImage == 0) {
                    m_depthStencilImage = att.imageName;
                    m_depthStencilType  = attachmentType(att);

                } else {
                    this.require(
                        m_depthStencilImage == att.imageName && m_depthStencilType == attachmentType(att),
                        gl.FRAMEBUFFER_UNSUPPORTED
                    );
                }
            }

        });

    });
    es3fFboCompletenessTests.ES3Checker.prototype = new glsFboUtil.Checker({dont_construct: true});

    es3fFboCompletenessTests.numLayersParams = (function(textureKind, numLayers, attachmentLayer) {
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
    es3fFboCompletenessTests.numLayersParams.getName = (function(params) {
        return (
            (params.textureKind == gl.TEXTURE_3D ? '3d' : '2darr') + '_' +
            params.numLayers + '_' +
            params.attachmentLayer
        );
    });
    // returns a string.
    // takes const NumLayersParams&
    es3fFboCompletenessTests.numLayersParams.getDescription = (function(params) {
        return (
            (params.textureKind == gl.TEXTURE_3D ? '3D Texture' : '2D Array Texture') + ', ' +
            params.numLayers + ' layers, ' +
            'attached layer ' + params.attachmentLayer + '.'
        );
    });
















    
    

    es3fFboCompletenessTests.NumLayersTest = (function(argv) {
        argv = argv || {};

        this.build = (function(builder, gl_ctx) {
            
            var gl_ctx = gl_ctx || gl;
            
            var target = gl_ctx.COLOR_ATTACHMENT0;
            var texCfg = builder.makeConfig(
                function(kind) {
                    if (kind == gl_ctx.TEXTURE_3D) {
                        return glsFboUtil.Texture3D;
                    }
                    if (kind == gl_ctx.TEXTURE_2D_ARRAY) {
                        return glsFboUtil.Texture2DArray;
                    }
                    throw new Error('Impossible case');
                }(this.m_params.textureKind)
            );
            
            
            texCfg.internalFormat = this.getDefaultFormat(target, gl_ctx.TEXTURE);
            
        });

        if (!argv.dont_construct) this._construct(argv);
    });
    // TODO: implement glsFboCompletenessTests class
//    es3fFboCompletenessTests.NumLayersTest.prototype = new glsFboCompletenessTests({dont_construct: true});







    es3fFboCompletenessTests.run = (function() {
    });

    

});
