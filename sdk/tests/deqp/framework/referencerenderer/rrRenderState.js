/*-------------------------------------------------------------------------
 * drawElements Quality Program Reference Renderer
 * -----------------------------------------------
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
 *//*!
 * \file
 * \brief Reference renderer render state.
 *//*--------------------------------------------------------------------*/
define(['framework/common/tcuTexture', 'framework/delibs/debase/deMath'
	,'framework/referencerenderer/rrMultisamplePixelBufferAccess', 'framework/referencerenderer/rrDefs'], 
	function(tcuTexture, deMath, rrMultisamplePixelBufferAccess, rrDefs) {

/**
 * Enum for HorizontalFill values.
 * @enum {number}
 */
var HorizontalFill =  {
	LEFT : 0,
	RIGHT : 1
};

/**
 * Enum for VerticalFill values.
 * @enum {number}
 */
var VerticalFill = {
	TOP : 0,
	BOTTOM : 1
};

/**
 * Enum for Winding values.
 * @enum {number}
 */
var Winding = {
	CCW : 0,
	CC : 1
};

/**
 * Enum for CullMode values.
 * @enum {number}
 */
var CullMode = {
	NONE : 0,
	BACK : 1,
	FRONT : 2
};

/**Winding : Winding,

 * @constructor
 */
var RasterizationState = function() {
    /** @type {number} */ this.winding 		= Winding.CCW;        
    /** @type {number} */ this.horizontalFill = HorizontalFill.LEFT;    
    /** @type {number} */ this.verticalFill 	= VerticalFill.BOTTOM;
};

/**
 * Enum for TestFunc values.
 * @enum {number}
 */
var TestFunc = {
	NEVER : 0,
	ALWAYS : 1,
	LESS : 2,
	LEQUAL : 3,
	GREATER : 4,
	GEQUAL : 5,
	EQUAL : 6,
	NOTEQUAL : 7
};

/**
 * Enum for StencilOp values.
 * @enum {number}
 */
var StencilOp = {
	KEEP : 0,
	ZERO : 1,
	REPLACE : 2,
	INCR : 3, //!< Increment with saturation.
	DECR : 4, //!< Decrement with saturation.
	INCR_WRAP : 5,
	DECR_WRAP : 6,
	INVERT : 7
};

/**
 * Enum for BlendMode values.
 * @enum {number}
 */
var BlendMode = {
	NONE : 0,		//!< No blending.
	STANDARD : 1,	//!< Standard blending.
	ADVANCED : 2		//!< Advanced blending mode, as defined in GL_KHR_blend_equation_advanced.
};

/**
 * Enum for BlendEquation values.
 * @enum {number}
 */
var BlendEquation = {
	ADD : 0,
	SUBTRACT : 1,
	REVERSE_SUBTRACT : 2,
	MIN : 3,
	MAX : 4
};

/**
 * Enum for BlendEquationAdvanced values.
 * @enum {number}
 */
var BlendEquationAdvanced = {
	MULTIPLY : 0,
	SCREEN : 1,
	OVERLAY	: 2,
	DARKEN : 3,
	LIGHTEN : 4,
	COLORDODGE : 5,
	COLORBURN : 6,
	HARDLIGHT : 7,
	SOFTLIGHT : 8,
	DIFFERENCE : 9,
	EXCLUSION : 10,
	HSL_HUE : 11,
	HSL_SATURATION : 12,
	HSL_COLOR : 13,
	HSL_LUMINOSITY : 14
};

/**
 * Enum for BlendFunc values.
 * @enum {number}
 */
var BlendFunc  = {
	ZERO : 0,
	ONE : 1,
	SRC_COLOR : 2,
	ONE_MINUS_SRC_COLOR : 3,
	DST_COLOR : 4,
	ONE_MINUS_DST_COLOR : 5,
	SRC_ALPHA : 6,
	ONE_MINUS_SRC_ALPHA : 7,
	DST_ALPHA : 8,
	ONE_MINUS_DST_ALPHA : 9,
	CONSTANT_COLOR : 10,
	ONE_MINUS_CONSTANT_COLOR : 11,
	CONSTANT_ALPHA : 12,
	ONE_MINUS_CONSTANT_ALPHA : 13,
	SRC_ALPHA_SATURATE : 14,
	SRC1_COLOR : 15,
	ONE_MINUS_SRC1_COLOR : 16,
	SRC1_ALPHA : 17,
	ONE_MINUS_SRC1_ALPHA : 18
};

/**
 * @constructor
 */
var StencilState = function() {
	/** @type {number} */ this.func = TestFunc.ALWAYS;
	/** @type {number} */ this.ref = 0;
	/** @type {number} */ this.compMask = ~0;
	/** @type {number} */ this.sFail = StencilOp.KEEP;
	/** @type {number} */ this.dpFail = StencilOp.KEEP;
	/** @type {number} */ this.dpPass = StencilOp.KEEP;
	/** @type {number} */ this.writeMask = ~0;
};

/**
 * @constructor
 */
var BlendState = function() {
	/** @type {number} */ this.equation = BlendEquation.ADD;
	/** @type {number} */ this.srcFunc = BlendFunc.ONE;
	/** @type {number} */ this.dstFunc = BlendFunc.ZERO;
};

/**
 * @param {number} left_
 * @param {number} bottom_
 * @param {number} width_
 * @param {number} height_
 * @constructor
 */
var WindowRectangle = function(left_, bottom_, width_, height_) {
	this.left = left_;
	this.bottom = bottom_;
	this.width = width_;
	this.height = height_;
};

/**
 * @constructor
 */
var FragmentOperationState = function() {
	/** @type {boolean} */ this.scissorTestEnabled	= false;
	/** @type {WindowRectangle} */ this.scissorRectangle = new WindowRectangle(0, 0, 1, 1);

	/** @type {boolean} */ this.stencilTestEnabled	= false;

	/** @type {StencilState} */ this.stencilStates = [];
    for (var type in rrDefs.FaceType)
        this.stencilStates[rrDefs.FaceType[type]] = new StencilState();	

	/** @type {boolean} */ this.depthTestEnabled = false;
	/** @type {TestFunc} */ this.depthFunc = TestFunc.LESS;
	/** @type {boolean} */ this.depthMask = true;

	/** @type {BlendMode} */ this.blendMode = BlendMode.NONE;
	/** @type {BlendState} */ this.blendRGBState = null;
	/** @type {BlendState} */ this.blendAState = null;
	/** @type {Array.<number>} */ this.blendColor	= [0.0, 0.0, 0.0, 0.0];
	/** @type {BlendEquationAdvanced} */ this.blendEquationAdvaced = null;

	/** @type {boolean} */ this.sRGBEnabled = true;

	/** @type {boolean} */ this.depthClampEnabled = false;

	/** @type {boolean} */ this.polygonOffsetEnabled = false;
	/** @type {number} */ this.polygonOffsetFactor = 0.0;
	/** @type {number} */ this.polygonOffsetUnits = 0.0;

	/** @type {Array.<boolean>} */ this.colorMask =[true,true,true,true];

	/** @type {number} */ this.numStencilBits	= 8;
};

/**
 * @constructor
 */
var PointState = function() {
	/** @type {number} */ this.pointSize = 1.0;
};

/**
 * @constructor
 */
var LineState = function() {
	/** @type {number} */ this.lineWidth = 1.0;
};

/**
 * Constructor checks if the parameter has a "raw" member to detect if the instance is
 * of type WindowRectangle or MultisamplePixelBufferAccess.
 * @param {WindowRectangle|rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess} rect_
 * @constructor
 */
var ViewportState = function(rect_) {
	/** @type {number} */ this.zn = 0.0;
	/** @type {number} */ this.zf = 1.0;

	if (rect_.raw) {
		this.rect = new WindowRectangle(0,0, rect_.raw().getHeight(), 
			rect_.raw().getDepth());
	} else {
		this.rect = rect_;
	}
};

/**
 * @constructor
 */
var RestartState = function() {
	/** @type {boolean} */ this.enabled = false;
	/** @type {number} */ this.restartIndex = 0xFFFFFFFF;
};

/**
 * @constructor
 * @param {ViewportState} viewport_
 */
var RenderState = function(viewport_) {
	/** @type {CullMode} */ this.cullMode = CullMode.NONE;
	/** @type {number} */ this.provokingVertexConvention;
	/** @type {ViewportState} */ this.viewport = viewport_;

	/** @type {RasterizationState} */ this.rasterization = new RasterizationState();
	/** @type {FragmentOperationState} */ this.fragOps = new FragmentOperationState();
	/** @type {PointState} */ this.point = new PointState();
	/** @type {LineState} */ this.line = new LineState();
	/** @type {RestartState} */ this.restart = new RestartState();
};

return {
	HorizontalFill : HorizontalFill,
	VerticalFill : VerticalFill,
	Winding : Winding,
	CullMode : CullMode,
	RasterizationState : RasterizationState,
	TestFunc : TestFunc,
	StencilOp : StencilOp,
	BlendMode :BlendMode,
	BlendEquation : BlendEquation,
	BlendEquationAdvanced : BlendEquationAdvanced,
	BlendFunc : BlendFunc,
	StencilState : StencilState,
	BlendState : BlendState,
	WindowRectangle : WindowRectangle,
	FragmentOperationState : FragmentOperationState,
	PointState : PointState,
	LineState : LineState,
	ViewportState : ViewportState,
	RestartState : RestartState,
	RenderState: RenderState
};

});