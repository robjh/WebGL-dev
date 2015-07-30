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
goog.provide('modules.shared.glsBuiltinPrecisionTests');
goog.require('framework.common.tcuTestCase');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.common.tcuInterval');
goog.require('framework.common.tcuFloatFormat');
goog.require('framework.delibs.debase.deRandom');
goog.require('modules.shared.glsShaderExecUtil');
goog.require('framework.opengl.simplereference.sglrGLContext');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.delibs.debase.deUtil');
goog.require('framework.opengl.gluVarType');
goog.require('framework.common.tcuMatrix');


goog.scope(function() {

    var glsBuiltinPrecisionTests = modules.shared.glsBuiltinPrecisionTests;
    var tcuTestCase = framework.common.tcuTestCase;
    var gluShaderProgram = framework.opengl.gluShaderProgram;
    var gluShaderUtil = framework.opengl.gluShaderUtil;
    var tcuInterval = framework.common.tcuInterval;
    var tcuFloatFormat = framework.common.tcuFloatFormat;
    var deRandom = framework.delibs.debase.deRandom;
    var glsShaderExecUtil = modules.shared.glsShaderExecUtil;
    var sglrGLContext = framework.opengl.simplereference.sglrGLContext;
    var deMath = framework.delibs.debase.deMath;
    var deUtil = framework.delibs.debase.deUtil;
    var gluVarType = framework.opengl.gluVarType;
    var tcuMatrix = framework.common.tcuMatrix;


    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

var setParentClass = function(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
};

/** @typedef {(tcuInterval.Interval|Array<tcuInterval.Interval>|tcuMatrix.Matrix)} */
glsBuiltinPrecisionTests.Intervals;

/** @typedef {(number|Array<number>|tcuMatrix.Matrix)} */
glsBuiltinPrecisionTests.Value;

/** @typedef {(!glsBuiltinPrecisionTests.Signature|string)} */
glsBuiltinPrecisionTests.Typename;


// public:
// 	Interval			roundOut		(const Interval& x, bool roundUnderOverflow) const;
// 	double				round			(double d, bool upward) const;
// 	double				roundOut		(double d, bool upward, bool roundUnderOverflow) const;
// 	Interval			convert			(const Interval& x) const;
//
// 	std::string			floatToHex		(double x) const;
// 	std::string 		intervalToHex	(const Interval& interval) const;
//
// 	static FloatFormat	nativeFloat		(void);
// 	static FloatFormat	nativeDouble	(void);


    /**
     TREE OF HERITAGE
     ---------- Signature
     Signature (struct)
        uses . Traits<>
            <void>
            <bool,float,int>
                ScalarTraits
            <Matrix<typename,Rows,Cols>,vector<typename,size>>
                ContainerTraits
        uses . Tuple4<>


     */

    /**
     * @param{number} value
     * @return {boolean}
     */
    glsBuiltinPrecisionTests.isFloat = function(value) {
        return value % 1 !== 0;
 	};

    /**
     * @constructor
     * @param{string} R
     * @param{string=} P0
     * @param{string=} P1
     * @param{string=} P2
     * @param{string=} P3
     */
    glsBuiltinPrecisionTests.Signature = function (R, P0, P1, P2, P3) {
        this.Ret = R;
        this.Arg0 = P0 === undefined ? 'void' : P0;
        this.Arg1 = P1 === undefined ? 'void' : P1;
        this.Arg2 = P2 === undefined ? 'void' : P2;
        this.Arg3 = P3 === undefined ? 'void' : P3;
    };

    /** @typedef {Array<glsBuiltinPrecisionTests.FuncBase>} */
    glsBuiltinPrecisionTests.FuncSet;

    /**
     * @constructor
     * @template T
     * @param{T} A0
     * @param{T} A1
     * @param{T} A2
     * @param{T} A3
     */
    glsBuiltinPrecisionTests.Tuple4 = function(A0, A1, A2, A3) {
        this.a = A0;
        this.b = A1;
        this.c = A2;
        this.d = A3;
    };

    /**
     * @typedef {!glsBuiltinPrecisionTests.Tuple4<string>}
     */
    glsBuiltinPrecisionTests.ParamNames;

    /**
     * Returns true for all other types except Void
     * @param{string} typename
     */
    glsBuiltinPrecisionTests.isTypeValid = function(typename) {
        if (typename === 'void')
            return false;
        return true;
    };


    /**
     * template <typename In>
     * Returns true for all other types except Void
     * @param{*} In
     * @return{number}
     */
    glsBuiltinPrecisionTests.numInputs = function(In) {
    	return (!glsBuiltinPrecisionTests.isTypeValid(In.In0) ? 0 :
    			!glsBuiltinPrecisionTests.isTypeValid(In.In1) ? 1 :
    			!glsBuiltinPrecisionTests.isTypeValid(In.In2) ? 2 :
    			!glsBuiltinPrecisionTests.isTypeValid(In.In3) ? 3 :
    			4);
    };

    /**
     * template <typename Out>
     * Returns true for all other types except Void
     * @param{*} Out
     * @return{number}
     */
    glsBuiltinPrecisionTests.numOutputs = function(Out) {
        return (!glsBuiltinPrecisionTests.isTypeValid(Out.Out0) ? 0 :
                !glsBuiltinPrecisionTests.isTypeValid(Out.Out1) ? 1 :
                2);
    };

    /**
     * template<typename In0_ = Void, typename In1_ = Void, typename In2_ = Void, typename In3_ = Void>
     * @constructor
     * @param{glsBuiltinPrecisionTests.Typename} In0_
     * @param{glsBuiltinPrecisionTests.Typename} In1_
     * @param{glsBuiltinPrecisionTests.Typename} In2_
     * @param{glsBuiltinPrecisionTests.Typename} In3_
     */
    glsBuiltinPrecisionTests.InTypes = function(In0_, In1_, In2_, In3_) {
        this.In0 = In0_ === undefined ? 'void' : In0_;
        this.In1 = In1_ === undefined ? 'void' : In1_;
        this.In2 = In2_ === undefined ? 'void' : In2_;
        this.In3 = In3_ === undefined ? 'void' : In3_;
    };

    /**
     * @constructor
     * @param{glsBuiltinPrecisionTests.Typename=} Out0_
     * @param{glsBuiltinPrecisionTests.Typename=} Out1_
     */
    glsBuiltinPrecisionTests.OutTypes = function(Out0_, Out1_) {
        this.Out0 = Out0_ === undefined ? 'void' : Out0_;
        this.Out1 = Out1_ === undefined ? 'void' : Out1_;
    };

    /**
     * @constructor
     */
    glsBuiltinPrecisionTests.Environment = function() {
        /** @type{Object} */ this.m_map = {};
    };

    /**
     * @param{glsBuiltinPrecisionTests.Variable} variable
     * @param{*} value
     */
    glsBuiltinPrecisionTests.Environment.prototype.bind = function(variable, value) {
        this.m_map[variable.getName()] = deUtil.clone(value);
    };

    /**
     * @param{*} variable
     * @return{glsBuiltinPrecisionTests.Intervals}
     */
    glsBuiltinPrecisionTests.Environment.prototype.lookup = function(variable) {
        if (variable instanceof glsBuiltinPrecisionTests.Variable)
    	   return this.m_map[variable.getName()];

        throw new Error('Invalid lookup input: ' + variable);
    };

    /**
     * @constructor
     * @param{tcuFloatFormat.FloatFormat} format_
     * @param{gluShaderUtil.precision} floatPrecision_
     * @param{glsBuiltinPrecisionTests.Environment} env_
     * @param{number=} callDepth_
     */
    glsBuiltinPrecisionTests.EvalContext = function (format_, floatPrecision_, env_, callDepth_) {
		this.format = format_;
		this.floatPrecision = floatPrecision_;
		this.env = env_;
		this.callDepth = callDepth_ === undefined ? 0 : callDepth_;
    };

    /**
     * @param{string} typename typename
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{glsBuiltinPrecisionTests.Intervals} value
     * @return{glsBuiltinPrecisionTests.Intervals}
     */
     glsBuiltinPrecisionTests.convert = function(typename, fmt, value) {
        var traits = glsBuiltinPrecisionTests.Traits.traitsFactory(typename);

        if (value instanceof Array) {
            var ret = [];
            for (var i = 0 ; i < value.length; i++)
                ret.push(traits.doConvert(fmt, value[i]));
            return ret;
        }

        if (value instanceof tcuMatrix.Matrix) {
            var ret = new tcuMatrix.Matrix(value.rows, value.cols);
            for (var i = 0 ; i < value.rows; i++)
                for (var j = 0 ; j < value.cols; j++)
                    ret.set(i, j, traits.doConvert(fmt, value.get(i,j)));
            return ret;
        }

        return traits.doConvert(fmt, value);
    };

    /**
     * Returns true if every element of `ival` contains the corresponding element of `value`.
     * @param{string} typename typename
     * @param{*} ival
     * @param{*} value
     * @return{boolean}
     */
     glsBuiltinPrecisionTests.contains = function(typename, ival, value) {
        var traits = glsBuiltinPrecisionTests.Traits.traitsFactory(typename);
        var contains = true;

        if (value instanceof Array) {
            for (var i = 0 ; i < value.length; i++)
                contains &= traits.doContains(ival[i], value[i]);
            return contains;
        }

        if (value instanceof tcuMatrix.Matrix) {
            for (var i = 0 ; i < value.rows; i++)
                for (var j = 0 ; j < value.cols; j++)
                    contains &= traits.doContains(ival.get(i,j), value.get(i,j));
            return contains;
        }

    	return traits.doContains(ival, value);
    };


    /**
     * @param{string} typename
     * @constructor
     */
    glsBuiltinPrecisionTests.Traits = function(typename) {
        this.typename = typename;
    };

    /**
     * @param{string=} typename
     */
    glsBuiltinPrecisionTests.Traits.traitsFactory = function(typename) {
        switch (typename) {
            case 'array' : return new glsBuiltinPrecisionTests.ContainerTraits('float');
            case 'boolean' : return new glsBuiltinPrecisionTests.TraitsBool();
            case 'float' :  case 'vec2' : case 'vec3' : case 'vec4' : 
            case 'mat2' : case 'mat2x3' : case 'mat2x4' :
            case 'mat3x2' : case 'mat3' : case 'mat3x4' :
            case 'mat4x2' : case 'mat4x3' : case 'mat4' :
                return new glsBuiltinPrecisionTests.TraitsFloat();
            case 'int' :  return new glsBuiltinPrecisionTests.TraitsInt();
            case 'void' :  return new glsBuiltinPrecisionTests.TraitsVoid();
            default: return null;
        }
    };

    glsBuiltinPrecisionTests.round = function(typename, fmt, value) {
        var traits = glsBuiltinPrecisionTests.Traits.traitsFactory(typename);

        if (value instanceof Array) {
            var ret = [];
            for (var i = 0 ; i < value.length; i++)
                ret.push(traits.doRound(fmt, value[i]));
            return ret;
        }

        if (value instanceof tcuMatrix.Matrix) {
            var ret = new tcuMatrix.Matrix(value.rows, value.cols);
            for (var i = 0 ; i < value.rows; i++)
                for (var j = 0 ; j < value.cols; j++)
                    ret.set(i, j, traits.doRound(fmt, value.get(i,j)));
            return ret;
        }

        return traits.doRound(fmt, value);
    };

    /**
     * cast the input typed array to correct type
     * @param {string} typename
     * @param{goog.TypedArray} input
     * @return{goog.TypedArray}
     */
    glsBuiltinPrecisionTests.cast = function(typename, input) {
        var traits = glsBuiltinPrecisionTests.Traits.traitsFactory(typename);
        return traits.doCast(input);
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Traits}
     */
    glsBuiltinPrecisionTests.TraitsVoid = function() {
        glsBuiltinPrecisionTests.Traits.call(this, 'void');
    };

    setParentClass(glsBuiltinPrecisionTests.TraitsVoid, glsBuiltinPrecisionTests.Traits);

    /**
     * @param{*} value
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.TraitsVoid.prototype.doMakeIVal = function(value) {
        return new tcuInterval.Interval();
    };
  
    /**
     * @param{*} value1
     * @param{*} value2
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.TraitsVoid.prototype.doUnion = function(value1, value2) {
        return new tcuInterval.Interval();
    };

    /**
     * @param{*} value
     * @return {boolean}
     */
    glsBuiltinPrecisionTests.TraitsVoid.prototype.doContains = function(value) {
        return true;
    };

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.TraitsVoid.prototype.doConvert = function(fmt, ival) {
        return new tcuInterval.Interval();
    };

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{*} ival
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.TraitsVoid.prototype.doRound = function(fmt, ival) {
        return new tcuInterval.Interval();
    };

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{*} ival
     */
    glsBuiltinPrecisionTests.TraitsVoid.prototype.doPrintIVal = function(fmt, ival) {
        return '()';
    };

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{*} value
     */
    glsBuiltinPrecisionTests.TraitsVoid.prototype.doPrintValue = function(fmt, value) {
        return '()';
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Traits}
     * @param{string} typename
     */
    glsBuiltinPrecisionTests.ScalarTraits = function(typename) {
        glsBuiltinPrecisionTests.Traits.call(this, typename);
        /** type{tcuInterval.Interval} */ this.iVal;
    };

    glsBuiltinPrecisionTests.ScalarTraits.prototype = Object.create(glsBuiltinPrecisionTests.Traits.prototype);
    glsBuiltinPrecisionTests.ScalarTraits.prototype.constructor = glsBuiltinPrecisionTests.ScalarTraits;

    /**
     * @param{*} value
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ScalarTraits.prototype.doMakeIVal = function(value) {
		// Thankfully all scalar types have a well-defined conversion to `double`,
		// hence Interval can represent their ranges without problems.
		return new tcuInterval.Interval(/** @type {number} */ (value));
	};

    /**
     * @param{tcuInterval.Interval} a
     * @param{tcuInterval.Interval} b
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ScalarTraits.prototype.doUnion	= function(a, b) {
		return a.operatorOrBinary(b);
	}

    /**
     * @param{tcuInterval.Interval} a
     * @param{number} value
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.ScalarTraits.prototype.doContains = function(a, value)	{
		return a.contains(new tcuInterval.Interval(value));
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ScalarTraits.prototype.doConvert = function(fmt, ival)	{
		return fmt.convert(ival);
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{number} value
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ScalarTraits.prototype.doRound	= function(fmt, value) {
		return fmt.roundOut(new tcuInterval.Interval(value), false);//TODO cast to double
	};



    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ScalarTraits}
     */
    glsBuiltinPrecisionTests.TraitsFloat = function() {
        glsBuiltinPrecisionTests.ScalarTraits.call(this, 'float');
    };

    glsBuiltinPrecisionTests.TraitsFloat.prototype = Object.create(glsBuiltinPrecisionTests.ScalarTraits.prototype);
    glsBuiltinPrecisionTests.TraitsFloat.prototype.constructor = glsBuiltinPrecisionTests.TraitsFloat;

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     */
    glsBuiltinPrecisionTests.TraitsFloat.prototype.doPrintIVal = function(fmt, ival) {
		return fmt.intervalToHex(ival);
	};

    /**
     * @param{goog.TypedArray} input
     * @return{goog.TypedArray}
     */
    glsBuiltinPrecisionTests.TraitsFloat.prototype.doCast = function(input) {
        return new Float32Array(input.buffer);
    };

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{number} value
     */
    glsBuiltinPrecisionTests.TraitsFloat.prototype.doPrintValue	= function(fmt, value) {
		return fmt.floatToHex(value);
	};

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ScalarTraits}
     */
    glsBuiltinPrecisionTests.TraitsBool = function() {
        glsBuiltinPrecisionTests.ScalarTraits.call(this, 'boolean');
    };

    glsBuiltinPrecisionTests.TraitsBool.prototype = Object.create(glsBuiltinPrecisionTests.ScalarTraits.prototype);
    glsBuiltinPrecisionTests.TraitsBool.prototype.constructor = glsBuiltinPrecisionTests.TraitsBool;

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     */
    glsBuiltinPrecisionTests.TraitsBool.prototype.doPrintIVal = function(fmt, ival) {
        /** type{string} */ var os = '{';
        var ifalse = new tcuInterval.Interval(0);
        var itrue = new tcuInterval.Interval(1);
		if (ival.contains(ifalse))
			os += 'false';
		if (ival.contains(ifalse) && ival.contains(itrue))
			os += ', ';
		if (ival.contains(itrue))
			os += 'true';
		os += '}';
        return os;
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{boolean} value
     */
    glsBuiltinPrecisionTests.TraitsBool.prototype.doPrintValue	= function(fmt, value) {
		return value ? 'true' : 'false';
	};



    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ScalarTraits}
     */
    glsBuiltinPrecisionTests.TraitsInt = function() {
        glsBuiltinPrecisionTests.ScalarTraits.call(this, 'int');
    };

    glsBuiltinPrecisionTests.TraitsInt.prototype = Object.create(glsBuiltinPrecisionTests.ScalarTraits.prototype);
    glsBuiltinPrecisionTests.TraitsInt.prototype.constructor = glsBuiltinPrecisionTests.TraitsInt;

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     */
    glsBuiltinPrecisionTests.TraitsInt.prototype.doPrintIVal = function(fmt, ival) {
		return '[' + (ival.lo()) + ', ' + (ival.hi()) + ']';
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{number} value
     */
    glsBuiltinPrecisionTests.TraitsInt.prototype.doPrintValue	= function(fmt, value) {
		return value.toString(10);
	};




    /**
     * Common traits for containers, i.e. vectors and matrices.
     * typename is the container type itself, I is the same type with interval elements.
     * template <typename typename, typename I>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Traits}
     * @param{string} elementType
     */
    glsBuiltinPrecisionTests.ContainerTraits = function(elementType) {
        glsBuiltinPrecisionTests.Traits.call(this, 'container');
        this.elementType = elementType;
        this.subTraits = glsBuiltinPrecisionTests.Traits.traitsFactory(elementType);
    };

    glsBuiltinPrecisionTests.ContainerTraits.prototype = Object.create(glsBuiltinPrecisionTests.Traits.prototype);
    glsBuiltinPrecisionTests.ContainerTraits.prototype.constructor = glsBuiltinPrecisionTests.ContainerTraits;

    // typedef typename	typename::Element		Element;
    // typedef				I				IVal;

    /**
     * @param{Array<number>} value can be a vector or matrix
     * @return{Array<*>}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doMakeIVal = function(value) {
    	/** @type{Array<*>}	*/ var ret = [];

		for (var ndx = 0; ndx < value.length; ++ndx)
			ret[ndx] = this.subTraits.doMakeIVal(value[ndx]);

		return ret;
	};

    /**
     * @param{Array<*>} a
     * @param{Array<*>} b
     * @return{Array<*>}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doUnion = function (a, b) {
    	/** @type{Array<*>}	*/ var ret = [];

		for (var ndx = 0; ndx < a.length; ++ndx)
			ret[ndx] = this.subTraits.doUnion(a[ndx], b[ndx]);

		return ret;
	};

    /**
     * @param{Array<*>} ival
     * @param{*} value
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doContains = function(ival, value) {
		for (var ndx = 0; ndx < value.length; ++ndx)
			if (!this.subTraits.doContains(ival[ndx], value[ndx]))
				return false;

		return true;
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<*>} ival
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doPrintIVal = function(fmt, ival) {
		/** @type{string} */ var os = '(';

		for (var ndx = 0; ndx < ival.length; ++ndx)	{
			if (ndx > 0)
				os += ', ';
			os += ival[ndx].doPrintIVal(fmt, ival[ndx]);
		}

		os += ')';
        return os;
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<*>} value
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doPrintValue	= function(fmt, value) {
		/** @type{string} */ var os = this.elementType + '(';

		for (var ndx = 0; ndx < value.length; ++ndx)
		{
			if (ndx > 0)
				os += ', ';

			os += value[ndx].doPrintValue(fmt, value[ndx]);
		}

		os += ')';
        return os;
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<*>} value
     * @return{Array<*>}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doConvert = function(fmt, value) {
		/** @type{Array<*>}	*/ var ret = [];

		for (var ndx = 0; ndx < value.length; ++ndx)
			ret[ndx] = this.subTraits.doConvert(fmt, value[ndx]);

		return ret;
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<*>} value
     * @return{Array<*>}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doRound = function(fmt, value) {
    	/** @type{Array<*>}	*/ var ret;

		for (var ndx = 0; ndx < value.length; ++ndx)
			ret[ndx] = this.subTraits.doRound(fmt, value[ndx]);

		return ret;
	};




    /**
     * This is needed for container-generic operations.
     * We want a scalar type typename to be its own "one-element vector".
     * @constructor
     * @param{*} typename typename
     */
    glsBuiltinPrecisionTests.ContainerOf = function(typename) {
        this.Container = typename;
    };

//     class ExprBase;
// class ExpandContext;
// class Statement;
// class StatementP;
// class FuncBase;

    /**
     * @constructor
     */
    glsBuiltinPrecisionTests.Statement = function() {

    };


    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     */
    glsBuiltinPrecisionTests.Statement.prototype.execute = function(ctx) {
        this.doExecute(ctx);
    };

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.Statement.prototype.print = function() {
        return this.doPrint();             
    };

    glsBuiltinPrecisionTests.Statement.prototype.toString = function() {
        return this.print();             
    };

    /**
     * Output the functions that this expression refers to
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     * 
     */
    glsBuiltinPrecisionTests.Statement.prototype.getUsedFuncs = function(dst) {
        this.doGetUsedFuncs(dst);
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     */
    glsBuiltinPrecisionTests.Statement.prototype.doExecute = function(ctx) {
        throw new Error('Virtual function. Please override.');
    };

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.Statement.prototype.doPrint = function() {
        throw new Error('Virtual function. Please override.');
    };

    /**
     * Output the functions that this expression refers to
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     * 
     */
    glsBuiltinPrecisionTests.Statement.prototype.doGetUsedFuncs = function(dst) {
        throw new Error('Virtual function. Please override.');
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.Statement}
     * @param {glsBuiltinPrecisionTests.Variable} variable
     * @param {glsBuiltinPrecisionTests.ApplyVar} value
     * @param {boolean} isDeclaration
     */
    glsBuiltinPrecisionTests.VariableStatement = function(variable, value, isDeclaration) {
        this.m_variable = variable;
        this.m_value = value;
        this.m_isDeclaration = isDeclaration;

    };

    setParentClass(glsBuiltinPrecisionTests.VariableStatement, glsBuiltinPrecisionTests.Statement);

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     */
    glsBuiltinPrecisionTests.VariableStatement.prototype.doExecute = function(ctx) {
        ctx.env.bind(this.m_variable, this.m_value.evaluate(ctx));
    };

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.VariableStatement.prototype.doPrint = function() {
        var v = this.m_variable;
        var os = '';
        if (this.m_isDeclaration)
            os += gluVarType.declareVariable(gluVarType.getVarTypeOf(v.typename),
                        v.getName());
        else
            os += v.getName();

        os += " = " + this.m_value.printExpr() + ";\n";

        return os;
    };

    /**
     * Output the functions that this expression refers to
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     * 
     */
    glsBuiltinPrecisionTests.VariableStatement.prototype.doGetUsedFuncs = function(dst) {
        this.m_value.getUsedFuncs(dst);
    };

    /**
     * @constructor
     * @param{*} typename
     */
    glsBuiltinPrecisionTests.ExprP = function(typename, size) {
        this.typename = typename;
    };

    /**
     * Common base class for all expressions regardless of their type.
     * @constructor
     */
    glsBuiltinPrecisionTests.ExprBase = function() {};

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.ExprBase.prototype.printExpr = function (){
        return this.doPrintExpr();
    };

    glsBuiltinPrecisionTests.ExprBase.prototype.toString = function () {
        return this.printExpr();
    };

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.ExprBase.prototype.doPrintExpr = function (){
        throw new Error('Virtual function. Please override.');
    };

    /**
     * Output the functions that this expression refers to
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     * 
     */
    glsBuiltinPrecisionTests.ExprBase.prototype.getUsedFuncs = function(/*FuncSet&*/ dst) {
        this.doGetUsedFuncs(dst);
    };

    /**
     * Output the functions that this expression refers to
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     * 
     */
    glsBuiltinPrecisionTests.ExprBase.prototype.doGetUsedFuncs = function(/*FuncSet&*/ dst) {
        throw new Error('Virtual function. Please override.');
    };

    /**
     * Type-specific operations for an expression representing type typename.
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ExprBase}
     * @param{glsBuiltinPrecisionTests.Typename} typename
     */
    glsBuiltinPrecisionTests.Expr = function(typename) {
        glsBuiltinPrecisionTests.ExprBase.call(this);
        this.typename = typename;
    };

    setParentClass(glsBuiltinPrecisionTests.Expr, glsBuiltinPrecisionTests.ExprBase);

    /**
     * Type-specific operations for an expression representing type typename.
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     */
    glsBuiltinPrecisionTests.Expr.prototype.evaluate = function(ctx) {
        return this.doEvaluate(ctx);
    };

    /**
     * Type-specific operations for an expression representing type typename.
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     */
    glsBuiltinPrecisionTests.Expr.prototype.doEvaluate = function(ctx) {
        throw new Error('Virtual function. Please override.');
    };



    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Expr}
     * @param{glsBuiltinPrecisionTests.Typename} typename
     * @param{string=} name
     */
    glsBuiltinPrecisionTests.Variable = function(typename, name) {
        glsBuiltinPrecisionTests.Expr.call(this, typename);
        /** @type {string} */ this.m_name = name || '<undefined>';
    };

    setParentClass(glsBuiltinPrecisionTests.Variable, glsBuiltinPrecisionTests.Expr);

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.Variable.prototype.getName = function() {
        return this.m_name;
    };

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.Variable.prototype.doPrintExpr = function() {
        return this.m_name;
    };

    glsBuiltinPrecisionTests.Variable.prototype.toString = function() {
        return this.doPrintExpr();
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @return{*}
     */
    glsBuiltinPrecisionTests.Variable.prototype.doEvaluate = function(ctx) {
        return ctx.env.lookup(this);
	};

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.Variable}
     * @param{*=} t
     */
    glsBuiltinPrecisionTests.Void = function(t) {
        glsBuiltinPrecisionTests.Variable.call(this, 'void');
        this.isVoid = true;
    };

    setParentClass(glsBuiltinPrecisionTests.Void, glsBuiltinPrecisionTests.Variable);

    glsBuiltinPrecisionTests.Void.prototype.doEvaluate = function(ctx) {
        return undefined;
    };


    /**
     * @constructor
     * @param{*} typename
     */
    glsBuiltinPrecisionTests.DefaultSampling = function(typename) {
        this.typename = typename;
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Expr}
     * @param{glsBuiltinPrecisionTests.Variable} vector
     * @param{number} index
     */
    glsBuiltinPrecisionTests.VectorVariable = function(vector, index) {
        glsBuiltinPrecisionTests.Expr.call(this, vector.typename);
        this.m_vector = vector;
        this.m_index = index;
    };

    setParentClass(glsBuiltinPrecisionTests.VectorVariable, glsBuiltinPrecisionTests.Expr);

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.VectorVariable.prototype.doEvaluate = function(ctx) {
        var tmp = this.m_vector.doEvaluate(ctx);
        return tmp[this.m_index];
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Expr}
     * @param {glsBuiltinPrecisionTests.Variable} matrix
     * @param {number} row
     * @param {number} col
     */
    glsBuiltinPrecisionTests.MatrixVariable = function(matrix, row, col) {
        glsBuiltinPrecisionTests.Expr.call(this, matrix.typename);
        this.m_matrix = matrix;
        this.m_row  = row;
        this.m_col = col;
    };

    setParentClass(glsBuiltinPrecisionTests.MatrixVariable, glsBuiltinPrecisionTests.Expr);

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.MatrixVariable.prototype.doEvaluate = function(ctx) {
        var tmp = this.m_matrix.doEvaluate(ctx);
        return tmp.get(this.m_row, this.m_col);
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.Expr}
     * @param {glsBuiltinPrecisionTests.Typename} typename
     * @param {glsBuiltinPrecisionTests.Func} func
     * @param {glsBuiltinPrecisionTests.Expr=} arg0
     * @param {glsBuiltinPrecisionTests.Expr=} arg1
     * @param {glsBuiltinPrecisionTests.Expr=} arg2
     * @param {glsBuiltinPrecisionTests.Expr=} arg3
     */
    glsBuiltinPrecisionTests.Apply = function(typename, func, arg0, arg1, arg2, arg3) {
        glsBuiltinPrecisionTests.Expr.call(this, typename);
        this.m_func = func;
        /** @type {glsBuiltinPrecisionTests.Tuple4} */ this.m_args;
        if (arg0 instanceof glsBuiltinPrecisionTests.Tuple4)
            this.m_args = /** @type {glsBuiltinPrecisionTests.Tuple4} */ (arg0);
        else {
            this.m_args = new glsBuiltinPrecisionTests.Tuple4(arg0 || new glsBuiltinPrecisionTests.Void(),
                                                              arg1 || new glsBuiltinPrecisionTests.Void(),
                                                              arg2 || new glsBuiltinPrecisionTests.Void(),
                                                              arg3 || new glsBuiltinPrecisionTests.Void());
        }
    };

    setParentClass(glsBuiltinPrecisionTests.Apply, glsBuiltinPrecisionTests.Expr);

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.Apply.prototype.doPrintExpr = function() {
        var args = [this.m_args.a, this.m_args.b, this.m_args.c, this.m_args.d];
        return this.m_func.print(args);
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @return{glsBuiltinPrecisionTests.Intervals}
     */    
    glsBuiltinPrecisionTests.Apply.prototype.doEvaluate = function(ctx) {
        return this.m_func.applyFunction(ctx,
                    this.m_args.a.evaluate(ctx), this.m_args.b.evaluate(ctx),
                    this.m_args.c.evaluate(ctx), this.m_args.d.evaluate(ctx));
    };

    /**
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     */
    glsBuiltinPrecisionTests.Apply.prototype.doGetUsedFuncs = function(dst) {
        this.m_func.getUsedFuncs(dst);
        this.m_args.a.getUsedFuncs(dst);
        this.m_args.b.getUsedFuncs(dst);
        this.m_args.c.getUsedFuncs(dst);
        this.m_args.d.getUsedFuncs(dst);
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.Apply}
     */
    glsBuiltinPrecisionTests.ApplyVar = function(typename, func, arg0, arg1, arg2, arg3) {
        glsBuiltinPrecisionTests.Apply.call(this, typename, func, arg0, arg1, arg2, arg3);
    };

    setParentClass(glsBuiltinPrecisionTests.ApplyVar, glsBuiltinPrecisionTests.Apply);

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @return{glsBuiltinPrecisionTests.Intervals}
     */    
    glsBuiltinPrecisionTests.ApplyVar.prototype.doEvaluate = function(ctx) {
        return this.m_func.applyFunction(ctx,
                    ctx.env.lookup(this.m_args.a), ctx.env.lookup(this.m_args.b),
                    ctx.env.lookup(this.m_args.c), ctx.env.lookup(this.m_args.d));
    };



    /***********************************************************************/
    /**

    ---------- Func classes -----------
    FuncBase

       Func
           PrimitiveFunc
               FloatFunc1
                   CFloatFunc1
                       TrigFunc
                           Sin, Cos
                       ArcTrigFunc
                           ASin, ACos, ATan
                       ExpFunc
                           Exp, Exp2
                       LogFunc
                           Log, Log2
                       PreciseFunc1
                           Abs, Sign, Floor, Trunc, RoundEven, Ceil,
                   InverseSqrt
                   Round
               FloatFunc2
                   InfixOperator
                       Add, Mul, Div, Sub
                   CFloatFunc2
                       ATan2
                       PreciseFunc2
                           Min, Max, Step
               FloatFunc3
                   Clamp
               Modf
           DerivedFunc
               DEFINE_DERIVED_FLOAT1 . Sqrt, Radians, Degrees, Tan, Sinh, Cosh,
                   Tanh, ASinh, ACosh, ATanh, Fract
               DEFINE_DERIVED_FLOAT2 . Pow, Mod,
               DEFINE_DERIVED_FLOAT3 . Mix
               (different extends)SmoothStep, Length, Distance, Dot, Cross, Normalize, FaceForward
                   Reflect, Refract,

               CompWiseFunc
                   CompMatFuncBase
                       CompMatFunc
                           MatrixCompMult
               OuterProduct
               Transpose
   Determinant
   Inverse
   */
    /**
     * @constructor
     */
    glsBuiltinPrecisionTests.FuncBase = function () {};

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.getName = function () {
        return '';
    };

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.getRequiredExtension = function() {
        return '';
    };

    /**
     * @param {Array<glsBuiltinPrecisionTests.ExprBase>} args
     * @return {string}
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.print = function (args) {
        return '';
    };

    /**
     * Index of output parameter, or -1 if none of the parameters is output.
     * @return{number}
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.getOutParamIndex = function () {
        return -1;
    };

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.printDefinition = function () {
	    return this.doPrintDefinition();
	};

    /**
     * @return {string}
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.doPrintDefinition = function () {
        throw new Error('Virtual function. Please override.');
    };

    /**
     * typedef set<const FuncBase*> FuncSet;
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.getUsedFuncs = function(dst) {
		this.doGetUsedFuncs(dst);
	};

    /**
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.doGetUsedFuncs = function(dst) {};

    /*************************************/
    /**
     * \brief Function objects.
     *
     * Each Func object represents a GLSL function. It can be applied to interval
     * arguments, and it returns the an interval that is a conservative
     * approximation of the image of the GLSL function over the argument
     * intervals. That is, it is given a set of possible arguments and it returns
     * the set of possible values.
     *
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FuncBase}
     * @param{glsBuiltinPrecisionTests.Signature} Sig_ template <typename Sig_>
     */
    glsBuiltinPrecisionTests.Func = function(Sig_) {
        glsBuiltinPrecisionTests.FuncBase.call(this);
    	this.Sig = Sig_;
    	this.Ret = this.Sig.Ret;
    	this.Arg0 = this.Sig.Arg0;
    	this.Arg1 = this.Sig.Arg1;
    	this.Arg2 = this.Sig.Arg2;
    	this.Arg3 = this.Sig.Arg3;
    };

    glsBuiltinPrecisionTests.Func.prototype = Object.create(glsBuiltinPrecisionTests.FuncBase.prototype);
    glsBuiltinPrecisionTests.Func.prototype.constructor = glsBuiltinPrecisionTests.Func;

    /**
     * @param{Array<glsBuiltinPrecisionTests.ExprBase>} args
     * @return {string}
     */
    glsBuiltinPrecisionTests.Func.prototype.print = function(args) {
	    return this.doPrint(args);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.Intervals=} Iarg0
     * @param{glsBuiltinPrecisionTests.Intervals=} Iarg1
     * @param{glsBuiltinPrecisionTests.Intervals=} Iarg2
     * @param{glsBuiltinPrecisionTests.Intervals=} Iarg3
     * @return{glsBuiltinPrecisionTests.Intervals}
     */
    glsBuiltinPrecisionTests.Func.prototype.applyFunction = function(ctx, Iarg0, Iarg1 ,Iarg2 ,Iarg3){
		return this.applyArgs(ctx, new glsBuiltinPrecisionTests.Tuple4(Iarg0, Iarg1, Iarg2, Iarg3));
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.Tuple4} args
     * @return{glsBuiltinPrecisionTests.Intervals}
     */
    glsBuiltinPrecisionTests.Func.prototype.applyArgs = function (ctx, args) {
		return this.doApply(ctx, args);
	};

    /**
     * @return{glsBuiltinPrecisionTests.ParamNames}
     */
    glsBuiltinPrecisionTests.Func.prototype.getParamNames = function() {
		return this.doGetParamNames();
	};

    // protected:
	// virtual IRet		doApply			(const EvalContext&, const IArgs&) const = 0;

    /**
     * @param{Array<glsBuiltinPrecisionTests.ExprBase>} args
     * @return {string}
     */
    glsBuiltinPrecisionTests.Func.prototype.doPrint = function (args) {
		/** type{string} */ var os = this.getName() + '(';

        // TODO: fix the generics
        for (var i = 0 ; i < args.length; i++) 
    		if (glsBuiltinPrecisionTests.isTypeValid(args[i].typename)) {
                if (i != 0)
                    os += ', ';
    			os += args[i];
            }

		os += ')';

        return os;
	};

    /**
     * @return{glsBuiltinPrecisionTests.ParamNames} args
     */
    glsBuiltinPrecisionTests.Func.prototype.doGetParamNames = function() {
		/** @type{glsBuiltinPrecisionTests.ParamNames} */ var names = new glsBuiltinPrecisionTests.Tuple4("a", "b", "c", "d");
		return names;
	};

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Func}
     * @param{glsBuiltinPrecisionTests.Signature} Sig template <typename Sig>
     *
     */
    glsBuiltinPrecisionTests.PrimitiveFunc = function(Sig) {
        glsBuiltinPrecisionTests.Func.call(this, Sig);
        this.Ret = Sig.Ret;
    };

    glsBuiltinPrecisionTests.PrimitiveFunc.prototype = Object.create(glsBuiltinPrecisionTests.Func.prototype);
    glsBuiltinPrecisionTests.PrimitiveFunc.prototype.constructor = glsBuiltinPrecisionTests.PrimitiveFunc;

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.PrimitiveFunc}
     *
     */
    glsBuiltinPrecisionTests.FloatFunc1 = function () {
        var sig = new glsBuiltinPrecisionTests.Signature('float', 'float');
        glsBuiltinPrecisionTests.PrimitiveFunc.call(this, sig);
    };

    glsBuiltinPrecisionTests.FloatFunc1.prototype = Object.create(glsBuiltinPrecisionTests.PrimitiveFunc.prototype);
    glsBuiltinPrecisionTests.FloatFunc1.prototype.constructor = glsBuiltinPrecisionTests.FloatFunc1;

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.Tuple4} iargs
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.doApply =	function(ctx, iargs) {
        var a = /** @type {tcuInterval.Interval} */ (iargs.a);
		return this.applyMonotone(ctx, a);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{tcuInterval.Interval} iarg0
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.applyMonotone	= function(ctx, iarg0) {
		/** @type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();

        /**
         * @param {number=} x
         * @param {number=} y
         * @return {tcuInterval.Interval}
         */
        var body = function(x, y) {
            x = x || 0;
            return this.applyPoint(ctx, x);
        };
        ret =  tcuInterval.applyMonotone1(iarg0, body.bind(this));

		ret.operatorOrAssignBinary(this.innerExtrema(ctx, iarg0));

		ret.operatorAndAssignBinary(this.getCodomain().operatorOrBinary(new tcuInterval.Interval(NaN)));

		return ctx.format.convert(ret);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{tcuInterval.Interval} iargs
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.innerExtrema = function(ctx, iargs)	{
		return new tcuInterval.Interval(); // empty interval, i.e. no extrema
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} arg0
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.applyPoint = function(ctx, arg0) {
		var exact = this.applyExact(arg0);
		var prec = new tcuInterval.Interval(this.precision(ctx, exact, arg0));

		var a = new tcuInterval.Interval(exact);
        var b = tcuInterval.withIntervals(prec.operatorNegative(), prec);
        return tcuInterval.Interval.operatorSum(a, b);
	};

    /**
     * @param{number} x
     * @return {number}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.applyExact = function(x)	{
        //TODO
		throw new Error("Internal error. Cannot apply");
	};

    /**
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.getCodomain = function() {
		return tcuInterval.unbounded(true);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} x
     * @param{number} y
     * @return{number}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.precision	= function(ctx, x, y) {
        return 0;
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FloatFunc1}
     * @param{string} name
     * @param{tcuInterval.DoubleFunc1} func
     */
    glsBuiltinPrecisionTests.CFloatFunc1 = function(name, func) {
        glsBuiltinPrecisionTests.FloatFunc1.call(this);
        /** @type{string} */ this.m_name = name;
        /** @type{tcuInterval.DoubleFunc1} */this.m_func = func;
    };

    glsBuiltinPrecisionTests.CFloatFunc1.prototype = Object.create(glsBuiltinPrecisionTests.FloatFunc1.prototype);
    glsBuiltinPrecisionTests.CFloatFunc1.prototype.constructor = glsBuiltinPrecisionTests.CFloatFunc1;

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.CFloatFunc1.prototype.getName = function() {
        return this.m_name;
    };

    /**
     * @param{number} x
     * @return{number}
     */
    glsBuiltinPrecisionTests.CFloatFunc1.prototype.applyExact = function(x) {
        return this.m_func(x);
    };

    /**
     * PrimitiveFunc<Signature<float, float, float> >
     * @constructor
     * @extends{glsBuiltinPrecisionTests.PrimitiveFunc}
     */
    glsBuiltinPrecisionTests.FloatFunc2 = function() {
        /** @type{glsBuiltinPrecisionTests.Signature} */ var Sig = new glsBuiltinPrecisionTests.Signature('float', 'float', 'float');
        glsBuiltinPrecisionTests.PrimitiveFunc.call(this, Sig);
    };

    glsBuiltinPrecisionTests.FloatFunc2.prototype = Object.create(glsBuiltinPrecisionTests.PrimitiveFunc.prototype);
    glsBuiltinPrecisionTests.FloatFunc2.prototype.constructor = glsBuiltinPrecisionTests.FloatFunc2;

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.Tuple4} iargs
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.doApply = function(ctx, iargs) {
        var a = /** @type {tcuInterval.Interval} */ (iargs.a);
        var b = /** @type {tcuInterval.Interval} */ (iargs.b);        
		return this.applyMonotone(ctx, a, b);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{tcuInterval.Interval} xi
     * @param{tcuInterval.Interval} yi
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.applyMonotone	= function(ctx, xi, yi) {
		/** @type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();

		// TCU_INTERVAL_APPLY_MONOTONE2(reti, x, xi, y, yi, ret,
		// 							 TCU_SET_INTERVAL(ret, point,
		// 											  point = this.applyPoint(ctx, x, y)));

        /**
         * @param {number=} x
         * @param {number=} y
         * @return {tcuInterval.Interval}
         */
        var body = function(x, y) {
            x = x || 0;
            y = y || 0;
            return this.applyPoint(ctx, x, y);
        };
        ret =  tcuInterval.applyMonotone2(xi, yi, body.bind(this));

        ret.operatorOrAssignBinary(this.innerExtrema(ctx, xi, yi));

        ret.operatorAndAssignBinary(this.getCodomain().operatorOrBinary(new tcuInterval.Interval(NaN)));

        return ctx.format.convert(ret);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{tcuInterval.Interval} xi
     * @param{tcuInterval.Interval} yi
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.innerExtrema = function(ctx, xi, yi) {
		return new tcuInterval.Interval(); // empty interval, i.e. no extrema
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} x
     * @param{number} y
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.applyPoint = function(ctx, x, y) {
		/** @type{number} */ var exact	= this.applyExact(x, y);
		/** @type{tcuInterval.Interval} */ var prec	= this.precision(ctx, exact, x, y);

        var a = new tcuInterval.Interval(exact);
        var b = tcuInterval.withIntervals(prec.operatorNegative(), prec);
        return tcuInterval.Interval.operatorSum(a, b);
	};

    /**
     * @param{number} x
     * @param{number} y
     * @return{number}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.applyExact = function(x, y) {
		throw new Error('Internal error. Cannot apply');
	};

    /**
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.getCodomain = function() {
		return tcuInterval.unbounded(true);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} ret
     * @param{number} x
     * @param{number} y
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.precision = function(ctx, ret, x,	y) {
        return new tcuInterval.Interval();
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FloatFunc2}
     * @param{string} name
     * @param{tcuInterval.DoubleFunc2} func
     */
    glsBuiltinPrecisionTests.CFloatFunc2 = function(name, func){
        glsBuiltinPrecisionTests.FloatFunc2.call(this);
    	/** @type{string} */ this.m_name = name;
    	/** @type{tcuInterval.DoubleFunc2} */ this.m_func = func;
    };

    glsBuiltinPrecisionTests.CFloatFunc2.prototype = Object.create(glsBuiltinPrecisionTests.FloatFunc2.prototype);
    glsBuiltinPrecisionTests.CFloatFunc2.prototype.constructor = glsBuiltinPrecisionTests.CFloatFunc2;

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.CFloatFunc2.prototype.getName = function()	{
        return this.m_name;
    };

    /**
     * @param{number} x
     * @param{number} y
     * @return{number}
     */
    glsBuiltinPrecisionTests.CFloatFunc2.prototype.applyExact = function(x, y) {
        return this.m_func(x, y);
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FloatFunc2}
     */
    glsBuiltinPrecisionTests.InfixOperator = function(){
        glsBuiltinPrecisionTests.FloatFunc2.call(this);
    };

    glsBuiltinPrecisionTests.InfixOperator.prototype = Object.create(glsBuiltinPrecisionTests.FloatFunc2.prototype);
    glsBuiltinPrecisionTests.InfixOperator.prototype.constructor = glsBuiltinPrecisionTests.InfixOperator;

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.InfixOperator.prototype.getSymbol = function() {
        glsBuiltinPrecisionTests.FloatFunc2.call(this);
        return '';
    };

    /**
     * @param{Array<glsBuiltinPrecisionTests.ExprBase>} args
     * @return{string}
     */
    glsBuiltinPrecisionTests.InfixOperator.prototype.doPrint = function(args) {
		return '(' + args[0] + ' ' + this.getSymbol() + ' ' + args[1] + ')';
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} x
     * @param{number} y
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.InfixOperator.prototype.applyPoint = function(ctx, x, y) {
		/** @type{number} */ var exact = this.applyExact(x, y);

		// Allow either representable number on both sides of the exact value,
		// but require exactly representable values to be preserved.
		return ctx.format.roundOut(new tcuInterval.Interval(exact), isFinite(x) && isFinite(y));
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} x
     * @param{number} y
     * @param{number} z
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.InfixOperator.prototype.precision = function(ctx, x, y, z)	{
		return new tcuInterval.Interval(0);
	};

 //    /**
 //     * Signature<float, float, float, float>
 //     * @constructor
 //     * @extends{glsBuiltinPrecisionTests.PrimitiveFunc}
 //     */
 //    glsBuiltinPrecisionTests.FloatFunc3 = function() {
 //        /** @type{glsBuiltinPrecisionTests.Signature} */ var sig = new glsBuiltinPrecisionTests.Signature('float', 'float', 'float', 'float');
 //        glsBuiltinPrecisionTests.PrimitiveFunc.call(this, sig);
 //    };

 //    glsBuiltinPrecisionTests.FloatFunc3.prototype = Object.create(glsBuiltinPrecisionTests.PrimitiveFunc.prototype);
 //    glsBuiltinPrecisionTests.FloatFunc3.prototype.constructor = glsBuiltinPrecisionTests.FloatFunc3;

 //    /**
 //     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
 //     * @param{glsBuiltinPrecisionTests.Tuple4} iargs
 //     * @return{tcuInterval.Interval}
 //     */
 //    glsBuiltinPrecisionTests.FloatFunc3.prototype.doApply = function (ctx, iargs) {
 //        var a = /** @type {tcuInterval.Interval} */ (iargs.a);
 //        var b = /** @type {tcuInterval.Interval} */ (iargs.b);        
 //        var c = /** @type {tcuInterval.Interval} */ (iargs.c);        
 //        return this.applyMonotone(ctx, a, b, c);
	// };

 //    /**
 //     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
 //     * @param{tcuInterval.Interval} xi
 //     * @param{tcuInterval.Interval} yi
 //     * @param{tcuInterval.Interval} zi
 //     * @return{tcuInterval.Interval}
 //     */
 //    glsBuiltinPrecisionTests.FloatFunc3.prototype.applyMonotone	= function(ctx, xi, yi, zi) {
	// 	/** @type{tcuInterval.Interval} */ var reti = new tcuInterval.Interval();
	// 	TCU_INTERVAL_APPLY_MONOTONE3(reti, x, xi, y, yi, z, zi, ret,
	// 								 TCU_SET_INTERVAL(ret, point,
	// 												  point = this.applyPoint(ctx, x, y, z)));
	// 	return ctx.format.convert(reti);
	// };

 //    /**
 //     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
 //     * @param{tcuInterval.Interval} xi
 //     * @param{tcuInterval.Interval} yi
 //     * @param{tcuInterval.Interval} zi
 //     * @return{tcuInterval.Interval}
 //     */
 //    glsBuiltinPrecisionTests.FloatFunc3.prototype.applyPoint = function(ctx, xi, yi, zi) {
	// 	/** @type{number} */ var exact	= this.applyExact(x, y, z);
	// 	/** @type{number} */ var prec	= this.precision(ctx, exact, x, y, z);
	// 	return new tcuInterval.Interval(-prec, prec).operatorSum(exact);
	// };

 //    /**
 //     * @param{number} x
 //     * @param{number} y
 //     * @param{number} z
 //     * @return{tcuInterval.Interval}
 //     */
 //    glsBuiltinPrecisionTests.FloatFunc3.prototype.applyExact = function(x, y, z) {
	// 	TCU_THROW(InternalError, "Cannot apply");
	// };

 //    /**
 //     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
 //     * @param{number} result
 //     * @param{number} x
 //     * @param{number} y
 //     * @param{number} z
 //     * @return{number}
 //     */
 //    glsBuiltinPrecisionTests.FloatFunc3.prototype.precision	= function(ctx, result, x, y, z) {
 //        return 0;
 //    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.InfixOperator}
     */
    glsBuiltinPrecisionTests.Add = function() {
        glsBuiltinPrecisionTests.InfixOperator.call(this);
    };

    glsBuiltinPrecisionTests.Add.prototype = Object.create(glsBuiltinPrecisionTests.InfixOperator.prototype);
    glsBuiltinPrecisionTests.Add.prototype.constructor = glsBuiltinPrecisionTests.Add;

    /**
     * @returns{string}
     */
    glsBuiltinPrecisionTests.Add.prototype.getName = function()	{
        return 'add';
    };

    /**
     * @returns{string}
     */
    glsBuiltinPrecisionTests.Add.prototype.getSymbol = function()	{
        return '+';
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.Tuple4} iargs
     * @returns{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.Add.prototype.doApply = function(ctx, iargs) {
        var a = /** @type {tcuInterval.Interval} */ (iargs.a);
        var b = /** @type {tcuInterval.Interval} */ (iargs.b);        
		// Fast-path for common case
		if (iargs.a.isOrdinary() && iargs.b.isOrdinary()) {
			/** type{tcuInterval.Interval} */ var ret;
			ret = tcuInterval.setIntervalBounds(
                function(dummy) {
                    return iargs.a.lo() + iargs.b.lo();
                },
                function(dummy) {
                    return iargs.a.hi() + iargs.b.hi();
                });
			return ctx.format.convert(ctx.format.roundOut(ret, true));
		}
		return this.applyMonotone(ctx, a, b);
	};

    /**
     * @param{number} x
     * @param{number} y
     * @returns{number}
     */
    glsBuiltinPrecisionTests.Add.prototype.applyExact = function(x, y) {
        return x + y;
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.InfixOperator}
     */
    glsBuiltinPrecisionTests.Sub = function() {
        glsBuiltinPrecisionTests.InfixOperator.call(this);
    };

    glsBuiltinPrecisionTests.Sub.prototype = Object.create(glsBuiltinPrecisionTests.InfixOperator.prototype);
    glsBuiltinPrecisionTests.Sub.prototype.constructor = glsBuiltinPrecisionTests.Sub;

    /**
     * @returns{string}
     */
    glsBuiltinPrecisionTests.Sub.prototype.getName = function() {
        return 'sub';
    };

    /**
     * @returns{string}
     */
    glsBuiltinPrecisionTests.Sub.prototype.getSymbol = function()   {
        return '-';
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.Tuple4} iargs
     * @returns{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.Sub.prototype.doApply = function(ctx, iargs) {
        var a = /** @type {tcuInterval.Interval} */ (iargs.a);
        var b = /** @type {tcuInterval.Interval} */ (iargs.b);        
        // Fast-path for common case
        if (iargs.a.isOrdinary() && iargs.b.isOrdinary()) {
            /** type{tcuInterval.Interval} */ var ret;
            ret = tcuInterval.setIntervalBounds(
                function(dummy) {
                    return iargs.a.lo() - iargs.b.hi();
                },
                function(dummy) {
                    return iargs.a.hi() - iargs.b.lo();
                });
            return ctx.format.convert(ctx.format.roundOut(ret, true));
        }
        return this.applyMonotone(ctx, a, b);
    };

    /**
     * @param{number} x
     * @param{number} y
     * @returns{number}
     */
    glsBuiltinPrecisionTests.Sub.prototype.applyExact = function(x, y) {
        return x - y;
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.InfixOperator}
     */
    glsBuiltinPrecisionTests.Mul = function() {
        glsBuiltinPrecisionTests.InfixOperator.call(this);
    };

    glsBuiltinPrecisionTests.Mul.prototype = Object.create(glsBuiltinPrecisionTests.InfixOperator.prototype);
    glsBuiltinPrecisionTests.Mul.prototype.constructor = glsBuiltinPrecisionTests.Mul;

    /**
     * @returns{string}
     */
    glsBuiltinPrecisionTests.Mul.prototype.getName = function() {
        return 'mul';
    };

    /**
     * @returns{string}
     */
    glsBuiltinPrecisionTests.Mul.prototype.getSymbol = function()   {
        return '*';
    };

    glsBuiltinPrecisionTests.isNegative = function(n) {
        return ((n = +n) || 1 / n) < 0;
    };

   /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.Tuple4} iargs
     * @returns{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.Mul.prototype.doApply = function(ctx, iargs) {
        var a = /** @type {tcuInterval.Interval} */ (iargs.a);
        var b = /** @type {tcuInterval.Interval} */ (iargs.b);        
        // Fast-path for common case
        if (iargs.a.isOrdinary() && iargs.b.isOrdinary()) {
            /** type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();
            if (glsBuiltinPrecisionTests.isNegative(a.hi()))
            {
                a = a.operatorNegative();
                b = b.operatorNegative();
            }
            if (a.lo() >= 0 && b.lo() >= 0)
            {
                ret = tcuInterval.setIntervalBounds(
                    function(dummy) {
                        return iargs.a.lo() * iargs.b.lo();
                    },
                    function(dummy) {
                        return iargs.a.hi() * iargs.b.hi();
                    });                    
                return ctx.format.convert(ctx.format.roundOut(ret, true));
            }
            if (a.lo() >= 0 && b.hi() <= 0)
            {
                ret = tcuInterval.setIntervalBounds(
                    function(dummy) {
                        return iargs.a.hi() * iargs.b.lo();
                    },
                    function(dummy) {
                        return iargs.a.lo() * iargs.b.hi();
                    });                    
                return ctx.format.convert(ctx.format.roundOut(ret, true));
            }           

            return ctx.format.convert(ctx.format.roundOut(ret, true));
        }

        return this.applyMonotone(ctx, a, b);
    };

    /**
     * @param{number} x
     * @param{number} y
     * @returns{number}
     */
    glsBuiltinPrecisionTests.Mul.prototype.applyExact = function(x, y) {
        return x * y;
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{tcuInterval.Interval} xi
     * @param{tcuInterval.Interval} yi
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.Mul.prototype.innerExtrema = function(ctx, xi, yi) {
        if (((xi.contains(tcuInterval.NEGATIVE_INFINITY) || xi.contains(tcuInterval.POSITIVE_INFINITY)) && yi.contains(tcuInterval.ZERO)) ||
            ((yi.contains(tcuInterval.NEGATIVE_INFINITY) || yi.contains(tcuInterval.POSITIVE_INFINITY)) && xi.contains(tcuInterval.ZERO)))
            return new tcuInterval.Interval(NaN);

        return new tcuInterval.Interval(); // empty interval, i.e. no extrema
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.PrimitiveFunc}
     */
    glsBuiltinPrecisionTests.CompWiseFunc = function(typename, Sig) {
        glsBuiltinPrecisionTests.PrimitiveFunc.call(this, Sig);
        this.typename = typename;
    };

    setParentClass(glsBuiltinPrecisionTests.CompWiseFunc, glsBuiltinPrecisionTests.PrimitiveFunc);

    /**
     * @returns{string}
     */
    glsBuiltinPrecisionTests.CompWiseFunc.prototype.getName = function() {
        return this.doGetScalarFunc().getName();
    };

    /**
     * @param{Array<glsBuiltinPrecisionTests.ExprBase>} args
     * @return {string}
     */
    glsBuiltinPrecisionTests.CompWiseFunc.prototype.doPrint = function(args) {
        return this.doGetScalarFunc().print(args);
    };

    /**
     * @return {glsBuiltinPrecisionTests.Func}
     */
    glsBuiltinPrecisionTests.CompWiseFunc.prototype.doGetScalarFunc = function() {
        throw new Error('Virtual function. Please override.');
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.CompWiseFunc}
     * @param {number} rows
     * @param {number} cols
     */
    glsBuiltinPrecisionTests.CompMatFuncBase = function(rows, cols) {
        var name = glsBuiltinPrecisionTests.dataTypeNameOfMatrix('float', rows, cols);
        glsBuiltinPrecisionTests.CompWiseFunc.call(this, 'float', new glsBuiltinPrecisionTests.Signature(name, name, name));
        this.rows = rows;
        this.cols = cols;
    };

    setParentClass(glsBuiltinPrecisionTests.CompMatFuncBase, glsBuiltinPrecisionTests.CompWiseFunc);
    
    glsBuiltinPrecisionTests.CompMatFuncBase.prototype.doApply = function(ctx, iargs)    
    {
        var ret = new tcuMatrix.Matrix(this.rows, this.cols);
        var fun = this.doGetScalarFunc();

        for (var row = 0; row < this.rows; ++row)
            for (var col = 0; col < this.cols; ++col)
                ret.set(row, col, fun.applyFunction(ctx,
                                                  iargs.a.get(row, col),
                                                  iargs.b.get(row, col)));

        return ret;
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.CompMatFuncBase}
     * @param {function(new:glsBuiltinPrecisionTests.Func)} F
     * @param {number} rows
     * @param {number} cols
     */
    glsBuiltinPrecisionTests.CompMatFunc = function(F, rows, cols) {
        glsBuiltinPrecisionTests.CompMatFuncBase.call(this, rows, cols);
        this.m_function = F;
    };

    setParentClass(glsBuiltinPrecisionTests.CompMatFunc, glsBuiltinPrecisionTests.CompMatFuncBase);

    /**
     * @return {glsBuiltinPrecisionTests.Func}
     */
    glsBuiltinPrecisionTests.CompMatFunc.prototype.doGetScalarFunc = function() {
        return new this.m_function();
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.Mul}
     */
    glsBuiltinPrecisionTests.ScalarMatrixCompMult = function() {
       glsBuiltinPrecisionTests.Mul.call(this);
    };

    setParentClass(glsBuiltinPrecisionTests.ScalarMatrixCompMult, glsBuiltinPrecisionTests.Mul);

    /**
     * @returns{string}
     */
    glsBuiltinPrecisionTests.ScalarMatrixCompMult.prototype.getName = function() {
        return 'matrixCompMult';
    };

    /**
     * @param{Array<glsBuiltinPrecisionTests.ExprBase>} args
     * @return {string}
     */
    glsBuiltinPrecisionTests.ScalarMatrixCompMult.prototype.doPrint = function(args) {
        return glsBuiltinPrecisionTests.Func.prototype.doPrint.call(this, args);
    };
    
    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.CompMatFunc}
     * @param {number} rows
     * @param {number} cols
     */
    glsBuiltinPrecisionTests.MatrixCompMult = function(rows, cols) {        
        glsBuiltinPrecisionTests.CompMatFunc.call(this, glsBuiltinPrecisionTests.ScalarMatrixCompMult, rows, cols);
    };

    setParentClass(glsBuiltinPrecisionTests.MatrixCompMult, glsBuiltinPrecisionTests.CompMatFunc);

    /************************************/

    /**
     * template<typename In>
     * @constructor
     * @param{*} In
     */
    glsBuiltinPrecisionTests.Inputs = function(In) {
    	// vector<typename In::In0>	in0;
    	// vector<typename In::In1>	in1;
    	// vector<typename In::In2>	in2;
    	// vector<typename In::In3>	in3;
        this.in0 = [];
        this.in1 = [];
        this.in2 = [];
        this.in3 = [];
    };

    /**
     * template<typename Out>
     * @constructor
     * @param{number} size
     * @param{*} Out
     */
    glsBuiltinPrecisionTests.Outputs = function(size, Out) {
    	// Outputs	(size_t size) : out0(size), out1(size) {}
    	this.out0 = [];
    	this.out1 = [];
    };


    /**
     * template<typename In, typename Out>
     * @constructor
     * @param{*} In
     * @param{*} Out
     */
     glsBuiltinPrecisionTests.Variables = function(In, Out) {
    	this.in0 = new glsBuiltinPrecisionTests.Variable(In.In0);
        this.in1 = new glsBuiltinPrecisionTests.Variable(In.In1);
        this.in2 = new glsBuiltinPrecisionTests.Variable(In.In2);
        this.in3 = new glsBuiltinPrecisionTests.Variable(In.In3);
        this.out0 = new glsBuiltinPrecisionTests.Variable(Out.Out0);
        this.out1 = new glsBuiltinPrecisionTests.Variable(Out.Out1);
    };


    /**
     * template<typename F>
     * @constructor
     * @param{function(new:glsBuiltinPrecisionTests.Func)} F
     * @return{glsBuiltinPrecisionTests.GenFuncs}
     */
    glsBuiltinPrecisionTests.makeVectorizedFuncs = function(F) {
    	return new glsBuiltinPrecisionTests.GenFuncs(
                new F(),
                new glsBuiltinPrecisionTests.VectorizedFunc(new F(), 2),
                new glsBuiltinPrecisionTests.VectorizedFunc(new F(), 3),
                new glsBuiltinPrecisionTests.VectorizedFunc(new F(), 4));
    };


    /**
     * template <typename typename>
     * @constructor
     * @param{glsBuiltinPrecisionTests.Typename} typename
     */
    glsBuiltinPrecisionTests.Sampling = function(typename) {
        this.typename = typename;
    };

    /**
     * @param{glsBuiltinPrecisionTests.Typename} typename
     * @param {number=} size
     * @return {glsBuiltinPrecisionTests.Sampling}
     */
    glsBuiltinPrecisionTests.SamplingFactory = function(typename, size) {
        if (size > 1)
            return new glsBuiltinPrecisionTests.DefaultSamplingVector(typename, size);
        switch(typename) {
            case 'vec4' : return new glsBuiltinPrecisionTests.DefaultSamplingVector('float', 4);
            case 'vec3' : return new glsBuiltinPrecisionTests.DefaultSamplingVector('float', 3);
            case 'vec2' : return new glsBuiltinPrecisionTests.DefaultSamplingVector('float', 2);
            case 'boolean' : return new glsBuiltinPrecisionTests.DefaultSamplingBool(typename)
            case 'float' : return new glsBuiltinPrecisionTests.DefaultSamplingFloat(typename);
            case 'mat2': return new glsBuiltinPrecisionTests.DefaultSamplingMatrix('float', 2, 2);
            case 'mat2x3': return new glsBuiltinPrecisionTests.DefaultSamplingMatrix('float', 3, 2);
            case 'mat2x4': return new glsBuiltinPrecisionTests.DefaultSamplingMatrix('float', 4, 2);
            case 'mat3x2': return new glsBuiltinPrecisionTests.DefaultSamplingMatrix('float', 2, 3);
            case 'mat3': return new glsBuiltinPrecisionTests.DefaultSamplingMatrix('float', 3, 3);
            case 'mat3x4': return new glsBuiltinPrecisionTests.DefaultSamplingMatrix('float', 4, 3);
            case 'mat4x2': return new glsBuiltinPrecisionTests.DefaultSamplingMatrix('float', 2, 4);
            case 'mat4x3': return new glsBuiltinPrecisionTests.DefaultSamplingMatrix('float', 3, 4);
            case 'mat4': return new glsBuiltinPrecisionTests.DefaultSamplingMatrix('float', 4, 4);
            case 'int' : return new glsBuiltinPrecisionTests.DefaultSamplingInt(typename);
        }
        return new glsBuiltinPrecisionTests.DefaultSamplingVoid(typename);
    };

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<*>} arr
     */
    glsBuiltinPrecisionTests.Sampling.prototype.genFixeds = function(fmt, arr){
        throw new Error('Virtual function. Please override.');
    };

    /**
     * template <typename typename>
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{gluShaderUtil.precision} precision
     * @param{deRandom.Random} random
     * @return{*}
     */
    glsBuiltinPrecisionTests.Sampling.prototype.genRandom = function(fmt, precision, random){
        return 0;
    };

    /**
     * @return{number}
     */
    glsBuiltinPrecisionTests.Sampling.prototype.getWeight = function() {
        return 0;
    };

    /**
     * template <>  :  public Sampling<Void>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{glsBuiltinPrecisionTests.Typename} typename
     */
     glsBuiltinPrecisionTests.DefaultSamplingVoid = function(typename) {
         glsBuiltinPrecisionTests.Sampling.call(this, typename);
     };

     glsBuiltinPrecisionTests.DefaultSamplingVoid.prototype = Object.create(glsBuiltinPrecisionTests.Sampling.prototype);
     glsBuiltinPrecisionTests.DefaultSamplingVoid.prototype.constructor = glsBuiltinPrecisionTests.DefaultSamplingVoid;

    /**
     * template <>  :  public Sampling<Void>
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<number>} dst
     */
    glsBuiltinPrecisionTests.DefaultSamplingVoid.prototype.genFixeds = function(fmt, dst) {
        dst.push(NaN);
    };

    /**
     * template <>  :  public Sampling<bool>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{glsBuiltinPrecisionTests.Typename} typename
     */
    glsBuiltinPrecisionTests.DefaultSamplingBool = function(typename) {
        glsBuiltinPrecisionTests.Sampling.call(this, typename);
    };

    glsBuiltinPrecisionTests.DefaultSamplingBool.prototype = Object.create(glsBuiltinPrecisionTests.Sampling.prototype);
    glsBuiltinPrecisionTests.DefaultSamplingBool.prototype.constructor = glsBuiltinPrecisionTests.DefaultSamplingBool;

    /**
     * template <>  :  public Sampling<bool>
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<Boolean>} dst
     */
    glsBuiltinPrecisionTests.DefaultSamplingBool.prototype.genFixeds = function(fmt, dst) {
		dst.push(true);
		dst.push(false);
	};

    /**
     * template <>  :  public Sampling<int>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{glsBuiltinPrecisionTests.Typename} typename
     */
    glsBuiltinPrecisionTests.DefaultSamplingInt = function(typename) {
        glsBuiltinPrecisionTests.Sampling.call(this, typename);
    };

    glsBuiltinPrecisionTests.DefaultSamplingInt.prototype = Object.create(glsBuiltinPrecisionTests.Sampling.prototype);
    glsBuiltinPrecisionTests.DefaultSamplingInt.prototype.constructor = glsBuiltinPrecisionTests.DefaultSamplingInt;

    glsBuiltinPrecisionTests.DefaultSamplingInt.prototype.genRandom = function(fmt, prec, rnd) {
		/** @type{number} */ var exp = rnd.getInt(0, this.getNumBits(prec)-2);
		/** @type{number} */ var sign = rnd.getBool() ? -1 : 1;

		return sign * rnd.getInt(0, 1 << exp);
	};

    glsBuiltinPrecisionTests.DefaultSamplingInt.prototype.genFixeds = function(fmt, dst) {
		dst.push(0);
		dst.push(-1);
		dst.push(1);
	};

    glsBuiltinPrecisionTests.DefaultSamplingInt.prototype.getWeight = function(){
        return 1.0;
    };

    /**
     * template <>  :  public Sampling<int>
     * @param{gluShaderUtil.precision} prec
     * @return{number}
     */
    glsBuiltinPrecisionTests.DefaultSamplingInt.prototype.getNumBits = function(prec) {
		switch (prec) {
			case gluShaderUtil.precision.PRECISION_LOWP: return 8;
			case gluShaderUtil.precision.PRECISION_MEDIUMP: return 16;
			case gluShaderUtil.precision.PRECISION_HIGHP: return 32;
			default:
                throw new Error('Invalid precision: ' + prec);
		}
	};

    /**
     * template <>  :  public Sampling<float>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{glsBuiltinPrecisionTests.Typename} typename
     */
    glsBuiltinPrecisionTests.DefaultSamplingFloat = function(typename){
        glsBuiltinPrecisionTests.Sampling.call(this, typename);
    };

    glsBuiltinPrecisionTests.DefaultSamplingFloat.prototype = Object.create(glsBuiltinPrecisionTests.Sampling.prototype);
    glsBuiltinPrecisionTests.DefaultSamplingFloat.prototype.constructor = glsBuiltinPrecisionTests.DefaultSamplingFloat;

    glsBuiltinPrecisionTests.DefaultSamplingFloat.prototype.genRandom = function(format, prec, rnd) {
    	/** type{number} */ var minExp			= format.getMinExp();
    	/** type{number} */ var maxExp			= format.getMaxExp();
    	/** type{boolean} */ var haveSubnormal	= format.hasSubnormal() != tcuFloatFormat.YesNoMaybe.NO;

    	// Choose exponent so that the cumulative distribution is cubic.
    	// This makes the probability distribution quadratic, with the peak centered on zero.
    	/** type{number} */ var minRoot			= deMath.deCbrt(minExp - 0.5 - (haveSubnormal ? 1.0 : 0.0));
    	/** type{number} */ var maxRoot			= deMath.deCbrt(maxExp + 0.5);
    	/** type{number} */ var fractionBits	= format.getFractionBits();
    	/** type{number} */ var exp				= deMath.rint(Math.pow(rnd.getFloat(minRoot, maxRoot),
    															3.0));
    	/** type{number} */ var base			= 0.0; // integral power of two
    	/** type{number} */ var quantum			= 0.0; // smallest representable difference in the binade
    	/** type{number} */ var significand		= 0.0; // Significand.

    	// DE_ASSERT(fractionBits < std::numeric_limits<float>::digits);

    	// Generate some occasional special numbers
    	switch (rnd.getInt(0, 64)) {
    		case 0: 	return 0;
    		case 1:		return Number.POSITIVE_INFINITY;
    		case 2:		return Number.NEGATIVE_INFINITY;
    		case 3:		return NaN;
    		default:	break;
    	}

    	if (exp >= minExp) {
    		// Normal number
    		base = deMath.deFloatLdExp(1.0, exp);
    		quantum = deMath.deFloatLdExp(1.0, exp - fractionBits);
    	} else {
    		// Subnormal
    		base = 0.0;
    		quantum = deMath.deFloatLdExp(1.0, minExp - fractionBits);
    	}

    	switch (rnd.getInt(0, 16)) {
    		case 0: // The highest number in this binade, significand is all bits one.
    			significand = base - quantum;
    			break;
    		case 1: // Significand is one.
    			significand = quantum;
    			break;
    		case 2: // Significand is zero.
    			significand = 0.0;
    			break;
    		default: // Random (evenly distributed) significand.
    		{
    			/** type{number} */ var intFraction = rnd.getInt() & ((1 << fractionBits) - 1);
    			significand = intFraction * quantum;
    		}
    	}

    	// Produce positive numbers more often than negative.
    	return (rnd.getInt(0,3) == 0 ? -1.0 : 1.0) * (base + significand);
    };

    glsBuiltinPrecisionTests.DefaultSamplingFloat.prototype.genFixeds = function (format, dst) {
    	/** @type{number} */ var minExp			= format.getMinExp();
    	/** @type{number} */ var maxExp			= format.getMaxExp();
    	/** @type{number} */ var fractionBits	= format.getFractionBits();
        // DE_INLINE double	deMath.deCbrt	(double a)	{ return deSign(a) * dePow(deAbs(a), 1.0 / 3.0); }
        // DE_INLINE double	deSign				(double x)						{ return deIsNaN(x) ? x : (double)((x > 0.0) - (x < 0.0)); }
    	/** @type{number} */ var minQuantum		= deMath.deFloatLdExp(1.0, minExp - fractionBits);
    	/** @type{number} */ var minNormalized	= deMath.deFloatLdExp(1.0, minExp);
    	/** @type{number} */ var maxQuantum		= deMath.deFloatLdExp(1.0, maxExp - fractionBits);

    	// NaN
    	dst.push(NaN);
    	// Zero
    	dst.push(0.0);

    	for (var sign = -1; sign <= 1; sign += 2) {
    		// Smallest subnormal
    		dst.push(sign * minQuantum);

    		// Largest subnormal
    		dst.push(sign * (minNormalized - minQuantum));

    		// Smallest normalized
    		dst.push(sign * minNormalized);

    		// Next smallest normalized
    		dst.push(sign * (minNormalized + minQuantum));

    		dst.push(sign * 0.5);
    		dst.push(sign * 1.0);
    		dst.push(sign * 2.0);

    		// Largest number
    		dst.push(sign * (deMath.deFloatLdExp(1.0, maxExp) +
    							  (deMath.deFloatLdExp(1.0, maxExp) - maxQuantum)));

    		dst.push(sign * Number.POSITIVE_INFINITY);
    	}
    };

    /**
     * template <typename typename, int Size>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{glsBuiltinPrecisionTests.Typename} typename
     * @param{number} size
     */
    glsBuiltinPrecisionTests.DefaultSamplingVector = function(typename, size){
        glsBuiltinPrecisionTests.Sampling.call(this, typename);
        this.size = size;
    };

    glsBuiltinPrecisionTests.DefaultSamplingVector.prototype = Object.create(glsBuiltinPrecisionTests.Sampling.prototype);
    glsBuiltinPrecisionTests.DefaultSamplingVector.prototype.constructor = glsBuiltinPrecisionTests.DefaultSamplingVector;

    glsBuiltinPrecisionTests.DefaultSamplingVector.prototype.genRandom = function(fmt, prec, rnd) {
		/** @type{Array<*>} */ var ret = [];

		for (var ndx = 0; ndx < this.size; ++ndx)
			ret[ndx] = glsBuiltinPrecisionTests.SamplingFactory(this.typename).genRandom(fmt, prec, rnd);

		return ret;
	};

    glsBuiltinPrecisionTests.DefaultSamplingVector.prototype.genFixeds = function(fmt, dst) {
		/** @type{Array<*>} */ var scalars = [];

		glsBuiltinPrecisionTests.SamplingFactory(this.typename).genFixeds(fmt, scalars);

		for (var scalarNdx = 0; scalarNdx < scalars.length; ++scalarNdx) {
            var value = [];
            for (var i = 0; i < this.size; i++)
                value[i] = scalars[scalarNdx];
            dst.push(value);
        }
	};

    glsBuiltinPrecisionTests.DefaultSamplingVector.prototype.getWeight = function() {
		return Math.pow(glsBuiltinPrecisionTests.SamplingFactory(this.typename).getWeight(), this.size);
	};

    /**
     * template <typename typename, int Rows, int Columns>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{glsBuiltinPrecisionTests.Typename} typename
     * @param{number} rows
     * @param{number} cols
     */
    glsBuiltinPrecisionTests.DefaultSamplingMatrix = function(typename, rows, cols){
        glsBuiltinPrecisionTests.Sampling.call(this, typename);
        this.rows = rows;
        this.cols = cols;
    };

    glsBuiltinPrecisionTests.DefaultSamplingMatrix.prototype = Object.create(glsBuiltinPrecisionTests.Sampling.prototype);
    glsBuiltinPrecisionTests.DefaultSamplingMatrix.prototype.constructor = glsBuiltinPrecisionTests.DefaultSamplingMatrix;

    glsBuiltinPrecisionTests.DefaultSamplingMatrix.prototype.genRandom = function(fmt, prec, rnd) {
        /** @type{tcuMatrix.Matrix} */ var ret = new tcuMatrix.Matrix(this.rows, this.cols);
        var sampler = glsBuiltinPrecisionTests.SamplingFactory(this.typename);

        for (var rowNdx = 0; rowNdx < this.rows; ++rowNdx)
            for (var colNdx = 0; colNdx < this.cols; ++colNdx)
    			ret.set(rowNdx, colNdx, sampler.genRandom(fmt, prec, rnd));

    	return ret;
    };

    glsBuiltinPrecisionTests.DefaultSamplingMatrix.prototype.genFixeds = function(fmt, dst)	{
		/** @type{Array<number>} */ var scalars = [];

		glsBuiltinPrecisionTests.SamplingFactory(this.typename).genFixeds(fmt, scalars);

		for (var scalarNdx = 0; scalarNdx < scalars.length; ++scalarNdx)
			dst.push(new tcuMatrix.Matrix(this.rows, this.cols, scalars[scalarNdx]));

		if (this.cols == this.rows)	{
			var	mat	= new tcuMatrix.Matrix(this.rows, this.cols, 0);
			var	x = 1;
			mat.set(0, 0, x);
			for (var ndx = 0; ndx < this.cols; ++ndx) {
				mat.set(this.cols - 1 - ndx, ndx, x);
				x *= 2;
			}
			dst.push(mat);
		}
	};

    glsBuiltinPrecisionTests.DefaultSamplingMatrix.prototype.getWeight = function()	{
		return Math.pow(glsBuiltinPrecisionTests.SamplingFactory(this.typename).getWeight(), this.rows * this.cols);
    };


    /**
     * template<typename In>
     * @constructor
     * @param {number=} size
     * @param{glsBuiltinPrecisionTests.InTypes} In
     */
     glsBuiltinPrecisionTests.Samplings = function(In, size) {
        this.in0 = glsBuiltinPrecisionTests.SamplingFactory(In.In0, size);
        this.in1 = glsBuiltinPrecisionTests.SamplingFactory(In.In1, size);
        this.in2 = glsBuiltinPrecisionTests.SamplingFactory(In.In2, size);
        this.in3 = glsBuiltinPrecisionTests.SamplingFactory(In.In3, size);
    };


    /**
     * template<typename In>
     * @param{glsBuiltinPrecisionTests.InTypes} In
     * @param {number=} size
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Samplings}
     */
     glsBuiltinPrecisionTests.DefaultSamplings = function(In, size) {
    	glsBuiltinPrecisionTests.Samplings.call(this, In, size);
    };

    /**
     * @constructor
     * @extends{tcuTestCase.DeqpTest}
     * @param{glsBuiltinPrecisionTests.Context} context
     * @param{string} name
     * @param{string} extension
     */
    glsBuiltinPrecisionTests.PrecisionCase = function(context, name, extension) {
        /** @type{string} */ this.m_extension = extension === undefined ? '' : extension;
        /** @type{glsBuiltinPrecisionTests.Context} */ this.m_ctx	= context;
        /** @type{*} */ this.m_status;
		/** @type{deRandom.Random} */ this.m_rnd	= new deRandom.Random(1234); //	(0xdeadbeefu + context.testContext.getCommandLine().getBaseSeed())
        tcuTestCase.DeqpTest.call(this, name, extension);
    };

    glsBuiltinPrecisionTests.PrecisionCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    glsBuiltinPrecisionTests.PrecisionCase.prototype.constructor = glsBuiltinPrecisionTests.PrecisionCase;

    /**
     * @return{tcuFloatFormat.FloatFormat}
     */
    glsBuiltinPrecisionTests.PrecisionCase.prototype.getFormat = function() {
        return this.m_ctx.floatFormat;
    };

	// TestLog&			log				(void) const 			{ return m_testCtx.getLog(); }
	// virtual void		runTest			(void) = 0;


    /**
     * Return an output value extracted from flat array
     * @param {goog.NumberArray} output
     * @param {number} index Index of the element to extract
     * @param {*} reference Reference for type informaion
     * @return {glsBuiltinPrecisionTests.Value}
     */ 
    glsBuiltinPrecisionTests.getOutput = function(output, index, reference) {
        if (reference instanceof Array) {
            var ret = [];
            var size = reference.length;
            for (var i = 0; i < size; i++)
                ret[i] = output[size * index + i];
            return ret;
        }
        if (reference instanceof tcuMatrix.Matrix) {
            var ret = new tcuMatrix.Matrix(reference.rows, reference.cols);
            var size = reference.rows * reference.cols;
            for (var i = 0 ; i < reference.rows; i++)
                for (var j = 0 ; j < reference.cols; j++)
                    ret.set(i, j, output[size * index + j * reference.cols + i]);
            return ret;
        }

        return output[index];
    }
    /**
     * template <typename In, typename Out>
     * @param{glsBuiltinPrecisionTests.Variables} variables Variables<In, Out>
     * @param{glsBuiltinPrecisionTests.Inputs} inputs Inputs<In>
     * @param{glsBuiltinPrecisionTests.Statement} stmt
     */
    glsBuiltinPrecisionTests.PrecisionCase.prototype.testStatement = function(variables, inputs, stmt){
        /**
         * Flatten an array of arrays or matrices
         * @param {(Array<Array<number>> | Array<tcuMatrix.Matrix>)} a
         * @return {Array<number>}
         */
        var flatten = function(a) {
            if (a[0] instanceof Array) {
                var merged = [];
                return merged.concat.apply(merged, a);
            }

            if (a[0] instanceof tcuMatrix.Matrix) {
                /** @type {tcuMatrix.Matrix} */ var m = a[0];
                var rows = m.rows;
                var cols = m.cols;
                var size = a.length;
                var result = [];
                for (var col = 0; col < cols; col++)
                    for (var i = 0; i < size; i++)
                        result.push(a[i].getColumn(col));
                return [].concat.apply([], result);
            }

            if (typeof(a[0]) === 'number')
                return a;

            throw new Error('Invalid input');
        };

    	// using namespace ShaderExecUtil;
        //
    	// typedef typename 	In::In0		In0;
    	// typedef typename 	In::In1		In1;
    	// typedef typename 	In::In2		In2;
    	// typedef typename 	In::In3		In3;
    	// typedef typename 	Out::Out0	Out0;
    	// typedef typename 	Out::Out1	Out1;

    	/** @type{tcuFloatFormat.FloatFormat} */ var fmt = this.getFormat();
    	/** @type{number} */ var inCount = glsBuiltinPrecisionTests.numInputs(this.In);
    	/** @type{number} */ var outCount = glsBuiltinPrecisionTests.numOutputs(this.Out);
    	/** @type{number} */ var numValues = (inCount > 0) ? inputs.in0.length : 1;
    	/** @type{tcuFloatFormat.FloatFormat} */ var highpFmt = this.m_ctx.highpFormat;
        var outputs = [];
    	/** @type{number} */ var maxMsgs		= 100;
    	/** @type{number} */ var numErrors	= 0;
        /** @type {glsShaderExecUtil.ShaderSpec} */ var spec = new glsShaderExecUtil.ShaderSpec();
    	/** @type{glsBuiltinPrecisionTests.Environment} */ var env = new glsBuiltinPrecisionTests.Environment(); 		// Hoisted out of the inner loop for optimization.

    	switch (inCount) {
    		case 4: DE_ASSERT(inputs.in3.length == numValues);
    		case 3: DE_ASSERT(inputs.in2.length == numValues);
    		case 2: DE_ASSERT(inputs.in1.length == numValues);
    		case 1: DE_ASSERT(inputs.in0.length == numValues);
    		default: break;
    	}

        // TODO: print this to Log
    	// Print out the statement and its definitions
    	// log() << TestLog::Message << "Statement: " << stmt << TestLog::EndMessage;
    	// {
    	// 	ostringstream	oss;
    	// 	FuncSet			funcs;
        //
    	// 	stmt.getUsedFuncs(funcs);
    	// 	for (FuncSet::const_iterator it = funcs.begin(); it != funcs.end(); ++it)
    	// 	{
    	// 		(*it).printDefinition(oss);
    	// 	}
    	// 	if (!funcs.empty())
    	// 		log() << TestLog::Message << "Reference definitions:\n" << oss.str()
    	// 			  << TestLog::EndMessage;
    	// }

    	// Initialize ShaderSpec from precision, variables and statement.

		spec.globalDeclarations = "precision " + gluShaderUtil.getPrecisionName(this.m_ctx.precision) + " float;\n"

    	if (this.m_extension.length > 0)
    		spec.globalDeclarations += '#extension ' + this.m_extension + ' : require\n';

    	spec.inputs = [];

    	switch (inCount) {
    		case 4: spec.inputs[3] = this.makeSymbol(variables.in3);
    		case 3:	spec.inputs[2] = this.makeSymbol(variables.in2);
    		case 2:	spec.inputs[1] = this.makeSymbol(variables.in1);
    		case 1:	spec.inputs[0] = this.makeSymbol(variables.in0);
    		default: break;
    	}

    	spec.outputs = [];

    	switch (outCount) {
    		case 2:	spec.outputs[1] = this.makeSymbol(variables.out1);
    		case 1:	spec.outputs[0] = this.makeSymbol(variables.out0);
    		default: break;
    	}

    	spec.source = stmt;

    	// Run the shader with inputs.
		/** @type{glsShaderExecUtil.ShaderExecutor} */
        var executor = glsShaderExecUtil.createExecutor(this.m_ctx.shaderType, spec);
		/** @type{Array<*>} */ var inputArr	=
		[
			flatten(inputs.in0), flatten(inputs.in1), flatten(inputs.in2), flatten(inputs.in3)
		];

		// executor.log(log());
		if (!executor.isOk())
			testFailed("Shader compilation failed");

		executor.useProgram();
		var outputArray = executor.execute(numValues, inputArr);

        switch (outCount) {
            case 2:
                outputs[1] = glsBuiltinPrecisionTests.cast(this.Out.Out1, outputArray[1]);
            case 1:
                outputs[0] = glsBuiltinPrecisionTests.cast(this.Out.Out0, outputArray[0]);
            default: break;
        }

    	// Initialize environment with dummy values so we don't need to bind in inner loop.

        var in0 = new tcuInterval.Interval();
        var in1 = new tcuInterval.Interval();
        var in2 = new tcuInterval.Interval();
        var in3 = new tcuInterval.Interval();
        var reference0 = new tcuInterval.Interval();
        var reference1 = new tcuInterval.Interval();

		env.bind(variables.in0, in0);
		env.bind(variables.in1, in1);
		env.bind(variables.in2, in2);
		env.bind(variables.in3, in3);
		env.bind(variables.out0, reference0);
		env.bind(variables.out1, reference1);

    	// For each input tuple, compute output reference interval and compare
    	// shader output to the reference.
    	for (var valueNdx = 0; valueNdx < numValues; valueNdx++) {
    		/** @type{boolean} */ var result = true;
            var msg = '';

    		var in0_ = glsBuiltinPrecisionTests.convert(this.Arg0, fmt, glsBuiltinPrecisionTests.round(this.Arg0, fmt, inputs.in0[valueNdx]));
    		var in1_ = glsBuiltinPrecisionTests.convert(this.Arg1, fmt, glsBuiltinPrecisionTests.round(this.Arg1, fmt, inputs.in1[valueNdx]));
    		var in2_ = glsBuiltinPrecisionTests.convert(this.Arg2, fmt, glsBuiltinPrecisionTests.round(this.Arg2, fmt, inputs.in2[valueNdx]));
    		var in3_ = glsBuiltinPrecisionTests.convert(this.Arg3, fmt, glsBuiltinPrecisionTests.round(this.Arg3, fmt, inputs.in3[valueNdx]));

            env.bind(variables.in0, in0_);
            env.bind(variables.in1, in1_);
            env.bind(variables.in2, in2_);
            env.bind(variables.in3, in3_);

			stmt.execute(new glsBuiltinPrecisionTests.EvalContext(fmt, this.m_ctx.precision, env));

    		switch (outCount) {
    			case 2:
    				reference1 = glsBuiltinPrecisionTests.convert(this.Out.Out1, highpFmt, env.lookup(variables.out1));
                    var value = glsBuiltinPrecisionTests.getOutput(outputs[1], valueNdx, reference1);
    				if (!glsBuiltinPrecisionTests.contains(this.Out.Out1, reference1, value)) {
                        msg = 'Shader output 1 (' + value + ') is outside acceptable range: ' + reference1;
                        result = false;
                    }
    			case 1:
                    reference0 = glsBuiltinPrecisionTests.convert(this.Out.Out0, highpFmt, env.lookup(variables.out0));
                    var value = glsBuiltinPrecisionTests.getOutput(outputs[0], valueNdx, reference0);
                    // console.log('Shader output 0 (' + value + '), range: ' + reference0);
                    if (!glsBuiltinPrecisionTests.contains(this.Out.Out0, reference0, value)) {
                        msg = 'Shader output 0 (' + value + ') is outside acceptable range: ' + reference0;
                        result = false;
                    }
    			default: break;
    		}

    		if (!result)
    			++numErrors;

    		if (!result && numErrors <= maxMsgs) {
    			/** @type{string} */ var builder = '';

    			builder += (result ? 'Passed' : 'Failed') + '\n' + msg + '\n sample:\n';

    			if (inCount > 0) {
    				builder += '\t' + variables.in0.getName() + ' = '
    						+ inputs.in0[valueNdx] + '\n';
    			}

    			if (inCount > 1) {
    				builder += '\t' + variables.in1.getName() + ' = '
    						+ inputs.in1[valueNdx] + '\n';
    			}

    			if (inCount > 2) {
    				builder += '\t' + variables.in2.getName() + ' = '
    						+ inputs.in2[valueNdx] + '\n';
    			}

    			if (inCount > 3) {
    				builder += '\t' + variables.in3.getName() + ' = '
    						+ inputs.in3[valueNdx] + '\n';
    			}

    			if (outCount > 0) {
    				builder += '\t' + variables.out0.getName() + ' = '
    						+ outputs[0][valueNdx] + '\n'
    						+ '\tExpected range: '
    						+ reference0 + '\n';
    			}

    			if (outCount > 1) {
    				builder += '\t' + variables.out1.getName() + ' = '
    						+ outputs[1][valueNdx] + '\n'
    						+ '\tExpected range: '
    						+ reference1 + '\n';
    			}

    			bufferedLogToConsole(builder);
    		}
    	}

    	if (numErrors > maxMsgs) {
    		bufferedLogToConsole('(Skipped ' + (numErrors - maxMsgs) + ' messages.)');
    	}

    	if (numErrors == 0)	{
    		testPassed('All ' + numValues + ' inputs passed.');
    	} else {
    		testFailed('' + numErrors + '/' + numValues + ' inputs failed.');
    	}
    };

    /**
     * template <typename In, typename Out>
     * @param{glsBuiltinPrecisionTests.Variable} variable Variable<typename>
     * @return{glsShaderExecUtil.Symbol}
     */
    glsBuiltinPrecisionTests.PrecisionCase.prototype.makeSymbol = function (variable) {
        var v = variable;
		return new glsShaderExecUtil.Symbol(v.getName(), gluVarType.getVarTypeOf(v.typename, this.m_size, this.m_ctx.precision));
	};

 //    /**
 //     * template <typename typename>
 //     * @param{*} val1
 //     * @param{*} val2
 //     * @return{boolean}
 //     */
 //    glsBuiltinPrecisionTests.inputLess = function (val1, val2) {
 //        if (val1 === undefined || val2 === undefined) {
 //            return false;
 //        }

 //        if (typeof val1 == 'number' && glsBuiltinPrecisionTests.isFloat(val1)) {
 //            return glsBuiltinPrecisionTests.inputLessFloat(val1, val2);
 //        } else if (Array.isArray(val1)) {
 //            if (Array.isArray(val1[0])) {
 //                return glsBuiltinPrecisionTests.InputLessMatrix(val1, val2);
 //            } else {
 //                return glsBuiltinPrecisionTests.inputLessVector(val1, val2);
 //            }
 //        }
	//     return false;
 //    };

 //    /**
 //     * @param{number} val1
 //     * @param{number} val2
 //     * @return{boolean}
 //     */
 //    glsBuiltinPrecisionTests.inputLessFloat = function(val1, val2) {
 //    	if (isNaN(val1))
 //    	   return false;
 //    	if (isNaN(val2))
 //    		return true;
 //    	return val1 < val2;
 //    };

 //    /**
 //     * @param{Array<number>} val1
 //     * @param{Array<number>} val2
 //     * @return{boolean}
 //     */
 //    glsBuiltinPrecisionTests.inputLessVector = function(val1, val2) {
	// 	for (var ndx = 0; ndx < val1.length; ++ndx) {
	// 		if (glsBuiltinPrecisionTests.inputLessFloat(vec1[ndx], vec2[ndx]))
	// 			return true;
	// 		if (glsBuiltinPrecisionTests.inputLessFloat(vec2[ndx], vec1[ndx]))
	// 			return false;
	// 	}
	// 	return false;
 //    };

 //    /**
 //     * @param{Array<Array<number>>} mat1
 //     * @param{Array<Array<number>>} mat2
 //     * @return{boolean}
 //     */
 //    glsBuiltinPrecisionTests.InputLessMatrix = function(mat1, mat2) {
	// 	for (var col = 0; col < mat1.length; ++col)	{
	// 		if (glsBuiltinPrecisionTests.inputLessVector(mat1[col], mat2[col]))
	// 			return true;
	// 		if (glsBuiltinPrecisionTests.inputLessVector(mat2[col], mat1[col]))
	// 			return false;
	// 	}
	// 	return false;
	// };

    /**
     * template <typename In>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Tuple4}
     * @param{*} in0
     * @param{*} in1
     * @param{*} in2
     * @param{*} in3
     */
    glsBuiltinPrecisionTests.InTuple = function(in0, in1, in2, in3){
        glsBuiltinPrecisionTests.Tuple4.call(this, in0, in1, in2, in3);
    };

    glsBuiltinPrecisionTests.InTuple.prototype = Object.create(glsBuiltinPrecisionTests.Tuple4.prototype);
    glsBuiltinPrecisionTests.InTuple.prototype.constructor = glsBuiltinPrecisionTests.InTuple;

  //   /**
  //    * template <typename In>
  //    * InputLess<InTuple<In> >
  //    * @constructor
  //    * @extends{glsBuiltinPrecisionTests.Tuple4}
  //    * @param{*} In
  //    */
  //   glsBuiltinPrecisionTests.InputLess = function(in1, in2) {
  //       if (glsBuiltinPrecisionTests.inputLess(in1.a, in2.a))
		// 	return true;
		// if (glsBuiltinPrecisionTests.inputLess(in2.a, in1.a))
		// 	return false;
		// if (glsBuiltinPrecisionTests.inputLess(in1.b, in2.b))
		// 	return true;
		// if (glsBuiltinPrecisionTests.inputLess(in2.b, in1.b))
		// 	return false;
		// if (glsBuiltinPrecisionTests.inputLess(in1.c, in2.c))
		// 	return true;
		// if (glsBuiltinPrecisionTests.inputLess(in2.c, in1.c))
		// 	return false;
		// if (glsBuiltinPrecisionTests.inputLess(in1.d, in2.d))
		// 	return true;
		// return false;
  //   };

    /**
     * template<typename In>: return Inputs<In>
     * @param{*} In
     * @param{glsBuiltinPrecisionTests.Samplings} samplings Samplings<In>
     * @param{tcuFloatFormat.FloatFormat} floatFormat
     * @param{gluShaderUtil.precision} intPrecision
     * @param{number} numSamples
     * @param{deRandom.Random} rnd
     * @return{glsBuiltinPrecisionTests.Inputs}
     */
    glsBuiltinPrecisionTests.generateInputs = function (In, samplings, floatFormat, intPrecision, numSamples, rnd){
    	/*Inputs<In>*/ var ret = new glsBuiltinPrecisionTests.Inputs(In);
    	/*Inputs<In>*/ var fixedInputs = new glsBuiltinPrecisionTests.Inputs(In);
    	// set<InTuple<In>, InputLess<InTuple<In> > >	seenInputs;
        /** @type{Array<glsBuiltinPrecisionTests.InTuple,glsBuiltinPrecisionTests.InputLess>} */
        var seenInputs = [];

    	samplings.in0.genFixeds(floatFormat, fixedInputs.in0);
    	samplings.in1.genFixeds(floatFormat, fixedInputs.in1);
    	samplings.in2.genFixeds(floatFormat, fixedInputs.in2);
    	samplings.in3.genFixeds(floatFormat, fixedInputs.in3);

    	for (var ndx0 = 0; ndx0 < fixedInputs.in0.length; ++ndx0) {
    		for (var ndx1 = 0; ndx1 < fixedInputs.in1.length; ++ndx1) {
    			for (var ndx2 = 0; ndx2 < fixedInputs.in2.length; ++ndx2) {
    				for (var ndx3 = 0; ndx3 < fixedInputs.in3.length; ++ndx3) {
    					var tuple = new glsBuiltinPrecisionTests.InTuple(fixedInputs.in0[ndx0],
    												 fixedInputs.in1[ndx1],
    												 fixedInputs.in2[ndx2],
    												 fixedInputs.in3[ndx3]);

    					seenInputs.push(tuple);
    					ret.in0.push(tuple.a);
    					ret.in1.push(tuple.b);
    					ret.in2.push(tuple.c);
    					ret.in3.push(tuple.d);
    				}
    			}
    		}
    	}

    	for (var ndx = 0; ndx < numSamples; ++ndx) {
    		var in0 = samplings.in0.genRandom(floatFormat, intPrecision, rnd);
    		var in1 = samplings.in1.genRandom(floatFormat, intPrecision, rnd);
    		var in2 = samplings.in2.genRandom(floatFormat, intPrecision, rnd);
    		var in3 = samplings.in3.genRandom(floatFormat, intPrecision, rnd);
    		var tuple = new glsBuiltinPrecisionTests.InTuple(in0, in1, in2, in3);

    		// if (de::contains(seenInputs, tuple))
    		// 	continue;

    		seenInputs.push(tuple);
    		ret.in0.push(in0);
    		ret.in1.push(in1);
    		ret.in2.push(in2);
    		ret.in3.push(in3);
    	}

    	return ret;
    };


    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.PrecisionCase}
     * @param{string} name
     * @param{glsBuiltinPrecisionTests.FuncBase} func
     */
    glsBuiltinPrecisionTests.FuncCaseBase = function(context, name, func) {
        glsBuiltinPrecisionTests.PrecisionCase.call(this, context, name, func.getRequiredExtension());
    };

    glsBuiltinPrecisionTests.FuncCaseBase.prototype = Object.create(glsBuiltinPrecisionTests.PrecisionCase.prototype);
    glsBuiltinPrecisionTests.FuncCaseBase.prototype.constructor = glsBuiltinPrecisionTests.FuncCaseBase;

    glsBuiltinPrecisionTests.FuncCaseBase.prototype.iterate = function() {

        assertMsgOptions(!(this.m_extension !== undefined && this.m_extension.trim() !== '')
            && !sglrGLContext.isExtensionSupported(gl, this.m_extension),
                'Unsupported extension: ' + this.m_extension, false, true);

	    this.runTest();

	    // m_status.setTestContextResult(m_testCtx);
	    return tcuTestCase.IterateResult.STOP;
    };



    /**
     * template <typename Sig>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FuncCaseBase}
     * @param{glsBuiltinPrecisionTests.Context} context
     * @param{string} name
     * @param{glsBuiltinPrecisionTests.Func} func
     */
    glsBuiltinPrecisionTests.FuncCase = function(context, name, func) {
        glsBuiltinPrecisionTests.FuncCaseBase.call(this, context, name, func);
        this.Sig = func.Sig;
        this.m_func = func;
        this.Ret = func.Sig.Ret;
        this.Arg0 = func.Sig.Arg0;
        this.Arg1 = func.Sig.Arg1;
        this.Arg2 = func.Sig.Arg2;
        this.Arg3 = func.Sig.Arg3;
        this.In = new glsBuiltinPrecisionTests.InTypes(this.Arg0, this.Arg1, this.Arg2, this.Arg3);
        this.Out = new glsBuiltinPrecisionTests.OutTypes(this.Ret);
        this.m_size = this.m_func.m_size;
    };

    glsBuiltinPrecisionTests.FuncCase.prototype = Object.create(glsBuiltinPrecisionTests.FuncCaseBase.prototype);
    glsBuiltinPrecisionTests.FuncCase.prototype.constructor = glsBuiltinPrecisionTests.FuncCase;

    /**
     * Samplings<In>
     * @return{glsBuiltinPrecisionTests.Samplings}
     */
    glsBuiltinPrecisionTests.FuncCase.prototype.getSamplings = function()	{
        return new glsBuiltinPrecisionTests.DefaultSamplings(this.In, this.m_size);
    };

    /**
     * template <typename Sig>
     * @param{glsBuiltinPrecisionTests.Signature} Sig_
     */
    glsBuiltinPrecisionTests.FuncCase.prototype.runTest = function(Sig_) {
        /** @type{glsBuiltinPrecisionTests.Inputs} */ var inputs = (glsBuiltinPrecisionTests.generateInputs(
                                                    this.In,
                                                    this.getSamplings(),
    												this.m_ctx.floatFormat,
    												this.m_ctx.precision,
    												this.m_ctx.numRandoms,
    												this.m_rnd));

        var variables = new glsBuiltinPrecisionTests.Variables(this.In, this.Out);
    	// Variables<In, Out>	variables;
        //
    	variables.out0	= new glsBuiltinPrecisionTests.Variable(this.Ret, "out0");
    	variables.out1	= new glsBuiltinPrecisionTests.Variable('void', "out1");
    	variables.in0	= new glsBuiltinPrecisionTests.Variable(this.Arg0, "in0");
    	variables.in1	= new glsBuiltinPrecisionTests.Variable(this.Arg1, "in1");
    	variables.in2	= new glsBuiltinPrecisionTests.Variable(this.Arg2, "in2");
    	variables.in3	= new glsBuiltinPrecisionTests.Variable(this.Arg3, "in3");
        

		var	expr	= glsBuiltinPrecisionTests.applyVar(this.m_func,
									   variables.in0, variables.in1,
									   variables.in2, variables.in3);
		var	stmt	= glsBuiltinPrecisionTests.variableAssignment(variables.out0, expr);
    
		this.testStatement(variables, inputs, stmt);
    };

    /**
     * template <typename Sig>
     * return ExprP<typename Sig::Ret>
     * @param{glsBuiltinPrecisionTests.Func} func
     * @param{glsBuiltinPrecisionTests.Variable} arg0
     * @param{glsBuiltinPrecisionTests.Variable} arg1
     * @param{glsBuiltinPrecisionTests.Variable} arg2
     * @param{glsBuiltinPrecisionTests.Variable} arg3
     * @return{glsBuiltinPrecisionTests.ApplyVar}
     */
    glsBuiltinPrecisionTests.applyVar = function(func, arg0, arg1, arg2, arg3) {
        return new glsBuiltinPrecisionTests.ApplyVar(func.Sig, func, arg0, arg1, arg2, arg3)
    };

    /**
     * @param {glsBuiltinPrecisionTests.Variable} variable
     * @param {glsBuiltinPrecisionTests.ApplyVar} value
     * @param {boolean} isDeclaration
     */
    glsBuiltinPrecisionTests.variableStatement = function(variable, value, isDeclaration) {
        return new glsBuiltinPrecisionTests.VariableStatement(variable, value, isDeclaration);
    };

    /**
     * @param {glsBuiltinPrecisionTests.Variable} variable
     * @param {glsBuiltinPrecisionTests.ApplyVar} value
     */
    glsBuiltinPrecisionTests.variableAssignment = function(variable, value) {
        return glsBuiltinPrecisionTests.variableStatement(variable, value, false);
    };




    /**
     * @constructor
     */
    glsBuiltinPrecisionTests.CaseFactories = function() {};

    /**
     * @return{Array<glsBuiltinPrecisionTests.CaseFactory>}
     */
    glsBuiltinPrecisionTests.CaseFactories.prototype.getFactories = function (){};

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.CaseFactories}
     */
    glsBuiltinPrecisionTests.BuiltinFuncs = function() {
        /** @type{Array<glsBuiltinPrecisionTests.CaseFactory>} */ this.m_factories = [];
    };

    glsBuiltinPrecisionTests.BuiltinFuncs.prototype = Object.create(glsBuiltinPrecisionTests.CaseFactories.prototype);
    glsBuiltinPrecisionTests.BuiltinFuncs.prototype.constructor = glsBuiltinPrecisionTests.BuiltinFuncs;

    /**
     * @return{Array<glsBuiltinPrecisionTests.CaseFactory>}
     */
	glsBuiltinPrecisionTests.BuiltinFuncs.prototype.getFactories = function() {
		return this.m_factories.slice();
	};

    /**
     * @param{glsBuiltinPrecisionTests.CaseFactory} fact
     */
	glsBuiltinPrecisionTests.BuiltinFuncs.prototype.addFactory = function(fact)	{
		this.m_factories.push(fact);
	};

    /**
     * template <typename Sig>
     * @param{glsBuiltinPrecisionTests.Context} context
     * @param{string} name
     * @param{glsBuiltinPrecisionTests.Func} func
     * @return{glsBuiltinPrecisionTests.PrecisionCase}
     */
    glsBuiltinPrecisionTests.createFuncCase = function(context, name, func) {
    	switch (func.getOutParamIndex()) {
    		case -1:
    			return new glsBuiltinPrecisionTests.FuncCase(context, name, func);
    		// case 1:
    		// 	return new InOutFuncCase<Sig>(context, name, func);
    		default:
    			throw new Error(!"Impossible");
    	}
    };


    /**
     * @constructor
     */
    glsBuiltinPrecisionTests.CaseFactory = function () {};

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.CaseFactory.prototype.getName = function	() {
        return '';
    };

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.CaseFactory.prototype.getDesc = function	() {
        return '';
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.CaseFactory}
     */
    glsBuiltinPrecisionTests.FuncCaseFactory = function()  {
        glsBuiltinPrecisionTests.CaseFactory.call(this);
    };

    setParentClass(glsBuiltinPrecisionTests.FuncCaseFactory, glsBuiltinPrecisionTests.CaseFactory);

    glsBuiltinPrecisionTests.FuncCaseFactory.prototype.getFunc = function() {
        throw new Error('Virtual function. Please override.');
    };

    glsBuiltinPrecisionTests.FuncCaseFactory.prototype.getName = function()
    {
        return this.getFunc().getName().toLowerCase();
    };

    glsBuiltinPrecisionTests.FuncCaseFactory.prototype.getDesc = function()
    {
        return "Function '" + this.getFunc().getName() + "'";
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.FuncCaseFactory}
     */
    glsBuiltinPrecisionTests.TemplateFuncCaseFactory = function(genF) {
        glsBuiltinPrecisionTests.FuncCaseFactory.call(this);
        this.m_genF = genF;        
    };

    setParentClass(glsBuiltinPrecisionTests.TemplateFuncCaseFactory, glsBuiltinPrecisionTests.FuncCaseFactory);

    glsBuiltinPrecisionTests.TemplateFuncCaseFactory.prototype.getFunc = function() {
        return new this.m_genF(1);
    };

    /**
     * @param{glsBuiltinPrecisionTests.Context} ctx
     */
    glsBuiltinPrecisionTests.TemplateFuncCaseFactory.prototype.createCase = function(ctx) {
        var group = tcuTestCase.newTest(ctx.name, ctx.name);
        group.addChild(glsBuiltinPrecisionTests.createFuncCase(ctx, 'scalar', new this.m_genF(1)));
        group.addChild(glsBuiltinPrecisionTests.createFuncCase(ctx, 'vec2', new this.m_genF(2)));
        group.addChild(glsBuiltinPrecisionTests.createFuncCase(ctx, 'vec3', new this.m_genF(3)));
        group.addChild(glsBuiltinPrecisionTests.createFuncCase(ctx, 'vec4', new this.m_genF(4)));

        return group;
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.FuncCaseFactory}
     */
    glsBuiltinPrecisionTests.MatrixFuncCaseFactory = function(genF)  {
        glsBuiltinPrecisionTests.FuncCaseFactory.call(this);
        this.m_genF = genF;
    };

    setParentClass(glsBuiltinPrecisionTests.MatrixFuncCaseFactory, glsBuiltinPrecisionTests.FuncCaseFactory);

    glsBuiltinPrecisionTests.MatrixFuncCaseFactory.prototype.getFunc = function() {
        return new this.m_genF(2, 2);
    };

    /**
     * @param{glsBuiltinPrecisionTests.Context} ctx
     */
    glsBuiltinPrecisionTests.MatrixFuncCaseFactory.prototype.createCase = function(ctx) {
        var group = tcuTestCase.newTest(ctx.name, ctx.name);
        this.addCase(ctx, group, 2, 2);
        this.addCase(ctx, group, 3, 2);
        this.addCase(ctx, group, 4, 2);
        this.addCase(ctx, group, 2, 3);
        this.addCase(ctx, group, 3, 3);
        this.addCase(ctx, group, 4, 3);
        this.addCase(ctx, group, 2, 4);
        this.addCase(ctx, group, 3, 4);
        this.addCase(ctx, group, 4, 4);

        return group;
    };

   /**
     * @param{glsBuiltinPrecisionTests.Context} ctx
     * @param {tcuTestCase.DeqpTest} group
     * @param {number} rows
     * @param {number} cols
     */
    glsBuiltinPrecisionTests.MatrixFuncCaseFactory.prototype.addCase = function(ctx, group, rows, cols) {
        var name = glsBuiltinPrecisionTests.dataTypeNameOfMatrix('float', rows, cols);
        group.addChild(glsBuiltinPrecisionTests.createFuncCase(ctx, name, new this.m_genF(rows, cols)));
    };

    glsBuiltinPrecisionTests.dataTypeNameOfMatrix = function(typename, rows, cols) {
        switch(typename) {
            case 'float':
                if (rows === cols)
                    return 'mat' + rows;
                else
                    return 'mat' + cols + 'x' + rows;
        }
        throw new Error('Invalid arguments (' + typename + ', ' + rows + ', ' + cols + ')');
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.FuncCaseFactory}
     */
    glsBuiltinPrecisionTests.SquareMatrixFuncCaseFactory = function(genF)  {
        glsBuiltinPrecisionTests.FuncCaseFactory.call(this);
        this.m_genF = genF;
    };

    setParentClass(glsBuiltinPrecisionTests.SquareMatrixFuncCaseFactory, glsBuiltinPrecisionTests.FuncCaseFactory);

    glsBuiltinPrecisionTests.SquareMatrixFuncCaseFactory.prototype.getFunc = function() {
        return new this.m_genF(2);
    };

    /**
     * @param{glsBuiltinPrecisionTests.Context} ctx
     */
    glsBuiltinPrecisionTests.SquareMatrixFuncCaseFactory.prototype.createCase = function(ctx) {
        var group = tcuTestCase.newTest(ctx.name, ctx.name);

        group.addChild(glsBuiltinPrecisionTests.createFuncCase(ctx, "mat2", new this.m_genF(2)));
        return group;
    };


    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.PrimitiveFunc}
     * @param{glsBuiltinPrecisionTests.Func} scalarFunc
     * @param{number=} size
     */
    glsBuiltinPrecisionTests.GenFunc = function(scalarFunc, size) {
        glsBuiltinPrecisionTests.PrimitiveFunc.call(this, scalarFunc.Sig);
        this.m_func = scalarFunc;
        this.m_size = size;
    };

    glsBuiltinPrecisionTests.GenFunc.prototype = Object.create(glsBuiltinPrecisionTests.PrimitiveFunc.prototype);
    glsBuiltinPrecisionTests.GenFunc.prototype.constructor = glsBuiltinPrecisionTests.GenFunc;

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.getName = function() {
       return this.m_func.getName();
    };

    /**
     * @return{number}
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.getOutParamIndex = function() {
       return this.m_func.getOutParamIndex();
    };

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.getRequiredExtension = function() {
       return this.m_func.getRequiredExtension();
    };

    /**
     * @param{Array<glsBuiltinPrecisionTests.ExprBase>} args
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.doPrint = function(args) {
       return this.m_func.print(args);
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.Tuple4} iargs
     * @return{*}
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.doApply = function(ctx, iargs) {
        /** @type{Array<*>} */ var ret = [];

        if (this.m_size > 1) {
            for (var ndx = 0; ndx < this.m_size; ++ndx) {
                ret[ndx] = this.m_func.applyFunction(ctx, iargs.a[ndx], iargs.b[ndx], iargs.c[ndx], iargs.d[ndx]);
            }
        } else
            ret[0] = this.m_func.applyFunction(ctx, iargs.a, iargs.b, iargs.c, iargs.d);

        return ret;
    };

    /**
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.doGetUsedFuncs = function(dst) {
    	this.m_func.getUsedFuncs(dst);
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.GenFunc}
     * @param{glsBuiltinPrecisionTests.Func} func
     * @param{number} size
     */
     glsBuiltinPrecisionTests.VectorizedFunc = function(func, size) {
         glsBuiltinPrecisionTests.GenFunc.call(this, func, size);
    };

    glsBuiltinPrecisionTests.VectorizedFunc.prototype = Object.create(glsBuiltinPrecisionTests.GenFunc.prototype);
    glsBuiltinPrecisionTests.VectorizedFunc.prototype.constructor = glsBuiltinPrecisionTests.VectorizedFunc;

    /**
     * @constructor
     * @param{glsBuiltinPrecisionTests.Func} func_
     * @param{glsBuiltinPrecisionTests.GenFunc} func2_
     * @param{glsBuiltinPrecisionTests.GenFunc} func3_
     * @param{glsBuiltinPrecisionTests.GenFunc} func4_
     */
    glsBuiltinPrecisionTests.GenFuncs = function(func_, func2_, func3_, func4_) {
        this.func = func_;
        this.func2 = func2_;
        this.func3 = func3_;
        this.func4 = func4_;
    };

    /**
     * template <typename Sig>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.CaseFactory}
     * @param{glsBuiltinPrecisionTests.GenFuncs} funcs
     * @param{string} name
     */
    glsBuiltinPrecisionTests.GenFuncCaseFactory = function (funcs, name) {
        glsBuiltinPrecisionTests.CaseFactory.call(this);
        this.m_funcs = funcs;
        this.m_name = name;
    };

    glsBuiltinPrecisionTests.GenFuncCaseFactory.prototype = Object.create(glsBuiltinPrecisionTests.CaseFactory.prototype);
    glsBuiltinPrecisionTests.GenFuncCaseFactory.prototype.constructor = glsBuiltinPrecisionTests.GenFuncCaseFactory;

    /**
     * template <typename Sig>
     * @param{glsBuiltinPrecisionTests.Context} ctx
     * @return{tcuTestCase.DeqpTest}
     */
    glsBuiltinPrecisionTests.GenFuncCaseFactory.prototype.createCase = function(ctx) {
        /** @type {tcuTestCase.DeqpTest} */
        var group = tcuTestCase.newTest(ctx.name, ctx.name);
		group.addChild(glsBuiltinPrecisionTests.createFuncCase(ctx, 'scalar', this.m_funcs.func));
		group.addChild(glsBuiltinPrecisionTests.createFuncCase(ctx, 'vec2', this.m_funcs.func2));
		group.addChild(glsBuiltinPrecisionTests.createFuncCase(ctx, 'vec3', this.m_funcs.func3));
		group.addChild(glsBuiltinPrecisionTests.createFuncCase(ctx, 'vec4', this.m_funcs.func4));

		return group;
	};

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.GenFuncCaseFactory.prototype.getName = function() {
		return this.m_name;
	};

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.GenFuncCaseFactory.prototype.getDesc = function() {
		return "Function '" + this.m_funcs.func.getName() + "'";
	};

    /**
     * @constructor
     * @param{string} name_
     * @param{tcuFloatFormat.FloatFormat} floatFormat_
     * @param{tcuFloatFormat.FloatFormat} highpFormat_
     * @param{gluShaderUtil.precision} precision_
     * @param{gluShaderProgram.shaderType} shaderType_
     * @param{number} numRandoms_
     */
    glsBuiltinPrecisionTests.Context = function(name_, floatFormat_, highpFormat_, precision_, shaderType_, numRandoms_) {
        /** @type{string} */ this.name = name_ ;
        /** @type{tcuFloatFormat.FloatFormat} */ this.floatFormat = floatFormat_;
        /** @type{tcuFloatFormat.FloatFormat} */ this.highpFormat =highpFormat_;
        /** @type{gluShaderUtil.precision} */ this.precision = precision_;
        /** @type{gluShaderProgram.shaderType} */ this.shaderType = shaderType_;
        /** @type{number} */ this.numRandoms = numRandoms_;
    };

    /**
     * @constructor
     * @param{tcuFloatFormat.FloatFormat} highp_
     * @param{tcuFloatFormat.FloatFormat} mediump_
     * @param{tcuFloatFormat.FloatFormat} lowp_
     * @param{Array<gluShaderProgram.shaderType>} shaderTypes_
     * @param{number} numRandoms_
     */
    glsBuiltinPrecisionTests.PrecisionTestContext = function(highp_, mediump_, lowp_, shaderTypes_, numRandoms_) {
        /** @type{Array<gluShaderProgram.shaderType>} */ this.shaderTypes = shaderTypes_;
        /** @type{Array<tcuFloatFormat.FloatFormat>} */ this.formats = [];
        this.formats[gluShaderUtil.precision.PRECISION_HIGHP] = highp_;
        this.formats[gluShaderUtil.precision.PRECISION_MEDIUMP] = mediump_;
        this.formats[gluShaderUtil.precision.PRECISION_LOWP] = lowp_;
        /** @type{number} */ this.numRandoms = numRandoms_;
    };

    /**
     * \brief Simple incremental counter.
     *
     * This is used to make sure that different ExpandContexts will not produce
     * overlapping temporary names.
     * @constructor
     *
     */
    glsBuiltinPrecisionTests.Counter = function()
    {
        this.m_count = 0;
    };

    glsBuiltinPrecisionTests.Counter.prototype.get = function() {
        return this.m_count++;
    };

    /**
     * @constructor
     */
    glsBuiltinPrecisionTests.ExpandContext = function(counter)     {
        this.m_counter = counter;
        this.m_statements = [];
    };

    glsBuiltinPrecisionTests.ExpandContext.prototype.genSym = function(typename, baseName)
    {
        return new glsBuiltinPrecisionTests.Variable(typename, baseName + this.m_counter.get());
    };

    glsBuiltinPrecisionTests.ExpandContext.prototype.addStatement = function   (/*const StatementP&*/ stmt)
    {
        this.m_statements.push(stmt);
    };

    glsBuiltinPrecisionTests.ExpandContext.prototype.getStatements = function()
    {
        return this.m_statements;
    };

    /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.Func}
     * @param{glsBuiltinPrecisionTests.Signature} Sig_ template <typename Sig_>     
     */
    glsBuiltinPrecisionTests.DerivedFunc = function(Sig_) {
        glsBuiltinPrecisionTests.Func.call(this, Sig_);
    };

    setParentClass(glsBuiltinPrecisionTests.DerivedFunc, glsBuiltinPrecisionTests.Func);

    glsBuiltinPrecisionTests.DerivedFunc.prototype.doPrintDefinition = function() {
        var os = '';
        var paramNames  = this.getParamNames();

        this.initialize();

        os += this.Ret + " " + this.getName()
            + "(";
        if (glsBuiltinPrecisionTests.isTypeValid(this.Arg0))
            os += this.Arg0 + " " + paramNames.a;
        if (glsBuiltinPrecisionTests.isTypeValid(this.Arg1))
            os += ", " + this.Arg1 + " " + paramNames.b;
        if (glsBuiltinPrecisionTests.isTypeValid(this.Arg2))
            os += ", " + this.Arg2 + " " + paramNames.c;
        if (glsBuiltinPrecisionTests.isTypeValid(this.Arg3))
            os += ", " + this.Arg3 + " " + paramNames.d;
        os += ")\n{\n";

        for (var ndx = 0; ndx < this.m_body.length; ++ndx)
            os += this.m_body[ndx];
        os += "return " + this.m_ret + ";\n";
        os += "}\n";

        return os;
    };

    glsBuiltinPrecisionTests.DerivedFunc.prototype.doApply = function(ctx, args)  {
        var funEnv = new glsBuiltinPrecisionTests.Environment();
        this.initialize();

        funEnv.bind(this.m_var0, args.a);
        funEnv.bind(this.m_var1, args.b);
        funEnv.bind(this.m_var2, args.c);
        funEnv.bind(this.m_var3, args.d);

        var funCtx = new glsBuiltinPrecisionTests.EvalContext(ctx.format, ctx.floatPrecision, funEnv, ctx.callDepth);

        for (var ndx = 0; ndx < this.m_body.length; ++ndx)
            this.m_body[ndx].execute(funCtx);

        var ret = this.m_ret.evaluate(funCtx);


        // \todo [lauri] Store references instead of values in environment
        args.a = funEnv.lookup(this.m_var0);
        args.b = funEnv.lookup(this.m_var1);
        args.c = funEnv.lookup(this.m_var2);
        args.d = funEnv.lookup(this.m_var3);

        return ret;
    };

    glsBuiltinPrecisionTests.DerivedFunc.prototype.initialize = function(){
        if (!this.m_ret)
        {
            var paramNames  = this.getParamNames();
            var symCounter = new glsBuiltinPrecisionTests.Counter();
            var ctx = new  glsBuiltinPrecisionTests.ExpandContext(symCounter);

            this.m_var0 = new glsBuiltinPrecisionTests.Variable(this.Arg0, paramNames.a);
            this.m_var1 = new glsBuiltinPrecisionTests.Variable(this.Arg1, paramNames.b);
            this.m_var2 = new glsBuiltinPrecisionTests.Variable(this.Arg2, paramNames.c);
            this.m_var3 = new glsBuiltinPrecisionTests.Variable(this.Arg3, paramNames.d);
            var args = new glsBuiltinPrecisionTests.Tuple4(this.m_var0,
                this.m_var1, this.m_var2, this.m_var3);


            this.m_ret   = this.doExpand(ctx, args);
            this.m_body  = ctx.getStatements();
        }
    };

    glsBuiltinPrecisionTests.sizeToName = function(size) {
        switch (size) {
            case 4: return 'vec4';
            case 3: return 'vec3';
            case 2: return 'vec2';
        }
        return 'float';
    };

    /**
     * @constructor
     * @param {number} size
     * @extends {glsBuiltinPrecisionTests.DerivedFunc}
     */
    glsBuiltinPrecisionTests.Dot = function(size) {
        var name = glsBuiltinPrecisionTests.sizeToName(size);
        var sig = new glsBuiltinPrecisionTests.Signature('float', name, name);        
        glsBuiltinPrecisionTests.DerivedFunc.call(this, sig);
        this.m_inputSize = size;
    };

    setParentClass(glsBuiltinPrecisionTests.Dot, glsBuiltinPrecisionTests.DerivedFunc);

    glsBuiltinPrecisionTests.Dot.prototype.getName = function() {
        return 'dot';
    };

    glsBuiltinPrecisionTests.Dot.prototype.doExpand = function(ctx, args) {
        if (this.m_inputSize > 1) {
            var val = new glsBuiltinPrecisionTests.Apply('float', new glsBuiltinPrecisionTests.Mul(),
                new glsBuiltinPrecisionTests.VectorVariable(args.a, 0), new glsBuiltinPrecisionTests.VectorVariable(args.b, 0));
            for (var i = 0; i < this.m_inputSize; i++) {
                var tmp =  new glsBuiltinPrecisionTests.Apply('float', new glsBuiltinPrecisionTests.Mul(),
                    new glsBuiltinPrecisionTests.VectorVariable(args.a, i), new glsBuiltinPrecisionTests.VectorVariable(args.b, i));
                val = new glsBuiltinPrecisionTests.Apply('float', new glsBuiltinPrecisionTests.Add(), val, tmp);
            }
            return val;
        } else {
            // args.a * args.b
            var ret = new glsBuiltinPrecisionTests.Apply('float', new glsBuiltinPrecisionTests.Mul(), args.a, args.b);
            return ret;
        }
    };


    /**
     * @constructor
     * @param {number} size
     * @extends {glsBuiltinPrecisionTests.DerivedFunc}
     */
    glsBuiltinPrecisionTests.DeterminantBase  = function(size) {
        var sig = new glsBuiltinPrecisionTests.Signature('float', 'mat' + size);
        glsBuiltinPrecisionTests.DerivedFunc.call(this, sig);
    };

    setParentClass(glsBuiltinPrecisionTests.DeterminantBase, glsBuiltinPrecisionTests.DerivedFunc);

    glsBuiltinPrecisionTests.DeterminantBase.prototype.getName = function() {
        return 'determinant';
    };

   /**
     * @constructor
     * @extends {glsBuiltinPrecisionTests.DeterminantBase}
     */
    glsBuiltinPrecisionTests.Determinant  = function() {
        // TODO: Support sizes 3 and 4
        this.size = 2;
        glsBuiltinPrecisionTests.DeterminantBase.call(this, this.size);
    };

    setParentClass(glsBuiltinPrecisionTests.Determinant, glsBuiltinPrecisionTests.DeterminantBase);

    glsBuiltinPrecisionTests.Determinant.prototype.doExpand = function(ctx, args) {
        //  mat[0][0] * mat[1][1] - mat[1][0] * mat[0][1]
        var elem0_0 = new glsBuiltinPrecisionTests.MatrixVariable(args.a, 0, 0);
        var elem0_1 = new glsBuiltinPrecisionTests.MatrixVariable(args.a, 0, 1);
        var elem1_0 = new glsBuiltinPrecisionTests.MatrixVariable(args.a, 1, 0);
        var elem1_1 = new glsBuiltinPrecisionTests.MatrixVariable(args.a, 1, 1);

        var val0 = new glsBuiltinPrecisionTests.Apply('float', new glsBuiltinPrecisionTests.Mul(), elem0_0, elem1_1);
        var val1 = new glsBuiltinPrecisionTests.Apply('float', new glsBuiltinPrecisionTests.Mul(), elem0_1, elem1_0);
        return new glsBuiltinPrecisionTests.Apply('float', new glsBuiltinPrecisionTests.Sub(), val0, val1);
    };

    /**
     * @param{glsBuiltinPrecisionTests.PrecisionTestContext} ctx
     * @param{glsBuiltinPrecisionTests.CaseFactory} factory
     * @return {tcuTestCase.DeqpTest}
     */
    glsBuiltinPrecisionTests.createFuncGroup = function (ctx, factory) {
        /** @type{tcuTestCase.DeqpTest} */ var group = tcuTestCase.newTest(factory.getName(), factory.getDesc());

	    for (var precNdx in gluShaderUtil.precision) {
    		/** @type{gluShaderUtil.precision} */ var precision = gluShaderUtil.precision[precNdx];
    		/** @type{string} */ var precName = gluShaderUtil.getPrecisionName(precision);
    		/** @type{tcuFloatFormat.FloatFormat} */ var fmt	= ctx.formats[precision];
    		/** @type{tcuFloatFormat.FloatFormat} */ var highpFmt = ctx.formats[gluShaderUtil.precision.PRECISION_HIGHP];

    		for (var shaderNdx in ctx.shaderTypes)
    		{
    			/** @type{gluShaderProgram.shaderType} */ var shaderType = ctx.shaderTypes[shaderNdx];
    			/** @type{string} */ var shaderName	= gluShaderProgram.getShaderTypeName(shaderType);
    			/** @type{string} */ var name = precName + '_' + shaderName;
    			/** @type{glsBuiltinPrecisionTests.Context} */ var caseCtx = new glsBuiltinPrecisionTests.Context(name, fmt, highpFmt,
    											 precision, shaderType, ctx.numRandoms);

    			group.addChild(factory.createCase(caseCtx));
    		}
	    }

	    return group;
    };

    /**
     * @param{glsBuiltinPrecisionTests.CaseFactories} cases
     * @param{Array<gluShaderProgram.shaderType>} shaderTypes
     * @param{tcuTestCase.DeqpTest} dstGroup
     */
    glsBuiltinPrecisionTests.addBuiltinPrecisionTests = function(cases, shaderTypes, dstGroup) {
	    /** @type{tcuFloatFormat.FloatFormat} */ var highp	= new tcuFloatFormat.FloatFormat(-126, 127, 23, true,
												 tcuFloatFormat.YesNoMaybe.MAYBE,	// subnormals
												 tcuFloatFormat.YesNoMaybe.YES,		// infinities
												 tcuFloatFormat.YesNoMaybe.MAYBE);	// NaN
	    // \todo [2014-04-01 lauri] Check these once Khronos bug 11840 is resolved.
	    /** @type{tcuFloatFormat.FloatFormat} */ var mediump = new tcuFloatFormat.FloatFormat(-13, 13, 9, false);
	    // A fixed-point format is just a floating point format with a fixed
	    // exponent and support for subnormals.
	    /** @type{tcuFloatFormat.FloatFormat} */ var lowp	= new tcuFloatFormat.FloatFormat(0, 0, 7, false, tcuFloatFormat.YesNoMaybe.YES);
	    /** @type{glsBuiltinPrecisionTests.PrecisionTestContext} */ var ctx	= new glsBuiltinPrecisionTests.PrecisionTestContext(highp, mediump, lowp,
												 shaderTypes, 16384);

	    for (var ndx = 0; ndx < cases.getFactories().length; ++ndx)
		    dstGroup.addChild(glsBuiltinPrecisionTests.createFuncGroup(ctx, cases.getFactories()[ndx]));
    };

    /**
     * @param {function(new:glsBuiltinPrecisionTests.Func)} F
     * @param {glsBuiltinPrecisionTests.CaseFactories} funcs
     * @param {string=} name
     */
    glsBuiltinPrecisionTests.addScalarFactory = function(F, funcs, name) {
    	if (name === undefined)
    		name = (new F()).getName();

        funcs.addFactory(new glsBuiltinPrecisionTests.GenFuncCaseFactory(glsBuiltinPrecisionTests.makeVectorizedFuncs(F), name));
    }

    /**
     * @return {glsBuiltinPrecisionTests.CaseFactories}
     */
    glsBuiltinPrecisionTests.createES3BuiltinCases = function() {
    	/** @type{glsBuiltinPrecisionTests.CaseFactories} */ var funcs = new glsBuiltinPrecisionTests.BuiltinFuncs();

        glsBuiltinPrecisionTests.addScalarFactory(glsBuiltinPrecisionTests.Add, funcs);
	    glsBuiltinPrecisionTests.addScalarFactory(glsBuiltinPrecisionTests.Sub, funcs);
	// addScalarFactory<Mul>(*funcs);
	// addScalarFactory<Div>(*funcs);
    //
	// addScalarFactory<Radians>(*funcs);
	// addScalarFactory<Degrees>(*funcs);
	// addScalarFactory<Sin>(*funcs);
	// addScalarFactory<Cos>(*funcs);
	// addScalarFactory<Tan>(*funcs);
	// addScalarFactory<ASin>(*funcs);
	// addScalarFactory<ACos>(*funcs);
	// addScalarFactory<ATan2>(*funcs, "atan2");
	// addScalarFactory<ATan>(*funcs);
	// addScalarFactory<Sinh>(*funcs);
	// addScalarFactory<Cosh>(*funcs);
	// addScalarFactory<Tanh>(*funcs);
	// addScalarFactory<ASinh>(*funcs);
	// addScalarFactory<ACosh>(*funcs);
	// addScalarFactory<ATanh>(*funcs);
    //
	// addScalarFactory<Pow>(*funcs);
	// addScalarFactory<Exp>(*funcs);
	// addScalarFactory<Log>(*funcs);
	// addScalarFactory<Exp2>(*funcs);
	// addScalarFactory<Log2>(*funcs);
	// addScalarFactory<Sqrt>(*funcs);
	// addScalarFactory<InverseSqrt>(*funcs);
    //
	// addScalarFactory<Abs>(*funcs);
	// addScalarFactory<Sign>(*funcs);
	// addScalarFactory<Floor>(*funcs);
	// addScalarFactory<Trunc>(*funcs);
	// addScalarFactory<Round>(*funcs);
	// addScalarFactory<RoundEven>(*funcs);
	// addScalarFactory<Ceil>(*funcs);
	// addScalarFactory<Fract>(*funcs);
	// addScalarFactory<Mod>(*funcs);
	// funcs.addFactory(createSimpleFuncCaseFactory<Modf>());
	// addScalarFactory<Min>(*funcs);
	// addScalarFactory<Max>(*funcs);
	// addScalarFactory<Clamp>(*funcs);
	// addScalarFactory<Mix>(*funcs);
	// addScalarFactory<Step>(*funcs);
	// addScalarFactory<SmoothStep>(*funcs);
    //
	// funcs.addFactory(new glsBuiltinPrecisionTests.TemplateFuncCaseFactory(glsBuiltinPrecisionTests.Length));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Distance>()));
    funcs.addFactory(new glsBuiltinPrecisionTests.TemplateFuncCaseFactory(glsBuiltinPrecisionTests.Dot));
	// funcs.addFactory(createSimpleFuncCaseFactory<Cross>());
    // funcs.addFactory(new glsBuiltinPrecisionTests.TemplateFuncCaseFactory(glsBuiltinPrecisionTests.Normalize));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Normalize>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<FaceForward>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Reflect>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Refract>()));
    //
    //
    funcs.addFactory(new glsBuiltinPrecisionTests.MatrixFuncCaseFactory(glsBuiltinPrecisionTests.MatrixCompMult));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new MatrixFuncCaseFactory<MatrixCompMult>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new MatrixFuncCaseFactory<OuterProduct>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new MatrixFuncCaseFactory<Transpose>()));
	funcs.addFactory(new glsBuiltinPrecisionTests.SquareMatrixFuncCaseFactory(glsBuiltinPrecisionTests.Determinant));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new SquareMatrixFuncCaseFactory<Inverse>()));

    	return funcs;
    };

});
