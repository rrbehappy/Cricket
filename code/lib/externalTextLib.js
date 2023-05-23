/**
* Various text-related functions, especially related to fuzzy matching.
* @module
*/
/* global require, six5 */

/**
* Perform a fuzzy string comparison using case-insensitive and
* punctuation-insensitive Levenshtein distance.
*
* Input order matters, with `str2` considered the "input to check",
* e.g. the user's request).  This means that `str2` must be
* completely subsumed by `str1`, within the distance threshold, but
* not vice versa.  With a distance of two, this results in "cheese
* burgers" matching "cheeseburger", but not "burger", even though
* it's included in the user's input.  It will also match "chicken
* salad" to "caesar salad with grilled chicken", as all of the input
* is included in the match.
*
* @public
* @param str1 {String} Input to be checked.
* @param str2 {String} Input to check, or user input.
* @param [distance=2] {Number} If negative, attempts a case-insensitive
* punctuation-insensitive match.
* @returns {Boolean}
*/
function fuzzyMatch(str1, str2, distance) {
   if(!str1 || !str2) {
       return false;
   }

   //clean inputs to remove punctuation
   str1 = cleanInput(str1);
   str2 = cleanInput(str2);

   str1 = str1.toLowerCase();
   str2 = str2.toLowerCase();

   // simple case
   if(str1 === str2) {
       return true;
   } else if(distance < 0) {
       return false;
   }

   // check for whole word inclusion of str2
   if((str1.indexOf(str2) !== -1)) {
       return true;
   }

   // 'hack' so we don't fuzzy compare strings with digits
   if(/d/.test(str1) || /d/.test(str2)) {
       return false;
   }

   // default distance
   if(!distance) {
       distance = 2;
   }

   // check levenshtein distance on phrase
   if(phraseMatch(str1, str2, distance)) {
       return true;
   } else if(levenshteinDistance(str1, str2) < (2 * distance)) {

       // as a last resort, if we're within some threshold distance, try stemming the words in each phrase and checking again
       str1 = stemAllWords(str1);
       str2 = stemAllWords(str2);

       return phraseMatch(str1, str2, distance);
   }
}


/**
* Takes a mixedCase enum string and inserts spaces, e.g. "SouthAfrican" --> "South African"
* @public
* @param str {String}
* @returns {String}
*/
function spaceMixedCase (str) {
  var res = "";
  var i = 0;
  while (i < str.length) {
     if ( /[A-Z]/.test(str[i]) ) {
        res = res + " " + str[i];
     } else {
        res = res + str[i]
     }
     i = i + 1
  }
  return res.trim();
}


/*
* Clean input to remove punctuation.
*/
function cleanInput(input) {
   return input.replace(/[()'"?!.]/g, '');
}


/*
* Perform levenshtein distance check on individual words within
* phrases, using an n-gram comparison between each.  This is a bit of
* a brute-force method, but should be sufficient for small phrases,
* as found in a typical menu.  As with "fuzzyMatch", input order
* matters, with 'str2' considered the user input we're seeking to
* match.
*/
function phraseMatch(str1, str2, distance) {

   var str1Parts = str1.split(" ");
   var str2Parts = str2.split(" ");

   // check for simple case - no value in performing individual phrase match if each string is only one word
   if((str1Parts.length === 1) && (str2Parts.length === 1)) {
       return levenshteinDistance(str1, str2) < distance
   }

   // swap so we iterate the outer loop over str2, the user input
   var temp = str1Parts;
   str1Parts = str2Parts;
   str2Parts = temp;

   var matches = [];
   var token1 = '';
   var tokens1 = [];
   for(var i = 0, limit = str1Parts.length; i < limit; i++) {
       // create first token
       token1 += (" " + str1Parts[i]);
       token1 = token1.trim();
       tokens1.push(str1Parts[i]);

       var token2 = '';
       var tokens2 = [];

       var found = false;
       for(var j = 0, jLimit = str2Parts.length; j < jLimit; j++) {

           // create second token
           token2 += (" " + str2Parts[j]);
           token2 = token2.trim();
           tokens2.push(str2Parts[j]);

           // check word match
           if((levenshteinDistance(str1Parts[i], str2Parts[j]) < distance)) {
               matches.push(str1Parts[i]);
               found = true;
               // check first token against word (ignore spaces in concatenated token1)
           } else if((token1 !== str1Parts[i]) && (levenshteinDistance(token1, str2Parts[j]) < (distance + tokens1.length))) {
               matches = matches.concat(tokens1);
               found = true;
               //check word against second token (ignore spaces in concatenated token2)
           } else if((token2 !== str2Parts[j]) && (levenshteinDistance(str1Parts[i], token2) < (distance + tokens2.length))) {
               matches.push(str1Parts[i]);
               found = true;
               // check both tokens (ignore max spaces in concatenated token1/token2)
           } else if((token1 !== str1Parts[i]) && (token2 !== str2Parts[j]) && (levenshteinDistance(token1, token2) < (distance + Math.max(tokens1.length, tokens2.length)))) {
               matches = matches.concat(tokens1);
               found = true;
           }

           // if we found a match, reset
           if(found) {
               token1 = '';
               tokens1 = [];
               break;
           }
       }
   }

   // phrases match only if entire user input is found
   return (matches.length === str1Parts.length);
}


/**
* Compute the Levenshtein distance between two strings.
* This implementation of the algorithm is based on Wikipedia pseudo-code.
* @public
* @param str1 {String}
* @param str2 {String}
* @returns {Number}
* @see http://en.wikipedia.org/wiki/Levenshtein_distance
*/
function levenshteinDistance(str1, str2) {

   // degenerate cases
   if(str1 === str2) {
       return 0;
   }

   var str1Len = str1.length;
   var str2Len = str2.length;

   if(str1Len === 0) {
       return str2Len;
   } else if(str2Len === 0) {
       return str1Len;
   } else if(str1Len < str2Len) {
       // Wikipedia implementation is optimized for str1.length > str2.length
       var temp = str1;
       str1 = str2;
       str2 = temp;
       str1Len = str1.length;
       str2Len = str2.length;
   }

   // two work vectors for distances
   var v1 = [];
   var v2 = []
   var i, j, limit;

   // initialize v1 (the previous row of distances)
   // this row is A[0][i]: edit distance for an empty str1
   // the distance is just the number of characters to delete from str2
   for(i = 0, limit = (str1Len + 1); i < limit; i++) {
       v1[i] = i;
   }

   for(i = 0; i < str1Len; i++) {
       // calculate v2 (current row distances) from the revious row v1

       // first element of v2 is A[i+1][0]
       // edit distance is delete (i+1) chars from str1 to match empty str2

       v2[0] = i + 1;

       // use formulat to fill in the rest of the row
       for(j = 0; j < str2Len; j++) {
           var cost = (str1.charAt(i) === str2.charAt(j)) ? 0 : 1;
           v2[j + 1] = Math.min(
               v2[j] + 1, // deletion
               v1[j + 1] + 1, // insertion
               v1[j] + cost); // substitution
       }


       // copty v2 (current row) to v1 (previous row) for next iteration
       for(j = 0, limit = (str1Len + 1); j < limit; j++) {
           v1[j] = v2[j];
       }
   }

   return v2[str2Len];
}


/**
* Stem all the words in the given string.
* This uses Porter stemming.
* @public
* @param str {String} The word to stem.
* @returns {Array.String}
*/
function stemAllWords(str) {
   var tokens = [];
   var strParts = str.split(" ");
   for(var i = 0, limit = strParts.length; i < limit; i++) {
       tokens.push(stemmer(strParts[i]));
   }

   return tokens.join(" ");
}


/* Porter stemmer in Javascript.
* Few comments, but it's easy to follow against the rules in the original
* paper, in
*
*     Porter, 1980, An algorithm for suffix stripping, Program, Vol. 14,
*     no. 3, pp 130-137,
*
* Source:  http://tartarus.org/~martin/PorterStemmer/js.txt
* Release 1 be 'andargor', Jul 2004
* Release 2 (substantially revised) by Christopher McKenzie, Aug 2009
*/
var stemmer = (function(){
   var step2list = {
           "ational" : "ate",
           "tional" : "tion",
           "enci" : "ence",
           "anci" : "ance",
           "izer" : "ize",
           "bli" : "ble",
           "alli" : "al",
           "entli" : "ent",
           "eli" : "e",
           "ousli" : "ous",
           "ization" : "ize",
           "ation" : "ate",
           "ator" : "ate",
           "alism" : "al",
           "iveness" : "ive",
           "fulness" : "ful",
           "ousness" : "ous",
           "aliti" : "al",
           "iviti" : "ive",
           "biliti" : "ble",
           "logi" : "log"
       },

       step3list = {
           "icate" : "ic",
           "ative" : "",
           "alize" : "al",
           "iciti" : "ic",
           "ical" : "ic",
           "ful" : "",
           "ness" : ""
       },

       c = "[^aeiou]",          // consonant
       v = "[aeiouy]",          // vowel
       C = c + "[^aeiouy]*",    // consonant sequence
       V = v + "[aeiou]*",      // vowel sequence

       mgr0 = "^(" + C + ")?" + V + C,               // [C]VC... is m>0
       meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$",  // [C]VC[V] is m=1
       mgr1 = "^(" + C + ")?" + V + C + V + C,       // [C]VCVC... is m>1
       s_v = "^(" + C + ")?" + v;                   // vowel in stem

   return function (w) {
       var     stem,
           suffix,
           firstch,
           re,
           re2,
           re3,
           re4,
           origword = w;

       if (w.length < 3) { return w; }

       firstch = w.substr(0,1);
       if (firstch === "y") {
           w = firstch.toUpperCase() + w.substr(1);
       }

       // Step 1a
       re = /^(.+?)(ss|i)es$/;
       re2 = /^(.+?)([^s])s$/;

       if (re.test(w)) { w = w.replace(re,"$1$2"); }
       else if (re2.test(w)) {    w = w.replace(re2,"$1$2"); }

       // Step 1b
       re = /^(.+?)eed$/;
       re2 = /^(.+?)(ed|ing)$/;
       var fp;
       if (re.test(w)) {
           fp = re.exec(w);
           re = new RegExp(mgr0);
           if (re.test(fp[1])) {
               re = /.$/;
               w = w.replace(re,"");
           }
       } else if (re2.test(w)) {
           fp = re2.exec(w);
           stem = fp[1];
           re2 = new RegExp(s_v);
           if (re2.test(stem)) {
               w = stem;
               re2 = /(at|bl|iz)$/;
               re3 = new RegExp("([^aeiouylsz])\1$");
               re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
               if (re2.test(w)) {    w = w + "e"; }
               else if (re3.test(w)) { re = /.$/; w = w.replace(re,""); }
               else if (re4.test(w)) { w = w + "e"; }
           }
       }

       // Step 1c
       re = /^(.+?)y$/;
       if (re.test(w)) {
           fp = re.exec(w);
           stem = fp[1];
           re = new RegExp(s_v);
           if (re.test(stem)) { w = stem + "i"; }
       }

       // Step 2
       re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
       if (re.test(w)) {
           fp = re.exec(w);
           stem = fp[1];
           suffix = fp[2];
           re = new RegExp(mgr0);
           if (re.test(stem)) {
               w = stem + step2list[suffix];
           }
       }

       // Step 3
       re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
       if (re.test(w)) {
           fp = re.exec(w);
           stem = fp[1];
           suffix = fp[2];
           re = new RegExp(mgr0);
           if (re.test(stem)) {
               w = stem + step3list[suffix];
           }
       }

       // Step 4
       re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
       re2 = /^(.+?)(s|t)(ion)$/;
       if (re.test(w)) {
           fp = re.exec(w);
           stem = fp[1];
           re = new RegExp(mgr1);
           if (re.test(stem)) {
               w = stem;
           }
       } else if (re2.test(w)) {
           fp = re2.exec(w);
           stem = fp[1] + fp[2];
           re2 = new RegExp(mgr1);
           if (re2.test(stem)) {
               w = stem;
           }
       }

       // Step 5
       re = /^(.+?)e$/;
       if (re.test(w)) {
           fp = re.exec(w);
           stem = fp[1];
           re = new RegExp(mgr1);
           re2 = new RegExp(meq1);
           re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
           if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
               w = stem;
           }
       }

       re = /ll$/;
       re2 = new RegExp(mgr1);
       if (re.test(w) && re2.test(w)) {
           re = /.$/;
           w = w.replace(re,"");
       }

       // and turn initial Y back to y

       if (firstch === "y") {
           w = firstch.toLowerCase() + w.substr(1);
       }

       return w;
   }
})();

/**
* Strip embedded HTML from the string.
* @public
* @param str {String}
* @returns {String}
*/
function stripHtml(text) {
   return text ? decodeHTMLEntities(text).replace(/(<([^>]+)>)/ig,"") : text;
}

/*
*  Decode HTML entities. TODO: need a better way of doing this
*/
function decodeHTMLEntities(text) {
   var entities = [
       [/&apos;/g, '\''],
       [/&amp;/g, '&'],
       [/&lt;/g, '<'],
       [/&gt;/g, '>'],
       [/&gt;/g, '>'],
       [/&quot;/g, '"'],
       [/&ldquo;/g, '"'],
       [/&rdquo;/g, '"'],
       [/&bdquo;/g, '"'],
       [/&lsquo;/g, '\''],
       [/&rsquo;/g, '\''],
       [/&sbquo;/g, '\''],
       [/&nbsp;/g, ' '],
       [/&euro;/g, '€'],
       [/&pound;/g, '£'],
       [/&ndash;/g, '-'],
       [/&reg;/g, '®'],
       [/&deg;/g, '°'],
       [/&#38;/g, '&'],
       [/&#39;/g, '\'']
   ];

   for (var i = 0, max = entities.length; i < max; ++i) {
       text = text.replace(entities[i][0], entities[i][1]);
   }

   return text;
}


exports.fuzzyMatch = fuzzyMatch;
exports.levenshteinDistance = levenshteinDistance;
exports.spaceMixedCase = spaceMixedCase;
exports.stemAllWords = stemAllWords;
exports.stripHtml = stripHtml;

// textLib.js
