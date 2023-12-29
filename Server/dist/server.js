"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_fingerprint_1 = __importDefault(require("express-fingerprint"));
const fs_1 = __importDefault(require("fs"));
const port = 8000;
const app = (0, express_1.default)();
app.use(express_1.default.static('public'));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use((0, express_fingerprint_1.default)());
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
app.post('/', (req, res, next) => {
    if (req.body.design) {
        saveDesign(req);
    }
    else if (req.body.collectDesign) {
        incrementDesignCount(req);
    }
    else if (req.body.tradeDesign) {
        incrementDesignCount(req, "tradeCount");
    }
    else {
        userData(req, true);
    }
    res.json({ status: 'ok' });
    next();
});
app.get('/userData', (req, res, next) => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        let data = yield userData(req);
        res.send(data);
    }))();
});
function userData(req, upload = false) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let hash = (_a = req.fingerprint) === null || _a === void 0 ? void 0 : _a.hash;
        let path = `./users/${hash}.json`;
        let json;
        try {
            json = JSON.parse(yield fs_1.default.promises.readFile(path, 'utf8'));
        }
        catch (_b) {
            json = {};
        }
        if (upload) {
            // json = { ...json, ...req.body };
            const merge = (t, s) => { const o = Object, a = o.assign; for (const k of o.keys(s))
                s[k] instanceof o && a(s[k], merge(t[k], s[k])); return a(t || {}, s), t; };
            merge(req.body, json);
            yield fs_1.default.promises.writeFile(path, JSON.stringify(json));
        }
        return Object.assign({ isUserData: true }, json);
    });
}
// async function deleteUserData(req: Request) {
//     let hash = req.fingerprint?.hash;
//     let path = `./users/${hash}.json`;
//     try {
//         await fs.promises.unlink(path);
//     }
//     catch {
//         console.log('User data not found');
//     }
// }
function incrementDesignCount(req, id = "buyCount") {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        let path = `./users/${req.body.id}.json`;
        let name = req.body.date;
        let json;
        try {
            json = JSON.parse(yield fs_1.default.promises.readFile(path, 'utf8'));
            const count = (_c = ((_b = (_a = json.designs) === null || _a === void 0 ? void 0 : _a[name]) === null || _b === void 0 ? void 0 : _b[id])) !== null && _c !== void 0 ? _c : 0;
            if (count == 0) {
                json.designs[name] = Object.assign(Object.assign({}, json.designs[name]), { [id]: 1 });
            }
            else {
                json.designs[name] = Object.assign(Object.assign({}, json.designs[name]), { [id]: count + 1 });
            }
        }
        catch (_d) {
            json = {
                designs: {
                    [name]: {
                        [id]: 1
                    }
                }
            };
        }
        yield fs_1.default.promises.writeFile(path, JSON.stringify(json));
    });
}
function saveDesign(req) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let hash = (_a = req.fingerprint) === null || _a === void 0 ? void 0 : _a.hash;
        let time = Date.now();
        let name = `${hash}_${time}`;
        let path = `./designs/${name}.png`;
        let data = req.body.design;
        try {
            let buffer = Buffer.from(data.split(',')[1], 'base64');
            const isBase64png = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 && buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A;
            if (!isBase64png) {
                console.log('Not a valid base64 png');
                return;
            }
            yield fs_1.default.promises.writeFile(path, buffer);
            delete req.body.design;
            req.body.designs = { [time]: { buyCount: 0 } };
            userData(req, true);
        }
        catch (_b) {
            console.log('Error saving design');
        }
    });
}
function getDesign(req, { notFromUser = false, savedDesign = false }) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const designs = yield fs_1.default.promises.readdir('./designs');
        const count = designs.length;
        const i = () => Math.floor(Math.random() * count);
        let index = i();
        let hash = (_a = req.fingerprint) === null || _a === void 0 ? void 0 : _a.hash;
        let maxTries = 10;
        if (notFromUser && hash) {
            while (designs[index].startsWith(hash)) {
                index = i();
                maxTries--;
                if (maxTries == 0)
                    break;
            }
        }
        if (savedDesign && hash) {
            while (!designs[index].startsWith(hash)) {
                index = i();
                maxTries--;
                if (maxTries == 0)
                    break;
            }
        }
        if (!designs[index])
            return;
        let path = `./designs/${designs[index]}`;
        let data = yield fs_1.default.promises.readFile(path, 'base64');
        return {
            isDesign: true,
            design: `data:image/png;base64,${data}`,
            stamp: designs[index]
        };
    });
}
// async function getDesignFromUser(user: string, not = false) {
//     const designs = await fs.promises.readdir('./designs');
//     const count = designs.length;
//     let index = Math.floor(Math.random() * count);
//     while(!designs[index].startsWith(user) == not) {
//         index = Math.floor(Math.random() * count);
//     }
//     let path = `./designs/${designs[index]}`;
//     let data = await fs.promises.readFile(path, 'base64');
//     return {
//         isDesign: true,
//         design: `data:image/png;base64,${data}`,
//         stamp: designs[index]
//     };
// }
function getNamedDesign(req, name) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let hash = (_a = req.fingerprint) === null || _a === void 0 ? void 0 : _a.hash;
        const filename = `${hash}_${name}`;
        const path = `./designs/${filename}.png`;
        let data;
        try {
            data = yield fs_1.default.promises.readFile(path, 'base64');
        }
        catch (_b) {
        }
        return {
            isDesign: true,
            design: `data:image/png;base64,${data}`,
            stamp: filename
        };
    });
}
function deleteNamedDesign(req, name) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let hash = (_a = req.fingerprint) === null || _a === void 0 ? void 0 : _a.hash;
        const filename = `${hash}_${name}`;
        const path = `./designs/${filename}.png`;
        try {
            yield fs_1.default.promises.unlink(path);
        }
        catch (_b) {
        }
        let userPath = `./users/${hash}.json`;
        let json;
        try {
            json = JSON.parse(yield fs_1.default.promises.readFile(userPath, 'utf8'));
            delete json.designs[name];
            yield fs_1.default.promises.writeFile(userPath, JSON.stringify(json));
        }
        catch (_c) {
        }
    });
}
app.post('/design', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    getDesign(req, Object.assign({}, req.body)).then(d => res.send(d));
}));
app.post('/getdesign', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    getNamedDesign(req, req.body.designName).then(d => res.send(d));
}));
app.post('/deletedesign', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    deleteNamedDesign(req, req.body.designName).then(d => res.send(d));
}));
app.post('/time', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const time = req.body.time;
    const name = req.body.name;
    console.log(time, name);
    if (!time || !name)
        return;
    let current = "";
    try {
        current = yield fs_1.default.promises.readFile('./time.json', 'utf8');
    }
    catch (_a) {
        current = "{}";
    }
    let updated = JSON.parse(current);
    updated[name] = time;
    yield fs_1.default.promises.writeFile('./time.json', JSON.stringify(updated));
    next();
}));
