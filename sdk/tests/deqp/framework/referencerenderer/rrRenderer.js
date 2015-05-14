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
goog.provide('framework.referencerenderer.rrRenderer');
goog.require('framework.common.tcuTexture');
goog.require('framework.common.tcuTextureUtil');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.opengl.simplereference.sglrShaderProgram');
goog.require('framework.referencerenderer.rrDefs');
goog.require('framework.referencerenderer.rrFragmentOperations');
goog.require('framework.referencerenderer.rrGenericVector');
goog.require('framework.referencerenderer.rrMultisamplePixelBufferAccess');
goog.require('framework.referencerenderer.rrRenderState');
goog.require('framework.referencerenderer.rrShadingContext');
goog.require('framework.referencerenderer.rrVertexAttrib');
goog.require('framework.referencerenderer.rrVertexPacket');

goog.scope(function() {

var rrRenderer = framework.referencerenderer.rrRenderer;
var rrVertexPacket = framework.referencerenderer.rrVertexPacket;
var rrDefs = framework.referencerenderer.rrDefs;
var rrFragmentOperations = framework.referencerenderer.rrFragmentOperations;
var deMath = framework.delibs.debase.deMath;
var tcuTextureUtil = framework.common.tcuTextureUtil;
var tcuTexture = framework.common.tcuTexture;
var rrRenderState = framework.referencerenderer.rrRenderState;
var rrMultisamplePixelBufferAccess = framework.referencerenderer.rrMultisamplePixelBufferAccess;
var rrShadingContext = framework.referencerenderer.rrShadingContext;
var rrGenericVector = framework.referencerenderer.rrGenericVector;
var sglrShaderProgram = framework.opengl.simplereference.sglrShaderProgram;
var rrVertexAttrib = framework.referencerenderer.rrVertexAttrib;

/**
 * @enum
 */
rrRenderer.PrimitiveType = {
    TRIANGLES: 0, //!< Separate rrRenderer.triangles
    TRIANGLE_STRIP: 1, //!< rrRenderer.Triangle strip
    TRIANGLE_FAN: 2, //!< rrRenderer.Triangle fan

    LINES: 3, //!< Separate lines
    LINE_STRIP: 4, //!< Line strip
    LINE_LOOP: 5, //!< Line loop

    POINTS: 6 //!< Points
};

// /**
//  * @constructor
//  * @param {boolean} depthEnabled Is depth buffer enabled
//  */
// rrRenderer.RasterizationInternalBuffers = function(depthEnabled) {
//     /*std::vector<rrFragmentOperations.Fragment>*/ this.fragmentPackets = [];
//     /*std::vector<GenericVec4>*/ this.shaderOutputs = [];
//     /*std::vector<Fragment>*/ this.shadedFragments = [];
//     /*float**/ this.fragmentDepthBuffer = depthEnabled ? [] : null;
// };

/**
 * @constructor
 * @param {number=} id
 */
rrRenderer.DrawContext = function(id) {
    this.primitiveID = id || 0;

};

/**
 * Transform [x, y] to window (pixel) coordinates.
 * z and w are unchanged
 * @param {rrRenderState.RenderState} state
 * @param {rrVertexPacket.VertexPacket} packet
 * Wreturn {Array<number>}
 */
rrRenderer.transformGLToWindowCoords = function(state, packet) {
    var transformed = [packet.position[0] / packet.position[3],
                                packet.position[1] / packet.position[3],
                                packet.position[2],
                                packet.position[3]];
    var viewport = state.viewport.rect;
    var halfW = viewport.width / 2;
    var halfH = viewport.height / 2;
    var oX = viewport.left + halfW;
    var oY = viewport.bottom + halfH;

    return [
        transformed[0] * halfW + oX,
        transformed[1] * halfH + oY,
        transformed[2],
        transformed[3]
    ];
};

/**
 * @constructor
 * @param {rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess} colorMultisampleBuffer
 * @param {rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess=} depthMultisampleBuffer
 * @param {rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess=} stencilMultisampleBuffer
 */
rrRenderer.RenderTarget = function(colorMultisampleBuffer, depthMultisampleBuffer, stencilMultisampleBuffer) {
    this.MAX_COLOR_BUFFERS = 4;
    this.colorBuffers = [];
    this.colorBuffers[0] = colorMultisampleBuffer;
    this.depthBuffer = depthMultisampleBuffer || new rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess();
    this.stencilBuffer = stencilMultisampleBuffer || new rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess();
    this.numColorBuffers = 1;
};

// NOTE: Program object is useless. Let's just use the sglrShaderProgram
// /**
//  * @constructor
//  * @param {rrShaders.VertexShader} vertexShader_
//  * @param {rrShaders.FragmentShader} fragmentShader_
//  */
// var Program = function(vertexShader_, fragmentShader_) {
//     this.vertexShader = vertexShader_;
//     this.fragmentShader = fragmentShader_;
// };

/**
 * @constructor
 * @param {ArrayBuffer} data
 * @param {rrDefs.IndexType} type
 * @param {number=} baseVertex_
 */
rrRenderer.DrawIndices = function(data, type, baseVertex_) {
    this.data = data;
    this.baseVertex = baseVertex_ || 0;
    this.indexType = type;
    switch (type) {
        case rrDefs.IndexType.INDEXTYPE_UINT8: this.access = new Uint8Array(data); break;
        case rrDefs.IndexType.INDEXTYPE_UINT16: this.access = new Uint16Array(data); break;
        case rrDefs.IndexType.INDEXTYPE_UINT32: this.access = new Uint32Array(data); break;
        default: throw new Error('Invalid type: ' + type);
    }
};

rrRenderer.DrawIndices.prototype.readIndexArray = function(index) { return this.access[index]; };

/**
 * @constructor
 * @param {rrRenderer.PrimitiveType} primitiveType
 * @param {number} numElements
 * @param { (number|rrRenderer.DrawIndices) } indices
 */
rrRenderer.PrimitiveList = function(primitiveType, numElements, indices) {
    this.m_primitiveType = primitiveType;
    this.m_numElements = numElements;

    if (typeof indices == 'number') {
        // !< primitive list for drawArrays-like call
        this.m_indices = null;
        this.m_indexType = undefined;
        this.m_baseVertex = indices;
    } else {
        // !< primitive list for drawElements-like call
        this.m_indices = indices;
        this.m_indexType = indices.indexType;
        this.m_baseVertex = indices.baseVertex;
    }
};

rrRenderer.PrimitiveList.prototype.getIndex = function(elementNdx) {
    if (this.m_indices) {
        var index = this.m_baseVertex + this.m_indices.readIndexArray(elementNdx);
        if (index < 0)
            throw new Error('Index must not be negative');

        return index;
    } else
        return this.m_baseVertex + elementNdx;
};

rrRenderer.PrimitiveList.prototype.isRestartIndex = function(elementNdx, restartIndex) {
    // implicit index or explicit index (without base vertex) equals restart
    if (this.m_indices)
        return this.m_indices.readIndexArray(elementNdx) == restartIndex;
    else
        return elementNdx == restartIndex;
};

rrRenderer.PrimitiveList.prototype.getNumElements = function() {return this.m_numElements;};
rrRenderer.PrimitiveList.prototype.getPrimitiveType = function() {return this.m_primitiveType;};
rrRenderer.PrimitiveList.prototype.getIndexType = function() {return this.m_indexType;};

rrRenderer.getBarycentricCoefficients = function(v, v1, v2, v3) {
    var b = [];

    var x = v[0];
    var y = v[1];
    var x1 = v1[0];
    var x2 = v2[0];
    var x3 = v3[0];
    var y1 = v1[1];
    var y2 = v2[1];
    var y3 = v3[1];

    var det = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);

    b[0] = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / det;
    b[1] = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / det;
    b[2] = 1 - b[0] - b[1];

    return b;
};

/**
 * @param {rrRenderState.RenderState} state
 * @param {rrRenderer.RenderTarget} renderTarget
 * @param {Array<rrFragmentOperations.Fragment>} fragments Fragments to write
*/
rrRenderer.writeFragments = function(state, renderTarget, fragments) {
    /* TODO: Add blending, depth, stencil ... */
    var colorbuffer = renderTarget.colorBuffers[0].raw();
    for (var i = 0; i < fragments.length; i++) {
        var fragment = fragments[i];
        colorbuffer.setPixel(fragment.value, 0, fragment.pixelCoord[0], fragment.pixelCoord[1]);
    }

};

/**
 * @param {rrRenderState.RenderState} renderState
 * @param {rrRenderer.RenderTarget} renderTarget
 * @param {Array<rrFragmentOperations.Fragment>} fragments Fragments to write
*/
rrRenderer.writeFragments2 = function(renderState, renderTarget, fragments) {
    /*
void FragmentProcessor::render (const rr::MultisamplePixelBufferAccess& msColorBuffer,
                                const rr::MultisamplePixelBufferAccess& msDepthBuffer,
                                const rr::MultisamplePixelBufferAccess& msStencilBuffer,
                                const Fragment*                             fragments,
                                int numFragments,
                                FaceType fragmentFacing,
                                const FragmentOperationState& state)
*/

    /** @const */ var fragmentFacing = rrDefs.FaceType.FACETYPE_FRONT;
    var colorBuffer = renderTarget.colorBuffers[0].raw();
    var depthBuffer = renderTarget.depthBuffer.raw();
    var stencilBuffer = renderTarget.stencilBuffer.raw();
    var state = renderState.fragOps;

    var hasDepth = depthBuffer.getWidth() > 0 && depthBuffer.getHeight() > 0 && depthBuffer.getDepth() > 0;
    var hasStencil = stencilBuffer.getWidth() > 0 && stencilBuffer.getHeight() > 0 && stencilBuffer.getDepth() > 0;
    var doDepthTest = hasDepth && state.depthTestEnabled;
    var doStencilTest = hasStencil && state.stencilTestEnabled;

    var colorbufferClass = tcuTextureUtil.getTextureChannelClass(colorBuffer.getFormat().type);
    var fragmentDataType = rrGenericVector.GenericVecType.FLOAT;
    switch (colorbufferClass) {
        case tcuTextureUtil.TextureChannelClass.SIGNED_INTEGER:
            fragmentDataType = rrGenericVector.GenericVecType.INT32;
            break;
        case tcuTextureUtil.TextureChannelClass.UNSIGNED_INTEGER:
            fragmentDataType = rrGenericVector.GenericVecType.UINT32;
            break;
    }

    if (!((!hasDepth || colorBuffer.getWidth() == depthBuffer.getWidth()) && (!hasStencil || colorBuffer.getWidth() == stencilBuffer.getWidth())))
        throw new Error('Attachment must have the same width');
    if (!((!hasDepth || colorBuffer.getHeight() == depthBuffer.getHeight()) && (!hasStencil || colorBuffer.getHeight() == stencilBuffer.getHeight())))
        throw new Error('Attachment must have the same height');
    if (!((!hasDepth || colorBuffer.getDepth() == depthBuffer.getDepth()) && (!hasStencil || colorBuffer.getDepth() == stencilBuffer.getDepth())))
        throw new Error('Attachment must have the same depth');

    var stencilState = state.stencilStates[fragmentFacing];
    var colorMaskFactor = [state.colorMask[0] ? 1 : 0, state.colorMask[1] ? 1 : 0, state.colorMask[2] ? 1 : 0, state.colorMask[3] ? 1 : 0];
    var colorMaskNegationFactor = [state.colorMask[0] ? false : true, state.colorMask[1] ? false : true, state.colorMask[2] ? false : true, state.colorMask[3] ? false : true];
    var sRGBTarget = false;

    // Scissor test.

    if (state.scissorTestEnabled)
        rrFragmentOperations.executeScissorTest(fragments, state.scissorRectangle);

    // Stencil test.

    if (doStencilTest) {
        rrFragmentOperations.executeStencilCompare(fragments, stencilState, state.numStencilBits, stencilBuffer);
        rrFragmentOperations.executeStencilSFail(fragments, stencilState, state.numStencilBits, stencilBuffer);
    }

    // Depth test.
    // \note Current value of isAlive is needed for dpPass and dpFail, so it's only updated after them and not right after depth test.

    if (doDepthTest) {
        rrFragmentOperations.executeDepthCompare(fragments, state.depthFunc, depthBuffer);

        if (state.depthMask)
            rrFragmentOperations.executeDepthWrite(fragments, depthBuffer);
    }

    // Do dpFail and dpPass stencil writes.

    if (doStencilTest)
        rrFragmentOperations.executeStencilDpFailAndPass(fragments, stencilState, state.numStencilBits, stencilBuffer);

    // Kill the samples that failed depth test.

    if (doDepthTest) {
        for (var i = 0; i < fragments.length; i++)
            fragments[i].isAlive = fragments[i].isAlive && fragments[i].depthPassed;
    }

    // Paint fragments to target

    switch (fragmentDataType) {
        case rrGenericVector.GenericVecType.FLOAT:
            // Blend calculation - only if using blend.
            if (state.blendMode == rrRenderState.BlendMode.STANDARD) {
                // Put dst color to register, doing srgb-to-linear conversion if needed.
                for (var i = 0; i < fragments.length; i++) {
                    var frag = fragments[i];
                    if (frag.isAlive) {
                        var fragSampleNdx = 1;
                        var dstColor = colorBuffer.getPixel(fragSampleNdx, frag.pixelCoord[0], frag.pixelCoord[1]);

                        /* TODO: Check frag.value and frag.value1 types */
                        frag.clampedBlendSrcColor = deMath.clampVector(frag.value, 0, 1);
                        frag.clampedBlendSrc1Color = deMath.clampVector(frag.value1, 0, 1);
                        frag.clampedBlendDstColor = deMath.clampVector(sRGBTarget ? tcuTexture.sRGBToLinear(dstColor) : dstColor, 0, 1);
                    }
                }

                // Calculate blend factors to register.
                rrFragmentOperations.executeBlendFactorComputeRGB(fragments, state.blendColor, state.blendRGBState);
                rrFragmentOperations.executeBlendFactorComputeA(fragments, state.blendColor, state.blendAState);

                // Compute blended color.
                rrFragmentOperations.executeBlend(fragments, state.blendRGBState, state.blendAState);
            } else {
                // Not using blend - just put values to register as-is.

                for (var i = 0; i < fragments.length; i++) {
                    var frag = fragments[i];
                    if (frag.isAlive) {
                        frag.blendedRGB = deMath.swizzle(frag.value, [0, 1, 2]);
                        frag.blendedA = deMath.clamp(frag.value[3], 0, 1);
                    }
                }
            }

            // Finally, write the colors to the color buffer.

            if (state.colorMask[0] && state.colorMask[1] && state.colorMask[2] && state.colorMask[3]) {
                /* TODO: Add quick path */
                // if (colorBuffer.getFormat().isEqual(new tcuTexture.TextureFormat(tcuTexture.ChannelOrder.RGBA, tcuTexture.ChannelType.UNORM_INT8)))
                //     executeRGBA8ColorWrite(fragments, colorBuffer);
                // else
                    rrFragmentOperations.executeColorWrite(fragments, sRGBTarget, colorBuffer);
            } else if (state.colorMask[0] || state.colorMask[1] || state.colorMask[2] || state.colorMask[3])
                rrFragmentOperations.executeMaskedColorWrite(fragments, colorMaskFactor, colorMaskNegationFactor, sRGBTarget, colorBuffer);
            break;

        case rrGenericVector.GenericVecType.INT32:
            // Write fragments
            for (var i = 0; i < fragments.length; i++) {
                var frag = fragments[i];
                if (frag.isAlive) {
                    frag.signedValue = frag.value;
                }
            }

            if (state.colorMask[0] || state.colorMask[1] || state.colorMask[2] || state.colorMask[3])
                rrFragmentOperations.executeSignedValueWrite(fragments, state.colorMask, colorBuffer);
            break;

        case rrGenericVector.GenericVecType.UINT32:
            // Write fragments
           for (var i = 0; i < fragments.length; i++) {
                var frag = fragments[i];
                if (frag.isAlive) {
                    frag.unsignedValue = frag.value;
                }
            }

            if (state.colorMask[0] || state.colorMask[1] || state.colorMask[2] || state.colorMask[3])
                rrFragmentOperations.executeUnsignedValueWrite(fragments, state.colorMask, colorBuffer);
            break;

        default:
            throw new Error('Unrecognized fragment data type:' + fragmentDataType);
    }
};

/**
 * Determines the index of the corresponding vertex according to top/right conditions.
 * @param {boolean} isTop
 * @param {boolean} isRight
 * @return {number}
 */
rrRenderer.getIndexOfCorner = function(isTop, isRight, vertexPackets) {
    var x = null;
    var y = null;

    var xcriteria = isRight ? Math.max : Math.min;
    var ycriteria = isTop ? Math.max : Math.min;

    // Determine corner values
    for (var i = 0; i < 6; i++) {
        x = x != null ? xcriteria(vertexPackets[i].position[0], x) : vertexPackets[i].position[0];
        y = y != null ? ycriteria(vertexPackets[i].position[1], y) : vertexPackets[i].position[1];
    }

    // Search for mathing vertex
    for (var v = 0; v < 6; v++)
        if (vertexPackets[v].position[0] == x && vertexPackets[v].position[1] == y)
            return v;

    throw new Error('Corner not found');
};

rrRenderer.calculateDepth = function(x, y, depths) {
    var d1 = x * depths[0] + (1 - x) * depths[1];
    var d2 = x * depths[2] + (1 - x) * depths[3];
    var d = y * d1 + (1 - y) * d2;
    return d;
};

/**
 * @param {rrRenderState.RenderState} state
 * @param {rrRenderer.RenderTarget} renderTarget
 * @param {sglrShaderProgram.ShaderProgram} program
 * @param {Array<rrVertexAttrib.VertexAttrib>} vertexAttribs
 * @param {number} first Index of first quad vertex
 * @param {number} count Number of quads to draw
 */
rrRenderer.drawQuads = function(state, renderTarget, program, vertexAttribs, first, count) {
    //The count of primitives to draw depends on which vertex we start to draw first.
    count = Math.floor(((count * 6) - first) / 6);
    
    var primitives = new rrRenderer.PrimitiveList(rrRenderer.PrimitiveType.TRIANGLES, count * 6, first); // 2 triangles per quad with 3 vertices each = 6 vertices.
    // Do not draw if nothing to draw
    if (primitives.getNumElements() == 0)
        return;

    // Prepare transformation
    var numVaryings = program.vertexShader.getOutputs().length;
    var vpalloc = new rrVertexPacket.VertexPacketAllocator(numVaryings);
    var vertexPackets = vpalloc.allocArray(primitives.getNumElements());
    var drawContext = new rrRenderer.DrawContext();
    drawContext.primitiveID = 0;
    var instanceID = 0;

    var numberOfVertices = primitives.getNumElements();
    var numVertexPackets = 0;
    for (var elementNdx = 0; elementNdx < numberOfVertices; ++elementNdx) {

        // input
        vertexPackets[numVertexPackets].instanceNdx = instanceID;
        vertexPackets[numVertexPackets].vertexNdx = primitives.getIndex(elementNdx);

        // output
        vertexPackets[numVertexPackets].pointSize = state.point.pointSize; // default value from the current state
        vertexPackets[numVertexPackets].position = [0, 0, 0, 0]; // no undefined values

        ++numVertexPackets;

    }
    program.shadeVertices(vertexAttribs, vertexPackets, numVertexPackets);

    // For each quad, we get a group of six vertex packets
    for (var quad = 0; quad < count; quad++) {
        var quadoffset = quad * 6;
        var quadPackets = [vertexPackets[quadoffset], vertexPackets[quadoffset + 1], vertexPackets[quadoffset + 2],
            vertexPackets[quadoffset + 3], vertexPackets[quadoffset + 4], vertexPackets[quadoffset + 5]];

        var bottomLeftVertexNdx = rrRenderer.getIndexOfCorner(false, false, quadPackets);
        var bottomRightVertexNdx = rrRenderer.getIndexOfCorner(false, true, quadPackets);
        var topLeftVertexNdx = rrRenderer.getIndexOfCorner(true, false, quadPackets);
        var topRightVertexNdx = rrRenderer.getIndexOfCorner(true, true, quadPackets);

        var topLeft = rrRenderer.transformGLToWindowCoords(state, quadPackets[topLeftVertexNdx]);
        var bottomRight = rrRenderer.transformGLToWindowCoords(state, quadPackets[bottomRightVertexNdx]);

        topLeft[0] = Math.round(topLeft[0]);
        topLeft[1] = Math.round(topLeft[1]);
        bottomRight[0] = Math.round(bottomRight[0]);
        bottomRight[1] = Math.round(bottomRight[1]);

        var v0 = [topLeft[0], topLeft[1], quadPackets[topLeftVertexNdx].position[2]];
        var v1 = [topLeft[0], bottomRight[1], quadPackets[topRightVertexNdx].position[2]];
        var v2 = [bottomRight[0], topLeft[1], quadPackets[bottomLeftVertexNdx].position[2]];
        var v3 = [bottomRight[0], bottomRight[1], quadPackets[bottomRightVertexNdx].position[2]];
        var width = bottomRight[0] - topLeft[0];
        var height = topLeft[1] - bottomRight[1];

        // Generate two rrRenderer.triangles [v0, v1, v2] and [v2, v1, v3]
        var shadingContextTopLeft = new rrShadingContext.FragmentShadingContext(
            quadPackets[topLeftVertexNdx].outputs,
            quadPackets[bottomLeftVertexNdx].outputs,
            quadPackets[topRightVertexNdx].outputs
        );
        var packetsTopLeft = [];

        var shadingContextBottomRight = new rrShadingContext.FragmentShadingContext(
            quadPackets[topRightVertexNdx].outputs,
            quadPackets[bottomLeftVertexNdx].outputs,
            quadPackets[bottomRightVertexNdx].outputs
        );
        var packetsBottomRight = [];

        for (var i = 0; i < width; i++)
            for (var j = 0; j < height; j++) {
                var x = v0[0] + i + 0.5;
                var y = v1[1] + j + 0.5;

                var xf = (i + 0.5) / width;
                var yf = (j + 0.5) / height;
                var depth = rrRenderer.calculateDepth(xf, yf, [v0[2], v1[2], v2[2], v3[2]]);
                var triNdx = xf + yf >= 1;
                if (!triNdx) {
                    var b = rrRenderer.getBarycentricCoefficients([x, y], v0, v1, v2);
                    packetsTopLeft.push(new rrFragmentOperations.Fragment(b, [v0[0] + i, v1[1] + j], depth));
                } else {
                    var b = rrRenderer.getBarycentricCoefficients([x, y], v2, v1, v3);
                    packetsBottomRight.push(new rrFragmentOperations.Fragment(b, [v0[0] + i, v1[1] + j], depth));
                }
            }

        program.shadeFragments(packetsTopLeft, shadingContextTopLeft);
        program.shadeFragments(packetsBottomRight, shadingContextBottomRight);

        rrRenderer.writeFragments2(state, renderTarget, packetsTopLeft);
        rrRenderer.writeFragments2(state, renderTarget, packetsBottomRight);
    }
};

});
