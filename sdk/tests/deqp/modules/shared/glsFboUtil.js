
// glsFBOU
'use strict';
goog.provide('modules.shared.glsFboUtil');
goog.require('framework.opengl.gluTextureUtil');


goog.scope(function() {

var glsFboUtil = modules.shared.glsFboUtil;
var gluTextureUtil = framework.opengl.gluTextureUtil;
    

    glsFboUtil.FormatDB = function(argv) {
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
            return glsFboUtil.lookupDefault(this.m_map, format, fallback);
        };
        
        
        if (!argv.dont_construct) this._construct(argv);
    };
    
    glsFboUtil.lookupDefault = function(map, key, fallback) {
        return (map[key] !== undefined) ? map[key] : fallback;
    };
    
    // db is a glsFboUtil.FormatDB, stdFmts is a range object
    glsFboUtil.addFormats = function(db, stdFmts) {
    
        for (var i = stdFmts.begin(); i < stdFmts.end(); ++i) {
            var stdFmt_current = stdFmts.get(i);
		    for (var j = stdFmt_current.second.begin(); j < stdFmt_current.second.end(); ++j) {
			    var formatKey_current = stdFmt_current.second.get(j);
			    db.addFormat(glsFboUtil.formatKeyInfo(formatKey_current.second), stdFmt_current.first);
			}
	    }
    
    };
    
    // glsFboUtil.FormatDB& db, FormatExtEntries extFmts, const RenderContext* ctx
    glsFboUtil.addExtFormats = function(db, extFmts, ctx) {
        
    };
    
    /* TODO: This next. looks like helpers for glsFboUtil.FormatDB objects
    
void glsFboUtil.addExtFormats (glsFboUtil.FormatDB& db, FormatExtEntries extFmts, const RenderContext* ctx)
{
	const UniquePtr<ContextInfo> ctxInfo(ctx != DE_NULL ? ContextInfo::create(*ctx) : DE_NULL);
	for (const glsFboUtil.FormatExtEntry* it = extFmts.begin(); it != extFmts.end(); it++)
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
				db.addFormat(glsFboUtil.formatKeyInfo(*i2), glsFboUtil.FormatFlags(it->flags));
	}
}

        --------------------------------------------------
    //*/
    
    glsFboUtil.formatFlag = function(glenum, gl_ctx) {
        gl_ctx = gl_ctx || gl;
        
        switch (glenum) {
         case gl_ctx.NONE:
            return glsFboUtil.FormatFlags.ANY_FORMAT;
         case gl_ctx.RENDERBUFFER:
            return glsFboUtil.FormatFlags.RENDERBUFFER_VALID;
         case gl_ctx.TEXTURE:
            return glsFboUtil.FormatFlags.TEXTURE_VALID;
         case gl_ctx.STENCIL_ATTACHMENT:
            return glsFboUtil.FormatFlags.STENCIL_RENDERABLE;
         case gl_ctx.DEPTH_ATTACHMENT:
            return glsFboUtil.FormatFlags.DEPTH_RENDERABLE;
         default:
            if (glenum < gl_ctx.COLOR_ATTACHMENT0 || glenum > gl_ctx.COLOR_ATTACHMENT15)
                throw new Error('glenum out of range');
        }
        return glsFboUtil.FormatFlags.COLOR_RENDERABLE;
    };
    
    glsFboUtil.remove_from_array = function(array, value) {
        var index = array.indexOf(value);
        if (index != -1) {
            array.splice(index, 1)  
        }
    };
    
    glsFboUtil.FormatExtEntry = function(argv) {
        argv = argv || {};
        this.construct = function(argv) {
            this.extensions = argv.extensions || null;
            this.flags      = argv.flags      || null;
            this.formats    = argv.formats    || null;
        };
        if (!argv.dont_construct) this._construct(argv);
    };
    
    // this wont work if argv.array is an object
    glsFboUtil.Range = function(argv) {
        
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
    
    glsFboUtil.ImageFormat = function(argv) {
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
    glsFboUtil.ImageFormat.none = function() {
        var obj = new glsFboUtil.ImageFormat();
        obj.none();
        return obj;
    };
    
    // where key is a FormatKey, and a FormatKey is a 32bit int.
    glsFboUtil.formatKeyInfo = function(key) {
        return new glsFboUtil.ImageFormat({
            format:      (key & 0x0000ffff),
            unsizedType: (key & 0xffff0000) >> 16
        });
    };
    
    glsFboUtil.Config = function(argv) {
        argv = argv || {};
        
        this._construct = function(argv) {
            this.type = argv.type ? argv.type | glsFboUtil.Config.s_types.CONFIG : glsFboUtil.Config.s_types.CONFIG;
            this.target = argv.target || glsFboUtil.Config.s_target.NONE;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.Config.s_target = {
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
    glsFboUtil.Config.s_types = {
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
    
    glsFboUtil.Image = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | glsFboUtil.Config.s_types.IMAGE : glsFboUtil.Config.s_types.IMAGE;
            parent._construct(argv);
            this.width  = 0;
            this.height = 0;
            this.internalFormat = new glsFboUtil.ImageFormat();
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.Image.prototype = new glsFboUtil.Config({dont_construct: true});
    
    glsFboUtil.RenderBuffer = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type   = argv.type ? argv.type | glsFboUtil.Config.s_types.RENDERBUFFER : glsFboUtil.Config.s_types.RENDERBUFFER;
            argv.target = argv.target || glsFboUtil.Config.s_target.RENDERBUFFER;
            parent._construct(argv);
            this.numSamples = 0;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.RenderBuffer.prototype = new glsFboUtil.Image({dont_construct: true});
    
    glsFboUtil.Texture = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | glsFboUtil.Config.s_types.TEXTURE : glsFboUtil.Config.s_types.TEXTURE;
            parent._construct(argv);
            this.numLevels = 1;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.Texture.prototype = new glsFboUtil.Image({dont_construct: true});
    
    glsFboUtil.TextureFlat = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | glsFboUtil.Config.s_types.TEXTURE_FLAT : glsFboUtil.Config.s_types.TEXTURE_FLAT;
            parent._construct(argv);
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.TextureFlat.prototype = new glsFboUtil.Texture({dont_construct: true});
    
    glsFboUtil.Texture2D = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.target = argv.target || glsFboUtil.Config.s_target.TEXTURE_2D;
            argv.type = argv.type ? argv.type | glsFboUtil.Config.s_types.TEXTURE_2D : glsFboUtil.Config.s_types.TEXTURE_2D;
            parent._construct(argv);
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.Texture2D.prototype = new glsFboUtil.TextureFlat({dont_construct: true});
    
    glsFboUtil.TextureCubeMap = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.target = argv.target || glsFboUtil.Config.s_target.TEXTURE_CUBE_MAP;
            argv.type = argv.type ? argv.type | glsFboUtil.Config.s_types.TEXTURE_CUBE_MAP : glsFboUtil.Config.s_types.TEXTURE_CUBE_MAP;
            parent._construct(argv);
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.TextureCubeMap.prototype = new glsFboUtil.TextureFlat({dont_construct: true});
    
    glsFboUtil.TextureLayered = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | glsFboUtil.Config.s_types.TEXTURE_LAYERED : glsFboUtil.Config.s_types.TEXTURE_LAYERED;
            parent._construct(argv);
            this.numLayers = 1;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.TextureLayered.prototype = new glsFboUtil.Texture({dont_construct: true});
    
    glsFboUtil.Texture3D = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.target = argv.target || glsFboUtil.Config.s_target.TEXTURE_3D;
            argv.type = argv.type ? argv.type | glsFboUtil.Config.s_types.TEXTURE_3D : glsFboUtil.Config.s_types.TEXTURE_3D;
            parent._construct(argv);
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.Texture3D.prototype = new glsFboUtil.TextureLayered({dont_construct: true});
    
    glsFboUtil.Texture2DArray = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.target = argv.target || glsFboUtil.Config.s_target.TEXTURE_2D_ARRAY;
            argv.type = argv.type ? argv.type | glsFboUtil.Config.s_types.TEXTURE_2D_ARRAY : glsFboUtil.Config.s_types.TEXTURE_2D_ARRAY;
            parent._construct(argv);
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.Texture2DArray.prototype = new glsFboUtil.TextureLayered({dont_construct: true});
    
    
    // Attachments
    glsFboUtil.Attachment = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | glsFboUtil.Config.s_types.ATTACHMENT : glsFboUtil.Config.s_types.ATTACHMENT;
            argv.target = argv.target || glsFboUtil.Config.s_target.FRAMEBUFFER;
            parent._construct(argv);
            this.imageName = 0;
        };
        
        // this function is declared, but has no definition/is unused in the c++
        // var isComplete = (function(attPoint, image, vfr) { });
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.Attachment.prototype = new glsFboUtil.Config({dont_construct: true});
    
    glsFboUtil.RenderbufferAttachment = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | glsFboUtil.Config.s_types.ATT_RENDERBUFFER : glsFboUtil.Config.s_types.ATT_RENDERBUFFER;
            parent._construct(argv);
            this.renderbufferTarget = glsFboUtil.Config.s_target.RENDERBUFFER;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.RenderbufferAttachment.prototype = new glsFboUtil.Attachment({dont_construct: true});
    
    glsFboUtil.TextureAttachment = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | glsFboUtil.Config.s_types.ATT_TEXTURE : glsFboUtil.Config.s_types.ATT_TEXTURE;
            parent._construct(argv);
            this.level = 0;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.TextureAttachment.prototype = new glsFboUtil.Attachment({dont_construct: true});
    
    glsFboUtil.TextureFlatAttachment = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | glsFboUtil.Config.s_types.ATT_TEXTURE_FLAT : glsFboUtil.Config.s_types.ATT_TEXTURE_FLAT;
            parent._construct(argv);
            this.texTarget = glsFboUtil.Config.s_target.NONE;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.TextureFlatAttachment.prototype = new glsFboUtil.TextureAttachment({dont_construct: true});
    
    glsFboUtil.TextureLayerAttachment = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            argv.type = argv.type ? argv.type | glsFboUtil.Config.s_types.ATT_TEXTURE_LAYER : glsFboUtil.Config.s_types.ATT_TEXTURE_LAYER;
            parent._construct(argv);
            this.layer = 0;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.TextureLayerAttachment.prototype = new glsFboUtil.TextureAttachment({dont_construct: true});
    
    
    // these are a collection of helper functions for creating various gl textures.
    glsFboUtil.glsup = function() {
    
        var glInit = function(cfg, gl_ctx) {
            if (cfg.target == glsFboUtil.Config.s_target.TEXTURE_2D) {
                glInitFlat(cfg, glTarget, gl_ctx);
                
            } else if (cfg.target == glsFboUtil.Config.s_target.TEXTURE_CUBE_MAP) {
                for (
                    var i = gl_ctx.TEXTURE_CUBE_MAP_NEGATIVE_X;
                    i <= gl_ctx.TEXTURE_CUBE_MAP_POSITIVE_Z;
                    ++i
                ) {
                    glInitFlat(cfg, i, gl_ctx);
                }
                
            } else if (cfg.target == glsFboUtil.Config.s_target.TEXTURE_3D) {
                glInitLayered(cfg, 2, gl_ctx);
            
            } else if (cfg.target == glsFboUtil.Config.s_target.TEXTURE_2D_ARRAY) {
                glInitLayered(cfg, 1, gl_ctx);
            
            }
        };
        
        var glInitFlat = function(cfg, target, gl_ctx) {
            var format = glsFboUtil.transferImageFormat(cfg.internalFormat, gl_ctx);
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
            var format = glsFboUtil.transferImageFormat(cfg.internalFormat, gl_ctx);
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
            
            if (cfg.type & glsFboUtil.Config.s_types.RENDERBUFFER) {
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
                
            } else if (cfg.type & glsFboUtil.Config.s_types.TEXTURE) {
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
                case glsFboUtil.Config.s_target.RENDERBUFFER:     return gl_ctx.RENDERBUFFER;
                case glsFboUtil.Config.s_target.TEXTURE_2D:       return gl_ctx.TEXTURE_2D;
                case glsFboUtil.Config.s_target.TEXTURE_CUBE_MAP: return gl_ctx.TEXTURE_CUBE_MAP;
                case glsFboUtil.Config.s_target.TEXTURE_3D:       return gl_ctx.TEXTURE_3D;
                case glsFboUtil.Config.s_target.TEXTURE_2D_ARRAY: return gl_ctx.TEXTURE_2D_ARRAY;
                default: throw new Error('Impossible image type.');
            }
            return gl_ctx.NONE;
        };
        
        var glDelete = function(cfg, img, gl_ctx) {
            if (cfg.type & glsFboUtil.Config.s_types.RENDERBUFFER)
                gl.deleteRenderbuffers(1, img);
            else if (cfg.type & glsFboUtil.Config.s_types.TEXTURE)
                gl.deleteTextures(1, img);
            else
                throw new Error('Impossible image type');
        };
        
        return {
            create: glCreate,
            remove: glDelete,
        };
    
    }();
    
    glsFboUtil.attachAttachment = function(att, attPoint, gl_ctx) {
        gl_ctx = gl_ctx || gl;
        
        var mask = (
            glsFboUtil.Config.s_types.ATT_RENDERBUFFER |
            glsFboUtil.Config.s_types.ATT_TEXTURE_FLAT |
            glsFboUtil.Config.s_types.ATT_TEXTURE_LAYER
        );
        
        switch (att.type & mask) {
            case glsFboUtil.Config.s_types.ATT_RENDERBUFFER:
                gl_ctx.framebufferRenderbuffer(
                    att.target, attPoint, att.renderbufferTarget, att.imageName
                );
                break;
            case glsFboUtil.Config.s_types.ATT_TEXTURE_FLAT:
                gl_ctx.framebufferTexture2D(
                    att.target, attPoint, att.texTarget, att.imageName, att.level
                );
                break;
            case glsFboUtil.Config.s_types.ATT_TEXURE_LAYER:
                gl_ctx.framebufferTextureLayer(
                    att.target, attPoint, att.imageName, att.level, att.layer
                );
                break;
            default:
                throw new Error('Impossible attachment type');
        }
        
    };

    glsFboUtil.attachmentType = function(att, gl_ctx) {
        gl_ctx = gl_ctx || gl;
        
        if (att.type & glsFboUtil.Config.s_types.ATT_RENDERBUFFER) {
            return gl_ctx.RENDERBUFFER;
        }
        if (att.type & glsFboUtil.Config.s_types.ATT_TEXTURE) {
            return gl_ctx.TEXTURE;
        }
        throw new Error('Impossible attachment type.');
        return gl_ctx.NONE;
        
    };
    
    glsFboUtil.textureLayer = function(att) {
        if (att.type & glsFboUtil.Config.s_types.ATT_TEXTURE_FLAT)  return 0;
        if (att.type & glsFboUtil.Config.s_types.ATT_TEXTURE_LAYER) return att.layer;
        throw new Error('Impossible attachment type.');
        return 0;
    };
    
    
    glsFboUtil.checkAttachmentCompleteness = function(cctx, att, attPoint, image, db, gl_ctx) {
        gl_ctx = gl_ctx || gl;
    
        // GLES2 4.4.5 / GLES3 4.4.4, "glsFboUtil.Framebuffer attachment completeness"
        if (
            ( att.type   & glsFboUtil.Config.s_types.ATT_TEXTURE     ) &&
            ( image.type & glsFboUtil.Config.s_types.TEXTURE_LAYERED )
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
                glsFboUtil.textureLayer(att) < image.numLayers,
                gl_ctx.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
            );
        }
        
        // "The width and height of image are non-zero."
        cctx.require(
            image.width > 0 && image.height > 0,
            gl_ctx.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
        );

        // Check for renderability
        var flags = db.getFormatInfo(image.internalFormat, glsFboUtil.FormatFlags.ANY_FORMAT);
        
        // If the format does not have the proper renderability flag, the
        // completeness check _must_ fail.
        cctx.require(
            (flags & glsFboUtil.formatFlag(attPoint)) != 0,
            gl_ctx.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
        );
        
        // If the format is only optionally renderable, the completeness check _can_ fail.
        cctx.canRequire(
            (flags & glsFboUtil.FormatFlags.REQUIRED_RENDERABLE) != 0,
            gl_ctx.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
        );
        
    };
    
    glsFboUtil.formatkey = function(format, type) {
        return (type << 16 | format) & 0xFFFFFFFF;
    };
    
    glsFboUtil.FormatFlags = {
        ANY_FORMAT:           0x00,
        COLOR_RENDERABLE:     0x01,
        DEPTH_RENDERABLE:     0x02,
        STENCIL_RENDERABLE:   0x04,
        RENDERBUFFER_VALID:   0x08,
        TEXTURE_VALID:        0x10,
        REQUIRED_RENDERABLE:  0x20, //< Without this, renderability is allowed, not required.
    };
    
    glsFboUtil.Framebuffer = function(argv) {
        
        argv = argv || {};
        this._construct = function(argv) {
            this.attachments = argv.attachments  || {};
            this.textures    = argv.textures     || {};
            this.rbos        = argv.rbos         || {};
            this.m_gl        = argv.gl           || gl;
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
                case this.m_gl.TEXTURE:      return glsFboUtil.lookupDefault(this.textures, imgName, null);
                case this.m_gl.RENDERBUFFER: return glsFboUtil.lookupDefault(this.rbos,     imgName, null);
                default: throw new Error ('Bad image type.');
            }
            return null;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    
    glsFboUtil.FboBuilder = function(argv) {
        argv = argv || {};
        
        var parent = {
            _construct: this._construct,
        };
        
        this._construct = function(argv) {
            parent._construct(argv);
            
            if (argv.fbo === undefined || argv.target === undefined) {
                throw new Error('Invalid args.');
            }
            
            this.m_target  = argv.target;
            this.m_configs = [];
            this.m_error   = this.m_gl.NO_ERROR;
            
            this.m_gl.bindFramebuffer(this.m_target, argv.fbo);
        };
        
        this.deinit = function() {
            for (var name in this.textures) {
                glsFboUtil.glsup.remove(this.textures[name], name, this.m_gl);
            }
            for (var name in this.rbos) {
                glsFboUtil.glsup.remove(this.rbos[name], name, this.m_gl);
            }
            this.m_gl.bindFramebuffer(this.m_target, 0);
/*
            for (var i = 0 ; i < this.m_configs.length ; ++i) {
                delete this.m_configs[i];
            }
//*/
        };
        
        // GLenum attPoint, const glsFboUtil.Attachment* att
        this.glAttach = function(attPoint, att) {
            if (!att) {
                this.m_gl.framebufferRenderbuffer(this.m_target, attPoint, this.m_gl.RENDERBUFFER, 0);
            } else {
                glsFboUtil.attachAttachment(att, attPoint, this.m_gl);
            }
            this.checkError();
            this.attach(attPoint, att);
        };
        
        // const glsFboUtil.Texture& texCfg
        this.glCreateTexture = function(texCfg) {
            var texName = glsFboUtil.glsup.create(texCfg, this.m_gl);
            checkError();
            this.setTexture(texName, texCfg);
            return texName;
        };
        
        // const Renderbuffer& rbCfg
        this.glCreateRbo = function(rbCfg) {
            var rbName = glsFboUtil.glsup.create(rbCfg, this.m_gl);
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
            var error = this.m_gl.getError();
            if (error != this.m_gl.NO_ERROR && this.m_error != this.m_gl.NO_ERROR) {
                this.m_error = error;
            }
        };
        
        this.getError = function() {
            return this.m_error;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    glsFboUtil.FboBuilder.prototype = new glsFboUtil.Framebuffer({dont_construct: true});
    
    glsFboUtil.Checker = function(argv) {
        argv = argv || {};
        
        // Allowed return values for gl.CheckFramebufferStatus
        // formarly an std::set
        var m_statusCodes = [];
        
        this._construct = function() {
            m_statusCodes.push(gl.FRAMEBUFFER_COMPLETE);
        };
        
        
        this.require = function(condition, error) {
            if (!condition) {
                glsFboUtil.remove_from_array(m_statusCodes, gl.FRAMEBUFFER_COMPLETE);
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
        
//      this.check = function(attPoint, attachment, image) =0; virtual
        
        if (!argv.dont_construct)
            throw new Error('Constructor called on virtual class: glsFboUtil.Checker'); 
    };
    
    glsFboUtil.CheckerFactory = function(argv) {
        argv = argv || {};
        
        this._construct = function(argv) {
            if (typeof(this.createChecker) != 'function')
                throw new Error('Unimplemented virtual function: glsFboUtil.CheckerFactory::createChecker');
        };
        
        if (!argv.dont_construct)
            throw new Error('Constructor called on virtual class: glsFboUtil.CheckerFactory'); 
    };
    
    glsFboUtil.transferImageFormat = function(imgFormat, gl_ctx) {
        gl_ctx = gl_ctx || gl;
        if (imgFormat.unsizedType == gl_ctx.NONE)
            return gluTextureUtil.getTransferFormat(mapGLInternalFormat(imgFormat.format));
        else
            return new gluTextureUtil.TransferFormat(imgFormat.format, imgFormat.unsizedType);
    };
    
    

});
