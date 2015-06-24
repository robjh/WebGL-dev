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

goog.scope(function() {

    var glsBuiltinPrecisionTests = modules.shared.glsBuiltinPrecisionTests;
    var tcuTestCase = framework.common.tcuTestCase;
    var gluShaderProgram = framework.opengl.gluShaderProgram;
    var gluShaderUtil = framework.opengl.gluShaderUtil;
    var tcuInterval = framework.common.tcuInterval;

    /**
     * @enum{number}
     */
    glsBuiltinPrecisionTests.YesNoMaybe = {
        NO : 0,
	    MAYBE : 1,
	    YES : 2
    };

    /**
     * @constructor
     * @param{number} minExp
     * @param{number} maxExp
     * @param{number} fractionBits
     * @param{boolean} exactPrecision
     * @param{glsBuiltinPrecisionTests.YesNoMaybe=} hasSubnormal
     * @param{glsBuiltinPrecisionTests.YesNoMaybe=} hasInf
     * @param{glsBuiltinPrecisionTests.YesNoMaybe=} hasNaN
     */
    glsBuiltinPrecisionTests.FloatFormat = function (minExp, maxExp, fractionBits, exactPrecision, hasSubnormal, hasInf, hasNaN) {
        // /** @type{number} */ var exponentShift (int exp) const;
    	// Interval			clampValue		(double d) const;

    	/** @type{number} */ this.m_minExp = minExp;			// Minimum exponent, inclusive
    	/** @type{number} */ this.m_maxExp = maxExp;			// Maximum exponent, inclusive
    	/** @type{number} */ this.m_fractionBits = fractionBits;		// Number of fractional bits in significand
    	/** @type{glsBuiltinPrecisionTests.YesNoMaybe} */ this.m_hasSubnormal = hasSubnormal === undefined ? glsBuiltinPrecisionTests.YesNoMaybe.MAYBE : hasSubnormal;		// Does the format support denormalized numbers?
    	/** @type{glsBuiltinPrecisionTests.YesNoMaybe} */ this.m_hasInf = hasInf === undefined ? glsBuiltinPrecisionTests.YesNoMaybe.MAYBE : hasInf;;			// Does the format support infinities?
    	/** @type{glsBuiltinPrecisionTests.YesNoMaybe} */ this.m_hasNaN = hasNaN === undefined ? glsBuiltinPrecisionTests.YesNoMaybe.MAYBE : hasNaN;;			// Does the format support NaNs?
    	/** @type{boolean} */ this.m_exactPrecision = exactPrecision;	// Are larger precisions disallowed?
    	/** @type{number} */ this.m_maxValue; //= (deLdExp(1.0, maxExp) +
			// deLdExp(double((1ull << fractionBits) - 1), maxExp - fractionBits));			// Largest representable finite value.
    };

    /**
     * @return{number}
     */
    glsBuiltinPrecisionTests.FloatFormat.prototype.getMinExp = function () {
    	return this.m_minExp;
    };

    /**
     * @return{number}
     */
    glsBuiltinPrecisionTests.FloatFormat.prototype.getMaxExp = function () {
    	return this.m_minExp;
    };

    /**
     * @return{number}
     */
    glsBuiltinPrecisionTests.FloatFormat.prototype.getMaxValue = function () {
    	return this.m_maxValue;
    };

    /**
     * @return{number}
     */
    glsBuiltinPrecisionTests.FloatFormat.prototype.getFractionBits = function () {
    	return this.m_fractionBits;
    };

    /**
     * @return{glsBuiltinPrecisionTests.YesNoMaybe}
     */
    glsBuiltinPrecisionTests.FloatFormat.prototype.hasSubnormal = function () {
    	return this.m_hasSubnormal;
    };

    /**
     * @return{glsBuiltinPrecisionTests.YesNoMaybe}
     */
    glsBuiltinPrecisionTests.FloatFormat.prototype.hasSubnormal = function () {
    	return this.m_hasSubnormal;
    };

    /**
     * @return{number} x
     * @return{number} count
     */
    glsBuiltinPrecisionTests.FloatFormat.prototype.ulp = function(double x, double count) {
	    /** @type{number} */ var exp = 0;
	    /** @type{number} */ var frac = deFractExp(deAbs(x), &exp);

	    if (deIsNaN(frac))
		    return TCU_NAN;
	    else if (deIsInf(frac))
		    return deLdExp(1.0, m_maxExp - m_fractionBits);
	    else if (frac == 1.0) {
    		// Harrison's ULP: choose distance to closest (i.e. next lower) at binade
    		// boundary.
    		--exp;
	    } else if (frac == 0.0)
		    exp = m_minExp;

    	// ULP cannot be lower than the smallest quantum.
    	exp = Math.max(exp, m_minExp);

	    {
    		const double		oneULP	= deLdExp(1.0, exp - m_fractionBits);
    		ScopedRoundingMode	ctx		(DE_ROUNDINGMODE_TO_POSITIVE_INF);

    		return oneULP * count;
	   }
   };

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
        uses -> Traits<>
            <void>
            <bool,float,int>
                ScalarTraits
            <Matrix<T,Rows,Cols>,vector<T,size>>
                ContainerTraits
        uses -> Tuple4<>


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
                DEFINE_DERIVED_FLOAT1 -> Sqrt, Radians, Degrees, Tan, Sinh, Cosh,
                    Tanh, ASinh, ACosh, ATanh, Fract
                DEFINE_DERIVED_FLOAT2 -> Pow, Mod,
                DEFINE_DERIVED_FLOAT3 -> Mix
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

	typedef typename Traits<Ret>::IVal	IRet;
	typedef typename Traits<Arg0>::IVal	IArg0;
	typedef typename Traits<Arg1>::IVal	IArg1;
	typedef typename Traits<Arg2>::IVal	IArg2;
	typedef typename Traits<Arg3>::IVal	IArg3;

	typedef Tuple4<	const Arg0&,	const Arg1&,	const Arg2&,	const Arg3&>	Args;
	typedef Tuple4<	const IArg0&,	const IArg1&,	const IArg2&,	const IArg3&> 	IArgs;
	typedef Tuple4<	ExprP<Arg0>,	ExprP<Arg1>,	ExprP<Arg2>,	ExprP<Arg3> >	ArgExprs;
};

    /**
     * @constructor
     * @param{*} R
     * @param{*} P0
     * @param{*} P1
     * @param{*} P2
     * @param{*} P3
     */
    glsBuiltinPrecisionTests.ScalarTraits = function() {};
	// typedef 			Interval		IVal;

	glsBuiltinPrecisionTests.doMakeIVal	(const T& value)
	{
		// Thankfully all scalar types have a well-defined conversion to `double`,
		// hence Interval can represent their ranges without problems.
		return Interval(double(value));
	}

	static Interval		doUnion			(const Interval& a, const Interval& b)
	{
		return a | b;
	}

	static bool			doContains		(const Interval& a, T value)
	{
		return a.contains(double(value));
	}

	static Interval		doConvert		(const FloatFormat& fmt, const IVal& ival)
	{
		return fmt.convert(ival);
	}

	static Interval		doRound			(const FloatFormat& fmt, T value)
	{
		return fmt.roundOut(double(value), false);
	}
};

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
	// funcs->addFactory(createSimpleFuncCaseFactory<Modf>());
	// addScalarFactory<Min>(*funcs);
	// addScalarFactory<Max>(*funcs);
	// addScalarFactory<Clamp>(*funcs);
	// addScalarFactory<Mix>(*funcs);
	// addScalarFactory<Step>(*funcs);
	// addScalarFactory<SmoothStep>(*funcs);
    //
	// funcs->addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Length>()));
	// funcs->addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Distance>()));
	// funcs->addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Dot>()));
	// funcs->addFactory(createSimpleFuncCaseFactory<Cross>());
	// funcs->addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Normalize>()));
	// funcs->addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<FaceForward>()));
	// funcs->addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Reflect>()));
	// funcs->addFactory(SharedPtr<const CaseFactory>(new TemplateFuncCaseFactory<Refract>()));
    //
    //
	// funcs->addFactory(SharedPtr<const CaseFactory>(new MatrixFuncCaseFactory<MatrixCompMult>()));
	// funcs->addFactory(SharedPtr<const CaseFactory>(new MatrixFuncCaseFactory<OuterProduct>()));
	// funcs->addFactory(SharedPtr<const CaseFactory>(new MatrixFuncCaseFactory<Transpose>()));
	// funcs->addFactory(SharedPtr<const CaseFactory>(new SquareMatrixFuncCaseFactory<Determinant>()));
	// funcs->addFactory(SharedPtr<const CaseFactory>(new SquareMatrixFuncCaseFactory<Inverse>()));

	return funcs;
};



});
