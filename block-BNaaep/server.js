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
            fs.readFile(__dirname + "/index_page/index.html", "utf8", (err, cnt) => {
                if (err) console.log(err);
                res.end(cnt);
            })
        } else if (req.method === "GET" && req.url === "/about") {
            fs.createReadStream(__dirname + "/index_page/about.html").pipe(res);
        } else if (req.method === "GET" && req.url.split(".").pop() === "css") {
            res.setHeader("content-type", "text/css");
            fs.createReadStream(__dirname + "/index_page/" + req.url).pipe(res);
        } else if (req.method === "GET" && req.url === "/contact") {
            fs.createReadStream(__dirname + '/form.html').pipe(res);
        } else if (req.method === "POST" && req.url === "/form") {
            let userData = qs.parse(store);
            if (!userData.username) {
                return res.end("Username not provided.");
            }
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
        } else if (req.method === "GET" && parsedUrl.pathname === "/users" && parsedUrl.path.includes("?")) {
            let userName = parsedUrl.query.username;
            fs.readFile(__dirname + "/contacts/" + userName + ".json", (err, cnt) => {
                if (err) return console.log(err);
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
        } else if (req.method === "GET" && req.url === "/users") {
            fs.readdir(__dirname + "/contacts", (err, filesArr) => {
                if (err) return console.log(err);
                var length = filesArr.length;
                var count = 1;
                filesArr.forEach(function(file) {
                    console.log(file);
                    fs.readFile(__dirname + "/contacts/" + file, (err, content) => {
                        if (err) return console.log(err);
                        if (count < length) {
                            count++;
                            let parsedData = JSON.parse(content);
                            res.write(`<h1>${parsedData.name}</h1>`);
                            res.write(`<h2>${parsedData.username}</h2>`);
                            res.write(`<p>${parsedData.bio}</p>`);
                            res.write(`<p>${parsedData.age}</p>`);
                            res.write(`<h4>${parsedData.email}</h4>`);
                            res.write(`<hr>`);
                        } else {
                            let parsedData = JSON.parse(content);
                            res.write(`<h1>${parsedData.name}</h1>`);
                            res.write(`<h2>${parsedData.username}</h2>`);
                            res.write(`<p>${parsedData.bio}</p>`);
                            res.write(`<p>${parsedData.age}</p>`);
                            res.write(`<h4>${parsedData.email}</h4>`);
                            res.write(`<hr>`);
                            return res.end("All Contacts Are Above");
                        }
                    });
                });
            })
        } else if (req.method === "GET" && req.url.split(".").pop() === "jpeg") {
            fs.createReadStream(__dirname + "/index_page/" + req.url).pipe(res);
        } else {
            res.setHeader("content-type", "text/html");
            return res.end(`<h2>Page Not Found 404</h2>`);
        }
    })

}



server.listen(5000, () => {
    console.log('listening on 5K');
})