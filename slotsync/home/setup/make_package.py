#!/usr/bin/env python

from subprocess import call
import os

current = lambda src: os.path.join(os.path.dirname(os.path.abspath(__file__)), src)

print("[Babel]")
call(["python3", current("run_babel.py")])

print("[Browserify]")
call(["python3", current("run_browserify.py")])

print("[JS Minify]")
call(["python3", current("js_minify.py"), "js/compiled/bundle.js", "static/js/bundle.js"])

print("[CSS Minify]")
call(["python3", current("css_minify.py"), "js/src/stylesheets/create.css", "static/stylesheets/create.min.css"])
call(["python3", current("css_minify.py"), "js/src/stylesheets/view.css", "static/stylesheets/view.min.css"])
