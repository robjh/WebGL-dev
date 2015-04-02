
// glsFBOU
define(['framework/opengl/gluTextureUtil'], function(gluTextureUtil) {
    'use strict';

    var FormatDB = function(argv) {
        argv = argv || {};
        var _construct = function(argv) {
            this.m_map = {};
        };
        
        this.addFormat = function(format, flags) {
            this.m_map[format]  = this.m_map[format] || 0;
            this.m_map[format] |= flags;
        };
        this.getFormats = function(requirements) {
            var ret = [];
            for (var index in this.m_map) {
                if (this.m_map[index] & requirements == requirements) {
                    ret.push(index);
                }
            }
            return ret;
        };
        this.getFormatInfo = function(format, fallback) {
            return lookupDefault(this.m_map, format, fallback);
        };
        
        
        if (!argv.dont_construct) this._construct(argv);
    };
    
    var lookupDefault = function(map, key, fallback) {
        return (map[key] !== undefined) ? map[key] || fallback;
    };
    
    // db is a FormatDB, stdFmts is a range object
    var addFormats = function(db, stdFmts) {
    
        for (var i = stdFmts.begin(); i < stdFmts.end(); ++i) {
            var stdFmt_current = stdFmts.get(i);
		    for (var j = stdFmt_current.second.begin(); j < stdFmt_current.second.end(); ++j) {
			    var formatKey_current = stdFmt_current.second.get(j);
			    db.addFormat(formatKeyInfo(formatKey_current.second), stdFmt_current.first);
			}
	    }
    
    };
    
    
    
    /* TODO: This next. looks like helpers for FormatDB objects
    
void addFormats (FormatDB& db, FormatEntries stdFmts)
{
	for (const FormatEntry* it = stdFmts.begin(); it != stdFmts.end(); it++)
	{
		for (const FormatKey* it2 = it->second.begin(); it2 != it->second.end(); it2++)
			db.addFormat(formatKeyInfo(*it2), it->first);
	}
}

void addExtFormats (FormatDB& db, FormatExtEntries extFmts, const RenderContext* ctx)
{
	const UniquePtr<ContextInfo> ctxInfo(ctx != DE_NULL ? ContextInfo::create(*ctx) : DE_NULL);
	for (const FormatExtEntry* it = extFmts.begin(); it != extFmts.end(); it++)
	{
		bool supported = true;
		if (ctxInfo)
		{
			istringstream tokenStream(string(it->extensions));
			istream_iterator<string> tokens((tokenStream)), end;

			while (tokens != end)
			{
				if (!ctxInfo->isExtensionSupported(tokens->c_str()))
				{
					supported = false;
					break;
				}
				++tokens;
			}
		}
		if (supported)
			for (const FormatKey* i2 = it->formats.begin(); i2 != it->formats.end(); i2++)
				db.addFormat(formatKeyInfo(*i2), FormatFlags(it->flags));
	}
}

FormatFlags formatFlag (GLenum context)
{
	switch (context)
	{
		case GL_NONE:
			return FormatFlags(0);
		case GL_RENDERBUFFER:
			return RENDERBUFFER_VALID;
		case GL_TEXTURE:
			return TEXTURE_VALID;
		case GL_STENCIL_ATTACHMENT:
			return STENCIL_RENDERABLE;
		case GL_DEPTH_ATTACHMENT:
			return DEPTH_RENDERABLE;
		default:
			DE_ASSERT(context >= GL_COLOR_ATTACHMENT0 && context <= GL_COLOR_ATTACHMENT15);
			return COLOR_RENDERABLE;
	}
}
    
    
    ------------------------------------------------------------------------
    //*/
    
    var remove_from_array = function(array, value) {
        var index = array.indexOf(value);
        if (index != -1) {
            array.splice(index, 1)  
        }
    };
    
    // this wont work if argv.array is an object
    var Range = function(argv) {
        
        var m_begin  = argv.begin || 0;
        var m_end    = argv.end   || argv.array.length;
        
        this.array = function() {
            return argv.array;
        };
        this.begin = function() {
            return m.begin;
        };
        this.end = function() {
            return m.end;
        };
        this.get = function(id) {
            return {
                first: id,
                second: argv.array[id]
            };
        }
        
    };
    
    var ImageFormat = function(argv) {
        argv = argv || {};
        
        this._construct = function(argv) {
            this.format      = argv.format || null;
            //! Type if format is unsized, GL_NONE if sized.
            this.unsizedType = argv.unsizedType || null;
        };
        
        this.lessthan = function(other) {
            return (
                (this.format <  other.format) ||
                (this.format == other.format && this.unsizeType < other.unsizedType)
            );
        };
        
        this.none = function(gl_ctx) {
            gl_ctx = gl_ctx || gl;
            this.format      = gl_ctx.NONE;
            this.unsizedType = gl_ctx.NONE;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    
    // where key is a FormatKey, and a FormatKey is a 32bit int.
    var formatKeyInfo = function(key) {
        return new ImageFormat({
            format:      (key & 0x0000ffff),
            unsizedType: (key & 0xffff0000) >> 16
        });
    };
    
    var Config = function(argv) {
        argv = argv || {};
        
        this._construct = function(argv) {
            this.type = argv.type ? argv.type | Config.s_types.CONFIG : Config.s_types.CONFIG;
            this.target = argv.target || Config.s_target.NONE;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    Config.s_target = {
        NONE:              0,
        RENDERBUFFER:      1,
        TEXTURE_2D:        2,
        TEXTURE_CUBE_MAP:  3,
        TEXTURE_3D:        4,
        TEXTURE_2D_ARRAY:  5,
        
        FRAMEBUFFER:       6
    };
    
    // the c++ uses dynamic casts to determain if an object inherits from a
    // given class. Here, each class' constructor assigns a bit to obj.type.
    // look for the bit to see if an object inherits that class.
    Config.s_types = {
        CONFIG:            0x000001,
        
        IMAGE:             0x000010,
        RENDERBUFFER:      0x000020,
        TEXTURE:           0x000040,
        TEXTURE_FLAT:      0x000080,
        TEXTURE_2D:        0x000100,
        TEXTURE_CUBE_MAP:  0x000200,
        TEXTURE_LAYERED:   0x000400,
        TEXTURE_3D:        0x000800,
        TEXTURE_2D_ARRAY:  0x001000,
        
        ATTACHMENT:        0x010000,
        ATT_RENDERBUFFER:  0x020000,
        ATT_TEXTURE:       0x040000,
        ATT_TEXTURE_FLAT:  0x080000,
        ATT_TEXTURE_LAYER: 0x100000,
        
        UNUSED:          0xFFE0E00E,
    };
    
    var Image = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | Config.s_types.IMAGE : Config.s_types.IMAGE;
            parent._construct(argv);
            this.width  = 0;
            this.height = 0;
            this.internalFormat = new ImageFormat();
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    Image.prototype = new Config({dont_construct: true});
    
    var RenderBuffer = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type   = argv.type ? argv.type | Config.s_types.RENDERBUFFER : Config.s_types.RENDERBUFFER;
            argv.target = argv.target || Config.s_target.RENDERBUFFER;
            parent._construct(argv);
            this.numSamples = 0;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    RenderBuffer.prototype = new Image({dont_construct: true});
    
    var Texture = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | Config.s_types.TEXTURE : Config.s_types.TEXTURE;
            parent._construct(argv);
            this.numLevels = 1;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    Texture.prototype = new Image({dont_construct: true});
    
    var TextureFlat = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | Config.s_types.TEXTURE_FLAT : Config.s_types.TEXTURE_FLAT;
            parent._construct(argv);
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    TextureFlat.prototype = new Texture({dont_construct: true});
    
    var Texture2D = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.target = argv.target || Config.s_target.TEXTURE_2D;
            argv.type = argv.type ? argv.type | Config.s_types.TEXTURE_2D : Config.s_types.TEXTURE_2D;
            parent._construct(argv);
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    Texture2D.prototype = new TextureFlat({dont_construct: true});
    
    var TextureCubeMap = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.target = argv.target || Config.s_target.TEXTURE_CUBE_MAP;
            argv.type = argv.type ? argv.type | Config.s_types.TEXTURE_CUBE_MAP : Config.s_types.TEXTURE_CUBE_MAP;
            parent._construct(argv);
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    TextureCubeMap.prototype = new TextureFlat({dont_construct: true});
    
    var TextureLayered = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | Config.s_types.TEXTURE_LAYERED : Config.s_types.TEXTURE_LAYERED;
            parent._construct(argv);
            this.numLayers = 1;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    TextureLayered.prototype = new Texture({dont_construct: true});
    
    var Texture3D = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.target = argv.target || Config.s_target.TEXTURE_3D;
            argv.type = argv.type ? argv.type | Config.s_types.TEXTURE_3D : Config.s_types.TEXTURE_3D;
            parent._construct(argv);
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    Texture3D.prototype = new TextureLayered({dont_construct: true});
    
    var Texture2DArray = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.target = argv.target || Config.s_target.TEXTURE_2D_ARRAY;
            argv.type = argv.type ? argv.type | Config.s_types.TEXTURE_2D_ARRAY : Config.s_types.TEXTURE_2D_ARRAY;
            parent._construct(argv);
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    Texture2DArray.prototype = new TextureLayered({dont_construct: true});
    
    
    // Attachments
    var Attachment = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | Config.s_types.ATTACHMENT : Config.s_types.ATTACHMENT;
            argv.target = argv.target || Config.s_target.FRAMEBUFFER;
            parent._construct(argv);
            this.imageName = 0;
        };
        
        // this function is declared, but has no definition/is unused in the c++
        // var isComplete = (function(attPoint, image, vfr) { });
        
        if (!argv.dont_construct) this._construct(argv);
    };
    Attachment.prototype = new Config({dont_construct: true});
    
    var RenderbufferAttachment = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | Config.s_types.ATT_RENDERBUFFER : Config.s_types.ATT_RENDERBUFFER;
            parent._construct(argv);
            this.renderbufferTarget = Config.s_target.RENDERBUFFER;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    RenderbufferAttachment.prototype = new Attachment({dont_construct: true});
    
    var TextureAttachment = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | Config.s_types.ATT_TEXTURE : Config.s_types.ATT_TEXTURE;
            parent._construct(argv);
            this.level = 0;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    TextureAttachment.prototype = new Attachment({dont_construct: true});
    
    var TextureFlatAttachment = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | Config.s_types.ATT_TEXTURE_FLAT : Config.s_types.ATT_TEXTURE_FLAT;
            parent._construct(argv);
            this.texTarget = Config.s_target.NONE;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    TextureFlatAttachment.prototype = new TextureAttachment({dont_construct: true});
    
    var TextureLayerAttachment = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | Config.s_types.ATT_TEXTURE_LAYER : Config.s_types.ATT_TEXTURE_LAYER;
            parent._construct(argv);
            this.layer = 0;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    TextureLayerAttachment.prototype = new TextureAttachment({dont_construct: true});
    
    
    // these are a collection of helper functions for creating various gl textures.
    var glsup = function() {
    
        var glInit = function(cfg, gl_ctx) {
            if (cfg.target == Config.s_target.TEXTURE_2D) {
                glInitFlat(cfg, glTarget, gl_ctx);
                
            } else if (cfg.target == Config.s_target.TEXTURE_CUBE_MAP) {
                for (
                    var i = gl_ctx.TEXTURE_CUBE_MAP_NEGATIVE_X;
                    i <= gl_ctx.TEXTURE_CUBE_MAP_POSITIVE_Z;
                    ++i
                ) {
                    glInitFlat(cfg, i, gl_ctx);
                }
                
            } else if (cfg.target == Config.s_target.TEXTURE_3D) {
                glInitLayered(cfg, 2, gl_ctx);
            
            } else if (cfg.target == Config.s_target.TEXTURE_2D_ARRAY) {
                glInitLayered(cfg, 1, gl_ctx);
            
            }
        };
        
        var glInitFlat = function(cfg, target, gl_ctx) {
            var format = transferImageFormat(cfg.internalFormat, gl_ctx);
            var w = cfg.width;
            var h = cfg.height;
            for (var level = 0; level < cfg.numLevels; ++level) {
                gl_ctx.texImage2D(
                    target, level, cfg.internalFormat.format,
                    w, h, 0,format.format, format.dataType
                );
                w = Math.max(1, w / 2);
                h = Math.max(1, h / 2);
            }
        };
        
        var glInitLayered = function(cfg, depth_divider, gl_ctx) {
            var format = transferImageFormat(cfg.internalFormat, gl_ctx);
            var w = cfg.width;
            var h = cfg.height;
            var depth = cfg.numLayers;
            for (var level = 0; level < cfg.numLevels; ++level) {
                gl_ctx.texImage3D(
                    glTarget(cfg), level, cfg.internalFormat.format,
                    w, h, depth, 0, format.format, format.dataType
                );
                w = Math.max(1, w / 2);
                h = Math.max(1, h / 2);
                depth = dMath.max(1, depth / depth_divider);
            }
        };
    
        var glCreate = function(cfg, gl_ctx) {
            gl_ctx = gl_ctx || gl;
            
            if (cfg.type & Config.s_types.RENDERBUFFER) {
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
                
            } else if (cfg.type & Config.s_types.TEXTURE) {
                var ret = gl_ctx.createTexture();
                gl_ctx.bindTexture(glTarget(cfg, gl_ctx), ret);
                glInit(tex, gl_ctx);
                gl_ctx.bindTexture(glTarget(cfg, gl_ctx), 0);
            
            } else {
                throw new Error('Impossible image type');
            }
        };
    
        var glTarget = function(cfg, gl_ctx) {
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
        };
        
        var glDelete = function(cfg, img, gl_ctx) {
            if (cfg.type & Config.s_types.RENDERBUFFER)
                gl.deleteRenderbuffers(1, img);
            else if (cfg.type & Config.s_types.TEXTURE)
                gl.deleteTextures(1, img);
            else
                DE_ASSERT(!"Impossible image type");
        };
        
        return {
            create: glCreate,
            remove: glDelete,
        };
    
    }();
    
    var attachAttachment = function(att, attPoint, gl_ctx) {
        gl_ctx = gl_ctx || gl;
        
        var mask = (
            Config.s_types.ATT_RENDERBUFFER |
            Config.s_types.ATT_TEXTURE_FLAT |
            Config.s_types.ATT_TEXTURE_LAYER
        );
        
        switch (att.type & mask) {
            case Config.s_types.ATT_RENDERBUFFER:
                gl_ctx.framebufferRenderbuffer(
                    att.target, attPoint, att.renderbufferTarget, att.imageName
                );
                break;
            case Config.s_types.ATT_TEXTURE_FLAT:
                gl_ctx.framebufferTexture2D(
                    att.target, attPoint, att.texTarget, att.imageName, att.level
                );
                break;
            case Config.s_types.ATT_TEXURE_LAYER:
                gl_ctx.framebufferTextureLayer(
                    att.target, attPoint, att.imageName, att.level, att.layer
                );
                break;
            default:
                throw new Error('Impossible attachment type');
        }
        
    };

    var attachmentType = function(att, gl_ctx) {
        gl_ctx = gl_ctx || gl;
        
        if (att.type & Config.s_types.ATT_RENDERBUFFER) {
            return gl_ctx.RENDERBUFFER;
        }
        if (att.type & Config.s_types.ATT_TEXTURE) {
            return gl_ctx.TEXTURE;
        }
        throw new Error('Impossible attachment type.');
        return gl_ctx.NONE;
        
    };
    
    var textureLayer = function(att) {
        if (att.type & Config.s_types.ATT_TEXTURE_FLAT)  return 0;
        if (att.type & Config.s_types.ATT_TEXTURE_LAYER) return att.layer;
        throw new Error('Impossible attachment type.');
        return 0;
    };
    
    
    var checkAttachmentCompleteness = function(cctx, att, attPoint, image, db, gl_ctx) {
        gl_ctx = gl_ctx || gl;
    
        // GLES2 4.4.5 / GLES3 4.4.4, "Framebuffer attachment completeness"
        if (
            ( att.type   & Config.s_types.ATT_TEXTURE     ) &&
            ( image.type & Config.s_types.TEXTURE_LAYERED )
        ) {
            // GLES3: "If the value of FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE is
            // TEXTURE and the value of FRAMEBUFFER_ATTACHMENT_OBJECT_NAME names a
            // three-dimensional texture, then the value of
            // FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER must be smaller than the depth
            // of the texture.
            //
            // GLES3: "If the value of FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE is
            // TEXTURE and the value of FRAMEBUFFER_ATTACHMENT_OBJECT_NAME names a
            // two-dimensional array texture, then the value of
            // FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER must be smaller than the
            // number of layers in the texture.
            cctx.require(
                textureLayer(att) < image.numLayers,
                gl_ctx.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
            );
        }
        
        // "The width and height of image are non-zero."
        cctx.require(
            image.width > 0 && image.height > 0,
            gl_ctx.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
        );

        // Check for renderability
        var flags = db.getFormatInfo(image.internalFormat, FormatFlags.ANY_FORMAT);
        
        // If the format does not have the proper renderability flag, the
        // completeness check _must_ fail.
        cctx.require(
            (flags & formatFlag(attPoint)) != 0,
            gl_ctx.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
        );
        
        // If the format is only optionally renderable, the completeness check _can_ fail.
        cctx.canRequire(
            (flags & FormatFlags.REQUIRED_RENDERABLE) != 0,
            gl_ctx.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
        );
        
    };
    
    var formatkey = function(format, type) {
        return (type << 16 | format) & 0xFFFFFFFF;
    };
    
    var FormatFlags = {
        ANY_FORMAT:           0x00,
        COLOR_RENDERABLE:     0x01,
        DEPTH_RENDERABLE:     0x02,
        STENCIL_RENDERABLE:   0x04,
        RENDERBUFFER_VALID:   0x08,
        TEXTURE_VALID:        0x10,
        REQUIRED_RENDERABLE:  0x20, //< Without this, renderability is allowed, not required.
    };
    
    var Framebuffer = function(argv) {
        
        argv = argv || {};
        this._construct = function(argv) {
            this.attachments = argv.attachments  || {};
            this.textures    = argv.textures     || {};
            this.rbos        = argv.rbos         || {};
        };
        
        this.attach = function(attPoint, att) {
            if (!att) {
                this.attachments[attPoint] = undefined;
            } else {
                this.attachments[attPoint] = att;
            }
        };
        this.setTexture = function(texName, texCfg) {
            this.textures[texName] = texCfg;
        };
        this.setRbo = function(rbName, rbCfg) {
            this.rbos[rbName] = rbCfg;
        };
        this.getImage = function(type, imgName) {
            switch (type) {
                case gl.TEXTURE:      return lookupDefault(this.textures, imgName, null);
                case gl.RENDERBUFFER: return lookupDefault(this.rbos,     imgName, null);
                default: DE_ASSERT(false, "Bad image type.");
            }
            return null;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    
    var FboBuilder = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            parent._construct(argv);
            
            if (argv.fbo === undefined || argv.target === undefined) {
                throw new Error('Invalid args.');
            }
            
            this.m_gl      = argv.gl || gl;
            this.m_target  = argv.target;
            this.m_configs = [];
            this.m_error   = this.m_gl.NO_ERROR;
            
            this.m_gl.bindFramebuffer(this.m_target, argv.fbo);
        };
        
        this.deinit = function() {
            for (var name in this.textures) {
                glsup.remove(this.textures[name], name, this.m_gl);
            }
            for (var name in this.rbos) {
                glsup.remove(this.rbos[name], name, this.m_gl);
            }
            this.m_gl.bindFramebuffer(this.m_target, 0);
/*
            for (var i = 0 ; i < this.m_configs.length ; ++i) {
                delete this.m_configs[i];
            }
//*/
        };
        
        // GLenum attPoint, const Attachment* att
        this.glAttach = function(attPoint, att) {
            if (!att) {
                this.m_gl.framebufferRenderbuffer(this.m_target, attPoint, this.m_gl.RENDERBUFFER, 0);
            } else {
                attachAttachment(att, attPoint, this.m_gl);
            }
            this.checkError();
            this.attach(attPoint, att);
        };
        
        // const Texture& texCfg
        this.glCreateTexture = function(texCfg) {
            var texName = glsup.create(texCfg, this.m_gl);
            checkError();
            this.setTexture(texName, texCfg);
            return texName;
        };
        
        // const Renderbuffer& rbCfg
        this.glCreateRbo = function(rbCfg) {
            var rbName = glsup.create(rbCfg, this.m_gl);
            checkError();
            this.setRbo(rbName, rbCfg);
            return rbName;
        };
        
        
        // Due to lazy memory management in javascript, this function isnt really
        // needed anymore. Yet it persists here regardless.
        this.makeConfig = function(Definition) {
            var cfg = new Definition();
            this.m_configs.push(cfg);
            return cfg;
        };
        
        this.checkError = function() {
            var error = m_gl.getError();
            if (error != m_gl.NO_ERROR && this.m_error != m_gl.NO_ERROR) {
                this.m_error = error;
            }
        };
        
        this.getError = function() {
            return this.m_error;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    FboBuilder.prototype = new Framebuffer({dont_construct: true});
    
    var Checker = function() {
        
        // Allowed return values for gl.CheckFramebufferStatus
        // formarly an std::set
        var m_statusCodes = [];
        
        this._construct = function() {
            m_statusCodes.push(gl.FRAMEBUFFER_COMPLETE);
        };
        
        
        this.require = function(condition, error) {
            if (!condition) {
                remove_from_array(m_statusCodes, gl.FRAMEBUFFER_COMPLETE);
                m_statusCodes.push(error);
            }
        };
        this.canRequire = function(condition, error) {
            if (!condition) {
                m_statusCodes.push(error);
            }
        };
        this.getStatusCodes = function() {
            return m_statusCodes;
        };
        
//      this.check = (function(attPoint, attachment, image) =0); virtual
        
    };
    
    var transferImageFormat = function(imgFormat, gl_ctx) {
        gl_ctx = gl_ctx || gl;
        if (imgFormat.unsizedType == gl_ctx.NONE)
            return gluTextureUtil.getTransferFormat(mapGLInternalFormat(imgFormat.format));
        else
            return new TransferFormat(imgFormat.format, imgFormat.unsizedType);
    };
    
    return {
        FormatDB:                FormatDB,
        Range:                   Range,
        formatkey:               formatkey,
        GLS_UNSIZED_FORMATKEY:   formatkey,
        FormatFlags:             FormatFlags,
        
        Config:                  Config,
        Image:                     Image,
        RenderBuffer:                RenderBuffer,
        Texture:                     Texture,
        TextureFlat:                   TextureFlat,
        Texture2D:                       Texture2D,
        TextureCubeMap:                  TextureCubeMap,
        TextureLayered:                TextureLayered,
        Texture3D:                       Texture3D,
        Texture2DArray:                  Texture2DArray,
        Attachment:                Attachment,
        RenderbufferAttachment:      RenderbufferAttachment,
        TextureAttachment:           TextureAttachment,
        TextureFlatAttachment:         TextureFlatAttachment,
        TextureLayerAttachment:        TextureLayerAttachment,

        Checker:                   Checker,
        transferImageFormat:       transferImageFormat
    };

});
