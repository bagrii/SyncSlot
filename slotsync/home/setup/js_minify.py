import rjsmin
import sys

if __name__ == "__main__":
    if len(sys.argv) == 3:
        _, input_file, output_file = sys.argv
        in_fp = open(input_file, "r")
        out_fp = open(output_file, "w")
        out_fp.write(rjsmin.jsmin(in_fp.read()))
        print("Done.")
    else:
        print("Usage: python3 js_minify.py input.js output.js")
