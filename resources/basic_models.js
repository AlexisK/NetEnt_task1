
function BaseModel() {
    var self = getSelf(this);
    
    self.init = function() {
        self.conf = null;
        self.scope = {};
    }
    
    self.setConfig = function(conf) {
        self.conf = conf;
    }
    
    self.joinScope = function() {
        map(arguments, function(obj) {
            if ( obj.scope ) {
                mergeObjects(self.scope, obj.scope);
                obj.scope.prototype = self.scope; //- Case someone saved ref to scope
                obj.scope = self.scope;
            }
        });
        
    }
    
    self.init();
}



function BaseDomModel() {
    var self = getSelf(this);
    self.inherit(BaseModel);
    
    self.init = function() {
        self.dom = {
            block: cr('div')
        }
    }
    
    self.getDom = function() { return self.dom.block; }
    self.showDom = function() { self.dom.block.remCls('hidden'); }
    self.hideDom = function() { self.dom.block.addCls('hidden'); }
    
    self.placeInto = function(target) {
        if ( target ) {
            target.attach(self.getDom());
            self.onplace();
        }
    }
    
    self.onplace = function(){}//- rewritable
    
    
    self.init();
}



function AjaxModule() {
    var self = getSelf(this);
    
    self.ajaxRequest = function(path, todo) {
        var req = new XMLHttpRequest();
        req.overrideMimeType("application/json");
        
        req.onreadystatechange = function() {
            if ( req.readyState == 4 && req.status == 200 ) {
                todo(req.responseText);
            }
        }
        req.open('GET', path, true);
        
        req.send();
        
        return req;
    }
    
    self.loadJson = function(path, todo) {
        var newNode = cr('script');
        newNode.onload = todo;
        newNode.src = path;
        document.body.attach(newNode);
    }
    
}













