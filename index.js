const fs = require("fs")
const config = JSON.parse(fs.readFileSync(`./file-config.json`, 'utf8'));

const pathDev = ".././dev/alm-dev/form/"
const pathProd = ".././prod/alm-prod/form/"
// const fileName = "CanvasManifest.json"

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

        }else{
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

const extractFolder = function (path, fileName) {
    if (fileName !== "") {
        fileName = `${fileName}/`
    }
    var items = fs.readdirSync(`${path}${fileName}`)
    items.forEach(i => {
        let file = `${fileName}${i}`
        if (config.blacklist.includes(file)) {
            return
        } else {
            if (fs.lstatSync(`${path}${file}`).isDirectory()) {
                if (!fs.existsSync(`${pathProd}${file}`)) {
                    fs.mkdirSync(`${pathProd}${file}`);
                }
                extractFolder(path, file)
            } else {
                updateFile(file)
            }
        }

    })
}
extractFolder(pathDev, "")