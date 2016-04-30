
function ResourceManager() {
    var self = getSelf(this);
    self.inherit(BaseModel);
    self.inherit(AjaxModule);
    
    self.init = function() {
        self._awaiting = 0;
        $P(self, 'awaiting', function() {
            return self._awaiting;
        }, function(data) {
            self._awaiting = data;
            self._fetchLoaders();
            return self._awaiting;
        });
        
        self._toload = 0;
        
        $P(self, 'toload', function() {
            return self._toload;
        }, function(data) {
            self._toload = data;
            self._fetchLoaders();
            return self._toload;
        });
        
        self._module = {};
        self.loaders = [];
        self.queue_on_done = [];
    }
    
    self._fetchLoaders = function() {
        map(self.loaders, function(loader) {
            loader.mult = (self._toload - self._awaiting) / self._toload;
        });
    }
    
    self._loadJson = function(path, moduleName, todoOnEach) {
        self._toload += 1;
        self.awaiting += 1;
        self.loadJson(path, function() {
            self._module[moduleName] = window['c_'+moduleName];
            
            if ( todoOnEach ) {
                iterRec(self._module[moduleName], todoOnEach);
            }
            
            self.awaiting -= 1;
            self._sourcesLoadedMaybe();
        });
    }
    
    self._loadImage = function(path) {
        self._toload += 1;
        self.awaiting += 1;
        var img = document.body.cr('img', 'hidden');
        img.src = path;
        img.onload = function() {
            setTimeout(function() {
                self.awaiting -= 1;
                self._sourcesLoadedMaybe();
            }, Math.random()*300); //- Timeout to see some progress - remove for production
            
        }
    }
    
    self.addMediaSource = function(path, moduleName) {
        self._loadJson(path, moduleName, function(path) {
            self._loadImage(CONF.path.assets+path);
        });
    }
    
    self.addConfigSource = function(path, moduleName) { self._loadJson(path, moduleName); }
    
    self.getModule = function(name) { return self._module[name]; }
    self.getLoader = function() {
        var newEl = new ProgressBar();
        self.joinScope(newEl);
        self.loaders.push(newEl)
        return newEl;
    }
    self._sourcesLoadedMaybe = function() {
        if ( self.awaiting == 0 ) {
            var todo = self.queue_on_done.splice(0,1)[0];
            if ( todo ) {
                todo();
                self._sourcesLoadedMaybe();
            }
        }
    }
    
    self.onSourcesLoaded = function(todo) {
        self.queue_on_done.push(todo);
        self._sourcesLoadedMaybe();
    }
    
    self.init()
}


function ProgressBar() {
    var self = getSelf(this);
    self.inherit(BaseModel);
    self.inherit(BaseDomModel);
    
    self.init = function() {
        self.dom.block.addCls('progress-bar');
        self.dom.label         = self.dom.block.cr('div','label');
        self.dom.bar_container = self.dom.block.cr('div','bar_container');
        self.dom.bar_carret    = self.dom.bar_container.cr('div');
        
        self._percent = 0;
        $P(self, 'percent', function() {
            return self._percent;
        }, function(data) {
            data = Math.min(Math.max(data, 0), 100);
            self.dom.bar_carret.style.width = data+'%';
            return self._percent = data;
        });
        
        $P(self, 'mult', function() {
            return self._percent / 100;
        }, function(data) {
            return self.percent = data * 100;
        });
    }
    
    
    self.init();
}










