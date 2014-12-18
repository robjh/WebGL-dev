'''
Created on 18 Dec 2014

@author: allo
'''

'''

THIS VERSION ONLY APPLY WHISPACE_ONLY COMPILATION
AND RETURNS IN A TEXT FILE AND THE PROMPT COMMAND LINE THE OPTIMIZED VERSION OF shader-utils.js

IT WILL BE IMPROVED WITH ALL THE JAVASCRIPTS AND WITH THE ERRORS COMPILING ERRORS INSTEAD

WITHIN /deqp/data/gles2/shaders/

'''

# /Python34



import http.client, urllib, sys

# Define the parameters for the POST request and encode them in
# a URL-safe format.

params = urllib.parse.urlencode([
    # ('js_code', sys.argv[1]),
   # ('js_code', 'alert("hello");// This comment should be stripped'),
    ('code_url', 'https://raw.githubusercontent.com/robjh/WebGL-dev/master/conformance-suites/1.0.3/deqp/data/gles2/shaders/shader-utils.js'),
    ('compilation_level', 'WHITESPACE_ONLY'),
    ('output_format', 'text'),
    ('output_info', 'compiled_code'),
  ])

# Always use the following value for the Content-type header.
headers = { "Content-type": "application/x-www-form-urlencoded" }
conn = http.client.HTTPConnection('closure-compiler.appspot.com')
conn.request('POST', '/compile', params, headers)
response = conn.getresponse()
data = response.read()
print (data)

# output file to save response from Closure compiler
with open("test.txt", "wt") as out_file:
    out_file.write(data.__str__())
    
conn.close()
