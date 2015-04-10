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

define(['framework/referencerenderer/rrVertexPacket', 'framework/referencerenderer/rrDefs', 'framework/referencerenderer/rrFragmentOperations', 'framework/delibs/debase/deMath','framework/common/tcuTextureUtil', 'framework/common/tcuTexture', 'framework/referencerenderer/rrRasterizer', 'framework/referencerenderer/rrRenderState','framework/referencerenderer/rrMultisamplePixelBufferAccess', 'framework/referencerenderer/rrShadingContext' ],
 function(rrVertexPacket, rrDefs, rrFragmentOperations, deMath, tcuTextureUtil, tcuTexture, rrRasterizer, rrRenderState, rrMultisamplePixelBufferAccess, rrShadingContext) {

/**
 * @enum
 */
var PrimitiveType = {
    PRIMITIVETYPE_TRIANGLES: 0,            //!< Separate triangles
    PRIMITIVETYPE_TRIANGLE_STRIP: 1,           //!< Triangle strip
    PRIMITIVETYPE_TRIANGLE_FAN: 2,             //!< Triangle fan

    PRIMITIVETYPE_LINES: 3,                    //!< Separate lines
    PRIMITIVETYPE_LINE_STRIP: 4,               //!< Line strip
    PRIMITIVETYPE_LINE_LOOP: 5,                //!< Line loop

    PRIMITIVETYPE_POINTS: 6                   //!< Points
};

/**
 * @constructor
 * @param {boolean} depthEnabled Is depth buffer enabled
 */
var RasterizationInternalBuffers = function(depthEnabled){
    /*std::vector<FragmentPacket>*/     this.fragmentPackets = [];
    /*std::vector<GenericVec4>*/        this.shaderOutputs = [];
    /*std::vector<Fragment>*/           this.shadedFragments = [];
    /*float**/                          this.fragmentDepthBuffer = depthEnabled ? [] : null;
};

/**
 * @constructor
 * @param {number=} id
 */
var DrawContext = function(id){
    this.primitiveID = id || 0;

};

var makeSharedVertexDistinct = function(packet, vertices, vpalloc) {
    if (!vertices[packet])
        vertices[packet] = true;
    else {
        var newPacket = vpalloc.alloc();
        // copy packet output values
        newPacket.position     = packet.position;
        newPacket.pointSize    = packet.pointSize;
        newPacket.primitiveID  = packet.primitiveID;

        for (var outputNdx = 0; outputNdx < vpalloc.getNumVertexOutputs(); ++outputNdx)
            newPacket.outputs[outputNdx] = packet.outputs[outputNdx];

        // no need to insert new packet to "vertices" as newPacket is unique
        packet = newPacket;       
    }
    return packet;
};

var findTriangleVertexDepthSlope = function(p, v0, v1) {
    // screen space
    var ssp     = deMath.swizzle(p, [0, 1, 2]);
    var ssv0    = deMath.swizzle(v0, [0, 1, 2]);
    var ssv1    = deMath.swizzle(v1, [0, 1, 2]);

    // dx & dy

    var a       = deMath.subtract(deMath.swizzle(ssv0, [0,1,2]), deMath.swizzle(ssp, [0,1,2]));
    var b       = deMath.subtract(deMath.swizzle(ssv1, [0,1,2]), deMath.swizzle(ssp, [0,1,2]));
    var     epsilon = 0.0001;
    var     det     = (a[0] * b[1] - b[0] * a[1]);

    // degenerate triangle, it won't generate any fragments anyway. Return value doesn't matter
    if (Math.abs(det) < epsilon)
        return 0;

    var dxDir   = [ b[1]/det, -a[1]/det];
    var dyDir   = [-b[0]/det,  a[0]/det];

    var dzdx    = dxDir[0] * a[2] + dxDir[1] * b[2];
    var dzdy    = dyDir[0] * a[2] + dyDir[1] * b[2];

    // approximate using max(|dz/dx|, |dz/dy|)
    return Math.max(Math.abs(dzdx), Math.abs(dzdy));
};

var transformVertexClipCoordsToWindowCoords = function(/*const RenderState&*/ state, /*VertexPacket&*/ packet) {
    packet.position = [packet.position[0]/packet.position[3],
                                packet.position[1]/packet.position[3],
                                packet.position[2]/packet.position[3],
                                1               /packet.position[3]];
    var  viewport    = state.viewport.rect;
    var halfW       = viewport.width / 2;
    var halfH       = viewport.height / 2;
    var oX          = viewport.left + halfW;
    var oY          = viewport.bottom + halfH;
    var zn          = state.viewport.zn;
    var zf          = state.viewport.zf;

    packet.position = [packet.position[0]*halfW + oX,
                                packet.position[1]*halfH + oY,
                                packet.position[2]*(zf - zn)/2 + (zn + zf)/2,
                                packet.position[3]];
};

var getFloatingPointMinimumResolvableDifference = function(maxZValue,/*tcu::TextureFormat::ChannelType*/ type) {
    if (type == tcuTexture.ChannelType.FLOAT) {
        // 32f
        /* TODO: Port
        const int maxExponent = tcu::Float32(maxZValue).exponent();
        return tcu::Float32::construct(+1, maxExponent - 23, 1 << 23).asFloat();
        */
    }

    // unexpected format
    throw new Error('Unexpected format');
};

var getFixedPointMinimumResolvableDifference = function(numBits) {
    /* TODO: Port
    return tcu::Float32::construct(+1, -numBits, 1 << 23).asFloat();
    */
    throw new Error('Unimplemented');
};

var writeFragmentPackets = function(/*const RenderState&*/                   state,
                           /*const RenderTarget&*/                  renderTarget,
                           /*const Program&*/                      program,
                           /*const FragmentPacket**/                fragmentPackets,
                           /*int*/                                  numRasterizedPackets,
                           /*rr::FaceType*/                         facetype,
                           /*const std::vector<rr::GenericVec4>&*/  fragmentOutputArray,
                           /*const float**/                         depthValues,
                           /*std::vector<Fragment>&*/               fragmentBuffer) {
    var   numSamples      = renderTarget.colorBuffers[0].getNumSamples();
    var   numOutputs      = program.fragmentShader.getOutputs().length;
    var   fragProcessor = new rrFragmentOperations.FragmentProcessor();
    var fragCount = 0;

    // Translate fragments but do not set the value yet
    for (var packetNdx = 0; packetNdx < numRasterizedPackets; ++packetNdx)
    for (var fragNdx = 0; fragNdx < 4; fragNdx++)
    {
        var   packet  = fragmentPackets[packetNdx];
        var               xo      = Math.floor(fragNdx%2);
        var               yo      = Math.floor(fragNdx/2);

        /* TODO: Port - needs 64 bit binary operations
        if (getCoverageAnyFragmentSampleLive(packet.coverage, numSamples, xo, yo))
        {
            var fragment      = fragmentBuffer[fragCount++];

            fragment.pixelCoord     = deMath.add(packet.position, [xo, yo]);
            fragment.coverage       = (deUint32)((packet.coverage & getCoverageFragmentSampleBits(numSamples, xo, yo)) >> getCoverageOffset(numSamples, xo, yo));
            fragment.sampleDepths   = (depthValues) ? (&depthValues[(packetNdx*4 + yo*2 + xo)*numSamples]) : (DE_NULL);
        }
        */
    }

    // Set per output output values
    var  noStencilDepthWriteState = new rrRenderState.FragmentOperationState(state.fragOps);
    noStencilDepthWriteState.depthMask                      = false;
    noStencilDepthWriteState.stencilStates[facetype].sFail  = rrRenderState.StencilOp.STENCILOP_KEEP;
    noStencilDepthWriteState.stencilStates[facetype].dpFail = rrRenderState.StencilOp.STENCILOP_KEEP;
    noStencilDepthWriteState.stencilStates[facetype].dpPass = rrRenderState.StencilOp.STENCILOP_KEEP;

    fragCount = 0;
    for (var outputNdx = 0; outputNdx < numOutputs; ++outputNdx) {
        // Only the last output-pass has default state, other passes have stencil & depth writemask=0
        var fragOpsState = (outputNdx == numOutputs-1) ? (state.fragOps) : (noStencilDepthWriteState);

        for (var packetNdx = 0; packetNdx < numRasterizedPackets; ++packetNdx)
        for (var fragNdx = 0; fragNdx < 4; fragNdx++)
        {
            var   packet  = fragmentPackets[packetNdx];
            var               xo      = Math.floor(fragNdx%2);
            var               yo      = Math.floor(fragNdx/2);

            /* TODO: Port
            // Add only fragments that have live samples to shaded fragments queue.
            if (getCoverageAnyFragmentSampleLive(packet.coverage, numSamples, xo, yo))
            {
                var fragment      = fragmentBuffer[fragCount++];
                fragment.value          = fragmentOutputArray[(packetNdx*4 + fragNdx) * numOutputs + outputNdx];
            }
            */
        }

        // Execute per-fragment ops and write
        fragProcessor.render(renderTarget.colorBuffers[outputNdx], renderTarget.depthBuffer, renderTarget.stencilBuffer, fragmentBuffer, fragCount, facetype, fragOpsState);
    }
};

/**
 * @constructor
 */
var Triangle = function(v0_, v1_, v2_, provokingIndex_) {
    this.NUM_VERTICES = 3;
    this.v0 = v0_ || null;
    this.v1 = v1_ || null;
    this.v2 = v2_ || null;
    this.provokingIndex = provokingIndex_;

};

Triangle.prototype.getProvokingVertex = function() {
    switch (this.provokingIndex) {
        case 0: return this.v0;
        case 1: return this.v1;
        case 2: return this.v2;
        default:
            throw new Error('Wrong provoking index:' + this.provokingIndex);
    }
};

Triangle.prototype.makeSharedVerticesDistinct = function(vertices, vpalloc) {
    this.v0 = makeSharedVertexDistinct(this.v0, vertices, vpalloc);
    this.v1 = makeSharedVertexDistinct(this.v1, vertices, vpalloc);
    this.v2 = makeSharedVertexDistinct(this.v2, vertices, vpalloc);
};

Triangle.prototype.generatePrimitiveIDs = function(id) {
    this.v0.primitiveID = id;
    this.v1.primitiveID = id;
    this.v2.primitiveID = id;
};

Triangle.prototype.flatshadePrimitiveVertices = function(outputNdx) {
    var flatValue = this.getProvokingVertex().outputs[outputNdx];
    this.v0.outputs[outputNdx] = flatValue;
    this.v1.outputs[outputNdx] = flatValue;
    this.v2.outputs[outputNdx] = flatValue;
};

Triangle.prototype.transformPrimitiveClipCoordsToWindowCoords = function(state) {
    transformVertexClipCoordsToWindowCoords(state, this.v0);
    transformVertexClipCoordsToWindowCoords(state, this.v1);
    transformVertexClipCoordsToWindowCoords(state, this.v2);
};

Triangle.prototype.findPrimitiveMaximumDepthSlope = function() {
    var d1 = findTriangleVertexDepthSlope(this.v0.position, this.v1.position, this.v2.position);
    var d2 = findTriangleVertexDepthSlope(this.v1.position, this.v2.position, this.v0.position);
    var d3 = findTriangleVertexDepthSlope(this.v2.position, this.v0.position, this.v1.position);

    return Math.max(d1, d2, d3);
};

Triangle.prototype.findPrimitiveMinimumResolvableDifference = function(/*const rr::MultisampleConstPixelBufferAccess&*/ depthAccess) {
    var maxZvalue       = Math.max(this.v0.position[2], this.v1.position[2], this.v2.position[2]);
    var                format          = depthAccess.raw().getFormat();
    var  order           = format.order;

    if (order == tcuTexture.ChannelOrder.D)
    {
        // depth only
        var   channelType     = format.type;
        var channelClass    = tcuTextureUtil.getTextureChannelClass(channelType);
        var numBits         = tcuTextureUtil.getTextureFormatBitDepth(format)[0];

        if (channelClass == tcuTextureUtil.TextureChannelClass.FLOATING_POINT)
            return getFloatingPointMinimumResolvableDifference(maxZvalue, channelType);
        else
            // \note channelClass might be CLASS_LAST but that's ok
            return getFixedPointMinimumResolvableDifference(numBits);
    }
    else if (order == tcuTexture.ChannelOrder.DS)
    {
        // depth stencil, special cases for possible combined formats
        if (format.type == tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV)
            return getFloatingPointMinimumResolvableDifference(maxZvalue, tcuTexture.ChannelType.FLOAT);
        else if (format.type == tcuTexture.ChannelType.UNSIGNED_INT_24_8)
            return getFixedPointMinimumResolvableDifference(24);
    }

    // unexpected format
    throw new Error('Unexpected format');
};

Triangle.prototype.rasterizePrimitive = function(/*const RenderState&*/                  state,
                         /*const RenderTarget&*/                renderTarget,
                         /*const Program&*/                     program,
                         /*const tcu::IVec4&*/                  renderTargetRect,
                         /*RasterizationInternalBuffers&*/      buffers) {
    var           numSamples      = renderTarget.colorBuffers[0].getNumSamples();
    var         depthClampMin   = deMath.min(state.viewport.zn, state.viewport.zf);
    var         depthClampMax   = deMath.max(state.viewport.zn, state.viewport.zf);
    var  rasterizer      = new rrRasterizer.TriangleRasterizer(renderTargetRect, numSamples, state.rasterization);
    var               depthOffset     = 0;

    rasterizer.init(this.v0.position, this.v1.position, this.v2.position);

    // Culling
    var visibleFace = rasterizer.getVisibleFace();
    if ((state.cullMode == rrRenderState.CullMode.CULLMODE_FRONT   && visibleFace == rrDefs.FaceType.FACETYPE_FRONT) ||
        (state.cullMode == rrRenderState.CullMode.CULLMODE_BACK    && visibleFace == rrDefs.FaceType.FACETYPE_BACK))
        return;

    // Shading context
    var shadingContext = new rrShadingContext.FragmentShadingContext(this.v0.outputs, this.v1.outputs, this.v2.outputs, buffers.shaderOutputs, buffers.fragmentDepthBuffer, this.v2.primitiveID, program.fragmentShader.getOutputs().length, numSamples);

    // Polygon offset
    if (buffers.fragmentDepthBuffer && state.fragOps.polygonOffsetEnabled)
    {
        var maximumDepthSlope           = this.findPrimitiveMaximumDepthSlope();
        var minimumResolvableDifference = this.findPrimitiveMinimumResolvableDifference(renderTarget.depthBuffer);

        depthOffset = maximumDepthSlope * state.fragOps.polygonOffsetFactor + minimumResolvableDifference * state.fragOps.polygonOffsetUnits;
    }

    // Execute rasterize - shade - write loop
    while(true) {
        // Rasterize

        // Clear the fragmentPackets and fragmentDepthBuffer buffers before rasterizing
        buffers.fragmentPackets.length = 0;
        if (buffers.fragmentDepthBuffer)
            buffers.fragmentDepthBuffer.length = 0;

        var numRasterizedPackets = rasterizer.rasterize(buffers.fragmentPackets, buffers.fragmentDepthBuffer);

        // numRasterizedPackets is guaranteed to be greater than zero for shadeFragments()

        if (!numRasterizedPackets)
            break; // Rasterization finished.

        // Polygon offset
        if (buffers.fragmentDepthBuffer && state.fragOps.polygonOffsetEnabled)
            for (var sampleNdx = 0; sampleNdx < numRasterizedPackets * 4 * numSamples; ++sampleNdx)
                buffers.fragmentDepthBuffer[sampleNdx] = deMath.clamp(buffers.fragmentDepthBuffer[sampleNdx] + depthOffset, 0, 1);

        // Shade

        program.fragmentShader.shadeFragments(buffers.fragmentPackets, numRasterizedPackets, shadingContext);

        // Depth clamp
        if (buffers.fragmentDepthBuffer && state.fragOps.depthClampEnabled)
            for (var sampleNdx = 0; sampleNdx < numRasterizedPackets * 4 * numSamples; ++sampleNdx)
                buffers.fragmentDepthBuffer[sampleNdx] = deMath.clamp(buffers.fragmentDepthBuffer[sampleNdx], depthClampMin, depthClampMax);

        // Handle fragment shader outputs

        writeFragmentPackets(state, renderTarget, program, buffers.fragmentPackets, numRasterizedPackets, visibleFace, buffers.shaderOutputs, buffers.fragmentDepthBuffer, buffers.shadedFragments);
    }
}


var triangles = (function() {
    var exec = function(output, /*VertexPacket* const**/ vertices, /*size_t*/ numVertices, /*rr::ProvokingVertex*/ provokingConvention) {
        var provokingOffset = (provokingConvention == rrDefs.ProvokingVertex.PROVOKINGVERTEX_FIRST) ? (0) : (2);

        for (var ndx = 0; ndx + 2 < numVertices; ndx += 3)
            output.push(new Triangle(vertices[ndx], vertices[ndx+1], vertices[ndx+2], provokingOffset));
    };

    var getPrimitiveCount = function(vertices) {
        return Math.floor(vertices / 3);
    };

    return {
        exec: exec,
        getPrimitiveCount: getPrimitiveCount
    };
})();

 var assemblers = (function() {
    var assemblers = [];
    assemblers[PrimitiveType.PRIMITIVETYPE_TRIANGLES] = triangles;
    return assemblers;
})();

var makeSharedVerticesDistinct = function(list, /*VertexPacketAllocator&*/ vpalloc) {
    var vertices = {};

    for (var i = 0; i < list.length; i++)
        list[i].makeSharedVerticesDistinct(vertices, vpalloc);
};

var generatePrimitiveIDs = function(list, /*DrawContext&*/ drawContext) {
    for (var i = 0; i < list.length; i++)
        list[i].generatePrimitiveIDs(drawContext.primitiveID++);
};

var flatshadeVertices =function(/*const Program&*/ program, /*ContainerType&*/ list) {
    // flatshade
    var fragInputs = program.vertexShader.getOutputs();

    for (var inputNdx = 0; inputNdx < fragInputs.length; ++inputNdx)
        if (fragInputs[inputNdx].flatshade)
            for (var i = 0; i < list.length; i++)
                list[i].flatshadePrimitiveVertices(inputNdx);
};

var transformClipCoordsToWindowCoords = function(/*const RenderState&*/ state, /*ContainerType&*/ list) {
    for (var i = 0; i < list.length; i++)
        list[i].transformPrimitiveClipCoordsToWindowCoords(state);
};

var rasterize = function(/*const RenderState&*/                  state,
                /*const RenderTarget&*/                 renderTarget,
                /*const Program&*/                      program,
                /*const ContainerType&*/                list) {
    var                       numSamples          = renderTarget.colorBuffers[0].getNumSamples();
    var                       numFragmentOutputs  = program.fragmentShader.getOutputs().length;

    var viewportRect        = [state.viewport.rect.left, state.viewport.rect.bottom, state.viewport.rect.width, state.viewport.rect.height];
    var bufferRect          = renderTarget.colorBuffers[0].getBufferSize();
    var renderTargetRect    = deMath.intersect(viewportRect, bufferRect);
    var isDepthEnabled = !renderTarget.depthBuffer.isEmpty();

    var buffers = new RasterizationInternalBuffers(isDepthEnabled);

    // rasterize
    for (var i = 0; i < list.length; i++)
        list[i].rasterizePrimitive(state, renderTarget, program, renderTargetRect, buffers);
};


/*--------------------------------------------------------------------*//*!
 * Draws transformed triangles, lines or points to render target
 *//*--------------------------------------------------------------------*/
var drawBasicPrimitives = function(/*const RenderState&*/ state, /*const RenderTarget&*/ renderTarget, /*const Program&*/ program, /*ContainerType&*/ primList, /*VertexPacketAllocator&*/ vpalloc) {
    var clipZ = !state.fragOps.depthClampEnabled;

    // Transform feedback

    // Flatshading
    flatshadeVertices(program, primList);

    /* TODO: implement 
    // Clipping
    // \todo [jarkko] is creating & swapping std::vectors really a good solution?
    clipPrimitives(primList, program, clipZ, vpalloc);
    */

    // Transform vertices to window coords
    transformClipCoordsToWindowCoords(state, primList);

    // Rasterize and paint
    rasterize(state, renderTarget, program, primList);
};

var drawAsPrimitives = function(DrawPrimitiveType, /*const RenderState&*/ state, /*const RenderTarget&*/ renderTarget, /*const Program&*/ program, /*VertexPacket* const**/ vertices, /*int*/ numVertices, /*DrawContext&*/ drawContext, /*VertexPacketAllocator&*/ vpalloc) {
    // Assemble primitives (deconstruct stips & loops)
    var assembler = assemblers[DrawPrimitiveType];
    var      inputPrimitives = [];

    assembler.exec(inputPrimitives, vertices, numVertices, state.provokingVertexConvention);

    // Make shared vertices distinct. Needed for that the translation to screen space happens only once per vertex, and for flatshading
    makeSharedVerticesDistinct(inputPrimitives, vpalloc);

    // A primitive ID will be generated even if no geometry shader is active
    generatePrimitiveIDs(inputPrimitives, drawContext);

    // Draw as a basic type
    drawBasicPrimitives(state, renderTarget, program, inputPrimitives, vpalloc);
};

var isValidCommand = function(/*const DrawCommand&*/ command, /*int*/ numInstances) {
    /* TODO: Implement */
    return true;
};

/**
 * @constructor
 * @param {rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess} colorMultisampleBuffer
 * @param {rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess=} depthMultisampleBuffer
 * @param {rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess=} stencilMultisampleBuffer
 */
var RenderTarget = function(colorMultisampleBuffer, depthMultisampleBuffer, stencilMultisampleBuffer) {
    this.MAX_COLOR_BUFFERS   = 4;
    this.colorBuffers = [];
    this.colorBuffers[0] = colorMultisampleBuffer;
    this.depthBuffer = depthMultisampleBuffer || new rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess();
    this.stencilBuffer = stencilMultisampleBuffer || new rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess();
    this.numColorBuffers = 1;
};

/**
 * @constructor
 * @param {rrShaders.VertexShader} vertexShader_
 * @param {rrShaders.FragmentShader} fragmentShader_
 */
var Program = function(vertexShader_, fragmentShader_){
    this.vertexShader = vertexShader_;
    this.fragmentShader = fragmentShader_;
};

/**
 * @constructor
 * @param {ArrayBuffer} data
 * @param {rrDefs.IndexType} type
 * @param {number=} baseVertex_
 */
var DrawIndices = function(data, type, baseVertex_) {
    this.data = data;
    this.baseVertex = baseVertex_ || 0;
    this.indexType = type;
    switch(type) {
        case rrDefs.IndexType.INDEXTYPE_UINT8:  this.access = new Uint8Array(data); break;
        case rrDefs.IndexType.INDEXTYPE_UINT16: this.access = new Uint16Array(data); break;
        case rrDefs.IndexType.INDEXTYPE_UINT32: this.access = new Uint32Array(data); break;
        default: throw new Error('Invalid type: ' + type);
    }
};

DrawIndices.prototype.readIndexArray = function(index) { return this.access[index]; };

/**
 * @constructor
 * @param {PrimitiveType} primitiveType
 * @param {number} numElements
 * @param { (number|DrawIndices) } indices
 */
var PrimitiveList = function(primitiveType, numElements, indices) {
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

PrimitiveList.prototype.getIndex = function(elementNdx) {
    if (this.m_indices) {
        var index = this.m_baseVertex + this.m_indices.readIndexArray(elementNdx);
        if (index < 0)
            throw new Error('Index must not be negative');

        return index;
    }
    else
        return this.m_baseVertex + elementNdx;
};

PrimitiveList.prototype.isRestartIndex = function(elementNdx, restartIndex) {
    // implicit index or explicit index (without base vertex) equals restart
    if (this.m_indices)
        return this.m_indices.readIndexArray(elementNdx) == restartIndex;
    else
        return elementNdx == restartIndex;
};

PrimitiveList.prototype.getNumElements = function() { return this.m_numElements;     };
PrimitiveList.prototype.getPrimitiveType = function() { return this.m_primitiveType; };
PrimitiveList.prototype.getIndexType = function() { return this.m_indexType; };

/**
 * @constructor
 * @param {rrRenderState.RenderState} state_
 * @param {RenderTarget} renderTarget_
 * @param {Program} program_
 * @param {number} numVertexAttribs_
 * @param {Array<rrVertexAttrib.VertexAttrib>} vertexAttribs_
 * @param {PrimitiveList} primitives_
 */
var DrawCommand = function(state_, renderTarget_, program_, numVertexAttribs_, vertexAttribs_, primitives_) {
    this.state             = state_;
    this.renderTarget      = renderTarget_;
    this.program           = program_;
    this.numVertexAttribs  = numVertexAttribs_;
    this.vertexAttribs     = vertexAttribs_;
    this.primitives        = primitives_;
};

var drawInstanced = function(/*const DrawCommand&*/ command, numInstances) {
     // Do not run bad commands
    {
        var validCommand = isValidCommand(command, numInstances);
        if (!validCommand)
        {
            throw new Error('Invalid command');
        }
    }

    // Do not draw if nothing to draw
    {
        if (command.primitives.getNumElements() == 0 || numInstances == 0)
            return;
    }

    // Prepare transformation

    var                numVaryings = command.program.vertexShader.getOutputs().length;
    var       vpalloc = new rrVertexPacket.VertexPacketAllocator(numVaryings);
    var  vertexPackets = vpalloc.allocArray(command.primitives.getNumElements());
    var  drawContext = new DrawContext();

    for (var instanceID = 0; instanceID < numInstances; ++instanceID)
    {
        // Each instance has its own primitives
        drawContext.primitiveID = 0;

        for (var elementNdx = 0; elementNdx < command.primitives.getNumElements(); ++elementNdx)
        {
            var numVertexPackets = 0;

            // collect primitive vertices until restart

            while (elementNdx < command.primitives.getNumElements() &&
                    !(command.state.restart.enabled && command.primitives.isRestartIndex(elementNdx, command.state.restart.restartIndex)))
            {
                // input
                vertexPackets[numVertexPackets].instanceNdx    = instanceID;
                vertexPackets[numVertexPackets].vertexNdx      = command.primitives.getIndex(elementNdx);

                // output
                vertexPackets[numVertexPackets].pointSize      = command.state.point.pointSize;    // default value from the current state
                vertexPackets[numVertexPackets].position       = [0, 0, 0, 0];            // no undefined values

                ++numVertexPackets;
                ++elementNdx;
            }

            // Duplicated restart shade
            if (numVertexPackets == 0)
                continue;

            // \todo Vertex cache?

            // Transform vertices

            command.program.vertexShader.shadeVertices(command.vertexAttribs, vertexPackets, numVertexPackets);

            // Draw primitives
            drawAsPrimitives(command.primitives.getPrimitiveType(), command.state, command.renderTarget, command.program, vertexPackets, numVertexPackets, drawContext, vpalloc);
        }
    }
};


var draw = function(/*const DrawCommand&*/ command) {
    drawInstanced(command, 1);
};

var getBarycentricCoefficients = function(v, v1, v2, v3) {
    var b = [];

    var x = v[0];
    var y = v[1];
    var x1 = v1[0];
    var x2 = v2[0];
    var x3 = v3[0];
    var y1 = v1[1];
    var y2 = v2[1];
    var y3 = v3[1];

    var det = (y2 - y3)*(x1 - x3) + (x3 - x2)*(y1 - y3);

    b[0] = ((y2 - y3)*(x - x3) + (x3 - x2)*(y - y3))/det;
    b[1] = ((y3 - y1)*(x - x3) + (x1 - x3)*(y - y3))/det;
    b[2] = 1 - b[0] - b[1];

    return b;
};

/**
 * @constructor
 */
var FragmentPacket = function(coefficents, coords) {
    this.barycentric = coefficents;
    this.fragCoord = coords;
};

/**
 * @param {rrRenderState.RenderState} state
 * @param {RenderTarget} renderTarget
 * @param {Array<FragmentPacket>} fragments Fragments to write
*/
var writeFragments = function(state, renderTarget, fragments) {
    /* TODO: Add blending, depth, stencil ... */
    var colorbuffer = renderTarget.colorBuffers[0].raw();
    for (var i = 0; i < fragments.length; i++) {
        var fragment = fragments[i];
        colorbuffer.setPixel(fragment.output, 0, fragment.pixelCoord[0], fragment.pixelCoord[0]);
    }

};

/**
 * @param {rrRenderState.RenderState} state
 * @param {RenderTarget} renderTarget
 * @param {Program} program
 * @param {Array<rrVertexAttrib.VertexAttrib>} vertexAttribs
 * @param {Array<number>} topLeft Coordinates of top left corner of the rectangle
 * @param {Array<number>} bottomRight Coordinates of bottom right corner of the rectangle
*/
var drawQuad = function(state, renderTarget, program, vertexAttribs, topLeft, bottomRight) {
    var v0 = [topLeft[0], topLeft[1]];
    var v1 = [topLeft[0], bottomRight[1]];
    var v2 = [bottomRight[0], topLeft[1]];
    var v3 = [bottomRight[0], bottomRight[1]];
    var width = bottomRight[0] - topLeft[0];
    var height = bottomRight[1] - topLeft[1];

    // Generate two triangles [v0, v1, v2] and [v1, v2, v3]
    var shadingContextTopLeft = new rrShadingContext.FragmentShadingContext(vertexAttribs[0], vertexAttribs[1], vertexAttribs[2], null, 1);
    var packetsTopLeft = [];

    var shadingContextBottomRight = new rrShadingContext.FragmentShadingContext(vertexAttribs[1], vertexAttribs[2], vertexAttribs[3], null, 1);
    var packetsBottomRight = [];
    for (var i = 0; i < width; i++)
        for (var j = 0; j < height; j++) {
            var x = v0[0] + i + 0.5;
            var y = v0[1] + j + 0.5;

            var xf = (i + 0.5) / width;
            var yf = (j + 0.5) / height;
            var triNdx = xf + yf >= 1;
            if (!triNdx) {
                var b = getBarycentricCoefficients([x, y], v0, v1, v2);
                packetsTopLeft.push(new FragmentPacket(b, [v0[0] + i, v0[1] + j]));
            } else {
                 var b = getBarycentricCoefficients([x, y], v1, v2, v3);
                packetsBottomRight.push(new FragmentPacket(b, [v0[0] + i, v0[1] + j]));
            }
        }
    program.fragmentShader.shadeFragments(packetsTopLeft, shadingContextpacketsTopLeft);
    program.fragmentShader.shadeFragments(packetsBottomRight, shadingContextpacketsBottomRight);
    writeFragments(state, renderTarget, packetsTopLeft);
    writeFragments(state, renderTarget, packetsBottomRight);
};

return {
    PrimitiveType: PrimitiveType,
    RenderTarget: RenderTarget,
    Program: Program,
    drawQuad: drawQuad 
};

});