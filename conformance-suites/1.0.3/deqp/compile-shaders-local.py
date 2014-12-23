'''
Created on 23 Dec 2014

@author:    Alberto Lopez
            Mobica LTD
'''

'''

DRAFT VERSION TO COMPILE JAVASCRIPTS WITH closure-compiler.jar locally

'''

import re
import os
import subprocess
import threading 
from sys import stdout, stderr

shaders_directory= "C:\\Users\\allo\\Documents\\GitHub\\WebGL-dev\\conformance-suites\\1.0.3\\deqp\\data\\gles2\\shaders"
cmdInput= "java -jar compiler.jar --compilation_level SIMPLE --js glu-draw.js --js_output_file gluDrawCompiled.js --warning_level VERBOSE"

def getShadersJavaScript(directory):
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".js"):
                
                #to check script's functionality only returns the first one found (glu-draw.js)
                return file



def tee_pipe(pipe, f1):
            for line in pipe:
                f1.write(line)

jsFile=getShadersJavaScript(shaders_directory)

print("CLOSURE COMPILER OUTPUT " +jsFile)


outputCompilerFile= jsFile.strip()[0:-3]
outputCompilerFile= outputCompilerFile +".txt"


with open(outputCompilerFile, "w") as out_file:
        out_file.write("CLOSURE COMPILER OUTPUT " + "\n")
        out_file.write("JavaScript shader file: " + outputCompilerFile + "\n" + "\n")
        #out_file.write("COMPILATION LEVEL: " + compilationLevel + "\n")
        #out_file.write("OUTPUT FORMAT: " + outputFormat + "\n")
        #out_file.write("OUTPUT INFO: " + outputInfo + "\n")
        
        out_file.flush()

with open(outputCompilerFile, "ab") as out_file:
        
        proc = subprocess.Popen(cmdInput, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        #proc.communicate()
        
        
        while proc.poll() is None:
            line = proc.stdout.readline()
            out_file.write(line)
        
        
        out_file.flush()
        proc.wait()
        
        proc = subprocess.Popen(cmdInput, shell=True)

'''
        # SAVING IN THE FILE USING THREADS
        proc = subprocess.Popen(cmdInput, shell=True, stdout=subprocess.PIPE)
        
        t1 = threading.Thread(target=tee_pipe, args=(proc.stdout, out_file))

        t1.start()

        t1.join()
        proc.wait()
'''
        
        
'''        
        proc = subprocess.Popen(cmdInput, stdout=subprocess.PIPE)
        sys.stdout.write(line)
        proc.wait()
        out_file.write("\n" + "Errors in "+ jsFile +" COPIED:" + "\n")
        out_file.write(stdout.__str__())
        
        
        print(proc)
        
        out_file.flush()
'''
    
