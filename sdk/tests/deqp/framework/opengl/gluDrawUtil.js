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
goog.provide('framework.opengl.gluDrawUtil');


goog.scope(function() {

var gluDrawUtil = framework.opengl.gluDrawUtil;


/**
 * Description of a vertex array binding
 * @constructor
 * @param {WebGLRenderingContext.GLEnum} type GL gluDrawUtil.Type of data
 * @param {string|number} location Binding location
 * @param {number} components Number of components per vertex
 * @param {number} elements Number of elements in the array
 * @param {Array.<number>} data Source data
 */
gluDrawUtil.VertexArrayBinding = function(type, location, components, elements, data) {
    this.type = type;
    this.location = location;
    this.components = components;
    this.elements = elements;
    this.data = data;
};

/**
 * Description of a vertex array binding
 * @param {gluDrawUtil.BindingPoint} binding
 * @param {gluDrawUtil.VertexArrayPointer} pointer
 * @return {gluDrawUtil.VertexArrayBinding}
 */
function vabFromBindingPointAndArrayPointer(binding, pointer) {
    var type = gl.FLOAT;
    var location = binding.location;
    var components = pointer.numComponents;
    var elements = pointer.numElements;
    var data = pointer.data;
    var vaBinding = new gluDrawUtil.VertexArrayBinding(type, location, components, elements, data);
    vaBinding.componentType = pointer.componentType;
    vaBinding.name = binding.name;
    vaBinding.bindingPointType = binding.type;
    vaBinding.convert = pointer.convert;
    vaBinding.stride = pointer.stride;
    return vaBinding;
};

/**
 * ! Lower named bindings to locations and eliminate bindings that are not used by program.
 * @param {WebGLRenderingContext} gl WebGL context
 * @param {number} program ID, ID of the shader program
 * @param {Array} inputArray - Array with the named binding locations
 * @param {Array} outputArray - Array with the lowered locations
 */
gluDrawUtil.namedBindingsToProgramLocations = function(gl, program, inputArray, outputArray) {
    if (typeof outputArray === 'undefined')
        outputArray = [];

    for (var i = 0; i < inputArray.length; i++)
    {
        var cur = inputArray[i];
        if (typeof cur.location === 'string')
        {
            //assert(binding.location >= 0);
            var location = gl.getAttribLocation(program.getProgram(), cur.location);
            if (location >= 0)
            {
                // Add binding.location as an offset to accomodate matrices.
                outputArray.push(new gluDrawUtil.VertexArrayBinding(cur.type, location, cur.components, cur.elements, cur.data));
            }
        }
        else
        {
            outputArray.push(cur);
        }
    }

    return outputArray;
};

/**
 * Creates vertex buffer, binds it and draws elements
 * @param {WebGLRenderingContext} gl WebGL context
 * @param {number} program ID, vertexProgramID
 * @param {Array.<number>} vertexArrays
 * @param {gluDrawUtil.PrimitiveList} primitives to gluDrawUtil.draw
 * @param {function()} callback
 */
gluDrawUtil.drawFromBuffers = function(gl, program, vertexArrays, primitives, callback) {
    /** TODO: finish implementation */
    /** @type {Array.<WebGLBuffer>} */ var objects = [];

    // Lower bindings to locations
    vertexArrays = gluDrawUtil.namedBindingsToProgramLocations(gl, program, vertexArrays);

    for (var i = 0; i < vertexArrays.length; i++) {
        /** @type {WebGLBuffer} */ var buffer = gluDrawUtil.vertexBuffer(gl, vertexArrays[i]);
        objects.push(buffer);
    }

    if (primitives.indices) {
        /** @type {WebGLBuffer} */ var elemBuffer = gluDrawUtil.indexBuffer(gl, primitives);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuffer);

        if (callback)
            callback.beforeDrawCall();

        gluDrawUtil.drawIndexed(gl, primitives, 0);

        if (callback)
            callback.afterDrawCall();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    } else {
    /** TODO: implement */
    }

  assertMsgOptions(gl.getError() === gl.NO_ERROR, 'drawArrays', false, true);
    for (var i = 0; i < vertexArrays.length; i++) {
        gl.disableVertexAttribArray(vertexArrays[i].location);
    }
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

/**
 * Creates vertex buffer, binds it and draws elements
 * @param {WebGLRenderingContext} gl WebGL context
 * @param {number} program ID, vertexProgramID
 * @param {Array.<number>} vertexArrays
 * @param {gluDrawUtil.PrimitiveList} primitives to gluDrawUtil.draw
 * @param {function()} callback
 */
gluDrawUtil.draw = function(gl, program, vertexArrays, primitives, callback) {
    /** TODO: finish implementation */
    /** @type {Array.<WebGLBuffer>} */ var objects = [];

    for (var i = 0; i < vertexArrays.length; i++) {
        /** @type {WebGLBuffer} */ var buffer = gluDrawUtil.vertexBuffer(gl, vertexArrays[i]);
        objects.push(buffer);
    }

    if (primitives.indices) {
        /** @type {WebGLBuffer} */ var elemBuffer = gluDrawUtil.indexBuffer(gl, primitives);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuffer);

        if (callback)
            callback.beforeDrawCall();

        gluDrawUtil.drawIndexed(gl, primitives, 0);

        if (callback)
            callback.afterDrawCall();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    } else {
    /** TODO: implement */
    }

  assertMsgOptions(gl.getError() === gl.NO_ERROR, 'drawArrays', false, true);
    for (var i = 0; i < vertexArrays.length; i++) {
        gl.disableVertexAttribArray(vertexArrays[i].location);
    }
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

/**
 * Creates vertex buffer, binds it and draws elements
 * @param {WebGLRenderingContext} gl WebGL context
 * @param {gluDrawUtil.PrimitiveList} primitives Primitives to gluDrawUtil.draw
 * @param {number} offset
 */
gluDrawUtil.drawIndexed = function(gl, primitives, offset) {
/** @type {WebGLRenderingContext.GLEnum} */ var mode = gluDrawUtil.getPrimitiveGLType(gl, primitives.type);
    /** TODO: C++ implementation supports different index types, we use only int16.
        Could it cause any issues?

        deUint32 indexGLType = getIndexGLType(primitives.indexType);
    */

    gl.drawElements(mode, primitives.indices.length, gl.UNSIGNED_SHORT, offset);
};

/**
 * Enums for primitive types
 * @enum
 */
gluDrawUtil.primitiveType = {
    TRIANGLES: 0,
    TRIANGLE_STRIP: 1,
    TRIANGLE_FAN: 2,

    LINES: 3,
    LINE_STRIP: 4,
    LINE_LOOP: 5,

    POINTS: 6,

    PATCHES: 7
};

/**
 * get GL type from primitive type
 * @param {WebGLRenderingContext} gl WebGL context
 * @param {gluDrawUtil.primitiveType} type gluDrawUtil.primitiveType
 * @return {WebGLRenderingContext.GLEnum} GL primitive type
 */
gluDrawUtil.getPrimitiveGLType = function(gl, type) {
    switch (type) {
        case gluDrawUtil.primitiveType.TRIANGLES: return gl.TRIANGLES;
        case gluDrawUtil.primitiveType.TRIANGLE_STRIP: return gl.TRIANGLE_STRIP;
        case gluDrawUtil.primitiveType.TRIANGLE_FAN: return gl.TRIANGLE_FAN;
        case gluDrawUtil.primitiveType.LINES: return gl.LINES;
        case gluDrawUtil.primitiveType.LINE_STRIP: return gl.LINE_STRIP;
        case gluDrawUtil.primitiveType.LINE_LOOP: return gl.LINE_LOOP;
        case gluDrawUtil.primitiveType.POINTS: return gl.POINTS;
        case gluDrawUtil.primitiveType.PATCHES: return gl.PATCHES;
        default:
            testFailedOptions('Unknown primitive type ' + type, true);
            return undefined;
    }
};

/**
 * Calls gluDrawUtil.PrimitiveList() to create primitive list for Triangles
 * @param {number} indices
 */
gluDrawUtil.triangles = function(indices) {
    return new gluDrawUtil.PrimitiveList(gluDrawUtil.primitiveType.TRIANGLES, indices);
};

/**
 * Calls gluDrawUtil.PrimitiveList() to create primitive list for Patches
 * @param {number} indices
 */
gluDrawUtil.patches = function(indices) {
    return new gluDrawUtil.PrimitiveList(gluDrawUtil.primitiveType.PATCHES, indices);
};

/**
 * Creates primitive list for Triangles or Patches, depending on type
 * @param {gluDrawUtil.primitiveType} type gluDrawUtil.primitiveType
 * @param {number} indices
 * @constructor
 */
gluDrawUtil.PrimitiveList = function(type, indices) {
    this.type = type;
    this.indices = indices;
};

/**
 * Create Element Array Buffer
 * @param {WebGLRenderingContext} gl WebGL context
 * @param {gluDrawUtil.PrimitiveList} primitives to construct the buffer from
 * @return {WebGLBuffer} indexObject buffer with elements
 */
gluDrawUtil.indexBuffer = function(gl, primitives) {
    /** @type {WebGLBuffer} */ var indexObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexObject);
    assertMsgOptions(gl.getError() === gl.NO_ERROR, 'bindBuffer', false, true);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(primitives.indices), gl.STATIC_DRAW);
    assertMsgOptions(gl.getError() === gl.NO_ERROR, 'bufferData', false, true);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return indexObject;
};

/**
 * Create Array Buffer
 * @param {WebGLRenderingContext} gl WebGL context
 * @param {gluDrawUtil.VertexArrayBinding} vertexArray primitives, Array buffer descriptor
 * @return {WebGLBuffer} buffer of vertices
 */
gluDrawUtil.vertexBuffer = function(gl, vertexArray) {
    /** @type {WebGLBuffer} */ var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    assertMsgOptions(gl.getError() === gl.NO_ERROR, 'bindBuffer', false, true);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray.data), gl.STATIC_DRAW);
    assertMsgOptions(gl.getError() === gl.NO_ERROR, 'bufferData', false, true);
    gl.enableVertexAttribArray(vertexArray.location);
    assertMsgOptions(gl.getError() === gl.NO_ERROR, 'enableVertexAttribArray', false, true);
    gl.vertexAttribPointer(vertexArray.location, vertexArray.components, vertexArray.type, false, 0, 0);
    assertMsgOptions(gl.getError() === gl.NO_ERROR, 'vertexAttribPointer', false, true);
    bufferedLogToConsole(vertexArray);
    return buffer;
};

/**
 * @param {Array.<number>} rgba
 * @constructor
 */
gluDrawUtil.Pixel = function(rgba) {
    this.rgba = rgba;
};

gluDrawUtil.Pixel.prototype.getRed = function() {
    return this.rgba[0];
};
gluDrawUtil.Pixel.prototype.getGreen = function() {
    return this.rgba[1];
};
gluDrawUtil.Pixel.prototype.getBlue = function() {
    return this.rgba[2];
};
gluDrawUtil.Pixel.prototype.getAlpha = function() {
    return this.rgba[3];
};
gluDrawUtil.Pixel.prototype.equals = function(otherPixel) {
    return this.rgba[0] == otherPixel.rgba[0] &&
           this.rgba[1] == otherPixel.rgba[1] &&
           this.rgba[2] == otherPixel.rgba[2] &&
           this.rgba[3] == otherPixel.rgba[3];
};

gluDrawUtil.Surface = function() {
};

gluDrawUtil.Surface.prototype.readSurface = function(gl, x, y, width, height) {
    this.buffer = new Uint8Array(width * height * 4);
    gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, this.buffer);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this.buffer;
};

gluDrawUtil.Surface.prototype.getPixel = function(x, y) {
    /** @type {number} */ var base = (x + y * this.width) * 4;
    /** @type {Array.<number>} */
    var rgba = [
        this.buffer[base],
        this.buffer[base + 1],
        this.buffer[base + 2],
        this.buffer[base + 3]
        ];
    return new gluDrawUtil.Pixel(rgba);
};

/**
 * @enum
 */
gluDrawUtil.VertexComponentType =
{
    // Standard types: all conversion types apply.
    VTX_COMP_UNSIGNED_INT8: 0,
    VTX_COMP_UNSIGNED_INT16: 1,
    VTX_COMP_UNSIGNED_INT32: 2,
    VTX_COMP_SIGNED_INT8: 3,
    VTX_COMP_SIGNED_INT16: 4,
    VTX_COMP_SIGNED_INT32: 5,

    // Special types: only CONVERT_NONE is allowed.
    VTX_COMP_FIXED: 6,
    VTX_COMP_HALF_FLOAT: 7,
    VTX_COMP_FLOAT: 8
};

/**
 * @enum
 */
gluDrawUtil.VertexComponentConversion = {
    VTX_COMP_CONVERT_NONE: 0, //!< No conversion: integer types, or floating-point values.
    VTX_COMP_CONVERT_NORMALIZE_TO_FLOAT: 1, //!< Normalize integers to range [0,1] or [-1,1] depending on type.
    VTX_COMP_CONVERT_CAST_TO_FLOAT: 2 //!< Convert to floating-point directly.
};

/**
 * gluDrawUtil.VertexArrayPointer
 * @constructor
 * @param {gluDrawUtil.VertexComponentType} componentType_
 * @param {gluDrawUtil.VertexComponentConversion} convert_
 * @param {number} numComponents_
 * @param {number} numElements_
 * @param {number} stride_
 * @const @param {Array.<number>} data_
 */
gluDrawUtil.VertexArrayPointer = function(componentType_, convert_, numComponents_, numElements_, stride_, data_) {
    this.componentType = componentType_;
    this.convert = convert_;
    this.numComponents = numComponents_;
    this.numElements = numElements_;
    this.stride = stride_;
    this.data = data_;
};

/**
 * gluDrawUtil.Type
 * @enum
 */
gluDrawUtil.Type = {
    TYPE_LOCATION: 0, //!< Binding by numeric location.
    TYPE_NAME: 1 //!< Binding by input name.
};

/**
 * gluDrawUtil.BindingPoint
 * @constructor
 * @param {gluDrawUtil.Type} type
 * @param {string} name
 * @param {number} location
 */
gluDrawUtil.BindingPoint = function(type, name, location) {
    /* @type {gluDrawUtil.Type} */ this.type = type;
    /* @type {string} */ this.name = name;
    /* @type {number} */ this.location = location;
};

/**
 * bindingPointFromLocation
 * @param {number} location
 */
function bindingPointFromLocation(location) {
    return new gluDrawUtil.BindingPoint(gluDrawUtil.Type.TYPE_LOCATION, '', location);
}

/**
 * bindingPointFromName
 * @param {string} name
 * @param {number} location
 */
function bindingPointFromName(name, location) {
    var loc = location === undefined ? 0 : location;
    return new gluDrawUtil.BindingPoint(gluDrawUtil.Type.TYPE_LOCATION, name, loc);
}




});
