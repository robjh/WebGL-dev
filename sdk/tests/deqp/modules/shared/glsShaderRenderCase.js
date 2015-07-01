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
goog.provide('modules.shared.glsShaderRenderCase');

goog.scope(function() {

    var glsShaderRenderCase = modules.shared.glsShaderRenderCase;

    /** @const */ var MAX_USER_ATTRIBS= 4;
    /** @const */ var MAX_TEXTURES = 4;

    glsShaderRenderCase.TextureBinding.Type = {
		TYPE_NONE: 0,
		TYPE_2D: 1,
		TYPE_CUBE_MAP: 2,
		TYPE_2D_ARRAY: 3,
		TYPE_3D: 4,
	};

    /**
     * @param {?gluTexture.Texture2D|gluTexture.TextureCube|gluTexture.Texture2DArray|gluTexture.Texture3D} tex2D
     * @param {tcuTexture.Sampler} sampler
     * @constructor
     */
    glsShaderRenderCase.TextureBinding = function (tex, sampler) {
        this.m_sampler = sampler;
        if (tex == gluTexture.Texture2D) {
            this.m_type = glsShaderRenderCase.TextureBinding2D.Type.TYPE_2D;
            this.m_binding.tex2D = tex;
        } else if (tex == gluTexture.TextureCube) {
            this.m_type = glsShaderRenderCase.TextureBinding2D.Type.TYPE_CUBE_MAP;
            this.m_binding.texCube = tex;
        } else if (tex == gluTexture.Texture2DArray) {
            this.m_type = glsShaderRenderCase.TextureBinding2D.Type.TYPE_2D_ARRAY;
            this.m_binding.tex2DArray = tex;
        } else if (tex == gluTexture.Texture3D) {
            this.m_type = glsShaderRenderCase.TextureBinding2D.Type.TYPE_3D;
            this.m_binding.tex3D = tex;
        } else if (tex == null) {
            this.m_type = glsShaderRenderCase.TextureBinding2D.Type.TYPE_NONE;
            this.m_binding.tex2D = null
        }
    };

    glsShaderRenderCase.TextureBinding.prototype = Object.create(glsShaderRenderCase.TextureBinding.prototype);
    glsShaderRenderCase.TextureBinding.prototype.constructor = glsShaderRenderCase.TextureBinding;

    /**
     * @param {number} gridSize
     * @param {number} width
     * @param {number} height
     * @param {Array<number>} constCoords
     * @param {Array<number>} userAttribTransforms
     * @param {Array<number>} textures
     * @constructor
     */
    glsShaderRenderCase.QuadGrid = function (gridSize, width, height, constCoords, userAttribTransforms, textures) {
        this.m_gridSize = gridSize;
        this.m_numVertices = (gridSize + 1) * (gridSize + 1);
        this.m_numTriangles = gridSize * gridSize * 2;
        this.m_constCoords = constCoords;
        this.m_userAttribTransforms = userAttribTransforms;
        this.m_textures = textures;

        var viewportScale = [width, height, 0.0, 0.0];

    	// Compute vertices.
        this.m_positions = [];
    	this.m_coords = [];
    	this.m_unitCoords = [];
    	this.m_attribOne = [];
    	this.m_screenPos = [];
        this.m_userAttribs = [];

    	// User attributes.
    	for (var i = 0; i < this.m_userAttribs.length; i++)
    		this.m_userAttribs[i].resize(m_numVertices);

    	for (var y = 0; y < gridSize+1; y++)
        	for (var x = 0; x < gridSize+1; x++) {
        		var sx = x / gridSize;
        		var sy = y / gridSize;
        		var fx = 2.0 * sx - 1.0;
        		var fy = 2.0 * sy - 1.0;
        		var vtxNdx = (y * (gridSize+1)) + x;

        		this.m_positions[vtxNdx] = [fx, fy, 0.0, 1.0];
        		this.m_attribOne[vtxNdx] = 1.0;
        		this.m_screenPos[vtxNdx] = deMath.multiply([sx, sy, 0.0, 1.0], viewportScale);
        		this.m_coords[vtxNdx] = glsShaderRenderCase.QuadGrid.getCoords(sx, sy);
        		this.m_unitCoords[vtxNdx] = glsShaderRenderCase.QuadGrid.getUnitCoords(sx, sy);

        		for (var attribNdx = 0; attribNdx < glsShaderRenderCase.QuadGrid.getNumUserAttribs(); attribNdx++)
        			this.m_userAttribs[attribNdx][vtxNdx] = glsShaderRenderCase.QuadGrid.getUserAttrib(attribNdx, sx, sy);
        	}

    	// Compute indices.
    	for (y = 0; y < gridSize; y++)
        	for (x = 0; x < gridSize; x++) {
        		var stride = gridSize + 1;
        		var v00 = (y * stride) + x;
        		var v01 = (y * stride) + x + 1;
        		var v10 = ((y + 1) * stride) + x;
        		var v11 = ((y + 1) * stride) + x + 1;

        		var baseNdx = ((y * gridSize) + x) * 6;
        		this.m_indices[baseNdx + 0] = v10;
        		this.m_indices[baseNdx + 1] = v00;
        		this.m_indices[baseNdx + 2] = v01;

        		this.m_indices[baseNdx + 3] = v10;
        		this.m_indices[baseNdx + 4] = v01;
        		this.m_indices[baseNdx + 5] = v11;
        	}
    };

    glsShaderRenderCase.QuadGrid.prototype = Object.create(glsShaderRenderCase.QuadGrid.prototype);
    glsShaderRenderCase.QuadGrid.prototype.constructor = glsShaderRenderCase.QuadGrid;

    /**
     * @param {number} sx
     * @param {number} sy
     * @return {Array<number>}
     */
    glsShaderRenderCase.QuadGrid.prototype.getCoords = function (sx, sy) {
    	var fx = 2.0 * sx - 1.0;
    	var fy = 2.0 * sy - 1.0;
    	return [fx, fy, -fx + 0.33 * fy, -0.275 * fx - fy];
    };

    /**
     * @param {number} sx
     * @param {number} sy
     * @return {Array<number>}
     */
    glsShaderRenderCase.QuadGrid.prototype.getUnitCoords = function (sx, sy) {
    	return [sx, sy, 0.33 * sx + 0.5f * sy, 0.5 * sx + 0.25 * sy];
    }

    /**
     * @return {number}
     */
    glsShaderRenderCase.QuadGrid.prototype.getNumUserAttribs = function () {
        return this.m_userAttribTransforms.length;
    };

    /**
     * @param {number} attribNdx
     * @param {number} sx
     * @param {number} sy
     * @return {Array<number>}
     */
    glsShaderRenderCase.QuadGrid.prototype.getUserAttrib = function (attribNdx, sx, sy) {
    	// homogeneous normalized screen-space coordinates
    	return this.m_userAttribTransforms[attribNdx] * [sx, sy, 0.0, 1.0];
    };

    /**
     * @return {Array<number>}
     */
    glsShaderRenderCase.QuadGrid.prototype.getTextures = function () {
        return this.m_textures;
    };

    /**
     * @param {?function(glsShaderRenderCase.ShaderEvalContext)} evalFunc
     */
    glsShaderRenderCase.ShaderEvaluator = function (evalFunc) {
        /** @type {?function(glsShaderRenderCase.ShaderEvalContext)} */this.m_evalFunc = evalFunc;
    };

    /**
     * @param {glsShaderRenderCase.QuadGrid} quadGrid_
     * @constructor
     */
    glsShaderRenderCase.ShaderEvalContext = function (quadGrid_) {
        this.constCoords = quadGrid_.getConstCoords();
        this.isDiscarded = false;
        this quadGrid = quadGrid_;

        var bindings = quadGrid.getTextures();

        DE_ASSERT(bindings.length <= MAX_TEXTURES);

    	// Fill in texture array.
    	for (var ndx = 0; ndx < bindings.length; ndx++) {
    		var binding = bindings[ndx];

    		if (binding.getType() == glsShaderRenderCase.TextureBinding.Type.TYPE_NONE)
    			continue;

    		textures[ndx].sampler = binding.getSampler();

    		switch (binding.getType()){
    			case glsShaderRenderCase.TextureBinding.Type.TYPE_2D: textures[ndx].tex2D = binding.get2D().getRefTexture(); break;
    			case glsShaderRenderCase.TextureBinding.Type.TYPE_CUBE_MAP: textures[ndx].texCube = binding.getCube().getRefTexture(); break;
    			case glsShaderRenderCase.TextureBinding.Type.TYPE_2D_ARRAY: textures[ndx].tex2DArray = binding.get2DArray().getRefTexture(); break;
    			case glsShaderRenderCase.TextureBinding.Type.TYPE_3D: textures[ndx].tex3D = binding.get3D().getRefTexture(); break;
    			default:
                    throw new Error ('Invalid texture type');
    				DE_ASSERT(DE_FALSE);
    		}
    	}
    };
});
