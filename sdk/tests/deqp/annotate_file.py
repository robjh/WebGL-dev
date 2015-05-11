#!/usr/bin/env python

# version 0.1 - Add stub comments to uncommented methods

import sys 
import re
import os
from subprocess import Popen, PIPE
from sys import stdout, stderr, argv





# Regular expressions to pull required portions of code.
# find function contents (commnets included). Replace 'sglrReferenceContext'
# with the target file namespace.
# (\/\*\*[\s\S]*?)?(sglrReferenceContext\.).*\=(function)?[\s\S]*?(\};)
# (\/\*\*[\s\S]*?)?(sglrReferenceContext\.)[\s\S]*?(\};)

# Find function parameters
# (?<=(function\())(\w|,|\s)*


# Global variables 
filepath = ''
namespace = 'sglrReferenceContext'

tab = '    '
beginComment = '\n' + tab + '/**'
endComment = '\n' + tab + '*/\n' + tab

def displayUsage ():
	print 'Usage: python annotate_file.py <filepath> <namespace>\n'

def addCommentsHeader (matchobj):
	strContents = matchobj.group() 
	commentHeader = ''
	if not '/**' in strContents:

		# Add comments start
		commentHeader = beginComment

		if 'function' in strContents:
			# Append parameters annotations to the method
			p = re.compile(r'((?<=(function\())(\w|,|\s)*)')
			parameters = re.search(p, strContents)
			for param in parameters.group().split(','):
				if param:
					commentHeader = (commentHeader + '\n' + tab + '* @param {number} ' + param)

			# Append return annotation
			if 'return' in strContents:
				commentHeader = (commentHeader + '\n' + tab + '* @return {number} ')

			# Append throws annotation
			if 'throw' in strContents:
				commentHeader = (commentHeader + '\n' + tab + '* @throws {Error} ')

		else:
			commentHeader = (commentHeader + '\n' + tab + '* @enum')

		# close comments
		commentHeader = (commentHeader + endComment)

	return commentHeader + strContents

# Updates variable names to follow the specification of google closure framework
def addAnnotationsToFunctions (filepath, namespace):
	global namespaceAlias

	f = open(filepath, 'rU')
	fileContents = f.read()

	pattern = re.compile(r'((\/\*\*[\s\S]*?)?(' + namespace + '\.)[\s\S]*?(\};))')


	f2 = open(filepath + '.annotated', 'w+')

	annotated = re.sub(pattern, addCommentsHeader, fileContents)
	f2.write(annotated)

	f.close()
	f2.close()


def main(argv):
    if len(argv) != 2:
        displayUsage()
        build_all_targets()
        buildDepsFile()
        pass_or_fail()
    else:
    	addAnnotationsToFunctions(argv[0], argv[1])

if __name__ == '__main__': 
    main(sys.argv[1:])

