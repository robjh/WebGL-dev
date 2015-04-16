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

/**
 * This class allows one to create a hierarchy of tests and iterate over them.
 * It replaces TestCase and TestCaseGroup classes.
 */
'use strict';
goog.provide('framework.common.tcuTestCase');


goog.scope(function() {

var tcuTestCase = framework.common.tcuTestCase;


/**
 * A simple state machine.
 * The purpose of this this object is to break
 * long tests into small chunks that won't cause a timeout
 */
tcuTestCase.runner = (function() {


/**
 * Indicates the state of an iteration operation.
 */
var IterateResult = {
    STOP: 0,
    CONTINUE: 1
};

/**
 * A general purpose bucket for string current execution state
 * tcuTestCase.runner doesn't modify this container.
 */
var state = {};

/**
 * Returns the state
 */
var getState = function() {
    return state;
};

/**
 * Schedule the callback to be run ASAP
 * @param {function()} callback Callback to schedule
 */
var runCallback = function(callback) {
    setTimeout(function() {
        callback();
    }.bind(this), 0);
};

/**
 * Call this function at the end of the test
 */
var terminate = function() {
    finishTest();
};

return {
    runCallback: runCallback,
    getState: getState,
    terminate: terminate,
    IterateResult: IterateResult,
    none: false
};
}());

/**
 * Assigns name, description and specification to test
 * @constructor
 * @param {string} name
 * @param {string} description
 * @param {string} spec
 */
tcuTestCase.DeqpTest = function(name, description, spec) {
    this.name = name;
    this.description = description;
    this.spec = spec;
    this.currentTest = 0;
    this.parentTest = null;
};

/** @type {tcuTestCase.runner.IterateResult} static property */ tcuTestCase.DeqpTest.lastResult = tcuTestCase.runner.IterateResult.STOP;

 tcuTestCase.DeqpTest.prototype.addChild = function(test) {
    test.parentTest = this;

    if (!this.spec)
    {
        this.spec = [];
    }

    if (this.spec.length === undefined)
    {
        testFailedOptions('The spec object contains something besides an array', true);
    }

    this.spec.push(test);
 };

/**
 * Returns the next test in the hierarchy of tests
 *
 * @param {string} pattern Optional pattern to search for
 * @return {Object} Test specification
 */
 tcuTestCase.DeqpTest.prototype.next = function(pattern) {
    if (pattern)
        return this.find(pattern);

    var test = null;

    //Look for the next child
    if (this.spec && this.spec.length) {
        if (this.currentTest < this.spec.length) {
            test = this.spec[this.currentTest];
            this.currentTest++;
        }
    }

    //If no more children, get the next brother
    if (test == null && this.parentTest !== undefined)
        test = this.parentTest.next();

    return test;
};

/**
 * Returns the full name of the test
 *
 * @return {string} Full test name.
 */
tcuTestCase.DeqpTest.prototype.fullName = function() {
    if (this.parentTest)
        var parentName = this.parentTest.fullName();
        if (parentName)
            return parentName + '.' + this.name;
    return this.name;
};

/**
 * Returns the description of the test
 *
 * @return {string} Test description.
 */
tcuTestCase.DeqpTest.prototype.getDescription = function() {
    return this.description;
};

/**
 * Find a test with a matching name
 * Fast-forwards to a test whose full name matches the given pattern
 *
 * @param {string} pattern Regular expression to search for
 * @return {Object} Found test or null.
 */
tcuTestCase.DeqpTest.prototype.find = function(pattern) {
    var test = null;
    while (true) {
        test = this.next();
        if (!test)
            break;
        if (test.fullName().match(pattern))
            break;
    }
    return test;
};

/**
 * Reset the iterator.
 */
 tcuTestCase.DeqpTest.prototype.reset = function() {
    this.currentTest = 0;

    if (this.spec && this.spec.length)
        for (var i = 0; i < this.spec.length; i++)
            this.spec[i].reset();
};


/**
 * Defines a new test
 *
 * @param {string} name Short test name
 * @param {string} description Description of the test
 * @param {(Array.<tcuTestCase.DeqpTest>|Object)} spec Test specification or an array of DeqpTests
 *
 * @return {tcuTestCase.DeqpTest} The new test
 */
tcuTestCase.newTest = function(name, description, spec) {
    var test = new tcuTestCase.DeqpTest(name, description, spec);

    if (spec && spec.length) {
        for (var i = 0; i < spec.length; i++)
            spec[i].parentTest = test;
    }

    return test;
};

/**
 * Reads the filter parameter from the URL to filter tests.
 */
tcuTestCase.getFilter = function() {
    var queryVars = window.location.search.substring(1).split('&');

    for (var i = 0; i < queryVars.length; i++) {
        var value = queryVars[i].split('=');
        if (decodeURIComponent(value[0]) === 'filter')
            return decodeURIComponent(value[1]);
    }
    return null;
};

/**
 * Run through the test cases giving time to system operation.
 */
tcuTestCase.runTestCases = function() {
    var state = tcuTestCase.runner.getState();
    if (state.filter === undefined)
        state.filter = tcuTestCase.getFilter();

    //Should we proceed with the next test?
    if (tcuTestCase.DeqpTest.lastResult == tcuTestCase.runner.IterateResult.STOP) {
        //If current test not defined, let's start with the root test.
        state.currentTest = state.currentTest ?
            state.currentTest.next(state.filter) :
            state.testCases;
    }

    if (state.currentTest) {
        try
        {
            //If proceeding with the next test, prepare it.
            if (tcuTestCase.DeqpTest.lastResult == tcuTestCase.runner.IterateResult.STOP)
            {
                //Update current test name
                var fullTestName = state.currentTest.fullName();
                setCurrentTestName(fullTestName);
                bufferedLogToConsole('Start testcase: ' + fullTestName); //Show also in console so we can see which test crashed the browser's tab

                //TODO: Improve this
                //Initialize particular test if it exposes an init method
                if (state.currentTest.init !== undefined)
                    state.currentTest.init();
                else if (state.currentTest.spec !== undefined && state.currentTest.spec.init !== undefined)
                    state.currentTest.spec.init();
            }

            //TODO: Improve this
            //Run the test, save the result.
            if (state.currentTest.iterate !== undefined)
            {
                debug('Start testcase: ' + fullTestName);
                tcuTestCase.DeqpTest.lastResult = state.currentTest.iterate();
            }
            else if (state.currentTest.spec !== undefined && state.currentTest.spec.iterate !== undefined)
            {
                debug('Start testcase: ' + fullTestName);
                tcuTestCase.DeqpTest.lastResult = state.currentTest.spec.iterate();
            }
        }
        catch (err)
        {
            //If the exception was not thrown by a test check, log it, but don't throw it again
            if (!(err instanceof TestFailedException))
                testFailedOptions(err.message, false);
            bufferedLogToConsole(err);
        }

        tcuTestCase.runner.runCallback(tcuTestCase.runTestCases);

    } else
        tcuTestCase.runner.terminate();
};



});
