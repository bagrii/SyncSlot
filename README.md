# SyncSlot (Synchronize Time Slots)
## What is this?
SyncSlot *(synchronize time slots)* was designed to solve one particular problem: to make all event attendees agree on a date and time without hassle. No need to send dozen of emails to find the "best time", no time zone misunderstandings, just let them select date and time in predefined range of dates. This *"scratch your own thing"* type of project.

## How it works?
Workflow is pretty straightforward: you either create or accept meeting. While creating a new meeting you need to add events in a date and time that *perfectly works for you* and then share public URL with others, so they can move events around the calendar and choose date and time, which *works for them*.

See demo:

[![IMAGE ALT TEXT HERE](http://img.youtube.com/vi/RpmCeiGN63Y/0.jpg)](https://www.youtube.com/watch?v=RpmCeiGN63Y)

## How to install?
SlotSync is a web based application running on [Flask](http://flask.pocoo.org/).
Here is the needed packages for running application:
* Setup virtual environment: `pip install virtualenv`
* `pip install -r slotsync/home/setup/requirements.txt`
* `cd slotsync/home && npm install`
* `npm install -g browserify watchify npx`
* Copy static resources: `cd slotsync/home && ./setup/copy_static_libs.py`
* Convert ecma6 -> ecma5, minify js/css, make bundle: `cd slotsync/home && ./setup/make_package.py`
* Init database where meetings are stored: `flask initdb`
* Go: `flask run`

## Bugs, improvements
This is the draft version of the project. [Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout) is using for layout, and it's still not widely supported by web browsers.

## License
MIT License