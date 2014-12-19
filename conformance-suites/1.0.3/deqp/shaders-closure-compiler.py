'''
Created on 18 Dec 2014
Last Update on 19 Dec 2014

@author: Alberto Lopez, Mobica LTD
'''

'''
by default the program is set up to use Closure to compile the javaScripts
WITHIN /deqp/data/gles2/shaders/ with this configuration

    outputInfo= "errors"
    compilationLevel= "SIMPLE_OPTIMIZATIONS"
    outputFormat= "text"

this script RETURNS as many .txt as javascripts WITHIN /deqp/data/gles2/shaders/
with the information displayed in the command line

- configuration of outputInfo, compilationLevel and outputFormat may be changed by using line comments
- to add more scripts, just add the corresponding url inside the list "listJs"
- python 3.4 version has been used

'''

from _elementtree import Element
# /Python34

import http.client, urllib, sys

# url for the javascripts shaders
listJs = ["https://raw.githubusercontent.com/robjh/WebGL-dev/master/conformance-suites/1.0.3/deqp/data/gles2/shaders/shader-utils.js",
           "https://raw.githubusercontent.com/robjh/WebGL-dev/master/conformance-suites/1.0.3/deqp/data/gles2/shaders/shader-library.js" ,
            "https://raw.githubusercontent.com/robjh/WebGL-dev/master/conformance-suites/1.0.3/deqp/data/gles2/shaders/shader-library-case.js",
            "https://raw.githubusercontent.com/robjh/WebGL-dev/master/conformance-suites/1.0.3/deqp/data/gles2/shaders/glu-draw.js"]


#outputInfo= "statistics"
#outputInfo= "warnings"
#outputInfo= "compiled_code"
outputInfo= "errors"

#compilationLevel= "WHITESPACE_ONLY"
compilationLevel= "SIMPLE_OPTIMIZATIONS"
#compilationLevel= "ADVANCED_OPTIMIZATIONS"

#outputFormat= "xml"
#outputFormat= "json"
outputFormat= "text"


# Define the parameters for the POST request and encode them in
# a URL-safe format.
def callClosureCompiler(listJsLink, compilationLevel, outputFormat, outputInfo):
    params = urllib.parse.urlencode([
       
    ('code_url', listJsLink),
    ('compilation_level', compilationLevel),    
    ('output_format', outputFormat),    
    ('output_info', outputInfo),
    
  ])

    # Always use the following value for the Content-type header.
    headers = { "Content-type": "application/x-www-form-urlencoded" }
    conn = http.client.HTTPConnection('closure-compiler.appspot.com')
    conn.request('POST', '/compile', params, headers)
    response = conn.getresponse()
    data = response.read()
    
    outputCompilerFile= listJsLink.strip()[106:-3]
    print("\n")
    print("CLOSURE COMPILER OUTPUT ")
    print("FOR JavaScript shader file: " + outputCompilerFile + ".js")
    print("COMPILATION LEVEL: " + compilationLevel)
    print("OUTPUT FORMAT: " + outputFormat)
    print("OUTPUT INFO: " + outputInfo)
    print("\n")
    print (data)
    print("\n")

    # output file to save response from Closure compiler
    
    outputCompilerFile= outputCompilerFile +".txt"
    with open(outputCompilerFile, "wt") as out_file:
        out_file.write("CLOSURE COMPILER OUTPUT " + "\n")
        out_file.write("JavaScript shader file: " + outputCompilerFile + "\n")
        out_file.write("COMPILATION LEVEL: " + compilationLevel + "\n")
        out_file.write("OUTPUT FORMAT: " + outputFormat + "\n")
        out_file.write("OUTPUT INFO: " + outputInfo + "\n")
        out_file.write(data.__str__())
    
    conn.close()


# Closure compiler is called as many time as javascripts in /deqp/data/gles2/shaders/
for Element in listJs:
    callClosureCompiler(Element, compilationLevel, outputFormat, outputInfo)

    
