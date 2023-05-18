/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const fs = __nccwpck_require__(147)
const config = {
    "filesToModify": {
        "CanvasManifest.json": [
            "Properties.Name",
            "PublishInfo.AppName",
            "Properties.Id",
            "Properties.FileID"
        ],
        "DataSources/Test1.json": [
            "DatasetName"
        ],
        "Entropy/Entropy.json": [
            "LocalConnectionIDReferences"
        ]
    },
    "blacklist": [
        "ComponentReferences.json",
        "Other",
        "Entropy",
        "Connections"
    ]
}

const pathDev = ".././alm/dev/"
const pathProd = ".././alm/PROD/"

class FileJSON {
    constructor(path, fileName) {
        let fileContent
        try {
            fileContent = fs.readFileSync(`${path}${fileName}`, 'utf8')
        } catch {
            fileContent = "{}"
        }
        if (fileName.includes(".json")) {
            this.file = JSON.parse(fileContent)
        } else {
            this.file = fileContent
        }
    }

    getValue(path) {
        try {
            let value = path.split(".").reduce((c, s) => c[s], this.file)
            return value
        } catch {
            throw `Property not found: ${path}`
        }

    };

    setValue(path, value) {
        const setProperty = (obj, path, value) => {
            const [head, ...rest] = path.split('.')

            return {
                ...obj,
                [head]: rest.length
                    ? setProperty(obj[head], rest.join('.'), value)
                    : value
            }
        }
        this.file = setProperty(this.file, path, value)
    }
}

const updateFile = function (fileName) {
    const applyChanges = function (file) {
        if (fileName.includes(".json")) {
            fs.writeFileSync(`${pathProd}${fileName}`, JSON.stringify(file, null, 2))

        } else {
            fs.writeFileSync(`${pathProd}${fileName}`, file)
        }
        console.log(`%c------------ ${fileName} Updated! ------------`, 'background-color: green')
    }
    const fileDev = new FileJSON(pathDev, fileName);
    const fileProd = new FileJSON(pathProd, fileName);

    if (!(config.filesToModify[fileName])) {
        applyChanges(fileDev.file)
    }
    else {

        const properties = config.filesToModify[fileName]
        for (prop of properties) {
            fileDev.setValue(prop, fileProd.getValue(prop))
        }
        applyChanges(fileDev.file)
    }
}

const extractFolder = function (path, fileName, direction) {
    if (fileName !== "") {
        fileName = `${fileName}/`
    }
    var items = fs.readdirSync(`${path}${fileName}`)
    console.log(items)
    items.forEach(i => {
        let file = `${fileName}${i}`
        if (config.blacklist.includes(file)) {
            return
        } else {
            if (direction === 'DevToProd') {
                if (fs.lstatSync(`${path}${file}`).isDirectory()) {
                    if (!fs.existsSync(`${pathProd}${file}`)) {
                        fs.mkdirSync(`${pathProd}${file}`);
                    }
                    extractFolder(path, file, direction)
                } else {
                    updateFile(file)
                }
            } else {
                if (!fs.existsSync(`${pathDev}${file}`)) {
                    fs.unlinkSync(`${path}${file}`);
                    console.log(`%c------------ ${file} Deleted! ------------`, 'background-color: red')
                } else {
                    if (fs.lstatSync(`${path}${file}`).isDirectory()) {
                        extractFolder(path, file, direction)
                    }
                }
            }
        }
    })
}
extractFolder(pathDev, "", "DevToProd")
extractFolder(pathProd, "")
})();

module.exports = __webpack_exports__;
/******/ })()
;