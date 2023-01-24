var preferences = {
    employee: 0,
    location: 0,
    window_active: false,
};

function parse_cookies() {
    let cookies = document.cookie;

    for (let cookie of cookies.split(';')) {
        let split = cookie.split("=");

        let title = split[0].trim();

        if (title != "preferred_employee" && title != "preferred_location")
            continue;

        let content = "";
        for (let i = 1; i < split.length; i++) {
            content += split[i];
            if (i != split.length - 1)
                content += '=';
        }

        if (title == "preferred_employee")
            preferences.employee = Number(content.trim());
        else
            preferences.location = Number(content.trim());
    }

    // Always rewrite cookies on read, in case the cookies didn't exist
    write_cookies();
}

function write_cookies() {
    document.cookie = `preferred_employee=${preferences.employee}; expires=Thu, 01 Jan 2038 00:00:00 UTC; path=/;`;
    document.cookie = `preferred_location=${preferences.location}; expires=Thu, 01 Jan 2038 00:00:00 UTC; path=/;`;
}

function update_preferences() {
    hide_preferences_menu();
    document.getElementById("preferences").onclick = (event) => event.stopPropagation();

    parse_cookies();
    get(`/data/locations`, (responseText) => {
        preferences.locations = JSON.parse(responseText);
        set_preferences_location();
    });

    if (preferences.employee != 0) {
        get(`/data/employee?id=${preferences.employee}`, (responseText) => {
            preferences.employee_name = JSON.parse(responseText).name;
            set_preferences_employee();
        });
    } else {
        set_preferences_employee();
    }
}

function preferences_error() {
    alert("There was an error while loading the preferences");
}

function begin_preferences_edit() {
    if (!preferences.window_active)
        return;

    if (typeof preferences.employees === "undefined") {
        get(`/data/employees`, (responseText) => {
            preferences.employees = JSON.parse(responseText);
            display_preferences_edit();
        }, preferences_error);
    } else {
        display_preferences_edit();
    }

}

function display_preferences_edit() {
    let employees_html = `<select id="employee-preference"><option value='0'${preferences.employee == 0 ? " selected" : ""}>None</option>`;
    for (let employee of preferences.employees)
        employees_html += `<option value='${employee.id}'${preferences.employee == employee.id ? " selected" : ""}>${employee.name}</option>`;
    employees_html += `</select>`
    document.getElementById("employee-preference-container").innerHTML = employees_html;

    let locations_html = `<select id="location-preference"><option value='0'${preferences.location == 0 ? " selected" : ""}>None</option>`;
    for (let location of preferences.locations)
        locations_html += `<option value='${location.id}'${preferences.location == location.id ? " selected" : ""}>${location.name}</option>`;
    locations_html += `</select>`
    document.getElementById("location-preference-container").innerHTML = locations_html;

    let buttons_html = `<button onclick='confirm_preferences_edit()'>Confirm</button>`;
    buttons_html += `<button onclick='cancel_preferences_edit()'>Cancel</button>`;
    document.getElementById("preferences-menu-buttons").innerHTML = buttons_html;
}

function cancel_preferences_edit() {
    set_preferences_employee();
    set_preferences_location();
    document.getElementById("preferences-menu-buttons").innerHTML = `<button onclick='begin_preferences_edit()'>Edit</button>`;
}

function confirm_preferences_edit() {
    let employee_obj = document.getElementById("employee-preference");

    // Get new preferences
    preferences.employee = employee_obj.value;
    preferences.location = document.getElementById("location-preference").value;

    // Get the new employee name
    preferences.employee_name = employee_obj.options[employee_obj.selectedIndex].text;

    // Store the updated preferences
    write_cookies();

    // Reset the window
    cancel_preferences_edit();
}

function set_preferences_employee() {
    if (preferences.employee == 0)
        document.getElementById("employee-preference-container").innerHTML = "None";
    else
        document.getElementById("employee-preference-container").innerHTML = preferences.employee_name;
}

function set_preferences_location() {
    if (preferences.location == 0)
        document.getElementById("location-preference-container").innerText = "None";
    else {
        for (let location of preferences.locations) {
            if (location.id == preferences.location) {
                document.getElementById("location-preference-container").innerText = location.name;
                break;
            }
        }
    }
}

function show_preferences_menu(event) {
    document.getElementById("preferences-menu").style.display = "block";
    preferences.window_active = true;
    document.getElementById("preferences-button").onclick = hide_preferences_menu;
    event.stopPropagation();
}

function hide_preferences_menu(event) {
    document.getElementById("preferences-menu").style.display = "none";
    preferences.window_active = false;
    document.getElementById("preferences-button").onclick = show_preferences_menu;
    cancel_preferences_edit();

    if (typeof event !== "undefined")
        event.stopPropagation();
}

window.addEventListener('click', (event) => {
    if (preferences.window_active && !event.target.matches('.preferences'))
        hide_preferences_menu();
});