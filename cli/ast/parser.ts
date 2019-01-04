import { Project, ClassDeclaration, MethodDeclaration } from 'ts-simple-ast';
import { IControllerPath } from './type.pathes';

const fileNames = ['C:/Projects/VSCode/Addax/DMT/front-service/src/contollers/auth.controller.ts'];

let program = new Project();
program.addExistingSourceFiles(fileNames);


function extractType(cls: ClassDeclaration) {
    return cls.getType().getTargetType()!.getText();
}

function checkController(cls: ClassDeclaration) {
    const extClass = cls.getExtends();

    if(!extClass)
        return false;

    return extClass
        .getType()
        .getTargetType()!
        .getText()
        .includes(IControllerPath);
}

function checkRouteHandler(method: MethodDeclaration) {

    const [ fs ] = method.getReturnType().getTypeArguments();

    if(fs) {
        console.log(fs.getUnionTypes());
    }
}



for(const sr of program.getSourceFiles()) {
    const [ cls ] = sr.getClasses();

    if(checkController(cls)) {
        const typeAlias = extractType(cls);
        const methods = cls.getMethods();

        methods.filter(method => checkRouteHandler(method));
    }
    
}