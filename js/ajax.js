function get(url, callback, error_callback, data) {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        } else if (this.readyState == 4 && error_callback) {
            error_callback(this.responseText, this.status);
        }
    };
    xhttp.open("GET", url);

    if (data) {
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(data));
    } else {
        xhttp.send();
    }
}

function post(url, callback, error_callback, data) {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        } else if (this.readyState == 4 && error_callback) {
            error_callback(this.responseText, this.status);
        }
    };
    xhttp.open("POST", url);

    if (data) {
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(data));
    } else {
        xhttp.send();
    }
}