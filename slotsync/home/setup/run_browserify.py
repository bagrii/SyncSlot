#!/usr/bin/env python

from subprocess import call
from sys import argv 

if __name__ == "__main__":
    if len(argv) > 1 and "--watch" == argv[1]:
        call(["npx", "watchify", "js/compiled/calendar.js", "js/compiled//dialog.js", "js/src/create.js",
              "js/src/view.js", "-o", "js/compiled/bundle.js", "-v"])
    else:
        call(["npx", "browserify", "js/compiled/calendar.js", "js/compiled/dialog.js", "js/src/create.js",
              "js/src/view.js", "-o", "js/compiled/bundle.js"])
        print("Done")
