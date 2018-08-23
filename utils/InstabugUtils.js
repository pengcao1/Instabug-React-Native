'use strict';
import {NativeModules, Platform} from 'react-native';
let {Instabug} = NativeModules;
import parseErrorStackLib from '../../react-native/Libraries/Core/Devtools/parseErrorStack.js';

let parseErrorStack = (error) => {
    return parseErrorStackLib(error);
};

const originalHandler = global.ErrorUtils.getGlobalHandler();

let init = () => {
    if (__DEV__) {
        return;
    }

    function errorHandler(e, isFatal) {
      let jsStackTrace = parseErrorStackLib(e);

      //JSON object to be sent to the native SDK
      var jsonObject = {
        message: e.name + " - " + e.message,
        os: Platform.OS,
        platform: 'react_native',
        exception: jsStackTrace
      }
      console.log('IBGCrashLog ', `Exception ${e.name} - ${e.message} caught by global handler`);
      if(Platform.OS === 'android') {
        console.log('IBGCrashLog ', 'Sending crash to native android');
        Instabug.sendJSCrash(JSON.stringify(jsonObject));
      } else {
        console.log('IBGCrashLog ', 'Sending crash to native ios');
        Instabug.sendJSCrash(jsonObject);
      }
      if (originalHandler) {
        if (Platform.OS === 'ios') {
          originalHandler(e, isFatal);
        } else {
          setTimeout(() => {
            originalHandler(e, isFatal);
          }, 500);
        }
      }
    }
    global.ErrorUtils.setGlobalHandler(errorHandler);
};

module.exports = {
    parseErrorStack: parseErrorStack,
    captureJsErrors: init
};
