#!/usr/bin/env python

#
# Copyright (c) 2015 The Khronos Group Inc.
#
# Permission is hereby granted, free of charge, to any person obtaining a
# copy of this software and/or associated documentation files (the
# "Materials"), to deal in the Materials without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Materials, and to
# permit persons to whom the Materials are furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be included
# in all copies or substantial portions of the Materials.
#
# THE MATERIALS ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
# IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
# CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
# TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# MATERIALS OR THE USE OR OTHER DEALINGS IN THE MATERIALS.
#

# Author: Mobica LTD

import math
import sys

def read_file(filename):
    with open(filename, 'r') as input:
        contents = input.read()
        return contents

def add_range(contents, start, end = float('inf')):
    r = '[' + str(start) + ', '
    if end == float('inf'):
        r += 'Infinity'
    else:
        r += str(end)
    r += ']'
    modified = contents.replace('.run(gl);', '.run(gl, ' + r + ');')
    return modified

def write_file(template, index, contents):
    filename = template.replace('.html', index + '.html')
    with open(filename, 'w') as output:
        output.write(contents)

def get_suffix(x, length):
    return ('{0:0>' + str(length) + '}').format(x)

def main(argv):
    if len(argv) < 2:
        print 'Usage: split <html file> <range_max> [<range_step>]'
        return
    template = argv[0]
    range_max = int(argv[1])
    step = 1
    if len(argv) == 3:
        step = int(argv[2])
    contents = read_file(template)

    #figure out file suffix
    num_length = int(math.log(range_max, 10)) + 1;
    print num_length

    for start in range(0, range_max, step):
        end  = start + step
        if end >= range_max:
            end = float('inf');
        current = add_range(contents, start, end)
        write_file(template, get_suffix(start, num_length), current)

    #the last entry
    if end != float('inf'):
        current = add_range(contents, range_max)
        write_file(template, get_suffix(range_max, num_length), current)

if __name__ == '__main__':
    main(sys.argv[1:])