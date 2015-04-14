
import os.path
import sys
import re
import string
import getopt

#format of the dictionary regex:replacement
rules = {
    '^(\t)+': ("    ", 0),
    '(\s*=\s*)': (" = ", 0),
    }

def main(argv):
    try:
        opts, args = getopt.getopt(argv, "hdf:")
    except getopt.GetoptError:
        print 'reformatting_tool.py -d to analyze and reformat alla the files in the current directory\n or reformatting_tool.py path/file/to/analizy.js'
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print 'reformatting_tool.py -d to analyze and reformat alla the files in the current directory\n or reformatting_tool.py path/file/to/analizy.js'
            sys.exit()
        elif opt in ("-d"):
            analyze_directory(os.getcwd())
        elif opt in ("-f"):
            analyze_sigle_file(argv[1])
    
def analyze_sigle_file(dire):
    file_content = read_file(dire)
    new_file = analize_string_content(file_content)


def analyze_directory(dire):
    for root, dirs, files in os.walk(dire):
        for file in files:
            if file.endswith(".js"):
                file_content = read_file(os.path.join(root, file))
                new_file = analize_string_content(file_content)

def analize_string_content(data):
    for pattern in rules.keys():
        p = re.compile(pattern, re.MULTILINE)
        m = p.search(data)
        if m:
            if rules[pattern][1] > 0:
                data = string.replace(data, m.group(1), rules[pattern][0], rules[pattern][1])
            else:
                data = string.replace(data, m.group(1), rules[pattern][0])
    return data

def read_file(file_path):
    #File exist
    if not file_exists(file_path):
        sys.exit(2)

    lines = open(file_path).read()

    return lines

def write_file(file_path, content):
    #File exist
    if not file_exists(file_path):
        sys.exit(2)

    #overwrite the file


def file_exists(file_path):
    if not os.path.exists:
        print "The file " + file_name + " doesn't exists"
        return False
    return True

if __name__ == '__main__': 
    main(sys.argv[1:])