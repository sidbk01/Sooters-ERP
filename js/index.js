function on_load() {
    // Get the upcoming orders
    get(`/data/orders/upcoming`, (responseText) => {
        let orders = JSON.parse(responseText);
        get(`/data/customers`, (responseText) => {
            let customers = JSON.parse(responseText);
            get(`/data/order_types`, (responseText) => {
                let order_types = JSON.parse(responseText);
                display_upcoming(orders, order_types, customers);
            });
        }, load_error);
    }, load_error);
}

function load_error() {
    alert("There was an error while loading the upcoming orders!")
}

function display_upcoming(orders, order_types, customers) {
    if (orders.length == 0) {
        document.getElementById("upcoming-orders").innerHTML = "<b>There are no upcoming orders</b>";
        return;
    }

    let html = "<table>";
    html += "<tr><th>ID</th><th>Customer</th><th>Date Received</th><th>Type</th><th>Due Date</th></tr>";

    for (let order of orders) {
        let order_type;
        for (let type of order_types) {
            if (type.id == order.type) {
                order_type = type.name;
                break;
            }
        }

        let customer_name;
        for (let customer of customers) {
            if (customer.id == order.customer) {
                customer_name = customer.name;
                break;
            }
        }

        html += `<tr class="clickable" onclick="window.location.href = '/order?id=${order.id}&back=/';">`;
        html += `<td>${order.formatted_id}</td>`;
        html += `<td>${customer_name}</td>`;
        html += `<td>${order.date_received}</td>`;
        html += `<td>${order_type}</td>`;
        html += `<td>${order.date_due}</td>`;
        html += "</tr>";
    }

    html += "</table>";

    document.getElementById("upcoming-orders").innerHTML = html;
}