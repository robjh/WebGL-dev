
// glsFBOU
define([
    'modules/shared/glsFboUtil.js'
], function(glsFBOU) {
    'use strict';
    
    var remove_from_array = (function(array, value) {
        var index = array.indexOf(value);
        if (index != -1) {
            array.splice(index, 1);
        }
    });
    
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
        Checker: Checker
    };

});
