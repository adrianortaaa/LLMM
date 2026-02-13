// max
function max(a, b) {
    return (a > b) ? a : b;
}
function showMax() {
    let a = +document.getElementById("maxA").value;
    let b = +document.getElementById("maxB").value;
    document.getElementById("outMax").innerHTML = "Max: " + max(a, b);
}

// maxOfThree
function maxOfThree(a, b, c) {
    return Math.max(a, b, c);
}
function showMaxOfThree() {
    let a = +document.getElementById("m3A").value;
    let b = +document.getElementById("m3B").value;
    let c = +document.getElementById("m3C").value;
    document.getElementById("outMax3").innerHTML = "Max of 3: " + maxOfThree(a, b, c);
}

// isVowel
function isVowel(ch) {
    return ["a","e","i","o","u"].includes(ch.toLowerCase());
}
function showIsVowel() {
    let ch = document.getElementById("vowelChar").value;
    document.getElementById("outVowel").innerHTML = isVowel(ch);
}

// Rövarspråket
function translate(str) {
    let result = "";
    for (let ch of str) {
        if (/[^aeiou\s]/i.test(ch)) {
            result += ch + "o" + ch.toLowerCase();
        } else {
            result += ch;
        }
    }
    return result;
}
function showTranslate() {
    let t = document.getElementById("textRov").value;
    document.getElementById("outRov").innerHTML = translate(t);
}

// sum & multiply
function sum(arr) {
    return arr.reduce((a, v) => a + v, 0);
}
function multiply(arr) {
    return arr.reduce((a, v) => a * v, 1);
}
function showSumMultiply() {
    let arr = document.getElementById("arrayNums").value.split(",").map(Number);
    document.getElementById("outSum").innerHTML = "Sum: " + sum(arr) + ", Multiply: " + multiply(arr);
}

// reverse
function reverse(str) {
    return str.split("").reverse().join("");
}
function showReverse() {
    let s = document.getElementById("revText").value;
    document.getElementById("outRev").innerHTML = reverse(s);
}

// sort words
function sortWords(arr) {
    return arr.sort();
}
function showSortWords() {
    let arr = document.getElementById("sortWordsIn").value.split(",");
    document.getElementById("outSort").innerHTML = sortWords(arr).join(", ");
}

// findLongestWord
function findLongestWord(arr) {
    return arr.reduce((a, w) => w.length > a.length ? w : a, "");
}
function showLongest() {
    let arr = document.getElementById("findLongestIn").value.split(",");
    document.getElementById("outLongest").innerHTML = "Longest: " + findLongestWord(arr);
}

// filterLongWords
function filterLongWords(arr, i) {
    return arr.filter(w => w.length > i);
}
function showFilterLong() {
    let arr = document.getElementById("filterWordsIn").value.split(",");
    let i = Number(document.getElementById("filterI").value);
    document.getElementById("outFilter").innerHTML = filterLongWords(arr, i).join(", ");
}

// charFreq
function charFreq(str) {
    let freq = {};
    for (let ch of str) {
        freq[ch] = (freq[ch] || 0) + 1;
    }
    return freq;
}
function showCharFreq() {
    let txt = document.getElementById("freqText").value;
    document.getElementById("outFreq").innerHTML = JSON.stringify(charFreq(txt));
}