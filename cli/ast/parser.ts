import { Project, MethodDeclaration, Type, EnumDeclaration } from 'ts-simple-ast';
import { HTTP_MESSAGE_TYPE_ENDING } from './constraints';

let project: Project;

export const getProgram = () => {
    if(!project)
        project = new Project();

    return project;
};

function getChecker() {
    return getProgram().getTypeChecker();
}

function extractType(type: Type | undefined, level: number = 0) {
    const nextLevel = level+ 1;
    if(!type || nextLevel > 4)
        return;
    
    let descriptor = {};
    if(type.isArray()) {
        const items = type.getTypeArguments();

        descriptor = {
            type: 'array',
            items: items.length === 1 ? extractType(items[0], nextLevel) : items.map(extractType)
        };
    } else if(type.getText().startsWith("Promise") || type.getText() === 'void') {
        // 1. Nested promises wouldn't resolved during send.
        // 2. Void type shouldn't be documented.
        return;
    
    } else if(type.isEnumLiteral()) {
        const enumDeclaration = type.getSymbol()!.getValueDeclaration();
        
        if(!enumDeclaration) 
            return;

        const members = (enumDeclaration as EnumDeclaration).getMembers();
        descriptor = {
            type: "string",
            enum: members.map(m => m.getValue())
        };

    } else if(type.getText() === 'Date') {
        descriptor = { 
            type: 'string',
            format: "date"
        };

    } else if(type.getText() === 'JSX.Element') {
        descriptor = { 
            type: 'string',
            format: "html"
        };

    } else if(type.isClassOrInterface() || type.isObject()) {
        descriptor = {
            type: 'object',
            properties: extractProperties(type, nextLevel)
        };
    } else {
        descriptor = { type: getChecker().compilerObject.typeToString(type.compilerType) };
    }

    return descriptor;
}

function unwrapReservedTypes(type: Type, reservedCodes: (string | undefined)[]) {
    if(type.getText().includes(HTTP_MESSAGE_TYPE_ENDING)) {
        const [ unwrapped, code ] = type.getTypeArguments();

        reservedCodes.push(code.getText());
        return unwrapped;
    }

    reservedCodes.push(undefined);
    return type;
}

function extractProperties(type: Type, level: number = 0): any {
    return type.getProperties().reduce((prev, symbol) => {
        const type = getChecker().getTypeOfSymbolAtLocation(symbol, symbol.getValueDeclaration()!);
        
        return {
            ...prev,
            [symbol.getName()]: extractType(type, level)
        };
    }, {});
}

export function extractReturnType(method: MethodDeclaration, reservedCodes: (string | undefined)[]) {
    const baseType = method.getReturnType();
    const isPromised = baseType.getText().startsWith('Promise');

    const targetType = isPromised ? baseType.getTypeArguments()![0] :  baseType;
    const returnTypes = targetType.isUnion() ? targetType.getUnionTypes() : [targetType];
  
    return returnTypes.map(type => unwrapReservedTypes(type,reservedCodes)).map(extractType);
}