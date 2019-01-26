
export const generateStarter = () => `
import { Core } from 'odi';
 
new Core({
    sources: __dirname,
    server: {
        port: 8080
    }
}).listen(() => console.log("Server successfully started!"));
`;

export const generateView = () => `
import React from 'react';

export const HomeView = () => <div> Hello, world! </div>;
`;