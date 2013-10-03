/* global sharing */
var nouns = [],
    verbs = [],
    adjs = [];

Array.prototype.pick = function() {
  return this[Math.floor(Math.random()*this.length)];
};

// NOUN, VERB, ADJ are what you expect
// NOUNP = plural noun, VERBP = 'plural' verb (shoots instead of shoot)
var aph = [
  'NOUNP VERB Everything Around Me',
  'gotta keep it ADJ',
  'smoke NOUNP everyday'
];

function generate(noun, verb, adjective) {
  noun = noun || nouns.pick();
  verb = verb || verbs.pick();
  adjective = adjective || adjs.pick();
  var generatedText = aph.pick();
  generatedText = generatedText
    .replace('NOUNP', noun.pluralize())
    .replace('VERBP', verb.pluralize())
    .replace('NOUN', noun)
    .replace('VERB', verb)
    .replace('ADJ', adjective)
    .titleize();

  $('#content').text(generatedText);
  var shareUrl = window.location.href.split('?')[0]+'?word='+sharing.encodeStr(verb)+'$'+sharing.encodeStr(noun);
  $('#share').attr('href', shareUrl);
  $('.twitter-share-button').remove();
  $('#twitterShare').html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="' + shareUrl + '" data-text="' + generatedText + '" data-lang="en">Tweet</a>');
  if (twttr.widgets) {
    twttr.widgets.load();
  }
}

function getWords(suppressGenerate) {
  $.when(
    $.ajax({
      url: 'http://api.wordnik.com/v4/words.json/randomWords?minCorpusCount=10000&minDictionaryCount=5&excludePartOfSpeech=proper-noun,proper-noun-plural,proper-noun-posessive,suffix,family-name,idiom,affix&hasDictionaryDef=true&includePartOfSpeech=noun&limit=1000&maxLength=22&api_key='+key.API_KEY,
      async: false,
      dataType:'json'
    }),
    $.ajax({
      url: 'http://api.wordnik.com//v4/words.json/randomWords?limit=1000&excludePartOfSpeech=adjective&hasDictionaryDef=true&includePartOfSpeech=verb-transitive&minCorpusCount=1000&api_key='+key.API_KEY,
      async: false,
      dataType:'json'
    }),
    $.ajax({
      url: 'http://api.wordnik.com//v4/words.json/randomWords?limit=1000&excludePartOfSpeech=verb&hasDictionaryDef=true&includePartOfSpeech=adjective&minCorpusCount=5000&api_key='+key.API_KEY,
      async: false,
      dataType:'json'
    })
  ).done(function(noun_data, verb_data, adj_data) {
    nouns = $.map(noun_data[0], function(el) { return el.word; });
    verbs = $.map(verb_data[0], function(el) { return el.word; });
    adjs  = $.map(adj_data[0],  function(el) { return el.word; });
    if (!suppressGenerate) {
      generate();
    }
  });
}

$('#generate').click(function() { generate(); });
if (sharing.gup('word') === '') {
  getWords();
}
else {
  var verb = sharing.decodeStr(unescape(sharing.gup('word')).split('$')[0]);
  var noun = sharing.decodeStr(unescape(sharing.gup('word')).split('$')[1]);
  getWords(true);
  generate(noun, verb);
}
