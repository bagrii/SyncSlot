function create_entry_point(meeting_id) {
    var css_variables;
    var calendar;
    var config_snapshot;
    var auto_saved_inprogress = false;

    function combine_date_time(d, t) {
        /**
         * returns combined date and time.
         */
        let date = moment(d);
        let tm = moment(t);
        date.hours(tm.hours());
        date.minute(tm.minute());
        date.second(tm.second());
        date.millisecond(tm.millisecond());

        return date;
    }

    function dialog_validate_fields(elements) {
        let is_valid = true;
        for (let i = 0; is_valid && i < elements.length; i++) {
            is_valid = $(elements[i]).val().length > 0;
            if (!is_valid) {
                $(elements[i]).tooltip({ trigger: "manual" });
                $(elements[i]).tooltip("show");
                setTimeout(() => {
                    $(elements[i]).tooltip("hide");
                }, 2000);
            }
        }

        return is_valid;
    }

    function get_configuration() {
        let config = { timezone: moment.tz.guess() };
        // Valid Range
        if (is_valid_range_enabled()) {
            const valid_range = calendar.get_valid_range();
            if (valid_range) {
                config.valid_range = {
                    start: valid_range.start.format(),
                    end: valid_range.end.format()
                };
            } else {
                config.valid_range = valid_range;
            }
        }
        // Business hours
        if (is_business_hours_enabled()) {
            config.business_hours = calendar.get_business_hours();
        }
        // Email
        config.email = $("#toolbox-email").val();
        // Title
        config.title = $("#description-title").val();
        // Subtitle
        config.subtitle = $("#description-subtitle").val();
        // Events
        let events = calendar.get_events();
        config.events = new Array(events.length);

        for (let i = 0; i < events.length; i++) {
            let event = {
                start: events[i].start.format(),
                end: events[i].end.format()
            };
            if ("background" == events[i].rendering) {
                event.overlap = events[i].overlap;
                event.rendering = events[i].rendering;
            } else {
                event.title = events[i].title;
                event.description = events[i].description;
                event.event_id = i;
            }
            config.events[i] = event;
        }

        return config;
    }

    function on_auto_save() {
        let config = get_configuration();
        let need_to_save = JSON.stringify(config) != JSON.stringify(config_snapshot);
        // prevent from pushing the same configuration to backed
        if (need_to_save) {
            $("#draft-autosaved-message").text("Auto Saved");
            if (!auto_saved_inprogress) {
                $(".draft-status").fadeIn();
                // that's fine in single threaded environment 
                auto_saved_inprogress = true;
                setTimeout(() => {
                    $(".draft-status").fadeOut();
                    auto_saved_inprogress = false;
                }, 3000);
            }
            $.ajax({
                method: "POST",
                url: ("/api/create/" + meeting_id),
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(config)
            });
            config_snapshot = config;
        }
    }

    function on_save_event(ae_date, ae_from, ae_to, ae_title, ae_text) {
        // validate fields
        let is_valid = dialog_validate_fields(
            ["#ae-date", "#ae-from", "#ae-to", "#ae-title"]);

        if (is_valid) {
            calendar.add_event({
                start: combine_date_time(ae_date, ae_from),
                end: combine_date_time(ae_date, ae_to),
                title: ae_title,
                description: ae_text,
                backgroundColor: css_variables.getPropertyValue("--main-color")
            });
        }

        return is_valid;
    }

    function show_new_event_dialog(date) {
        let dialog = new EventDialog();

        dialog.element_template_id = "dialog-add-event";
        dialog.element_date_id = "ae-date";
        dialog.element_time_from_id = "ae-from";
        dialog.element_time_to_id = "ae-to";
        dialog.element_title_id = "ae-title";
        dialog.element_text_id = "ae-text";

        dialog.title = "Add New Event";
        dialog.button_labels = { ok: "Save", cancel: "Cancel" };
        if (date) {
            dialog.elements_values = {
                "ae-date": date.toDate(),
                "ae-from": date.toDate(),
                "ae-to": date.toDate()
            };
        }

        dialog.on_save = on_save_event;
        dialog.show();
    }

    function show_edit_event_dialog(event) {
        let dialog = new EditEventDialog();

        dialog.element_template_id = "dialog-add-event";
        dialog.element_date_id = "ae-date";
        dialog.element_time_from_id = "ae-from";
        dialog.element_time_to_id = "ae-to";
        dialog.element_title_id = "ae-title";
        dialog.element_text_id = "ae-text";

        dialog.title = "Modify Event";
        dialog.button_labels = { ok: "Save", cancel: "Delete" };
        dialog.on_save = (ae_date, ae_from, ae_to, ae_title, ae_text) => {
            let is_valid = dialog_validate_fields(
                ["#ae-date", "#ae-from", "#ae-to", "#ae-title"]);
            if (is_valid) {
                event.start = combine_date_time(ae_date, ae_from);
                event.end = combine_date_time(ae_date, ae_to);
                event.title = ae_title;
                event.description = ae_text
                calendar.update_event(event);
            }

            return is_valid;
        }
        dialog.on_delete = () => {
            calendar.remove_event(event);
            on_auto_save();
        }
        dialog.elements_values = {
            "ae-date": event.start.toDate(),
            "ae-from": event.start.toDate(),
            "ae-to": event.end.toDate(),
            "ae-title": event.title,
            "ae-text": event.description
        };
        dialog.show();
    }

    function get_busy_slot_dialog() {
        let dialog = new BusyEventDialog();
        dialog.element_template_id = "dialog-add-busy-slot";
        dialog.element_date_id = "ae-date";
        dialog.element_time_from_id = "ae-from";
        dialog.element_time_to_id = "ae-to";

        return dialog;
    }

    function show_add_busy_slot_dialog() {
        let dialog = get_busy_slot_dialog();
        dialog.title = "Add Busy Time";
        dialog.button_labels = { ok: "Save", cancel: "Cancel" };
        dialog.on_add_busy_slot = (ae_date, ae_from, ae_to) => {
            let is_valid = dialog_validate_fields(
                ["#ae-date", "#ae-from", "#ae-to"]);
            if (is_valid) {
                calendar.add_event({
                    start: combine_date_time(ae_date, ae_from),
                    end: combine_date_time(ae_date, ae_to),
                    rendering: "background",
                    overlap: false,
                    color: css_variables.getPropertyValue("--main-busy-event-color")
                });
            }

            return is_valid;
        }
        dialog.show();
    }

    function edit_busy_slot_dialog(event) {
        let dialog = get_busy_slot_dialog();
        dialog.title = "Modify Busy Time";
        dialog.button_labels = { ok: "Save", cancel: "Delete" };
        dialog.elements_values = {
            "ae-date": event.start.toDate(),
            "ae-from": event.start.toDate(),
            "ae-to": event.end.toDate()
        };

        dialog.on_add_busy_slot = (ae_date, ae_from, ae_to) => {
            event.start = combine_date_time(ae_date, ae_from);
            event.end = combine_date_time(ae_date, ae_to);
            calendar.update_event(event);
        }
        dialog.on_delete = () => {
            calendar.remove_event(event);
        }
        dialog.show();
    }

    function change_header_buttons_classes() {
        /**
        Change buttons theme from primary to info
        */
        let button_classes = ["fc-addEvent-button", "fc-addBusyBlock-button",
            "fc-today-button", "fc-prev-button", "fc-next-button"];
        for (let i = 0; i < button_classes.length; i++) {
            let sel = "button[class*='" + button_classes[i] + "']";
            $(sel).removeClass("btn-primary");
            $(sel).addClass("btn-info");
        }
    }

    function align_toolbox_calendar() {
        /**
         Align toolbox with calendar body
         */
        let toolbar = $("div[class*='fc-toolbar']");
        let margin_bottom = parseFloat(toolbar.css("margin-bottom"));
        let height = parseFloat(toolbar.css("height"));
        let card_body = $("div[class*='card-body']");
        let padding = parseFloat(card_body.css("padding"));
        let toolbox_area = $("div[class*='tool-box-area']");
        let margin_top = margin_bottom + height - padding;

        toolbox_area.css("margin-top", margin_top + "px");

        // Increase the height of main container with the heights of
        // Valid Range and Business Hours components
        let calendar_area_height = $(".calendar-area").height();
        let collapse_valid_range_height = $("#collapse-valid-range").height();
        let collapse_business_hours_height = $("#collapse-business-hours").height();
        calendar_area_height += collapse_business_hours_height + collapse_valid_range_height;
        $(".calendar-area").height(calendar_area_height);
    }

    function update_events_constraint(business_hours_enabled) {
        calendar.set_event_constraint(business_hours_enabled ? "businessHours" : null);
    }

    function on_business_hours_update() {
        if (is_business_hours_enabled()) {
            const fp_from = $("#toolbox-business-hours-from").get(0)._flatpickr;
            const fp_to = $("#toolbox-business-hours-to").get(0)._flatpickr;
            if (fp_from.selectedDates[0] && fp_to.selectedDates[0]) {
                let start = new moment(fp_from.selectedDates[0]);
                let end = new moment(fp_to.selectedDates[0]);
                const range = [start.format(moment.HTML5_FMT.TIME),
                end.format(moment.HTML5_FMT.TIME)];
                calendar.set_business_hours(range);
                on_auto_save();
            }
        }
    }

    function is_business_hours_enabled() {
        return $("#collapse-business-hours-button").attr("aria-expanded") == "true";
    }

    function is_valid_range_enabled() {
        return $("#collapse-valid-range-button").attr("aria-expanded") == "true";
    }

    function setup_business_hours() {
        $("#collapse-business-hours").on("hidden.bs.collapse", () => {
            $("#collapse-business-hours-button").text("Enable Business Hours");
            calendar.remove_business_hours();
            update_events_constraint(false);
            on_auto_save();
        });
        $("#collapse-business-hours").on("shown.bs.collapse", () => {
            $("#collapse-business-hours-button").text("Disable Business Hours");
            on_business_hours_update();
            update_events_constraint(true);
            on_auto_save();
        });
    }

    function setup_contact_dialog() {
        let on_feedback_send = (name, email, message) => {
            let feedback = { "name": name, "email": email, "message": message };
            return $.ajax({
                method: "POST",
                url: "/api/feedback",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(feedback)
            });
        }

        $("#contact-dialog").on("hidden.bs.modal", function () {
            $(this).find("#contact-form").get(0).reset();
        });

        $("#confirm-contact").click(function () {
            on_feedback_send($("#contact-name").val(),
                $("#contact-email").val(),
                $("#contact-message").val());
            $("#contact-dialog").modal("toggle");
        });
    }

    function setup_valid_range() {
        const fp_valid_range = $("#toolbox-cal-valid").get(0)._flatpickr;

        $("#collapse-valid-range").on("hidden.bs.collapse", () => {
            $("#collapse-valid-range-button").text("Enable Valid Range");
            let auto_save = fp_valid_range.selectedDates.length > 0;
            calendar.remove_valid_range();
            fp_valid_range.clear();
            // update theme after reset to the old one
            change_header_buttons_classes();
            if (auto_save) {
                on_auto_save();
            }
        });
        $("#collapse-valid-range").on("shown.bs.collapse", () => {
            $("#collapse-valid-range-button").text("Disable Valid Range");
            let auto_save = fp_valid_range.selectedDates.length > 0;
            if (auto_save) {
                on_auto_save();
            }
        });
    }

    function setup_pickr() {
        let on_valid_range_update = function () {
            const fp_valid = $("#toolbox-cal-valid").get(0)._flatpickr;
            if (fp_valid.selectedDates.length > 1) {
                const range = [new moment(fp_valid.selectedDates[0]),
                new moment(fp_valid.selectedDates[1])];
                calendar.set_valid_range(range);
                // update theme after reset to the old one
                change_header_buttons_classes();
                on_auto_save();
            }
        };

        flatpickr("#toolbox-cal-valid",
            { dateFormat: "Y-m-d", onValueUpdate: on_valid_range_update, mode: "range" });

        let default_from_time = new moment("09:00", "H:i");
        let default_to_time = new moment("17:00", "H:i");

        let fp_from = flatpickr("#toolbox-business-hours-from",
            {
                enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true,
                onValueUpdate: on_business_hours_update
            });
        let fp_to = flatpickr("#toolbox-business-hours-to",
            {
                enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true,
                onValueUpdate: on_business_hours_update
            });

        fp_from.setDate(default_from_time.format(moment.HTML5_FMT.TIME), true);
        fp_to.setDate(default_to_time.format(moment.HTML5_FMT.TIME), true);
    }

    function setup_calendar() {
        calendar.add_event_handler = show_new_event_dialog;
        calendar.day_click_handler = show_new_event_dialog;
        calendar.add_busy_event_handler = show_add_busy_slot_dialog;
        calendar.event_handler = show_edit_event_dialog;
        calendar.background_event_handler = edit_busy_slot_dialog;
        calendar.rendered_event_handler = on_auto_save;
    }

    function setup_clipboard() {
        $("#toolbox-url-copy-button").tooltip({ trigger: "click" });
        let clipboard = new ClipboardJS("#toolbox-url-copy-button");
        clipboard.on("success", function (e) {
            setTimeout(() => {
                $("#toolbox-url-copy-button").tooltip("hide");
            }, 2000);

            e.clearSelection();
        });
    }

    function setup_event_handlers() {
        let elements = ["#description-title",
                        "#description-subtitle",
                        "#toolbox-email"];
        // install auto-save handler on edit event
        for (let i = 0; i < elements.length; i++) {
            $(elements[i]).on("input", on_auto_save);
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        css_variables = getComputedStyle(document.body);
        calendar = new EventCalendar($("#calendar"),
            {
                mode: "create",
                valid_range: false,
                business_hours: false
            });
        setup_event_handlers();
        setup_calendar();
        setup_pickr();
        align_toolbox_calendar();
        change_header_buttons_classes();
        setup_contact_dialog();
        setup_business_hours();
        setup_valid_range();
        setup_clipboard();
        calendar.show();
    });
}

global.create_entry_point = create_entry_point;
