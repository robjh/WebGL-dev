#!/usr/bin/env python
import sys
import re
import os
import subprocess
import threading
from sys import stdout, stderr, argv

# Running this script
# 1. To rebuild all dependencies:
# $ build.py deps
# 2. To build all targets without rebuilding dependencies
# $ build.py build
# 3. To build a single target without rebuilding dependencies
# $ build.py build <target>
# See the table below for available targets
# 4. To rebuild all dependencies and targets
# $ build.py
# 5. To build dependencies for a single target
# $ build.py deps <target>
# 6. To build dependencies for and compile a single target
# $ build.py <target>

# List of targets (short target name, closure namespace)
targets = {
    'a': 'a',
#    'textureformat': 'functional.gles3.es3fTextureFormatTests',
#   'fragmentoutput': 'functional.gles3.es3fFragmentOutputTests'   
}

def dep_filename(target):
    return target + '.dep'

def compiled_filename(target):
    return target + '.compiled'

def write_to_file(outfile, cmdLine, redirect_stderr):
    stderr = None
    if redirect_stderr:
        stderr = subprocess.STDOUT

    with open(outfile, "w") as out_file:
            
            proc = subprocess.Popen(cmdLine, shell=True, stdout=subprocess.PIPE, stderr=stderr)
            
            while proc.poll() is None:
                line = proc.stdout.readline()
                out_file.write(line)
            
            out_file.flush()
            proc.wait()

def read_file(file_path):
    #File exist
    if not file_exists(file_path):
        sys.exit(2)

    fo = open(file_path)

    lines = fo.read()

    fo.close()

    return lines

def file_exists(file_path):
    if not os.path.exists:
        print "The file " + file_name + " doesn't exists"
        return False
    return True

def build_deps(target, namespace):
    cmdLine = 'python ../closure-library/closure/bin/build/closurebuilder.py --root=../closure-library --root=. --namespace=' + namespace
    print cmdLine
    write_to_file(dep_filename(target), cmdLine, False)

def build_all_deps():
    for target in targets.keys():
        build_deps(target, targets[target])

total_errors = 0
total_warnings = 0

def build_target(target, namespace):
    global total_errors
    global total_warnings
    deps = read_file(dep_filename(target))
    cmdLine = 'java -jar compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --warning_level VERBOSE'
    for dep in deps.split('\n'):
        dep = dep.strip()
        if len(dep) > 0:
            cmdLine += ' --js ' + dep
    cmdLine += ' --closure_entry_point=' + namespace
    print cmdLine
    filename = compiled_filename(target)
    write_to_file(filename, cmdLine, True)
    compiled = read_file(filename)
    result = re.search(r'(\d*)\s*error\(s\),\s*(\d*)\s*warning\(s\)', compiled)
    if result:
        print target + ': ' + result.group(0)
        total_errors += int(result.group(1))
        total_warnings += int(result.group(2))



def build_all_targets():
    for target in targets.keys():
        build_target(target, targets[target])

def pass_or_fail():
    if total_errors + total_warnings == 0:
        print "Passed"
    else:
        print "Compilation failed: " + str(total_errors) + ' error(s), ' + str(total_warnings) + ' warning(s)'  

def main(argv):
    if len(argv) == 0:
        build_all_deps()
        build_all_targets()
        pass_or_fail()
    elif (argv[0] == 'deps'):
        if len(argv) == 2:
            target = argv[1]
            build_deps(target, targets[target])
        else:
            build_all_deps()
    elif (argv[0] == 'build'):
        if len(argv) == 2:
            target = argv[1]
            build_target(target, targets[target])
        else:
            build_all_targets()
        pass_or_fail()
    else:
        target = argv[0]
        build_deps(target, targets[target])
        build_target(target, targets[target])
        pass_or_fail()

if __name__ == '__main__': 
    main(sys.argv[1:])

