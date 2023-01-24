let employee_locations = [];
let removed_first;

const FILM_HTML = "<div class='info-labels'><label for='prints'>Prints: </label><label for='digital'>Digital: </label><label for='color'>Color: </label><label for='black-white'>Black & White: </label><label for='num-rolls'>Number of Rolls: </label><label for='exposures'>Exposures: </label><div style='display: none;' id='num-rolls-error-label'></div></div><div class='info-inputs'><select id='prints' name='prints'><option value='0'>None</option><option value='1'>Matte</option><option value='2'>Glossy</option></select><input type='checkbox' id='digital' name='digital' /><input type='radio' id='color' name='color' /><input type='radio' id='black-white' name='color' /><input type='number' id='num-rolls' name='num-rolls' value='1'onchange='document.getElementById(`num-rolls-error`).style.display = `none`;' /><input type='number' id='exposures' name='exposures' value='24' /><div id='num-rolls-error' style='display: none; color: red;'>Number of rolls must be at least 1</div></div>";
const FRAMING_HTML = "<div class='info-labels'><label for='category'>Category:</label><div id='category-error-label' style='display: none;'></div><label for='width'>Width:</label><div id='width-error-label' style='display: none;'></div><label for='category'>Height:</label><div id='height-error-label' style='display: none;'></div></div><div class='info-inputs'><input type='text' id='category' name='category' /><div id='category-error' style='display: none; color: red;'>A category is required</div><input type='number' id='width' name='width' /><div id='width-error' style='display: none; color: red;'>Width must be at least 1</div><input type='number' id='height' name='height' /><div id='height-error' style='display: none; color: red;'>Height must be at least 1</div></div>";
const PHOTOSHOOT_HTML = "<div class='info-labels'><label for='photoshoot-type'>Photoshoot Type:</label><label for='photoshoot-datetime'>Scheduled Date & Time:</label><div id='photoshoot-datetime-error-label' style='display: none;'></div></div><div class='info-inputs'><select id='photoshoot-type' name='photoshoot-type'><option value='1'>Family Session</option><option value='2'>Classic Collection</option><option value='3'>Location Session</option><option value='4'>Business Headshot</option><option value='5'>Standard Graduation Photo</option><option value='6'>Lifestyle Graduation</option></select><input type='datetime-local' id='photoshoot-datetime' name='photoshoot-datetime' /><div id='photoshoot-datetime-error' style='display: none; color: red;'>A date and time is required</div></div>";

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

        case "2": // Framing
            document.getElementById("order-type-inputs").innerHTML = FRAMING_HTML;
            break;

        case "3": // Photoshoot
            document.getElementById("order-type-inputs").innerHTML = PHOTOSHOOT_HTML;
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
    let paid = document.getElementById("paid").checked;
    let employee = Number(document.getElementById("employee").value);
    let location = Number(document.getElementById("location").value);

    let order = {
        envelope_id: envelope_id,
        due_date: due_date,
        rush: rush,
        employee: employee,
        location: location,
        paid: paid,
    };

    switch (document.getElementById("type").value) {
        case "1":
            order.order_type = [
                1,
                film_submit()
            ];
            break;

        case "2":
            order.order_type = [
                2,
                framing_submit()
            ];
            break;

        case "3":
            order.order_type = [
                3,
                photoshoot_submit()
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
    let exposures = Number(document.getElementById("exposures").value);

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
        exposures: exposures,
    };
}

function framing_submit() {
    let category = document.getElementById("category").value;
    let width = Number(document.getElementById("width").value);
    let height = Number(document.getElementById("height").value);

    if (category == "") {
        document.getElementById("category-error").style.display = "block";
        document.getElementById("category-error-label").style.display = "block";
        return;
    } else {
        document.getElementById("category-error").style.display = "none";
        document.getElementById("category-error-label").style.display = "none";
    }

    if (width < 1) {
        document.getElementById("width-error").style.display = "block";
        document.getElementById("width-error-label").style.display = "block";
        return;
    } else {
        document.getElementById("width-error").style.display = "none";
        document.getElementById("width-error-label").style.display = "none";
    }

    if (height < 1) {
        document.getElementById("height-error").style.display = "block";
        document.getElementById("height-error-label").style.display = "block";
        return;
    } else {
        document.getElementById("height-error").style.display = "none";
        document.getElementById("height-error-label").style.display = "none";
    }

    return {
        category: category,
        width: width,
        height: height,
    };
}

function photoshoot_submit() {
    let photoshoot_type = Number(document.getElementById("photoshoot-type").value);
    let date_time = document.getElementById("photoshoot-datetime").value;

    return {
        type: photoshoot_type,
        date_time: date_time,
    };
}