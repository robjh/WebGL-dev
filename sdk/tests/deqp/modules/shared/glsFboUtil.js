
// glsFBOU
define([], function() {
    'use strict';
    
    var remove_from_array = (function(array, value) {
        var index = array.indexOf(value);
        if (index != -1) {
            array.splice(index, 1)  
        }
    });
    
    var Range = (function(opt) {
        
        var m_begin  = opt.begin || 0;
        var m_end    = opt.end   || opt.array.length;
        
        this.array = (function() {
            return opt.array;
        });
        this.begin = (function() {
            return m.begin;
        });
        this.end = (function() {
            return m.end;
        });
        
    });
    
    var ImageFormat = (function(argv) {
        argv = argv || {};
        
        this._construct = (function(argv) {
            this.format = null;
            //! Type if format is unsized, GL_NONE if sized.
            this.unsizedType = null;
        });
        
        this.lessthan = (function(other) {
            return (
                (this.format <  other.format) ||
                (this.format == other.format && this.unsizeType < other.unsizedType)
            );
        });
        
        this.none = (function(glctx) {
            glctx = glctx || gl;
            this.format      = glctx.NONE;
            this.unsizedType = glctx.NONE;
        });
        
        if (!argv.dont_construct) this._construct(argv);
    });
    
    var Config = (function(argv) {
        argv = argv || {};
        
        this._construct = (function(argv) {
            this.type = argv.type || 'config';
            this.target = argv.target || Config.s_target.NONE;
        });
        
        if (!argv.dont_construct) this._construct(argv);
    });
    Config.s_target = {
        NONE:             0,
        RENDERBUFFER:     1,
        TEXTURE_2D:       2,
        TEXTURE_CUBE_MAP: 3,
        TEXTURE_3D:       4,
        TEXTURE_2D_ARRAY: 5
    };
    
    var Image = (function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = (function(argv) {
            argv.type = argv.type || 'image';
            parent._construct(argv);
            this.type = argv.type;
            this.width  = 0;
            this.height = 0;
            this.internalFormat = new ImageFormat();
        });
        
        if (!argv.dont_construct) this._construct(argv);
    });
    Image.prototype = new Config({dont_construct: true});
    
    var RenderBuffer = (function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = (function(argv) {
            argv.type = argv.type   || 'renderbuffer';
            argv.type = argv.target || Config.s_target.RENDERBUFFER;
            parent._construct(argv);
            this.numSamples = 0;
        });
        
        if (!argv.dont_construct) this._construct(argv);
    });
    RenderBuffer.prototype = new Image({dont_construct: true});
    
    var Texture = (function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = (function(argv) {
            argv.type = argv.type || 'texture';
            parent._construct(argv);
            this.numLevels = 1;
        });
        
        if (!argv.dont_construct) this._construct(argv);
    });
    Texture.prototype = new Image({dont_construct: true});
    
    var TextureLayered = (function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = (function(argv) {
            argv.type = argv.type || 'texturelayered';
            parent._construct(argv);
            this.numLayers = 1;
        });
        
        if (!argv.dont_construct) this._construct(argv);
    });
    TextureLayered.prototype = new Texture({dont_construct: true});
    
//    var glTarget = (function() {});
    
    var glsup = (function() {
    
    //  initFlat: (function() {}),
    //  initLayered: (function() {}),
    //  init: (function() {}),
    
        var glCreate = (function(cfg, gl_ctx) {
            gl_ctx = gl_ctx || gl;
            
            if (cfg.type == 'renderbuffer') {
                var ret = gl_ctx.createRenderBuffer();
                gl_ctx.bindRenderBuffer(gl.RENDERBUFFER, ret);
                
                if (cfg.numSamples == 0) {
                    gl_ctx.renderBufferStorage(
                        gl_ctx.RENDERBUFFER,
                        cfg.internalFormat.format,
                        cfg.width, cfg.height
                    );
                } else {
                    gl_ctx.renderbufferStorageMultisample(
                    gl_ctx.RENDERBUFFER,
                        cfg.numSamples,
                        cfg.internalFormat.format,
                        cfg.width, cfg.height
                    );
                }
                gl_ctx.bindRenderbuffer(gl_ctx.RENDERBUFFER, 0);
                
            } else if (cfg.type == 'texture') {
                var ret = gl_ctx.createTexture();
                gl_ctx.bindTexture(glTarget(cfg, gl_ctx), ret);
                glInit(tex, gl_ctx);
                gl_ctx.bindTexture(glTarget(cfg, gl_ctx), 0);
            
            } else {
                throw new Error('Impossible image type');
            }
        });
    
        var glTarget = (function(cfg, gl_ctx) {
            gl_ctx = gl_ctx || gl;
            switch(cfg.target) {
                case Config.s_target.RENDERBUFFER:     return gl_ctx.RENDERBUFFER;
                case Config.s_target.TEXTURE_2D:       return gl_ctx.TEXTURE_2D;
                case Config.s_target.TEXTURE_CUBE_MAP: return gl_ctx.TEXTURE_CUBE_MAP;
                case Config.s_target.TEXTURE_3D:       return gl_ctx.TEXTURE_3D;
                case Config.s_target.TEXTURE_2D_ARRAY: return gl_ctx.TEXTURE_2D_ARRAY;
                default: throw new Error('Impossible image type.');
            }
            return gl_ctx.NONE;
        });
    
        return {
            create: glCreate,
            remove: glDelete,
            target: glTarget,
        };
    
    })();
    

    
    
    var formatkey = (function(format, type) {
        return (type << 16 | format) & 0xFFFFFFFF;
    });
    
    var FormatFlags = {
        ANY_FORMAT:           0x00,
        COLOR_RENDERABLE:     0x01,
        DEPTH_RENDERABLE:     0x02,
        STENCIL_RENDERABLE:   0x04,
        RENDERBUFFER_VALID:   0x08,
        TEXTURE_VALID:        0x10,
        REQUIRED_RENDERABLE:  0x20, //< Without this, renderability is allowed, not required.
    };
    
    var Framebuffer = (function(argv) {
        
        argv = argv || {};
        this._construct = (function(argv) {
            this.attachments = argv.attachments  || {};
            this.textures    = argv.textures     || {};
            this.rbos        = argv.rbos         || {};
        });
        
        this.attach = (function(attPoint, att) {
            if (!att) {
                this.attachments[attPoint] = undefined;
            } else {
                this.attachments[attPoint] = att;
            }
        });
        this.setTexture = (function(texName, texCfg) {
            this.textures[texName] = texCfg;
        });
        this.setRbo = (function(rbName, rbCfg) {
            this.rbos[rbName] = rbCfg;
        });
        this.getImage = (function(type, imgName) {
            switch (type) {
                case gl.TEXTURE:      return lookupDefault(this.textures, imgName, null);
                case gl.RENDERBUFFER: return lookupDefault(this.rbos,     imgName, null);
                default: DE_ASSERT(false, "Bad image type.");
            }
            return null;
        });
        
        if (!argv.dont_construct) this._construct(argv);
    });
    
    var FboBuilder = (function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = (function(argv) {
            parent._construct(argv);
            
            if (argv.fbo === undefined || argv.target === undefined) {
                throw new Error('Invalid args.');
            }
            
            this.m_gl      = argv.gl || gl;
            this.m_target  = argv.target;
            this.m_configs = null;
            this.m_error   = this.m_gl.NO_ERROR;
            
            this.m_gl.bindFramebuffer(this.m_target, argv.fbo);
        });
        
        this.deinit = (function() {
            for (var name in this.textures) {
                glDelete(this.textures[name], name, this.m_gl);
            }
            for (var name in this.rbos) {
                glDelete(this.rbos[name], name, this.m_gl);
            }
            this.m_gl.bindFramebuffer(this.m_target, 0);
        });
        
        // GLenum attPoint, const Attachment* att
        this.glAttach = (function(attPoint, att) {
            if (!att) {
                this.m_gl.framebufferRenderbuffer(this.m_target, attPoint, this.m_gl.RENDERBUFFER, 0);
            } else {
                attachAttachment(att, attPoint, this.m_gl);
            }
            this.checkError();
            attach(attPoint, att);
        });
        
        // const Texture& texCfg
        this.glCreateTexture = (function(texCfg) {
            var texName = glCreate(texCfg, this.m_gl);
            checkError();
            setTexture(texName, texCfg);
            return texName;
        });
        
        // const Renderbuffer& rbCfg
        this.glCreateRbo = (function(rbCfg) {
            var rbName = glCreate(rbCfg, this.m_gl);
            checkError();
            setRbo(rbName, rbCfg);
            return rbName;
        });
        
        
        
        
        this.checkError = (function() {
            var error = m_gl.getError();
            if (error != m_gl.NO_ERROR && this.m_error != m_gl.NO_ERROR) {
                this.m_error = error;
            }
        });
        
        if (!argv.dont_construct) this._construct(argv);
    });
    FboBuilder.prototype = new Framebuffer({dont_construct: true});
    
    var Checker = (function() {
        
        // Allowed return values for gl.CheckFramebufferStatus
        // formarly an std::set
        var m_statusCodes = [];
        
        this._construct = (function() {
            m_statusCodes.push(gl.FRAMEBUFFER_COMPLETE);
        });
        
        
        this.require = (function(condition, error) {
            if (!condition) {
                remove_from_array(m_statusCodes, gl.FRAMEBUFFER_COMPLETE);
                m_statusCodes.push(error);
            }
        });
        this.canRequire = (function(condition, error) {
            if (!condition) {
                m_statusCodes.push(error);
            }
        });
        this.getStatusCodes = (function() {
            return m_statusCodes;
        });
        
//      this.check = (function(attPoint, attachment, image) =0); virtual
        
    });
    
    return {
        Range:                  Range,
        formatkey:              formatkey,
        GLS_UNSIZED_FORMATKEY:  formatkey,
        FormatFlags:            FormatFlags,
        Config:                 Config,
        Image:                  Image,
        RenderBuffer:           RenderBuffer,
        Texture:                Texture,
        TextureFlat:            Texture,
        Texture2D:              Texture, // TextureFlat
        TextureCubeMap:         Texture, // TextureFlat
        TextureLayered:         TextureLayered,
        Texture3D:              TextureLayered,
        Texture2DArray:         TextureLayered,
        Checker:                Checker
    };

});
