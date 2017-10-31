define(['jquery','cytoscape','Node','panzoom','WikiService'],function($,cytoscape,Node,panzoom,WikiService){

    $(function(){
      
            WikiService.getSubcats('Astronomy').done(function(data){
                console.log(data);
            })
    
    });
});