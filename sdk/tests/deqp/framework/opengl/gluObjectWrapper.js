'use strict';

goog.provide('framework.opengl.gluObjectWrapper');

goog.scope(function() {
    var gluObjectWrapper = framework.opengl.gluObjectWrapper;

    gluObjectWrapper.traits = function(name, genFunc, deleteFunc) {
        return {
            name: name,
            genFunc: genFunc,
            deleteFunc: deleteFunc
        };
    };

    gluObjectWrapper.ObjectWrapper = function(gl, traits) {
        this.m_gl = gl;
        this.m_traits = traits;
        this.m_object = 0;
        
        this.m_object = this.m_traits.genFunc.call(gl);
    };

    gluObjectWrapper.ObjectWrapper.prototype.clear = function() {
        this.m_traits.deleteFunc.call(this.m_gl, this.m_object);
    };

    gluObjectWrapper.ObjectWrapper.prototype.get = function() {
        return this.m_object;
    };

    gluObjectWrapper.Framebuffer = function(gl) {
        gluObjectWrapper.ObjectWrapper.call(this, gl, gluObjectWrapper.traits(
            'framebuffer', gl.createFramebuffer, gl.deleteFramebuffer
        ));
    };
    gluObjectWrapper.Framebuffer.prototype = Object.create(gluObjectWrapper.ObjectWrapper.prototype);
    gluObjectWrapper.Framebuffer.prototype.constructor = gluObjectWrapper.Framebuffer;

});
