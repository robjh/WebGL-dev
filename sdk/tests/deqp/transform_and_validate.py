#!/usr/bin/env python
import sys 
import re
import os
from subprocess import Popen, PIPE
from sys import stdout, stderr, argv

# Global variables for file transformation
provideFullNamespace = ''
namespaceAlias = ''

# Global variable to store overall results of the script execution
results = ''

# Out directory for transformation
outDirectory = '/home/malo/projects/webgl-tests/ms3/WebGL-dev/sdk/tests/deqp'
inDirectory  = '/home/malo/projects/webgl-tests/WebGL-dev/sdk/tests/deqp'

# ---------------------------------------------------------------------------------------#
# -------------------------  TRANSFORMATION FUNCTIONS -----------------------------------#
# ---------------------------------------------------------------------------------------#


# Pulls variable names that shouldn't be updated.
def fetchWhiteList():
	f = open('whitelist', 'r')
	whitelist = f.read()
	return whitelist.split(',')

# defines variables uses throught the script. These contains the
# new domain of the file and the alias of the inner variables.
def defineGlobalValues(filepath):
	global provideFullNamespace 
	global namespaceAlias 

	filepath = filepath[filepath.find('deqp')+5:]
	provideFullNamespace = filepath[0:-3].replace('/','.')
	namespaceAlias = provideFullNamespace[provideFullNamespace.rfind('.') + 1:]

# Creates the file header for google closure adding the following format:
# goog.provide(provideFullNamespace). provideFullNamespace can be like 'framework.common.tcuTexture'
# goog.require(provideFullNamespace). provideFullNamespace can be like 'framework.common.tcuTexture'
# Appends 'goog.scope(function() {''
# Sets the domain alias. Like: 'var tcuTexture = framework.common.tcuTexture;'
# Returns the header as a String
def buildClosureHeader (filepath, dependencies):
	global provideFullNamespace 
	global namespaceAlias 

	header = '\'use strict\';\n'
	header += 'goog.provide(\'' + provideFullNamespace + '\');\n'

	for dep in dependencies:
		if dep:
			header += ('goog.require(\'' + dep.replace('/','.') + '\');\n');

	header += '\n\ngoog.scope(function() {'
	header += '\n\nvar ' + namespaceAlias + ' = ' + provideFullNamespace + ';';

	for dep in dependencies:
		if dep:
			dependencyNamespaceAlias = dep.replace('/','.');
			header += '\nvar ' + dependencyNamespaceAlias[dependencyNamespaceAlias.rfind('.') + 1:] + ' = ' + dependencyNamespaceAlias + ';';

	return header

# Finds the old header and replaces it with the new format build in the method
# buildClosureHeader
def replaceHeader (filepath, fileContentsUpdated, dependencies) :

	# Replace 'use strict' string from file
	fileContentsUpdated = re.sub('\'use strict\';', '', fileContentsUpdated)

	# Replace define header from requirejs
	searchObj = re.search(r'define[^{]*\{', fileContentsUpdated)
	header = buildClosureHeader (filepath, dependencies)
	fileContentsUpdated = fileContentsUpdated.replace(searchObj.group(), header)
	
	return fileContentsUpdated

# Updates variable names to follow the specification of google closure framework
def addAliasToAssignations (filepath, assignations):
	global namespaceAlias

	f = open(filepath, 'r')
	fileContents = f.read()

	whitelist = fetchWhiteList()

	for variable in assignations:
		if not variable in whitelist:
			fileContents = re.sub('(var\\s*)??\\b(?<!\.)' + re.escape(variable) + '\\b', namespaceAlias + "." + variable, fileContents)

	return fileContents

# Removes the "return" statement at the end of the .js files with the require.js format.
def removeReturnClause (fileContentsUpdated):
	returnToRemove = fileContentsUpdated[fileContentsUpdated.rfind('return'):fileContentsUpdated.rfind('};')+2]
	return fileContentsUpdated.replace(returnToRemove, '')

# Converts a file. The new file is stored in the folder specified as parameter.
def transformFile(filepath, outputFolder):
	global results

	# Calls the javascript program that is interpreted by spidermonkey
	p = Popen(['./fetch_vars.js', filepath], stdin=PIPE, stdout=PIPE, stderr=PIPE)
	output, err = p.communicate(b"input data that is passed to subprocess' stdin")
	rc = p.returncode
	values = output.split('&');

	if len(values) > 1:
		defineGlobalValues(filepath)
		fileContentsUpdated = addAliasToAssignations (filepath, values[0].replace('\n', '').split(','))
		fileContentsUpdated = replaceHeader (filepath, fileContentsUpdated, values[1].replace('\n', '').split(','))
		fileContentsUpdated = removeReturnClause (fileContentsUpdated)

		outpath = outputFolder + '/' + filepath[filepath.find('deqp')+5:]

		# Create folder if it doesn't exists
		if not os.path.exists(outpath[0:outpath.rfind('/')]):
			os.makedirs(outpath[0:outpath.rfind('/')])

		f = open(outpath , "w+")
		f.write(fileContentsUpdated)
		f.close()

		# print outpath + ' file created.\n'
	else:
		print filepath + ' doesn\'t have a valid format'

# Triggers the transformation of all files in the current folder and sub folders.
def convertAllJavaScript():
    
    # exclude output folder
    global outDirectory
    global inDirectory

    # exclude = '/' + outDirectory + '/'

    directory= inDirectory
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".js"):
            	currentFile = os.path.join(root, file)
            	# Exclude out directory
            	# if exclude not in currentFile:
                	# convertFile(currentFile[currentFile.find('deqp')+5:], outDirectory)
                transformFile(currentFile, outDirectory)


# ---------------------------------------------------------------------------------------#
# -------------------------  COMPILATION FUNCTIONS --------------------------------------#
# ---------------------------------------------------------------------------------------#


def buildDepsFile():
	cmdBuildDeps = 'python ../closure-library/closure/bin/build/depswriter.py --root_with_prefix=". ../../../deqp" > deqp-deps.js'
	# Calls the python program that generates the google closure dependencies
	p = Popen(cmdBuildDeps, shell=True, stdin=PIPE, stdout=PIPE, stderr=PIPE)
	output, err = p.communicate(b"input data that is passed to subprocess' stdin")
	print output
	print err

def buildJSArgumentsString():
	jsArg = ' --js '
	allParms = ''
	directory=os.getcwd() 
	for root, dirs, files in os.walk(directory):
		for file in files:
			if file.endswith(".js"):
				currentFile = os.path.join(root, file)
				allParms += jsArg + currentFile[currentFile.find('deqp')+5:] 
	return allParms


def compileJavascriptFiles():
	cmdCompile = 'java -client -jar compiler.jar' + buildJSArgumentsString() + ' --compilation_level=ADVANCED_OPTIMIZATIONS --warning_level VERBOSE --jscomp_warning undefinedVars'
	print 'command: ' + cmdCompile 
	p = Popen(cmdCompile, shell=True, stdin=PIPE, stdout=PIPE, stderr=PIPE)
	output, err = p.communicate(b"input data that is passed to subprocess' stdin")
	print output
	print err

action = ''            
if (len(argv) > 0):
    action = argv[1]
else:
    print 'For transformation set parameter: [t], for compilation set parameter: [c], for build dependencies file set parameter: [d]'
    exit()

if (action == 't'):
    convertAllJavaScript()
elif (action == 'c'):
    compileJavascriptFiles()
elif (action == 'd'):
    buildDepsFile()



#'/home/malo/projects/webgl-tests/WebGL-dev/sdk/tests/deqp/framework/common/tcuTexture.js'

# print values[0]
# print '***********************'
# print values[1]
# print '+++++++++++++++++++++++'
# buildClosureHeader (values[1].replace('\n', '').split(','))



# #main program
# cmd = 'java -client -jar compiler.jar --js framework/delibs/debase/deMath.js --js testing.js --compilation_level=ADVANCED_OPTIMIZATIONS --warning_level VERBOSE --jscomp_warning undefinedVars'
# '''--js framework/common/tcuFloat.js --js framework/delibs/debase/deMath.js
# --js test-goog/js/a.js --js test-goog/js/b.js
# '''
# runCmd(cmd)
# print("------ END END END END END END END END END END END END END END END END END END END   ------" + "\n")
# print("------ END END END END END END END END END END END END END END END END END END END   ------" + "\n")
# print("------ END END END END END END END END END END END END END END END END END END END   ------" + "\n")
# print("------ END END END END END END END END END END END END END END END END END END END   ------" + "\n")
# print("------ END END END END END END END END END END END END END END END END END END END   ------" + "\n")
# print("------ END END END END END END END END END END END END END END END END END END END   ------" + "\n")


# //usr/bin/env js $0 $* 
# print("Hello world.");
# var src_home='/home/malo/projects/webgl-tests/WebGL-dev/sdk/tests/deqp';
# load (src_home + 'require.js', src_home + 'framework/delibs/debase/deMath.js', src_home + 'closure-library/closure/goog/base.js');
# print(define.toSource());