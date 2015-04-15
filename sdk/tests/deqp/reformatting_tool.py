#!python
import os.path
import sys
import re
import string
import getopt

#format of the dictionary regex:replacement
rules = [
    {
        'pattern': '(\t)',
        'repl': '    ',
        'count': 0,
        'flags': re.MULTILINE
    },
    {
        'pattern': '(function[ \t]+\()',
        'repl': 'function(',
        'count': 0,
        'flags': re.MULTILINE
    },
    {
        'pattern': '([ \t]+$)',
        'repl': '',
        'count': 0,
        'flags': re.MULTILINE
    },
]


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
    new_file = re_analize_string_content(file_content)
    write_file(dire, new_file)


def analyze_directory(dire):
    for root, dirs, files in os.walk(dire):
        for file in files:
            if file.endswith(".js"):
                file_content = read_file(os.path.join(root, file))
                new_file = analize_string_content(file_content)
                write_file(os.path.join(root, file), new_file)

def analize_string_content(data):
    for pattern in rules.keys():
        p = re.compile(pattern, re.MULTILINE)
        m = p.search(data)
        if m:
            if rules[pattern][1] > 0:
                data = string.replace(data, m.group(1), rules[pattern][0], rules[pattern][1])
            else:
                print pattern + " - " + m.group(1)
                data = string.replace(data, m.group(1), rules[pattern][0])
    return data

def re_analize_string_content(data):
    for rule in rules:
        data = re.sub(rule['pattern'], rule['repl'], data, rule['count'], rule['flags'])
    return data

def read_file(file_path):
    #File exist
    if not file_exists(file_path):
        sys.exit(2)

    fo = open(file_path)

    lines = fo.read()

    fo.close()

    return lines

def write_file(file_path, content):
    #File exist
    if not file_exists(file_path):
        sys.exit(2)

    #overwrite the file
    fo = open(file_path, 'w')
    fo.write(content)
    fo.close()


def file_exists(file_path):
    if not os.path.exists:
        print "The file " + file_name + " doesn't exists"
        return False
    return True

if __name__ == '__main__': 
    main(sys.argv[1:])