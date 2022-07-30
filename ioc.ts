class CreateIoc{
    public container:Map<Symbol,{callback:Function}>
    constructor(){
        this.container = new Map()
    }

    get(namespace:Symbol){
        let item = this.container.get(namespace)
        if(item){
            return item.callback
        }else{
            throw new Error('找不到实例')
        }
    }

    bind(key:Symbol,callback:Function){
        this.container.set(key,{callback})
    }
}

export default CreateIoc