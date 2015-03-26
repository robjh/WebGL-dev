Running closure compiler.
Here is a very hacky and horrible way to run the closure compiler to check intermodule dependencies.
1. Dependencies
* 'jjs' tool (part of java)
* closure compiler
* r.js  (RequireJS optimizer). I have included it in the repo already.

2. Steps
Open build.config and insert the path to the top level module that you want to test ("name")
Run:
# jjs -scripting r.js -- -o build.config

This will produce a built.js. This file will contain your module and all the dependencies as one huge javascript file.
Every line is annotated with approximate line number in the original file and the original module name. If your 'define(..., function()' is on one line, the line number will be exact.

At this stage you can manually add some code at the bottom of built.js if required (i.e. add global variables that are defined in the HTML page).
I add:
    <module>.run();
to make sure that closure will not optimize my main module away.

Run:
# compile-shaders-local.py built.js

This will produce built.txt. Check this file for warnings and errors. Not every warning is a genuine bug! Sometimes closure compiler gets confused by our class hierarchy.
Check especially for things like:
variable X is undeclared
Property X never defined
Missing return statement
actual parameter N of X does not match formal parameter
