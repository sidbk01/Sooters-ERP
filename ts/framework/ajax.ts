export function ajax<T>(method: string, url: string, data?: any): Promise<T> {
    return new Promise(function (resolve, reject) {
        let xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
            if (this.readyState == 4 && this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                reject({
                    status: this.status,
                    statusText: this.statusText,
                    responseText: this.responseText,
                });
            }
        };
        xhttp.onerror = function () {
            reject({
                status: this.status,
                statusText: this.statusText,
                responseText: this.responseText,
            });
        };
        xhttp.open("GET", url);
        xhttp.send(data);
    });
}