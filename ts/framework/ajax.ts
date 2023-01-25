export interface AjaxParser<T> {
    parse_object(object: any): T;
}

export function ajax<T, P extends AjaxParser<T>>(method: string, url: string, parser: P, data?: any): Promise<T> {
    return new Promise(function (resolve, reject) {
        let xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
            if (this.readyState == 4 && this.status >= 200 && this.status < 300) {
                let object = JSON.parse(this.responseText);
                try {
                    resolve(parser.parse_object(object));
                } catch (e) {
                    reject(e);
                }
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
        xhttp.open(method, url);
        xhttp.send(JSON.stringify(data));
    });
}

export class NumberParser implements AjaxParser<number> {
    parse_object(object: any): number {
        return Number(object);
    }
}