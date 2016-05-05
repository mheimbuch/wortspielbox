(function ($) {
    var app = $('#app'),
        appData = {
            box: {},
            nav: {
                home: true,
                imprint: false,
                rules: false
            },
            loaded: false
        };
    
    var currentDay = function () {
        var now = new Date(),
            start = new Date(now.getFullYear(), 0, 0),
            diff = now - start,
            oneDay = 1000 * 60 * 60 * 24,
            day = Math.floor(diff / oneDay);
        
        return day;
    };
    
    var dictUrl = function (word) {
        return 'https://de.wiktionary.org/w/api.php?action=parse&format=json&page=' + word.replace(' ', '_') + '&callback=?';
    };
    
    var parseMeaning = function (apiObj) {
        var container = document.createElement('div'),
            parser = $(container),
            meaningNode,
            meaning;
            
            container.innerHTML = apiObj.parse.text['*'];
            
            // Find the first meaning node
            meaningNode = 
                $(parser.find('[title="Sinn und Bezeichnetes (Semantik)"]').next()) // it's the next node after the title
                    .find('dd').get(0); // we only want the first meaning
            
            // Try to get the next element if the first one doesn't give a text back
            if (!$(meaningNode).text()) {
                meaningNode = parser.find('[title="Sinn und Bezeichnetes (Semantik)"]').next().next().find('dd').get(0);
            };
             
            // Transform it to text and strip the brackets and trim the text
            meaning = $(meaningNode).text().trim() || '';
           
           return meaning.replace(/\[.+?\]\s*/g,'' );
    };
    
    var parseWord = function (apiObj) {
        return apiObj.parse.displaytitle;
    };
    
    var dictData = function (reference, cb) {       
        return function (apiObj, err) {
            reference.word = parseWord(apiObj);
            reference.meaning = parseMeaning(apiObj);
            cb();
        }
    };
    
    var initApp = function () {
        $.get(dictUrl(WORDS[currentDay()]), dictData(appData.box, function () {
            setTimeout(function () {
                appData.loaded = true;
            }, 1000);
        }));
    };
    
    var toggleNav = function (state) {
        return function () {
            $.each(appData.nav, function (section) {
                appData.nav[section] = section === state;
            });
        }  
    };
    
    $('#impressum-toggle').on('click', toggleNav('imprint'));
    $('#rules-toggle').on('click', toggleNav('rules'));
    $('#home-toggle').on('click', toggleNav('home'));
    
    rivets.bind(app.get(), {app: appData});
    initApp();
}(Zepto));