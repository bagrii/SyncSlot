"use strict";

import flatpickr from 'flatpickr';
import alertify from 'alertifyjs';
import Quill from 'quill';
import moment from 'moment'

class Dialog {
    constructor() {
        this.prompt = this.__create_event_dialog();
        this.prompt.set("transition", "fade");
        this.prompt.set("onok", this.__on_ok.bind(this));
        this.prompt.set("oncancel", this.__on_cancel.bind(this));
        this.el = document.getElementById.bind(document);
    }

    set element_template_id(id) {
        this.template_id = id;
    }
    get element_template_id() {
        return this.template_id;
    }

    set element_date_id(id) {
        this.date_id = id;
    }
    get element_date_id() {
        return this.date_id;
    }

    set element_time_from_id(id) {
        this.time_from_id = id;
    }
    get element_time_from_id() {
        return this.time_from_id;
    }

    set element_time_to_id(id) {
        this.time_to_id = id;
    }
    get element_time_to_id() {
        return this.time_to_id;
    }

    set element_title_id(id) {
        this.title_id = id;
    }
    get element_title_id() {
        return this.title_id;
    }

    set element_text_id(id) {
        this.text_id = id;
    }
    get element_text_id() {
        return this.text_id;
    }

    set on_ok(handler) {
        this.on_ok_handler = handler;
    }
    get on_ok() {
        return this.on_ok_handler;
    }

    set on_cancel(handler) {
        this.on_cancel_handler = handler;
    }
    get on_cancel() {
        return this.on_cancel_handler;
    }

    set button_labels(labels) {
        /**
         * set labels for dialog button with the 
         * following format: {ok: "text", cancel: "text"}
         */
        this.labels_ = labels;
    }
    get button_labels() {
        return this.labels_;
    }

    set title(text) {
        this.title_ = text;
    }
    get title() {
        return this.title_;
    }

    set elements_values(values) {
        this.values_ = values;
    }
    get elements_values() {
        return this.values_;
    }

    __create_event_dialog() {
        /**
         * Create our own dialog just to suppress default behavior of
         * Alertify prompt dialog, calling oncancel handler when closing dialog. 
         */
        if (!alertify.event_prompt) {
            alertify.dialog("event_prompt", function () {
                return {
                    setup: function () {
                        return {
                            buttons: [{
                                text: "OK",
                                className: alertify.defaults.theme.ok
                            }, {
                                text: "Cancel",
                                // Do not invoke oncancel handler when closing dialog
                                invokeOnClose: false,
                                className: alertify.defaults.theme.cancel
                            }],
                            options: {
                                maximizable: false,
                                resizable: false
                            }
                        };
                    }
                };
            }, false, "prompt");
        }

        return alertify.event_prompt();
    }

    __on_ok(event) {
        let result = this.on_ok(event);
        if (result) {
            // Remove DOM elements
            this.prompt.destroy();
        }

        return result;
    }

    __on_cancel() {
        if (this.on_cancel) {
            this.on_cancel();
        }
        this.prompt.destroy();
    }
}

class EventDialog extends Dialog {
    constructor() {
        super();
        this.pickr = {};
        this.on_ok = this.__on_save.bind(this);
    }

    show() {
        this.prompt.setHeader(this.title);
        this.prompt.setContent(this.el(this.element_template_id).innerHTML);
        this.__install_components();
        // update elements value property after content has been updated
        this.__set_elements_data();
        this.prompt.set("labels", this.button_labels);
        this.prompt.showModal();
    }

    set on_save(handler) {
        this.on_save_handler = handler;
    }
    get on_save() {
        return this.on_save_handler;
    }

    __install_components() {
        this.__install_pickr();
        this.__install_text_editor();
    }

    __install_pickr() {
        const date_id = "#" + this.element_date_id;
        const time_from_id = "#" + this.element_time_from_id;
        const time_to_id = "#" + this.element_time_to_id;

        function on_pickr_value_update(selectedDates) {
            let from_date = this.pickr[this.element_time_from_id].selectedDates[0];
            let to_date = this.pickr[this.element_time_to_id].selectedDates[0];
            if (from_date && !to_date) {
                to_date = new moment(from_date);
                to_date.add(30, "m");
                this.pickr[this.element_time_to_id].setDate(to_date.toDate(), false);
            } else if (to_date && !from_date) {
                from_date = new moment(to_date);
                from_date.subtract(30, "m");
                this.pickr[this.element_time_from_id].setDate(from_date.toDate(), false);
            } else if (from_date && to_date) {
                from_date = new moment(from_date);
                to_date = new moment(to_date);
                if (to_date.isSameOrBefore(from_date)) {
                    to_date = moment(from_date).add(30, "m");
                    this.pickr[this.element_time_to_id].setDate(to_date.toDate(), false);
                }
            }
        }

        this.pickr[this.element_date_id] = flatpickr(date_id, { dateFormat: "Y-m-d" });
        this.pickr[this.element_time_from_id] = flatpickr(time_from_id, { enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true,
            onValueUpdate: on_pickr_value_update.bind(this) });
        this.pickr[this.element_time_to_id] = flatpickr(time_to_id, { enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true,
            onValueUpdate: on_pickr_value_update.bind(this)});
    }

    __install_text_editor() {
        let toolbarOptions = [['bold', 'italic', 'underline'], [{ 'list': 'bullet' }], [{ 'size': ['small', false, 'large', 'huge'] }], [{ 'color': [] }, { 'background': [] }], ['link'], ['clean']];
        this.quill = new Quill("#" + this.element_text_id, {
            theme: "snow",
            placeholder: "Type event description here...",
            modules: {
                toolbar: toolbarOptions
            } });
    }

    __set_elements_data() {
        /**
         * assign values to controls on dialog, using keys as 
         * elements ID's and values as element `value` property
         */
        if (this.elements_values) {
            for (let element_name in this.pickr) {
                this.pickr[element_name].setDate(this.elements_values[element_name], true);
            }
            if (this.elements_values[this.title_id]) {
                this.el(this.element_title_id).value = this.elements_values[this.element_title_id];
            }
            if (this.elements_values[this.element_text_id]) {
                this.quill.setContents(this.elements_values[this.element_text_id]);
            }
        }
    }

    __on_save(event) {
        let result = true;
        if (this.on_save) {
            let selected_date = d => {
                return d.selectedDates[0];
            };
            result = this.on_save(selected_date(this.pickr[this.element_date_id]),
                        selected_date(this.pickr[this.element_time_from_id]),
                        selected_date(this.pickr[this.element_time_to_id]),
                        this.el(this.element_title_id).value, this.quill.getContents());
        }

        return result;
    }
};

class EditEventDialog extends EventDialog {
    constructor() {
        super();
        this.on_cancel = this.__on_delete.bind(this);
    }

    set on_delete(handler) {
        this.on_delete_handler = handler;
    }
    get on_delete() {
        return this.on_delete_handler;
    }

    __on_delete() {
        if (this.on_delete) {
            this.on_delete();
        }
    }
}

class BusyEventDialog extends EventDialog {
    constructor() {
        super();
        this.on_cancel = this.__on_delete.bind(this);
    }

    set on_add_busy_slot(handler) {
        this.on_add_busy_slot_handler = handler;
    }
    get on_add_busy_slot() {on_save
        return this.on_add_busy_slot_handler;
    }

    set on_delete(handler) {
        this.on_delete_handler = handler;
    }
    get on_delete() {
        return this.on_delete_handler;
    }

    __on_save(event) {
        let selected_date = d => {
            return d.selectedDates[0];
        };
        return this.on_add_busy_slot_handler(selected_date(this.pickr[this.element_date_id]),
                    selected_date(this.pickr[this.element_time_from_id]),
                    selected_date(this.pickr[this.element_time_to_id]));
    }

    __on_delete() {
        if (this.on_delete) {
            this.on_delete();
        }
    }

    __install_components() {
        this.__install_pickr();
    }
}

class ViewEventDialog extends EventDialog {
    constructor() {
        super();
    }

    __install_components() {
        this.__install_text_editor();
    }

    __install_text_editor() {
        this.quill = new Quill("#" + this.element_text_id, {
            theme: "snow",
            modules: {
                toolbar: false
            },
            readOnly: true
        });
    }

    __set_elements_data() {
        /**
         * assign values to controls on dialog, using keys as 
         * elements ID's and values as element `value` property
         */
        if (this.elements_values) {
            for (let element_name in this.elements_values) {
                if (element_name == this.element_text_id) {
                    this.quill.setContents(this.elements_values[this.element_text_id]);
                } else {
                    this.el(element_name).value = this.elements_values[element_name];
                }
            }
        }
    }

    __create_event_dialog() {
        if (!alertify.view_event_prompt) {
            alertify.dialog("view_event_prompt", function () {
                return {
                    setup: function () {
                        return {
                            buttons: [{
                                text: "OK",
                                className: alertify.defaults.theme.ok
                            }],
                            options: {
                                maximizable: false,
                                resizable: false
                            }
                        };
                    }
                };
            }, false, "prompt");
        }

        return alertify.view_event_prompt();
    }
}

global.EventDialog = EventDialog;
global.EditEventDialog = EditEventDialog;
global.BusyEventDialog = BusyEventDialog;
global.ViewEventDialog = ViewEventDialog;