
// glsFBOU
define([
    'modules/shared/glsFboUtil.js'
], function(glsFBOU) {
    'use strict';
    
    var remove_from_array = (function(array, value) {
        var index = array.indexOf(value);
        if (index != -1) {
            array.splice(index, 1)  
        }
    });
    
    var range = (function(opt, m) {
        var self = {};
        m        = m || {};
        
        m.begin  = opt.begin || 0;
        m.end    = opt.end   || opt.array.length;
        
        self.array = (function() {
            return opt.array;
        });
        self.begin = (function() {
            return m.begin;
        });
        self.end = (function() {
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
        range:                  range,
        formatkey:              formatkey,
        GLS_UNSIGNED_FORMATKEY: formatkey,
        FormatFlags:            FormatFlags,
        Checker:                Checker
    };

});
