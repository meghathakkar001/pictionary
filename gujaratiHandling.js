
const gujaratiVyanjan = ["%E0%AA%85", //અ
    "%E0%AA%86", //આ
    "%E0%AA%87", //ઇ
    "%E0%AA%88", //ઈ
    "%E0%AA%89", //ઉ
    "%E0%AA%8A", //ઊ
    "%E0%AA%8F", //એ
    "%E0%AA%90", //ઐ
    "%E0%AA%91", //ઑ
    "%E0%AA%93", //ઓ
    "%E0%AA%94", //ઔ
    "%E0%AA%8B", //ઋ
    "%E0%AA%95", //ક
    "%E0%AA%96", //ખ
    "%E0%AA%97", //ગ
    "%E0%AA%98", //ઘ
    "%E0%AA%9A", //ચ
    "%E0%AA%9B", //છ
    "%E0%AA%9C", //જ
    "%E0%AA%9D", //ઝ
    "%E0%AA%9F", //ટ
    "%E0%AA%A0", //ઠ
    "%E0%AA%A1", //ડ
    "%E0%AA%A2", //ઢ
    "%E0%AA%A3", //ણ
    "%E0%AA%A4", //ત
    "%E0%AA%A5", //થ
    "%E0%AA%A6", //દ
    "%E0%AA%A7", //ધ
    "%E0%AA%A8", //ન
    "%E0%AA%AA", //પ
    "%E0%AA%AB", //ફ
    "%E0%AA%AC", //બ
    "%E0%AA%AD", //ભ
    "%E0%AA%AE", //મ
    "%E0%AA%AF", //ય
    "%E0%AA%B0", //ર
    "%E0%AA%B2", //લ
    "%E0%AA%B5", //વ
    "%E0%AA%B6", //શ
    "%E0%AA%B7", //ષ
    "%E0%AA%B8", //સ
    "%E0%AA%B9", //હ
    "%E0%AA%B3" //ળ
];

const jodakshar = ["%E0%AA%95%E0%AB%8D%E0%AA%B7", //ક્ષ
    "%E0%AA%A4%E0%AB%8D%E0%AA%B0", //ત્ર
    "%E0%AA%9C%E0%AB%8D%E0%AA%9E" //જ્ઞ
]

exports.encodeGujaratiWord = function (drawWord) {
    let words = drawWord.split(" ");
    let maskedGujString = '';
    words.forEach(word => {
        var gujChars = encodeURIComponent(word).match(/.{1,9}/g);
        console.log(gujChars);

        for (var i = 0; i < gujChars.length; i++) {
            if (gujaratiVyanjan.findIndex(char => char == gujChars[i]) > 0) {
                maskedGujString += "*";
            }
        }

        maskedGujString+=' ';

    });
    return maskedGujString.trim();


}