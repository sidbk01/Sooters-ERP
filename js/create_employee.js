function on_load() {
    get("/data/locations", (responseText) => {
        let locations = JSON.parse(responseText);
        set_locations(locations);
    }, error_locations)
}

function error_locations() {
    alert("There was an error while loading locations");
    window.location.href = "/employees";
}

function set_locations(locations) {
    let html = "";
    for (let location of locations) {
        html += `<option value="${location.id}">${location.name}</option>`;
    }
    document.getElementById("primary-location").innerHTML = html;
}

function form_submit() {
    // Collect & validate the information
    let name = document.getElementById("name").value;
    if (name == "") {
        document.getElementById("name-error").style.display = "block";
        return;
    } else
        document.getElementById("name-error").style.display = "none";

    let primary_location = document.getElementById("primary-location").value;

    // Send the request
    post("/data/employees/create", () => {
        window.location.href = "/employees";
    }, error, {
        name: name,
        primary_location: Number(primary_location),
    });
}

function error() {
    alert("There was an error while creating the employee");
}