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

goog.scope(function() {

    var glsBuiltinPrecisionTests = modules.shared.glsBuiltinPrecisionTests;
    var tcuTestCase = framework.common.tcuTestCase;
    var gluShaderProgram = framework.opengl.gluShaderProgram;
    var gluShaderUtil = framework.opengl.gluShaderUtil;
    var tcuInterval = framework.common.tcuInterval;
    var tcuFloatFormat = framework.common.tcuFloatFormat;
    var deRandom = framework.delibs.debase.deRandom;
    var glsShaderExecUtil = modules.shared.glsShaderExecUtil;


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
            <Matrix<T,Rows,Cols>,vector<T,size>>
                ContainerTraits
        uses . Tuple4<>


     */

    /**
     * @param{number} value
     */
    glsBuiltinPrecisionTests.isFloat = function(t) {
        return (Math.abs(t % 1) != 0);
 	};

    /**
     * @constructor
     * @param{*=} t
     */
    glsBuiltinPrecisionTests.Void = function(t) {
        this.isVoid = true;
	};

    /**
     * @constructor
     * @param{*} R
     * @param{*} P0
     * @param{*} P1
     * @param{*} P2
     * @param{*} P3
     */
    glsBuiltinPrecisionTests.Signature = function (R, P0, P1, P2, P3) {
        this.Ret = R;
        this.Arg0 = P0 === undefined ? new glsBuiltinPrecisionTests.Void() : P0;
        this.Arg1 = P1 === undefined ? new glsBuiltinPrecisionTests.Void() : P1;
        this.Arg2 = P2 === undefined ? new glsBuiltinPrecisionTests.Void() : P2;
        this.Arg3 = P3 === undefined ? new glsBuiltinPrecisionTests.Void() : P3;

        this.IRet = new glsBuiltinPrecisionTests.Traits(this.Ret).traitsFactory();
        this.IArg0 = new glsBuiltinPrecisionTests.Traits(this.Arg0).traitsFactory();
        this.IArg1 = new glsBuiltinPrecisionTests.Traits(this.Arg1).traitsFactory();
        this.IArg2 = new glsBuiltinPrecisionTests.Traits(this.Arg2).traitsFactory();
        this.IArg3 = new glsBuiltinPrecisionTests.Traits(this.Arg3).traitsFactory();

        this.Args = new glsBuiltinPrecisionTests.Tuple4(this.Arg0, this.Arg1, this.Arg2, this.Arg3);
        this.IArgs = new glsBuiltinPrecisionTests.Tuple4(this.IArg0, this.IArg1, this.IArg2, this.IArg3);

    	// typedef Tuple4<	ExprP<Arg0>,	ExprP<Arg1>,	ExprP<Arg2>,	ExprP<Arg3> >	ArgExprs;
    };

    /**
     * @typedef {glsBuiltinPrecisionTests.Tuple4}
     */
    glsBuiltinPrecisionTests.ParamNames;

    /**
     * @constructor
     * @param{tcuInterval.Interval} A0
     * @param{tcuInterval.Interval} A1
     * @param{tcuInterval.Interval} A2
     * @param{tcuInterval.Interval} A3
     */
    glsBuiltinPrecisionTests.Tuple4 = function(A0, A1, A2, A3) {
        this.a = A0 === undefined ? new glsBuiltinPrecisionTests.Void() : A0;
        this.b = A1 === undefined ? new glsBuiltinPrecisionTests.Void() : A1;
        this.c = A2 === undefined ? new glsBuiltinPrecisionTests.Void() : A2;
        this.d = A3 === undefined ? new glsBuiltinPrecisionTests.Void() : A3;
    };

    /**
     * Returns true for all other types except Void
     * @param{} T
     */
    glsBuiltinPrecisionTests.isTypeValid = function(T) {
        if (T.isVoid) {
            return false;
        } else {
            return true;
        }
    };

    template <typename In>
    /**
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
     * template<typename In0_ = Void, typename In1_ = Void, typename In2_ = Void, typename In3_ = Void>
     * @constructor
     * @param{*} In0_
     * @param{*} In1_
     * @param{*} In2_
     * @param{*} In3_
     */
    glsBuiltinPrecisionTests.InTypes = function(In0_, In1_, In2_, In3_) {
        this.In0 = In0_ === undefined ? new glsBuiltinPrecisionTests.Void() : In0_;
        this.In1 = In1_ === undefined ? new glsBuiltinPrecisionTests.Void() : In1_;
        this.In2 = In2_ === undefined ? new glsBuiltinPrecisionTests.Void() : In2_;
        this.In3 = In3_ === undefined ? new glsBuiltinPrecisionTests.Void() : In3_;
    };

    /**
     * template<typename Out0_, typename Out1_ = Void>
     * @constructor
     * @param{*} Out0_
     * @param{*} Out1_
     */
    glsBuiltinPrecisionTests.OutTypes = function(Out0_, Out1_) {
        this.Out0 = Out0_ === undefined ? new glsBuiltinPrecisionTests.Void() : Out0_;
        this.Out1 = Out1_ === undefined ? new glsBuiltinPrecisionTests.Void() : Out1_;
    };

    /**
     * @constructor
     * @param{tcuFloatFormat.FloatFormat} format_
     * @param{glsBuiltinPrecisionTests.Precision} floatPrecision_
     * @param{glsBuiltinPrecisionTests.Environment} env_
     * @param{number?} callDepth_
     */
    glsBuiltinPrecisionTests.EvalContext = function (format_, floatPrecision_, env_, callDepth_) {
		this.format = format_;
		this.floatPrecision = floatPrecision_;
		this.env = env_;
		this.callDepth = callDepth_ === undefined ? 0 : callDepth_;
    };

    /**
     * @param{*} T
     */
    glsBuiltinPrecisionTests.Traits = function(T) {
        this.typename = T;
    };

    /**
     * @param{*} T
     */
    glsBuiltinPrecisionTests.Traits.prototype.traitsFactory = function() {
        if (Array.isArray(this.typename)) {
            return new glsBuiltinPrecisionTests.ContainerTraits();
        } else if (typeof this.typename === 'boolean') {
            return new glsBuiltinPrecisionTests.TraitsBool();
        } else if (glsBuiltinPrecisionTests.isFloat(this.typename)) {
            return new glsBuiltinPrecisionTests.TraitsFloat();
        } else if (typeof this.typename === 'number') {
            return new glsBuiltinPrecisionTests.TraitsInt();
        }
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Traits}
     * @param{*} typename
     */
    glsBuiltinPrecisionTests.ScalarTraits = function(t) {
        glsBuiltinPrecisionTests.Traits.call(this);
        // typedef 	Interval IVal;
        /** type{tcuInterval.Interval} */ this.iVal;
    };

    /**
     * @param{*} value
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ScalarTraits.prototype.doMakeIVal = function(value) {
		// Thankfully all scalar types have a well-defined conversion to `double`,
		// hence Interval can represent their ranges without problems.
		return new tcuInterval.Interval(value); // TODO: cast to double
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
     * @param{*} value
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.ScalarTraits.prototype.doContains = function(a, value)	{
		return a.contains(value);//TODO cast to double
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
     * @param{*} value
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ScalarTraits.prototype.doRound	= function(fmt, value) {
		return fmt.roundOut(value, false);//TODO cast to double
	};

    glsBuiltinPrecisionTests.ScalarTraits.prototype = Object.create(glsBuiltinPrecisionTests.Traits.prototype);
    glsBuiltinPrecisionTests.ScalarTraits.prototype.constructor = glsBuiltinPrecisionTests.ScalarTraits;

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ScalarTraits}
     * @param{*} typename
     */
    glsBuiltinPrecisionTests.TraitsFloat = function(t) {
    };

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     */
    glsBuiltinPrecisionTests.TraitsFloat.prototype.doPrintIVal = function(fmt, ival) {
		bufferedLogToConsole(fmt.intervalToHex(ival));
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{number} value
     */
    glsBuiltinPrecisionTests.TraitsFloat.prototype.doPrintValue	= function(fmt, value) {
		bufferedLogToConsole(fmt.floatToHex(value));
	};

    glsBuiltinPrecisionTests.TraitsFloat.prototype = Object.create(glsBuiltinPrecisionTests.ScalarTraits.prototype);
    glsBuiltinPrecisionTests.TraitsFloat.prototype.constructor = glsBuiltinPrecisionTests.TraitsFloat;

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ScalarTraits}
     */
    glsBuiltinPrecisionTests.TraitsBool = function() {};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     */
    glsBuiltinPrecisionTests.TraitsBool.prototype.doPrintIVal = function(fmt, ival) {
        /** type{string} */ var os = '{';
		if (ival.contains(false))
			os += 'false';
		if (ival.contains(false) && ival.contains(true))
			os += ', ';
		if (ival.contains(true))
			os += 'true';
		os += '}';
        bufferedLogToConsole(os);
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{number} value
     */
    glsBuiltinPrecisionTests.TraitsBool.prototype.doPrintValue	= function(fmt, value) {
		bufferedLogToConsole(value ? 'true' : 'false');
	};

    glsBuiltinPrecisionTests.TraitsBool.prototype = Object.create(glsBuiltinPrecisionTests.ScalarTraits.prototype);
    glsBuiltinPrecisionTests.TraitsBool.prototype.constructor = glsBuiltinPrecisionTests.TraitsBool;

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ScalarTraits}
     */
    glsBuiltinPrecisionTests.TraitsInt = function() {};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     */
    glsBuiltinPrecisionTests.TraitsInt.prototype.doPrintIVal = function(fmt, ival) {
		bufferedLogToConsole('[' + (ival.lo()) + ', ' + (ival.hi()) + ']');
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{number} value
     */
    glsBuiltinPrecisionTests.TraitsInt.prototype.doPrintValue	= function(fmt, value) {
		bufferedLogToConsole(value);
	};

    glsBuiltinPrecisionTests.TraitsInt.prototype = Object.create(glsBuiltinPrecisionTests.ScalarTraits.prototype);
    glsBuiltinPrecisionTests.TraitsInt.prototype.constructor = glsBuiltinPrecisionTests.TraitsInt;


    /**
     * Common traits for containers, i.e. vectors and matrices.
     * T is the container type itself, I is the same type with interval elements.
     * template <typename T, typename I>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Traits}
     * @param{*} T
     */
    glsBuiltinPrecisionTests.ContainerTraits = function(T) {
        glsBuiltinPrecisionTests.Traits.call(this);
    };

    // typedef typename	T::Element		Element;
    // typedef				I				IVal;

    /**
     * @param{*} value can be a vector or matrix
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doMakeIVal = function(value) {
    	/** @type{Array<tcuInterval.Interval>}	*/ var ret = [];

		for (var ndx = 0; ndx < T.SIZE; ++ndx)
			ret[ndx] = makeIVal(value[ndx]);

		return ret;
	};

    /**
     * @param{tcuInterval.Interval} a
     * @param{tcuInterval.Interval} b
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doUnion = function (a, b) {
    	/** @type{Array<tcuInterval.Interval>}	*/ var ret = [];

		for (var ndx = 0; ndx < T.SIZE; ++ndx)
			ret[ndx] = unionIVal<Element>(a[ndx], b[ndx]);

		return ret;
	};

    /**
     * @param{tcuInterval.Interval} ival
     * @param{*} value
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doContains = function(ival, value) {
		for (var ndx = 0; ndx < T.SIZE; ++ndx)
			if (!this.contains(ival[ndx], value[ndx]))
				return false;

		return true;
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doPrintIVal = function(fmt, ival) {
		/** @type{string} */ var os = '(';

		for (var ndx = 0; ndx < T.SIZE; ++ndx)	{
			if (ndx > 0)
				os += ', ';
			this.printIVal<Element>(fmt, ival[ndx], os);
		}

		os += ')';
        bufferedLogToConsole(os);
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} ival
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doPrintValue	= function(fmt, value) {
		/** @type{string} */ var os = /*dataTypeNameOf<T>() +*/ '(';

		for (var ndx = 0; ndx < T.SIZE; ++ndx)
		{
			if (ndx > 0)
				os += ', ';

			printValue<Element>(fmt, value[ndx], os);
		}

		os += ')';
        bufferedLogToConsole(os);
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{tcuInterval.Interval} value
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doConvert = function(fmt, value) {
		/** @type{Array<tcuInterval.Interval>}	*/ var ret = [];

		for (var ndx = 0; ndx < T.SIZE; ++ndx)
			ret[ndx] = this.convert<Element>(fmt, value[ndx]);

		return ret;
	};

    /**
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{*} value
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doRound = function(fmt, value) {
    	/** @type{Array<tcuInterval.Interval>}	*/ var ret;

		for (var ndx = 0; ndx < T.SIZE; ++ndx)
			ret[ndx] = this.round(fmt, value[ndx]);

		return ret;
	};

    glsBuiltinPrecisionTests.ContainerTraits.prototype = Object.create(glsBuiltinPrecisionTests.Traits.prototype);
    glsBuiltinPrecisionTests.ContainerTraits.prototype.constructor = glsBuiltinPrecisionTests.ContainerTraits;



//     class ExprBase;
// class ExpandContext;
// class Statement;
// class StatementP;
// class FuncBase;
    /**
     * @constructor
     * @param{*} typename
     */
    glsBuiltinPrecisionTests.ExprP = function(typename) {
        this.T = typename;
    };

    /**
     * template <typename T>
     * typedef typename Expr<T>::IVal IVal;
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ExprP}
     * @param{*} typename
     * @param{string} name
     */
    glsBuiltinPrecisionTests.Variable = function(typename, name) {
        glsBuiltinPrecisionTests.ExprP.call(this, typename);
        this.m_name;
    };

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.Variable.prototype.getName = function() {
        return this.m_name;
    };

    /**
     */
    glsBuiltinPrecisionTests.Variable.prototype.doPrintExpr = function(/*ostream& os*/) {
        bufferedLogToConsole(this.m_name);
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @return{string} IVal
     */
    glsBuiltinPrecisionTests.Variable.prototype.doEvaluate = function(ctx) {
		// ctx.env.lookup<T>(this);
        return this.ctx.env.lookup(this);
	};

    glsBuiltinPrecisionTests.Variable.prototype = Object.create(glsBuiltinPrecisionTests.ExprP.prototype);
    glsBuiltinPrecisionTests.Variable.prototype.constructor = glsBuiltinPrecisionTests.Variable;

    /**
     * @constructor
     * @param{*} typename
     */
    glsBuiltinPrecisionTests.VariableP = function(typename) {
        this.T = typename;
    };

    /**
     * @constructor
     * @param{*} typename
     */
    glsBuiltinPrecisionTests.DefaultSampling = function(typename) {
        this.T = typename;
    };

    /** @typedef {Array<glsBuiltinPrecisionTests.FuncBase>} */
    glsBuiltinPrecisionTests.FuncSet;

    /**
     * Common base class for all expressions regardless of their type.
     * @constructor
     */
    glsBuiltinPrecisionTests.ExprBase = function() {};

    /**
     */
    glsBuiltinPrecisionTests.ExprBase.prototype.printExpr = function (){
        this.doPrintExpr(os);
    };

    /**
     * Output the functions that this expression refers to
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     * @return{glsBuiltinPrecisionTests.FuncSet}
     */
    glsBuiltinPrecisionTests.ExprBase.prototype.getUsedFuncs = function(/*FuncSet&*/ dst) {
		return this.doGetUsedFuncs(dst);
	};

    /**
     * Type-specific operations for an expression representing type T.
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ExprBase}
     * @param{*} T template <typename T>
     */
    glsBuiltinPrecisionTests.Expr = function(T) {
        glsBuiltinPrecisionTests.ExprBase,call(this);
        this.typename = T;
    };

    /**
     * Type-specific operations for an expression representing type T.
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ExprBase}
     * @param{*} T template <typename T>
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     */
    glsBuiltinPrecisionTests.Expr.prototype.evaluate = function(ctx) {
        return this.doEvaluate(ctx);
    };

    /**
     * @param{*} T
     * @param{*} value
     * @return{*}
     */
    glsBuiltinPrecisionTests.makeIVal = function(T, value) {
	    return this.doMakeIVal(value);
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
     *
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.print = function (/*ostream&, const BaseArgExprs&*/) {};

    /**
     * Index of output parameter, or -1 if none of the parameters is output.
     * @return{number}
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.getOutParamIndex = function () {
        return -1;
    };

    /**
     *
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.printDefinition = function (/*ostream& os*/) {
	    glsBuiltinPrecisionTests.doPrintDefinition(/*os*/);
	};

    /**
     * typedef set<const FuncBase*> FuncSet;
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.getUsedFuncs = function(dst) {
		this.doGetUsedFuncs(dst);
	};

    /**
     *
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.doPrintDefinition = function (/*ostream& os*/) {};

    /**
     *
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
    	this.Sig = Sig_;
    	this.Ret = this.Sig.Ret;
    	this.Arg0 = this.Sig.Arg0;
    	this.Arg1 = this.Sig.Arg1;
    	this.Arg2 = this.Sig.Arg2;
    	this.Arg3 = this.Sig.Arg3;
    	this.IRet = this.Sig.IRet;
    	this.IArg0 = this.Sig.IArg0;
    	this.IArg1 = this.Sig.IArg1;
    	this.IArg2 = this.Sig.IArg2;
    	this.IArg3 = this.Sig.IArg3;
    	this.Args = this.Sig.Args;
    	this.IArgs = this.Sig.IArgs;
    	this.ArgExprs = this.Sig.ArgExprs;
    };

    /**
     * @param{glsBuiltinPrecisionTests.BaseArgExprs} args
     */
    glsBuiltinPrecisionTests.Func.prototype.print = function(/*ostream& os,*/ args) {
	    this.doPrint(os, args);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{*} Iarg0
     * @param{*} Iarg1
     * @param{*} Iarg2
     * @param{*} Iarg3
     * @return{*} IRet
     */
    glsBuiltinPrecisionTests.Func.prototype.apply = function(ctx, Iarg0, Iarg1 ,Iarg2 ,Iarg3){
        var arg0 = Iarg0 === undefined ? this.IArg0() : Iarg0;
        var arg1 = Iarg1 === undefined ? this.IArg1() : Iarg1;
        var arg2 = Iarg2 === undefined ? this.IArg2() : Iarg2;
        var arg3 = Iarg3 === undefined ? this.IArg3() : Iarg3;
		return this.applyArgs(ctx, IArgs(arg0, arg1, arg2, arg3));
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.IArgs} args
     * @return{*} IRet
     */
    glsBuiltinPrecisionTests.Func.prototype.applyArgs = function (ctx, args) {
		return this.doApply(ctx, args);
	};

    // TODO
	// ExprP<Ret>			operator()		(const ExprP<Arg0>&		arg0 = voidP(),
	// 									 const ExprP<Arg1>&		arg1 = voidP(),
	// 									 const ExprP<Arg2>&		arg2 = voidP(),
	// 									 const ExprP<Arg3>&		arg3 = voidP())		const;

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.IArgs} args
     * @return{glsBuiltinPrecisionTests.ParamNames}
     */
    glsBuiltinPrecisionTests.Func.prototype.getParamNames = function() {
		return this.doGetParamNames();
	};

    // protected:
	// virtual IRet		doApply			(const EvalContext&, const IArgs&) const = 0;

    /**
     * @param{glsBuiltinPrecisionTests.BaseArgExprs} args
     */
    glsBuiltinPrecisionTests.Func.prototype.doPrint = function (/*ostream& os,*/args) {
		/** type{string} */ var os = getName() + '(';

        // TODO: fix the generics
		if (isTypeValid()) //<Arg0>
			os += args[0];

		if (isTypeValid()) // <Arg1>
			os += ', ' + args[1];

		if (isTypeValid()) //<Arg2>
			os += ', ' + args[2];

		if (isTypeValid()) //<Arg3>
			os += ', ' + args[3];

		os += ')';

        bufferedLogToConsole(os);
	};

    /**
     * @return{glsBuiltinPrecisionTests.ParamNames} args
     */
    glsBuiltinPrecisionTests.Func.prototype.doGetParamNames = function() {
		/** @type{glsBuiltinPrecisionTests.ParamNames} */ var names = new glsBuiltinPrecisionTests.Tuple4("a", "b", "c", "d");
		return names;
	};

    glsBuiltinPrecisionTests.Func.prototype = Object.create(glsBuiltinPrecisionTests.FuncBase.prototype);
    glsBuiltinPrecisionTests.Func.prototype.constructor = glsBuiltinPrecisionTests.Func;

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Func}
     * @param{glsBuiltinPrecisionTests.Signature} Sig template <typename Sig>
     *
     */
    glsBuiltinPrecisionTests.PrimitiveFunc = function(Sig) {
        glsBuiltinPrecisionTests.Func.call(this, Sig);
        this.Ret = Sig.Ret;
        this.ArgExprs = Sig.ArgExprs;
    };

    glsBuiltinPrecisionTests.PrimitiveFunc.prototype = Object.create(glsBuiltinPrecisionTests.Func.prototype);
    glsBuiltinPrecisionTests.PrimitiveFunc.prototype.constructor = glsBuiltinPrecisionTests.PrimitiveFunc;

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.PrimitiveFunc}
     * @param{glsBuiltinPrecisionTests.Signature} Sig_ template <Signature<float, float> >
     *
     */
    glsBuiltinPrecisionTests.FloatFunc1 = function (Sig_) {
        this.Sig = Sig_;
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.IArgs} iargs
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.doApply =	function(ctx, iargs) {
		return this.applyMonotone(ctx, iargs.a);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.IArgs} iargs
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.applyMonotone	= function(ctx, iarg0) {
		/** @type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();

        // TODO: port macros
		// TCU_INTERVAL_APPLY_MONOTONE1(ret, arg0, iarg0, val,
		// 							 TCU_SET_INTERVAL(val, point,
		// 											  point = this->applyPoint(ctx, arg0)));

		ret.operatorOrAssignBinary(this.innerExtrema(ctx, iarg0));
		ret.operatorAddAssignBinary((this.getCodomain().operatorOrBinary(NaN)));

		return ctx.format.convert(ret);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.IArgs} iargs
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.innerExtrema = function()	{
		return new tcuInterval.Interval(); // empty interval, i.e. no extrema
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} arg0
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.applyPoint = function(ctx, arg0) {
		/** @type{number} */ var exact = this.applyExact(arg0);
		/** @type{number} */ var prec = this.precision(ctx, exact, arg0);

		return exact + Interval(-prec, prec);
	};

    /**
     * @param{number} x
     */
    glsBuiltinPrecisionTests.FloatFunc1.prototype.applyExact = function(x)	{
        //TODO
		// TCU_THROW(InternalError, "Cannot apply");
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

    glsBuiltinPrecisionTests.FloatFunc1.prototype = Object.create(glsBuiltinPrecisionTests.PrimitiveFunc.prototype);
    glsBuiltinPrecisionTests.FloatFunc1.prototype.constructor = glsBuiltinPrecisionTests.FloatFunc1;

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FloatFunc1}
     * @param{string} name
     * @param{tcuInterval.DoubleFunc1} func
     */
    glsBuiltinPrecisionTests.CFloatFunc1 = function(name, func) {
        /** @type{string} */ this.m_name = name;
        /** @type{tcuInterval.DoubleFunc1} */this.m_func = func;
    };

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

    glsBuiltinPrecisionTests.CFloatFunc1.prototype = Object.create(glsBuiltinPrecisionTests.FloatFunc1.prototype);
    glsBuiltinPrecisionTests.CFloatFunc1.prototype.constructor = glsBuiltinPrecisionTests.CFloatFunc1;

    /**
     * PrimitiveFunc<Signature<float, float, float> >
     * @constructor
     * @extends{glsBuiltinPrecisionTests.PrimitiveFunc}
     */
    glsBuiltinPrecisionTests.FloatFunc2 = function() {
        /** @type{glsBuiltinPrecisionTests.Signature} */ var Sig = new glsBuiltinPrecisionTests.Signature(new Number(1.10), new Number(1), new Boolean(true), new Array(0));
        glsBuiltinPrecisionTests.PrimitiveFunc.call(this, Sig);

    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.IArgs} iargs
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.doApply = function(ctx, iargs) {
		return this.applyMonotone(ctx, iargs.a, iargs.b);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{tcuInterval.Interval} xi
     * @param{tcuInterval.Interval} yi
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.applyMonotone	= function(ctx, xi, yi) {
		/** @type{tcuInterval.Interval} */ var reti = new tcuInterval.Interval();

		// TCU_INTERVAL_APPLY_MONOTONE2(reti, x, xi, y, yi, ret,
		// 							 TCU_SET_INTERVAL(ret, point,
		// 											  point = this.applyPoint(ctx, x, y)));
		reti.operatorOrAssignBinary(this.innerExtrema(ctx, xi, yi));
		reti.operatorAndAssignBinary(this.getCodomain() | NaN);

		return ctx.format.convert(reti);
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
		/** @type{number} */ var prec	= this.precision(ctx, exact, x, y);

		return new tcuInterval.Interval(-prec, prec).operatorSum(exact);
	}

    /**
     * @param{number} x
     * @param{number} y
     * @return{number}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.applyExact = function(x, y) {
		// TCU_THROW(InternalError, 'Cannot apply');
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
        return 0;
    };

    glsBuiltinPrecisionTests.FloatFunc2.prototype = Object.create(glsBuiltinPrecisionTests.PrimitiveFunc.prototype);
    glsBuiltinPrecisionTests.FloatFunc2.prototype.constructor = glsBuiltinPrecisionTests.FloatFunc2;

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FloatFunc2}
     * @param{string} name
     * @param{tcuFloat.DoubleFunc2} func
     */
    glsBuiltinPrecisionTests.CFloatFunc2 = function(name, func){
    	/** @type{string} */ this.m_name = name;
    	/** @type{tcuInterval.DoubleFunc2} */ this.m_func = func;
    };

    /**
     * @return{string}
     */
    glsBuiltinPrecisionTests.CFloatFunc2.prototype.getName = function()	{
        return this.m_name;
    };

    /**
     * @param{number} x
     * @param{number} y
     * @return{string}
     */
    glsBuiltinPrecisionTests.CFloatFunc2.prototype.applyExact = function(x, y) {
        return this.m_func(x, y);
    };

    glsBuiltinPrecisionTests.CFloatFunc2.prototype = Object.create(glsBuiltinPrecisionTests.FloatFunc2.prototype);
    glsBuiltinPrecisionTests.CFloatFunc2.prototype.constructor = glsBuiltinPrecisionTests.CFloatFunc2;

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FloatFunc2}
     * @return{string}
     */
    glsBuiltinPrecisionTests.InfixOperator = function(){
        glsBuiltinPrecisionTests.FloatFunc2.call(this);
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FloatFunc2}
     * @return{string}
     */
    glsBuiltinPrecisionTests.InfixOperator.prototype.getSymbol = function() {
        return '';
    };

    /**
     * @param{glsBuiltinPrecisionTests.BaseArgExprs} args
     * @return{string}
     */
    glsBuiltinPrecisionTests.InfixOperator.prototype.doPrint = function(/*ostream& os,*/ args) {
		bufferedLogToConsole('(' + args[0] + ' ' + this.getSymbol() + ' ' + args[1] + ')');
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
		return ctx.format.roundOut(exact, !deIsInf(x) && !deIsInf(y));
	}

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} x
     * @param{number} y
     * @param{number} z
     * @return{number}
     */
    glsBuiltinPrecisionTests.InfixOperator.prototype.precision = function(ctx, x, y, z)	{
		return 0.0;
	};

    glsBuiltinPrecisionTests.InfixOperator.prototype = Object.create(glsBuiltinPrecisionTests.FloatFunc2.prototype);
    glsBuiltinPrecisionTests.InfixOperator.prototype.constructor = glsBuiltinPrecisionTests.InfixOperator;

    /**
     * Signature<float, float, float, float>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.PrimitiveFunc}
     * @param{glsBuiltinPrecisionTests.Signature} Sig_
     */
    glsBuiltinPrecisionTests.FloatFunc3 = function() {

    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.IArgs} iargs
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc3.prototype.doApply = function (ctx, iargs) {
		return this.applyMonotone(ctx, iargs.a, iargs.b, iargs.c);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{tcuInterval.Interval} xi
     * @param{tcuInterval.Interval} yi
     * @param{tcuInterval.Interval} zi
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc3.prototype.applyMonotone	= function(ctx, xi, yi, zi) {
		/** @type{tcuInterval.Interval} */ var reti = new tcuInterval.Interval();
		TCU_INTERVAL_APPLY_MONOTONE3(reti, x, xi, y, yi, z, zi, ret,
									 TCU_SET_INTERVAL(ret, point,
													  point = this.applyPoint(ctx, x, y, z)));
		return ctx.format.convert(reti);
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{tcuInterval.Interval} xi
     * @param{tcuInterval.Interval} yi
     * @param{tcuInterval.Interval} zi
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc3.prototype.applyPoint = function(ctx, xi, yi, zi) {
		/** @type{number} */ var exact	= this.applyExact(x, y, z);
		/** @type{number} */ var prec	= this.precision(ctx, exact, x, y, z);
		return new tcuInterval.Interval(-prec, prec).operatorSum(exact);
	};

    /**
     * @param{number} x
     * @param{number} y
     * @param{number} z
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc3.prototype.applyExact = function(x, y, z) {
		TCU_THROW(InternalError, "Cannot apply");
	};

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{number} result
     * @param{number} x
     * @param{number} y
     * @param{number} z
     * @return{number}
     */
    glsBuiltinPrecisionTests.FloatFunc3.prototype.precision	= function(ctx, result, x, y, z) {
        return 0;
    };

    glsBuiltinPrecisionTests.FloatFunc3.prototype = Object.create(glsBuiltinPrecisionTests.PrimitiveFunc.prototype);
    glsBuiltinPrecisionTests.FloatFunc3.prototype.constructor = glsBuiltinPrecisionTests.FloatFunc3;


    /**
     * @constructor{glsBuiltinPrecisionTests.EvalContext}
     * @extends{glsBuiltinPrecisionTests.InfixOperator}
     */
    glsBuiltinPrecisionTests.Add = function() {
        glsBuiltinPrecisionTests.InfixOperator.call(this);
    };


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
     * @param{glsBuiltinPrecisionTests.IArgs} iargs
     * @returns{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.Add.prototype.doApply = function(ctx, iargs) {
		// Fast-path for common case
		if (iargs.a.isOrdinary() && iargs.b.isOrdinary()) {
			/** type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();
			TCU_SET_INTERVAL_BOUNDS(ret, sum,
									sum = iargs.a.lo() + iargs.b.lo(),
									sum = iargs.a.hi() + iargs.b.hi());
			return ctx.format.convert(ctx.format.roundOut(ret, true));
		}
		return this.applyMonotone(ctx, iargs.a, iargs.b);
	};

    /**
     * @param{number} ctx
     * @param{number} iargs
     * @returns{number}
     */
    glsBuiltinPrecisionTests.Add.prototype.applyExact = function(x, y) {
        return x + y;
    };

    glsBuiltinPrecisionTests.Add.prototype = Object.create(glsBuiltinPrecisionTests.InfixOperator.prototype);
    glsBuiltinPrecisionTests.Add.prototype.constructor = glsBuiltinPrecisionTests.Add;


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
        this.in0 = In.In0;
        this.in1 = In.In1;
        this.in2 = In.In2;
        this.in3 = In.In3;
    };

    /**
     * template<typename Out>
     * @constructor
     * @param{number} size
     * @param{*} Out
     */
    glsBuiltinPrecisionTests.Outputs = function(size, Out) {
    	// Outputs	(size_t size) : out0(size), out1(size) {}
    	this.out0 = new Out(size);
    	this.out1 = new Out(size);
    };


    /**
     * template<typename In, typename Out>
     * @constructor
     * @param{*} In
     * @param{*} Out
     */
     glsBuiltinPrecisionTests.Variables = function(In, Out) {
    	this.in0 = new glsBuiltinPrecisionTests.VariableP(In.In0);
        this.in1 = new glsBuiltinPrecisionTests.VariableP(In.In1);
        this.in2 = new glsBuiltinPrecisionTests.VariableP(In.In2);
        this.in3 = new glsBuiltinPrecisionTests.VariableP(In.In4);
        this.out0 = new glsBuiltinPrecisionTests.VariableP(Out.Out0);
        this.out1 = new glsBuiltinPrecisionTests.VariableP(Out.Out1);
    };

    /**
     * template <typename T>
     * @constructor
     * @param{*} T
     */
    glsBuiltinPrecisionTests.Sampling = function(T) {
        this.typename = T;
    };

    /**
     * @param{*} T
     * @param{glsBuiltinPrecisionTests.Sampling}
     */
    glsBuiltinPrecisionTests.SamplingFactory = function(T) {
        if (typeof T == 'boolean') {
            return new glsBuiltinPrecisionTests.DefaultSamplingBool(T);
        } else if (typeof T == 'number') {
            if (Math.abs(T % 1) != 0) {
                return new glsBuiltinPrecisionTests.DefaultSamplingFloat(T);
            } else {
                return new glsBuiltinPrecisionTests.DefaultSamplingInt(T);
            }
        } else if (Array.isArray(T)) {
            if (T.length > 0 && Array.isArray(T[0])) {

            } else {

            }

        }
    };

    /**
     * template <typename T>
     * @param{*} T
     * @param{FloatFormat} fmt
     * @param{Array<*>} arr
     */
    glsBuiltinPrecisionTests.Sampling.prototype.genFixeds = function(fmt, arr){};

    /**
     * template <typename T>
     * @param{*} T
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{gluShaderUtil.precision} precision
     * @param{debase.deRandom} random
     * @return{*}
     */
    glsBuiltinPrecisionTests.Sampling.prototype.genRandom = function(T, fmt, precision, random){
        return new T();
    };

    /**
     * @return{number}
     */
    glsBuiltinPrecisionTests.Sampling.prototype.getWeight = function() {
        return 0.0;
    };

    /**
     * template <>  :  public Sampling<Void>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{typename} T
     */
     glsBuiltinPrecisionTests.DefaultSamplingVoid = function(T) {
         glsBuiltinPrecisionTests.Sampling.call(this, T);
     };

    /**
     * template <>  :  public Sampling<Void>
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<glsBuiltinPrecisionTests.Void>} dst
     * @param{debase.deRandom} random
     */
    glsBuiltinPrecisionTests.DefaultSamplingVoid.prototype.genFixeds = function(fmt, dst) {
        dst.push(new glsBuiltinPrecisionTests.Void());
    };

    /**
     * template <>  :  public Sampling<bool>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     */
    glsBuiltinPrecisionTests.DefaultSamplingBool = function() {
        glsBuiltinPrecisionTests.Sampling.call(this);
    };

    /**
     * template <>  :  public Sampling<bool>
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<Boolean} dst
     */
    glsBuiltinPrecisionTests.DefaultSamplingBool.prototype.genFixeds = function(fmt, dst) {
		dst.push(true);
		dst.push(false);
	};

    /**
     * template <>  :  public Sampling<int>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{typename} T
     */
    glsBuiltinPrecisionTests.DefaultSamplingInt = function(T) {
        glsBuiltinPrecisionTests.Sampling.call(this, T);
    };

    /**
     * template <>  :  public Sampling<int>
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{gluShaderUtil.precision} prec
     * @param{debase.deRandom} rnd
     * @return{number}
     */
    glsBuiltinPrecisionTests.DefaultSamplingInt.prototype.genRandom = function(fmt, prec, rnd) {
		/** @type{number} */ var exp = rnd.getInt(0, getNumBits(prec)-2);
		/** @type{number} */ var sign = rnd.getBool() ? -1 : 1;

		return sign * rnd.getInt(0, 1 << exp);
	};

    /**
     * template <>  :  public Sampling<int>
     * @param{tcuFloatFormat.FloatFormat} fmt
     * @param{Array<number>} dst
     */
    glsBuiltinPrecisionTests.DefaultSamplingInt.prototype.genFixeds = function(fmt, dst) {
		dst.push(0);
		dst.push(-1);
		dst.push(1);
	};

    /**
     * template <>  :  public Sampling<int>
     * @return{number}
     */
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
				DE_ASSERT(false);
				return 0;
		}
	};

    /**
     * template <>  :  public Sampling<float>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Sampling}
     * @param{typename} T
     */
    glsBuiltinPrecisionTests.DefaultSamplingFloat = function(T){
        glsBuiltinPrecisionTests.Sampling.call(this, T);
    };

    /**
     * Generate a random float from a reasonable general-purpose distribution.
     * template <>  :  public Sampling<float>
     * @param{tcuFloatFormat.FloatFormat} format
     * @param{gluShaderUtil.precision} prec
     * @param{debase.deRandom} rnd
     */
    glsBuiltinPrecisionTests.DefaultSamplingFloat.prototype.genRandom = function(format, prec, rnd) {
    	/** type{number} */ var minExp			= format.getMinExp();
    	/** type{number} */ var maxExp			= format.getMaxExp();
    	/** type{boolean} */ var haveSubnormal	= format.hasSubnormal() != tcuFloatFormat.YesNoMaybe.NO;

    	// Choose exponent so that the cumulative distribution is cubic.
    	// This makes the probability distribution quadratic, with the peak centered on zero.
    	/** type{number} */ var minRoot			= deCbrt(minExp - 0.5 - (haveSubnormal ? 1.0 : 0.0));
    	/** type{number} */ var maxRoot			= deCbrt(maxExp + 0.5);
    	/** type{number} */ var fractionBits	= format.getFractionBits();
    	/** type{number} */ var exp				= deRoundEven(dePow(rnd.getDouble(minRoot, maxRoot),
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
    		base = deFloatLdExp(1.0, exp);
    		quantum = deFloatLdExp(1.0, exp - fractionBits);
    	} else {
    		// Subnormal
    		base = 0.0;
    		quantum = deFloatLdExp(1.0, minExp - fractionBits);
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
    			/** type{number} */ var intFraction = rnd.getUint64() & ((1 << fractionBits) - 1);
    			significand = intFraction * quantum;
    		}
    	}

    	// Produce positive numbers more often than negative.
    	return (rnd.getInt(0,3) == 0 ? -1.0 : 1.0) * (base + significand);
    };

    /**
     * Generate a standard set of floats that should always be tested.
     * template <>  :  public Sampling<float>
     * @param{tcuFloatFormat.FloatFormat} format
     * @param{Array<number>} dst
     */
    glsBuiltinPrecisionTests.DefaultSamplingFloat.prototype.genFixeds = function (format, dst) {
    	/** @type{number} */ var minExp			= format.getMinExp();
    	/** @type{number} */ var maxExp			= format.getMaxExp();
    	/** @type{number} */ var fractionBits	= format.getFractionBits();
        // DE_INLINE double	deCbrt	(double a)	{ return deSign(a) * dePow(deAbs(a), 1.0 / 3.0); }
        // DE_INLINE double	deSign				(double x)						{ return deIsNaN(x) ? x : (double)((x > 0.0) - (x < 0.0)); }
    	/** @type{number} */ var minQuantum		= deFloatLdExp(1.0, minExp - fractionBits);
    	/** @type{number} */ var minNormalized	= deFloatLdExp(1.0, minExp);
    	/** @type{number} */ var maxQuantum		= deFloatLdExp(1.0, maxExp - fractionBits);

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
    		dst.push(sign * (deFloatLdExp(1.0, maxExp) +
    							  (deFloatLdExp(1.0, maxExp) - maxQuantum)));

    		dst.push(sign * Number.POSITIVE_INFINITY);
    	}
    };

// template <typename T, int Size>
// class DefaultSampling<Vector<T, Size> > : public Sampling<Vector<T, Size> >
// {
// public:
// 	typedef Vector<T, Size>		Value;
//
// 	Value	genRandom	(const FloatFormat& fmt, Precision prec, Random& rnd) const
// 	{
// 		Value ret;
//
// 		for (int ndx = 0; ndx < Size; ++ndx)
// 			ret[ndx] = instance<DefaultSampling<T> >().genRandom(fmt, prec, rnd);
//
// 		return ret;
// 	}
//
// 	void	genFixeds	(const FloatFormat& fmt, vector<Value>& dst) const
// 	{
// 		vector<T> scalars;
//
// 		instance<DefaultSampling<T> >().genFixeds(fmt, scalars);
//
// 		for (size_t scalarNdx = 0; scalarNdx < scalars.size(); ++scalarNdx)
// 			dst.push_back(Value(scalars[scalarNdx]));
// 	}
//
// 	double	getWeight	(void) const
// 	{
// 		return dePow(instance<DefaultSampling<T> >().getWeight(), Size);
// 	}
// };
//
// template <typename T, int Rows, int Columns>
// class DefaultSampling<Matrix<T, Rows, Columns> > : public Sampling<Matrix<T, Rows, Columns> >
// {
// public:
// 	typedef Matrix<T, Rows, Columns>		Value;
//
// 	Value	genRandom	(const FloatFormat& fmt, Precision prec, Random& rnd) const
// 	{
// 		Value ret;
//
// 		for (int rowNdx = 0; rowNdx < Rows; ++rowNdx)
// 			for (int colNdx = 0; colNdx < Columns; ++colNdx)
// 				ret(rowNdx, colNdx) = instance<DefaultSampling<T> >().genRandom(fmt, prec, rnd);
//
// 		return ret;
// 	}
//
// 	void	genFixeds	(const FloatFormat& fmt, vector<Value>& dst) const
// 	{
// 		vector<T> scalars;
//
// 		instance<DefaultSampling<T> >().genFixeds(fmt, scalars);
//
// 		for (size_t scalarNdx = 0; scalarNdx < scalars.size(); ++scalarNdx)
// 			dst.push_back(Value(scalars[scalarNdx]));
//
// 		if (Columns == Rows)
// 		{
// 			Value	mat	(0.0);
// 			T		x	= T(1.0);
// 			mat[0][0] = x;
// 			for (int ndx = 0; ndx < Columns; ++ndx)
// 			{
// 				mat[Columns-1-ndx][ndx] = x;
// 				x *= T(2.0);
// 			}
// 			dst.push_back(mat);
// 		}
// 	}
//
// 	double	getWeight	(void) const
// 	{
// 		return dePow(instance<DefaultSampling<T> >().getWeight(), Rows * Columns);
// 	}
// };


    /**
     * template<typename In>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Samplings}
     * @param{In} In
     */
     glsBuiltinPrecisionTests.Samplings = function(In) {
        this.in0 = glsBuiltinPrecisionTests.SamplingFactory(In.In0);
        this.in1 = glsBuiltinPrecisionTests.SamplingFactory(In.In1);
        this.in2 = glsBuiltinPrecisionTests.SamplingFactory(In.In2);
        this.in3 = glsBuiltinPrecisionTests.SamplingFactory(In.In3);
    };


    /**
     * template<typename In>
     * @param{*} In
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Samplings}
     */
     glsBuiltinPrecisionTests.DefaultSamplings = function(In) {
    	glsBuiltinPrecisionTests.Samplings.call(this,In);
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
		/** @type{*} */ this.m_rnd	= 0; //	(0xdeadbeefu + context.testContext.getCommandLine().getBaseSeed())
		/** @type{*} */ this.m_extension = extension;
        tcuTestCase.DeqpTest.call(this, name, extension);
    };

    /**
     * @return{glsBuiltinPrecisionTests.RenderContext}
     */
    glsBuiltinPrecisionTests.PrecisionCase.prototype.getRenderContext = function() {
        return this.m_ctx.renderContext;
    };

    /**
     * @return{tcuFloatFormat.FloatFormat}
     */
    glsBuiltinPrecisionTests.PrecisionCase.prototype.getFormat = function() {
        return this.m_ctx.floatFormat;
    };

	// TestLog&			log				(void) const 			{ return m_testCtx.getLog(); }
	// virtual void		runTest			(void) = 0;


    /**
     * template <typename In, typename Out>
     * @param{glsBuiltinPrecisionTests.Variables} variables Variables<In, Out>
     * @param{glsBuiltinPrecisionTests.Inputs} inputs Inputs<In>
     * @param{glsBuiltinPrecisionTests.Statement} stmt
     */
    glsBuiltinPrecisionTests.PrecisionCase.prototype.testStatement = function(variables, inputs, stmt){};


    /**
     * template <typename In, typename Out>
     * @param{glsBuiltinPrecisionTests.Variable} variable Variable<T>
     * @param{glsBuiltinPrecisionTests.Inputs} inputs Inputs<In>
     * @return{glsBuiltinPrecisionTests.Symbol}
     */
    glsBuiltinPrecisionTests.PrecisionCase.prototype.makeSymbol = function (variable) {
		return glsBuiltinPrecisionTests.Symbol(variable.getName(), getVarTypeOf<T>(m_ctx.precision));
	}

    glsBuiltinPrecisionTests.PrecisionCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    glsBuiltinPrecisionTests.PrecisionCase.prototype.constructor = glsBuiltinPrecisionTests.PrecisionCase;

    /**
     * template <typename T>
     * @param{*} val1
     * @param{*} val2
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.inputLess = function (val1, val2) {
        if (val1 === undefined || val2 === undefined) {
            return false;
        }

        if (typeof val1 == 'number' && glsBuiltinPrecisionTests.isFloat(val1)) {
            return glsBuiltinPrecisionTests.inputLessFloat(val1, val2);
        } else if (Array.isArray(val1)) {
            if (Array.isArray(val1[0])) {
                return glsBuiltinPrecisionTests.InputLessMatrix(val1, val2);
            } else {
                return glsBuiltinPrecisionTests.inputLessVector(val1, val2);
            }
        }
	    return false;
    };

    /**
     * @param{number} val1
     * @param{number} val2
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.inputLessFloat = function(val1, val2) {
    	if (isNaN(val1))
    	   return false;
    	if (isNaN(val2))
    		return true;
    	return val1 < val2;
    };

    /**
     * @param{Array<number>} val1
     * @param{Array<number>} val2
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.inputLessVector = function(val1, val2) {
		for (var ndx = 0; ndx < val1.length; ++ndx) {
			if (glsBuiltinPrecisionTests.inputLessFloat(vec1[ndx], vec2[ndx]))
				return true;
			if (glsBuiltinPrecisionTests.inputLessFloat(vec2[ndx], vec1[ndx]))
				return false;
		}
		return false;
    };

    /**
     * @param{Arrray<Array<number>>} mat1
     * @param{Arrray<Array<number>>} mat2
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.InputLessMatrix = function(mat1, mat2) {
		for (var col = 0; col < mat1.length; ++col)	{
			if (glsBuiltinPrecisionTests.inputLessVector(mat1[col], mat2[col]))
				return true;
			if (glsBuiltinPrecisionTests.inputLessVector(mat2[col], mat1[col]))
				return false;
		}
		return false;
	};

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

    /**
     * template <typename In>
     * InputLess<InTuple<In> >
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Tuple4}
     * @param{*} In
     */
    glsBuiltinPrecisionTests.InputLess = function(in1, in2) {
        if (glsBuiltinPrecisionTests.inputLess(in1.a, in2.a))
			return true;
		if (glsBuiltinPrecisionTests.inputLess(in2.a, in1.a))
			return false;
		if (glsBuiltinPrecisionTests.inputLess(in1.b, in2.b))
			return true;
		if (glsBuiltinPrecisionTests.inputLess(in2.b, in1.b))
			return false;
		if (glsBuiltinPrecisionTests.inputLess(in1.c, in2.c))
			return true;
		if (glsBuiltinPrecisionTests.inputLess(in2.c, in1.c))
			return false;
		if (glsBuiltinPrecisionTests.inputLess(in1.d, in2.d))
			return true;
		return false;
    };

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
    					var tuple = glsBuiltinPrecisionTests.InTuple(fixedInputs.in0[ndx0],
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
    		ret.in0.push_back(in0);
    		ret.in1.push_back(in1);
    		ret.in2.push_back(in2);
    		ret.in3.push_back(in3);
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



    glsBuiltinPrecisionTests.FuncCaseBase.prototype.iterate = function() {

        assertMsgOptions(this.m_extension !== undefined && !sglrGLContext.isExtensionSupported(gl, this.m_extension), 'Unsupported extension: ' + m_extension, false, true);

	    this.runTest();

	    // m_status.setTestContextResult(m_testCtx);
	    return tcuTestCase.IterateResult.STOP;
    };

    glsBuiltinPrecisionTests.FuncCaseBase.prototype = Object.create(glsBuiltinPrecisionTests.PrecisionCase.prototype);
    glsBuiltinPrecisionTests.FuncCaseBase.prototype.constructor = glsBuiltinPrecisionTests.FuncCaseBase;

    /**
     * template <typename Sig>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FuncCaseBase}
     * @param{glsBuiltinPrecisionTests.Signature} Sig_
     * @param{glsBuiltinPrecisionTests.Context} context
     * @param{string} name
     * @param{glsBuiltinPrecisionTests.FuncBase} extension
     */
    glsBuiltinPrecisionTests.FuncCase = function(Sig_, context, name, func) {
        glsBuiltinPrecisionTests.FuncCaseBase.call(this, context, name, func);
        this.Sig = Sig_;
        // this.CaseFunc = new glsBuiltinPrecisionTests.Func(Sig_);
        this.m_func = func;
        this.Ret = Sig_.Ret;
        this.Arg0 = Sig_.Arg0;
        this.Arg1 = Sig_.Arg1;
        this.Arg2 = Sig_.Arg2;
        this.Arg3 = Sig_.Arg3;
        this.In = new glsBuiltinPrecisionTests.InTypes(this.Arg0, this.Arg1, this.Arg2, this.Arg3);
        this.Out = new glsBuiltinPrecisionTests.OutTypes(this.Ret);
    };

    glsBuiltinPrecisionTests.FuncCase.prototype = Object.create(glsBuiltinPrecisionTests.FuncCaseBase.prototype);
    glsBuiltinPrecisionTests.FuncCase.prototype.constructor = glsBuiltinPrecisionTests.FuncCase;

    /**
     * Samplings<In>
     * @return{glsBuiltinPrecisionTests.Samplings}
     */
    glsBuiltinPrecisionTests.FuncCase.prototype.getSamplings = function()	{
        return new glsBuiltinPrecisionTests.DefaultSamplings(this.In);
    };

    /**
     * template <typename Sig>
     * @param{glsBuiltinPrecisionTests.Signature} Sig_
     */
    glsBuiltinPrecisionTests.FuncCase.prototype.runTest = function(Sig_) {
        /** @type{glsBuiltinPrecisionTests.Inputs} */ var inputs = (glsBuiltinPrecisionTests.generateInputs(
                                                    this.getSamplings(),
    												this.m_ctx.floatFormat,
    												this.m_ctx.precision,
    												this.m_ctx.numRandoms,
    												this.m_rnd));
	// const Inputs<In>	inputs
	// Variables<In, Out>	variables;
    //
	// variables.out0	= variable<Ret>("out0");
	// variables.out1	= variable<Void>("out1");
	// variables.in0	= variable<Arg0>("in0");
	// variables.in1	= variable<Arg1>("in1");
	// variables.in2	= variable<Arg2>("in2");
	// variables.in3	= variable<Arg3>("in3");
    //
	// {
	// 	ExprP<Ret>	expr	= applyVar(m_func,
	// 								   variables.in0, variables.in1,
	// 								   variables.in2, variables.in3);
	// 	StatementP	stmt	= variableAssignment(variables.out0, expr);
    //
	// 	this->testStatement(variables, inputs, *stmt);
	// }
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

    /**
     * @return{Array<glsBuiltinPrecisionTests.CaseFactory>}
     */
	glsBuiltinPrecisionTests.BuiltinFuncs.prototype.getFactories = function() {
		return this.m_factories.slice();
	};

    /**
     * @return{glsBuiltinPrecisionTests.CaseFactories} fact
     */
	glsBuiltinPrecisionTests.BuiltinFuncs.prototype.addFactory = function(fact)	{
		this.m_factories.push(fact);
	};

    glsBuiltinPrecisionTests.BuiltinFuncs.prototype = Object.create(glsBuiltinPrecisionTests.CaseFactories.prototype);
    glsBuiltinPrecisionTests.BuiltinFuncs.prototype.constructor = glsBuiltinPrecisionTests.BuiltinFuncs;

    /**
     * template <typename Sig>
     * @param{glsBuiltinPrecisionTests.Context} context
     * @param{string} name
     * @param{glsBuiltinPrecisionTests.Signature} Sig_
     * @param{glsBuiltinPrecisionTests.Func} func
     * @param{glsBuiltinPrecisionTests.PrecisionCase}
     */
    glsBuiltinPrecisionTests.createFuncCase = function(context, name, Sig_, func) {
    	switch (func.getOutParamIndex()) {
    		case -1:
    			return new glsBuiltinPrecisionTests.FuncCase(context, name, func);
    		// case 1:
    		// 	return new InOutFuncCase<Sig>(context, name, func);
    		default:
    			throw new Error(!"Impossible");
    	}
    	return null;
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
     * template <typename Sig_, int Size>
     * public PrimitiveFunc<Signature<
     *	typename ContainerOf<typename Sig_::Ret, Size>::Container,
     *	typename ContainerOf<typename Sig_::Arg0, Size>::Container,
     *	typename ContainerOf<typename Sig_::Arg1, Size>::Container,
     *	typename ContainerOf<typename Sig_::Arg2, Size>::Container,
     *	typename ContainerOf<typename Sig_::Arg3, Size>::Container> >
     * @constructor
     * @extends{glsBuiltinPrecisionTests.PrimitiveFunc}
     * @param{glsBuiltinPrecisionTests.Func} scalarFunc
     */
    glsBuiltinPrecisionTests.GenFunc = function(scalarFunc) {
        this.m_func = scalarFunc;
    };

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

    // public:
    // 	typedef typename GenFunc::IArgs		IArgs;
    // 	typedef typename GenFunc::IRet		IRet;
    //
    // 			GenFunc					(const Func<Sig_>&	scalarFunc) : m_func (scalarFunc) {}

    /**
     * @param{glsBuiltinPrecisionTests.BaseArgExprs} args
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.doPrint = function(/*ostream& os,*/ args) {
       return this.m_func.print(/*os,*/ args);
    };

    /**
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     * @param{glsBuiltinPrecisionTests.IArgs} iargs
     * @return{*}
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.doApply = function(/*ostream& os,*/ args) {
        /** @type{Array<*>} */ var ret = [];

        for (var ndx = 0; ndx < Size; ++ndx) {
            ret[ndx] = this.m_func.apply(this.ctx, iargs.a[ndx], iargs.b[ndx], iargs.c[ndx], iargs.d[ndx]);
        }

        return ret;
    };

    /**
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     * @param{glsBuiltinPrecisionTests.IArgs} iargs
     * @return{*}
     */
    glsBuiltinPrecisionTests.GenFunc.prototype.doGetUsedFuncs = function(dst) {
    	this.m_func.getUsedFuncs(dst);

    	// const Func<Sig_>&	m_func;
    };



    /**
     * template <typename F, int Size>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.GenFunc}
     * @param{glsBuiltinPrecisionTests.Signature} Sig_
     * @param{number} size
     */
     glsBuiltinPrecisionTests.VectorizedFunc = function(Sig_, size) {
// public:
// 	VectorizedFunc	(void) : GenFunc<typename F::Sig, Size>(instance<F>()) {}
};


    /**
     * template<typename Sig>
     * @constructor
     * @param{glsBuiltinPrecisionTests.Signature} Sig_
     * @param{glsBuiltinPrecisionTests.Func} func_
     * @param{glsBuiltinPrecisionTests.GenFunc} func2_
     * @param{glsBuiltinPrecisionTests.GenFunc} func3_
     * @param{glsBuiltinPrecisionTests.GenFunc} func4_
     */
    glsBuiltinPrecisionTests.GenFuncs = function(Sig_, func_, func2_, func3_, func4_) {
        this.func = func_;
        this.func2 = func2_;
        this.func3 = func3_;
        this.func4 = func4_;
    };

    /**
     * template <typename Sig>
     * @constructor
     * @extends{glsBuiltinPrecisionTests.CaseFactory}
     * @param{glsBuiltinPrecisionTests.Signature} Sig_
     * @param{glsBuiltinPrecisionTests.GenFuncs} funcs
     * @param{string} name
     */
    glsBuiltinPrecisionTests.GenFuncCaseFactory = function (Sig_, funcs, name) {
        this.Sig = Sig_;
        this.m_funcs = funcs;
        this.m_name = name;
    };

    /**
     * template <typename Sig>
     * @param{glsBuiltinPrecisionTests.Context} ctx
     * @return{tcuTestCase.DeqpTest}
     */
    glsBuiltinPrecisionTests.GenFuncCaseFactory.prototype.createCase = function(ctx) {
        /** @type {tcuTestCase.DeqpTest} */
        var group = tcuTestCase.newTest(ctx.name, ctx.name);

		group.addChild(createFuncCase(ctx, "scalar", m_funcs.func));
		group.addChild(createFuncCase(ctx, "vec2", m_funcs.func2));
		group.addChild(createFuncCase(ctx, "vec3", m_funcs.func3));
		group.addChild(createFuncCase(ctx, "vec4", m_funcs.func4));

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
     * @param{glsBuiltinPrecisionTests.FloatFormat} floatFormat_
     * @param{glsBuiltinPrecisionTests.FloatFormat} highpFormat_
     * @param{gluShaderUtil.precision} precision_
     * @param{gluShaderProgram.shaderType} shaderType_
     * @param{number} numRandoms_
     */
    glsBuiltinPrecisionTests.Context = function(name_, floatFormat_, highpFormat_, precision_, shaderType_, numRandoms_) {
        /** @type{string} */ this.name = name_ ;
        /** @type{glsBuiltinPrecisionTests.FloatFormat} */ this.floatFormat = floatFormat_;
        /** @type{glsBuiltinPrecisionTests.FloatFormat} */ this.highpFormat =highpFormat_;
        /** @type{gluShaderUtil.precision} */ this.precision = precision_;
        /** @type{gluShaderProgram.shaderType} */ this.shaderType = shaderType_;
        /** @type{number} */ this.numRandoms = numRandoms_;
    };

    /**
     * @constructor
     * @param{glsBuiltinPrecisionTests.FloatFormat} highp_
     * @param{glsBuiltinPrecisionTests.FloatFormat} mediump_
     * @param{glsBuiltinPrecisionTests.FloatFormat} lowp_
     * @param{Array<gluShaderProgram.shaderType>} shaderTypes_
     * @param{number} numRandoms_
     */
    glsBuiltinPrecisionTests.PrecisionTestContext = function(highp_, mediump_, lowp_, shaderTypes_, numRandoms_) {
        /** @type{Array<gluShaderProgram.shaderType>} */ this.shaderTypes = shaderTypes_;
        /** @type{Array<glsBuiltinPrecisionTests.FloatFormat>} */ this.formats = [];
        this.formats[gluShaderUtil.precision.PRECISION_HIGHP] = highp_;
        this.formats[gluShaderUtil.precision.PRECISION_MEDIUMP] = mediump_;
        this.formats[gluShaderUtil.precision.PRECISION_LOWP] = lowp_;
        /** @type{number} */ this.numRandoms = numRandoms_;
    };

    /**
     * @param{glsBuiltinPrecisionTests.PrecisionTestContext} ctx
     * @param{glsBuiltinPrecisionTests.CaseFactory} factory
     * @return {tcuTestCase.DeqpTest}
     */
    glsBuiltinPrecisionTests.createFuncGroup = function (ctx, factory) {
        /** @type{tcuTestCase.DeqpTest} */ var group = new tcuTestCase.newTest(factory.getName(), factory.getDesc());

	    for (var precNdx = 0; precNdx < gluShaderUtil.precision.length; ++precNdx)	{
    		/** @type{gluShaderUtil.precision} */ var precision = glsBuiltinPrecisionTests.Precision[precNdx];
    		/** @type{string} */ var precName = gluShaderUtil.getPrecisionName(precision);
    		/** @type{glsBuiltinPrecisionTests.FloatFormat} */ var fmt	= ctx.formats[precNdx];
    		/** @type{glsBuiltinPrecisionTests.FloatFormat} */ var highpFmt = ctx.formats[gluShaderUtil.precision.PRECISION_HIGHP];

    		for (var shaderNdx = 0; shaderNdx < ctx.shaderTypes.size(); ++shaderNdx)
    		{
    			/** @type{gluShaderProgram.shaderType} */ var shaderType = ctx.shaderTypes[shaderNdx];
    			/** @type{string} */ var shaderName	= gluShaderProgram.getShaderTypeName(shaderType);
    			/** @type{string} */ var name = precName + '_' + shaderName;
    			/** @type{glsBuiltinPrecisionTests.Context} */ var caseCtx = new glsBuiltinPrecisionTests.Context(name, fmt, highpFmt,
    											 precision, shaderType, ctx.numRandoms);

    			group.addChild(factory.createCase(caseCtx).release());
    		}
	    }

	    return group;
    };

    /**
     * @param{glsBuiltinPrecisionTests.CaseFactories} cases
     * @param{Array<gluShaderProgram.shaderType>} shaderTypes
     * @param{tcuTestCase.DeqpTest} dstGroup
     * @return {tcuTestCase.DeqpTest}
     */
    glsBuiltinPrecisionTests.addBuiltinPrecisionTests = function(cases, shaderTypes, dstGroup) {
	    /** @type{glsBuiltinPrecisionTests.FloatFormat} */ var highp	= new glsBuiltinPrecisionTests.FloatFormat(-126, 127, 23, true,
												 tcuFloatFormat.YesNoMaybe.MAYBE,	// subnormals
												 tcuFloatFormat.YesNoMaybe.YES,		// infinities
												 tcuFloatFormat.YesNoMaybe.MAYBE);	// NaN
	    // \todo [2014-04-01 lauri] Check these once Khronos bug 11840 is resolved.
	    /** @type{glsBuiltinPrecisionTests.FloatFormat} */ var mediump = new glsBuiltinPrecisionTests.FloatFormat(-13, 13, 9, false);
	    // A fixed-point format is just a floating point format with a fixed
	    // exponent and support for subnormals.
	    /** @type{glsBuiltinPrecisionTests.FloatFormat} */ var lowp	= new glsBuiltinPrecisionTests.FloatFormat(0, 0, 7, false, tcuFloatFormat.YesNoMaybe.YES);
	    /** @type{glsBuiltinPrecisionTests.PrecisionTestContext} */ var ctx	= new glsBuiltinPrecisionTests.PrecisionTestContext(highp, mediump, lowp,
												 shaderTypes, 16384);

	    for (var ndx = 0; ndx < cases.getFactories().size(); ++ndx)
		    dstGroup.addChild(createFuncGroup(ctx, cases.getFactories()[ndx]));
    };


    // es3fDrawTests.AttributeGroup.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    // es3fDrawTests.AttributeGroup.prototype.constructor = es3fDrawTests.AttributeGroup;

    /**
     * @param{*} T typename
     * @return{*}
     */
    glsBuiltinPrecisionTests.instance = function(T) {
	    /** type{*} */ var s_instance = new T();
    	return s_instance;
    };


    /**
     * template <typename F>
     * @param {F} typename
     * @param {glsBuiltinPrecisionTests.BuiltinFuncs} funcs
     * @param {string=} name
     */
    glsBuiltinPrecisionTests.addScalarFactory = function(F, funcs, name) {
    	if (name === undefined)
    		name = glsBuiltinPrecisionTests.instance(F).getName();

    	// funcs.addFactory(SharedPtr<const CaseFactory>(new GenFuncCaseFactory(F.Sig, makeVectorizedFuncs<F>(), name)));
    }

    /**
     * @return {Array<CaseFactories>}
     */
    glsBuiltinPrecisionTests.createES3BuiltinCases = function() {
    	/** @type{CaseFactories} */ var funcs = new BuiltinFuncs();

    	addScalarFactory(new glsBuiltinPrecisionTests.Add(),funcs);
	// addScalarFactory<Sub>(*funcs);
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
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Length>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Distance>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Dot>()));
	// funcs.addFactory(createSimpleFuncCaseFactory<Cross>());
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Normalize>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<FaceForward>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Reflect>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Refract>()));
    //
    //
	// funcs.addFactory(SharedPtr<const CaseFactory>(new MatrixFuncCaseFactory<MatrixCompMult>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new MatrixFuncCaseFactory<OuterProduct>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new MatrixFuncCaseFactory<Transpose>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new SquareMatrixFuncCaseFactory<Determinant>()));
	// funcs.addFactory(SharedPtr<const CaseFactory>(new SquareMatrixFuncCaseFactory<Inverse>()));

    	return funcs;
    };

});
