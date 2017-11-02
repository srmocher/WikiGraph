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

   var moveNodeAlongDiameter = function (point,parentPos,radius) {
            var x  = point.x;
            var slope = (point.y - parentPos.y)/(point.x - parentPos.x);
           if(point.x > parentPos.x)
           {
                    x = parentPos.x + (4*radius)/(Math.sqrt(1+slope*slope));
           }
           else if(point.x < parentPos.x)
           {
                    x = parentPos.y - (4*radius)/(Math.sqrt(1+slope*slope));
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

   var addSubcatsToGraph = function(data,parent,radius){
      var members = data.query.categorymembers;
      var parentPos = parent.position();
      var positions = generatePositions(parentPos.x,parentPos.y,members.length,radius);
      var elements = [];
      for(var i=0;i<members.length;i++){
        var id = members[i]['pageid'];
        var title = members[i]['title'].substring(9);
        var node = {
          group:'nodes',
          data:{
            id:id,
            title:title,
            parentId:parent.id()
          },
          position:positions[i]

        };
      //  console.log(node);
        var edge = {
          group:'edges',
          data:{
            source:parent.id(),
            target:id
          }
        }
        elements.push(node);
        elements.push(edge);
      }
      cy.add(elements);
   }
  return {
    generatePositions:generatePositions,
    moveNodeAlongDiameter:moveNodeAlongDiameter,
    addSubcatsToGraph:addSubcatsToGraph
  }
})
