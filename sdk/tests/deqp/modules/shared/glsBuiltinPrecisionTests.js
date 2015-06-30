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

goog.scope(function() {

    var glsBuiltinPrecisionTests = modules.shared.glsBuiltinPrecisionTests;
    var tcuTestCase = framework.common.tcuTestCase;
    var gluShaderProgram = framework.opengl.gluShaderProgram;
    var gluShaderUtil = framework.opengl.gluShaderUtil;
    var tcuInterval = framework.common.tcuInterval;
    var tcuFloatFormat = framework.common.tcuFloatFormat;


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
     * @constructor
     * @param{*=} t
     */
    glsBuiltinPrecisionTests.Void = function(t) {
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

        this.IRet = glsBuiltinPrecisionTests.Traits(this.Ret);
        this.IArg0 = glsBuiltinPrecisionTests.Traits(this.Arg0);
        this.IArg1 = glsBuiltinPrecisionTests.Traits(this.Arg1);
        this.IArg2 = glsBuiltinPrecisionTests.Traits(this.Arg2);
        this.IArg3 = glsBuiltinPrecisionTests.Traits(this.Arg3);

        this.Args = new glsBuiltinPrecisionTests.Tuple4(this.Arg0, this.Arg1, this.Arg2, this.Arg3);
        this.IArgs = new glsBuiltinPrecisionTests.Tuple4(this.IArg0, this.IArg1, this.IArg2, this.IArg3);

    	typedef Tuple4<	ExprP<Arg0>,	ExprP<Arg1>,	ExprP<Arg2>,	ExprP<Arg3> >	ArgExprs;
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
        this.a = A0 === undefined = new glsBuiltinPrecisionTests.Void() = A0();
        this.b = A1 === undefined = new glsBuiltinPrecisionTests.Void() = A1();
        this.c = A2 === undefined = new glsBuiltinPrecisionTests.Void() = A2();
        this.d = A3 === undefined = new glsBuiltinPrecisionTests.Void() = A3();
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
		this.floatPrecision = floatPrecision_)
		this.env = env_)
		this.callDepth = callDepth_ === undefined ? 0 : callDepth_;
    };

    /**
     * @constructor
     * @param{*} typename
     */
    glsBuiltinPrecisionTests.ScalarTraits = function(t) {
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
		return new tcuInterval.Interval(double(value));
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
		return a.contains(double(value));
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
		return fmt.roundOut(double(value), false);
	};

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
	};

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
     */
    glsBuiltinPrecisionTests.ContainerTraits = function() {};
	};

    // typedef typename	T::Element		Element;
    // typedef				I				IVal;

    /**
     * @param{*} value can be a vector or matrix
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doMakeIVal = function(value) {
    	/** @type{Array<tcuInterval.Interval>}	*/ var ret = [];

		for (int ndx = 0; ndx < T::SIZE; ++ndx)
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

		for (int ndx = 0; ndx < T::SIZE; ++ndx)
			ret[ndx] = unionIVal<Element>(a[ndx], b[ndx]);

		return ret;
	};

    /**
     * @param{tcuInterval.Interval} ival
     * @param{*} value
     * @return{boolean}
     */
    glsBuiltinPrecisionTests.ContainerTraits.prototype.doContains = function(ival, value) {
		for (int ndx = 0; ndx < T::SIZE; ++ndx)
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

		for (int ndx = 0; ndx < T::SIZE; ++ndx)	{
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
		/** @type{string} */ var os = dataTypeNameOf<T>() + '(';

		for (int ndx = 0; ndx < T::SIZE; ++ndx)
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

		for (int ndx = 0; ndx < T::SIZE; ++ndx)
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

		for (int ndx = 0; ndx < T::SIZE; ++ndx)
			ret[ndx] = this.round(fmt, value[ndx]);

		return ret;
	};

    /**
     * @param{*} T
     */
    glsBuiltinPrecisionTests.Traits = function(T) {
        this.typename = T;
    };

    /**
     * Common base class for all expressions regardless of their type.
     * @constructor
     */
    .ExprBase = function() {};

    /**
     */
    glsBuiltinPrecisionTests.ExprBase.prototype.printExpr = function (){
        this.doPrintExpr(os);
    };

    /**
     * Type-specific operations for an expression representing type T.
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ExprBase}
     * @param{*} T template <typename T>
     */
    glsBuiltinPrecisionTests.Expr = function(T) {
        this.typename = T;

    };

    /**
     * Type-specific operations for an expression representing type T.
     * @constructor
     * @extends{glsBuiltinPrecisionTests.ExprBase}
     * @param{*} T template <typename T>
     * @param{glsBuiltinPrecisionTests.EvalContext} ctx
     */
    glsBuiltinPrecisionTests.Expr.prototype.evaluate = function(ctx)
        return this.doEvaluate(ctx);
    };

    /**
     * Output the functions that this expression refers to
     * @param
     */
    glsBuiltinPrecisionTests.ExprBase.prototype.getUsedFuncs = function(/*FuncSet&*/ dst) {
		this.doGetUsedFuncs(dst);
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
    }

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
    }

    /**
     *
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.printDefinition = function (/*ostream& os*/) {
	    glsBuiltinPrecisionTests.doPrintDefinition(/*os*/);
	}

    /**
     * typedef set<const FuncBase*> FuncSet;
     * @param{glsBuiltinPrecisionTests.FuncSet} dst
     */
    glsBuiltinPrecisionTests.FuncBase.prototype.getUsedFuncs = function(dst) {
		this.doGetUsedFuncs(dst);
	}

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
    	this.Ret = Sig.Ret;
    	this.Arg0 = Sig.Arg0;
    	this.Arg1 = Sig.Arg1;
    	this.Arg2 = Sig.Arg2;
    	this.Arg3 = Sig.Arg3;
    	this.IRet = Sig.IRet;
    	this.IArg0 = Sig.IArg0;
    	this.IArg1 = Sig.IArg1;
    	this.IArg2 = Sig.IArg2;
    	this.IArg3 = Sig.IArg3;
    	this.Args = Sig.Args;
    	this.IArgs = Sig.IArgs;
    	this.ArgExprs = Sig.ArgExprs;
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
        var arg1 = Iarg0 === undefined ? this.IArg0() : Iarg0;
        var arg2 = Iarg0 === undefined ? this.IArg0() : Iarg0;
        var arg3 = Iarg0 === undefined ? this.IArg0() : Iarg0;
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
		if (isTypeValid<Arg0>())
			os += args[0];

		if (isTypeValid<Arg1>())
			os += ', ' + args[1];

		if (isTypeValid<Arg2>())
			os += ', ' + args[2];

		if (isTypeValid<Arg3>())
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


    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.Func}
     * @param{glsBuiltinPrecisionTests.Signature} Sig template <typename Sig>
     *
     */
    glsBuiltinPrecisionTests.PrimitiveFunc = function(Sig) {
        this.Ret = Sig.Ret;
        this.ArgExprs = Sig.ArgExprs;
    };

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
    glsBuiltinPrecisionTests.FloatFunc1.prototype.applyMonotone	(ctx, iarg0) {
		/** @type{tcuInterval.Interval} */ var ret = new tcuInterval.Interval();

        // TODO: port macros
		TCU_INTERVAL_APPLY_MONOTONE1(ret, arg0, iarg0, val,
									 TCU_SET_INTERVAL(val, point,
													  point = this->applyPoint(ctx, arg0)));

		ret.operatorOrAssignBinary(this.innerExtrema(ctx, iarg0));
		ret.operatorAddAssignBinary((this.getCodomain().operatorOrBinary(NaN));

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
		return tcuInterval.Interval.unbounded(true);
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

    /**
     * PrimitiveFunc<Signature<float, float, float> >
     * @constructor
     * @extends{glsBuiltinPrecisionTests.PrimitiveFunc}
     */
    glsBuiltinPrecisionTests.FloatFunc2 = function() {
        this.Sig = new glsBuiltinPrecisionTests.Signature(float,float,float);
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
    glsBuiltinPrecisionTests.FloatFunc2.prototype.applyMonotone	ctx, xi, yi) {
		/** @type{tcuInterval.Interval} */ var Interval reti = new tcuInterval.Interval();

		TCU_INTERVAL_APPLY_MONOTONE2(reti, x, xi, y, yi, ret,
									 TCU_SET_INTERVAL(ret, point,
													  point = this.applyPoint(ctx, x, y)));
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
    glsBuiltinPrecisionTests.FloatFunc2.prototype.innerExtrema	(ctx, xi, yi) {
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

		return new tcuInterval.Interval(-prec, prec).operatorSum(exact));
	}

    /**
     * @param{number} x
     * @param{number} y
     * @return{number}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.applyExact = function(x, y) {
		TCU_THROW(InternalError, "Cannot apply");
	};

    /**
     * @return{tcuInterval.Interval}
     */
    glsBuiltinPrecisionTests.FloatFunc2.prototype.getCodomain = function() {
		return tcuInterval.Interval.unbounded(true);
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

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FloatFunc2}
     * @return{string}
     */
    glsBuiltinPrecisionTests.InfixOperator = function(){};

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
    glsBuiltinPrecisionTests.InfixOperator.prototype.doPrint(/*ostream& os,*/ args) {
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
    glsBuiltinPrecisionTests.FloatFunc3.prototype.applyMonotone	(ctx, xi, yi, zi) {
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


    /************************************/

    /**
     * @constructor
     * @extends{tcuTestCase.DeqpTest}
     * @param{string} name
     * @param{string} extension
     */
    glsBuiltinPrecisionTests.PrecisionCase = function(name, extension) {
        tcuTestCase.DeqpTest.call(this, name, extension);
        /** @type{string} */ var this.m_extension = extension;
    };

    glsBuiltinPrecisionTests.PrecisionCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    glsBuiltinPrecisionTests.PrecisionCase.prototype.constructor = glsBuiltinPrecisionTests.PrecisionCase;

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.PrecisionCase}
     * @param{string} name
     * @param{glsBuiltinPrecisionTests.FuncBase} extension
     */
    glsBuiltinPrecisionTests.FuncCaseBase = function(name, func) {
        glsBuiltinPrecisionTests.PrecisionCase.call(this, name, func.getRequiredExtension());
    };

    glsBuiltinPrecisionTests.FuncCaseBase.prototype = Object.create(glsBuiltinPrecisionTests.PrecisionCase.prototype);
    glsBuiltinPrecisionTests.FuncCaseBase.prototype.constructor = glsBuiltinPrecisionTests.FuncCaseBase;

    glsBuiltinPrecisionTests.FuncCaseBase.prototype.iterate = function() {

        assertMsgOptions(this.m_extension !== undefined && !sglrGLContext.isExtensionSupported(gl, this.m_extension), 'Unsupported extension: ' + m_extension, false, true);

	    runTest();

	    // m_status.setTestContextResult(m_testCtx);
	    return tcuTestCase.IterateResult.STOP;
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.FuncCaseBase}
     * @param{string} name
     * @param{glsBuiltinPrecisionTests.FuncBase} extension
     */
    glsBuiltinPrecisionTests.FuncCase = function(name, func) {
        glsBuiltinPrecisionTests.FuncCaseBase.call(this, name, func.getRequiredExtension());
    };

    glsBuiltinPrecisionTests.FuncCase.prototype.iterate = function

    glsBuiltinPrecisionTests.FuncCase.prototype = Object.create(glsBuiltinPrecisionTests.FuncCaseBase.prototype);
    glsBuiltinPrecisionTests.FuncCase.prototype.constructor = glsBuiltinPrecisionTests.FuncCase;


    /**
     * @constructor
     */
    glsBuiltinPrecisionTests.CaseFactories = function() {};

    /**
     * @return{Array<glsBuiltinPrecisionTests.CaseFactory>}
     */
    glsBuiltinPrecisionTests.CaseFactories.prototype.getFactories = function (){
    };

    /**
     * @constructor
     * @extends{glsBuiltinPrecisionTests.CaseFactories}
     */
    glsBuiltinPrecisionTests.BuiltinFuncs = function() {
        /** @type{Array<glsBuiltinPrecisionTests.CaseFactory>} */ this.m_factories = [];
    }:

    /**
     * @return{Array<glsBuiltinPrecisionTests.CaseFactory>}
     */
	glsBuiltinPrecisionTests.BuiltinFuncs.prototype.getFactories = function() {
		return this.m_factories.slice();
	};

    glsBuiltinPrecisionTests.BuiltinFuncs.prototype = Object.create(glsBuiltinPrecisionTests.CaseFactories.prototype);
    glsBuiltinPrecisionTests.BuiltinFuncs.prototype.constructor = glsBuiltinPrecisionTests.BuiltinFuncs;

    /**
     * @return{glsBuiltinPrecisionTests.CaseFactories} fact
     */
	glsBuiltinPrecisionTests.BuiltinFuncs.prototype.addFactory = function(fact)	{
		this.m_factories.push(fact);
	}



        /**
         * @constructor
         */
        glsBuiltinPrecisionTests.CaseFactory = function () {};

        /**
         * @return{string}
         */
        glsBuiltinPrecisionTests.prototype.getName = function	() {
            return '';
        };

        /**
         * @return{string}
         */
        glsBuiltinPrecisionTests.prototype.getDesc = function	() {
            return '';
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
												 tcu::MAYBE,	// subnormals
												 tcu::YES,		// infinities
												 tcu::MAYBE);	// NaN
	    // \todo [2014-04-01 lauri] Check these once Khronos bug 11840 is resolved.
	    /** @type{glsBuiltinPrecisionTests.FloatFormat} */ var mediump = new glsBuiltinPrecisionTests.FloatFormat(-13, 13, 9, false);
	    // A fixed-point format is just a floating point format with a fixed
	    // exponent and support for subnormals.
	    /** @type{glsBuiltinPrecisionTests.FloatFormat} */ var lowp	= new glsBuiltinPrecisionTests.FloatFormat(0, 0, 7, false, tcu::YES);
	    /** @type{glsBuiltinPrecisionTests.PrecisionTestContext} */ var ctx	= glsBuiltinPrecisionTests.PrecisionTestContext(highp, mediump, lowp,
												 shaderTypes, 16384);

	    for (size_t ndx = 0; ndx < cases.getFactories().size(); ++ndx)
		    dstGroup.addChild(createFuncGroup(ctx, *cases.getFactories()[ndx]));
    };


    // es3fDrawTests.AttributeGroup.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    // es3fDrawTests.AttributeGroup.prototype.constructor = es3fDrawTests.AttributeGroup;


    /**
     * @return {Array<CaseFactories>}
     */
    glsBuiltinPrecisionTests.createES3BuiltinCases = function() {
	 /** @type{CaseFactories} */ var funcs = new BuiltinFuncs();

	addScalarFactory<Add>(funcs);
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
