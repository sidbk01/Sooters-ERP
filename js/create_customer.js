function on_load() {
    init_phone_input('phone-number');
}

function form_submit() {
    // Collect & validate the information
    let first_name = document.getElementById("first-name").value;
    if (first_name == "") {
        document.getElementById("first-name-error").style.display = "block";
        document.getElementById("first-name-error-label").style.display = "block";
        return;
    } else {
        document.getElementById("first-name-error").style.display = "none";
        document.getElementById("first-name-error-label").style.display = "none";
    }

    let last_name = document.getElementById("last-name").value;
    if (last_name == "") {
        document.getElementById("last-name-error").style.display = "block";
        document.getElementById("last-name-error-label").style.display = "block";
        return;
    } else {
        document.getElementById("last-name-error").style.display = "none";
        document.getElementById("last-name-error-label").style.display = "none";
    }

    let email = document.getElementById("email").value;
    if (email == "")
        email = undefined;

    let phone_number = document.getElementById("phone-number").value;
    if (phone_number == "")
        phone_number = undefined;

    // Send the request
    post("/data/customers/create", (responseText) => {
        let id = JSON.parse(responseText);
        window.location.href = `/customer?id=${id}`;
    }, error, {
        first_name: first_name,
        last_name: last_name,
        email: email,
        phone_number: phone_number,
    });
}

function error() {
    alert("There was an error while creating the customer");
}