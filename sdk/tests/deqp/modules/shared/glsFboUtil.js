/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL ES Utilities
 * ------------------------------------------------
 *
 * Copyright 2014 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

'use strict';
goog.provide('modules.shared.glsFboUtil');
goog.require('framework.opengl.gluTextureUtil');


goog.scope(function() {

    var glsFboUtil = modules.shared.glsFboUtil;
    var gluTextureUtil = framework.opengl.gluTextureUtil;
    

    glsFboUtil.FormatDB = function() {
        this.m_map = {};
    };
    
    glsFboUtil.FormatDB.prototype.addFormat = function(format, flags) {
        this.m_map[format]  = this.m_map[format] || 0;
        this.m_map[format] |= flags;
    };
    glsFboUtil.FormatDB.prototype.getFormats = function(requirements) {
        var ret = [];
        for (var index in this.m_map) {
            if (this.m_map[index] & requirements == requirements) {
                ret.push(index);
            }
        }
        return ret;
    };
    glsFboUtil.FormatDB.prototype.getFormatInfo = function(format, fallback) {
        return glsFboUtil.lookupDefault(this.m_map, format, fallback);
    };
    
    glsFboUtil.lookupDefault = function(map, key, fallback) {
        return (map[key] !== undefined) ? map[key] : fallback;
    };
    
    glsFboUtil.contains = function(array, item) {
        for (var i = array.length ; i-- ; )
            if (array[i] == item) return true;
        return false;
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
    
    // glsFboUtil.FormatDB& db, FormatExtEntries (Range) extFmts, const RenderContext* ctx
    glsFboUtil.addExtFormats = function(db, extFmts, gl) {
        if (!(gl = gl || window.gl)) throw new Error('Invalid gl object');

        // loop through the range, looking at the extentions.
        for (var ext = extFmts.reset() ; ext = extFmts.current() ; extFmts.next()) { // look up FormatExtEntries
            var tokens = ext.extensions.split(/\s+/);

            var supported = function() {
                for (var i = tokens.length - 1 ; i-- ; )
                    if (!glsFboUtil.isExtensionSupported(tokens[i], gl)) return false;
                return true;
            }();

            if (supported) {
                for (var format = ext.formats.reset() ; format = ext.formats.current() ; ext.formats.next()) {
                    db.addFormat(glsFboUtil.formatKeyInfo(format), ext.flags);
                }
            }

        }

    };

    // TODO: find a more befitting home for glsFboUtil.isExtensionSupported (a refugee of gluContextInfo) 
    glsFboUtil.isExtensionSupported = function(extName, gl) { // const char*
        if (!(gl = gl || window.gl)) throw new Error('Invalid gl object');
        var extensions = gl.getSupportedExtensions();
        for (var i = 0 ; i < extensions.length ; ++i) {
            if (extensions[i] == extName) return true
        }
        return false;
    };


    glsFboUtil.formatFlag = function(glenum, gl) {
        if (!(gl = gl || window.gl)) throw new Error('Invalid gl object');
        
        switch (glenum) {
         case gl.NONE:
            return glsFboUtil.FormatFlags.ANY_FORMAT;
         case gl.RENDERBUFFER:
            return glsFboUtil.FormatFlags.RENDERBUFFER_VALID;
         case gl.TEXTURE:
            return glsFboUtil.FormatFlags.TEXTURE_VALID;
         case gl.STENCIL_ATTACHMENT:
            return glsFboUtil.FormatFlags.STENCIL_RENDERABLE;
         case gl.DEPTH_ATTACHMENT:
            return glsFboUtil.FormatFlags.DEPTH_RENDERABLE;
         default:
            if (glenum < gl.COLOR_ATTACHMENT0 || glenum > gl.COLOR_ATTACHMENT15) {
                debugger;
                throw new Error('glenum out of range');
            }
        }
        return glsFboUtil.FormatFlags.COLOR_RENDERABLE;
    };
    
    glsFboUtil.remove_from_array = function(array, value) {
        var index = array.indexOf(value);
        if (index != -1) {
            array.splice(index, 1)  
        }
    };
    
    /**
     * glsFboUtil.FormatExtEntry
     * @constructor
     * @struct
     * @param {string=} extensions
     * @param {number=} flags
     * @param {glsFboUtil.Range=} formats
     */
    glsFboUtil.FormatExtEntry = function(extensions,flags,formats) {
        this.extensions = null;
        this.flags = null;
        this.formats = null;
        
        if (extensions !== undefined) {
            this.extensions = extensions;
            if (flags !== undefined) {
                this.flags = flags;
                if (formats !== undefined)
                    this.formats = formats;
            }
        }
            
    };
    
    // this wont work if the array param is an object
    /**
     * glsFboUtil.Range
     * @param {array} array
     * @param {number=} begin
     * @param {number=} end
     */
    glsFboUtil.Range = function(array, begin, end) {
        // @private
        this.m_begin = ( begin === undefined ? 0 : begin );
        // @private
        this.m_end   = end || array.length;
        // @private
        this.m_array = array;
        // @private
        this.m_index = this.m_begin;
    };
    glsFboUtil.Range.prototype.array = function() {
        return this.m_array;
    };
    glsFboUtil.Range.prototype.begin = function() {
        return this.m_begin;
    };
    glsFboUtil.Range.prototype.end = function() {
        return this.m_end;
    };
    glsFboUtil.Range.prototype.get = function(id) {
        return {
            first: id,
            second: this.m_array[id]
        };
    };
    glsFboUtil.Range.prototype.reset = function() {
        this.m_index = this.m_begin;
        return this.current();
    };
    glsFboUtil.Range.prototype.current = function() {
        return this.m_index < this.m_end ? this.m_array[this.m_index] : null;
    };
    glsFboUtil.Range.prototype.next = function() {
        ++this.m_index;
    };
    
    /**
     * glsFboUtil.rangeArray
     * replaces the macro GLS_ARRAY_RANGE
     * @param {array} array
     * @return {glsFboUtil.Range}
     */
    glsFboUtil.rangeArray = function(array) {
        if (!array) debugger;//TODO: remove
        return new glsFboUtil.Range(array);
    };
    
    
    glsFboUtil.ImageFormat = function(format, unsizedType) {
        this.m_format      = format || null;
        //! Type if format is unsized, GL_NONE if sized.
        this.m_unsizedType = unsizedType || null;
        
    };
    glsFboUtil.ImageFormat.prototype.lessthan = function(other) {
        return (
            (this.m_format <  other.m_format) ||
            (this.m_format == other.m_format && this.m_unsizeType < other.m_unsizedType)
        );
    };
    glsFboUtil.ImageFormat.prototype.none = function(gl) {
        if (!(gl = gl || window.gl)) throw new Error('Invalid gl object');
        this.m_format      = gl.NONE;
        this.m_unsizedType = gl.NONE;
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
    
    /**
     * glsFboUtil.Config Class.
     * @constructor
     */
    glsFboUtil.Config = function() {
        this.type = glsFboUtil.Config.s_types.CONFIG;
        this.target = glsFboUtil.Config.s_target.NONE;
    };
    /**
     * @enum {number}
     */
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

        UNUSED:          0xFFE0E00E
    };

    /**
     * glsFboUtil.Image Class.
     * @constructor
     * @extends {glsFboUtil.Config}
     */
    glsFboUtil.Image = function() {
        glsFboUtil.Config.call(this);
        this.type  |= glsFboUtil.Config.s_types.IMAGE;
        this.width  = 0;
        this.height = 0;
        this.internalFormat = new glsFboUtil.ImageFormat();
    };
    
    /**
     * glsFboUtil.RenderBuffer Class.
     * @constructor
     * @extends {glsFboUtil.Image}
     */
    glsFboUtil.RenderBuffer = function() {
        glsFboUtil.Image.call(this);
        this.type  |= glsFboUtil.Config.s_types.RENDERBUFFER;
        this.target = glsFboUtil.Config.s_target.RENDERBUFFER;
        this.numSamples = 0;
    };
    
    /**
     * glsFboUtil.Texture Class.
     * @constructor
     * @extends {glsFboUtil.Image}
     */
    glsFboUtil.Texture = function() {
        glsFboUtil.Image.call(this);
        this.type |= glsFboUtil.Config.s_types.TEXTURE;
        this.numLevels = 1;
    };
    
    /**
     * glsFboUtil.TextureFlat Class.
     * @constructor
     * @extends {glsFboUtil.Texture}
     */
    glsFboUtil.TextureFlat = function() {
        glsFboUtil.Texture.call(this);
        this.type |= glsFboUtil.Config.s_types.TEXTURE_FLAT;
    };
    
    /**
     * glsFboUtil.Texture2D Class.
     * @constructor
     * @extends {glsFboUtil.TextureFlat}
     */
    glsFboUtil.Texture2D = function() {
        glsFboUtil.TextureFlat.call(this);
        this.type  |= glsFboUtil.Config.s_types.TEXTURE_2D;
        this.target = glsFboUtil.Config.s_target.TEXTURE_2D;
    };
    
    /**
     * glsFboUtil.TextureCubeMap Class.
     * @constructor
     * @extends {glsFboUtil.TextureFlat}
     */
    glsFboUtil.TextureCubeMap = function() {
        glsFboUtil.TextureFlat.call(this);
        this.type  |= glsFboUtil.Config.s_types.TEXTURE_CUBE_MAP;
        this.target = glsFboUtil.Config.s_target.TEXTURE_CUBE_MAP;
    };
    
    /**
     * glsFboUtil.TextureLayered Class.
     * @constructor
     * @extends {glsFboUtil.Texture}
     */
    glsFboUtil.TextureLayered = function() {
        glsFboUtil.Texture.call(this);
        this.type |= glsFboUtil.Config.s_types.TEXTURE_LAYERED;
        this.numLayers = 1;
    };
    
    /**
     * glsFboUtil.Texture3D Class.
     * @constructor
     * @extends {glsFboUtil.TextureLayered}
     */
    glsFboUtil.Texture3D = function() {
        glsFboUtil.TextureLayered.call(this);
        this.type  |= glsFboUtil.Config.s_types.TEXTURE_3D;
        this.target = glsFboUtil.Config.s_target.TEXTURE_3D;
    };
    
    /**
     * glsFboUtil.Texture2DArray Class.
     * @constructor
     * @extends {glsFboUtil.TextureLayered}
     */
    glsFboUtil.Texture2DArray = function() {
        glsFboUtil.TextureLayered.call(this);
        this.type  |= glsFboUtil.Config.s_types.TEXTURE_2D_ARRAY;
        this.target = glsFboUtil.Config.s_target.TEXTURE_2D_ARRAY;
    };
    
    
    /**
     * glsFboUtil.Attachment Class.
     * @constructor
     * @extends {glsFboUtil.Config}
     */
    glsFboUtil.Attachment = function() {
        glsFboUtil.Config.call(this);
        this.type  |= glsFboUtil.Config.s_types.ATTACHMENT;
        this.target = glsFboUtil.Config.s_target.FRAMEBUFFER;
        this.imageName = 0;
    };
    // this function is declared, but has no definition/is unused in the c++
    // glsFboUtil.Attachment.prototype.isComplete = function(attPoint, image, vfr) { };
    
    /**
     * glsFboUtil.RenderBufferAttachments Class.
     * @constructor
     * @extends {glsFboUtil.Attachment}
     */
    glsFboUtil.RenderbufferAttachment = function() {
        glsFboUtil.Attachment.call(this);
        this.type |= glsFboUtil.Config.s_types.ATT_RENDERBUFFER;
        this.renderbufferTarget = glsFboUtil.Config.s_target.RENDERBUFFER;
    };
    glsFboUtil.RenderbufferAttachment.prototype = Object.create(glsFboUtil.Attachment.prototype);
    glsFboUtil.RenderbufferAttachment.prototype.constructor = glsFboUtil.RenderbufferAttachment;
    
    /**
     * glsFboUtil.TextureAttachment Class.
     * @constructor
     * @extends {glsFboUtil.Attachment}
     */
    glsFboUtil.TextureAttachment = function() {
        glsFboUtil.Attachment.call(this);
        this.type |= glsFboUtil.Config.s_types.ATT_TEXTURE;
        this.level = 0;
    };
    glsFboUtil.TextureAttachment.prototype = Object.create(glsFboUtil.Attachment.prototype);
    glsFboUtil.TextureAttachment.prototype.constructor = glsFboUtil.TextureAttachment;
    
    /**
     * glsFboUtil.TextureFlatAttachment Class.
     * @constructor
     * @extends {glsFboUtil.TextureAttachment}
     */
    glsFboUtil.TextureFlatAttachment = function() {
        glsFboUtil.TextureAttachment.call(this);
        this.type |= glsFboUtil.Config.s_types.ATT_TEXTURE_FLAT;
        this.texTarget = glsFboUtil.Config.s_target.NONE;
    };
    glsFboUtil.TextureFlatAttachment.prototype = Object.create(glsFboUtil.TextureAttachment.prototype);
    glsFboUtil.TextureFlatAttachment.prototype.constructor = glsFboUtil.TextureFlatAttachment;
    
    /**
     * glsFboUtil.TextureLayerAttachment Class.
     * @constructor
     * @extends {glsFboUtil.TextureLayerAttachment}
     */
    glsFboUtil.TextureLayerAttachment = function() {
        glsFboUtil.TextureAttachment.call(this);
        this.type |= glsFboUtil.Config.s_types.ATT_TEXTURE_LAYER;
        this.layer = 0;
    };
    glsFboUtil.TextureLayerAttachment.prototype = Object.create(glsFboUtil.TextureAttachment.prototype);
    glsFboUtil.TextureLayerAttachment.prototype.constructor = glsFboUtil.TextureLayerAttachment;
    
    
    // these are a collection of helper functions for creating various gl textures.
    glsFboUtil.glsup = function() {
    
        var glInit = function(cfg, gl) {
            if (cfg.target == glsFboUtil.Config.s_target.TEXTURE_2D) {
                glInitFlat(cfg, glTarget, gl);
                
            } else if (cfg.target == glsFboUtil.Config.s_target.TEXTURE_CUBE_MAP) {
                for (
                    var i = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
                    i <= gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
                    ++i
                ) {
                    glInitFlat(cfg, i, gl);
                }
                
            } else if (cfg.target == glsFboUtil.Config.s_target.TEXTURE_3D) {
                glInitLayered(cfg, 2, gl);
            
            } else if (cfg.target == glsFboUtil.Config.s_target.TEXTURE_2D_ARRAY) {
                glInitLayered(cfg, 1, gl);
            
            }
        };
        
        var glInitFlat = function(cfg, target, gl) {
            var format = glsFboUtil.transferImageFormat(cfg.internalFormat, gl);
            var w = cfg.width;
            var h = cfg.height;
            for (var level = 0; level < cfg.numLevels; ++level) {
                gl.texImage2D(
                    target, level, cfg.internalFormat.format,
                    w, h, 0,format.format, format.dataType, null
                );
                w = Math.max(1, w / 2);
                h = Math.max(1, h / 2);
            }
        };
        
        var glInitLayered = function(cfg, depth_divider, gl) {
            var format = glsFboUtil.transferImageFormat(cfg.internalFormat, gl);
            var w = cfg.width;
            var h = cfg.height;
            var depth = cfg.numLayers;
            for (var level = 0; level < cfg.numLevels; ++level) {
                gl.texImage3D(
                    glTarget(cfg), level, cfg.internalFormat.format,
                    w, h, depth, 0, format.format, format.dataType, null
                );
                w = Math.max(1, w / 2);
                h = Math.max(1, h / 2);
                depth = Math.max(1, depth / depth_divider);
            }
        };
    
        var glCreate = function(cfg, gl) {
            if (!(gl = gl || window.gl)) throw new Error('Invalid gl object');
            
            if (cfg.type & glsFboUtil.Config.s_types.RENDERBUFFER) {
                var ret = gl.createRenderBuffer();
                gl.bindRenderBuffer(gl.RENDERBUFFER, ret);
                
                if (cfg.numSamples == 0) {
                    gl.renderBufferStorage(
                        gl.RENDERBUFFER,
                        cfg.internalFormat.format,
                        cfg.width, cfg.height
                    );
                } else {
                    gl.renderbufferStorageMultisample(
                        gl.RENDERBUFFER,
                        cfg.numSamples,
                        cfg.internalFormat.format,
                        cfg.width, cfg.height
                    );
                }
                gl.bindRenderbuffer(gl.RENDERBUFFER, 0);
                
            } else if (cfg.type & glsFboUtil.Config.s_types.TEXTURE) {
                var ret = gl.createTexture();
                gl.bindTexture(glTarget(cfg, gl), ret);
                glInit(cfg, gl);
                gl.bindTexture(glTarget(cfg, gl), 0);
            
            } else {
                throw new Error('Impossible image type');
            }
        };
        
        var glTarget = function(cfg, gl) {
            if (!(gl = gl || window.gl)) throw new Error('Invalid gl object');
            switch(cfg.target) {
                case glsFboUtil.Config.s_target.RENDERBUFFER:     return gl.RENDERBUFFER;
                case glsFboUtil.Config.s_target.TEXTURE_2D:       return gl.TEXTURE_2D;
                case glsFboUtil.Config.s_target.TEXTURE_CUBE_MAP: return gl.TEXTURE_CUBE_MAP;
                case glsFboUtil.Config.s_target.TEXTURE_3D:       return gl.TEXTURE_3D;
                case glsFboUtil.Config.s_target.TEXTURE_2D_ARRAY: return gl.TEXTURE_2D_ARRAY;
                default: throw new Error('Impossible image type.');
            }
            return gl.NONE;
        };
        
        var glDelete = function(cfg, img, gl) {
            if (cfg.type & glsFboUtil.Config.s_types.RENDERBUFFER)
                gl.deleteRenderbuffers(1, img);
            else if (cfg.type & glsFboUtil.Config.s_types.TEXTURE)
                gl.deleteTextures(1, img);
            else
                throw new Error('Impossible image type');
        };
        
        return {
            create: glCreate,
            remove: glDelete
        };
    
    }();
    
    glsFboUtil.imageNumSamples = function(img) {
        return (img.numSamples != undefined) ? img.numSamples : 0;
    };
    
    glsFboUtil.attachAttachment = function(att, attPoint, gl) {
        if (!(gl = gl || window.gl)) throw new Error('Invalid gl object');
        
        var mask = (
            glsFboUtil.Config.s_types.ATT_RENDERBUFFER |
            glsFboUtil.Config.s_types.ATT_TEXTURE_FLAT |
            glsFboUtil.Config.s_types.ATT_TEXTURE_LAYER
        );
        
        switch (att.type & mask) {
            case glsFboUtil.Config.s_types.ATT_RENDERBUFFER:
                gl.framebufferRenderbuffer(
                    att.target, attPoint, att.renderbufferTarget, att.imageName
                );
                break;
            case glsFboUtil.Config.s_types.ATT_TEXTURE_FLAT:
                gl.framebufferTexture2D(
                    att.target, attPoint, att.texTarget, att.imageName, att.level
                );
                break;
            case glsFboUtil.Config.s_types.ATT_TEXURE_LAYER:
                gl.framebufferTextureLayer(
                    att.target, attPoint, att.imageName, att.level, att.layer
                );
                break;
            default:
                throw new Error('Impossible attachment type');
        }
        
    };

    glsFboUtil.attachmentType = function(att, gl) {
        if (!(gl = gl || window.gl)) throw new Error('Invalid gl object');
        
        if (att.type & glsFboUtil.Config.s_types.ATT_RENDERBUFFER) {
            return gl.RENDERBUFFER;
        }
        if (att.type & glsFboUtil.Config.s_types.ATT_TEXTURE) {
            return gl.TEXTURE;
        }
        throw new Error('Impossible attachment type.');
        return gl.NONE;
        
    };
    
    glsFboUtil.textureLayer = function(att) {
        if (att.type & glsFboUtil.Config.s_types.ATT_TEXTURE_FLAT)  return 0;
        if (att.type & glsFboUtil.Config.s_types.ATT_TEXTURE_LAYER) return att.layer;
        throw new Error('Impossible attachment type.');
        return 0;
    };
    
    
    glsFboUtil.checkAttachmentCompleteness = function(cctx, att, attPoint, image, db, gl) {
        if (!(gl = gl || window.gl)) throw new Error('Invalid gl object');
    
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
                gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
            );
        }
        
        // "The width and height of image are non-zero."
        cctx.require(
            image.width > 0 && image.height > 0,
            gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
        );

        // Check for renderability
        var flags = db.getFormatInfo(image.internalFormat, glsFboUtil.FormatFlags.ANY_FORMAT);
        
        // If the format does not have the proper renderability flag, the
        // completeness check _must_ fail.
        cctx.require(
            (flags & glsFboUtil.formatFlag(attPoint)) != 0,
            gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
        );
        
        // If the format is only optionally renderable, the completeness check _can_ fail.
        cctx.canRequire(
            (flags & glsFboUtil.FormatFlags.REQUIRED_RENDERABLE) != 0,
            gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
        );
        
    };
    
    // replaces GLS_UNSIZED_FORMATKEY
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
        REQUIRED_RENDERABLE:  0x20  //< Without this, renderability is allowed, not required.
    };
    
    glsFboUtil.Framebuffer = function(attachments, textures, rbos, gl) {
        this.attachments = attachments  || {};
        this.textures    = textures     || {};
        this.rbos        = rbos         || {};
        this.m_gl        = gl           || gl;
    };
    glsFboUtil.Framebuffer.prototype.attach = function(attPoint, att) {
        if (!att) {
            this.attachments[attPoint] = undefined;
        } else {
            this.attachments[attPoint] = att;
        }
    };
    glsFboUtil.Framebuffer.prototype.setTexture = function(texName, texCfg) {
        this.textures[texName] = texCfg;
    };
    glsFboUtil.Framebuffer.prototype.setRbo = function(rbName, rbCfg) {
        this.rbos[rbName] = rbCfg;
    };
    glsFboUtil.Framebuffer.prototype.getImage = function(type, imgName) {
        switch (type) {
            case this.m_gl.TEXTURE:      return glsFboUtil.lookupDefault(this.textures, imgName, null);
            case this.m_gl.RENDERBUFFER: return glsFboUtil.lookupDefault(this.rbos,     imgName, null);
            default: throw new Error ('Bad image type.');
        }
        return null;
    };
    
    glsFboUtil.FboBuilder = function(fbo, target, gl) {
        glsFboUtil.Framebuffer.call(this);
        
        this.m_gl      = gl || window.gl;
        this.m_target  = target;
        this.m_configs = [];
        this.m_error   = this.m_gl.NO_ERROR;
        
        this.m_gl.bindFramebuffer(this.m_target, fbo);
    
    };
    glsFboUtil.FboBuilder.prototype = Object.create(glsFboUtil.Framebuffer.prototype);
    glsFboUtil.FboBuilder.prototype.constructor = glsFboUtil.FboBuilder;
    
    glsFboUtil.FboBuilder.prototype.deinit = function() {
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
    glsFboUtil.FboBuilder.prototype.glAttach = function(attPoint, att) {
        if (!att) {
            this.m_gl.framebufferRenderbuffer(this.m_target, attPoint, this.m_gl.RENDERBUFFER, 0);
        } else {
            glsFboUtil.attachAttachment(att, attPoint, this.m_gl);
        }
        this.checkError();
        this.attach(attPoint, att);
    };
        
    // const glsFboUtil.Texture& texCfg
    glsFboUtil.FboBuilder.prototype.glCreateTexture = function(texCfg) {
        var texName = glsFboUtil.glsup.create(texCfg, this.m_gl);
        this.checkError();
        this.setTexture(texName, texCfg);
        return texName;
    };
        
    // const Renderbuffer& rbCfg
    glsFboUtil.FboBuilder.prototype.glCreateRbo = function(rbCfg) {
        var rbName = glsFboUtil.glsup.create(rbCfg, this.m_gl);
        this.checkError();
        this.setRbo(rbName, rbCfg);
        return rbName;
    };
    
    // Due to lazy memory management in javascript, this function isnt really
    // needed anymore. Yet it persists here regardless.
    glsFboUtil.FboBuilder.prototype.makeConfig = function(Definition) {
        var cfg = new Definition();
        this.m_configs.push(cfg);
        return cfg;
    };
        
    glsFboUtil.FboBuilder.prototype.checkError = function() {
        var error = this.m_gl.getError();
        if (error != this.m_gl.NO_ERROR && this.m_error != this.m_gl.NO_ERROR) {
            this.m_error = error;
        }
    };
    
    glsFboUtil.FboBuilder.prototype.getError = function() {
        return this.m_error;
    };
    
    
    
    glsFboUtil.Checker = function(gl) {
        if (!(gl = gl || window.gl)) throw new Error('Invalid gl object');
        
        // Allowed return values for gl.CheckFramebufferStatus
        // formarly an std::set
        var m_statusCodes = [gl.FRAMEBUFFER_COMPLETE];
        
        // this.check = function(attPoint, attachment, image) =0; virtual
        if (typeof(this.check) != 'function')
            throw new Error('Constructor called on virtual class: glsFboUtil.Checker'); 
    };
    glsFboUtil.Checker.prototype.require = function(condition, error) {
        if (!condition) {
            glsFboUtil.remove_from_array(m_statusCodes, gl.FRAMEBUFFER_COMPLETE);
            m_statusCodes.push(error);
        }
    };
    glsFboUtil.Checker.prototype.canRequire = function(condition, error) {
        if (!condition) {
            m_statusCodes.push(error);
        }
    };
    glsFboUtil.Checker.prototype.getStatusCodes = function() {
        return m_statusCodes;
    };
    
    
    
    glsFboUtil.CheckerFactory = function() {
        if (typeof(this.createChecker) != 'function')
            throw new Error('Unimplemented virtual function: glsFboUtil.CheckerFactory::createChecker');
    };
    
    
    
    glsFboUtil.transferImageFormat = function(imgFormat, gl) {
        if (!(gl = gl || window.gl)) throw new Error('Invalid gl object');
        if (imgFormat.unsizedType == gl.NONE)
            return gluTextureUtil.getTransferFormat(mapGLInternalFormat(imgFormat.format));
        else
            return new gluTextureUtil.TransferFormat(imgFormat.format, imgFormat.unsizedType);
    };
    
    // FormatDB, CheckerFactory
    glsFboUtil.FboVerifier = function(formats, factory) {
        this.m_formats = formats;
        this.m_factory = factory;
    };
    // config::Framebuffer
    glsFboUtil.FboVerifier.prototype.validStatusCodes = function(cfg, gl) {
        if (!(gl = gl || window.gl)) throw new Error('Invalid gl object');
        
        /** @type {glsFboUtil.Checker} */
        var cctx = this.m_factory.createChecker();
        
        for (var id in cfg.textures) {
            var flags = this.m_formats.getFormatInfo(cfg.textures[id], glsFboUtil.FormatFlags.ANY_FORMAT);
            var textureIsValid = (flags & glsFboUtil.FormatFlags.TEXTURE_VALID) != 0;
            cctx.require(textureIsValid, gl.INVALID_ENUM);
            cctx.require(textureIsValid, gl.INVALID_OPERATION);
            cctx.require(textureIsValid, gl.INVALID_VALUE);
        }
        
        for (var id in cfg.rbos) {
            var flags = this.m_formats.getFormatInfo(cfg.rbos[id], glsFboUtil.FormatFlags.ANY_FORMAT);
            var rboIsValid = (flags & glsFboUtil.FormatFlags.RENDERBUFFER_VALID) != 0;
            cctx.require(rboIsValid, gl.INVALID_ENUM);
        }
        
        var count = 0;
        for (var attPoint in cfg.attachments) {
            var att = cfg.attachments[attPoint];
            /** @type{glsFboUtil.Image}*/
            var image = cfg.getImage(glsFboUtil.attachmentType(att, gl), att.imageName);
            glsFboUtil.checkAttachmentCompleteness(cctx, att, attPoint, image, db, this.m_formats, gl);
            cctx.check(attPoint, att, image);
            ++count;
        }
        
        // "There is at least one image attached to the framebuffer."
	    // TODO: support XXX_framebuffer_no_attachments
	    cctx.require(count > 0, gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT);
    
        return cctx.getStatusCodes();
    
    };
    
    

});
