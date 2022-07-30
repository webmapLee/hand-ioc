import {parseScript} from 'esprima'
import type {Pattern} from 'estree'
import CreateIoc from './ioc'
import 'reflect-metadata'

const container = new CreateIoc()

interface ITypes{
    [key:string]:Symbol
}

const TYPES:ITypes = {
    indexService:Symbol.for('indexService')
}

interface IIndexService{
    setName(name:string):void
}

class IndexService implements IIndexService{
    public setName(name: string): void {
        console.log(name)
    }
}

container.bind(TYPES.indexService,()=>new IndexService())

//获取函数参数
function getParams(fn:Function):string[]{
    //获取ast
    let ast = parseScript(fn.toString())
    let node = ast.body[0]
    let fnParams:Pattern[] = []

    //如果式函数，则获取函数参数，同时也是类中constructor的参数
    if(node.type === 'FunctionDeclaration'){
        fnParams = node.params
    }
    let validParams:string[] = []
    //这里循环记录参数的名称
    fnParams.forEach((obj)=>{
        if(obj.type === 'Identifier'){
            validParams.push(obj.name)
        }
    })
    return validParams
}

//判断有没有key
function hasKey<O extends Object>(obj:O,key:keyof any):key is keyof O{
    return obj.hasOwnProperty(key)
}

//这里
function inject(serviceIdentifier:Symbol):Function{
    return (target:Function,targetKey:string,index:number)=>{
        if(!targetKey){
            Reflect.defineMetadata(
                serviceIdentifier,
                container.get(serviceIdentifier)(),
                target
            )
        }
    }
}

function controller<T extends {new (...args:any[]):{}}>(constructor:T){
    class Controller extends constructor{
        constructor(...args:any[]){
            super(args)
            const _params = getParams(constructor)
            let identifier:string
            for(identifier of _params){
                if(hasKey(this,identifier)){
                    // 这里不用直接注入了，constructor 中inject的时候再注入
                    // const instance = container.get(TYPES[identifier])()
                    // this[identifier] = instance
                    this[identifier] = Reflect.getMetadata(TYPES[identifier],constructor)
                }
            }
        }
    }
    return Controller
}

@controller
class IndexController{
    public indexService:IIndexService
    constructor(@inject(TYPES.indexService) indexService?:IIndexService){
        console.log('indexService',indexService)
        this.indexService = indexService!
        
    }
    public setName(name:string){
        this.indexService.setName(name)
    }
}

const index = new IndexController()
index.setName('asdfasdfsadf')
// index.setName('asdfsdfsad')

