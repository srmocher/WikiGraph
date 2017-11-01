define("Node",function(){

    return function Node(id,title,color,position){
        this.data = {}
        this._private= {}
        this.data['id'] = id;
        this.data['title'] = title
        this._private.data = this.data;
        this.color = color;
        this.position = position;
        this._private.position = position;
        this.parent = [];
        this.children = [];
    }
})
