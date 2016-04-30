
window.view_types = {
    'mode_selector': {
        extend: {},
        process: function(self) {
            self.dom.block.addCls('fullscreen');
            
            self.dom.wrapper = self.dom.block.cr('div','mode_selector');
            self.dom.title = self.dom.wrapper.cr('h2').VAL(LOC.select_mode);
            self.dom.container = self.dom.wrapper.cr('div');
            
            self.onModeSelected = function(val){}//- rewritable
            
            self.addOption = function(symb) {
                var newNode = self.dom.container.cr('img');
                newNode.src = symb.src;
                
                newNode.onclick =  function(ev) {
                    console.log(symb);
                    self.onModeSelected(symb);
                };
            }
        }
    }
}


function View(type) {
    var self = getSelf(this);
    self.inherit(BaseModel);
    self.inherit(BaseDomModel);
    
    self.init = function() {
        self.db = {};
        if ( view_types[type] ) {
            mergeObjects(self, view_types[type].db);
            view_types[type].process(self);
        }
    }
    
    
    
    self.init();
}











