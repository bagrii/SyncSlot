#!/usr/bin/env python3
import os

from pathlib import Path
from shutil import rmtree
from shutil import copytree

__CURRENT_PATH = os.path.dirname(os.path.abspath(__file__))

INSTALLED_PACKAGES = str(Path(__CURRENT_PATH + "/../node_modules").resolve()) + os.sep
CLIENT_INSTALLED_PACKAGES = __CURRENT_PATH + "/../static/lib/"
PACKAGES_TO_COPY = ["flatpickr", "fullcalendar", "alertifyjs", "moment", "moment-timezone", "quill",
                    "@fortawesome", "bootswatch", "jquery", "bootstrap", "clipboard"]

print("Using:")
print("INSTALLED_PACKAGES: ", INSTALLED_PACKAGES)
print("CLIENT_INSTALLED_PACKAGES: ", CLIENT_INSTALLED_PACKAGES)

for package in PACKAGES_TO_COPY:
    dest = CLIENT_INSTALLED_PACKAGES + package
    if Path(dest).exists():
        print("Removing ", dest)
        rmtree(dest)
    src = INSTALLED_PACKAGES + package
    print("Copy ", src, " to ", dest)
    copytree(src, dest)

print("Done")
