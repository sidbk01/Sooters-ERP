function on_load() {
    get(`/data/orders?customer=${ID}`, (responseText) => {
        let orders = JSON.parse(responseText);
        get(`/data/order_types`, (responseText) => { // TODO: Complete order_types route
            let order_types = JSON.parse(responseText);
            display_orders(orders, order_types);
        })
    }, error);
}

function error() {
    alert("Error while loading orders")
}

function display_orders(orders, order_types) {
    if (orders.length == 0) {
        document.getElementById("orders").innerHTML = "<b>This customer has not placed any orders yet</b>";
        return;
    }

    let html = "<table>";
    html += "<tr><th>ID</th><th>Date Received</th><th>Type</th><th>Due Date</th></tr>";

    for (let order of orders) {
        let order_type;
        for (let type of order_types) {
            if (type.id == order.type) {
                order_type = type.name;
                break;
            }
        }

        html += `<tr class="clickable" onclick="window.location.href = '/order?id=${order.id}';">`;
        html += `<td>${order.id}</td>`;
        html += `<td>${order.date_received}</td>`;
        html += `<td>${order_type}</td>`;
        html += `<td>${order.date_due}</td>`;
        html += "</tr>";
    }

    html += "</table>";

    document.getElementById("orders").innerHTML = html;
}