function view_entry_point(host_config) {
    var css_variables;
    var calendar;

    function show_view_event_dialog(event) {
        let dialog = new ViewEventDialog();

        dialog.element_template_id = "dialog-view-event";
        dialog.element_date_id = "ae-date";
        dialog.element_time_from_id = "ae-from";
        dialog.element_time_to_id = "ae-to";
        dialog.element_text_id = "ae-text";

        dialog.title = event.title;
        dialog.button_labels = { ok: "OK" };
        dialog.elements_values = {
            "ae-date": event.start.format(moment.HTML5_FMT.DATE),
            "ae-from": event.start.format(moment.HTML5_FMT.TIME),
            "ae-to": event.end.format(moment.HTML5_FMT.TIME),
            "ae-text": event.description
        };
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

    function get_configuration() {
        let config = {};
        // Email
        config.email = $("#toolbox-email").val();
        // Name
        config.name = $("#toolbox-name").val();
        // Comments
        config.comments = $("#toolbox-comments").val();
        // Events
        let events = calendar.get_events();
        config.events = new Array();

        for (let i = 0; i < events.length; i++) {
            if ("background" != events[i].rendering) {
                let start = moment(events[i].start);
                let end = moment(events[i].end);
                // handle host time zone
                let host_start = start.clone().tz(host_config.timezone);
                let host_end = end.clone().tz(host_config.timezone);
                // format date time on client side, no need to do this on server
                let event = {
                    start: start.format(),
                    end: end.format(),
                    start_format: start.format(moment.HTML5_FMT.TIME),
                    end_format: end.format(moment.HTML5_FMT.TIME),
                    host_start: host_start.format(moment.HTML5_FMT.TIME),
                    host_end: host_end.format(moment.HTML5_FMT.TIME),
                    date: start.format(moment.HTML5_FMT.DATE),
                    title: events[i].title,
                    event_id: events[i].event_id
                };
                config.events.push(event);
            }
        }

        return config;
    }

    function on_meeting_accept() {
        let config = get_configuration();
        $("#done-dialog").on("hidden.bs.modal", () => {
            // After meeting accepted - redirect to home page.
            window.location.href = "/";
        });
        let meeting_id = window.location.pathname.substring(1);
        let api_url = "/api/accept/" + meeting_id
        $.ajax({
            method: "POST",
            url: api_url,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(config)
        }).done(() => {
            $("#done-dialog").modal();
        });
        // Prevent form from submission
        return false;
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

    function setup_config(config) {
        // Valid range
        if (config.valid_range) {
            calendar.set_valid_range([new moment(config.valid_range.start),
            new moment(config.valid_range.end)]);
            change_header_buttons_classes();
        }
        // Business hours
        if (config.business_hours) {
            calendar.set_business_hours([config.business_hours.start,
            config.business_hours.end]);
            update_events_constraint(true);
        }

        // Title
        $("#description-title").val(config.title);
        document.title = "SyncSlot: " + config.title;
        // Subtitle
        $("#description-subtitle").val(config.subtitle);
        // Events
        for (let i = 0; i < config.events.length; i++) {
            let event = {
                start: new moment(config.events[i].start),
                end: new moment(config.events[i].end)
            };
            if ("background" == config.events[i].rendering) {
                event.overlap = config.events[i].overlap;
                event.rendering = config.events[i].rendering;
                event.color = css_variables.getPropertyValue("--main-busy-event-color");
            } else {
                event.title = config.events[i].title;
                event.description = config.events[i].description;
                event.event_id = config.events[i].event_id;
                event.backgroundColor = css_variables.getPropertyValue("--main-color");
            }
            calendar.add_event(event);
        }
    }

    function setup_calendar() {
        calendar.event_handler = show_view_event_dialog;
    }

    function setup_event_handlers() {
        $("#meeting-attendees-info").on("submit", on_meeting_accept);
    }

    document.addEventListener("DOMContentLoaded", function () {
        css_variables = getComputedStyle(document.body);
        calendar = new EventCalendar($("#calendar"), { mode: "view" });
        setup_event_handlers();
        setup_calendar();
        align_toolbox_calendar();
        change_header_buttons_classes();
        setup_contact_dialog();
        calendar.show();
        setup_config(host_config);
    });

}

global.view_entry_point = view_entry_point;
