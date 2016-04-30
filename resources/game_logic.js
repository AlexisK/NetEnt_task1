
function GameLogic() {
    var self = getSelf(this);
    self.inherit(BaseModel);
    self.inherit(DrawModule);
    var assets = RES.getModule('assets');
    
    self.init = function() {
        self.scope.gui_size = 1;
        
        self.targetSymbol = null;
        self.button  = null;
        self.renderer = null;
        self.currentSymbol = 0;
        self.currentOffset = 0;
        self.spinStep = 0;
        
        self.result_state = false;
        
        self.prepSymbols();
        window.test = self;
    }
    
    self.prepSymbols = function() {
        self.symbols = [];
        for( var j = 0; j < CONF.symbols_mult; j++ ) {
            for ( var i = 0; i < CONF.symbols_total; i++ ) {
                var path = assets.symbols.minor[i];
                var newSymbol = {
                    src: CONF.path.assets + path,
                    src_raw: path,
                    index: i
                };
                self.symbols.push(newSymbol);
            }
        }
    }
    
    self.recalcValues = function() {
        self.symbSize = {};
        self.symbSize.x = CONF.symbol_size.x * self.scope.gui_size;
        self.symbSize.y = CONF.symbol_size.y * self.scope.gui_size;
    }
    
    
    self.setSpinButton = function(btn) { self.button = btn; }
    self.setResultArea = function(area) {
        self.result_area = area;
    }
    self.setRenderer = function(rnd) {
        self.renderer = rnd;
        self.renderer.ondraw.push(self.placeSymbols);
    }
    
    self.setTargetSymbol = function(symb) { self.targetSymbol = symb; }
    
    self.checkWin = function() {
        self.result_state = true;
        self.result_area.data.disabled = false;
        self.currentSymbol = self.currentSymbol % CONF.symbols_total;
        if ( self.currentSymbol == self.targetSymbol.index ) {
            self.result_area.setTextStyle([CONF.font.size,'px ',CONF.font.family].join(''),CONF.font["color-win"]);
            self.result_area.setText(LOC.result_win, CONF.font.size);
        } else {
            self.result_area.setTextStyle([CONF.font.size,'px ',CONF.font.family].join(''),CONF.font["color-lost"]);
            self.result_area.setText(LOC.result_lost, CONF.font.size);
        }
    }
    
    self.spin = function() {
        if ( self.is_spinning ) { return 0; }
        self.is_spinning = true;
        self.button.setBackground('disabled');
        animate(0, CONF.spin_step, CONF.timeframe.in, function(val) {
            self.spinStep = val;
        }, function(val) {
            self.spinStep = val;
            
            setTimeout(function() {
                
                animate(CONF.spin_step, CONF.spin_fix_step, CONF.timeframe.out, function(val) {
                    self.spinStep = val;
                }, function(val) {
                    self.spinStep = 0;
                    var pos = Math.ceil(self.currentSymbol);
                    
                    var from = self.currentSymbol;
                    animate(from, pos, CONF.timeframe.fix, function(val) {
                        self.currentSymbol = val;
                    }, function(val) {
                        if ( pos == self.symbols.length ) { pos = 0; }
                        self.currentSymbol = pos;
                        self.checkWin();
                    });
                });
                
            }, CONF.timeframe.cycle+Math.random()*CONF.timeframe.cycle_rnd);
        });
    }
    
    self.run = function() {
        self.is_spinning = false;
        self.recalcValues();
        self.deploySymbols();
        self.placeSymbols();
        
        self.coverage = self.coverage || self.renderer.createArea({
            position: {x:1,y:1},
            size: {x:-1,y:-1}
        });
        self.coverage.onClick = function() {
            if ( self.result_state ) {
                self.onGameFinished();
                self.result_state = false;
                self.result_area.data.disabled = true;
            }
        }
    }
    
    self.deploySymbols = function() {
        map(self.symbols, function(symb) {
            symb.area = symb.area || self.renderer.createArea({
                position: {x:'center',y:'center'},
                size: self.symbSize,
                basic_size: self.symbSize,
                media: {
                    ico: symb.src_raw
                }
            });
            symb.area.setBackground('ico');
        });
    }
    
    self.placeSymbols = function() {
        var mult = CONF.symbol_position_map.length / self.symbols.length;
        
        self.currentSymbol = Math.round((self.currentSymbol + self.spinStep) * 1000)/1000;
        if ( self.currentSymbol >= self.symbols.length ) { self.currentSymbol -= self.symbols.length; }
        
        map(self.symbols, function(symbol, i) {
            if ( symbol.area ) {
                var pos = i - self.currentSymbol; if ( pos < 0 ) { pos += self.symbols.length}
                var schemePos = pos * mult + self.currentOffset;
                var schemeBase = parseInt(schemePos);
                var schemeBaseNext = schemeBase+1; if ( schemeBaseNext ==  CONF.symbol_position_map.length ) { schemeBaseNext = 0; }
                
                var sizeMult = CONF.symbol_size_map[schemeBase] + (CONF.symbol_size_map[schemeBaseNext]-CONF.symbol_size_map[schemeBase])*(schemePos-schemeBase);
                
                symbol.area.data.priority = sizeMult;
                symbol.area.data.size.x = symbol.area.data.basic_size.x * sizeMult;
                symbol.area.data.size.y = symbol.area.data.basic_size.y * sizeMult;
                
                symbol.area.data.position.y = self.getPosBetween(
                    CONF.symbol_position_map[schemeBase],
                    CONF.symbol_position_map[schemeBaseNext],
                    symbol.area.data.size.y,
                    self.renderer.height,
                    schemePos-schemeBase
                );
                
                
            }
        });
        
    }
    
    self.onGameFinished = function() {}
    
    self.init();
}
















