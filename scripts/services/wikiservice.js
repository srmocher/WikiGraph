define(['jquery'],function($){
    var getSubcats = function(title){
        return $.ajax('http://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=subcat&cmtitle=Category:' + title + '&cmlimit=500&origin=*');
    };

    var getArticles = function(title){
        return $.ajax('http://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=page&cmtitle=Category:' + title + '&cmlimit=500&origin=*')
    };

    return{
        getSubcats:getSubcats,
        getArticles:getArticles
    };
})
