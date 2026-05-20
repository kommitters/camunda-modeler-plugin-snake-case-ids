'use strict';

module.exports = function(electronApp, menuState) {
  return [{
    label: 'Generate snake_case IDs',
    accelerator: 'CommandOrControl+Shift+G',
    enabled: function() {
      return true;
    },
    action: function() {
      electronApp.emit('menu:action', 'generateSnakeCaseIDs');
    }
  }];
};
