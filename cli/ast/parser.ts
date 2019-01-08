import { Project, MethodDeclaration, Type, EnumDeclaration } from 'ts-simple-ast';
import { HTTP_MESSAGE_TYPE_ENDING } from './constraints';

export const program = new Project();
const checker = program.getTypeChecker();


function extractType(type: Type, level: number = 0) {
    let descriptor = {};
    
    const nextLevel = level+ 1;
    if(nextLevel > 4)
        return;
    
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

    } else if(type.isClassOrInterface() || type.isObject()) {
        descriptor = {
            type: 'object',
            properties: extractProperties(type, nextLevel)
        };
    } else {
        descriptor = { type: checker.compilerObject.typeToString(type.compilerType) };
    }

    return descriptor;
}

function extractProperties(type: Type, level: number = 0): any {
    return type.getProperties().reduce((prev, symbol) => {
        const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.getValueDeclaration()!);
        return {
            ...prev,
            [symbol.getName()]: extractType(type, level)
        };
    }, {});
}

export function extractReturnType(method: MethodDeclaration) {
    const baseType = method.getReturnType();
    const isPromised = baseType.getText().startsWith('Promise');

    const targetType = isPromised ? baseType.getTypeArguments()![0] :  baseType;
    const returnTypes = targetType.isUnion() ? targetType.getUnionTypes() : [targetType];
  
    return returnTypes.filter(type => !type.getText().endsWith(HTTP_MESSAGE_TYPE_ENDING)).map(extractType);
}