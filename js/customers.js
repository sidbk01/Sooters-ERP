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
    html += "<thead><tr><th>Name</th><th>Phone Number</th><th>E-Mail</th></tr></thead><tbody>";

    for (let customer of customers) {
        html += `<tr class="clickable" onclick="window.location.href = '/customer?id=${customer.id}';">`;
        html += `<td style='width: 1%; white-space: nowrap;'>${customer.name}</td>`;
        html += `<td style='text-align: center;'>${typeof customer.phone_number !== "undefined" ? customer.phone_number : ""}</td>`;
        html += `<td style='text-align: center;'>${typeof customer.email !== "undefined" ? customer.email : ""}</td>`;
        html += "</tr>";
    }

    html += "</tbody></table>";

    document.getElementById("customers").innerHTML = html;
}