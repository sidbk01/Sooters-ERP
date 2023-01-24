let employee_locations = [];
let removed_first;

const FILM_HTML = "<div class='info-labels'><label for='prints'>Prints: </label><label for='digital'>Digital: </label><label for='color'>Color: </label><label for='num-rolls'>Number of Rolls: </label><div style='display: none;' id='num-rolls-error-label'></div></div><div class='info-inputs'><select id='prints' name='prints'><option value='0'>None</option><option value='1'>Matte</option><option value='2'>Glossy</option></select><input type='checkbox' id='digital' name='digital' /><input type='checkbox' id='color' name='color' /><input type='number' id='num-rolls' name='num-rolls' value='1'onchange='document.getElementById(`num-rolls-error`).style.display = `none`;' /><div id='num-rolls-error' style='display: none; color: red;'>Number of rolls must be at least 1</div></div>";

function on_load() {
    get("/data/employees", (responseText) => {
        let employees = JSON.parse(responseText);
        get("/data/locations", (responseText) => {
            let locations = JSON.parse(responseText);
            get("/data/order_types", (responseText) => {
                let order_types = JSON.parse(responseText);
                display_form_data(employees, locations, order_types);
            })
        })
    }, error);
}

function error() {
    alert("There was an error while loading");
    window.location.href = `/customer?id=${CUSTOMER}`;
}

function display_form_data(employees, locations, order_types) {
    let employee_html = "";
    for (let employee of employees) {
        employee_html += `<option value="${employee.id}"${preferences.employee == employee.id ? " selected" : ""}>${employee.name}</option>`;
        employee_locations[employee.id] = employee.primary_location;
    }
    let employee = document.getElementById("employee");
    employee.innerHTML = employee_html;

    let location_html = "";
    for (let location of locations)
        location_html += `<option value="${location.id}"${preferences.location == location.id ? " selected" : ""}>${location.name}</option>`;
    document.getElementById("location").innerHTML = location_html;

    let order_types_html = "<option selected>Select an order type</option>"
    for (let order_type of order_types) {
        order_types_html += `<option value="${order_type.id}">${order_type.name}</option>`;
    }
    let type = document.getElementById("type");
    type.innerHTML = order_types_html;
    type.onchange = update_type;
    removed_first = false;
}

function update_type() {
    document.getElementById("type-error").style.display = "none";

    if (!removed_first) {
        document.getElementById("type").children[0].remove();
        removed_first = true;
    }

    switch (document.getElementById("type").value) {
        case "1": // Film
            document.getElementById("order-type-inputs").innerHTML = FILM_HTML;
            break;

        default:
            document.getElementById("order-type-inputs").innerHTML = "";
            alert(`Unknown order type ${document.getElementById("type").value}`);
            break;
    }
}

function form_submit() {
    document.getElementById("type-error").style.display = "none";
    document.getElementById("type-error-label").style.display = "none";

    document.getElementById("date-error").style.display = "none";
    document.getElementById("date-error-label").style.display = "none";

    let envelope_id = document.getElementById("envelope-id").value;
    if (envelope_id == "")
        envelope_id = undefined;
    else
        envelope_id = Number(envelope_id);

    let due_date = document.getElementById("due-date").value;
    if (due_date == "") {
        document.getElementById("date-error").style.display = "block";
        document.getElementById("date-error-label").style.display = "block";
        return;
    }

    let rush = document.getElementById("rush").checked;
    let employee = Number(document.getElementById("employee").value);
    let location = Number(document.getElementById("location").value);

    let order = {
        envelope_id: envelope_id,
        due_date: due_date,
        rush: rush,
        employee: employee,
        location: location
    };

    switch (document.getElementById("type").value) {
        case "1":
            order.order_type = [
                1,
                film_submit()
            ];
            break;

        default:
            document.getElementById("type-error").style.display = "block";
            document.getElementById("type-error-label").style.display = "block";
            return;
    }

    post(`/data/orders/create?customer=${CUSTOMER}`, (responseText) => {
        let id = JSON.parse(responseText);
        window.location.href = `/order?id=${id}&back=/customer?id=${CUSTOMER}`;
    }, submit_error, order);
}

function submit_error() {
    alert("There was an error while creating the order");
}

function film_submit() {
    let prints = Number(document.getElementById("prints").value);
    let digital = document.getElementById("digital").checked;
    let color = document.getElementById("color").checked;
    let num_rolls = Number(document.getElementById("num-rolls").value);

    if (num_rolls < 1) {
        document.getElementById("num-rolls-error").style.display = "block";
        document.getElementById("num-rolls-error-label").style.display = "block";
        return;
    } else {
        document.getElementById("num-rolls-error").style.display = "none";
        document.getElementById("num-rolls-error-label").style.display = "none";
    }

    return {
        prints: prints,
        digital: digital,
        color: color,
        num_rolls: num_rolls,
    }
}