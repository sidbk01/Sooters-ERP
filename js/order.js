let locations;
let current_location;

function on_load() {
    // Load order notes
    get(`/data/employees`, (responseText) => {
        let employees = JSON.parse(responseText);
        get(`/data/order/notes?id=${ID}`, (responseText) => {
            let notes = JSON.parse(responseText);
            display_notes(notes, employees);
        }, error);
    }, error);

    // Get order info
    get(`/data/order?id=${ID}`, (responseText) => {
        let order = JSON.parse(responseText);

        // Get order-type information
        let route;
        switch (order.type) {
            case 1:
                route = `/data/order/film?id=${ID}`;
                break;

            default:
                return error();
        }

        get(route, (responseText) => {
            order.type_info = JSON.parse(responseText);

            // Get locations
            get(`/data/locations`, (responseText) => {
                locations = JSON.parse(responseText);

                // Get customer info
                get(`/data/customer?id=${order.customer}`, (responseText) => {
                    let customer = JSON.parse(responseText);

                    // Get receiver employee info
                    get(`/data/employee?id=${order.receiver}`, (responseText) => {
                        let employee = JSON.parse(responseText);
                        display_info(order, customer, employee);
                    }, error);
                }, error);
            }, error);
        }, error);
    }, error);
}

function error() {
    alert("There was an error while loading the order")
}

function display_info(order, customer, employee) {
    // Update mark button (mark complete/mark picked up/hide)
    if (order.date_complete != null) {
        let button = document.getElementById("mark-complete");

        if (order.picked_up) {
            button.style.display = "none";
        } else {
            button.onclick = mark_picked_up;
            button.innerText = "Mark Picked Up";
        }
    }

    // Update paid button
    if (order.paid)
        document.getElementById("mark-paid").remove();

    // Update basic information
    document.getElementById("order-id").innerText = `${order.formatted_id}`;
    if (order.envelope_id == null) {
        document.getElementById("envelope-id").remove();
        document.getElementById("envelope-id-label").remove();
    } else
        document.getElementById("envelope-id").innerText = `${order.envelope_id}`;

    document.getElementById("customer").innerText = customer.name;
    document.getElementById("date-received").innerText = order.date_received;
    document.getElementById("date-due").innerText = order.date_due;
    document.getElementById("rush").innerText = order.rush ? "Yes" : "No";
    document.getElementById("date-completed").innerText = order.date_complete == null ? "Not complete" : order.date_complete;
    document.getElementById("receiver").innerText = employee.name;
    document.getElementById("paid").innerText = order.paid ? "Yes" : "No";

    for (let location of locations) {
        if (location.id == order.source_location) {
            document.getElementById("source-location").innerText = location.name;
            break;
        }
    }

    // Insert edit button and show current location if not picked up
    //         Otherwise, show "picked up"
    let current_location_obj = document.getElementById("current-location");
    if (order.picked_up) {
        current_location_obj.innerText = "Picked up";
    } else {
        let html;
        for (let location of locations) {
            if (location.id == order.current_location) {
                html = location.name;
                current_location = location.id;
                break;
            }
        }

        html += `&emsp;<button style="display: inline; width: min(150px, 25%); margin: 0" onclick='begin_edit_location()'>Edit</button>`;
        current_location_obj.innerHTML = html;
    }

    // Update specific information
    switch (order.type) {
        case 1:
            display_film_info(order.type_info);
            break;

        default:
            alert("Unknown order type");
    }
}

function display_film_info(type_info) {
    let print_type;
    switch (type_info.prints) {
        case 0:
            print_type = "No";
            break;

        case 1:
            print_type = "Matte";
            break;

        case 2:
            print_type = "Glossy";
            break;

        default:
            error();
            return;
    }

    let label_html = document.getElementById("order-labels").innerHTML;
    let input_html = document.getElementById("order-inputs").innerHTML;

    label_html += `<div>Type: </div>`;
    label_html += `<div>Prints:</div>`;
    label_html += `<div>Digital:</div>`;
    label_html += `<div>Color:</div>`;
    label_html += `<div>Number of Rolls:</div>`;

    input_html += `<div>Film</div>`;
    input_html += `<div>${print_type}</div>`;
    input_html += `<div>${type_info.digital ? "Yes" : "No"}</div>`;
    input_html += `<div>${type_info.color ? "Yes" : "No"}</div>`;
    input_html += `<div>${type_info.num_rolls}</div>`;

    document.getElementById("order-labels").innerHTML = label_html;
    document.getElementById("order-inputs").innerHTML = input_html;
}

function mark_paid() {
    post(`/data/order/paid?id=${ID}`, () => {
        window.location.reload();
    }, update_error);
}

function mark_complete() {
    post(`/data/order/completed?id=${ID}`, () => {
        window.location.reload();
    }, update_error);
}

function mark_picked_up() {
    post(`/data/order/picked_up?id=${ID}`, () => {
        window.location.reload();
    }, update_error);
}

function update_error() {
    alert("There was an error while updating the order")
}

function begin_edit_location() {
    let html = "<select id='current-location-select'>";

    for (let location of locations)
        html += `<option value="${location.id}"${location.id == current_location ? " selected" : ""}>${location.name}</option>`;

    html += "</select>";

    document.getElementById("current-location").innerHTML = html;

    html = "<button onclick='confirm_location();'>Confirm</button>";
    html += "<button onclick='cancel_location();'>Cancel</button>";

    document.getElementById("buttons").innerHTML = html;
}

function cancel_location() {
    let html;
    for (let location of locations) {
        if (location.id == current_location) {
            html = location.name;
            break;
        }
    }

    html += `&emsp;<button style="display: inline; width: min(150px, 25%); margin: 0;" onclick='begin_edit_location()'>Edit</button>`;
    document.getElementById("current-location").innerHTML = html;
    document.getElementById("buttons").innerHTML = "";
}

function confirm_location() {
    post(`/data/order/change_location?id=${ID}&location=${document.getElementById('current-location-select').value}`, () => {
        window.location.reload();
    }, update_error);
}

function display_notes(notes, employees) {
    let html = "";

    for (let employee of employees)
        html += `<option value="${employee.id}">${employee.name}</option>`;

    document.getElementById("creator").innerHTML = html;

    html = "";

    for (let note of notes) {
        let creator;
        for (let employee of employees) {
            if (employee.id == note.creator) {
                creator = employee.name;
                break;
            }
        }

        html += `<div class='note'>`;
        html += `<div class='note-header'>`;
        html += `<div class='note-creator'>${creator}</div>`;
        html += `<div class='note-date'>${note.date_time}</div>`;
        html += `</div>`;
        html += `<div class='note-content'>${note.note}</div>`
        html += `</div>`;
        html += `<hr />`;
    }

    document.getElementById("notes").innerHTML = html;
}

function begin_create_note() {
    document.getElementById("new-note-button").style.display = "none";
    document.getElementById("create-note").style.display = "block";
}

function cancel_create_note() {
    document.getElementById("note").value = "";
    document.getElementById("creator").selectedIndex = 0;
    document.getElementById("create-note").style.display = "none";
    document.getElementById("new-note-button").style.display = "block";
}

function create_note() {
    // Collect and validate the information
    let creator = document.getElementById("creator").value;

    let note = document.getElementById("note").value;
    if (note == "") {
        document.getElementById("note-error").style.display = "block";
        return;
    } else
        document.getElementById("note-error").style.display = "none";

    // Send the request
    post(`/data/order/create_note`, () => {
        location.reload();
    }, create_error, {
        order: ID,
        creator: Number(creator),
        note: note,
    });
}

function create_error() {
    alert("There was an error while creating the note");
}