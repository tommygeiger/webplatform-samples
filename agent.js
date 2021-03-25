var langs =
    [['Afrikaans', ['af-ZA']],
    ['Bahasa Indonesia', ['id-ID']],
    ['Bahasa Melayu', ['ms-MY']],
    ['Català', ['ca-ES']],
    ['Čeština', ['cs-CZ']],
    ['Deutsch', ['de-DE']],
    ['English', ['en-AU', 'Australia'],
        ['en-CA', 'Canada'],
        ['en-IN', 'India'],
        ['en-NZ', 'New Zealand'],
        ['en-ZA', 'South Africa'],
        ['en-GB', 'United Kingdom'],
        ['en-US', 'United States']],
    ['Español', ['es-AR', 'Argentina'],
        ['es-BO', 'Bolivia'],
        ['es-CL', 'Chile'],
        ['es-CO', 'Colombia'],
        ['es-CR', 'Costa Rica'],
        ['es-EC', 'Ecuador'],
        ['es-SV', 'El Salvador'],
        ['es-ES', 'España'],
        ['es-US', 'Estados Unidos'],
        ['es-GT', 'Guatemala'],
        ['es-HN', 'Honduras'],
        ['es-MX', 'México'],
        ['es-NI', 'Nicaragua'],
        ['es-PA', 'Panamá'],
        ['es-PY', 'Paraguay'],
        ['es-PE', 'Perú'],
        ['es-PR', 'Puerto Rico'],
        ['es-DO', 'República Dominicana'],
        ['es-UY', 'Uruguay'],
        ['es-VE', 'Venezuela']],
    ['Euskara', ['eu-ES']],
    ['Français', ['fr-FR']],
    ['Galego', ['gl-ES']],
    ['Hrvatski', ['hr_HR']],
    ['IsiZulu', ['zu-ZA']],
    ['Íslenska', ['is-IS']],
    ['Italiano', ['it-IT', 'Italia'],
        ['it-CH', 'Svizzera']],
    ['Magyar', ['hu-HU']],
    ['Nederlands', ['nl-NL']],
    ['Norsk bokmål', ['nb-NO']],
    ['Polski', ['pl-PL']],
    ['Português', ['pt-BR', 'Brasil'],
        ['pt-PT', 'Portugal']],
    ['Română', ['ro-RO']],
    ['Slovenčina', ['sk-SK']],
    ['Suomi', ['fi-FI']],
    ['Svenska', ['sv-SE']],
    ['Türkçe', ['tr-TR']],
    ['български', ['bg-BG']],
    ['Pусский', ['ru-RU']],
    ['Српски', ['sr-RS']],
    ['한국어', ['ko-KR']],
    ['中文', ['cmn-Hans-CN', '普通话 (中国大陆)'],
        ['cmn-Hans-HK', '普通话 (香港)'],
        ['cmn-Hant-TW', '中文 (台灣)'],
        ['yue-Hant-HK', '粵語 (香港)']],
    ['日本語', ['ja-JP']],
    ['Lingua latīna', ['la']]];

for (var i = 0; i < langs.length; i++) {
    select_language.options[i] = new Option(langs[i][0], i);
}
select_language.selectedIndex = 6;
updateCountry();
select_dialect.selectedIndex = 6;
showInfo('info_start');

function updateCountry() {
    for (var i = select_dialect.options.length - 1; i >= 0; i--) {
        select_dialect.remove(i);
    }
    var list = langs[select_language.selectedIndex];
    for (var i = 1; i < list.length; i++) {
        select_dialect.options.add(new Option(list[i][1], list[i][0]));
    }
    select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}

var create_email = false;
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;

//Agent vars
var state = "start";
var fail_count = 0;

if (!('webkitSpeechRecognition' in window)) {
    upgrade();
} else {
    start_button.style.display = 'inline-block';
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function () {
        recognizing = true;
        showInfo('info_speak_now');
        start_img.src = 'assets/mic-animate.gif';
    };

    recognition.onerror = function (event) {
        if (event.error == 'no-speech') {
            start_img.src = 'assets/mic.gif';
            showInfo('info_no_speech');
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            start_img.src = 'assets/mic.gif';
            showInfo('info_no_microphone');
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            if (event.timeStamp - start_timestamp < 100) {
                showInfo('info_blocked');
            } else {
                showInfo('info_denied');
            }
            ignore_onend = true;
        }
    };

    recognition.onend = function () {
        recognizing = false;

        if (ignore_onend) {
            return;
        }
        start_img.src = 'assets/mic.gif';
        if (!final_transcript) {
            showInfo('info_start');
            return;
        }
        showInfo('');
    };

    recognition.onresult = function (event) {
        var interim_transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {

                //Call agent function
                final_transcript = event.results[i][0].transcript;
                // document.getElementById("test").innerHTML = "state="+state+" input="+final_transcript;
                doAgent(final_transcript.trim());

            } else {
                interim_transcript += event.results[i][0].transcript; 
            }
        }
        final_transcript = capitalize(final_transcript);
        final_span.innerHTML = linebreak(final_transcript);
        interim_span.innerHTML = linebreak(interim_transcript);
    };
}

//Agent logic
function doAgent(input) {
    switch (state) {

        case "start":
            switch (input) {
                case "account information":
                    state = "account";
                    clear();
                    document.getElementById("agent").innerHTML = "What would you like to do? [Check Balance, Pay Balance]";
                    break;
                case "technical support":
                    state = "support1";
                    clear();
                    document.getElementById("agent").innerHTML = "Please briefly describe your problem.";
                    break;
                case "product information":
                    state = "product";
                    clear();
                    document.getElementById("agent").innerHTML = "Available products are [Internet, Cable, Cellular]. Say one to purchase it.";
                    break;
                default:
                    clear();
                    document.getElementById("agent").innerHTML = "I didn't understand that. How can I help you? [Account Information, Technical Support, Product Information]";
                    break;
            }
            break;

        case "account":
            switch (input) {
                case "check balance":
                    state = "check";
                    clear();
                    document.getElementById("agent").innerHTML = "Your balance is $" + (Math.random()*1000).toFixed(2) + ". Would you like to pay it? [Yes, No]";
                    break;
                case "pay balance":
                    state = "pay1";
                    clear();
                    document.getElementById("agent").innerHTML = "Please enter your credit card number.";
                    break;
                default:
                    clear();
                    document.getElementById("agent").innerHTML = "I didn't understand that. What would you like to do? [Check Balance, Pay Balance]";
                    break;
            }
            break;

        case "pay1":
            input = input.replace(/\D/g, "");
            if (input.length != 16) {
                clear();
                document.getElementById("agent").innerHTML = "I didn't understand that. Please enter your credit card number.";
                break;
            }
            state = "pay2";
            clear();
            document.getElementById("agent").innerHTML = "Please enter your credit card expiration date.";
            break;
            
        case "pay2":
            input = input.replace(/\D/g, "");
            if (input.length != 4) {
                document.getElementById("agent").innerHTML = "I didn't understand that. Please enter your credit card expiration date.";
                break;
            }
            state = "pay3";
            clear();
            document.getElementById("agent").innerHTML = "Please enter your credit card security code.";
            break;

        case "pay3":
            input = input.replace(/\D/g, "");
            if (input.length != 3) {
                document.getElementById("agent").innerHTML = "I didn't understand that. Please enter your credit card security code.";
                break;
            }
            end();
            document.getElementById("agent").innerHTML = "Your payment has been received.";
            break;

        case "check":
            switch (input) {
                case "yes":
                    state = "pay1";
                    clear();
                    document.getElementById("agent").innerHTML = "Please enter your credit card number.";
                    break;
                case "no":
                    state = "start";
                    clear();
                    document.getElementById("agent").innerHTML = "How can I help you? [Account Information, Technical Support, Product Information]";
                    break;
                default:
                    clear();
                    document.getElementById("agent").innerHTML = "I didn't understand that. Would you like to pay your balance? [Yes, No]";
                    break;
            }
            break;

        case "support1":
            state = "support2"
            clear();
            document.getElementById("agent").innerHTML = "Have you tried turning it off and on? [Yes, No]";
            break;

        case "support2":
            switch (input) {
                case "yes":
                    end();
                    document.getElementById("agent").innerHTML = "We will connect you to the next available technical agent.";
                    break;
                case "no":
                    state = "support3";
                    clear();
                    document.getElementById("agent").innerHTML = "Try turning it off and on. Did it work? [Yes, No]";
                    break;
                default:
                    clear();
                    document.getElementById("agent").innerHTML = "I didn't understand that. Have you tried turning it off and on? [Yes, No]";
                    break;
            }
            break;

        case "support3":
            switch (input) {
                case "yes":
                    end();
                    document.getElementById("agent").innerHTML = "I'm glad I could help. Have a good day!";
                    break;
                case "no":
                    end();
                    document.getElementById("agent").innerHTML = "We will connect you to the next available technical agent.";
                    break;
                default:
                    clear();
                    document.getElementById("agent").innerHTML = "I didn't understand that. Try turning it off and on. Did it work? [Yes, No]";
                    break;
            }
            break;

        case "product":
            switch (input) {
                case "internet":
                    state = "pay1";
                    clear();
                    document.getElementById("agent").innerHTML = "Internet costs $" + (Math.random()*100).toFixed(2) + ". Please enter your credit card number.";
                    break;
                case "cable":
                    state = "pay1";
                    clear();
                    document.getElementById("agent").innerHTML = "Cable costs $" + (Math.random()*100).toFixed(2) + ". Please enter your credit card number.";
                    break;
                case "cellular":
                    state = "pay1";
                    clear();
                    document.getElementById("agent").innerHTML = "Cellular costs $" + (Math.random()*100).toFixed(2) + ". Please enter your credit card number.";
                    break;
                default:
                    clear();
                    document.getElementById("agent").innerHTML = "I didn't understand that. Available products are [Internet, Cable, Cellular]. Say one to purchase it.";
                    break;
            }
            break;

        default:
            break;
    }
}


function clear() {
    final_transcript = '';
}

function end() {
    recognition.stop();
    return;
}

function upgrade() {
    start_button.style.visibility = 'hidden';
    showInfo('info_upgrade');
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
    return s.replace(first_char, function (m) { return m.toUpperCase(); });
}

function startButton(event) {
    if (recognizing) {
        recognition.stop();
        return;
    }
    final_transcript = '';
    recognition.lang = select_dialect.value;
    recognition.start();
    ignore_onend = false;
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    start_img.src = 'assets/mic-slash.gif';
    showInfo('info_allow');
    start_timestamp = event.timeStamp;
}

function showInfo(s) {
    if (s) {
        for (var child = info.firstChild; child; child = child.nextSibling) {
            if (child.style) {
                child.style.display = child.id == s ? 'inline' : 'none';
            }
        }
        info.style.visibility = 'visible';
    } else {
        info.style.visibility = 'hidden';
    }
}