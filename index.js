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
        panzoom:'node_modules/cytoscape-panzoom/cytoscape-panzoom',
        radialservice:'scripts/services/radialservice',
        search:'node_modules/searchjs/lib/searchjs'
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['scripts/main']);
