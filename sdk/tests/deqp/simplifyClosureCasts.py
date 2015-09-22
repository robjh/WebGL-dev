#! /bin/python
import sys
import re
import argparse
import os.path

TARGET, PREFIX, FOLDER = None, None, None

# REGEX pattern to match declarations of the type /** @type {number} */
# This will not match: /** @type {*} */, /** @type {(number|string)} */
CLOSURE_TYPE_DECLARATION = '/\*\*\s*@type\s*{[a-zA-Z\.\<\>]*}\s*\*/\s*'
# JS variable declaration pattern will match anything that looks like var something
# This will not match member declaratons such as this.m_something
JS_VARIABLE_DECLARATION = 'var\s*[a-zA-Z0-9_]*'
# CLOSURE typ cast pattern will match stuff like /** @type {number} */ (gl.geParameter(gl.ALPHA_BITS))
CLOSURE_TYPE_CAST = '{}\s*\((.*)\)'.format(CLOSURE_TYPE_DECLARATION)
FULL_DECLARATION = '{}\s*{}\s*=\s*{}'.format(CLOSURE_TYPE_DECLARATION, JS_VARIABLE_DECLARATION, CLOSURE_TYPE_CAST)

def main(filename, prefix="out_"):
	print "Working on:",filename,
	# Read the file
	input_file = open(filename, 'r')
	file_contents = input_file.read()
	# Split into a list of strings by ';\n'
	multiline_case = file_contents.split(';\n')
	input_file.close()
	out_file_path = os.path.split(filename)
	output_filename = os.path.join(out_file_path[0], prefix + out_file_path[1])
	output_file = open(output_filename, 'w')
	substitutions_counter = 0

	for line in multiline_case:
		# First, we check that the line has the closure type and the cast.
		regex_id = re.compile(FULL_DECLARATION)
		result_id = regex_id.search(line)

		if result_id is not None:
			# if we find it, we then remove the first occurrence and write it to the file
			regex_remove = re.compile(CLOSURE_TYPE_DECLARATION)
			result_remove = regex_remove.sub('', line, 1)
			output_file.write(result_remove + ';\n') # We stripped the end of line so we need to add it back
			substitutions_counter += 1
		elif len(line) > 0:
			# if not, we write the entire line as it is
			output_file.write(line + ';\n') # We stripped the end of line so we need to add it back
	output_file.close()
	print "...done. ({} changes were made)".format(substitutions_counter)

def parse_arguments():
	global TARGET, PREFIX, FOLDER
	parser = argparse.ArgumentParser(description='Remove redundant Closure type declarations.')
	parser.add_argument('target', type = str, help = 'The target file or folder.')
	parser.add_argument('--prefix', '-p', type = str, help = 'The prefix that will be added to the output file. If no prefix is given, the target file will be overwritten.')
	arguments = parser.parse_args()

	TARGET = arguments.target
	if (os.path.exists(arguments.target) and os.path.isdir(arguments.target)):
		FOLDER = True
	elif (os.path.exists(arguments.target) and os.path.isfile(arguments.target)):
		FOLDER = False

	if arguments.prefix:
		PREFIX = arguments.prefix
	else:
		PREFIX = ''

if __name__ == '__main__':
	parse_arguments()

	if FOLDER:
		file_list = filter(lambda x: x[-2:] == 'js', os.listdir(TARGET))
		for file_name in file_list:
			main(os.path.join(TARGET, file_name), PREFIX)
	else:
		main(TARGET, PREFIX)
