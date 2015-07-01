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
 *	  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

'use strict';
goog.provide('modules.shared.glsShaderRenderCase');

goog.scope(function() {
    var glsShaderRenderCase = modules.shared.glsShaderRenderCase;
    var tcuTexture;
    var tcuMatrix;
    var tcuRGBA;
    var deMath;

    /** @type {number} */ glsShaderRenderCase.GRID_SIZE = 64;
    /** @type {number} */ glsShaderRenderCase.MAX_RENDER_WIDTH = 128;
    /** @type {number} */ glsShaderRenderCase.MAX_RENDER_HEIGHT = 112;
    /** @type {Array<number>} */ glsShaderRenderCase.DEFAULT_CLEAR_COLOR = [0.125, 0.25, 0.5, 1.0];

    /** @enum {number} */
    glsShaderRenderCase.Type = {
		TYPE_NONE: 0,
		TYPE_2D: 1,
		TYPE_CUBE_MAP: 2,
		TYPE_2D_ARRAY: 3,
		TYPE_3D: 4
	};

    /**
     * Helper function
     * @param  {?(gluTexture.Texture2D|gluTexture.TextureCube|gluTexture.Texture2DArray|gluTexture.Texture3D)} tex
     * @return {glsShaderRenderCase.Type}
     */
    glsShaderRenderCase.getTextureType = function(tex) {
        if (tex instanceof gluTexture.Texture2D) return glsShaderRenderCase.Type.TYPE_2D;
        else if (tex instanceof gluTexture.TextureCube) return glsShaderRenderCase.Type.TYPE_CUBE_MAP;
        else if (tex instanceof gluTexture.Texture2DArray) return glsShaderRenderCase.Type.TYPE_2D_ARRAY;
        else if (tex instanceof gluTexture.Texture3D) return glsShaderRenderCase.Type.TYPE_3D;
        else return glsShaderRenderCase.Type.TYPE_NONE;
    };

    /**
     * @constructor
     * @param {number=} indent
     */
    glsShaderRenderCase.LineStream = function(indent) {
        indent = indent === undefined ? 0 : indent;
        /** @type {number} */ this.m_indent = indent;
        /** @type {string} */ this.m_stream;
        /** @type {string} */ this.m_string;
    };

    /**
     * @return {string}
     */
    glsShaderRenderCase.LineStream.prototype.str = function() {
         this.m_string = this.m_stream;
         return this.m_string;
    };

    /**
     * @constructor
     * @param  {(gluTexture.Texture2D|gluTexture.TextureCube|gluTexture.Texture2DArray|gluTexture.Texture3D)=} tex
     * @param  {tcuTexture.Sampler=} sampler
     */
    glsShaderRenderCase.TextureBinding = function(tex, sampler) {
        tex = tex === undefined ? null : tex;
        sampler = sampler === undefined ? null : sampler;
        /** @type {glsShaderRenderCase.Type} */ this.m_type = glsShaderRenderCase.getTextureType(tex);
        /** @type {tcuTexture.Sampler} */ this.m_sampler = sampler;
        /** @type {(gluTexture.Texture2D|gluTexture.TextureCube|gluTexture.Texture2DArray|gluTexture.Texture3D)} */
        this.m_binding = tex;
    }:

    /**
     * @param {tcuTexture.Sampler} sampler
     */
    glsShaderRenderCase.TextureBinding.prototype.setSampler = function(sampler) {
        this.m_sampler = sampler;
    };

    /**
     * @param {(gluTexture.Texture2D|gluTexture.TextureCube|gluTexture.Texture2DArray|gluTexture.Texture3D)} tex
     */
    glsShaderRenderCase.TextureBinding.prototype.setTexture = function(tex) {
        this.m_type = glsShaderRenderCase.getTextureType(tex);
        this.m_binding = tex;
    };

    /** @return {glsShaderRenderCase.Type} */
    glsShaderRenderCase.TextureBinding.prototype.getType = function() {
        return this.m_type;
    };

    /** @return {tcuTexture.Sampler} */
    glsShaderRenderCase.TextureBinding.prototype.getSampler = function() {
        return this.m_sampler;
    };

    /** @return {(gluTexture.Texture2D|gluTexture.TextureCube|gluTexture.Texture2DArray|gluTexture.Texture3D)} */
    glsShaderRenderCase.TextureBinding.prototype.getBinding = function() {
        return this.m_binding;
    };

    /** @enum {number} */
    glsShaderRenderCase.Limits {
		MAX_USER_ATTRIBS: 4,
		MAX_TEXTURES: 4,
	};

    /**
     * @constructor
     * @param  {number} gridSize
     * @param  {number} screenWidth
     * @param  {number} screenHeight
     * @param  {Array<number>} constCoords
     * @param  {Array<tcuMatrix.Matrix>} userAttribTransforms
     * @param  {Array<glsShaderRenderCase.TextureBinding> textures
     */
    glsShaderRenderCase.QuadGrid = function(gridSize, screenWidth, screenHeight, constCoords, userAttribTransforms, textures) {
        /** @type {number} */ this.m_gridSize = gridSize;
    	/** @type {number} */ this.m_numVertices = (gridSize + 1) * (gridSize + 1);
    	/** @type {number} */ this.m_numTriangles = (gridSize * gridSize *2);
    	/** @type Array<number> */ this.m_constCoords = constCoords;
    	/** @type Array<tcuMatrix.Matrix> */ this.m_userAttribTransforms = userAttribTransforms;
    	/** @type Array<glsShaderRenderCase.TextureBinding> */ this.m_textures = textures;
        /** @type Array<Array<number>> */ this.m_screenPos = [];
    	/** @type Array<Array<number>> */ this.m_positions = [];
    	/** @type Array<Array<number>> */ this.m_coords = [];			//!< Near-unit coordinates, roughly [-2.0 .. 2.0].
    	/** @type Array<Array<number>> */ this.m_unitCoords = [];		//!< Positive-only coordinates [0.0 .. 1.5].
    	/** @type Array<number> */ this.m_attribOne = [];
    	/** @type Array<Array<number>> */ this.m_userAttribs = [];
    	/** @type Array<number> */ this.m_indices = [];

        /** @type Array<number> */ viewportScale = [width, height, 0, 0];
        for (var y = 0; y < gridSize + 1; y++)
    	for (var x = 0; x < gridSize + 1; x++) {
    		/** @type {number} */ var sx = x / gridSize;
    		/** @type {number} */ var sy = y / gridSize;
    		/** @type {number} */ var fx = 2.0 * sx - 1.0;
    		/** @type {number} */ var fy = 2.0 * sy - 1.f;
    		/** @type {number} */ var vtxNdx = ((y * (gridSize + 1)) + x);

    		this.m_positions[vtxNdx] = [fx, fy, 0.0, 1.0];
    		this.m_attribOne[vtxNdx] = 1.0;
    		this.m_screenPos[vtxNdx] = deMath.multiply([sx, sy, 0.0, 1.0], viewportScale);
    		this.m_coords[vtxNdx] = this.getCoords(sx, sy);
    		this.m_unitCoords[vtxNdx] = this.getUnitCoords(sx, sy);

    		for (var attribNdx = 0; attribNdx < this.getNumUserAttribs(); attribNdx++)
    			this.m_userAttribs[attribNdx][vtxNdx] = this.getUserAttrib(attribNdx, sx, sy);
    	}

        // Compute indices.
    	for (var y = 0; y < gridSize; y++)
    	for (var x = 0; x < gridSize; x++) {
    		/** @type {number} */ var stride = gridSize + 1;
    		/** @type {number} */ var v00 = (y * stride) + x;
    		/** @type {number} */ var v01 = (y * stride) + x + 1;
    		/** @type {number} */ var v10 = ((y + 1) * stride) + x;
    		/** @type {number} */ var v11 = ((y + 1) * stride) + x + 1;

    		/** @type {number} */ var baseNdx = ((y * gridSize) + x) * 6;
    		this.m_indices[baseNdx + 0] = v10;
    		this.m_indices[baseNdx + 1] = v00;
    		this.m_indices[baseNdx + 2] = v01;

    		this.m_indices[baseNdx + 3] = v10;
    		this.m_indices[baseNdx + 4] = v01;
    		this.m_indices[baseNdx + 5] = v11;
    	}
    };

    /** @return {number} */
    glsShaderRenderCase.QuadGrid.prototype.getGridSize = function() {
        return this.m_gridSize;
    };

    /** @return {number} */
    glsShaderRenderCase.QuadGrid.prototype.getNumVertices = function() {
        return this.m_numVertices;
    };

    /** @return {number} */
    glsShaderRenderCase.QuadGrid.prototype.getNumTriangles = function() {
        return this.m_numTriangles;
    };

    /** @return {Array<number>} */
    glsShaderRenderCase.QuadGrid.prototype.getConstCoords = function() {
        return this.m_constCoords;
    };

    /** @return {Array<tcuMatrix.Matrix>} */
    glsShaderRenderCase.QuadGrid.prototype.getUserAttribTransforms = function() {
        return this.m_userAttribTransforms;
    };

    /** @return {Array<glsShaderRenderCase.TextureBinding>} */
    glsShaderRenderCase.QuadGrid.prototype.getUserAttribTransforms = function() {
        return this.m_textures;
    };

    /** @return {Array<number>} */
    glsShaderRenderCase.QuadGrid.prototype.getPositions = function() {
        return this.m_positions;
    };

    /** @return {Array<number>} */
    glsShaderRenderCase.QuadGrid.prototype.getAttribOne = function() {
        return this.m_attribOne;
    };

    /** @return {Array<number>} */
    glsShaderRenderCase.QuadGrid.prototype.getCoordsArray = function() {
        return this.m_coords;
    };

    /** @return {Array<number>} */
    glsShaderRenderCase.QuadGrid.prototype.getUnitCoordsArray = function() {
        return this.m_unitCoords;
    };

    /**
     * @param {number} attribNdx
     * @return {Array<number>}
     */
    glsShaderRenderCase.QuadGrid.prototype.getUserAttribByIndex = function(attribNdx) {
        return this.m_userAttribs[attribNdx];
    };

    /** @return {Array<number>} */
    glsShaderRenderCase.QuadGrid.prototype.getIndices = function() {
        return this.m_indices;
    };

    /**
     * @param {number} sx
     * @param {number} sy
     * @return {Array<number>}
     */
    glsShaderRenderCase.QuadGrid.prototype.getCoords = function(sx, sy) {
        /** @type {number} */ var fx = 2.0 * sx - 1.0;
        /** @type {number} */ var fy = 2.0 * sy - 1.0;
        return [fx, fy, -fx + 0.33 * fy, -0.275 * fx - fy];
    };

    /**
     * @param {number} sx
     * @param {number} sy
     * @return {Array<number>}
     */
    glsShaderRenderCase.QuadGrid.prototype.getUnitCoords = function(sx, sy) {
        return [sx, sy, 0.33 * sx + 0.5 * sy, 0.5 * sx + 0.25 * sy];
    };

    /**
     * @return {number}
     */
    glsShaderRenderCase.QuadGrid.prototype.getNumUserAttribs = function() {
        return this.m_userAttribTransforms.length;
    };

    /**
     * @param {number} attribNdx
     * @param {number} sx
     * @param {number} sy
     * @return {Array<number>}
     */
    glsShaderRenderCase.QuadGrid.prototype.getUserAttrib = function(attribNdx, sx, sy) {
        // homogeneous normalized screen-space coordinates
	    return tcuMatrix.multiplyMatVec(this.m_userAttribTransforms[attribNdx], [sx, sy, 0.0, 1.0]);
    };

    glsShaderRenderCase.ShaderSampler = function() {
		/** @type {tcuTexture.Sampler} */ this.sampler;
		/** @type {tcuTexture.Texture2D} */ this.tex2D = null;
		/** @type {tcuTexture.TextureCube} */ this.texCube = null;
		/** @type {tcuTexture.Texture2DArray} */ this.tex2DArray = null;
		/** @type {tcuTexture.Texture3D} */ this.tex3D = null;
	};

    /**
     * @constructor
     * @param  {glsShaderRenderCase.QuadGrid} quadGrid
     */
    glsShaderRenderCase.ShaderEvalContext = function(quadGrid_) {
        /** @type {Array<number>} */ this.coords = [];
        /** @type {Array<number>} */ this.unitCoords; = []
        /** @type {Array<number>} */ this.constCoords = quadGrid_.getConstCoords();
        /** @type {Array<number>} */ this.in = [];
        /** @type {Array<glsShaderRenderCase.ShaderSampler>} */ this.textures = [];
        /** @type {Array<number>} */ this.color = [];
        /** @type {boolean} */ this.isDiscarded = false;
        /** @type {glsShaderRenderCase.QuadGrid} */ this.quadGrid = quadGrid_;

        /** @type {Array<glsShaderRenderCase.TextureBinding>} */ var bindings = this.quadGrid.getTextures();
        assertMsgOptions(bindings.length <= glsShaderRenderCase.Limits.MAX_TEXTURES);

        // Fill in texture array.
    	for (var ndx = 0; ndx < bindings.length; ndx++) {
    		/** @type {glsShaderRenderCase.TextureBinding} */ var binding = bindings[ndx];

    		if (binding.getType() == glsShaderRenderCase.Type.TYPE_NONE)
    			continue;

    		textures[ndx].sampler = binding.getSampler();

    		switch (binding.getType()) {
    			case glsShaderRenderCase.Type.TYPE_2D:
                    textures[ndx].tex2D = binding.getBinding().getRefTexture();
                    break;
    			case glsShaderRenderCase.Type.TYPE_CUBE_MAP:
                    textures[ndx].texCube = binding.getBinding().getRefTexture();
                    break;
    			case glsShaderRenderCase.Type.TYPE_2D_ARRAY:
                    textures[ndx].tex2DArray = binding.getBinding().getRefTexture();
                    break;
    			case glsShaderRenderCase.Type.TYPE_3D:
                    textures[ndx].tex3D = binding.getBinding().getRefTexture();
                    break;
    			default:
    				throw new Error("Binding type not supported");
    		}
    	}
    };

    /**
     * @param {number} sx
     * @param {number} sy
     */
    glsShaderRenderCase.ShaderEvalContext.prototype.reset = function(sx, sy) {
        // Clear old values
    	/** @type {Array<number>} */ var color = [0.0, 0.0, 0.0, 1.0];
    	/** @type {boolean} */ var isDiscarded = false;

    	// Compute coords
    	/** @type {Array<number>} */ var coords = quadGrid.getCoords(sx, sy);
    	/** @type {Array<number>} */ var unitCoords = quadGrid.getUnitCoords(sx, sy);

    	// Compute user attributes.
    	/** @type {number} */ var numAttribs = quadGrid.getNumUserAttribs();
    	assertMsgOptions(numAttribs <= glsShaderRenderCase.Limits.MAX_USER_ATTRIBS, 'numAttribs out of range', false, true);
    	for (var attribNdx = 0; attribNdx < numAttribs; attribNdx++)
    		in[attribNdx] = quadGrid.getUserAttrib(attribNdx, sx, sy);
    };

    glsShaderRenderCase.ShaderEvalContext.prototype.discard = function() {
        this.isDiscarded = true;
    };

    /**
     * @param {number} unitNdx
     * @param {Array<number>} coords
     */
    glsShaderRenderCase.ShaderEvalContext.prototype.texture2D = function(unitNdx, coords) {
        if (textures[unitNdx].tex2D)
    		return textures[unitNdx].tex2D.sample(textures[unitNdx].sampler, texCoords[0], texCoords[1], 0.0);
    	else
    		return [0.0, 0.0, 0.0, 1.0];
    };

    /** @param {glsShaderRenderCase.ShaderEvalContext} c */
    glsShaderRenderCase.evalCoordsPassthroughX = function(c) {
        c.color[0] = c.coords[0];
    };

    /** @param {glsShaderRenderCase.ShaderEvalContext} c */
    glsShaderRenderCase.evalCoordsPassthroughXY = function(c) {
        var swizzle01 = deMath.swizzle(c.coords, [0, 1]);
        c.color[0] = swizzle01[0];
        c.color[1] = swizzle01[1];
    };

    /** @param {glsShaderRenderCase.ShaderEvalContext} c */
    glsShaderRenderCase.evalCoordsPassthroughXYZ = function(c) {
        var swizzle012 = deMath.swizzle(c.coords, [0, 1, 2]);
        c.color[0] = swizzle012[0];
        c.color[1] = swizzle012[1];
        c.color[2] = swizzle012[2];
    };

    /** @param {glsShaderRenderCase.ShaderEvalContext} c */
    glsShaderRenderCase.evalCoordsPassthrough = function(c) {
        c.color = c.coords;
    };

    /** @param {glsShaderRenderCase.ShaderEvalContext} c */
    glsShaderRenderCase.evalCoordsSwizzleWZYX = function(c) {
        c.color = deMath.swizzle(c.coords, [3, 2, 1, 0]);
    };

    /**
     * @constructor
     * @param  {?function(ShaderEvalContext)} evalFunc
     */
    glsShaderRenderCase.ShaderEvaluator = function(evalFunc) {
        evalFunc = evalFunc === undefined ? null :  evalFunc;
        /** @type {function(ShaderEvalContext)} */ this.m_evalFunc = evalFunc;
    };

    /**
     * @param {glsShaderRenderCase.ShaderEvalContext} ctx
     */
    glsShaderRenderCase.ShaderEvaluator.prototype.evaluate = function(ctx) {
        assertMsgOptions(this.m_evalFunc, 'No evaluation function specified.', false, true);
        this.m_evalFunc(ctx);
n    };

    /**
     * @constructor
     * @extends {tcuTestCae.DeqpTest}
     * @param  {string} name
     * @param  {string} description
     * @param  {boolean} isVertexCase
     * @param  {glsShaderRenderCase.ShaderEvalFunc=} evalFunc
     */
    glsShaderRenderCase.ShaderRenderCase = function(name, description, isVertexCase, evalFunc) {
        //glu::RenderContext&			m_renderCtx;
    	//const glu::ContextInfo&		m_ctxInfo;
        tcuTestCae.DeqpTest.call(this, name, description);
        evalFunc = evalFunc === undefined ? null : evalFunc;
    	/** @type {boolean} */ this.m_isVertexCase = isVertexCase;
    	/** @type {glsShaderRenderCase.ShaderEvaluator} */ this.m_defaultEvaluator = evalFunc;
    	/** @type {glsShaderRenderCase.ShaderEvaluator} */ this.m_evaluator = this.m_defaultEvaluator;
    	/** @type {string} */ this.m_vertShaderSource;
    	/** @type {string} */ this.m_fragShaderSource;
    	/** @type {Array<number>} */ this.m_clearColor = glsShaderRenderCase.DEFAULT_CLEAR_COLOR;
    	/** @type {Array<tcuMatrix.Matrix>} */ this.m_userAttribTransforms;
    	/** @type {Array<glsShaderRenderCase.TextureBinding>} */ this.m_textures;
    	/** @type {gluShaderProgram.ShaderProgram} */ this.m_program = null;
    };

    /**
     * @param  {string} name
     * @param  {string} description
     * @param  {boolean} isVertexCase
     * @param  {glsShaderRenderCase.ShaderEvaluator} evaluator
     * @return {glsShaderRenderCase.ShaderRenderCase}
     */
    glsShaderRenderCase.ShaderRenderCase.newWithEvaluator = function(name, description, isVertexCase, evaluator) {
        var renderCase = new glsShaderRenderCase.ShaderRenderCase(name, description, isVertexCase);
        renderCase.m_evaluator = evaluator;
        return renderCase;
    };

    glsShaderRenderCase.ShaderRenderCase.prototype = Object.create(tcuTestCase.DeqpTest);
    glsShaderRenderCase.ShaderRenderCase.prototype.constructor = glsShaderRenderCase.ShaderRenderCase;

    glsShaderRenderCase.ShaderRenderCase.prototype.deinit = function() {
        delete this.m_program;
        this.m_program = null;
    };

    glsShaderRenderCase.ShaderRenderCase.prototype.init = function() {


    	if (this.m_vertShaderSource.length === 0 || this.m_fragShaderSource.length === 0) {
    		assertMsgOptions(this.m_vertShaderSource.length === 0 && m_fragShaderSource.length === 0, 'No shader source.', false, true);
            this.setupShaderData();
    	}

    	assertMsgOptions(!this.m_program, 'Program defined.', false, true);
    	this.m_program = new gluShaderProgram.ShaderProgram(gl, gluShaderProgram.makeVtxFragSources(this.m_vertShaderSource, this.m_fragShaderSource));

    	try {
    		bufferedLogToConsole(this.m_program);; // Always log shader program.

    		if (!this.m_program.isOk())
    			throw new Error("Shader compile error.");
    	}
    	catch (exception) {
    		// Clean up.
    		this.deinit();
    		throw new Error(exception);
    	}
    };

    glsShaderRenderCase.ShaderRenderCase.prototype.iterate = function() {
    	assertMsgOptions(this.m_program, 'Program not specified.', false, true);
    	/** @type {number} */ var programID = this.m_program.getProgram();
    	gl.useProgram(programID);

    	// Create quad grid.
    	/** @type {Array<number>} */ var viewportSize = this.getViewportSize();
    	/** @type {number} */ var width = viewportSize[0];
    	/** @type {number} */ var height = viewportSize[1];

    	// \todo [petri] Better handling of constCoords (render in multiple chunks, vary coords).
    	/** @type {glsShaderRenderCase.QuadGrid} */
        var quadGrid = new glsShaderRenderCase.QuadGrid(
            this.m_isVertexCase ? glsShaderRenderCase.GRID_SIZE : 4, width, height,
            [0.125, 0.25, 0.5, 1.0], this.m_userAttribTransforms, this.m_textures);

    	// Render result.
    	/** @type {tcuTexture.Surface} */ var resImage = new tcuTexture.Surface(width, height);
    	this.render(resImage, programID, quadGrid);

    	// Compute reference.
    	/** @type {tcuTexture.Surface} */ var refImage = new tcuTexture.Surface(width, height);
    	if (this.m_isVertexCase)
    		this.computeVertexReference(refImage, quadGrid);
    	else
    		this.computeFragmentReference(refImage, quadGrid);

    	// Compare.
    	/** @type {boolean} */ var testOk = this.compareImages(resImage, refImage, 0.05);

    	// De-initialize.
    	gl.useProgram(null);

        if (!testOk)
            testFailedOptions("Fail", false);
        else
            testPassedOptions("Pass", true);

    	return tcuTestCase.IterateResult.STOP;
    };
    glsShaderRenderCase.ShaderRenderCase.prototype.setupShaderData = function() {};

    /**
     * @param {number} programId
     */
    glsShaderRenderCase.ShaderRenderCase.prototype.setup = function(programId) {};

    /**
     * @param {number} programId
     * @param {Array<number>} constCoords
     */
    glsShaderRenderCase.ShaderRenderCase.prototype.setupUniforms = function(programId, constCoords) {};

    /**
    * @return  {Array<number>}
    */
    glsShaderRenderCase.ShaderRenderCase.prototype.getViewportSize = function() {
        return [Math.min(gl.canvas.width, glsShaderRenderCase.MAX_RENDER_WIDTH),
                Math.min(gl.canvas.height, glsShaderRenderCase.MAX_RENDER_HEIGHT)];
    };

    /**
     * @param {number} programId
     */
    glsShaderRenderCase.ShaderRenderCase.prototype.setupDefaultInputs = function(programId) {
    	// SETUP UNIFORMS.
    	this.setupDefaultUniforms(programID);

    	// SETUP TEXTURES.
    	for (var ndx = 0; ndx < m_textureslength; ndx++) {
    		/** @type {glsShaderRenderCase.TextureBinding} */ var tex = this.m_textures[ndx];
    		/** @type {tcuTexture.Sampler} */ var sampler = tex.getSampler();
    		/** @type {number} */ var texTarget = gl.NONE;
    		/** @type {number} */ var texObj = 0;

    		if (tex.getType() === glsShaderRenderCase.Type.TYPE_NONE)
    			continue;

    		// Feature check.
    		if (m_renderCtx.getType().getAPI() == glu::ApiType::es(2,0))
    		{
    			if (tex.getType() == glsShaderRenderCase.Type.TYPE_2D_ARRAY)
    				throw tcu::NotSupportedError("2D array texture binding is not supported");

    			if (tex.getType() == glsShaderRenderCase.Type.TYPE_3D)
    				throw tcu::NotSupportedError("3D texture binding is not supported");

    			if (sampler.compare != tcu::Sampler::COMPAREMODE_NONE)
    				throw tcu::NotSupportedError("Shadow lookups are not supported");
    		}

    		switch (tex.getType()) {
    			case glsShaderRenderCase.Type.TYPE_2D:
                    texTarget = gl.TEXTURE_2D;
                    texObj = tex.get2D().getGLTexture();
                    break;
    			case glsShaderRenderCase.Type.TYPE_CUBE_MAP:
                    texTarget = gl.TEXTURE_CUBE_MAP;
                    texObj = tex.getCube().getGLTexture();
                    break;
    			case glsShaderRenderCase.Type.TYPE_2D_ARRAY:
                    texTarget = gl.TEXTURE_2D_ARRAY;
                    texObj = tex.get2DArray().getGLTexture();
                    break;
    			case glsShaderRenderCase.Type.TYPE_3D:
                    texTarget = gl.TEXTURE_3D;
                    texObj = tex.get3D().getGLTexture();
                    break;
    			default:
    				theow new Error("Type not supported");
    		}

    		gl.activeTexture(gl.TEXTURE0+ndx);
    		gl.bindTexture(texTarget, texObj);
    		gl.texParameteri(texTarget, gl.TEXTURE_WRAP_S,		glu::getGLWrapMode(sampler.wrapS));
    		gl.texParameteri(texTarget, gl.TEXTURE_WRAP_T,		glu::getGLWrapMode(sampler.wrapT));
    		gl.texParameteri(texTarget, gl.TEXTURE_MIN_FILTER,	glu::getGLFilterMode(sampler.minFilter));
    		gl.texParameteri(texTarget, gl.TEXTURE_MAG_FILTER,	glu::getGLFilterMode(sampler.magFilter));

    		if (texTarget == gl.TEXTURE_3D)
    			gl.texParameteri(texTarget, gl.TEXTURE_WRAP_R, glu::getGLWrapMode(sampler.wrapR));

    		if (sampler.compare != tcu::Sampler::COMPAREMODE_NONE)
    		{
    			gl.texParameteri(texTarget, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    			gl.texParameteri(texTarget, gl.TEXTURE_COMPARE_FUNC, glu::getGLCompareFunc(sampler.compare));
    		}
    	}

    	GLU_EXPECT_NO_ERROR(gl.getError(), "texture sampler setup");
    };

    /**
     * @param {tcuTexture.Surface} result
     * @param {number} programId
     * @param {glsShaderRenderCase.QuadGrid} quadGrid
     **/
    glsShaderRenderCase.ShaderRenderCase.prototype.render = function(esult, programId, quadGrid) {};

    /**
     * @param {tcuTexture.Surface} result
     * @param {glsShaderRenderCase.QuadGrid} quadGrid
     **/
    glsShaderRenderCase.ShaderRenderCase.prototype.computeVertexReference = function(result, quadGrid) {};

    /**
     * @param {tcuTexture.Surface} result
     * @param {glsShaderRenderCase.QuadGrid} quadGrid
     **/
    glsShaderRenderCase.ShaderRenderCase.prototype.computeFragmentReference = function(result, quadGrid) {};

    /**
     * @param {tcuTexture.Surface} resImage
     * @param {tcuTexture.Surface} refImage
     * @param {number} errorThreshold
     * @return {boolean}
     */
    glsShaderRenderCase.ShaderRenderCase.prototype.compareImages = function(resImage, refImage, errorThreshold) {};

    /**
     * @param {number} number
     * @return {string} */
    glsShaderRenderCase.getIntUniformName = function(number){};

    /**
     * @param {number} number
     * @return {string} */
    glsShaderRenderCase.getFloatUniformName = function(number){};

    /**
     * @param {number} number
     * @return {string} */
    glsShaderRenderCase.getFloatFractionUniformName = function(number){};

    /**
     * @param {number} programID
     */
    glsShaderRenderCase.setupDefaultUniforms = function(programID){};

    glsShaderRenderCase
});
