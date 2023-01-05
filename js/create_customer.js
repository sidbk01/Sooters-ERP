function form_submit() {
    // Collect & validate the information
    let name = document.getElementById("name").value;
    if (name == "") {
        document.getElementById("name-error").style.display = "block";
        return;
    } else
        document.getElementById("name-error").style.display = "none";

    let email = document.getElementById("email").value;
    if (email == "")
        email = undefined;

    let phone_number = document.getElementById("phone-number").value;
    if (phone_number == "")
        phone_number = undefined;

    // Send the request
    post("/data/customers/create", () => {
        window.location.href = "/customers";
    }, error, {
        name: name,
        email: email,
        phone_number: phone_number,
    });
}

function error() {
    alert("There was an error while creating the customer");
}