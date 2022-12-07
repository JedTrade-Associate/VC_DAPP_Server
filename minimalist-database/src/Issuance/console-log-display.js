// Colors reference

// font effect
exports.reset = "\x1b[0m"
exports.bright = "\x1b[1m" // bold
exports.dim = "\x1b[2m"
exports.italic = "\x1b[3m"
exports.underscore = "\x1b[4m"
exports.blink = "\x1b[5m"
exports.inverse = "\x1b[7m"
exports.hidden = "\x1b[8m"
exports.strikethrough = "\x1b[9m"

// font
exports.black = "\x1b[30m"
exports.red = "\x1b[31m"
exports.green = "\x1b[32m"
exports.yellow = "\x1b[33m"
exports.blue = "\x1b[34m"
exports.magenta = "\x1b[35m"
exports.cyan = "\x1b[36m"
exports.white = "\x1b[37m"

// background
exports.BGblack = "\x1b[40m"
exports.BGred = "\x1b[41m"
exports.BGgreen = "\x1b[42m"
exports.BGyellow = "\x1b[43m"
exports.BGblue = "\x1b[44m"
exports.BGmagenta = "\x1b[45m"
exports.BGcyan = "\x1b[46m"
exports.BGwhite = "\x1b[47m"

// cursor manipulation
exports.left = "\b" // go back one character
exports.up = "\x1B[A" // move one line up (Multiple lines up, \x1B[NA with N = number of lines)
exports.home = "\r" // go to beginning of line
exports.upHome = "\x1B[F" // go to beginning of previous line (Multiple lines up, \x1B[NF with N = number of lines)
exports.erase = "\x1B[2K" // erases the whole line