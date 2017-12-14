define(['jquery'],function($){
    var getSubcats = function(title){
        return $.ajax('http://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=subcat&cmtitle=Category:' + title + '&cmlimit=30&origin=*');
    };

    var getArticles = function(title){
        return $.ajax('http://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=page&cmtitle=Category:' + title + '&cmlimit=30&origin=*')
    };

    var getMore = function(continueText,title){
        return $.ajax('http://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=subcat&cmtitle=Category:' + title + '&cmlimit=30&origin=*&cmcontinue='+continueText);
    }

    var getMorePages = function(continueText,title){
        return $.ajax('http://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=page&cmtitle=Category:' + title + '&cmlimit=30&origin=*&cmcontinue='+continueText);
    }

    var saveGraph = function(json){
        console.log(json.elements);
        return $.ajax({
            type: "POST",
            url: 'http://wikigraphapi.azurewebsites.net/graph/save',
            data: json
          });
    }

    var getSavedGraph = function(urlId){
        return $.ajax({
            url:'http://wikigraphapi.azurewebsites.net/graph/'+urlId,
            'type':GET
        });
    }
    return{
        getSubcats:getSubcats,
        getArticles:getArticles,
        getMore:getMore,
        getMorePages:getMorePages,
        saveGraph:saveGraph,
        getSavedGraph:getSavedGraph
    };
})
