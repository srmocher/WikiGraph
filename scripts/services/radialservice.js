define(function(){

   var generatePositions = function(centerX,centerY,steps,radius){
     var positions = [];

            var x = 0.0;
            var y = 0.0;
            for (var i = 0; i < steps; i++) {

                if(i%2==0) {
                    x = (centerX + radius * Math.cos(2 * Math.PI * i / steps));
                    y = (centerY + radius * Math.sin(2 * Math.PI * i / steps));
                }
                else{
                    x = (centerX + 1.4*radius * Math.cos(2 * Math.PI * i / steps));
                    y = (centerY + 1.4*radius * Math.sin(2 * Math.PI * i / steps));
                }


                var pos = {
                    x:x,
                    y:y
                };
                positions.push(pos);
            }
            return positions;
   };

   function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

   var moveNodeAlongDiameter = function (point,parentPos,radius) {
            var x  = point.x;
            var slope = (point.y - parentPos.y)/(point.x - parentPos.x);
           if(point.x > parentPos.x)
           {
                    x = parentPos.x + (4*radius)/(Math.sqrt(1+slope*slope));
           }
           else if(point.x < parentPos.x)
           {
                    x = parentPos.x - (4*radius)/(Math.sqrt(1+slope*slope));
           }

            var y = point.y;
           if(point.y > parentPos.y)
           {
                y = parentPos.y + (4*radius*Math.abs(slope))/(Math.sqrt(1+slope*slope));
           }
           else if(point.y < parentPos.y)
           {
                y= parentPos.y - (4*radius*Math.abs(slope))/(Math.sqrt(1+slope*slope));
           }
            var newPos = {
               x:x,
                y:y
            };
           return newPos;
        };

   var addNodesToGraph = function(data,parent,radius,subcats=true){
      var members = data.query.categorymembers;
      var continueUrl = data.continue!==undefined?data.continue.cmcontinue:null;
      var parentPos = parent.position();
      var positions = generatePositions(parentPos.x,parentPos.y,members.length+1,radius);
      let elements = [];
      var nodes = [];
      var edges = [];
      for(var i=0;i<members.length;i++){
        var id = members[i]['pageid'];
        var nodeExists = cy.$('#'+id).length>0;
        var title = members[i]['title'];
        if(subcats)
          title = title.substring(9);
        var node = {
          group:'nodes',
          data:{
            id:id,
            title:title,
            parentId:parent.id(),
            continueUrl:null,
            expanded:false
          },
          position:positions[i]

        };
        if(subcats)
          node.data.color = COLORS.SUBCAT;
        else {
          node.data.color = COLORS.ARTICLE;
        }
      //  console.log(node);
        var edge = {
          group:'edges',
          data:{
            source:parent.id(),
            target:id
          }
        }
        if(!nodeExists){
          elements.push(node);
          nodes.push(node);
        }
        elements.push(edge);
        edges.push(edge);
      }
      if(continueUrl !== null){
        console.log(continueUrl);
        var targetId =  guid()
        var extraEdge = {
          group:'edges',
          data:{
            source:parent.id(),
            target:targetId
          }
        };

        var extraNode = {
          group:'nodes',
          data:{
            id: targetId,
            title:'...',
            continueUrl: continueUrl,
            color:subcats?COLORS.ELLIPSIS_CAT:COLORS.ELLIPSIS_ARTICLE,
            parentId:parent.id(),
            expanded:false
          },
          position:positions[positions.length-1]
        }
        console.log(extraNode.data.continueUrl);
        elements.push(extraNode);
        elements.push(extraEdge);
        nodes.push(extraNode);
      }
      cy.add(elements);

      
      let temp = [];
      temp.push(parent);
      console.log(elements.length);
       cy.animate({
         zoom:0.9,
         center:{
             eles:nodes
         },        
         duration: 1000,        
         easing:'spring(600,20)'
       });
   }


  return {
    generatePositions:generatePositions,
    moveNodeAlongDiameter:moveNodeAlongDiameter,
    addNodesToGraph:addNodesToGraph
  }
})
