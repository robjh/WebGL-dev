'''
Created on 23 Dec 2014

@author:    Alberto Lopez
            Mobica LTD
'''
'''

Python Script TO COMPILE JAVASCRIPTS WITH closure.jar locally in the selected directory

STEPS:
- Paste a copy of the compiler.jar found on https://developers.google.com/closure/compiler/docs/gettingstarted_app
- Execute/paste this script in the folder where the JavaScripts are contained

FEATURES:
1) This script compiles each JavaScript contained in the current folder or a one chosen in the menu, the Closure Compiler levels are:

- WHITESPACE_ONLY= True (this compilation level is undertaken)
- SIMPLE_OPTIMIZATIONS= True (this compilation level is undertaken)
- ADVANCED_OPTIMIZATIONS= False (this compilation level is NOT undertaken)

2) Each JavaScript compiled generates a .txt file with the corresponding output from the Closure Compiler.

3) By using this script and the Closure Compiler Application(closure.jar), the Warning and Error report Output is always more restrictive than
the output obtained from the Closure Compiler Service UI (http://closure-compiler.appspot.com/home).

4) If there are no errors in the compiled JavaScript, a copy of the compressed JavaScript is returned in its corresponding field within
the .txt file generated.

5) By executing this Python script, NONE .js output files are generated, to avoid compilation of generated js in the local directory while running this script

6) to modify the --warning_level output and its flags in Closure compiler check: https://code.google.com/p/closure-compiler/wiki/Warnings

'''
#!python3
import re
import os
import subprocess
import threading 
from sys import stdout, stderr

def compileAllJavaScript(whitespaceCompilation, simpleCompilation, advancedCompilation):
    
    directory=os.getcwd()
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".js"):
                compileJavaScript(file, whitespaceCompilation, simpleCompilation, advancedCompilation)

def createMenuJavaScript(whitespaceCompilation, simpleCompilation, advancedCompilation):
    
    directory=os.getcwd()
    x = 0;
    temp_list = []
    print("0. COMPILE ALL THE JavaScripts in this folder (see list below)")
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".js"):
                x += 1
                temp_list.append(file)
                print(str(x) + ". " + file)
    try:
        print("JavaScript size list: " + str(len(temp_list)))
        mode = int(input("\n" + "Select the JavaScript to compile with Closure Google Compiler: "))
    except ValueError:
            print ("Not a number selected")

    if(mode == 0):
        print("ALL THE JavaScript will be compiled with Closure Google Compiler ")
        compileAllJavaScript(whitespace, simple, advanced)
    
    elif (mode <= len(temp_list)):
        print("\n" + "Selected: " + temp_list[mode - 1])
        compileJavaScript(temp_list[mode - 1], whitespaceCompilation, simpleCompilation, advancedCompilation)
    
    else :
        print ("\n" + str(mode) +" is NOT a within the range(max " + str(len(temp_list)) +"), please select a number from the list below!!!" + "\n")
        createMenuJavaScript (whitespaceCompilation, simpleCompilation, advancedCompilation)

def compileJavaScript(file, whitespaceCompilation, simpleCompilation, advancedCompilation):
    print("RUNNING CLOSURE COMPILER OUTPUT for " + file + " ...")

    outputCompilerFile= file.strip()[0:-3]
    outputCompilerFile= outputCompilerFile +".txt"
    
    with open(outputCompilerFile, "w") as out_file:
            out_file.write("CLOSURE COMPILER OUTPUT " + "\n")
            out_file.write("JavaScript shader file: " + file + "\n")
            out_file.write("Output file from CLOSURE COMPILER: " + outputCompilerFile + "\n")
            out_file.flush()
    
    if whitespaceCompilation==True:
        cmdInput= "java -jar compiler.jar --compilation_level WHITESPACE_ONLY --js " + file + " --warning_level VERBOSE"
        with open(outputCompilerFile, "a") as out_file:
            out_file.write("\n"+ "------------------------------------------" + "\n")
            out_file.write("COMPILATION LEVEL: WHITESPACE_ONLY " + "\n")
            out_file.flush()
        writeOutputAmendFile(outputCompilerFile, cmdInput)
    
    if simpleCompilation==True:
        cmdInput= "java -jar compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js " + file + " --warning_level VERBOSE"
        # HINT: cmdInput must be the one below with require.js in the same folder
        # in order to eliminate "ERROR - variable define is undeclared" when RequireJs is added in the JavaScripts
        # cmdInput= "java -jar compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js "+file+" --externs require.js --jscomp_off=externsValidation --warning_level VERBOSE"
        with open(outputCompilerFile, "a") as out_file:
            out_file.write("\n" + "\n"+ "------------------------------------------" + "\n")
            out_file.write("COMPILATION LEVEL: SIMPLE_OPTIMIZATIONS" + "\n")
            out_file.flush()
        writeOutputAmendFile(outputCompilerFile, cmdInput)
        
    if advancedCompilation==True:
        cmdInput= "java -jar compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --js " + file + " --warning_level VERBOSE"
        with open(outputCompilerFile, "a") as out_file:
            out_file.write("\n" + "\n"+ "------------------------------------------" + "\n")
            out_file.write("COMPILATION LEVEL: ADVANCED_OPTIMIZATIONS" + "\n")
            out_file.flush()
        writeOutputAmendFile(outputCompilerFile, cmdInput)
    
    print("JavaScript " +file + " SUCCESSFULLY COMPILED!")
    print("Output saved in " +outputCompilerFile + " in current working directory " + os.getcwd() + "\n")


def writeOutputAmendFile(outputCompilerFile, cmdInput):
    with open(outputCompilerFile, "ab") as out_file:
            
            proc = subprocess.Popen(cmdInput, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            
            while proc.poll() is None:
                line = proc.stdout.readline()
                out_file.write(line)
            
            out_file.flush()
            proc.wait()
            #proc = subprocess.Popen(simpleCompilationCmdInput, shell=True)


#main program
whitespace= True # WHITESPACE_ONLY
simple= True # SIMPLE_OPTIMIZATIONS
advanced= False # ADVANCED_OPTIMIZATIONS
# compileAllJavaScript(whitespace, simple, advanced)
createMenuJavaScript (whitespace, simple, advanced)
print("------ END EXECUTION Python script: compiler-shaders-local.py ------" + "\n")
