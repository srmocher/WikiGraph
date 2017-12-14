define(['jquery', 'cytoscape', 'Node', 'cytoscape-panzoom', 'WikiService', 'radialservice', 'search', 'qtip', 'cytoscape-qtip', 'cytoscape.js-undo-redo','bootstrap','popper'],
  function($, cytoscape, Node, panzoom, WikiService, radialservice, s, qtip, cyqtip, undoRedo,bootstrap,popper) {

    $(function() {

      var nodes = [];
      var edges = [];

      var params = window.location.search;
      console.log(params);
      if(params!==""){
        var id = params.split("=")[1];

      }

      //colors to identify nodes - article or subcat
      window.COLORS = {
        ARTICLE: 0,
        SUBCAT: 1,
        ELLIPSIS_CAT:2,
        ELLIPSIS_ARTICLE:3
      }
      
      var subjects = ["Astronomy","Computer Science","Economics","Religion"];
      $('.dropdown-toggle').dropdown()

     $('#saveGraph').click(function(e){
       var graphJSON = cy.json();
       WikiService.saveGraph(graphJSON).then(function(data){
         console.log(data);
         
          var fullUrl = window.location.href +"?id="+data['urlId'];
          console.log(fullUrl);
         
          $('#saveGraph').popover({
            container: 'body',
            html: true,
            placement:'top',
            content: function(){
              $('#txtContent').attr('value',fullUrl);
              return $('#popover-content').html();
            }
        });
        
        $('#saveGraph').popover('show')
       });
     })

      $('div.btn-group ul.dropdown-menu li a').click(function(e){
        //  console.log($(this));
          var selectedCategory = $(this)[0].innerText;
          rootNode.data.title = selectedCategory;
          $('#dropButton').html(selectedCategory + '<span class="caret"></span>');
          cy.remove(cy.elements());
          cy.add(rootNode);
      });
      //Register panzoom extension
      panzoom(cytoscape, $);
      cyqtip(cytoscape, $);
      undoRedo(cytoscape);

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
          continueUrl:null
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

      cy.style().selector("node[color=2]").style({
        "background-color": "#D2691E",
      }).update();

      cy.style().selector("node[color=3]").style({
        "background-color":"#ffff00"
      })


      var collapseNode = function(node){
        if(node === undefined)
          return;
         let id = node.id();
         var edges = cy.elements("edge[source=\'"+id+"\']");
         console.log(edges.length);
         for(let i=0;i<edges.length;i++){
            var target = edges[i].data('target');
            var t = cy.elements("node#"+target)[0];
            if(t.data('expanded')==true){
              collapseNode(t);
              cy.remove(t);
            }
            else{
              cy.remove(t)
            }
         }
        
         cy.animate({
           fit:{
             eles:cy.elements()
           },
           duration:500,
           easing:'spring(200,20)'
         });

      }
      var expandNode = function(node, subcats = true) {

        if (node.data('expanded') == true)
          return;
        var title = node.data('title');
        var nodeId = node.id();
        var oldPosition = node.position();
        var parentId = node.data('parentId');
        var newPos = null;
        if (parentId != undefined) {
          var parent = cy.elements("#" + parentId)[0];
          var parentPos = parent.position();
          newPos = radialservice.moveNodeAlongDiameter(node.position(), parentPos, radius);
          //console.log(newPos);
          
          var edge = cy.elements("edge[source=\"" + parent.id() + "\"][target=\"" + node.id() + "\"]")[0];
          edge.style({
            'width': 4
          });
        }
        var pos = node.position();
        node.data('expanded', true);
        var clickedNode = node;
        if (node.data('color') == COLORS.ELLIPSIS_CAT || node.data('color') == COLORS.ELLIPSIS_ARTICLE) {
          var continueText = node.data().continueUrl
          console.log(node.data().continueUrl);
          var parent = cy.elements("#" + parentId)[0];
          var ttl = "...";
          var color = node.data().color;
          var tempNode = node;
          while (ttl === "...") {
            var temp = node.data().parentId;
            parent = cy.elements('#' + temp)[0];
            ttl = parent.data().title;
            node = parent;
            
          }
          
          if (color == COLORS.ELLIPSIS_CAT) {
            WikiService.getMore(continueText, ttl).then(function (data) {
              if(data.query.categorymembers.length>0)
                cy.$('#'+nodeId)[0].position(newPos);
              radialservice.addNodesToGraph(data, tempNode, radius);
            })
          }
          else if(color == COLORS.ELLIPSIS_ARTICLE) {
            console.log("Expanding more articles");
            WikiService.getMorePages(continueText,ttl).then(function(data){
              if(data.query.categorymembers.length>0)
                 cy.$('#'+nodeId)[0].position(newPos);
              radialservice.addNodesToGraph(data,tempNode,radius,false);
            })
          }
          return;
        }
        if (subcats == true) {
          WikiService.getSubcats(title).done(function(data) {
            //  console.log(data);
            if(data.query.categorymembers.length>0)
              cy.$('#'+nodeId)[0].position(newPos);
            radialservice.addNodesToGraph(data, node, radius);

          });
        } else {
          WikiService.getArticles(title).done(function(data) {
            if(data.query.categorymembers.length>0)
                cy.$('#'+nodeId)[0].position(newPos);
            radialservice.addNodesToGraph(data, node, radius, false);
          })
        }
      }

      cy.on('click', 'node', function(event) {
        //  cy.zoomingEnabled(true);

        var node = event.target;
        cy.elements('#'+node.id()).unselect();
        var id = node.id();
        if (node.data('color') == COLORS.ARTICLE) {
          var title = node.data('title');
          title = title.split(' ').join('_');
          window.open('https://en.wikipedia.org/wiki/' + title, '_blank');
          return;
        }
        var temp = node;
        if (node.data('expanded') == true)
        {
            collapseNode(node);
            node.data('expanded',false);
            return;
        }
        expandNode(node);
       
        //  cy.pan(node.position());
      });



      var options = {
        isDebug: false, // Debug mode for console messages
        actions: {}, // actions to be added
        undoableDrag: true, // Whether dragging nodes are undoable can be a function as well
        stackSizeLimit: undefined, // Size limit of undo stack, note that the size of redo stack cannot exceed size of undo stack
        ready: function() { // callback when undo-redo is ready

        }
      }

      var ur = cy.undoRedo(options); // Can also be set whenever wanted.
      cy.on('ready', function(event) {
        var node = cy.$('#692915')[0];
        //expandNode(node);
        cy.zoom({
          level: 1.0, // the zoom level
          position: rootNode.position
        });


      });

      var showPath = function(node){
        console.log("entered showpath");
        var nodesToBeShown = [];
        let temp = node;
        console.log(node.style('opacity'));
        cy.elements().style('opacity',0.2);
        while(temp!=undefined){
            temp.style('opacity',1);
            temp.style('font-weight','bolder');
            let edges = cy.elements('edge[target=\"'+temp.id()+'\"]');
            edges.style('opacity',1);
            let parentId = temp.data('parentId');
            
            let parent = cy.$('#'+parentId)[0];
            temp = parent;
        }
      }
      var hoverTimeout;
      cy.on('mouseout','node',function(event){
        clearTimeout(hoverTimeout);
        var node = event.target;
        node.trigger('hovercancel');
        cy.elements().style('opacity',1);
        cy.elements().removeStyle('font-weight');

      })
      cy.on('mouseover', 'node', function(event) {
        var node = event.target;
        showPath(node);
        var hoverDelay = 1000;
        clearTimeout(hoverTimeout)
        hoverTimeout = setTimeout(function(){
          node.trigger('hover');
        },
        hoverDelay);
        if (node.data('color') == COLORS.SUBCAT) {
          node.qtip({
            overwrite: false,
            content: node.data('title'),
            show: {
              event:'hover'
            },
            hide: {
              event: 'hovercancel'
            },
            position: {
              my: 'top center',
              at: 'bottom center'
            },
            style: {
              classes: 'qtip-wiki',
              tip: {
                width: 16,
                height: 8
              }
            },
            event
          });
          return;
        }
        node.qtip({
          overwrite: false, // Make sure the tooltip won't be overridden once created
          content: {
            text: function(event, api) {
              var title = node.data('title');
              if(title=== '...')
                return;
              title = title.split(" ").join('_');
              $.ajax('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&pageids=' + node.id() + '&origin=*').done(function(data) {
                var id = node.id();
                var extract = data.query.pages[id].extract;
                api.set('content.text', extract);
              });
              return 'Loading...';
            }
          },
          show: {
            event:'hover'
          },
          hide: {
            event: 'mouseout'
          },
          position: {
            my: 'top center',
            at: 'bottom center'
          },
          style: {
            classes: 'qtip-wiki',
            tip: {
              width: 16,
              height: 8
            }
          }
        }, event); // Pass through our live event to qTip
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
