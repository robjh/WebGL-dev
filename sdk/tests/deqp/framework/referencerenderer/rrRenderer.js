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

define(['framework/referencerenderer/rrVertexPacket', 'framework/referencerenderer/rrVertexPacket' ], function(rrVertexPacket, rrDefs) {

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

/**
 * @constructor
 */
var Triangle = function(v0_, v1_, v2_, provokingIndex_) {
    this.NUM_VERTICES = 3;
    this.v0 = v0_ || null;
    this.v1 = v1_ || null;
    this.v2 = v2_ || null;
    this.provokingIndex = provokingIndex_;

    this.getProvokingVertex = function() {
        switch (this.provokingIndex) {
            case 0: return this.v0;
            case 1: return this.v1;
            case 2: return this.v2;
            default:
                throw new Error('Wrong provoking index:' + this.provokingIndex);
        }
    }
    this.
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
    target.v0.outputs[outputNdx] = flatValue;
    target.v1.outputs[outputNdx] = flatValue;
    target.v2.outputs[outputNdx] = flatValue;
};


var triangles = (function() {
    var exec = function(output, /*VertexPacket* const**/ vertices, /*size_t*/ numVertices, /*rr::ProvokingVertex*/ provokingConvention) {
        var provokingOffset = (provokingConvention == rrDefs.ProvokingVertex.PROVOKINGVERTEX_FIRST) ? (0) : (2);

        for (var ndx = 0; ndx + 2 < numVertices; ndx += 3)
            outputIterator.push(Triangle(vertices[ndx], vertices[ndx+1], vertices[ndx+2], provokingOffset));
    };

    var getPrimitiveCount = function(vertices) {
        return Math.floor(vertices / 3);
    };

    return [
        exec: exec,
        getPrimitiveCount: getPrimitiveCount
    ];
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
}

var flatshadeVertices = function(/*const Program&*/ program, /*ContainerType&*/ list) {
    // flatshade
    var fragInputs = program.vertexShader.getOutputs();

    for (var inputNdx = 0; inputNdx < fragInputs.length; ++inputNdx)
        if (fragInputs[inputNdx].flatshade)
            for (var i = 0; i < list.length; i++)
                list[i].flatshadePrimitiveVertices(inputNdx);
}
/*--------------------------------------------------------------------*//*!
 * Draws transformed triangles, lines or points to render target
 *//*--------------------------------------------------------------------*/
var drawBasicPrimitives = function(/*const RenderState&*/ state, /*const RenderTarget&*/ renderTarget, /*const Program&*/ program, /*ContainerType&*/ primList, /*VertexPacketAllocator&*/ vpalloc) {
    var clipZ = !state.fragOps.depthClampEnabled;

    // Transform feedback

    // Flatshading
    flatshadeVertices(program, primList);

    // Clipping
    // \todo [jarkko] is creating & swapping std::vectors really a good solution?
    clipPrimitives(primList, program, clipZ, vpalloc);

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

var drawInstanced = function(/*const DrawCommand&*/ command, numInstances) {
     // Do not run bad commands
    {
        const bool validCommand = isValidCommand(command, numInstances);
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

            switch (command.primitives.getPrimitiveType())
            {
                case PRIMITIVETYPE_TRIANGLES:               { drawAsPrimitives<PRIMITIVETYPE_TRIANGLES>                 (command.state, command.renderTarget, command.program, vertexPackets, numVertexPackets, drawContext, vpalloc);  break; }
                case PRIMITIVETYPE_TRIANGLE_STRIP:          { drawAsPrimitives<PRIMITIVETYPE_TRIANGLE_STRIP>            (command.state, command.renderTarget, command.program, vertexPackets, numVertexPackets, drawContext, vpalloc);  break; }
                case PRIMITIVETYPE_TRIANGLE_FAN:            { drawAsPrimitives<PRIMITIVETYPE_TRIANGLE_FAN>              (command.state, command.renderTarget, command.program, vertexPackets, numVertexPackets, drawContext, vpalloc);  break; }
                case PRIMITIVETYPE_LINES:                   { drawAsPrimitives<PRIMITIVETYPE_LINES>                     (command.state, command.renderTarget, command.program, vertexPackets, numVertexPackets, drawContext, vpalloc);  break; }
                case PRIMITIVETYPE_LINE_STRIP:              { drawAsPrimitives<PRIMITIVETYPE_LINE_STRIP>                (command.state, command.renderTarget, command.program, vertexPackets, numVertexPackets, drawContext, vpalloc);  break; }
                case PRIMITIVETYPE_LINE_LOOP:               { drawAsPrimitives<PRIMITIVETYPE_LINE_LOOP>                 (command.state, command.renderTarget, command.program, vertexPackets, numVertexPackets, drawContext, vpalloc);  break; }
                case PRIMITIVETYPE_POINTS:                  { drawAsPrimitives<PRIMITIVETYPE_POINTS>                    (command.state, command.renderTarget, command.program, vertexPackets, numVertexPackets, drawContext, vpalloc);  break; }
                case PRIMITIVETYPE_LINES_ADJACENCY:         { drawAsPrimitives<PRIMITIVETYPE_LINES_ADJACENCY>           (command.state, command.renderTarget, command.program, vertexPackets, numVertexPackets, drawContext, vpalloc);  break; }
                case PRIMITIVETYPE_LINE_STRIP_ADJACENCY:    { drawAsPrimitives<PRIMITIVETYPE_LINE_STRIP_ADJACENCY>      (command.state, command.renderTarget, command.program, vertexPackets, numVertexPackets, drawContext, vpalloc);  break; }
                case PRIMITIVETYPE_TRIANGLES_ADJACENCY:     { drawAsPrimitives<PRIMITIVETYPE_TRIANGLES_ADJACENCY>       (command.state, command.renderTarget, command.program, vertexPackets, numVertexPackets, drawContext, vpalloc);  break; }
                case PRIMITIVETYPE_TRIANGLE_STRIP_ADJACENCY:{ drawAsPrimitives<PRIMITIVETYPE_TRIANGLE_STRIP_ADJACENCY>  (command.state, command.renderTarget, command.program, vertexPackets, numVertexPackets, drawContext, vpalloc);  break; }
                default:
                    throw new Error('Unrecognized primitive type:' + command.primitives.getPrimitiveType());
            }
        }
    }
};

});