
function gameScenario() {
    
    var renderer = new Renderer();
    document.body.attach(renderer.getDom());
    
    var spin_button = renderer.createButton({
        position : {x:-49,y:-49},
        size     : {x: 98,y: 98},
        media: {
            normal   : 'static/button_active',
            disabled : 'static/button_disabled'
        }
    });
    
    var spin_block = renderer.createArea({
        position : {x: 20,y: 20},
        size     : {x:235,y:155}
    });
    
    
    var mode_selector = new View('mode_selector');
    mode_selector.setConfig(CONF);
    document.body.attach(mode_selector.getDom());
    
    
    var logic = new GameLogic();
    logic.setConfig(CONF);
    logic.setRenderer(renderer);
    logic.setSpinButton(spin_button);
    logic.setDisplay(spin_block);
    
    
    logic.onGameFinished = function() {
        mode_selector.showDom();
    }
    
    mode_selector.onselect = function(val) {
        mode_selector.hideDom();
        logic.start(val);
    }
    
    spin_button.onclick = function() {
        logic.spin();
    }
    
    logic.start();
}




(function() {
    
    window.RES = new ResourceManager();
    RES.addMediaSource('assets.json', 'assets');
    RES.addConfigSource('config.json', 'config');
    var loader = RES.getLoader();
    
    document.body.attach(loader);
    
    RES.onSourcesLoaded(function() {
        window.CONF = RES.getModule('config');
        loader.detach();
        
        gameScenario();
    });
    
})();


