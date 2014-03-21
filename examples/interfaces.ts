// Type definitions for mocha 1.17.1
// Project: http://visionmedia.github.io/mocha/
// Definitions by: Kazi Manzur Rashid <https://github.com/kazimanzurrashid/>
// DefinitelyTyped: https://github.com/borisyankov/DefinitelyTyped

interface Mocha {
    // Setup mocha with the given setting options.
    setup(options: MochaSetupOptions): Mocha;

    //Run tests and invoke `fn()` when complete.
    run(callback?: () => void): void;

    // Set reporter as function
    reporter(reporter: () => void): Mocha;

    // Set reporter, defaults to "dot"
    reporter(reporter: string): Mocha;

    // Enable growl support.
    growl(): Mocha;
}

interface MochaSetupOptions {
    //milliseconds to wait before considering a test slow
    slow?: number;

    // timeout in milliseconds
    timeout?: number;

    // ui name "bdd", "tdd", "exports" etc
    ui?: string;

    //array of accepted globals
    globals?: any;

    // reporter instance (function or string), defaults to `mocha.reporters.Dot`
    reporter?: any;

    // bail on the first test failure
    bail?: Boolean;

    // ignore global leaks
    ignoreLeaks?: Boolean;

    // grep string or regexp to filter tests with
    grep?: any;
}

/*
interface MochaDone {
    (error?: Error): void;
}*/
