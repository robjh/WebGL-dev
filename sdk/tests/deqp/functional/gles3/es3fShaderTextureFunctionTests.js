/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL ES Utilities
 * ------------------------------------------------
 *
 * Copyright 2014 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

'use strict';
goog.provide('functional.gles3.es3fShaderTextureFunctionTests');
goog.require('framework.common.tcuMatrix');
goog.require('framework.common.tcuTestCase');
goog.require('framework.opengl.gluTexture');
goog.require('modules.shared.glsShaderRenderCase');

goog.scope(function() {
	var es3fShaderTextureFunctionTests = functional.gles3.es3fShaderTextureFunctionTests;
    var tcuTestCase = framework.common.tcuTestCase;
	var tcuMatrix = framework.common.tcuMatrix;
	var tcuTestCase = framework.common.tcuTestCase;
	var gluTexture = framework.opengl.gluTexture;
	var glsShaderRenderCase = modules.shared.glsShaderRenderCase;

	var tcuTexture;
	var gluTextureUtil;
	var tcuTextureUtil;
	var gluShaderProgram;

	/**
	 * @enum
	 */
	es3fShaderTextureFunctionTests.Function = {
		TEXTURE: 0, //!< texture(), textureOffset()
		TEXTUREPROJ: 1, //!< textureProj(), textureProjOffset()
		TEXTUREPROJ3: 2, //!< textureProj(sampler2D, vec3)
		TEXTURELOD: 3, // ...
		TEXTUREPROJLOD: 4,
		TEXTUREPROJLOD3: 5, //!< textureProjLod(sampler2D, vec3)
		TEXTUREGRAD: 6,
		TEXTUREPROJGRAD: 7,
		TEXTUREPROJGRAD3: 8, //!< textureProjGrad(sampler2D, vec3)
		TEXELFETCH: 9
	};

	/**
	 * @param {gluShaderProgram.shaderType} shaderType
	 * @param {es3fShaderTextureFunctionTests.Function} function_
	 * @return {boolean}
	 */
	es3fShaderTextureFunctionTests.functionHasAutoLod = function(shaderType, function_) {
		return shaderType === gluShaderProgram.shaderType.FRAGMENT &&
			(function_ === es3fShaderTextureFunctionTests.Function.TEXTURE ||
			function_ === es3fShaderTextureFunctionTests.Function.TEXTUREPROJ ||
			function_ === es3fShaderTextureFunctionTests.Function.TEXTUREPROJ3);
	};

	/**
	 * @param {es3fShaderTextureFunctionTests.Function} function_
	 * @return {boolean}
	 */
	es3fShaderTextureFunctionTests.functionHasProj = function(function_) {
		return function_ === es3fShaderTextureFunctionTests.Function.TEXTUREPROJ ||
		   function_ === es3fShaderTextureFunctionTests.Function.TEXTUREPROJ3 ||
		   function_ === es3fShaderTextureFunctionTests.Function.TEXTUREPROJLOD ||
		   function_ === es3fShaderTextureFunctionTests.Function.TEXTUREPROJGRAD ||
		   function_ === es3fShaderTextureFunctionTests.Function.TEXTUREPROJLOD3 ||
		   function_ === es3fShaderTextureFunctionTests.Function.TEXTUREPROJGRAD3;
	};

	/**
	 * @param {es3fShaderTextureFunctionTests.Function} function_
	 * @return {boolean}
	 */
	es3fShaderTextureFunctionTests.functionHasGrad = function(function_) {
		return function_ === es3fShaderTextureFunctionTests.TEXTUREGRAD ||
			function_ === es3fShaderTextureFunctionTests.TEXTUREPROJGRAD ||
		 	function_ === es3fShaderTextureFunctionTests.TEXTUREPROJGRAD3;
	};

	/**
	 * @param {es3fShaderTextureFunctionTests.Function} function_
	 * @return {boolean}
	 */
	es3fShaderTextureFunctionTests.functionHasLod = function(function_) {
		return function_ === es3fShaderTextureFunctionTests.Function.TEXTURELOD ||
			   function_ === es3fShaderTextureFunctionTests.Function.TEXTUREPROJLOD ||
			   function_ === es3fShaderTextureFunctionTests.Function.TEXTUREPROJLOD3 ||
			   function_ === es3fShaderTextureFunctionTests.Function.TEXELFETCH;
	};



	/**
	 * @struct
	 * @constructor
	 * @param {?es3fShaderTextureFunctionTests.Function=} func
	 * @param {Array<number>=} minCoord
	 * @param {Array<number>=} maxCoord
	 * @param {boolean=} useBias
	 * @param {number=} minLodBias
	 * @param {number=} maxLodBias
	 * @param {Array<number>=} minDX For *Grad* functions
	 * @param {Array<number>=} maxDX For *Grad* functions
	 * @param {Array<number>=} minDY For *Grad* functions
	 * @param {Array<number>=} maxDY For *Grad* functions
	 * @param {boolean=} useOffset
	 * @param {Array<number>=} offset
	 */
	es3fShaderTextureFunctionTests.TextureLookupSpec = function(func, minCoord, maxCoord, useBias, minLodBias, maxLodBias, minDX, maxDX, minDY, maxDY, useOffset, offset) {
		if (arguments.length === 12) {
			/** @type {?es3fShaderTextureFunctionTests.Function} */ this.func = func;
			/** @type {Array<number>} */ this.minCoord = minCoord;
			/** @type {Array<number>} */ this.maxCoord = maxCoord;
			// Bias
			/** @type {boolean} */ this.useBias = useBias;
			// Bias or Lod for *Lod* functions
			/** @type {number} */ this.minLodBias = minLodBias;
			/** @type {number} */ this.maxLodBias = maxLodBias;
			// For *Grad* functions
			/** @type {Array<number>} */ this.minDX = minDX;
			/** @type {Array<number>} */ this.maxDX = maxDX;
			/** @type {Array<number>} */ this.minDY = minDY;
			/** @type {Array<number>} */ this.maxDY = maxDY;
			/** @type {boolean} */ this.useOffset = useOffset;
			/** @type {Array<number>} */ this.offset = offset;
		} else {
			/** @type {?es3fShaderTextureFunctionTests.Function} */ this.func = null;
			/** @type {Array<number>} */ this.minCoord = [0.0, 0.0, 0.0, 0.0];
			/** @type {Array<number>} */ this.maxCoord = [1.0, 1.0, 1.0, 1.0];
			// Bias
			/** @type {boolean} */ this.useBias = false;
			// Bias or Lod for *Lod* functions
			/** @type {number} */ this.minLodBias = 0.0;
			/** @type {number} */ this.maxLodBias = 0.0;
			// For *Grad* functions
			/** @type {Array<number>} */ this.minDX = [0.0, 0.0, 0.0];
			/** @type {Array<number>} */ this.maxDX = [0.0, 0.0, 0.0];
			/** @type {Array<number>} */ this.minDY = [0.0, 0.0, 0.0];
			/** @type {Array<number>} */ this.maxDY = [0.0, 0.0, 0.0];
			/** @type {boolean} */ this.useOffset = false;
			/** @type {Array<number>} */ this.offset = [0, 0, 0];
		}
	};

	/**
	 * @enum
	 */
	es3fShaderTextureFunctionTests.TextureType = {
		TEXTURETYPE_2D: 0,
		TEXTURETYPE_CUBE_MAP: 1,
		TEXTURETYPE_2D_ARRAY: 2,
		TEXTURETYPE_3D: 3
	};

	/**
	 * @struct
	 * @constructor
	 * @param {?es3fShaderTextureFunctionTests.TextureType=} type
	 * @param {number=} format
	 * @param {number=} width
	 * @param {number=} height
	 * @param {number=} depth
	 * @param {number=} numLevels
	 * @param {?tcuSampler.Sampler=} sampler
	 */
	es3fShaderTextureFunctionTests.TextureSpec = function(type, format, width, height, depth, numLevels, sampler) {
		if (arguments.length === 7) {
			/** @type {?es3fShaderTextureFunctionTests.TextureType} */ this.type = type; //!< Texture type (2D, cubemap, ...)
			/** @type {number} */ this.format = format; //!< Internal format.
			/** @type {number} */ this.width = width;
			/** @type {number} */ this.height = height;
			/** @type {number} */ this.depth = depth;
			/** @type {number} */ this.numLevels = numLevels;
			/** @type {?tcuSampler.Sampler} */ this.sampler = sampler;
		} else {
			/** @type {?es3fShaderTextureFunctionTests.TextureType} */ this.type = null; //!< Texture type (2D, cubemap, ...)
			/** @type {number} */ this.format = gl.NONE; //!< Internal format.
			/** @type {number} */ this.width = 0;
			/** @type {number} */ this.height = 0;
			/** @type {number} */ this.depth = 0;
			/** @type {number} */ this.numLevels = 0;
			/** @type {?tcuSampler.Sampler} */ this.sampler = null;
		}
	};

	/**
	 * @struct
	 * @constructor
	 */
	es3fShaderTextureFunctionTests.TexLookupParams = function() {
		/** @type {number} */ var lod = 0;
		/** @type {Array<number>} */ var offset = [0, 0, 0];
		/** @type {Array<number>} */ var scale = [1.0, 1.0, 1.0, 1.0];
		/** @type {Array<number>} */ var bias = [0.0, 0.0, 0.0, 0.0];
	};

	/**
	 * @enum
	 */
	es3fShaderTextureFunctionTests.LodMode = {
		EXACT: 0,
		MIN_BOUND: 1,
		MAX_BOUND: 2
	};

	/** @const {es3fShaderTextureFunctionTests.LodMode} */ es3fShaderTextureFunctionTests.DEFAULT_LOD_MODE = es3fShaderTextureFunctionTests.EXACT;

	/**
	 * @param {number} dudx
	 * @param {number} dvdx
	 * @param {number} dudy
	 * @param {number} dvdy
	 * @return {number}
	 */
	es3fShaderTextureFunctionTests.computeLodFromDerivates_UV = function(dudx, dvdx, dudy, dvdy) {
		/** @type {es3fShaderTextureFunctionTests.LodMode} */ mode = es3fShaderTextureFunctionTests.LodMode.DEFAULT_LOD_MODE;
		/** @type {number} */ var p;

		switch (mode) {
			case es3fShaderTextureFunctionTests.LodMode.EXACT:
				p = Math.max(Math.abs(dudx * dudx + dvdx * dvdx), Math.abs(dudy * dudy + dvdy * dvdy));
				break;

			case es3fShaderTextureFunctionTests.LodMode.MIN_BOUND:
			case es3fShaderTextureFunctionTests.LodMode.MAX_BOUND:
				/** @type {number} */ var mu = Math.max(Math.abs(dudx), Math.abs(dudy));
				/** @type {number} */ var mv = Math.max(Math.abs(dvdx), Math.abs(dvdy));

				p = mode === es3fShaderTextureFunctionTests.LodMode.MIN_BOUND ? Math.max(mu, mv) : mu + mv;
				break;

			default:
				throw new Error('LOD_MODE not supported.');
		}

		return Math.log2(p);
	};

	/**
	 * @param {number} dudx
	 * @param {number} dvdx
	 * @param {number} dwdx
	 * @param {number} dudy
	 * @param {number} dvdy
	 * @param {number} dwdy
	 * @return {number}
	 */
	es3fShaderTextureFunctionTests.computeLodFromDerivates_UVW = function(dudx, dvdx, dwdx, dudy, dvdy, dwdy) {
		/** @type {es3fShaderTextureFunctionTests.LodMode} */ mode = es3fShaderTextureFunctionTests.LodMode.DEFAULT_LOD_MODE;
		/** @type {number} */ var p;

		switch (mode) {
			case es3fShaderTextureFunctionTests.LodMode.EXACT:
				p = Math.max(Math.sqrt(dudx * dudx + dvdx * dvdx + dwdx * dwdx), Math.sqrt(dudy * dudy + dvdy * dvdy + dwdy * dwdy));
				break;

			case es3fShaderTextureFunctionTests.LodMode.MIN_BOUND:
			case es3fShaderTextureFunctionTests.LodMode.MAX_BOUND:
				/** @type {number} */ var mu = Math.max(Math.abs(dudx), Math.abs(dudy));
				/** @type {number} */ var mv = Math.max(Math.abs(dvdx), Math.abs(dvdy));
				/** @type {number} */ var mw = Math.max(Math.abs(dwdx), Math.abs(dwdy));

				p = mode === es3fShaderTextureFunctionTests.LodMode.MIN_BOUND ? Math.max(mu, mv, mw) : (mu + mv + mw);
				break;

			default:
				throw new Error('LOD_MODE not supported.');
		}

		return Math.log2(p);
	};

	/**
	 * [dag] Wrapper function for computeLodFromDerivates_UV or computeLodFromDerivates_UVW
	 * @param {number} dudx
	 * @param {number} dvdx
	 * @param {number} dwdxOrdudy
	 * @param {number} dudyOrdvdy
	 * @param {number=} dvdy
	 * @param {number=} dwdy
	 * @return {number}
	 */
	es3fShaderTextureFunctionTests.computeLodFromDerivates = function(dudx, dvdx, dwdxOrdudy, dudyOrdvdy, dvdy, dwdy) {
		if (arguments.length === 4)
			return es3fShaderTextureFunctionTests.computeLodFromDerivates_UV(dudx, dvdx, dwdxOrdudy, dudyOrdvdy);
		else
			return es3fShaderTextureFunctionTests.computeLodFromDerivates(dudx, dvdx, dwdxOrdudy, dudyOrdvdy, dvdy, dwdy);
	};

   	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @return {number}
	 */
	es3fShaderTextureFunctionTests.computeLodFromGrad2D = function(c) {
		/** @type {number} */ var w = c.textures[0].tex2D.getWidth();
		/** @type {number} */ var h = c.textures[0].tex2D.getHeight();
		return es3fShaderTextureFunctionTests.computeLodFromDerivates(c.in[1][0] * w, c.in[1][1] * h, c.in[2][0] * w, c.in[2][1] * h);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @return {number}
	 */
	es3fShaderTextureFunctionTests.computeLodFromGrad2DArray = function(c) {
		/** @type {number} */ var w = c.textures[0].tex2DArray.getWidth();
		/** @type {number} */ var h = c.textures[0].tex2DArray.getHeight();
		return es3fShaderTextureFunctionTests.computeLodFromDerivates(c.in[1][0] * w, c.in[1][1] * h, c.in[2][0] * w, c.in[2][1] * h);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @return {number}
	 */
	es3fShaderTextureFunctionTests.computeLodFromGrad3D = function(c) {
		/** @type {number} */ var w = c.textures[0].tex3D.getWidth();
		/** @type {number} */ var h = c.textures[0].tex3D.getHeight();
		/** @type {number} */ var d = c.textures[0].tex3D.getDepth();
		return es3fShaderTextureFunctionTests.computeLodFromDerivates(c.in[1][0] * w, c.in[1][1] * h, c.in[1][2] * d, c.in[2][0] * w, c.in[2][1] * h, c.in[2][2] * d);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @return {number}
	 */
	es3fShaderTextureFunctionTests.computeLodFromGradCube = function(c) {
		// \note Major axis is always -Z or +Z
		/** @type {number} */ var m = Math.abs(c.in[0][2]);
		/** @type {number} */ var d = c.textures[0].texCube.getSize();
		/** @type {number} */ var s = d / (2.0 * m);
		/** @type {number} */ var t = d / (2.0 * m);
		return es3fShaderTextureFunctionTests.computeLodFromDerivates(c.in[1][0] * s, c.in[1][1] * t, c.in[2][0] * s, c.in[2][1] * t);
	};

	// TODO: some eval functions do not use the second argument, p. Depending on how the eval functions are used, the second argument might need to be made optional
	/** @typedef {function(glsShaderRenderCase.ShaderEvalContext, es3fShaderTextureFunctionTests.TexLookupParams)} */ es3fShaderTextureFunctionTests.TexEvalFunc;

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {number} s
	 * @param {number} t
	 * @param {number} lod
	 * @return {Array<number>}
	 */
	es3fShaderTextureFunctionTests.texture2D = function(c, s, t, lod) {
		return c.textures[0].tex2D.sample(c.textures[0].sampler, s, t, lod);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {number} s
	 * @param {number} t
	 * @param {number} r
	 * @param {number} lod
	 * @return {Array<number>}
	 */
	es3fShaderTextureFunctionTests.textureCube = function(c, s, t, r, lod) {
		return c.textures[0].texCube.sample(c.textures[0].sampler, s, t, r, lod);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {number} s
	 * @param {number} t
	 * @param {number} r
	 * @param {number} lod
	 * @return {Array<number>}
	 */
	es3fShaderTextureFunctionTests.texture2DArray = function(c, s, t, r, lod) {
		return c.textures[0].tex2DArray.sample(c.textures[0].sampler, s, t, r, lod);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {number} s
	 * @param {number} t
	 * @param {number} r
	 * @param {number} lod
	 * @return {Array<number>}
	 */
	es3fShaderTextureFunctionTests.texture3D = function(c, s, t, r, lod) {
		return c.textures[0].tex3D.sample(c.textures[0].sampler, s, t, r, lod);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {number} ref
	 * @param {number} s
	 * @param {number} t
	 * @param {number} lod
	 * @return {number}
	 */
	es3fShaderTextureFunctionTests.texture2DShadow = function(c, ref, s, t, lod) {
		return c.textures[0].tex2D.sampleCompare(c.textures[0].sampler, ref, s, t, lod);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {number} ref
	 * @param {number} s
	 * @param {number} t
	 * @param {number} r
	 * @param {number} lod
	 * @return {number}
	 */
	es3fShaderTextureFunctionTests.textureCubeShadow = function(c, ref, s, t, r, lod) {
		return c.textures[0].texCube.sampleCompare(c.textures[0].sampler, ref, s, t, r, lod);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {number} ref
	 * @param {number} s
	 * @param {number} t
	 * @param {number} r
	 * @param {number} lod
	 * @return {number}
	 */
	es3fShaderTextureFunctionTests.texture2DArrayShadow = function(c, ref, s, t, r, lod) {
		return c.textures[0].tex2DArray.sampleCompare(c.textures[0].sampler, ref, s, t, r, lod);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {number} s
	 * @param {number} t
	 * @param {number} lod
	 * @param {Array<number} offset
	 * @return {Array<number>}
	 */
	es3fShaderTextureFunctionTests.texture2DOffset = function(c, s, t, lod, offset) {
		return c.textures[0].tex2D.sampleOffset(c.textures[0].sampler, s, t, lod, offset);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {number} s
	 * @param {number} t
	 * @param {number} r
	 * @param {number} lod
	 * @param {Array<number} offset
	 * @return {Array<number>}
	 */
	es3fShaderTextureFunctionTests.texture2DArrayOffset = function(c, s, t, r, lod, offset) {
		return c.textures[0].tex2DArray.sampleOffset(c.textures[0].sampler, s, t, r, lod, offset);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {number} s
	 * @param {number} t
	 * @param {number} r
	 * @param {number} lod
	 * @param {Array<number} offset
	 * @return {Array<number>}
	 */
	es3fShaderTextureFunctionTests.texture3DOffset = function(c, s, t, r, lod, offset) {
		return c.textures[0].tex3D.sampleOffset(c.textures[0].sampler, s, t, r, lod, offset);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {number} ref
	 * @param {number} s
	 * @param {number} t
	 * @param {number} lod
	 * @param {Array<number} offset
	 * @return {number}
	 */
	es3fShaderTextureFunctionTests.texture2DShadowOffset = function(c, ref, s, t, lod, offset) {
		return c.textures[0].tex2D.sampleCompareOffset(c.textures[0].sampler, ref, s, t, lod, offset);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {number} ref
	 * @param {number} s
	 * @param {number} t
	 * @param {number} r
	 * @param {number} lod
	 * @param {Array<number} offset
	 * @return {number}
	 */
	es3fShaderTextureFunctionTests.texture2DArrayShadowOffset = function(c, ref, s, t, r, lod, offset) {
		return c.textures[0].tex2DArray.sampleCompareOffset(c.textures[0].sampler, ref, s, t, r, lod, offset);
	};

	// Eval functions.
	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2D = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2D(c, c.in[0][0], c.in[0][1], p.lod) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTextureCube = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.textureCube(c, c.in[0][0], c.in[0][1], c.in[0][2], p.lod) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DArray = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DArray(c, c.in[0][0], c.in[0][1], c.in[0][2], p.lod) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3D = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3D(c, c.in[0][0], c.in[0][1], c.in[0][2], p.lod) * p.scale + p.bias;
	};


	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DBias = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2D(c, c.in[0][0], c.in[0][1], p.lod+c.in[1][0]) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTextureCubeBias = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.textureCube(c, c.in[0][0], c.in[0][1], c.in[0][2], p.lod+c.in[1][0]) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DArrayBias = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DArray(c, c.in[0][0], c.in[0][1], c.in[0][2], p.lod+c.in[1][0]) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DBias = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3D(c, c.in[0][0], c.in[0][1], c.in[0][2], p.lod+c.in[1][0]) * p.scale + p.bias;
	};


	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProj3 = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2D(c, c.in[0][0]/c.in[0][2], c.in[0][1]/c.in[0][2], p.lod) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProj3Bias = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2D(c, c.in[0][0]/c.in[0][2], c.in[0][1]/c.in[0][2], p.lod+c.in[1][0]) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProj = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2D(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], p.lod) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProjBias = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2D(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], p.lod+c.in[1][0]) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DProj = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3D(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], c.in[0][2]/c.in[0][3], p.lod) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DProjBias = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3D(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], c.in[0][2]/c.in[0][3], p.lod+c.in[1][0]) * p.scale + p.bias;
	};


	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DLod = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2D(c, c.in[0][0], c.in[0][1], c.in[1][0]) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTextureCubeLod = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.textureCube(c, c.in[0][0], c.in[0][1], c.in[0][2], c.in[1][0]) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DArrayLod = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DArray(c, c.in[0][0], c.in[0][1], c.in[0][2], c.in[1][0]) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DLod = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3D(c, c.in[0][0], c.in[0][1], c.in[0][2], c.in[1][0]) * p.scale + p.bias;
	};


	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProjLod3 = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2D(c, c.in[0][0]/c.in[0][2], c.in[0][1]/c.in[0][2], c.in[1][0]) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProjLod = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2D(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], c.in[1][0]) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DProjLod = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3D(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], c.in[0][2]/c.in[0][3], c.in[1][0]) * p.scale + p.bias;
	};

	// Offset variants

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DOffset(c, c.in[0][0], c.in[0][1], p.lod, p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DArrayOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DArrayOffset(c, c.in[0][0], c.in[0][1], c.in[0][2], p.lod, p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3DOffset(c, c.in[0][0], c.in[0][1], c.in[0][2], p.lod, p.offset) * p.scale + p.bias;
	};


	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DOffsetBias = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DOffset(c, c.in[0][0], c.in[0][1], p.lod+c.in[1][0], p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DArrayOffsetBias = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DArrayOffset(c, c.in[0][0], c.in[0][1], c.in[0][2], p.lod+c.in[1][0], p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DOffsetBias = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3DOffset(c, c.in[0][0], c.in[0][1], c.in[0][2], p.lod+c.in[1][0], p.offset) * p.scale + p.bias;
	};


	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DLodOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DOffset(c, c.in[0][0], c.in[0][1], c.in[1][0], p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DArrayLodOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DArrayOffset(c, c.in[0][0], c.in[0][1], c.in[0][2], c.in[1][0], p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DLodOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3DOffset(c, c.in[0][0], c.in[0][1], c.in[0][2], c.in[1][0], p.offset) * p.scale + p.bias;
	};


	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProj3Offset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DOffset(c, c.in[0][0]/c.in[0][2], c.in[0][1]/c.in[0][2], p.lod, p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProj3OffsetBias = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DOffset(c, c.in[0][0]/c.in[0][2], c.in[0][1]/c.in[0][2], p.lod+c.in[1][0], p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProjOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DOffset(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], p.lod, p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProjOffsetBias = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DOffset(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], p.lod+c.in[1][0], p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DProjOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3DOffset(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], c.in[0][2]/c.in[0][3], p.lod, p.offset) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DProjOffsetBias = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3DOffset(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], c.in[0][2]/c.in[0][3], p.lod+c.in[1][0], p.offset) * p.scale + p.bias;
	};


	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProjLod3Offset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DOffset(c, c.in[0][0]/c.in[0][2], c.in[0][1]/c.in[0][2], c.in[1][0], p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProjLodOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DOffset(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], c.in[1][0], p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DProjLodOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3DOffset(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], c.in[0][2]/c.in[0][3], c.in[1][0], p.offset) * p.scale + p.bias;
	};

	// Shadow variants

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadow = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadow(c, c.in[0][2], c.in[0][0], c.in[0][1], p.lod);
	};
	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowBias = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadow(c, c.in[0][2], c.in[0][0], c.in[0][1], p.lod+c.in[1][0]);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTextureCubeShadow = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.textureCubeShadow(c, c.in[0][3], c.in[0][0], c.in[0][1], c.in[0][2], p.lod);
	};
	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTextureCubeShadowBias = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.textureCubeShadow(c, c.in[0][3], c.in[0][0], c.in[0][1], c.in[0][2], p.lod+c.in[1][0]);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DArrayShadow = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DArrayShadow(c, c.in[0][3], c.in[0][0], c.in[0][1], c.in[0][2], p.lod);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowLod = function(c) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadow(c, c.in[0][2], c.in[0][0], c.in[0][1], c.in[1][0]);
	};
	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowLodOffset = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadowOffset(c, c.in[0][2], c.in[0][0], c.in[0][1], c.in[1][0], p.offset.swizzle(0,1));
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowProj = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadow(c, c.in[0][2]/c.in[0][3], c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], p.lod);
	};
	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowProjBias = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadow(c, c.in[0][2]/c.in[0][3], c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], p.lod+c.in[1][0]);
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowProjLod = function(c) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadow(c, c.in[0][2]/c.in[0][3], c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], c.in[1][0]);
	};
	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowProjLodOffset = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadowOffset(c, c.in[0][2]/c.in[0][3], c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], c.in[1][0], p.offset.swizzle(0,1));
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowOffset = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadowOffset(c, c.in[0][2], c.in[0][0], c.in[0][1], p.lod, p.offset.swizzle(0,1));
	};
	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowOffsetBias = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadowOffset(c, c.in[0][2], c.in[0][0], c.in[0][1], p.lod+c.in[1][0], p.offset.swizzle(0,1));
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowProjOffset = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadowOffset(c, c.in[0][2]/c.in[0][3], c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], p.lod, p.offset.swizzle(0,1));
	};
	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowProjOffsetBias = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadowOffset(c, c.in[0][2]/c.in[0][3], c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], p.lod+c.in[1][0], p.offset.swizzle(0,1));
	};

	// Gradient variarts

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DGrad = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2D(c, c.in[0][0], c.in[0][1], es3fShaderTextureFunctionTests.computeLodFromGrad2D(c)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTextureCubeGrad = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.textureCube(c, c.in[0][0], c.in[0][1], c.in[0][2], es3fShaderTextureFunctionTests.computeLodFromGradCube(c)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DArrayGrad = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DArray(c, c.in[0][0], c.in[0][1], c.in[0][2], es3fShaderTextureFunctionTests.computeLodFromGrad2DArray(c)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DGrad = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3D(c, c.in[0][0], c.in[0][1], c.in[0][2], es3fShaderTextureFunctionTests.computeLodFromGrad3D(c)) * p.scale + p.bias;
	};


	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowGrad = function(c) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadow(c, c.in[0][2], c.in[0][0], c.in[0][1], es3fShaderTextureFunctionTests.computeLodFromGrad2D(c));
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTextureCubeShadowGrad = function(c) {
		c.color[0] = es3fShaderTextureFunctionTests.textureCubeShadow(c, c.in[0][3], c.in[0][0], c.in[0][1], c.in[0][2], es3fShaderTextureFunctionTests.computeLodFromGradCube(c));
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DArrayShadowGrad = function(c) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DArrayShadow(c, c.in[0][3], c.in[0][0], c.in[0][1], c.in[0][2], es3fShaderTextureFunctionTests.computeLodFromGrad2DArray(c));
	};


	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DGradOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DOffset(c, c.in[0][0], c.in[0][1], es3fShaderTextureFunctionTests.computeLodFromGrad2D(c), p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DArrayGradOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DArrayOffset(c, c.in[0][0], c.in[0][1], c.in[0][2], es3fShaderTextureFunctionTests.computeLodFromGrad2DArray(c), p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DGradOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3DOffset(c, c.in[0][0], c.in[0][1], c.in[0][2], es3fShaderTextureFunctionTests.computeLodFromGrad3D(c), p.offset) * p.scale + p.bias;
	};


	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowGradOffset = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadowOffset(c, c.in[0][2], c.in[0][0], c.in[0][1], es3fShaderTextureFunctionTests.computeLodFromGrad2D(c), p.offset.swizzle(0,1));
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DArrayShadowGradOffset = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DArrayShadowOffset(c, c.in[0][3], c.in[0][0], c.in[0][1], c.in[0][2], es3fShaderTextureFunctionTests.computeLodFromGrad2DArray(c), p.offset.swizzle(0,1));
	};


	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowProjGrad = function(c) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadow(c, c.in[0][2]/c.in[0][3], c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], es3fShaderTextureFunctionTests.computeLodFromGrad2D(c));
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DShadowProjGradOffset = function(c, p) {
		c.color[0] = es3fShaderTextureFunctionTests.texture2DShadowOffset(c, c.in[0][2]/c.in[0][3], c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], es3fShaderTextureFunctionTests.computeLodFromGrad2D(c), p.offset.swizzle(0,1));
	};


	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProjGrad3 = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2D(c, c.in[0][0]/c.in[0][2], c.in[0][1]/c.in[0][2], es3fShaderTextureFunctionTests.computeLodFromGrad2D(c)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProjGrad = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2D(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], es3fShaderTextureFunctionTests.computeLodFromGrad2D(c)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DProjGrad = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3D(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], c.in[0][2]/c.in[0][3], es3fShaderTextureFunctionTests.computeLodFromGrad3D(c)) * p.scale + p.bias;
	};


	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProjGrad3Offset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DOffset(c, c.in[0][0]/c.in[0][2], c.in[0][1]/c.in[0][2], es3fShaderTextureFunctionTests.computeLodFromGrad2D(c), p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture2DProjGradOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture2DOffset(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], es3fShaderTextureFunctionTests.computeLodFromGrad2D(c), p.offset.swizzle(0,1)) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexture3DProjGradOffset = function(c, p) {
		c.color = es3fShaderTextureFunctionTests.texture3DOffset(c, c.in[0][0]/c.in[0][3], c.in[0][1]/c.in[0][3], c.in[0][2]/c.in[0][3], es3fShaderTextureFunctionTests.computeLodFromGrad3D(c), p.offset) * p.scale + p.bias;
	};

	// Texel fetch variants
	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexelFetch2D = function(c, p) {
		/** @type {number} */ var x	= Math.floor(c.in[0][0]) + p.offset[0];
		/** @type {number} */ var y	= Math.floor(c.in[0][1]) + p.offset[1];
		/** @type {number} */ var lod = Math.floor(c.in[1][0]);
		c.color = c.textures[0].tex2D.getLevel(lod).getPixel(x, y) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexelFetch2DArray = function(c, p) {
		/** @type {number} */ var x	= Math.floor(c.in[0][0]) + p.offset[0];
		/** @type {number} */ var y	= Math.floor(c.in[0][1]) + p.offset[1];
		/** @type {number} */ var l	= Math.floor(c.in[0][2]);
		/** @type {number} */ var lod = Math.floor(c.in[1][0]);
		c.color = c.textures[0].tex2DArray.getLevel(lod).getPixel(x, y, l) * p.scale + p.bias;
	};

	/**
	 * @param {glsShaderRenderCase.ShaderEvalContext} c
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} p
	 */
	es3fShaderTextureFunctionTests.evalTexelFetch3D = function(c, p) {
		/** @type {number} */ var x	= Math.floor(c.in[0][0]) + p.offset[0];
		/** @type {number} */ var y	= Math.floor(c.in[0][1]) + p.offset[1];
		/** @type {number} */ var z	= Math.floor(c.in[0][2]) + p.offset[2];
		/** @type {number} */ var lod = Math.floor(c.in[1][0]);
		c.color = c.textures[0].tex3D.getLevel(lod).getPixel(x, y, z) * p.scale + p.bias;
	};

	/**
	 * @constructor
	 * @extends {glsShaderRenderCase.ShaderEvaluator}
	 * @param {es3fShaderTextureFunctionTests.TexEvalFunc} evalFunc
	 * @param {es3fShaderTextureFunctionTests.TexLookupParams} evalookupParamslFunc
	 */
	es3fShaderTextureFunctionTests.TexLookupEvaluator = function(evalFunc, lookupParams) {
		/** @type {es3fShaderTextureFunctionTests.TexEvalFunc} */ this.m_evalFunc = evalFunc;
		/** @type {es3fShaderTextureFunctionTests.TexLookupParams} */ this.m_lookupParams = lookupParams;
	};

	es3fShaderTextureFunctionTests.TexLookupEvaluator.prototype = Object.create(glsShaderRenderCase.ShaderEvaluator.prototype);
	es3fShaderTextureFunctionTests.TexLookupEvaluator.prototype.constructor = es3fShaderTextureFunctionTests.TexLookupEvaluator;

	/**
	 * @param  {glsShaderRenderCase.ShaderEvalContext} ctx
	 */
	es3fShaderTextureFunctionTests.TexLookupEvaluator.prototype.evaluate = function(ctx) {
		this.m_evalFunc(ctx, this.m_lookupParams);
	};

	/**
	 * @constructor
	 * @extends {glsShaderRenderCase.ShaderRenderCase}
	 * @param {string} name
	 * @param {string} desc
	 * @param {es3fShaderTextureFunctionTests.TextureLookupSpec} lookup
	 * @param {es3fShaderTextureFunctionTests.TextureSpec} texture
	 * @param {es3fShaderTextureFunctionTests.TexEvalFunc} evalFunc
	 * @param {boolean} isVertexCase
	 */
	es3fShaderTextureFunctionTests.ShaderTextureFunctionCase = function(name, desc, lookup, texture, evalFunc, isVertexCase) {
		// TODO: ShadeRenderCase takes this.m_evaluator. Should we construct the local evaluator first and pass it to the superclass?
		glsShaderRenderCase.ShaderRenderCase.call(this, name, desc, isVertexCase, null /*this.m_evaluator*/);

		/** @type {es3fShaderTextureFunctionTests.TextureLookupSpec} */ this.m_lookupSpec = lookup;
		/** @type {es3fShaderTextureFunctionTests.TextureSpec} */ this.m_textureSpec = texture;
		/** @type {es3fShaderTextureFunctionTests.TexLookupParams} */ this.m_lookupParams = new es3fShaderTextureFunctionTests.TexLookupParams();
		/** @type {es3fShaderTextureFunctionTests.TexLookupEvaluator} */ this.m_evaluator = new es3fShaderTextureFunctionTests.TexLookupEvaluator(evalFunc, this.m_lookupParams);

		/** @type {gluTexture.Texture2D} */ this.m_texture2D = null;
		/** @type {gluTexture.TextureCube} */ this.m_textureCube = null;
		/** @type {gluTexture.Texture2DArray} */ this.m_texture2DArray = null;
		/** @type {gluTexture.Texture3D} */ this.m_texture3D = null;
	};

	es3fShaderTextureFunctionTests.ShaderTextureFunctionCase.prototype = Object.create(glsShaderRenderCase.ShaderRenderCase.prototype);
	es3fShaderTextureFunctionTests.ShaderTextureFunctionCase.prototype.constructor = es3fShaderTextureFunctionTests.ShaderTextureFunctionCase;

	es3fShaderTextureFunctionTests.ShaderTextureFunctionCase.prototype.init = function() {

		// Base coord scale & bias
		/** @type {Array<number>} */ var s = this.m_lookupSpec.maxCoord - this.m_lookupSpec.minCoord;
		/** @type {Array<number>} */ var b = this.m_lookupSpec.minCoord;

		/** @type {Array<number>} */ var baseCoordTrans =[
			s[0], 0.0, 0.0, b[0],
			0.0, s[1], 0., b[1],
			s[2]/2.0, -s[2]/2.0, 0.0, s[2]/2.0 + b[2],
			-s[3]/2.0, s[3]/2.0, 0.0, s[3]/2.0 + b[3]
		];
		this.m_userAttribTransforms.push(tcuMatrix.matrixFromArray(4, 4, baseCoordTrans));

		/** @type {boolean} */ var hasLodBias	= es3fShaderTextureFunctionTests.functionHasLod(this.m_lookupSpec.function) || this.m_lookupSpec.useBias;
		/** @type {boolean} */ var isGrad		= es3fShaderTextureFunctionTests.functionHasGrad(this.m_lookupSpec.function);
		assertMsgOptions(!isGrad || !hasLodBias, 'Assert Error. expected: isGrad || hasLodBias === false', false, true);

		if (hasLodBias) {
			/** @type {number} */ var s = this.m_lookupSpec.maxLodBias - this.m_lookupSpec.minLodBias;
			/** @type {number} */ var b = this.m_lookupSpec.minLodBias;
			/** @type {Array<number>} */ var lodCoordTrans = [
				s/2.0, s/2.0, 0.0, b,
				0.0, 0.0, 0.0, 0.0,
				0.0, 0.0, 0.0, 0.0,
				0.0, 0.0, 0.0, 0.0
			];

			this.m_userAttribTransforms.push(tcuMatrix.matrixFromArray(4, 4, lodCoordTrans));
		}
		else if (isGrad) {
			/** @type {Array<number>} */ var sx = this.m_lookupSpec.maxDX - this.m_lookupSpec.minDX;
			/** @type {Array<number>} */ var sy = this.m_lookupSpec.maxDY - this.m_lookupSpec.minDY;
			/** @type {Array<number>} */ var gradDxTrans = [
				sx[0]/2.0, sx[0]/2.0, 0.0, this.m_lookupSpec.minDX[0],
				sx[1]/2.0, sx[1]/2.0, 0.0, this.m_lookupSpec.minDX[1],
				sx[2]/2.0, sx[2]/2.0, 0.0, this.m_lookupSpec.minDX[2],
				0.0, 0.0, 0.0, 0.0
			];
			/** @type {Array<number>} */ var gradDyTrans = [
				-sy[0]/2.0, -sy[0]/2.0, 0.0, this.m_lookupSpec.maxDY[0],
				-sy[1]/2.0, -sy[1]/2.0, 0.0, this.m_lookupSpec.maxDY[1],
				-sy[2]/2.0, -sy[2]/2.0, 0.0, this.m_lookupSpec.maxDY[2],
				0.0, 0.0, 0.0, 0.0
 			];

			this.m_userAttribTransforms.push(tcuMatrix.matrixFromArray(4, 4, gradDxTrans));
			this.m_userAttribTransforms.push(tcuMatrix.matrixFromArray(4, 4, gradDyTrans));
		}

		this.initShaderSources();
		this.initTexture();

		this.postinit();

	};

	es3fShaderTextureFunctionTests.ShaderTextureFunctionCase.prototype.initTexture = function() {
		/** @type {Array<number>} */ var texCubeSwz = [
			[0, 0, 1, 1],
			[1, 1, 0, 0],
			[0, 1, 0, 1],
			[1, 0, 1, 0],
			[0, 1, 1, 0],
			[1, 0, 0, 1]
		];

		assertMsgOptions(texCubeSwz.length === 6 /*tcu::CUBEFACE_LAST*/, 'Cube should have 6 faces.', false, true);

		/** @type {number} */ var levelStep;
		/** @type {Array<number>} */ var cScale;
		/** @type {Array<number>} */ var cBias;
		/** @type {number} */ var baseCellSize;

		/** @type {number} */ var fA;
		/** @type {number} */ var fB;
		/** @type {Array<number>} */ var colorA;
		/** @type {Array<number>} */ var colorB;

		/** @type {number} */ var dudx;
		/** @type {number} */ var dvdy;

		/** @type {tcuTexture.TextureFormat} */ var exFmt = gluTextureUtil.mapGLInternalFormat(this.m_textureSpec.format);
		/** @type {tcuTextureUtil.TextureFormatInfo} */ var fmtInfo = tcuTextureUtil.getTextureFormatInfo(texFmt);
		/** @type {Array<number>} */ var viewportSize = this.getViewportSize();
		/** @type {boolean} */ var isProj = es3fShaderTextureFunctionTests.functionHasProj(this.m_lookupSpec.function);
		/** @type {boolean} */ var isAutoLod = es3fShaderTextureFunctionTests.functionHasAutoLod(
			this.m_isVertexCase ? gluShaderProgram.shaderType.VERTEX : gluShaderProgram.shaderType.FRAGMENT,
			m_lookupSpec.function); // LOD can vary significantly
		/** @type {number} */ var proj = isProj ?
			1.0 / this.m_lookupSpec.minCoord[this.m_lookupSpec.function === es3fShaderTextureFunctionTests.Function.TEXTUREPROJ3 ? 2 : 3] :
			1.0;

		switch (this.m_textureSpec.type) {
			case es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_2D:
				levelStep = isAutoLod ? 0.0 : 1.0 / Math.max(1, this.m_textureSpec.numLevels - 1);
				cScale = fmtInfo.valueMax - fmtInfo.valueMin;
				cBias = fmtInfo.valueMin;
				baseCellSize = Math.min(this.m_textureSpec.width / 4, this.m_textureSpec.height / 4);

				this.m_texture2D = new gluTexture.Texture2D(gl, this.m_textureSpec.format, this.m_textureSpec.width, this.m_textureSpec.height);
				for (var level = 0; level < this.m_textureSpec.numLevels; level++) {
					fA = level * levelStep;
					fB = 1.0f - fA;
					colorA = cBias + cScale * [fA, fB, fA, fB];
					colorB = cBias + cScale * [fB, fA, fB, fA];

					this.m_texture2D.getRefTexture().allocLevel(level);
					tcuTextureUtil.fillWithGrid(this.m_texture2D.getRefTexture().getLevel(level), Math.max(1, baseCellSize >> level), colorA, colorB);
				}
				m_texture2D.upload();

				// Compute LOD.
				dudx = (this.m_lookupSpec.maxCoord[0] - this.m_lookupSpec.minCoord[0]) * proj * this.m_textureSpec.width / viewportSize[0];
				dvdy = (this.m_lookupSpec.maxCoord[1] - this.m_lookupSpec.minCoord[1]) * proj * this.m_textureSpec.height / viewportSize[1];
				this.m_lookupParams.lod = es3fShaderTextureFunctionTests.computeLodFromDerivates(dudx, 0.0, 0.0, dvdy);

				// Append to texture list.
				this.m_textures.push(new glsShaderRenderCase.TextureBinding(this.m_texture2D, this.m_textureSpec.sampler));
				break;

			case es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_CUBE_MAP:
				levelStep = isAutoLod ? 0.0 : 1.0 / Math.max(1, this.m_textureSpec.numLevels - 1);
				cScale = fmtInfo.valueMax - fmtInfo.valueMin;
				cBias = fmtInfo.valueMin;
				/** @type {Array<number>} */ var cCorner = cBias + cScale * 0.5;
				baseCellSize = Math.min(this.m_textureSpec.width / 4, this.m_textureSpec.height / 4);

				assertMsgOptions(this.m_textureSpec.width === this.m_textureSpec.height, 'Expected width === height', false, true);
				this.m_textureCube = new gluTexture.TextureCube(gl, this.m_textureSpec.format, this.m_textureSpec.width);
				for (var level = 0; level < this.m_textureSpec.numLevels; level++) {
					fA = level * levelStep;
					fB = 1.0 - fA;
					/** @type {Array<number>} */ var f = [fA, fB];

					for (var face = 0; face < 6 /*tcu::CUBEFACE_LAST*/; face++) {
						/** @type {Array<number>} */ var swzA	= texCubeSwz[face];
						/** @type {Array<number>} */ var swzB	= deMath.subtract([1, 1, 1, 1], swzA);
						colorA = cBias + cScale * f.swizzle(swzA[0], swzA[1], swzA[2], swzA[3]);
						colorB = cBias + cScale * f.swizzle(swzB[0], swzB[1], swzB[2], swzB[3]);

						this.m_textureCube.getRefTexture().allocLevel(face, level);

						/** @type {tcuTexture.PixelBufferAccess} */ var access = this.m_textureCube.getRefTexture().getLevelFace(level, face);
						/** @type {number} */ var lastPix = access.getWidth() - 1;

						tcuTextureUtil.fillWithGrid(access, Math.max(1, baseCellSize >> level), colorA, colorB);

						// Ensure all corners have identical colors in order to avoid dealing with ambiguous corner texel filtering
						access.setPixel(cCorner, 0, 0);
						access.setPixel(cCorner, 0, lastPix);
						access.setPixel(cCorner, lastPix, 0);
						access.setPixel(cCorner, lastPix, lastPix);
					}
				}
				this.m_textureCube.upload();

				// Compute LOD \note Assumes that only single side is accessed and R is constant major axis.
				assertMsgOptions(Math.abs(this.m_lookupSpec.minCoord[2] - this.m_lookupSpec.maxCoord[2]) < 0.005, 'Expected abs(minCoord-maxCoord) < 0.005', false, true);
				assertMsgOptions(Math.abs(this.m_lookupSpec.minCoord[0]) < Math.abs(this.m_lookupSpec.minCoord[2]) && Math.abs(this.m_lookupSpec.maxCoord[0]) < Math.abs(this.m_lookupSpec.minCoord[2]), 'Assert error: minCoord, maxCoord', false, true);
				assertMsgOptions(Math.abs(this.m_lookupSpec.minCoord[1]) < Math.abs(this.m_lookupSpec.minCoord[2]) && Math.abs(this.m_lookupSpec.maxCoord[1]) < Math.abs(this.m_lookupSpec.minCoord[2]), 'Assert error: minCoord, maxCoord', false, true);

				/** @type {tcuTexture.CubeFaceCoords} */ var c00 = tcuTexture.getCubeFaceCoords([this.m_lookupSpec.minCoord[0] * proj, this.m_lookupSpec.minCoord[1] * proj, this.m_lookupSpec.minCoord[2] * proj]);
				/** @type {tcuTexture.CubeFaceCoords} */ var c10 = tcuTexture.getCubeFaceCoords([this.m_lookupSpec.maxCoord[0] * proj, this.m_lookupSpec.minCoord[1] * proj, this.m_lookupSpec.minCoord[2] * proj]);
				/** @type {tcuTexture.CubeFaceCoords} */ var c01 = tcuTexture.getCubeFaceCoords([this.m_lookupSpec.minCoord[0] * proj, this.m_lookupSpec.maxCoord[1] * proj, this.m_lookupSpec.minCoord[2] * proj]);
				dudx = (c10.s - c00.s) * this.m_textureSpec.width / viewportSize[0];
				dvdy = (c01.t - c00.t) * this.m_textureSpec.height / viewportSize[1];

				this.m_lookupParams.lod = es3fShaderTextureFunctionTests.computeLodFromDerivates(dudx, 0.0, 0.0, dvdy);

				this.m_textures.push(new glsShaderRenderCase.TextureBinding(this.m_textureCube, this.m_textureSpec.sampler));
				break;

			case es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_2D_ARRAY:
				/** @type {number} */ var layerStep = 1.0 / this.m_textureSpec.depth;
				levelStep = isAutoLod ? 0.0 : 1.0 / Math.max(1, this.m_textureSpec.numLevels - 1) * this.m_textureSpec.depth;
				cScale = fmtInfo.valueMax - fmtInfo.valueMin;
				cBias = fmtInfo.valueMin;
				baseCellSize = Math.min(this.m_textureSpec.width / 4, this.m_textureSpec.height / 4);

				this.m_texture2DArray = new gluTexture.Texture2DArray(gl, this.m_textureSpec.format, this.m_textureSpec.width, this.m_textureSpec.height, this.m_textureSpec.depth);
				for (var level = 0; level < this.m_textureSpec.numLevels; level++) {
					this.m_texture2DArray.getRefTexture().allocLevel(level);
					/** @type {tcuTexture.PixelBufferAccess} */ var levelAccess = this.m_texture2DArray.getRefTexture().getLevel(level);

					for (var layer = 0; layer < levelAccess.getDepth(); layer++) {
						fA = layer * layerStep + level * levelStep;
						fB = 1.0 - fA;
						colorA = cBias + cScale * [fA, fB, fA, fB];
						colorB = cBias + cScale * [fB, fA, fB, fA];

						tcuTextureUtil.fillWithGrid(tcuTextureUtil.getSubregion(levelAccess, 0, 0, layer, levelAccess.getWidth(), levelAccess.getHeight(), 1), Math.max(1, baseCellSize >> level), colorA, colorB);
					}
				}
				this.m_texture2DArray.upload();

				// Compute LOD.
				dudx = (this.m_lookupSpec.maxCoord[0] - this.m_lookupSpec.minCoord[0]) * proj * this.m_textureSpec.width / viewportSize[0];
				dvdy = (this.m_lookupSpec.maxCoord[1] - this.m_lookupSpec.minCoord[1]) * proj * this.m_textureSpec.height / viewportSize[1];
				this.m_lookupParams.lod = es3fShaderTextureFunctionTests.computeLodFromDerivates(dudx, 0.0, 0.0, dvdy);

				// Append to texture list.
				this.m_textures.push(new glsShaderRenderCase.TextureBinding.TextureBinding(this.m_texture2DArray, this.m_textureSpec.sampler));
				break;

			case es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_3D:
				levelStep = isAutoLod ? 0.0 : 1.0 / Math.max(1, this.m_textureSpec.numLevels - 1);
				cScale = fmtInfo.valueMax - fmtInfo.valueMin;
				cBias = fmtInfo.valueMin;
				baseCellSize = Math.min(this.m_textureSpec.width / 2, this.m_textureSpec.height / 2, this.m_textureSpec.depth / 2);

				this.m_texture3D = new gluTexture.Texture3D(gl, this.m_textureSpec.format, this.m_textureSpec.width, this.m_textureSpec.height, this.m_textureSpec.depth);
				for (var level = 0; level < this.m_textureSpec.numLevels; level++) {
					fA = level * levelStep;
					fB = 1.0 - fA;
					colorA = cBias + cScale * [fA, fB, fA, fB];
					colorB = cBias + cScale * [fB, fA, fB, fA];

					this.m_texture3D.getRefTexture().allocLevel(level);
					tcuTextureUtil.fillWithGri(this.m_texture3D0getRefTexture().getLevel(level), Math.max(1, baseCellSize >> level), colorA, colorB);
				}
				this.m_texture3D.upload();

				// Compute LOD.
				dudx = (this.m_lookupSpec.maxCoord[0] - this.m_lookupSpec.minCoord[0]) * proj * this.m_textureSpec.width / viewportSize[0];
				dvdy = (this.m_lookupSpec.maxCoord[1] - this.m_lookupSpec.minCoord[1]) * proj * this.m_textureSpec.height / viewportSize[1];
				/** @type {number} */ var dwdx = (this.m_lookupSpec.maxCoord[2] - this.m_lookupSpec.minCoord[2]) * 0.5 * proj * this.m_textureSpec.depth / viewportSize[0];
				/** @type {number} */ var dwdy = (this.m_lookupSpec.maxCoord[2] - this.m_lookupSpec.minCoord[2]) * 0.5 * proj * this.m_textureSpec.depth / viewportSize[1];
				this.m_lookupParams.lod = es3fShaderTextureFunctionTests.computeLodFromDerivates(dudx, 0.0, dwdx, 0.0, dvdy, dwdy);

				// Append to texture list.
				this.m_textures.push(new glsShaderRenderCase.TextureBinding(this.m_texture3D, this.m_textureSpec.sampler));
				break;

			default:
				throw new Error('Texture type not supported.');
		}

		// Set lookup scale & bias
		this.m_lookupParams.scale = fmtInfo.lookupScale;
		this.m_lookupParams.bias = fmtInfo.lookupBias;
		this.m_lookupParams.offset = this.m_lookupSpec.offset;
	};

	es3fShaderTextureFunctionTests.ShaderTextureFunctionCase.prototype.initShaderSources = function() {
		/** @type {es3fShaderTextureFunctionTests.Function} */ var function_ = this.m_lookupSpec.function;
		/** @type {boolean} */ var isVtxCase = this.m_isVertexCase;
		/** @type {boolean} */ var isProj = functionHasProj(function_);
		/** @type {boolean} */ var isGrad = functionHasGrad(function_);
		/** @type {boolean} */ var isShadow = this.m_textureSpec.sampler.compare !== tcuTexture.CompareMode.COMPAREMODE_NONE;
		/** @type {boolean} */ var is2DProj4 = !isShadow && this.m_textureSpec.type === es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_2D && (function_ === es3fShaderTextureFunctionTests.Function.TEXTUREPROJ || function === es3fShaderTextureFunctionTests.Function .TEXTUREPROJLOD || function === es3fShaderTextureFunctionTests.Function .
		/** @type {boolean} */ var isIntCoord = function_ === es3fShaderTextureFunctionTests.Function.
		/** @type {boolean} */ var hasLodBias = functionHasLod(this.m_lookupSpec.function) || this.m_lookupSpec.useBias;
		/** @type {number} */ var texCoordComps = this.m_textureSpec.type === es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_2D ? 2 : 3;
		/** @type {number} */ var extraCoordComps = (isProj ? (is2DProj4 ? 2 : 1) : 0) + (isShadow ? 1 : 0);
		/** @type {gluShaderUtil.DataType} */ var coordType = gluShaderUtil.getDataTypeVector(gluShaderUtil.DataType.FLOAT, texCoordComps+extraCoordComps);
		/** @type {gluShaderUtil.precision} */ var coordPrec = gluShaderUtil.precision.PRECISION_HIGHP;
		/** @type {string} */ var coordTypeName = gluShaderUtil.getDataTypeName(coordType);
		/** @type {string} */ var coordPrecName = gluShaderUtil.getPrecisionName(coordPrec);
		/** @type {tcuTexture.TextureFormat} */ var exFmt = gluTextureUtil.mapGLInternalFormat(this.m_textureSpec.format);
		/** @type {?gluShaderUtil.DataType} */ var samplerType = null;
		/** @type {gluShaderUtil.DataType} */ var gradType = (this.m_textureSpec.type === es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_CUBE_MAP || this.m_textureSpec.type === es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_3D) ? gluShaderUtil.DataType.FLOAT_VEC3 : gluShaderUtil.DataType.FLOAT_VEC2;
		/** @type {string} */ var gradTypeName = gluShaderUtil.getDataTypeName(gradType);
		/** @type {string} */ var baseFuncName = '';

		assertMsgOptions(!isGrad || !hasLodBias, 'Expected !isGrad || !hasLodBias', false, true);

		switch (this.m_textureSpec.type) {
			case es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_2D:
				samplerType = isShadow ? gluShaderUtil.DataType.SAMPLER_2D_SHADOW : gluTextureUtil.getSampler2DType(texFmt);
				break;
			case es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_CUBE_MAP:
				samplerType = isShadow ? gluShaderUtil.DataType.SAMPLER_CUBE_SHADOW : gluTextureUtil.getSamplerCubeType(texFmt);
				break;
			case es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_2D_ARRAY:
				samplerType = isShadow ? gluShaderUtil.DataType.SAMPLER_2D_ARRAY_SHADOW : gluTextureUtil.getSampler2DArrayType(texFmt);
				break;
			case es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_3D:
				assertMsgOptions(!isShadow, 'Expected !isShadow', false, true);
				samplerType = gluTextureUtil.getSampler3DType(texFmt);
				break;
			default:
				throw new Error('Unexpected type.');
		}

		switch (this.m_lookupSpec.function)
		{
			case es3fShaderTextureFunctionTests.Function.TEXTURE: baseFuncName = "texture"; break;
			case es3fShaderTextureFunctionTests.Function.TEXTUREPROJ: baseFuncName = "textureProj"; break;
			case es3fShaderTextureFunctionTests.Function.TEXTUREPROJ3: baseFuncName = "textureProj"; break;
			case es3fShaderTextureFunctionTests.Function.TEXTURELOD: baseFuncName = "textureLod"; break;
			case es3fShaderTextureFunctionTests.Function.TEXTUREPROJLOD: baseFuncName = "textureProjLod"; break;
			case es3fShaderTextureFunctionTests.Function.TEXTUREPROJLOD3: baseFuncName = "textureProjLod"; break;
			case es3fShaderTextureFunctionTests.Function.TEXTUREGRAD: baseFuncName = "textureGrad"; break;
			case es3fShaderTextureFunctionTests.Function.TEXTUREPROJGRAD: baseFuncName = "textureProjGrad"; break;
			case es3fShaderTextureFunctionTests.Function.TEXTUREPROJGRAD3: baseFuncName = "textureProjGrad"; break;
			case es3fShaderTextureFunctionTests.Function.TEXELFETCH: baseFuncName = "texelFetch"; break;
			default:
				throw new Error('Unexpected function.');
		}

		/** @type {string} */ var vert = '';
		/** @type {string} */ var frag = '';
		/** @type {string} */ var op = '';

		vert += "#version 300 es\n" +
			    "in highp vec4 a_position;\n" +
			    "in " + coordPrecName + " " + coordTypeName + " a_in0;\n";

		if (isGrad) {
			vert += "in " + coordPrecName + " " + gradTypeName + " a_in1;\n";
			vert += "in " + coordPrecName + " " + gradTypeName + " a_in2;\n";
		}
		else if (hasLodBias)
			vert += "in " + coordPrecName + " float a_in1;\n";

		frag += "#version 300 es\n" +
			    "layout(location = 0) out mediump vec4 o_color;\n";

		if (isVtxCase) {
			vert += "out mediump vec4 v_color;\n";
			frag += "in mediump vec4 v_color;\n";
		}
		else
		{
			vert += "out " + coordPrecName + " " + coordTypeName + " v_texCoord;\n";
			frag += "in " + coordPrecName + " " + coordTypeName + " v_texCoord;\n";

			if (isGrad) {
				vert += "out " + coordPrecName + " " + gradTypeName + " v_gradX;\n";
				vert += "out " + coordPrecName + " " + gradTypeName + " v_gradY;\n";
				frag += "in " + coordPrecName + " " + gradTypeName + " v_gradX;\n";
				frag += "in " + coordPrecName + " " + gradTypeName + " v_gradY;\n";
			}

			if (hasLodBias) {
				vert += "out " + coordPrecName + " float v_lodBias;\n";
				frag += "in " + coordPrecName + " float v_lodBias;\n";
			}
		}

		// Uniforms
		op += "uniform highp " + gluShaderUtil.getDataTypeName(samplerType) + " u_sampler;\n" +
		      "uniform highp vec4 u_scale;\n" +
		      "uniform highp vec4 u_bias;\n";

		vtx += isVtxCase ? op : '';
		frag += isVtxCase ? '' : op;
		op = '';

		vert += "\nvoid main()\n{\n" +
			    "\tgl_Position = a_position;\n";
		frag += "\nvoid main()\n{\n";

		if (isVtxCase)
			vert += "\tv_color = ";
		else
			frag += "\to_color = ";

		// Op.
		/** @type {string} */ var texCoord = isVtxCase ? "a_in0" : "v_texCoord";
		/** @type {string} */ var gradX = isVtxCase ? "a_in1" : "v_gradX";
		/** @type {string} */ var gradY = isVtxCase ? "a_in2" : "v_gradY";
		/** @type {string} */ var lodBias = isVtxCase ? "a_in1" : "v_lodBias";

		op += "vec4(" + baseFuncName;
		if (this.m_lookupSpec.useOffset)
			op += "Offset";
		op += "(u_sampler, ";

		if (isIntCoord)
			op += "ivec" + (texCoordComps+extraCoordComps) + "(";

		op += texCoord;

		if (isIntCoord)
			op += ")";

		if (isGrad)
			op += ", " + gradX + ", " + gradY;

		if (functionHasLod(function_)) {
			if (isIntCoord)
				op += ", int(" + lodBias + ")";
			else
				op += ", " + lodBias;
		}

		if (this.m_lookupSpec.useOffset) {
			/** @type {number} */ var offsetComps = this.m_textureSpec.type === es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_3D ? 3 : 2;

			op += ", ivec" + offsetComps + "(";
			for (var ndx = 0; ndx < offsetComps; ndx++) {
				if (ndx != 0)
					op += ", ";
				op += this.m_lookupSpec.offset[ndx];
			}
			op += ")";
		}

		if (this.m_lookupSpec.useBias)
			op += ", " + lodBias;

		op += ")";

		if (isShadow)
			op += ", 0.0, 0.0, 1.0)";
		else
			op += ")*u_scale + u_bias";

		op += ";\n";

		vtx += isVtxCase ? op : '';
		frag += isVtxCase ? '' : op;
		op = '';

		if (isVtxCase)
			frag += "\to_color = v_color;\n";
		else {
			vert += "\tv_texCoord = a_in0;\n";

			if (isGrad) {
				vert += "\tv_gradX = a_in1;\n";
				vert += "\tv_gradY = a_in2;\n";
			}
			else if (hasLodBias)
				vert += "\tv_lodBias = a_in1;\n";
		}

		vert += "}\n";
		frag += "}\n";

		this.m_vertShaderSource = vert;
		this.m_fragShaderSource = frag;
	};

	es3fShaderTextureFunctionTests.ShaderTextureFunctionCase.prototype.deinit = function() {
		this.m_program = null;
		this.m_texture2D = null;
		this.m_textureCube = null;
		this.m_texture2DArray = null;
		this.m_texture3D = null;
	};

	/**
	 * @param  {number} programID
	 * @param  {Array<number>} constCoords
	 */
	es3fShaderTextureFunctionTests.ShaderTextureFunctionCase.prototype.setupUniforms = function(programID, constCoords) {
		gl.uniform1i(gl.getUniformLocation(programID, "u_sampler"),	0);
		gl.uniform4fv(gl.getUniformLocation(programID, "u_scale"), 1, this.m_lookupParams.scale);
		gl.uniform4fv(gl.getUniformLocation(programID, "u_bias"), 1, this.m_lookupParams.bias);
	};


	/**
	 * @struct
	 * @param {Array<number>} textureSize
	 * @param {number} lod
	 * @param {number} lodBase
	 * @param {Array<number>} expectedSize
	 */
	es3fShaderTextureFunctionTests.TestSize = function(textureSize, lod, lodBase, expectedSize) {
		/** @type {Array<number>} */ this.textureSize = textureSize;
		/** @type {number} */ this.lod = lod;
		/** @type {number} */ this.lodBase = lodBase;
		/** @type {Array<number>} */ this.expectedSize = expectedSize;
	};

	/**
	 * @constructor
	 * @extends {tcuTestCase.DeqpTest}
	 * @type {string} name
	 * @type {string} desc
	 * @type {string} samplerType
	 * @type {es3fShaderTextureFunctionTests.TextureSpec} texture
	 * @type {boolean} isVertexCase
	 */
	es3fShaderTextureFunctionTests.TextureSizeCase = function(name, desc, samplerType, texture, isVertexCase) {
		tcuTestCase.DeqpTest.call(this, name, desc);
		/** @type {string} */ this.m_samplerTypeStr = samplerType;
		/** @type {es3fShaderTextureFunctionTests.TextureSpec} */ this.m_textureSpec = texture;
		/** @type {boolean} */ this.m_isVertexCase = isVertexCase;
		/** @type {boolean} */ this.m_has3DSize = texture.type === es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_3D || texture.type === es3fShaderTextureFunctionTests.TextureType.TEXTURETYPE_2D_ARRAY;
		/** @type {?gluShaderProgram.ShaderProgram} */ this.m_program = null;
		/** @type {number} */ this.m_iterationCounter = 0;
	};

	es3fShaderTextureFunctionTests.TextureSizeCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
	es3fShaderTextureFunctionTests.TextureSizeCase.prototype.constructor = es3fShaderTextureFunctionTests.TextureSizeCase;

	es3fShaderTextureFunctionTests.TextureSizeCase.prototype.deinit = function() {
		this.freeShader();
	};

	es3fShaderTextureFunctionTests.TextureSizeCase.prototype.iterate = function() {
		// const int currentIteration = m_iterationCounter++;
		// const TestSize testSizes[] =
		// {
		// 	{ tcu::IVec3(1, 2, 1),			1,		0,	tcu::IVec3(1, 1, 1)			},
		// 	{ tcu::IVec3(1, 2, 1),			0,		0,	tcu::IVec3(1, 2, 1)			},
		//
		// 	{ tcu::IVec3(1, 3, 2),			0,		0,	tcu::IVec3(1, 3, 2)			},
		// 	{ tcu::IVec3(1, 3, 2),			1,		0,	tcu::IVec3(1, 1, 1)			},
		//
		// 	{ tcu::IVec3(100, 31, 18),		0,		0,	tcu::IVec3(100, 31, 18)		},
		// 	{ tcu::IVec3(100, 31, 18),		1,		0,	tcu::IVec3(50, 15, 9)		},
		// 	{ tcu::IVec3(100, 31, 18),		2,		0,	tcu::IVec3(25, 7, 4)		},
		// 	{ tcu::IVec3(100, 31, 18),		3,		0,	tcu::IVec3(12, 3, 2)		},
		// 	{ tcu::IVec3(100, 31, 18),		4,		0,	tcu::IVec3(6, 1, 1)			},
		// 	{ tcu::IVec3(100, 31, 18),		5,		0,	tcu::IVec3(3, 1, 1)			},
		// 	{ tcu::IVec3(100, 31, 18),		6,		0,	tcu::IVec3(1, 1, 1)			},
		//
		// 	{ tcu::IVec3(100, 128, 32),		0,		0,	tcu::IVec3(100, 128, 32)	},
		// 	{ tcu::IVec3(100, 128, 32),		1,		0,	tcu::IVec3(50, 64, 16)		},
		// 	{ tcu::IVec3(100, 128, 32),		2,		0,	tcu::IVec3(25, 32, 8)		},
		// 	{ tcu::IVec3(100, 128, 32),		3,		0,	tcu::IVec3(12, 16, 4)		},
		// 	{ tcu::IVec3(100, 128, 32),		4,		0,	tcu::IVec3(6, 8, 2)			},
		// 	{ tcu::IVec3(100, 128, 32),		5,		0,	tcu::IVec3(3, 4, 1)			},
		// 	{ tcu::IVec3(100, 128, 32),		6,		0,	tcu::IVec3(1, 2, 1)			},
		// 	{ tcu::IVec3(100, 128, 32),		7,		0,	tcu::IVec3(1, 1, 1)			},
		//
		// 	// pow 2
		// 	{ tcu::IVec3(128, 64, 32),		0,		0,	tcu::IVec3(128, 64, 32)		},
		// 	{ tcu::IVec3(128, 64, 32),		1,		0,	tcu::IVec3(64, 32, 16)		},
		// 	{ tcu::IVec3(128, 64, 32),		2,		0,	tcu::IVec3(32, 16, 8)		},
		// 	{ tcu::IVec3(128, 64, 32),		3,		0,	tcu::IVec3(16, 8, 4)		},
		// 	{ tcu::IVec3(128, 64, 32),		4,		0,	tcu::IVec3(8, 4, 2)			},
		// 	{ tcu::IVec3(128, 64, 32),		5,		0,	tcu::IVec3(4, 2, 1)			},
		// 	{ tcu::IVec3(128, 64, 32),		6,		0,	tcu::IVec3(2, 1, 1)			},
		// 	{ tcu::IVec3(128, 64, 32),		7,		0,	tcu::IVec3(1, 1, 1)			},
		//
		// 	// w == h
		// 	{ tcu::IVec3(1, 1, 1),			0,		0,	tcu::IVec3(1, 1, 1)			},
		// 	{ tcu::IVec3(64, 64, 64),		0,		0,	tcu::IVec3(64, 64, 64)		},
		// 	{ tcu::IVec3(64, 64, 64),		1,		0,	tcu::IVec3(32, 32, 32)		},
		// 	{ tcu::IVec3(64, 64, 64),		2,		0,	tcu::IVec3(16, 16, 16)		},
		// 	{ tcu::IVec3(64, 64, 64),		3,		0,	tcu::IVec3(8, 8, 8)			},
		// 	{ tcu::IVec3(64, 64, 64),		4,		0,	tcu::IVec3(4, 4, 4)			},
		//
		// 	// with lod base
		// 	{ tcu::IVec3(100, 31, 18),		3,		1,	tcu::IVec3(6, 1, 1)			},
		// 	{ tcu::IVec3(128, 64, 32),		3,		1,	tcu::IVec3(8, 4, 2)			},
		// 	{ tcu::IVec3(64, 64, 64),		1,		1,	tcu::IVec3(16, 16, 16)		},
		//
		// };
		// const int lastIterationIndex = DE_LENGTH_OF_ARRAY(testSizes) + 1;
		//
		// if (currentIteration == 0)
		// {
		// 	m_testCtx.setTestResult(QP_TEST_RESULT_PASS, "Pass");
		// 	return initShader() ? CONTINUE : STOP;
		// }
		// else if (currentIteration == lastIterationIndex)
		// {
		// 	freeShader();
		// 	return STOP;
		// }
		// else
		// {
		// 	if (!testTextureSize(testSizes[currentIteration - 1]))
		// 		if (m_testCtx.getTestResult() != QP_TEST_RESULT_FAIL)
		// 			m_testCtx.setTestResult(QP_TEST_RESULT_FAIL, "Got unexpected texture size");
		// 	return CONTINUE;
		// }
	};

	/** @typedef {Array<string, es3fShaderTextureFunctionTests.TextureLookupSpec, es3fShaderTextureFunctionTests.TextureSpec, es3fShaderTextureFunctionTests.EvalFunc, es3fShaderTextureFunctionTests.CaseFlags>} */ es3fShaderTextureFunctionTests.TestSpec;

	/**
	 * @param {string} name
	 * @param {es3fShaderTextureFunctionTests.Function} func
	 * @param {Array<number>} minCoord
	 * @param {Array<number>} maxCoord
	 * @param {boolean} useBias
	 * @param {number} minLodBias
	 * @param {number} maxLodBias
	 * @param {boolean} useOffset
	 * @param {Array<number>} offset
	 * @param {es3fShaderTextureFunctionTests.TextureSpec} texSpec
	 * @param {es3fShaderTextureFunctionTests.EvalFunc} evalFunc
	 * @param {es3fShaderTextureFunctionTests.CaseFlags} flags
	 * @return {es3fShaderTextureFunctionTests.TestSpec}
	 */
	es3fShaderTextureFunctionTests.getCaseSpec = function(name, func, minCoord, maxCoord, useBias, minLodBias, maxLodBias, useOffset, offset, texSpec, evalFunc, flags) {
		return [name,
			es3fShaderTextureFunctionTests.TextureLookupSpec(func, minCoord, maxCoord, useBias, minLodBias, maxLodBias, [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], useOffset, offset),
			texSpec,
			evalFunc,
			flags];
	};

	/**
	 * @param {string} name
	 * @param {es3fShaderTextureFunctionTests.Function} func
	 * @param {Array<number>} minCoord
	 * @param {Array<number>} maxCoord
	 * @param {Array<number>} mindx
	 * @param {Array<number>} maxdx
	 * @param {Array<number>} mindy
	 * @param {Array<number>} maxdy
	 * @param {boolean} useOffset
	 * @param {Array<number>} offset
	 * @param {es3fShaderTextureFunctionTests.TextureSpec} texSpec
	 * @param {es3fShaderTextureFunctionTests.EvalFunc} evalFunc
	 * @param {es3fShaderTextureFunctionTests.CaseFlags} flags
	 * @return {es3fShaderTextureFunctionTests.TestSpec}
	 */
	es3fShaderTextureFunctionTests.getGradCaseSpec = function(name, func, minCoord, maxCoord, mindx, maxdx, mindy, maxdy, useOffset, offset, texSpec, evalFunc, flags) {
		return [name,
			es3fShaderTextureFunctionTests.TextureLookupSpec(func, minCoord, maxCoord, false, 0.0, 0.0, mindx, maxdx, mindy, maxdy, useOffset, offset),
			texSpec,
			evalFunc,
			flags];
	};

	/**
	 * @enum {number}
	 */
	es3fShaderTextureFunctionTests.CaseFlags = {
		VERTEX: 1,
		FRAGMENT: 2,
		BOTH: 3
	};

	/**
	 * @struct
	 * @constructor
	 * @param {string} name
	 * @param {es3fShaderTextureFunctionTests.TextureLookupSpec} lookupSpec
	 * @param {es3fShaderTextureFunctionTests.TextureSpec} texSpec
	 * @param {es3fShaderTextureFunctionTests.TexEvalFunc} evalFunc
	 * @param {number} flags
	 */
	es3fShaderTextureFunctionTests.TexFuncCaseSpec = function(name, lookupSpec, texSpec, evalFunc, flags) {
		/** @type {string} */ this.name = name;
		/** @type {es3fShaderTextureFunctionTests.TextureLookupSpec} */ this.lookupSpec = lookupSpec;
		/** @type {es3fShaderTextureFunctionTests.TextureSpec} */ this.texSpec = texSpec;
		/** @type {es3fShaderTextureFunctionTests.TexEvalFunc} */ this.evalFunc = evalFunc;
		/** @type {number} */ this.flags = flags;
	};

	/**
	 * @param  {tcuTestCase.DeqpTest} parent
	 * @param  {string} groupName
	 * @param  {string} groupDesc
	 * @param  {es3fShaderTextureFunctionTests.TexFuncCaseSpec} cases
	 * @param  {number} numCases
	 */
	es3fShaderTextureFunctionTests.createCaseGroup = function(parent, groupName, groupDesc, cases, numCases) {
		/** @type {tcuTestCase.DeqpTest} */ var group = tcuTestCase.newTest(groupName, groupDesc);
		parent.addChild(group);

		for (var ndx = 0; ndx < numCases; ndx++) {
			/** @type {string} */ var name = cases[ndx].name;
			if (cases[ndx].flags & es3fShaderTextureFunctionTests.CaseFlags.VERTEX)
				group->addChild(new es3fShaderTextureFunctionTests.ShaderTextureFunctionCase(name + "_vertex", "", cases[ndx].lookupSpec, cases[ndx].texSpec, cases[ndx].evalFunc, true));
			if (cases[ndx].flags & es3fShaderTextureFunctionTests.CaseFlags.FRAGMENT)
				group->addChild(new es3fShaderTextureFunctionTests.ShaderTextureFunctionCase(name + "_fragment", "", cases[ndx].lookupSpec, cases[ndx].texSpec, cases[ndx].evalFunc, false));
		}
	};

    /**
    * @constructor
    * @extends {tcuTestCase.DeqpTest}
    */
    es3fShaderTextureFunctionTests.ShaderTextureFunctionTests = function() {
        tcuTestCase.DeqpTest.call(this, 'texture_functions', 'Texture Access Function Tests');
    };

    es3fShaderTextureFunctionTests.ShaderTextureFunctionTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fShaderTextureFunctionTests.ShaderTextureFunctionTests.prototype.constructor = es3fShaderTextureFunctionTests.ShaderTextureFunctionTests;

    es3fShaderTextureFunctionTests.ShaderTextureFunctionTests.prototype.init = function() {

    };

    /**
    * Run test
    * @param {WebGL2RenderingContext} context
    */
    es3fShaderTextureFunctionTests.run = function(context) {
    	gl = context;
    	//Set up Test Root parameters
    	var state = tcuTestCase.runner;
    	state.setRoot(new es3fShaderTextureFunctionTests.ShaderTextureFunctionTests());

    	//Set up name and description of this test series.
    	setCurrentTestName(state.testCases.fullName());
    	description(state.testCases.getDescription());

    	try {
    		//Run test cases
    		tcuTestCase.runTestCases();
    	}
    	catch (err) {
    		testFailedOptions('Failed to es3fShaderTextureFunctionTests.run tests', false);
    		tcuTestCase.runner.terminate();
    	}
    };

});
