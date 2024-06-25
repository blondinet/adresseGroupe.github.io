// check if actual int number, not a string of int
function isInt(value) {
    return typeof value === 'number' && Number.isInteger(value);
}

export { isInt }
