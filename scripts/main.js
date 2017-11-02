define(['jquery', 'cytoscape', 'Node', 'cytoscape-panzoom', 'WikiService', 'radialservice', 'search', 'cytoscape-qtip'],
  function($, cytoscape, Node, panzoom, WikiService, radialservice, s, qtip) {

    $(function() {

      var nodes = [];
      var edges = [];

      //colors to identify nodes - article or subcat
      var COLORS = {
        ARTICLE: 0,
        SUBCAT: 1
      }

      //Register panzoom extension
      panzoom(cytoscape, $);

      var rootPos = {
        x: 300,
        y: 400
      }
      //  var rootNode = new Node(692915,'Astronomy',COLORS.SUBCAT,rootPos);
      var rootNode = {
        group: 'nodes',
        data: {
          id: 692915,
          title: 'Astronomy'
        },
        position: rootPos,
        color: COLORS.ARTICLE,
        parentId: null
      };
      var radius = 200;
      var elements = [];
      elements.push(rootNode);

      var cy = cytoscape({
        container: $('#cy'),
        elements: elements,
        style: $.getJSON("style.json").done(function(data) {
          return data;
        }),
        layout: {
          name: 'preset'
        },
        zoom: 0.1
      });

      var defaults = {
        zoomFactor: 0.05, // zoom factor per zoom tick
        zoomDelay: 45, // how many ms between zoom ticks
        minZoom: 0.1, // min zoom level
        maxZoom: 10, // max zoom level
        fitPadding: 50, // padding when fitting
        panSpeed: 10, // how many ms in between pan ticks
        panDistance: 10, // max pan distance per tick
        panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
        panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
        panInactiveArea: 8, // radius of inactive area in pan drag box
        panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
        zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
        fitSelector: undefined, // selector of elements to fit
        animateOnFit: function() { // whether to animate on fit
          return false;
        },
        fitAnimationDuration: 1000, // duration of animation on fit

        // icon class names
        sliderHandleIcon: 'fa fa-minus',
        zoomInIcon: 'fa fa-plus',
        zoomOutIcon: 'fa fa-minus',
        resetIcon: 'fa fa-expand'
      };

      cy.panzoom(defaults);
      window.cy = cy;

      cy.on('click', 'node', function(event) {
        cy.zoomingEnabled(true);
        var node = event.target;
        var title = node._private.data.title;
        var parentId = node._private.data.parentId;
        if (parentId != undefined) {
          var parent = cy.elements("#" + parentId)[0];
          var parentPos = parent.position();
          var newPos = radialservice.moveNodeAlongDiameter(node.position(), parentPos, radius);
          //console.log(newPos);
          node.position(newPos);
        }
        var pos = node.position();
        WikiService.getSubcats(title).done(function(data) {
          radialservice.addSubcatsToGraph(data, node, radius);

        });

      });

      cy.on('drag', 'node', function(event) {
        var node = event.target;
        var degree = node.degree();
        if (degree > 1) {
          var rootPos = node.position();
          var childEdges = cy.elements("edge[source=\"" + node.id() + "\"]");
          var positions = radialservice.generatePositions(rootPos.x, rootPos.y, childEdges.length, radius);
          for (var i = 0; i < childEdges.length; i++) {
            var targetId = childEdges[i].data('target');
            var child = cy.elements("#" + targetId)[0];
            //console.log(child.data('title')+"-"+child.degree());
            if (child.degree() == 1) {
              child.position(positions[i]);
            }
          }
        }
      });
    });


  })
