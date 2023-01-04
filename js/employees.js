function on_load() {
    get(`/data/employees?active=${ACTIVE}`, (responseText) => {
        let employees = JSON.parse(responseText);
        get(`/data/locations`, (responseText) => {
            let locations = JSON.parse(responseText);
            display_customers(employees, locations);
        }, error);
    }, error);
}

function error() {
    alert("Error while loading employees")
}

function display_customers(employees, locations) {
    for (let location of locations) {
        location.html = `<h3>${location.name}</h3>`;
        location.html += `<ul>`;
    }

    for (let employee of employees) {
        // Locate the location
        for (let location of locations) {
            if (location.id != employee.primary_location) {
                continue;
            }

            location.html += `<li><a href="/employee?id=${employee.id}">${employee.name}</a></li>`

            break;
        }
    }

    let html = "";
    for (let location of locations) {
        html += location.html;
        html += "</ul>";
    }

    document.getElementById("employees").innerHTML = html;
}