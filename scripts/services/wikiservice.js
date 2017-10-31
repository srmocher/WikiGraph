define(['jquery'],function($){
    var getSubCats = function(title){
        return $.ajax('http://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=subcat&cmtitle=Category:' + title + '&cmlimit=50&origin=*');
    };

    var getArticles = function(title){
        return $.ajax('http://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=page&cmtitle=Category:' + label + '&cmlimit=50&origin=*')
    };

    return{
        getSubcats:getSubCats,
        getArticles:getArticles
    };
})