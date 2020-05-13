const net = require("net");

class Request {
  //method
  //url = host + post + path
  //body: k/v
  //headers
  constructor(o) {
    this.method = o.method || "get";
    this.host = o.host;
    this.port = o.port || 80;
    this.path = o.path || "/";
    this.body = o.body || {};
    this.headers = o.headers || {};

    if (!this.headers["Content-Type"]) {
      this.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    let ContentType = this.headers["Content-Type"];
    if (ContentType === "application/x-www-form-urlencoded") {
      this.bodyText = Object.keys(this.body)
        .map((key) => `${key}=${encodeURIComponent(this.body[key])}`)
        .join("&");
    } else if (ContentType === "application/json") {
      this.bodyText = JSON.stringify(this.body);
    }

    this.headers["Content-Length"] = this.bodyText.length;
  }
  send(connection) {
    return new Promise((resolve, reject) => {
      const parser = new ResponseParser();
      if (connection) {
        connection.write(this.toString());
      } else {
        connection = net.createConnection(
          { host: this.host, port: this.port },
          () => {
            console.log("已连接到服务器");

            connection.write(this.toString());
          }
        );
      }

      connection.on("data", (data) => {
        parser.receive(data.toString());
        if (parser.isFinished) {
          resolve(parser.response);
        }
        // resolve(data.toString());
        connection.end();
      });
      connection.on("error", (error) => {
        reject(error);
        connection.end();
      });
      connection.on("end", () => {
        console.log("已从服务器断开");
      });
    });
  }
  toString() {
    return `
${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers)
  .map((key) => `${key}: ${this.headers[key]}`)
  .join("\r\n")}
\r
${this.bodyText}`;
  }
}

class Response {}

class ResponseParser {
  constructor() {
    this.WATIING_STATUS_LINE = 0;
    this.WATIING_STATUS_LINE_END = 1;
    this.WATIING_HEADER_NAME = 2;
    this.WATIING_HEADER_SPACE = 3;
    this.WATIING_HEADER_VALUE = 4;
    this.WATIING_HEADER_LINE_END = 5;
    this.WATIING_HEADER_BLOCK_END = 6;
    this.WATIING_BODY = 7;

    this.current = this.WATIING_STATUS_LINE;
    this.statusLine = "";
    this.headers = {};
    this.headerName = "";
    this.headerValue = "";
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join(""),
    };
  }

  receive(string) {
    let i = 0;
    while (i < string.length) {
      this.receiveChar(string.charAt(i));
      i++;
    }
  }
  receiveChar(char) {
    if (this.current === this.WATIING_STATUS_LINE) {
      if (char === "\r") {
        this.current = this.WATIING_STATUS_LINE_END;
      } else if (char === "\n") {
        this.current = this.WATIING_HEADER_NAME;
      } else {
        this.statusLine += char;
      }
    } else if (this.current === this.WATIING_STATUS_LINE_END) {
      this.current = this.WATIING_HEADER_NAME;
    } else if (this.current === this.WATIING_HEADER_NAME) {
      if (char === ":") {
        this.current = this.WATIING_HEADER_SPACE;
      } else if (char === "\r") {
        this.current = this.WATIING_HEADER_BLOCK_END;
        if (this.headers["Transfer-Encoding"] === "chunked") {
          this.bodyParser = new TrunkedBodyParser();
        }
      } else {
        this.headerName += char;
      }
    } else if (this.current === this.WATIING_HEADER_SPACE) {
      if (char === " ") {
        this.current = this.WATIING_HEADER_VALUE;
      }
    } else if (this.current === this.WATIING_HEADER_VALUE) {
      if (char === "\r") {
        this.current = this.WATIING_HEADER_LINE_END;
        this.headers[this.headerName] = this.headerValue;
        this.headerName = "";
        this.headerValue = "";
      } else {
        this.headerValue += char;
      }
    } else if (this.current === this.WATIING_HEADER_LINE_END) {
      if (char === "\n") {
        this.current = this.WATIING_HEADER_NAME;
      }
    } else if (this.current === this.WATIING_HEADER_BLOCK_END) {
      if (char === "\n") {
        this.current = this.WATIING_BODY;
      }
    } else if (this.current === this.WATIING_BODY) {
      this.bodyParser.receiveChar(char);
    }
  }
}

class TrunkedBodyParser {
  constructor() {
    this.WATIING_LENGTH = 0;
    this.WATIING_LENGTH_LINE_END = 1;
    this.READING_TRUNK = 2;
    this.WATIING_NEW_LINE = 3;
    this.WATIING_NEW_LINE_END = 4;

    this.isFinished = false;
    this.length = 0;
    this.content = [];

    this.current = this.WATIING_LENGTH;
  }

  receiveChar(char) {
    // console.log(JSON.stringify(char));
    // console.log(this.current);

    if (this.current === this.WATIING_LENGTH) {
      if (char === "\r") {
        this.current = this.WATIING_LENGTH_LINE_END;
        if (this.length === 0) {
          this.isFinished = true;
        }
      } else {
        this.length *= 10;
        this.length += char.charCodeAt(0) - "0".charCodeAt(0);
      }
    } else if (this.current === this.WATIING_LENGTH_LINE_END) {
      if (char === "\n") {
        this.current = this.READING_TRUNK;
      }
    } else if (this.current === this.READING_TRUNK) {
      if (this.length === 0) {
        this.current = this.WATIING_NEW_LINE;
      } else {
        this.content.push(char);
        this.length--;
      }
    } else if (this.current === this.WATIING_NEW_LINE) {
      if (char === "\r") {
        this.current = this.WATIING_NEW_LINE_END;
      }
    } else if (this.current === this.WATIING_NEW_LINE_END) {
      if (char === "\n") {
        this.current = this.WATIING_LENGTH;
      }
    }
  }
}

void (async function () {
  const request = new Request({
    method: "POST",
    host: "localhost",
    port: "8080",
    path: "/",
    headers: {
      "X-baz": "666",
    },
    body: {
      name: "smile",
    },
  });

  const response = await request.send();
  console.log(response);
})();

// console.log(`
// POST / HTTP/1.1\r
// Content-Type: application/x-www-form-urlencoded\r
// Content-Length: 10\r
// \r
// name=smile
// `);
/*
const client = net.createConnection({ host: "localhost", port: 8080 }, () => {
  // 'connect' 监听器
  console.log("已连接到服务器");
  
  console.log(request.toString());

  client.write(request.toString());
});

client.on("data", (data) => {
  console.log(data.toString());
  client.end();
});
client.on("end", () => {
  console.log("已从服务器断开");
});
*/
