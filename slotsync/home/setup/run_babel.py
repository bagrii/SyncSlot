#!/usr/bin/env python

from subprocess import call
from sys import argv

if __name__ == "__main__":
    if len(argv) > 1 and "--watch" == argv[1]:
        call(["npx", "babel", "js/src/ecma6", "--watch", "--out-dir", "js/compiled"])
    else:
        call(["npx", "babel", "js/src/ecma6", "--out-dir", "js/compiled"])
