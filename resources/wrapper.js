
function def(val) { return typeof(val) != 'undefined' && val !== null; }
function contains(arr, val) { return arr.indexOf(val) != -1; }
Array.prototype.contains = 
String.prototype.contains = function(val) { return contains(this, val); }


function getSelf(self) {
    self.__inheritance_insts = self.__inheritance_insts || [];
    self.inherit = function(model, attrs) {
        if ( !self.__inheritance_insts.contains(model) ) {
            model.apply(self, attrs);
            self.__inheritance_insts.push(model);
        }
    }
    return self;
}

function map(list, todo) {
    if ( list && todo && typeof(list) == 'object' ) {
        if ( list.constructor == Array ) {
            for ( var i = 0; i < list.length; i++ ) {
                var resp = todo(list[i],i);
                if ( resp === false ) {
                    return false;
                }
            }
            return true;
        }
        
        for ( var i in list ) {
            var resp = todo(list[i],i);
            if ( resp === false ) {
                return false;
            }
        }
        return true
    }
    return null;
}


function mergeObjects() {
    var into = arguments[0];
    if ( !def(into) ) { return {}; }
    
    for ( var i = 1; i < arguments.length; i++ ) {
        var dict = arguments[i];
        map(dict, function(v,k) { into[k] = v; });
    }
    
    
    return into;
}


function iterRec(obj, todo) {
    if ( !def(obj) ) { return null; }
    var tp = typeof(obj);
    
    if ( tp == 'string' || tp == 'number' ) {
        todo(obj);
    } else if ( tp == 'object' ) {
        map(obj, function(v) { iterRec(v, todo); });
    }
}

function $P(target, key, getter, setter) {
    if ( target && key ) {
        if ( getter ) {
            target.__defineGetter__(key, getter);
        }
        if ( setter ) {
            target.__defineSetter__(key, setter);
        }
    }
    return target;
}


function cr(tag, cls, parent) {
    if ( !tag ) { return null; }
    var newNode = document.createElement(tag);
    
    if ( def(cls) ) { newNode.className = cls; }
    if ( def(parent) ) { parent.attach(newNode); }
    
    return newNode;
}
Node.prototype.cr = function(tag, cls) { return cr(tag, cls, this); }


function attach(target, node) {
    if ( target ) { node.appendChild(target); }
    return node;
}
Node.prototype.attach = function(target) { return attach(target, this); }

function detach(node) {
    var parent = node.parentNode;
    if ( parent ) {
        parent.removeChild(node);
    }
    return node;
}
Node.prototype.detach = function() { return detach(this); }


function addCls(node, cls) {
    if (node && def(cls) ) { node.classList.add(cls); }
    return node;
}
Node.prototype.addCls = function(cls) { return addCls(this, cls); }

function remCls(node, cls) {
    if ( node && def(cls) ) {
        var classes = node.className.split(/\s+/g);
        var ind = classes.indexOf(cls);
        if ( ind >= 0 ) {
            node.classList.remove(cls);
            return true;
        }
        return false;
    }
    return null;
}
Node.prototype.remCls = function(cls) { remCls(this, cls); return this; }

function swCls(node, cls) {
    if ( !remCls(node, cls) ) { addCls(node, cls); }
    return node;
}
Node.prototype.swCls = function(cls) { return swCls(this, cls); }


function VAL(node, val) {
    if ( node.value ) { node.value = val; } else { node.textContent = val; }
    return node;
}
Node.prototype.VAL = function(val) {
    return VAL(this, val);
}



CanvasRenderingContext2D.prototype.clear = CanvasRenderingContext2D.prototype.clear || function() {
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

function animate(valFrom, valTo, interval, progress, finish) {
    finish = finish || progress;
    progress(valFrom);
    if ( !CONF ) { finish(valTo) }
    var steps = Math.round(interval / CONF.timeframe.animation);
    var step = (valTo-valFrom) / steps;
    var cur = valFrom;
    
    for ( var i = 1; i < steps; i++ ) {
        setTimeout(function() {
            progress(cur);
            cur += step;
            
        }, CONF.timeframe.animation*i);
    }
    setTimeout(function() {
        finish(valTo);
    }, interval);
}


function getWindowSize() {
    return {
        width:  window.innerWidth  || document.documentElement.clientWidth  || document.body.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    };
}





