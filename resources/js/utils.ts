import jsxRuntime from 'react/jsx-runtime';
const _jsx = jsxRuntime.jsx;

const newlineRegex = /(\r\n|\r|\n)/g;

const nl2br = function (str: never | string) {
    if (typeof str !== 'string') {
        return str;
    }

    return str.split(newlineRegex).map((line, index) => {
        if (line.match(newlineRegex)) {
            return _jsx('br', { key: index });
        }

        return line;
    });
};

export { nl2br };
