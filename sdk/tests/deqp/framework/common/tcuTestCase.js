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
     * Reads the filter parameter from the URL to filter tests.
     * @return {?string }
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
     * Indicates the state of an iteration operation.
     * @enum {number}
     */
    tcuTestCase.IterateResult = {
        STOP: 0,
        CONTINUE: 1
    };

    /****************************************
    * Runner
    ***************************************/

    /**
    * A simple state machine.
    * The purpose of this this object is to break
    * long tests into small chunks that won't cause a timeout
    * @constructor
    */
    tcuTestCase.Runner = function() {
        /** @type {tcuTestCase.DeqpTest} */ this.currentTest = null;
        /** @type {tcuTestCase.DeqpTest} */ this.nextTest = null;
        /** @type {tcuTestCase.DeqpTest} */ this.testCases = null;
        /** @type {?string } */ this.filter = tcuTestCase.getFilter();
    };

    /**
    * @param {tcuTestCase.DeqpTest} root The root test of the test tree.
    */
    tcuTestCase.Runner.prototype.setRoot = function(root) {
        this.currentTest = null;
        this.testCases = root;
    };

    /**
    * Searches the test tree for the next executable test
    * @return {?tcuTestCase.DeqpTest }
    */
    tcuTestCase.Runner.prototype.next = function() {

        // First time? Use root test
        if (!this.currentTest) {
            this.currentTest = this.testCases;

            // Root is executable? Use it
            if (this.currentTest.isExecutable())
                return this.currentTest;
        }

        // Should we proceed with the next test?
        if (tcuTestCase.lastResult == tcuTestCase.IterateResult.STOP) {
            // Look for next executable test
            do {
                this.currentTest = this.currentTest.next(this.filter);
            } while (this.currentTest && !this.currentTest.isExecutable());
        }

        return this.currentTest;
    };

    /**
    * Schedule the callback to be run ASAP
    * @param {function()} callback Callback to schedule
    */
    tcuTestCase.Runner.prototype.runCallback = function(callback) {
        setTimeout(function() {
            callback();
        }.bind(this), 0);
    };

    /**
    * Call this function at the end of the test
    */
    tcuTestCase.Runner.prototype.terminate = function() {
        finishTest();
    };

    tcuTestCase.runner = new tcuTestCase.Runner();

    /** @type {tcuTestCase.IterateResult} */ tcuTestCase.lastResult = tcuTestCase.IterateResult.STOP;

    /***************************************
    * DeqpTest
    ***************************************/

    /**
    * Assigns name, description and specification to test
    * @constructor
    * @param {?string} name
    * @param {?string} description
    * @param {Object=} spec
    */
    tcuTestCase.DeqpTest = function(name, description, spec) {
        this.name = name;
        this.description = description;
        this.spec = spec;
        this.currentTestNdx = 0;
        this.parentTest = null;
        this.childrenTests = [];
        this.executeAlways = false;
    };

    /**
     * Abstract init function(each particular test will implement it)
     */
    tcuTestCase.DeqpTest.prototype.init = function() {};

    /**
     * Abstract iterate function(each particular test will implement it)
     * @return {tcuTestCase.IterateResult}
     */
    tcuTestCase.DeqpTest.prototype.iterate = function() { return tcuTestCase.IterateResult.STOP; };

    /**
    * Checks if the test is executable
    * @return {boolean}
    */
    tcuTestCase.DeqpTest.prototype.isExecutable = function() {
        return this.childrenTests.length == 0 || this.executeAlways;
    };

    /**
     * Checks if the test is a leaf
     */
    tcuTestCase.DeqpTest.prototype.isLeaf = function() {
        return this.childrenTests.length == 0;
    };

    /**
     * Marks the test as always executable
     */
    tcuTestCase.DeqpTest.prototype.makeExecutable = function() {
        this.executeAlways = true;
    };

    /**
    * Adds a child test to the test's children
    * @param {tcuTestCase.DeqpTest} test
    */
    tcuTestCase.DeqpTest.prototype.addChild = function(test) {
        test.parentTest = this;
        this.childrenTests.push(test);
    };

    /**
     * Sets the whole children tests array
     * @param {Array<tcuTestCase.DeqpTest>} tests
     */
    tcuTestCase.DeqpTest.prototype.setChildren = function(tests) {
        for (var test in tests)
            tests[test].parentTest = this;
        this.childrenTests = tests;
    };

    /**
    * Returns the next test in the hierarchy of tests
    *
    * @param {?string } pattern Optional pattern to search for
    * @return {tcuTestCase.DeqpTest}
    */
    tcuTestCase.DeqpTest.prototype.next = function(pattern) {
        if (pattern)
            return this.find(pattern);

        var test = null;

        //Look for the next child
        if (this.currentTestNdx < this.childrenTests.length) {
            test = this.childrenTests[this.currentTestNdx];
            this.currentTestNdx++;
        }

        // If no more children, get the next brother
        if (test == null && this.parentTest != null) {
            this.currentTestNdx = 0;
            test = this.parentTest.next(null);
        }

        return test;
    };

    /**
    * Returns the full name of the test
    *
    * @return {?string} Full test name.
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
    * @return {?string} Test description.
    */
    tcuTestCase.DeqpTest.prototype.getDescription = function() {
        return this.description;
    };

    /**
    * Find a test with a matching name
    * Fast-forwards to a test whose full name matches the given pattern
    *
    * @param {string} pattern Regular expression to search for
    * @return {?tcuTestCase.DeqpTest } Found test or null.
    */
    tcuTestCase.DeqpTest.prototype.find = function(pattern) {
        var test = null;
        while (true) {
            test = this.next(null);
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
        this.currentTestNdx = 0;

        for (var i = 0; i < this.childrenTests.length; i++)
            this.childrenTests[i].reset();
    };

    /**
    * Defines a new test
    *
    * @param {?string} name Short test name
    * @param {?string} description Description of the test
    * @param {Object=} spec Test specification
    *
    * @return {tcuTestCase.DeqpTest} The new test
    */
    tcuTestCase.newTest = function(name, description, spec) {
        var test = new tcuTestCase.DeqpTest(name, description, spec);

        return test;
    };

    /**
    * Defines a new executable test so it gets run even if it's not a leaf
    *
    * @param {string} name Short test name
    * @param {string} description Description of the test
    * @param {Object=} spec Test specification
    *
    * @return {tcuTestCase.DeqpTest} The new test
    */
    tcuTestCase.newExecutableTest = function(name, description, spec) {
        var test = tcuTestCase.newTest(name, description, spec);
        test.makeExecutable();

        return test;
    };

    /**
    * Run through the test cases giving time to system operation.
    */
    tcuTestCase.runTestCases = function() {
        var state = tcuTestCase.runner;

        if (state.next()) {
            try {
                // If proceeding with the next test, prepare it.
                var fullTestName = state.currentTest.fullName();
                if (tcuTestCase.lastResult == tcuTestCase.IterateResult.STOP) {
                    // Update current test name
                    setCurrentTestName(fullTestName);
                    bufferedLogToConsole('Init testcase: ' + fullTestName); //Show also in console so we can see which test crashed the browser's tab

                    // Initialize particular test
                    state.currentTest.init();
                }

                //If it's a leaf test, notify of it's execution.
                if (state.currentTest.isLeaf())
                    debug('Start testcase: ' + fullTestName);

                // Run the test, save the result.
                tcuTestCase.lastResult = state.currentTest.iterate();
            }
            catch (err) {
                // If the exception was not thrown by a test check, log it, but don't throw it again
                if (!(err instanceof TestFailedException))
                    testFailedOptions(err.message, false);
                bufferedLogToConsole(err);
            }

            tcuTestCase.runner.runCallback(tcuTestCase.runTestCases);
        } else
            tcuTestCase.runner.terminate();
    };

});
