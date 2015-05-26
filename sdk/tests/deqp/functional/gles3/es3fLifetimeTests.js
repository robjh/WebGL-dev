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
goog.provide('functional.gles3.es3fLifetimeTests');
goog.require('modules.shared.glsLifetimeTests');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.delibs.debase.deRandom');

goog.scope(function() {
var es3fLifetimeTests = functional.gles3.es3fLifetimeTests;
var glsLifetimeTests = modules.shared.glsLifetimeTests;
var gluShaderProgram = framework.opengl.gluShaderProgram;
var deRandom = framework.delibs.debase.deRandom;

/** @const */ var VIEWPORT_SIZE = 128;
/** @const */ var NUM_COMPONENTS = 4;
/** @const */ var NUM_VERTICES = 3 ;

var setParentClass = function(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
};

/**
 * @constructor
 * @extends {gluShaderProgram.ShaderProgram}
 */
es3fLifetimeTests.ScaleProgram = function()
{
    gluShaderProgram.ShaderProgram.call(this, gl, this.getSources());
    assertMsgOptions(this.isOk(), "Program creation failed", false, true);
    this.m_scaleLoc = gl.getUniformLocation(getProgram(), "scale");
    this.m_posLoc = gl.getAttribLocation(getProgram(), "pos");
};

setParentClass(es3fLifetimeTests.ScaleProgram, gluShaderProgram.ShaderProgram);

/**
 * @param {WebGLVertexArrayObject} vao
 * @param {number} scale
 * @param {boolean} tf
 * @param {tcuSurface.Surface} dst
 */
es3fLifetimeTests.ScaleProgram.prototype.draw = function(vao, scale, tf, dst) {
    es3fLifetimeTests.ScaleProgram.seed = es3fLifetimeTests.ScaleProgram.seed || 0;
    ++es3fLifetimeTests.ScaleProgram.seed;

    var viewport = new glsTextureTestUtil.RandomViewport(document.getElementById('canvas'), VIEWPORT_SIZE, VIEWPORT_SIZE, es3fLifetimeTests.ScaleProgram.seed);
    gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(this.m_posLoc);
    gl.useProgram(this.getProgram());

    gl.uniform1f(this.m_scaleLoc, scale);

    if (tf)
        gl.beginTransformFeedback(GL_TRIANGLES);
    gl.drawArrays(GL_TRIANGLES, 0, 3);
    if (tf)
        gl.endTransformFeedback();

    if (dst)
        glsLifetimeTests.readRectangle(viewport, dst);

    gl.bindVertexArray(null);   
    
}

/**
 * @param {WebGLBuffer} buffer
 * @param {WebGLVertexArrayObject} vao
 */
es3fLifetimeTests.ScaleProgram.prototype.setPos  = function(buffer, vao) {
    gl.bindBuffer(GL_ARRAY_BUFFER, buffer);
    gl.bindVertexArray(vao);
    gl.vertexAttribPointer(this.m_posLoc, NUM_COMPONENTS, GL_FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    gl.bindBuffer(GL_ARRAY_BUFFER, null);
};

/**
 * @private
 */
es3fLifetimeTests.ScaleProgram.prototype.getSources = function() {
/** @const */ var s_vertexShaderSrc = 
    "#version 100\n" +
    "attribute vec4 pos;\n" +
    "uniform float scale;\n" +
    "void main ()\n" +
    "{\n" +
    "    gl_Position = vec4(scale * pos.xy, pos.zw);\n" +
    "}";

/** @const */ var s_fragmentShaderSrc = 
    "#version 100\n" +
    "void main ()\n" +
    "{\n" +
    "    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);\n" +
    "}";
    var sources = gluShaderProgram.ProgramSources();
    sources.add(new gluShaderProgram.VertexSource(s_vertexShaderSrc));
    sources.add(new gluShaderProgram.FragmentSource(s_fragmentShaderSrc));
    sources.add(new gluShaderProgram.TransformFeedbackMode(GL_INTERLEAVED_ATTRIBS));
    sources.add(new gluShaderProgram.TransformFeedbackVarying('gl_Position'));
    return sources;
};

/**
 * @constructor
 * @extends {glsLifetimeTests.SimpleBinder}
 */
es3fLifetimeTests.VertexArrayBinder = function() {
    glsLifetimeTests.SimpleBinder.call(this, null, gl.NONE, GL_VERTEX_ARRAY_BINDING);
};

setParentClass(es3fLifetimeTests.VertexArrayBinder, glsLifetimeTests.SimpleBinder);

es3fLifetimeTests.VertexArrayBinder.prototype.bind = function(vao) { gl.bindVertexArray(vao); };


/**
 * @constructor
 * @extends {glsLifetimeTests.Binder}
 */
es3fLifetimeTests.SamplerBinder : public Binder = function() {
   glsLifetimeTests.Binder.call(this); 
};

setParentClass(es3fLifetimeTests.SamplerBinder, glsLifetimeTests.Binder);

es3fLifetimeTests.SamplerBinder.prototype.bind = function(sampler) { gl.bindSampler(0, sampler); };
es3fLifetimeTests.SamplerBinder.prototype.getBinding = function() { return gl.getParameter(gl.SAMPLER_BINDING); };
es3fLifetimeTests.SamplerBinder.prototype.genRequired = function() { return true; };


/**
 * @constructor
 * @extends {glsLifetimeTests.Binder}
 */
es3fLifetimeTests.QueryBinder : public Binder = function() {
   glsLifetimeTests.Binder.call(this); 
};

setParentClass(es3fLifetimeTests.QueryBinder, glsLifetimeTests.Binder);

es3fLifetimeTests.QueryBinder.prototype.bind = function(query) {
    if (query)
        gl.beginQuery(GL_ANY_SAMPLES_PASSED, query);
    else
        gl.endQuery(GL_ANY_SAMPLES_PASSED);
 gl.bindSampler(0, sampler);
};

es3fLifetimeTests.QueryBinder.prototype.getBinding = function() { return null; };



/**
 * @constructor
 * @extends {glsLifetimeTests.Attacher}
 * @param {glsLifetimeTests.Type} elementType
 * @param {glsLifetimeTests.Type} varrType 
 * @param {es3fLifetimeTests.ScaleProgram} program
 */
es3fLifetimeTests.BufferVAOAttacher = function(elementType, varrType, program) {
    glsLifetimeTests.Attacher.call(this, elementType, varrType);
    this.m_program = program;
};

setParentClass(es3fLifetimeTests.BufferVAOAttacher, glsLifetimeTests.Attacher);


/**
 * @param {number} seed
 * @param {number} usage
 * @param {WebGLBuffer} buffer
 */
es3fLifetimeTests.initBuffer = function(seed, usage, buffer) {
    /** @const */ var s_varrData = [
    -1.0,  0.0, 0.0, 1.0,
     1.0,  1.0, 0.0, 1.0,
     0.0, -1.0, 0.0, 1.0
    ];
    gl.bindBuffer(GL_ARRAY_BUFFER, buffer);
    if (seed == 0)
        gl.bufferData(GL_ARRAY_BUFFER, new Float32Array(s_varrData), usage);
    else
    {
        var  rnd = deRandom.Random(seed);
        var data = [];

        for (var ndx = 0; ndx < NUM_VERTICES; ndx++)
        {
            data.push(2 *  (rnd.getFloat() - 0.5));
            data.push(2 *  (rnd.getFloat() - 0.5));
            data.push(0);
            data.push(1);
        }
        gl.bufferData(GL_ARRAY_BUFFER, new Float32Array(data), usage);
    }
    gl.bindBuffer(GL_ARRAY_BUFFER, null);
};

es3fLifetimeTests.BufferVAOAttacher.prototype.initAttachment = function(seed, buffer) {
    es3fLifetimeTests.initBuffer(seed, GL_STATIC_DRAW, buffer);
    debug("Initialized buffer " + buffer + " from seed " + seed);
};

es3fLifetimeTests.BufferVAOAttacher.prototype.attach = function(buffer, vao) {
    this.m_program.setPos(buffer, vao);
    debug("Set the `pos` attribute in VAO " + vao + " to buffer " + buffer);
};

es3fLifetimeTests.BufferVAOAttacher.prototype.detach = function(buffer, vao) {
    this.attach(null, vao);
};


es3fLifetimeTests.BufferVAOAttacher.prototype.getAttachment = function(vao) {
    gl.bindVertexArray(vao);
    var name = gl.getVertexAttrib(0, GL_VERTEX_ATTRIB_ARRAY_BUFFER_BINDING);
    gl.bindVertexArray(null);
    return name;
};


/**
 * @constructor
 * @extends {glsLifetimeTests.InputAttacher}
 */
es3fLifetimeTests.BufferVAOInputAttacher = function(attacher) {
    glsLifetimeTests.InputAttacher.call(this, attacher);
    this.m_program = attacher.getProgram();
};

setParentClass(es3fLifetimeTests.BufferVAOInputAttacher, glsLifetimeTests.InputAttacher);

es3fLifetimeTests.BufferVAOInputAttacher.prototype.drawContainer = function(vao, dst)
{
    this.m_program.draw(vao, 1.0, false, dst);
    debug("Drew an output image with VAO " + vao);
};


/**
 * @constructor
 * @extends {glsLifetimeTests.Attacher}
 * @param {glsLifetimeTests.Type} elementType
 * @param {glsLifetimeTests.Type} tfType 
*/
es3fLifetimeTests.BufferTfAttacher = function(elementType, tfType) {
    glsLifetimeTests.Attacher.call(this, elementType, tfType);
};

setParentClass(es3fLifetimeTests.BufferTfAttacher, glsLifetimeTests.Attacher);

es3fLifetimeTests.BufferTfAttacher.prototype.initAttachment = function(seed, buffer) {
    es3fLifetimeTests.initBuffer(seed, GL_DYNAMIC_READ, buffer);
    debug("Initialized buffer " + buffer + " from seed " + seed);
};

es3fLifetimeTests.BufferTfAttacher.prototype.attach = function(buffer, tf) {
    gl.bindTransformFeedback(GL_TRANSFORM_FEEDBACK, tf);
    gl.bindBufferBase(GL_TRANSFORM_FEEDBACK_BUFFER, 0, buffer);
    gl.bindTransformFeedback(GL_TRANSFORM_FEEDBACK, null);
};

es3fLifetimeTests.BufferTfAttacher.prototype.detach = function(buffer, vao) {
    glBindTransformFeedback(GL_TRANSFORM_FEEDBACK, tf);
    glBindBufferBase(GL_TRANSFORM_FEEDBACK_BUFFER, 0, null);
    glBindTransformFeedback(GL_TRANSFORM_FEEDBACK, null);

};


es3fLifetimeTests.BufferTfAttacher.prototype.getAttachment = function(vao) {
    gl.bindTransformFeedback(GL_TRANSFORM_FEEDBACK, tf);
    var name = gl.getParameter(GL_TRANSFORM_FEEDBACK_BUFFER_BINDING);
    gl.bindTransformFeedback(GL_TRANSFORM_FEEDBACK, null);
    return name;
};

/**
 * @constructor
 * @extends {glsLifetimeTests.OutputAttacher}
 */
es3fLifetimeTests.BufferTfOutputAttacher = function(attacher, program) {
    glsLifetimeTests.OutputAttacher.call(this, attacher);
    this.m_program = program;
};

setParentClass(es3fLifetimeTests.BufferTfOutputAttacher, glsLifetimeTests.OutputAttacher);

es3fLifetimeTests.BufferTfOutputAttacher.prototype.setupContainer = function(seed, tf) {
    var       posBuf  = gl.createBuffer();
    var  vao = gl.createVertexArray();

    es3fLifetimeTests.initBuffer(seed, GL_STATIC_DRAW, posBuf);
    this.m_program.setPos(posBuf, vao);

    g.bBindTransformFeedback(GL_TRANSFORM_FEEDBACK, tf);
    this.m_program.draw(vao, -1.0, true, null);
    debug("Drew an image with seed " + seed + " with transform feedback to " + tf);
    gl.bindTransformFeedback(GL_TRANSFORM_FEEDBACK, null);
    gl.deleteVertexArray(vao);
    gl.deleteBuffer(posBuf);
};

es3fLifetimeTests.BufferTfOutputAttacher.prototype.drawAttachment = function(buffer, dst) {
    var  vao = gl.createVertexArray();

    this.m_program.setPos(buffer, vao);
    this.m_program.draw(vao, 1.0, false, dst);
    debug("Drew output image with vertices from buffer " + buffer);
    gl.deleteVertexArray(vao);
};

/**
 * @constructor
 * @extends {glsLifetimeTests.ES2Types}
 */
es3fLifetimeTests.ES3Types = function() {
    es3fLifetimeTests.call(this);
    this.m_program = new es3fLifetimeTests.ScaleProgram();
    this.m_queryBind = new es3fLifetimeTests.QueryBinder();
    this.m_queryType = new glsLifetimeTests.SimpleType('query', gl.createQuery, gl.deleteQuery, gl.isQuery, this.m_queryBind);
    this.m_tfBind = new glsLifetimeTests.SimpleBinder(gl.bindTransformFeedback, GL_TRANSFORM_FEEDBACK,
                     GL_TRANSFORM_FEEDBACK_BINDING, true);
    this.m_tfType = new glsLifetimeTests.SimpleType('transform_feedback', gl.createTransformFeedback, gl.deleteTransformFeedback, gl.isTransformFeedback, this.m_tfBind);
    this.m_varrBind = new es3fLifetimeTests.VertexArrayBinder();
    this.m_varrType = new glsLifetimeTests.SimpleType('vertex_array', gl.createVertexArray, gl.deleteVertexArray, gl.isVertexArray, this.m_varrBind);
    this.m_samplerBind = new es3fLifetimeTests.SamplerBinder();
    this.m_samplerType = new glsLifetimeTests.SimpleType('sampler', gl.createSampler, gl.deleteSampler, gl.isSampler, this.m_samplerBind);
    this.m_bufVarrAtt = new es3fLifetimeTests.BufferVAOAttacher(this.m_bufferType, this.m_varrType, this.m_program);
    this.m_bufVarrInAtt = new es3fLifetimeTests.BufferVAOInputAttacher(this.m_bufVarrAtt);
    this.m_bufTfAtt = new es3fLifetimeTests.BufferTfAttacher(this.m_bufferType, this.m_tfType);
    this.m_bufTfOutAtt = new es3fLifetimeTests.BufferTfOutputAttacher(this.m_bufTfAtt, this.m_program);

    this.m_types.push(this.m_queryType, this.m_tfType, this.m_varrType, this.m_samplerType);
    this.m_attachers.push(this.m_bufVarrAtt, this.m_bufTfAtt);
    this.m_inAttachers.push(this.m_bufVarrInAtt);
    this.m_outAttachers.push(this.m_bufTfOutAtt);
};

setParentClass(es3fLifetimeTests.ES3Types, glsLifetimeTests.ES2Types);


es3fLifetimeTests.genTestCases = function() {
    var state = tcuTestCase.runner;
    state.setRoot(tcuTestCase.newTest('lifetime', 'Top level'));

    var types = new es3fLifetimeTests.ES3Types();
    glsLifetimeTests.addTestCases(state, types);
    /* TODO: Add TfDeleteActiveTest test */
};

/**
 * Create and execute the test cases
 */
es3fLifetimeTests.run = function(context) {
    gl = context;
    try {
        es3fLifetimeTests.genTestCases();
        tcuTestCase.runner.runCallback(tcuTestCase.runTestCases);
    } catch (err) {
        bufferedLogToConsole(err);
        tcuTestCase.runner.terminate();
    }

};


});