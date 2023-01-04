let customer;
let locations;

function on_load() {
    get(`/data/employee?id=${ID}`, (responseText) => {
        customer = JSON.parse(responseText);
        get(`/data/locations`, (responseText) => {
            locations = JSON.parse(responseText);
            display_info();
        }, load_error);
    }, load_error);
}

function load_error() {
    alert("An error has occurred while loading the employee")
}

function display_info() {
    // Set the page title
    document.title = `${customer.name} - Sooter's ERP`;

    // Show the edit button
    document.getElementById("edit-button").style.display = "block";

    // Get the location name
    let location_name;
    for (let location of locations) {
        if (location.id == customer.primary_location) {
            location_name = location.name;
            break;
        }
    }

    // Set the back link
    if (!customer.active)
        document.getElementById("back-link").href = "/employees?active=false";

    // Set the name
    document.getElementById("name").innerText = customer.name;

    // Display the other info
    document.getElementById("primary-location").innerText = location_name;

    // Setup the (de)activate button
    let button_html;
    if (customer.active) {
        button_html = `<button onclick="deactivate()">Deactivate</button>`
    } else {
        button_html = `<button onclick="activate()">Activate</button>`
    }

    document.getElementById("buttons").innerHTML = button_html;
}

function activate() {
    post(`/data/employees/set_active/${ID}/true`, () => {
        alert("Employee activated!");
        location.reload();
    }, update_error)
}

function deactivate() {
    post(`/data/employees/set_active/${ID}/false`, () => {
        alert("Employee deactivated!");
        location.reload();
    }, update_error)
}

function update_error() {
    alert("There was an error while processing the request");
}

function begin_edit() {
    // Update name
    document.getElementById("name").innerHTML = `<input type="text" id="name-input" placeholder="Name" value="${customer.name}"/>`;

    // Hide the edit button
    document.getElementById("edit-button").style.display = "none";

    // Update other information
    let primary_location_html = "<select id='primary-location-input'>\n";
    for (let location of locations) {
        primary_location_html += `<option value="${location.id}"`;

        if (location.id == customer.primary_location) {
            primary_location_html += " selected";
        }

        primary_location_html += `>${location.name}</option>\n`;
    }
    primary_location_html += "</select>";

    document.getElementById("primary-location").innerHTML = primary_location_html;

    // Update buttons
    document.getElementById("buttons").innerHTML = "<button onclick='confirm_edit()'>Confirm</button><br /><button onclick='display_info()'>Cancel</button>";
}

function confirm_edit() {
    // Collect and validate new information
    let new_employee_info = customer;

    new_employee_info.name = document.getElementById("name-input").value;
    if (new_employee_info.name == "") {
        document.getElementById("name-error").style.display = "block";
        return;
    } else
        document.getElementById("name-error").style.display = "none";

    new_employee_info.primary_location = document.getElementById("primary-location-input").value;

    // Submit update
    post(`/data/employees/update/${ID}`, () => {
        finalize_edit(new_employee_info);
    }, update_error, {
        name: new_employee_info.name,
        primary_location: Number(new_employee_info.primary_location),
    });
}

function finalize_edit(new_employee_info) {
    customer = new_employee_info;
    display_info();
}