
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
            
            this.m_error = null;
            this.m_target = null;
            this.m_gl = null;
            this.m_configs = null;
        });
        
        this.checkError = (function() {
            
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
        Checker:                Checker
    };

});
