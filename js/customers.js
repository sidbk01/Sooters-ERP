function on_load() {
    get(`/data/customers`, (responseText) => {
        let customers = JSON.parse(responseText);
        display_customers(customers)
    }, error);
}

function error() {
    alert("Error while loading customers")
}

function display_customers(customers) {
    let html = "<table>";
    html += "<tr><th>Name</th><th>Phone Number</th><th>E-Mail</th></tr>";

    for (let customer of customers) {
        html += `<tr class="clickable" onclick="window.location.href = '/customer?id=${customer.id}';">`;
        html += `<td>${customer.name}</td>`;
        html += `<td>${typeof customer.phone_number !== "undefined" ? customer.phone_number : ""}</td>`;
        html += `<td>${typeof customer.email !== "undefined" ? customer.email : ""}</td>`;
        html += "</tr>";
    }

    html += "</table>";

    document.getElementById("customers").innerHTML = html;
}