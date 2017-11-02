define(['jquery', 'cytoscape', 'Node', 'cytoscape-panzoom', 'WikiService', 'radialservice', 'search', 'cytoscape-qtip'],
  function($, cytoscape, Node, panzoom, WikiService, radialservice, s, cyqtip) {

    $(function() {

      var nodes = [];
      var edges = [];

      //colors to identify nodes - article or subcat
      window.COLORS = {
        ARTICLE: 0,
        SUBCAT: 1
      }

      //Register panzoom extension
      panzoom(cytoscape, $);
      cyqtip(cytoscape, $);

      var rootPos = {
        x: 300,
        y: 400
      }
      //  var rootNode = new Node(692915,'Astronomy',COLORS.SUBCAT,rootPos);
      var rootNode = {
        group: 'nodes',
        data: {
          id: 692915,
          title: 'Astronomy',
          expanded: false,
          color: COLORS.SUBCAT,
        },
        position: rootPos,
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
        }
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

      cy.style().selector('node')
        .style({
          'width': function(ele) {
            if (ele.degree() < 5)
              return 25;

            return 2.5 * ele.degree();
          },
          'height': function(ele) {
            if (ele.degree() < 5)
              return 25;

            return 2.5 * ele.degree();
          }
        }).update();

      cy.style().selector("node[color=0]").style({
        "background-color": "#90EE90"
      }).update();

      cy.style().selector("node[color=1]").style({
        "background-color": "#87CEEB",
      }).update();

      var expandNode = function(node, subcats = true) {

        if (node.data('expanded') == true)
          return;
        var title = node.data('title');
        var parentId = node.data('parentId');
        if (parentId != undefined) {
          var parent = cy.elements("#" + parentId)[0];
          var parentPos = parent.position();
          var newPos = radialservice.moveNodeAlongDiameter(node.position(), parentPos, radius);
          //console.log(newPos);
          node.position(newPos);
          var edge = cy.elements("edge[source=\"" + parent.id() + "\"][target=\"" + node.id() + "\"]")[0];
          edge.style({
            'width': 4
          });
        }
        var pos = node.position();
        node.data('expanded', true);
        if (subcats == true) {
          WikiService.getSubcats(title).done(function(data) {
            //  console.log(data);
            radialservice.addNodesToGraph(data, node, radius);

          });
        } else {
          WikiService.getArticles(title).done(function(data) {
            radialservice.addNodesToGraph(data, node, radius, false);
          })
        }
      }

      cy.on('click', 'node', function(event) {
        //  cy.zoomingEnabled(true);

        var node = event.target;
        if (node.data('color') == COLORS.ARTICLE) {
          var title = node.data('title');
          title = title.split(' ').join('_');
          window.open('https://en.wikipedia.org/wiki/' + title, '_blank');
          return;
        }
        if (node.data('expanded') == true)
          return;
        expandNode(node);

        //  cy.pan(node.position());
      });

      cy.elements().qtip({
        content: {
          text: function(event, api) {
            var node = event.target;
            var title = node.data('title');
            title = title.split(' ').join('_');
            $.ajax("https://en.wikipedia.org/w/api.php?action=parse&page=" + title + "&prop=text&section=0").then(function(content) {
              var text = content.parse.text;
              api.set('content.text', text);
            });
            return 'Loading...';
          }
        },
        style: 'qtip-wiki',
        position: {
          my: 'top center',
          at: 'bottom center'
        }
      });

      cy.on('ready', function(event) {
        var node = cy.$('#692915')[0];
        //expandNode(node);
        cy.zoom({
          level: 1.0, // the zoom level
          position: rootNode.position
        });
      });

      cy.on('cxttapstart', 'node', function(event) {
        var node = event.target;
        if (node.data('expanded') == true)
          return;
        expandNode(node, false);

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
