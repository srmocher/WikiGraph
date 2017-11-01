define(['jquery','cytoscape','Node','panzoom','WikiService','radialservice','search'],
function($,cytoscape,Node,panzoom,WikiService,radialservice,search){

    $(function(){

            var nodes =[];
            var edges = [];

            //colors to identify nodes - article or subcat
            var COLORS = {
              ARTICLE:0,
              SUBCAT:1
            }

            //Register panzoom extension
            panzoom( cytoscape, $ );

            var rootPos = {
              x:300,
              y:400
            }
          //  var rootNode = new Node(692915,'Astronomy',COLORS.SUBCAT,rootPos);
            var rootNode = {
              group:'nodes',
              data:{
                id:692915,
                title:'Astronomy'
              },
              position:rootPos,
              color:COLORS.ARTICLE,
              children:[]
            };
            var radius = 200;
            var elements = [];
            elements.push(rootNode);
            WikiService.getSubcats('Astronomy').done(function(data){
                var members = data.query.categorymembers;
              //  console.log(rootNode.id);
                var positions = radialservice.generatePositions(rootPos.x,rootPos.y,members.length,radius);
                for(var i=0;i<members.length;i++)
                {
                    var id = members[i]['pageid'];
                    var title = members[i]['title'].substring(9);
                    //var n = new Node(id,title,COLORS.SUBCAT,positions[i]);
                    var n = {
                      group:'nodes',
                      data:{
                        id:id,
                        title:title
                      },
                      position:positions[i],
                      color:COLORS.SUBCAT,
                      children : []
                    };
                    var edge = {
                      group:'edges',
                      data:{
                        source:rootNode.data.id,
                        target:id
                      }
                    };
                    rootNode.children.push(n);
                    nodes.push(n);
                    edges.push(edge);
                    elements.push(n);
                    elements.push(edge);
                }
                console.log(members.length);

                var cy = cytoscape({
                  container:document.getElementById('cy'),
                  elements:elements,
                  style:$.getJSON("style.json").done(function(data){
                    return data;
                  }),
                    layout:{
                      name:'preset'
                    }
                });


          });
});
})
