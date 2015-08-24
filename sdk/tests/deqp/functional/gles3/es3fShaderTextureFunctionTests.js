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
goog.require('framework.common.tcuTestCase');

goog.scope(function() {
	var es3fShaderTextureFunctionTests = functional.gles3.es3fShaderTextureFunctionTests;
    var tcuTestCase = framework.common.tcuTestCase;

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
	es3fShaderTextureFunctionTests.functionHasAutoLod = function(function_) {
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

	// NEXT: ShaderTextureFunctionCase

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
