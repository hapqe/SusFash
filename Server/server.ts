import express, { Express, Request } from "express";
import bodyParser from "body-parser";
import FingerPrint from "express-fingerprint"
import fs from "fs";
import cors from "cors";

const port = 8000;

const app: Express = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(FingerPrint())

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    }
);

app.post('/', (req, res, next) => {
    if(req.body.delete) {
        deleteUserData(req);
        return;
    }
    if(req.body.design) {
        saveDesign(req);
        return;
    }
    
    userData(req, true);
    res.json({ status: 'ok' });
    next();
});

app.get('/userData', (req, res, next) => {
    (async () => {
        let data = await userData(req);
        res.send(data);
    })();
});

async function userData(req: Request, upload: boolean = false) {
    let hash = req.fingerprint?.hash;

    let path = `./users/${hash}.json`;

    let json;
    
    try {
        json = JSON.parse(await fs.promises.readFile(path, 'utf8'));
    }
    catch {
        json = {};
    }

    if(upload) {
        json = { ...json, ...req.body };

        await fs.promises.writeFile(path, JSON.stringify(json));
    }

    return json;
}

async function deleteUserData(req: Request) {
    let hash = req.fingerprint?.hash;

    let path = `./users/${hash}.json`;

    try {
        await fs.promises.unlink(path);
    }
    catch {
        console.log('User data not found');
    }
}

async function saveDesign(req: Request) {
    console.log("Saving designNNN");
    
    
    let hash = req.fingerprint?.hash;
    let time = Date.now() / 1000;
    let name = `${hash}_${time}`;

    let path = `./designs/${name}.png`;

    // data:image
    let data = req.body.design;

    let buffer = Buffer.from(data.split(',')[1], 'base64');
    
    await fs.promises.writeFile(path, buffer);
}