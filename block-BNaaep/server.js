let http = require("http");
let fs = require("fs");
let url = require("url");
let qs = require("querystring");


let server = http.createServer(handleRequest);

function handleRequest(req, res) {
    var store = "";
    req.on('data', (chunk) => {
        store += chunk;
    })

    req.on('end', () => {
        let parsedUrl = url.parse(req.url, true);
        if (req.method === "GET" && req.url === "/") {
            res.setHeader("content-type", "image/png");
            fs.createReadStream(__dirname + '/assets/' + 'index.png').pipe(res);
        } else if (req.method === "GET" && req.url === "/about") {
            res.setHeader("content-type", "image/png");
            fs.createReadStream(__dirname + '/assets/' + 'about.png').pipe(res);
        } else if (req.method === "GET" && req.url.split(".").pop() === "css") {
            res.setHeader("content-type", "text/css");
            fs.createReadStream(__dirname + '/assets/style.css').pipe(res);
        } else if (req.method === "GET" && req.url === "/contact") {
            // res.setHeader("content-type", "text/html");
            fs.createReadStream(__dirname + '/form.html').pipe(res);
        } else if (req.method === "POST" && req.url === "/form") {
            let userData = qs.parse(store);
            fs.open(__dirname + '/contacts/' + userData.username + '.json', "wx", (err, fd) => {
                if (err) {
                    return console.log(err);
                } else {
                    let data = qs.parse(store);
                    fs.writeFile(fd, JSON.stringify(data), (err) => {
                        if (err) return console.log(err);
                        fs.close(fd, () => {
                            return res.end(`Contacts saved successfully.`);
                        })
                    })
                }
            })
        } else if (req.method === "GET" && parsedUrl.pathname === "/users") {
            let userName = parsedUrl.query.username;
            fs.readFile(__dirname + "/contacts/" + userName + ".json", (err, cnt) => {
                res.setHeader("content-type", "text/html");
                let parsedData = JSON.parse(cnt);
                res.setHeader("content-type", "text/html");
                res.write(`<h1>${parsedData.name}</h1>`);
                res.write(`<h2>${parsedData.email}</h2>`);
                res.write(`<p>${parsedData.username}</p>`);
                res.write(`<p>${parsedData.age}</p>`);
                res.write(`<h3>${parsedData.bio}</h3>`);
                return res.end();
            })
        }
        //  else if (req.method === "GET" && req.url === "/users") {
        //   fs.
        // }
        else {
            res.setHeader("content-type", "text/html");
            res.end(`<h2>Page Not Found 404</h2>`);
        }
    })

}

// 7. handle GET request on "/users" which should list all contacts into a webpage

server.listen(5000, () => {
    console.log('listening on 5K');
})