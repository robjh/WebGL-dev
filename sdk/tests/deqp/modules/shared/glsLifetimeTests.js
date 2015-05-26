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
goog.provide('modules.shared.glsLifetimeTests');
goog.require('framework.common.tcuStringTemplate');
goog.require('framework.common.tcuSurface');
goog.require('framework.delibs.debase.deRandom');
goog.require('modules.shared.glsTextureTestUtil');
goog.require('framework.opengl.gluShaderProgram');

goog.scope(function() {
var glsLifetimeTests = modules.shared.glsLifetimeTests;
var tcuStringTemplate = framework.common.tcuStringTemplate;
var tcuSurface = framework.common.tcuSurface;
var deRandom = framework.delibs.debase.deRandom;
var glsTextureTestUtil = modules.shared.glsTextureTestUtil;
var gluShaderProgram = framework.opengl.gluShaderProgram;

/** @type {WebGL2RenderingContext} */ var gl = new WebGL2RenderingContext();

/** @const */ var VIEWPORT_SIZE = 128;
/** @const */ var FRAMEBUFFER_SIZE = 128;

var setParentClass = function(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
};

/** @const */ var s_vertexShaderSrc = 
    "#version 100\n" +
    "attribute vec2 pos;\n" +
    "void main()\n" +
    "{\n" +
    "    gl_Position = vec4(pos.xy, 0.0, 1.0);\n" +
    "}\n";

/** @const */ var s_fragmentShaderSrc =
   "#version 100\n" +
    "void main()\n" +
    "{\n" +
    "    gl_FragColor = vec4(1.0);\n" +
    "}\n";

/**
 * @constructor
 * @extends{gluShaderProgram.Shader}
 * @param {gluShaderProgram.shaderType} type
 * @param {string} src
 */
glsLifetimeTests.CheckedShader = function(type, src) {
    gluShaderProgram.Shader.call(this, gl, type);
    this.setSources(src);
    this.compile();
    assertMsgOptions(this.getCompileStatus() === true, "Failed to compile shader", false, true);
};

setParentClass(glsLifetimeTests.CheckedShader, gluShaderProgram.Shader);


/**
 * @constructor
 * @extends{gluShaderProgram.Program}
 */
glsLifetimeTests.CheckedProgram = function(vtxShader, fragShader) {
    gluShaderProgram.Program.call(this, gl);
    this.attachShader(vtxShader);
    this.attachShader(fragShader);
    this.link();
    assertMsgOptions(this.info.linkOk === true, "Failed to link program", false, true);
};

setParentClass(glsLifetimeTests.CheckedProgram, gluShaderProgram.Program);

/**
 * @constructor
 */
glsLifetimeTests.Binder = function() {
};

glsLifetimeTests.Binder.prototype.bind = null;
glsLifetimeTests.Binder.prototype.getBinding = null;

/**
 * @constructor
 * @extends {glsLifetimeTests.Binder}
 */
glsLifetimeTests.SimpleBinder = function(bindFunc, bindTarget, bindingParam) {
    glsLifetimeTests.Binder.call(this);
    this.m_bindFunc = bindFunc;
    this.m_bindTarget = bindTarget;
    this.m_bindingParam = bindingParam;
};

setParentClass(glsLifetimeTests.SimpleBinder, glsLifetimeTests.Binder);

glsLifetimeTests.SimpleBinder.prototype.bind = function(obj) {
    this.m_bindFunc.call(gl, this.m_bindTarget, obj);
};

glsLifetimeTests.SimpleBinder.prototype.getBinding = function() {
    return gl.getParameter(this.m_bindingParam);
};

/**
 * @constructor
 */
glsLifetimeTests.Type = function() {
};

glsLifetimeTests.Type.prototype.gen = null;
glsLifetimeTests.Type.prototype.release = null;
glsLifetimeTests.Type.prototype.exists = null;
glsLifetimeTests.Type.prototype.isDeleteFlagged = function(obj) { return false; };
glsLifetimeTests.Type.prototype.binder = function() { return null; };
glsLifetimeTests.Type.prototype.getName = null;
glsLifetimeTests.Type.prototype.nameLingers = function() { return false; };
glsLifetimeTests.Type.prototype.genCreates = function() { return false; };

/**
 * @constructor
 * @extends {glsLifetimeTests.Type}
 * @param {string} name
 * @param {function(): WebGLObject} genFunc
 * @param {function(?)} deleteFunc
 * @param {function(WebGLObject): boolean} existsFunc
 * @param {glsLifetimeTests.Binder} binder
 * @param {boolean=} genCreates
 */
glsLifetimeTests.SimpleType = function(name, genFunc, deleteFunc, existsFunc, binder, genCreates) {
    glsLifetimeTests.Type.call(this);
    this.m_getName = name;
    this.m_genFunc = genFunc;
    this.m_deleteFunc = deleteFunc;
    this.m_existsFunc = existsFunc;
    this.m_binder = binder;
    this.m_genCreates = genCreates || false;
};

setParentClass(glsLifetimeTests.SimpleType, glsLifetimeTests.Type);

glsLifetimeTests.SimpleType.prototype.gen = function() { return this.m_genFunc.call(gl); };

glsLifetimeTests.SimpleType.prototype.release = function(obj) { return this.m_deleteFunc.call(gl, obj); };

glsLifetimeTests.SimpleType.prototype.exists = function(obj) { return this.m_existsFunc.call(gl, obj); };

glsLifetimeTests.SimpleType.prototype.binder = function() { return this.m_binder; };

glsLifetimeTests.SimpleType.prototype.getName = function() { return this.m_getName; };

glsLifetimeTests.SimpleType.prototype.genCreates = function() { return this.m_genCreates; };

/**
 * @constructor
 * @extends {glsLifetimeTests.Type}
 */
glsLifetimeTests.ProgramType = function() {
    glsLifetimeTests.Type.call(this);
};

setParentClass(glsLifetimeTests.ProgramType, glsLifetimeTests.Type);

glsLifetimeTests.ProgramType.prototype.gen = function() { return gl.createProgram(); };

glsLifetimeTests.ProgramType.prototype.release = function(obj) { return gl.deleteProgram(obj); };

glsLifetimeTests.ProgramType.prototype.exists = function(obj) { return gl.isProgram(obj); };

glsLifetimeTests.ProgramType.prototype.getName = function() { return 'program'; };

glsLifetimeTests.ProgramType.prototype.genCreates = function() { return true; };

glsLifetimeTests.ProgramType.prototype.nameLingers = function() { return true; };

glsLifetimeTests.ProgramType.prototype.isDeleteFlagged = function(obj) { return gl.getProgramParameter(obj, gl.DELETE_STATUS); };

/**
 * @constructor
 * @extends {glsLifetimeTests.Type}
 */
glsLifetimeTests.ShaderType = function() {
    glsLifetimeTests.Type.call(this);
};

setParentClass(glsLifetimeTests.ShaderType, glsLifetimeTests.Type);

glsLifetimeTests.ShaderType.prototype.gen = function() { return gl.createShader(gl.FRAGMENT_SHADER); };

glsLifetimeTests.ShaderType.prototype.release = function(obj) { return gl.deleteShader(obj); };

glsLifetimeTests.ShaderType.prototype.exists = function(obj) { return gl.isShader(obj); };

glsLifetimeTests.ShaderType.prototype.getName = function() { return 'shader'; };

glsLifetimeTests.ShaderType.prototype.genCreates = function() { return true; };

glsLifetimeTests.ShaderType.prototype.nameLingers = function() { return true; };

glsLifetimeTests.ShaderType.prototype.isDeleteFlagged = function(obj) { return gl.getShaderParameter(obj, gl.DELETE_STATUS); };

/**
 * @constructor
 * @param {glsLifetimeTests.Type} elementType
 * @param {glsLifetimeTests.Type} containerType
 */
glsLifetimeTests.Attacher = function(elementType, containerType) {
    this.m_elementType = elementType;
    this.m_containerType = containerType;
};

glsLifetimeTests.Attacher.prototype.initAttachment = null;
glsLifetimeTests.Attacher.prototype.attach = function(element, target) { throw new Error('Virtual function'); };
glsLifetimeTests.Attacher.prototype.detach = function(element, target) { throw new Error('Virtual function'); };
glsLifetimeTests.Attacher.prototype.canAttachDeleted = function() { return true; };
glsLifetimeTests.Attacher.prototype.getElementType = function() { return this.m_elementType; };
glsLifetimeTests.Attacher.prototype.getContainerType = function() { return this.m_containerType; };

/**
 * @constructor
 */
glsLifetimeTests.InputAttacher = function(attacher) {
    this.m_attacher = attacher;
};

glsLifetimeTests.InputAttacher.prototype.getAttacher = function() { return this.m_attacher; };

/**
 * @param {WebGLObject} container
 * @param {tcuSurface.Surface} dst
 */
glsLifetimeTests.InputAttacher.prototype.drawContainer = function(container, dst) { throw new Error('Virtual function'); };

/**
 * @constructor
 */
glsLifetimeTests.OutputAttacher = function(attacher) {
    this.m_attacher = attacher;
};

glsLifetimeTests.OutputAttacher.prototype.getAttacher = function() { return this.m_attacher; };

/**
 * @param {number} seed
 * @param {WebGLObject} container
 */
glsLifetimeTests.OutputAttacher.prototype.setupContainer = function(seed, container) { throw new Error('Virtual function'); };

/**
 * @param {WebGLObject} attachment
 * @param {tcuSurface.Surface} dst
 */
glsLifetimeTests.OutputAttacher.prototype.drawAttachment = function(attachment, dst) { throw new Error('Virtual function'); };

/**
 * @constructor
 */
glsLifetimeTests.Types = function() {
    /** @type {Array<glsLifetimeTests.Type>} */ this.m_types = [];
    /** @type {Array<glsLifetimeTests.Attacher>} */ this.m_attachers = [];
    /** @type {Array<glsLifetimeTests.InputAttacher>} */ this.m_inAttachers = [];
    /** @type {Array<glsLifetimeTests.OutputAttacher>} */ this.m_outAttachers = [];
};

glsLifetimeTests.Types.prototype.getProgramType = null;

glsLifetimeTests.Types.prototype.getTypes = function() { return this.m_types; };

glsLifetimeTests.Types.prototype.getAttachers = function() { return this.m_attachers; };

glsLifetimeTests.Types.prototype.getInputAttachers = function() { return this.m_inAttachers; };

glsLifetimeTests.Types.prototype.getOutputAttachers = function() { return this.m_outAttachers; };

/**
 * @param {number} seed
 * @param {WebGLFramebuffer} fbo
 */
glsLifetimeTests.setupFbo = function(seed, fbo) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    if (seed == 0) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    } else{
        var rnd = new deRandom.Random(seed);
        var width = rnd.getInt(0, FRAMEBUFFER_SIZE);
        var height = rnd.getInt(0, FRAMEBUFFER_SIZE);
        var x = rnd.getInt(0, FRAMEBUFFER_SIZE - width);
        var y = rnd.getInt(0, FRAMEBUFFER_SIZE - height);
        var r1 = rnd.getFloat();
        var g1 = rnd.getFloat();
        var b1 = rnd.getFloat();
        var a1 = rnd.getFloat();
        var r2 = rnd.getFloat();
        var g2 = rnd.getFloat();
        var b2 = rnd.getFloat();
        var a2 = rnd.getFloat();

        gl.clearColor(r1, g1, b1, a1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.scissor(x, y, width, height);
        gl.enable(gl.SCISSOR_TEST);
        gl.clearColor(r2, g2, b2, a2);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.disable(gl.SCISSOR_TEST);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

glsLifetimeTests.drawFbo = function(fbo, dst) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    dst.setSize(FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE);
    gl.readPixels(0, 0, FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE, gl.RGBA, gl.UNSIGNED_BYTE, dst.getAccess().getBuffer());
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

/**
 * @constructor
 * @extends {glsLifetimeTests.Attacher}
 */
glsLifetimeTests.FboAttacher = function(elementType, containerType) {
    glsLifetimeTests.Attacher.call(this, elementType, containerType);
};

setParentClass(glsLifetimeTests.FboAttacher, glsLifetimeTests.Attacher);

glsLifetimeTests.FboAttacher.prototype.initStorage = function() { throw new Error('Virtual function'); };

glsLifetimeTests.FboAttacher.prototype.initAttachment = function(seed, element) {
    var binder = this.getElementType().binder();
    var fbo = gl.createFramebuffer();

    binder.bind(element);
    this.initStorage();
    binder.bind(null);

    this.attach(element, fbo);
    glsLifetimeTests.setupFbo(seed, fbo);
    this.detach(element, fbo);

    gl.deleteFramebuffer(fbo);

    debug('Drew to ' + this.getElementType().getName() + ' ' + element + ' with seed ' + seed + '.');
};

/**
 * @constructor
 * @extends {glsLifetimeTests.InputAttacher}
 */
glsLifetimeTests.FboInputAttacher = function(attacher) {
    glsLifetimeTests.InputAttacher.call(this, attacher);
};

setParentClass(glsLifetimeTests.FboInputAttacher, glsLifetimeTests.InputAttacher);

glsLifetimeTests.FboInputAttacher.prototype.drawContainer = function(fbo, dst) {
    glsLifetimeTests.drawFbo(fbo, dst);
    debug('Read pixels from framebuffer ' + fbo + ' to output image.');
};

/**
 * @constructor
 * @extends {glsLifetimeTests.OutputAttacher}
 */
glsLifetimeTests.FboOutputAttacher = function(attacher) {
    glsLifetimeTests.OutputAttacher.call(this, attacher);
};

setParentClass(glsLifetimeTests.FboOutputAttacher, glsLifetimeTests.OutputAttacher);

glsLifetimeTests.FboOutputAttacher.prototype.setupContainer = function(seed, fbo) {
    glsLifetimeTests.setupFbo(seed, /** @type {WebGLFramebuffer} */ (fbo));
   debug('Drew to framebuffer ' + fbo + ' with seed ' + seed + '.');
};

glsLifetimeTests.FboOutputAttacher.prototype.drawAttachment = function(element, dst) {
    var fbo = gl.createFramebuffer();
    this.m_attacher.attach(element, fbo);
    glsLifetimeTests.drawFbo(fbo, dst);
    this.m_attacher.detach(element, fbo);
     gl.deleteFramebuffer(fbo);
    debug('Read pixels from ' + this.m_attacher.getElementType().getName() + ' ' + element + ' to output image.');
};

/**
 * @constructor
 * @extends {glsLifetimeTests.FboAttacher}
 */
glsLifetimeTests.TextureFboAttacher = function(elementType, containerType) {
    glsLifetimeTests.FboAttacher.call(this, elementType, containerType);
};

setParentClass(glsLifetimeTests.TextureFboAttacher, glsLifetimeTests.FboAttacher);

glsLifetimeTests.TextureFboAttacher.prototype.initStorage = function() {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE, 0,
                     gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4, null);

};

glsLifetimeTests.TextureFboAttacher.prototype.attach = function(texture, fbo) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                                  gl.TEXTURE_2D, texture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

glsLifetimeTests.TextureFboAttacher.prototype.detach = function(texture, fbo) {
    this.attach(null, fbo);
};

glsLifetimeTests.getFboAttachment = function(fbo, requiredType) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    var type = gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                                               gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE);
    var name = gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                                               gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var ret = type == requiredType ? name : null;
    return ret;
};

glsLifetimeTests.TextureFboAttacher.prototype.getAttachment = function(fbo) {
    return glsLifetimeTests.getFboAttachment(fbo, gl.TEXTURE);
};

/**
 * @constructor
 * @extends {glsLifetimeTests.FboAttacher}
 */
glsLifetimeTests.RboFboAttacher = function(elementType, containerType) {
    glsLifetimeTests.FboAttacher.call(this, elementType, containerType);
};

setParentClass(glsLifetimeTests.RboFboAttacher, glsLifetimeTests.FboAttacher);

glsLifetimeTests.RboFboAttacher.prototype.initStorage = function() {
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, FRAMEBUFFER_SIZE, FRAMEBUFFER_SIZE);

};

glsLifetimeTests.RboFboAttacher.prototype.attach = function(rbo, fbo) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbo);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

glsLifetimeTests.RboFboAttacher.prototype.detach = function(rbo, fbo) {
    this.attach(null, fbo);
};

glsLifetimeTests.RboFboAttacher.prototype.getAttachment = function(fbo) {
    return glsLifetimeTests.getFboAttachment(fbo, gl.RENDERBUFFER);
};

/**
 * @constructor
 * @extends {glsLifetimeTests.Attacher}
 */
glsLifetimeTests.ShaderProgramAttacher = function(elementType, containerType) {
    glsLifetimeTests.Attacher.call(this, elementType, containerType);
};

setParentClass(glsLifetimeTests.ShaderProgramAttacher, glsLifetimeTests.Attacher);

glsLifetimeTests.ShaderProgramAttacher.prototype.initAttachment = function(seed, shader) {
    var s_fragmentShaderTemplate =
    '#version 100\n' +
    'void main()\n' +
    '{\n' +
    ' gl_FragColor = vec4(${RED}, ${GREEN}, ${BLUE}, 1.0);\n' +
    '}';

    var rnd = new deRandom.Random(seed);
    var params = [];
    params['RED'] = rnd.getFloat().toString(10);
    params['GREEN'] = rnd.getFloat().toString(10);
    params['BLUE'] = rnd.getFloat().toString(10);

    var source = tcuStringTemplate.specialize(s_fragmentShaderTemplate, params);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var compileStatus = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    assertMsgOptions(compileStatus === true, 'Failed to compile shader: ' + source, false, true);
};

glsLifetimeTests.ShaderProgramAttacher.prototype.attach = function(shader, program) {
    gl.attachShader(program, shader);
};

glsLifetimeTests.ShaderProgramAttacher.prototype.dettach = function(shader, program) {
    gl.detachShader(program, shader);
};

glsLifetimeTests.ShaderProgramAttacher.prototype.getAttachment = function(program) {
    var shaders = gl.getAttachedShaders(program);
    for (var i = 0; i < shaders.length; i++) {
        var shader = shaders[i];
        var type = gl.getShaderParameter(shader, gl.SHADER_TYPE);
        if (type === gl.FRAGMENT_SHADER)
            return shader;
    }
    return null;
};

glsLifetimeTests.readRectangle = function(rect, dst) {
    dst.setSize(rect.width, rect.height);
    gl.readPixels(rect.x, rect.y, rect.width, rect.height, gl.RGBA, gl.UNSIGNED_BYTE, dst.getAccess().getBuffer());
};

/**
 * @constructor
 * @extends {glsLifetimeTests.InputAttacher}
 */
glsLifetimeTests.ShaderProgramInputAttacher = function(attacher) {
    glsLifetimeTests.InputAttacher.call(this, attacher);
};

setParentClass(glsLifetimeTests.ShaderProgramInputAttacher, glsLifetimeTests.InputAttacher);

glsLifetimeTests.ShaderProgramInputAttacher.prototype.drawContainer = function(container, dst) {
    var program = /** @type {WebGLProgram} */ (container);
    var s_vertices = [-1.0, 0.0, 1.0, 1.0, 0.0, -1.0];
    glsLifetimeTests.ShaderProgramInputAttacher.seed = glsLifetimeTests.ShaderProgramInputAttacher.seed || 0;
    var vtxShader = new glsLifetimeTests.CheckedShader(gluShaderProgram.shaderType.VERTEX, s_vertexShaderSrc);
    var viewport = new glsTextureTestUtil.RandomViewport(document.getElementById('canvas'), VIEWPORT_SIZE, VIEWPORT_SIZE, glsLifetimeTests.ShaderProgramInputAttacher.seed);

    gl.attachShader(program, vtxShader.getShader());
    gl.linkProgram(program);

    var linkStatus = gl.getProgramParameter(program, gl.LINK_STATUS);
    assertMsgOptions(linkStatus === true, 'Program link failed', false, true);

    debug('Attached a temporary vertex shader and linked program ' + program);

    gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

    debug('Positioned viewport randomly');

    gl.useProgram(program);

    var posLoc = gl.getAttribLocation(program, 'pos');
    assertMsgOptions(posLoc >= 0, 'Could not find pos attribute', false, true);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(s_vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.disableVertexAttribArray(posLoc);
    gl.deleteBuffer(buf);
    debug('Drew a fixed triangle');

    gl.useProgram(null);

    glsLifetimeTests.readRectangle(viewport, dst);
    debug('Copied viewport to output image');

    gl.detachShader(program, vtxShader.getShader());
    debug('Removed temporary vertex shader');
};

/**
 * @constructor
 * @extends {glsLifetimeTests.Types}
 */
glsLifetimeTests.ES2Types = function() {
    glsLifetimeTests.Types.call(this);
    this.m_bufferBind = new glsLifetimeTests.SimpleBinder(gl.bindBuffer, gl.ARRAY_BUFFER, gl.ARRAY_BUFFER_BINDING);
    this.m_bufferType = new glsLifetimeTests.SimpleType('buffer', gl.createBuffer, gl.deleteBuffer, gl.isBuffer, this.m_bufferBind);
    this.m_textureBind = new glsLifetimeTests.SimpleBinder(gl.bindTexture, gl.TEXTURE_2D, gl.TEXTURE_BINDING_2D);
    this.m_textureType = new glsLifetimeTests.SimpleType('texture', gl.createTexture, gl.deleteTexture, gl.isTexture, this.m_textureBind);
    this.m_rboBind = new glsLifetimeTests.SimpleBinder(gl.bindRenderbuffer, gl.RENDERBUFFER, gl.RENDERBUFFER_BINDING);
    this.m_rboType = new glsLifetimeTests.SimpleType('renderbuffer', gl.createRenderbuffer, gl.deleteRenderbuffer, gl.isRenderbuffer, this.m_rboBind);
    this.m_fboBind = new glsLifetimeTests.SimpleBinder(gl.bindFramebuffer, gl.FRAMEBUFFER, gl.FRAMEBUFFER_BINDING);
    this.m_fboType = new glsLifetimeTests.SimpleType('framebuffer', gl.createFramebuffer, gl.deleteFramebuffer, gl.isFramebuffer, this.m_fboBind);
    this.m_shaderType = new glsLifetimeTests.ShaderType();
    this.m_programType = new glsLifetimeTests.ProgramType();
    this.m_texFboAtt = new glsLifetimeTests.TextureFboAttacher(this.m_textureType, this.m_fboType);
    this.m_texFboInAtt = new glsLifetimeTests.FboInputAttacher(this.m_texFboAtt);
    this.m_texFboOutAtt = new glsLifetimeTests.FboOutputAttacher(this.m_texFboAtt);
    this.m_rboFboAtt = new glsLifetimeTests.RboFboAttacher(this.m_rboType, this.m_fboType);
    this.m_rboFboInAtt = new glsLifetimeTests.FboInputAttacher(this.m_rboFboAtt);
    this.m_rboFboOutAtt = new glsLifetimeTests.FboOutputAttacher(this.m_rboFboAtt);
    this.m_shaderAtt = new glsLifetimeTests.ShaderProgramAttacher(this.m_shaderType, this.m_programType);
    this.m_shaderInAtt = new glsLifetimeTests.ShaderProgramInputAttacher(this.m_shaderAtt);

    this.m_types.push(this.m_bufferType, this.m_textureType, this.m_rboType, this.m_fboType, this.m_shaderType, this.m_programType);
    this.m_attachers.push(this.m_texFboAtt, this.m_texFboAtt, this.m_shaderAtt);
    this.m_inAttachers.push(this.m_texFboInAtt, this.m_rboFboInAtt, this.m_shaderInAtt);
    this.m_outAttachers.push(this.m_texFboOutAtt, this.m_rboFboOutAtt);
};

setParentClass(glsLifetimeTests.ES2Types, glsLifetimeTests.Types);


/**
 * @constructor
 * @extends {tcuTestCase.TestCase}
 * @param {string} name
 * @param {string} description
 * @param {glsLifetimeTests.Type} type
 * @param {function} test;
 */
glsLifetimeTests.LifeTest = function(name, description, type, test) {
    tcuTestCase.TestCase.call(this, name, description);
    this.m_type = type;
    this.m_test = test;
};

glsLifetimeTests.LifeTest.prototype.iterate = function() {
    this.m_test();
    return tcuTestCase.IterateResult.STOP;
}


setParentClass(glsLifetimeTests.LifeTest, tcuTestCase.TestCase);

glsLifetimeTests.createLifeTestGroup = function(spec, types) {
    var group = tcuTestCase.newTest(spec.name, spec.name);

    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        var name = type.getName();
        if (!spec.needBind || type.binder() != null)
            group.addChild(new glsLifetimeTests.LifeTest(name, name, type, spec.func));
    }

    return group;
};

/**
 * @param {glsLifetimeTests.Types} types
 */
glsLifetimeTests.addTestCases = function(group, types) {
    var attacherName = function(attacher) {
        return attacher.getElementType().getName() + "_" +  attacher.getContainerType().getName();
    };

    var s_lifeTests = [
    { name: "gen",            func: glsLifetimeTests.LifeTest.testGen,         needBind:false   },
    { name: "delete",         func: glsLifetimeTests.LifeTest.testDelete,      needBind:false   },
    { name: "bind",           func: glsLifetimeTests.LifeTest.testBind,        needBind:true    },
    { name: "delete_bound",   func: glsLifetimeTests.LifeTest.testDeleteBound, needBind:true    },
    { name: "bind_no_gen",    func: glsLifetimeTests.LifeTest.testBindNoGen,   needBind:true    },
    ];

    s_lifeTests.forEach(spec) {
        group.addChild(glsLifetimeTests.createLifeTestGroup(spec, types.getTypes()));
    }

    var delUsedGroup = tcuTestCase.newTest("delete_used", "Delete current program");
    group.addChild(delUsedGroup);

    delUsedGroup.addChild(new glsLifetimeTests.LifeTest("program", "program", types.getProgramType(),
                     glsLifetimeTests.LifeTest.testDeleteUsed));

    var attGroup    = tcuTestCase.newTest("attach", "Attachment tests");
    group.addChild(attGroup);

    var nameGroup   = tcuTestCase.newTest("deleted_name", "Name of deleted attachment");
    attGroup.addChild(nameGroup);

    var atts = types.getAttachers();
    for (var i = 0; i < atts.length; i++)
    {
        var att = atts[i];
        var name = attacherName(att);
        nameGroup.addChild(new glsLifetimeTests.AttachmentTest(name, name, att,
                                               glsLifetimeTests.AttachmentTest.testDeletedNames));
    }

    var inputGroup = tcuTestCase.newTest("deleted_input", "Input from deleted attachment");
    attGroup.addChild(inputGroup);

    var inAtts = types.getInputAttachers();
    for (var i = 0; i < inAtts.length; i++)
    {
        var att = inAtts[i];
        var name = attacherName(att.getAttacher());
        inputGroup.addChild(new glsLifetimeTests.InputAttachmentTest(name, name, att));
    }

    var outputGroup =tcuTestCase.newTest("deleted_output", "Output to deleted attachment");
    attGroup.addChild(outputGroup);

    var outAtts = types.getOutputAttachers();
    for (var i = 0; i < outAtts.length; i++)
    {
        var att = outAtts[i];
        var name = attacherName(att.getAttacher());
        outputGroup.addChild(new glsLifetimeTests.OutputAttachmentTest(name, name, att));    
    }

};


});
