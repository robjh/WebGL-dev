
/**
 * @param {string} msg
 */
function description(msg){};

function finishTest(){};

/**
 * @param {string} name
 */
function setCurrentTestName(name){};

/**
 * @param {string} msg
 */
function bufferedLogToConsole(msg){};

/**
 * @constructor
 * @param {string} message The error message.
 */
var TestFailedException = function (message) {};

/**
 * @param {boolean} assertion
 * @param {string} msg
 * @param {boolean} verbose
 * @param {boolean} exthrow
 */
function assertMsgOptions(assertion, msg, verbose, exthrow) {};

/**
 * @param {string} msg
 */
function debug(msg){};

/**
 * @param {string} msg
 * @param {boolean} exthrow
 */
function testFailedOptions(msg, exthrow){};