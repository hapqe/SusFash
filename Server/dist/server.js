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
    if (req.body.delete) {
        deleteUserData(req);
        return;
    }
    if (req.body.design) {
        saveDesign(req);
        return;
    }
    userData(req, true);
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
            json = Object.assign(Object.assign({}, json), req.body);
            yield fs_1.default.promises.writeFile(path, JSON.stringify(json));
        }
        return json;
    });
}
function deleteUserData(req) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let hash = (_a = req.fingerprint) === null || _a === void 0 ? void 0 : _a.hash;
        let path = `./users/${hash}.json`;
        try {
            yield fs_1.default.promises.unlink(path);
        }
        catch (_b) {
            console.log('User data not found');
        }
    });
}
function saveDesign(req) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Saving designNNN");
        let hash = (_a = req.fingerprint) === null || _a === void 0 ? void 0 : _a.hash;
        let time = Date.now() / 1000;
        let name = `${hash}_${time}`;
        let path = `./designs/${name}.png`;
        // data:image
        let data = req.body.design;
        let buffer = Buffer.from(data.split(',')[1], 'base64');
        yield fs_1.default.promises.writeFile(path, buffer);
    });
}
