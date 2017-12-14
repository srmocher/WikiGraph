// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({

    paths: {
        scripts:'scripts',
        jquery:'node_modules/jquery/dist/jquery.min',
        cytoscape:'node_modules/cytoscape/dist/cytoscape',
        Node:'scripts/models/Node',
        WikiService:'scripts/services/wikiservice',
        'cytoscape-panzoom':'node_modules/cytoscape-panzoom/cytoscape-panzoom',
        radialservice:'scripts/services/radialservice',
        search:'node_modules/searchjs/lib/searchjs',
        'qtip':'node_modules/qtip2/dist/jquery.qtip',
        'cytoscape-qtip':'node_modules/cytoscape-qtip/cytoscape-qtip',        
        'lerp':'node_modules/lerp/index',
        'cytoscape.js-undo-redo':'node_modules/cytoscape.js-undo-redo/cytoscape-undo-redo',
        'popper':'node_modules/popper.js/dist/umd/popper',
        'bootstrap':'node_modules/bootstrap/dist/js/bootstrap',
    },
    shim:{
        'bootstrap': {
            deps: ['jquery'],
            exports: '$'
        }
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['scripts/main']);
