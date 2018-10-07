"use strict";

import $ from 'jquery';
import 'fullcalendar';

class EventCalendar {
    constructor(element, config = {}) {
        let custom_buttons = {};
        this.__config = config;
    
        if ("create" == config.mode) {
            custom_buttons = {
                addEvent: {
                    text: "Add event",
                    click: this.__on_add_event.bind(this)
                },
                addBusyBlock: {
                    text: "Add busy time",
                    click: this.__on_add_busy_slot.bind(this)
                }
            };
        }

        $(element).fullCalendar({
            defaultView: "agendaWeek",
            header: {
                left: "addEvent addBusyBlock"
            },
            customButtons: custom_buttons,
            eventClick: this.__on_event_click.bind(this),
            dayClick: this.__on_day_click.bind(this),
            editable: true,
            selectable: true,
            timezone: "local",
            timeFormat: "H:mm",
            weekNumbers: true,
            weekNumberTitle: "Week: ",
            nowIndicator: true,
            themeSystem: "bootstrap4",
            height: "parent",
            validRange: config.valid_range,
            businessHours: config.business_hours,
            eventConstraint: null,
            eventAfterRender: this.__on_event_rendered.bind(this),
            eventDestroy: this.__on_event_rendered.bind(this)
        });
        this.calendar = $(element).fullCalendar("getCalendar");
    }

    set add_event_handler(handler) { this.add_event_handler_ = handler; }
    get add_event_handler() { return this.add_event_handler_; }

    set add_busy_event_handler(handler) { this.busy_event_handler_ = handler; }
    get add_busy_event_handler() { return this.busy_event_handler_; }

    set event_handler(handler) {  this.event_handler_ = handler; }
    get event_handler() { return this.event_handler_; }

    set background_event_handler(handler) { this.back_ground_event_handler_ = handler; }
    get background_event_handler() { return this.back_ground_event_handler_; }

    set day_click_handler(handler) { this.day_click_handler_ = handler; }
    get day_click_handler() { return this.day_click_handler_; }

    set rendered_event_handler(handler) { this.rendered_event_handler_ = handler; }
    get rendered_event_handler() { return this.rendered_event_handler_; }

    get_calendar() {
        return this.calendar;
    }

    add_event(event) {
        this.calendar.renderEvent(event, true);
    }

    update_event(event) {
        this.calendar.updateEvent(event);
    }

    remove_event(event) {
        this.calendar.removeEvents([event._id]);
    }

    get_events() {
        return this.calendar.clientEvents();
    }

    set_valid_range(range) {
        this.calendar.option("validRange", {start: range[0], end: range[1]});
    }

    get_event_constraint() {
        return this.calendar.option("eventConstraint");
    }

    set_event_constraint(value) {
        this.calendar.option("eventConstraint", value);
    }

    remove_valid_range() {
        this.calendar.option("validRange", false);
    }

    get_valid_range() {
        return this.calendar.option("validRange");
    }

    set_business_hours(range) {
        this.calendar.option("businessHours",
            {dow:[1,2,3,4,5], start: range[0], end: range[1]});
    }

    remove_business_hours() {
        this.calendar.option("businessHours", false);
    }

    get_business_hours() {
        return this.calendar.option("businessHours");
    }

    get_busy_events() {
        const events = this.calendar.clientEvents();
        const busy_events = events.filter(event => "background" == event.rendering);

        return busy_events;
    }

    show() {
        this.calendar.render();
    }

    __on_add_event() {
        if (this.add_event_handler) {
            this.add_event_handler();
        }
    }

    __on_add_busy_slot() {
        if (this.add_busy_event_handler) {
            this.add_busy_event_handler();
        }
    }

    __on_event_click(event) {
        if (this.event_handler) {
            this.event_handler(event);
        }
    }

    __on_day_click(date) {
        if (this.day_click_handler) {
            let events = this.get_events();
            let backgorund_event;
            for (let i = 0; i < events.length; i++) {
                if ("background" == events[i].rendering) {
                    if (date >= events[i].start && date < events[i].end) {
                        backgorund_event = events[i];
                    }
                }
            }

            if (backgorund_event) {
                if (this.background_event_handler) {
                    this.background_event_handler(backgorund_event);
                }
            } else {
                this.day_click_handler(date);
            }
        }
    }

    __on_event_rendered(event) {
        if (this.rendered_event_handler) {
            this.rendered_event_handler(event);
        }
    }
};


global.EventCalendar = EventCalendar;
