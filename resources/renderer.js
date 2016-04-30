
function DrawModule() {
    var self = getSelf(this);
    self.inherit(BaseModel);
    
    self.init = function() {
        self.width = 0;
        self.height = 0;
    }
    
    self._normPos = function(val, lim) {
        if ( val < 0 ) { return val + lim; }
        return val;
    }
    
    self._parseCoord = function(val, width, gWidth) {
        if ( typeof(val) == 'string' ) {
            var offset = parseInt(val.split('center')[1]||0);
            return (gWidth-width) / 2 + offset;
        }
        if ( val < 0 ) { val -= width; }
        return self._normPos(val, gWidth);
    }
    
    self._getPos = function(area, offsetPos) {
        var pos = {
            x     : area.position.x,
            y     : area.position.y,
        }
        pos.width  = self._normPos(area.size.x, self.width);
        pos.height = self._normPos(area.size.y, self.height);
        
        pos.x = self._parseCoord(pos.x, pos.width, self.width);
        pos.y = self._parseCoord(pos.y, pos.height, self.height);
        
        if ( offsetPos ) {
            pos.x      += offsetPos.x;
            pos.y      += offsetPos.y;
            pos.width  += offsetPos.width;
            pos.height += offsetPos.height;
        }
        
        return pos;
    }
    
    self.getPosBetween = function(val1, val2, offset, limit, mult) {
        if( val1 == 'center' ) { val1 = (limit-offset)/2; } else
        if( val1 < 0 ) { val1 += limit - offset; }
        if( val2 == 'center' ) { val2 = (limit-offset)/2; } else
        if( val2 < 0 ) { val2 += limit - offset; }
        return val1 + ((val2-val1)*mult);
    }
    
    self.init();
}



function Renderer() {
    var self = getSelf(this);
    self.inherit(BaseModel);
    self.inherit(BaseDomModel);
    self.inherit(DrawModule);
    
    self.init = function() {
        self.dom.canvas = cr('canvas', null, self.dom.block);
        self.ctx = self.scope.ctx = window.ctx = self.dom.canvas.getContext('2d', { alpha: true });
        
        
        self.dom.block.addCls('renderer');
        
        self.areas = [];
        
        self.timescale = 1000 / CONF.framerate;
        self.ondraw = [];
        
        self.redraw();
        
        
        self.dom.canvas.onclick = function(ev) {
            self.rect = self.dom.canvas.getBoundingClientRect();
            
            var clickPos = {
                x: ev.pageX-self.rect.left,
                y: ev.pageY-self.rect.top
            }
            
            map(self.areas, function(area) {
                var diffX = clickPos.x - area.pos.x;
                var diffY = clickPos.y - area.pos.y;
                if( area.pos &&
                    diffX >= 0 && diffX < area.pos.width &&
                    diffY >= 0 && diffY < area.pos.height
                ) {
                    area.onClick();
                }
            });
        }
    }
    
    self.onplace = function() {
        self.width  = self.dom.canvas.width = self.dom.canvas.clientWidth;
        self.height = self.dom.canvas.height = self.dom.canvas.clientHeight;
        
        self.rect = self.dom.canvas.getBoundingClientRect();
    }
    
    
    
    
    //- Public
    
    self.createArea = function(data) {
        var area = new Area(data);
        self.joinScope(area);
        self.areas.push(area);
        self.redraw();
        return area;
    }
    
    
    
    //- Drawing
    
    self.redraw = self.scope.redraw = function() {
        self._clear();
        self.areas.sort(function(a,b) { return a.data.priority - b.data.priority; });
        map(self.areas, self._drawArea);
        map(self.ondraw, function(func) {
            func();
        });
        setTimeout(self.redraw, self.timescale);
    }
    
    
    self._clear = function() {
        self.ctx.clear();
    }
    
    
    self._drawArea = function(area) {
        var pos = area.pos = self._getPos(area.data);
        area.redraw();
    }
    
    
    self.init();
}




function Area(data) {
    var self = getSelf(this);
    self.inherit(BaseModel);
    self.inherit(DrawModule);
    
    self.init = function() {
        self.data = self.normalizeData(data);
    }
    
    self.normalizeData = function(data) {
        data = data || {};
        var params = mergeObjects({
            priority: 1,
            disabled: false
        }, data);
        params.position = mergeObjects({x: 0,y: 0}, data.position);
        params.size     = mergeObjects({x: 0,y: 0}, data.size);
        params.media     = mergeObjects({}, data.media);
        return params;
    }
    
    self.setBackground = function(key) {
        if ( self.data.media[key] ) {
            self.background = self.data.media[key];
        } else {
            self.background = null;
        }
    }
    
    self.setTextStyle = function(font, color) { self.textStyle = [font, color]; }
    self.setText = function(str, textH) { self.text = str; self.textHeight = textH; }
    
    self.clear = function(func) {
        if ( self.pos && self.scope.ctx ) {
            //- self.scope.ctx.clearRect(self.pos.x,self.pos.y,self.pos.width,self.pos.height);
            //- clears from renderer
            if ( !self.data.disabled ) {
                func();
            }
        }
    }
    
    self.redraw = function(key) {
        self.clear(function() {
            if ( self.background ) {
                var img = cr('img');
                img.src = CONF.path.assets+self.background;
                self.scope.ctx.drawImage(img, self.pos.x, self.pos.y, self.pos.width, self.pos.height);
            }
            if ( self.text ) {
                if ( self.textStyle ) {
                    self.scope.ctx.font = self.textStyle[0];
                    self.scope.ctx.fillStyle = self.textStyle[1];
                }
                self.scope.ctx.fillText(self.text, self.pos.x, self.pos.y+(self.textHeight||0)/2, self.pos.width);
            }
        });
    }
    
    
    self.onClick = function() {}//- rewritable
    
    self.init();
}









