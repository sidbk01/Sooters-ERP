let customer;

function on_load() {
    get(`/data/customer?id=${ID}`, (responseText) => {
        customer = JSON.parse(responseText);
        display_info();
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
    document.getElementById("name").innerText = customer.name;

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
    document.getElementById("name").innerHTML = `<input type="text" id="name-input" placeholder="Name" value="${customer.name}"/>`;

    // Hide the edit button
    document.getElementById("edit-button").style.display = "none";

    // Update other information
    document.getElementById("phone-number").innerHTML = `<input type="text" id="phone-number-input" placeholder="Phone Number" value="${convert_undefined(customer.phone_number)}" />`;
    document.getElementById("email").innerHTML = `<input type="email" id="email-input" placeholder="Email" value="${convert_undefined(customer.email)}" />`;

    // Update buttons
    document.getElementById("buttons").innerHTML = "<button onclick='confirm_edit()'>Confirm</button><br /><button onclick='display_info()'>Cancel</button>";
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