//- There are no external libs here - everything written from scratch

function gameScenario() {
    var assets = RES.getModule('assets');
    var gui_size = 1;
    var wnd_size = getWindowSize();
    map(CONF.guisize, function(m,s) {
        if( wnd_size.width > s ) { gui_size = m; }
    });
    
    var renderer = new Renderer();
    renderer.placeInto(document.body);
    
    var marker = renderer.createArea({
        position : {x:20,y: 'center'},
        size     : {x: 98*gui_size,y: 98*gui_size},
        media: {
            ico : assets.static['arrow-right']
        },
        priority: 2
    });
    marker.setBackground('ico');
    
    
    var spin_button = renderer.createArea({
        position : {x:-20,y: 'center'},
        size     : {x: 98*gui_size,y: 98*gui_size},
        priority: 20,
        media: {
            normal   : assets.static.button_active,
            disabled : assets.static.button_disabled
        }
    });
    
    
    var result_block = renderer.createArea({
        position : {x:20,y:'center-60'},
        size     : {x:200,y:40},
        priority: 3,
        disabled: true
    });
    
    
    var mode_selector = new View('mode_selector');
    mode_selector.setConfig(CONF);
    mode_selector.placeInto(document.body);
    
    
    var logic = new GameLogic();
    logic.scope.gui_size = gui_size;
    logic.joinScope(renderer, mode_selector);
    logic.setConfig(CONF);
    logic.setRenderer(renderer);
    logic.setSpinButton(spin_button);
    logic.setResultArea(result_block);
    
    for ( var i = 0; i < CONF.symbols_total; i++ ) {
        mode_selector.addOption(logic.symbols[i]);
    }
    
    mode_selector.onModeSelected = function(val) {
        mode_selector.hideDom();
        spin_button.setBackground('normal');
        logic.setTargetSymbol(val);
        logic.run();
    }
    
    logic.onGameFinished = function() {
        spin_button.setBackground('disabled');
        mode_selector.showDom();
    }
    
    spin_button.onClick = function() {
        logic.spin();
    }
    
    logic.onGameFinished();
}




(function() {
    
    window.RES = new ResourceManager();
    RES.addConfigSource('config.json', 'config');
    var loader = RES.getLoader();
    
    document.body.attach(loader.getDom());
    
    RES.onSourcesLoaded(function() {
        window.CONF = RES.getModule('config');
        RES.addMediaSource('assets.json', 'assets');
        RES.addConfigSource('locale/'+CONF.locale+'.json', 'locale');
        RES.onSourcesLoaded(function() {
            console.log(RES._module);
            window.LOC = RES.getModule('locale');
            
            loader.getDom().detach();
            
            gameScenario();
        });
        
    });
    
})();


