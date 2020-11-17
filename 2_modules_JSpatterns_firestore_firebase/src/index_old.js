// Intro to Modules

// import './script_name'

// to import a particular function, variable, etc. from another file put export keyword in front of it in that file and then in index.js
// import { function_name, another_function } from './script'

// you can export things in the same file
// export const contact = 'sdsd';
// or
// export { function, function, variable }

// export default
// export default function
// and import in index.js
// import test from './script'
// import default_export, { regular_function } from './script'
// export { regular_function, default_export as default }



const test = (name) => {
    console.log(`llalalalal ${name}`);
}

test('Tomoko');

console.log('test');