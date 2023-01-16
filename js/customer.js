let customer;

let name_padding;

function on_load() {
    name_padding = document.getElementById("name").style.padding;

    get(`/data/customer?id=${ID}`, (responseText) => {
        customer = JSON.parse(responseText);
        display_info();
    }, load_error);

    get(`/data/employees`, (responseText) => {
        let employees = JSON.parse(responseText);
        update_employees(employees);
        get(`/data/customers/notes?id=${ID}`, (responseText) => {
            let notes = JSON.parse(responseText);
            display_notes(notes, employees);
        }, load_error);
    }, load_error);
}

function load_error() {
    alert("An error has occurred while loading the customer")
}

function convert_undefined(value) {
    return typeof value === "undefined" ? "" : value;
}

function display_info() {
    // Set the page title
    document.title = `${customer.name} - Sooter's ERP`;

    // Show the edit button
    document.getElementById("edit-button").style.display = "block";

    // Set the name
    let name = document.getElementById("name");
    name.style.padding = name_padding;
    name.innerText = customer.name;

    // Display the other info
    document.getElementById("phone-number").innerText = convert_undefined(customer.phone_number);
    document.getElementById("email").innerText = convert_undefined(customer.email);

    document.getElementById("buttons").innerHTML = "";
}


function update_error() {
    alert("There was an error while processing the request");
}

function begin_edit() {
    // Update name
    let name = document.getElementById("name");
    name.style.padding = '0';
    name.innerHTML = `<input type="text" id="name-input" placeholder="Name" value="${customer.name}"/>`;

    // Hide the edit button
    document.getElementById("edit-button").style.display = "none";

    // Update other information
    document.getElementById("phone-number").innerHTML = `<input type="text" id="phone-number-input" value="${convert_undefined(customer.phone_number)}" />`;
    document.getElementById("email").innerHTML = `<input type="email" id="email-input"  value="${convert_undefined(customer.email)}" />`;

    // Update buttons
    document.getElementById("buttons").innerHTML = "<button onclick='confirm_edit()'>Confirm</button><button onclick='display_info()'>Cancel</button><br />";
}

function confirm_edit() {
    // Collect and validate new information
    let new_customer_info = customer;

    new_customer_info.name = document.getElementById("name-input").value;
    if (new_customer_info.name == "") {
        document.getElementById("name-error").style.display = "block";
        return;
    } else
        document.getElementById("name-error").style.display = "none";

    let phone_number = document.getElementById("phone-number-input").value;
    if (phone_number != "")
        new_customer_info.phone_number = phone_number;
    else
        new_customer_info.phone_number = undefined;

    let email = document.getElementById("email-input").value;
    if (email != "")
        new_customer_info.email = email;
    else
        new_customer_info.email = undefined;

    // Submit update
    post(`/data/customers/update/${ID}`, () => {
        finalize_edit(new_customer_info);
    }, update_error, {
        name: new_customer_info.name,
        phone_number: new_customer_info.phone_number,
        email: new_customer_info.email,
    });
}

function finalize_edit(new_customer_info) {
    customer = new_customer_info;
    display_info();
}

function update_employees(employees) {
    let html = "";

    for (let employee of employees)
        html += `<option value="${employee.id}">${employee.name}</option>`;

    document.getElementById("creator").innerHTML = html;
}

function display_notes(notes, employees) {
    let html = "";

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
    post(`/data/customers/create_note`, () => {
        location.reload();
    }, create_error, {
        customer: ID,
        creator: Number(creator),
        note: note,
    });
}

function create_error() {
    alert("There was an error while creating the note");
}