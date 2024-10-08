
function exponentialFormat(num, precision, mantissa = true) {
    let e = num.log10().floor()
    let m = num.div(Decimal.pow(10, e))
    if (m.toStringWithDecimalPlaces(precision) == 10) {
        m = decimalOne
        e = e.add(1)
    }
    e = (e.gte(1e9) ? format(e, 3) : (e.gte(10000) ? commaFormat(e, 0) : e.toStringWithDecimalPlaces(0)))
    if (mantissa)
        return m.toStringWithDecimalPlaces(precision) + "e" + e
    else return "e" + e
}

function commaFormat(num, precision) {
    if (num === null || num === undefined) return "NaN"
    if (num.mag < 0.001) return (0).toFixed(precision)
    let init = num.toStringWithDecimalPlaces(precision)
    let portions = init.split(".")
    portions[0] = portions[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
    if (portions.length == 1) return portions[0]
    return portions[0] + "." + portions[1]
}


function regularFormat(num, precision) {
    if (num === null || num === undefined) return "NaN"
    if (num.mag < 0.0001) return (0).toFixed(precision)
    if (num.mag < 0.1 && precision !==0) precision = Math.max(precision, 4)
    return num.toStringWithDecimalPlaces(precision)
}

function fixValue(x, y = 0) {
    return x || new Decimal(y)
}

function sumValues(x) {
    x = Object.values(x)
    if (!x[0]) return decimalZero
    return x.reduce((a, b) => Decimal.add(a, b))
}

function format(decimal, precision = 2, small) {
    small = small || modInfo.allowSmall
    decimal = new Decimal(decimal)
    if (isNaN(decimal.sign) || isNaN(decimal.layer) || isNaN(decimal.mag)) {
        player.hasNaN = true;
        return "NaN"
    }
    if (decimal.sign < 0) return "-" + format(decimal.neg(), precision, small)
    if (decimal.mag == Number.POSITIVE_INFINITY) return "Infinity"
    if (decimal.gte("eeee1000")) {
        var slog = decimal.slog()
        if (slog.gte(1e6)) return "F" + format(slog.floor())
        else return Decimal.pow(10, slog.sub(slog.floor())).toStringWithDecimalPlaces(3) + "F" + commaFormat(slog.floor(), 0)
    }
    else if (decimal.gte("1e1000000")) return exponentialFormat(decimal, 0, false)
    else if (decimal.gte("1e10000")) return exponentialFormat(decimal, 0)
    else if (decimal.gte(1e9)) return exponentialFormat(decimal, precision)
    else if (decimal.gte(1e3)) return commaFormat(decimal, 0)
    else if (decimal.gte(0.0001) || !small) return regularFormat(decimal, precision)
    else if (decimal.eq(0)) return (0).toFixed(precision)

    decimal = invertOOM(decimal)
    let val = ""
    if (decimal.lt("1e1000")){
        val = exponentialFormat(decimal, precision)
        return val.replace(/([^(?:e|F)]*)$/, '-$1')
    }
    else   
        return format(decimal, precision) + "⁻¹"

}

function formatWhole(decimal) {
    decimal = new Decimal(decimal)
    if (decimal.gte(1e9)) return format(decimal, 2)
    if (decimal.lte(0.99) && !decimal.eq(0)) return format(decimal, 2)
    return format(decimal, 0)
}

function formatTime(s) {
	if (s < 315360000) {
		var str = format(s % 60) + "s"
		if (s >= 60) str = formatWhole(Math.floor(s / 60) % 60) + "m " + str
		if (s >= 3600) str = formatWhole(Math.floor(s / 3600) % 24) + "h " + str
		if (s >= 86400) str = formatWhole(Math.floor(s / 86400) % 365) + "d " + str
		if (s >= 31536000) str = formatWhole(Math.floor(s / 31536000)) + "y " + str
		return str
	} else {
		var y = s / 31536000
		if (y >= 1e100) return format(y / 1e100) + " black hole eras"
		if (y >= 1e40) return format(y / 1e40) + " degenerate eras"
		if (y >= 1e9) return format(y / 1e9) + " aeons"
		if (y >= 1e6) return format(y / 1e6) + " megannums"
        if (y >= 1000) return format(y / 1000) + " millenniums"
        if (y >= 100) return format(y / 100) + " centuries"
        if (y >= 25) return format(y / 25) + " human generations"
        if (y >= 10) return format(y / 10) + " decades"
		return formatWhole(y) + " years"
	}
}

function formatDistance(mm) {
	
    var dist = format(mm % 10) + "mm"
    if (mm >= 10) dist = formatWhole(Math.floor(mm / 10) % 100) + " cm"
    if (mm >= 1000) dist = formatWhole(Math.floor(mm / 1000) % 1000) + " m"
    if (mm >= 1000000) dist = formatWhole(Math.floor(mm / 1000000) % 1000) + " km"
    if (mm >= 1e9) dist = formatWhole(Math.floor(mm / 1e9) % 1000) + " Mm"
    if (mm >= 1e12) dist = formatWhole(Math.floor(mm / 1e12) % 1000) + " Gm"
    if (mm >= 1e15) dist = formatWhole(Math.floor(mm / 1e15) % 9460) + " Tm"
    if (mm >= 9.46e18) dist = formatWhole(Math.floor(mm / 9.46e18)) + " ly"
    if (mm >= 3.08e19) dist = formatWhole(Math.floor(mm / 3.08e19)) + " pc"
    if (mm >= 8.7978e29) dist = formatWhole(Math.floor(mm / 8.7978e29)) + " obversable universe diameters"
    return dist
	}


function toPlaces(x, precision, maxAccepted) {
    x = new Decimal(x)
    let result = x.toStringWithDecimalPlaces(precision)
    if (new Decimal(result).gte(maxAccepted)) {
        result = new Decimal(maxAccepted - Math.pow(0.1, precision)).toStringWithDecimalPlaces(precision)
    }
    return result
}

// Will also display very small numbers
function formatSmall(x, precision=2) { 
    return format(x, precision, true)    
}

function invertOOM(x){
    let e = x.log10().ceil()
    let m = x.div(Decimal.pow(10, e))
    e = e.neg()
    x = new Decimal(10).pow(e).times(m)

    return x
}