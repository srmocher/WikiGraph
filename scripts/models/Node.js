define("Node",function(){

    return function Node(id,title,color,position){
        this.id = id;
        this.title = title;
        this.color = color;
        this.position = position;
        this.parent = [];
        this.children = [];
    }
})